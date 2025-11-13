import axios from 'axios';

//const API_BASE_URL = 'http://localhost:5000/api';
console.log(import.meta.env);

const API_BACK_URL = `${import.meta.env.VITE_API_BACK_URL?.replace(/\/$/, '')}/api` || 'http://localhost:5000/api';

console.log('aervice [api.jsx]',API_BACK_URL);

const api = axios.create({
  baseURL: API_BACK_URL,
  headers: {    
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Health check with better error handling
export const checkAPIHealth = async () => {
  try {
    const response = await api.get('/health');
    return response.data;
  } catch (error) {
    console.error('Health check failed:', error);
    throw new Error('Backend server is not reachable');
  }
};

// Auth APIs
export const authAPI = {
  login: (credentials) => api.post('auth/login', credentials),
};


// Parameterized routes


// Project APIs
export const projectAPI = {
  // Specific routes first
  getAll: () => api.get('/projects'),

  // ✅ Corrected to support file uploads
  create: (formData) =>
    api.post('/projects', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  //create: (project) => api.post('/projects', project),
  getById: (id) => api.get(`/projects/${id}`),
  delete: (id) => api.delete(`/projects/${id}`),
  getDetails: (id) => api.get(`/projects/${id}/details`),
  updateDetails: (id, details) => api.put(`/projects/${id}/details`, details),
  addRemark:(remarkData)=>api.post('/projects/remark',remarkData),
  getRemarks: (project) => api.get(`/projects/remarks/${project}`),
  resolveRemark: (id) =>  api.put(`/projects/remarks/${id}/resolve`), 
  getProgress: (id) => api.get(`/projects/${id}/progress`),     
  
};
const token = localStorage.getItem("token");
  // Individual section APIs
export const projectSectionsAPI = {
  // Roadshow Information //router.put('/:id/roadshow', projectController.updateRoadshowInfo);
  updateRoadshow: (id, formData) => 
    api.put(`/projects/${id}/roadshow`, formData,{
          headers: { 'Content-Type': 'multipart/form-data' },
  }),

  // Associates //router.put('/:id/associates', projectController.updateAssociates);
  updateAssociates: (id, associates) => api.put(`/projects/${id}/associates`, { associates }),
  
  // Venues //router.put('/:id/venues', projectController.updateVenues);
  updateVenues: (id, venues) => api.put(`/projects/${id}/venues`, { venues }),
  
  // Trade Database //router.put('/:id/trade-database', projectController.updateTradeDatabase);
  updateTradeDatabase: (id, tradeDatabase) => api.put(`/projects/${id}/trade-database`, { trade_database: tradeDatabase }),
  
  // RSVP //router.put('/:id/rsvp', projectController.updateRSVP);
  //updateRSVP: (id, rsvp) => api.put(`/projects/${id}/rsvp`, { rsvp }),
 updateRSVP : (id, formData) =>
  api.put(`/projects/${id}/rsvp`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),

  updateMainInvite : (id, formData) =>
  api.put(`/projects/${id}/maininvite`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  
  
  // AV Setup //router.put('/:id/av-setup', projectController.updateAVSetup);
  //updateAVSetup: (id, avSetup) => api.put(`/projects/${id}/av-setup`, { av_setup: avSetup }),
  updateAVSetup: (id, formData) =>
     api.put(`/projects/${id}/av-setup`, formData,{
      headers: { 'Content-Type': 'multipart/form-data' },
     }),

   // Hotels //router.put('/:id/hotels', projectController.updateHotles);
  updateHotels: (id, hotels) => api.put(`/projects/${id}/hotels`, { hotels }),
  
  // Embassy //router.put('/:id/embassy', projectController.updateEmbassy);
  updateEmbassy: (id, embassy) => api.put(`/projects/${id}/embassy`, { embassy }),
  
  // Client //router.put('/:id/clients', projectController.updateClients);
  updateClients: (id, clients) => api.put(`/projects/${id}/clients`, { clients }),

// Stark //router.put('/:id/starks', projectController.updateStarks);
  updateStarks: (id, starks) => api.put(`/projects/${id}/starks`, { starks }),
  

  // Checklists //router.put('/:id/checklists', projectController.updateChecklists);
  updateChecklists: (id, checklists) => api.put(`/projects/${id}/checklists`, { checklists }),
  
  // Menu Upload
  //router.post('/:id/menu', _upload.single('menu'), projectController.uploadMenu);
  uploadMenu: (id, formData) => api.post(`/projects/${id}/menu`, formData, {    
     headers: {
        Authorization: `Bearer ${token}`,
         'Content-Type': 'multipart/form-data',
      }
  })
};

export default api;