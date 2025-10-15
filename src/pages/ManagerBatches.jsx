import React, { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Input, Select, message, Spin } from "antd";
import { useNavigate } from "react-router-dom";
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

  const fetchBatches = async () => {
    try {
      setLoading(true);
      const res = await api.getManagerBatches();
      const normalized = (res.data || []).map((b) => ({
        batch_id: b.id,
        project_id: b.job_id,
        project_name: b.project_name,
        project_type: b.project_type,
        skills_required: b.skills_required,
        count: b.count,
        members: b.members || [],
        created_at: b.created_at,
      }));
      setBatches(normalized);
    } catch (error) {
      console.error("Error fetching batches:", error);
      message.error("Failed to load batches");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBatch = async (values) => {
    if (!values.project_id) {
      message.error("Please select a project for the batch!");
      return;
    }

    try {
      const payload = {
        project_id: values.project_id,
        count: values.count,
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

  const handleUpdateBatch = async (batch_id, values) => {
    try {
      const payload = {
        project_id: values.project_id,
        count: values.count,
      };
      await api.updateBatch(batch_id, payload); // API endpoint for updating batch
      message.success("✅ Batch updated successfully!");
      setShowCreateModal(false);
      setSelectedBatch(null);
      form.resetFields();
      fetchBatches();
    } catch (err) {
      console.error("Error updating batch:", err);
      message.error("❌ Failed to update batch");
    }
  };

  const fetchFreelancers = async () => {
    try {
      const res = await api.getManagerFreelancers();
      setFreelancers(res.data || []);
    } catch (err) {
      console.error("Error fetching freelancers:", err);
      message.error("Failed to load freelancers");
    }
  };

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
    { title: "Skills Required", dataIndex: "skills_required", key: "skills_required" },
    { title: "Count", dataIndex: "count", key: "count" },
    {
      title: "Members",
      dataIndex: "members",
      key: "members",
      render: (members) => members.join(", ") || "—",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <>
          {/* View/Edit Button */}
          <Button
            type="default"
            style={{ marginRight: "0.5rem" }}
            onClick={() => {
              setSelectedBatch(record);
              form.setFieldsValue({
                project_id: record.project_id,
                count: record.count,
              });
              setShowCreateModal(true);
            }}
          >
            View/Edit
          </Button>

          {/* Assign Freelancer Button */}
          <Button
            type="primary"
            onClick={() => {
              setSelectedBatch(record);
              fetchFreelancers();
              setShowAssignModal(true);
            }}
          >
            Assign Freelancer
          </Button>
        </>
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
          form.resetFields();
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
        <Table
          dataSource={batches}
          columns={columns}
          rowKey="batch_id"
          pagination={{ pageSize: 8 }}
        />
      </Spin>

      {/* Create/Edit Batch Modal */}
      <Modal
        title={selectedBatch ? `Edit Batch ${selectedBatch.batch_id}` : "Create New Batch"}
        open={showCreateModal}
        onCancel={() => setShowCreateModal(false)}
        footer={null}
      >
        <Form
          layout="vertical"
          form={form}
          onFinish={(values) => {
            if (selectedBatch) {
              handleUpdateBatch(selectedBatch.batch_id, values);
            } else {
              handleCreateBatch(values);
            }
          }}
        >
          <Form.Item
            label="Select Project"
            name="project_id"
            rules={[{ required: true, message: "Please select a project for the batch!" }]}
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
            <Input placeholder="Enter number of freelancers or tasks" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              {selectedBatch ? "Update Batch" : "Create Batch"}
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
