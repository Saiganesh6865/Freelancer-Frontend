import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./FreelancerTasks.css";

const FreelancerTasks = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const tasksPerPage = 7;

  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.getFreelancerTasks();
        if (res.success) setTasks(res.data || []);
        else {
          setTasks([]);
          setError(res.message || "No tasks assigned.");
        }
      } catch (err) {
        console.error("Error fetching tasks:", err);
        setError("Failed to fetch tasks");
        setTasks([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  const totalPages = Math.ceil(tasks.length / tasksPerPage) || 1;
  const indexOfLastTask = currentPage * tasksPerPage;
  const indexOfFirstTask = indexOfLastTask - tasksPerPage;
  const currentTasks = tasks.slice(indexOfFirstTask, indexOfLastTask);

  const handlePageChange = (pageNumber) => {
    if (pageNumber < 1 || pageNumber > totalPages) return;
    setCurrentPage(pageNumber);
  };

  if (loading) return <div className="loading">Loading tasks...</div>;
  if (error || tasks.length === 0)
    return <div className="empty-state">{error || "No tasks assigned."}</div>;

  return (
    <div className="freelancer-tasks-wrapper">
      <div className="tasks-card">
        <h2 className="tasks-title">My Tasks</h2>

        <div className="task-buttons">
          <button
            className="view-invoices-btn"
            onClick={() => navigate("/freelancer/invoices/my")}
          >
            📄 View My Invoices
          </button>
          <button
            className="create-invoice-btn"
            onClick={() => navigate("/freelancer/invoices/create")}
          >
            🧾 Create Invoice
          </button>
        </div>

        <div className="table-container">
          <table className="tasks-table">
            <thead>
              <tr>
                <th>Task ID</th>
                <th>Batch</th>
                <th>Title</th>
                <th>Description</th>
                <th>Count</th>
                <th>Status</th>
                <th>Assigned At</th>
              </tr>
            </thead>
            <tbody>
              {currentTasks.map((task) => (
                <tr key={task.id}>
                  <td>{task.id}</td>
                  <td>
                    {task.batch ? (
                      <span
                        className="batch-link"
                        onClick={() => navigate(`/tasks/${task.id}`)}
                      >
                        {task.batch.project_name}
                      </span>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td>{task.title}</td>
                  <td>{task.description}</td>
                  <td>{task.count}</td>
                  <td>
                    <span
                      className={`status-badge status-${task.status
                        .toLowerCase()
                        .replace(" ", "-")}`}
                    >
                      {task.status}
                    </span>
                  </td>
                  <td>{new Date(task.assign_date).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* === Pagination === */}
        <div className="pagination-bar">
          <p className="entries-info">
            Showing {indexOfFirstTask + 1}–
            {Math.min(indexOfLastTask, tasks.length)} of {tasks.length} entries
          </p>

          <div className="pagination-controls">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              &lt;
            </button>
            <span className="page-number">{currentPage}</span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              &gt;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FreelancerTasks;
