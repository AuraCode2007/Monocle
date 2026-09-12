import os
import re
import json
import time
import hashlib
import threading
import sqlite3
import subprocess
from datetime import datetime
from typing import Dict, Any, List, Optional

try:
    import psycopg2
    from psycopg2.extras import RealDictCursor
    HAS_PSYCOPG2 = True
except ImportError:
    HAS_PSYCOPG2 = False

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SQL_FILE_PATH = os.path.join(BASE_DIR, "rail_maintenance_data.sql")
SQLITE_DB_PATH = os.path.join(BASE_DIR, "railsync.db")

DB_CONFIG = {
    "dbname": os.environ.get("POSTGRES_DB", "railsync"),
    "user": os.environ.get("POSTGRES_USER", "postgres"),
    "password": os.environ.get("POSTGRES_PASSWORD", ""),
    "host": os.environ.get("POSTGRES_HOST", "127.0.0.1"),
    "port": int(os.environ.get("POSTGRES_PORT", "5432")),
    "connect_timeout": 2
}

# State management
_db_lock = threading.Lock()
_last_sync_time: Optional[str] = None
_last_file_hash: Optional[str] = None
_last_file_mtime: float = 0.0
_cached_tasks: List[Dict[str, Any]] = []
_watcher_running = False
_active_backend = "unknown"

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

def _init_sqlite_db(conn: sqlite3.Connection):
    cur = conn.cursor()
    cur.executescript("""
        CREATE TABLE IF NOT EXISTS users (
            user_sl INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            role TEXT NOT NULL,
            email TEXT
        );

        CREATE TABLE IF NOT EXISTS control_room_master (
            sl_no INTEGER PRIMARY KEY AUTOINCREMENT,
            job_id TEXT UNIQUE NOT NULL,
            department TEXT NOT NULL,
            work_category TEXT NOT NULL,
            required_duration_mins INTEGER NOT NULL,
            department_specific_details TEXT NOT NULL,
            priority INTEGER DEFAULT 0,
            blockchain_tx_hash TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS tms_track_assets (
            sl_no INTEGER PRIMARY KEY AUTOINCREMENT,
            track_job_id TEXT UNIQUE NOT NULL,
            line_section TEXT NOT NULL,
            line_direction TEXT NOT NULL,
            start_km REAL NOT NULL,
            end_km REAL NOT NULL,
            structure_type TEXT NOT NULL,
            work_category TEXT NOT NULL,
            tdms_collab_req INTEGER DEFAULT 0,
            smms_collab_req INTEGER DEFAULT 0,
            required_duration_mins INTEGER NOT NULL,
            reported_by TEXT NOT NULL,
            blockchain_tx_hash TEXT
        );

        CREATE TABLE IF NOT EXISTS tdms_power_assets (
            sl_no INTEGER PRIMARY KEY AUTOINCREMENT,
            power_job_id TEXT UNIQUE NOT NULL,
            line_section TEXT NOT NULL,
            line_direction TEXT NOT NULL,
            source_mast_no TEXT NOT NULL,
            target_mast_no TEXT NOT NULL,
            power_isolation_needed INTEGER DEFAULT 0,
            work_category TEXT NOT NULL,
            tms_collab_req INTEGER DEFAULT 0,
            smms_collab_req INTEGER DEFAULT 0,
            required_duration_mins INTEGER NOT NULL,
            reported_by TEXT NOT NULL,
            blockchain_tx_hash TEXT
        );

        CREATE TABLE IF NOT EXISTS smms_signal_assets (
            sl_no INTEGER PRIMARY KEY AUTOINCREMENT,
            signal_job_id TEXT UNIQUE NOT NULL,
            station_code TEXT NOT NULL,
            point_machine_no TEXT NOT NULL,
            interlocking_panel TEXT NOT NULL,
            work_category TEXT NOT NULL,
            tdms_collab_req INTEGER DEFAULT 0,
            tms_collab_req INTEGER DEFAULT 0,
            required_duration_mins INTEGER NOT NULL,
            reported_by TEXT NOT NULL,
            blockchain_tx_hash TEXT
        );
    """)

    # Populate data if empty
    cur.execute("SELECT COUNT(*) FROM control_room_master;")
    if cur.fetchone()[0] == 0 and os.path.exists(SQL_FILE_PATH):
        with open(SQL_FILE_PATH, "r", encoding="utf-8") as f:
            sql_text = f.read()

        inserts = re.findall(r"INSERT\s+INTO\s+.*?;", sql_text, re.DOTALL | re.IGNORECASE)
        for stmt in inserts:
            cleaned_stmt = re.sub(r"\btrue\b", "1", stmt, flags=re.IGNORECASE)
            cleaned_stmt = re.sub(r"\bfalse\b", "0", cleaned_stmt, flags=re.IGNORECASE)
            try:
                cur.execute(cleaned_stmt)
            except Exception:
                pass

        # Sync departmental tables to control_room_master
        cur.execute("SELECT * FROM tms_track_assets;")
        for r in cur.fetchall():
            r_dict = dict(r)
            details = json.dumps({
                "line_section": r_dict["line_section"],
                "line_direction": r_dict["line_direction"],
                "start_km": r_dict["start_km"],
                "end_km": r_dict["end_km"],
                "structure_type": r_dict["structure_type"],
                "tdms_collab_req": bool(r_dict["tdms_collab_req"]),
                "smms_collab_req": bool(r_dict["smms_collab_req"])
            })
            cur.execute("""
                INSERT OR REPLACE INTO control_room_master 
                (job_id, department, work_category, required_duration_mins, department_specific_details, blockchain_tx_hash)
                VALUES (?, 'TMS', ?, ?, ?, ?)
            """, (r_dict["track_job_id"], r_dict["work_category"], r_dict["required_duration_mins"], details, r_dict["blockchain_tx_hash"]))

        cur.execute("SELECT * FROM tdms_power_assets;")
        for r in cur.fetchall():
            r_dict = dict(r)
            details = json.dumps({
                "line_section": r_dict["line_section"],
                "line_direction": r_dict["line_direction"],
                "source_mast_no": r_dict["source_mast_no"],
                "target_mast_no": r_dict["target_mast_no"],
                "power_isolation_needed": bool(r_dict["power_isolation_needed"]),
                "tms_collab_req": bool(r_dict["tms_collab_req"]),
                "smms_collab_req": bool(r_dict["smms_collab_req"])
            })
            cur.execute("""
                INSERT OR REPLACE INTO control_room_master 
                (job_id, department, work_category, required_duration_mins, department_specific_details, blockchain_tx_hash)
                VALUES (?, 'TDMS', ?, ?, ?, ?)
            """, (r_dict["power_job_id"], r_dict["work_category"], r_dict["required_duration_mins"], details, r_dict["blockchain_tx_hash"]))

        cur.execute("SELECT * FROM smms_signal_assets;")
        for r in cur.fetchall():
            r_dict = dict(r)
            details = json.dumps({
                "station_code": r_dict["station_code"],
                "point_machine_no": r_dict["point_machine_no"],
                "interlocking_panel": r_dict["interlocking_panel"],
                "tdms_collab_req": bool(r_dict["tdms_collab_req"]),
                "tms_collab_req": bool(r_dict["tms_collab_req"])
            })
            cur.execute("""
                INSERT OR REPLACE INTO control_room_master 
                (job_id, department, work_category, required_duration_mins, department_specific_details, blockchain_tx_hash)
                VALUES (?, 'SMMS', ?, ?, ?, ?)
            """, (r_dict["signal_job_id"], r_dict["work_category"], r_dict["required_duration_mins"], details, r_dict["blockchain_tx_hash"]))

        conn.commit()

def get_db_connection():
    """Returns a tuple of (backend_type, connection). Dynamically falls back to SQLite if PostgreSQL is offline."""
    global _active_backend
    if HAS_PSYCOPG2:
        try:
            conn = psycopg2.connect(**DB_CONFIG)
            _active_backend = "postgres"
            return "postgres", conn
        except Exception:
            pass

    # SQLite fallback
    conn = sqlite3.connect(SQLITE_DB_PATH)
    conn.row_factory = sqlite3.Row
    _init_sqlite_db(conn)
    _active_backend = "sqlite"
    return "sqlite", conn

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
            backend, conn = get_db_connection()
            if backend == "postgres":
                with open(SQL_FILE_PATH, "r", encoding="utf-8") as f:
                    sql_content = f.read()
                conn.autocommit = True
                with conn.cursor() as cur:
                    cur.execute(sql_content)
                conn.close()
            else:
                # Force re-sync of SQLite from rail_maintenance_data.sql
                cur = conn.cursor()
                cur.execute("DELETE FROM control_room_master;")
                cur.execute("DELETE FROM tms_track_assets;")
                cur.execute("DELETE FROM tdms_power_assets;")
                cur.execute("DELETE FROM smms_signal_assets;")
                cur.execute("DELETE FROM users;")
                conn.commit()
                _init_sqlite_db(conn)
                conn.close()

            _last_file_mtime = os.path.getmtime(SQL_FILE_PATH)
            _last_file_hash = calculate_file_hash(SQL_FILE_PATH)
            _last_sync_time = datetime.now().isoformat()
            
            # Refresh cached tasks
            _refresh_task_cache()

            return {
                "success": True,
                "message": f"Database successfully synced from rail_maintenance_data.sql ({backend.upper()})",
                "backend": backend,
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
    check_and_auto_sync()
    
    backend, conn = get_db_connection()
    db_name = DB_CONFIG["dbname"] if backend == "postgres" else "railsync.db (SQLite)"
    host_str = f"{DB_CONFIG['host']}:{DB_CONFIG['port']}" if backend == "postgres" else "Local File"

    status = {
        "connected": True,
        "backend": backend,
        "database": db_name,
        "host": host_str,
        "sql_file": os.path.basename(SQL_FILE_PATH),
        "last_synced_at": _last_sync_time,
        "table_counts": {},
        "total_tasks": len(_cached_tasks)
    }

    try:
        if backend == "postgres":
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
            conn.close()
        else:
            cur = conn.cursor()
            counts = {}
            for tbl in ['control_room_master', 'tms_track_assets', 'tdms_power_assets', 'smms_signal_assets']:
                cur.execute(f"SELECT count(*) FROM {tbl};")
                counts[tbl] = cur.fetchone()[0]
            status["table_counts"] = counts
            conn.close()
    except Exception as e:
        status["connected"] = False
        status["error"] = str(e)

    return status

def _refresh_task_cache():
    global _cached_tasks
    try:
        backend, conn = get_db_connection()
        if backend == "postgres":
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
                rows = [dict(r) for r in cur.fetchall()]
            conn.close()
        else:
            cur = conn.cursor()
            cur.execute("""
                SELECT 
                    sl_no,
                    job_id,
                    department,
                    work_category,
                    required_duration_mins,
                    department_specific_details,
                    priority,
                    blockchain_tx_hash,
                    created_at
                FROM control_room_master
                ORDER BY sl_no ASC;
            """)
            rows = [dict(r) for r in cur.fetchall()]
            conn.close()

        tasks = []
        for idx, r in enumerate(rows):
            dept_code = r["department"] # TMS, TDMS, SMMS
            dept_map = {"TMS": "ENG", "TDMS": "TRD", "SMMS": "S&T"}
            frontend_dept = dept_map.get(dept_code, "ENG")
            
            block_type_map = {"TMS": "TRAFFIC", "TDMS": "POWER", "SMMS": "DISCONNECTION"}
            block_type = block_type_map.get(dept_code, "TRAFFIC")

            details_raw = r["department_specific_details"]
            if isinstance(details_raw, str):
                try:
                    details = json.loads(details_raw)
                except Exception:
                    details = {}
            else:
                details = details_raw or {}
            
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

            dur = r["required_duration_mins"] or 120
            base_slots = [60, 180, 360, 480, 600, 720, 840, 960, 1080, 1200]
            req_start = base_slots[idx % len(base_slots)] + (idx * 7) % 60
            req_end = req_start + dur

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
    """Authenticates a user against the users table with department enforcement."""
    try:
        backend, conn = get_db_connection()
        if backend == "postgres":
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute("""
                    SELECT user_sl, user_id, username, role, email 
                    FROM users 
                    WHERE role = %s AND username = %s AND password_hash = %s;
                """, (department.upper(), username.strip(), password.strip()))
                user = cur.fetchone()
            conn.close()
        else:
            cur = conn.cursor()
            cur.execute("""
                SELECT user_sl, user_id, username, role, email 
                FROM users 
                WHERE role = ? AND username = ? AND password_hash = ?;
            """, (department.upper(), username.strip(), password.strip()))
            row = cur.fetchone()
            conn.close()
            user = dict(row) if row else None

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
        backend, conn = get_db_connection()
        tbl_map = {
            "TMS": "tms_track_assets",
            "TDMS": "tdms_power_assets",
            "SMMS": "smms_signal_assets",
            "CONTROL_ROOM": "control_room_master",
            "COA": "control_room_master"
        }
        tbl = tbl_map.get(dept_upper)
        if not tbl:
            conn.close()
            return []

        if backend == "postgres":
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute(f"SELECT * FROM {tbl} ORDER BY sl_no DESC;")
                rows = [dict(r) for r in cur.fetchall()]
            conn.close()
        else:
            cur = conn.cursor()
            cur.execute(f"SELECT * FROM {tbl} ORDER BY sl_no DESC;")
            rows = [dict(r) for r in cur.fetchall()]
            conn.close()
        return rows
    except Exception as e:
        print(f"[Database] Error fetching {dept} jobs: {e}")
        return []

def create_department_job(dept: str, data: Dict[str, Any]) -> Dict[str, Any]:
    """Creates a new department job and syncs to control_room_master."""
    dept_upper = dept.upper()
    try:
        backend, conn = get_db_connection()
        param_char = "%s" if backend == "postgres" else "?"
        
        if backend == "postgres":
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
                    new_row = dict(cur.fetchone())

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
                    new_row = dict(cur.fetchone())

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
                    new_row = dict(cur.fetchone())
                else:
                    conn.close()
                    return {"success": False, "error": f"Invalid department {dept}"}
            conn.close()
        else: # SQLite
            cur = conn.cursor()
            if dept_upper == "TMS":
                job_id = data.get("track_job_id") or f"JOB-TMS-{int(time.time()) % 100000:05d}"
                tx_hash = data.get("blockchain_tx_hash") or f"0x{hashlib.sha256(job_id.encode()).hexdigest()}"
                cur.execute("""
                    INSERT INTO tms_track_assets 
                    (track_job_id, line_section, line_direction, start_km, end_km, structure_type, work_category, tdms_collab_req, smms_collab_req, required_duration_mins, reported_by, blockchain_tx_hash)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
                """, (
                    job_id,
                    data.get("line_section", "HWH-DEL"),
                    data.get("line_direction", "UP"),
                    float(data.get("start_km", 100.0)),
                    float(data.get("end_km", 101.0)),
                    data.get("structure_type", "Main Line Track"),
                    data.get("work_category", "Track Maintenance"),
                    1 if data.get("tdms_collab_req") else 0,
                    1 if data.get("smms_collab_req") else 0,
                    int(data.get("required_duration_mins", 120)),
                    data.get("reported_by", "Field Engineer"),
                    tx_hash
                ))
                details = json.dumps({
                    "line_section": data.get("line_section", "HWH-DEL"),
                    "line_direction": data.get("line_direction", "UP"),
                    "start_km": float(data.get("start_km", 100.0)),
                    "end_km": float(data.get("end_km", 101.0)),
                    "structure_type": data.get("structure_type", "Main Line Track"),
                    "tdms_collab_req": bool(data.get("tdms_collab_req")),
                    "smms_collab_req": bool(data.get("smms_collab_req"))
                })
                cur.execute("""
                    INSERT OR REPLACE INTO control_room_master 
                    (job_id, department, work_category, required_duration_mins, department_specific_details, blockchain_tx_hash)
                    VALUES (?, 'TMS', ?, ?, ?, ?);
                """, (job_id, data.get("work_category", "Track Maintenance"), int(data.get("required_duration_mins", 120)), details, tx_hash))

            elif dept_upper == "TDMS":
                job_id = data.get("power_job_id") or f"JOB-OHE-{int(time.time()) % 100000:05d}"
                tx_hash = data.get("blockchain_tx_hash") or f"0x{hashlib.sha256(job_id.encode()).hexdigest()}"
                cur.execute("""
                    INSERT INTO tdms_power_assets 
                    (power_job_id, line_section, line_direction, source_mast_no, target_mast_no, power_isolation_needed, work_category, tms_collab_req, smms_collab_req, required_duration_mins, reported_by, blockchain_tx_hash)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
                """, (
                    job_id,
                    data.get("line_section", "HWH-DEL"),
                    data.get("line_direction", "UP"),
                    data.get("source_mast_no", "100/10"),
                    data.get("target_mast_no", "100/20"),
                    1 if data.get("power_isolation_needed", True) else 0,
                    data.get("work_category", "OHE Maintenance"),
                    1 if data.get("tms_collab_req") else 0,
                    1 if data.get("smms_collab_req") else 0,
                    int(data.get("required_duration_mins", 120)),
                    data.get("reported_by", "TRD Controller"),
                    tx_hash
                ))
                details = json.dumps({
                    "line_section": data.get("line_section", "HWH-DEL"),
                    "line_direction": data.get("line_direction", "UP"),
                    "source_mast_no": data.get("source_mast_no", "100/10"),
                    "target_mast_no": data.get("target_mast_no", "100/20"),
                    "power_isolation_needed": bool(data.get("power_isolation_needed", True)),
                    "tms_collab_req": bool(data.get("tms_collab_req")),
                    "smms_collab_req": bool(data.get("smms_collab_req"))
                })
                cur.execute("""
                    INSERT OR REPLACE INTO control_room_master 
                    (job_id, department, work_category, required_duration_mins, department_specific_details, blockchain_tx_hash)
                    VALUES (?, 'TDMS', ?, ?, ?, ?);
                """, (job_id, data.get("work_category", "OHE Maintenance"), int(data.get("required_duration_mins", 120)), details, tx_hash))

            elif dept_upper == "SMMS":
                job_id = data.get("signal_job_id") or f"JOB-SIG-{int(time.time()) % 100000:05d}"
                tx_hash = data.get("blockchain_tx_hash") or f"0x{hashlib.sha256(job_id.encode()).hexdigest()}"
                cur.execute("""
                    INSERT INTO smms_signal_assets 
                    (signal_job_id, station_code, point_machine_no, interlocking_panel, work_category, tdms_collab_req, tms_collab_req, required_duration_mins, reported_by, blockchain_tx_hash)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
                """, (
                    job_id,
                    data.get("station_code", "NDLS"),
                    data.get("point_machine_no", "PM-101"),
                    data.get("interlocking_panel", "EI-CENTRAL"),
                    data.get("work_category", "Signal Overhaul"),
                    1 if data.get("tdms_collab_req") else 0,
                    1 if data.get("tms_collab_req") else 0,
                    int(data.get("required_duration_mins", 90)),
                    data.get("reported_by", "S&T Inspector"),
                    tx_hash
                ))
                details = json.dumps({
                    "station_code": data.get("station_code", "NDLS"),
                    "point_machine_no": data.get("point_machine_no", "PM-101"),
                    "interlocking_panel": data.get("interlocking_panel", "EI-CENTRAL"),
                    "tdms_collab_req": bool(data.get("tdms_collab_req")),
                    "tms_collab_req": bool(data.get("tms_collab_req"))
                })
                cur.execute("""
                    INSERT OR REPLACE INTO control_room_master 
                    (job_id, department, work_category, required_duration_mins, department_specific_details, blockchain_tx_hash)
                    VALUES (?, 'SMMS', ?, ?, ?, ?);
                """, (job_id, data.get("work_category", "Signal Overhaul"), int(data.get("required_duration_mins", 90)), details, tx_hash))
            else:
                conn.close()
                return {"success": False, "error": f"Invalid department {dept}"}

            conn.commit()
            conn.close()
            new_row = {"job_id": job_id, "department": dept_upper}

        _refresh_task_cache()
        return {"success": True, "job": new_row}
    except Exception as e:
        return {"success": False, "error": str(e)}

# Initialize cache and start watcher on import
try:
    _refresh_task_cache()
    start_sql_watcher()
except Exception as e:
    print(f"[Database] Initial startup warning: {e}")
