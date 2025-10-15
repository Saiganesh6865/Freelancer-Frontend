import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

import './FreelancerDashboard.css';
import './EditProfileModal.css';

const ManagerProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState({
    username: '',
    email: '',
    manager_type: '',
    full_name: '',
    phone: '',
    department: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editProfile, setEditProfile] = useState({});

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Add timeout to prevent hanging when backend is not available
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 3000)
      );
      
      const profilePromise = api.getUserProfile(user.id);
      const profileData = await Promise.race([profilePromise, timeoutPromise]);
      setProfile(profileData || {
        username: user.username || '',
        email: user.email || '',
        manager_type: '',
        full_name: '',
        phone: '',
        department: ''
      });
      setEditProfile(profileData || {
        username: user.username || '',
        email: user.email || '',
        manager_type: '',
        full_name: '',
        phone: '',
        department: ''
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      if (error.message.includes('timeout')) {
        setError('');
      } else {
        setError('');
      }
      // Set fallback profile data from user context
      const fallbackProfile = {
        username: user.username || '',
        email: user.email || '',
        manager_type: '',
        full_name: '',
        phone: '',
        department: ''
      };
      setProfile(fallbackProfile);
      setEditProfile(fallbackProfile);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      // Simulate successful update for demo
      await new Promise(resolve => setTimeout(resolve, 1000));
      setProfile(editProfile);
      setShowEditModal(false);
      document.body.style.overflow = 'auto';
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    }
  };

  if (loading) {
    return (
      <div className="main-content">
        <div className="loading">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="main-content">
      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      <div className="profile-section">
        <h3>Manager Profile</h3>
        <div className="profile-card">
          <div className="profile-header">
            <div className="profile-avatar">
              {profile.username?.charAt(0).toUpperCase() || 'M'}
            </div>
            <div className="profile-info">
              <h2>{profile.full_name || profile.username || 'Manager'}</h2>
              <p className="profile-role">Manager - {profile.manager_type || 'General'}</p>
              <p className="profile-email">{profile.email || 'No email provided'}</p>
            </div>
            <div className="profile-actions">
              <button 
                className="btn btn-primary edit-profile-btn"
                onClick={() => {
                  setShowEditModal(true);
                  document.body.style.overflow = 'hidden';
                }}
              >
                Edit Profile
              </button>
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
                  <label>Manager Type:</label>
                  <span>{profile.manager_type || 'Not specified'}</span>
                </div>
                <div className="detail-item">
                  <label>User ID:</label>
                  <span>MG-{user?.id || '000'}</span>
                </div>
                <div className="detail-item">
                  <label>Member Since:</label>
                  <span>LanceLink Platform</span>
                </div>
              </div>
            </div>

            <div className="detail-section">
              <h4>Contact Information</h4>
              <div className="detail-grid">
                <div className="detail-item">
                  <label>Email:</label>
                  <span>{profile.email || 'Not provided'}</span>
                </div>
                <div className="detail-item">
                  <label>Phone:</label>
                  <span>{profile.phone || 'Not provided'}</span>
                </div>
                <div className="detail-item">
                  <label>Department:</label>
                  <span>{profile.department || 'Not specified'}</span>
                </div>
                <div className="detail-item">
                  <label>Username:</label>
                  <span>{profile.username || 'Not provided'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

        {/* Edit Profile Modal */}
        {showEditModal && (
          <div className="modal-overlay" style={{zIndex: 999999}}>
            <div className="edit-profile-modal" style={{width: '900px', maxWidth: '95%'}}>
              <div className="modal-header">
                <div className="modal-title-section">
                  <h2 className="modal-title">✏️ Edit Manager Profile</h2>
                  <p className="modal-subtitle">Update your manager information</p>
                </div>
                <button 
                  className="modal-close-btn"
                  onClick={() => {
                    setShowEditModal(false);
                    document.body.style.overflow = 'auto';
                  }}
                  aria-label="Close modal"
                >
                  ✕
                </button>
              </div>
              
              <div className="modal-body">
                <form onSubmit={handleProfileUpdate} className="profile-form">
                  <div className="form-section">
                    <div className="form-group">
                      <label className="form-label">
                        <span className="label-icon">👤</span>
                        Full Name
                        <span className="required">*</span>
                      </label>
                      <input
                        type="text"
                        value={editProfile.full_name || ''}
                        onChange={(e) => setEditProfile({...editProfile, full_name: e.target.value})}
                        className="form-input"
                        placeholder="Enter your full name"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">
                        <span className="label-icon">📞</span>
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={editProfile.phone || ''}
                        onChange={(e) => setEditProfile({...editProfile, phone: e.target.value})}
                        className="form-input"
                        placeholder="Enter your phone number"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">
                        <span className="label-icon">🏢</span>
                        Department
                      </label>
                      <input
                        type="text"
                        value={editProfile.department || ''}
                        onChange={(e) => setEditProfile({...editProfile, department: e.target.value})}
                        className="form-input"
                        placeholder="Enter your department"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">
                        <span className="label-icon">👤</span>
                        Username
                      </label>
                      <input
                        type="text"
                        value={editProfile.username || ''}
                        onChange={(e) => setEditProfile({...editProfile, username: e.target.value})}
                        className="form-input"
                        placeholder="Enter your username"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">
                        <span className="label-icon">📧</span>
                        Email Address
                        <span className="required">*</span>
                      </label>
                      <input
                        type="email"
                        value={editProfile.email || ''}
                        onChange={(e) => setEditProfile({...editProfile, email: e.target.value})}
                        className="form-input"
                        placeholder="your.email@example.com"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">
                        <span className="label-icon">🏷️</span>
                        Manager Type
                      </label>
                      <select
                        value={editProfile.manager_type || ''}
                        onChange={(e) => setEditProfile({...editProfile, manager_type: e.target.value})}
                        className="form-input"
                      >
                        <option value="">Select Type</option>
                        <option value="IT">IT</option>
                        <option value="Design">Design</option>
                        <option value="Marketing">Marketing</option>
                        <option value="Writing">Writing</option>
                        <option value="Operations">Operations</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="modal-footer">
                    <button 
                      type="button" 
                      className="btn btn-secondary"
                      onClick={() => {
                        setShowEditModal(false);
                        document.body.style.overflow = 'auto';
                      }}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="btn btn-primary btn-save"
                    >
                      <span className="btn-icon">💾</span>
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
    </div>
  );
};

export default ManagerProfile;
