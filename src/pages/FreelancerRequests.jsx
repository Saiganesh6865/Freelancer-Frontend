import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import "./FreelancerRequests.css";

const FreelancerRequests = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await api.getMyApplications();
      setRequests(data || []);
    } catch (err) {
      console.error("Error fetching applications:", err);
      setError("Failed to load your applications.");
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ fixed status rendering
  const renderStatus = (status) => {
    // Defensive checks
    if (!status || typeof status !== "string")
      return <span className="status-badge status-default">N/A</span>;

    // 🔥 normalize properly: remove spaces, newlines, and lowercase
    const normalized = status.replace(/\s+/g, "").toLowerCase();

    // map all possible variations
    const statusClassMap = {
      accepted: "status-accepted",     // 🟢
      approved: "status-accepted",     // 🟢
      applied: "status-pending",       // 🟡
      pending: "status-pending",       // 🟡
      rejected: "status-rejected",     // 🔴
      completed: "status-completed",   // 🔵
    };

    const badgeClass = statusClassMap[normalized] || "status-default";

    // Capitalize label safely
    const label =
      normalized.charAt(0).toUpperCase() + normalized.slice(1) || "N/A";

    return <span className={`status-badge ${badgeClass}`}>{label}</span>;
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

  if (loading)
    return <div className="loading">Loading your applications...</div>;
  if (requests.length === 0)
    return <div className="empty-state">No applications found.</div>;

  return (
    <div className="freelancer-requests-wrapper">
      <div className="requests-card">
        <h2 className="requests-title">My Project Applications</h2>

        {error && <div className="error-box">{error}</div>}

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
                  <td>{req.project_name || "N/A"}</td>
                  <td>Batch #{req.batch_id}</td>
                  <td>{renderStatus(req.status)}</td>
                  <td>
                    {req.applied_at
                      ? new Date(req.applied_at).toLocaleDateString()
                      : "N/A"}
                  </td>
                  <td>
                    {req.updated_at
                      ? new Date(req.updated_at).toLocaleDateString()
                      : "N/A"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* === Pagination === */}
        <div className="pagination-bar">
          <p className="entries-info">
            Showing {indexOfFirstItem + 1}–
            {Math.min(indexOfLastItem, requests.length)} of {requests.length} entries
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

export default FreelancerRequests;
