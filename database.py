import os
import re
import json
import time
import hashlib
import threading
from datetime import datetime
from typing import Dict, Any, List, Optional
import psycopg2
from psycopg2.extras import RealDictCursor

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SQL_FILE_PATH = os.path.join(BASE_DIR, "rail_maintenance_data.sql")

DB_CONFIG = {
    "dbname": os.environ.get("POSTGRES_DB", "railsync"),
    "user": os.environ.get("POSTGRES_USER", "postgres"),
    "password": os.environ.get("POSTGRES_PASSWORD", ""),
    "host": os.environ.get("POSTGRES_HOST", "127.0.0.1"),
    "port": int(os.environ.get("POSTGRES_PORT", "5432")),
}

# State management
_db_lock = threading.Lock()
_last_sync_time: Optional[str] = None
_last_file_hash: Optional[str] = None
_last_file_mtime: float = 0.0
_cached_tasks: List[Dict[str, Any]] = []
_watcher_running = False

# Mapping line sections & stations to corridor sections and lat/long
SECTION_MAPPING = {
    # NDLS_CNB sections
    "HWH-DEL": ["SEC_101", "SEC_102", "SEC_103", "SEC_104", "SEC_105", "SEC_106", "SEC_107", "SEC_108"],
    "LKO-NDLS": ["SEC_101", "SEC_102"],
    "CNB-ALD": ["SEC_107", "SEC_108"],
    "NDLS-JAT": ["SEC_101", "SEC_102"],
    # MMCT_ADI sections
    "BCT-NDLS": ["SEC_201", "SEC_202"],
    "ADI-BCT": ["SEC_203", "SEC_204"],
    "CSTM-MAO": ["SEC_201", "SEC_202"],
    # HWH_DDU sections
    "HWH-GAYA": ["SEC_301", "SEC_302", "SEC_304"],
    "ASN-GAYA": ["SEC_303", "SEC_304"],
    "TATA-HWH": ["SEC_301", "SEC_302"],
    "PNBE-HWH": ["SEC_304", "SEC_305"],
    "SDAH-LGL": ["SEC_301", "SEC_302"],
    # MAS_SBC sections
    "MAS-HWH": ["SEC_401", "SEC_402"],
    "SBC-MAS": ["SEC_403", "SEC_404"],
    "MDU-TPJ": ["SEC_405", "SEC_406"],
    "SC-BZA": ["SEC_401", "SEC_403"],
}

STATION_MAPPING = {
    "NDLS": "SEC_101",
    "GZB": "SEC_101",
    "ALJN": "SEC_103",
    "TDL": "SEC_105",
    "ETW": "SEC_107",
    "CNB": "SEC_107",
    "MMCT": "SEC_201",
    "BVI": "SEC_201",
    "ST": "SEC_202",
    "BRC": "SEC_203",
    "ADI": "SEC_204",
    "HWH": "SEC_301",
    "BWN": "SEC_302",
    "ASN": "SEC_303",
    "DHN": "SEC_303",
    "GAYA": "SEC_304",
    "DDU": "SEC_305",
    "MAS": "SEC_401",
    "AJJ": "SEC_401",
    "KPD": "SEC_402",
    "JTJ": "SEC_403",
    "SBC": "SEC_404",
}

SECTION_GEO = {
    "SEC_101": {"name": "GZB - ALJN (UP Line)", "lat": 28.25, "lng": 77.78, "corridor": "NDLS_CNB"},
    "SEC_102": {"name": "ALJN - GZB (DN Line)", "lat": 28.25, "lng": 77.78, "corridor": "NDLS_CNB"},
    "SEC_103": {"name": "ALJN - TDL (UP Line)", "lat": 27.55, "lng": 78.16, "corridor": "NDLS_CNB"},
    "SEC_104": {"name": "TDL - ALJN (DN Line)", "lat": 27.55, "lng": 78.16, "corridor": "NDLS_CNB"},
    "SEC_105": {"name": "TDL - ETW (UP Line)", "lat": 26.98, "lng": 78.65, "corridor": "NDLS_CNB"},
    "SEC_106": {"name": "ETW - TDL (DN Line)", "lat": 26.98, "lng": 78.65, "corridor": "NDLS_CNB"},
    "SEC_107": {"name": "ETW - CNB (UP Line)", "lat": 26.61, "lng": 79.68, "corridor": "NDLS_CNB"},
    "SEC_108": {"name": "CNB - ETW (DN Line)", "lat": 26.61, "lng": 79.68, "corridor": "NDLS_CNB"},
    "SEC_201": {"name": "MMCT - BVI (UP Line)", "lat": 19.10, "lng": 72.84, "corridor": "MMCT_ADI"},
    "SEC_202": {"name": "BVI - ST (UP Line)", "lat": 20.25, "lng": 72.85, "corridor": "MMCT_ADI"},
    "SEC_203": {"name": "ST - BRC (UP Line)", "lat": 21.75, "lng": 73.01, "corridor": "MMCT_ADI"},
    "SEC_204": {"name": "BRC - ADI (UP Line)", "lat": 22.65, "lng": 72.88, "corridor": "MMCT_ADI"},
    "SEC_301": {"name": "HWH - BWN (UP)", "lat": 22.90, "lng": 88.10, "corridor": "HWH_DDU"},
    "SEC_302": {"name": "BWN - ASN (UP)", "lat": 23.45, "lng": 87.41, "corridor": "HWH_DDU"},
    "SEC_303": {"name": "ASN - DHN (UP)", "lat": 23.74, "lng": 86.70, "corridor": "HWH_DDU"},
    "SEC_304": {"name": "DHN - GAYA (UP)", "lat": 24.30, "lng": 85.70, "corridor": "HWH_DDU"},
    "SEC_305": {"name": "GAYA - DDU (UP)", "lat": 25.03, "lng": 84.06, "corridor": "HWH_DDU"},
    "SEC_401": {"name": "MAS - AJJ (UP)", "lat": 13.08, "lng": 79.95, "corridor": "MAS_SBC"},
    "SEC_402": {"name": "AJJ - KPD (UP)", "lat": 13.03, "lng": 79.40, "corridor": "MAS_SBC"},
    "SEC_403": {"name": "KPD - JTJ (UP)", "lat": 12.77, "lng": 78.85, "corridor": "MAS_SBC"},
    "SEC_404": {"name": "JTJ - BWT (UP)", "lat": 12.78, "lng": 78.38, "corridor": "MAS_SBC"},
    "SEC_405": {"name": "BWT - WFD (UP)", "lat": 12.98, "lng": 77.97, "corridor": "MAS_SBC"},
    "SEC_406": {"name": "WFD - SBC (UP)", "lat": 12.98, "lng": 77.67, "corridor": "MAS_SBC"},
}

def get_db_connection():
    return psycopg2.connect(**DB_CONFIG)

def calculate_file_hash(filepath: str) -> str:
    hasher = hashlib.sha256()
    with open(filepath, "rb") as f:
        while chunk := f.read(65536):
            hasher.update(chunk)
    return hasher.hexdigest()

def sync_sql_file_to_postgres() -> Dict[str, Any]:
    global _last_sync_time, _last_file_hash, _last_file_mtime
    
    if not os.path.exists(SQL_FILE_PATH):
        return {"success": False, "error": f"SQL file not found at {SQL_FILE_PATH}"}

    with _db_lock:
        try:
            with open(SQL_FILE_PATH, "r", encoding="utf-8") as f:
                sql_content = f.read()

            conn = get_db_connection()
            conn.autocommit = True
            with conn.cursor() as cur:
                cur.execute(sql_content)
            conn.close()

            _last_file_mtime = os.path.getmtime(SQL_FILE_PATH)
            _last_file_hash = calculate_file_hash(SQL_FILE_PATH)
            _last_sync_time = datetime.now().isoformat()
            
            # Refresh cached tasks
            _refresh_task_cache()

            return {
                "success": True,
                "message": "Database successfully synced from rail_maintenance_data.sql",
                "synced_at": _last_sync_time,
                "file_hash": _last_file_hash[:12],
                "task_count": len(_cached_tasks)
            }
        except Exception as e:
            return {"success": False, "error": str(e)}

def check_and_auto_sync() -> bool:
    global _last_file_mtime, _last_file_hash
    if not os.path.exists(SQL_FILE_PATH):
        return False
    
    current_mtime = os.path.getmtime(SQL_FILE_PATH)
    if current_mtime != _last_file_mtime:
        current_hash = calculate_file_hash(SQL_FILE_PATH)
        if current_hash != _last_file_hash:
            res = sync_sql_file_to_postgres()
            return res.get("success", False)
    return False

def _watcher_loop():
    while _watcher_running:
        try:
            check_and_auto_sync()
        except Exception:
            pass
        time.sleep(2.0)

def start_sql_watcher():
    global _watcher_running
    if not _watcher_running:
        _watcher_running = True
        thread = threading.Thread(target=_watcher_loop, daemon=True)
        thread.start()

def get_database_status() -> Dict[str, Any]:
    # Check for recent file changes
    check_and_auto_sync()
    
    status = {
        "connected": False,
        "database": DB_CONFIG["dbname"],
        "host": f"{DB_CONFIG['host']}:{DB_CONFIG['port']}",
        "sql_file": os.path.basename(SQL_FILE_PATH),
        "last_synced_at": _last_sync_time,
        "table_counts": {},
        "total_tasks": len(_cached_tasks)
    }

    try:
        conn = get_db_connection()
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("""
                SELECT 'control_room_master' as tbl, count(*) as cnt FROM control_room_master
                UNION ALL
                SELECT 'tms_track_assets' as tbl, count(*) as cnt FROM tms_track_assets
                UNION ALL
                SELECT 'tdms_power_assets' as tbl, count(*) as cnt FROM tdms_power_assets
                UNION ALL
                SELECT 'smms_signal_assets' as tbl, count(*) as cnt FROM smms_signal_assets;
            """)
            counts = {row["tbl"]: row["cnt"] for row in cur.fetchall()}
            status["table_counts"] = counts
            status["connected"] = True
        conn.close()
    except Exception as e:
        status["connected"] = False
        status["error"] = str(e)

    return status

def _refresh_task_cache():
    global _cached_tasks
    try:
        conn = get_db_connection()
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("""
                SELECT 
                    c.sl_no,
                    c.job_id,
                    c.department,
                    c.work_category,
                    c.required_duration_mins,
                    c.department_specific_details,
                    c.priority,
                    c.blockchain_tx_hash,
                    c.created_at
                FROM control_room_master c
                ORDER BY c.sl_no ASC;
            """)
            rows = cur.fetchall()
        conn.close()

        tasks = []
        for idx, r in enumerate(rows):
            dept_code = r["department"] # TMS, TDMS, SMMS
            dept_map = {"TMS": "ENG", "TDMS": "TRD", "SMMS": "S&T"}
            frontend_dept = dept_map.get(dept_code, "ENG")
            
            block_type_map = {"TMS": "TRAFFIC", "TDMS": "POWER", "SMMS": "DISCONNECTION"}
            block_type = block_type_map.get(dept_code, "TRAFFIC")

            details = r["department_specific_details"] or {}
            
            # Map section ID
            section_id = "SEC_101"
            line_sec = details.get("line_section")
            stn_code = details.get("station_code")
            
            if stn_code and stn_code in STATION_MAPPING:
                section_id = STATION_MAPPING[stn_code]
            elif line_sec and line_sec in SECTION_MAPPING:
                sec_opts = SECTION_MAPPING[line_sec]
                section_id = sec_opts[idx % len(sec_opts)]
            else:
                default_sections = ["SEC_101", "SEC_102", "SEC_103", "SEC_104", "SEC_105", "SEC_106", "SEC_107", "SEC_108"]
                section_id = default_sections[idx % len(default_sections)]

            sec_info = SECTION_GEO.get(section_id, {"name": section_id, "lat": 27.5, "lng": 78.5, "corridor": "NDLS_CNB"})

            # Calculate reasonable requested time windows across the 24h horizon
            dur = r["required_duration_mins"] or 120
            # Stagger base start times with deliberate realistic congestion for optimizer
            base_slots = [60, 180, 360, 480, 600, 720, 840, 960, 1080, 1200]
            req_start = base_slots[idx % len(base_slots)] + (idx * 7) % 60
            req_end = req_start + dur

            # Determine severity based on duration and priority
            p_val = r["priority"] or 0
            severity = 3
            if p_val >= 2 or dur >= 180:
                severity = 5
            elif p_val == 1 or dur >= 120:
                severity = 4
            else:
                severity = 3

            tasks.append({
                "id": r["job_id"],
                "department": frontend_dept,
                "raw_dept": dept_code,
                "section_id": section_id,
                "section_name": sec_info["name"],
                "corridor_id": sec_info.get("corridor", "NDLS_CNB"),
                "description": r["work_category"],
                "block_type": block_type,
                "machine_required": details.get("structure_type") or ("Tower Wagon" if dept_code == "TDMS" else "Maintenance Gang"),
                "duration_mins": dur,
                "severity": severity,
                "requested_start": req_start,
                "requested_end": req_end,
                "optimized_start_mins": req_start,
                "optimized_end_mins": req_end,
                "optimized_start_hhmm": f"{(req_start // 60) % 24:02d}:{req_start % 60:02d}",
                "optimized_end_hhmm": f"{(req_end // 60) % 24:02d}:{req_end % 60:02d}",
                "lat": sec_info["lat"] + ((idx % 5) - 2) * 0.04,
                "lng": sec_info["lng"] + ((idx % 5) - 2) * 0.04,
                "blockchain_tx_hash": r["blockchain_tx_hash"],
                "tdms_collab_req": details.get("tdms_collab_req", False),
                "smms_collab_req": details.get("smms_collab_req", False),
                "tms_collab_req": details.get("tms_collab_req", False),
                "details": details
            })

        _cached_tasks = tasks
    except Exception as e:
        print(f"[Database] Error refreshing task cache: {e}")

def get_live_tasks(corridor_id: Optional[str] = None) -> List[Dict[str, Any]]:
    check_and_auto_sync()
    if not _cached_tasks:
        _refresh_task_cache()
    
    if corridor_id:
        filtered = [t for t in _cached_tasks if t.get("corridor_id") == corridor_id]
        if filtered:
            return filtered
    return _cached_tasks

# --- Department-Specific Queries & RBAC ---

def authenticate_user(department: str, username: str, password: str) -> Optional[Dict[str, Any]]:
    """Authenticates a user against the PostgreSQL users table with department enforcement."""
    try:
        conn = get_db_connection()
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("""
                SELECT user_sl, user_id, username, role, email 
                FROM users 
                WHERE role = %s AND username = %s AND password_hash = %s;
            """, (department.upper(), username.strip(), password.strip()))
            user = cur.fetchone()
        conn.close()
        if user:
            return {
                "id": user["user_id"],
                "username": user["username"],
                "role": user["role"],
                "department": user["role"],
                "email": user["email"]
            }
    except Exception as e:
        print(f"[Database] Auth error: {e}")
    return None

def get_department_jobs(dept: str) -> List[Dict[str, Any]]:
    """Fetches jobs strictly scoped to the specified department."""
    dept_upper = dept.upper()
    try:
        conn = get_db_connection()
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            if dept_upper == "TMS":
                cur.execute("SELECT * FROM tms_track_assets ORDER BY sl_no DESC;")
            elif dept_upper == "TDMS":
                cur.execute("SELECT * FROM tdms_power_assets ORDER BY sl_no DESC;")
            elif dept_upper == "SMMS":
                cur.execute("SELECT * FROM smms_signal_assets ORDER BY sl_no DESC;")
            elif dept_upper in ("CONTROL_ROOM", "COA"):
                cur.execute("SELECT * FROM control_room_master ORDER BY sl_no DESC;")
            else:
                conn.close()
                return []
            rows = cur.fetchall()
        conn.close()
        return [dict(r) for r in rows]
    except Exception as e:
        print(f"[Database] Error fetching {dept} jobs: {e}")
        return []

def create_department_job(dept: str, data: Dict[str, Any]) -> Dict[str, Any]:
    """Creates a new department job. PostgreSQL triggers automatically sync it to control_room_master."""
    dept_upper = dept.upper()
    try:
        conn = get_db_connection()
        conn.autocommit = True
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            if dept_upper == "TMS":
                job_id = data.get("track_job_id") or f"JOB-TMS-{int(time.time()) % 100000:05d}"
                cur.execute("""
                    INSERT INTO tms_track_assets 
                    (track_job_id, line_section, line_direction, start_km, end_km, structure_type, work_category, tdms_collab_req, smms_collab_req, required_duration_mins, reported_by, blockchain_tx_hash)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    RETURNING *;
                """, (
                    job_id,
                    data.get("line_section", "HWH-DEL"),
                    data.get("line_direction", "UP"),
                    float(data.get("start_km", 100.0)),
                    float(data.get("end_km", 101.0)),
                    data.get("structure_type", "Main Line Track"),
                    data.get("work_category", "Track Maintenance"),
                    bool(data.get("tdms_collab_req", False)),
                    bool(data.get("smms_collab_req", False)),
                    int(data.get("required_duration_mins", 120)),
                    data.get("reported_by", "Field Engineer"),
                    data.get("blockchain_tx_hash") or f"0x{hashlib.sha256(job_id.encode()).hexdigest()}"
                ))
                new_row = cur.fetchone()

            elif dept_upper == "TDMS":
                job_id = data.get("power_job_id") or f"JOB-OHE-{int(time.time()) % 100000:05d}"
                cur.execute("""
                    INSERT INTO tdms_power_assets 
                    (power_job_id, line_section, line_direction, source_mast_no, target_mast_no, power_isolation_needed, work_category, tms_collab_req, smms_collab_req, required_duration_mins, reported_by, blockchain_tx_hash)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    RETURNING *;
                """, (
                    job_id,
                    data.get("line_section", "HWH-DEL"),
                    data.get("line_direction", "UP"),
                    data.get("source_mast_no", "100/10"),
                    data.get("target_mast_no", "100/20"),
                    bool(data.get("power_isolation_needed", True)),
                    data.get("work_category", "OHE Maintenance"),
                    bool(data.get("tms_collab_req", False)),
                    bool(data.get("smms_collab_req", False)),
                    int(data.get("required_duration_mins", 120)),
                    data.get("reported_by", "TRD Controller"),
                    data.get("blockchain_tx_hash") or f"0x{hashlib.sha256(job_id.encode()).hexdigest()}"
                ))
                new_row = cur.fetchone()

            elif dept_upper == "SMMS":
                job_id = data.get("signal_job_id") or f"JOB-SIG-{int(time.time()) % 100000:05d}"
                cur.execute("""
                    INSERT INTO smms_signal_assets 
                    (signal_job_id, station_code, point_machine_no, interlocking_panel, work_category, tdms_collab_req, tms_collab_req, required_duration_mins, reported_by, blockchain_tx_hash)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    RETURNING *;
                """, (
                    job_id,
                    data.get("station_code", "NDLS"),
                    data.get("point_machine_no", "PM-101"),
                    data.get("interlocking_panel", "EI-CENTRAL"),
                    data.get("work_category", "Signal Overhaul"),
                    bool(data.get("tdms_collab_req", False)),
                    bool(data.get("tms_collab_req", False)),
                    int(data.get("required_duration_mins", 90)),
                    data.get("reported_by", "S&T Inspector"),
                    data.get("blockchain_tx_hash") or f"0x{hashlib.sha256(job_id.encode()).hexdigest()}"
                ))
                new_row = cur.fetchone()
            else:
                conn.close()
                return {"success": False, "error": f"Invalid department {dept}"}

        conn.close()
        _refresh_task_cache()
        return {"success": True, "job": dict(new_row)}
    except Exception as e:
        return {"success": False, "error": str(e)}

# Initialize cache and start watcher on import
try:
    _refresh_task_cache()
    start_sql_watcher()
except Exception as e:
    print(f"[Database] Initial startup warning: {e}")
