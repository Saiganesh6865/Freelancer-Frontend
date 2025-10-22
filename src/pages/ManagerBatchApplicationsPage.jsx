import React, { useState, useEffect } from "react";
import api from "../services/api";
import "./ManagerBatchApplicationsPage.css";

const ManagerBatchApplications = () => {
  const [batches, setBatches] = useState([]);
  const [selectedBatchId, setSelectedBatchId] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    try {
      const res = await api.getManagerBatches();
      setBatches(res?.data || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load batches");
    }
  };

  const fetchApplications = async (batchId) => {
    if (!batchId) return;
    try {
      setLoading(true);
      const res = await api.listBatchApplications(batchId);
      setApplications(res?.data?.applications || []);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch applications");
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBatchSelect = (e) => {
    const batchId = parseInt(e.target.value);
    setSelectedBatchId(batchId);
    fetchApplications(batchId);
  };

  const handleUpdateStatus = async (application_id, status) => {
    try {
      await api.updateApplicationStatus(application_id, status);
      fetchApplications(selectedBatchId); // Refresh applications for selected batch
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleString();
  };

  const renderAction = (app) => {
    if (app.status === "applied") {
      return (
        <div className="action-buttons">
          <button
            className="btn btn-accept"
            onClick={() => handleUpdateStatus(app.id, "accepted")}
          >
            Accept
          </button>
          <button
            className="btn btn-reject"
            onClick={() => handleUpdateStatus(app.id, "rejected")}
          >
            Reject
          </button>
        </div>
      );
    } else if (app.status === "accepted") {
      return <span className="status-badge accepted">Accepted</span>;
    } else if (app.status === "rejected") {
      return <span className="status-badge rejected">Rejected</span>;
    } else {
      return <span>{app.status}</span>;
    }
  };

  return (
    <div className="batch-applications-container">
      <h2>Batch Applications</h2>

      {error && <p className="error">{error}</p>}

      <div className="batch-select-wrapper">
        <label htmlFor="batchSelect">Select Batch:</label>
        <select
          id="batchSelect"
          value={selectedBatchId || ""}
          onChange={handleBatchSelect}
        >
          <option value="" disabled>
            -- Choose a batch --
          </option>
          {batches.map((batch) => (
            <option key={batch.id} value={batch.id}>
              {batch.project_name} ({batch.project_type})
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <p>Loading applications...</p>
      ) : selectedBatchId && applications.length === 0 ? (
        <p>No applications for this batch.</p>
      ) : (
        applications.length > 0 && (
          <table className="batch-table">
            <thead>
              <tr>
                <th>Application ID</th>
                <th>Freelancer ID</th>
                <th>Status</th>
                <th>Applied At</th>
                <th>Updated At</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => (
                <tr key={app.id}>
                  <td>{app.id}</td>
                  <td>{app.freelancer_id}</td>
                  <td>{app.status}</td>
                  <td>{formatDate(app.applied_at)}</td>
                  <td>{formatDate(app.updated_at)}</td>
                  <td>{renderAction(app)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )
      )}
    </div>
  );
};

export default ManagerBatchApplications;

