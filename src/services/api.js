const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// ---------------- CSRF Token ----------------
const getCsrfToken = () => {
  let token = sessionStorage.getItem("csrf_token");
  if (token) return token;
  const match = document.cookie.match(/(^|;)\s*csrf_access_token=([^;]+)/);
  return match ? match[2] : null;
};

// ---------------- Fetch Wrapper ----------------
export async function fetchWithSession(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const csrfToken = getCsrfToken();

  const method = options.method?.toUpperCase() || "GET";
  const isFormData = options.body instanceof FormData;

  const headers = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(options.headers || {}),
    ...(csrfToken ? { "X-CSRF-TOKEN": csrfToken } : {}),
  };

  const config = {
    method,
    headers,
    credentials: "include",
    body:
      method !== "GET"
        ? isFormData
          ? options.body
          : JSON.stringify(options.body || {})
        : undefined,
  };

  try {
    console.log("📡 API Request:", method, url, options.body || "");

    const response = await fetch(url, config);

    // ---- Handle 401 Refresh ----
    if (response.status === 401 && !options._retry) {
      console.warn("⚠️ 401 detected — trying token refresh...");
      const refreshRes = await fetch(`${API_BASE_URL}/user/refresh`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": csrfToken,
        },
      });

      if (!refreshRes.ok) return { success: false, error: "Session expired" };

      const refreshData = await refreshRes.json();
      if (refreshData.csrf_token)
        sessionStorage.setItem("csrf_token", refreshData.csrf_token);

      options._retry = true;
      return fetchWithSession(endpoint, options);
    }

    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }

    if (!response.ok) {
      console.error("❌ API Error:", response.status, data || text);
      return {
        success: false,
        error: data?.error || data?.message || text || "Server error",
      };
    }

    console.log("✅ API Success:", data);
    return data || { success: true };
  } catch (err) {
    console.error("🚨 Network/API error:", err);
    return { success: false, error: err.message || "Network error" };
  }
}

// ---------------- API Methods ----------------
const api = {
  // ---------- AUTH ----------
  login: (credentials) =>
    fetchWithSession("/user/login", { method: "POST", body: credentials }),
  logout: () => fetchWithSession("/user/logout", { method: "POST" }),
  signup: (userData) =>
    fetchWithSession("/user/signup", { method: "POST", body: userData }),
  getSession: () => fetchWithSession("/user/session"),
  forgotPassword: (email) =>
    fetchWithSession("/user/forgot-password", {
      method: "POST",
      body: { email },
    }),
  resetPassword: (email, otp, new_password) =>
    fetchWithSession("/user/reset-password", {
      method: "POST",
      body: { email, otp, new_password },
    }),
  getCsrfToken: () => fetchWithSession("/user/csrf-token"),

  // ---------- ADMIN ----------
  createProject: (data) =>
    fetchWithSession("/admin/projects", { method: "POST", body: data }),
  getAdminProjectById: (projectId) =>
    fetchWithSession(`/admin/projects/${projectId}`),
  getAllProjects: () => fetchWithSession("/admin/projects"),
  listUsers: () => fetchWithSession("/user/users"),
  getAllManagers: () => fetchWithSession("/user/managers"),
  updateProject: (projectId, data) =>
    fetchWithSession(`/admin/projects/${projectId}`, {
      method: "PUT",
      body: data,
    }),
  deleteProject: (projectId) =>
    fetchWithSession(`/admin/projects/${projectId}`, { method: "DELETE" }),
  closeProject: (projectId) =>
    fetchWithSession(`/admin/projects/${projectId}/close`, { method: "PUT" }),
  assignManager: (manager_username, job_ids) =>
    fetchWithSession("/admin/assign-manager", {
      method: "POST",
      body: { manager_username, job_ids },
    }),
  getAdminStats: () => fetchWithSession("/admin/stats"),

  // ---------- ADMIN INVOICES ----------
  generateProjectInvoice: (project_id) =>
    fetchWithSession(`/admin/invoices/project/${project_id}`, { method: "POST" }),
  getAllInvoices: () => fetchWithSession("/admin/invoices"),
  getInvoiceById: (invoice_id) =>
    fetchWithSession(`/admin/invoices/${invoice_id}`),
  getFreelancerEarnings: (freelancer_username) =>
    fetchWithSession(`/admin/earnings/${freelancer_username}`),

  // ---------- MANAGER ----------
  getManagerDashboard: () => fetchWithSession("/manager/dashboard"),
  getManagerProjects: () => fetchWithSession("/manager/projects"),
  getProjectById: (projectId) =>
    fetchWithSession(`/manager/projects/${projectId}`),
  getManagerTasks: (jobId) =>
    fetchWithSession("/manager/tasks", {
      method: "POST",
      body: { job_id: jobId },
    }),
  createTask: (taskData) =>
    fetchWithSession("/manager/assign_tasks", { method: "POST", body: taskData }),
  updateTaskStatusManager: (task_id, status) =>
    fetchWithSession("/manager/tasks/status", {
      method: "PATCH",
      body: { task_id, status },
    }),
  getManagerBatches: () => fetchWithSession("/manager/batches"),
  createBatch: (data) =>
    fetchWithSession("/manager/batches", { method: "POST", body: data }),
  getManagerFreelancers: () => fetchWithSession("/manager/freelancers"),
  listBatchApplications: (batch_id) =>
    fetchWithSession("/manager/batches/applications", {
      method: "POST",
      body: { batch_id },
    }),
  updateApplicationStatus: (application_id, status) =>
    fetchWithSession("/manager/batch_applications/status", {
      method: "PATCH",
      body: { application_id, status },
    }),
  getBatchMembers: (batch_id, project_id) =>
    fetchWithSession("/manager/batch_members_list", {
      method: "POST",
      body: { batch_id, project_id },
    }),
  updateProjectStatus: (projectId, status) =>
    fetchWithSession(`/manager/projects/${projectId}/status`, {
      method: "PATCH",
      body: { status },
    }),
  assignFreelancerToProject: (data) =>
    fetchWithSession("/manager/assign-freelancer-to-project", {
      method: "POST",
      body: data,
    }),
  updateManagerTask: (task_id, data) =>
    fetchWithSession(`/manager/tasks/${task_id}`, {
      method: "PATCH",
      body: data,
    }),
  updateManagerBatch: (batch_id, data) =>
    fetchWithSession(`/manager/batches/${batch_id}`, {
      method: "PATCH",
      body: data,
    }),

  // ---------- MANAGER INVOICES ----------
  getManagerInvoices: () => fetchWithSession("/manager/invoices/all"),

  getManagerInvoiceById: (invoiceId) => fetchWithSession(`/manager/invoices/${invoiceId}`),
  
  updateInvoiceStatus: (invoiceId, status) =>
  fetchWithSession(`/manager/invoices/${invoiceId}/status`, {
    method: "PUT",
    body: JSON.stringify({ status }), // ✅ Make sure this is JSON, not a string
  }),



  generateMultipleInvoices: (freelancer_username, project_ids) =>
    fetchWithSession("/manager/invoices/generate-multiple", {
      method: "POST",
      body: { freelancer_username, project_ids },
    }),

  // ---------- FREELANCER ----------
  getFreelancerProfile: () => fetchWithSession("/freelancer/profile"),
  createFreelancerProfile: (data) =>
    fetchWithSession("/freelancer/create_profile", {
      method: "POST",
      body: data,
    }),
  updateFreelancerProfile: (data) =>
    fetchWithSession("/freelancer/profile", { method: "PUT", body: data }),
  getFreelancerTasks: () => fetchWithSession("/freelancer/tasks"),
  getFreelancerTaskById: (task_id) =>
    fetchWithSession(`/freelancer/tasks/${task_id}`),
  updateFreelancerTask: (task_id, data) =>
    fetchWithSession(`/freelancer/tasks/${task_id}`, {
      method: "PATCH",
      body: data,
    }),
  updateTaskStatusFreelancer: (task_id, status) =>
    fetchWithSession("/freelancer/tasks/status", {
      method: "PATCH",
      body: { task_id, status },
    }),
  getFreelancerJobs: () => fetchWithSession("/freelancer/jobs"),
  applyToBatch: (batch_id) =>
    fetchWithSession("/freelancer/applications/batch", {
      method: "POST",
      body: { batch_id },
    }),
  getMyApplications: () => fetchWithSession("/freelancer/applications/mine"),
  getOnboardingSteps: () => fetchWithSession("/freelancer/onboarding"),
  updateOnboardingStatus: (stepData) =>
    fetchWithSession("/freelancer/onboarding/update-status", {
      method: "PATCH",
      body: stepData,
    }),
  getSuggestedBatches: () => fetchWithSession("/freelancer/batches"),
  getMyBatches: () => fetchWithSession("/freelancer/batches/mine"),

  // ---------- FREELANCER BILLING ----------
  getMyInvoices: () => fetchWithSession("/freelancer/invoices/my"),
  getMyInvoiceById: (invoice_id) =>
    fetchWithSession(`/freelancer/invoices/${invoice_id}`),
  requestInvoiceGeneration: (project_id) =>
    fetchWithSession("/freelancer/invoices/request", {
      method: "POST",
      body: { project_id },
    }),
  getMyEarnings: () => fetchWithSession("/freelancer/earnings"),
  getCombinedEarnings: (project_id) =>
    fetchWithSession(`/freelancer/earnings/combined/${project_id}`),
  createInvoice: (data) =>
    fetchWithSession("/freelancer/invoices/create", {
      method: "POST",
      body: data,
    }),

  // ---------- WORK SUMMARY ----------
// ---------- FREELANCER WORK SUMMARY ----------
  getFreelancerWorkSummary: async () => {
    try {
      const url = "/freelancer/invoices/work_summary";
      console.log(`📊 Calling Work Summary API: ${url}`);
      const response = await fetchWithSession(url);

      console.log("✅ API Response:", response);
      return response;
    } catch (err) {
      console.error("🚨 Error fetching freelancer work summary:", err);
      return { success: false, error: err.message || "Network error" };
    }
  },


};

export default api;
