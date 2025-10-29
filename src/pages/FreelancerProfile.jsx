import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { message, Spin, Input, Button } from 'antd';
import './FreelancerDashboard.css';

const { TextArea } = Input;

const FreelancerProfile = () => {
  const { user } = useAuth();
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profile, setProfile] = useState({
    full_name: '',
    bio: '',
    skills: [],
    experience_years: 0,
    portfolio_links: '',
    contact: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Fetch profile
  const fetchProfile = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getFreelancerProfile();
      if (res?.data) {
        setProfile({
          ...res.data,
          // Convert skills array to comma-separated string for the form
          skills: Array.isArray(res.data.skills) ? res.data.skills.join(', ') : res.data.skills || ''
        });
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      message.error('Failed to load profile.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Close modal on ESC key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') setShowProfileModal(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();

    // Validation
    if (!profile.full_name.trim()) {
      message.warning('Full name is required.');
      return;
    }
    if (profile.experience_years < 0) {
      message.warning('Experience years must be 0 or greater.');
      return;
    }

    const payload = {
      ...profile,
      // Convert skills string back to array for backend
      skills: profile.skills.split(',').map(s => s.trim()).filter(Boolean)
    };

    setSaving(true);
    try {
      await api.updateFreelancerProfile(payload);
      message.success('Profile updated successfully!');
      setShowProfileModal(false);
      fetchProfile(); // Refresh profile
    } catch (err) {
      console.error('Error updating profile:', err);
      message.error('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="main-content">
        <Spin tip="Loading profile..." size="large" />
      </div>
    );
  }

  return (
    <div className="main-content">
      <div className="profile-section">
        <h3>Freelancer Profile</h3>
        <div className="profile-card">
          <div className="profile-header">
            <div className="profile-avatar">
              {user?.username?.charAt(0).toUpperCase() || 'F'}
            </div>
            <div className="profile-info">
              <h2>{profile.full_name || user?.username || 'Freelancer'}</h2>
              <p className="profile-role">
                Freelancer - {profile.experience_years || 0} years experience
              </p>
              <p className="profile-email">{user?.email || 'No email provided'}</p>
            </div>
            <div className="profile-actions">
              <Button type="primary" onClick={() => setShowProfileModal(true)}>
                Edit Profile
              </Button>
            </div>
          </div>

          <div className="profile-details">
            <div className="detail-section">
              <h4>Personal Information</h4>
              <div className="detail-grid">
                <div className="detail-item">
                  <label>Full Name:</label>
                  <span>{profile.full_name || 'Not provided'}</span>
                </div>
                <div className="detail-item">
                  <label>Experience:</label>
                  <span>{profile.experience_years || 0} years</span>
                </div>
                <div className="detail-item">
                  <label>User ID:</label>
                  <span>FL-{user?.id || '000'}</span>
                </div>
                <div className="detail-item">
                  <label>Member Since:</label>
                  {/* <span>LanceLink Platform</span> */}
                  <span>Han Digital Platform</span>

                </div>
              </div>
            </div>

            <div className="detail-section">
              <h4>Professional Details</h4>
              <div className="bio-section">
                <label>Bio:</label>
                <p className="bio-text">
                  {profile.bio ||
                    'No bio provided yet. Add your professional background and expertise.'}
                </p>
              </div>
              <div className="skills-section">
                <label>Skills:</label>
                <div className="skills-display">
                  {profile.skills
                    ? profile.skills.split(',').map((skill, index) => (
                        <span key={index} className="skill-tag">
                          {skill.trim()}
                        </span>
                      ))
                    : <span className="no-data">No skills listed</span>}
                </div>
              </div>
            </div>

            <div className="detail-section">
              <h4>Portfolio & Contact</h4>
              <div className="portfolio-section">
                <label>Portfolio Links:</label>
                <div className="portfolio-links">
                  {profile.portfolio_links ? (
                    profile.portfolio_links.split('\n').map((link, index) => (
                      <div key={index} className="portfolio-link">
                        <span className="link-icon">🔗</span>
                        <span>{link.trim()}</span>
                      </div>
                    ))
                  ) : (
                    <span className="no-data">No portfolio links added</span>
                  )}
                </div>
              </div>
              <div className="contact-section">
                <label>Contact Information:</label>
                <div className="contact-info">
                  <div className="contact-item">
                    <span className="contact-icon">📧</span>
                    <span>{user?.email || 'No email provided'}</span>
                  </div>
                  {profile.contact && (
                    <div className="contact-item">
                      <span className="contact-icon">📞</span>
                      <span>{profile.contact}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Edit Modal */}
        {showProfileModal && (
          <div
            className="modal-overlay"
            onClick={() => !saving && setShowProfileModal(false)}
          >
            <div
              className="modal-content"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h3>Edit Profile</h3>
                <button
                  className="close-btn"
                  onClick={() => !saving && setShowProfileModal(false)}
                >
                  ×
                </button>
              </div>
              <div className="profile-form">
                <form onSubmit={handleProfileUpdate}>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Full Name:</label>
                      <Input
                        value={profile.full_name}
                        onChange={(e) =>
                          setProfile({ ...profile, full_name: e.target.value })
                        }
                        placeholder="Enter your full name"
                        disabled={saving}
                      />
                    </div>
                    <div className="form-group">
                      <label>Experience (Years):</label>
                      <Input
                        type="number"
                        min={0}
                        value={profile.experience_years}
                        onChange={(e) =>
                          setProfile({
                            ...profile,
                            experience_years: parseInt(e.target.value) || 0
                          })
                        }
                        disabled={saving}
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Bio:</label>
                    <TextArea
                      value={profile.bio}
                      onChange={(e) =>
                        setProfile({ ...profile, bio: e.target.value })
                      }
                      rows={4}
                      placeholder="Tell us about yourself and your expertise"
                      disabled={saving}
                    />
                  </div>
                  <div className="form-group">
                    <label>Skills:</label>
                    <Input
                      value={profile.skills}
                      onChange={(e) =>
                        setProfile({ ...profile, skills: e.target.value })
                      }
                      placeholder="Python, React, Node.js, etc."
                      disabled={saving}
                    />
                  </div>
                  <div className="form-group">
                    <label>Portfolio Links:</label>
                    <TextArea
                      value={profile.portfolio_links}
                      onChange={(e) =>
                        setProfile({ ...profile, portfolio_links: e.target.value })
                      }
                      rows={3}
                      placeholder="GitHub, LinkedIn, Personal website links"
                      disabled={saving}
                    />
                  </div>
                  <div className="form-group">
                    <label>Contact Information:</label>
                    <Input
                      value={profile.contact}
                      onChange={(e) =>
                        setProfile({ ...profile, contact: e.target.value })
                      }
                      placeholder="Phone, email, or other contact details"
                      disabled={saving}
                    />
                  </div>
                  <div className="form-actions">
                    <Button type="primary" htmlType="submit" loading={saving}>
                      Save Changes
                    </Button>
                    <Button
                      type="default"
                      onClick={() => setShowProfileModal(false)}
                      disabled={saving}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FreelancerProfile;
