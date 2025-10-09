import React, { useState, useEffect } from 'react';
import api from '../services/api';

import './TeamManagementModal.css';

const TeamManagementModal = ({ isOpen, onClose, onTeamUpdated, selectedProject = null }) => {
  const [formData, setFormData] = useState({
    freelancer_id: '',
    project_id: '',
    role: '',
    status: 'assigned'
  });
  const [projects, setProjects] = useState([]);
  const [freelancers, setFreelancers] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('assign');

  useEffect(() => {
    if (isOpen) {
      fetchProjects();
      fetchFreelancers();
      if (selectedProject) {
        setFormData(prev => ({
          ...prev,
          project_id: selectedProject.id
        }));
        fetchTeamMembers(selectedProject.id);
      }
    }
  }, [isOpen, selectedProject]);

  const fetchProjects = async () => {
    try {
      const data = await api.getManagerProjects();
      setProjects(data || []);
    } catch (err) {
      console.error('Error fetching projects:', err);
      setProjects([]);
    }
  };

  const fetchFreelancers = async () => {
    try {
      const data = await api.getManagerFreelancers();
      setFreelancers(data || []);
    } catch (err) {
      console.error('Error fetching freelancers:', err);
      setFreelancers([]);
    }
  };

  const fetchTeamMembers = async (projectId = null) => {
    try {
      const data = await api.getProjectTeam(projectId || formData.project_id);
      setTeamMembers(data || []);
    } catch (err) {
      console.error('Error fetching team members:', err);
      setTeamMembers([]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Fetch team members when project changes
    if (name === 'project_id' && value) {
      fetchTeamMembers(value);
    }
  };

  const handleAssignFreelancer = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const assignmentData = {
        freelancer_id: parseInt(formData.freelancer_id),
        project_id: parseInt(formData.project_id),
        role: formData.role,
        status: formData.status
      };

      await api.assignFreelancerToProject(assignmentData);
      await fetchTeamMembers(formData.project_id);
      onTeamUpdated();
      
      // Reset form
      setFormData(prev => ({
        ...prev,
        freelancer_id: '',
        role: '',
        status: 'assigned'
      }));
    } catch (err) {
      console.error('Error assigning freelancer:', err);
      setError(err.message || 'Failed to assign freelancer');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFreelancer = async (memberId) => {
    if (!window.confirm('Are you sure you want to remove this team member?')) {
      return;
    }

    try {
      await api.removeFreelancerFromProject(memberId);
      await fetchTeamMembers(formData.project_id);
      onTeamUpdated();
    } catch (err) {
      console.error('Error removing freelancer:', err);
      setError(err.message || 'Failed to remove team member');
    }
  };

  const handleStatusChange = async (memberId, newStatus) => {
    try {
      await api.updateTeamMemberStatus(memberId, newStatus);
      await fetchTeamMembers(formData.project_id);
      onTeamUpdated();
    } catch (err) {
      console.error('Error updating status:', err);
      setError(err.message || 'Failed to update status');
    }
  };

  const resetForm = () => {
    setFormData({
      freelancer_id: '',
      project_id: '',
      role: '',
      status: 'assigned'
    });
    setError('');
    setTeamMembers([]);
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      assigned: 'status-badge status-assigned',
      pending: 'status-badge status-pending',
      removed: 'status-badge status-removed'
    };
    return <span className={statusClasses[status] || 'status-badge'}>{status}</span>;
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="team-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Team Management</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        <div className="modal-tabs">
          <button 
            className={`tab-btn ${activeTab === 'assign' ? 'active' : ''}`}
            onClick={() => setActiveTab('assign')}
          >
            Assign Freelancer
          </button>
          <button 
            className={`tab-btn ${activeTab === 'view' ? 'active' : ''}`}
            onClick={() => setActiveTab('view')}
          >
            Current Team
          </button>
        </div>

        <div className="modal-content">
          {error && <div className="alert alert-error">{error}</div>}

          {activeTab === 'assign' && (
            <form onSubmit={handleAssignFreelancer} className="team-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="project_id">Project *</label>
                  <select
                    id="project_id"
                    name="project_id"
                    value={formData.project_id}
                    onChange={handleInputChange}
                    required
                    disabled={selectedProject}
                  >
                    <option value="">Select Project</option>
                    {projects.map(project => (
                      <option key={project.id} value={project.id}>
                        {project.title || project.project_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="freelancer_id">Freelancer *</label>
                  <select
                    id="freelancer_id"
                    name="freelancer_id"
                    value={formData.freelancer_id}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Freelancer</option>
                    {freelancers.map(freelancer => (
                      <option key={freelancer.id} value={freelancer.id}>
                        {freelancer.full_name || freelancer.username || freelancer.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="role">Role (Optional)</label>
                  <input
                    type="text"
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    placeholder="e.g., Frontend Developer, NLP Specialist"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="status">Status</label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                  >
                    <option value="assigned">Assigned</option>
                    <option value="pending">Pending</option>
                    <option value="removed">Removed</option>
                  </select>
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary btn-assign" disabled={loading}>
                  {loading ? 'Assigning...' : 'Assign Freelancer'}
                </button>
                <button type="button" className="btn btn-secondary btn-cancel" onClick={onClose}>
                  Cancel
                </button>
              </div>
            </form>
          )}

          {activeTab === 'view' && (
            <div className="team-view">
              {!formData.project_id ? (
                <div className="no-project">
                  <p>Please select a project to view team members</p>
                </div>
              ) : teamMembers.length === 0 ? (
                <div className="no-team">
                  <p>No team members assigned to this project yet.</p>
                </div>
              ) : (
                <div className="team-list">
                  {teamMembers.map(member => (
                    <div key={member.id} className="team-member-card">
                      <div className="member-info">
                        <div className="member-name">
                          <strong>{member.freelancer_name || member.username}</strong>
                          {member.role && <span className="member-role">{member.role}</span>}
                        </div>
                        <div className="member-details">
                          <span className="member-email">{member.email}</span>
                          {getStatusBadge(member.status)}
                        </div>
                      </div>
                      <div className="member-actions">
                        <select
                          value={member.status}
                          onChange={(e) => handleStatusChange(member.id, e.target.value)}
                          className="status-select"
                        >
                          <option value="assigned">Assigned</option>
                          <option value="pending">Pending</option>
                          <option value="removed">Removed</option>
                        </select>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleRemoveFreelancer(member.id)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeamManagementModal;
