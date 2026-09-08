from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import text
from sqlalchemy.orm import Session

from database import get_db
from schemas import TDMSCreate, TDMSUpdate
from priority_service import calculate_priority

router = APIRouter(
    prefix="/api/tdms",
    tags=["TDMS"]
)


@router.post("/jobs")
def create_tdms_job(job: TDMSCreate, db: Session = Depends(get_db)):

    try:
        result = db.execute(
            text("""
                INSERT INTO tdms_power_assets (
                    power_job_id,
                    line_section,
                    line_direction,
                    source_mast_no,
                    target_mast_no,
                    power_isolation_needed,
                    work_category,
                    tms_collab_req,
                    smms_collab_req,
                    required_duration_mins,
                    reported_by
                )
                VALUES (
                    :power_job_id,
                    :line_section,
                    :line_direction,
                    :source_mast_no,
                    :target_mast_no,
                    :power_isolation_needed,
                    :work_category,
                    :tms_collab_req,
                    :smms_collab_req,
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
                "job_id": job.power_job_id
            }
        )

        db.commit()

        return {
            "message": "TDMS maintenance request created successfully",
            "job": dict(created_job)
        }

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/jobs")
def get_tdms_jobs(db: Session = Depends(get_db)):

    result = db.execute(
        text("""
            SELECT *
            FROM tdms_power_assets
            ORDER BY sl_no DESC
        """)
    )

    return [dict(row) for row in result.mappings().all()]


@router.get("/jobs/{job_id}")
def get_tdms_job(
    job_id: str,
    db: Session = Depends(get_db)
):

    result = db.execute(
        text("""
            SELECT *
            FROM tdms_power_assets
            WHERE power_job_id = :job_id
        """),
        {"job_id": job_id}
    )

    job = result.mappings().first()

    if not job:
        raise HTTPException(status_code=404, detail="TDMS job not found")

    return dict(job)


@router.put("/jobs/{job_id}")
def update_tdms_job(
    job_id: str,
    job: TDMSUpdate,
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
                UPDATE tdms_power_assets
                SET {set_clause}
                WHERE power_job_id = :job_id
                RETURNING *
            """),
            updates
        )

        updated_job = result.mappings().first()

        if not updated_job:
            raise HTTPException(
                status_code=404,
                detail="TDMS job not found"
            )

        db.commit()

        return {
            "message": "TDMS job updated successfully",
            "job": dict(updated_job)
        }

    except HTTPException:
        db.rollback()
        raise

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/jobs/{job_id}")
def delete_tdms_job(
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
                DELETE FROM tdms_power_assets
                WHERE power_job_id = :job_id
            """),
            {"job_id": job_id}
        )

        if result.rowcount == 0:
            db.rollback()
            raise HTTPException(
                status_code=404,
                detail="TDMS job not found"
            )

        db.commit()

        return {
            "message": "TDMS job deleted successfully"
        }

    except HTTPException:
        raise

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))