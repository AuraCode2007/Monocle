from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import text
from sqlalchemy.orm import Session

from database import get_db

router = APIRouter(
    prefix="/api/control-room",
    tags=["Control Room"]
)


@router.get("/jobs")
def get_control_room_jobs(db: Session = Depends(get_db)):

    result = db.execute(
        text("""
            SELECT *
            FROM control_room_master
            ORDER BY priority DESC, created_at DESC
        """)
    )

    return [dict(row) for row in result.mappings().all()]


@router.get("/jobs/{job_id}")
def get_control_room_job(
    job_id: str,
    db: Session = Depends(get_db)
):

    result = db.execute(
        text("""
            SELECT *
            FROM control_room_master
            WHERE job_id = :job_id
        """),
        {"job_id": job_id}
    )

    job = result.mappings().first()

    if not job:
        raise HTTPException(
            status_code=404,
            detail="Job not found"
        )

    return dict(job)


@router.get("/dashboard")
def get_control_room_dashboard(db: Session = Depends(get_db)):

    total = db.execute(
        text("""
            SELECT COUNT(*) AS count
            FROM control_room_master
        """)
    ).scalar()

    high = db.execute(
        text("""
            SELECT COUNT(*)
            FROM control_room_master
            WHERE priority = 3
        """)
    ).scalar()

    medium = db.execute(
        text("""
            SELECT COUNT(*)
            FROM control_room_master
            WHERE priority = 2
        """)
    ).scalar()

    low = db.execute(
        text("""
            SELECT COUNT(*)
            FROM control_room_master
            WHERE priority = 1
        """)
    ).scalar()

    return {
        "total_jobs": total,
        "high_priority": high,
        "medium_priority": medium,
        "low_priority": low
    }