import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Upload } from "lucide-react";
import api from "../services/api";
import "./FreelancerTaskDetails.css";

const STATUS_OPTIONS = ["Pending", "In Progress", "Completed"];

const StatusBadge = ({ status }) => {
  const statusStyles = {
    pending: { background: "#facc15", color: "#000" },
    "in progress": { background: "#3b82f6", color: "#fff" },
    completed: { background: "#10b981", color: "#fff" },
  };
  const style = statusStyles[status.toLowerCase()] || { background: "#e5e7eb", color: "#000" };
  return <span className="status-badge" style={style}>{status}</span>;
};

const FreelancerTaskDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [files, setFiles] = useState([]);
  const [editedTask, setEditedTask] = useState({});

  useEffect(() => {
    const fetchTask = async () => {
      setLoading(true);
      try {
        const res = await api.getFreelancerTaskById(id);
        if (res.success) {
          setTask(res.data);
          setEditedTask({ count: res.data.count, status: res.data.status });
        } else setError(res.message || "Task not found");
      } catch {
        setError("Failed to fetch task");
      } finally {
        setLoading(false);
      }
    };
    fetchTask();
  }, [id]);

  const handleFieldChange = (field, value) => setEditedTask({ ...editedTask, [field]: value });

  const handleUpdate = async () => {
    try {
      await api.updateFreelancerTask(task.id, editedTask);
      setTask({ ...task, ...editedTask });
      alert("Task updated successfully!");
    } catch (err) {
      console.error("Update failed", err);
      alert("Failed to update task");
    }
  };

  const handleFileChange = (e) => setFiles(Array.from(e.target.files));

  const handleFileUpload = async () => {
    if (files.length === 0) return;
    const formData = new FormData();
    files.forEach((f) => formData.append("files", f));
    try {
      await api.updateFreelancerTask(task.id, formData);
      setFiles([]);
      const res = await api.getFreelancerTaskById(id);
      if (res.success) setTask(res.data);
    } catch (err) {
      console.error("File upload failed", err);
    }
  };

  if (loading) return <div className="loading">Loading task...</div>;
  if (error) return <div className="empty-state">{error}</div>;
  if (!task) return null;

  return (
    <div className="task-detail-page">
      <button className="back-btn" onClick={() => navigate(-1)}>
        <ArrowLeft size={18} /> Back
      </button>

      <div className="task-card">
        <div className="task-header">
          <h2>{task.title}</h2>
          <StatusBadge status={task.status} />
        </div>

        <div className="task-info-grid">
          <div><strong>Task ID:</strong> {task.id}</div>
          <div><strong>Batch:</strong> {task.batch?.project_name || "—"}</div>
          <div><strong>Assigned At:</strong> {new Date(task.assign_date).toLocaleString()}</div>
        </div>

        <div className="task-description">
          <strong>Description:</strong>
          <p>{task.description}</p>
        </div>

        <div className="task-edit-section">
          <div className="task-edit">
            <label>Count</label>
            <input
              type="number"
              min={0}
              value={editedTask.count}
              onChange={(e) => handleFieldChange("count", e.target.value)}
              className="editable-input"
            />
          </div>

          <div className="task-edit">
            <label>Status</label>
            <select
              value={editedTask.status}
              onChange={(e) => handleFieldChange("status", e.target.value)}
              className="status-select"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="task-upload">
          <label>Attachments (optional)</label>
          <input type="file" multiple onChange={handleFileChange} className="file-input" />
          {files.length > 0 && (
            <button onClick={handleFileUpload} className="upload-btn">
              <Upload size={16} /> Upload Files
            </button>
          )}
        </div>

        <div className="button-group">
          <button className="update-btn" onClick={handleUpdate}>💾 Update Task</button>
        </div>

        

        {task.files && task.files.length > 0 && (
          <div className="uploaded-files">
            {task.files.map((file, i) => (
              <div key={i} className="file-item">
                {file.url.match(/\.(jpeg|jpg|png|gif)$/i) ? (
                  <img src={file.url} alt={file.name} className="file-preview" />
                ) : (
                  <a href={file.url} target="_blank" rel="noreferrer" className="file-link">{file.name}</a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FreelancerTaskDetail;
