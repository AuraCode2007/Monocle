from priority import find_priority


def calculate_priority(
    department: str,
    job_data: dict
) -> int:

    return find_priority(
        department,
        job_data
    )