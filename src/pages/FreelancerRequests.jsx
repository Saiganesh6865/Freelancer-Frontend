import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

import './Projects.css';
import './FreelancerRequests.css';

const FreelancerRequests = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  const showNotification = (message, type = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 4000);
  };

  const fetchRequests = async () => {
    try {
      console.log('Fetching freelancer requests...');
      const requestsData = await api.getFreelancerRequests();
      console.log('Received requests data:', requestsData);
      setRequests(requestsData || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching requests:', error);
      setRequests([]);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
    
    // Set up real-time updates for request status changes
    const interval = setInterval(() => {
      fetchRequests();
    }, 15000); // Check every 15 seconds
    
    // Listen for custom events from manager actions
    const handleRequestUpdate = (event) => {
      const { requestId, status, message } = event.detail;
      setRequests(prev => prev.map(req => 
        req.id === requestId ? { ...req, status } : req
      ));
      
      // Show notification to freelancer
      if (status === 'accepted') {
        showNotification(`✅ Your request has been approved!`, 'success');
      } else if (status === 'rejected') {
        showNotification(`❌ Your request has been declined.`, 'error');
      }
    };
    
    window.addEventListener('requestStatusUpdated', handleRequestUpdate);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('requestStatusUpdated', handleRequestUpdate);
    };
  }, []);

  const renderStatus = (status) => {
    const statusClasses = {
      pending: 'status-pending',
      approved: 'status-approved',
      rejected: 'status-rejected',
      accepted: 'status-approved'
    };
    return <span className={statusClasses[status]}>{status}</span>;
  };

  if (loading) {
    return (
      <div className="main-content">
        <div className="loading">Loading your requests...</div>
      </div>
    );
  }

  return (
    <div className="main-content">
      <div className="card">
        <div className="card-header">
          <h1 className="card-title">My Project Requests</h1>
          <p>Track the status of your project applications</p>
        </div>

        {error && (
          <div className="alert alert-error">
            {error}
            <button 
              onClick={fetchRequests} 
              className="btn btn-sm btn-secondary" 
              style={{marginLeft: '10px'}}
            >
              Retry
            </button>
          </div>
        )}

        {requests.length > 0 ? (
          <div className="table-container">
            <table className="requests-table">
              <thead>
                <tr>
                  <th>Project Name</th>
                  <th>Status</th>
                  <th>Message</th>
                  <th>Requested Date</th>
                  <th>Last Updated</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((request) => (
                  <tr key={request.id}>
                    <td>
                      <div className="project-info">
                        <strong>{request.project_name || `Project #${request.project_id}`}</strong>
                      </div>
                    </td>
                    <td>
                      {renderStatus(request.status)}
                    </td>
                    <td>
                      <div className="request-message">
                        {request.message || 'No message'}
                      </div>
                    </td>
                    <td>
                      {request.created_at ? new Date(request.created_at).toLocaleDateString() : 'N/A'}
                    </td>
                    <td>
                      {request.updated_at ? new Date(request.updated_at).toLocaleDateString() : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h3>No requests found</h3>
            <p>You haven't submitted any project requests yet.</p>
          </div>
        )}

        {showToast && (
          <div className={`toast toast-${toastType}`}>
            {toastMessage}
            <button onClick={() => setShowToast(false)} className="toast-close">×</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FreelancerRequests;
