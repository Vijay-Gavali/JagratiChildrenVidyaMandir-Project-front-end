import React, { useEffect, useState } from "react";
import "./AdminStudentIdCards.css";

const API_BASE = "http://localhost:8080";

const StudentIdCards = () => {
  const [students, setStudents] = useState([]);

  useEffect(() => {
    fetch(`${API_BASE}/api/users/getAll`)
      .then((res) => res.json())
      .then((data) => setStudents(data))
      .catch((err) => console.error(err));
  }, []);

  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-GB");
  };

  const getClassName = (classId) => {
    const classes = {
      1: "1st",
      2: "2nd",
      3: "3rd",
      4: "4th",
      5: "5th",
    };
    return classes[classId] || "N/A";
  };

  return (
    <div className="id-container">
      {students.map((student) => (
        <div className="id-card" key={student.userId}>
          <div className="id-header">
            JAGRATI CHILDREN VIDHYA MANDIR SCHOOL
            <div className="sub">IDENTITY CARD</div>
          </div>

          <div className="id-body">
            <img
              className="photo"
              src={`${API_BASE}/api/documents/download/${student.userId}/STUDENT_PHOTO`}
              alt="Student"
              onError={(e) => (e.target.src = "/no-photo.png")}
            />

            <div className="details">
              <table>
                <tbody>
                  <tr>
                    <th>CLASS</th>
                    <td>{getClassName(student.studentClassId)}</td>
                    <th>AD. NO</th>
                    <td>{student.admissionNo}</td>
                  </tr>
                  <tr>
                    <th>AD. DATE</th>
                    <td>{formatDate(student.admissionDate)}</td>
                    <th>DOB</th>
                    <td>{formatDate(student.dob)}</td>
                  </tr>
                </tbody>
              </table>

              <p>
                <b>NAME:</b> {student.name}
              </p>
              <p>
                <b>FATHER'S NAME:</b> {student.fatherName}
              </p>
              <p>
                <b>MOTHER'S NAME:</b> {student.motherName}
              </p>
              <p>
                <b>ADDRESS:</b> {student.address}
              </p>
              <p>
                <b>PHONE NO:</b> {student.parentPhone}
              </p>
            </div>
          </div>

          <div className="signature">Signature</div>
        </div>
      ))}
    </div>
  );
};

export default StudentIdCards;
