import React, { useState, useEffect } from 'react';
import api from '../services/api';

import './BatchCreationModal.css';

const BatchCreationModal = ({ isOpen, onClose, onBatchCreated, selectedProject = null }) => {
  const [formData, setFormData] = useState({
    project_id: '',
    project_name: '',
    batch_name: '',
    count: '',
    skills_required: '',
    project_type: 'it',
    assign_to: ''
  });
  const [projects, setProjects] = useState([]);
  const [freelancers, setFreelancers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [skillTags, setSkillTags] = useState([]);
  const [skillInput, setSkillInput] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchProjects();
      fetchFreelancers();
      if (selectedProject) {
        setFormData(prev => ({
          ...prev,
          project_id: selectedProject.id,
          project_name: selectedProject.title || selectedProject.project_name,
          project_type: selectedProject.project_type || 'it'
        }));
      }
    }
  }, [isOpen, selectedProject]);

  const fetchProjects = async () => {
    try {
      const data = await api.getAllProjects();
      setProjects(data || []);
    } catch (err) {
      console.error('Error fetching projects:', err);
    }
  };

  const fetchFreelancers = async () => {
    try {
      const data = await api.getFreelancers();
      setFreelancers(data || []);
    } catch (err) {
      console.error('Error fetching freelancers:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Auto-fill project name when project is selected
    if (name === 'project_id') {
      const selectedProj = projects.find(p => p.id === parseInt(value));
      if (selectedProj) {
        setFormData(prev => ({
          ...prev,
          project_name: selectedProj.title || selectedProj.project_name,
          project_type: selectedProj.project_type || 'it'
        }));
      }
    }
  };

  const handleSkillAdd = (e) => {
    if (e.key === 'Enter' && skillInput.trim()) {
      e.preventDefault();
      if (!skillTags.includes(skillInput.trim())) {
        const newTags = [...skillTags, skillInput.trim()];
        setSkillTags(newTags);
        setFormData(prev => ({
          ...prev,
          skills_required: newTags.join(', ')
        }));
      }
      setSkillInput('');
    }
  };

  const removeSkill = (skillToRemove) => {
    const newTags = skillTags.filter(skill => skill !== skillToRemove);
    setSkillTags(newTags);
    setFormData(prev => ({
      ...prev,
      skills_required: newTags.join(', ')
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const batchData = {
        project_id: parseInt(formData.project_id),
        batch_name: formData.batch_name,
        count: parseInt(formData.count),
        skills_required: formData.skills_required,
        project_type: formData.project_type,
        assign_to: formData.assign_to ? parseInt(formData.assign_to) : null
      };

      await api.createBatch(batchData);
      onBatchCreated();
      onClose();
      resetForm();
    } catch (err) {
      console.error('Error creating batch:', err);
      setError(err.message || 'Failed to create batch');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      project_id: '',
      project_name: '',
      batch_name: '',
      count: '',
      skills_required: '',
      project_type: 'it',
      assign_to: ''
    });
    setSkillTags([]);
    setSkillInput('');
    setError('');
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="batch-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create New Batch</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="batch-form">
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
              <label htmlFor="project_name">Project Name</label>
              <input
                type="text"
                id="project_name"
                name="project_name"
                value={formData.project_name}
                readOnly
                className="readonly-input"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="batch_name">Batch Name *</label>
              <input
                type="text"
                id="batch_name"
                name="batch_name"
                value={formData.batch_name}
                onChange={handleInputChange}
                placeholder="Enter batch name"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="count">Count *</label>
              <input
                type="number"
                id="count"
                name="count"
                value={formData.count}
                onChange={handleInputChange}
                placeholder="Number of tasks"
                min="1"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="skills_input">Skills Required</label>
            <div className="skills-container">
              <div className="skill-tags">
                {skillTags.map((skill, index) => (
                  <span key={index} className="skill-tag">
                    {skill}
                    <button type="button" onClick={() => removeSkill(skill)}>&times;</button>
                  </span>
                ))}
              </div>
              <input
                type="text"
                id="skills_input"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyPress={handleSkillAdd}
                placeholder="Type skill and press Enter"
                className="skill-input"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="project_type">Project Type</label>
              <select
                id="project_type"
                name="project_type"
                value={formData.project_type}
                onChange={handleInputChange}
              >
                <option value="it">IT</option>
                <option value="marketing">Marketing</option>
                <option value="design">Design</option>
                <option value="content">Content</option>
                <option value="research">Research</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="assign_to">Assign To</label>
              <select
                id="assign_to"
                name="assign_to"
                value={formData.assign_to}
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
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create Batch'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BatchCreationModal;
