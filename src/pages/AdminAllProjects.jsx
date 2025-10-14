import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faEye, 
  faEdit, 
  faTrash, 
  faUserTie, 
  faArrowRight,
  faSearch,
  faFilter,
  faSort,
  faEllipsisV,
  faFileExcel,
  faShareNodes,
  faThList
} from '@fortawesome/free-solid-svg-icons';
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
  const [showUpdateConfirmModal, setShowUpdateConfirmModal] = useState(false);

  // Assign Manager popup states
  const [showAssignPopup, setShowAssignPopup] = useState(false);
  const [projectToAssign, setProjectToAssign] = useState(null);
  const [selectedManagerId, setSelectedManagerId] = useState('');
  const [selectedManagerUsername, setSelectedManagerUsername] = useState('');

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
    fetchProjects();
    fetchManagers();
    
    // Listen for project creation events for real-time updates
    const handleProjectCreated = (event) => {
      console.log('Project created event received:', event.detail);
      fetchProjects(); // Refresh the projects list immediately
    };
    
    // Listen for storage events for cross-tab updates
    const handleStorageChange = (event) => {
      if (event.key === 'lastProjectCreated') {
        console.log('Storage event detected - refreshing projects');
        fetchProjects();
      }
    };
    
    window.addEventListener('projectCreated', handleProjectCreated);
    window.addEventListener('storage', handleStorageChange);
    
    // Auto-refresh every 30 seconds for real-time updates
    const intervalId = setInterval(() => {
      fetchProjects();
    }, 30000);
    
    return () => {
      window.removeEventListener('projectCreated', handleProjectCreated);
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(intervalId);
    };
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Add timeout to prevent hanging when backend is not available
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 5000)
      );
      
      const projectsPromise = api.getAllProjects();
      const response = await Promise.race([projectsPromise, timeoutPromise]);
      const projectsData = response.projects || response || [];
      setProjects(projectsData);
      setFilteredProjects(projectsData);
    } catch (error) {
      console.error('Error fetching projects:', error);
      if (error.message.includes('timeout')) {
        setError('Failed to load projects. Backend server may not be running.');
      } else if (error.message.includes('403') || error.message.includes('Forbidden')) {
        setError('Access denied. Please ensure you are logged in as an admin.');
      } else {
        setError('Failed to load projects. Please try again.');
      }
      setProjects([]);
      setFilteredProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchManagers = async () => {
    try {
      const data = await api.listUsers();
      const managerUsers = data.filter(user => user.role === 'manager');
      setManagers(managerUsers);
    } catch (error) {
      console.error('Error fetching managers:', error);
      setManagers([]);
    }
  };

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

  const handleAssignManager = async (projectId, managerId) => {
    if (!managerId) return;

    try {
      const selectedManager = managers.find(m => m.id == managerId);
      if (!selectedManager) return;

      const payload = {
        manager_username: selectedManager.username, // use username
        job_ids: [parseInt(projectId)] // array
      };

      const result = await api.assignManager(payload.manager_username, payload.job_ids);
      console.log('Assignment result:', result);

      setSuccess('Manager assigned successfully!');
      fetchProjects(); // Refresh projects after assignment
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error assigning manager:', error);
      setError('Failed to assign manager. Please try again.');
      setTimeout(() => setError(''), 3000);
    }
  };

  const isManagerAssigned = (project) => {
    return project.manager_id && project.manager_id !== null;
  };

  const handleViewProject = (project) => {
    setSelectedProject(project);
    setShowViewModal(true);
  };

  const handleEditProject = (project) => {
    setEditingProject({...project});
    setShowEditModal(true);
  };

  const handleUpdateClick = () => {
    if (!editingProject) return;
    setShowUpdateConfirmModal(true);
  };

  const handleUpdateProject = async () => {
    if (!editingProject) return;
    setShowUpdateConfirmModal(false);
    
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
      {/* Alerts */}
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

      {/* Projects Table with Search */}
      <div className="table-wrapper">
        <div className="table-header-actions">
          <h1 className="page-title" style={{ margin: '0', fontSize: '24px' }}>All Projects</h1>
          <div className="search-actions-right">
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input-compact"
            />
            <button className="search-icon-btn" title="Search">
              <FontAwesomeIcon icon={faSearch} />
            </button>
            <button className="action-icon-btn" title="Export to Excel">
              <FontAwesomeIcon icon={faFileExcel} />
            </button>
            <button className="action-icon-btn" title="Share">
              <FontAwesomeIcon icon={faShareNodes} />
            </button>
            <button className="action-icon-btn" title="List View">
              <FontAwesomeIcon icon={faThList} />
            </button>
          </div>
        </div>
        
        <div className="table-container">
        <table className="projects-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>TITLE</th>
              <th>TYPE</th>
              <th>STATUS</th>
              <th>MANAGER</th>
              <th>CREATED BY</th>
              <th>VIEW</th>
              <th>EDIT</th>
              <th>SELECT MANAGER</th>
              <th>DELETE</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="10" className="loading-cell">
                  <div className="loading-spinner"></div>
                  <span>Loading projects...</span>
                </td>
              </tr>
            ) : filteredProjects.length > 0 ? (
              currentProjects.map((project) => (
                <tr key={project.id}>
                  <td>{project.id}</td>
                  <td>{project.title || 'Untitled Project'}</td>
                  <td>{project.project_type || 'N/A'}</td>
                  <td>
                    <span className={`status-badge-table ${project.status?.toLowerCase() || 'open'}`}>
                      {project.status || 'Open'}
                    </span>
                  </td>
                  <td>
                    {project.manager_username ? (
                      <span className="manager-assigned">{project.manager_username}</span>
                    ) : (
                      <span className="manager-unassigned">Unassigned</span>
                    )}
                  </td>
                  <td>{project.created_by || 'N/A'}</td>
                  <td className="action-cell">
                    <button 
                      className="table-action-btn view-btn" 
                      onClick={() => handleViewProject(project)}
                      title="View Details"
                    >
                      <FontAwesomeIcon icon={faEye} />
                    </button>
                  </td>
                  <td className="action-cell">
                    <button 
                      className="table-action-btn edit-btn" 
                      onClick={() => handleEditProject(project)}
                      title="Edit"
                    >
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                  </td>
                  <td className="action-cell">
                    <select
                      className="manager-select-inline"
                      value={project.manager_id || ''}
                      onChange={(e) => handleAssignManager(project.id, e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      title="Select Manager"
                    >
                      <option value="">Select Manager</option>
                      {managers.map((manager) => (
                        <option key={manager.id} value={manager.id}>
                          {manager.username}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="action-cell">
                    <button 
                      className="table-action-btn delete-btn" 
                      onClick={() => confirmDelete(project)}
                      title="Delete"
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="10" className="no-data-cell">
                  No projects found. Try adjusting your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      {filteredProjects.length > 0 && (
        <div className="pagination">
          <span className="pagination-info">
            Showing {startIndex + 1} to {Math.min(endIndex, filteredProjects.length)} of {filteredProjects.length} entries
          </span>
          <div className="pagination-controls">
            <button 
              className="pagination-nav-btn"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              &lt; Previous
            </button>
            <span className="pagination-text">Page</span>
            <span className="page-number">{currentPage}</span>
            <span className="pagination-text">of {totalPages || 1}</span>
            <button 
              className="pagination-nav-btn"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next &gt;
            </button>
          </div>
        </div>
      )}
      </div>

      {/* View Project Modal */}
      {showViewModal && selectedProject && (
        <div className="modal-overlay" onClick={() => setShowViewModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{selectedProject.title}</h3>
              <button className="modal-close" onClick={() => setShowViewModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="project-detail">
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
              <form onSubmit={(e) => { e.preventDefault(); handleUpdateClick(); }}>
                <div className="form-group">
                  <label>Title</label>
                  <input
                    type="text"
                    value={editingProject.title || ''}
                    onChange={(e) => setEditingProject({...editingProject, title: e.target.value})}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={editingProject.description || ''}
                    onChange={(e) => setEditingProject({...editingProject, description: e.target.value})}
                    className="form-textarea"
                  />
                </div>
                <div className="form-group">
                  <label>Skills Required</label>
                  <textarea
                    value={editingProject.skills_required || ''}
                    onChange={(e) => setEditingProject({...editingProject, skills_required: e.target.value})}
                    className="form-textarea"
                  />
                </div>
              </form>
            </div>
            <div className="modal-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>
                Cancel
              </button>
              <button type="button" className="btn btn-primary" onClick={handleUpdateClick}>
                Update Project
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && projectToDelete && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-content delete-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '700px', width: '90%' }}>
            <div className="modal-header" style={{ padding: '14px 24px' }}>
              <h3 style={{ margin: 0, fontSize: '17px' }}>Confirm Delete</h3>
              <button className="modal-close" onClick={() => setShowDeleteModal(false)}>×</button>
            </div>
            <div className="modal-body" style={{ padding: '14px 24px' }}>
              <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '14px' }}>
                <span style={{ fontSize: '28px', flexShrink: 0, lineHeight: 1 }}>⚠️</span>
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <p style={{ fontSize: '14px', color: '#2c3e50', margin: '0 0 4px 0', fontWeight: '500', lineHeight: 1.4 }}>
                    Are you sure you want to delete the project <strong>"{projectToDelete.title}"</strong>?
                  </p>
                  <p style={{ fontSize: '12px', color: '#e74c3c', margin: '0', fontWeight: '500', lineHeight: 1.3 }}>
                    This action cannot be undone.
                  </p>
                </div>
              </div>
            </div>
            <div className="modal-actions" style={{ padding: '10px 24px' }}>
              <button className="btn btn-secondary" onClick={() => setShowDeleteModal(false)} style={{ padding: '8px 20px', fontSize: '14px' }}>
                No, Cancel
              </button>
              <button className="btn btn-danger" onClick={handleDeleteProject} style={{ padding: '8px 20px', fontSize: '14px' }}>
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Update Project Confirmation Modal */}
      {showUpdateConfirmModal && (
        <div className="modal-overlay" onClick={() => setShowUpdateConfirmModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '700px', width: '90%' }}>
            <div className="modal-header" style={{ padding: '14px 24px' }}>
              <h3 style={{ margin: 0, fontSize: '17px' }}>Confirm Project Update</h3>
              <button className="modal-close" onClick={() => setShowUpdateConfirmModal(false)}>×</button>
            </div>
            <div className="modal-body" style={{ padding: '14px 24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <span style={{ fontSize: '28px', flexShrink: 0 }}>❓</span>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '14px', color: '#2c3e50', margin: '0 0 3px 0', fontWeight: '500' }}>
                    Are you sure you want to update this project?
                  </p>
                  <p style={{ fontSize: '12px', color: '#6c757d', margin: '0' }}>
                    Please review all the changes before confirming.
                  </p>
                </div>
              </div>
            </div>
            <div className="modal-actions" style={{ padding: '10px 24px' }}>
              <button className="btn btn-secondary" onClick={() => setShowUpdateConfirmModal(false)} style={{ padding: '8px 20px', fontSize: '14px' }}>
                No, Cancel
              </button>
              <button className="btn btn-primary" onClick={handleUpdateProject} style={{ padding: '8px 20px', fontSize: '14px' }}>
                Yes, Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Manager Confirmation Modal */}
      {showAssignPopup && projectToAssign && (
        <div className="modal-overlay" onClick={() => setShowAssignPopup(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Confirm Manager Assignment</h3>
              <button className="modal-close" onClick={() => setShowAssignPopup(false)}>×</button>
            </div>
            <div className="modal-body">
              <p>
                Are you sure you want to assign <strong>{selectedManagerUsername}</strong> to project <strong>"{projectToAssign.title}"</strong>?
              </p>
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowAssignPopup(false)}>Cancel</button>
              <button
                className="btn btn-primary"
                onClick={async () => {
                  await handleAssignManager(projectToAssign.id, selectedManagerId);
                  setShowAssignPopup(false);
                  setProjectToAssign(null);
                  setSelectedManagerId('');
                  setSelectedManagerUsername('');
                }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminAllProjects;
