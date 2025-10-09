import React, { useState, useEffect } from "react";
import { Table, message, Spin, Modal, Button } from "antd";
import api from "../services/api";
import "./ManagerBatches.css";

const ManagerBatches = () => {
  const [batches, setBatches] = useState([]);
  const [projects, setProjects] = useState([]);
  const [freelancers, setFreelancers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const [batchesRes, projectsRes, freelancersRes] = await Promise.all([
        api.getManagerBatches(),
        api.getManagerProjects(),
        api.getManagerFreelancers(),
      ]);

      setBatches(batchesRes?.data || []);
      setProjects(projectsRes?.data || []);
      setFreelancers(freelancersRes?.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to load batches data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "Batch ID",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Project Name",
      dataIndex: "project_name",
      key: "project_name",
    },
    {
      title: "Project Type",
      dataIndex: "project_type",
      key: "project_type",
    },
    {
      title: "Skills Required",
      dataIndex: "skills_required",
      key: "skills_required",
    },
    {
      title: "Members",
      dataIndex: "members",
      key: "members",
      render: (members) =>
        members && members.length > 0 ? (
          members.map((member, index) => (
            <span key={index} className="member-tag">
              {member}
            </span>
          ))
        ) : (
          <span className="text-muted">No members assigned</span>
        ),
    },
    {
      title: "Count",
      dataIndex: "count",
      key: "count",
    },
    {
      title: "Created At",
      dataIndex: "created_at",
      key: "created_at",
      render: (date) => new Date(date).toLocaleString(),
    },
  ];

  return (
    <div className="batches-container">
      <div className="batches-header">
        <h2>Manager Batches</h2>
        <Button
          type="primary"
          onClick={() => setShowCreateModal(true)}
        >
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

      <Modal
        title="Create New Batch"
        visible={showCreateModal}
        onCancel={() => setShowCreateModal(false)}
        footer={null}
      >
        <p>Batch creation form will go here.</p>
      </Modal>
    </div>
  );
};

export default ManagerBatches;
