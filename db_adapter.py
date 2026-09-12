#note : this file essentially pulls the data from 3 diff schemas
# and converts/adapts them into common data to feed into
# scheduler file.


from typing import List

from sqlalchemy import text
from sqlalchemy.orm import Session

from scheduler_models import MaintenanceJob
from scheduler_models import MaintenanceJob, TrainSectionWindow

def load_tms_jobs(db: Session) -> List[MaintenanceJob]:
    query = text("""
        SELECT
            t.track_job_id,
            t.line_section,
            t.line_direction,
            t.start_km,
            t.end_km,
            t.work_category,
            t.required_duration_mins,
            t.tdms_collab_req,
            t.smms_collab_req,
            COALESCE(c.priority, 0) AS priority
        FROM tms_track_assets t
        LEFT JOIN control_room_master c
            ON c.job_id = t.track_job_id
        ORDER BY t.track_job_id
    """)

    rows = db.execute(query).mappings().all()

    jobs = []

    for row in rows:
        collaborations = []

        if row["tdms_collab_req"]:
            collaborations.append("TDMS")

        if row["smms_collab_req"]:
            collaborations.append("SMMS")

        jobs.append(
            MaintenanceJob(
                job_id=row["track_job_id"],
                department="TMS",
                section=row["line_section"],
                direction=row["line_direction"],
                duration_mins=row["required_duration_mins"],
                priority=row["priority"],
                work_category=row["work_category"],
                collaboration_departments=collaborations,
                start_km=float(row["start_km"]),
                end_km=float(row["end_km"]),
            )
        )

    return jobs


def load_tdms_jobs(db: Session) -> List[MaintenanceJob]:
    query = text("""
        SELECT
            t.power_job_id,
            t.line_section,
            t.line_direction,
            t.source_mast_no,
            t.target_mast_no,
            t.power_isolation_needed,
            t.work_category,
            t.required_duration_mins,
            t.tms_collab_req,
            t.smms_collab_req,
            COALESCE(c.priority, 0) AS priority
        FROM tdms_power_assets t
        LEFT JOIN control_room_master c
            ON c.job_id = t.power_job_id
        ORDER BY t.power_job_id
    """)

    rows = db.execute(query).mappings().all()

    jobs = []

    for row in rows:
        collaborations = []

        if row["tms_collab_req"]:
            collaborations.append("TMS")

        if row["smms_collab_req"]:
            collaborations.append("SMMS")

        jobs.append(
            MaintenanceJob(
                job_id=row["power_job_id"],
                department="TDMS",
                section=row["line_section"],
                direction=row["line_direction"],
                duration_mins=row["required_duration_mins"],
                priority=row["priority"],
                work_category=row["work_category"],
                collaboration_departments=collaborations,
                power_isolation_needed=bool(row["power_isolation_needed"]),
                source_mast_no=row["source_mast_no"],
                target_mast_no=row["target_mast_no"],
            )
        )

    return jobs


def load_smms_jobs(db: Session) -> List[MaintenanceJob]:
    query = text("""
        SELECT
            s.signal_job_id,
            s.station_code,
            s.point_machine_no,
            s.interlocking_panel,
            s.work_category,
            s.required_duration_mins,
            s.tdms_collab_req,
            s.tms_collab_req,
            COALESCE(c.priority, 0) AS priority
        FROM smms_signal_assets s
        LEFT JOIN control_room_master c
            ON c.job_id = s.signal_job_id
        ORDER BY s.signal_job_id
    """)

    rows = db.execute(query).mappings().all()

    jobs = []

    for row in rows:
        collaborations = []

        if row["tdms_collab_req"]:
            collaborations.append("TDMS")

        if row["tms_collab_req"]:
            collaborations.append("TMS")

        jobs.append(
            MaintenanceJob(
                job_id=row["signal_job_id"],
                department="SMMS",

                # SMMS currently has no line_section.
                # We keep station_code as the section placeholder
                # until a station-to-corridor mapping is added.
                section=row["station_code"],
                direction="STATION",

                duration_mins=row["required_duration_mins"],
                priority=row["priority"],
                work_category=row["work_category"],
                collaboration_departments=collaborations,
                station_code=row["station_code"],
            )
        )

    return jobs


def load_maintenance_jobs(db: Session) -> List[MaintenanceJob]:
    """
    Load all maintenance jobs from PostgreSQL.

    This is the main entry point for the scheduler.
    """

    tms_jobs = load_tms_jobs(db)
    tdms_jobs = load_tdms_jobs(db)
    smms_jobs = load_smms_jobs(db)

    return tms_jobs + tdms_jobs + smms_jobs

def load_train_windows(db) -> List[TrainSectionWindow]:
    query = text("""
        SELECT
            train_number,
            train_name,
            priority,
            line_section,
            line_direction,
            enter_time_mins,
            exit_time_mins,
            train_type
        FROM train_section_windows
        ORDER BY line_section, line_direction, enter_time_mins
    """)

    rows = db.execute(query).mappings().all()

    trains = []

    for row in rows:
        trains.append(
            TrainSectionWindow(
                train_number=str(row["train_number"]),
                train_name=row["train_name"],
                priority=int(row["priority"]),
                section=row["line_section"],
                direction=row["line_direction"],
                enter_time_mins=int(row["enter_time_mins"]),
                exit_time_mins=int(row["exit_time_mins"]),
                train_type=row["train_type"],
            )
        )

    return trains