import React, { useEffect, useState, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./AdminStudentFeeDetails.css";
import { SessionContext } from "./SessionContext"; // Adjust path as needed

const AdminStudentFeeDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Get session ID from context (same as Notice component)
  const { selectedSession } = useContext(
    SessionContext || { selectedSession: null }
  );

  // Get student ID from navigation state
  const studentId = location.state?.studentId;
  const studentName = location.state?.studentName || "Student";

  const [fees, setFees] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [studentInfo, setStudentInfo] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch student details, fee information, and transactions
  const fetchData = async () => {
    if (!studentId) {
      setError("No student selected.");
      setLoading(false);
      return;
    }

    // Check if session is selected
    if (!selectedSession || !selectedSession.id) {
      setError("Please select a session from the dashboard first.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setRefreshing(true);
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

      if (feeResponse.ok) {
        const feeData = await feeResponse.json();
        setFees(Array.isArray(feeData) ? feeData : [feeData]);
      }

      // Fetch transactions for this user using sessionId API
      const sessionId = selectedSession.id;
      const transactionResponse = await fetch(
        `http://localhost:8080/api/transactions/${sessionId}/getAllUsingSessionId`
      );

      if (transactionResponse.ok) {
        const transactionData = await transactionResponse.json();
        // Handle different response formats
        let transactionsList = [];

        if (Array.isArray(transactionData)) {
          transactionsList = transactionData;
        } else if (transactionData && Array.isArray(transactionData.content)) {
          transactionsList = transactionData.content;
        } else if (
          transactionData &&
          transactionData.data &&
          Array.isArray(transactionData.data)
        ) {
          transactionsList = transactionData.data;
        } else if (transactionData && typeof transactionData === "object") {
          const vals = Object.values(transactionData);
          if (Array.isArray(vals[0])) {
            transactionsList = vals[0];
          }
        }

        // Filter transactions for this specific student
        const studentTransactions = transactionsList.filter(
          (transaction) => transaction.userId === studentId
        );

        setTransactions(
          Array.isArray(studentTransactions) ? studentTransactions : []
        );
      } else {
        console.log("No transactions found or API error");
        setTransactions([]);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err.message || "Failed to load data");
      setFees([]);
      setTransactions([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [studentId, selectedSession]);

  // If no session selected, show message similar to Notice component
  if (!selectedSession || !selectedSession.id) {
    return (
      <div className="admin-fee-details-container" style={{ padding: 20 }}>
        <div className="empty-state">
          <div className="empty-icon">⚠️</div>
          <h3>No session selected</h3>
          <p>
            Please select a session from the Admin Dashboard home page to view
            or manage fee details.
          </p>
          <div style={{ marginTop: 12 }}>
            <button
              className="back-btn"
              onClick={() => navigate("/admindashboard")}
            >
              Go to Dashboard (select session)
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Format date to be more readable
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      // Format: DD-MM-YYYY HH:MM
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");

      return `${day}-${month}-${year} ${hours}:${minutes}`;
    } catch (error) {
      console.error("Error formatting date:", dateString, error);
      return dateString;
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return "₹ 0";
    return `₹ ${parseFloat(amount).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // Calculate totals from fees
  const calculateFeeTotals = () => {
    let totalFees = 0;

    fees.forEach((fee) => {
      const amount = parseFloat(fee.amount) || 0;
      totalFees += amount;
    });

    return totalFees;
  };

  // Calculate total from transactions (only successful ones)
  const calculateTransactionTotal = () => {
    return transactions
      .filter(
        (transaction) =>
          transaction.status && transaction.status.toLowerCase() === "success"
      )
      .reduce(
        (sum, transaction) => sum + (parseFloat(transaction.amount) || 0),
        0
      );
  };

  // Calculate remaining amount
  const calculateRemainingAmount = () => {
    const totalFees = calculateFeeTotals();
    const totalPaid = calculateTransactionTotal();
    return Math.max(0, totalFees - totalPaid);
  };

  // Calculate payment percentage
  const calculatePaymentPercentage = () => {
    const totalFees = calculateFeeTotals();
    const totalPaid = calculateTransactionTotal();
    if (totalFees === 0) return 0;
    return Math.round((totalPaid / totalFees) * 100);
  };

  // Get fee details with calculated paid amount from transactions
  const getFeeWithCalculatedPaidAmount = (fee) => {
    const feeId = fee.feesId;
    const feeAmount = parseFloat(fee.amount) || 0;

    // Calculate paid amount for this specific fee from transactions
    const feeTransactions = transactions.filter(
      (t) => t.description && t.description.includes(feeId.toString())
    );

    let paidAmount = 0;

    if (feeTransactions.length > 0) {
      // If transactions are linked to this fee
      paidAmount = feeTransactions
        .filter((t) => t.status && t.status.toLowerCase() === "success")
        .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
    } else {
      // If transactions are not linked to specific fees, distribute proportionally
      const totalFees = calculateFeeTotals();
      const totalPaid = calculateTransactionTotal();
      if (totalFees > 0) {
        paidAmount = (feeAmount / totalFees) * totalPaid;
      }
    }

    const remaining = Math.max(0, feeAmount - paidAmount);

    return {
      ...fee,
      calculatedPaidAmount: paidAmount,
      calculatedRemaining: remaining,
      calculatedStatus:
        paidAmount >= feeAmount
          ? "Paid"
          : paidAmount > 0
          ? "Partial"
          : "Pending",
    };
  };

  // Calculate overall totals
  const totalFees = calculateFeeTotals();
  const totalPaid = calculateTransactionTotal();
  const totalRemaining = calculateRemainingAmount();
  const paymentPercentage = calculatePaymentPercentage();

  // Handle back navigation
  const goBack = () => {
    navigate(-1);
  };

  // Handle refresh
  const handleRefresh = () => {
    fetchData();
  };

  // Handle pay fees button click - This would use the save API
  const handlePayFees = async (fee) => {
    const feeWithCalculations = getFeeWithCalculatedPaidAmount(fee);
    const remaining = feeWithCalculations.calculatedRemaining;

    if (remaining > 0) {
      // Show payment dialog
      const paymentAmount = prompt(
        `Enter payment amount for Fee ID: ${fee.feesId}\n\n` +
          `Fee Amount: ${formatCurrency(fee.amount)}\n` +
          `Already Paid: ${formatCurrency(
            feeWithCalculations.calculatedPaidAmount
          )}\n` +
          `Remaining: ${formatCurrency(remaining)}\n\n` +
          `Enter amount to pay (max: ${formatCurrency(remaining)}):`,
        formatCurrency(remaining).replace("₹ ", "")
      );

      if (paymentAmount && !isNaN(parseFloat(paymentAmount))) {
        const amount = parseFloat(paymentAmount);
        if (amount > 0 && amount <= remaining) {
          try {
            // Get session ID from context
            const sessionId = selectedSession.id;

            // Create transaction object
            const transactionData = {
              amount: amount,
              paymentMode: "CASH", // Default, you can make this selectable
              description: `Payment for Fee ID: ${fee.feesId} - Student: ${studentName}`,
              remarks: `Paid for ${studentName}'s fee (ID: ${studentId})`,
              // Add userId if your TransactionDTO requires it
              userId: parseInt(studentId),
            };

            // Save transaction using the session-based API
            const response = await fetch(
              `http://localhost:8080/api/transactions/${sessionId}/save`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(transactionData),
              }
            );

            if (response.ok) {
              const savedTransaction = await response.json();
              alert(
                `Payment of ${formatCurrency(
                  amount
                )} saved successfully!\nTransaction ID: ${
                  savedTransaction.transactionId
                }`
              );
              // Refresh data to show updated transactions
              fetchData();
            } else {
              const errorText = await response.text().catch(() => "");
              throw new Error(
                `Failed to save payment: ${response.status} ${errorText}`
              );
            }
          } catch (err) {
            console.error("Error saving transaction:", err);
            alert(`Error saving payment: ${err.message}`);
          }
        } else {
          alert(
            `Please enter a valid amount between 0 and ${formatCurrency(
              remaining
            )}`
          );
        }
      }
    }
  };

  // Print receipt
  const printReceipt = (transaction, studentName) => {
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>Receipt - ${transaction.transactionId}</title>
          <style>
            body {
              font-family: 'Courier New', monospace;
              font-size: 12px;
              line-height: 1.5;
              max-width: 400px;
              margin: 20px auto;
              padding: 20px;
              border: 1px solid #ccc;
            }
            .header {
              text-align: center;
              margin-bottom: 20px;
            }
            .divider {
              border-top: 2px dashed #000;
              margin: 10px 0;
            }
            .details {
              margin: 15px 0;
            }
            .footer {
              margin-top: 20px;
              text-align: center;
              font-size: 10px;
              color: #666;
            }
            .summary {
              margin: 15px 0;
              padding: 10px;
              background: #f8f9fa;
              border-radius: 4px;
            }
            .summary-row {
              display: flex;
              justify-content: space-between;
              margin: 5px 0;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>JAGRATI CHILDREN VIDYA MANDIR</h2>
            <h3>FEE PAYMENT RECEIPT</h3>
            <p><strong>Session:</strong> ${
              selectedSession.name || selectedSession.id
            }</p>
          </div>
          
          <div class="details">
            <p><strong>Student:</strong> ${studentName}</p>
            <p><strong>Admission No:</strong> ${
              studentInfo?.admissionNo || "N/A"
            }</p>
            <p><strong>Class:</strong> ${studentInfo?.studentClass || "N/A"}</p>
          </div>
          
          <div class="divider"></div>
          
          <div class="details">
            <p><strong>Transaction ID:</strong> ${transaction.transactionId}</p>
            <p><strong>Receipt No:</strong> ${transaction.receiptNumber}</p>
            <p><strong>Date:</strong> ${formatDate(transaction.paymentDate)}</p>
          </div>
          
          <div class="divider"></div>
          
          <div class="details">
            <h4>Payment Details:</h4>
            <p><strong>Amount:</strong> ${formatCurrency(
              transaction.amount
            )}</p>
            <p><strong>Payment Mode:</strong> ${transaction.paymentMode}</p>
            ${
              transaction.bankName
                ? `<p><strong>Bank:</strong> ${transaction.bankName}</p>`
                : ""
            }
            ${
              transaction.upiId
                ? `<p><strong>UPI ID:</strong> ${transaction.upiId}</p>`
                : ""
            }
            <p><strong>Description:</strong> ${transaction.description}</p>
            <p><strong>Status:</strong> ${transaction.status}</p>
            ${
              transaction.remarks
                ? `<p><strong>Remarks:</strong> ${transaction.remarks}</p>`
                : ""
            }
          </div>
          
          <div class="divider"></div>
          
          <div class="summary">
            <div class="summary-row">
              <span><strong>Total Fees:</strong></span>
              <span>${formatCurrency(totalFees)}</span>
            </div>
            <div class="summary-row">
              <span><strong>Total Paid:</strong></span>
              <span>${formatCurrency(totalPaid)}</span>
            </div>
            <div class="summary-row">
              <span><strong>Remaining:</strong></span>
              <span>${formatCurrency(totalRemaining)}</span>
            </div>
            <div class="summary-row">
              <span><strong>Payment Progress:</strong></span>
              <span>${paymentPercentage}%</span>
            </div>
          </div>
          
          <div class="footer">
            <p>Thank You for Your Payment!</p>
            <p>Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  // Get status badge class for transaction
  const getStatusClass = (status) => {
    if (!status) return "pending";

    const statusLower = status.toLowerCase();
    if (
      statusLower === "success" ||
      statusLower === "completed" ||
      statusLower === "paid"
    ) {
      return "success";
    } else if (statusLower === "pending") {
      return "pending";
    } else if (statusLower === "failed" || statusLower === "cancelled") {
      return "failed";
    } else if (statusLower === "refunded") {
      return "refunded";
    }
    return "pending";
  };

  // Get fee status class
  const getFeeStatusClass = (status) => {
    const statusLower = status.toLowerCase();
    if (statusLower === "paid") return "paid";
    if (statusLower === "partial") return "partial";
    return "pending";
  };

  return (
    <div className="admin-fee-details-container">
      {/* Header */}
      <div className="admin-fee-header">
        <div className="header-left">
          <div className="button-group">
            <button className="back-btn" onClick={goBack}>
              ← Back
            </button>
            <button
              className="refresh-btn"
              onClick={handleRefresh}
              disabled={refreshing || loading}
            >
              {refreshing ? (
                <span className="refresh-icon spinning">⟳</span>
              ) : (
                <span className="refresh-icon">⟳</span>
              )}
              Refresh
            </button>
          </div>
          <div>
            <h2 className="page-title">Fee Details - {studentName}</h2>
            <div className="session-info">
              <span className="session-label">Session:</span>
              <span className="session-value">
                {selectedSession.name || selectedSession.id}
              </span>
            </div>
          </div>
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
                {formatCurrency(totalPaid)} ({paymentPercentage}%)
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
          <div className="info-row">
            <span className="info-label">Total Transactions:</span>
            <span className="info-value">{transactions.length}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Current Session:</span>
            <span className="info-value">
              {selectedSession.name || selectedSession.id}
            </span>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}

      {/* Loading Indicator */}
      {(loading || refreshing) && (
        <div className="loading-indicator">
          <div className="spinner"></div>
          <p>{refreshing ? "Refreshing data..." : "Loading data..."}</p>
        </div>
      )}

      {/* Fees Details Table with Actions */}
      <div className="section-header">
        <h3>Fee Structure</h3>
      </div>

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
                  <th>Total Amount</th>
                  <th>Paid</th>
                  <th>Remaining</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {fees.map((fee) => {
                  const feeWithCalculations =
                    getFeeWithCalculatedPaidAmount(fee);

                  return (
                    <tr key={fee.feesId}>
                      <td className="text-center">{fee.feesId}</td>
                      <td className="text-right amount">
                        {formatCurrency(fee.amount)}
                      </td>
                      <td className="text-right paid">
                        {formatCurrency(
                          feeWithCalculations.calculatedPaidAmount
                        )}
                      </td>
                      <td className="text-right remaining">
                        {formatCurrency(
                          feeWithCalculations.calculatedRemaining
                        )}
                      </td>
                      <td className="text-center">
                        <span
                          className={`status-badge ${getFeeStatusClass(
                            feeWithCalculations.calculatedStatus
                          )}`}
                        >
                          {feeWithCalculations.calculatedStatus}
                        </span>
                      </td>
                      <td className="text-center">
                        <button
                          className="pay-fees-btn"
                          onClick={() => handlePayFees(fee)}
                          disabled={
                            feeWithCalculations.calculatedRemaining === 0
                          }
                        >
                          {feeWithCalculations.calculatedRemaining === 0
                            ? "Paid"
                            : "Pay Fees"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Transactions Table with Print Button */}
      <div className="section-header">
        <h3>Payment Transactions</h3>
      </div>

      <div className="transactions-table-container">
        {loading ? (
          <div className="loading-state">
            <p>Loading transactions...</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="empty-state">
            <p>No payment transactions found for this student.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="transactions-table">
              <thead>
                <tr>
                  <th>Sr. No.</th>
                  <th>Amount</th>
                  <th>Payment Date</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {transactions.map((transaction, index) => (
                  <tr key={transaction.id || transaction.transactionId}>
                    <td className="text-center">{index + 1}</td>
                    <td className="text-right amount">
                      {formatCurrency(transaction.amount)}
                    </td>
                    <td className="text-center">
                      {formatDate(transaction.paymentDate)}
                    </td>
                    <td className="text-center">
                      {transaction.description || "Fee Payment"}
                    </td>
                    <td className="text-center">
                      <span
                        className={`status-badge ${getStatusClass(
                          transaction.status
                        )}`}
                      >
                        {transaction.status || "Pending"}
                      </span>
                    </td>
                    <td className="text-center">
                      <button
                        className="print-btn"
                        onClick={() => printReceipt(transaction, studentName)}
                      >
                        Print Receipt
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminStudentFeeDetails;
