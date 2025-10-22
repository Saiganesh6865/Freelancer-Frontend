import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import ChatWidget from './components/ChatWidget';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';

// Freelancer pages
import FreelancerDashboard from './pages/FreelancerDashboard';
import FreelancerProfile from './pages/FreelancerProfile';
import FreelancerBatches from './pages/FreelancerBatches';
import FreelancerRequests from './pages/FreelancerRequests';
import FreelancerTasks from './pages/FreelancerTasks';
import Projects from './pages/Projects';

// Manager pages
import ManagerDashboard from './pages/ManagerDashboard';
import ManagerProjects from './pages/ManagerProjects';
import ManagerTeam from './pages/ManagerTeam';
import ManagerBatches from './pages/ManagerBatches';
import ManagerBatchApplications from './pages/ManagerBatchApplicationsPage';
import ManagerOrganization from './pages/ManagerOrganization';
import ManagerProfile from './pages/ManagerProfile';
import ProjectDetail from './pages/ProjectDetail';
import AddMemberPage from './pages/AddMemberPage';

// Common pages
import Chat from './pages/Chat';
import Settings from './pages/Settings';
import Help from './pages/Help';

// Admin pages
import AdminDashboard from './pages/AdminDashboard';
import AdminCreateProject from './pages/AdminCreateProject';
import AdminAllProjects from './pages/AdminAllProjects';
import AdminProjectDetails from './pages/AdminProjectDetails'


import './App.css';

const PrivateRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // Redirect based on role
    if (user.role === 'admin') return <Navigate to="/admin" />;
    if (user.role === 'manager') return <Navigate to="/manager" />;
    return <Navigate to="/dashboard" />;
  }
  return children;
};

const App = () => {
  return (
    <div className="App">
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Freelancer Routes */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute allowedRoles={['freelancer']}>
              <Navbar />
              <FreelancerDashboard />
              <ChatWidget />
            </PrivateRoute>
          }
        />
        <Route
          path="/projects"
          element={
            <PrivateRoute allowedRoles={['freelancer']}>
              <Navbar />
              <Projects />
              <ChatWidget />
            </PrivateRoute>
          }
        />
        <Route
          path="/my-batches"
          element={
            <PrivateRoute allowedRoles={['freelancer']}>
              <Navbar />
              <FreelancerBatches />
              <ChatWidget />
            </PrivateRoute>
          }
        />
        <Route
          path="/requests"
          element={
            <PrivateRoute allowedRoles={['freelancer']}>
              <Navbar />
              <FreelancerRequests />
              <ChatWidget />
            </PrivateRoute>
          }
        />
        <Route
          path="/tasks"
          element={
            <PrivateRoute allowedRoles={['freelancer']}>
              <Navbar />
              <FreelancerTasks />
              <ChatWidget />
            </PrivateRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <PrivateRoute allowedRoles={['freelancer']}>
              <Navbar />
              <FreelancerProfile />
              <ChatWidget />
            </PrivateRoute>
          }
        />
        <Route
          path="/chat"
          element={
            <PrivateRoute>
              <Navbar />
              <Chat />
              <ChatWidget />
            </PrivateRoute>
          }
        />
        <Route
          path="/help"
          element={
            <PrivateRoute>
              <Navbar />
              <Help />
              <ChatWidget />
            </PrivateRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <PrivateRoute>
              <Navbar />
              <Settings />
              <ChatWidget />
            </PrivateRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <PrivateRoute allowedRoles={['admin']}>
              <Navbar />
              <AdminDashboard />
              <ChatWidget />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/create-project"
          element={
            <PrivateRoute allowedRoles={['admin']}>
              <Navbar />
              <AdminCreateProject />
              <ChatWidget />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/all-projects"
          element={
            <PrivateRoute allowedRoles={['admin']}>
              <Navbar />
              <AdminAllProjects />
              <ChatWidget />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/projects/:id"
          element={
            <PrivateRoute allowedRoles={['admin']}>
              <Navbar />
              <AdminProjectDetails />
              <ChatWidget />
            </PrivateRoute>
          }
        />
        <Route path="/admin/add-member" element={<AddMemberPage />} />


        {/* Manager Routes */}
        <Route
          path="/manager"
          element={
            <PrivateRoute allowedRoles={['manager']}>
              <Navbar />
              <ManagerDashboard />
              <ChatWidget />
            </PrivateRoute>
          }
        />
        <Route
          path="/manager/projects"
          element={
            <PrivateRoute allowedRoles={['manager']}>
              <Navbar />
              <ManagerProjects />
              <ChatWidget />
            </PrivateRoute>
          }
        />
        <Route
          path="/manager/batches"
          element={
            <PrivateRoute allowedRoles={['manager']}>
              <Navbar />
              <ManagerBatches />
              <ChatWidget />
            </PrivateRoute>
          }
        />
        <Route
          path="/manager/team"
          element={
            <PrivateRoute allowedRoles={['manager']}>
              <Navbar />
              <ManagerTeam />
              <ChatWidget />
            </PrivateRoute>
          }
        />
        <Route
          path="/manager/requests"
          element={
            <PrivateRoute allowedRoles={['manager']}>
              <Navbar />
              <ManagerBatchApplications />
              <ChatWidget />
            </PrivateRoute>
          }
        />
        <Route
          path="/manager/organization"
          element={
            <PrivateRoute allowedRoles={['manager']}>
              <Navbar />
              <ManagerOrganization />
              <ChatWidget />
            </PrivateRoute>
          }
        />
        <Route
          path="/manager/profile"
          element={
            <PrivateRoute allowedRoles={['manager']}>
              <Navbar />
              <ManagerProfile />
              <ChatWidget />
            </PrivateRoute>
          }
        />
        <Route
          path="/manager/projects/:id"
          element={
            <PrivateRoute allowedRoles={['manager']}>
              <Navbar />
              <ProjectDetail />
              <ChatWidget />
            </PrivateRoute>
          }
        />
      </Routes>
    </div>
  );
};

export default App;
