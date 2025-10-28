import React, { useState, useEffect } from "react";
import { useAuth } from '../context/AuthContext';
import './Help.css';
import './EditProfileModal.css';

const Settings = () => {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState('profile');
  const [showEditModal, setShowEditModal] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    full_name: "",
    phone: "",
    department: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        username: user.username || '',
        email: user.email || '',
        full_name: user.full_name || '',
        phone: user.phone || '',
        department: user.department || ''
      }));
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (error) setError('');
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const updateData = {
        username: formData.username,
        email: formData.email,
        full_name: formData.full_name,
        phone: formData.phone,
        department: formData.department
      };

      // For demo purposes, simulate successful update
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess("Profile updated successfully!");
      setShowEditModal(false);
      document.body.style.overflow = 'auto';
      setTimeout(() => setSuccess(''), 3000);
      
      // Uncomment below for actual API call
      /*
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(updateData),
      });

      if (res.ok) {
        setSuccess("Profile updated successfully!");
        setShowEditModal(false);
        document.body.style.overflow = 'auto';
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const data = await res.json();
        setError(data.error || "Profile update failed");
      }
      */
    } catch (err) {
      setError("Something went wrong. Try again.");
      console.error("Profile update error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (formData.newPassword !== formData.confirmPassword) {
      setError("New passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/user/change-password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        }),
      });

      if (res.ok) {
        setSuccess("Password changed successfully!");
        setFormData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }));
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const data = await res.json();
        setError(data.error || "Password change failed");
      }
    } catch (err) {
      setError("Something went wrong. Try again.");
      console.error("Password change error:", err);
    } finally {
      setLoading(false);
    }
  };

  const settingsData = [
    {
      id: 'profile',
      title: 'Edit Profile',
      icon: '👤'
    },
    {
      id: 'password',
      title: 'Change Password',
      icon: '🔒'
    },
    {
      id: 'account',
      title: 'Account Info',
      icon: 'ℹ️'
    }
  ];

  return (
    <div className="main-content">
      <div className="card">
        <div className="card-header">
          <h1 className="card-title">Account Settings</h1>
          <p>Manage your profile and account preferences</p>
        </div>

        <div className="help-container">
          <div className="help-sidebar">
            {settingsData.map((section) => (
              <button
                key={section.id}
                className={`help-nav-item ${activeSection === section.id ? 'active' : ''}`}
                onClick={() => setActiveSection(section.id)}
              >
                <span style={{ marginRight: '8px' }}>{section.icon}</span>
                {section.title}
              </button>
            ))}
          </div>

          <div className="help-content">
            {error && (
              <div className="alert alert-error">
                {error}
              </div>
            )}

            {success && (
              <div className="alert alert-success">
                {success}
              </div>
            )}

            {/* Profile Information Section */}
            <div className={`help-section ${activeSection === 'profile' ? 'active' : ''}`}>
              <h2 className="help-section-title">Profile Information</h2>
              
              <div className="faq-item">
                <form onSubmit={handleProfileUpdate} className="settings-form">
                  <div className="form-group">
                    <label className="form-label">Username</label>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      className="form-input"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="your.email@example.com"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Role</label>
                    <input
                      type="text"
                      value={user?.role || 'N/A'}
                      className="form-input"
                      disabled
                      style={{ backgroundColor: '#f8f9fa', color: '#6c757d' }}
                    />
                    <small className="form-text">Role cannot be changed</small>
                  </div>

                  <div className="form-actions">
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={loading}
                    >
                      {loading ? 'Updating...' : 'Update Profile'}
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => {
                        setShowEditModal(true);
                        document.body.style.overflow = 'hidden';
                      }}
                    >
                      ✏️ Edit in Modal
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Password Change Section */}
            <div className={`help-section ${activeSection === 'password' ? 'active' : ''}`}>
              <h2 className="help-section-title">Change Password</h2>
              
              <div className="faq-item">
                <form onSubmit={handlePasswordChange} className="settings-form">
                  <div className="form-group">
                    <label className="form-label">Current Password</label>
                    <input
                      type="password"
                      name="currentPassword"
                      value={formData.currentPassword}
                      onChange={handleChange}
                      className="form-input"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">New Password</label>
                    <input
                      type="password"
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleChange}
                      className="form-input"
                      required
                      minLength="6"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Confirm New Password</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="form-input"
                      required
                      minLength="6"
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? 'Changing...' : 'Change Password'}
                  </button>
                </form>
              </div>
            </div>

            {/* Account Information Section */}
            <div className={`help-section ${activeSection === 'account' ? 'active' : ''}`}>
              <h2 className="help-section-title">Account Information</h2>
              
              <div className="faq-item">
                <div className="account-info">
                  <div className="info-item">
                    <span className="info-label">Account ID:</span>
                    <span className="info-value">{user?.id || 'N/A'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Member Since:</span>
                    <span className="info-value">{user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Account Type:</span>
                    <span className="info-value">{user?.role || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="edit-profile-modal">
            <div className="modal-header">
              <div className="modal-title-section">
                <h2 className="modal-title">✏️ Edit Profile</h2>
                <p className="modal-subtitle">Update your account information</p>
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
              {error && (
                <div className="alert alert-error">
                  {error}
                </div>
              )}

              {success && (
                <div className="alert alert-success">
                  {success}
                </div>
              )}

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
                      name="full_name"
                      value={formData.full_name || ''}
                      onChange={handleChange}
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
                      name="phone"
                      value={formData.phone || ''}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="Enter your phone number"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      <span className="label-icon">🏢</span>
                      Department
                    </label>
                    <select
                      name="department"
                      value={formData.department || ''}
                      onChange={handleChange}
                      className="form-input"
                    >
                      <option value="">Select Type</option>
                      <option value="IT">IT</option>
                      <option value="HR">HR</option>
                      <option value="Finance">Finance</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Operations">Operations</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      <span className="label-icon">👤</span>
                      Username
                    </label>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
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
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="form-input"
                      required
                      placeholder="your.email@example.com"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      <span className="label-icon">🏷️</span>
                      Role
                    </label>
                    <input
                      type="text"
                      value={user?.role || 'N/A'}
                      className="form-input disabled-input"
                      disabled
                    />
                    <small className="form-hint">Role cannot be changed</small>
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
                    disabled={loading}
                  >
                    <span className="btn-icon">💾</span>
                    {loading ? 'Saving...' : 'Save Changes'}
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

export default Settings;
