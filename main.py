
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from routers import tms, tdms, smms, control_room

from database import get_db
from db_adapter import (
    load_maintenance_jobs,
    load_train_windows,
)
from scheduler import optimize_jobs

import uvicorn


app = FastAPI(
    title="Monocle - Intelligent Block Planning Engine",
    description="Backend API for Automatic Railway Maintenance Block Scheduling",
    version="1.0.0"
)


# ==========================================
# CORS
# ==========================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==========================================
# DEPARTMENT CRUD APIs
# ==========================================

app.include_router(tms.router)
app.include_router(tdms.router)
app.include_router(smms.router)
app.include_router(control_room.router)


# ==========================================
# BASIC API
# ==========================================

@app.get("/")
def root():
    return {
        "system": "Monocle",
        "ministry": "Ministry of Railways (Government of India)",
        "status": "ONLINE",
        "engine": "Google OR-Tools CP-SAT"
    }


# ==========================================
# SCHEDULER API
# ==========================================

@app.post("/api/scheduler/run")
def run_scheduler(
    db: Session = Depends(get_db)
):
    """
    Run the Monocle maintenance scheduler.

    Data flow:
        PostgreSQL
            ↓
        db_adapter.py
            ↓
        MaintenanceJob + TrainSectionWindow
            ↓
        scheduler.py
            ↓
        Optimized schedule
    """

    jobs = load_maintenance_jobs(db)

    train_windows = load_train_windows(db)

    result = optimize_jobs(
        jobs=jobs,
        train_windows=train_windows,
        time_limit_sec=15
    )

    return result


# ==========================================
# START SERVER
# ==========================================

if __name__ == "__main__":

    print(
        "Starting Monocle API Server "
        "at http://127.0.0.1:8000 ..."
    )

    uvicorn.run(
        "main:app",
        host="127.0.0.1",
        port=8000,
        reload=False
    )
