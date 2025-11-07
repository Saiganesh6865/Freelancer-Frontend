import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { message } from "antd";
import api from "../services/api";
import "./ManagerInvoiceDetailsPage.css";

const ManagerInvoiceDetailsPage = () => {
  const { invoiceId } = useParams();
  const [invoice, setInvoice] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const navigate = useNavigate();

  React.useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const res = await api.getManagerInvoiceById(invoiceId);
        if (res?.success && res?.data) {
          setInvoice(res.data);
        } else {
          console.error("Failed to fetch invoice:", res?.message);
        }
      } catch (err) {
        console.error("Error fetching invoice:", err);
      }
    };
    fetchInvoice();
  }, [invoiceId]);

  const handleStatusChange = async (newStatus) => {
    if (!invoice) return;
    setLoading(true);
    try {
      const res = await api.updateInvoiceStatus(invoice.invoice_id, newStatus);
      if (res?.success) {
        message.success(`Invoice ${newStatus.toLowerCase()} successfully`);
        setInvoice({ ...invoice, status: newStatus });
      } else {
        message.error(res?.message || "Failed to update status");
      }
    } catch (err) {
      console.error("Error updating status:", err);
      message.error("Error updating status");
    } finally {
      setLoading(false);
    }
  };

  if (!invoice)
    return <div className="invoice-loader">Loading invoice details...</div>;

  return (
    <div className="invoice-details-container">
      <div className="invoice-header">
        <h2>🧾 Invoice Details</h2>

        {invoice.status === "Pending" && (
          <div className="invoice-actions">
            <button
              className="accept-btn"
              onClick={() => handleStatusChange("Processed")}
              disabled={loading}
            >
              ✅ Processed
            </button>
            <button
              className="reject-btn"
              onClick={() => handleStatusChange("Rejected")}
              disabled={loading}
            >
              ❌ Reject
            </button>
          </div>
        )}
      </div>

      <div className="invoice-meta">
        <p><strong>Invoice ID:</strong> {invoice.invoice_id}</p>
        <p><strong>Client:</strong> {invoice.client_details?.trim() || "—"}</p>
        <p><strong>Project Type:</strong> {invoice.project_type}</p>
        <p><strong>Issue Date:</strong> {new Date(invoice.issue_date).toLocaleDateString("en-IN")}</p>
        <p><strong>Due Date:</strong> {new Date(invoice.due_date).toLocaleDateString("en-IN")}</p>
        <p><strong>Subtotal:</strong> ₹{invoice.subtotal?.toLocaleString("en-IN")}</p>
        <p><strong>Total Due:</strong> ₹{invoice.total_due?.toLocaleString("en-IN")}</p>
        <p>
          <strong>Status:</strong>{" "}
          <span className={`status-text status-${invoice.status?.toLowerCase()}`}>
            {invoice.status}
          </span>
        </p>

      </div>

      <h3>🧩 Line Items</h3>
      <table className="line-items-table">
        <thead>
          <tr>
            <th>Description</th>
            <th>Hours</th>
            <th>Rate (₹)</th>
            <th>Count</th>
            <th>Amount (₹)</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items?.length > 0 ? (
            invoice.items.map((item, index) => (
              <tr key={index}>
                <td>{item.description}</td>
                <td>{item.hours}</td>
                <td>{item.rate}</td>
                <td>{item.count}</td>
                <td>{item.amount}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" style={{ textAlign: "center" }}>
                No line items found.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <button onClick={() => navigate(-1)} className="back-btn">
        ← Back
      </button>
    </div>
  );
};

export default ManagerInvoiceDetailsPage;
