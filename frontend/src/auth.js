export const DEPARTMENTS = {
  TMS: {
    id: 'TMS',
    code: 'TMS',
    name: 'Track Management System (TMS)',
    shortName: 'Civil / Track',
    division: 'Engineering (Track / TMS)',
    color: '#EA580C',
    accentClass: 'orange',
    description: 'Track geometry, ballast bed deep screening, rail weld grinding, USFD testing, sleeper renewal.',
    defaultUser: {
      username: 'tms_officer',
      password: 'RailSync@123',
      name: 'A. K. Sharma (Sr. DEN/Track)',
      email: 'tms.track@railsync.ai',
    },
  },
  TDMS: {
    id: 'TDMS',
    code: 'TDMS',
    name: 'Traction Distribution Management System (TDMS)',
    shortName: 'Electrical / TRD',
    division: 'Traction Distribution (Electrical / TDMS)',
    color: '#D97706',
    accentClass: 'amber',
    description: '25kV OHE catenary wires, traction substations (TSS), mast ranges, power isolation and feeder shut-downs.',
    defaultUser: {
      username: 'tdms_officer',
      password: 'RailSync@123',
      name: 'K. Srinivasan (DEE/TRD)',
      email: 'tdms.power@railsync.ai',
    },
  },
  SMMS: {
    id: 'SMMS',
    code: 'SMMS',
    name: 'Signalling Maintenance & Management System (SMMS)',
    shortName: 'Signal / S&T',
    division: 'Signal & Telecommunication (S&T / SMMS)',
    color: '#2563EB',
    accentClass: 'blue',
    description: 'Electronic Interlocking (EI/RRI), point machines, Digital Axle Counters (DAC), signal aspect testing.',
    defaultUser: {
      username: 'smms_officer',
      password: 'RailSync@123',
      name: 'Debasish Roy (DSTE/Signal)',
      email: 'smms.signal@railsync.ai',
    },
  },
  CONTROL_ROOM: {
    id: 'CONTROL_ROOM',
    code: 'CONTROL_ROOM',
    name: 'Control Office Application (COA)',
    shortName: 'Central Control / COA',
    division: 'Operations & Control Office (COA)',
    color: '#7C3AED',
    accentClass: 'purple',
    description: 'Master corridor timetable, train paths (Rajdhani, Vande Bharat), CP-SAT joint possession solver, PTW memo issuance.',
    defaultUser: {
      username: 'coa_controller',
      password: 'RailSync@123',
      name: 'Amit Verma (Chief Controller)',
      email: 'controller@railsync.ai',
    },
  },
};

export const ROLE_LABELS = {
  TMS: 'Track Engineer (TMS)',
  TDMS: 'Traction Controller (TDMS)',
  SMMS: 'Signal In-Charge (SMMS)',
  CONTROL_ROOM: 'Chief Section Controller (COA)',
  ADMIN: 'System Admin',
  // Backward compatibility labels
  TRACK_ENGINEER: 'Track Engineer (TMS)',
  TRACTION_CONTROLLER: 'Traction Controller (TDMS)',
  SIGNAL_INCHARGE: 'Signal In-Charge (SMMS)',
  SECTION_CONTROLLER: 'Chief Section Controller (COA)',
};

export const ROLE_PERMISSIONS = {
  TMS: ['TMS_DASHBOARD', 'TMS_TRACK_ASSETS', 'DEFECTS'],
  TDMS: ['TDMS_DASHBOARD', 'TDMS_POWER_ASSETS', 'POWER_GRID'],
  SMMS: ['SMMS_DASHBOARD', 'SMMS_SIGNAL_ASSETS', 'INTERLOCKING'],
  CONTROL_ROOM: ['COMMAND_CENTER', 'GANTT', 'STRING_CHART', 'GIS_MAP', 'PTW', 'CALENDAR', 'NATIONAL', 'SIMULATION', 'ML_SCORER'],
  ADMIN: ['ALL'],
  // Backward compatibility
  SECTION_CONTROLLER: ['COMMAND_CENTER', 'GANTT', 'STRING_CHART', 'GIS_MAP', 'PTW', 'CALENDAR'],
  TRACK_ENGINEER: ['TMS_DASHBOARD', 'TMS_TRACK_ASSETS', 'DEFECTS'],
  TRACTION_CONTROLLER: ['TDMS_DASHBOARD', 'TDMS_POWER_ASSETS', 'POWER_GRID'],
  SIGNAL_INCHARGE: ['SMMS_DASHBOARD', 'SMMS_SIGNAL_ASSETS', 'INTERLOCKING'],
};

export const PTW_ISSUE_ROLES = ['ADMIN', 'CONTROL_ROOM', 'SECTION_CONTROLLER', 'TMS', 'TDMS', 'SMMS', 'TRACK_ENGINEER', 'TRACTION_CONTROLLER', 'SIGNAL_INCHARGE'];
export const PTW_APPROVE_ROLES = ['ADMIN', 'CONTROL_ROOM', 'SECTION_CONTROLLER'];

export const AUTH_USERS = [
  {
    id: 'TMS-01',
    username: 'tms_officer',
    name: 'A. K. Sharma',
    email: 'tms.track@railsync.ai',
    password: 'RailSync@123',
    role: 'TMS',
    department: 'TMS',
    designation: 'Sr. DEN (Track Engineering)',
  },
  {
    id: 'TDMS-01',
    username: 'tdms_officer',
    name: 'K. Srinivasan',
    email: 'tdms.power@railsync.ai',
    password: 'RailSync@123',
    role: 'TDMS',
    department: 'TDMS',
    designation: 'DEE (Traction Distribution)',
  },
  {
    id: 'SMMS-01',
    username: 'smms_officer',
    name: 'Debasish Roy',
    email: 'smms.signal@railsync.ai',
    password: 'RailSync@123',
    role: 'SMMS',
    department: 'SMMS',
    designation: 'DSTE (Signal & Telecom)',
  },
  {
    id: 'COA-01',
    username: 'coa_controller',
    name: 'Amit Verma',
    email: 'controller@railsync.ai',
    password: 'RailSync@123',
    role: 'CONTROL_ROOM',
    department: 'CONTROL_ROOM',
    designation: 'Chief Section Controller (COA)',
  },
];

const encodeBase64 = (value) => {
  const bytes = new TextEncoder().encode(value);
  let binary = '';
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
};

const decodeBase64 = (value) => {
  const binary = atob(value);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
};

export const createMockJwt = (user) => {
  const header = encodeBase64(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = encodeBase64(JSON.stringify({
    sub: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    department: user.department,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 8 * 60 * 60,
  }));

  return `${header}.${payload}.railsync-demo-signature`;
};

export const parseJwt = (token) => {
  if (!token) return null;

  try {
    const [, payloadPart] = token.split('.');
    if (!payloadPart) return null;
    const payload = JSON.parse(decodeBase64(payloadPart));
    return payload;
  } catch {
    return null;
  }
};

export const getStoredSession = () => {
  try {
    const raw = window.localStorage.getItem('railsync-auth-session');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !parsed.token) return null;
    const payload = parseJwt(parsed.token);
    if (!payload || (payload.exp && payload.exp < Math.floor(Date.now() / 1000))) {
      window.localStorage.removeItem('railsync-auth-session');
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
};

export const saveSession = (session) => {
  window.localStorage.setItem('railsync-auth-session', JSON.stringify(session));
};

export const clearSession = () => {
  window.localStorage.removeItem('railsync-auth-session');
};

export const canAccessTab = (userRole, tabKey) => {
  if (!userRole) return false;
  const permissions = ROLE_PERMISSIONS[userRole] || [];
  return permissions.includes('ALL') || permissions.includes(tabKey);
};

export const canIssuePTW = (userRole) => PTW_ISSUE_ROLES.includes(userRole);

export const canApprovePTW = (userRole) => PTW_APPROVE_ROLES.includes(userRole);

export const getVisibleLogs = (userRole, logs) => {
  if (!logs?.length) return [];
  if (userRole === 'ADMIN') return logs;
  return logs.filter((log) => log.visibility === 'all' || log.role === userRole);
};
