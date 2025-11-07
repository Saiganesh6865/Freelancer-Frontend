import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import "./Projects.css";

const Projects = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedProject, setSelectedProject] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const projectsPerPage = 10;

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
      setError("Failed to load projects.");
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
        setProjects((prev) =>
          prev.map((p) =>
            p.id === selectedProject.id ? { ...p, already_applied: true } : p
          )
        );
        showSuccessToast();
        closeModal();
      } else {
        setError(result?.error || "Failed to send request. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to send request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Pagination
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
    <div className="projects-wrapper">
      <div className="projects-card">
        <h2 className="projects-title">All Project Details</h2>

        <div className="table-container">
          <table className="projects-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Skills Required</th>
                <th>Created Date</th>
                <th>Action</th>
              </tr>
            </thead>
          </table>

          <div className="table-body-scroll">
            <table className="projects-table">
              <tbody>
                {currentProjects.length > 0 ? (
                  currentProjects.map((project) => (
                    <tr key={project.id}>
                      <td>{project.project_name}</td>
                      <td>{project.project_type}</td>
                      <td>{project.skills_required}</td>
                      <td>{new Date(project.created_at).toLocaleDateString()}</td>
                      <td>
                        {project.already_applied ? (
                          <span className="status-badge status-applied">Applied</span>
                        ) : (
                          <span
                            className="status-badge status-request"
                            onClick={() => setSelectedProject(project)}
                          >
                            Request
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="no-data">
                      No projects available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>


        {/* Pagination */}
        <div className="pagination-bar">
          <p className="entries-info">
            Showing {indexOfFirstProject + 1}–
            {Math.min(indexOfLastProject, projects.length)} of {projects.length} entries
          </p>

          <div className="pagination-controls">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              &lt;
            </button>
            <span className="page-number">{currentPage}</span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              &gt;
            </button>
          </div>
        </div>

        {showToast && (
          <div className="toast toast-success">✓ Your request has been sent!</div>
        )}
      </div>
    </div>
  );
};

export default Projects;
