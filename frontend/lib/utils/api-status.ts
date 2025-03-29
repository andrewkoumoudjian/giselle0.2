import { useState, useEffect } from 'react';
import api from '../api';

type ApiStatus = 'online' | 'offline' | 'checking';

// Check if the API is online
export const useApiStatus = () => {
  const [status, setStatus] = useState<ApiStatus>('checking');
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  
  const checkStatus = async () => {
    try {
      setStatus('checking');
      await api.healthCheck();
      setStatus('online');
    } catch (error) {
      console.error('API status check failed:', error);
      setStatus('offline');
    } finally {
      setLastChecked(new Date());
    }
  };
  
  // Initial check
  useEffect(() => {
    checkStatus();
    
    // Set up periodic checks every 60 seconds
    const interval = setInterval(() => {
      checkStatus();
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);
  
  return {
    status,
    lastChecked,
    checkStatus
  };
}; 