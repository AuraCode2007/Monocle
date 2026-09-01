import { create } from 'zustand';
import confetti from 'canvas-confetti';

export const CORRIDORS = {
  NDLS_CNB: {
    id: 'NDLS_CNB',
    zone: 'North Central Railway (NCR)',
    division: 'Prayagraj Division',
    name: 'New Delhi (NDLS) - Kanpur Central (CNB)',
    distance_km: 440,
    speed_kmh: 130,
    stations: [
      { code: 'NDLS', name: 'New Delhi', km: 0, hub: true },
      { code: 'GZB', name: 'Ghaziabad', km: 26, hub: false },
      { code: 'ALJN', name: 'Aligarh Jn', km: 131, hub: true },
      { code: 'TDL', name: 'Tundla Jn', km: 209, hub: true },
      { code: 'ETW', name: 'Etawah Jn', km: 301, hub: false },
      { code: 'CNB', name: 'Kanpur Central', km: 440, hub: true },
    ],
    sections: [
      { id: 'SEC_101', name: 'GZB - ALJN (UP Line)', line: 'UP', length_km: 105 },
      { id: 'SEC_102', name: 'ALJN - GZB (DN Line)', line: 'DN', length_km: 105 },
      { id: 'SEC_103', name: 'ALJN - TDL (UP Line)', line: 'UP', length_km: 78 },
      { id: 'SEC_104', name: 'TDL - ALJN (DN Line)', line: 'DN', length_km: 78 },
      { id: 'SEC_105', name: 'TDL - ETW (UP Line)', line: 'UP', length_km: 92 },
      { id: 'SEC_106', name: 'ETW - TDL (DN Line)', line: 'DN', length_km: 92 },
      { id: 'SEC_107', name: 'ETW - CNB (UP Line)', line: 'UP', length_km: 139 },
      { id: 'SEC_108', name: 'CNB - ETW (DN Line)', line: 'DN', length_km: 139 },
    ],
    trains: [
      { number: '22436', name: 'Vande Bharat Express', priority: 1, type: 'VANDE_BHARAT', dir: 'UP', startKm: 0, endKm: 440, startMin: 360, endMin: 560, color: '#10b981' },
      { number: '22435', name: 'Vande Bharat Express', priority: 1, type: 'VANDE_BHARAT', dir: 'DN', startKm: 440, endKm: 0, startMin: 900, endMin: 1100, color: '#10b981' },
      { number: '12302', name: 'Howrah Rajdhani', priority: 1, type: 'RAJDHANI', dir: 'DN', startKm: 440, endKm: 0, startMin: 1020, endMin: 1240, color: '#06b6d4' },
      { number: '12301', name: 'Howrah Rajdhani', priority: 1, type: 'RAJDHANI', dir: 'UP', startKm: 0, endKm: 440, startMin: 420, endMin: 640, color: '#06b6d4' },
      { number: '12004', name: 'Lucknow Shatabdi', priority: 1, type: 'SHATABDI', dir: 'DN', startKm: 440, endKm: 0, startMin: 370, endMin: 600, color: '#3b82f6' },
      { number: 'BOXN_UP_1', name: 'Coal Rake Freight (UP)', priority: 4, type: 'FREIGHT', dir: 'UP', startKm: 0, endKm: 440, startMin: 120, endMin: 480, color: '#64748b' },
    ],
    tasks: [
      { id: 'TASK_001', department: 'ENG', section_id: 'SEC_101', section_name: 'GZB - ALJN (UP)', description: 'Deep screening of ballast by BCM machine', block_type: 'TRAFFIC', machine_required: 'Plasser BCM 08-32', duration_mins: 180, severity: 5, requested_start: 360, requested_end: 540, optimized_start_mins: 60, optimized_end_mins: 240, optimized_start_hhmm: '01:00', optimized_end_hhmm: '04:00' },
      { id: 'TASK_002', department: 'TRD', section_id: 'SEC_101', section_name: 'GZB - ALJN (UP)', description: 'OHE contact wire wear replacement (25kV)', block_type: 'POWER', machine_required: 'Tower Wagon', duration_mins: 150, severity: 4, requested_start: 480, requested_end: 630, optimized_start_mins: 60, optimized_end_mins: 210, optimized_start_hhmm: '01:00', optimized_end_hhmm: '03:30', is_joint: true },
      { id: 'TASK_003', department: 'S&T', section_id: 'SEC_103', section_name: 'ALJN - TDL (UP)', description: 'Point machine overhaul & testing', block_type: 'DISCONNECTION', machine_required: 'Point Test Kit', duration_mins: 90, severity: 4, requested_start: 600, requested_end: 690, optimized_start_mins: 135, optimized_end_mins: 225, optimized_start_hhmm: '02:15', optimized_end_hhmm: '03:45' },
      { id: 'TASK_004', department: 'ENG', section_id: 'SEC_105', section_name: 'TDL - ETW (UP)', description: 'Turnout rail renewal & tamping', block_type: 'TRAFFIC', machine_required: 'CSM 09-32 Tamping', duration_mins: 120, severity: 3, requested_start: 840, requested_end: 960, optimized_start_mins: 30, optimized_end_mins: 150, optimized_start_hhmm: '00:30', optimized_end_hhmm: '02:30' },
    ]
  },

  MMCT_ADI: {
    id: 'MMCT_ADI',
    zone: 'Western Railway (WR)',
    division: 'Vadodara Division',
    name: 'Mumbai Central (MMCT) - Ahmedabad (ADI)',
    distance_km: 492,
    speed_kmh: 130,
    stations: [
      { code: 'MMCT', name: 'Mumbai Central', km: 0, hub: true },
      { code: 'BVI', name: 'Borivali', km: 30, hub: false },
      { code: 'ST', name: 'Surat', km: 263, hub: true },
      { code: 'BRC', name: 'Vadodara Jn', km: 392, hub: true },
      { code: 'ANND', name: 'Anand Jn', km: 427, hub: false },
      { code: 'ADI', name: 'Ahmedabad Jn', km: 492, hub: true },
    ],
    sections: [
      { id: 'SEC_201', name: 'MMCT - BVI (UP Line)', line: 'UP', length_km: 30 },
      { id: 'SEC_202', name: 'BVI - ST (UP Line)', line: 'UP', length_km: 233 },
      { id: 'SEC_203', name: 'ST - BRC (UP Line)', line: 'UP', length_km: 129 },
      { id: 'SEC_204', name: 'BRC - ADI (UP Line)', line: 'UP', length_km: 100 },
      { id: 'SEC_205', name: 'ADI - BRC (DN Line)', line: 'DN', length_km: 100 },
      { id: 'SEC_206', name: 'BRC - ST (DN Line)', line: 'DN', length_km: 129 },
    ],
    trains: [
      { number: '20901', name: 'Vande Bharat Express', priority: 1, type: 'VANDE_BHARAT', dir: 'UP', startKm: 0, endKm: 492, startMin: 370, endMin: 690, color: '#10b981' },
      { number: '12951', name: 'Mumbai Rajdhani', priority: 1, type: 'RAJDHANI', dir: 'UP', startKm: 0, endKm: 492, startMin: 1020, endMin: 1380, color: '#06b6d4' },
      { number: '82901', name: 'Tejas Express', priority: 1, type: 'SHATABDI', dir: 'UP', startKm: 0, endKm: 492, startMin: 420, endMin: 800, color: '#3b82f6' },
      { number: 'CONTAINER_1', name: 'JNPT Port Container (UP)', priority: 4, type: 'FREIGHT', dir: 'UP', startKm: 0, endKm: 492, startMin: 100, endMin: 500, color: '#64748b' },
    ],
    tasks: [
      { id: 'TASK_WR_01', department: 'ENG', section_id: 'SEC_202', section_name: 'BVI - ST (UP)', description: 'Ultrasonic Flaw Detection (USFD) weld repair', block_type: 'TRAFFIC', machine_required: 'USFD Rig', duration_mins: 150, severity: 5, requested_start: 420, requested_end: 570, optimized_start_mins: 60, optimized_end_mins: 210, optimized_start_hhmm: '01:00', optimized_end_hhmm: '03:30' },
      { id: 'TASK_WR_02', department: 'TRD', section_id: 'SEC_202', section_name: 'BVI - ST (UP)', description: 'OHE insulator washing & neutral section test', block_type: 'POWER', machine_required: 'OHE Washer Wagon', duration_mins: 120, severity: 3, requested_start: 540, requested_end: 660, optimized_start_mins: 60, optimized_end_mins: 180, optimized_start_hhmm: '01:00', optimized_end_hhmm: '03:00', is_joint: true },
      { id: 'TASK_WR_03', department: 'S&T', section_id: 'SEC_203', section_name: 'ST - BRC (UP)', description: 'Electronic Interlocking card replacement', block_type: 'DISCONNECTION', machine_required: 'EI Diagnostic Kit', duration_mins: 90, severity: 4, requested_start: 720, requested_end: 810, optimized_start_mins: 120, optimized_end_mins: 210, optimized_start_hhmm: '02:00', optimized_end_hhmm: '03:30' },
    ]
  },

  HWH_DDU: {
    id: 'HWH_DDU',
    zone: 'East Central & Eastern Railway (ECR/ER)',
    division: 'Dhanbad & Asansol Divisions',
    name: 'Howrah (HWH) - Pt. Deen Dayal Upadhyaya (DDU)',
    distance_km: 675,
    speed_kmh: 130,
    stations: [
      { code: 'HWH', name: 'Howrah', km: 0, hub: true },
      { code: 'BWN', name: 'Barddhaman', km: 95, hub: false },
      { code: 'ASN', name: 'Asansol Jn', km: 200, hub: true },
      { code: 'DHN', name: 'Dhanbad Jn', km: 259, hub: true },
      { code: 'GAYA', name: 'Gaya Jn', km: 458, hub: true },
      { code: 'DDU', name: 'Pt Deen Dayal Upadhyaya', km: 675, hub: true },
    ],
    sections: [
      { id: 'SEC_301', name: 'HWH - BWN (UP Grand Chord)', line: 'UP', length_km: 95 },
      { id: 'SEC_302', name: 'BWN - ASN (UP Grand Chord)', line: 'UP', length_km: 105 },
      { id: 'SEC_303', name: 'ASN - DHN (UP Grand Chord)', line: 'UP', length_km: 59 },
      { id: 'SEC_304', name: 'DHN - GAYA (UP Grand Chord)', line: 'UP', length_km: 199 },
      { id: 'SEC_305', name: 'GAYA - DDU (UP Grand Chord)', line: 'UP', length_km: 217 },
    ],
    trains: [
      { number: '12305', name: 'Howrah Rajdhani', priority: 1, type: 'RAJDHANI', dir: 'UP', startKm: 0, endKm: 675, startMin: 840, endMin: 1260, color: '#06b6d4' },
      { number: '12311', name: 'Netaji Express', priority: 2, type: 'SUPERFAST', dir: 'UP', startKm: 0, endKm: 675, startMin: 1290, endMin: 1440, color: '#8b5cf6' },
      { number: 'COAL_RAKE_1', name: 'Dhanbad Coal Rake (UP)', priority: 4, type: 'FREIGHT', dir: 'UP', startKm: 259, endKm: 675, startMin: 200, endMin: 650, color: '#64748b' },
    ],
    tasks: [
      { id: 'TASK_ER_01', department: 'ENG', section_id: 'SEC_303', section_name: 'ASN - DHN (UP)', description: 'Heavy axle coal track deep screening', block_type: 'TRAFFIC', machine_required: 'Plasser BCM', duration_mins: 180, severity: 5, requested_start: 360, requested_end: 540, optimized_start_mins: 60, optimized_end_mins: 240, optimized_start_hhmm: '01:00', optimized_end_hhmm: '04:00' },
      { id: 'TASK_ER_02', department: 'TRD', section_id: 'SEC_303', section_name: 'ASN - DHN (UP)', description: 'Overhead 25kV feeder wire replacement', block_type: 'POWER', machine_required: 'Tower Wagon', duration_mins: 150, severity: 4, requested_start: 480, requested_end: 630, optimized_start_mins: 60, optimized_end_mins: 210, optimized_start_hhmm: '01:00', optimized_end_hhmm: '03:30', is_joint: true },
    ]
  },

  MAS_SBC: {
    id: 'MAS_SBC',
    zone: 'Southern & South Western Railway (SR/SWR)',
    division: 'Chennai & Bengaluru Divisions',
    name: 'Chennai Central (MAS) - Bengaluru City (SBC)',
    distance_km: 360,
    speed_kmh: 130,
    stations: [
      { code: 'MAS', name: 'Chennai Central', km: 0, hub: true },
      { code: 'AJJ', name: 'Arakkonam Jn', km: 69, hub: false },
      { code: 'KPD', name: 'Katpadi Jn', km: 130, hub: true },
      { code: 'JTJ', name: 'Jolarpettai Jn', km: 214, hub: true },
      { code: 'BWT', name: 'Bangarapet Jn', km: 290, hub: false },
      { code: 'SBC', name: 'KSR Bengaluru', km: 360, hub: true },
    ],
    sections: [
      { id: 'SEC_401', name: 'MAS - AJJ (UP Line)', line: 'UP', length_km: 69 },
      { id: 'SEC_402', name: 'AJJ - KPD (UP Line)', line: 'UP', length_km: 61 },
      { id: 'SEC_403', name: 'KPD - JTJ (UP Line)', line: 'UP', length_km: 84 },
      { id: 'SEC_404', name: 'JTJ - SBC (UP Line)', line: 'UP', length_km: 146 },
    ],
    trains: [
      { number: '20607', name: 'Vande Bharat Express', priority: 1, type: 'VANDE_BHARAT', dir: 'UP', startKm: 0, endKm: 360, startMin: 350, endMin: 600, color: '#10b981' },
      { number: '12027', name: 'Bengaluru Shatabdi', priority: 1, type: 'SHATABDI', dir: 'UP', startKm: 0, endKm: 360, startMin: 1040, endMin: 1320, color: '#3b82f6' },
      { number: '12639', name: 'Brindavan Express', priority: 2, type: 'SUPERFAST', dir: 'UP', startKm: 0, endKm: 360, startMin: 440, endMin: 780, color: '#8b5cf6' },
    ],
    tasks: [
      { id: 'TASK_SR_01', department: 'ENG', section_id: 'SEC_402', section_name: 'AJJ - KPD (UP)', description: 'Turnout track renewal & tamping', block_type: 'TRAFFIC', machine_required: 'CSM Tamping', duration_mins: 120, severity: 4, requested_start: 420, requested_end: 540, optimized_start_mins: 60, optimized_end_mins: 180, optimized_start_hhmm: '01:00', optimized_end_hhmm: '03:00' },
      { id: 'TASK_SR_02', department: 'TRD', section_id: 'SEC_402', section_name: 'AJJ - KPD (UP)', description: 'OHE bracket overhaul', block_type: 'POWER', machine_required: 'Tower Wagon', duration_mins: 90, severity: 3, requested_start: 480, requested_end: 570, optimized_start_mins: 60, optimized_end_mins: 150, optimized_start_hhmm: '01:00', optimized_end_hhmm: '02:30', is_joint: true },
    ]
  }
};

export const useRailwayStore = create((set, get) => ({
  activeCorridorKey: 'NDLS_CNB',
  isOptimized: false,
  isSolving: false,
  activeRole: 'SECTION_CONTROLLER',
  activeTab: 'GANTT',
  filterDept: 'ALL',
  isApiConnected: false,
  issuedPTW: {},
  emergencyActive: false,

  // Current corridor accessors
  getCorridor: () => CORRIDORS[get().activeCorridorKey],
  getSections: () => CORRIDORS[get().activeCorridorKey].sections,
  getTrains: () => CORRIDORS[get().activeCorridorKey].trains,
  getTasks: () => CORRIDORS[get().activeCorridorKey].tasks,

  setCorridor: (key) => {
    if (CORRIDORS[key]) {
      set({
        activeCorridorKey: key,
        isOptimized: false,
        emergencyActive: false,
      });
    }
  },

  setActiveRole: (role) => set({ activeRole: role }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setFilterDept: (dept) => set({ filterDept: dept }),
  setIsApiConnected: (status) => set({ isApiConnected: status }),

  toggleOptimize: async () => {
    const { isOptimized } = get();

    if (isOptimized) {
      set({ isOptimized: false });
      return;
    }

    set({ isSolving: true });
    await new Promise((r) => setTimeout(r, 600));

    set({
      isOptimized: true,
      isSolving: false,
    });

    confetti({ particleCount: 90, spread: 75, origin: { y: 0.6 } });
  },

  injectEmergencyDefect: () => {
    set({
      emergencyActive: true,
      isOptimized: false,
    });
  },

  resetEmergency: () => {
    set({
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