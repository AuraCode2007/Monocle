from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from schemas import TdmsRequestCreate, TdmsRequestUpdate
import crud

router = APIRouter(
    prefix="/api/tdms",
    tags=["TDMS"]
)


@router.post("/jobs")
def create_tdms_job(job: TdmsRequestCreate, db: Session = Depends(get_db)):
    created = crud.create_tdms_request(db, job)
    return {
        "success": True,
        "message": "TDMS maintenance request created successfully",
        "job": created
    }


@router.get("/jobs")
def get_tdms_jobs(db: Session = Depends(get_db)):
    items, total = crud.list_tdms_requests(db, limit=200)
    return items


@router.get("/jobs/{job_id}")
def get_tdms_job(job_id: str, db: Session = Depends(get_db)):
    item = crud.get_tdms_request(db, job_id)
    if not item:
        raise HTTPException(status_code=404, detail="TDMS job not found")
    return item


@router.put("/jobs/{job_id}")
def update_tdms_job(job_id: str, job: TdmsRequestUpdate, db: Session = Depends(get_db)):
    updated = crud.update_tdms_request(db, job_id, job)
    if not updated:
        raise HTTPException(status_code=404, detail="TDMS job not found")
    return {
        "success": True,
        "message": "TDMS job updated successfully",
        "job": updated
    }