import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

import './FreelancerDashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalProjects: 0,
    totalRequests: 0,
    pendingRequests: 0,
    completedProjects: 0,
    assignedProjects: 0,
  });
  const [recentProjects, setRecentProjects] = useState([]);
  const [assignedProjects, setAssignedProjects] = useState([]);
  const [myBatches, setMyBatches] = useState([]);
  const [profile, setProfile] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'manager') navigate('/manager');
    }
  }, [user, navigate]);

  // useEffect(() => {
  //   const fetchDashboardData = async () => {
  //     try {
  //       const [
  //         suggestedBatches,
  //         applications,
  //         freelancerProfile,
  //         assignedProjectsData,
  //         assignedBatchesData
  //       ] = await Promise.all([
  //         api.getSuggestedBatches().catch(() => []),
  //         api.getMyApplications().catch(() => []),
  //         api.getFreelancerProfile().catch(() => null),
  //         api.getFreelancerAssignedProjects().catch(() => []),
  //         api.getFreelancerAssignedBatches().catch(() => [])
  //       ]);

  //       const mappedSuggested = (suggestedBatches || []).map(p => ({
  //         id: p.id,
  //         title: p.project_name || 'Untitled Project',
  //         description: p.project_type || 'No description',
  //         status: p.status || 'open',
  //         skills_required: p.skills_required || '',
  //         created_at: p.created_at
  //       }));

  //       const mappedAssigned = (assignedProjectsData || []).map(p => ({
  //         id: p.id,
  //         title: p.project_name || 'Untitled Project',
  //         description: p.project_type || '',
  //         status: 'assigned',
  //         skills_required: p.skills_required || '',
  //         deadline: p.deadline || null
  //       }));

  //       setRecentProjects(mappedSuggested.slice(0, 3));
  //       setAssignedProjects(mappedAssigned);
  //       setMyBatches(assignedBatchesData || []);

  //       setStats({
  //         totalProjects: mappedSuggested.length,
  //         totalRequests: applications.length,
  //         pendingRequests: applications.filter(a => a.status === 'pending').length,
  //         completedProjects: mappedSuggested.filter(p => p.status === 'completed').length,
  //         assignedProjects: mappedAssigned.length
  //       });

  //       if (freelancerProfile) setProfile(freelancerProfile);
  //     } catch (err) {
  //       console.error(err);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   if (user?.role === 'freelancer') fetchDashboardData();
  // }, [user]);

  // const handleProjectRequest = async (projectId) => {
  //   try {
  //     await api.applyToBatch(projectId);
  //     window.location.reload();
  //   } catch (err) {
  //     console.error(err);
  //   }
  // };

  // if (loading) return <div className="main-content"><div className="loading">Loading...</div></div>;
  // if (user?.role !== 'freelancer') return null;

  return (
    <div className="main-content">
      <div className="welcome-section">
        <div className="welcome-card">
          <h1>Welcome, {profile.full_name || 'Freelancer'}!</h1>
          <p>Browse available projects, manage your profile, and track your progress.</p>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="overview-section">
          <div className="stats-grid-responsive">
            <div className="stat-card wide">
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

          {assignedProjects.length > 0 && (
            <div className="assigned-projects-section">
              <h3>🎯 My Assigned Projects</h3>
              <div className="project-list">
                {assignedProjects.map(p => (
                  <div key={p.id} className="project-item assigned">
                    <h4>{p.title}</h4>
                    <p>{p.description}</p>
                    <div className="project-meta">
                      <span className="status assigned">Assigned</span>
                      {p.skills_required && <span className="skills">Skills: {p.skills_required}</span>}
                      {p.deadline && <span className="deadline">Due: {p.deadline}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="recent-activity">
            <h3>Recent Available Projects</h3>
            <div className="project-list">
              {recentProjects.length > 0 ? recentProjects.map(p => (
                <div key={p.id} className="project-item">
                  <h4>{p.title}</h4>
                  <p>{p.description?.substring(0, 100)}...</p>
                  <div className="project-meta">
                    <span className={`status ${p.status}`}>{p.status}</span>
                    {p.skills_required && <span className="skills">Skills: {p.skills_required}</span>}
                  </div>
                  <button className="btn btn-primary" onClick={() => handleProjectRequest(p.id)}>Apply</button>
                </div>
              )) : <p>No projects available at the moment.</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
