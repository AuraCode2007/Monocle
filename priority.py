# currently lacks SQL integration.
# 1 = High priority, 5 = Low priority
priority = 3  # Default priority

import re

def find_priority(dept_name: str): # placeholder function untill database is integrated.
    if dept_name == "TMS":
        return tms_priority()
    elif dept_name == "TDMS":
        return tdms_priority()
    elif dept_name == "SMMS":
        return smms_priority()
    else:
        raise ValueError(f"Unknown department name: {dept_name}")
    
def tms_priority(work_category: str, time_to_complete: int, departments_involved: int, end_km: int, start_km: int) -> int:
    length_of_track = (end_km - start_km)
    global priority
    if re.search(r'\b(urgent|critical|emergency)\b', work_category, re.IGNORECASE):
        priority = 1
        return priority

    if re.search(r'(?=.*replacement)(?=.*defective)|(?=.*replacement)(?=.*broken)|(?=.*replacement)(?=.*failed)', work_category, re.IGNORECASE):
        priority = 2
        return priority

    if re.search(r'\b(deep screening|replacement|de-stressing)\b', work_category, re.IGNORECASE):
        priority -=1

    if re.search(r'\b(inspection|cleaning|packing)\b', work_category, re.IGNORECASE):
        priority +=1

    priority -= 0.5 * (departments_involved - 1)
    
    if time_to_complete < 360:  # priority = inverse of time to complete the task(so long as it's not a mega task).
        priority += 0.005 * (time_to_complete - 30)

    priority -= 0.001 * length_of_track

    priority = max(1.0, min(5.0, priority)) // 1
    return priority

def tdms_priority(work_category: str, required_duration_mins: int, departments_involved: int, power_isolation_needed: bool, target_mast: int, source_mast: int) -> int:
    length_of_track = (target_mast - source_mast) # basically the same thing so i kept the same variable name for consistency.
    global priority

    if power_isolation_needed:
        priority -= 1
    
    if re.search(r'\b(urgent|critical|emergency|overhaul)\b', work_category, re.IGNORECASE):
        priority = 1
        return priority

    if re.search(r'\b(cross-over|turnout|tunnel|(?=.*replacement)(?=.*section insulator))\b', work_category, re.IGNORECASE):
        priority = 2
        return priority

    if re.search(r'\b(testing|replacement|splicing)\b', work_category, re.IGNORECASE):
        priority -=1

    if re.search(r'\b(|check|servicing|painting|maintenance)\b', work_category, re.IGNORECASE):
        priority +=1

    if re.search(r'\b(measurement|calibration|test|tensioning)\b', work_category, re.IGNORECASE):
        priority +=2

    priority -= 0.5 * (departments_involved - 1)
    
    if required_duration_mins < 360:  # priority = inverse of time to complete the task(so long as it's not a mega task).
        priority += 0.005 * (required_duration_mins - 30)

    priority -= 0.001 * length_of_track

    priority = max(1.0, min(5.0, priority)) // 1
    return priority

def smms_priority(work_category: str, required_duration_mins: int, departments_involved: int) -> int:
    global priority

    if re.search(r'\b(urgent|critical|emergency)\b', work_category, re.IGNORECASE):
        priority = 1
        return priority

    if re.search(r'(adjustment|tuning|diagnostics|test)\b', work_category, re.IGNORECASE):
        priority -= 2

    if re.search(r'\b(check|lubrication)\b', work_category, re.IGNORECASE):
        priority -= 1

    if re.search(r'\b(inspection|cleaning|analysis|meggering)\b', work_category, re.IGNORECASE):
        priority += 1

    priority -= 0.5 * (departments_involved - 1)
    
    if required_duration_mins < 360:  # priority = inverse of time to complete the task(so long as it's not a mega task).
        priority += 0.005 * (required_duration_mins - 30)

    priority = max(1.0, min(5.0, priority)) // 1
    return priority