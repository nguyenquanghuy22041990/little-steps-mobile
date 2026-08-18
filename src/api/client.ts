import axios from 'axios';
import { Platform } from 'react-native';

// Android Emulator uses 10.0.2.2 to access host localhost. iOS simulator uses localhost.
// Replace this with your actual local IP address (e.g., 192.168.1.X) if testing on a physical device.
const getBaseUrl = () => {
  if (__DEV__) {
    return Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';
  }
  return 'https://api.littlesteps.com'; // Production URL placeholder
};

export const apiClient = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 10000,
});

// Interceptor for logging in DEV mode
apiClient.interceptors.request.use((request) => {
  if (__DEV__) {
    console.log(`[API Request] ${request.method?.toUpperCase()} ${request.url}`);
  }
  return request;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (__DEV__) {
      console.error(`[API Error] ${error.config?.method?.toUpperCase()} ${error.config?.url}:`, error.response?.status, error.response?.data || error.message);
    }
    return Promise.reject(error);
  }
);
