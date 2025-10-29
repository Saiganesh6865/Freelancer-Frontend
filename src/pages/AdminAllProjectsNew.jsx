import React, { useState, useEffect } from 'react';
import api from '../services/api';

import './AdminDashboard.css';
import './AdminAllProjects.css';

const AdminAllProjects = () => {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Filter and search states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);

  const projectTypes = [
    { value: 'it', label: 'IT & Software', icon: '💻' },
    { value: 'design', label: 'Design & Creative', icon: '🎨' },
    { value: 'writing', label: 'Writing & Content', icon: '✍️' },
    { value: 'marketing', label: 'Marketing & Sales', icon: '📈' },
    { value: 'business', label: 'Business & Consulting', icon: '💼' },
    { value: 'annotations', label: 'Data & Annotations', icon: '📊' }
  ];

  const statusOptions = [
    { value: 'open', label: 'Open', color: '#3498db' },
    { value: 'in-progress', label: 'In Progress', color: '#f39c12' },
    { value: 'completed', label: 'Completed', color: '#27ae60' },
    { value: 'closed', label: 'Closed', color: '#95a5a6' }
  ];

  useEffect(() => {
    fetchManagers();
    fetchProjects();

    // Listen for project creation events
    const handleProjectCreated = () => {
      fetchProjects();
    };

    window.addEventListener('projectCreated', handleProjectCreated);

    // Auto-refresh every 30 seconds for real-time updates
    const intervalId = setInterval(() => {
      fetchProjects();
    }, 30000);

    return () => {
      window.removeEventListener('projectCreated', handleProjectCreated);
      clearInterval(intervalId);
    };
  }, []);

  // Filter and search effect
  useEffect(() => {
    let filtered = [...projects];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(project => 
        project.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.skills_required?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(project => 
        project.status?.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(project => 
        project.project_type?.toLowerCase() === typeFilter.toLowerCase()
      );
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue = a[sortBy] || '';
      let bValue = b[sortBy] || '';
      
      if (sortBy === 'created_at') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredProjects(filtered);
    setCurrentPage(1);
  }, [projects, searchTerm, statusFilter, typeFilter, sortBy, sortOrder]);

  const fetchManagers = async () => {
    try {
      const usersData = await api.listUsers();
      setManagers(usersData.filter(user => user.role === 'manager'));
    } catch (err) {
      console.warn('Managers fetch failed:', err);
      setManagers([]);
    }
  };

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const projectsData = await api.getAllProjects();
      setProjects(projectsData || []);
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError('Failed to load projects');
      setTimeout(() => setError(''), 3000);
    } finally {
      setLoading(false);
    }
  };

 const handleAssignManager = async (projectId, managerId) => {
  if (!managerId) return;
  try {
    const manager = managers.find(m => String(m.id) === String(managerId));
    if (!manager) throw new Error('Manager not found');

    console.log('Assigning manager:', { projectId, managerId, managerUsername: manager.username });
    
    // Correct API call
    await api.assignManager(manager.username, [projectId]);

    setSuccess('Manager assigned successfully!');
    fetchProjects();
    setTimeout(() => setSuccess(''), 3000);
  } catch (err) {
    console.error('Error assigning manager:', err);
    setError('Failed to assign manager');
    setTimeout(() => setError(''), 3000);
  }
};


  const handleDeleteProject = async () => {
    if (!projectToDelete) return;
    
    try {
      await api.deleteProject(projectToDelete.id);
      setSuccess('Project deleted successfully!');
      setProjects(prev => prev.filter(p => p.id !== projectToDelete.id));
      setShowDeleteModal(false);
      setProjectToDelete(null);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error(err);
      setError('Failed to delete project');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleViewProject = (project) => {
    setSelectedProject(project);
    setShowViewModal(true);
  };

  const handleEditProject = (project) => {
    setEditingProject({...project});
    setShowEditModal(true);
  };

  const handleUpdateProject = async () => {
    if (!editingProject) return;
    
    try {
      await api.updateProject(editingProject.id, editingProject);
      setSuccess('Project updated successfully!');
      setProjects(prev => prev.map(p => p.id === editingProject.id ? editingProject : p));
      setShowEditModal(false);
      setEditingProject(null);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error(err);
      setError('Failed to update project');
      setTimeout(() => setError(''), 3000);
    }
  };

  const confirmDelete = (project) => {
    setProjectToDelete(project);
    setShowDeleteModal(true);
  };

  const truncateText = (text, maxLength = 100) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  const getTypeIcon = (type) => {
    const projectType = projectTypes.find(t => t.value === type?.toLowerCase());
    return projectType ? projectType.icon : '📄';
  };

  const getStatusColor = (status) => {
    const statusOption = statusOptions.find(s => s.value === status?.toLowerCase());
    return statusOption ? statusOption.color : '#95a5a6';
  };

  // Pagination
  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProjects = filteredProjects.slice(startIndex, endIndex);

  const goToPage = (pageNumber) => {
    setCurrentPage(Math.max(1, Math.min(pageNumber, totalPages)));
  };

  return (
    <div className="main-content">
      <div className="projects-header">
        <div className="header-content">
          <div>
            <h1 className="page-title">All Projects</h1>
            <p className="page-subtitle">Manage and monitor all projects in the system</p>
          </div>
          <button 
            className="btn btn-secondary refresh-btn" 
            onClick={fetchProjects}
            disabled={loading}
            title="Refresh projects"
          >
            {loading ? '🔄' : '↻'} Refresh
          </button>
        </div>
        <div className="projects-stats">
          <div className="stat-card">
            <span className="stat-number">{projects.length}</span>
            <span className="stat-label">Total Projects</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{projects.filter(p => p.status === 'open').length}</span>
            <span className="stat-label">Open</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{projects.filter(p => p.status === 'in-progress').length}</span>
            <span className="stat-label">In Progress</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{projects.filter(p => p.status === 'completed').length}</span>
            <span className="stat-label">Completed</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          <span className="alert-icon">⚠️</span>
          {error}
        </div>
      )}
      {success && (
        <div className="alert alert-success">
          <span className="alert-icon">✅</span>
          {success}
        </div>
      )}

      <div className="projects-container">
        {/* Filters and Search */}
        <div className="filters-section">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search projects by title, description, or skills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <span className="search-icon">🔍</span>
          </div>
          
          <div className="filters-row">
            <div className="filter-group">
              <label>Status:</label>
              <select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Status</option>
                {statusOptions.map(status => (
                  <option key={status.value} value={status.value}>{status.label}</option>
                ))}
              </select>
            </div>
            
            <div className="filter-group">
              <label>Type:</label>
              <select 
                value={typeFilter} 
                onChange={(e) => setTypeFilter(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Types</option>
                {projectTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
            
            <div className="filter-group">
              <label>Sort by:</label>
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="filter-select"
              >
                <option value="created_at">Created Date</option>
                <option value="title">Title</option>
                <option value="status">Status</option>
                <option value="project_type">Type</option>
              </select>
            </div>
            
            <div className="filter-group">
              <label>Order:</label>
              <select 
                value={sortOrder} 
                onChange={(e) => setSortOrder(e.target.value)}
                className="filter-select"
              >
                <option value="desc">Newest First</option>
                <option value="asc">Oldest First</option>
              </select>
            </div>
          </div>
        </div>

        {/* Projects Table */}
        <div className="projects-table-container">
          {loading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Loading projects...</p>
            </div>
          ) : filteredProjects.length > 0 ? (
            <>
              <div className="table-wrapper">
                <table className="projects-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Title</th>
                      <th>Type</th>
                      <th>Status</th>
                      <th>Created By</th>
                      <th>Skills</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentProjects.map((project) => (
                      <tr key={project.id} className="project-row">
                        <td className="project-id">#{project.id}</td>
                        <td className="project-title-cell">
                          <div className="title-container">
                            <h4 className="table-title">{project.title || 'Untitled'}</h4>
                            <div className="description-tooltip" title={project.description}>
                              {truncateText(project.description, 60)}
                            </div>
                          </div>
                        </td>
                        <td className="project-type">
                          <span className="type-badge">
                            <span className="type-icon">{getTypeIcon(project.project_type)}</span>
                            {projectTypes.find(t => t.value === project.project_type?.toLowerCase())?.label || project.project_type}
                          </span>
                        </td>
                        <td className="project-status">
                          <span 
                            className="status-badge" 
                            style={{ backgroundColor: getStatusColor(project.status) }}
                          >
                            {project.status || 'Unknown'}
                          </span>
                        </td>
                        <td className="created-by">{project.created_by || 'N/A'}</td>
                        <td className="skills-cell">
                          <div className="skills-tooltip" title={project.skills_required}>
                            {truncateText(project.skills_required, 30)}
                          </div>
                        </td>
                        <td className="actions-cell">
                          <div className="action-buttons">
                            <button 
                              className="action-btn view-btn" 
                              onClick={() => handleViewProject(project)}
                              title="View Details"
                            >
                              👁️
                            </button>
                            <button 
                              className="action-btn edit-btn" 
                              onClick={() => handleEditProject(project)}
                              title="Edit Project"
                            >
                              ✏️
                            </button>
                            <button 
                              className="action-btn delete-btn" 
                              onClick={() => confirmDelete(project)}
                              title="Delete Project"
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="pagination">
                  <button 
                    className="pagination-btn" 
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    ← Previous
                  </button>
                  
                  <div className="pagination-numbers">
                    {[...Array(totalPages)].map((_, index) => {
                      const pageNumber = index + 1;
                      const isCurrentPage = pageNumber === currentPage;
                      const showPage = pageNumber === 1 || pageNumber === totalPages || 
                                     (pageNumber >= currentPage - 2 && pageNumber <= currentPage + 2);
                      
                      if (!showPage && pageNumber !== currentPage - 3 && pageNumber !== currentPage + 3) {
                        return null;
                      }
                      
                      if ((pageNumber === currentPage - 3 || pageNumber === currentPage + 3) && totalPages > 7) {
                        return <span key={pageNumber} className="pagination-ellipsis">...</span>;
                      }
                      
                      return (
                        <button
                          key={pageNumber}
                          className={`pagination-number ${isCurrentPage ? 'active' : ''}`}
                          onClick={() => goToPage(pageNumber)}
                        >
                          {pageNumber}
                        </button>
                      );
                    })}
                  </div>
                  
                  <button 
                    className="pagination-btn" 
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next →
                  </button>
                </div>
              )}
              
              <div className="table-info">
                Showing {startIndex + 1}-{Math.min(endIndex, filteredProjects.length)} of {filteredProjects.length} projects
              </div>
            </>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">📋</div>
              <h3>No projects found</h3>
              <p>No projects match your current filters. Try adjusting your search criteria.</p>
            </div>
          )}
        </div>
      </div>

      {/* View Project Modal */}
      {showViewModal && selectedProject && (
        <div className="modal-overlay" onClick={() => setShowViewModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Project Details</h3>
              <button className="modal-close" onClick={() => setShowViewModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="project-detail">
                <h4>{selectedProject.title}</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>ID:</label>
                    <span>#{selectedProject.id}</span>
                  </div>
                  <div className="detail-item">
                    <label>Type:</label>
                    <span>{getTypeIcon(selectedProject.project_type)} {selectedProject.project_type}</span>
                  </div>
                  <div className="detail-item">
                    <label>Status:</label>
                    <span className="status-badge" style={{ backgroundColor: getStatusColor(selectedProject.status) }}>
                      {selectedProject.status}
                    </span>
                  </div>
                  <div className="detail-item">
                    <label>Created By:</label>
                    <span>{selectedProject.created_by}</span>
                  </div>
                  <div className="detail-item full-width">
                    <label>Description:</label>
                    <p>{selectedProject.description || 'No description provided'}</p>
                  </div>
                  <div className="detail-item full-width">
                    <label>Required Skills:</label>
                    <p>{selectedProject.skills_required || 'No skills specified'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Project Modal */}
      {showEditModal && editingProject && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Project</h3>
              <button className="modal-close" onClick={() => setShowEditModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <form onSubmit={(e) => { e.preventDefault(); handleUpdateProject(); }}>
                <div className="form-group">
                  <label>Title:</label>
                  <input
                    type="text"
                    value={editingProject.title || ''}
                    onChange={(e) => setEditingProject({...editingProject, title: e.target.value})}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>Description:</label>
                  <textarea
                    value={editingProject.description || ''}
                    onChange={(e) => setEditingProject({...editingProject, description: e.target.value})}
                    className="form-textarea"
                    rows="4"
                  />
                </div>
                <div className="form-group">
                  <label>Skills Required:</label>
                  <textarea
                    value={editingProject.skills_required || ''}
                    onChange={(e) => setEditingProject({...editingProject, skills_required: e.target.value})}
                    className="form-textarea"
                    rows="3"
                  />
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Update Project
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && projectToDelete && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-content delete-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Confirm Delete</h3>
              <button className="modal-close" onClick={() => setShowDeleteModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="delete-warning">
                <span className="warning-icon">⚠️</span>
                <p>Are you sure you want to delete the project <strong>"{projectToDelete.title}"</strong>?</p>
                <p className="warning-text">This action cannot be undone.</p>
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={handleDeleteProject}>
                Delete Project
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAllProjects;
