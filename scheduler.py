from typing import List, Dict, Any
from collections import defaultdict

from ortools.sat.python import cp_model

from scheduler_models import MaintenanceJob, TrainSectionWindow


# ============================================================
# BASIC SETTINGS
# ============================================================

# Planning horizon = one full day
HORIZON_MINS = 24 * 60
# Safety gap kept between a train movement and maintenance.
# Example:
# train exits at 310
# buffer = 10
# maintenance can start only at 320 or later.
TRAIN_SAFETY_BUFFER_MINS = 10

def minutes_to_hhmm(minutes: int) -> str:
    """Convert minutes from midnight into HH:MM."""
    hours = minutes // 60
    mins = minutes % 60
    return f"{hours:02d}:{mins:02d}"


# ============================================================
# JOINT-BLOCK ELIGIBILITY
# ============================================================

def can_form_joint_block(job1: MaintenanceJob,
                         job2: MaintenanceJob) -> bool:
    """
    Check whether two jobs are allowed to form a joint block.

    A joint block is possible only when:
    1. Jobs belong to different departments.
    2. They use the same physical resource.
    3. Each job explicitly requests collaboration with the other department.
    """

    # Different departments are required for collaboration.
    if job1.department == job2.department:
        return False

    # They must actually refer to the same scheduling resource.
    if job1.resource_key != job2.resource_key:
        return False

    # Collaboration should be mutual.
    if job2.department not in job1.collaboration_departments:
        return False

    if job1.department not in job2.collaboration_departments:
        return False

    return True


# ============================================================
# SCHEDULE VALIDATION
# ============================================================
def same_train_resource(
    job: MaintenanceJob,
    train: TrainSectionWindow
) -> bool:
    """
    A train can conflict with a maintenance job only when
    both refer to the same physical section and direction.
    """

    return (
        job.section == train.section
        and
        job.direction == train.direction
    )



def validate_schedule(scheduled_jobs: List[Dict[str, Any]], train_windows: List[TrainSectionWindow] = None) -> Dict[str, Any]:
    """
    Independently validate the solver's output.

    This is NOT part of the optimization.
    It is a safety check after the solver finishes.
    """
    if train_windows is None:
        train_windows = []
    errors = []

    # --------------------------------------------------------
    # HARD CHECK 1:
    # Every job must stay inside the 24-hour horizon.
    # --------------------------------------------------------

    for job in scheduled_jobs:
        if job["start_mins"] < 0:
            errors.append(
                f"{job['job_id']} starts before 00:00"
            )

        if job["end_mins"] > HORIZON_MINS:
            errors.append(
                f"{job['job_id']} ends after 24:00"
            )

        if job["end_mins"] <= job["start_mins"]:
            errors.append(
                f"{job['job_id']} has invalid time interval"
            )

    # --------------------------------------------------------
    # HARD CHECK 2:
    # Jobs using the same resource cannot overlap unless
    # they are explicitly marked as a joint block.
    # --------------------------------------------------------

    jobs_by_resource = defaultdict(list)

    for job in scheduled_jobs:
        jobs_by_resource[job["resource_key"]].append(job)

    for resource, jobs in jobs_by_resource.items():

        for i in range(len(jobs)):
            for j in range(i + 1, len(jobs)):

                job1 = jobs[i]
                job2 = jobs[j]

                overlap = not (
                    job1["end_mins"] <= job2["start_mins"]
                    or
                    job2["end_mins"] <= job1["start_mins"]
                )

                if overlap:

                    both_joint = (
                        job1.get("block_type") == "JOINT"
                        and
                        job2.get("block_type") == "JOINT"
                        and
                        job1.get("block_id") == job2.get("block_id")
                    )

                    if not both_joint:
                        errors.append(
                            f"Resource conflict: "
                            f"{job1['job_id']} overlaps "
                            f"{job2['job_id']} on {resource}"
                        )

    
    # --------------------------------------------------------
    # HARD CHECK 3:
    #
    # Maintenance must not overlap a train movement on the
    # same section and direction.
    #
    # Safety buffer is checked independently here too.
    # --------------------------------------------------------

    for job in scheduled_jobs:

        for train in train_windows:

            same_resource = (
                job["section"] == train.section
                and
                job["direction"] == train.direction
            )

            if not same_resource:
                continue

            safe_before = (
                job["end_mins"]
                <= train.enter_time_mins
                - TRAIN_SAFETY_BUFFER_MINS
            )

            safe_after = (
                job["start_mins"]
                >= train.exit_time_mins
                + TRAIN_SAFETY_BUFFER_MINS
            )

            if not (safe_before or safe_after):

                errors.append(
                    f"Train conflict: "
                    f"{job['job_id']} overlaps train "
                    f"{train.train_number} "
                    f"on {train.section}/{train.direction}"
                )
    return {
            "valid": len(errors) == 0,
            "errors": errors
        }


# ============================================================
# BLOCK CONSTRUCTION
# ============================================================

def build_blocks(scheduled_jobs: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Convert scheduled jobs into blocks.

    Jobs belonging to the same joint block are represented
    as one physical maintenance block.
    """

    grouped = defaultdict(list)

    for job in scheduled_jobs:
        grouped[job["block_id"]].append(job)

    blocks = []

    for block_id, jobs in grouped.items():

        start = min(job["start_mins"] for job in jobs)
        end = max(job["end_mins"] for job in jobs)

        departments = sorted({
            job["department"]
            for job in jobs
        })

        job_ids = [
            job["job_id"]
            for job in jobs
        ]

        block_type = (
            "JOINT"
            if len(jobs) > 1
            else "SINGLE"
        )

        blocks.append({
            "block_id": block_id,
            "section": jobs[0]["section"],
            "direction": jobs[0]["direction"],
            "start_mins": start,
            "end_mins": end,
            "start": minutes_to_hhmm(start),
            "end": minutes_to_hhmm(end),
            "duration_mins": end - start,
            "block_type": block_type,
            "departments": departments,
            "jobs": job_ids,
        })

    # Sort blocks chronologically.
    blocks.sort(key=lambda block: block["start_mins"])

    return blocks


# ============================================================
# MAIN OPTIMIZER
# ============================================================

def optimize_jobs(
     jobs: List[MaintenanceJob],
    train_windows: List[TrainSectionWindow] = None,
    time_limit_sec: int = 15) -> Dict[str, Any]:

    if train_windows is None:
        train_windows = [] 
    """
    Schedule maintenance jobs using OR-Tools CP-SAT.

    Current version:
        - DB maintenance jobs
        - 24-hour planning horizon
        - resource conflict constraints
        - joint blocks
        - priority-based objective

    """
    """
    Schedule maintenance jobs using OR-Tools CP-SAT.

    Current version:
        - DB maintenance jobs
        - 24-hour planning horizon
        - train movement constraints
        - resource conflict constraints
        - joint blocks
        - priority-based objective

    Train timings are treated as hard availability constraints.
    """
    if not jobs:
        return {
            "status": "NO_JOBS",
            "message": "No maintenance jobs were provided."
        }

    model = cp_model.CpModel()

    # ========================================================
    # CREATE VARIABLES
    # ========================================================

    job_vars = {}

    for job in jobs:

        duration = job.duration_mins

        # ----------------------------------------------------
        # HARD CONSTRAINT:
        # A job must fit completely inside the 24-hour horizon.
        # ----------------------------------------------------

        if duration <= 0:
            raise ValueError(
                f"Invalid duration for job {job.job_id}: {duration}"
            )

        if duration > HORIZON_MINS:
            raise ValueError(
                f"Job {job.job_id} is longer than the planning horizon."
            )

        start = model.NewIntVar(
            0,
            HORIZON_MINS - duration,
            f"start_{job.job_id}"
        )

        end = model.NewIntVar(
            duration,
            HORIZON_MINS,
            f"end_{job.job_id}"
        )

        # Hard relationship: end = start + duration.
        model.Add(end == start + duration)

        interval = model.NewIntervalVar(
            start,
            duration,
            end,
            f"interval_{job.job_id}"
        )

        job_vars[job.job_id] = {
            "start": start,
            "end": end,
            "interval": interval,
            "job": job,
        }

    # ========================================================
    # TRAIN MOVEMENT CONSTRAINTS
    # ========================================================

    for job in jobs:

        job_data = job_vars[job.job_id]

        for train in train_windows:

            # Train only matters if it occupies the same
            # section and direction as the maintenance job.
            if not same_train_resource(job, train):
                continue

            # ------------------------------------------------
            # HARD CONSTRAINT:
            #
            # Maintenance must happen completely BEFORE
            # the train arrives
            #
            # OR
            #
            # completely AFTER the train has cleared.
            #
            # Safety buffer is applied on both sides.
            # ------------------------------------------------

            before_train = model.NewBoolVar(
                f"before_train_{job.job_id}_{train.train_number}"
            )

            after_train = model.NewBoolVar(
                f"after_train_{job.job_id}_{train.train_number}"
            )

            # Exactly one side of the train window.
            model.Add(
                before_train + after_train == 1
            )

            # Maintenance ends before train arrival,
            # including safety buffer.
            model.Add(
                job_data["end"]
                <= train.enter_time_mins - TRAIN_SAFETY_BUFFER_MINS
            ).OnlyEnforceIf(before_train)

            # Maintenance starts after train departure,
            # including safety buffer.
            model.Add(
                job_data["start"]
                >= train.exit_time_mins + TRAIN_SAFETY_BUFFER_MINS
            ).OnlyEnforceIf(after_train)

    # ========================================================
    # RESOURCE CONSTRAINTS
    # ========================================================

    # Group jobs that occupy the same physical resource.
    jobs_by_resource = defaultdict(list)

    for job in jobs:
        jobs_by_resource[job.resource_key].append(job)

    joint_variables = []

    for resource, resource_jobs in jobs_by_resource.items():

        for i in range(len(resource_jobs)):
            for j in range(i + 1, len(resource_jobs)):

                job1 = resource_jobs[i]
                job2 = resource_jobs[j]

                vars1 = job_vars[job1.job_id]
                vars2 = job_vars[job2.job_id]

                eligible_for_joint = can_form_joint_block(
                    job1,
                    job2
                )

                # ------------------------------------------------
                # HARD CONSTRAINT:
                # Two jobs on the same resource must either:
                #
                #   A) happen one after another
                #   B) be a valid joint block
                #
                # They cannot simply overlap by accident.
                # ------------------------------------------------

                if eligible_for_joint:

                    joint = model.NewBoolVar(
                        f"joint_{job1.job_id}_{job2.job_id}"
                    )

                    before = model.NewBoolVar(
                        f"before_{job1.job_id}_{job2.job_id}"
                    )

                    after = model.NewBoolVar(
                        f"after_{job1.job_id}_{job2.job_id}"
                    )

                    # Exactly ONE relationship must hold.
                    model.Add(
                        joint + before + after == 1
                    )

                    # ------------------------------------------------
                    # JOINT CASE:
                    # Both departments start together.
                    #
                    # The resulting block lasts until the longer
                    # of the two jobs finishes.
                    # ------------------------------------------------

                    model.Add(
                        vars1["start"] == vars2["start"]
                    ).OnlyEnforceIf(joint)

                    # ------------------------------------------------
                    # SEQUENTIAL CASE 1:
                    # Job 1 happens before Job 2.
                    # ------------------------------------------------

                    model.Add(
                        vars1["end"] <= vars2["start"]
                    ).OnlyEnforceIf(before)

                    # ------------------------------------------------
                    # SEQUENTIAL CASE 2:
                    # Job 2 happens before Job 1.
                    # ------------------------------------------------

                    model.Add(
                        vars2["end"] <= vars1["start"]
                    ).OnlyEnforceIf(after)

                    joint_variables.append({
                        "variable": joint,
                        "job1": job1,
                        "job2": job2,
                    })

                else:

                    before = model.NewBoolVar(
                        f"before_{job1.job_id}_{job2.job_id}"
                    )

                    after = model.NewBoolVar(
                        f"after_{job1.job_id}_{job2.job_id}"
                    )

                    # ------------------------------------------------
                    # HARD CONSTRAINT:
                    # Non-compatible jobs MUST be sequential.
                    # ------------------------------------------------

                    model.Add(before + after == 1)

                    model.Add(
                        vars1["end"] <= vars2["start"]
                    ).OnlyEnforceIf(before)

                    model.Add(
                        vars2["end"] <= vars1["start"]
                    ).OnlyEnforceIf(after)

    # ========================================================
    # OBJECTIVE FUNCTION
    # ========================================================

    objective_terms = []

    for job in jobs:

        vars_for_job = job_vars[job.job_id]

        # ----------------------------------------------------
        # SOFT OBJECTIVE:
        #
        # Higher priority = smaller number.
        #
        # We therefore give higher-priority jobs a larger
        # weight when minimizing their completion time.
        #
        # Example:
        # priority 1 → weight 5
        # priority 5 → weight 1
        # ----------------------------------------------------

        priority = job.priority

        # Priority 0 means "not calculated".
        # Give it the weakest scheduling preference.
        if priority == 0:
            priority_weight = 1
        else:
            priority_weight = 6 - priority

        objective_terms.append(
            vars_for_job["end"] * priority_weight
        )

    # --------------------------------------------------------
    # SOFT OBJECTIVE:
    #
    # Reward valid joint blocks.
    #
    # This encourages the solver to synchronize departments
    # when collaboration is actually requested.
    # --------------------------------------------------------

    for joint_info in joint_variables:

        objective_terms.append(
            -1000 * joint_info["variable"]
        )

    # --------------------------------------------------------
    # SOFT OBJECTIVE:
    #
    # Keep the overall schedule compact.
    #
    # Makespan = time when the final job finishes.
    # --------------------------------------------------------

    makespan = model.NewIntVar(
        0,
        HORIZON_MINS,
        "makespan"
    )

    for job in jobs:
        model.Add(
            makespan >= job_vars[job.job_id]["end"]
        )

    objective_terms.append(
        makespan * 2
    )

    # CP-SAT minimizes the complete objective.
    model.Minimize(sum(objective_terms))

    # ========================================================
    # SOLVE
    # ========================================================

    solver = cp_model.CpSolver()

    solver.parameters.max_time_in_seconds = time_limit_sec

    # Use multiple CPU workers where available.
    solver.parameters.num_search_workers = 4

    status = solver.Solve(model)

    # ========================================================
    # SOLVER STATUS
    # ========================================================

    if status == cp_model.INFEASIBLE:
        return {
            "status": "INFEASIBLE",
            "message": "No schedule satisfies the hard constraints."
        }

    if status not in (
        cp_model.OPTIMAL,
        cp_model.FEASIBLE
    ):
        return {
            "status": "UNKNOWN",
            "message": "Solver could not produce a schedule."
        }

    # ========================================================
    # BUILD SCHEDULE OUTPUT
    # ========================================================

    scheduled_jobs = []

    # First determine which pairs became joint.
    joint_pairs = []

    for joint_info in joint_variables:

        if solver.Value(joint_info["variable"]) == 1:

            joint_pairs.append(
                (
                    joint_info["job1"].job_id,
                    joint_info["job2"].job_id
                )
            )

    # --------------------------------------------------------
    # Create a block ID for every joint group.
    # Current version handles pairwise joint blocks.
    # --------------------------------------------------------

    joint_block_ids = {}

    block_counter = 1

    for job1_id, job2_id in joint_pairs:

        block_id = f"BLOCK-{block_counter:03d}"

        joint_block_ids[job1_id] = block_id
        joint_block_ids[job2_id] = block_id

        block_counter += 1

    # --------------------------------------------------------
    # Create scheduled job objects.
    # --------------------------------------------------------

    for job in jobs:

        start = solver.Value(
            job_vars[job.job_id]["start"]
        )

        end = solver.Value(
            job_vars[job.job_id]["end"]
        )

        if job.job_id in joint_block_ids:

            block_id = joint_block_ids[job.job_id]
            block_type = "JOINT"

        else:

            block_id = f"BLOCK-{block_counter:03d}"
            block_counter += 1
            block_type = "SINGLE"

        scheduled_jobs.append({
            "job_id": job.job_id,
            "department": job.department,
            "section": job.section,
            "direction": job.direction,

            "resource_key": job.resource_key,

            "priority": job.priority,
            "work_category": job.work_category,

            "duration_mins": job.duration_mins,

            "start_mins": start,
            "end_mins": end,

            "start": minutes_to_hhmm(start),
            "end": minutes_to_hhmm(end),

            "block_id": block_id,
            "block_type": block_type,

            "status": "SCHEDULED",
        })

    # ========================================================
    # VALIDATE SOLVER OUTPUT
    # ========================================================

    validation = validate_schedule(
        scheduled_jobs, train_windows
    )

    blocks = build_blocks(
        scheduled_jobs
    )

    # ========================================================
    # METRICS
    # ========================================================

    joint_block_count = sum(
        1
        for block in blocks
        if block["block_type"] == "JOINT"
    )

    single_block_count = sum(
        1
        for block in blocks
        if block["block_type"] == "SINGLE"
    )

    makespan_value = solver.Value(makespan)

    sum_of_block_durations = sum(
        block["duration_mins"]
        for block in blocks
    )
    resource_conflicts = sum(
        1
        for error in validation["errors"]
        if error.startswith("Resource conflict:")
    )
    
    train_conflicts = sum(
        1
        for error in validation["errors"]
        if error.startswith("Train conflict:")
    )

    return {
        "status": (
            "OPTIMAL"
            if status == cp_model.OPTIMAL
            else "FEASIBLE"
        ),

        "solver_time_sec": round(
            solver.WallTime(),
            3
        ),

        "scheduled_jobs": scheduled_jobs,

        "blocks": blocks,

        "validation": validation,

        "metrics": {
            "total_jobs": len(jobs),
            "scheduled_jobs": len(scheduled_jobs),
            "unscheduled_jobs": len(jobs) - len(scheduled_jobs),

            "joint_blocks": joint_block_count,
            "single_blocks": single_block_count,

            "total_blocks": len(blocks),

            "sum_of_block_durations_mins": sum_of_block_durations,

            "makespan_mins": makespan_value,
            "makespan": minutes_to_hhmm(makespan_value),

            
            "resource_conflicts": resource_conflicts,
            "train_conflicts": train_conflicts,
        }
    }


# ============================================================
# DATABASE ENTRY POINT
# ============================================================

def schedule_jobs_from_db(
    db,
    time_limit_sec: int = 15
) -> Dict[str, Any]:

    from db_adapter import (
        load_maintenance_jobs,
        load_train_windows,
    )

    jobs = load_maintenance_jobs(db)

    train_windows = load_train_windows(db)

    return optimize_jobs(
        jobs=jobs,
        train_windows=train_windows,
        time_limit_sec=time_limit_sec
    )