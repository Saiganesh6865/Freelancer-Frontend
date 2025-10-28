import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

import './FreelancerBatches.css';

const FreelancerBatches = () => {
  const { user } = useAuth();
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const batchesPerPage = 5;

  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const res = await api.getMyBatches(); // API call
        setBatches(res.data || []);
      } catch (error) {
        console.error('Error loading batches:', error);
        setBatches([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBatches();
  }, []);

  // Pagination calculations
  const totalPages = Math.ceil(batches.length / batchesPerPage) || 1;
  const indexOfLastBatch = currentPage * batchesPerPage;
  const indexOfFirstBatch = indexOfLastBatch - batchesPerPage;
  const currentBatches = batches.slice(indexOfFirstBatch, indexOfLastBatch);

  const handlePageChange = (pageNumber) => {
    if (pageNumber < 1 || pageNumber > totalPages) return;
    setCurrentPage(pageNumber);
  };

  if (loading) {
    return <div className="loading">Loading batches...</div>;
  }

  if (batches.length === 0) {
    return (
      <div className="empty-state">
        <p>You haven't been assigned to any batches yet.</p>
        <p className="text-muted">Check the Projects tab to apply for available projects.</p>
      </div>
    );
  }

  return (
    <div className="main-content">
      <h3>My Assigned Batches</h3>
      <div className="table-wrapper">
        <table className="batches-table">
          <thead>
            <tr>
              <th>Batch ID</th>
              <th>Project Name</th>
              <th>Project Type</th>
              <th>Skills Required</th>
              <th>Team Members</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {currentBatches.map(batch => (
              <tr key={batch.id}>
                <td>{batch.id}</td>
                <td>{batch.project_name || '-'}</td>
                <td>{batch.project_type || '-'}</td>
                <td>{batch.skills_required || '-'}</td>
                <td>
                  {batch.team_members && batch.team_members.length > 0
                    ? batch.team_members.join(', ')
                    : '-'}
                </td>
                <td>{batch.status || 'active'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="pagination">
        <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
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
    </div>
  );
};

export default FreelancerBatches;
