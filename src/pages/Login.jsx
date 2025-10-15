import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import ForgotPassword from "../components/ForgotPassword";
import Logo from "../components/Logo";
import "./Login.css";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const { handleLogin } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value.trim() });
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await handleLogin(formData.email, formData.password);
      if (!result.success) setError(result.error);
    } catch (err) {
      console.error("Login error:", err);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPasswordSuccess = () => {
    setError("");
    setSuccess("Password reset successfully! You can now login.");
    setTimeout(() => setSuccess(""), 5000);
  };

  return (
    <div className="login-container">
      <div className="login-background">
        <div className="geometric-pattern">
          <div className="pattern-line line-1"></div>
          <div className="pattern-line line-2"></div>
          <div className="pattern-line line-3"></div>
        </div>
      </div>

      <div className="login-card">
        <div className="login-header">
          <Logo size="xlarge" variant="blue" />
          <h2 className="login-title">Welcome Back</h2>
          <p className="login-subtitle">Sign in to your account</p>
        </div>

        {error && (
          <div className="error-message">
            <div className="error-icon"></div>
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="success-message">
            <div className="success-icon">✓</div>
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <div className="input-container">
              <div className="input-icon"></div>
              <input
                type="text"
                name="email"
                className="form-input"
                placeholder="Enter your Email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <div className="input-container">
              <div className="input-icon"></div>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                className="form-input"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <div className="forgot-password-link">
            <button
              type="button"
              className="forgot-password-btn"
              onClick={() => setShowForgotPassword(true)}
            >
              Forgot Password?
            </button>
          </div>

          <button
            type="submit"
            className={`login-button ${loading ? "loading" : ""}`}
            disabled={loading}
          >
            {loading ? (
              <div className="loading-spinner">
                <div className="spinner"></div>
                <span>Signing In...</span>
              </div>
            ) : (
              <>
                <span>Sign In</span>
                <div className="button-icon"></div>
              </>
            )}
          </button>
        </form>
      </div>

      <ForgotPassword
        isOpen={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
        onSuccess={handleForgotPasswordSuccess}
      />
    </div>
  );
};

export default Login;
