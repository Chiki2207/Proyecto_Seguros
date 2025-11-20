const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

/**
 * Obtener token del localStorage
 */
function getToken() {
  return localStorage.getItem('token');
}

/**
 * Realizar petición HTTP con autenticación
 */
async function fetchAPI(endpoint, options = {}) {
  const token = getToken();
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(`${API_URL}${endpoint}`, config);
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Error en la petición' }));
    throw new Error(error.error || `Error ${response.status}`);
  }

  return response.json();
}

// ==================== AUTENTICACIÓN ====================
export const authAPI = {
  login: async (username, password) => {
    return fetchAPI('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  },
};

// ==================== USUARIOS ====================
export const usersAPI = {
  getAll: async () => {
    return fetchAPI('/users');
  },
  getById: async (id) => {
    return fetchAPI(`/users/${id}`);
  },
  create: async (userData) => {
    return fetchAPI('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },
  update: async (id, updateData) => {
    return fetchAPI(`/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updateData),
    });
  },
};

// ==================== CLIENTES ====================
export const clientsAPI = {
  getAll: async () => {
    return fetchAPI('/clients');
  },
  getById: async (id) => {
    return fetchAPI(`/clients/${id}`);
  },
  create: async (clientData) => {
    return fetchAPI('/clients', {
      method: 'POST',
      body: JSON.stringify(clientData),
    });
  },
};

// ==================== SERVICIOS ====================
export const servicesAPI = {
  getAll: async () => {
    return fetchAPI('/services');
  },
  getActive: async () => {
    return fetchAPI('/services/active');
  },
  getById: async (id) => {
    return fetchAPI(`/services/${id}`);
  },
  create: async (serviceData) => {
    return fetchAPI('/services', {
      method: 'POST',
      body: JSON.stringify(serviceData),
    });
  },
  update: async (id, updateData) => {
    return fetchAPI(`/services/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updateData),
    });
  },
  delete: async (id) => {
    return fetchAPI(`/services/${id}`, {
      method: 'DELETE',
    });
  },
};

// ==================== LISTAS DE PRECIOS ====================
export const pricesAPI = {
  getByClient: async (clientId) => {
    return fetchAPI(`/clients/${clientId}/prices`);
  },
  create: async (clientId, priceData) => {
    return fetchAPI(`/clients/${clientId}/prices`, {
      method: 'POST',
      body: JSON.stringify(priceData),
    });
  },
  update: async (clientId, priceId, updateData) => {
    return fetchAPI(`/clients/${clientId}/prices/${priceId}`, {
      method: 'PATCH',
      body: JSON.stringify(updateData),
    });
  },
  delete: async (clientId, priceId) => {
    return fetchAPI(`/clients/${clientId}/prices/${priceId}`, {
      method: 'DELETE',
    });
  },
};

// ==================== REPORTES ====================
export const reportsAPI = {
  getAll: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    return fetchAPI(`/reports${queryParams ? `?${queryParams}` : ''}`);
  },
  getById: async (id) => {
    return fetchAPI(`/reports/${id}`);
  },
  create: async (reportData) => {
    return fetchAPI('/reports', {
      method: 'POST',
      body: JSON.stringify(reportData),
    });
  },
  update: async (id, updateData) => {
    return fetchAPI(`/reports/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updateData),
    });
  },
};

// ==================== MULTIMEDIA ====================
export const mediaAPI = {
  upload: async (reportId, formData) => {
    const token = getToken();
    const response = await fetch(`${API_URL}/reports/${reportId}/media`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Error en la petición' }));
      throw new Error(error.error || `Error ${response.status}`);
    }

    return response.json();
  },
};

// ==================== HISTORIAL ====================
export const historyAPI = {
  create: async (reportId, historyData) => {
    return fetchAPI(`/reports/${reportId}/history`, {
      method: 'POST',
      body: JSON.stringify(historyData),
    });
  },
};

