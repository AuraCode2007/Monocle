"""
Business logic / DB access layer for RailSync-AI maintenance requests.

Read path: every "view" function JOINs a department table to
control_room_master on job_id, because reported_by (and only reported_by)
is NOT mirrored into control_room_master.department_specific_details by the
existing sync triggers - every other department-specific field is. The join
gives back the complete, authoritative row instead of trusting the JSONB
mirror for fields it wasn't built to carry.

Write path for CREATE: insert into the department table only. The existing
AFTER INSERT trigger on that table creates the matching control_room_master
row automatically (with priority=0, status='PENDING'). We then call
Shayaan's priority checker and UPDATE control_room_master.priority directly -
department tables have no priority column at all, by design, so the frontend
literally cannot receive it back through them.

Write path for UPDATE: update the department table row. The existing
AFTER UPDATE trigger re-syncs work_category / required_duration_mins /
department_specific_details / blockchain_tx_hash into control_room_master.
It does NOT touch priority or status (its SET clause never mentions them),
so editing a request never resets its priority or its place in the workflow.

Soft delete: there is no FK between the department tables and
control_room_master (the trigger keeps them in sync one-way, it does not
enforce referential integrity), and no ON DELETE trigger exists. Hard-deleting
either row would leave the other one orphaned with no automatic cleanup, so
"delete" is implemented as a status transition to CANCELLED on
control_room_master instead. See the chat response for the fuller
explanation of this choice.
"""

from typing import Any, Dict, List, Optional, Tuple

from fastapi import HTTPException
from sqlalchemy import func, or_
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from models import ControlRoomMaster, SmmsSignalAsset, TdmsPowerAsset, TmsTrackAsset
from priority_service import (PRIORITY_HIGH,PRIORITY_LABELS, calculate_priority,)
from schemas import (
    SmmsRequestCreate,
    SmmsRequestUpdate,
    TdmsRequestCreate,
    TdmsRequestUpdate,
    TmsRequestCreate,
    TmsRequestUpdate,
)

STATUS_VALUES = ["PENDING", "APPROVED", "REJECTED", "SCHEDULED", "IN_PROGRESS", "COMPLETED", "CANCELLED"]
TERMINAL_STATUSES = {"COMPLETED", "CANCELLED", "REJECTED"}

# Which status a request may move to next. Anything not listed as a key
# (or an empty set) is a terminal state.
VALID_TRANSITIONS: Dict[str, set] = {
    "PENDING": {"APPROVED", "REJECTED", "CANCELLED"},
    "APPROVED": {"SCHEDULED", "CANCELLED"},
    "REJECTED": set(),
    "SCHEDULED": {"IN_PROGRESS", "CANCELLED"},
    "IN_PROGRESS": {"COMPLETED", "CANCELLED"},
    "COMPLETED": set(),
    "CANCELLED": set(),
}

_SEQUENCE_BY_DEPT = {"TMS": "tms_job_seq", "TDMS": "tdms_job_seq", "SMMS": "smms_job_seq"}
_PREFIX_BY_DEPT = {"TMS": "JOB-TMS-", "TDMS": "JOB-OHE-", "SMMS": "JOB-SIG-"}


def generate_job_id(db: Session, department: str) -> str:
    """
    Atomically reserves the next job id for `department` using the Postgres
    sequences created by migrations/0001_add_lifecycle_status.sql (seeded
    past the 25 pre-existing mock rows per department, so there's no
    collision with rail_maintenance_data.sql's sample data). Sequence names
    are fixed, internal, and never derived from request input.
    """
    seq_name = _SEQUENCE_BY_DEPT[department]
    next_val = db.execute(func.nextval(seq_name)).scalar()
    return f"{_PREFIX_BY_DEPT[department]}{next_val:03d}"


def _get_control_room_row(db: Session, job_id: str) -> Optional[ControlRoomMaster]:
    return db.query(ControlRoomMaster).filter(ControlRoomMaster.job_id == job_id).first()


# ---------------------------------------------------------------------------
# TMS
# ---------------------------------------------------------------------------


def _tms_details(payload) -> Dict[str, Any]:
    """Same shape as tms_sync_trigger's jsonb_build_object - see priority_client.py."""
    return {
        "line_section": payload.line_section,
        "line_direction": payload.line_direction,
        "start_km": float(payload.start_km),
        "end_km": float(payload.end_km),
        "structure_type": payload.structure_type,
        "tdms_collab_req": bool(payload.tdms_collab_req),
        "smms_collab_req": bool(payload.smms_collab_req),
    }


def _tms_to_dict(asset: TmsTrackAsset, crm: ControlRoomMaster) -> Dict[str, Any]:
    return {
        "job_id": asset.track_job_id,
        "line_section": asset.line_section,
        "line_direction": asset.line_direction,
        "start_km": float(asset.start_km),
        "end_km": float(asset.end_km),
        "structure_type": asset.structure_type,
        "work_category": asset.work_category,
        "tdms_collab_req": bool(asset.tdms_collab_req),
        "smms_collab_req": bool(asset.smms_collab_req),
        "required_duration_mins": asset.required_duration_mins,
        "reported_by": asset.reported_by,
        "blockchain_tx_hash": asset.blockchain_tx_hash,
        "status": crm.status,
        "created_at": crm.created_at,
        "updated_at": crm.updated_at,
    }


def create_tms_request(db: Session, payload: TmsRequestCreate) -> Dict[str, Any]:
    job_id = generate_job_id(db, "TMS")

    asset = TmsTrackAsset(
        track_job_id=job_id,
        line_section=payload.line_section,
        line_direction=payload.line_direction,
        start_km=payload.start_km,
        end_km=payload.end_km,
        structure_type=payload.structure_type,
        work_category=payload.work_category,
        tdms_collab_req=payload.tdms_collab_req,
        smms_collab_req=payload.smms_collab_req,
        required_duration_mins=payload.required_duration_mins,
        reported_by=payload.reported_by,
    )
    db.add(asset)
    try:
        db.flush()  # fires tms_sync_trigger -> creates the control_room_master row
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail=f"Job ID {job_id} already exists - please retry")

    priority = calculate_priority(
    department="TMS",
    job_data={
        "work_category": payload.work_category,
        "required_duration_mins": payload.required_duration_mins,
        **_tms_details(payload),
    },
    )

    crm = _get_control_room_row(db, job_id)
    if crm is None:
        db.commit()
        raise HTTPException(
            status_code=500,
            detail="Request was created but its control-room sync record was not found. "
            "Check that tms_sync_trigger exists on tms_track_assets.",
        )
    crm.priority = priority
    db.commit()
    db.refresh(asset)
    db.refresh(crm)
    return _tms_to_dict(asset, crm)


def get_tms_request(db: Session, job_id: str) -> Optional[Dict[str, Any]]:
    row = (
        db.query(TmsTrackAsset, ControlRoomMaster)
        .join(ControlRoomMaster, ControlRoomMaster.job_id == TmsTrackAsset.track_job_id)
        .filter(TmsTrackAsset.track_job_id == job_id)
        .first()
    )
    if row is None:
        return None
    asset, crm = row
    return _tms_to_dict(asset, crm)


def list_tms_requests(
    db: Session,
    status: Optional[str] = None,
    line_section: Optional[str] = None,
    search: Optional[str] = None,
    skip: int = 0,
    limit: int = 50,
) -> Tuple[List[Dict[str, Any]], int]:
    query = db.query(TmsTrackAsset, ControlRoomMaster).join(
        ControlRoomMaster, ControlRoomMaster.job_id == TmsTrackAsset.track_job_id
    )
    if status:
        query = query.filter(ControlRoomMaster.status == status)
    if line_section:
        query = query.filter(TmsTrackAsset.line_section == line_section)
    if search:
        like = f"%{search}%"
        query = query.filter(or_(TmsTrackAsset.track_job_id.ilike(like), TmsTrackAsset.work_category.ilike(like)))

    total = query.count()
    rows = query.order_by(ControlRoomMaster.created_at.desc()).offset(skip).limit(limit).all()
    return [_tms_to_dict(asset, crm) for asset, crm in rows], total


def update_tms_request(db: Session, job_id: str, payload: TmsRequestUpdate) -> Optional[Dict[str, Any]]:
    asset = db.query(TmsTrackAsset).filter(TmsTrackAsset.track_job_id == job_id).first()
    if asset is None:
        return None

    data = payload.model_dump(exclude_unset=True)
    for field, value in data.items():
        setattr(asset, field, value)

    new_start = float(asset.start_km)
    new_end = float(asset.end_km)
    if new_end <= new_start:
        db.rollback()
        raise HTTPException(status_code=422, detail="end_km must be greater than start_km")

    db.flush()  # fires tms_sync_trigger -> re-syncs control_room_master (not priority/status)
    crm = _get_control_room_row(db, job_id)
    db.commit()
    db.refresh(asset)
    db.refresh(crm)
    return _tms_to_dict(asset, crm)


# ---------------------------------------------------------------------------
# TDMS
# ---------------------------------------------------------------------------


def _tdms_details(payload) -> Dict[str, Any]:
    return {
        "line_section": payload.line_section,
        "line_direction": payload.line_direction,
        "source_mast_no": payload.source_mast_no,
        "target_mast_no": payload.target_mast_no,
        "power_isolation_needed": bool(payload.power_isolation_needed),
        "tms_collab_req": bool(payload.tms_collab_req),
        "smms_collab_req": bool(payload.smms_collab_req),
    }


def _tdms_to_dict(asset: TdmsPowerAsset, crm: ControlRoomMaster) -> Dict[str, Any]:
    return {
        "job_id": asset.power_job_id,
        "line_section": asset.line_section,
        "line_direction": asset.line_direction,
        "source_mast_no": asset.source_mast_no,
        "target_mast_no": asset.target_mast_no,
        "power_isolation_needed": bool(asset.power_isolation_needed),
        "work_category": asset.work_category,
        "tms_collab_req": bool(asset.tms_collab_req),
        "smms_collab_req": bool(asset.smms_collab_req),
        "required_duration_mins": asset.required_duration_mins,
        "reported_by": asset.reported_by,
        "blockchain_tx_hash": asset.blockchain_tx_hash,
        "status": crm.status,
        "created_at": crm.created_at,
        "updated_at": crm.updated_at,
    }


def create_tdms_request(db: Session, payload: TdmsRequestCreate) -> Dict[str, Any]:
    job_id = generate_job_id(db, "TDMS")

    asset = TdmsPowerAsset(
        power_job_id=job_id,
        line_section=payload.line_section,
        line_direction=payload.line_direction,
        source_mast_no=payload.source_mast_no,
        target_mast_no=payload.target_mast_no,
        power_isolation_needed=payload.power_isolation_needed,
        work_category=payload.work_category,
        tms_collab_req=payload.tms_collab_req,
        smms_collab_req=payload.smms_collab_req,
        required_duration_mins=payload.required_duration_mins,
        reported_by=payload.reported_by,
    )
    db.add(asset)
    try:
        db.flush()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail=f"Job ID {job_id} already exists - please retry")

    priority = calculate_priority(
    department="TDMS",
    job_data={
        "work_category": payload.work_category,
        "required_duration_mins": payload.required_duration_mins,
        **_tdms_details(payload),
    },
    )

    crm = _get_control_room_row(db, job_id)
    if crm is None:
        db.commit()
        raise HTTPException(
            status_code=500,
            detail="Request was created but its control-room sync record was not found. "
            "Check that tdms_sync_trigger exists on tdms_power_assets.",
        )
    crm.priority = priority
    db.commit()
    db.refresh(asset)
    db.refresh(crm)
    return _tdms_to_dict(asset, crm)


def get_tdms_request(db: Session, job_id: str) -> Optional[Dict[str, Any]]:
    row = (
        db.query(TdmsPowerAsset, ControlRoomMaster)
        .join(ControlRoomMaster, ControlRoomMaster.job_id == TdmsPowerAsset.power_job_id)
        .filter(TdmsPowerAsset.power_job_id == job_id)
        .first()
    )
    if row is None:
        return None
    asset, crm = row
    return _tdms_to_dict(asset, crm)


def list_tdms_requests(
    db: Session,
    status: Optional[str] = None,
    line_section: Optional[str] = None,
    search: Optional[str] = None,
    skip: int = 0,
    limit: int = 50,
) -> Tuple[List[Dict[str, Any]], int]:
    query = db.query(TdmsPowerAsset, ControlRoomMaster).join(
        ControlRoomMaster, ControlRoomMaster.job_id == TdmsPowerAsset.power_job_id
    )
    if status:
        query = query.filter(ControlRoomMaster.status == status)
    if line_section:
        query = query.filter(TdmsPowerAsset.line_section == line_section)
    if search:
        like = f"%{search}%"
        query = query.filter(
            or_(TdmsPowerAsset.power_job_id.ilike(like), TdmsPowerAsset.work_category.ilike(like))
        )

    total = query.count()
    rows = query.order_by(ControlRoomMaster.created_at.desc()).offset(skip).limit(limit).all()
    return [_tdms_to_dict(asset, crm) for asset, crm in rows], total


def update_tdms_request(db: Session, job_id: str, payload: TdmsRequestUpdate) -> Optional[Dict[str, Any]]:
    asset = db.query(TdmsPowerAsset).filter(TdmsPowerAsset.power_job_id == job_id).first()
    if asset is None:
        return None

    data = payload.model_dump(exclude_unset=True)
    for field, value in data.items():
        setattr(asset, field, value)

    db.flush()
    crm = _get_control_room_row(db, job_id)
    db.commit()
    db.refresh(asset)
    db.refresh(crm)
    return _tdms_to_dict(asset, crm)


# ---------------------------------------------------------------------------
# SMMS
# ---------------------------------------------------------------------------


def _smms_details(payload) -> Dict[str, Any]:
    return {
        "station_code": payload.station_code,
        "point_machine_no": payload.point_machine_no,
        "interlocking_panel": payload.interlocking_panel,
        "tdms_collab_req": bool(payload.tdms_collab_req),
        "tms_collab_req": bool(payload.tms_collab_req),
    }


def _smms_to_dict(asset: SmmsSignalAsset, crm: ControlRoomMaster) -> Dict[str, Any]:
    return {
        "job_id": asset.signal_job_id,
        "station_code": asset.station_code,
        "point_machine_no": asset.point_machine_no,
        "interlocking_panel": asset.interlocking_panel,
        "work_category": asset.work_category,
        "tdms_collab_req": bool(asset.tdms_collab_req),
        "tms_collab_req": bool(asset.tms_collab_req),
        "required_duration_mins": asset.required_duration_mins,
        "reported_by": asset.reported_by,
        "blockchain_tx_hash": asset.blockchain_tx_hash,
        "status": crm.status,
        "created_at": crm.created_at,
        "updated_at": crm.updated_at,
    }


def create_smms_request(db: Session, payload: SmmsRequestCreate) -> Dict[str, Any]:
    job_id = generate_job_id(db, "SMMS")

    asset = SmmsSignalAsset(
        signal_job_id=job_id,
        station_code=payload.station_code,
        point_machine_no=payload.point_machine_no,
        interlocking_panel=payload.interlocking_panel,
        work_category=payload.work_category,
        tdms_collab_req=payload.tdms_collab_req,
        tms_collab_req=payload.tms_collab_req,
        required_duration_mins=payload.required_duration_mins,
        reported_by=payload.reported_by,
    )
    db.add(asset)
    try:
        db.flush()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail=f"Job ID {job_id} already exists - please retry")

    priority = calculate_priority(
    department="SMMS",
    job_data={
        "work_category": payload.work_category,
        "required_duration_mins": payload.required_duration_mins,
        **_smms_details(payload),
    },
    )

    crm = _get_control_room_row(db, job_id)
    if crm is None:
        db.commit()
        raise HTTPException(
            status_code=500,
            detail="Request was created but its control-room sync record was not found. "
            "Check that smms_sync_trigger exists on smms_signal_assets.",
        )
    crm.priority = priority
    db.commit()
    db.refresh(asset)
    db.refresh(crm)
    return _smms_to_dict(asset, crm)


def get_smms_request(db: Session, job_id: str) -> Optional[Dict[str, Any]]:
    row = (
        db.query(SmmsSignalAsset, ControlRoomMaster)
        .join(ControlRoomMaster, ControlRoomMaster.job_id == SmmsSignalAsset.signal_job_id)
        .filter(SmmsSignalAsset.signal_job_id == job_id)
        .first()
    )
    if row is None:
        return None
    asset, crm = row
    return _smms_to_dict(asset, crm)


def list_smms_requests(
    db: Session,
    status: Optional[str] = None,
    station_code: Optional[str] = None,
    search: Optional[str] = None,
    skip: int = 0,
    limit: int = 50,
) -> Tuple[List[Dict[str, Any]], int]:
    query = db.query(SmmsSignalAsset, ControlRoomMaster).join(
        ControlRoomMaster, ControlRoomMaster.job_id == SmmsSignalAsset.signal_job_id
    )
    if status:
        query = query.filter(ControlRoomMaster.status == status)
    if station_code:
        query = query.filter(SmmsSignalAsset.station_code == station_code)
    if search:
        like = f"%{search}%"
        query = query.filter(
            or_(SmmsSignalAsset.signal_job_id.ilike(like), SmmsSignalAsset.work_category.ilike(like))
        )

    total = query.count()
    rows = query.order_by(ControlRoomMaster.created_at.desc()).offset(skip).limit(limit).all()
    return [_smms_to_dict(asset, crm) for asset, crm in rows], total


def update_smms_request(db: Session, job_id: str, payload: SmmsRequestUpdate) -> Optional[Dict[str, Any]]:
    asset = db.query(SmmsSignalAsset).filter(SmmsSignalAsset.signal_job_id == job_id).first()
    if asset is None:
        return None

    data = payload.model_dump(exclude_unset=True)
    for field, value in data.items():
        setattr(asset, field, value)

    db.flush()
    crm = _get_control_room_row(db, job_id)
    db.commit()
    db.refresh(asset)
    db.refresh(crm)
    return _smms_to_dict(asset, crm)


# ---------------------------------------------------------------------------
# Shared: status transitions & cancel (soft delete) - operate on
# control_room_master directly, then re-read the full per-department view.
# ---------------------------------------------------------------------------

_GETTERS = {"TMS": get_tms_request, "TDMS": get_tdms_request, "SMMS": get_smms_request}


def update_request_status(db: Session, department: str, job_id: str, new_status: str) -> Optional[Dict[str, Any]]:
    crm = _get_control_room_row(db, job_id)
    if crm is None or crm.department != department:
        return None

    current = crm.status
    if new_status == current:
        raise HTTPException(status_code=409, detail=f"Request {job_id} is already {current}")
    if new_status not in VALID_TRANSITIONS.get(current, set()):
        raise HTTPException(
            status_code=409,
            detail=f"Cannot transition {job_id} from {current} to {new_status}",
        )

    crm.status = new_status
    db.commit()
    return _GETTERS[department](db, job_id)


def cancel_request(db: Session, department: str, job_id: str) -> Optional[Dict[str, Any]]:
    crm = _get_control_room_row(db, job_id)
    if crm is None or crm.department != department:
        return None

    if crm.status in TERMINAL_STATUSES:
        raise HTTPException(status_code=409, detail=f"Request {job_id} is already {crm.status} and cannot be cancelled")

    crm.status = "CANCELLED"
    db.commit()
    return _GETTERS[department](db, job_id)


# ---------------------------------------------------------------------------
# Dashboards
# ---------------------------------------------------------------------------


def get_dashboard_summary(db: Session, department: Optional[str] = None) -> Dict[str, Any]:
    base_filter = [ControlRoomMaster.department == department] if department else []

    total_requests = db.query(ControlRoomMaster).filter(*base_filter).count()

    status_rows = (
        db.query(ControlRoomMaster.status, func.count(ControlRoomMaster.sl_no))
        .filter(*base_filter)
        .group_by(ControlRoomMaster.status)
        .all()
    )
    status_counts = dict(status_rows)
    by_status = {s: status_counts.get(s, 0) for s in STATUS_VALUES}

    high_priority_count = (
        db.query(ControlRoomMaster)
        .filter(*base_filter, ControlRoomMaster.priority == PRIORITY_HIGH)
        .count()
    )

    result: Dict[str, Any] = {
        "department": department,
        "total_requests": total_requests,
        "by_status": by_status,
        "high_priority_count": high_priority_count,
    }

    if department is None:
        dept_rows = (
            db.query(ControlRoomMaster.department, func.count(ControlRoomMaster.sl_no))
            .group_by(ControlRoomMaster.department)
            .all()
        )
        result["by_department"] = dict(dept_rows)

    return result


def get_recent_requests(db: Session, department: Optional[str] = None, limit: int = 10) -> List[Dict[str, Any]]:
    query = db.query(ControlRoomMaster)
    if department:
        query = query.filter(ControlRoomMaster.department == department)
    rows = query.order_by(ControlRoomMaster.created_at.desc()).limit(limit).all()
    return [
        {
            "job_id": r.job_id,
            "department": r.department,
            "work_category": r.work_category,
            "status": r.status,
            "required_duration_mins": r.required_duration_mins,
            "created_at": r.created_at,
        }
        for r in rows
    ]


# ---------------------------------------------------------------------------
# Control room (administrative view - includes priority)
# ---------------------------------------------------------------------------


def _crm_to_admin_dict(crm: ControlRoomMaster) -> Dict[str, Any]:
    return {
        "job_id": crm.job_id,
        "department": crm.department,
        "work_category": crm.work_category,
        "required_duration_mins": crm.required_duration_mins,
        "department_specific_details": crm.department_specific_details,
        "priority": crm.priority,
        "priority_label": PRIORITY_LABELS.get(crm.priority, "UNKNOWN"),
        "status": crm.status,
        "blockchain_tx_hash": crm.blockchain_tx_hash,
        "created_at": crm.created_at,
        "updated_at": crm.updated_at,
    }


def get_control_room_request(db: Session, job_id: str) -> Optional[Dict[str, Any]]:
    crm = _get_control_room_row(db, job_id)
    if crm is None:
        return None
    return _crm_to_admin_dict(crm)


def list_control_room_requests(
    db: Session,
    department: Optional[str] = None,
    status: Optional[str] = None,
    search: Optional[str] = None,
    skip: int = 0,
    limit: int = 50,
) -> Tuple[List[Dict[str, Any]], int]:
    query = db.query(ControlRoomMaster)
    if department:
        query = query.filter(ControlRoomMaster.department == department)
    if status:
        query = query.filter(ControlRoomMaster.status == status)
    if search:
        like = f"%{search}%"
        query = query.filter(or_(ControlRoomMaster.job_id.ilike(like), ControlRoomMaster.work_category.ilike(like)))

    total = query.count()
    rows = query.order_by(ControlRoomMaster.created_at.desc()).offset(skip).limit(limit).all()
    return [_crm_to_admin_dict(r) for r in rows], total