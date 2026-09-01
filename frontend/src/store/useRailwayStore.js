import { create } from 'zustand';
import confetti from 'canvas-confetti';

const INITIAL_SECTIONS = [
  { id: 'SEC_101', name: 'Ghaziabad (GZB) - Aligarh (ALJN) UP', line: 'UP', length_km: 105, max_speed_kmh: 130 },
  { id: 'SEC_102', name: 'Aligarh (ALJN) - Ghaziabad (GZB) DN', line: 'DN', length_km: 105, max_speed_kmh: 130 },
  { id: 'SEC_103', name: 'Aligarh (ALJN) - Tundla (TDL) UP', line: 'UP', length_km: 78, max_speed_kmh: 130 },
  { id: 'SEC_104', name: 'Tundla (TDL) - Aligarh (ALJN) DN', line: 'DN', length_km: 78, max_speed_kmh: 130 },
  { id: 'SEC_105', name: 'Tundla (TDL) - Etawah (ETW) UP', line: 'UP', length_km: 92, max_speed_kmh: 130 },
  { id: 'SEC_106', name: 'Etawah (ETW) - Tundla (TDL) DN', line: 'DN', length_km: 92, max_speed_kmh: 130 },
  { id: 'SEC_107', name: 'Etawah (ETW) - Kanpur (CNB) UP', line: 'UP', length_km: 139, max_speed_kmh: 130 },
  { id: 'SEC_108', name: 'Kanpur (CNB) - Etawah (ETW) DN', line: 'DN', length_km: 139, max_speed_kmh: 130 },
];

const INITIAL_TRAINS = [
  { number: '22436', name: 'Vande Bharat Express', priority: 1, type: 'VANDE_BHARAT', dir: 'UP', startKm: 0, endKm: 440, startMin: 360, endMin: 560, speedKmh: 130, color: '#10b981' },
  { number: '22435', name: 'Vande Bharat Express', priority: 1, type: 'VANDE_BHARAT', dir: 'DN', startKm: 440, endKm: 0, startMin: 900, endMin: 1100, speedKmh: 130, color: '#10b981' },
  { number: '12302', name: 'Howrah Rajdhani', priority: 1, type: 'RAJDHANI', dir: 'DN', startKm: 440, endKm: 0, startMin: 1020, endMin: 1240, speedKmh: 120, color: '#06b6d4' },
  { number: '12301', name: 'Howrah Rajdhani', priority: 1, type: 'RAJDHANI', dir: 'UP', startKm: 0, endKm: 440, startMin: 420, endMin: 640, speedKmh: 120, color: '#06b6d4' },
  { number: '12004', name: 'Lucknow Shatabdi', priority: 1, type: 'SHATABDI', dir: 'DN', startKm: 440, endKm: 0, startMin: 370, endMin: 600, speedKmh: 115, color: '#3b82f6' },
  { number: '12418', name: 'Prayagraj Express', priority: 2, type: 'SUPERFAST', dir: 'DN', startKm: 440, endKm: 0, startMin: 1320, endMin: 1440, speedKmh: 110, color: '#8b5cf6' },
  { number: '12417', name: 'Prayagraj Express', priority: 2, type: 'SUPERFAST', dir: 'UP', startKm: 0, endKm: 440, startMin: 300, endMin: 540, speedKmh: 110, color: '#8b5cf6' },
  { number: 'BOXN_UP_1', name: 'Coal Rake Freight (UP)', priority: 4, type: 'FREIGHT', dir: 'UP', startKm: 0, endKm: 440, startMin: 120, endMin: 480, speedKmh: 75, color: '#64748b' },
];

const INITIAL_TASKS = [
  {
    id: 'TASK_001',
    department: 'ENG',
    section_id: 'SEC_101',
    section_name: 'GZB - ALJN (UP)',
    description: 'Deep screening of ballast by BCM machine',
    block_type: 'TRAFFIC',
    machine_required: 'Plasser BCM 08-32',
    duration_mins: 180,
    severity: 5,
    requested_start: 360,
    requested_end: 540,
    optimized_start_mins: 60,
    optimized_end_mins: 240,
    optimized_start_hhmm: '01:00',
    optimized_end_hhmm: '04:00',
    window_type: 'NIGHT_LULL_WINDOW',
    status: 'SCHEDULED'
  },
  {
    id: 'TASK_002',
    department: 'TRD',
    section_id: 'SEC_101',
    section_name: 'GZB - ALJN (UP)',
    description: 'OHE contact wire wear replacement (25kV)',
    block_type: 'POWER',
    machine_required: 'OHE Tower Wagon (8-Wheeler)',
    duration_mins: 150,
    severity: 4,
    requested_start: 480,
    requested_end: 630,
    optimized_start_mins: 60,
    optimized_end_mins: 210,
    optimized_start_hhmm: '01:00',
    optimized_end_hhmm: '03:30',
    is_joint: true,
    window_type: 'NIGHT_LULL_WINDOW',
    status: 'SCHEDULED'
  },
  {
    id: 'TASK_003',
    department: 'S&T',
    section_id: 'SEC_103',
    section_name: 'ALJN - TDL (UP)',
    description: 'Point machine overhaul & Electronic Interlocking testing',
    block_type: 'DISCONNECTION',
    machine_required: 'Point Testing Kit',
    duration_mins: 90,
    severity: 4,
    requested_start: 600,
    requested_end: 690,
    optimized_start_mins: 135,
    optimized_end_mins: 225,
    optimized_start_hhmm: '02:15',
    optimized_end_hhmm: '03:45',
    window_type: 'NIGHT_LULL_WINDOW',
    status: 'SCHEDULED'
  },
  {
    id: 'TASK_004',
    department: 'ENG',
    section_id: 'SEC_105',
    section_name: 'TDL - ETW (UP)',
    description: 'Turnout rail renewal & heavy hydraulic tamping',
    block_type: 'TRAFFIC',
    machine_required: 'CSM 09-32 Tamping Unit',
    duration_mins: 120,
    severity: 3,
    requested_start: 840,
    requested_end: 960,
    optimized_start_mins: 30,
    optimized_end_mins: 150,
    optimized_start_hhmm: '00:30',
    optimized_end_hhmm: '02:30',
    window_type: 'NIGHT_LULL_WINDOW',
    status: 'SCHEDULED'
  },
  {
    id: 'TASK_005',
    department: 'TRD',
    section_id: 'SEC_107',
    section_name: 'ETW - CNB (UP)',
    description: 'Cantilever assembly overhaul & bracket adjustment',
    block_type: 'POWER',
    machine_required: 'Ladder Trolley Unit',
    duration_mins: 120,
    severity: 3,
    requested_start: 960,
    requested_end: 1080,
    optimized_start_mins: 180,
    optimized_end_mins: 300,
    optimized_start_hhmm: '03:00',
    optimized_end_hhmm: '05:00',
    window_type: 'NIGHT_LULL_WINDOW',
    status: 'SCHEDULED'
  },
  {
    id: 'TASK_006',
    department: 'S&T',
    section_id: 'SEC_102',
    section_name: 'ALJN - GZB (DN)',
    description: 'Digital Axle Counter (DAC) card replacement',
    block_type: 'DISCONNECTION',
    machine_required: 'DAC Diagnostic Rig',
    duration_mins: 60,
    severity: 2,
    requested_start: 720,
    requested_end: 780,
    optimized_start_mins: 90,
    optimized_end_mins: 150,
    optimized_start_hhmm: '01:30',
    optimized_end_hhmm: '02:30',
    window_type: 'NIGHT_LULL_WINDOW',
    status: 'SCHEDULED'
  },
];

export const useRailwayStore = create((set, get) => ({
  isOptimized: false,
  isSolving: false,
  activeRole: 'SECTION_CONTROLLER',
  activeTab: 'GANTT',
  filterDept: 'ALL',
  isApiConnected: false,
  sections: INITIAL_SECTIONS,
  trains: INITIAL_TRAINS,
  tasks: INITIAL_TASKS,
  issuedPTW: {},
  emergencyActive: false,

  setActiveRole: (role) => set({ activeRole: role }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setFilterDept: (dept) => set({ filterDept: dept }),
  setIsApiConnected: (status) => set({ isApiConnected: status }),

  toggleOptimize: async () => {
    const { isOptimized, isApiConnected } = get();

    if (isOptimized) {
      set({ isOptimized: false });
      return;
    }

    set({ isSolving: true });

    if (isApiConnected) {
      try {
        const res = await fetch('http://127.0.0.1:8000/api/v1/optimize', { method: 'POST' });
        const data = await res.json();
        if (data && data.optimized_results) {
          set({
            tasks: data.optimized_results.scheduled_tasks,
            isOptimized: true,
            isSolving: false,
          });
          confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
          return;
        }
      } catch (err) {
        console.warn('API error, falling back to client solver simulation', err);
      }
    }

    await new Promise((r) => setTimeout(r, 700));

    set({
      isOptimized: true,
      isSolving: false,
    });

    confetti({ particleCount: 90, spread: 75, origin: { y: 0.6 } });
  },

  injectEmergencyDefect: () => {
    const currentTasks = get().tasks;
    const emergencyTask = {
      id: 'EMERGENCY_999',
      department: 'ENG',
      section_id: 'SEC_105',
      section_name: 'TDL - ETW (UP)',
      description: 'CRITICAL: Ultrasonic rail fracture detected at Km 204. Immediate emergency block required.',
      block_type: 'TRAFFIC',
      machine_required: 'Emergency Rail Welding Kit',
      duration_mins: 90,
      severity: 5,
      requested_start: 780,
      requested_end: 870,
      optimized_start_mins: 780,
      optimized_end_mins: 870,
      optimized_start_hhmm: '13:00',
      optimized_end_hhmm: '14:30',
      window_type: 'EMERGENCY_ISOLATION',
      status: 'EMERGENCY_ACTIVE',
    };

    set({
      tasks: [emergencyTask, ...currentTasks],
      emergencyActive: true,
      isOptimized: false,
    });
  },

  resetEmergency: () => {
    set({
      tasks: INITIAL_TASKS,
      emergencyActive: false,
      isOptimized: false,
    });
  },

  issuePTW: (taskId) => {
    const randomPrivateNo = Math.floor(1000 + Math.random() * 9000);
    const timestamp = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    set((state) => ({
      issuedPTW: {
        ...state.issuedPTW,
        [taskId]: { privateNo: randomPrivateNo, timestamp, authorizedBy: state.activeRole },
      },
    }));
  },
}));