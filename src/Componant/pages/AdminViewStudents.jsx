import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminViewStudents.css";

const ViewStudents = () => {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch all classes
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await fetch("http://localhost:8080/api/classes/getAll");
        if (res.ok) {
          const data = await res.json();
          setClasses(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error("Failed to load classes:", err);
        setClasses([]);
      }
    };

    fetchClasses();
  }, []);

  // Function to get class name by ID - FIXED: Using strict equality ===
  const getClassName = (classId) => {
    if (!classId) return "-";

    // Try to find class by classId using strict equality
    const classObj = classes.find(
      (c) =>
        c.classId === classId ||
        c.id === classId ||
        String(c.classId) === String(classId) ||
        String(c.id) === String(classId)
    );

    return classObj
      ? classObj.className || classObj.name || `Class ${classId}`
      : `Class ${classId}`;
  };

  const loadStudents = () => {
    setLoading(true);
    fetch("http://localhost:8080/api/users/getAll")
      .then((res) => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
      })
      .then((data) => setStudents(Array.isArray(data) ? data : []))
      .catch((err) => {
        console.error("API Error:", err);
        setStudents([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadStudents();
  }, []);

  // ---------------- DELETE STUDENT HANDLER ----------------
  const deleteStudent = async (id) => {
    if (!window.confirm("Are you sure you want to delete this student?"))
      return;

    try {
      const res = await fetch(`http://localhost:8080/api/users/${id}`, {
        method: "DELETE",
      });

      if (res.status === 204) {
        alert("Student deleted successfully.");
        loadStudents(); // refresh table
      } else {
        alert("Failed to delete student.");
      }
    } catch (err) {
      console.error("Delete Error:", err);
      alert("Error deleting student.");
    }
  };

  return (
    <div className="vs-container">
      <div className="vs-header">
        <h2 className="vs-title">All Students</h2>
        <div className="vs-header-buttons">
          <button
            className="vs-add-btn"
            onClick={() => navigate("/admindashboard/add-student")}
          >
            + Add Student
          </button>
          <button className="vs-refresh-btn" onClick={loadStudents}>
            ↻ Refresh
          </button>
        </div>
      </div>

      <div className="vs-table-wrap">
        <table className="vs-table">
          <thead>
            <tr>
              <th>Sr. No.</th>
              <th>Name</th>
              <th>Class Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Update</th>
              <th>View Details</th>
              <th>Delete</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" className="vs-empty">
                  Loading...
                </td>
              </tr>
            ) : students.length === 0 ? (
              <tr>
                <td colSpan="8" className="vs-empty">
                  No students found.
                </td>
              </tr>
            ) : (
              students.map((s, index) => (
                <tr key={s.userId}>
                  <td>{index + 1}</td>
                  <td>{s.name ?? "-"}</td>
                  <td>{getClassName(s.studentClassId)}</td>
                  <td>{s.email ?? "-"}</td>
                  <td>{s.studentPhone ?? "-"}</td>

                  {/* UPDATE BUTTON */}
                  <td>
                    <button
                      className="vs-update-btn"
                      onClick={() =>
                        navigate("/admindashboard/update-student", {
                          state: { studentId: s.userId },
                        })
                      }
                    >
                      Update
                    </button>
                  </td>

                  {/* VIEW DETAILS BUTTON */}
                  <td>
                    <button
                      className="vs-view-btn"
                      onClick={() =>
                        navigate("/admindashboard/view-details", {
                          state: { studentId: s.userId },
                        })
                      }
                    >
                      View
                    </button>
                  </td>

                  {/* DELETE BUTTON */}
                  <td>
                    <button
                      className="vs-delete-btn"
                      onClick={() => deleteStudent(s.userId)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ViewStudents;
