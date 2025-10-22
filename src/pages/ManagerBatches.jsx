import React, { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Input, Select, message, Spin, DatePicker } from "antd";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import api from "../services/api";
import "./ManagerBatches.css";

const { Option } = Select;

const ManagerBatches = () => {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [freelancers, setFreelancers] = useState([]);

  const [form] = Form.useForm();
  const [assignForm] = Form.useForm();
  const navigate = useNavigate();

  useEffect(() => {
    fetchBatches();
  }, []);

  // Fetch and normalize batch data
// Fetch and normalize batch data
  const fetchBatches = async () => {
    try {
      setLoading(true);
      const res = await api.getManagerBatches();
      const normalized = (res.data || []).map((b) => {
        // Split team_members string into array, remove empty or whitespace-only entries
        const membersArray = b.team_members
          ? b.team_members.split(",").map((m) => m.trim()).filter(Boolean)
          : [];

        return {
          batch_id: b.id,
          project_id: b.job_id,
          project_name: b.project_name,
          project_type: b.project_type,
          skills_required: b.skills_required,
          count: b.count,
          deadline: b.deadline ? dayjs(b.deadline) : null,
          members: membersArray,
          created_at: b.created_at,
        };
      });
      setBatches(normalized);
    } catch (error) {
      console.error("Error fetching batches:", error);
      message.error("Failed to load batches");
    } finally {
      setLoading(false);
    }
  };



  // Create new batch
  const handleCreateBatch = async (values) => {
    if (!values.project_id) {
      message.error("Please select a project for the batch!");
      return;
    }

    try {
      const payload = {
        project_id: values.project_id,
        count: values.count,
        deadline: values.deadline ? values.deadline.format("YYYY-MM-DD") : null,
      };
      await api.createBatch(payload);
      message.success("✅ Batch created successfully!");
      setShowCreateModal(false);
      form.resetFields();
      fetchBatches();
    } catch (err) {
      console.error("Error creating batch:", err);
      message.error("❌ Failed to create batch");
    }
  };

  // Fetch available freelancers for assignment
  const fetchFreelancers = async () => {
    try {
      const res = await api.getManagerFreelancers();
      setFreelancers(res.data || []);
    } catch (err) {
      console.error("Error fetching freelancers:", err);
      message.error("Failed to load freelancers");
    }
  };

  // Assign freelancer to batch
  const handleAssignFreelancer = async (values) => {
    try {
      const payload = {
        batch_id: selectedBatch.batch_id,
        freelancer_id: values.freelancer_id,
      };
      await api.assignFreelancerToProject(payload);
      message.success("✅ Freelancer assigned successfully!");
      setShowAssignModal(false);
      assignForm.resetFields();
      fetchBatches();
    } catch (err) {
      console.error("Error assigning freelancer:", err);
      message.error("❌ Failed to assign freelancer");
    }
  };

  // Table columns
  const columns = [
    { title: "Batch ID", dataIndex: "batch_id", key: "batch_id" },
    { title: "Project ID", dataIndex: "project_id", key: "project_id" },
    {
      title: "Project Name",
      dataIndex: "project_name",
      key: "project_name",
      render: (text, record) => (
        <Button
          type="link"
          onClick={() =>
            navigate("/manager/projects", {
              state: { highlightProjectId: record.project_id },
            })
          }
          style={{ fontWeight: "bold" }}
        >
          {text}
        </Button>
      ),
    },
    { title: "Type", dataIndex: "project_type", key: "project_type" },
    {
      title: "Skills Required",
      dataIndex: "skills_required",
      key: "skills_required",
    },
    { title: "Count", dataIndex: "count", key: "count" },
    {
      title: "Deadline",
      dataIndex: "deadline",
      key: "deadline",
      render: (date) => {
        if (!date) return "—"; // No deadline set

        const isOverdue = dayjs(date).isBefore(dayjs(), "day"); // Compare with today
        return (
          <span style={{ color: isOverdue ? "red" : "inherit", fontWeight: isOverdue ? "bold" : "normal" }}>
            {dayjs(date).format("DD/MM/YYYY")}
          </span>
        );
      },
    },


    {
      title: "Members",
      dataIndex: "members",
      key: "members",
      render: (members) => (members && members.length > 0 ? members.join(", ") : "—"),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Button
          style={{ marginRight: "0.5rem" }}
          onClick={() => {
            setSelectedBatch(record);
            fetchFreelancers();
            setShowAssignModal(true);
          }}
        >
          Assign Freelancer
        </Button>
      ),
    },
  ];

  return (
    <div className="manager-batches">
      <h2>Manager Batches</h2>

      <Button
        type="primary"
        onClick={() => {
          setSelectedBatch(null);
          setShowCreateModal(true);
        }}
        style={{
          marginBottom: "0.5rem",
          marginTop: "0.5rem",
          paddingLeft: "1rem",
          paddingRight: "1rem",
        }}
      >
        + Create Batch
      </Button>

      <Spin spinning={loading}>
        <Table dataSource={batches} columns={columns} rowKey="batch_id" pagination={{ pageSize: 8 }} />
      </Spin>

      {/* Create Batch Modal */}
      <Modal
        title="Create New Batch"
        open={showCreateModal}
        onCancel={() => setShowCreateModal(false)}
        footer={null}
      >
        <Form
          layout="vertical"
          form={form}
          onFinish={handleCreateBatch}
          initialValues={{
            project_id: selectedBatch?.project_id || undefined,
          }}
        >
          <Form.Item
            label="Select Project"
            name="project_id"
            rules={[{ required: true, message: "Please select a project!" }]}
          >
            <Select placeholder="Choose a project">
              {batches.map((b, index) => (
                <Option key={`${b.project_id}-${index}`} value={b.project_id}>
                  {b.project_name} (ID: {b.project_id})
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Batch Count"
            name="count"
            rules={[{ required: true, message: "Enter batch count" }]}
          >
            <Input placeholder="Enter number of tasks or items" />
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

      {/* Assign Freelancer Modal */}
      <Modal
        title={`Assign Freelancer to Batch ${selectedBatch?.batch_id || ""}`}
        open={showAssignModal}
        onCancel={() => setShowAssignModal(false)}
        footer={null}
      >
        <Form layout="vertical" form={assignForm} onFinish={handleAssignFreelancer}>
          <Form.Item
            label="Select Freelancer"
            name="freelancer_id"
            rules={[{ required: true }]}
          >
            <Select placeholder="Choose a freelancer">
              {freelancers.map((f) => (
                <Option key={f.id} value={f.id}>
                  {f.name || f.email || `Freelancer ${f.id}`}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Assign
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ManagerBatches;
