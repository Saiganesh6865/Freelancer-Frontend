import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../components/Logo';
import { useAuth } from '../context/AuthContext';
import './Home.css';

const Home = () => {
  const { isAdminCreated, setIsAdminCreated } = useAuth();

  // Check from backend if admin exists
  useEffect(() => {
    const fetchAdminStatus = async () => {
      try {
        const res = await fetch('http://127.0.0.1:5000/user/admin-exists');
        const data = await res.json();
        setIsAdminCreated(data.adminExists);
      } catch (err) {
        console.error('Failed to fetch admin status', err);
      }
    };

    fetchAdminStatus();
  }, [setIsAdminCreated]);

  return (
    <div className="home-container">
      {/* Background with animated elements */}
      <div className="home-background">
        <div className="floating-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
          <div className="shape shape-4"></div>
        </div>
        <div className="gradient-overlay"></div>
      </div>

      {/* Navigation */}
      <nav className="home-nav">
        <div className="nav-content">
          <Logo size="large" variant="white" />
          <div className="nav-buttons">
            <Link to="/login" className="nav-button login-btn">
              Login
            </Link>
            {/* {!isAdminCreated && (
              <Link to="/signup" className="nav-button signup-btn">
                Create Admin Account
              </Link>
            )} */}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            Welcome to <span className="highlight">FreelanceHub</span>
          </h1>
          <p className="hero-subtitle">
            The ultimate platform for connecting talented freelancers with amazing projects.
          </p>

          <div className="hero-buttons">
            {!isAdminCreated && (
              <Link to="/signup" className="cta-button primary">
                Create Admin Account
              </Link>
            )}
            <Link to="/login" className="cta-button secondary">
              Sign In
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div className="features-section">
          <h2 className="features-title">Why Choose FreelanceHub?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🚀</div>
              <h3>For Freelancers</h3>
              <p>Find exciting projects, manage your tasks, and grow your career.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">👥</div>
              <h3>For Managers</h3>
              <p>Efficiently manage projects, assign tasks, and track progress.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⚙️</div>
              <h3>For Admins</h3>
              <p>Create projects, manage resources, and oversee the platform.</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="home-footer">
        <div className="footer-content">
          <p>&copy; 2024 FreelanceHub. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
