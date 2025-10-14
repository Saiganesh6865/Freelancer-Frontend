const API_BASE_URL = import.meta.env.VITE_API_URL;

const getCsrfToken = () => {
  let token = sessionStorage.getItem("csrf_token");
  if (token) return token;
  const match = document.cookie.match(/(^|;)\s*csrf_access_token=([^;]+)/);
  return match ? match[2] : null;
};

export async function fetchWithSession(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const csrfToken = getCsrfToken();

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

  if (response.status === 401 && !options._retry) {
    const refreshRes = await fetch(`${API_BASE_URL}/user/refresh`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json", "X-CSRF-TOKEN": csrfToken },
    });

    if (!refreshRes.ok) throw new Error("Session expired. Please login again.");

    const refreshData = await refreshRes.json();
    if (refreshData.csrf_token) sessionStorage.setItem("csrf_token", refreshData.csrf_token);

    options._retry = true;
    return fetchWithSession(endpoint, options);
  }

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Request failed: ${response.status} - ${text}`);
  }

  const contentType = response.headers.get("content-type");
  return contentType?.includes("application/json") ? await response.json() : {};
}

// ---------- API Methods ----------
const api = {
  // ---------- Auth ----------
  login: (credentials) =>
    fetchWithSession("/user/login", { method: "POST", body: credentials }),
  logout: () => fetchWithSession("/user/logout", { method: "POST" }),
  signup: (userData) =>
    fetchWithSession("/user/signup", { method: "POST", body: userData }),
  getSession: () => fetchWithSession("/user/session"),
  forgotPassword: (email) =>
    fetchWithSession("/user/forgot-password", { method: "POST", body: { email } }),
  resetPassword: (email, otp, new_password) =>
    fetchWithSession("/user/reset-password", {
      method: "POST",
      body: { email, otp, new_password },
    }),
  getCsrfToken: () => fetchWithSession("/user/csrf-token"),

  // ---------- Admin ----------
  createProject: (data) => fetchWithSession("/admin/projects", { method: "POST", body: data }),
  getAllProjects: () => fetchWithSession("/admin/projects"),
  listUsers: () => fetchWithSession("/user/users"),
  updateProject: (projectId, data) =>
    fetchWithSession(`/admin/projects/${projectId}`, { method: "PUT", body: data }),
  deleteProject: (projectId) =>
    fetchWithSession(`/admin/projects/${projectId}`, { method: "DELETE" }),
  closeProject: (projectId) =>
    fetchWithSession(`/admin/projects/${projectId}/close`, { method: "PUT" }),
  assignManager: (manager_username, job_ids) =>
    fetchWithSession("/admin/assign-manager", { method: "POST", body: { manager_username, job_ids } }),
  getAdminStats: () => fetchWithSession("/admin/stats"),

  // ---------- Manager ----------
  getManagerDashboard: () => fetchWithSession("/manager/dashboard"),
  getManagerProjects: () => fetchWithSession("/manager/projects"),
  getManagerTasks: (jobId) =>
    fetchWithSession("/manager/tasks", { method: "POST", body: { job_id: jobId } }),
  createTask: (taskData) =>
    fetchWithSession("/manager/assign_tasks", { method: "POST", body: taskData }),
  updateTaskStatusManager: (task_id, status) =>
    fetchWithSession("/manager/tasks/status", { method: "PATCH", body: { task_id, status } }),
  getManagerBatches: () => fetchWithSession("/manager/batches"),
  createBatch: (data) => fetchWithSession("/manager/batches", { method: "POST", body: data }),
  getManagerFreelancers: () => fetchWithSession("/manager/freelancers"),
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
  getFreelancerProfile: () => fetchWithSession("/freelancer/profile"),
  createFreelancerProfile: (data) => fetchWithSession("/freelancer/create_profile", { method: "POST", body: data }),
  updateFreelancerProfile: (data) => fetchWithSession("/freelancer/profile", { method: "PUT", body: data }),
  getFreelancerTasks: () => fetchWithSession("/freelancer/tasks"),
  updateTaskStatusFreelancer: (task_id, status) =>
    fetchWithSession("/freelancer/tasks/status", { method: "PATCH", body: { task_id, status } }),
  getFreelancerJobs: () => fetchWithSession("/freelancer/jobs"),
  applyToBatch: (batch_id) =>
    fetchWithSession("/freelancer/applications/batch", { method: "POST", body: { batch_id } }),
  getMyApplications: () => fetchWithSession("/freelancer/applications/mine"),
  getOnboardingSteps: () => fetchWithSession("/freelancer/onboarding"),
  updateOnboardingStatus: (stepData) =>
    fetchWithSession("/freelancer/onboarding/update-status", { method: "PATCH", body: stepData }),
  getSuggestedBatches: () => fetchWithSession("/freelancer/batches"),
  getMyBatches: () => fetchWithSession("/freelancer/batches/mine"),
};

export default api;
