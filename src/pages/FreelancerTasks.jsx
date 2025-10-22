import React, { useEffect, useState } from 'react';
import api from '../services/api';
import './FreelancerTasks.css';

const FreelancerTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.getFreelancerTasks();
        if (res.success) {
          // ✅ Access the tasks array inside `data`
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

  if (loading) return <div className="loading">Loading tasks...</div>;
  if (error) return <div className="empty-state">{error}</div>;

  if (tasks.length === 0) {
    return <div className="empty-state">No tasks assigned.</div>;
  }

  return (
    <div className="tasks-container">
      <h2>My Tasks</h2>
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
          {tasks.map((task) => (
            <tr key={task.id}>
              <td>{task.id}</td>
              <td>{task.batch?.project_name || '-'}</td>
              <td>{task.title}</td>
              <td>{task.description}</td>
              <td>{task.count}</td>
              <td className={`status-${task.status.toLowerCase()}`}>
                {task.status}
              </td>
              <td>{new Date(task.assign_date).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default FreelancerTasks;
