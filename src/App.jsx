import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
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
import FreelancerTaskDetail from './pages/FreelancerTaskDetails';
import InvoicePage from "./pages/InvoicePage";
import FreelancerInvoicesPage from "./pages/FreelancerInvoicesPage";

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
import ManagerInvoicesPage from "./pages/ManagerInvoicesPage";
import ManagerInvoiceDetailsPage from "./pages/ManagerInvoiceDetailsPage";

// Common pages
import Settings from './pages/Settings';
import Help from './pages/Help';

// Admin pages
import AdminDashboard from './pages/AdminDashboard';
import AdminCreateProject from './pages/AdminCreateProject';
import AdminAllProjects from './pages/AdminAllProjects';
import AdminProjectDetails from './pages/AdminProjectDetails';

import './App.css';

// ---------------------- Private Route Wrapper ----------------------
const PrivateRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    if (user.role === 'admin') return <Navigate to="/admin" />;
    if (user.role === 'manager') return <Navigate to="/manager" />;
    return <Navigate to="/dashboard" />;
  }

  return children;
};

// ---------------------- App Routes ----------------------
const App = () => {
  return (
    <div className="App">
      <Routes>
        {/* ---------------- Public Routes ---------------- */}
        <Route path="/" element={<Home />} /> {/* ✅ Default home route */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* ---------------- Freelancer Routes ---------------- */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute allowedRoles={['freelancer']}>
              <Navbar />
              <FreelancerDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/projects"
          element={
            <PrivateRoute allowedRoles={['freelancer']}>
              <Navbar />
              <Projects />
            </PrivateRoute>
          }
        />
        <Route
          path="/my-batches"
          element={
            <PrivateRoute allowedRoles={['freelancer']}>
              <Navbar />
              <FreelancerBatches />
            </PrivateRoute>
          }
        />
        <Route
          path="/requests"
          element={
            <PrivateRoute allowedRoles={['freelancer']}>
              <Navbar />
              <FreelancerRequests />
            </PrivateRoute>
          }
        />
        <Route
          path="/tasks"
          element={
            <PrivateRoute allowedRoles={['freelancer']}>
              <Navbar />
              <FreelancerTasks />
            </PrivateRoute>
          }
        />
        <Route
          path="/tasks/:id"
          element={
            <PrivateRoute allowedRoles={['freelancer']}>
              <Navbar />
              <FreelancerTaskDetail />
            </PrivateRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <PrivateRoute allowedRoles={['freelancer']}>
              <Navbar />
              <FreelancerProfile />
            </PrivateRoute>
          }
        />
        <Route
          path="/freelancer/invoices/create"
          element={
            <PrivateRoute allowedRoles={['freelancer']}>
              <Navbar />
              <InvoicePage />
            </PrivateRoute>
          }
        />
        <Route
          path="/freelancer/invoices/my"
          element={
            <PrivateRoute allowedRoles={['freelancer']}>
              <Navbar />
              <FreelancerInvoicesPage />
            </PrivateRoute>
          }
        />

        {/* ---------------- Common Routes ---------------- */}
        <Route
          path="/help"
          element={
            <PrivateRoute>
              <Navbar />
              <Help />
            </PrivateRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <PrivateRoute>
              <Navbar />
              <Settings />
            </PrivateRoute>
          }
        />

        {/* ---------------- Admin Routes ---------------- */}
        <Route
          path="/admin"
          element={
            <PrivateRoute allowedRoles={['admin']}>
              <Navbar />
              <AdminDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/create-project"
          element={
            <PrivateRoute allowedRoles={['admin']}>
              <Navbar />
              <AdminCreateProject />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/all-projects"
          element={
            <PrivateRoute allowedRoles={['admin']}>
              <Navbar />
              <AdminAllProjects />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/projects/:id"
          element={
            <PrivateRoute allowedRoles={['admin']}>
              <Navbar />
              <AdminProjectDetails />
            </PrivateRoute>
          }
        />
        <Route path="/admin/add-member" element={<AddMemberPage />} />

        {/* ---------------- Manager Routes ---------------- */}
        <Route
          path="/manager"
          element={
            <PrivateRoute allowedRoles={['manager']}>
              <Navbar />
              <ManagerDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/manager/projects"
          element={
            <PrivateRoute allowedRoles={['manager']}>
              <Navbar />
              <ManagerProjects />
            </PrivateRoute>
          }
        />
        <Route
          path="/manager/projects/:id"
          element={
            <PrivateRoute allowedRoles={['manager']}>
              <Navbar />
              <ProjectDetail />
            </PrivateRoute>
          }
        />
        <Route
          path="/manager/batches"
          element={
            <PrivateRoute allowedRoles={['manager']}>
              <Navbar />
              <ManagerBatches />
            </PrivateRoute>
          }
        />
        <Route
          path="/manager/team"
          element={
            <PrivateRoute allowedRoles={['manager']}>
              <Navbar />
              <ManagerTeam />
            </PrivateRoute>
          }
        />
        <Route
          path="/manager/requests"
          element={
            <PrivateRoute allowedRoles={['manager']}>
              <Navbar />
              <ManagerBatchApplications />
            </PrivateRoute>
          }
        />
        <Route
          path="/manager/organization"
          element={
            <PrivateRoute allowedRoles={['manager']}>
              <Navbar />
              <ManagerOrganization />
            </PrivateRoute>
          }
        />
        <Route
          path="/manager/profile"
          element={
            <PrivateRoute allowedRoles={['manager']}>
              <Navbar />
              <ManagerProfile />
            </PrivateRoute>
          }
        />

        {/* ---------------- Invoice Routes ---------------- */}
        <Route
          path="/manager/invoices"
          element={
            <PrivateRoute allowedRoles={['manager']}>
              <Navbar />
              <ManagerInvoicesPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/manager/invoices/:invoiceId"
          element={
            <PrivateRoute allowedRoles={['manager']}>
              <Navbar />
              <ManagerInvoiceDetailsPage />
            </PrivateRoute>
          }
        />

        {/* ✅ Catch-all route: redirect unknown paths to Home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
};

export default App;
