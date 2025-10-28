import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Folder,
  Users,
  ClipboardList,
  Clock,
  Edit,
  Save,
  X,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import api from "../services/api";
import "./ProjectDetail.css";

// ✅ Utility: send only changed fields
const getChangedFields = (original, updated) => {
  const changed = {};
  for (const key in updated) {
    if (JSON.stringify(original[key]) !== JSON.stringify(updated[key])) {
      changed[key] = updated[key];
    }
  }
  return changed;
};

// Status badge component
const StatusBadge = ({ status }) => {
  const statusStyles = {
    active: { background: "#22c55e", color: "#fff" },      // green
    pending: { background: "#facc15", color: "#000" },     // yellow
    completed: { background: "#3b82f6", color: "#fff" },   // blue
    closed: { background: "#6b7280", color: "#fff" },      // gray
    open: { background: "#8b5cf6", color: "#fff" },        // purple
  };

  const style = statusStyles[status?.toLowerCase()] || { background: "#e5e7eb", color: "#000" };
  const displayText = status ? status.charAt(0).toUpperCase() + status.slice(1) : "Unknown";

  return (
    <span className={`status-badge status-${status?.toLowerCase()}`}>
      {displayText}
    </span>
  );
};

// Info item component
const InfoItem = ({ icon: Icon, label, value }) => (
  <div className="info-item">
    <Icon size={18} className="info-icon" />
    <div>
      <p className="info-label">{label}</p>
      <p className="info-value">{value || "—"}</p>
    </div>
  </div>
);

// Task component
const TaskItem = ({ task, onTaskUpdate }) => {
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState(task);
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const changedData = getChangedFields(task, formData);
      if (Object.keys(changedData).length === 0) {
        alert("⚠️ No changes detected!");
        setEditMode(false);
        setSaving(false);
        return;
      }

      const res = await api.updateManagerBatch(formData.batch_id, { tasks: [{ id: formData.id, ...changedData }] });
      if (res?.success) {
        onTaskUpdate(formData.id, { ...task, ...changedData });
        setEditMode(false);
      } else {
        alert("❌ Failed to update task");
      }
    } catch (err) {
      console.error(err);
      alert("❌ Error updating task");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="task-item">
      {editMode ? (
        <div className="edit-form">
          <input name="title" value={formData.title} onChange={handleChange} placeholder="Task Title" />
          <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Description" />
          <select name="status" value={formData.status} onChange={handleChange}>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="closed">Closed</option>
          </select>
          <div className="edit-controls">
            <button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : <><Save size={16} /> Save</>}
            </button>
            <button onClick={() => { setEditMode(false); setFormData(task); }}>
              <X size={16} /> Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          <div>
            <h5>{task.title}</h5>
            <p className="task-desc">{task.description}</p>
            <p><strong>Assigned To:</strong> {task.freelancer?.username || "Unassigned"}</p>
            <p><strong>Assigned Date:</strong> {task.assign_date ? new Date(task.assign_date).toLocaleDateString() : "—"}</p>
            <p><strong>Count:</strong> {task.count}</p>
          </div>
          <div className="task-meta">
            <StatusBadge status={task.status} />
            <button className="edit-btn" onClick={() => setEditMode(true)}>
              <Edit size={16} /> Edit
            </button>
          </div>
        </>
      )}
    </div>
  );
};

// Member item
const MemberItem = ({ member }) => <div className="member-item">👤 {member.username}</div>;

// Batch card
const BatchCard = ({ batch, onBatchUpdate }) => {
  const [expanded, setExpanded] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState(batch);
  const [saving, setSaving] = useState(false);

  const taskTeamMembers = Array.from(
    new Map(batch.tasks.filter(t => t.freelancer).map(t => [t.freelancer.id, t.freelancer])).values()
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const changedData = getChangedFields(batch, formData);
      if (Object.keys(changedData).length === 0) {
        alert("⚠️ No changes detected!");
        setEditMode(false);
        setSaving(false);
        return;
      }

      const res = await api.updateManagerBatch(batch.id, changedData);
      if (res?.success) {
        onBatchUpdate(batch.id, { ...batch, ...changedData });
        setEditMode(false);
      } else {
        alert("❌ Failed to update batch");
      }
    } catch (err) {
      console.error(err);
      alert("❌ Error updating batch");
    } finally {
      setSaving(false);
    }
  };

  const handleTaskUpdate = (taskId, updatedTask) => {
    setFormData(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => t.id === taskId ? updatedTask : t)
    }));
    onBatchUpdate(batch.id, formData);
  };

  return (
    <div className="batch-card-full">
      <div className="batch-header" onClick={() => setExpanded(!expanded)}>
        <div>
          <h4>Batch #{batch.id}</h4>
          <p><strong>Count:</strong> {batch.count}</p>
          <p><strong>Deadline:</strong> {batch.deadline ? new Date(batch.deadline).toLocaleDateString() : "—"}</p>
        </div>
        <div className="batch-header-right">
          <StatusBadge status={batch.status || "active"} />
          {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>
      </div>

      {expanded && (
        <div className="batch-content">
          {editMode ? (
            <div className="edit-form">
              <input type="number" name="count" value={formData.count || 0} onChange={handleChange} placeholder="Batch Count" />
              <label>Deadline</label>
              <input
                type="date"
                name="deadline"
                value={formData.deadline ? formData.deadline.split("T")[0] : ""}
                onChange={handleChange}
                min={new Date().toISOString().split("T")[0]}
              />
              <select name="status" value={formData.status || "active"} onChange={handleChange}>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="closed">Closed</option>
              </select>
              <input type="text" name="skills_required" value={formData.skills_required || ""} onChange={handleChange} placeholder="Skills Required" />
              <input type="text" name="project_type" value={formData.project_type || ""} onChange={handleChange} placeholder="Project Type" />

              <div className="edit-controls">
                <button onClick={handleSave} disabled={saving}>
                  {saving ? "Saving..." : <><Save size={16} /> Save</>}
                </button>
                <button onClick={() => { setEditMode(false); setFormData(batch); }}>
                  <X size={16} /> Cancel
                </button>
              </div>
            </div>
          ) : (
            <button className="edit-btn" onClick={() => setEditMode(true)}>
              <Edit size={16} /> Edit Batch
            </button>
          )}

          <div className="batch-subsection">
            <h5>🗂 Tasks</h5>
            {formData.tasks.length === 0 ? <p>No tasks assigned yet.</p> : formData.tasks.map(task => (
              <TaskItem key={task.id} task={task} onTaskUpdate={handleTaskUpdate} />
            ))}
          </div>

          <div className="batch-subsection">
            <h5>👥 Team Members</h5>
            {taskTeamMembers.length === 0 ? <p>No team members assigned.</p> : taskTeamMembers.map(m => <MemberItem key={m.id} member={m} />)}
          </div>
        </div>
      )}
    </div>
  );
};

// Project detail page
const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [uploadedFiles, setUploadedFiles] = useState([]); // new files

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await api.getProjectById(id);
        if (res?.status === "success") {
          setProject(res.data);
          setFormData(res.data.project);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setUploadedFiles(files);
  };

  const handleSave = async () => {
    try {
      const changedData = getChangedFields(project.project, formData);

      // FormData for files
      const formPayload = new FormData();
      Object.keys(changedData).forEach(key => formPayload.append(key, changedData[key]));
      uploadedFiles.forEach(file => formPayload.append("files", file));

      if (Object.keys(changedData).length === 0 && uploadedFiles.length === 0) {
        alert("⚠️ No changes detected!");
        setEditMode(false);
        return;
      }

      const res = await api.updateProject(id, formPayload, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res?.status === "success") {
        setProject(prev => ({ ...prev, project: { ...prev.project, ...changedData } }));
        setUploadedFiles([]);
        setEditMode(false);
        alert("✅ Project updated successfully!");
      }
    } catch (err) {
      console.error(err);
      alert("❌ Failed to update project");
    }
  };

  const totalTasks = useMemo(
    () => project?.batches?.reduce((sum, b) => sum + (b.tasks?.length || 0), 0) || 0,
    [project]
  );

  const totalTeamMembers = useMemo(() => {
    if (!project?.batches) return 0;
    const allFreelancers = project.batches
      .flatMap(batch => batch.tasks || [])
      .filter(task => task.freelancer)
      .map(task => task.freelancer);
    return Array.from(new Map(allFreelancers.map(f => [f.id, f])).values()).length;
  }, [project]);

  if (loading) return <div className="loading-screen">Loading...</div>;
  if (!project) return <div className="error-screen">Project not found.</div>;

  return (
    <div className="project-detail-page full-width">
      <div className="project-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={18} /> Back
        </button>
        <h2>{project.project.title}</h2>
        {!editMode ? (
          <button className="edit-btn" onClick={() => setEditMode(true)}>
            <Edit size={16} /> Edit
          </button>
        ) : (
          <div className="edit-controls">
            <button className="save-btn" onClick={handleSave}>
              <Save size={16} /> Save
            </button>
            <button className="cancel-btn" onClick={() => setEditMode(false)}>
              <X size={16} /> Cancel
            </button>
          </div>
        )}
      </div>

      <div className="overview-section wide">
        <InfoItem icon={Folder} label="Project Type" value={project.project.project_type} />
        <InfoItem icon={ClipboardList} label="Total Tasks" value={totalTasks} />
        <InfoItem icon={Users} label="Team Members" value={totalTeamMembers} />
        <InfoItem icon={Clock} label="Status" value={<StatusBadge status={project.project.status} />} />
      </div>

      <div className="project-description wide">
        <h3>📝 Project Details</h3>
        {editMode ? (
          <div className="edit-form">
            <input type="text" name="title" value={formData.title || ""} onChange={handleInputChange} placeholder="Project Title" disabled />
            <textarea name="description" value={formData.description || ""} onChange={handleInputChange} placeholder="Project Description" disabled />
            <input type="text" name="skills_required" value={formData.skills_required || ""} onChange={handleInputChange} placeholder="Skills Required" disabled />
            <select name="status" value={formData.status || "active"} onChange={handleInputChange}>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="closed">Closed</option>
            </select>

            {/* File Upload */}
            <div className="upload-placeholder">
              <label>Upload Files</label>
              <input type="file" multiple onChange={handleFileChange} />
              {uploadedFiles.length > 0 && (
                <ul>
                  {uploadedFiles.map((file, idx) => (
                    <li key={idx}>{file.name}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ) : (
          <>
            <p>{project.project.description}</p>
            <p><strong>Skills Required:</strong> {project.project.skills_required}</p>
          </>
        )}
      </div>

      <div className="batch-section wide">
        <h3>📦 Batches</h3>
        {project.batches.length === 0 ? (
          <p>No batches found.</p>
        ) : (
          project.batches.map(batch => (
            <BatchCard
              key={batch.id}
              batch={batch}
              onBatchUpdate={(batchId, updatedData) => {
                setProject(prev => ({
                  ...prev,
                  batches: prev.batches.map(b => b.id === batchId ? { ...b, ...updatedData } : b)
                }));
              }}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default ProjectDetail;
