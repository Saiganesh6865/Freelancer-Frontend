import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const useData = (endpoint, initialData = [], dependencies = []) => {
  const { user } = useAuth();
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const result = await api[endpoint]();
        setData(result);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user, endpoint, ...dependencies]);

  return { data, loading, error, setData };
};

export default useData;