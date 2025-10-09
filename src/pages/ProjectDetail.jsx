import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';  // ✅ import the default api object
import './ProjectDetail.css';

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [tasks, setTasks] = useState([]);
  const [batches, setBatches] = useState([]);
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProjectData();
  }, [id]);

  const fetchProjectData = async () => {
    try {
      setLoading(true);
      const projectData = await api.getProjectById(id);  // ✅ updated usage
      setProject(projectData);

      if (activeTab === 'tasks') {
        const tasksData = await api.getProjectTasks(id);
        setTasks(tasksData);
      } else if (activeTab === 'batches') {
        const batchesData = await api.getProjectBatches(id);
        setBatches(batchesData);
      } else if (activeTab === 'team') {
        const teamData = await api.getProjectTeam(id);
        setTeam(teamData);
      }
    } catch (err) {
      setError('Failed to load project details');
      console.error('Error fetching project:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = async (tab) => {
    setActiveTab(tab);

    try {
      if (tab === 'tasks' && tasks.length === 0) {
        const tasksData = await api.getProjectTasks(id);
        setTasks(tasksData);
      } else if (tab === 'batches' && batches.length === 0) {
        const batchesData = await api.getProjectBatches(id);
        setBatches(batchesData);
      } else if (tab === 'team' && team.length === 0) {
        const teamData = await api.getProjectTeam(id);
        setTeam(teamData);
      }
    } catch (err) {
      console.error(`Error fetching ${tab} data:`, err);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'active': { class: 'status-active', text: 'Active' },
      'completed': { class: 'status-completed', text: 'Completed' },
      'on-hold': { class: 'status-hold', text: 'On Hold' },
      'cancelled': { class: 'status-cancelled', text: 'Cancelled' }
    };
    const statusInfo = statusMap[status] || { class: 'status-default', text: status };
    return <span className={`status-badge ${statusInfo.class}`}>{statusInfo.text}</span>;
  };

  const getPriorityBadge = (priority) => {
    const priorityMap = {
      'high': { class: 'priority-high', text: 'High' },
      'medium': { class: 'priority-medium', text: 'Medium' },
      'low': { class: 'priority-low', text: 'Low' }
    };
    const priorityInfo = priorityMap[priority] || { class: 'priority-default', text: priority };
    return <span className={`priority-badge ${priorityInfo.class}`}>{priorityInfo.text}</span>;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const renderOverviewTab = () => (
    <div className="tab-content">
      <div className="overview-grid">
        <div className="overview-card">
          <h3>Project Information</h3>
          <div className="info-grid">
            <div className="info-item">
              <label>Project Type:</label>
              <span>{project?.project_type || 'Not specified'}</span>
            </div>
            <div className="info-item">
              <label>Status:</label>
              {getStatusBadge(project?.status)}
            </div>
            <div className="info-item">
              <label>Priority:</label>
              {getPriorityBadge(project?.priority)}
            </div>
            <div className="info-item">
              <label>Budget:</label>
              <span>${project?.budget || 'Not set'}</span>
            </div>
            <div className="info-item">
              <label>Created:</label>
              <span>{formatDate(project?.created_at)}</span>
            </div>
            <div className="info-item">
              <label>Deadline:</label>
              <span>{formatDate(project?.deadline)}</span>
            </div>
          </div>
        </div>

        <div className="overview-card">
          <h3>Description</h3>
          <p className="project-description">
            {project?.description || 'No description provided'}
          </p>
        </div>

        <div className="overview-card">
          <h3>Requirements</h3>
          <div className="requirements-list">
            {project?.requirements ? (
              project.requirements.split('\n').map((req, index) => (
                <div key={index} className="requirement-item">
                  <span className="requirement-bullet">•</span>
                  <span>{req}</span>
                </div>
              ))
            ) : (
              <p className="no-data">No requirements specified</p>
            )}
          </div>
        </div>

        <div className="overview-card">
          <h3>Skills Required</h3>
          <div className="skills-list">
            {project?.skills_required ? (
              project.skills_required.split(',').map((skill, index) => (
                <span key={index} className="skill-tag">{skill.trim()}</span>
              ))
            ) : (
              <p className="no-data">No skills specified</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderTasksTab = () => (
    <div className="tab-content">
      <div className="tasks-header">
        <h3>Project Tasks</h3>
        <button className="btn-primary">Add Task</button>
      </div>
      
      {tasks.length > 0 ? (
        <div className="tasks-list">
          {tasks.map((task) => (
            <div key={task.id} className="task-card">
              <div className="task-header">
                <h4>{task.title}</h4>
                {getStatusBadge(task.status)}
              </div>
              <p className="task-description">{task.description}</p>
              <div className="task-meta">
                <span className="task-assignee">
                  Assigned to: {task.assignee || 'Unassigned'}
                </span>
                <span className="task-due">
                  Due: {formatDate(task.due_date)}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <p>No tasks created yet</p>
          <button className="btn-secondary">Create First Task</button>
        </div>
      )}
    </div>
  );

  const renderBatchesTab = () => (
    <div className="tab-content">
      <div className="batches-header">
        <h3>Project Batches</h3>
        <button className="btn-primary">Create Batch</button>
      </div>
      
      {batches.length > 0 ? (
        <div className="batches-grid">
          {batches.map((batch) => (
            <div key={batch.id} className="batch-card">
              <div className="batch-header">
                <h4>{batch.name}</h4>
                {getStatusBadge(batch.status)}
              </div>
              <div className="batch-info">
                <div className="batch-stat">
                  <span className="stat-number">{batch.task_count || 0}</span>
                  <span className="stat-label">Tasks</span>
                </div>
                <div className="batch-stat">
                  <span className="stat-number">{batch.completed_tasks || 0}</span>
                  <span className="stat-label">Completed</span>
                </div>
              </div>
              <div className="batch-progress">
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ 
                      width: `${batch.task_count > 0 ? (batch.completed_tasks / batch.task_count) * 100 : 0}%` 
                    }}
                  ></div>
                </div>
                <span className="progress-text">
                  {batch.task_count > 0 ? Math.round((batch.completed_tasks / batch.task_count) * 100) : 0}% Complete
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <p>No batches created yet</p>
          <button className="btn-secondary">Create First Batch</button>
        </div>
      )}
    </div>
  );

  const renderTeamTab = () => (
    <div className="tab-content">
      <div className="team-header">
        <h3>Project Team</h3>
        <button className="btn-primary">Add Member</button>
      </div>
      
      {team.length > 0 ? (
        <div className="team-grid">
          {team.map((member) => (
            <div key={member.id} className="team-member-card">
              <div className="member-avatar">
                {member.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="member-info">
                <h4>{member.name}</h4>
                <p className="member-role">{member.role || 'Team Member'}</p>
                <p className="member-email">{member.email}</p>
                <div className="member-skills">
                  {member.skills && member.skills.split(',').slice(0, 3).map((skill, index) => (
                    <span key={index} className="skill-tag small">{skill.trim()}</span>
                  ))}
                </div>
              </div>
              <div className="member-actions">
                <button className="btn-icon" title="Contact">
                  <i className="fas fa-envelope"></i>
                </button>
                <button className="btn-icon" title="Remove">
                  <i className="fas fa-times"></i>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <p>No team members assigned yet</p>
          <button className="btn-secondary">Assign First Member</button>
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="project-detail-container">
        <div className="loading-state">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Loading project details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="project-detail-container">
        <div className="error-state">
          <i className="fas fa-exclamation-triangle"></i>
          <p>{error}</p>
          <button className="btn-secondary" onClick={() => navigate('/manager/projects')}>
            Back to Projects
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="project-detail-container">
      <div className="project-header">
        <div className="header-left">
          <button className="btn-back" onClick={() => navigate('/manager/projects')}>
            <i className="fas fa-arrow-left"></i>
          </button>
          <div className="project-title-section">
            <h1>{project?.title || project?.name}</h1>
            <p className="project-id">Project ID: {project?.id}</p>
          </div>
        </div>
        <div className="header-actions">
          <button className="btn-secondary">
            <i className="fas fa-edit"></i>
            Edit Project
          </button>
          <button className="btn-primary">
            <i className="fas fa-share"></i>
            Share
          </button>
        </div>
      </div>

      <div className="project-tabs">
        <button 
          className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => handleTabChange('overview')}
        >
          <i className="fas fa-info-circle"></i>
          Overview
        </button>
        <button 
          className={`tab-button ${activeTab === 'tasks' ? 'active' : ''}`}
          onClick={() => handleTabChange('tasks')}
        >
          <i className="fas fa-tasks"></i>
          Tasks
          <span className="tab-count">{tasks.length}</span>
        </button>
        <button 
          className={`tab-button ${activeTab === 'batches' ? 'active' : ''}`}
          onClick={() => handleTabChange('batches')}
        >
          <i className="fas fa-layer-group"></i>
          Batches
          <span className="tab-count">{batches.length}</span>
        </button>
        <button 
          className={`tab-button ${activeTab === 'team' ? 'active' : ''}`}
          onClick={() => handleTabChange('team')}
        >
          <i className="fas fa-users"></i>
          Team
          <span className="tab-count">{team.length}</span>
        </button>
      </div>

      <div className="project-content">
        {activeTab === 'overview' && renderOverviewTab()}
        {activeTab === 'tasks' && renderTasksTab()}
        {activeTab === 'batches' && renderBatchesTab()}
        {activeTab === 'team' && renderTeamTab()}
      </div>
    </div>
  );
};

export default ProjectDetail;
