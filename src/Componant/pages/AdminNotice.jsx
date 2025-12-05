import React, { useState } from "react";
import "./AdminNotice.css";

const AdminNotice = () => {
  const [notices, setNotices] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showPrintPreview, setShowPrintPreview] = useState(false);

  // Notice form state
  const [noticeData, setNoticeData] = useState({
    title: "",
    subject: "",
    message: "",
    date: "",
    issuedBy: "",
  });

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNoticeData({
      ...noticeData,
      [name]: value,
    });
  };

  // Handle form submit
  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate form
    if (
      !noticeData.title ||
      !noticeData.message ||
      !noticeData.date ||
      !noticeData.issuedBy
    ) {
      alert("Please fill in all required fields");
      return;
    }

    const newNotice = {
      id: Date.now(), // Generate unique ID
      ...noticeData,
    };

    setNotices([newNotice, ...notices]);

    // Reset form and close
    setNoticeData({
      title: "",
      subject: "",
      message: "",
      date: "",
      issuedBy: "",
    });

    setShowForm(false);
    alert("Notice created successfully!");
  };

  // Delete notice
  const deleteNotice = (id) => {
    if (!window.confirm("Are you sure you want to delete this notice?")) return;

    const updatedNotices = notices.filter((notice) => notice.id !== id);
    setNotices(updatedNotices);
    alert("Notice deleted successfully!");
  };

  // Print notice
  const printNotice = (notice) => {
    setNoticeData(notice);
    setShowPrintPreview(true);

    // Small delay to ensure state update before printing
    setTimeout(() => {
      window.print();
      setShowPrintPreview(false);
    }, 100);
  };

  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  return (
    <div className="notice-container">
      {/* Header */}
      <div className="notice-header">
        <h2 className="notice-title">Notice Board</h2>
        <div className="notice-header-buttons">
          <button className="notice-add-btn" onClick={() => setShowForm(true)}>
            + Create New Notice
          </button>
        </div>
      </div>

      {/* Notice Creation Form */}
      {showForm && (
        <div className="notice-form-overlay">
          <div className="notice-form-container">
            <div className="notice-form-header">
              <h3>Create New Notice</h3>
              <button
                className="close-form-btn"
                onClick={() => setShowForm(false)}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="notice-form">
              <div className="form-group">
                <label htmlFor="title">Title *</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={noticeData.title}
                  onChange={handleInputChange}
                  placeholder="Enter notice title"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="subject">Subject</label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={noticeData.subject}
                  onChange={handleInputChange}
                  placeholder="Enter notice subject"
                />
              </div>

              <div className="form-group">
                <label htmlFor="message">Main Message *</label>
                <textarea
                  id="message"
                  name="message"
                  value={noticeData.message}
                  onChange={handleInputChange}
                  placeholder="Enter the main content of the notice"
                  rows="6"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="date">Date *</label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    value={noticeData.date}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="issuedBy">Issued By *</label>
                  <input
                    type="text"
                    id="issuedBy"
                    name="issuedBy"
                    value={noticeData.issuedBy}
                    onChange={handleInputChange}
                    placeholder="e.g., Principal, Admin Office"
                    required
                  />
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  Create Notice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Notices List */}
      <div className="notices-list">
        {notices.length === 0 ? (
          <div className="no-notices">
            <p>No notices found. Create your first notice!</p>
            <button
              className="notice-add-btn"
              onClick={() => setShowForm(true)}
            >
              + Create Notice
            </button>
          </div>
        ) : (
          <div className="notices-grid">
            {notices.map((notice) => (
              <div key={notice.id} className="notice-card">
                <div className="notice-card-header">
                  <h3 className="notice-card-title">{notice.title}</h3>
                  <span className="notice-date">{formatDate(notice.date)}</span>
                </div>

                {notice.subject && (
                  <div className="notice-subject">
                    <strong>Subject:</strong> {notice.subject}
                  </div>
                )}

                <div className="notice-message">{notice.message}</div>

                <div className="notice-card-footer">
                  <div className="notice-issued-by">
                    <strong>Issued By:</strong> {notice.issuedBy}
                  </div>

                  <div className="notice-actions">
                    <button
                      className="print-btn"
                      onClick={() => printNotice(notice)}
                    >
                      🖨️ Print
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => deleteNotice(notice.id)}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Print Preview */}
      {showPrintPreview && (
        <div className="print-preview">
          <div className="print-notice">
            <div className="print-header">
              <h1 className="school-name">SCHOOL NAME</h1>
              <h2 className="print-title">OFFICIAL NOTICE</h2>
            </div>

            <div className="print-content">
              <div className="print-meta">
                <p>
                  <strong>Date:</strong> {formatDate(noticeData.date)}
                </p>
                {noticeData.subject && (
                  <p>
                    <strong>Subject:</strong> {noticeData.subject}
                  </p>
                )}
              </div>

              <div className="print-title-section">
                <h3>{noticeData.title}</h3>
              </div>

              <div className="print-message">
                <p>{noticeData.message}</p>
              </div>

              <div className="print-footer">
                <div className="print-issued-by">
                  <p>
                    <strong>Issued By:</strong>
                  </p>
                  <p>{noticeData.issuedBy}</p>
                </div>

                <div className="print-signature">
                  <p>______________________</p>
                  <p>Signature</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Print-only styles */}
      <style>
        {`
          @media print {
            body * {
              visibility: hidden;
            }
            .print-preview,
            .print-preview * {
              visibility: visible;
            }
            .print-preview {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              padding: 20mm;
            }
            .print-notice {
              width: 100%;
              border: 2px solid #000;
              padding: 20px;
              page-break-after: always;
            }
            .print-header {
              text-align: center;
              border-bottom: 3px double #000;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .school-name {
              font-size: 24pt;
              margin: 0 0 10px 0;
            }
            .print-title {
              font-size: 20pt;
              margin: 0;
            }
            .print-content {
              font-size: 12pt;
              line-height: 1.6;
            }
            .print-title-section h3 {
              font-size: 16pt;
              text-align: center;
              text-decoration: underline;
              margin: 20px 0;
            }
            .print-message {
              margin: 30px 0;
              text-align: justify;
            }
            .print-footer {
              margin-top: 50px;
              display: flex;
              justify-content: space-between;
              align-items: flex-end;
            }
            .print-signature {
              text-align: center;
            }
            button {
              display: none !important;
            }
          }
        `}
      </style>
    </div>
  );
};

export default AdminNotice;
