import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './AddMemberPage.css';
import Logo from '../components/Logo';
import api from '../services/api';

const AddMemberPage = () => {
  const { signup, user } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: '',
    manager_type: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const managerTypes = [
    'IT',
    'Annotations',
    'HR',
    'Design',
    'Marketing',
    'Finance',
    'Operations'
  ];

  // Only admins can access
  if (!user || user.role !== 'admin') {
    return (
      <div className="add-member-access-denied">
        <h2>Access Denied</h2>
        <p>Only Admins can add new members.</p>
      </div>
    );
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.username || !formData.email || !formData.password || !formData.role) {
      setMessage('❌ Please fill all required fields.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        manager_type: formData.role === 'manager' ? formData.manager_type : undefined
      };

      const result = await api.signup(payload);

      if (result.status === 200) {
        setMessage(`✅ ${formData.role} account created successfully!`);
        setFormData({ username: '', email: '', password: '', role: '', manager_type: '' });
      } else {
        setMessage(result.error || '⚠️ Failed to create account.');
      }

    } catch (err) {
      console.error(err);
      setMessage('❌ Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="addmember-container">
      <div className="addmember-background">
        <div className="geometric-pattern">
          <div className="pattern-line line-1"></div>
          <div className="pattern-line line-2"></div>
          <div className="pattern-line line-3"></div>
        </div>
      </div>

      <div className="addmember-card">
        <div className="addmember-header">
          <Logo size="xlarge" variant="blue" />
          <h2 className="addmember-title">Add New Member</h2>
          <p className="addmember-subtitle">Create a new user account (Admin access required)</p>
        </div>

        {message && (
          <div className={`addmember-message ${message.startsWith('✅') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="addmember-form">
          <div className="form-group">
            <input
              type="text"
              name="username"
              className="form-input"
              placeholder="Enter username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <input
              type="email"
              name="email"
              className="form-input"
              placeholder="Enter email address"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <select
              name="role"
              className="form-input"
              value={formData.role}
              onChange={handleChange}
              required
            >
              <option value="" disabled>Select Role</option>
              <option value="freelancer">Freelancer</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {formData.role === 'manager' && (
            <div className="form-group">
              <select
                name="manager_type"
                className="form-input"
                value={formData.manager_type}
                onChange={handleChange}
                required
              >
                <option value="" disabled>Select Manager Type</option>
                {managerTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          )}

          <div className="form-group password-group">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              className="form-input"
              placeholder="Enter password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>

          <button
            type="submit"
            className="addmember-button"
            disabled={loading}
          >
            Create Member
          </button>

        </form>
      </div>
    </div>
  );
};

export default AddMemberPage;
