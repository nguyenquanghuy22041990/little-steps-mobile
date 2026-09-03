import axios from 'axios';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const getBaseUrl = () => {
  if (__DEV__) {
    // Android Emulator uses 10.0.2.2, iOS Simulator uses localhost
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

// Interceptor for logging in DEV mode and attaching token
apiClient.interceptors.request.use(async (request) => {
  if (__DEV__) {
    console.log(`[API Request] ${request.method?.toUpperCase()} ${request.url}`);
  }
  
  const token = await AsyncStorage.getItem('userToken');
  if (token) {
    request.headers.Authorization = `Bearer ${token}`;
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

// Helper to construct the full URL for reading media from MinIO
export const getStorageUrl = (key: string) => {
  const host = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
  return `http://${host}:9000/littlesteps-media/${key}`;
};

// Helper to fix localhost URLs from backend to point to the correct local network IP
export const fixLocalhostUrl = (url: string) => {
  if (Platform.OS === 'android' && url.includes('localhost')) {
    return url.replace('localhost', '10.0.2.2');
  }
  return url;
};
