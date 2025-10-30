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

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const projectsPerPage = 5;

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const data = await api.getSuggestedBatches();
      setProjects(data || []);
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

      if (result && !result.error) {
        setProjects(prev =>
          prev.map(p =>
            p.id === selectedProject.id ? { ...p, already_applied: true } : p
          )
        );
        showSuccessToast();
        closeModal();
      } else {
        setError(result?.error || 'Failed to send request. Please try again.');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to send request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(projects.length / projectsPerPage) || 1;
  const indexOfLastProject = currentPage * projectsPerPage;
  const indexOfFirstProject = indexOfLastProject - projectsPerPage;
  const currentProjects = projects.slice(indexOfFirstProject, indexOfLastProject);

  const handlePageChange = (pageNumber) => {
    if (pageNumber < 1 || pageNumber > totalPages) return;
    setCurrentPage(pageNumber);
  };

  if (loading) return <div className="loading">Loading projects...</div>;

  return (
    <div className="main-content">
      <h1>Available Projects</h1>

      {error && <p className="error">{error}</p>}

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
            {currentProjects.map(project => (
              <tr key={project.id}>
                <td>{project.project_name}</td>
                <td>{project.project_type}</td>
                <td>{project.skills_required}</td>
                <td>{new Date(project.created_at).toLocaleDateString()}</td>
                <td>
                  {project.already_applied ? (
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

      {/* Pagination */}
      {projects.length > projectsPerPage && (
        <div className="pagination">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            &laquo; Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              className={currentPage === i + 1 ? 'active' : ''}
              onClick={() => handlePageChange(i + 1)}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next &raquo;
          </button>
        </div>
      )}

      {/* Modal */}
      {selectedProject && (
        <div
          className="modal-overlay"
          onClick={e => e.target === e.currentTarget && closeModal()}
        >
          <div className="modal">
            <div className="modal-header">
              <h3>Request to Join: {selectedProject.project_name}</h3>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>
            <div className="modal-body">
              <p><strong>Type:</strong> {selectedProject.project_type}</p>
              <p><strong>Skills Required:</strong> {selectedProject.skills_required}</p>
              <p><strong>Created:</strong> {new Date(selectedProject.created_at).toLocaleDateString()}</p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={closeModal} disabled={submitting}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleConfirm} disabled={submitting}>
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
