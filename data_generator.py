import random
from typing import Dict, Any

def generate_railway_data(seed: int = 42) -> Dict[str, Any]:
    random.seed(seed)
    
    sections = [
        {'id': 'SEC_101', 'name': 'Ghaziabad (GZB) - Aligarh (ALJN) UP', 'line': 'UP', 'length_km': 105, 'max_speed_kmh': 130},
        {'id': 'SEC_102', 'name': 'Aligarh (ALJN) - Ghaziabad (GZB) DN', 'line': 'DN', 'length_km': 105, 'max_speed_kmh': 130},
        {'id': 'SEC_103', 'name': 'Aligarh (ALJN) - Tundla (TDL) UP', 'line': 'UP', 'length_km': 78, 'max_speed_kmh': 130},
        {'id': 'SEC_104', 'name': 'Tundla (TDL) - Aligarh (ALJN) DN', 'line': 'DN', 'length_km': 78, 'max_speed_kmh': 130},
        {'id': 'SEC_105', 'name': 'Tundla (TDL) - Etawah (ETW) UP', 'line': 'UP', 'length_km': 92, 'max_speed_kmh': 130},
        {'id': 'SEC_106', 'name': 'Etawah (ETW) - Tundla (TDL) DN', 'line': 'DN', 'length_km': 92, 'max_speed_kmh': 130},
        {'id': 'SEC_107', 'name': 'Etawah (ETW) - Kanpur (CNB) UP', 'line': 'UP', 'length_km': 139, 'max_speed_kmh': 130},
        {'id': 'SEC_108', 'name': 'Kanpur (CNB) - Etawah (ETW) DN', 'line': 'DN', 'length_km': 139, 'max_speed_kmh': 130}
    ]

    train_templates = [
        {'number': '22436', 'name': 'Vande Bharat Express', 'priority': 1, 'type': 'VANDE_BHARAT', 'dir': 'UP', 'base_start': 360, 'speed_factor': 1.0},
        {'number': '22435', 'name': 'Vande Bharat Express', 'priority': 1, 'type': 'VANDE_BHARAT', 'dir': 'DN', 'base_start': 900, 'speed_factor': 1.0},
        {'number': '12302', 'name': 'Howrah Rajdhani', 'priority': 1, 'type': 'RAJDHANI', 'dir': 'DN', 'base_start': 1020, 'speed_factor': 1.05},
        {'number': '12301', 'name': 'Howrah Rajdhani', 'priority': 1, 'type': 'RAJDHANI', 'dir': 'UP', 'base_start': 420, 'speed_factor': 1.05},
        {'number': '12004', 'name': 'Lucknow Shatabdi', 'priority': 1, 'type': 'SHATABDI', 'dir': 'DN', 'base_start': 370, 'speed_factor': 1.1},
        {'number': '12418', 'name': 'Prayagraj Express', 'priority': 2, 'type': 'SUPERFAST', 'dir': 'DN', 'base_start': 1320, 'speed_factor': 1.25},
        {'number': '12417', 'name': 'Prayagraj Express', 'priority': 2, 'type': 'SUPERFAST', 'dir': 'UP', 'base_start': 300, 'speed_factor': 1.25},
        {'number': '12424', 'name': 'Dibrugarh Rajdhani', 'priority': 1, 'type': 'RAJDHANI', 'dir': 'DN', 'base_start': 980, 'speed_factor': 1.05},
        {'number': '14218', 'name': 'Unchahar Express', 'priority': 3, 'type': 'EXPRESS', 'dir': 'DN', 'base_start': 1260, 'speed_factor': 1.4},
        {'number': '04184', 'name': 'Tundla - Kanpur MEMU', 'priority': 3, 'type': 'PASSENGER', 'dir': 'DN', 'base_start': 480, 'speed_factor': 1.6},
        {'number': 'BOXN_UP_1', 'name': 'Coal Rake Freight (UP)', 'priority': 4, 'type': 'FREIGHT', 'dir': 'UP', 'base_start': 120, 'speed_factor': 1.8},
        {'number': 'BCN_DN_1', 'name': 'Foodgrain Goods (DN)', 'priority': 4, 'type': 'FREIGHT', 'dir': 'DN', 'base_start': 720, 'speed_factor': 1.8}
    ]

    trains = []
    up_sections = ['SEC_101', 'SEC_103', 'SEC_105', 'SEC_107']
    dn_sections = ['SEC_102', 'SEC_104', 'SEC_106', 'SEC_108']

    for t in train_templates:
        sec_list = up_sections if t['dir'] == 'UP' else dn_sections
        curr_time = t['base_start']
        section_windows = {}
        
        for sec_id in sec_list:
            sec_meta = next(s for s in sections if s['id'] == sec_id)
            transit_mins = int((sec_meta['length_km'] / sec_meta['max_speed_kmh']) * 60 * t['speed_factor'])
            section_windows[sec_id] = {
                'enter_time': curr_time,
                'exit_time': curr_time + transit_mins
            }
            curr_time += transit_mins + random.randint(3, 8)
            
        trains.append({
            'train_number': t['number'],
            'name': t['name'],
            'priority': t['priority'],
            'type': t['type'],
            'direction': t['dir'],
            'windows': section_windows
        })

    dept_task_types = {
        'ENG': [
            {'desc': 'Deep screening of ballast by BCM', 'duration': 180, 'block_type': 'TRAFFIC', 'severity_range': (3, 5)},
            {'desc': 'Turnout rail renewal and tamping', 'duration': 120, 'block_type': 'TRAFFIC', 'severity_range': (2, 4)},
            {'desc': 'Ultrasonic Flaw Detection (USFD) defect repair', 'duration': 90, 'block_type': 'TRAFFIC', 'severity_range': (4, 5)}
        ],
        'TRD': [
            {'desc': 'OHE contact wire wear replacement', 'duration': 150, 'block_type': 'POWER', 'severity_range': (3, 5)},
            {'desc': 'Insulator washing and bracket adjustment', 'duration': 90, 'block_type': 'POWER', 'severity_range': (1, 3)},
            {'desc': 'Cantilever assembly overhaul', 'duration': 120, 'block_type': 'POWER', 'severity_range': (2, 4)}
        ],
        'S&T': [
            {'desc': 'Point machine overhaul and testing', 'duration': 90, 'block_type': 'DISCONNECTION', 'severity_range': (3, 5)},
            {'desc': 'Digital Axle Counter (DAC) card replacement', 'duration': 60, 'block_type': 'DISCONNECTION', 'severity_range': (2, 4)},
            {'desc': 'Signalling cable meggering and testing', 'duration': 120, 'block_type': 'DISCONNECTION', 'severity_range': (1, 3)}
        ]
    }

    tasks = []
    task_id = 1
    
    for sec in sections:
        num_tasks = random.randint(1, 2)
        depts = random.sample(['ENG', 'TRD', 'S&T'], num_tasks)
        
        for dept in depts:
            template = random.choice(dept_task_types[dept])
            sev = random.randint(template['severity_range'][0], template['severity_range'][1])
            requested_start = random.choice([360, 480, 600, 720, 840, 960, 1080])
            requested_end = requested_start + template['duration']
            
            tasks.append({
                'id': 'TASK_' + str(task_id).zfill(3),
                'department': dept,
                'section_id': sec['id'],
                'section_name': sec['name'],
                'description': template['desc'],
                'block_type': template['block_type'],
                'duration_mins': template['duration'],
                'severity': sev,
                'requested_start': requested_start,
                'requested_end': requested_end,
                'deadline_mins': 1440
            })
            task_id += 1

    return {
        'corridor': 'New Delhi (NDLS) - Kanpur Central (CNB) Quad-Track Section',
        'sections': sections,
        'trains': trains,
        'tasks': tasks
    }
