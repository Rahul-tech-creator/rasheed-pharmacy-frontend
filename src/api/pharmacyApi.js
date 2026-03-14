const rawApiUrl = import.meta.env.VITE_API_URL || 'https://rasheed-pharmacy-backend.onrender.com/api';
// Ensure API_BASE always includes the /api suffix if it's hitting the backend directly
const API_BASE = rawApiUrl.endsWith('/api') || rawApiUrl.endsWith('/api/') 
  ? rawApiUrl.replace(/\/$/, '') 
  : `${rawApiUrl.replace(/\/$/, '')}/api`;

export const UPLOAD_BASE = API_BASE.replace('/api', '') + '/uploads';

// ==================== TOKEN MANAGEMENT ====================

let accessToken = localStorage.getItem('rp_access_token') || null;
let refreshTokenValue = localStorage.getItem('rp_refresh_token') || null;

export function setTokens(access, refresh) {
  accessToken = access;
  refreshTokenValue = refresh;
  if (access) localStorage.setItem('rp_access_token', access);
  else localStorage.removeItem('rp_access_token');
  if (refresh) localStorage.setItem('rp_refresh_token', refresh);
  else localStorage.removeItem('rp_refresh_token');
}

export function getAccessToken() { return accessToken; }
export function getRefreshToken() { return refreshTokenValue; }

export function clearTokens() {
  accessToken = null;
  refreshTokenValue = null;
  localStorage.removeItem('rp_access_token');
  localStorage.removeItem('rp_refresh_token');
}

// ==================== REQUEST HELPER ====================

async function request(url, options = {}) {
  const config = {
    headers: {},
    ...options,
  };

  // Only set Content-Type for non-FormData requests
  if (!(config.body instanceof FormData)) {
    config.headers['Content-Type'] = 'application/json';
  }

  // Attach auth token if available
  if (accessToken) {
    config.headers['Authorization'] = `Bearer ${accessToken}`;
  }

  let response = await fetch(`${API_BASE}${url}`, config);

  // If token expired, try refreshing
  if (response.status === 401 && refreshTokenValue) {
    const data = await response.json().catch(() => ({}));
    if (data.code === 'TOKEN_EXPIRED') {
      const refreshed = await tryRefreshToken();
      if (refreshed) {
        // Retry original request with new token
        config.headers['Authorization'] = `Bearer ${accessToken}`;
        response = await fetch(`${API_BASE}${url}`, config);
      }
    }
  }

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.error || data.errors?.[0]?.message || 'Request failed');
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

async function tryRefreshToken() {
  try {
    const response = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: refreshTokenValue }),
    });
    const data = await response.json();
    if (data.success && data.data?.accessToken) {
      accessToken = data.data.accessToken;
      localStorage.setItem('rp_access_token', accessToken);
      return true;
    }
    clearTokens();
    return false;
  } catch {
    clearTokens();
    return false;
  }
}

// ==================== AUTH API ====================

export const authApi = {
  sendOtp: (phone, name) => request('/auth/send-otp', {
    method: 'POST',
    body: JSON.stringify({ phone, name }),
  }),

  verifyOtp: (phone, otp, name) => request('/auth/verify-otp', {
    method: 'POST',
    body: JSON.stringify({ phone, otp, name }),
  }),

  refresh: () => request('/auth/refresh', {
    method: 'POST',
    body: JSON.stringify({ refreshToken: refreshTokenValue }),
  }),

  logout: () => {
    const token = refreshTokenValue;
    clearTokens();
    return request('/auth/logout', {
      method: 'POST',
      body: JSON.stringify({ refreshToken: token }),
    }).catch(() => {});
  },

  getMe: () => request('/auth/me'),
};

// ==================== MEDICINES ====================

export const medicinesApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== '' && val !== null) query.append(key, val);
    });
    const qs = query.toString();
    return request(`/medicines${qs ? `?${qs}` : ''}`);
  },

  getById: (id) => request(`/medicines/${id}`),

  getStats: () => request('/medicines/stats/summary'),

  add: (medicine) => request('/medicines', {
    method: 'POST',
    body: JSON.stringify(medicine),
  }),

  update: (id, data) => request(`/medicines/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),

  sell: (id, quantity = 1) => request(`/medicines/${id}/sell`, {
    method: 'PATCH',
    body: JSON.stringify({ quantity }),
  }),

  delete: (id) => request(`/medicines/${id}`, { method: 'DELETE' }),
};

// ==================== PRESCRIPTIONS ====================

export const prescriptionsApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== '' && val !== null) query.append(key, val);
    });
    const qs = query.toString();
    return request(`/prescriptions${qs ? `?${qs}` : ''}`);
  },

  getById: (id) => request(`/prescriptions/${id}`),

  upload: (formData) => request('/prescriptions', {
    method: 'POST',
    body: formData, // FormData — no Content-Type header (browser sets multipart boundary)
  }),

  updateStatus: (id, status, expected_date) => request(`/prescriptions/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status, expected_date }),
  }),

  delete: (id) => request(`/prescriptions/${id}`, { method: 'DELETE' }),
};

// ==================== PICKUP SLOTS ====================

export const slotsApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== '' && val !== null) query.append(key, val);
    });
    const qs = query.toString();
    return request(`/slots${qs ? `?${qs}` : ''}`);
  },

  getBooked: (date) => request(`/slots/booked?date=${date}`),

  book: (slot) => request('/slots', {
    method: 'POST',
    body: JSON.stringify(slot),
  }),

  cancel: (id) => request(`/slots/${id}`, { method: 'DELETE' }),
};

// UPLOAD_BASE is now defined at the top based on API_BASE
