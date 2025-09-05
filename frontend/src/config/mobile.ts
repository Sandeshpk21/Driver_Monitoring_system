import { Capacitor } from '@capacitor/core';

// Configuration for API and WebSocket connections
// Update these values based on your deployment setup

export const getMobileConfig = () => {
  const isNative = Capacitor.isNativePlatform();
  const platform = Capacitor.getPlatform();
  
  if (isNative) {
    // For mobile app - use actual server IP address
    // Replace with your actual backend server IP/domain
    // For development: use your computer's local IP (e.g., 192.168.1.100)
    // For production: use your hosted server URL
    
    // const BACKEND_HOST = 'p2vzpcsr-8000.inc1.devtunnels.ms'; // UPDATE THIS with your actual IP https://p2vzpcsr-8000.inc1.devtunnels.ms/
    // const BACKEND_PORT = '8000';
    
    return {
      API_BASE_URL: `https://p2vzpcsr-8000.inc1.devtunnels.ms/api`,
      WS_URL: `wss://p2vzpcsr-8000.inc1.devtunnels.ms/ws`,
      IS_MOBILE: true,
      PLATFORM: platform
    };
  } else {
    // For web browser - use relative URLs or the devtunnels URL
    const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    
    if (isDevelopment) {
      // Local development with Vite proxy
      return {
        API_BASE_URL: '/api',
        WS_URL: `ws://${window.location.hostname}:3000/ws`,
        IS_MOBILE: false,
        PLATFORM: 'web'
      };
    } else {
      // Production or deployed version
      return {
        API_BASE_URL: 'https://p2vzpcsr-8000.inc1.devtunnels.ms/api',
        WS_URL: 'wss://p2vzpcsr-8000.inc1.devtunnels.ms/ws',
        IS_MOBILE: false,
        PLATFORM: 'web'
      };
    }
  }
};

// Export configured values
export const mobileConfig = getMobileConfig();