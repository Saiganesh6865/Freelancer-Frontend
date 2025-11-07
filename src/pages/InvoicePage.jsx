import React, { useState, useEffect, useRef } from "react";
import api from "../services/api";
import "./InvoicePage.css";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const InvoicePage = () => {
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [lineItems, setLineItems] = useState([]);
  const [invoiceId, setInvoiceId] = useState("INV-FREE-001");
  const [issueDate, setIssueDate] = useState(new Date().toISOString().slice(0, 10));
  const [dueDate, setDueDate] = useState("");
  const [clientDetails, setClientDetails] = useState("");
  const [freelancerId, setFreelancerId] = useState(null);
  const [freelancerName, setFreelancerName] = useState("");
  const [formView, setFormView] = useState(true);
  const [loading, setLoading] = useState(false);
  const [backendInvoice, setBackendInvoice] = useState(null);
  const invoiceRef = useRef(null);
  const dropdownRef = useRef(null);

  // ✅ Auto-close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ✅ Load freelancer profile and batches
  useEffect(() => {
    const loadFreelancerData = async () => {
      try {
        setLoading(true);
        console.log("📡 Loading freelancer profile & batches...");

        const [profileRes, batchRes] = await Promise.all([
          api.getFreelancerProfile(),
          api.getMyBatches(),
        ]);

        const profile = profileRes?.data?.data || profileRes?.data;

        if (profile && profile.id) {
          setFreelancerId(profile.id);
          setFreelancerName(profile.full_name || "Freelancer");
          console.log("👤 Freelancer loaded:", profile.full_name, profile.id);
        }

        if (Array.isArray(batchRes?.data) && batchRes.data.length > 0) {
          const mapped = batchRes.data.map((b) => ({
            id: b.job_id || b.batch_id || b.id,
            project_name: b.project_name || b.batch_name || `Batch #${b.id}`,
            project_type: b.project_type || "General",
          }));
          setBatches(mapped);

          if (!selectedBatch && mapped.length > 0) {
            setSelectedBatch(mapped[0].id);
            console.log("✅ Auto-selected first batch:", mapped[0].id);
          }
        } else {
          console.warn("⚠️ No batches found for freelancer.");
        }
      } catch (err) {
        console.error("❌ Error loading freelancer data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadFreelancerData();
  }, []);

  // ✅ Fetch Work Summary once both freelancerId and selectedBatch are ready
  useEffect(() => {
    const fetchWorkSummary = async () => {
      console.group("🧩 Work Summary Debug Logs");
      console.log("Freelancer ID:", freelancerId);
      console.log("Selected Project (Batch):", selectedBatch);

      if (!freelancerId || !selectedBatch) {
        console.warn("⚠️ Waiting for IDs...");
        console.groupEnd();
        return;
      }

      try {
        setLoading(true);
        const res = await api.getFreelancerWorkSummary();
        console.log("📬 Raw API Response:", res);

        const summaries = res?.data || [];
        const filteredSummaries = summaries.filter(
          (s) => String(s.project_id) === String(selectedBatch)
        );

        const mapped =
          filteredSummaries.flatMap((summary) =>
            (summary.tasks || []).map((task) => {
              const isAnnotation =
                summary.project_type?.toLowerCase() === "annotation";
              const qty = isAnnotation ? task.count || 0 : task.hours || 0;
              const rate = Number(task.rate) || 0;
              const amount = qty * rate;

              return {
                project_id: summary.project_id,
                project_title: summary.project_title || "Untitled Project",
                description: task.description || "",
                rate,
                hours: isAnnotation ? 0 : qty,
                count: isAnnotation ? qty : 0,
                amount,
                project_type: summary.project_type || "",
              };
            })
          ) || [];

        setLineItems(mapped);
      } catch (err) {
        console.error("❌ Error fetching work summary:", err);
        setLineItems([]);
      } finally {
        setLoading(false);
        console.groupEnd();
      }
    };

    if (freelancerId && selectedBatch) fetchWorkSummary();
  }, [freelancerId, selectedBatch]);

  const updateLineItem = (index, field, value) => {
    const updated = [...lineItems];
    updated[index][field] = value;
    if (["hours", "count", "rate"].includes(field)) {
      const qty = updated[index].count || updated[index].hours || 0;
      updated[index].amount = qty * (updated[index].rate || 0);
    }
    setLineItems(updated);
  };

  const removeLineItem = (index) => {
    const updated = [...lineItems];
    updated.splice(index, 1);
    setLineItems(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!invoiceId || !issueDate || !dueDate || !clientDetails) {
      alert("Please fill all required fields.");
      return;
    }

    const payload = {
      invoice_id: invoiceId,
      issue_date: issueDate,
      due_date: dueDate,
      client_details: clientDetails,
      line_items: lineItems,
      project_id: parseInt(selectedBatch),
      freelancer_id: parseInt(freelancerId),
      total_amount: lineItems.reduce((sum, i) => sum + (i.amount || 0), 0),
    };

    try {
      setLoading(true);
      const response = await api.createInvoice(payload);
      if (response?.success || response?.data?.success) {
        setBackendInvoice(response.data?.data || payload);
        setFormView(false);
        alert("✅ Invoice created successfully!");
      } else {
        alert(`❌ Failed to create invoice`);
      }
    } catch (err) {
      console.error("Error creating invoice:", err);
    } finally {
      setLoading(false);
    }
  };

  const totalAmount = lineItems.reduce((sum, i) => sum + (i.amount || 0), 0);
  const batch = batches.find((b) => b.id === parseInt(selectedBatch));
  const isAnnotation =
    lineItems[0]?.project_type?.toLowerCase() === "annotation" ||
    batch?.project_type?.toLowerCase() === "annotation";

  return (
    <div className="container">
      {formView ? (
        <>
          <h1>Create New Invoice</h1>
          <form onSubmit={handleSubmit}>
            <div className="grid-3">
              <div className="form-group">
                <label>Invoice ID</label>
                <input
                  value={invoiceId}
                  onChange={(e) => setInvoiceId(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Issue Date</label>
                <ReactDatePicker
                  selected={issueDate ? new Date(issueDate) : null}
                  onChange={(date) => setIssueDate(date.toISOString().slice(0, 10))}
                  dateFormat="dd-MM-yyyy"
                  placeholderText="Select issue date"
                  className="date-picker-input"
                  popperPlacement="bottom-start"
                  popperClassName="date-picker-popper"
                  portalId="root-portal" // ✅ ensures calendar renders outside container
                  popperModifiers={[
                    {
                      name: "flip",
                      options: {
                        fallbackPlacements: ["top-start"],
                        rootBoundary: "viewport",
                      },
                    },
                    {
                      name: "preventOverflow",
                      options: {
                        boundary: "viewport",
                      },
                    },
                    {
                      name: "offset",
                      options: {
                        offset: [0, 8], // adds gap between input & calendar
                      },
                    },
                  ]}
                />
              </div>

              <div className="form-group">
                <label>Due Date</label>
                <ReactDatePicker
                  selected={issueDate ? new Date(issueDate) : null}
                  onChange={(date) => setIssueDate(date.toISOString().slice(0, 10))}
                  dateFormat="dd-MM-yyyy"
                  placeholderText="Select issue date"
                  className="date-picker-input"
                  popperPlacement="bottom-start"
                  popperClassName="date-picker-popper"
                  portalId="root-portal"
                  shouldCloseOnScroll={false} // ✅ prevents scroll closing
                  showPopperArrow={false} // ✅ remove unnecessary arrow
                  popperModifiers={[
                    {
                      name: "flip",
                      enabled: true,
                      options: {
                        fallbackPlacements: ["top-start", "bottom-start"], // ✅ auto-flip based on space
                        rootBoundary: "viewport",
                      },
                    },
                    {
                      name: "preventOverflow",
                      options: {
                        boundary: "viewport", // ✅ keeps it inside visible screen
                        altAxis: true,
                      },
                    },
                    {
                      name: "offset",
                      options: {
                        offset: [0, 10], // ✅ adds nice spacing
                      },
                    },
                  ]}
                />

              </div>

            </div>

            {/* ✅ Custom Responsive Dropdown */}
            <div className="form-group" ref={dropdownRef}>
              <label>Select Project</label>
              <div
                className="custom-dropdown"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <div className="dropdown-selected">
                  {batches.find((b) => b.id === Number(selectedBatch))
                    ?.project_name || "Select Project"}
                </div>

                {dropdownOpen && (
                  <ul className="dropdown-options">
                    {batches.map((b) => (
                      <li
                        key={b.id}
                        onClick={() => {
                          setSelectedBatch(b.id);
                          setDropdownOpen(false);
                        }}
                      >
                        {b.project_name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <div className="form-group">
              <label>Client Details (Billed To)</label>
              <textarea
                value={clientDetails}
                onChange={(e) => setClientDetails(e.target.value)}
                placeholder="Enter client name, address, contact info"
              />
            </div>

            <h2>Work Summary</h2>
            <div className="table-responsive">
              <table className="work-table">
                <thead>
                  <tr>
                    <th>Project Title</th>
                    <th>Description</th>
                    <th>Rate (₹)</th>
                    <th>{isAnnotation ? "Count" : "Hours"}</th>
                    <th>Amount (₹)</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {lineItems.map((item, idx) => (
                    <tr key={idx}>
                      <td>{item.project_title}</td>
                      <td>
                        <input
                          type="text"
                          value={item.description || ""}
                          onChange={(e) =>
                            updateLineItem(idx, "description", e.target.value)
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          value={item.rate || ""}
                          onChange={(e) =>
                            updateLineItem(idx, "rate", e.target.value)
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          value={
                            isAnnotation ? item.count || "" : item.hours || ""
                          }
                          onChange={(e) =>
                            updateLineItem(
                              idx,
                              isAnnotation ? "count" : "hours",
                              e.target.value
                            )
                          }
                        />
                      </td>
                      <td>{item.amount || 0}</td>
                      <td>
                        <button type="button" onClick={() => removeLineItem(idx)}>
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {lineItems.length > 0 && (
              <div className="total-summary">
                <strong>Total: ₹{totalAmount}</strong>
              </div>
            )}

            <div className="action-bar edit-actions">
              <button type="submit" disabled={loading}>
                {loading ? "Generating..." : "Generate Final Invoice"}
              </button>
            </div>
          </form>
        </>
      ) : (
        <div ref={invoiceRef} className="invoice-preview">
          {/* === Company Header === */}
          <div className="invoice-header">
            <div>
              <h1>Han Digital Solutions</h1>
              <p>
                #45, 2nd Floor, MG Road, Bengaluru, Karnataka - 560001<br />
                Phone: +91 98765 43210 | Email: info@handigital.com<br />
                GSTIN: 29AAACH1234F1ZQ
              </p>
            </div>
            <div className="invoice-meta">
              <h2>INVOICE</h2>
              <p><strong>Invoice ID:</strong> {invoiceId}</p>
              <p><strong>Issue Date:</strong> {issueDate}</p>
              <p><strong>Due Date:</strong> {dueDate}</p>
            </div>
          </div>

          <div className="billed-to">
            <h3>Billed To:</h3>
            <div className="billed-to-box">{clientDetails}</div>
          </div>

          <h2 className="section-heading">Freelancer Information</h2>
          <p><strong>Name:</strong> {freelancerName}</p>
          <p><strong>ID:</strong> {freelancerId}</p>

          <h2 className="section-heading">Work Summary</h2>
          <table className="preview-table">
            <thead>
              <tr>
                <th>Project</th>
                <th>Description</th>
                <th>Rate (₹)</th>
                <th>{isAnnotation ? "Count" : "Hours"}</th>
                <th>Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              {lineItems.map((item, idx) => (
                <tr key={idx}>
                  <td>{item.project_title}</td>
                  <td>{item.description}</td>
                  <td>₹{item.rate}</td>
                  <td>{isAnnotation ? item.count : item.hours}</td>
                  <td>₹{item.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="invoice-box">
            <strong>Total Amount: ₹{backendInvoice?.total_amount || totalAmount}</strong>
          </div>

          <footer>
            <hr />
            <p>#45, 2nd Floor, MG Road, Bengaluru, Karnataka - 560001</p>
            <p>Phone: +91 98765 43210 | Email: info@handigital.com</p>
            <p className="invoice-note">
              This is a system-generated invoice. No signature required.<br />
              Thank you for your continued collaboration.
            </p>
          </footer>

          <div className="action-bar edit-actions no-print">
            <button onClick={() => setFormView(true)}>← Edit</button>
            <button onClick={() => window.print()}>🖨️ Print</button>
            <button
              className="button-secondary"
              onClick={() => window.history.back()}
            >
              ⬅ Back
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoicePage;
