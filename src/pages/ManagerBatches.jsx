import React, { useState, useEffect } from "react";
import {
  Table,
  message,
  Spin,
  Modal,
  Button,
  Form,
  Input,
  InputNumber,
  Select,
} from "antd";
import api from "../services/api";
import "./ManagerBatches.css";

const ManagerBatches = () => {
  const [batches, setBatches] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchAllData();
  }, []);

  // ---------- Fetch Batches and Projects ----------
  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [batchesRes, projectsRes] = await Promise.all([
        api.getManagerBatches(),
        api.getManagerProjects(),
      ]);

      setBatches(batchesRes?.data || []);
      setProjects(projectsRes?.data || []);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  // ---------- When a project is selected ----------
  const handleProjectSelect = (job_id) => {
    const selectedProject = projects.find((p) => p.job_id === job_id);
    if (selectedProject) {
      form.setFieldsValue({
        project_name: selectedProject.title,
        skills_required: selectedProject.skills_required,
        project_type: selectedProject.project_type,
      });
    }
  };

  // ---------- Create Batch ----------
  const handleCreateBatch = async (values) => {
    try {
      const payload = {
        project_id: values.project_id,
        count: values.count,
        project_name: values.project_name,
        skills_required: values.skills_required,
        project_type: values.project_type,
      };

      await api.createBatch(payload);
      message.success("✅ Batch created successfully!");
      setShowCreateModal(false);
      form.resetFields();
      setSuccessModalOpen(true);
    } catch (err) {
      console.error("Error creating batch:", err);
      message.error("❌ Failed to create batch");
    }
  };

  // ---------- Table Columns ----------
  const columns = [
    { title: "Batch ID", dataIndex: "id", key: "id" },
    { title: "Project Name", dataIndex: "project_name", key: "project_name" },
    { title: "Project Type", dataIndex: "project_type", key: "project_type" },
    { title: "Skills Required", dataIndex: "skills_required", key: "skills_required" },
    { title: "Count", dataIndex: "count", key: "count" },
    {
      title: "Members",
      dataIndex: "members",
      key: "members",
      render: (members) => (members && members.length > 0 ? members.join(", ") : "None"),
    },
    {
      title: "Created At",
      dataIndex: "created_at",
      key: "created_at",
      render: (date) => new Date(date).toLocaleString(),
    },
  ];

  // ---------- Success Modal OK ----------
  const handleSuccessOk = () => {
    setSuccessModalOpen(false);
    fetchAllData(); // Refresh batches after success
  };

  return (
    <div className="batches-container">
      <div className="batches-header">
        <h2>Manager Batches</h2>
        <Button type="primary" onClick={() => setShowCreateModal(true)}>
          Create New Batch
        </Button>
      </div>

      {loading ? (
        <Spin size="large" />
      ) : error ? (
        <p className="error-text">{error}</p>
      ) : (
        <Table
          dataSource={batches}
          columns={columns}
          rowKey="id"
          bordered
          className="batches-table"
        />
      )}

      {/* ---------- Create Batch Modal ---------- */}
      <Modal
        title="Create New Batch"
        open={showCreateModal}
        onCancel={() => setShowCreateModal(false)}
        footer={null}
        destroyOnHidden
      >
        <Form layout="vertical" form={form} onFinish={handleCreateBatch} preserve={false}>
          {/* Project Selection Dropdown */}
          <Form.Item
            label="Select Project"
            name="project_id"
            rules={[{ required: true, message: "Please select a project" }]}
          >
            <Select
              placeholder="Choose a project"
              onChange={handleProjectSelect}
              showSearch
              optionFilterProp="children"
            >
              {projects.map((proj) => (
                <Select.Option key={proj.job_id} value={proj.job_id}>
                  {proj.title}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          {/* Auto-filled fields */}
          <Form.Item label="Project Name" name="project_name">
            <Input disabled />
          </Form.Item>

          <Form.Item label="Skills Required" name="skills_required">
            <Input.TextArea rows={2} disabled />
          </Form.Item>

          <Form.Item label="Project Type" name="project_type">
            <Input disabled />
          </Form.Item>

          {/* Input count */}
          <Form.Item
            label="Batch Count"
            name="count"
            rules={[{ required: true, message: "Please enter batch count" }]}
          >
            <InputNumber min={1} style={{ width: "100%" }} />
          </Form.Item>

          <Button type="primary" htmlType="submit" block>
            Create Batch
          </Button>
        </Form>
      </Modal>

      {/* ---------- Success Modal ---------- */}
      <Modal
        title="Batch Created"
        open={successModalOpen}
        onCancel={handleSuccessOk}
        footer={[
          <Button key="ok" type="primary" onClick={handleSuccessOk}>
            OK
          </Button>,
        ]}
      >
        <p>✅ The new batch has been created successfully!</p>
      </Modal>
    </div>
  );
};

export default ManagerBatches;
