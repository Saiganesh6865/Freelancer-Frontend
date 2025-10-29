import React, { useState, useEffect } from "react";
import { Button, Table, message, Spin, Form, InputNumber, Modal, DatePicker } from "antd";
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
  const highlightedProjectId = location.state?.highlightProjectId; // from Batches link

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
      message.error("Failed to load projects");
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
        deadline: values.deadline ? values.deadline.format("YYYY-MM-DD") : null, // ✅ add deadline
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

  const columns = [
    {
      title: "Project ID",
      dataIndex: "job_id",
      key: "job_id",
    },
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      render: (text, record) => (
        <span
          style={{
            fontWeight: highlightedProjectId === record.job_id ? "bold" : "normal",
            backgroundColor: highlightedProjectId === record.job_id ? "#fff7e6" : "transparent",
            padding: highlightedProjectId === record.job_id ? "2px 6px" : 0,
            borderRadius: "4px",
            display: "inline-block",
            color: "#1890ff",
            cursor: "pointer",
          }}
          onClick={() => navigate(`/manager/projects/${record.job_id}`)}
        >
          {text}
        </span>
      ),
    },
    {
      title: "Type",
      dataIndex: "project_type",
      key: "project_type",
    },
    {
      title: "Skills Required",
      dataIndex: "skills_required",
      key: "skills_required",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Button
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
    <div className="manager-projects">
      <h2>Manager Projects</h2>
      <Spin spinning={loading}>
        <Table
          dataSource={projects}
          columns={columns}
          rowKey="job_id"
          pagination={{ pageSize: 8 }}
          rowClassName={(record) =>
            highlightedProjectId === record.job_id ? "highlighted-row" : ""
          }
        />
      </Spin>

      {/* Create Batch Modal */}
      <Modal
        title={`Create Batch for Project: ${selectedProjectForBatch?.title || ""}`}
        open={showBatchCreateModal}
        onCancel={() => setShowBatchCreateModal(false)}
        footer={null}
        destroyOnHidden
      >
        <Form layout="vertical" onFinish={handleCreateBatch}>
          <Form.Item
            label="Batch Count"
            name="count"
            rules={[{ required: true, message: "Please enter batch count" }]}
          >
            <InputNumber min={1} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item label="Deadline" name="deadline">
            <DatePicker
              style={{ width: "100%" }}
              disabledDate={(current) => current && current < dayjs().startOf('day')} // disable past dates
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
