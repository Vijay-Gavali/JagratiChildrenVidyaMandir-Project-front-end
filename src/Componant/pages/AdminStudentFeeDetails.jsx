import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./AdminStudentFeeDetails.css";

const AdminStudentFeeDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Get student ID from navigation state
  const studentId = location.state?.studentId;
  const studentName = location.state?.studentName || "Student";

  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [studentInfo, setStudentInfo] = useState(null);

  // Fetch student details and fee information
  useEffect(() => {
    if (!studentId) {
      setError("No student selected.");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        // Fetch student information
        const studentResponse = await fetch(
          `http://localhost:8080/api/users/${studentId}`
        );
        if (studentResponse.ok) {
          const studentData = await studentResponse.json();
          setStudentInfo(studentData);
        }

        // Fetch fee information
        const feeResponse = await fetch(
          `http://localhost:8080/api/fees/user/${studentId}`
        );

        if (!feeResponse.ok) {
          if (feeResponse.status === 404) {
            setFees([]); // No fees found
            return;
          }
          throw new Error(`Failed to fetch fee details: ${feeResponse.status}`);
        }

        const feeData = await feeResponse.json();
        setFees(Array.isArray(feeData) ? feeData : [feeData]);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.message || "Failed to load fee details");
        setFees([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [studentId]);

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "Not Paid";
    try {
      const options = { year: "numeric", month: "short", day: "numeric" };
      return new Date(dateString).toLocaleDateString("en-IN", options);
    } catch (error) {
      return dateString;
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return "₹ 0";
    return `₹ ${parseInt(amount).toLocaleString("en-IN")}`;
  };

  // Calculate totals
  const calculateTotals = () => {
    const totalFees = fees.reduce(
      (sum, fee) => sum + (parseInt(fee.amount) || 0),
      0
    );
    const totalPaid = fees.reduce(
      (sum, fee) => sum + (parseInt(fee.paidAmount) || 0),
      0
    );
    const totalRemaining = fees.reduce(
      (sum, fee) => sum + (parseInt(fee.remainingAmount) || 0),
      0
    );

    return { totalFees, totalPaid, totalRemaining };
  };

  const { totalFees, totalPaid, totalRemaining } = calculateTotals();

  // Handle back navigation
  const goBack = () => {
    navigate(-1); // Go back to previous page
  };

  // Handle mark as paid
  const markAsPaid = (feeId) => {
    if (window.confirm("Mark this fee as paid?")) {
      alert(
        "This would update the payment status to 'Paid' via API.\nFee ID: " +
          feeId
      );
      // Implement API call to update payment status
    }
  };

  // Handle add payment
  const addPayment = (feeId) => {
    alert("This would open a payment form for Fee ID: " + feeId);
    // Implement payment form
  };

  return (
    <div className="admin-fee-details-container">
      {/* Header */}
      <div className="admin-fee-header">
        <div className="header-left">
          <button className="back-btn" onClick={goBack}>
            ← Back
          </button>
          <h2 className="page-title">Fee Details - {studentName}</h2>
        </div>

        {!loading && !error && fees.length > 0 && (
          <div className="summary-stats">
            <div className="stat-item">
              <span className="stat-label">Total Fees:</span>
              <span className="stat-value">{formatCurrency(totalFees)}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Paid:</span>
              <span className="stat-value paid">
                {formatCurrency(totalPaid)}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Pending:</span>
              <span className="stat-value pending">
                {formatCurrency(totalRemaining)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Student Info */}
      {studentInfo && (
        <div className="student-info-card">
          <div className="info-row">
            <span className="info-label">Student ID:</span>
            <span className="info-value">{studentId}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Name:</span>
            <span className="info-value">{studentInfo.name || "N/A"}</span>
          </div>
          {studentInfo.admissionNo && (
            <div className="info-row">
              <span className="info-label">Admission No:</span>
              <span className="info-value">{studentInfo.admissionNo}</span>
            </div>
          )}
          {studentInfo.studentClass && (
            <div className="info-row">
              <span className="info-label">Class:</span>
              <span className="info-value">{studentInfo.studentClass}</span>
            </div>
          )}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}

      {/* Fee Details */}
      <div className="fee-table-container">
        {loading ? (
          <div className="loading-state">
            <p>Loading fee details...</p>
          </div>
        ) : fees.length === 0 ? (
          <div className="empty-state">
            <p>No fee records found for this student.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="fee-table">
              <thead>
                <tr>
                  <th>Fee ID</th>
                  <th>Amount</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th>Payment Date</th>
                  <th>Paid Amount</th>
                  <th>Remaining</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {fees.map((fee) => (
                  <tr key={fee.feesId}>
                    <td className="text-center">{fee.feesId}</td>
                    <td className="text-right amount">
                      {formatCurrency(fee.amount)}
                    </td>
                    <td>{formatDate(fee.dueDate)}</td>
                    <td>
                      <span
                        className={`status-badge ${fee.paymentStatus?.toLowerCase()}`}
                      >
                        {fee.paymentStatus || "Pending"}
                      </span>
                    </td>
                    <td>{formatDate(fee.paymentDate)}</td>
                    <td className="text-right paid">
                      {formatCurrency(fee.paidAmount)}
                    </td>
                    <td className="text-right remaining">
                      {formatCurrency(fee.remainingAmount)}
                    </td>
                    <td>
                      <div className="fee-actions">
                        {fee.paymentStatus?.toLowerCase() !== "paid" &&
                          fee.remainingAmount > 0 && (
                            <>
                              <button
                                className="mark-paid-btn"
                                onClick={() => markAsPaid(fee.feesId)}
                              >
                                Mark Paid
                              </button>
                              <button
                                className="add-payment-btn"
                                onClick={() => addPayment(fee.feesId)}
                              >
                                Add Payment
                              </button>
                            </>
                          )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Footer Summary */}
      {fees.length > 0 && (
        <div className="fee-summary">
          <div className="summary-row">
            <span className="summary-label">Total Records:</span>
            <span className="summary-value">{fees.length}</span>
          </div>
          <div className="summary-row">
            <span className="summary-label">Overall Status:</span>
            <span
              className={`summary-value ${
                totalRemaining === 0 ? "fully-paid" : "pending"
              }`}
            >
              {totalRemaining === 0 ? "Fully Paid" : "Payment Due"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminStudentFeeDetails;
