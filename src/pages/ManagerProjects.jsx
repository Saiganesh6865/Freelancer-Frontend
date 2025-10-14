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
  const [assignedFreelancers, setAssignedFreelancers] = useState([]); // store assigned IDs
  const [loading, setLoading] = useState(false);
  const [assignModalVisible, setAssignModalVisible] = useState(false);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [viewProject, setViewProject] = useState(null);

  // Fetch all data
  const fetchData = async () => {
    try {
      setLoading(true);
      const [projectsResp, freelancersResp, batchesResp] = await Promise.all([
        api.getManagerProjects(),
        api.getManagerFreelancers(),
        api.getManagerBatches(),
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

  // Open modal
  const openAssignModal = (project) => {
    setSelectedProject(project);
    setAssignModalVisible(true);
    setSelectedBatch(null);
    setSelectedFreelancers([]);
    setAssignedFreelancers([]);
  };

  // When batch selected
  const handleBatchChange = (batchId) => {
    setSelectedBatch(batchId);
    const batch = batches.find((b) => b.id === batchId);
    if (batch && batch.tasks && batch.tasks.length > 0) {
      const assignedIds = batch.tasks
        .filter((t) => t.assigned_to)
        .map((t) => t.assigned_to);
      setAssignedFreelancers(assignedIds);
      setSelectedFreelancers([]); // fresh selection
    } else {
      setAssignedFreelancers([]);
      setSelectedFreelancers([]);
    }
  };

  // Assign freelancers
  const handleAssign = async () => {
    if (!selectedBatch || selectedFreelancers.length === 0) {
      message.warning("Please select a batch and freelancers");
      return;
    }

    try {
      setLoading(true);
      await api.assignFreelancerToProject({
        batch_id: selectedBatch,
        freelancer_ids: selectedFreelancers,
      });

      message.success("Freelancers assigned successfully");
      setAssignModalVisible(false);
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
            onClick={() => openAssignModal(record)}
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
      ),
    },
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
          rowKey="job_id"
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
        {/* 🔹 Batch Select */}
        <Select
          placeholder="Select Batch (ID only)"
          style={{ width: "100%", marginBottom: "1rem" }}
          value={selectedBatch}
          onChange={setSelectedBatch}
        >
          {batches
            .filter((b) => b.job_id === selectedProject?.job_id)
            .map((b) => (
              <Option key={b.id} value={b.id}>
                Batch {b.id}
              </Option>
            ))}
        </Select>

        {/* If no batch is selected, show message */}
        {!selectedBatch && <p style={{ color: "gray" }}>Select a batch to see freelancers</p>}

        {selectedBatch && (() => {
          // find the batch for this project
          const selectedBatchObj = batches.find((b) => b.id === selectedBatch);
          const assignedNames = selectedBatchObj?.members || [];

          // match usernames to freelancer IDs
          const assignedIds = freelancers
            .filter((f) => assignedNames.includes(f.username))
            .map((f) => f.id);

          const availableFreelancers = freelancers.filter(
            (f) => !assignedIds.includes(f.id)
          );

          const unavailableFreelancers = freelancers.filter((f) =>
            assignedIds.includes(f.id)
          );

          return (
            <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
              {/* ✅ Available */}
              <div style={{ flex: 1 }}>
                <h4>Available</h4>
                <Select
                  mode="multiple"
                  style={{ width: "100%" }}
                  placeholder="Select Available Freelancers"
                  value={selectedFreelancers}
                  onChange={setSelectedFreelancers}
                >
                  {availableFreelancers.map((f) => (
                    <Option key={f.id} value={f.id}>
                      {f.username} — ID {f.id}
                    </Option>
                  ))}
                </Select>
              </div>

              {/* ❌ Unavailable */}
              <div style={{ flex: 1 }}>
                <h4>Unavailable (Already Assigned)</h4>
                <Select
                  mode="multiple"
                  style={{ width: "100%" }}
                  value={unavailableFreelancers.map((f) => f.id)}
                  disabled
                >
                  {unavailableFreelancers.map((f) => (
                    <Option
                      key={f.id}
                      value={f.id}
                      style={{ color: "#888" }}
                    >
                      {f.username} — ID {f.id}
                    </Option>
                  ))}
                </Select>
              </div>
            </div>
          );
        })()}
      </Modal>


      {/* View Project Modal */}
      <Modal
        title="Project Details"
        open={viewModalVisible}
        onCancel={() => setViewModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setViewModalVisible(false)}>
            Close
          </Button>,
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
