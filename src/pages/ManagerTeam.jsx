import React, { useState, useEffect } from "react";
import { Table, Button, Select, Input, Form, message, Spin, Modal } from "antd";
import api from "../services/api";
import "./ManagerTeam.css";

const { Option } = Select;

const ManagerTeam = () => {
  const [projects, setProjects] = useState([]);
  const [batches, setBatches] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedBatchMembers, setSelectedBatchMembers] = useState([]);

  const [formErrors, setFormErrors] = useState({});
  const [apiErrors, setApiErrors] = useState({});

  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
  const [createTaskForm, setCreateTaskForm] = useState({
    job_id: null,
    batch_id: null,
    title: "",
    description: "",
    count: 0,
    assigned_to_username: "",
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [projectsData, batchesData] = await Promise.all([
        api.getManagerProjects(),
        api.getManagerBatches(),
      ]);
      setProjects(projectsData?.data || []);
      setBatches(batchesData?.data || []);
    } catch (err) {
      console.error(err);
      message.error("Failed to load manager data");
    } finally {
      setLoading(false);
    }
  };

  const fetchTasksForProject = async () => {
    if (!selectedProject) return;
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
        status: task.status,
      }));
      setTasks(mappedTasks);
    } catch (err) {
      console.error(err);
      message.error("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Create Task
  const handleCreateTask = async () => {
    setFormErrors({});
    setApiErrors({});

    // Frontend validation
    const errors = {};
    if (!createTaskForm.title) errors.title = "Title is required";
    if (!createTaskForm.count || createTaskForm.count <= 0)
      errors.count = "Count must be greater than 0";
    if (!createTaskForm.batch_id) errors.batch_id = "Batch is required";
    if (!createTaskForm.assigned_to_username)
      errors.assigned_to_username = "Please select a freelancer";

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      setLoading(true);
      const res = await api.createTask({
        ...createTaskForm,
        job_id: selectedProject,
      });

      // ✅ Handle backend validation errors inline
      if (res?.success === false || res?.error) {
        const errorMsg = res.error || "Unknown error occurred";
        if (errorMsg.toLowerCase().includes("remaining tasks")) {
          setApiErrors({ count: errorMsg });
        } else if (errorMsg.toLowerCase().includes("title")) {
          setApiErrors({ title: errorMsg });
        } else {
          message.error(errorMsg);
        }
        return;
      }

      message.success("Task created successfully");
      setShowCreateTaskModal(false);
      setCreateTaskForm({
        job_id: null,
        batch_id: null,
        title: "",
        description: "",
        count: 0,
        assigned_to_username: "",
      });
      setSelectedBatchMembers([]);
      fetchTasksForProject();
    } catch (err) {
      const errorMsg =
        err.response?.data?.error || "Task creation failed due to server error";

      if (errorMsg.toLowerCase().includes("remaining tasks")) {
        setApiErrors({ count: errorMsg });
      } else {
        message.error(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  const taskColumns = [
    { title: "Task ID", dataIndex: "id", key: "id" },
    { title: "Batch", dataIndex: "batch_name", key: "batch_name" },
    { title: "Title", dataIndex: "title", key: "title" },
    { title: "Description", dataIndex: "description", key: "description" },
    { title: "Count", dataIndex: "count", key: "count" },
    { title: "Assigned To", dataIndex: "username", key: "username" },
    { title: "Status", dataIndex: "status", key: "status" },
  ];

  return (
    <div className="manager-team-page">
      <h2>Manager Tasks</h2>

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

      {/* ✅ Task Creation Modal */}
      <Modal
        title="Create Task"
        open={showCreateTaskModal}
        onCancel={() => setShowCreateTaskModal(false)}
        onOk={handleCreateTask}
      >
        <Form layout="vertical">
          {/* Title */}
          <Form.Item
            label="Title *"
            validateStatus={formErrors.title || apiErrors.title ? "error" : ""}
            help={formErrors.title || apiErrors.title}
          >
            <Input
              value={createTaskForm.title}
              onChange={(e) => {
                setCreateTaskForm({
                  ...createTaskForm,
                  title: e.target.value,
                });
                if (formErrors.title || apiErrors.title)
                  setFormErrors({ ...formErrors, title: "" });
                setApiErrors({ ...apiErrors, title: "" });
              }}
            />
          </Form.Item>

          {/* Description */}
          <Form.Item label="Description">
            <Input
              value={createTaskForm.description}
              onChange={(e) =>
                setCreateTaskForm({
                  ...createTaskForm,
                  description: e.target.value,
                })
              }
            />
          </Form.Item>

          {/* Count */}
          <Form.Item
            label="Count *"
            validateStatus={formErrors.count || apiErrors.count ? "error" : ""}
            help={formErrors.count || apiErrors.count} // Only this line
            className={`custom-error-field ${apiErrors.count ? "has-error-border" : ""}`}
          >
            <Input
              type="number"
              className={apiErrors.count ? "input-error" : ""}
              value={createTaskForm.count}
              onChange={(e) => {
                setCreateTaskForm({
                  ...createTaskForm,
                  count: Number(e.target.value),
                });
                if (formErrors.count || apiErrors.count) {
                  setFormErrors({ ...formErrors, count: "" });
                  setApiErrors({ ...apiErrors, count: "" });
                }
              }}
            />
          </Form.Item>



          {/* Batch */}
          <Form.Item
            label="Batch *"
            validateStatus={formErrors.batch_id ? "error" : ""}
            help={formErrors.batch_id}
          >
            <Select
              value={createTaskForm.batch_id}
              onChange={(val) => {
                const selectedBatch = batches.find((b) => b.id === val);
                setCreateTaskForm({
                  ...createTaskForm,
                  batch_id: val,
                  assigned_to_username: "",
                });

                const members = selectedBatch?.team_members || "";
                const parsedMembers = members
                  ? members.split(",").map((m) => m.trim())
                  : [];
                setSelectedBatchMembers(parsedMembers);
                if (formErrors.batch_id)
                  setFormErrors({ ...formErrors, batch_id: "" });
              }}
              placeholder="Select Batch"
            >
              {batches.map((batch) => {
                const pending = batch.count - (batch.total_assigned || 0);
                return (
                  <Option key={batch.id} value={batch.id}>
                    {batch.project_name} - Batch {batch.id} ({pending} pending)
                  </Option>
                );
              })}
            </Select>
          </Form.Item>

          {/* Freelancer */}
          <Form.Item
            label="Assign To *"
            validateStatus={
              formErrors.assigned_to_username ? "error" : ""
            }
            help={
              formErrors.assigned_to_username ||
              "Select a freelancer from the batch"
            }
          >
            <Select
              value={createTaskForm.assigned_to_username}
              onChange={(val) => {
                setCreateTaskForm({
                  ...createTaskForm,
                  assigned_to_username: val,
                });
                if (formErrors.assigned_to_username)
                  setFormErrors({
                    ...formErrors,
                    assigned_to_username: "",
                  });
              }}
              placeholder="Select Freelancer"
            >
              {selectedBatchMembers.length > 0 ? (
                selectedBatchMembers.map((member) => (
                  <Option key={member} value={member}>
                    {member}
                  </Option>
                ))
              ) : (
                <Option value="" disabled>
                  No members in this batch
                </Option>
              )}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ManagerTeam;
