import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

import './AdminDashboard.css';
import './AdminCreateProject.css';

const AdminCreateProject = () => {
  const { user } = useAuth();
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    required_skills: [],
    project_type: 'it',
    budget: ''
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const [skillInput, setSkillInput] = useState('');

  const projectTypes = [
    { value: 'it', label: 'IT & Software' },
    { value: 'design', label: 'Design & Creative' },
    { value: 'writing', label: 'Writing & Content' },
    { value: 'marketing', label: 'Marketing & Sales' },
    { value: 'business', label: 'Business & Consulting' },
    { value: 'annotations', label: 'Data & Annotations' }
  ];

  const commonSkills = [
    'JavaScript', 'Python', 'React', 'Node.js', 'PHP', 'Java', 'C++', 'HTML/CSS',
    'UI/UX Design', 'Graphic Design', 'Adobe Photoshop', 'Figma', 'Illustrator',
    'Content Writing', 'Copywriting', 'Technical Writing', 'SEO', 'Blog Writing',
    'Digital Marketing', 'Social Media', 'Google Ads', 'Analytics', 'Email Marketing',
    'Project Management', 'Business Analysis', 'Data Analysis', 'Excel', 'PowerBI'
  ];

  const validateForm = () => {
    const errors = {};
    
    if (!newProject.title.trim()) {
      errors.title = 'Title is required';
    } else if (newProject.title.length < 5) {
      errors.title = 'Title must be at least 5 characters';
    }
    
    if (!newProject.description.trim()) {
      errors.description = 'Description is required';
    } else if (newProject.description.length < 20) {
      errors.description = 'Description must be at least 20 characters';
    }
    
    if (newProject.required_skills.length === 0) {
      errors.skills = 'At least one skill is required';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const addSkill = (skill) => {
    if (skill && !newProject.required_skills.includes(skill)) {
      setNewProject({
        ...newProject,
        required_skills: [...newProject.required_skills, skill]
      });
      setSkillInput('');
      if (validationErrors.skills) {
        setValidationErrors({ ...validationErrors, skills: null });
      }
    }
  };

  const removeSkill = (skillToRemove) => {
    setNewProject({
      ...newProject,
      required_skills: newProject.required_skills.filter(skill => skill !== skillToRemove)
    });
  };

  const handleSkillInputKeyPress = (e) => {
    if (e.key === 'Enter' && skillInput.trim()) {
      e.preventDefault();
      addSkill(skillInput.trim());
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Prepare payload
      const payload = {
        title: newProject.title,
        description: newProject.description,
        project_type: newProject.project_type,
        required_skills: newProject.required_skills,
        budget: newProject.budget,
        description_file: null,
      };

      if (file) {
        const base64File = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => resolve(reader.result.split(',')[1]); // only Base64
          reader.onerror = (err) => reject(err);
        });
        payload.description_file = base64File;
      }

      const result = await api.createProject(payload);
      console.log("Project result:", result);

      setSuccess('Project created successfully!');

      // Reset only on success
      setNewProject({
        title: '',
        description: '',
        project_type: 'it',
        required_skills: [],
        budget: ''
      });
      setValidationErrors({});
      setSkillInput('');
      setFile(null);

      setTimeout(() => setSuccess(''), 3000);

      window.dispatchEvent(new CustomEvent('projectCreated', { 
        detail: { project: result, timestamp: new Date().toISOString() } 
      }));

      localStorage.setItem('lastProjectCreated', JSON.stringify({
        project: result,
        timestamp: new Date().toISOString()
      }));
      localStorage.removeItem('lastProjectCreated');

    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to create project. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setNewProject({ title: '', description: '', required_skills: [], project_type: 'it', budget: '' });
    setValidationErrors({});
    setSkillInput('');
    setError('');
    setSuccess('');
    setFile(null);
  };

  const handleFileUpload = () => {
    document.getElementById('file-input').click();
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  return (
    <div className="main-content">
      <div className="header-card">
        <h1 className="page-title">Create Project</h1>
        <p className="page-description">Create and manage new projects for your organization with ease.</p>
      </div>

      {error && <div className="alert alert-error"><span>⚠️</span> {error}</div>}
      {success && <div className="alert alert-success"><span>✅</span> {success}</div>}

      <div className="create-project-layout">
        <div className="form-card">
          <form onSubmit={handleCreateProject} className="project-form">
            {/* Title */}
            <div className="form-group">
              <label htmlFor="title" className="form-label">Project Title <span className="required">*</span></label>
              <input
                type="text"
                id="title"
                className={`form-input ${validationErrors.title ? 'error' : ''}`}
                value={newProject.title}
                onChange={(e) => {
                  setNewProject({...newProject, title: e.target.value});
                  if (validationErrors.title) setValidationErrors({...validationErrors, title: null});
                }}
                placeholder="Enter a clear, descriptive project title"
              />
              {validationErrors.title && <span className="error-message">{validationErrors.title}</span>}
            </div>

            {/* Project Type */}
            <div className="form-group">
              <label htmlFor="project_type" className="form-label">Project Type <span className="required">*</span></label>
              <select
                id="project_type"
                className="form-input"
                value={newProject.project_type}
                onChange={(e) => setNewProject({...newProject, project_type: e.target.value})}
              >
                {projectTypes.map((type) => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div className="form-group">
              <label htmlFor="description" className="form-label">Project Description <span className="required">*</span></label>
              <textarea
                id="description"
                className={`form-textarea ${validationErrors.description ? 'error' : ''}`}
                rows="5"
                value={newProject.description}
                onChange={(e) => {
                  setNewProject({...newProject, description: e.target.value});
                  if (validationErrors.description) setValidationErrors({...validationErrors, description: null});
                }}
                placeholder="Provide a detailed description of the project requirements, goals, and deliverables..."
              />
              <div className="char-count">{newProject.description.length}/500 characters</div>
              {validationErrors.description && <span className="error-message">{validationErrors.description}</span>}
            </div>

            {/* Skills */}
            <div className="form-group">
              <label className="form-label">Required Skills <span className="required">*</span></label>
              <div className="skills-input-container">
                <input
                  type="text"
                  className={`skills-input ${validationErrors.skills ? 'error' : ''}`}
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyPress={handleSkillInputKeyPress}
                  placeholder="Type a skill and press Enter"
                />
                <button type="button" className="add-skill-btn" onClick={() => { if(skillInput.trim()) addSkill(skillInput.trim()); }}>Add</button>
              </div>
              <div className="skills-suggestions">
                <p className="suggestions-label">Popular skills:</p>
                <div className="skill-suggestions">
                  {commonSkills.filter(skill => !newProject.required_skills.includes(skill) && skill.toLowerCase().includes(skillInput.toLowerCase())).slice(0,6).map(skill => (
                    <button key={skill} type="button" className="skill-suggestion" onClick={() => addSkill(skill)}>{skill}</button>
                  ))}
                </div>
              </div>
              <div className="selected-skills">
                {newProject.required_skills.map((skill, index) => (
                  <span key={index} className="skill-chip">{skill}
                    <button type="button" className="remove-skill" onClick={() => removeSkill(skill)}>×</button>
                  </span>
                ))}
              </div>
              {validationErrors.skills && <span className="error-message">{validationErrors.skills}</span>}
            </div>

            {/* File Upload */}
            <div className="form-group">
              <label className="form-label">Project Files (Optional)</label>
              <div className="file-upload-section">
                <div className="file-input-container">
                  <input type="text" className="file-display-input" value={file ? file.name : ''} placeholder="No file selected" readOnly />
                  <button type="button" className="attach-btn" onClick={handleFileUpload} title="Attach file">📎</button>
                </div>
                <input type="file" id="file-input" className="hidden-file-input" accept=".pdf,.doc,.docx,.txt,.zip,.rar" onChange={handleFileChange} />
                <p className="file-hint">Supported formats: PDF, DOC, DOCX, TXT, ZIP, RAR (Max 10MB)</p>
              </div>
            </div>

            {/* Actions */}
            <div className="form-actions">
              <button type="button" className="btn btn-secondary" onClick={resetForm}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? (<><span className="loading-spinner"></span>Creating Project...</>) : 'Submit'}
              </button>
            </div>
          </form>
        </div>

        {/* Live Preview */}
        <div className="preview-card">
          <div className="preview-header">
            <h3 className="preview-title">📋 Live Preview</h3>
            <div className="preview-status">
              <span className="status-dot"></span>
              <span className="status-text">Real-time</span>
            </div>
          </div>
          <div className="project-preview">
            <div className="preview-item"><div className="preview-icon">📝</div><div className="preview-content"><strong>Project Title</strong><span className="preview-value">{newProject.title || 'Enter project title...'}</span></div></div>
            <div className="preview-item"><div className="preview-icon">🏷️</div><div className="preview-content"><strong>Project Type</strong><span className="preview-value type-badge">{projectTypes.find(t => t.value===newProject.project_type)?.label || 'IT & Software'}</span></div></div>
            <div className="preview-item"><div className="preview-icon">📄</div><div className="preview-content"><strong>Description</strong><span className="preview-value description-text">{newProject.description || 'Enter project description...'}</span></div></div>
            <div className="preview-item"><div className="preview-icon">🛠️</div><div className="preview-content"><strong>Required Skills</strong><div className="preview-skill-list">{newProject.required_skills.length>0?newProject.required_skills.map((s,i)=><span key={i} className="preview-skill-chip">{s}</span>):<span className="no-skills">No skills added yet...</span>}</div></div></div>
            <div className="preview-item"><div className="preview-icon">💰</div><div className="preview-content"><strong>Budget</strong><span className="preview-value budget-text">{newProject.budget || 'To be discussed'}</span></div></div>
            <div className="preview-item"><div className="preview-icon">📎</div><div className="preview-content"><strong>Attached File</strong><span className="preview-value file-text">{file ? <span className="file-attached">📄 {file.name}</span>:<span className="no-file">No file attached</span>}</span></div></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCreateProject;
