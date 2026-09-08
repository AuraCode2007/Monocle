"""
Integration point for Shayaan's AI maintenance-priority checker.

============================================================================
STATUS AT THE TIME THIS FILE WAS WRITTEN: priority.py did NOT exist anywhere
in the uploaded repository (checked the zip, checked git history, checked
every README/comment for a signature). Nothing below is Shayaan's real
implementation - it is an adapter that the rest of the backend calls through,
so the app is fully runnable today and needs zero changes to its call sites
once priority.py is pushed (only the shape check in _validate_result below,
if his return type differs from what's assumed here).
============================================================================

EXPECTED INTERFACE (please confirm/adjust with Shayaan):

    # priority.py, at the repository root (same level as main.py)
    def find_priority(department: str, work_category: str,
                       required_duration_mins: int,
                       department_specific_details: dict) -> int:
        """
        Returns an integer on the same scale already defined by the
        `priority` column comment in rail_maintenance_data.sql:
            0 = PENDING (not yet scored - should not normally be returned
                by find_priority itself; 0 is what the DB defaults to
                before this function has run)
            1 = LOW
            2 = MEDIUM
            3 = HIGH
        """

Why these four arguments: `department`, `work_category` and
`required_duration_mins` are the three fields every control_room_master row
has regardless of department. `department_specific_details` is a plain
dict built to have EXACTLY the same keys the tms_sync_trigger /
tdms_sync_trigger / smms_sync_trigger already write into
control_room_master.department_specific_details (JSONB) for that department -
see the `_build_department_details` calls in crud.py. That was chosen so
Shayaan's function sees the identical shape already sitting in Postgres,
rather than a bespoke shape invented just for this call.

If Shayaan's real function needs different arguments, a different name, a
different return type/scale, or is async: change ONLY the call inside
`get_priority()` below (and `_validate_result` if the scale changes). No
other file needs to know about it.

LOCAL-DEV FALLBACK: if priority.py is missing AND the environment variable
USE_MOCK_PRIORITY=true is set, a deliberately naive placeholder scorer is
used instead so the rest of the backend (and its tests) can be exercised
before Shayaan pushes his code. It is NEVER used unless that flag is set
explicitly - by default, a missing priority.py just means every request's
priority stays at 0 (PENDING) until it's re-scored later. That is a
possible admin action to build later; it is out of scope here.
"""

import logging
import os
from typing import Any, Dict

logger = logging.getLogger("railsync.priority_client")

PRIORITY_PENDING = 0
PRIORITY_LOW = 1
PRIORITY_MEDIUM = 2
PRIORITY_HIGH = 3
VALID_PRIORITIES = {PRIORITY_PENDING, PRIORITY_LOW, PRIORITY_MEDIUM, PRIORITY_HIGH}

PRIORITY_LABELS = {
    PRIORITY_PENDING: "PENDING",
    PRIORITY_LOW: "LOW",
    PRIORITY_MEDIUM: "MEDIUM",
    PRIORITY_HIGH: "HIGH",
}

USE_MOCK_PRIORITY = os.getenv("USE_MOCK_PRIORITY", "false").strip().lower() == "true"

try:
    # This is the real integration point. Once Shayaan pushes priority.py to
    # the repository root, this import starts succeeding automatically -
    # nothing else needs to change.
    from priority import find_priority as _find_priority_impl  # type: ignore

    _PRIORITY_SOURCE = "priority.py (Shayaan's AI checker)"
except ImportError:
    _find_priority_impl = None
    _PRIORITY_SOURCE = "MOCK (priority.py not found)" if USE_MOCK_PRIORITY else "NONE (priority.py not found)"
    logger.warning(
        "priority.py not found at repository root - find_priority is unavailable. "
        "%s",
        "Falling back to the local mock scorer because USE_MOCK_PRIORITY=true."
        if USE_MOCK_PRIORITY
        else "New requests will be stored with priority=0 (PENDING) until priority.py "
        "is added, or USE_MOCK_PRIORITY=true is set for local development.",
    )


def _mock_find_priority(
    department: str,
    work_category: str,
    required_duration_mins: int,
    department_specific_details: Dict[str, Any],
) -> int:
    """
    LOCAL-DEV-ONLY placeholder. Not real AI, not Shayaan's logic - just
    enough signal (job length + how many departments must collaborate) to
    produce varied, plausible-looking priorities so the rest of the stack
    (dashboards, status workflow, tests) can be exercised end to end before
    priority.py exists. Never used unless USE_MOCK_PRIORITY=true.
    """
    details = department_specific_details or {}
    collab_flags_true = sum(1 for k, v in details.items() if k.endswith("_collab_req") and bool(v))

    if required_duration_mins >= 240 or collab_flags_true >= 2:
        return PRIORITY_HIGH
    if required_duration_mins >= 120 or collab_flags_true >= 1:
        return PRIORITY_MEDIUM
    return PRIORITY_LOW


def _validate_result(result: Any) -> int:
    result_int = int(result)
    if result_int not in VALID_PRIORITIES:
        raise ValueError(f"find_priority returned out-of-range value: {result!r}")
    return result_int


def get_priority(
    department: str,
    work_category: str,
    required_duration_mins: int,
    department_specific_details: Dict[str, Any],
) -> int:
    """
    The single call-site the rest of the backend uses (see crud.py). Always
    returns an int in {0,1,2,3}; NEVER raises - any failure (missing module,
    bad return value, exception inside find_priority) is logged and treated
    as PRIORITY_PENDING (0) so a flaky/absent priority engine can never block
    request creation. This is deliberate: task instructions call for
    "priority-checker error handling", and failing the whole request over an
    AI scoring hiccup would be worse than temporarily leaving it unscored.
    """
    try:
        if _find_priority_impl is not None:
            raw_result = _find_priority_impl(
                department=department,
                work_category=work_category,
                required_duration_mins=required_duration_mins,
                department_specific_details=department_specific_details,
            )
        elif USE_MOCK_PRIORITY:
            raw_result = _mock_find_priority(
                department, work_category, required_duration_mins, department_specific_details
            )
        else:
            logger.error(
                "find_priority unavailable (priority.py missing, USE_MOCK_PRIORITY not set) - "
                "storing priority=PENDING for job in department=%s",
                department,
            )
            return PRIORITY_PENDING

        return _validate_result(raw_result)

    except Exception:
        logger.exception(
            "find_priority raised while scoring a %s request - storing priority=PENDING", department
        )
        return PRIORITY_PENDING