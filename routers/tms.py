from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import text
from sqlalchemy.orm import Session

from database import get_db
from schemas import TMSCreate, TMSUpdate
from priority_service import calculate_priority

router = APIRouter(
    prefix="/api/tms",
    tags=["TMS"]
)


@router.post("/jobs")
def create_tms_job(job: TMSCreate, db: Session = Depends(get_db)):

    query = text("""
        INSERT INTO tms_track_assets (
            track_job_id,
            line_section,
            line_direction,
            start_km,
            end_km,
            structure_type,
            work_category,
            tdms_collab_req,
            smms_collab_req,
            required_duration_mins,
            reported_by
        )
        VALUES (
            :track_job_id,
            :line_section,
            :line_direction,
            :start_km,
            :end_km,
            :structure_type,
            :work_category,
            :tdms_collab_req,
            :smms_collab_req,
            :required_duration_mins,
            :reported_by
        )
        RETURNING *
    """)

    try:
        result = db.execute(
            query,
            job.model_dump()
        )

        created_job = result.mappings().first()

        # DB trigger creates the control room entry.
        priority = calculate_priority(job.model_dump())

        db.execute(
            text("""
                UPDATE control_room_master
                SET priority = :priority
                WHERE job_id = :job_id
            """),
            {
                "priority": priority,
                "job_id": job.track_job_id
            }
        )

        db.commit()

        return {
            "message": "TMS maintenance request created successfully",
            "job": dict(created_job)
        }

    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


@router.get("/jobs")
def get_tms_jobs(db: Session = Depends(get_db)):

    result = db.execute(
        text("""
            SELECT *
            FROM tms_track_assets
            ORDER BY sl_no DESC
        """)
    )

    return [dict(row) for row in result.mappings().all()]


@router.get("/jobs/{job_id}")
def get_tms_job(
    job_id: str,
    db: Session = Depends(get_db)
):

    result = db.execute(
        text("""
            SELECT *
            FROM tms_track_assets
            WHERE track_job_id = :job_id
        """),
        {"job_id": job_id}
    )

    job = result.mappings().first()

    if not job:
        raise HTTPException(
            status_code=404,
            detail="TMS job not found"
        )

    return dict(job)


@router.put("/jobs/{job_id}")
def update_tms_job(
    job_id: str,
    job: TMSUpdate,
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
                UPDATE tms_track_assets
                SET {set_clause}
                WHERE track_job_id = :job_id
                RETURNING *
            """),
            updates
        )

        updated_job = result.mappings().first()

        if not updated_job:
            raise HTTPException(
                status_code=404,
                detail="TMS job not found"
            )

        db.commit()

        return {
            "message": "TMS job updated successfully",
            "job": dict(updated_job)
        }

    except HTTPException:
        db.rollback()
        raise

    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


@router.delete("/jobs/{job_id}")
def delete_tms_job(
    job_id: str,
    db: Session = Depends(get_db)
):

    try:
        # The DB trigger does not handle DELETE,
        # so remove the control-room entry manually.

        master_result = db.execute(
            text("""
                DELETE FROM control_room_master
                WHERE job_id = :job_id
            """),
            {"job_id": job_id}
        )

        result = db.execute(
            text("""
                DELETE FROM tms_track_assets
                WHERE track_job_id = :job_id
            """),
            {"job_id": job_id}
        )

        if result.rowcount == 0:
            db.rollback()

            raise HTTPException(
                status_code=404,
                detail="TMS job not found"
            )

        db.commit()

        return {
            "message": "TMS job deleted successfully"
        }

    except HTTPException:
        raise

    except Exception as e:
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )