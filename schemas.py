from pydantic import BaseModel, Field
from typing import Optional


# -------------------------
# TMS
# -------------------------

class TmsRequestCreate(BaseModel):
    track_job_id: Optional[str] = None
    line_section: str
    line_direction: str
    start_km: float
    end_km: float
    structure_type: str
    work_category: str
    tdms_collab_req: bool = False
    smms_collab_req: bool = False
    required_duration_mins: int = Field(gt=0)
    reported_by: str

TMSCreate = TmsRequestCreate


class TmsRequestUpdate(BaseModel):
    line_section: Optional[str] = None
    line_direction: Optional[str] = None
    start_km: Optional[float] = None
    end_km: Optional[float] = None
    structure_type: Optional[str] = None
    work_category: Optional[str] = None
    tdms_collab_req: Optional[bool] = None
    smms_collab_req: Optional[bool] = None
    required_duration_mins: Optional[int] = Field(default=None, gt=0)
    reported_by: Optional[str] = None

TMSUpdate = TmsRequestUpdate


# -------------------------
# TDMS
# -------------------------

class TdmsRequestCreate(BaseModel):
    power_job_id: Optional[str] = None
    line_section: str
    line_direction: str
    source_mast_no: str
    target_mast_no: str
    power_isolation_needed: bool = False
    work_category: str
    tms_collab_req: bool = False
    smms_collab_req: bool = False
    required_duration_mins: int = Field(gt=0)
    reported_by: str

TDMSCreate = TdmsRequestCreate


class TdmsRequestUpdate(BaseModel):
    line_section: Optional[str] = None
    line_direction: Optional[str] = None
    source_mast_no: Optional[str] = None
    target_mast_no: Optional[str] = None
    power_isolation_needed: Optional[bool] = None
    work_category: Optional[str] = None
    tms_collab_req: Optional[bool] = None
    smms_collab_req: Optional[bool] = None
    required_duration_mins: Optional[int] = Field(default=None, gt=0)
    reported_by: Optional[str] = None

TDMSUpdate = TdmsRequestUpdate


# -------------------------
# SMMS
# -------------------------

class SmmsRequestCreate(BaseModel):
    signal_job_id: Optional[str] = None
    station_code: Optional[str] = None
    station: Optional[str] = None
    point_machine_no: Optional[str] = None
    signal_number: Optional[str] = None
    interlocking_panel: str
    work_category: str
    tdms_collab_req: bool = False
    tms_collab_req: bool = False
    required_duration_mins: int = Field(gt=0)
    reported_by: str

SMMSCreate = SmmsRequestCreate


class SmmsRequestUpdate(BaseModel):
    station_code: Optional[str] = None
    station: Optional[str] = None
    point_machine_no: Optional[str] = None
    signal_number: Optional[str] = None
    interlocking_panel: Optional[str] = None
    work_category: Optional[str] = None
    tdms_collab_req: Optional[bool] = None
    tms_collab_req: Optional[bool] = None
    required_duration_mins: Optional[int] = Field(default=None, gt=0)
    reported_by: Optional[str] = None

SMMSUpdate = SmmsRequestUpdate