import React, { useState } from "react";
import { NavLink, Routes, Route } from "react-router-dom";
import {
  FaUserPlus,
  FaChalkboardTeacher,
  FaUsers,
  FaFileUpload,
  FaMoneyBillWave,
  FaClipboardList,
} from "react-icons/fa";
import "./AdminDashboard.css";
import AdminStudentRegistration from "./AdminStudentRegistration";
import ViewStudents from "./AdminViewStudents";
import AdminTeacherRegistration from "./AdminTeacherRegistration";
import AdminViewTeacher from "./AdminViewTeacher";
import AdminViewClasses from "./AdminViewClasses";
import AdminViewEnquiries from "./AdminViewEnquiries";
import AdminViewAttendance from "./AdminViewAttendance";
import AdminViewFees from "./AdminViewFees";
import AdminUploadStudentDocuments from "./AdminUploadStudentDocuments";
import AdminPrintStudentDetails from "./AdminPrintStudentDetails";
import ViewStudentDetails from "./AdminViewStudentDetails";
import AdminUpdateStudent from "./AdminUpdateStudent";
import AdminAddClass from "./AdminAddClass";
import AdminUpdateClass from "./AdminUpdateClass";
import AdminUploadExcel from "./AdminUploadExcel";
import AdminNotice from "./AdminNotice";

/* -------------------- Sidebar -------------------- */
const Sidebar = () => {
  const navClass = ({ isActive }) =>
    isActive ? "nav-item active" : "nav-item";

  return (
    <aside className="admin-sidebar">
      <nav className="menu">
        <NavLink to="/admindashboard/add-student" className={navClass}>
          <FaUserPlus /> <span>Add Student</span>
        </NavLink>

        <NavLink to="/admindashboard/add-teacher" className={navClass}>
          <FaChalkboardTeacher /> <span>Add Teacher</span>
        </NavLink>

        <NavLink to="/admindashboard/view-students" className={navClass}>
          <FaUsers /> <span>View All Students</span>
        </NavLink>

        <NavLink to="/admindashboard/view-teachers" className={navClass}>
          <FaUsers /> <span>View All Teachers</span>
        </NavLink>

        <NavLink to="/admindashboard/view-classes" className={navClass}>
          <FaChalkboardTeacher /> <span>View Classes</span>
        </NavLink>

        {/* NEW ITEMS */}
        <NavLink to="/admindashboard/view-attendance" className={navClass}>
          <FaClipboardList /> <span>View Attendance</span>
        </NavLink>

        <NavLink to="/admindashboard/view-fees" className={navClass}>
          <FaMoneyBillWave /> <span>Manage Fees</span>
        </NavLink>

        <NavLink to="/admindashboard/view-enquiries" className={navClass}>
          <FaUsers /> <span>View Enquiries</span>
        </NavLink>

        <NavLink to="/admindashboard/upload-student-excel" className={navClass}>
          <FaFileUpload /> <span>Upload Student Excel</span>
        </NavLink>

        <NavLink to="/admindashboard/notice" className={navClass}>
          <FaClipboardList />
          <span>Notice Board</span>
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        Logged in as <strong>Admin</strong>
      </div>
    </aside>
  );
};

/* -------------------- Main Layout -------------------- */
const AdminDashboard = () => {
  // store students and teachers so pages can update and view them
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);

  // Add teacher helper (passed to registration)
  const addTeacher = (t) => setTeachers((prev) => [t, ...prev]);

  // Add student helper (passed to registration)
  const addStudent = (studentData) => {
    const newStudent = {
      id: Date.now(),
      admissionNo: studentData.admissionNo,
      name: studentData.name,
      dob: studentData.dob,
      // include other fields if needed
    };
    setStudents((prev) => [newStudent, ...prev]);
  };

  // Update teacher points
  const updatePoints = (id, val) =>
    setTeachers((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, points: Math.max(0, t.points + val) } : t
      )
    );

  return (
    <div className="admin-page">
      <Sidebar />

      <main className="admin-content">
        <Routes>
          {/* Relative route paths (AdminDashboard should be mounted at /admindashboard/* in App.jsx) */}
          <Route
            path="add-student"
            element={<AdminStudentRegistration onAddStudent={addStudent} />}
          />
          <Route
            path="add-teacher"
            element={<AdminTeacherRegistration onAddTeacher={addTeacher} />}
          />
          {/* show view students page and pass current students */}
          <Route
            path="view-students"
            element={<ViewStudents students={students} />}
          />
          <Route
            path="view-teachers"
            element={
              <AdminViewTeacher teachers={teachers} onUpdate={updatePoints} />
            }
          />
          <Route path="view-classes" element={<AdminViewClasses />} />
          <Route path="view-attendance" element={<AdminViewAttendance />} />
          <Route path="view-fees" element={<AdminViewFees />} />
          <Route path="view-enquiries" element={<AdminViewEnquiries />} />{" "}
          <Route path="upload-student-excel" element={<AdminUploadExcel />} />
          {/* index route */}
          <Route path="upload-docs" element={<AdminUploadStudentDocuments />} />
          <Route path="print-student" element={<AdminPrintStudentDetails />} />
          <Route path="view-details" element={<ViewStudentDetails />} />
          <Route path="update-student" element={<AdminUpdateStudent />} />
          <Route path="add-class" element={<AdminAddClass />} />
          // In your routing configuration
          <Route path="update-class" element={<AdminUpdateClass />} />
          <Route path="notice" element={<AdminNotice />} />
          <Route
            path=""
            element={
              <div className="page">
                <h3>Welcome to Admin Dashboard</h3>
                <p>Use the side menu to manage students and teachers.</p>
              </div>
            }
          />
        </Routes>
      </main>
    </div>
  );
};

export default AdminDashboard;
