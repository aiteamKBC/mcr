import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || '';
const MCR_API_BASE = import.meta.env.VITE_MCR_API_BASE || '/api/mcr';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// MCR API endpoints
export const mcrApi = {
  // Dashboard endpoints
  getDashboardKPIs: (params?: Record<string, unknown>) => 
    apiClient.get(`${MCR_API_BASE}/dashboard/kpis`, { params }),
  
  getDashboardCharts: (params?: Record<string, unknown>) => 
    apiClient.get(`${MCR_API_BASE}/dashboard/charts`, { params }),
  
  getRecentActivity: (limit = 10) => 
    apiClient.get(`${MCR_API_BASE}/dashboard/recent-activity`, { params: { limit } }),

  // Reviews endpoints
  getReviews: (params?: Record<string, unknown>) => 
    apiClient.get(`${MCR_API_BASE}/reviews`, { params }),
  
  getReviewById: (id: string | number) => 
    apiClient.get(`${MCR_API_BASE}/reviews/${id}`),
  
  exportReview: (id: string | number) => 
    apiClient.get(`${MCR_API_BASE}/reviews/${id}/export`, { responseType: 'blob' }),
  
  updateReview: (id: string | number, data: Record<string, unknown>) => 
    apiClient.patch(`${MCR_API_BASE}/reviews/${id}`, data),

  // Communication log endpoints
  getCommunicationLog: (reviewId: string | number) => 
    apiClient.get(`${MCR_API_BASE}/reviews/${reviewId}/communications`),
  
  addCommunicationLog: (reviewId: string | number, data: Record<string, unknown>) => 
    apiClient.post(`${MCR_API_BASE}/reviews/${reviewId}/communications`, data),

  // Filter options endpoints
  getCoaches: () => 
    apiClient.get(`${MCR_API_BASE}/filters/coaches`),
  
  getProgrammes: () => 
    apiClient.get(`${MCR_API_BASE}/filters/programmes`),
  
  getGroups: () => 
    apiClient.get(`${MCR_API_BASE}/filters/groups`),
};

// Request interceptor
apiClient.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
);




