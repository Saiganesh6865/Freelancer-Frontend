import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';

import './FreelancerDashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [stats, setStats] = useState({
    totalProjects: 0,
    totalRequests: 0,
    pendingRequests: 0,
    completedProjects: 0,
    assignedProjects: 0,
  });
  const [recentProjects, setRecentProjects] = useState([]);
  const [allProjects, setAllProjects] = useState([]);
  const [myBatches, setMyBatches] = useState([]);
  const [assignedProjects, setAssignedProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profile, setProfile] = useState({
    full_name: '',
    bio: '',
    skills: '',
    experience_years: 0,
    portfolio_links: '',
    contact: ''
  });
  const [notifications, setNotifications] = useState([]);

  // Redirect non-freelancer roles
  useEffect(() => {
    if (user) {
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'manager') navigate('/manager');
    }
  }, [user, navigate]);

  useEffect(() => {
  const fetchDashboardData = async () => {
    try {
      // Fetch only needed APIs
      const [suggestedBatches, applications, freelancerProfile, assignedProjectsData, assignedBatchesData] = await Promise.all([
        api.getSuggestedBatches().catch(() => []),            // Suggested projects
        api.getMyApplications().catch(() => []),              // My applications
        api.getFreelancerProfile().catch(() => null),         // Freelancer profile
        api.getFreelancerAssignedProjects().catch(() => []),  // Assigned projects
        api.getFreelancerAssignedBatches().catch(() => [])    // Assigned batches
      ]);

      // 🔹 Normalize suggested projects
      const mappedSuggested = (suggestedBatches || []).map(p => ({
        id: p.id,
        title: p.project_name || "Untitled Project",
        description: p.project_type || "No description available",
        status: p.status || "open",
        skills_required: p.skills_required || "",
        created_at: p.created_at,
        job_id: p.job_id
      }));

      // 🔹 Normalize assigned projects
      const mappedAssigned = (assignedProjectsData || []).map(p => ({
        id: p.id,
        title: p.project_name || "Untitled Project",
        description: p.project_type || "",
        status: "assigned",
        skills_required: p.skills_required || "",
        deadline: p.deadline || null
      }));

      // Update state
      setAllProjects(mappedSuggested);
      setRecentProjects(mappedSuggested.slice(0, 3));
      setAssignedProjects(mappedAssigned);
      setMyBatches(assignedBatchesData || []);

      // Stats
      setStats({
        totalProjects: mappedSuggested.length,
        totalRequests: applications.length,
        pendingRequests: applications.filter(a => a.status === "pending").length,
        completedProjects: mappedSuggested.filter(p => p.status === "completed").length,
        assignedProjects: mappedAssigned.length
      });

      // Profile
      if (freelancerProfile) {
        setProfile({
          full_name: freelancerProfile.full_name || "",
          bio: freelancerProfile.bio || "",
          skills: freelancerProfile.skills || "",
          experience_years: freelancerProfile.experience_years || 0,
          portfolio_links: freelancerProfile.portfolio_links || "",
          contact: freelancerProfile.contact || ""
        });
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (user && user.role === "freelancer") fetchDashboardData();
}, [user]);


  const handleProjectRequest = async (projectId) => {
    try {
      await api.applyToBatch(projectId);
      window.location.reload();
    } catch (error) {
      console.error('Error sending project request:', error);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      await api.updateFreelancerProfile(profile);
      setShowProfileModal(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    }
  };

  if (loading) {
    return (
      <div className="main-content">
        <div className="loading">Loading dashboard...</div>
      </div>
    );
  }

  if (user?.role !== 'freelancer') return null;

  return (
    <div className="main-content">
      {/* Welcome Section */}
      <div className="welcome-section">
        <div className="welcome-card">
          <h1>Welcome Freelancer!</h1>
          <p>Browse available projects, manage your profile, and track your progress. Here's your workspace:</p>
          {notifications.length > 0 && (
            <div className="notifications-badge">
              🔔 {notifications.length} new notification{notifications.length > 1 ? 's' : ''}
            </div>
          )}
        </div>
      </div>

      {/* Dashboard Content - Overview Only */}
      <div className="dashboard-content">
        <div className="overview-section">
          <div className="stats-grid-responsive">
            <div className="stat-card">
              <div className="stat-icon">📊</div>
              <h3>Available Projects</h3>
              <p className="stat-number">{stats.totalProjects}</p>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📝</div>
              <h3>My Requests</h3>
              <p className="stat-number">{stats.totalRequests}</p>
            </div>
            <div className="stat-card">
              <div className="stat-icon">⏳</div>
              <h3>Pending Requests</h3>
              <p className="stat-number">{stats.pendingRequests}</p>
            </div>
            <div className="stat-card">
              <div className="stat-icon">✅</div>
              <h3>Completed Projects</h3>
              <p className="stat-number">{stats.completedProjects}</p>
            </div>
          </div>

          {/* Assigned Projects Section */}
          {assignedProjects.length > 0 && (
            <div className="assigned-projects-section">
              <h3>🎯 My Assigned Projects</h3>
              <div className="project-list">
                {assignedProjects.map(project => (
                  <div key={project.id} className="project-item assigned">
                    <div className="project-info">
                      <h4>{project.project_name || project.title}</h4>
                      <p>Type: {project.project_type}</p>
                      <div className="project-meta">
                        <span className="status assigned">Assigned</span>
                        {project.skills_required && (
                          <span className="skills">Skills: {project.skills_required}</span>
                        )}
                        {project.deadline && (
                          <span className="deadline">Due: {project.deadline}</span>
                        )}
                      </div>
                    </div>
                    <div className="project-actions">
                      <span className="assigned-badge">✅ Assigned by Manager</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="recent-activity">
            <h3>Recent Available Projects</h3>
            <div className="project-list">
              {recentProjects.length > 0 ? (
                recentProjects.map(project => (
                  <div key={project.id} className="project-item">
                    <div className="project-info">
                      <h4>{project.title}</h4>
                      <p>{project.description?.substring(0, 100)}...</p>
                      <div className="project-meta">
                        <span className={`status ${project.status || 'open'}`}>
                          {project.status || 'open'}
                        </span>
                        {project.skills_required && (
                          <span className="skills">Skills: {project.skills_required}</span>
                        )}
                      </div>
                    </div>
                    <button
                      className="btn btn-primary"
                      onClick={() => handleProjectRequest(project.id)}
                    >
                      Apply
                    </button>
                  </div>
                ))
              ) : (
                <p>No projects available at the moment.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
