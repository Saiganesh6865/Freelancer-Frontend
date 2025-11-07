import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./ManagerInvoicesPage.css";

const ManagerInvoicesPage = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const res = await api.getManagerInvoices();
        if (res?.success) {
          setInvoices(res.data);
        }
      } catch (err) {
        console.error("Error fetching invoices:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchInvoices();
  }, []);

  if (loading)
    return <div className="invoice-loader">Loading invoices...</div>;

  return (
    <div className="invoices-container">
      {/* Header */}
      <div className="invoice-header">
        <h2>📜 All Invoices</h2>
        <p className="subtitle">Manage and review all generated invoices</p>
      </div>

      {/* Invoice Table */}
      {invoices.length === 0 ? (
        <p className="no-invoices">No invoices found.</p>
      ) : (
        <div className="invoice-card">
          <table className="invoice-table">
            <thead>
              <tr>
                <th>Invoice ID</th>
                <th>Client Name</th>
                <th>Project Type</th>
                <th>Issue Date</th>
                <th>Due Date</th>
                <th>Total Due (₹)</th>
                <th className="text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => (
                <tr key={invoice.invoice_id}>
                  <td className="font-semibold text-gray-700">
                    {invoice.invoice_id}
                  </td>
                  <td>{invoice.client_details?.trim() || "—"}</td>
                  <td className="capitalize">
                    {invoice.project_type || "—"}
                  </td>
                  <td>
                    {new Date(invoice.issue_date).toLocaleDateString("en-IN")}
                  </td>
                  <td>
                    {new Date(invoice.due_date).toLocaleDateString("en-IN")}
                  </td>
                  <td className="font-semibold text-green-700">
                    ₹{invoice.total_due?.toLocaleString("en-IN") || 0}
                  </td>
                  <td className="text-center">
                    <button
                      onClick={() => navigate(`/manager/invoices/${invoice.invoice_id}`)}

                      className="view-btn"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ManagerInvoicesPage;
