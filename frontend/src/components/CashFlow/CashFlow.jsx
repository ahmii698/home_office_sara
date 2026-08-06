import React, { useState, useMemo } from "react";
import "./CashFlow.css";

const DEFAULT_FIELDS = [
  "Total Cash Collection",
  "Wallet Opening",
  "Sub Total",
  "KP DOT",
  "Cash To KP",
  "Salary A/C",
  "Advances",
  "KE Bill Expense",
  "Water Bill Expense",
  "Internet Bill Expense",
  "Maintenance Expense",
  "Water/Ice Expense",
  "Tea Expense",
  "Others",
  "Wallet Closing",
];

// Helper to get ISO week number
function getWeekNumber(dateStr) {
  const date = new Date(dateStr);
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
}

export default function CashFlow() {
  const [fields, setFields] = useState(DEFAULT_FIELDS);
  const [entries, setEntries] = useState([]);

  // Add-entry form state
  const [showEntryForm, setShowEntryForm] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().slice(0, 10),
    particular: DEFAULT_FIELDS[0],
    inflow: "",
    outflow: "",
  });

  // Add-field form state
  const [showFieldForm, setShowFieldForm] = useState(false);
  const [newFieldName, setNewFieldName] = useState("");

  // Filter state
  const [filterType, setFilterType] = useState("monthly"); // daily | weekly | monthly | yearly
  const [filterDate, setFilterDate] = useState(new Date().toISOString().slice(0, 10));
  const [filterMonth, setFilterMonth] = useState(new Date().getMonth() + 1);
  const [filterYear, setFilterYear] = useState(new Date().getFullYear());

  // ---------- Handlers ----------
  const handleAddEntry = (e) => {
    e.preventDefault();
    if (!formData.particular) return;
    const newEntry = {
      id: Date.now(),
      date: formData.date,
      particular: formData.particular,
      inflow: parseFloat(formData.inflow) || 0,
      outflow: parseFloat(formData.outflow) || 0,
    };
    setEntries((prev) => [...prev, newEntry]);
    setFormData({ ...formData, inflow: "", outflow: "" });
    setShowEntryForm(false);
  };

  const handleAddField = (e) => {
    e.preventDefault();
    const name = newFieldName.trim();
    if (!name || fields.includes(name)) return;
    setFields((prev) => [...prev, name]);
    setNewFieldName("");
    setShowFieldForm(false);
  };

  const handleDeleteEntry = (id) => {
    setEntries((prev) => prev.filter((en) => en.id !== id));
  };

  // ---------- Filtering ----------
  const filteredEntries = useMemo(() => {
    return entries.filter((en) => {
      const d = new Date(en.date);
      if (filterType === "daily") {
        return en.date === filterDate;
      }
      if (filterType === "weekly") {
        const entryWeek = getWeekNumber(en.date);
        const refWeek = getWeekNumber(filterDate);
        return entryWeek === refWeek && d.getFullYear() === new Date(filterDate).getFullYear();
      }
      if (filterType === "monthly") {
        return d.getMonth() + 1 === Number(filterMonth) && d.getFullYear() === Number(filterYear);
      }
      if (filterType === "yearly") {
        return d.getFullYear() === Number(filterYear);
      }
      return true;
    });
  }, [entries, filterType, filterDate, filterMonth, filterYear]);

  // ---------- Totals per field ----------
  const fieldTotals = useMemo(() => {
    const map = {};
    fields.forEach((f) => {
      map[f] = { inflow: 0, outflow: 0 };
    });
    filteredEntries.forEach((en) => {
      if (!map[en.particular]) map[en.particular] = { inflow: 0, outflow: 0 };
      map[en.particular].inflow += en.inflow;
      map[en.particular].outflow += en.outflow;
    });
    return map;
  }, [filteredEntries, fields]);

  const grandTotal = useMemo(() => {
    return filteredEntries.reduce(
      (acc, en) => {
        acc.inflow += en.inflow;
        acc.outflow += en.outflow;
        return acc;
      },
      { inflow: 0, outflow: 0 }
    );
  }, [filteredEntries]);

  const months = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December",
  ];

  return (
    <div className="cashflow-container">
      <div className="cashflow-header">
        <h1>Cash Flow for the M/O</h1>

        {/* ---------- Filters ---------- */}
        <div className="filter-bar">
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>

          {(filterType === "daily" || filterType === "weekly") && (
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
            />
          )}

          {filterType === "monthly" && (
            <>
              <select value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)}>
                {months.map((m, i) => (
                  <option key={i} value={i + 1}>{m}</option>
                ))}
              </select>
              <input
                type="number"
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value)}
                className="year-input"
              />
            </>
          )}

          {filterType === "yearly" && (
            <input
              type="number"
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              className="year-input"
            />
          )}
        </div>

        <div className="action-bar">
          <button className="btn btn-primary" onClick={() => setShowEntryForm(true)}>
            + Add Entry
          </button>
          <button className="btn btn-secondary" onClick={() => setShowFieldForm(true)}>
            + Add Field
          </button>
        </div>
      </div>

      {/* ---------- Add Entry Modal ---------- */}
      {showEntryForm && (
        <div className="modal-overlay" onClick={() => setShowEntryForm(false)}>
          <form className="modal-box" onClick={(e) => e.stopPropagation()} onSubmit={handleAddEntry}>
            <h3>Add Cash Entry</h3>

            <label>Date</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />

            <label>Particular</label>
            <select
              value={formData.particular}
              onChange={(e) => setFormData({ ...formData, particular: e.target.value })}
              required
            >
              {fields.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>

            <label>Cash Inflow</label>
            <input
              type="number"
              placeholder="0"
              value={formData.inflow}
              onChange={(e) => setFormData({ ...formData, inflow: e.target.value })}
            />

            <label>Cash Outflow</label>
            <input
              type="number"
              placeholder="0"
              value={formData.outflow}
              onChange={(e) => setFormData({ ...formData, outflow: e.target.value })}
            />

            <div className="modal-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setShowEntryForm(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">Save</button>
            </div>
          </form>
        </div>
      )}

      {/* ---------- Add Field Modal ---------- */}
      {showFieldForm && (
        <div className="modal-overlay" onClick={() => setShowFieldForm(false)}>
          <form className="modal-box" onClick={(e) => e.stopPropagation()} onSubmit={handleAddField}>
            <h3>Add New Field</h3>
            <label>Field Name</label>
            <input
              type="text"
              placeholder="e.g. Fuel Expense"
              value={newFieldName}
              onChange={(e) => setNewFieldName(e.target.value)}
              required
            />
            <div className="modal-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setShowFieldForm(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">Add</button>
            </div>
          </form>
        </div>
      )}

      {/* ---------- Cards Grid ---------- */}
      <div className="cards-grid">
        {fields.map((field) => {
          const totals = fieldTotals[field] || { inflow: 0, outflow: 0 };
          const net = totals.inflow - totals.outflow;
          return (
            <div className="card" key={field}>
              <div className="card-title">{field}</div>
              <div className="card-row">
                <span className="label inflow-label">Inflow</span>
                <span className="value inflow-value">{totals.inflow.toLocaleString()}</span>
              </div>
              <div className="card-row">
                <span className="label outflow-label">Outflow</span>
                <span className="value outflow-value">{totals.outflow.toLocaleString()}</span>
              </div>
              <div className="card-row net-row">
                <span className="label">Net</span>
                <span className={`value ${net >= 0 ? "positive" : "negative"}`}>
                  {net.toLocaleString()}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ---------- Grand Total ---------- */}
      <div className="grand-total-card">
        <div className="gt-item">
          <span>Total Inflow</span>
          <strong className="inflow-value">{grandTotal.inflow.toLocaleString()}</strong>
        </div>
        <div className="gt-item">
          <span>Total Outflow</span>
          <strong className="outflow-value">{grandTotal.outflow.toLocaleString()}</strong>
        </div>
        <div className="gt-item">
          <span>Net Balance</span>
          <strong className={grandTotal.inflow - grandTotal.outflow >= 0 ? "positive" : "negative"}>
            {(grandTotal.inflow - grandTotal.outflow).toLocaleString()}
          </strong>
        </div>
      </div>

      {/* ---------- Entries Table ---------- */}
      <div className="entries-table-wrapper">
        <h3>Entries ({filteredEntries.length})</h3>
        <table className="entries-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Particular</th>
              <th>Inflow</th>
              <th>Outflow</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filteredEntries.length === 0 ? (
              <tr>
                <td colSpan="5" className="no-data">No entries for this period</td>
              </tr>
            ) : (
              filteredEntries
                .slice()
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .map((en) => (
                  <tr key={en.id}>
                    <td>{en.date}</td>
                    <td>{en.particular}</td>
                    <td className="inflow-value">{en.inflow ? en.inflow.toLocaleString() : "-"}</td>
                    <td className="outflow-value">{en.outflow ? en.outflow.toLocaleString() : "-"}</td>
                    <td>
                      <button className="btn-delete" onClick={() => handleDeleteEntry(en.id)}>✕</button>
                    </td>
                  </tr>
                ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}