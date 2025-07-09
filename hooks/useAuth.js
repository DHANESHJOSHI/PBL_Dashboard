import { useState, useEffect } from 'react';

export function useAdminAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminData, setAdminData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAdminAuth();
  }, []);

  const checkAdminAuth = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const storedData = localStorage.getItem('adminData');

      if (!token || !storedData) {
        setIsLoading(false);
        return;
      }

      // Verify token with server
      const response = await fetch('/api/admin/verify', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setIsAuthenticated(true);
        setAdminData(data.data.admin);
      } else {
        // Token is invalid, clear storage
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminData');
        localStorage.removeItem('adminLoggedIn');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      // Clear storage on error
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminData');
      localStorage.removeItem('adminLoggedIn');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    localStorage.removeItem('adminLoggedIn');
    setIsAuthenticated(false);
    setAdminData(null);
  };

  return { isAuthenticated, adminData, isLoading, logout, checkAdminAuth };
}

export function useTeamAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [teamData, setTeamData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkTeamAuth();
  }, []);

  const checkTeamAuth = async () => {
    try {
      const token = localStorage.getItem('teamToken');
      const storedData = localStorage.getItem('teamData');

      if (!token || !storedData) {
        setIsLoading(false);
        return;
      }

      // Verify token with server
      const response = await fetch('/api/team/verify', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setIsAuthenticated(true);
        setTeamData(data.data.team);
      } else {
        // Token is invalid, clear storage
        localStorage.removeItem('teamToken');
        localStorage.removeItem('teamData');
        localStorage.removeItem('teamLoggedIn');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      // Clear storage on error
      localStorage.removeItem('teamToken');
      localStorage.removeItem('teamData');
      localStorage.removeItem('teamLoggedIn');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('teamToken');
    localStorage.removeItem('teamData');
    localStorage.removeItem('teamLoggedIn');
    setIsAuthenticated(false);
    setTeamData(null);
  };

  return { isAuthenticated, teamData, isLoading, logout, checkTeamAuth };
}