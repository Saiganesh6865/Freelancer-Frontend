// src/components/ManagerOrganization.jsx
import React from 'react';
import { useAuth } from '../context/AuthContext';
import useData from '../hooks/useData'; // Import the custom hook
import api from '../services/api';
import './Projects.css'; // Assuming common styles
import './ManagerOrganization.css'; // Specific styles

const ManagerOrganization = () => {
  const { user } = useAuth();

  // Use useData hook to fetch organization data
  const { data: org, loading, error } = useData(api.getManagerOrganization, { admins: [], managers: [], freelancers: [] });

  if (loading) {
    return <div className="loading">Loading organization chart...</div>;
  }
  if (error) {
    return <div className="error">Error: {error.message}</div>;
  }

  const getSkillsTags = (skillsString) => {
    if (!skillsString) return [];
    return skillsString.split(',').map(skill => skill.trim()).filter(skill => skill);
  };

  return (
    <div className="manager-org-container">
      <h2>Organization Chart</h2>
      <div className="org-chart">
        <div className="org-branch">
          <div className="branch-header">
            <h3>Admins ({org.admins.length})</h3>
          </div>
          <div className="member-list">
            {org.admins.length > 0 ? (
              org.admins.map(admin => (
                <div key={admin.id} className="member-card-wrapper">
                  <div className="member-card">
                    <div className="member-avatar">👑</div>
                    <div className="member-info">
                      <div className="member-name">{admin.full_name || admin.username}</div>
                      <div className="member-email">{admin.email}</div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p>No admins listed.</p>
            )}
          </div>
        </div>
        <div className="org-branch">
          <div className="branch-header">
            <h3>Managers ({org.managers.length})</h3>
          </div>
          <div className="member-list">
            {org.managers.length > 0 ? (
              org.managers.map(manager => (
                <div key={manager.id} className="member-card-wrapper">
                  <div className="member-card">
                    <div className="member-avatar">👔</div>
                    <div className="member-info">
                      <div className="member-name">{manager.full_name || manager.username}</div>
                      <div className="member-email">{manager.email}</div>
                      <div className="member-type">Type: {manager.manager_type || 'N/A'}</div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p>No managers listed.</p>
            )}
          </div>
        </div>
        <div className="org-branch">
          <div className="branch-header">
            <h3>Freelancers ({org.freelancers.length})</h3>
          </div>
          <div className="member-list">
            {org.freelancers.length > 0 ? (
              org.freelancers.map(freelancer => (
                <div key={freelancer.id} className="member-card-wrapper">
                  <div className="member-card">
                    <div className="member-avatar">👤</div>
                    <div className="member-info">
                      <div className="member-name">{freelancer.full_name || freelancer.username}</div>
                      <div className="member-email">{freelancer.email}</div>
                      {freelancer.skills && (
                        <div className="member-skills">
                          {getSkillsTags(freelancer.skills).slice(0, 3).map((skill, i) => (
                            <span key={i} className="skill-tag">{skill}</span>
                          ))}
                          {getSkillsTags(freelancer.skills).length > 3 && (
                            <span className="skill-more">+{getSkillsTags(freelancer.skills).length - 3}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-branch">
                <span className="empty-icon">📭</span>
                <p>No freelancers found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerOrganization;