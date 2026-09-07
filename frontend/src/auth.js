export const ROLE_LABELS = {
  ADMIN: 'System Admin',
  SECTION_CONTROLLER: 'Section Controller',
  TRACK_ENGINEER: 'Sr. DEN (Track)',
  TRACTION_CONTROLLER: 'TPC (Traction)',
  SIGNAL_INCHARGE: 'DSTE (Signal)',
};

export const ROLE_PERMISSIONS = {
  ADMIN: ['ALL'],
  SECTION_CONTROLLER: ['COMMAND_CENTER', 'GANTT', 'STRING_CHART', 'GIS_MAP', 'PTW', 'CALENDAR'],
  TRACK_ENGINEER: ['COMMAND_CENTER', 'ML_SCORER', 'GANTT', 'PTW'],
  TRACTION_CONTROLLER: ['COMMAND_CENTER', 'GIS_MAP', 'ML_SCORER', 'SIMULATION'],
  SIGNAL_INCHARGE: ['COMMAND_CENTER', 'GANTT', 'STRING_CHART', 'PTW', 'CALENDAR'],
};

export const PTW_ISSUE_ROLES = ['ADMIN', 'SECTION_CONTROLLER', 'TRACK_ENGINEER', 'TRACTION_CONTROLLER', 'SIGNAL_INCHARGE'];
export const PTW_APPROVE_ROLES = ['ADMIN', 'SECTION_CONTROLLER', 'SIGNAL_INCHARGE'];

export const AUTH_USERS = [
  {
    id: 'admin-01',
    name: 'Rakesh Sharma',
    email: 'admin@railsync.ai',
    password: 'RailSync@123',
    role: 'ADMIN',
    department: 'Operations Control',
  },
  {
    id: 'sc-101',
    name: 'Amit Verma',
    email: 'amit.verma@railsync.ai',
    password: 'RailSync@123',
    role: 'SECTION_CONTROLLER',
    department: 'Operations',
  },
  {
    id: 'te-204',
    name: 'Neha Singh',
    email: 'neha.singh@railsync.ai',
    password: 'RailSync@123',
    role: 'TRACK_ENGINEER',
    department: 'Track Maintenance',
  },
  {
    id: 'tc-330',
    name: 'Vikas Mehta',
    email: 'vikas.mehta@railsync.ai',
    password: 'RailSync@123',
    role: 'TRACTION_CONTROLLER',
    department: 'Traction Distribution',
  },
  {
    id: 'si-112',
    name: 'Pooja Nair',
    email: 'pooja.nair@railsync.ai',
    password: 'RailSync@123',
    role: 'SIGNAL_INCHARGE',
    department: 'Signal & Telecom',
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
