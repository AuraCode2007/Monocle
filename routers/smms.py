from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import text
from sqlalchemy.orm import Session

from database import get_db
from schemas import SMMSCreate, SMMSUpdate
from priority_service import calculate_priority

router = APIRouter(
    prefix="/api/smms",
    tags=["SMMS"]
)


@router.post("/jobs")
def create_smms_job(job: SMMSCreate, db: Session = Depends(get_db)):

    try:
        result = db.execute(
            text("""
                INSERT INTO smms_signal_assets (
                    signal_job_id,
                    station_code,
                    point_machine_no,
                    interlocking_panel,
                    work_category,
                    tdms_collab_req,
                    tms_collab_req,
                    required_duration_mins,
                    reported_by
                )
                VALUES (
                    :signal_job_id,
                    :station_code,
                    :point_machine_no,
                    :interlocking_panel,
                    :work_category,
                    :tdms_collab_req,
                    :tms_collab_req,
                    :required_duration_mins,
                    :reported_by
                )
                RETURNING *
            """),
            job.model_dump()
        )

        created_job = result.mappings().first()

        priority = calculate_priority(job.model_dump())

        db.execute(
            text("""
                UPDATE control_room_master
                SET priority = :priority
                WHERE job_id = :job_id
            """),
            {
                "priority": priority,
                "job_id": job.signal_job_id
            }
        )

        db.commit()

        return {
            "message": "SMMS maintenance request created successfully",
            "job": dict(created_job)
        }

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/jobs")
def get_smms_jobs(db: Session = Depends(get_db)):

    result = db.execute(
        text("""
            SELECT *
            FROM smms_signal_assets
            ORDER BY sl_no DESC
        """)
    )

    return [dict(row) for row in result.mappings().all()]


@router.get("/jobs/{job_id}")
def get_smms_job(
    job_id: str,
    db: Session = Depends(get_db)
):

    result = db.execute(
        text("""
            SELECT *
            FROM smms_signal_assets
            WHERE signal_job_id = :job_id
        """),
        {"job_id": job_id}
    )

    job = result.mappings().first()

    if not job:
        raise HTTPException(status_code=404, detail="SMMS job not found")

    return dict(job)


@router.put("/jobs/{job_id}")
def update_smms_job(
    job_id: str,
    job: SMMSUpdate,
    db: Session = Depends(get_db)
):

    updates = {
        key: value
        for key, value in job.model_dump().items()
        if value is not None
    }

    if not updates:
        raise HTTPException(
            status_code=400,
            detail="No fields provided for update"
        )

    set_clause = ", ".join(
        f"{key} = :{key}"
        for key in updates
    )

    updates["job_id"] = job_id

    try:
        result = db.execute(
            text(f"""
                UPDATE smms_signal_assets
                SET {set_clause}
                WHERE signal_job_id = :job_id
                RETURNING *
            """),
            updates
        )

        updated_job = result.mappings().first()

        if not updated_job:
            raise HTTPException(
                status_code=404,
                detail="SMMS job not found"
            )

        db.commit()

        return {
            "message": "SMMS job updated successfully",
            "job": dict(updated_job)
        }

    except HTTPException:
        db.rollback()
        raise

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/jobs/{job_id}")
def delete_smms_job(
    job_id: str,
    db: Session = Depends(get_db)
):

    try:
        db.execute(
            text("""
                DELETE FROM control_room_master
                WHERE job_id = :job_id
            """),
            {"job_id": job_id}
        )

        result = db.execute(
            text("""
                DELETE FROM smms_signal_assets
                WHERE signal_job_id = :job_id
            """),
            {"job_id": job_id}
        )

        if result.rowcount == 0:
            db.rollback()
            raise HTTPException(
                status_code=404,
                detail="SMMS job not found"
            )

        db.commit()

        return {
            "message": "SMMS job deleted successfully"
        }

    except HTTPException:
        raise

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))