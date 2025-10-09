import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import api from '../services/api';

import './AdminDashboard.css';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Add timeout to prevent hanging when backend is not available
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 3000)
      );
      
      const statsPromise = api.getAdminStats();
      const data = await Promise.race([statsPromise, timeoutPromise]);
      setStats(data || {});
    } catch (error) {
      console.error('Error fetching admin data:', error);
      if (error.message.includes('timeout')) {
        setError('Failed to load admin data. Backend server may not be running.');
      } else if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        setError('Authentication failed. Please login again.');
      } else if (error.message.includes('403') || error.message.includes('Admins only')) {
        setError('Access denied. Admin privileges required.');
      } else if (error.message.includes('Request failed')) {
        setError('Backend server connection failed. Please ensure the server is running.');
      } else {
        setError('Failed to load admin data. Please check your connection.');
      }
      // Set empty stats so UI shows default values instead of hanging
      setStats({});
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="main-content">
        <div className="loading">Loading admin dashboard...</div>
      </div>
    );
  }

  return (
    <div className="main-content">
      {/* Welcome Section */}
      <div className="welcome-section">
        <div className="welcome-card">
          <h1>Welcome Admin!</h1>
          <p>You have full control over the system. Here's an overview of your platform:</p>
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      {/* Statistics Grid - Focused on Projects and Requests */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-number">{stats.total_projects || 0}</div>
          <div className="stat-label">All Projects</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">➕</div>
          <div className="stat-number">{stats.completed_projects || 0}</div>
          <div className="stat-label">Completed Projects</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-number">{stats.total_users || 0}</div>
          <div className="stat-label">Total Freelancers</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👨‍💼</div>
          <div className="stat-number">{stats.total_managers || 0}</div>
          <div className="stat-label">Total Managers</div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 