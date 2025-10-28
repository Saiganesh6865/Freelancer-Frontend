import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';
import './Signup.css';

const Signup = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'admin' // default role is Admin
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
  };

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validatePassword = (password) => {
    const minLength = 6;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);

    return {
      isValid:
        password.length >= minLength &&
        hasUpperCase &&
        hasLowerCase &&
        hasNumbers,
      errors: {
        length: password.length < minLength,
        uppercase: !hasUpperCase,
        lowercase: !hasLowerCase,
        numbers: !hasNumbers
      }
    };
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');

  // Validation
  if (!formData.username || !formData.email || !formData.password) {
    setError('Please fill in all fields');
    return;
  }

  if (formData.username.length < 3) {
    setError('Username must be at least 3 characters long');
    return;
  }

  if (!validateEmail(formData.email)) {
    setError('Please enter a valid email address');
    return;
  }

  const passwordValidation = validatePassword(formData.password);
  if (!passwordValidation.isValid) {
    setError(
      'Password must be at least 6 characters with uppercase, lowercase, and numbers'
    );
    return;
  }

  setLoading(true);

  try {
    // Call one-time admin signup endpoint
    const response = await fetch('http://127.0.0.1:5000/user/create-admin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    });

    const result = await response.json();

    if (result.success) {
      navigate('/login');
    } else {
      setError(result.error || 'Registration failed. Please try again.');
    }
  } catch (err) {
    setError('Network error. Please check your connection and try again.');
  }

  setLoading(false);
};

  return (
    <div className="signup-container">
      <div className="signup-background">
        <div className="geometric-pattern">
          <div className="pattern-line line-1"></div>
          <div className="pattern-line line-2"></div>
          <div className="pattern-line line-3"></div>
        </div>
      </div>

      <div className="signup-card">
        <div className="signup-header">
          <Logo size="xlarge" variant="blue" />
          <h2 className="signup-title">Create Your Account</h2>
          <p className="signup-subtitle">
            Join our community of talented freelancers
          </p>
        </div>

        {error && (
          <div className="error-message">
            <div className="error-icon"></div>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="signup-form">
          <div className="form-group">
            <div className="input-container">
              <div className="input-icon"></div>
              <input
                type="text"
                name="username"
                className="form-input"
                placeholder="Enter your username"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <div className="input-container">
              <div className="input-icon"></div>
              <input
                type="email"
                name="email"
                className="form-input"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Show role as Admin to the user */}
          <div className="form-group">
            <div className="input-container">
              <div className="input-icon"></div>
              <input
                type="text"
                name="role"
                className="form-input"
                value="Admin"
                readOnly
              />
            </div>
          </div>

          <div className="form-group">
            <div className="input-container">
              <div className="input-icon"></div>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                className="form-input"
                placeholder="Create a password"
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
          </div>

          <button
            type="submit"
            className={`signup-button ${loading ? 'loading' : ''}`}
            disabled={loading}
          >
            {loading ? (
              <div className="loading-spinner">
                <div className="spinner"></div>
                <span>Creating Account...</span>
              </div>
            ) : (
              <>
                <span>Create Account</span>
                <div className="button-icon"></div>
              </>
            )}
          </button>
        </form>

        <div className="signup-footer">
          <p className="login-link">
            Already have an account?{' '}
            <Link to="/login" className="link-highlight">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
