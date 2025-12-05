import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminAddClass.css";

const AdminAddClass = ({ apiBase = "http://localhost:8080" }) => {
  const navigate = useNavigate();

  // Form state
  const [form, setForm] = useState({
    className: "",
    fees: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Validation function
  const validateForm = () => {
    const newErrors = {};

    if (!form.className.trim()) {
      newErrors.className = "Class name is required";
    } else if (form.className.length < 2) {
      newErrors.className = "Class name must be at least 2 characters";
    }

    if (!form.fees) {
      newErrors.fees = "Fees is required";
    } else if (isNaN(form.fees) || Number(form.fees) < 0) {
      newErrors.fees = "Please enter a valid positive number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    // For fees field, remove non-numeric characters except decimal point
    if (name === "fees") {
      // Allow only numbers and one decimal point
      const filteredValue = value.replace(/[^\d.]/g, "");
      // Ensure only one decimal point
      const parts = filteredValue.split(".");
      if (parts.length > 2) {
        return; // Don't update if multiple decimal points
      }

      setForm((prev) => ({ ...prev, [name]: filteredValue }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }

    // Clear success message when form is edited
    if (success) {
      setSuccess(false);
    }

    // Clear error message
    if (errorMessage) {
      setErrorMessage("");
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      setErrorMessage("Please fix the errors in the form before submitting.");
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      const payload = {
        className: form.className.trim(),
        fees: Number(form.fees),
      };

      // Try multiple possible endpoints
      const endpoints = [
        `${apiBase}/api/classes/add`,
        `${apiBase}/api/classes/create`,
        `${apiBase}/api/classes/save`,
      ];

      let success = false;
      let responseData = null;

      for (const endpoint of endpoints) {
        try {
          const res = await fetch(endpoint, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify(payload),
          });

          if (res.ok || res.status === 201) {
            success = true;
            responseData = await res.json();
            break;
          }
        } catch (err) {
          // Try next endpoint
          continue;
        }
      }

      if (success) {
        setSuccess(true);

        // Reset form
        setForm({
          className: "",
          fees: "",
        });
        setErrors({});

        // Navigate to class list after 1.5 seconds
        setTimeout(() => {
          navigate("/admindashboard/view-classes");
        }, 1500);
      } else {
        throw new Error(
          "Failed to add class. Please check your backend endpoint."
        );
      }
    } catch (err) {
      console.error("Add class error:", err);
      setErrorMessage(err.message || "Failed to add class. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle form reset
  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset the form?")) {
      setForm({
        className: "",
        fees: "",
      });
      setErrors({});
      setSuccess(false);
      setErrorMessage("");
    }
  };

  // Handle back navigation
  const handleBack = () => {
    if (
      (form.className || form.fees) &&
      !window.confirm(
        "You have unsaved changes. Are you sure you want to go back?"
      )
    ) {
      return;
    }
    navigate("/admindashboard/view-classes");
  };

  if (loading) {
    return (
      <div className="loading-overlay">
        <div className="loading-spinner"></div>
        Adding class...
      </div>
    );
  }

  return (
    <div className="add-class-container">
      <div className="add-class-header">
        <h2>Add New Class</h2>
        <button className="back-btn" onClick={handleBack}>
          ← Back to Classes
        </button>
      </div>

      {success && (
        <div className="success-message">
          <span>✓ Class added successfully! Redirecting to class list...</span>
          <button
            onClick={() => {
              setSuccess(false);
              navigate("/admindashboard/view-classes");
            }}
          >
            ×
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="error-alert">
          <span>⚠️ {errorMessage}</span>
        </div>
      )}

      <div className="add-class-card">
        <form className="add-class-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="required">Class Name</label>
            <input
              type="text"
              name="className"
              className="form-input"
              value={form.className}
              onChange={handleChange}
              placeholder="Enter class name (e.g., Class 10, Nursery)"
              disabled={loading || success}
            />
            {errors.className && (
              <div className="error-message">{errors.className}</div>
            )}
          </div>

          <div className="form-group">
            <label className="required">Fees (₹)</label>
            <input
              type="text"
              name="fees"
              className="form-input"
              value={form.fees}
              onChange={handleChange}
              placeholder="Enter fees amount"
              disabled={loading || success}
            />
            {errors.fees && <div className="error-message">{errors.fees}</div>}
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="reset-btn"
              onClick={handleReset}
              disabled={loading || success}
            >
              Reset
            </button>

            <button
              type="submit"
              className={`submit-btn ${success ? "submit-success" : ""}`}
              disabled={loading || success}
            >
              {loading ? (
                <>
                  <span className="loading-spinner-small"></span>
                  Adding...
                </>
              ) : success ? (
                "✓ Added!"
              ) : (
                "Add Class"
              )}
            </button>
          </div>
        </form>
      </div>

      <div style={{ marginTop: "24px", color: "#666", fontSize: "0.9rem" }}>
        <p>
          <strong>Note:</strong>
        </p>
        <ul style={{ marginTop: "8px", paddingLeft: "20px" }}>
          <li>Class names should be unique</li>
          <li>Fees should be entered in Indian Rupees (₹)</li>
          <li>You can add multiple classes with different fee structures</li>
        </ul>
      </div>
    </div>
  );
};

export default AdminAddClass;
