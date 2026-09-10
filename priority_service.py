from priority import find_priority


PRIORITY_HIGH = 1

PRIORITY_LABELS = {
    1: "HIGHEST",
    2: "HIGH",
    3: "MEDIUM",
    4: "LOW",
    5: "LOWEST",
}


def calculate_priority(
    department: str,
    job_data: dict
) -> int:
    return find_priority(
        department,
        job_data
    )