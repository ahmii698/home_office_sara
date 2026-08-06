import React, { useState, useMemo, useEffect } from "react";
import "./DailySheet.css";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

const todayISO = () => new Date().toISOString().slice(0, 10);

const emptyForm = () => ({
  id: null,
  date: todayISO(),
  opening: "",
  inflows: [{ id: uid(), label: "Drawn", amount: "" }],
  outflows: [
    { id: uid(), label: "Salary A/c", amount: "" },
    { id: uid(), label: "KP Dept", amount: "" },
    { id: uid(), label: "Expenses", amount: "" },
    { id: uid(), label: "Others", amount: "" },
  ],
  walletClosing: "",
  note: "",
});

const num = (v) => {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : 0;
};

const sumLines = (lines) => lines.reduce((s, l) => s + num(l.amount), 0);

const formatMoney = (n) =>
  "Rs " + Math.round(n).toLocaleString("en-PK", { maximumFractionDigits: 0 });

const formatDateLabel = (iso) => {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

const startOfWeek = (iso) => {
  const d = new Date(iso + "T00:00:00");
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
};

const addDays = (d, n) => {
  const c = new Date(d);
  c.setDate(c.getDate() + n);
  return c;
};

const isoOf = (d) => d.toISOString().slice(0, 10);

function computeEntry(entry) {
  const inflowTotal = sumLines(entry.inflows);
  const outflowTotal = sumLines(entry.outflows);
  const available = num(entry.opening) + inflowTotal;
  const closing = available - outflowTotal;
  return { inflowTotal, outflowTotal, available, closing };
}

const STORAGE_KEY = "dailyCashSheet_entries_v1";
const TITLE_KEY = "dailyCashSheet_title_v1";

export default function DailySheet() {
  const [entries, setEntries] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const [registerTitle, setRegisterTitle] = useState(() => {
    try {
      return localStorage.getItem(TITLE_KEY) || "M/O Register";
    } catch {
      return "M/O Register";
    }
  });

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm());
  const [editingId, setEditingId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  const currentYear = new Date().getFullYear();
  const [filterYear, setFilterYear] = useState(currentYear);
  const [filterMonth, setFilterMonth] = useState("all");
  const [viewMode, setViewMode] = useState("daily");

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    } catch {}
  }, [entries]);

  useEffect(() => {
    try {
      localStorage.setItem(TITLE_KEY, registerTitle);
    } catch {}
  }, [registerTitle]);

  const availableYears = useMemo(() => {
    const years = new Set(entries.map((e) => new Date(e.date).getFullYear()));
    years.add(currentYear);
    return Array.from(years).sort((a, b) => b - a);
  }, [entries, currentYear]);

  // ---- form helpers ----
  const openAddForm = () => {
    setForm(emptyForm());
    setEditingId(null);
    setShowForm(true);
  };

  const openEditForm = (entry) => {
    setForm(JSON.parse(JSON.stringify(entry)));
    setEditingId(entry.id);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm());
  };

  const updateBase = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const updateLine = (section, id, key, value) =>
    setForm((f) => ({
      ...f,
      [section]: f[section].map((l) => (l.id === id ? { ...l, [key]: value } : l)),
    }));

  const addLine = (section) =>
    setForm((f) => ({
      ...f,
      [section]: [...f[section], { id: uid(), label: "", amount: "" }],
    }));

  const removeLine = (section, id) =>
    setForm((f) => ({ ...f, [section]: f[section].filter((l) => l.id !== id) }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanLines = (lines) =>
      lines
        .filter((l) => l.label.trim() !== "" || l.amount !== "")
        .map((l) => ({ ...l, label: l.label.trim() || "Untitled" }));

    const payload = {
      ...form,
      id: editingId || uid(),
      inflows: cleanLines(form.inflows),
      outflows: cleanLines(form.outflows),
    };

    setEntries((prev) => {
      if (editingId) {
        return prev.map((en) => (en.id === editingId ? payload : en));
      }
      return [...prev, payload];
    });

    closeForm();
  };

  const handleDelete = (id) => {
    if (window.confirm("Delete this entry? This cannot be undone.")) {
      setEntries((prev) => prev.filter((e) => e.id !== id));
    }
  };

  // ---- filtering ----
  const inYearMonth = (entry, ignoreMonth = false) => {
    const d = new Date(entry.date);
    if (d.getFullYear() !== filterYear) return false;
    if (!ignoreMonth && filterMonth !== "all" && d.getMonth() !== Number(filterMonth)) return false;
    return true;
  };

  const filteredEntries = useMemo(() => {
    return entries
      .filter((e) => inYearMonth(e, viewMode === "monthly"))
      .sort((a, b) => (a.date < b.date ? 1 : -1));
  }, [entries, filterYear, filterMonth, viewMode]);

  const totals = useMemo(() => {
    return filteredEntries.reduce(
      (acc, e) => {
        const c = computeEntry(e);
        acc.available += c.available;
        acc.outflow += c.outflowTotal;
        acc.closing += c.closing;
        return acc;
      },
      { available: 0, outflow: 0, closing: 0 }
    );
  }, [filteredEntries]);

  const weeklyGroups = useMemo(() => {
    const groups = {};
    filteredEntries.forEach((entry) => {
      const start = startOfWeek(entry.date);
      const key = isoOf(start);
      if (!groups[key]) {
        groups[key] = { key, start, end: addDays(start, 6), entries: [] };
      }
      groups[key].entries.push(entry);
    });
    return Object.values(groups).sort((a, b) => (a.key < b.key ? 1 : -1));
  }, [filteredEntries]);

  const monthlyGroups = useMemo(() => {
    const groups = {};
    filteredEntries.forEach((entry) => {
      const m = new Date(entry.date).getMonth();
      if (!groups[m]) groups[m] = { month: m, entries: [] };
      groups[m].entries.push(entry);
    });
    return Object.values(groups).sort((a, b) => a.month - b.month);
  }, [filteredEntries]);

  const groupTotals = (list) =>
    list.reduce(
      (acc, e) => {
        const c = computeEntry(e);
        acc.available += c.available;
        acc.outflow += c.outflowTotal;
        acc.closing += c.closing;
        return acc;
      },
      { available: 0, outflow: 0, closing: 0 }
    );

  return (
    <div className="ds-app">
      <header className="ds-header">
        <div className="ds-header-top">
          <div className="ds-brand">
            <span className="ds-brand-mark">Rs</span>
            <div>
              <h1>Daily Cash Sheet</h1>
              <input
                className="ds-title-input"
                value={registerTitle}
                onChange={(e) => setRegisterTitle(e.target.value)}
                placeholder="Branch / M-O name"
              />
            </div>
          </div>
          <button className="ds-btn ds-btn-primary" onClick={openAddForm}>
            <span className="ds-plus">+</span> Add entry
          </button>
        </div>

        <div className="ds-filters">
          <div className="ds-filter-group">
            <label>Year</label>
            <select value={filterYear} onChange={(e) => setFilterYear(Number(e.target.value))}>
              {availableYears.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          {viewMode !== "monthly" && (
            <div className="ds-filter-group">
              <label>Month</label>
              <select value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)}>
                <option value="all">All months</option>
                {MONTHS.map((m, i) => (
                  <option key={m} value={i}>{m}</option>
                ))}
              </select>
            </div>
          )}

          <div className="ds-filter-group ds-view-toggle">
            <label>View</label>
            <div className="ds-segmented">
              {["daily", "weekly", "monthly"].map((v) => (
                <button
                  key={v}
                  className={viewMode === v ? "active" : ""}
                  onClick={() => setViewMode(v)}
                  type="button"
                >
                  {v[0].toUpperCase() + v.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      <section className="ds-summary">
        <div className="ds-summary-card ds-in">
          <span className="ds-summary-label">Available cash</span>
          <span className="ds-summary-value">{formatMoney(totals.available)}</span>
        </div>
        <div className="ds-summary-card ds-out">
          <span className="ds-summary-label">Total out flow</span>
          <span className="ds-summary-value">{formatMoney(totals.outflow)}</span>
        </div>
        <div className="ds-summary-card ds-net">
          <span className="ds-summary-label">Net closing</span>
          <span className="ds-summary-value">{formatMoney(totals.closing)}</span>
        </div>
      </section>

      <main className="ds-list">
        {viewMode === "daily" && (
          filteredEntries.length === 0 ? (
            <EmptyState onAdd={openAddForm} />
          ) : (
            filteredEntries.map((entry) => (
              <EntryCard
                key={entry.id}
                entry={entry}
                expanded={expandedId === entry.id}
                onToggle={() => setExpandedId(expandedId === entry.id ? null : entry.id)}
                onEdit={() => openEditForm(entry)}
                onDelete={() => handleDelete(entry.id)}
              />
            ))
          )
        )}

        {viewMode === "weekly" && (
          weeklyGroups.length === 0 ? (
            <EmptyState onAdd={openAddForm} />
          ) : (
            weeklyGroups.map((g) => {
              const t = groupTotals(g.entries);
              const label = `${g.start.toLocaleDateString("en-GB", { day: "2-digit", month: "short" })} – ${g.end.toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}`;
              return (
                <GroupCard
                  key={g.key}
                  title={`Week of ${label}`}
                  subtitle={`${g.entries.length} ${g.entries.length === 1 ? "entry" : "entries"}`}
                  totals={t}
                  entries={g.entries}
                  expanded={expandedId === g.key}
                  onToggle={() => setExpandedId(expandedId === g.key ? null : g.key)}
                  onEditEntry={openEditForm}
                  onDeleteEntry={handleDelete}
                />
              );
            })
          )
        )}

        {viewMode === "monthly" && (
          monthlyGroups.length === 0 ? (
            <EmptyState onAdd={openAddForm} />
          ) : (
            monthlyGroups.map((g) => {
              const t = groupTotals(g.entries);
              const key = `m-${g.month}`;
              return (
                <GroupCard
                  key={key}
                  title={MONTHS[g.month]}
                  subtitle={`${g.entries.length} ${g.entries.length === 1 ? "entry" : "entries"}`}
                  totals={t}
                  entries={g.entries}
                  expanded={expandedId === key}
                  onToggle={() => setExpandedId(expandedId === key ? null : key)}
                  onEditEntry={openEditForm}
                  onDeleteEntry={handleDelete}
                />
              );
            })
          )
        )}
      </main>

      {showForm && (
        <div className="ds-overlay" onClick={closeForm}>
          <div className="ds-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ds-modal-head">
              <h2>{editingId ? "Edit entry" : "Add entry"}</h2>
              <button className="ds-icon-btn" onClick={closeForm} aria-label="Close">×</button>
            </div>

            <form onSubmit={handleSubmit} className="ds-form">
              <div className="ds-form-row">
                <div className="ds-field">
                  <label>Date</label>
                  <input
                    type="date"
                    required
                    value={form.date}
                    onChange={(e) => updateBase("date", e.target.value)}
                  />
                </div>
                <div className="ds-field">
                  <label>Opening balance</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0"
                    value={form.opening}
                    onChange={(e) => updateBase("opening", e.target.value)}
                  />
                </div>
              </div>

              <LineSection
                title="Inflow"
                hint="Cash coming in"
                tone="in"
                lines={form.inflows}
                onAdd={() => addLine("inflows")}
                onRemove={(id) => removeLine("inflows", id)}
                onChange={(id, key, value) => updateLine("inflows", id, key, value)}
              />

              <LineSection
                title="Out flow"
                hint="Cash going out"
                tone="out"
                lines={form.outflows}
                onAdd={() => addLine("outflows")}
                onRemove={(id) => removeLine("outflows", id)}
                onChange={(id, key, value) => updateLine("outflows", id, key, value)}
              />

              <div className="ds-form-row">
                <div className="ds-field">
                  <label>Wallet closing</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0"
                    value={form.walletClosing}
                    onChange={(e) => updateBase("walletClosing", e.target.value)}
                  />
                </div>
                <div className="ds-field">
                  <label>Note (optional)</label>
                  <input
                    type="text"
                    placeholder="Any remarks"
                    value={form.note}
                    onChange={(e) => updateBase("note", e.target.value)}
                  />
                </div>
              </div>

              <div className="ds-form-actions">
                <button type="button" className="ds-btn" onClick={closeForm}>Cancel</button>
                <button type="submit" className="ds-btn ds-btn-primary">
                  {editingId ? "Save changes" : "Save entry"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function LineSection({ title, hint, tone, lines, onAdd, onRemove, onChange }) {
  return (
    <div className={`ds-line-section ds-${tone}`}>
      <div className="ds-line-section-head">
        <div>
          <h3>{title}</h3>
          <span className="ds-hint">{hint}</span>
        </div>
        <button type="button" className="ds-btn ds-btn-ghost" onClick={onAdd}>
          <span className="ds-plus">+</span> Add field
        </button>
      </div>

      {lines.length === 0 && <p className="ds-hint">No fields yet.</p>}

      {lines.map((line) => (
        <div className="ds-line-row" key={line.id}>
          <input
            type="text"
            placeholder="Label"
            value={line.label}
            onChange={(e) => onChange(line.id, "label", e.target.value)}
          />
          <input
            type="number"
            step="0.01"
            placeholder="0"
            value={line.amount}
            onChange={(e) => onChange(line.id, "amount", e.target.value)}
          />
          <button
            type="button"
            className="ds-icon-btn ds-remove"
            onClick={() => onRemove(line.id)}
            aria-label="Remove field"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}

function EntryCard({ entry, expanded, onToggle, onEdit, onDelete }) {
  const c = computeEntry(entry);
  return (
    <article className="ds-card">
      <div className="ds-card-main" onClick={onToggle}>
        <div className="ds-card-date">
          <span className="ds-day">{formatDateLabel(entry.date)}</span>
          {entry.note && <span className="ds-note">{entry.note}</span>}
        </div>
        <div className="ds-card-figures">
          <Figure label="Available" value={c.available} tone="in" />
          <Figure label="Out flow" value={c.outflowTotal} tone="out" />
          <Figure label="Closing" value={c.closing} tone="net" />
          <Figure label="Wallet" value={num(entry.walletClosing)} tone="neutral" />
        </div>
        <span className={`ds-chevron ${expanded ? "open" : ""}`}>˅</span>
      </div>

      {expanded && (
        <div className="ds-card-detail">
          <div className="ds-detail-cols">
            <div className="ds-detail-col ds-in">
              <h4>Inflow</h4>
              <div className="ds-detail-line">
                <span>Opening balance</span>
                <span>{formatMoney(num(entry.opening))}</span>
              </div>
              {entry.inflows.map((l) => (
                <div className="ds-detail-line" key={l.id}>
                  <span>{l.label}</span>
                  <span>{formatMoney(num(l.amount))}</span>
                </div>
              ))}
            </div>
            <div className="ds-detail-col ds-out">
              <h4>Out flow</h4>
              {entry.outflows.map((l) => (
                <div className="ds-detail-line" key={l.id}>
                  <span>{l.label}</span>
                  <span>{formatMoney(num(l.amount))}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="ds-card-actions">
            <button className="ds-btn" onClick={onEdit}>Edit</button>
            <button className="ds-btn ds-btn-danger" onClick={onDelete}>Delete</button>
          </div>
        </div>
      )}
    </article>
  );
}

function GroupCard({ title, subtitle, totals, entries, expanded, onToggle, onEditEntry, onDeleteEntry }) {
  return (
    <article className="ds-card">
      <div className="ds-card-main" onClick={onToggle}>
        <div className="ds-card-date">
          <span className="ds-day">{title}</span>
          <span className="ds-note">{subtitle}</span>
        </div>
        <div className="ds-card-figures">
          <Figure label="Available" value={totals.available} tone="in" />
          <Figure label="Out flow" value={totals.outflow} tone="out" />
          <Figure label="Closing" value={totals.closing} tone="net" />
        </div>
        <span className={`ds-chevron ${expanded ? "open" : ""}`}>˅</span>
      </div>

      {expanded && (
        <div className="ds-card-detail">
          {entries
            .slice()
            .sort((a, b) => (a.date < b.date ? 1 : -1))
            .map((entry) => {
              const c = computeEntry(entry);
              return (
                <div className="ds-mini-row" key={entry.id}>
                  <span className="ds-mini-date">{formatDateLabel(entry.date)}</span>
                  <span className="ds-mini-figure ds-in">{formatMoney(c.available)}</span>
                  <span className="ds-mini-figure ds-out">{formatMoney(c.outflowTotal)}</span>
                  <span className="ds-mini-figure ds-net">{formatMoney(c.closing)}</span>
                  <button className="ds-icon-btn" onClick={() => onEditEntry(entry)} aria-label="Edit">✎</button>
                  <button className="ds-icon-btn ds-remove" onClick={() => onDeleteEntry(entry.id)} aria-label="Delete">×</button>
                </div>
              );
            })}
        </div>
      )}
    </article>
  );
}

function Figure({ label, value, tone }) {
  return (
    <div className={`ds-figure ds-${tone}`}>
      <span className="ds-figure-label">{label}</span>
      <span className="ds-figure-value">{formatMoney(value)}</span>
    </div>
  );
}

function EmptyState({ onAdd }) {
  return (
    <div className="ds-empty">
      <p className="ds-empty-title">No entries for this period</p>
      <p className="ds-empty-body">Add today's cash sheet to start the register.</p>
      <button className="ds-btn ds-btn-primary" onClick={onAdd}>
        <span className="ds-plus">+</span> Add entry
      </button>
    </div>
  );
}