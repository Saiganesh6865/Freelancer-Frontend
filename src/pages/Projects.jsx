import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './Projects.css';

const Projects = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedProject, setSelectedProject] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const data = await api.getSuggestedBatches();
      // Track applied projects from API
      const appliedSet = new Set();
      data.forEach((p) => {
        if (p.already_applied) appliedSet.add(p.id);
      });
      setProjects(
        data.map((p) => ({ ...p, isApplied: appliedSet.has(p.id) }))
      );
    } catch (err) {
      console.error(err);
      setError('Failed to load projects.');
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => setSelectedProject(null);

  const showSuccessToast = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleConfirm = async () => {
    if (!selectedProject) return;

    try {
      setSubmitting(true);
      const result = await api.applyToBatch(selectedProject.id);

      if (result?.success === false && result?.error === 'Already applied') {
        setProjects((prev) =>
          prev.map((p) =>
            p.id === selectedProject.id ? { ...p, isApplied: true } : p
          )
        );
        closeModal();
        return;
      }

      if (result?.success !== false) {
        setProjects((prev) =>
          prev.map((p) =>
            p.id === selectedProject.id ? { ...p, isApplied: true } : p
          )
        );
        showSuccessToast();
        closeModal();
      } else {
        setError(result?.error || 'Failed to apply. Please try again.');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to apply. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="loading">Loading projects...</div>;

  return (
    <div className="main-content">
      <h1>Available Projects</h1>

      <div className="project-table-container">
        <table className="project-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Skills Required</th>
              <th>Created</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => (
              <tr key={project.id}>
                <td>{project.project_name}</td>
                <td>{project.project_type}</td>
                <td>{project.skills_required}</td>
                <td>{new Date(project.created_at).toLocaleDateString()}</td>
                <td>
                  {project.isApplied ? (
                    <span className="btn btn-success">Applied</span>
                  ) : (
                    <button
                      className="btn btn-primary"
                      onClick={() => setSelectedProject(project)}
                    >
                      Request
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {selectedProject && (
        <div
          className="modal-overlay"
          onClick={(e) => e.target === e.currentTarget && closeModal()}
        >
          <div className="modal">
            <div className="modal-header">
              <h3>Request to Join: {selectedProject.project_name}</h3>
              <button className="modal-close" onClick={closeModal}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <p><strong>Type:</strong> {selectedProject.project_type}</p>
              <p><strong>Skills Required:</strong> {selectedProject.skills_required}</p>
              <p><strong>Created:</strong> {new Date(selectedProject.created_at).toLocaleDateString()}</p>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={closeModal}
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleConfirm}
                disabled={submitting}
              >
                {submitting ? 'Submitting...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {showToast && (
        <div className="toast toast-success">
          ✓ Your request has been sent!
        </div>
      )}
    </div>
  );
};

export default Projects;
