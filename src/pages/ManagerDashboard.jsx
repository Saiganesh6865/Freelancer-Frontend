import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './Projects.css';

const ManagerDashboard = () => {
  const { user } = useAuth();

  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [allTasks, setAllTasks] = useState([]);
  const [freelancers, setFreelancers] = useState([]);
  const [batches, setBatches] = useState([]);
  const [org, setOrg] = useState({ admins: [], managers: [], freelancers: [] });
  const [activeTab, setActiveTab] = useState('overview');
  const [newBatch, setNewBatch] = useState({
    project_id: null,
    count: 1,
    project_name: '',
    skills_required: '',
    project_type: user?.manager_type || 'it'
  });

  const [loading, setLoading] = useState({
    overview: true,
    tasks: false,
    batches: false,
    organization: false
  });

  // ----------- Fetch Overview Data -----------
  useEffect(() => {
    const fetchOverviewData = async () => {
      try {
        setLoading(prev => ({ ...prev, overview: true }));

        const [managerProjectsResp, freelancersResp] = await Promise.all([
          api.getManagerProjects().catch(() => ({ data: [] })),
          api.getManagerFreelancers().catch(() => ({ data: [] }))
        ]);

        const managerProjectsData = Array.isArray(managerProjectsResp?.data)
          ? managerProjectsResp.data
          : [];
        const freelancersData = Array.isArray(freelancersResp?.data)
          ? freelancersResp.data
          : [];

        setProjects(managerProjectsData);
        setFreelancers(freelancersData);

        // Fetch tasks for each project
        let allTasksData = [];
        if (managerProjectsData.length > 0) {
          const tasksResults = await Promise.all(
            managerProjectsData.map(p =>
              p.id ? api.getManagerTasks(p.id).catch(() => []) : []
            )
          );
          allTasksData = tasksResults.flat();
        }

        setTasks(allTasksData);
        setAllTasks(allTasksData);

        const batchesResp = await api.getManagerBatches().catch(() => ({ data: [] }));
        const batchesData = Array.isArray(batchesResp?.data) ? batchesResp.data : [];
        setBatches(batchesData);

      } catch (error) {
        console.error('Error fetching overview data:', error);
      } finally {
        setLoading(prev => ({ ...prev, overview: false }));
      }
    };

    if (activeTab === 'overview') fetchOverviewData();
  }, [activeTab]);

  // ----------- Fetch Batches -----------
  useEffect(() => {
    const fetchBatchesData = async () => {
      try {
        setLoading(prev => ({ ...prev, batches: true }));
        const batchesResp = await api.getManagerBatches().catch(() => ({ data: [] }));
        const batchesData = Array.isArray(batchesResp?.data) ? batchesResp.data : [];
        setBatches(batchesData);
      } catch (error) {
        console.error('Error fetching batches:', error);
      } finally {
        setLoading(prev => ({ ...prev, batches: false }));
      }
    };
    if (activeTab === 'batches') fetchBatchesData();
  }, [activeTab]);

  // ----------- Fetch Organization -----------
  useEffect(() => {
    const fetchOrgData = async () => {
      try {
        setLoading(prev => ({ ...prev, organization: true }));
        const orgResp = await api.getOrganization().catch(() => ({}));
        setOrg(orgResp || { admins: [], managers: [], freelancers: [] });
      } catch (error) {
        console.error('Error fetching organization:', error);
      } finally {
        setLoading(prev => ({ ...prev, organization: false }));
      }
    };
    if (activeTab === 'organization') fetchOrgData();
  }, [activeTab]);

  // ----------- Actions -----------
  const approveTask = async (taskId) => {
    try {
      await api.updateTaskStatusManager(taskId, 'completed');
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: 'completed' } : t));
      setAllTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: 'completed' } : t));
    } catch (error) {
      console.error('Error approving task:', error);
    }
  };

  const createTask = async (taskData) => {
    try {
      const newTask = await api.createTask(taskData);
      if (newTask) {
        setTasks(prev => [...prev, newTask]);
        setAllTasks(prev => [...prev, newTask]);
      }
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const createBatch = async (e) => {
    e.preventDefault();
    try {
      const batchResp = await api.createBatch(newBatch);
      const batchData = batchResp?.batch || batchResp || {};
      setBatches(prev => [...prev, batchData]);
      setNewBatch({
        project_id: null,
        count: 1,
        project_name: '',
        skills_required: '',
        project_type: user?.manager_type || 'it'
      });
    } catch (error) {
      console.error('Error creating batch:', error);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString();
  };

  const handleManageTasks = (projectId) => {
    const filtered = Array.isArray(allTasks)
      ? allTasks.filter(t => t.project_id === projectId)
      : [];
    setTasks(filtered);
    setActiveTab('tasks');
  };

  const handleAssignToBatch = (project) => {
    setNewBatch({
      ...newBatch,
      project_id: project.id,
      project_name: project.project_name || project.title || '',
      skills_required: project.skills_required || '',
      project_type: project.project_type || 'it',
      count: 1
    });
    setActiveTab('batches');
  };

  // ----------- Render Loading -----------
  if (loading.overview && activeTab === 'overview') {
    return (
      <div className="manager-dashboard">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading manager dashboard...</p>
        </div>
      </div>
    );
  }

  // ----------- Render JSX -----------
  return (
    <div className="main-content">
      <div className="card">
        <div className="card-header">
          <h1 className="card-title">Manager Dashboard</h1>
          <p>Overview of your projects, tasks, and team progress</p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <h3>Active Projects</h3>
          <p className="stat-number">{Array.isArray(projects) ? projects.filter(p => p.status === 'active').length : 0}</p>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📝</div>
          <h3>Pending Tasks</h3>
          <p className="stat-number">{Array.isArray(tasks) ? tasks.filter(t => t.status === 'pending').length : 0}</p>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <h3>Team Members</h3>
          <p className="stat-number">{Array.isArray(freelancers) ? freelancers.length : 0}</p>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <h3>Completed Tasks</h3>
          <p className="stat-number">{Array.isArray(tasks) ? tasks.filter(t => t.status === 'completed').length : 0}</p>
        </div>
      </div>

      {/* Current Projects & Task Progress */}
      <div className="current-tasks-section">
        <h2>Current Projects & Task Progress</h2>
        {(!Array.isArray(projects) || projects.length === 0) ? (
          <div className="text-center">
            <p>No projects available yet.</p>
            <p className="text-muted">Projects will appear here once created by Admin.</p>
          </div>
        ) : (
          <div className="projects-summary">
            {projects.map(project => {
              const projectTasks = Array.isArray(tasks) ? tasks.filter(task => task.project_id === project.id) : [];
              const completedTasks = projectTasks.filter(t => t.status === 'completed');
              const inProgressTasks = projectTasks.filter(t => t.status === 'in_progress');
              const pendingTasks = projectTasks.filter(t => t.status === 'pending');

              return (
                <div key={project.id} className="project-summary-card">
                  <div className="project-header">
                    <h3>{project.project_name}</h3>
                    <span className={`status-badge status-${project.status?.toLowerCase()}`}>
                      {project.status}
                    </span>
                  </div>
                  <div className="project-details">
                    <p><strong>Type:</strong> {project.project_type}</p>
                    <p><strong>Skills:</strong> {project.skills_required}</p>
                  </div>
                  <div className="task-progress">
                    <h4>Current Tasks ({projectTasks.length})</h4>
                    {projectTasks.length === 0 ? (
                      <p className="text-muted">No tasks created yet</p>
                    ) : (
                      <div className="task-summary">
                        <div className="progress-stats">
                          <span className="stat completed">✅ {completedTasks.length} Completed</span>
                          <span className="stat in-progress">🔄 {inProgressTasks.length} In Progress</span>
                          <span className="stat pending">⏳ {pendingTasks.length} Pending</span>
                        </div>
                        <div className="recent-tasks">
                          {projectTasks.slice(0, 3).map(task => (
                            <div key={task.id} className="task-item-mini">
                              <span className={`task-status status-${task.status?.toLowerCase()}`}>
                                {task.status === 'completed' ? '✅' : task.status === 'in_progress' ? '🔄' : '⏳'}
                              </span>
                              <div className="task-info">
                                <strong>{task.task_name || task.name}</strong>
                                <small>Assigned to: {task.assigned_to || task.assigned_to_name || 'Unassigned'}</small>
                              </div>
                            </div>
                          ))}
                          {projectTasks.length > 3 && (
                            <p className="text-muted">...and {projectTasks.length - 3} more tasks</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div className="recent-activity-section">
        <h2>Recent Activity</h2>
        {(!Array.isArray(tasks) || tasks.length === 0) ? (
          <p className="text-muted">No recent activity</p>
        ) : (
          <div className="activity-list">
            {tasks.slice(0, 5).map(task => (
              <div key={task.id} className="activity-item">
                <span className="activity-icon">📋</span>
                <div className="activity-content">
                  <p><strong>{task.task_name || task.name}</strong> - {task.status}</p>
                  <small>Project: {task.project_name} | {formatDate(task.updated_at)}</small>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManagerDashboard;
