#what i fixed on top of shayaans Code
#global state → local state
#fixed find_priority() so it can actually receive job information
#fixed the TDMS regex
#converted final result to an integer
#made TDMS mast parsing compatible with your DB
#centralized 1–5 clamping
#automatically calculated departments_involved from your collaboration flags


import re


DEFAULT_PRIORITY = 3


def clamp_priority(priority: float) -> int:
    """
    Keep priority between 1 and 5.

    1 = Highest priority
    5 = Lowest priority
    """

    return int(max(1, min(5, priority)))


def extract_number(value) -> int:
    """
    Extract the numeric portion from a value.

    Examples:
        "120"   -> 120
        "M120"  -> 120
        120     -> 120
    """

    match = re.search(r'\d+', str(value))

    if match:
        return int(match.group())

    return 0


def find_priority(dept_name: str, job_data: dict) -> int:
    """
    Main priority dispatcher.

    job_data contains the fields from the corresponding
    department maintenance request.
    """

    dept_name = dept_name.upper()

    if dept_name == "TMS":

        departments_involved = (
            1
            + int(job_data.get("tdms_collab_req", False))
            + int(job_data.get("smms_collab_req", False))
        )

        return tms_priority(
            work_category=job_data["work_category"],
            time_to_complete=job_data["required_duration_mins"],
            departments_involved=departments_involved,
            end_km=float(job_data["end_km"]),
            start_km=float(job_data["start_km"])
        )

    elif dept_name == "TDMS":

        departments_involved = (
            1
            + int(job_data.get("tms_collab_req", False))
            + int(job_data.get("smms_collab_req", False))
        )

        return tdms_priority(
            work_category=job_data["work_category"],
            required_duration_mins=job_data["required_duration_mins"],
            departments_involved=departments_involved,
            power_isolation_needed=job_data.get(
                "power_isolation_needed",
                False
            ),
            target_mast=extract_number(
                job_data["target_mast_no"]
            ),
            source_mast=extract_number(
                job_data["source_mast_no"]
            )
        )

    elif dept_name == "SMMS":

        departments_involved = (
            1
            + int(job_data.get("tdms_collab_req", False))
            + int(job_data.get("tms_collab_req", False))
        )

        return smms_priority(
            work_category=job_data["work_category"],
            required_duration_mins=job_data["required_duration_mins"],
            departments_involved=departments_involved
        )

    else:
        raise ValueError(
            f"Unknown department name: {dept_name}"
        )


def tms_priority(
    work_category: str,
    time_to_complete: int,
    departments_involved: int,
    end_km: float,
    start_km: float
) -> int:

    # Every job starts independently at default priority.
    priority = DEFAULT_PRIORITY

    length_of_track = end_km - start_km

    # Emergency / critical work
    if re.search(
        r'\b(urgent|critical|emergency)\b',
        work_category,
        re.IGNORECASE
    ):
        return 1

    # Defective/broken/failed replacement
    if re.search(
        r'(?=.*replacement)(?=.*(defective|broken|failed))',
        work_category,
        re.IGNORECASE
    ):
        return 2

    # Major maintenance
    if re.search(
        r'\b(deep screening|replacement|de-stressing)\b',
        work_category,
        re.IGNORECASE
    ):
        priority -= 1

    # Routine maintenance
    if re.search(
        r'\b(inspection|cleaning|packing)\b',
        work_category,
        re.IGNORECASE
    ):
        priority += 1

    # Collaboration between departments
    priority -= 0.5 * (departments_involved - 1)

    # Shorter jobs get higher priority
    if time_to_complete < 360:
        priority += 0.005 * (time_to_complete - 30)

    # Longer track sections slightly reduce priority
    priority -= 0.001 * length_of_track

    return clamp_priority(priority)


def tdms_priority(
    work_category: str,
    required_duration_mins: int,
    departments_involved: int,
    power_isolation_needed: bool,
    target_mast: int,
    source_mast: int
) -> int:

    priority = DEFAULT_PRIORITY

    length_of_track = target_mast - source_mast

    # Power isolation is safety-critical.
    if power_isolation_needed:
        priority -= 1

    # Emergency / critical work
    if re.search(
        r'\b(urgent|critical|emergency|overhaul)\b',
        work_category,
        re.IGNORECASE
    ):
        return 1

    # Important infrastructure
    if re.search(
        r'\b(cross-over|turnout|tunnel)\b|'
        r'(?=.*replacement)(?=.*section insulator)',
        work_category,
        re.IGNORECASE
    ):
        return 2

    # Important maintenance
    if re.search(
        r'\b(testing|replacement|splicing)\b',
        work_category,
        re.IGNORECASE
    ):
        priority -= 1

    # Routine maintenance
    if re.search(
        r'\b(check|servicing|painting|maintenance)\b',
        work_category,
        re.IGNORECASE
    ):
        priority += 1

    # Lower urgency
    if re.search(
        r'\b(measurement|calibration|test|tensioning)\b',
        work_category,
        re.IGNORECASE
    ):
        priority += 2

    # Collaboration
    priority -= 0.5 * (departments_involved - 1)

    # Shorter jobs get higher priority
    if required_duration_mins < 360:
        priority += 0.005 * (
            required_duration_mins - 30
        )

    # Longer sections slightly reduce priority
    priority -= 0.001 * length_of_track

    return clamp_priority(priority)


def smms_priority(
    work_category: str,
    required_duration_mins: int,
    departments_involved: int
) -> int:

    priority = DEFAULT_PRIORITY

    # Emergency / critical work
    if re.search(
        r'\b(urgent|critical|emergency)\b',
        work_category,
        re.IGNORECASE
    ):
        return 1

    # Technical adjustment/testing
    if re.search(
        r'\b(adjustment|tuning|diagnostics|test)\b',
        work_category,
        re.IGNORECASE
    ):
        priority -= 2

    # Routine servicing
    if re.search(
        r'\b(check|lubrication)\b',
        work_category,
        re.IGNORECASE
    ):
        priority -= 1

    # Lower urgency
    if re.search(
        r'\b(inspection|cleaning|analysis|meggering)\b',
        work_category,
        re.IGNORECASE
    ):
        priority += 1

    # Collaboration
    priority -= 0.5 * (departments_involved - 1)

    # Shorter jobs get higher priority
    if required_duration_mins < 360:
        priority += 0.005 * (
            required_duration_mins - 30
        )

    return clamp_priority(priority)