import React, { useState, useEffect } from "react";
import {
  Button,
  Table,
  message,
  Spin,
  Modal,
  Form,
  InputNumber,
  DatePicker,
} from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import api from "../services/api";
import "./ManagerProjects.css";

const ManagerProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showBatchCreateModal, setShowBatchCreateModal] = useState(false);
  const [selectedProjectForBatch, setSelectedProjectForBatch] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();
  const highlightedProjectId = location.state?.highlightProjectId;

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await api.getManagerProjects();
      setProjects(res.data || []);
    } catch (error) {
      console.error("Error fetching projects:", error);
      message.error("❌ Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBatch = async (values) => {
    try {
      const payload = {
        project_id: selectedProjectForBatch?.job_id,
        count: values.count,
        project_name: selectedProjectForBatch?.title,
        skills_required: selectedProjectForBatch?.skills_required,
        project_type: selectedProjectForBatch?.project_type,
        deadline: values.deadline ? values.deadline.format("YYYY-MM-DD") : null,
      };

      await api.createBatch(payload);
      message.success("✅ Batch created successfully!");
      setShowBatchCreateModal(false);
      fetchProjects();
    } catch (err) {
      console.error(err);
      message.error("❌ Failed to create batch");
    }
  };

  const handleViewProject = (projectId) => {
    navigate(`/manager/projects/${projectId}`);
  };

  const columns = [
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      render: (text, record) => (
        <span
          onClick={() => handleViewProject(record.job_id)}
          style={{
            color: "#1677ff",
            cursor: "pointer",
            textDecoration: "underline",
            fontWeight:
              highlightedProjectId === record.job_id ? "bold" : "normal",
            backgroundColor:
              highlightedProjectId === record.job_id ? "#e6f7ff" : "transparent",
            padding: "2px 4px",
            borderRadius: "4px",
          }}
        >
          {text}
        </span>
      ),
    },
    {
      title: "Type",
      dataIndex: "project_type",
      key: "project_type",
      render: (type) => <span className="type-tag">{type || "—"}</span>,
    },
    {
      title: "Skills Required",
      dataIndex: "skills_required",
      key: "skills_required",
      render: (skills) =>
        Array.isArray(skills) ? skills.join(", ") : skills || "—",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Button
          className="batch-btn"
          type="primary"
          onClick={() => {
            setSelectedProjectForBatch(record);
            setShowBatchCreateModal(true);
          }}
        >
          Create Batch
        </Button>
      ),
    },
  ];

  return (
    <div className="manager-container">
      {/* Header Section */}
      <div className="header-section">
        <h1 className="page-title">📁 Manager Projects</h1>

        <div className="button-group">
          {/* ✅ New "View Invoices" button */}
          <Button
            type="default"
            className="view-invoice-btn"
            onClick={() => navigate("/manager/invoices")}
            style={{ marginRight: "10px", borderColor: "#1677ff", color: "#1677ff" ,backgroundColor: "lightblue", textDecorationColor:"white" }}
          >
            View Invoices
          </Button>

        </div>
      </div>

      {loading ? (
        <div className="loading-section">
          <Spin size="large" />
        </div>
      ) : (
        <Table
          className="projects-table"
          dataSource={projects}
          columns={columns}
          rowKey="job_id"
          bordered
          pagination={{ pageSize: 8 }}
        />
      )}

      {/* Batch Create Modal */}
      <Modal
        title="Create Batch"
        open={showBatchCreateModal}
        onCancel={() => setShowBatchCreateModal(false)}
        footer={null}
      >
        <Form layout="vertical" onFinish={handleCreateBatch}>
          <Form.Item
            label="Number of Tasks"
            name="count"
            rules={[{ required: true, message: "Please enter number of tasks" }]}
          >
            <InputNumber min={1} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item label="Deadline" name="deadline">
            <DatePicker
              style={{ width: "100%" }}
              disabledDate={(d) => d.isBefore(dayjs())}
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Create Batch
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ManagerProjects;
