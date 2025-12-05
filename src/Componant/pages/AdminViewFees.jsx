import React, { useState, useEffect } from "react";
import "./AdminViewFees.css";

const AdminViewFees = () => {
  const [userId, setUserId] = useState("");
  const [feesData, setFeesData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searched, setSearched] = useState(false);

  // date filter state (ISO yyyy-mm-dd)
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // helper to format dates
  const fmtDate = (d) => {
    if (!d) return "-";
    if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return d;
    try {
      return new Date(d).toISOString().slice(0, 10);
    } catch {
      return d;
    }
  };

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    setError(null);
    setSearched(false);
    // reset filters when performing a fresh search
    setFromDate("");
    setToDate("");

    if (!userId.trim() || !/^\d+$/.test(userId)) {
      setError("Please enter a valid numeric User ID.");
      setFeesData([]);
      setFilteredData([]);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `http://localhost:8080/api/fees/user/${userId.trim()}`,
        { headers: { Accept: "application/json" } }
      );

      if (!res.ok) {
        setFeesData([]);
        setFilteredData([]);
        setSearched(true);
        setLoading(false);
        return;
      }

      const data = await res.json();
      const arr = Array.isArray(data) ? data : [];
      setFeesData(arr);
      setFilteredData(arr); // initially no filter
      setSearched(true);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch fees data.");
      setFeesData([]);
      setFilteredData([]);
      setSearched(true);
    } finally {
      setLoading(false);
    }
  };

  // filter by dueDate between fromDate and toDate (inclusive)
  const applyDateFilter = () => {
    if (!fromDate && !toDate) {
      setFilteredData(feesData);
      return;
    }

    const from = fromDate ? new Date(fromDate + "T00:00:00") : null;
    const to = toDate ? new Date(toDate + "T23:59:59") : null;

    const filtered = feesData.filter((f) => {
      const dd = f.dueDate ? new Date(f.dueDate + "T12:00:00") : null;
      if (!dd) return false;
      if (from && dd < from) return false;
      if (to && dd > to) return false;
      return true;
    });
    setFilteredData(filtered);
  };

  const clearDateFilter = () => {
    setFromDate("");
    setToDate("");
    setFilteredData(feesData);
  };

  // OPTIONAL: auto-apply filter whenever fromDate/toDate changes after a search
  useEffect(() => {
    if (searched) {
      applyDateFilter();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromDate, toDate]);

  const isFilterEnabled = searched && feesData.length > 0;

  return (
    <div className="fees-container">
      <h2 className="fees-title">Search Fees by User ID</h2>

      <form className="fees-search" onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Enter user ID (e.g. 3)"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          className="fees-input"
        />
        <button type="submit" className="fees-btn" disabled={loading}>
          {loading ? "Searching..." : "Search"}
        </button>
      </form>

      {error && <div className="fees-error">{error}</div>}

      {/* DATE FILTER VISIBLE IMMEDIATELY */}
      <div className="fees-date-filter" style={{ marginBottom: 12 }}>
        <div className="date-field">
          <label>From</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            disabled={!isFilterEnabled}
          />
        </div>

        <div className="date-field">
          <label>To</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            disabled={!isFilterEnabled}
          />
        </div>

        <div className="filter-actions">
          <button
            className="fees-filter-btn"
            onClick={(e) => {
              e.preventDefault();
              applyDateFilter();
            }}
            disabled={!isFilterEnabled}
          >
            Filter
          </button>
          <button
            className="fees-clear-btn"
            onClick={(e) => {
              e.preventDefault();
              clearDateFilter();
            }}
            disabled={!isFilterEnabled}
          >
            Clear
          </button>
        </div>
      </div>

      {/* Results */}
      <div className="fees-results">
        {loading ? (
          <div className="fees-info">Loading...</div>
        ) : searched && filteredData.length === 0 ? (
          <div className="fees-empty">
            No fees records found for user {userId}.
          </div>
        ) : (
          // show table only when there is data (or before search nothing is shown)
          filteredData.length > 0 && (
            <div className="fees-table-wrap">
              <table className="fees-table">
                <thead>
                  <tr>
                    <th>Amount</th>
                    <th>Due Date</th>
                    <th>Status</th>
                    <th>Payment Date</th>
                    <th>Remaining</th>
                    <th>Paid</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredData.map((f, idx) => (
                    <tr key={idx}>
                      <td>₹ {f.amount ?? "-"}</td>
                      <td>{fmtDate(f.dueDate)}</td>
                      <td>
                        <span
                          className={
                            f.paymentStatus === "Paid"
                              ? "status-badge paid"
                              : "status-badge pending"
                          }
                        >
                          {f.paymentStatus ?? "-"}
                        </span>
                      </td>
                      <td>{f.paymentDate ? fmtDate(f.paymentDate) : "-"}</td>
                      <td>₹ {f.remainingAmount ?? "-"}</td>
                      <td>₹ {f.paidAmount ?? "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default AdminViewFees;
