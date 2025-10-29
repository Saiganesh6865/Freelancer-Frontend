import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './FreelancerRequests.css';

const FreelancerRequests = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const showNotification = (message, type = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 4000);
  };

  const fetchRequests = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.getMyApplications();
      setRequests(data || []);
    } catch (err) {
      console.error('Error fetching applications:', err);
      setError('Failed to load your applications.');
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const renderStatus = (status) => {
    const normalized = (status || '').toLowerCase();
    const statusClasses = {
      pending: 'status-pending',
      approved: 'status-approved',
      rejected: 'status-rejected',
      accepted: 'status-approved',
    };
    return <span className={`badge ${statusClasses[normalized]}`}>{status}</span>;
  };

  // Pagination logic
  const totalPages = Math.ceil(requests.length / itemsPerPage) || 1;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentRequests = requests.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber) => {
    if (pageNumber < 1 || pageNumber > totalPages) return;
    setCurrentPage(pageNumber);
  };

  if (loading) return <div className="loading">Loading your applications...</div>;
  if (requests.length === 0) return <div className="empty-state">No applications found.</div>;

  return (
    <div className="freelancer-requests-wrapper">
      <h1 className="table-heading">My Project Applications</h1>

      {error && (
        <div className="alert alert-error">
          {error}
          <button onClick={fetchRequests} className="btn btn-sm btn-secondary">
            Retry
          </button>
        </div>
      )}

      <div className="table-container">
        <table className="requests-table">
          <thead>
            <tr>
              <th>Application ID</th>
              <th>Project Name</th>
              <th>Batch</th>
              <th>Status</th>
              <th>Requested Date</th>
              <th>Last Updated</th>
            </tr>
          </thead>
          <tbody>
            {currentRequests.map((req) => (
              <tr key={req.id}>
                <td>{req.id}</td>
                <td>{req.project_name || 'N/A'}</td>
                <td>Batch #{req.batch_id}</td>
                <td>{renderStatus(req.status)}</td>
                <td>{req.applied_at ? new Date(req.applied_at).toLocaleString() : 'N/A'}</td>
                <td>{req.updated_at ? new Date(req.updated_at).toLocaleString() : 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {requests.length > itemsPerPage && (
        <div className="pagination">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            &laquo; Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              className={currentPage === i + 1 ? 'active' : ''}
              onClick={() => handlePageChange(i + 1)}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next &raquo;
          </button>
        </div>
      )}

      {/* Toast */}
      {showToast && (
        <div className={`toast toast-${toastType}`}>
          {toastMessage}
          <button onClick={() => setShowToast(false)} className="toast-close">
            ×
          </button>
        </div>
      )}
    </div>
  );
};

export default FreelancerRequests;
