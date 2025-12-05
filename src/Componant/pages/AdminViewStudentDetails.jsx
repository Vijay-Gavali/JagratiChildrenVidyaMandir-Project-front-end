import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./AdminViewStudentDetails.css";

const AdminViewStudentDetails = ({ apiBase = "http://localhost:8080" }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const studentId = location.state?.studentId ?? null;

  const [user, setUser] = useState(null);
  const [docs, setDocs] = useState([]);
  const [loadingUser, setLoadingUser] = useState(false);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!studentId) return;

    // fetch user
    const fetchUser = async () => {
      setLoadingUser(true);
      setError(null);
      try {
        const res = await fetch(`${apiBase}/api/users/${studentId}`);

        if (res.status === 404) {
          throw new Error("Student not found");
        }

        if (!res.ok) {
          throw new Error(`Failed to load student (${res.status})`);
        }

        const data = await res.json();
        setUser(data);
      } catch (err) {
        setError(err.message || "Failed to load student details");
      } finally {
        setLoadingUser(false);
      }
    };

    // fetch docs
    const fetchDocs = async () => {
      setLoadingDocs(true);
      try {
        const res = await fetch(`${apiBase}/api/documents/${studentId}`);

        if (res.status === 404) {
          setDocs([]);
          return;
        }

        if (!res.ok) {
          console.warn(`Failed to load documents (${res.status})`);
          setDocs([]);
          return;
        }

        const arr = await res.json();
        setDocs(Array.isArray(arr) ? arr : []);
      } catch (err) {
        console.warn("Documents fetch:", err.message);
        setDocs([]);
      } finally {
        setLoadingDocs(false);
      }
    };

    fetchUser();
    fetchDocs();
  }, [studentId, apiBase]);

  // Download document using the specified API endpoint
  const handleDownload = async (doc) => {
    try {
      const userId = studentId;
      const type = doc.type || doc.endpoint || "";

      if (!type) {
        alert("Cannot download: Document type not specified");
        return;
      }

      // Use the correct API endpoint format
      const downloadUrl = `${apiBase}/api/documents/download/${userId}/${encodeURIComponent(
        type
      )}`;

      // Open in new tab for preview/download
      window.open(downloadUrl, "_blank");
    } catch (err) {
      console.error("Download error:", err);
      alert("Download failed: " + (err.message || ""));
    }
  };

  const printPage = () => {
    window.print();
  };

  const handleUpdate = () => {
    if (!studentId) return;
    navigate("/admindashboard/update-student", {
      state: { studentId },
    });
  };

  // Handle back to student list
  const handleBackToList = () => {
    navigate("/admindashboard/view-students");
  };

  if (!studentId) {
    return (
      <div className="vsd-container">
        <div className="vsd-card vsd-error-card">
          <h2>⚠️ No Student Selected</h2>
          <p>Please select a student from the student list to view details.</p>
          <button className="btn-primary" onClick={handleBackToList}>
            Go to Student List
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="vsd-container">
      <div className="vsd-actions">
        <button className="btn-ghost1" onClick={handleBackToList}>
          ← Back to Student List
        </button>

        <button
          className="btn-update"
          onClick={handleUpdate}
          disabled={loadingUser || !user}
        >
          Update Student
        </button>

        <button className="btn-primary1" onClick={printPage} disabled={!user}>
          🖨️ Print
        </button>
      </div>

      <div className="vsd-card" id="print-area">
        {loadingUser ? (
          <div className="vsd-loading">
            <div className="loading-spinner"></div>
            <p>Loading student details...</p>
          </div>
        ) : error ? (
          <div className="vsd-error">
            <h3>❌ Error Loading Student</h3>
            <p>{error}</p>
            <div className="error-actions">
              <button className="btn-ghost" onClick={handleBackToList}>
                Back to List
              </button>
              <button
                className="btn-primary"
                onClick={() => window.location.reload()}
              >
                Retry
              </button>
            </div>
          </div>
        ) : !user ? (
          <div className="vsd-empty">
            <h3>Student Not Found</h3>
            <p>The student with ID {studentId} could not be found.</p>
            <button className="btn-primary" onClick={handleBackToList}>
              Back to Student List
            </button>
          </div>
        ) : (
          <>
            <header className="vsd-header">
              <div className="vsd-photo">
                {/* show photo if available in docs */}
                {docs &&
                  docs.length > 0 &&
                  (() => {
                    const photo = docs.find(
                      (d) =>
                        (d.type || "").toUpperCase().includes("PHOTO") ||
                        (d.endpoint || "").toUpperCase().includes("PHOTO")
                    );
                    return photo && photo.url ? (
                      <img src={photo.url} alt="student" />
                    ) : (
                      <div className="vsd-avatar">
                        {(user.name || "?").slice(0, 1).toUpperCase()}
                      </div>
                    );
                  })()}
              </div>

              <div className="vsd-meta">
                <h2 className="vsd-name">{user.name || "—"}</h2>
                <div className="vsd-sub">
                  Admission No: <strong>{user.admissionNo || "—"}</strong>
                </div>
                <div className="vsd-sub">
                  Class:{" "}
                  <strong>
                    {user.studentClass || user.studentClassId || "—"}
                  </strong>
                </div>
                <div className="vsd-sub">
                  Student ID: <strong>{studentId}</strong>
                </div>
              </div>
            </header>

            <section className="vsd-section">
              <h3>Registration Details</h3>
              <table className="vsd-table">
                <tbody>
                  <tr>
                    <td>Full name</td>
                    <td>{user.name || "-"}</td>
                  </tr>
                  <tr>
                    <td>Admission No</td>
                    <td>{user.admissionNo || "-"}</td>
                  </tr>
                  <tr>
                    <td>Admission Date</td>
                    <td>{user.admissionDate || "-"}</td>
                  </tr>
                  <tr>
                    <td>DOB</td>
                    <td>{user.dob || "-"}</td>
                  </tr>
                  <tr>
                    <td>Gender</td>
                    <td>{user.gender || "-"}</td>
                  </tr>
                  <tr>
                    <td>Phone</td>
                    <td>{user.studentPhone || "-"}</td>
                  </tr>
                  <tr>
                    <td>Email</td>
                    <td>{user.email || "-"}</td>
                  </tr>
                  <tr>
                    <td>Father</td>
                    <td>{user.fatherName || "-"}</td>
                  </tr>
                  <tr>
                    <td>Mother</td>
                    <td>{user.motherName || "-"}</td>
                  </tr>
                  <tr>
                    <td>Parent phone</td>
                    <td>{user.parentPhone || "-"}</td>
                  </tr>
                  <tr>
                    <td>Address</td>
                    <td>{user.address || "-"}</td>
                  </tr>
                  <tr>
                    <td>Student Aadhar</td>
                    <td>{user.studentAadharNo || "-"}</td>
                  </tr>
                  <tr>
                    <td>Parent Aadhar</td>
                    <td>{user.parentAadharNo || "-"}</td>
                  </tr>
                  <tr>
                    <td>RTE</td>
                    <td>{user.rte || "-"}</td>
                  </tr>
                  <tr>
                    <td>TC Number</td>
                    <td>{user.tcNumber || "-"}</td>
                  </tr>
                  <tr>
                    <td>SSM ID</td>
                    <td>{user.ssmId || "-"}</td>
                  </tr>
                  <tr>
                    <td>Passout Class</td>
                    <td>{user.passoutClass || "-"}</td>
                  </tr>
                </tbody>
              </table>
            </section>

            <section className="vsd-section">
              <h3>Uploaded Documents {loadingDocs && "(loading...)"}</h3>

              {loadingDocs ? (
                <div className="vsd-loading">
                  <div className="loading-spinner-small"></div>
                  <p>Loading documents...</p>
                </div>
              ) : !docs || docs.length === 0 ? (
                <div className="vsd-empty">
                  <p>No documents uploaded for this student.</p>
                </div>
              ) : (
                <div className="vsd-docs">
                  {docs.map((d) => (
                    <div
                      className="vsd-doc"
                      key={d.documentId ?? d.id ?? d.fileName}
                    >
                      <div className="vd-left">
                        <div className="vd-type">
                          {d.type || d.endpoint || "Document"}
                        </div>
                        <div className="vd-name">
                          {d.fileName || d.originalName || "-"}
                        </div>
                        <div className="vd-time">
                          {d.uploadedAt
                            ? new Date(d.uploadedAt).toLocaleString()
                            : ""}
                        </div>
                      </div>

                      <div className="vd-actions">
                        {d.url ? (
                          <a
                            className="btn-ghost"
                            href={d.url}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Open
                          </a>
                        ) : (
                          <button
                            className="btn-ghost"
                            onClick={() => handleDownload(d)}
                            title={`Download ${
                              d.type || d.endpoint || "document"
                            }`}
                          >
                            Download
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminViewStudentDetails;
