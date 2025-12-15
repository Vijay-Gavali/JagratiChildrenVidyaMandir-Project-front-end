import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./AdminPrintIdCard.css";

const AdminPrintIdCard = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Get class ID from navigation state
  const classId = location.state?.classId;
  const className = location.state?.className || "Class";

  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!classId) {
      setError("No class selected. Please select a class.");
      setLoading(false);
      return;
    }

    const fetchStudents = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `http://localhost:8080/api/classes/${classId}/students`
        );

        if (response.ok) {
          const data = await response.json();
          const list = Array.isArray(data) ? data : [];
          setStudents(list);
          setFilteredStudents(list);
        } else {
          // fallback: fetch all students
          const allRes = await fetch("http://localhost:8080/api/users/getAll");
          const allStudents = await allRes.json();
          const filtered = allStudents.filter(
            (s) => s.studentClassId === classId
          );
          setStudents(filtered);
          setFilteredStudents(filtered);
        }
      } catch (err) {
        setError("Failed to load students");
        setStudents([]);
        setFilteredStudents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [classId]);

  // Search
  useEffect(() => {
    if (!searchTerm) {
      setFilteredStudents(students);
    } else {
      const term = searchTerm.toLowerCase();
      setFilteredStudents(
        students.filter((s) => s.name && s.name.toLowerCase().includes(term))
      );
    }
  }, [searchTerm, students]);

  const goBack = () => {
    navigate("/admindashboard/generate-id-cards");
  };

  // Function to handle download all ID cards
  const handleDownloadAllIdCards = () => {
    if (students.length === 0) {
      alert("No students to download ID cards for.");
      return;
    }
    // Here you would implement the logic to download all ID cards
    console.log(
      `Downloading ID cards for all ${students.length} students in ${className}`
    );
    alert(
      `Downloading ID cards for all ${students.length} students in ${className}`
    );
  };

  // Function to handle download all admit cards
  const handleDownloadAllAdmitCards = () => {
    if (students.length === 0) {
      alert("No students to download admit cards for.");
      return;
    }
    // Here you would implement the logic to download all admit cards
    console.log(
      `Downloading admit cards for all ${students.length} students in ${className}`
    );
    alert(
      `Downloading admit cards for all ${students.length} students in ${className}`
    );
  };

  return (
    <div className="print-id-card-container">
      {/* Header */}
      <div className="print-id-card-header">
        <div className="header-left">
          <button className="back-btn" onClick={goBack}>
            ← Back
          </button>
          <h2 className="page-title">{className} – Student Cards</h2>
        </div>

        {!loading && !error && (
          <div className="header-right">
            <div className="bulk-actions">
              <button
                className="download-all-id-btn"
                onClick={() =>
                  navigate("/admindashboard/generate-id-cards/print-all", {
                    state: {
                      classId,
                      className,
                    },
                  })
                }
              >
                Download All ID Cards
              </button>
              <button
                className="download-all-admit-btn"
                onClick={handleDownloadAllAdmitCards}
                disabled={students.length === 0}
              >
                Download All Admit Cards
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Search - CENTERED */}
      <div className="search-section">
        <input
          type="text"
          className="search-input"
          placeholder="Search student name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Error */}
      {error && <div className="error-message">{error}</div>}

      {/* Table */}
      <div className="students-table-container">
        {loading ? (
          <div className="loading-state">Loading students...</div>
        ) : filteredStudents.length === 0 ? (
          <div className="empty-state">No students found.</div>
        ) : (
          <table className="students-table">
            <thead>
              <tr>
                <th>Sr. No.</th>
                <th>Student Name</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredStudents.map((student, index) => (
                <tr key={student.userId}>
                  <td className="text-center">{index + 1}</td>
                  <td className="text-center">{student.name || "N/A"}</td>
                  <td className="text-center">
                    <div className="action-buttons">
                      <button
                        className="idcard-btn"
                        onClick={() =>
                          navigate("/admindashboard/generate-id-cards/print", {
                            state: {
                              studentId: student.userId,
                              className,
                              studentName: student.name,
                            },
                          })
                        }
                      >
                        Download ID Card
                      </button>
                      <button
                        className="admit-btn"
                        onClick={() =>
                          navigate(
                            "/admindashboard/generate-admit-cards/print",
                            {
                              state: {
                                studentId: student.userId,
                                className,
                                studentName: student.name,
                              },
                            }
                          )
                        }
                      >
                        Download Admit Card
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminPrintIdCard;
