from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from schemas import TmsRequestCreate, TmsRequestUpdate
import crud

router = APIRouter(
    prefix="/api/tms",
    tags=["TMS"]
)


@router.post("/jobs")
def create_tms_job(job: TmsRequestCreate, db: Session = Depends(get_db)):
    created = crud.create_tms_request(db, job)
    return {
        "success": True,
        "message": "TMS maintenance request created successfully",
        "job": created
    }


@router.get("/jobs")
def get_tms_jobs(db: Session = Depends(get_db)):
    items, total = crud.list_tms_requests(db, limit=200)
    return items


@router.get("/jobs/{job_id}")
def get_tms_job(job_id: str, db: Session = Depends(get_db)):
    item = crud.get_tms_request(db, job_id)
    if not item:
        raise HTTPException(status_code=404, detail="TMS job not found")
    return item


@router.put("/jobs/{job_id}")
def update_tms_job(job_id: str, job: TmsRequestUpdate, db: Session = Depends(get_db)):
    updated = crud.update_tms_request(db, job_id, job)
    if not updated:
        raise HTTPException(status_code=404, detail="TMS job not found")
    return {
        "success": True,
        "message": "TMS job updated successfully",
        "job": updated
    }