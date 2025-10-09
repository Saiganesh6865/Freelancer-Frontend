// services/api.js
const API_BASE_URL = import.meta.env.VITE_API_URL || "https://freelancer-backend-65cp.onrender.com";

const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
  return null;
};

export async function fetchWithSession(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;

  // Always use csrf_access_token
  const csrfToken = getCookie("csrf_access_token");

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
    ...(csrfToken ? { "X-CSRF-TOKEN": csrfToken } : {}),
  };

  const config = {
    method: options.method || "GET",
    headers,
    credentials: "include",
    body: options.body ? JSON.stringify(options.body) : undefined,
  };

  let response = await fetch(url, config);

  // Retry once if access token expired
  if (response.status === 401 && !options._retry) {
    const refreshRes = await fetch(`${API_BASE_URL}/user/refresh`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-TOKEN": csrfToken
      }
    });

    if (!refreshRes.ok) {
      throw new Error("Session expired. Please login again.");
    }

    options._retry = true; // prevent infinite loop
    return fetchWithSession(endpoint, options);
  }

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Request failed: ${response.status} - ${text}`);
  }

  const contentType = response.headers.get("content-type");
  return contentType && contentType.includes("application/json")
    ? await response.json()
    : {};
}


// ---------- API Methods ----------
const api = {
  // ---------- Auth ----------
  login: (credentials) =>
    fetchWithSession("/user/login", { method: "POST", body: credentials }),

  logout: () => fetchWithSession("/user/logout", { method: "POST" }),
  signup: (userData) => fetchWithSession("/user/signup", { method: "POST", body: userData }),
  getSession: () => fetchWithSession("/user/session", { method: "GET" }),
  forgotPassword: (email) =>
    fetchWithSession("/user/forgot-password", { method: "POST", body: { email } }),
  resetPassword: (email, otp, new_password) =>
    fetchWithSession("/user/reset-password", {
      method: "POST",
      body: { email, otp, new_password },
    }),
  getCsrfToken: () => fetchWithSession("/user/csrf-token", { method: "GET" }),

  // ---------- Admin ----------
  createProject: (data) =>
    fetchWithSession("/admin/projects", { method: "POST", body: data }),
  getAllProjects: () => fetchWithSession("/admin/projects", { method: "GET" }),
  listUsers: () => fetchWithSession("/user/users", { method: "GET" }),
  updateProject: (projectId, data) =>
    fetchWithSession(`/admin/projects/${projectId}`, { method: "PUT", body: data }),
  deleteProject: (projectId) =>
    fetchWithSession(`/admin/projects/${projectId}`, { method: "DELETE" }),
  closeProject: (projectId) =>
    fetchWithSession(`/admin/projects/${projectId}/close`, { method: "PUT" }),
  assignManager: (manager_username, job_ids) =>
    fetchWithSession("/admin/assign-manager", { method: "POST", body: { manager_username, job_ids } }),
  getAdminStats: () => fetchWithSession("/admin/stats", { method: "GET" }),

  // ---------- Manager ----------
  getManagerDashboard: () => fetchWithSession("/manager/dashboard", { method: "GET" }),
  getManagerProjects: () => fetchWithSession("/manager/projects", { method: "GET" }),
  getManagerTasks: (jobId) =>
    fetchWithSession("/manager/tasks", { method: "POST", body: { job_id: jobId } }),
  createTask: (taskData) =>
    fetchWithSession("/manager/assign_tasks", { method: "POST", body: taskData }),
  updateTaskStatusManager: (task_id, status) =>
    fetchWithSession("/manager/tasks/status", { method: "PATCH", body: { task_id, status } }),
  getManagerBatches: () => fetchWithSession("/manager/batches", { method: "GET" }),
  createBatch: (data) => fetchWithSession("/manager/batches", { method: "POST", body: data }),
  getManagerFreelancers: () => fetchWithSession("/manager/freelancers", { method: "GET" }),
  listBatchApplications: (batch_id) =>
    fetchWithSession("/manager/batches/applications", { method: "POST", body: { batch_id } }),
  updateApplicationStatus: (application_id, status) =>
    fetchWithSession("/manager/batch_applications/status", { method: "PATCH", body: { application_id, status } }),
  getBatchMembers: (batch_id, project_id) =>
    fetchWithSession("/manager/batch_members_list", { method: "POST", body: { batch_id, project_id } }),
  updateProjectStatus: (projectId, status) =>
    fetchWithSession(`/manager/projects/${projectId}/status`, { method: "PATCH", body: { status } }),
  assignFreelancerToProject: (data) =>
    fetchWithSession("/manager/assign-freelancer-to-project", { method: "POST", body: data }),

  // ---------- Freelancer ----------
  getFreelancerProfile: () => fetchWithSession("/freelancer/profile", { method: "GET" }),
  createFreelancerProfile: (data) => fetchWithSession("/freelancer/create_profile", { method: "POST", body: data }),
  updateFreelancerProfile: (data) => fetchWithSession("/freelancer/profile", { method: "PUT", body: data }),
  getFreelancerTasks: () => fetchWithSession("/freelancer/tasks", { method: "GET" }),
  updateTaskStatusFreelancer: (task_id, status) =>
    fetchWithSession("/freelancer/tasks/status", { method: "PATCH", body: { task_id, status } }),
  getFreelancerJobs: () => fetchWithSession("/freelancer/jobs", { method: "GET" }),
  applyToBatch: (batch_id) =>
    fetchWithSession("/freelancer/applications/batch", { method: "POST", body: { batch_id } }),
  getMyApplications: () => fetchWithSession("/freelancer/applications/mine", { method: "GET" }),
  getOnboardingSteps: () => fetchWithSession("/freelancer/onboarding", { method: "GET" }),
  updateOnboardingStatus: (stepData) =>
    fetchWithSession("/freelancer/onboarding/update-status", { method: "PATCH", body: stepData }),
  getSuggestedBatches: () => fetchWithSession("/freelancer/batches", { method: "GET" }),
  getMyBatches: () => fetchWithSession("/freelancer/batches/mine", { method: "GET" }),
};

export default api;
