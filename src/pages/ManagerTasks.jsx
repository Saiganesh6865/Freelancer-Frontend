import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

import './Projects.css';
import './ManagerTasks.css';

const ManagerTasks = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [projects, setProjects] = useState([]);
  const [batches, setBatches] = useState([]);
  const [freelancers, setFreelancers] = useState([]);
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    project_id: '',
    batch_id: '',
    count: '',
    assigned_to: ''
  });

  useEffect(() => {
    fetchAllData();

    const interval = setInterval(fetchTasks, 30000); // Refresh every 30 sec
    return () => clearInterval(interval);
  }, []);

  const fetchAllData = async () => {
    await Promise.all([fetchTasks(), fetchProjects(), fetchFreelancers()]);
  };

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError('');
      const tasksData = await api.getManagerTasks();
      setTasks(tasksData || []);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError('Failed to load tasks. Please check your connection.');
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const projectsData = await api.getManagerProjects();
      setProjects(projectsData || []);
    } catch (err) {
      console.error('Error fetching projects:', err);
      setProjects([]);
    }
  };

  const fetchBatches = async (projectId) => {
    try {
      if (!projectId) {
        setBatches([]);
        return;
      }
      const batchesData = await api.getManagerBatches(projectId);
      setBatches(batchesData || []);
    } catch (err) {
      console.error('Error fetching batches:', err);
      setBatches([]);
    }
  };

  const fetchFreelancers = async () => {
    try {
      const freelancersData = await api.getManagerTeam();
      setFreelancers(freelancersData?.freelancers || []);
    } catch (err) {
      console.error('Error fetching freelancers:', err);
      setFreelancers([]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTaskForm(prev => ({ ...prev, [name]: value }));

    // Fetch batches when project changes
    if (name === 'project_id') {
      setTaskForm(prev => ({ ...prev, batch_id: '' })); // Reset batch selection
      fetchBatches(Number(value));
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();

    if (!taskForm.project_id || !taskForm.batch_id || !taskForm.title || !taskForm.count) {
      setError('Please fill all required fields: project, batch, title, count');
      return;
    }

    // Construct payload
    const payload = {
      project_id: Number(taskForm.project_id),
      batch_id: Number(taskForm.batch_id),
      title: taskForm.title,
      description: taskForm.description || '',
      count: Number(taskForm.count),
    };

    // Map assigned freelancer to username if selected
    if (taskForm.assigned_to) {
      const freelancer = freelancers.find(f => f.id === Number(taskForm.assigned_to));
      if (freelancer?.username) payload.assigned_to_username = freelancer.username;
    }

    try {
      const newTask = await api.createTask(payload);
      setTasks(prev => [...prev, newTask]);
      setTaskForm({
        title: '',
        description: '',
        project_id: '',
        batch_id: '',
        count: '',
        assigned_to: ''
      });
      setBatches([]);
      setShowCreateModal(false);
      setError('');
    } catch (err) {
      console.error('Error creating task:', err);
      setError(err?.response?.data?.error || 'Failed to create task');
    }
  };


  if (loading) {
    return (
      <div className="main-content">
        <div className="loading">Loading tasks...</div>
      </div>
    );
  }

  return (
    <div className="main-content">
      <div className="tasks-page-header">
        <div className="tasks-header-content">
          <h1 className="tasks-page-title">Task Management</h1>
          <p className="tasks-page-subtitle">Create tasks and assign them to team members</p>
        </div>
        <div className="tasks-header-actions">
          <button 
            className="btn btn-primary create-task-btn"
            onClick={() => setShowCreateModal(true)}
          >
            Create New Task
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
          <button onClick={fetchTasks} className="retry-btn">Retry</button>
        </div>
      )}

      <div className="tasks-container">
        <div className="tasks-table-wrapper">
          {tasks.length === 0 ? (
            <div className="empty-tasks-state">
              <h4>No tasks created yet</h4>
              <p>Create tasks and assign them to team members</p>
            </div>
          ) : (
            <table className="tasks-management-table">
              <thead>
                <tr>
                  <th>Task ID</th>
                  <th>Task Name</th>
                  <th>Project Name</th>
                  <th>Assigned To</th>
                  <th>Status</th>
                  <th>Progress (%)</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map(task => (
                  <tr key={task.task_id || task.id}>
                    <td>#{task.task_id || task.id}</td>
                    <td>
                      <div className="task-name-cell">
                        <strong>{task.title}</strong>
                        {task.description && (
                          <small className="task-description">{task.description}</small>
                        )}
                      </div>
                    </td>
                    <td>{task.job?.title || task.batch?.project_name || 'N/A'}</td>
                    <td>
                      {task.freelancer?.username ? (
                        <div className="assignee-info">
                          <div className="assignee-avatar">
                            {task.freelancer.username.charAt(0).toUpperCase()}
                          </div>
                          <span>{task.freelancer.username}</span>
                        </div>
                      ) : (
                        <span className="unassigned">Unassigned</span>
                      )}
                    </td>
                    <td>
                      <span className={`task-status-badge ${task.status?.toLowerCase() || 'pending'}`}>
                        {task.status || 'Not Started'}
                      </span>
                    </td>
                    <td>
                      <div className="progress-cell">
                        <div className="task-progress-bar">
                          <div 
                            className="task-progress-fill" 
                            style={{ width: `${task.progress || 0}%` }}
                          ></div>
                        </div>
                        <span className="progress-text">{task.progress || 0}%</span>
                      </div>
                    </td>
                    <td>
                      <div className="task-actions">
                        <button className="btn btn-sm btn-outline">View</button>
                        <button className="btn btn-sm btn-secondary">Reassign</button>
                        <button className="btn btn-sm btn-danger">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Task Creation Modal */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-content create-task-modal">
            <div className="modal-header">
              <h3>Create New Task</h3>
              <button 
                className="modal-close"
                onClick={() => setShowCreateModal(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleCreateTask}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Task Name *</label>
                  <input 
                    type="text" 
                    name="title"
                    className="form-input" 
                    placeholder="Enter task name"
                    value={taskForm.title}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Project *</label>
                  <select 
                    name="project_id"
                    className="form-select"
                    value={taskForm.project_id}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Project</option>
                    {projects.map(project => (
                      <option key={project.job_id} value={project.job_id}>
                        {project.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Batch *</label>
                  <select 
                    name="batch_id"
                    className="form-select"
                    value={taskForm.batch_id}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Batch</option>
                    {batches.map(batch => (
                      <option key={batch.id} value={batch.id}>{batch.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Assign To</label>
                  <select 
                    name="assigned_to"
                    className="form-select"
                    value={taskForm.assigned_to}
                    onChange={handleInputChange}
                  >
                    <option value="">Select Freelancer (Optional)</option>
                    {freelancers.map(freelancer => (
                      <option key={freelancer.id} value={freelancer.id}>
                        {freelancer.username || freelancer.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea 
                    name="description"
                    className="form-textarea" 
                    rows="3" 
                    placeholder="Task description"
                    value={taskForm.description}
                    onChange={handleInputChange}
                  ></textarea>
                </div>
                <div className="form-group">
                  <label>Count *</label>
                  <input 
                    type="number"
                    name="count"
                    className="form-input"
                    placeholder="Enter count"
                    value={taskForm.count}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerTasks;
