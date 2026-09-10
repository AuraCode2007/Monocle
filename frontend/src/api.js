const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

async function request(endpoint, options = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    let errorMessage = `Request failed with status ${response.status}`;

    try {
      const errorData = await response.json();
      errorMessage = errorData.detail || errorMessage;
    } catch {
      // Keep default error message.
    }

    throw new Error(errorMessage);
  }

  return response.json();
}


// =========================
// TMS
// =========================

export const getTMSJobs = () =>
  request('/api/tms/jobs');

export const getTMSJob = (jobId) =>
  request(`/api/tms/jobs/${encodeURIComponent(jobId)}`);

export const createTMSJob = (job) =>
  request('/api/tms/jobs', {
    method: 'POST',
    body: JSON.stringify(job),
  });

export const updateTMSJob = (jobId, job) =>
  request(`/api/tms/jobs/${encodeURIComponent(jobId)}`, {
    method: 'PUT',
    body: JSON.stringify(job),
  });

export const deleteTMSJob = (jobId) =>
  request(`/api/tms/jobs/${encodeURIComponent(jobId)}`, {
    method: 'DELETE',
  });


// =========================
// TDMS
// =========================

export const getTDMSJobs = () =>
  request('/api/tdms/jobs');

export const getTDMSJob = (jobId) =>
  request(`/api/tdms/jobs/${encodeURIComponent(jobId)}`);

export const createTDMSJob = (job) =>
  request('/api/tdms/jobs', {
    method: 'POST',
    body: JSON.stringify(job),
  });

export const updateTDMSJob = (jobId, job) =>
  request(`/api/tdms/jobs/${encodeURIComponent(jobId)}`, {
    method: 'PUT',
    body: JSON.stringify(job),
  });

export const deleteTDMSJob = (jobId) =>
  request(`/api/tdms/jobs/${encodeURIComponent(jobId)}`, {
    method: 'DELETE',
  });


// =========================
// SMMS
// =========================

export const getSMMSJobs = () =>
  request('/api/smms/jobs');

export const getSMMSJob = (jobId) =>
  request(`/api/smms/jobs/${encodeURIComponent(jobId)}`);

export const createSMMSJob = (job) =>
  request('/api/smms/jobs', {
    method: 'POST',
    body: JSON.stringify(job),
  });

export const updateSMMSJob = (jobId, job) =>
  request(`/api/smms/jobs/${encodeURIComponent(jobId)}`, {
    method: 'PUT',
    body: JSON.stringify(job),
  });

export const deleteSMMSJob = (jobId) =>
  request(`/api/smms/jobs/${encodeURIComponent(jobId)}`, {
    method: 'DELETE',
  });


// =========================
// CONTROL ROOM
// =========================

export const getControlRoomJobs = () =>
  request('/api/control-room/jobs');

export const getControlRoomJob = (jobId) =>
  request(`/api/control-room/jobs/${encodeURIComponent(jobId)}`);

export const getControlRoomDashboard = () =>
  request('/api/control-room/dashboard');


// =========================
// OPTIMIZER
// =========================

export const getBaseline = () =>
  request('/api/v1/baseline');

export const runOptimizer = (timeLimit = 10) =>
  request(`/api/v1/optimize?time_limit=${timeLimit}`, {
    method: 'POST',
  });

export const runEmergencySolver = (incident) =>
  request('/api/v1/emergency/solve', {
    method: 'POST',
    body: JSON.stringify(incident),
  });

export default {
  getTMSJobs,
  getTMSJob,
  createTMSJob,
  updateTMSJob,
  deleteTMSJob,

  getTDMSJobs,
  getTDMSJob,
  createTDMSJob,
  updateTDMSJob,
  deleteTDMSJob,

  getSMMSJobs,
  getSMMSJob,
  createSMMSJob,
  updateSMMSJob,
  deleteSMMSJob,

  getControlRoomJobs,
  getControlRoomJob,
  getControlRoomDashboard,

  getBaseline,
  runOptimizer,
  runEmergencySolver,
};