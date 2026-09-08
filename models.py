"""
SQLAlchemy ORM models for RailSync-AI.

These map to tables that already exist in the database, created by:
  1. rail_maintenance_data.sql (tms_track_assets, tdms_power_assets,
     smms_signal_assets, control_room_master, dept_enum, the sync triggers,
     users, role_enum)
  2. migrations/0001_add_lifecycle_status.sql (adds control_room_master.status,
     control_room_master.updated_at, request_status_enum, and the job-id
     sequences used by crud.generate_job_id)

Nothing here calls Base.metadata.create_all() - table/enum creation is owned
entirely by the two SQL scripts above, not by SQLAlchemy, so we never risk
clobbering or duplicating what's already in the repo/DB.

Column definitions intentionally mirror the CREATE TABLE statements exactly
(types, lengths, nullability, defaults) so the ORM never silently disagrees
with the real schema.
"""

from sqlalchemy import BigInteger, Boolean, Column, Integer, Numeric, String, TIMESTAMP, text
from sqlalchemy.dialects.postgresql import ENUM as PGEnum
from sqlalchemy.dialects.postgresql import JSONB

from database import Base

# These enum types already exist in Postgres (dept_enum from
# rail_maintenance_data.sql, request_status_enum from the migration).
# create_type=False tells SQLAlchemy "map to it, don't try to CREATE TYPE".
dept_enum = PGEnum("TMS", "TDMS", "SMMS", name="dept_enum", create_type=False)

request_status_enum = PGEnum(
    "PENDING",
    "APPROVED",
    "REJECTED",
    "SCHEDULED",
    "IN_PROGRESS",
    "COMPLETED",
    "CANCELLED",
    name="request_status_enum",
    create_type=False,
)


class TmsTrackAsset(Base):
    """Maps to tms_track_assets (Engineering / Track maintenance requests)."""

    __tablename__ = "tms_track_assets"

    sl_no = Column(BigInteger, primary_key=True)
    track_job_id = Column(String(20), unique=True, nullable=False)
    line_section = Column(String(20), nullable=False)
    line_direction = Column(String(10), nullable=False)
    start_km = Column(Numeric(7, 3), nullable=False)
    end_km = Column(Numeric(7, 3), nullable=False)
    structure_type = Column(String(30), nullable=False)
    work_category = Column(String(50), nullable=False)
    tdms_collab_req = Column(Boolean, server_default=text("false"))
    smms_collab_req = Column(Boolean, server_default=text("false"))
    required_duration_mins = Column(Integer, nullable=False)
    reported_by = Column(String(100), nullable=False)
    blockchain_tx_hash = Column(String(66), nullable=True)


class TdmsPowerAsset(Base):
    """Maps to tdms_power_assets (TRD / Traction & OHE maintenance requests)."""

    __tablename__ = "tdms_power_assets"

    sl_no = Column(BigInteger, primary_key=True)
    power_job_id = Column(String(20), unique=True, nullable=False)
    line_section = Column(String(20), nullable=False)
    line_direction = Column(String(10), nullable=False)
    source_mast_no = Column(String(15), nullable=False)
    target_mast_no = Column(String(15), nullable=False)
    power_isolation_needed = Column(Boolean, server_default=text("false"))
    work_category = Column(String(50), nullable=False)
    tms_collab_req = Column(Boolean, server_default=text("false"))
    smms_collab_req = Column(Boolean, server_default=text("false"))
    required_duration_mins = Column(Integer, nullable=False)
    reported_by = Column(String(100), nullable=False)
    blockchain_tx_hash = Column(String(66), nullable=True)


class SmmsSignalAsset(Base):
    """Maps to smms_signal_assets (S&T / Signalling maintenance requests)."""

    __tablename__ = "smms_signal_assets"

    sl_no = Column(BigInteger, primary_key=True)
    signal_job_id = Column(String(20), unique=True, nullable=False)
    station_code = Column(String(10), nullable=False)
    point_machine_no = Column(String(15), nullable=False)
    interlocking_panel = Column(String(20), nullable=False)
    work_category = Column(String(50), nullable=False)
    tdms_collab_req = Column(Boolean, server_default=text("false"))
    tms_collab_req = Column(Boolean, server_default=text("false"))
    required_duration_mins = Column(Integer, nullable=False)
    reported_by = Column(String(100), nullable=False)
    blockchain_tx_hash = Column(String(66), nullable=True)


class ControlRoomMaster(Base):
    """
    Maps to control_room_master - the merged, cross-department table that
    tms_sync_trigger / tdms_sync_trigger / smms_sync_trigger keep populated
    whenever a department table row is inserted or updated.

    `priority` is Shayaan's AI-assigned priority (see priority_client.py) and
    is intentionally never exposed by the per-department request schemas -
    only by the /api/v1/control-room/* endpoints. `status` and `updated_at`
    are added by migrations/0001_add_lifecycle_status.sql.
    """

    __tablename__ = "control_room_master"

    sl_no = Column(BigInteger, primary_key=True)
    job_id = Column(String(20), unique=True, nullable=False)
    department = Column(dept_enum, nullable=False)
    work_category = Column(String(50), nullable=False)
    required_duration_mins = Column(Integer, nullable=False)
    department_specific_details = Column(JSONB, nullable=False)
    priority = Column(Integer, server_default=text("0"))
    blockchain_tx_hash = Column(String(66), nullable=True)
    status = Column(request_status_enum, nullable=False, server_default=text("'PENDING'"))
    created_at = Column(TIMESTAMP, server_default=text("CURRENT_TIMESTAMP"))
    updated_at = Column(TIMESTAMP, server_default=text("CURRENT_TIMESTAMP"))