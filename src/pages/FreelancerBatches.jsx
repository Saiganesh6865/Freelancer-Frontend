import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import "./FreelancerBatches.css";

const FreelancerBatches = () => {
  const { user } = useAuth();
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const batchesPerPage = 10;

  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const res = await api.getMyBatches();
        setBatches(res.data || []);
      } catch (error) {
        console.error("Error loading batches:", error);
        setBatches([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBatches();
  }, []);

  // Pagination logic
  const totalPages = Math.ceil(batches.length / batchesPerPage) || 1;
  const indexOfLastBatch = currentPage * batchesPerPage;
  const indexOfFirstBatch = indexOfLastBatch - batchesPerPage;
  const currentBatches = batches.slice(indexOfFirstBatch, indexOfLastBatch);

  const handlePageChange = (pageNumber) => {
    if (pageNumber < 1 || pageNumber > totalPages) return;
    setCurrentPage(pageNumber);
  };

  if (loading)
    return <div className="loading">Loading your assigned batches...</div>;

  if (batches.length === 0)
    return (
      <div className="empty-state">
        <h3>No Batches Assigned Yet</h3>
        <p>Check the <b>Projects</b> tab to apply for available opportunities.</p>
      </div>
    );

  return (
    <div className="freelancer-batches-wrapper">
      <div className="batches-card">
        <h2 className="batches-title">My Assigned Batches</h2>

        <div className="table-container">
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
              {currentBatches.map((batch) => (
                <tr key={batch.id}>
                  <td>{batch.id}</td>
                  <td>{batch.project_name || "N/A"}</td>
                  <td>{batch.project_type || "N/A"}</td>
                  <td>{batch.skills_required || "N/A"}</td>
                  <td>
                    {batch.team_members?.length
                      ? batch.team_members.join(", ")
                      : "N/A"}
                  </td>
                  <td>
                    <span
                      className={`status-badge ${
                        (batch.status ? batch.status.trim().toLowerCase() : "active")
                      }`}
                    >
                      {batch.status ? batch.status.trim() : "Active"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="pagination-bar">
          <p className="entries-info">
            Showing {indexOfFirstBatch + 1} to{" "}
            {Math.min(indexOfLastBatch, batches.length)} of {batches.length} entries
          </p>
          <div className="pagination-controls">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              &lt;
            </button>
            <span className="page-number">{currentPage}</span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              &gt;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FreelancerBatches;
