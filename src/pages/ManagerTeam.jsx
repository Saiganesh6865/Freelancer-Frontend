// src/pages/ManagerTeam.jsx
import React, { useState, useEffect } from "react";
import { Table, Button, Modal, Select, Input, Form, message, Spin } from "antd";
import api from "../services/api";
import "./ManagerTeam.css";

const { Option } = Select;

const ManagerTeam = () => {
  const [projects, setProjects] = useState([]);
  const [batches, setBatches] = useState([]);
  const [freelancers, setFreelancers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [loading, setLoading] = useState(false);

  // Assign Task Modal
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskForm, setTaskForm] = useState({
    job_id: null,
    batch_id: null,
    title: "",
    description: "",
    count: 0,
    assigned_to_username: ""
  });

  // Create Task Modal
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
  const [createTaskForm, setCreateTaskForm] = useState({
    job_id: null,
    batch_id: null,
    title: "",
    description: "",
    count: 0,
    assigned_to_username: ""
  });

  // Fetch projects, batches, freelancers
  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [projectsData, batchesData, freelancersData] = await Promise.all([
        api.getManagerProjects(),
        api.getManagerBatches(),
        api.getManagerFreelancers()
      ]);
      setProjects(projectsData?.data || []);
      setBatches(batchesData?.data || []);
      setFreelancers(freelancersData?.data || []);
    } catch (err) {
      console.error(err);
      message.error("Failed to load manager data");
    } finally {
      setLoading(false);
    }
  };

  // Fetch tasks for selected project
  const fetchTasksForProject = async () => {
    if (!selectedProject) {
      message.warning("Please select a project first");
      return;
    }
    try {
      setLoading(true);
      const tasksData = await api.getManagerTasks(selectedProject);
      const mappedTasks = (tasksData?.data || []).map((task) => ({
        id: task.id,
        project_name: task.batch?.project_name || "N/A",
        batch_name: task.batch ? `Batch ${task.batch.id}` : "N/A",
        title: task.title,
        description: task.description || "",
        count: task.count,
        username: task.freelancer?.username || "Unassigned",
        status: task.status
      }));
      setTasks(mappedTasks);
    } catch (err) {
      console.error(err);
      message.error("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  // Assign Task handler
  const handleTaskAssignment = async () => {
    if (!taskForm.job_id || !taskForm.title || !taskForm.assigned_to_username) {
      message.warning("Please fill all required fields");
      return;
    }
    try {
      setLoading(true);
      await api.assignTask(taskForm);
      message.success("Task assigned successfully");
      setShowTaskModal(false);
      setTaskForm({
        job_id: null,
        batch_id: null,
        title: "",
        description: "",
        count: 0,
        assigned_to_username: ""
      });
      fetchTasksForProject();
    } catch (err) {
      console.error(err);
      message.error("Task assignment failed");
    } finally {
      setLoading(false);
    }
  };

  // Create Task handler
  const handleCreateTask = async () => {
    if (!createTaskForm.job_id || !createTaskForm.title) {
      message.warning("Please fill all required fields");
      return;
    }
    try {
      setLoading(true);
      await api.createTask(createTaskForm);
      message.success("Task created successfully");
      setShowCreateTaskModal(false);
      setCreateTaskForm({
        job_id: null,
        batch_id: null,
        title: "",
        description: "",
        count: 0,
        assigned_to_username: ""
      });
      fetchTasksForProject();
    } catch (err) {
      console.error(err);
      message.error("Task creation failed");
    } finally {
      setLoading(false);
    }
  };

  const taskColumns = [
    { title: "Task ID", dataIndex: "id", key: "id" },
    // { title: "Project", dataIndex: "project_name", key: "project_name" },
    { title: "Batch", dataIndex: "batch_name", key: "batch_name" },
    { title: "Title", dataIndex: "title", key: "title" },
    { title: "Description", dataIndex: "description", key: "description" },
    { title: "Count", dataIndex: "count", key: "count" },
    { title: "Assigned To", dataIndex: "username", key: "username" },
    { title: "Status", dataIndex: "status", key: "status" }
  ];

return (
  <div className="manager-team-page">
    <h2>Manager Team</h2>

    {/* Project Selector */}
    <div className="project-selector">
      <Select
        style={{ width: 250 }}
        placeholder="Choose a project"
        value={selectedProject}
        onChange={(val) => setSelectedProject(val)}
      >
        {projects.map((proj) => (
          <Option key={proj.job_id || proj.id} value={proj.job_id || proj.id}>
            {proj.project_name || proj.title}
          </Option>
        ))}
      </Select>
      <Button type="primary" onClick={fetchTasksForProject}>
        Search
      </Button>
    </div>

    {loading ? (
      <Spin size="large" />
    ) : (
      <>
        <Button
          type="primary"
          className="create-task-btn"
          onClick={() => setShowCreateTaskModal(true)}
          disabled={!selectedProject}
        >
          Create New Task
        </Button>

        <Table
          dataSource={tasks}
          columns={taskColumns}
          rowKey="id"
          bordered
          pagination={{ pageSize: 10 }}
        />
      </>
    )}

    
    {/* Create Task Modal */}
    <Modal
  title="Create Task"
  open={showCreateTaskModal}
  onCancel={() => setShowCreateTaskModal(false)}
  onOk={handleCreateTask}
>
  <Form layout="vertical">
    <Form.Item label="Title" required>
      <Input
        value={createTaskForm.title}
        onChange={(e) =>
          setCreateTaskForm({ ...createTaskForm, title: e.target.value })
        }
      />
    </Form.Item>

    <Form.Item label="Description">
      <Input
        value={createTaskForm.description}
        onChange={(e) =>
          setCreateTaskForm({ ...createTaskForm, description: e.target.value })
        }
      />
    </Form.Item>

    <Form.Item label="Count">
      <Input
        type="number"
        value={createTaskForm.count}
        onChange={(e) =>
          setCreateTaskForm({ ...createTaskForm, count: e.target.value })
        }
      />
    </Form.Item>

    <Form.Item label="Batch" required>
      <Select
        value={createTaskForm.batch_id}
        onChange={(val) =>
          setCreateTaskForm({ ...createTaskForm, batch_id: val })
        }
        placeholder="Select Batch"
      >
        {batches.map((batch) => (
          <Option key={batch.id} value={batch.id}>
            {batch.project_name} - Batch {batch.id}
          </Option>
        ))}
      </Select>
    </Form.Item>

    <Form.Item label="Assign To">
      <Select
        value={createTaskForm.assigned_to_username}
        onChange={(val) =>
          setCreateTaskForm({ ...createTaskForm, assigned_to_username: val })
        }
        placeholder="Select Freelancer"
      >
        {freelancers.map((f) => (
          <Option key={f.username} value={f.username}>
            {f.username}
          </Option>
        ))}
      </Select>
    </Form.Item>
  </Form>
</Modal>

  </div>
);

};

export default ManagerTeam;
