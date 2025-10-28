import React, { useState, useEffect } from 'react';
import api from '../services/api';

import './TaskCreationModal.css';

const TaskCreationModal = ({ isOpen, onClose, onTaskCreated, selectedProject = null, selectedBatch = null }) => {
  const [formData, setFormData] = useState({
    project_id: '',
    batch_id: '',
    task_title: '',
    task_description: '',
    assigned_to: '',
    priority: 'medium',
    status: 'todo'
  });
  const [projects, setProjects] = useState([]);
  const [batches, setBatches] = useState([]);
  const [freelancers, setFreelancers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchProjects();
      fetchFreelancers();
      if (selectedProject) {
        setFormData(prev => ({
          ...prev,
          project_id: selectedProject.id
        }));
        fetchBatches(selectedProject.id);
      }
      if (selectedBatch) {
        setFormData(prev => ({
          ...prev,
          batch_id: selectedBatch.id
        }));
      }
    }
  }, [isOpen, selectedProject, selectedBatch]);

  const fetchProjects = async () => {
    try {
      const data = await api.getManagerProjects();
      setProjects(data || []);
    } catch (err) {
      console.error('Error fetching projects:', err);
      setProjects([]);
    }
  };

  const fetchBatches = async (projectId = null) => {
    try {
      const data = await api.listBatches(projectId);
      setBatches(data || []);
    } catch (err) {
      console.error('Error fetching batches:', err);
      setBatches([]);
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Fetch batches when project changes
    if (name === 'project_id' && value) {
      fetchBatches(value);
      setFormData(prev => ({
        ...prev,
        batch_id: '' // Reset batch selection
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const taskData = {
        project_id: parseInt(formData.project_id),
        batch_id: formData.batch_id ? parseInt(formData.batch_id) : null,
        task_title: formData.task_title,
        task_description: formData.task_description,
        assigned_to: formData.assigned_to ? parseInt(formData.assigned_to) : null,
        priority: formData.priority,
        status: formData.status
      };

      await api.createTask(taskData);
      onTaskCreated();
      onClose();
      resetForm();
    } catch (err) {
      console.error('Error creating task:', err);
      setError(err.message || 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      project_id: '',
      batch_id: '',
      task_title: '',
      task_description: '',
      assigned_to: '',
      priority: 'medium',
      status: 'todo'
    });
    setError('');
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="task-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create New Task</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="task-form">
          {error && <div className="alert alert-error">{error}</div>}

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
              <label htmlFor="batch_id">Batch (Optional)</label>
              <select
                id="batch_id"
                name="batch_id"
                value={formData.batch_id}
                onChange={handleInputChange}
                disabled={!formData.project_id}
              >
                <option value="">Select Batch (Optional)</option>
                {batches.map(batch => (
                  <option key={batch.id} value={batch.id}>
                    {batch.batch_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="task_title">Task Title *</label>
            <input
              type="text"
              id="task_title"
              name="task_title"
              value={formData.task_title}
              onChange={handleInputChange}
              placeholder="Enter task title"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="task_description">Task Description</label>
            <textarea
              id="task_description"
              name="task_description"
              value={formData.task_description}
              onChange={handleInputChange}
              placeholder="Describe the task in detail..."
              rows="4"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="assigned_to">Assigned To</label>
              <select
                id="assigned_to"
                name="assigned_to"
                value={formData.assigned_to}
                onChange={handleInputChange}
              >
                <option value="">Select Freelancer (Optional)</option>
                {freelancers.length === 0 ? (
                  <option value="" disabled>No freelancers available</option>
                ) : (
                  freelancers.map(freelancer => (
                    <option key={freelancer.id} value={freelancer.id}>
                      {freelancer.full_name || freelancer.username || freelancer.name} - {freelancer.skills || 'No skills listed'}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="priority">Priority</label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="status">Status</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleInputChange}
            >
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="done">Done</option>
            </select>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskCreationModal;
