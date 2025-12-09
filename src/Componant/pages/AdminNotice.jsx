import React, { useState, useEffect } from "react";
import "./AdminNotice.css";

const AdminNotice = () => {
  const [notices, setNotices] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  // Notice form state
  const [noticeData, setNoticeData] = useState({
    noticeId: null, // Changed from 'id' to 'noticeId'
    title: "",
    subject: "",
    message: "",
    date: "",
    issuedBy: "",
  });

  // Set your API base URL
  const API_BASE = "http://localhost:8080/api/notices";

  // --- Helpers for date handling ---

  // For <input type="date"> → must be YYYY-MM-DD
  const normalizeDateForInput = (value) => {
    if (!value) return "";
    // if backend returns "2025-12-08T00:00:00" or ISO string
    if (typeof value === "string" && value.includes("T")) {
      return value.split("T")[0];
    }
    // assume already YYYY-MM-DD
    return value;
  };

  // For API (LocalDate) → also YYYY-MM-DD
  const normalizeDateForApi = (value) => {
    if (!value) return null;
    if (value.includes("T")) {
      return value.split("T")[0];
    }
    return value;
  };

  // Load all notices on mount
  useEffect(() => {
    const fetchNotices = async () => {
      try {
        setLoading(true);
        console.log("Fetching notices from:", API_BASE);

        const response = await fetch(API_BASE, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(
            `Failed to fetch notices: ${response.status} ${response.statusText}`
          );
        }

        const data = await response.json();
        console.log("Received data:", data);

        // Handle different response formats
        let noticesList = [];

        if (Array.isArray(data)) {
          noticesList = data;
        } else if (data && Array.isArray(data.content)) {
          // Spring Boot Pageable response
          noticesList = data.content;
        } else if (data && data.data && Array.isArray(data.data)) {
          // Some APIs wrap in data object
          noticesList = data.data;
        } else if (data && typeof data === "object") {
          // Try to extract array from object
          const values = Object.values(data);
          if (Array.isArray(values[0])) {
            noticesList = values[0];
          }
        }

        // Ensure we have an array
        if (!Array.isArray(noticesList)) {
          noticesList = [];
        }

        setNotices(noticesList);
      } catch (error) {
        console.error("Error fetching notices:", error);
        alert(`Error loading notices: ${error.message}`);
        setNotices([]); // Set empty array on error
      } finally {
        setLoading(false);
      }
    };

    fetchNotices();
  }, []);

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNoticeData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setNoticeData({
      noticeId: null, // Changed from 'id'
      title: "",
      subject: "",
      message: "",
      date: "",
      issuedBy: "",
    });
  };

  // Handle form submit (Create / Update)
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form (subject is required as per nullable = false)
    if (
      !noticeData.title ||
      !noticeData.subject ||
      !noticeData.message ||
      !noticeData.date ||
      !noticeData.issuedBy
    ) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);

      const { noticeId, ...rest } = noticeData;

      // Ensure date sent to API is YYYY-MM-DD
      const payload = {
        ...rest,
        date: normalizeDateForApi(rest.date),
      };

      console.log("Submitting payload:", payload);
      console.log("noticeId:", noticeId);

      if (!noticeId) {
        // CREATE – POST /api/notices
        const response = await fetch(API_BASE, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Create error response:", response.status, errorText);
          throw new Error(`Failed to create notice: ${response.status}`);
        }

        const savedNotice = await response.json();
        console.log("Created notice:", savedNotice);
        setNotices((prev) => [savedNotice, ...prev]);
        alert("Notice created successfully!");
      } else {
        // UPDATE – PUT /api/notices/{noticeId}
        // Convert noticeId to integer
        const id = parseInt(noticeId, 10);
        if (isNaN(id)) {
          throw new Error("Invalid notice ID");
        }

        const updatePayload = {
          noticeId: id, // Include noticeId in payload
          ...payload,
        };

        console.log("Updating notice with ID:", id);
        console.log("Update payload:", updatePayload);

        const response = await fetch(`${API_BASE}/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatePayload),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Update error response:", response.status, errorText);
          throw new Error(`Failed to update notice: ${response.status}`);
        }

        const updatedNotice = await response.json();
        console.log("Updated notice:", updatedNotice);
        setNotices((prev) =>
          prev.map((n) =>
            n.noticeId === updatedNotice.noticeId ? updatedNotice : n
          )
        );
        alert("Notice updated successfully!");
      }

      resetForm();
      setShowForm(false);
    } catch (error) {
      console.error("Submit error:", error);
      alert(error.message || "Something went wrong while saving notice.");
    } finally {
      setLoading(false);
    }
  };

  // Delete notice – DELETE /api/notices/{noticeId}
  const deleteNotice = async (noticeId) => {
    if (!window.confirm("Are you sure you want to delete this notice?")) return;

    try {
      setLoading(true);

      // Convert noticeId to integer
      const id = parseInt(noticeId, 10);
      if (isNaN(id)) {
        throw new Error("Invalid notice ID");
      }

      console.log("Deleting notice with ID:", id);

      const response = await fetch(`${API_BASE}/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Notice not found (already deleted?)");
        }
        const errorText = await response.text();
        console.error("Delete error response:", response.status, errorText);
        throw new Error(`Failed to delete notice: ${response.status}`);
      }

      setNotices((prev) =>
        prev.filter((notice) => notice.noticeId !== noticeId)
      );
      alert("Notice deleted successfully!");
    } catch (error) {
      console.error("Delete error:", error);
      alert(error.message || "Something went wrong while deleting notice.");
    } finally {
      setLoading(false);
    }
  };

  // Edit notice – open modal with existing data
  const editNotice = (notice) => {
    console.log("Editing notice:", notice);
    setNoticeData({
      noticeId: notice.noticeId, // Changed from 'id'
      title: notice.title || "",
      subject: notice.subject || "",
      message: notice.message || "",
      date: normalizeDateForInput(notice.date),
      issuedBy: notice.issuedBy || "",
    });
    setShowForm(true);
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "";
    try {
      const normalized = normalizeDateForInput(dateString);
      const options = { year: "numeric", month: "long", day: "numeric" };
      return new Date(normalized).toLocaleDateString("en-US", options);
    } catch (error) {
      return dateString;
    }
  };

  // Print notice
  const printNotice = (notice) => {
    const printWindow = window.open("", "_blank", "width=800,height=600");

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${notice.title} - Notice</title>
        <style>
          @page {
            margin: 20mm;
          }
          body {
            font-family: 'Times New Roman', Times, serif;
            margin: 0;
            padding: 0;
            background: white;
          }
          .print-container {
            width: 210mm;
            min-height: 297mm;
            margin: 0 auto;
            padding: 20mm;
            box-sizing: border-box;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .school-name {
            font-size: 28pt;
            font-weight: bold;
            margin: 0;
            text-transform: uppercase;
          }
          .notice-label {
            font-size: 22pt;
            margin: 10px 0 20px 0;
            color: #333;
            border-bottom: 3px double #000;
            padding-bottom: 15px;
          }
          .notice-content {
            margin-top: 30px;
          }
          .notice-meta {
            margin-bottom: 25px;
            font-size: 12pt;
          }
          .notice-meta p {
            margin: 8px 0;
          }
          .notice-title {
            text-align: center;
            font-size: 18pt;
            text-decoration: underline;
            margin: 30px 0;
          }
          .notice-body {
            font-size: 12pt;
            line-height: 1.8;
            text-align: justify;
            margin: 30px 0;
            white-space: pre-wrap;
          }
          .footer {
            margin-top: 80px;
            display: flex;
            justify-content: space-between;
          }
          .issued-by {
            font-size: 12pt;
          }
          .signature {
            text-align: center;
          }
          .signature-line {
            width: 200px;
            height: 1px;
            border-bottom: 1px solid #000;
            margin: 0 auto 5px;
          }
          .print-date {
            text-align: right;
            margin-top: 10px;
            font-size: 10pt;
            color: #666;
          }
        </style>
      </head>
      <body>
        <div class="print-container">
          <div class="header">
            <h1 class="school-name">JAGRATI CHILDREN VIDHYA MANDIR</h1>
            <h2 class="notice-label">OFFICIAL NOTICE</h2>
          </div>
          
          <div class="notice-content">
            <div class="notice-meta">
              <p><strong>Date:</strong> ${formatDate(notice.date)}</p>
              ${
                notice.subject
                  ? `<p><strong>Subject:</strong> ${notice.subject}</p>`
                  : ""
              }
            </div>
            
            <h3 class="notice-title">${notice.title}</h3>
            
            <div class="notice-body">
              ${(notice.message || "").replace(/\n/g, "<br>")}
            </div>
            
            <div class="footer">
              <div class="issued-by">
                <p><strong>Issued By:</strong></p>
                <p>${notice.issuedBy || ""}</p>
                <p>${formatDate(notice.date)}</p>
              </div>
              
              <div class="signature">
                <div class="signature-line"></div>
                <p>Authorized Signature</p>
              </div>
            </div>
            
            <div class="print-date">
              Printed on: ${new Date().toLocaleDateString()}
            </div>
          </div>
        </div>
      </body>
      </html>
    `);

    printWindow.document.close();

    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  // Get today's date in YYYY-MM-DD format for date input
  const getTodayDate = () => {
    return new Date().toISOString().split("T")[0];
  };

  return (
    <div className="notice-container">
      {/* Header */}
      <div className="notice-header">
        <div className="header-left">
          <h2 className="notice-title">Notice Board</h2>
          <p className="notice-count">
            Total Notices: {notices.length} {loading ? "(Loading...)" : ""}
          </p>
        </div>
        <div className="header-right">
          <button className="notice-add-btn" onClick={() => setShowForm(true)}>
            <span className="btn-icon">+</span> Create New Notice
          </button>
        </div>
      </div>

      {/* Notice Creation Form Modal */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>
                {noticeData.noticeId ? "Edit Notice" : "Create New Notice"}
              </h3>
              <button
                className="close-btn"
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="notice-form">
              <div className="form-grid">
                <div className="form-group full-width">
                  <label htmlFor="title">
                    Title <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={noticeData.title}
                    onChange={handleInputChange}
                    placeholder="Enter notice title"
                    required
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="subject">
                    Subject <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={noticeData.subject}
                    onChange={handleInputChange}
                    placeholder="Enter subject"
                    required
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="date">
                    Date <span className="required">*</span>
                  </label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    value={noticeData.date}
                    onChange={handleInputChange}
                    required
                    className="form-input"
                    max={getTodayDate()}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="issuedBy">
                    Issued By <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="issuedBy"
                    name="issuedBy"
                    value={noticeData.issuedBy}
                    onChange={handleInputChange}
                    placeholder="e.g., Principal, Admin"
                    required
                    className="form-input"
                  />
                </div>

                <div className="form-group full-width">
                  <label htmlFor="message">
                    Main Message <span className="required">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={noticeData.message}
                    onChange={handleInputChange}
                    placeholder="Type your notice content here..."
                    rows="8"
                    required
                    className="form-textarea"
                  />
                  <div className="char-count">
                    {noticeData.message.length} characters
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading
                    ? "Processing..."
                    : noticeData.noticeId
                    ? "Update Notice"
                    : "Create Notice"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Notices List */}
      <div className="notices-section">
        {loading && notices.length === 0 ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading notices...</p>
          </div>
        ) : notices.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📄</div>
            <h3>No Notices Found</h3>
            <p>Create your first notice to get started</p>
            <button
              className="btn btn-primary"
              onClick={() => setShowForm(true)}
            >
              Create First Notice
            </button>
          </div>
        ) : (
          <div className="notices-grid">
            {notices.map((notice) => (
              <div key={notice.noticeId} className="notice-card">
                <div className="card-header">
                  <div className="card-title-section">
                    <h3 className="card-title">{notice.title}</h3>
                    {notice.subject && (
                      <span className="card-subject">#{notice.subject}</span>
                    )}
                  </div>
                  <span className="card-date">{formatDate(notice.date)}</span>
                </div>

                <div className="card-body">
                  <p className="card-message">
                    {notice.message && notice.message.length > 200
                      ? notice.message.substring(0, 200) + "..."
                      : notice.message}
                  </p>
                </div>

                <div className="card-footer">
                  <div className="footer-left">
                    <div className="issued-by">
                      <strong>Issued By:</strong> {notice.issuedBy}
                    </div>
                  </div>

                  <div className="footer-right">
                    <button
                      className="icon-btn edit-btn"
                      onClick={() => editNotice(notice)}
                      title="Edit Notice"
                      disabled={loading}
                    >
                      Edit
                    </button>
                    <button
                      className="icon-btn print-btn"
                      onClick={() => printNotice(notice)}
                      title="Print Notice"
                    >
                      Print
                    </button>
                    <button
                      className="icon-btn delete-btn"
                      onClick={() => deleteNotice(notice.noticeId)}
                      title="Delete Notice"
                      disabled={loading}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminNotice;
