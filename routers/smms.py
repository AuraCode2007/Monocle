from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from schemas import SmmsRequestCreate, SmmsRequestUpdate
import crud

router = APIRouter(
    prefix="/api/smms",
    tags=["SMMS"]
)


@router.post("/jobs")
def create_smms_job(job: SmmsRequestCreate, db: Session = Depends(get_db)):
    created = crud.create_smms_request(db, job)
    return {
        "success": True,
        "message": "SMMS maintenance request created successfully",
        "job": created
    }


@router.get("/jobs")
def get_smms_jobs(db: Session = Depends(get_db)):
    items, total = crud.list_smms_requests(db, limit=200)
    return items


@router.get("/jobs/{job_id}")
def get_smms_job(job_id: str, db: Session = Depends(get_db)):
    item = crud.get_smms_request(db, job_id)
    if not item:
        raise HTTPException(status_code=404, detail="SMMS job not found")
    return item


@router.put("/jobs/{job_id}")
def update_smms_job(job_id: str, job: SmmsRequestUpdate, db: Session = Depends(get_db)):
    updated = crud.update_smms_request(db, job_id, job)
    if not updated:
        raise HTTPException(status_code=404, detail="SMMS job not found")
    return {
        "success": True,
        "message": "SMMS job updated successfully",
        "job": updated
    }