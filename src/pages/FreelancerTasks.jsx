import React, { useEffect, useState } from 'react';
import api from '../services/api';
import './FreelancerTasks.css';

const FreelancerTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const tasksPerPage = 5;

  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.getFreelancerTasks();
        if (res.success) {
          setTasks(res.data || []);
        } else {
          setTasks([]);
          setError(res.message || 'No tasks assigned.');
        }
      } catch (err) {
        console.error('Error fetching tasks:', err);
        setError('Failed to fetch tasks');
        setTasks([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  const handleSubmitTask = (taskId) => {
    alert(`Submit Task ${taskId} clicked`);
  };

  // Pagination calculations
  const totalPages = Math.ceil(tasks.length / tasksPerPage) || 1; // ensure >=1
  const indexOfLastTask = currentPage * tasksPerPage;
  const indexOfFirstTask = indexOfLastTask - tasksPerPage;
  const currentTasks = tasks.slice(indexOfFirstTask, indexOfLastTask);

  const handlePageChange = (pageNumber) => {
    if (pageNumber < 1 || pageNumber > totalPages) return;
    setCurrentPage(pageNumber);
  };

  if (loading) return <div className="loading">Loading tasks...</div>;
  if (error || tasks.length === 0)
    return <div className="empty-state">{error || 'No tasks assigned.'}</div>;

  return (
    <div className="tasks-container">
      <h2>My Tasks</h2>
      <div className="table-wrapper">
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
              {/* <th>Action</th> */}
            </tr>
          </thead>
          <tbody>
            {currentTasks.map((task) => (
              <tr key={task.id}>
                <td>{task.id}</td>
                <td>{task.batch?.project_name || '-'}</td>
                <td>{task.title}</td>
                <td>{task.description}</td>
                <td>{task.count}</td>
                <td>
                  <span className={`status-badge status-${task.status.toLowerCase()}`}>
                    {task.status}
                  </span>
                </td>
                <td>{new Date(task.assign_date).toLocaleString()}</td>
                {/* <td>
                  <button
                    className="submit-btn"
                    onClick={() => handleSubmitTask(task.id)}
                  >
                    Submit
                  </button>
                </td> */}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="pagination">
        <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
          &laquo; Prev
        </button>
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            className={currentPage === i + 1 ? 'active' : ''}
            onClick={() => handlePageChange(i + 1)}
          >
            {i + 1}
          </button>
        ))}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next &raquo;
        </button>
      </div>
    </div>
  );
};

export default FreelancerTasks;
