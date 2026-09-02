from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from data_generator import generate_railway_data
from optimizer import solve_block_optimization, evaluate_manual_schedule
import uvicorn

app = FastAPI(
    title='RailSync-AI - Intelligent Block Planning Engine',
    description='Backend API for Automatic Railway Maintenance Block Scheduling',
    version='1.0.0'
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
    return {
        'system': 'RailSync-AI',
        'ministry': 'Ministry of Railways (Government of India)',
        'status': 'ONLINE',
        'engine': 'Google OR-Tools CP-SAT'
    }

@app.get('/api/v1/corridor') # Isn't this redundant?
def get_corridor_data():
    return generate_railway_data()
# Fetches the randomly generated railway corridor data.

@app.get('/api/v1/baseline')
def get_manual_baseline():
    data = generate_railway_data() # shouldn't the data here be manually inputted baseline data instead of random?
    return evaluate_manual_schedule(data)
# Evaluates the baseline schedule for conflicts and downtime metrics.

@app.post('/api/v1/optimize')
def run_optimization(time_limit: int = Query(default=10, ge=2, le=60)):
    data = generate_railway_data()
    result = solve_block_optimization(data, time_limit_sec=time_limit)
    return result
# Runs the optimization engine to generate an AI-optimized maintenance block schedule within the specified time limit (in seconds).

@app.get('/api/v1/simulation/compare')
def get_simulation_comparison():
    data = generate_railway_data() # Generates mock railway data for the corridor and stores it.
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
# Provides a comparison between the manually inputted schedule and the AI-optimized schedule, including metrics and task details.

if __name__ == '__main__':
    print('Starting RailSync-AI API Server at http://127.0.0.1:8000 ...')
    uvicorn.run('main:app', host='127.0.0.1', port=8000, reload=False)
