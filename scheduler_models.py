# defines the model/structure of the data that scheduler needs
# in required format.
from dataclasses import dataclass, field
from typing import List, Optional


@dataclass
class MaintenanceJob:
    job_id: str
    department: str

    # Common location information
    section: str
    direction: str

    # Scheduling information
    duration_mins: int
    priority: int
    work_category: str

    # Departments that need to collaborate
    collaboration_departments: List[str] = field(default_factory=list)

    # Department-specific information
    power_isolation_needed: bool = False

    start_km: Optional[float] = None
    end_km: Optional[float] = None

    source_mast_no: Optional[str] = None
    target_mast_no: Optional[str] = None

    station_code: Optional[str] = None

    @property
    def resource_key(self) -> str:
        """
        Identifies the physical resource occupied by this job.

        TMS/TDMS:
            same section + direction = same scheduling resource

        SMMS:
            station-based resource for now.
        """
        if self.department in ("TMS", "TDMS"):
            return f"{self.section}:{self.direction}"

        if self.department == "SMMS":
            return f"STATION:{self.station_code}"

        return f"{self.department}:{self.section}:{self.direction}"


    @dataclass
class TrainSectionWindow:
    train_number: str
    train_name: str
    priority: int

    section: str
    direction: str

    enter_time_mins: int
    exit_time_mins: int

    train_type: str