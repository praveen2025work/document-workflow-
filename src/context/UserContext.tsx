import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { config, debugLog } from '@/lib/config';

interface User {
  id: number;
  name: string;
  email: string;
}

interface UserContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

const UserContext = createContext<UserContextType>({
  user: null,
  loading: true,
  error: null,
  refetch: () => {},
});

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = async () => {
    const userInfoUrl = config.api.userServiceUrl;
    if (!userInfoUrl) {
      const errorMsg = "USER_INFO_SERVICE_URL is not defined";
      console.error(errorMsg);
      setError(errorMsg);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      debugLog('Fetching user info from:', userInfoUrl);
      
      const response = await axios.get(userInfoUrl, {
        timeout: 10000, // 10 second timeout for user service
      });
      
      debugLog('User info response:', response.data);
      setUser(response.data);
    } catch (error: any) {
      const errorMsg = `Failed to fetch user info: ${error.message}`;
      console.error(errorMsg, error);
      setError(errorMsg);
      
      // Set a mock user for development if service is unavailable
      if (config.isDevelopment) {
        debugLog('Setting mock user for development');
        setUser({
          id: 1,
          name: 'Development User',
          email: 'dev@workflow.com'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const refetch = () => {
    fetchUser();
  };

  return (
    <UserContext.Provider value={{ user, loading, error, refetch }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);