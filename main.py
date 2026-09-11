from typing import Optional
from contextlib import asynccontextmanager
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from data_generator import generate_railway_data
from optimizer import solve_block_optimization, evaluate_manual_schedule
import database
import uvicorn

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("[RailSync-AI] Initializing PostgreSQL connection & rail_maintenance_data.sql watcher...")
    database.start_sql_watcher()
    status = database.get_database_status()
    if status.get("connected"):
        print(f"[RailSync-AI] Connected to PostgreSQL '{status['database']}'! Total tasks loaded: {status['total_tasks']}")
    else:
        print(f"[RailSync-AI] Database notice: {status.get('error')}")
    yield

app = FastAPI(
    title='RailSync-AI - Intelligent Block Planning Engine',
    description='Backend API for Automatic Railway Maintenance Block Scheduling with PostgreSQL Integration',
    version='1.1.0',
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

@app.get('/')
def root():
    db_status = database.get_database_status()
    return {
        'system': 'RailSync-AI',
        'ministry': 'Ministry of Railways (Government of India)',
        'status': 'ONLINE',
        'engine': 'Google OR-Tools CP-SAT',
        'database': {
            'connected': db_status.get('connected', False),
            'database': db_status.get('database'),
            'total_tasks': db_status.get('total_tasks', 0),
            'last_synced_at': db_status.get('last_synced_at')
        }
    }

# --- Authentication & Department Scoping Endpoints ---

@app.post('/api/v1/auth/login')
def login_user(payload: dict):
    """Authenticates an official for their chosen department using the PostgreSQL users table."""
    department = payload.get("department", "").upper()
    username = payload.get("username", "")
    password = payload.get("password", "")
    
    user = database.authenticate_user(department, username, password)
    if not user:
        return {"success": False, "error": "Invalid credentials or unauthorized for this department"}, 401
    
    return {
        "success": True,
        "user": user,
        "token": f"mock-jwt-token-{user['role']}-{user['id']}"
    }

@app.get('/api/v1/departments/{dept}/jobs')
def get_dept_jobs(dept: str):
    """Returns maintenance jobs strictly isolated to the specified department."""
    jobs = database.get_department_jobs(dept)
    return {
        "department": dept.upper(),
        "count": len(jobs),
        "jobs": jobs
    }

@app.post('/api/v1/departments/{dept}/jobs')
def create_dept_job(dept: str, payload: dict):
    """Creates a new maintenance demand for the specified department. Automatically syncs to control room master via database triggers."""
    result = database.create_department_job(dept, payload)
    return result

# --- Database & SQL Sync Endpoints ---

@app.get('/api/v1/database/status')
def get_db_status():
    """Returns the live PostgreSQL connection health, table counts, and last sync timestamp."""
    return database.get_database_status()

@app.post('/api/v1/database/sync')
def trigger_db_sync():
    """Forces an immediate re-read and execution of rail_maintenance_data.sql into PostgreSQL."""
    return database.sync_sql_file_to_postgres()

@app.get('/api/v1/tasks')
@app.get('/api/v1/maintenance-jobs')
def get_all_tasks(corridor: Optional[str] = None):
    """Returns all live maintenance block demands loaded from PostgreSQL control_room_master."""
    tasks = database.get_live_tasks(corridor)
    return {
        'count': len(tasks),
        'source': 'postgresql:control_room_master',
        'tasks': tasks,
        'jobs': tasks
    }

# --- Operational & Optimization Endpoints ---

@app.get('/api/v1/corridor')
def get_corridor_data():
    """Fetches corridor infrastructure enriched with live tasks from PostgreSQL."""
    data = generate_railway_data()
    live_tasks = database.get_live_tasks('NDLS_CNB')
    if live_tasks:
        data['tasks'] = live_tasks
    return data

@app.get('/api/v1/baseline')
def get_manual_baseline():
    """Evaluates the manual baseline schedule using real PostgreSQL maintenance tasks."""
    data = generate_railway_data()
    live_tasks = database.get_live_tasks('NDLS_CNB')
    if live_tasks:
        data['tasks'] = live_tasks[:16]
    return evaluate_manual_schedule(data)

@app.post('/api/v1/optimize')
def run_optimization(time_limit: int = Query(default=10, ge=2, le=60)):
    """Runs the CP-SAT optimization engine against real tasks from PostgreSQL."""
    data = generate_railway_data()
    live_tasks = database.get_live_tasks('NDLS_CNB')
    if live_tasks:
        data['tasks'] = live_tasks[:16]
    result = solve_block_optimization(data, time_limit_sec=time_limit)
    return result

@app.post('/api/v1/emergency/solve')
def solve_emergency_response(incident: dict, time_limit: int = Query(default=10, ge=2, le=60)):
    """Dynamically solves an emergency incident on the corridor with live database tasks."""
    data = generate_railway_data()
    live_tasks = database.get_live_tasks('NDLS_CNB')
    if live_tasks:
        data['tasks'] = live_tasks[:16]
    result = solve_block_optimization(data, time_limit_sec=time_limit, incident=incident)
    if result.get('status') != 'OPTIMAL_SCHEDULE_GENERATED':
        return result
    return {
        'status': 'EMERGENCY_RESPONSE_GENERATED',
        'solver_time_sec': result['solver_time_sec'],
        'incident_response': result['optimized_results'].get('emergency_response'),
        'optimized_schedule': result['optimized_results'].get('scheduled_tasks', []),
        'decision_explanations': result['optimized_results'].get('decision_explanations', []),
    }

@app.get('/api/v1/simulation/compare')
def get_simulation_comparison():
    """Provides a comparison between the baseline and AI-optimized schedules with live tasks."""
    data = generate_railway_data()
    live_tasks = database.get_live_tasks('NDLS_CNB')
    if live_tasks:
        data['tasks'] = live_tasks[:16]
    opt_result = solve_block_optimization(data, time_limit_sec=10)
    return {
        'corridor': data['corridor'],
        'sections': data['sections'],
        'trains': data['trains'],
        'manual_schedule': {
            'metrics': opt_result.get('manual_baseline', {}),
            'tasks': data['tasks']
        },
        'ai_optimized_schedule': {
            'metrics': opt_result.get('optimized_results', {}),
            'tasks': opt_result.get('optimized_results', {}).get('scheduled_tasks', [])
        }
    }

if __name__ == '__main__':
    print('Starting RailSync-AI API Server at http://127.0.0.1:8000 ...')
    uvicorn.run('main:app', host='127.0.0.1', port=8000, reload=False)

