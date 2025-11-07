import React, { useEffect, useState } from "react";
import api from "../services/api";
import "./FreelancerInvoicesPage.css";

const FreelancerInvoicesPage = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 7;

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const res = await api.getMyInvoices();
        if (res.success) setInvoices(res.data || []);
        else setError(res.message || "Failed to fetch invoices.");
      } catch (err) {
        console.error("Error fetching invoices:", err);
        setError("Error fetching invoices");
      } finally {
        setLoading(false);
      }
    };
    fetchInvoices();
  }, []);

  const totalPages = Math.ceil(invoices.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentInvoices = invoices.slice(startIndex, startIndex + rowsPerPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  if (loading) return <div className="loading">Loading invoices...</div>;
  if (error || invoices.length === 0)
    return <div className="empty-state">{error || "No invoices found."}</div>;

  const renderStatus = (status) => {
    const normalized = (status || "").trim().toLowerCase();
    const statusClassMap = {
      pending: "status-pending",
      processed: "status-processed",
      paid: "status-paid",
    };
    const badgeClass = statusClassMap[normalized] || "status-default";
    return (
      <span className={`status-badge ${badgeClass}`}>
        {status ? status.charAt(0).toUpperCase() + status.slice(1) : "N/A"}
      </span>
    );
  };

  // ✅ Generate visible page numbers
  const renderPageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(
        <button
          key={i}
          className={`page-btn-number ${currentPage === i ? "active" : ""}`}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </button>
      );
    }
    return pages;
  };

  return (
    <div className="freelancer-invoice-wrapper">
      <div className="invoice-card">
        <h2 className="invoice-title">My Invoice Details</h2>

        <div className="table-container">
          <table className="invoice-table">
            <thead>
              <tr>
                <th>Invoice ID</th>
                <th>Client</th>
                <th>Project Type</th>
                <th>Issue Date</th>
                <th>Due Date</th>
                <th>Subtotal</th>
                <th>Total Due</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {currentInvoices.map((invoice) => (
                <tr key={invoice.id}>
                  <td>{invoice.invoice_id}</td>
                  <td>{invoice.client_details || "N/A"}</td>
                  <td>{invoice.project_type || "N/A"}</td>
                  <td>
                    {invoice.issue_date
                      ? new Date(invoice.issue_date).toLocaleDateString()
                      : "N/A"}
                  </td>
                  <td>
                    {invoice.due_date
                      ? new Date(invoice.due_date).toLocaleDateString()
                      : "N/A"}
                  </td>
                  <td>₹{invoice.subtotal?.toFixed(2) || "0.00"}</td>
                  <td>₹{invoice.total_due?.toFixed(2) || "0.00"}</td>
                  <td>{renderStatus(invoice.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* === Pagination Bar === */}
        <div className="pagination-bar">
          <p className="entries-info">
            Showing {invoices.length === 0 ? 0 : startIndex + 1}–
            {Math.min(startIndex + rowsPerPage, invoices.length)} of{" "}
            {invoices.length} entries
          </p>

          <div className="pagination-controls">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              &lt;
            </button>

            {renderPageNumbers()}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              &gt;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FreelancerInvoicesPage;
