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

@app.get('/api/v1/corridor')
def get_corridor_data():
    return generate_railway_data()

@app.get('/api/v1/baseline')
def get_manual_baseline():
    data = generate_railway_data()
    return evaluate_manual_schedule(data)

@app.post('/api/v1/optimize')
def run_optimization(time_limit: int = Query(default=10, ge=2, le=60)):
    data = generate_railway_data()
    result = solve_block_optimization(data, time_limit_sec=time_limit)
    return result

@app.get('/api/v1/simulation/compare')
def get_simulation_comparison():
    data = generate_railway_data()
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
