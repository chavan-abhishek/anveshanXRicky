import axios from 'axios';

// Detect environment
const isDevelopment = import.meta.env.DEV;
const DIRECT_BACKEND_URL = 'http://ec2-44-200-95-176.compute-1.amazonaws.com:8080/api';

// Use direct URL in dev, proxy in production
const API_BASE_URL = isDevelopment ? DIRECT_BACKEND_URL : '/api';

console.log('🔧 Environment:', isDevelopment ? 'DEVELOPMENT' : 'PRODUCTION');
console.log('📡 API Base URL:', API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method.toUpperCase()} request to ${config.url}`);
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('API Error Details:', {
      message: error.message,
      code: error.code,
      config: error.config,
      response: error.response
    });
    
    if (error.code === 'ECONNREFUSED') {
      console.error('Connection refused - is your backend server running?');
    }
    
    return Promise.reject(error);
  }
);

// Driver Service
export const driverService = {
  getAllDrivers: () => api.get('/drivers'),
  getDriverById: (id) => api.get(`/drivers/${id}`),
  createDriver: (driver) => api.post('/drivers', driver),
  updateDriver: (id, driver) => api.put(`/drivers/${id}`, driver),
  deleteDriver: (id) => api.delete(`/drivers/${id}`),
  searchDriversByName: (name) => api.get(`/drivers/search/name?driverName=${name}`),
  searchDriversByPhone: (phone) => api.get(`/drivers/search/phone?driverPhone=${phone}`),
  searchDriversByLicense: (license) => api.get(`/drivers/search/license?licenseNumber=${license}`),
  searchDriversByVehicle: (vehicleNumber) => api.get(`/drivers/search/vehicle?vehicleNumber=${vehicleNumber}`),
  validatePhoneNumber: (phone, excludeDriverId) => {
    const params = new URLSearchParams({ phone });
    if (excludeDriverId) params.append('excludeDriverId', excludeDriverId);
    return api.get(`/drivers/validate/phone?${params}`);
  }
};

// Vehicle Service
export const vehicleService = {
  getAllVehicles: () => api.get('/vehicles'),
  getVehicleById: (id) => api.get(`/vehicles/${id}`),
  assignVehicleToDriver: (driverId, vehicle) => api.post(`/vehicles/assign/${driverId}`, vehicle),
  deleteVehicle: (id) => api.delete(`/vehicles/${id}`)
};

// Fare Rate Service
export const fareRateService = {
  getCurrentRate: () => api.get('/fare/get'),
  updateRate: (newRate) => api.post(`/fare/change?newRate=${newRate}`)
};

// Ride Fare Data Service
export const rideFareService = {
  getRecentRides: () => api.get('/fares/autometer/recent'),
  getRidesByDriver: (driverId) => api.get(`/fares/autometer/driver/${driverId}`),
  submitRideData: (rideData) => api.post('/fares/autometer', rideData)
};

// SOS Service
export const sosService = {
  sendSosAlert: (alertData) => api.post('/sos/alert', alertData),
  getAllAlerts: () => api.get('/sos/alerts'),
  getActiveAlerts: () => api.get('/sos/alerts/active'),
  acknowledgeAlert: (alertId) => api.put(`/sos/alerts/${alertId}/acknowledge`)
};

export default api;
