// src/components/ManagerRequests.jsx
import React from 'react';
import { useAuth } from '../context/AuthContext';
import useData from '../hooks/useData'; // Import the custom hook
import { useToast } from '../components/ToastProvider'; // Import the toast hook
import api from '../services/api';
import './ManagerRequests.css';

const ManagerRequests = () => {
  const { user } = useAuth();
  const { showToast } = useToast(); // Get the showToast function

  // Use useData hook to fetch requests
  const { data: requests, loading, error, refetch: refetchRequests } = useData(api.getManagerRequests, []);

  const handleAcceptRequest = async (requestId, freelancerName, projectName) => {
    try {
      await api.approveProjectRequest(requestId); // Use the updated API service
      showToast(`✅ ${freelancerName}'s request for ${projectName} approved!`, 'success');
      refetchRequests(); // Re-fetch data to update the list
    } catch (err) {
      showToast(`❌ Error approving request: ${err.message}`, 'error');
    }
  };

  const handleRejectRequest = async (requestId, freelancerName, projectName) => {
    try {
      await api.rejectProjectRequest(requestId); // Use the updated API service
      showToast(`❌ ${freelancerName}'s request for ${projectName} rejected.`, 'error');
      refetchRequests(); // Re-fetch data
    } catch (err) {
      showToast(`❌ Error rejecting request: ${err.message}`, 'error');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (e) {
      console.error("Error formatting date:", dateString, e);
      return 'Invalid Date';
    }
  };

  if (loading) return <div className="loading">Loading requests...</div>;
  if (error) return <div className="error">Error: {error.message}</div>;

  return (
    <div className="manager-requests-container">
      <h2>Project Requests</h2>
      <div className="requests-table-container">
        <table className="requests-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Freelancer</th>
              <th>Project Name</th>
              <th>Skills</th>
              <th>Submitted Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.length > 0 ? (
              requests.map(request => (
                <tr key={request.id}>
                  <td>{request.id}</td>
                  <td>{request.freelancer_name || 'N/A'}</td>
                  <td>{request.project_name || 'N/A'}</td>
                  <td>{request.freelancer_skills || 'N/A'}</td>
                  <td>{formatDate(request.created_at)}</td>
                  <td>
                    <span className={`status-badge ${request.status}`}>{request.status}</span>
                  </td>
                  <td>
                    {request.status === 'pending' ? (
                      <div className="action-buttons">
                        <button
                          className="btn btn-sm btn-success"
                          onClick={() => handleAcceptRequest(
                            request.id,
                            request.freelancer_name,
                            request.project_name
                          )}
                        >
                          ✅ Accept
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleRejectRequest(
                            request.id,
                            request.freelancer_name,
                            request.project_name
                          )}
                        >
                          ❌ Reject
                        </button>
                      </div>
                    ) : (
                      <span className="no-actions">-</span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="empty-requests">
                  <div className="empty-state">
                    <h4>No requests found</h4>
                    <p>No new project requests at the moment.</p>
                    <button onClick={refetchRequests} className="retry-btn">Refresh</button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManagerRequests;