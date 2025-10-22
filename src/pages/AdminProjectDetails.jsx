import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Folder, Users, ClipboardList, Clock, Trash2, Edit, UserCheck, X } from "lucide-react";
import api from "../services/api";
import "./AdminProjectDetails.css";

const StatusBadge = ({ status }) => {
  const statusStyles = {
    open: { background: "#8b5cf6", color: "#fff" },
    active: { background: "#22c55e", color: "#fff" },
    pending: { background: "#facc15", color: "#000" },
    completed: { background: "#3b82f6", color: "#fff" },
    closed: { background: "#6b7280", color: "#fff" },
  };
  const style = statusStyles[status?.toLowerCase()] || { background: "#e5e7eb", color: "#000" };
  const displayText = status ? status.charAt(0).toUpperCase() + status.slice(1) : "Unknown";
  return <span className="status-badge" style={style}>{displayText}</span>;
};

const InfoItem = ({ icon: Icon, label, value, children }) => (
  <div className="info-item">
    <Icon size={18} className="info-icon" />
    <div>
      <p className="info-label">{label}</p>
      <p className="info-value">{value || "—"}</p>
      {children}
    </div>
  </div>
);

const AdminProjectDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [managers, setManagers] = useState([]);
  const [editing, setEditing] = useState(false);
  const [updatedProject, setUpdatedProject] = useState({});
  const [selectedManager, setSelectedManager] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);

  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // Fetch project
  useEffect(() => {
    const fetchProject = async () => {
      try {
        const data = await api.getAdminProjectById(id);
        setProject(data);
        setUpdatedProject(data);
      } catch (err) {
        console.error("Error fetching project:", err);
        setError("Failed to load project");
      }
    };
    fetchProject();
  }, [id]);

  // Fetch managers
  useEffect(() => {
    const fetchManagers = async () => {
      try {
        const data = await api.getAllManagers();
        setManagers(data);
      } catch (err) {
        console.error("Error fetching managers:", err);
      }
    };
    fetchManagers();
  }, []);

  const handleFileChange = (e) => {
    setSelectedFiles(Array.from(e.target.files));
  };

  const handleRemoveSelectedFile = (index) => {
    const updatedFiles = [...selectedFiles];
    updatedFiles.splice(index, 1);
    setSelectedFiles(updatedFiles);
  };

  const handleUpdateProject = async () => {
    try {
      const formData = new FormData();
      Object.entries(updatedProject).forEach(([key, value]) => {
        formData.append(key, value);
      });

      selectedFiles.forEach(file => {
        formData.append("files", file);
      });

      // API endpoint must handle FormData
      await api.updateProjectWithFiles(project.id, formData);

      setProject({ ...updatedProject, files: [...(project.files || []), ...selectedFiles.map(f => f.name)] });
      setEditing(false);
      setSelectedFiles([]);
      setSuccess("Project updated successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error(err);
      setError("Failed to update project");
      setTimeout(() => setError(""), 3000);
    }
  };

  const handleDeleteProject = async () => {
    try {
      await api.deleteProject(project.id);
      setSuccess("Project deleted successfully!");
      setTimeout(() => setSuccess(""), 3000);
      navigate("/admin/projects");
    } catch (err) {
      console.error(err);
      setError("Failed to delete project");
      setTimeout(() => setError(""), 3000);
    }
  };

  const handleAssignManager = async () => {
    if (!selectedManager) return;
    try {
      const manager = managers.find(m => m.id == selectedManager);
      await api.assignManager(manager.username, [project.id]);
      setProject({ ...project, manager_username: manager.username });
      setSuccess("Manager assigned successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error(err);
      setError("Failed to assign manager");
      setTimeout(() => setError(""), 3000);
    }
  };

  if (!project) return <div className="loading-screen">Loading project...</div>;

  return (
    <div className="admin-project-details-page full-width">
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="project-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={18} /> Back
        </button>
        <h2>{project.title}</h2>
        <StatusBadge status={project.status} />
      </div>

      <div className="overview-section wide">
        <InfoItem icon={Folder} label="Project Type" value={project.project_type} />
        <InfoItem icon={ClipboardList} label="Created By" value={project.created_by} />
        <InfoItem icon={Clock} label="Status" value={<StatusBadge status={project.status} />} />
        <InfoItem icon={Users} label="Manager" value={project.manager_username}>
          <div className="manager-assign">
            <select value={selectedManager} onChange={(e) => setSelectedManager(e.target.value)}>
              <option value="">Select Manager</option>
              {Object.entries(
                managers.reduce((groups, manager) => {
                  if (!groups[manager.manager_type]) groups[manager.manager_type] = [];
                  groups[manager.manager_type].push(manager);
                  return groups;
                }, {})
              ).map(([type, mgrs]) => (
                <optgroup key={type} label={type.toUpperCase()}>
                  {mgrs.map((m) => (
                    <option key={m.id} value={m.id}>{m.username}</option>
                  ))}
                </optgroup>
              ))}
            </select>
            <button onClick={handleAssignManager}>
              <UserCheck size={16} /> Assign
            </button>
          </div>
        </InfoItem>
      </div>

      <div className="project-description wide">
        <h3>📝 Project Details</h3>
        {editing ? (
          <>
            <input
              type="text"
              value={updatedProject.title}
              onChange={(e) => setUpdatedProject({ ...updatedProject, title: e.target.value })}
              className="form-input"
            />
            <textarea
              value={updatedProject.description}
              onChange={(e) => setUpdatedProject({ ...updatedProject, description: e.target.value })}
              className="form-textarea"
            />
            <textarea
              value={updatedProject.skills_required}
              onChange={(e) => setUpdatedProject({ ...updatedProject, skills_required: e.target.value })}
              className="form-textarea"
            />

            <label className="form-label">Upload Files (Images or Docs)</label>
            <input type="file" multiple onChange={handleFileChange} className="form-input" />
            {selectedFiles.length > 0 && (
              <ul className="file-list">
                {selectedFiles.map((file, idx) => (
                  <li key={idx}>
                    {file.name} <X size={14} onClick={() => handleRemoveSelectedFile(idx)} className="remove-file-icon" />
                  </li>
                ))}
              </ul>
            )}

            <button onClick={handleUpdateProject} className="btn btn-primary">Save Changes</button>
            <button onClick={() => { setEditing(false); setSelectedFiles([]); }} className="btn btn-secondary" style={{ marginLeft: "8px" }}>Cancel</button>
          </>
        ) : (
          <>
            <p>{project.description}</p>
            <p><strong>Skills Required:</strong> {project.skills_required || "—"}</p>
            <p><strong>Deadline:</strong> {project.deadline ? new Date(project.deadline).toLocaleDateString() : "—"}</p>
            {project.files && project.files.length > 0 && (
              <div className="project-files">
                <h4>Attached Files:</h4>
                <ul>
                  {project.files.map((f, i) => (
                    <li key={i}>{f}</li>
                  ))}
                </ul>
              </div>
            )}
            <button onClick={() => setEditing(true)} className="btn btn-warning">
              <Edit size={16} /> Edit Project
            </button>
            <button onClick={handleDeleteProject} className="btn btn-danger" style={{ marginLeft: "8px" }}>
              <Trash2 size={16} /> Delete Project
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminProjectDetails;
