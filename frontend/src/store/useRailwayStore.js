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
    mapCenter: [27.5, 78.8],
    mapZoom: 7,
    stations: [
      { code: 'NDLS', name: 'New Delhi', km: 0, lat: 28.6429, lng: 77.2195, hub: true },
      { code: 'GZB', name: 'Ghaziabad', km: 26, lat: 28.6678, lng: 77.4498, hub: false },
      { code: 'ALJN', name: 'Aligarh Jn', km: 131, lat: 27.8974, lng: 78.0880, hub: true },
      { code: 'TDL', name: 'Tundla Jn', km: 209, lat: 27.2062, lng: 78.2410, hub: true },
      { code: 'ETW', name: 'Etawah Jn', km: 301, lat: 26.7769, lng: 79.0233, hub: false },
      { code: 'CNB', name: 'Kanpur Central', km: 440, lat: 26.4547, lng: 80.3507, hub: true },
    ],
    sections: [
      { id: 'SEC_101', name: 'GZB - ALJN (UP Line)', line: 'UP', length_km: 105, startLat: 28.6678, startLng: 77.4498, endLat: 27.8974, endLng: 78.0880 },
      { id: 'SEC_102', name: 'ALJN - GZB (DN Line)', line: 'DN', length_km: 105, startLat: 27.8974, startLng: 78.0880, endLat: 28.6678, endLng: 77.4498 },
      { id: 'SEC_103', name: 'ALJN - TDL (UP Line)', line: 'UP', length_km: 78, startLat: 27.8974, startLng: 78.0880, endLat: 27.2062, endLng: 78.2410 },
      { id: 'SEC_104', name: 'TDL - ALJN (DN Line)', line: 'DN', length_km: 78, startLat: 27.2062, startLng: 78.2410, endLat: 27.8974, endLng: 78.0880 },
      { id: 'SEC_105', name: 'TDL - ETW (UP Line)', line: 'UP', length_km: 92, startLat: 27.2062, startLng: 78.2410, endLat: 26.7769, endLng: 79.0233 },
      { id: 'SEC_106', name: 'ETW - TDL (DN Line)', line: 'DN', length_km: 92, startLat: 26.7769, startLng: 79.0233, endLat: 27.2062, endLng: 78.2410 },
      { id: 'SEC_107', name: 'ETW - CNB (UP Line)', line: 'UP', length_km: 139, startLat: 26.7769, startLng: 79.0233, endLat: 26.4547, endLng: 80.3507 },
      { id: 'SEC_108', name: 'CNB - ETW (DN Line)', line: 'DN', length_km: 139, startLat: 26.4547, startLng: 80.3507, endLat: 26.7769, endLng: 79.0233 },
    ],
    substations: [
      { id: 'TSS_GZB', name: 'Ghaziabad 25kV TSS', lat: 28.6620, lng: 77.4350, capacity: '30 MVA' },
      { id: 'TSS_ALJN', name: 'Aligarh 25kV TSS', lat: 27.8920, lng: 78.0750, capacity: '30 MVA' },
      { id: 'TSS_TDL', name: 'Tundla 25kV TSS', lat: 27.2010, lng: 78.2320, capacity: '30 MVA' },
      { id: 'TSS_CNB', name: 'Kanpur 25kV TSS', lat: 26.4500, lng: 80.3410, capacity: '30 MVA' },
    ],
    trains: [
      { number: '22436', name: 'Vande Bharat Express', priority: 1, type: 'VANDE_BHARAT', dir: 'UP', startKm: 0, endKm: 440, startMin: 360, endMin: 560, lat: 27.95, lng: 78.02, speedKmh: 130, color: '#10b981' },
      { number: '22435', name: 'Vande Bharat Express', priority: 1, type: 'VANDE_BHARAT', dir: 'DN', startKm: 440, endKm: 0, startMin: 900, endMin: 1100, lat: 27.15, lng: 78.35, speedKmh: 130, color: '#10b981' },
      { number: '12302', name: 'Howrah Rajdhani', priority: 1, type: 'RAJDHANI', dir: 'DN', startKm: 440, endKm: 0, startMin: 1020, endMin: 1240, lat: 26.65, lng: 79.30, speedKmh: 120, color: '#06b6d4' },
      { number: 'BOXN_UP_1', name: 'Coal Rake Freight (UP)', priority: 4, type: 'FREIGHT', dir: 'UP', startKm: 0, endKm: 440, startMin: 120, endMin: 480, lat: 28.45, lng: 77.65, speedKmh: 75, color: '#64748b' },
    ],
    tasks: [
      { id: 'TASK_001', department: 'ENG', section_id: 'SEC_101', section_name: 'GZB - ALJN (UP)', description: 'Deep screening of ballast by BCM machine', block_type: 'TRAFFIC', machine_required: 'Plasser BCM 08-32', duration_mins: 180, severity: 5, requested_start: 360, requested_end: 540, optimized_start_mins: 60, optimized_end_mins: 240, optimized_start_hhmm: '01:00', optimized_end_hhmm: '04:00', lat: 28.25, lng: 77.78 },
      { id: 'TASK_002', department: 'TRD', section_id: 'SEC_101', section_name: 'GZB - ALJN (UP)', description: 'OHE contact wire wear replacement (25kV)', block_type: 'POWER', machine_required: 'Tower Wagon', duration_mins: 150, severity: 4, requested_start: 480, requested_end: 630, optimized_start_mins: 60, optimized_end_mins: 210, optimized_start_hhmm: '01:00', optimized_end_hhmm: '03:30', is_joint: true, lat: 28.25, lng: 77.78 },
      { id: 'TASK_003', department: 'S&T', section_id: 'SEC_103', section_name: 'ALJN - TDL (UP)', description: 'Point machine overhaul & testing', block_type: 'DISCONNECTION', machine_required: 'Point Test Kit', duration_mins: 90, severity: 4, requested_start: 600, requested_end: 690, optimized_start_mins: 135, optimized_end_mins: 225, optimized_start_hhmm: '02:15', optimized_end_hhmm: '03:45', lat: 27.55, lng: 78.16 },
      { id: 'TASK_004', department: 'ENG', section_id: 'SEC_105', section_name: 'TDL - ETW (UP)', description: 'Turnout rail renewal & tamping', block_type: 'TRAFFIC', machine_required: 'CSM 09-32 Tamping', duration_mins: 120, severity: 3, requested_start: 840, requested_end: 960, optimized_start_mins: 30, optimized_end_mins: 150, optimized_start_hhmm: '00:30', optimized_end_hhmm: '02:30', lat: 26.98, lng: 78.65 },
    ]
  },

  MMCT_ADI: {
    id: 'MMCT_ADI',
    zone: 'Western Railway (WR)',
    division: 'Vadodara Division',
    name: 'Mumbai Central (MMCT) - Ahmedabad (ADI)',
    distance_km: 492,
    speed_kmh: 130,
    mapCenter: [21.0, 73.0],
    mapZoom: 7,
    stations: [
      { code: 'MMCT', name: 'Mumbai Central', km: 0, lat: 18.9696, lng: 72.8194, hub: true },
      { code: 'BVI', name: 'Borivali', km: 30, lat: 19.2290, lng: 72.8574, hub: false },
      { code: 'ST', name: 'Surat', km: 263, lat: 21.2052, lng: 72.8407, hub: true },
      { code: 'BRC', name: 'Vadodara Jn', km: 392, lat: 22.3107, lng: 73.1812, hub: true },
      { code: 'ANND', name: 'Anand Jn', km: 427, lat: 22.5645, lng: 72.9289, hub: false },
      { code: 'ADI', name: 'Ahmedabad Jn', km: 492, lat: 23.0225, lng: 72.5714, hub: true },
    ],
    sections: [
      { id: 'SEC_201', name: 'MMCT - BVI (UP Line)', line: 'UP', length_km: 30, startLat: 18.9696, startLng: 72.8194, endLat: 19.2290, endLng: 72.8574 },
      { id: 'SEC_202', name: 'BVI - ST (UP Line)', line: 'UP', length_km: 233, startLat: 19.2290, startLng: 72.8574, endLat: 21.2052, endLng: 72.8407 },
      { id: 'SEC_203', name: 'ST - BRC (UP Line)', line: 'UP', length_km: 129, startLat: 21.2052, startLng: 72.8407, endLat: 22.3107, endLng: 73.1812 },
      { id: 'SEC_204', name: 'BRC - ADI (UP Line)', line: 'UP', length_km: 100, startLat: 22.3107, startLng: 73.1812, endLat: 23.0225, endLng: 72.5714 },
    ],
    substations: [
      { id: 'TSS_BVI', name: 'Borivali 25kV TSS', lat: 19.2300, lng: 72.8600, capacity: '30 MVA' },
      { id: 'TSS_ST', name: 'Surat 25kV TSS', lat: 21.2100, lng: 72.8500, capacity: '30 MVA' },
      { id: 'TSS_BRC', name: 'Vadodara 25kV TSS', lat: 22.3200, lng: 73.1900, capacity: '30 MVA' },
    ],
    trains: [
      { number: '20901', name: 'Vande Bharat Express', priority: 1, type: 'VANDE_BHARAT', dir: 'UP', startKm: 0, endKm: 492, startMin: 370, endMin: 690, lat: 21.80, lng: 73.05, speedKmh: 130, color: '#10b981' },
      { number: '12951', name: 'Mumbai Rajdhani', priority: 1, type: 'RAJDHANI', dir: 'UP', startKm: 0, endKm: 492, startMin: 1020, endMin: 1380, lat: 20.20, lng: 72.85, speedKmh: 120, color: '#06b6d4' },
    ],
    tasks: [
      { id: 'TASK_WR_01', department: 'ENG', section_id: 'SEC_202', section_name: 'BVI - ST (UP)', description: 'Ultrasonic Flaw Detection (USFD) weld repair', block_type: 'TRAFFIC', machine_required: 'USFD Rig', duration_mins: 150, severity: 5, requested_start: 420, requested_end: 570, optimized_start_mins: 60, optimized_end_mins: 210, optimized_start_hhmm: '01:00', optimized_end_hhmm: '03:30', lat: 20.25, lng: 72.85 },
      { id: 'TASK_WR_02', department: 'TRD', section_id: 'SEC_202', section_name: 'BVI - ST (UP)', description: 'OHE insulator washing & neutral section test', block_type: 'POWER', machine_required: 'OHE Washer Wagon', duration_mins: 120, severity: 3, requested_start: 540, requested_end: 660, optimized_start_mins: 60, optimized_end_mins: 180, optimized_start_hhmm: '01:00', optimized_end_hhmm: '03:00', is_joint: true, lat: 20.25, lng: 72.85 },
    ]
  },

  HWH_DDU: {
    id: 'HWH_DDU',
    zone: 'East Central & Eastern Railway (ECR/ER)',
    division: 'Dhanbad & Asansol Divisions',
    name: 'Howrah (HWH) - Pt. Deen Dayal Upadhyaya (DDU)',
    distance_km: 675,
    speed_kmh: 130,
    mapCenter: [23.8, 85.8],
    mapZoom: 7,
    stations: [
      { code: 'HWH', name: 'Howrah', km: 0, lat: 22.5850, lng: 88.3426, hub: true },
      { code: 'BWN', name: 'Barddhaman', km: 95, lat: 23.2324, lng: 87.8615, hub: false },
      { code: 'ASN', name: 'Asansol Jn', km: 200, lat: 23.6889, lng: 86.9661, hub: true },
      { code: 'DHN', name: 'Dhanbad Jn', km: 259, lat: 23.7957, lng: 86.4304, hub: true },
      { code: 'GAYA', name: 'Gaya Jn', km: 458, lat: 24.7914, lng: 85.0002, hub: true },
      { code: 'DDU', name: 'Pt Deen Dayal Upadhyaya', km: 675, lat: 25.2785, lng: 83.1235, hub: true },
    ],
    sections: [
      { id: 'SEC_301', name: 'HWH - BWN (UP Grand Chord)', line: 'UP', length_km: 95, startLat: 22.5850, startLng: 88.3426, endLat: 23.2324, endLng: 87.8615 },
      { id: 'SEC_302', name: 'BWN - ASN (UP Grand Chord)', line: 'UP', length_km: 105, startLat: 23.2324, startLng: 87.8615, endLat: 23.6889, endLng: 86.9661 },
      { id: 'SEC_303', name: 'ASN - DHN (UP Grand Chord)', line: 'UP', length_km: 59, startLat: 23.6889, startLng: 86.9661, endLat: 23.7957, endLng: 86.4304 },
      { id: 'SEC_304', name: 'DHN - GAYA (UP Grand Chord)', line: 'UP', length_km: 199, startLat: 23.7957, startLng: 86.4304, endLat: 24.7914, endLng: 85.0002 },
      { id: 'SEC_305', name: 'GAYA - DDU (UP Grand Chord)', line: 'UP', length_km: 217, startLat: 24.7914, startLng: 85.0002, endLat: 25.2785, endLng: 83.1235 },
    ],
    substations: [
      { id: 'TSS_ASN', name: 'Asansol 25kV TSS', lat: 23.6900, lng: 86.9700, capacity: '30 MVA' },
      { id: 'TSS_DHN', name: 'Dhanbad 25kV TSS', lat: 23.8000, lng: 86.4400, capacity: '30 MVA' },
      { id: 'TSS_GAYA', name: 'Gaya 25kV TSS', lat: 24.8000, lng: 85.0100, capacity: '30 MVA' },
    ],
    trains: [
      { number: '12305', name: 'Howrah Rajdhani', priority: 1, type: 'RAJDHANI', dir: 'UP', startKm: 0, endKm: 675, startMin: 840, endMin: 1260, lat: 24.20, lng: 85.70, speedKmh: 120, color: '#06b6d4' },
      { number: 'COAL_RAKE_1', name: 'Dhanbad Coal Rake', priority: 4, type: 'FREIGHT', dir: 'UP', startKm: 259, endKm: 675, startMin: 200, endMin: 650, lat: 24.00, lng: 86.10, speedKmh: 75, color: '#64748b' },
    ],
    tasks: [
      { id: 'TASK_ER_01', department: 'ENG', section_id: 'SEC_303', section_name: 'ASN - DHN (UP)', description: 'Heavy axle coal track deep screening', block_type: 'TRAFFIC', machine_required: 'Plasser BCM', duration_mins: 180, severity: 5, requested_start: 360, requested_end: 540, optimized_start_mins: 60, optimized_end_mins: 240, optimized_start_hhmm: '01:00', optimized_end_hhmm: '04:00', lat: 23.74, lng: 86.70 },
      { id: 'TASK_ER_02', department: 'TRD', section_id: 'SEC_303', section_name: 'ASN - DHN (UP)', description: 'Overhead 25kV feeder wire replacement', block_type: 'POWER', machine_required: 'Tower Wagon', duration_mins: 150, severity: 4, requested_start: 480, requested_end: 630, optimized_start_mins: 60, optimized_end_mins: 210, optimized_start_hhmm: '01:00', optimized_end_hhmm: '03:30', is_joint: true, lat: 23.74, lng: 86.70 },
    ]
  },

  MAS_SBC: {
    id: 'MAS_SBC',
    zone: 'Southern & South Western Railway (SR/SWR)',
    division: 'Chennai & Bengaluru Divisions',
    name: 'Chennai Central (MAS) - Bengaluru City (SBC)',
    distance_km: 360,
    speed_kmh: 130,
    mapCenter: [12.9, 79.0],
    mapZoom: 8,
    stations: [
      { code: 'MAS', name: 'Chennai Central', km: 0, lat: 13.0827, lng: 80.2707, hub: true },
      { code: 'AJJ', name: 'Arakkonam Jn', km: 69, lat: 13.0783, lng: 79.6677, hub: false },
      { code: 'KPD', name: 'Katpadi Jn', km: 130, lat: 12.9818, lng: 79.1354, hub: true },
      { code: 'JTJ', name: 'Jolarpettai Jn', km: 214, lat: 12.5621, lng: 78.5775, hub: true },
      { code: 'BWT', name: 'Bangarapet Jn', km: 290, lat: 12.9961, lng: 78.1990, hub: false },
      { code: 'SBC', name: 'KSR Bengaluru', km: 360, lat: 12.9781, lng: 77.5696, hub: true },
    ],
    sections: [
      { id: 'SEC_401', name: 'MAS - AJJ (UP Line)', line: 'UP', length_km: 69, startLat: 13.0827, startLng: 80.2707, endLat: 13.0783, endLng: 79.6677 },
      { id: 'SEC_402', name: 'AJJ - KPD (UP Line)', line: 'UP', length_km: 61, startLat: 13.0783, startLng: 79.6677, endLat: 12.9818, endLng: 79.1354 },
      { id: 'SEC_403', name: 'KPD - JTJ (UP Line)', line: 'UP', length_km: 84, startLat: 12.9818, startLng: 79.1354, endLat: 12.5621, endLng: 78.5775 },
      { id: 'SEC_404', name: 'JTJ - SBC (UP Line)', line: 'UP', length_km: 146, startLat: 12.5621, startLng: 78.5775, endLat: 12.9781, endLng: 77.5696 },
    ],
    substations: [
      { id: 'TSS_AJJ', name: 'Arakkonam 25kV TSS', lat: 13.0800, lng: 79.6700, capacity: '30 MVA' },
      { id: 'TSS_KPD', name: 'Katpadi 25kV TSS', lat: 12.9850, lng: 79.1400, capacity: '30 MVA' },
      { id: 'TSS_SBC', name: 'Bengaluru 25kV TSS', lat: 12.9800, lng: 77.5750, capacity: '30 MVA' },
    ],
    trains: [
      { number: '20607', name: 'Vande Bharat Express', priority: 1, type: 'VANDE_BHARAT', dir: 'UP', startKm: 0, endKm: 360, startMin: 350, endMin: 600, lat: 12.80, lng: 78.85, speedKmh: 130, color: '#10b981' },
      { number: '12027', name: 'Bengaluru Shatabdi', priority: 1, type: 'SHATABDI', dir: 'UP', startKm: 0, endKm: 360, startMin: 1040, endMin: 1320, lat: 13.02, lng: 79.40, speedKmh: 120, color: '#3b82f6' },
    ],
    tasks: [
      { id: 'TASK_SR_01', department: 'ENG', section_id: 'SEC_402', section_name: 'AJJ - KPD (UP)', description: 'Turnout track renewal & tamping', block_type: 'TRAFFIC', machine_required: 'CSM Tamping', duration_mins: 120, severity: 4, requested_start: 420, requested_end: 540, optimized_start_mins: 60, optimized_end_mins: 180, optimized_start_hhmm: '01:00', optimized_end_hhmm: '03:00', lat: 13.03, lng: 79.40 },
      { id: 'TASK_SR_02', department: 'TRD', section_id: 'SEC_402', section_name: 'AJJ - KPD (UP)', description: 'OHE bracket overhaul', block_type: 'POWER', machine_required: 'Tower Wagon', duration_mins: 90, severity: 3, requested_start: 480, requested_end: 570, optimized_start_mins: 60, optimized_end_mins: 150, optimized_start_hhmm: '01:00', optimized_end_hhmm: '02:30', is_joint: true, lat: 13.03, lng: 79.40 },
    ]
  }
};

export const useRailwayStore = create((set, get) => ({
  activeCorridorKey: 'NDLS_CNB',
  isOptimized: false,
  isSolving: false,
  activeRole: 'SECTION_CONTROLLER',
  activeTab: 'GIS_MAP',
  filterDept: 'ALL',
  isApiConnected: false,
  issuedPTW: {},
  emergencyActive: false,

  // GIS Map Layer Toggles
  showTrains: true,
  showBlocks: true,
  showSubstations: true,
  showFlaws: true,

  toggleLayer: (layerName) => set((state) => ({ [layerName]: !state[layerName] })),

  getCorridor: () => CORRIDORS[get().activeCorridorKey],
  getSections: () => CORRIDORS[get().activeCorridorKey].sections,
  getTrains: () => CORRIDORS[get().activeCorridorKey].trains,
  getTasks: () => CORRIDORS[get().activeCorridorKey].tasks,
  getSubstations: () => CORRIDORS[get().activeCorridorKey].substations || [],

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