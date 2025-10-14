import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { 
  faEye, faEdit, faTrash, faArrowRight, faSearch, 
  faFilter, faSort, faEllipsisV, faFileExcel, 
  faShareNodes, faThList, faTimes, faExclamationTriangle, faQuestionCircle, faCheck 
} from '@fortawesome/free-solid-svg-icons';
import api from '../services/api';
import './AdminDashboard.css';
import './AdminAllProjects.css';

// Add icons to library
library.add(
  faEye, faEdit, faTrash, faArrowRight, faSearch,
  faFilter, faSort, faEllipsisV, faFileExcel,
  faShareNodes, faThList, faTimes, faExclamationTriangle,
  faQuestionCircle, faCheck
);

const AdminAllProjects = () => {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Filter/search/sort/pagination states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [showUpdateConfirmModal, setShowUpdateConfirmModal] = useState(false);
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
    
    const handleProjectCreated = () => fetchProjects();
    const handleStorageChange = (event) => event.key === 'lastProjectCreated' && fetchProjects();
    
    window.addEventListener('projectCreated', handleProjectCreated);
    window.addEventListener('storage', handleStorageChange);

    const intervalId = setInterval(() => fetchProjects(), 30000);
    return () => {
      window.removeEventListener('projectCreated', handleProjectCreated);
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(intervalId);
    };
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true); setError('');
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Request timeout')), 5000));
      const projectsPromise = api.getAllProjects();
      const response = await Promise.race([projectsPromise, timeoutPromise]);
      const projectsData = response.projects || response || [];
      setProjects(projectsData); setFilteredProjects(projectsData);
    } catch (error) {
      console.error('Error fetching projects:', error);
      if (error.message.includes('timeout')) setError('Failed to load projects. Backend server may not be running.');
      else if (error.message.includes('403') || error.message.includes('Forbidden')) setError('Access denied. Please ensure you are logged in as an admin.');
      else setError('Failed to load projects. Please try again.');
      setProjects([]); setFilteredProjects([]);
    } finally { setLoading(false); }
  };

  const fetchManagers = async () => {
    try { const data = await api.listUsers(); setManagers(data.filter(u => u.role === 'manager')); }
    catch (error) { console.error('Error fetching managers:', error); setManagers([]); }
  };

  useEffect(() => {
    let filtered = [...projects];
    if (searchTerm) filtered = filtered.filter(p => (p.title || '').toLowerCase().includes(searchTerm.toLowerCase()) || (p.description || '').toLowerCase().includes(searchTerm.toLowerCase()) || (p.skills_required || '').toLowerCase().includes(searchTerm.toLowerCase()));
    if (statusFilter !== 'all') filtered = filtered.filter(p => (p.status || '').toLowerCase() === statusFilter.toLowerCase());
    if (typeFilter !== 'all') filtered = filtered.filter(p => (p.project_type || '').toLowerCase() === typeFilter.toLowerCase());
    filtered.sort((a,b) => {
      let aValue = sortBy === 'created_at' ? new Date(a[sortBy]) : (a[sortBy] || '');
      let bValue = sortBy === 'created_at' ? new Date(b[sortBy]) : (b[sortBy] || '');
      return sortOrder === 'asc' ? (aValue > bValue ? 1 : -1) : (aValue < bValue ? 1 : -1);
    });
    setFilteredProjects(filtered); setCurrentPage(1);
  }, [projects, searchTerm, statusFilter, typeFilter, sortBy, sortOrder]);

  const handleAssignManager = async (projectId, managerId) => {
    if (!managerId) return;
    try {
      const selectedManager = managers.find(m => m.id == managerId);
      if (!selectedManager) return;
      const payload = { manager_username: selectedManager.username, job_ids: [parseInt(projectId)] };
      await api.assignManager(payload.manager_username, payload.job_ids);
      setSuccess('Manager assigned successfully!'); fetchProjects();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) { console.error('Error assigning manager:', error); setError('Failed to assign manager. Please try again.'); setTimeout(() => setError(''), 3000); }
  };

  const handleViewProject = (project) => { setSelectedProject(project); setShowViewModal(true); };
  const handleEditProject = (project) => { setEditingProject({...project}); setShowEditModal(true); };
  const handleUpdateClick = () => editingProject && setShowUpdateConfirmModal(true);

  const handleUpdateProject = async () => {
    if (!editingProject) return;
    setShowUpdateConfirmModal(false);
    try {
      await api.updateProject(editingProject.id, editingProject);
      setSuccess('Project updated successfully!');
      setProjects(prev => prev.map(p => p.id === editingProject.id ? editingProject : p));
      setShowEditModal(false); setEditingProject(null);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) { console.error(err); setError('Failed to update project'); setTimeout(() => setError(''), 3000); }
  };

  const handleDeleteProject = async () => {
    if (!projectToDelete) return;
    try { await api.deleteProject(projectToDelete.id); setSuccess('Project deleted successfully!'); setProjects(prev => prev.filter(p => p.id !== projectToDelete.id)); setShowDeleteModal(false); setProjectToDelete(null); setTimeout(() => setSuccess(''), 3000); }
    catch (err) { console.error(err); setError('Failed to delete project'); setTimeout(() => setError(''), 3000); }
  };

  const confirmDelete = (project) => { setProjectToDelete(project); setShowDeleteModal(true); };

  const truncateText = (text, maxLength = 100) => (!text ? '' : text.length > maxLength ? text.substring(0, maxLength) + '...' : text);
  const getTypeIcon = (type) => projectTypes.find(t => t.value === type?.toLowerCase())?.icon || '📄';
  const getStatusColor = (status) => statusOptions.find(s => s.value === status?.toLowerCase())?.color || '#95a5a6';

  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProjects = filteredProjects.slice(startIndex, endIndex);
  const goToPage = (pageNumber) => setCurrentPage(Math.max(1, Math.min(pageNumber, totalPages)));

  return (
    <div className="main-content">
      {/* Alerts */}
      {error && <div className="alert alert-error"><FontAwesomeIcon icon="exclamation-triangle" /> {error}</div>}
      {success && <div className="alert alert-success"><FontAwesomeIcon icon="check" /> {success}</div>}

      {/* Table */}
      <div className="table-wrapper">
        <div className="table-header-actions">
          <h1 className="page-title">All Projects</h1>
          <div className="search-actions-right">
            <input type="text" placeholder="Search" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="search-input-compact"/>
            <button className="search-icon-btn"><FontAwesomeIcon icon="search" /></button>
            <button className="action-icon-btn"><FontAwesomeIcon icon="file-excel" /></button>
            <button className="action-icon-btn"><FontAwesomeIcon icon="share-nodes" /></button>
            <button className="action-icon-btn"><FontAwesomeIcon icon="th-list" /></button>
          </div>
        </div>

        <div className="table-container">
          <table className="projects-table">
            <thead>
              <tr>
                <th>ID</th><th>Title</th><th>Type</th><th>Status</th><th>Manager</th><th>Created By</th>
                <th>View</th><th>Edit</th><th>Select Manager</th><th>Delete</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="10" className="loading-cell">Loading projects...</td></tr>
              ) : currentProjects.length ? (
                currentProjects.map(p => (
                  <tr key={p.id}>
                    <td>{p.id}</td>
                    <td>{p.title || 'Untitled Project'}</td>
                    <td>{p.project_type || 'N/A'}</td>
                    <td><span className={`status-badge-table ${p.status?.toLowerCase() || 'open'}`}>{p.status || 'Open'}</span></td>
                    <td>{p.manager_username || 'Unassigned'}</td>
                    <td>{p.created_by || 'N/A'}</td>
                    <td><button className="table-action-btn" onClick={() => handleViewProject(p)}><FontAwesomeIcon icon="eye"/></button></td>
                    <td><button className="table-action-btn" onClick={() => handleEditProject(p)}><FontAwesomeIcon icon="edit"/></button></td>
                    <td>
                      <select value={p.manager_id || ''} onChange={(e) => handleAssignManager(p.id, e.target.value)}>
                        <option value="">Select Manager</option>
                        {managers.map(m => <option key={m.id} value={m.id}>{m.username}</option>)}
                      </select>
                    </td>
                    <td><button className="table-action-btn" onClick={() => confirmDelete(p)}><FontAwesomeIcon icon="trash"/></button></td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="10">No projects found</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredProjects.length > 0 && (
          <div className="pagination">
            <span>Showing {startIndex+1} to {Math.min(endIndex, filteredProjects.length)} of {filteredProjects.length}</span>
            <button onClick={() => goToPage(currentPage-1)} disabled={currentPage===1}>Previous</button>
            <span>{currentPage} of {totalPages}</span>
            <button onClick={() => goToPage(currentPage+1)} disabled={currentPage===totalPages}>Next</button>
          </div>
        )}
      </div>

      {/* Modals */}
      {/* 1. View Project Modal */}
      {showViewModal && selectedProject && (
        <div className="modal-overlay" onClick={() => setShowViewModal(false)}>
          <div className="modal-content" onClick={(e)=>e.stopPropagation()}>
            <div className="modal-header">
              <h3>{selectedProject.title}</h3>
              <button className="modal-close" onClick={() => setShowViewModal(false)}><FontAwesomeIcon icon="times"/></button>
            </div>
            <div className="modal-body">
              <div><strong>ID:</strong> {selectedProject.id}</div>
              <div><strong>Type:</strong> {getTypeIcon(selectedProject.project_type)} {selectedProject.project_type}</div>
              <div><strong>Status:</strong> <span style={{backgroundColor:getStatusColor(selectedProject.status), padding:'2px 6px', borderRadius:'4px', color:'#fff'}}>{selectedProject.status}</span></div>
              <div><strong>Created By:</strong> {selectedProject.created_by}</div>
              <div><strong>Description:</strong> {selectedProject.description}</div>
              <div><strong>Skills Required:</strong> {selectedProject.skills_required}</div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Edit Project Modal */}
      {showEditModal && editingProject && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e)=>e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Project</h3>
              <button className="modal-close" onClick={() => setShowEditModal(false)}><FontAwesomeIcon icon="times"/></button>
            </div>
            <div className="modal-body">
              <div>
                <label>Title:</label>
                <input type="text" value={editingProject.title} onChange={(e)=>setEditingProject({...editingProject, title:e.target.value})}/>
              </div>
              <div>
                <label>Description:</label>
                <textarea value={editingProject.description} onChange={(e)=>setEditingProject({...editingProject, description:e.target.value})}></textarea>
              </div>
              <div>
                <label>Skills Required:</label>
                <input type="text" value={editingProject.skills_required} onChange={(e)=>setEditingProject({...editingProject, skills_required:e.target.value})}/>
              </div>
              <div>
                <label>Status:</label>
                <select value={editingProject.status} onChange={(e)=>setEditingProject({...editingProject, status:e.target.value})}>
                  {statusOptions.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
              <button className="btn-primary" onClick={handleUpdateClick}>Update</button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Update Confirm Modal */}
      {showUpdateConfirmModal && (
        <div className="modal-overlay" onClick={()=>setShowUpdateConfirmModal(false)}>
          <div className="modal-content" onClick={(e)=>e.stopPropagation()}>
            <div className="modal-header">
              <h3>Confirm Update</h3>
              <button className="modal-close" onClick={()=>setShowUpdateConfirmModal(false)}><FontAwesomeIcon icon="times"/></button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to update this project?</p>
              <button className="btn-primary" onClick={handleUpdateProject}>Yes</button>
              <button className="btn-secondary" onClick={()=>setShowUpdateConfirmModal(false)}>No</button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Delete Confirm Modal */}
      {showDeleteModal && projectToDelete && (
        <div className="modal-overlay" onClick={()=>setShowDeleteModal(false)}>
          <div className="modal-content" onClick={(e)=>e.stopPropagation()}>
            <div className="modal-header">
              <h3>Confirm Delete</h3>
              <button className="modal-close" onClick={()=>setShowDeleteModal(false)}><FontAwesomeIcon icon="times"/></button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete the project: <strong>{projectToDelete.title}</strong>?</p>
              <button className="btn-danger" onClick={handleDeleteProject}>Delete</button>
              <button className="btn-secondary" onClick={()=>setShowDeleteModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAllProjects;
