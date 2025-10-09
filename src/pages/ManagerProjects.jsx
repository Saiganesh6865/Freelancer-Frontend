import React, { useState, useEffect } from "react";
import { Button, Modal, Table, Select, message, Spin } from "antd";
import api from "../services/api";
import "./ManagerProjects.css";

const { Option } = Select;

const ManagerProjects = () => {
  const [projects, setProjects] = useState([]);
  const [freelancers, setFreelancers] = useState([]);
  const [batches, setBatches] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [selectedFreelancers, setSelectedFreelancers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [assignModalVisible, setAssignModalVisible] = useState(false);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [viewProject, setViewProject] = useState(null);

  // Fetch all manager data
  const fetchData = async () => {
    try {
      setLoading(true);

      const [projectsResp, freelancersResp, batchesResp] = await Promise.all([
        api.getManagerProjects(),
        api.getManagerFreelancers(),
        api.getManagerBatches()
      ]);

      setProjects(projectsResp?.data || []);
      setFreelancers(freelancersResp?.data || []);
      setBatches(batchesResp?.data || []);
    } catch (err) {
      console.error("Failed to load manager data:", err);
      message.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Assign freelancers to batch
  const handleAssign = async () => {
    if (!selectedBatch || selectedFreelancers.length === 0) {
      message.warning("Please select batch and freelancers");
      return;
    }
    try {
      setLoading(true);
      await api.assignFreelancersToBatch(selectedBatch, selectedFreelancers);
      message.success("Freelancers assigned successfully");
      setAssignModalVisible(false);
      setSelectedBatch(null);
      setSelectedFreelancers([]);
      fetchData();
    } catch (err) {
      console.error(err);
      message.error("Assignment failed");
    } finally {
      setLoading(false);
    }
  };

  // Table columns
  const columns = [
    { title: "Project ID", dataIndex: "job_id", key: "job_id" },
    { title: "Title", dataIndex: "title", key: "title" },
    { title: "Description", dataIndex: "description", key: "description" },
    { title: "Skills Required", dataIndex: "skills_required", key: "skills_required" },
    { title: "Status", dataIndex: "status", key: "status" },
    { title: "Created At", dataIndex: "created_at", key: "created_at" },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <>
          <Button
            type="primary"
            style={{ marginRight: "0.5rem" }}
            onClick={() => {
              setSelectedProject(record);
              setAssignModalVisible(true);
            }}
          >
            Assign
          </Button>
          <Button
            onClick={() => {
              setViewProject(record);
              setViewModalVisible(true);
            }}
          >
            View
          </Button>
        </>
      )
    }
  ];

  return (
    <div className="manager-container">
      <h2>Manager Projects</h2>
      {loading ? (
        <Spin size="large" />
      ) : (
        <Table
          dataSource={projects}
          columns={columns}
          rowKey="job_id"  // ✅ use job_id not id
          bordered
          className="custom-table"
          pagination={{ pageSize: 15 }}
          rowClassName={(record, index) =>
            index % 2 === 0 ? "even-row" : "odd-row"
          }
        />
      )}

      {/* Assign Modal */}
      <Modal
        title={`Assign Freelancers to Project: ${selectedProject?.title || ""}`}
        open={assignModalVisible}
        onCancel={() => setAssignModalVisible(false)}
        onOk={handleAssign}
      >
        <Select
          placeholder="Select Batch"
          style={{ width: "100%", marginBottom: "1rem" }}
          value={selectedBatch}
          onChange={setSelectedBatch}
        >
          {batches.map((batch) => (
            <Option key={batch.id} value={batch.id}>
              {batch.name}
            </Option>
          ))}
        </Select>

        <Select
          mode="multiple"
          placeholder="Select Freelancers"
          style={{ width: "100%" }}
          value={selectedFreelancers}
          onChange={setSelectedFreelancers}
        >
          {freelancers.map((f) => (
            <Option key={f.id} value={f.id}>
              {f.name}
            </Option>
          ))}
        </Select>
      </Modal>

      {/* View Project Modal */}
      <Modal
        title="Project Details"
        open={viewModalVisible}
        onCancel={() => setViewModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setViewModalVisible(false)}>
            Close
          </Button>
        ]}
      >
        {viewProject && (
          <div>
            <p><strong>ID:</strong> {viewProject.job_id}</p>
            <p><strong>Title:</strong> {viewProject.title}</p>
            <p><strong>Description:</strong> {viewProject.description}</p>
            <p><strong>Skills Required:</strong> {viewProject.skills_required}</p>
            <p><strong>Status:</strong> {viewProject.status}</p>
            <p><strong>Created At:</strong> {viewProject.created_at}</p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ManagerProjects;
