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
    job_id: '',       // changed from project_id
    batch_id: '',
    count: '',
    assigned_to: ''
  });

  useEffect(() => {
    fetchAllData();
    const interval = setInterval(fetchTasks, 30000);
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

  const fetchBatches = async (jobId) => {
    try {
      if (!jobId) {
        setBatches([]);
        return;
      }
      const batchesData = await api.getManagerBatches(jobId);
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

    if (name === 'job_id') {
      setTaskForm(prev => ({ ...prev, batch_id: '' }));
      fetchBatches(Number(value));
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();

    const { job_id, batch_id, title, description, count, assigned_to } = taskForm;

    const missingFields = [];
    if (!job_id) missingFields.push("Project");
    if (!batch_id) missingFields.push("Batch");
    if (!title?.trim()) missingFields.push("Title");
    if (!count) missingFields.push("Count");

    if (missingFields.length > 0) {
      alert(`Please fill all required fields: ${missingFields.join(", ")}`);
      return;
    }

    try {
      setLoading(true);

      const payload = {
        job_id,                        // backend expects job_id
        batch_id,
        title,
        description,
        count,
        assigned_to_username: freelancers.find(f => f.id === Number(assigned_to))?.username || null,
        assigned_by: user.id
      };

      await api.createTask(payload);

      alert("Task created successfully");

      setTaskForm({
        title: '',
        description: '',
        job_id: '',
        batch_id: '',
        count: '',
        assigned_to: ''
      });

      fetchTasks();
    } catch (err) {
      console.error("Task creation error:", err);
      alert("Task creation failed");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="main-content"><div className="loading">Loading tasks...</div></div>;
  }

  return (
    <div className="main-content">
      <div className="tasks-page-header">
        <div className="tasks-header-content">
          <h1 className="tasks-page-title">Task Management</h1>
          <p className="tasks-page-subtitle">Create tasks and assign them to team members</p>
        </div>
        <div className="tasks-header-actions">
          <button className="btn btn-primary create-task-btn" onClick={() => setShowCreateModal(true)}>Create New Task</button>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}<button onClick={fetchTasks} className="retry-btn">Retry</button></div>}

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
                    <td><strong>{task.title}</strong>{task.description && <small className="task-description">{task.description}</small>}</td>
                    <td>{task.job?.title || task.batch?.project_name || 'N/A'}</td>
                    <td>{task.freelancer?.username || 'Unassigned'}</td>
                    <td>{task.status || 'Pending'}</td>
                    <td>{task.progress || 0}%</td>
                    <td>
                      <button className="btn btn-sm btn-outline">View</button>
                      <button className="btn btn-sm btn-secondary">Reassign</button>
                      <button className="btn btn-sm btn-danger">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-content create-task-modal">
            <div className="modal-header">
              <h3>Create New Task</h3>
              <button className="modal-close" onClick={() => setShowCreateModal(false)}>×</button>
            </div>
            <form onSubmit={handleCreateTask}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Task Name *</label>
                  <input type="text" name="title" className="form-input" value={taskForm.title} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                  <label>Project *</label>
                  <select name="job_id" className="form-select" value={taskForm.job_id} onChange={handleInputChange} required>
                    <option value="">Select Project</option>
                    {projects.map(p => <option key={p.job_id || p.id} value={p.job_id || p.id}>{p.title}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Batch *</label>
                  <select name="batch_id" className="form-select" value={taskForm.batch_id} onChange={handleInputChange} required>
                    <option value="">Select Batch</option>
                    {batches.map(b => <option key={b.id} value={b.id}>{b.project_name || b.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Assign To</label>
                  <select name="assigned_to" className="form-select" value={taskForm.assigned_to} onChange={handleInputChange}>
                    <option value="">Select Freelancer (Optional)</option>
                    {freelancers.map(f => <option key={f.id} value={f.id}>{f.username || f.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea name="description" className="form-textarea" rows="3" value={taskForm.description} onChange={handleInputChange}></textarea>
                </div>
                <div className="form-group">
                  <label>Count *</label>
                  <input type="number" name="count" className="form-input" value={taskForm.count} onChange={handleInputChange} required />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Task</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerTasks;
