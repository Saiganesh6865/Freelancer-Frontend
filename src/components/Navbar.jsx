import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

import Logo from './Logo';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogoutClick = () => {
    logout();
    navigate('/login');
  };

  // Fetch all admin projects (with session check)
  const handleAllProjectsClick = async (e) => {
    e.preventDefault();

    try {
      // ✅ First check session
      const session = await api.getSession();
      if (!session?.user) {
        alert('Session inactive. Please log in again.');
        navigate('/login');
        return;
      }

      // ✅ Only call API if session is valid
      if (!api.getAllProjects) {
        console.error('❌ api.getAllProjects is not defined');
        alert('API not available');
        return;
      }

      const projects = await api.getAllProjects();
      console.log('✅ Admin projects fetched:', projects);
      navigate('/admin/all-projects', { state: { projects } });
    } catch (err) {
      console.error('Failed to fetch projects:', err);
      alert(err.message || 'Failed to fetch projects');
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <div className="navbar-brand">
          <Link to="/">
            <Logo size="large" width={140} height={45} className="white" />
          </Link>
        </div>


        <div className="nav-left">
          {user && user.role === 'admin' && (
            <>
              <Link to="/admin" className="nav-link">Admin Dashboard</Link>
              <Link to="/admin/add-member" className="nav-link">Add New Member</Link>
              <Link to="/admin/create-project" className="nav-link">Create Project</Link>
              <a href="/admin/all-projects" onClick={handleAllProjectsClick} className="nav-link">
                All Projects
              </a>
              <Link to="/help" className="nav-link">Help</Link>
              <Link to="/settings" className="nav-link">Settings</Link>
            </>
          )}
          {user && user.role === 'freelancer' && (
            <>
              <Link to="/dashboard" className="nav-link">Overview</Link>
              <Link to="/projects" className="nav-link">Projects</Link>        {/* Applications */}
              <Link to="/my-batches" className="nav-link">My Batches</Link>
              <Link to="/requests" className="nav-link">Requests</Link>
              <Link to="/tasks" className="nav-link">Tasks</Link>             {/* Tasks */}
              <Link to="/profile" className="nav-link">Profile</Link>
            </>
          )}

          {user && user.role === 'manager' && (
            <>
              <Link to="/manager" className="nav-link">Overview</Link>
              <Link to="/manager/projects" className="nav-link">Projects</Link>
              <Link to="/manager/batches" className="nav-link">Batches</Link>
              <Link to="/manager/team" className="nav-link">Tasks</Link>
              <Link to="/manager/requests" className="nav-link">Requests</Link>
              {/* <Link to="/manager/organization" className="nav-link">Organization</Link> */}
              <Link to="/manager/profile" className="nav-link">Profile</Link>
            </>
          )}
        </div>

        <div className="navbar-user">
          {user ? (
            <div className="user-info">
              <span className="welcome-text">Welcome, {user.username}</span>
              <button onClick={handleLogoutClick} className="logout-btn">Logout</button>
            </div>
          ) : (
            <div className="auth-links">
              <Link to="/login" className="nav-link">Login</Link>
              {/* <Link to="/signup" className="nav-link">Signup</Link> */}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
