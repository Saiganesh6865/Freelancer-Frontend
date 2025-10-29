import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSearch,
  faFileExcel,
  faShareNodes,
  faThList
} from '@fortawesome/free-solid-svg-icons';
import api from '../services/api';
import './AdminDashboard.css';
import './AdminAllProjects.css';

const AdminAllProjects = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

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
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError('');
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout')), 10000)
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
      } else {
        setError('Failed to load projects. Please try again.');
      }
      setProjects([]);
      setFilteredProjects([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = [...projects];
    if (searchTerm) {
      filtered = filtered.filter(project =>
        project.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.skills_required?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (statusFilter !== 'all') {
      filtered = filtered.filter(project =>
        project.status?.toLowerCase() === statusFilter.toLowerCase()
      );
    }
    if (typeFilter !== 'all') {
      filtered = filtered.filter(project =>
        project.project_type?.toLowerCase() === typeFilter.toLowerCase()
      );
    }
    filtered.sort((a, b) => {
      let aValue = a[sortBy] || '';
      let bValue = b[sortBy] || '';
      if (sortBy === 'created_at') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }
      if (sortOrder === 'asc') return aValue > bValue ? 1 : -1;
      else return aValue < bValue ? 1 : -1;
    });
    setFilteredProjects(filtered);
    setCurrentPage(1);
  }, [projects, searchTerm, statusFilter, typeFilter, sortBy, sortOrder]);

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
      {error && (
        <div className="alert alert-error">
          <span className="alert-icon">⚠️</span>
          {error}
        </div>
      )}

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
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="loading-cell">
                    <div className="loading-spinner"></div>
                    <span>Loading projects...</span>
                  </td>
                </tr>
              ) : filteredProjects.length > 0 ? (
                currentProjects.map((project) => (
                  <tr key={project.id}>
                    <td>{project.id}</td>
                    <td>
                      <span
                        className="project-title-link"
                        onClick={() => navigate(`/admin/projects/${project.id}`)}
                        style={{
                          cursor: 'pointer',
                          color: '#4f46e5',
                          textDecoration: 'underline'
                        }}
                      >
                        {project.title || 'Untitled Project'}
                      </span>
                    </td>
                    <td>{getTypeIcon(project.project_type)} {project.project_type || 'N/A'}</td>
                    <td>
                      <span
                        className="status-badge-table"
                        style={{ backgroundColor: getStatusColor(project.status) }}
                      >
                        {project.status || 'Open'}
                      </span>
                    </td>
                    <td>{project.manager_username || 'Unassigned'}</td>
                    <td>{project.created_by_username || 'N/A'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="no-data-cell">
                    No projects found. Try adjusting your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

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
    </div>
  );
};

export default AdminAllProjects;
