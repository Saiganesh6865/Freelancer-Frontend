import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import Logo from "./Logo";
import "./Navbar.css";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogoutClick = () => {
    logout();
    navigate("/login");
  };

  const handleAllProjectsClick = async (e) => {
    e.preventDefault();
    try {
      const session = await api.getSession();
      if (!session?.user) {
        alert("Session inactive. Please log in again.");
        navigate("/login");
        return;
      }
      const projects = await api.getAllProjects();
      navigate("/admin/all-projects", { state: { projects } });
    } catch (err) {
      console.error("Failed to fetch projects:", err);
      alert(err.message || "Failed to fetch projects");
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-content">
        {/* Logo & Toggle */}
        <div className="navbar-left">
          <Link to="/" className="navbar-logo">
            <Logo size="large" width={140} height={45} className="white" />
          </Link>

          {/* Hamburger (mobile only) */}
          <button
            className={`menu-toggle ${menuOpen ? "open" : ""}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <span className="bar"></span>
            <span className="bar"></span>
            <span className="bar"></span>
          </button>
        </div>

        {/* Navigation Links */}
        <div className={`nav-links ${menuOpen ? "show" : ""}`}>
          {user && user.role === "admin" && (
            <>
              <Link to="/admin" className="nav-link">Dashboard</Link>
              <Link to="/admin/add-member" className="nav-link">Add Member</Link>
              <Link to="/admin/create-project" className="nav-link">Create Project</Link>
              <a href="/admin/all-projects" onClick={handleAllProjectsClick} className="nav-link">All Projects</a>
              <Link to="/help" className="nav-link">Help</Link>
              <Link to="/settings" className="nav-link">Settings</Link>
            </>
          )}
          {user && user.role === "freelancer" && (
            <>
              <Link to="/dashboard" className="nav-link">Overview</Link>
              <Link to="/projects" className="nav-link">Projects</Link>
              <Link to="/my-batches" className="nav-link">My Batches</Link>
              <Link to="/requests" className="nav-link">Requests</Link>
              <Link to="/tasks" className="nav-link">Tasks</Link>
              <Link to="/profile" className="nav-link">Profile</Link>
            </>
          )}
          {user && user.role === "manager" && (
            <>
              <Link to="/manager" className="nav-link">Overview</Link>
              <Link to="/manager/projects" className="nav-link">Projects</Link>
              <Link to="/manager/batches" className="nav-link">Batches</Link>
              <Link to="/manager/team" className="nav-link">Tasks</Link>
              <Link to="/manager/requests" className="nav-link">Requests</Link>
              <Link to="/manager/profile" className="nav-link">Profile</Link>
            </>
          )}

          {user ? (
            <button onClick={handleLogoutClick} className="logout-btn">Logout</button>
          ) : (
            <Link to="/login" className="nav-link">Login</Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
