import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import DataTable from "../../components/DataTable";

import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";

import Pagination from "../../components/Pagination";
import ConfirmDeleteModal from "../../components/ConfirmDeleteModal";
import { healthLibraryApi } from "../../api";
import { clip } from "../../utils";
import HealthLibraryForm from "./HealthLibraryForm";

/*
  First value = internal type saved in the database (do NOT change).
  Second value = label shown on the tab.
*/
const TABS = [
  ["estimate", "Book Appointments"],
  ["contact", "Contact Form"],
  ["callback", "Request a Call"],
];

/* Table columns for each tab: [field key, heading] */
const COLUMNS = {
  estimate: [
    ["patient_name", "Patient Name"],
    ["phone", "Mobile"],
    ["email", "Email"],
    ["country", "City / Country"],
    ["department", "Department"],
    ["preferred_doctor", "Preferred Doctor"],
    ["appointment_date", "Appointment Date"],
    ["preferred_time", "Time"],
    ["created_at", "Submitted"],
  ],
  contact: [
    ["patient_name", "Name"],
    ["phone", "Mobile"],
    ["email", "Email"],
    ["message", "Enquiry"],
    ["created_at", "Date"],
  ],
  callback: [
    ["patient_name", "Name"],
    ["phone", "Phone"],
    ["email", "Email"],
    ["preferred_time", "Preferred Time"],
    ["message", "Message"],
    ["created_at", "Date"],
  ],
};

const DATE_KEYS = ["created_at", "appointment_date"];

const formatDate = (x) => (x ? new Date(x).toLocaleDateString("en-IN") : "—");

const iconButton = (background, color, border) => ({
  width: 34,
  height: 34,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  border: `1px solid ${border}`,
  borderRadius: 7,
  background,
  color,
  cursor: "pointer",
  flexShrink: 0,
});

export default function HealthLibraryList() {
  const [type, setType] = useState("estimate");
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 10;

  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

  const [loading, setLoading] = useState(false);
  const [drawer, setDrawer] = useState({ open: false, id: null, view: false });
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      setSearch(searchInput.trim());
    }, 350);

    return () => clearTimeout(timer);
  }, [searchInput]);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await healthLibraryApi.list({
        type,
        page,
        limit,
        search,
        date: selectedDate,
      });
      setRows(data.rows || []);
      setTotal(Number(data.total || 0));
    } catch (e) {
      toast.error(e.response?.data?.message || "Unable to load records");
    } finally {
      setLoading(false);
    }
  }, [type, page, search, selectedDate]);

  useEffect(() => {
    reload();
  }, [reload]);

  function changeTab(next) {
    setType(next);
    setPage(1);
    setSearchInput("");
    setSearch("");
    setSelectedDate("");
  }

  async function remove() {
    try {
      await healthLibraryApi.remove(deleting.id);
      setDeleting(null);
      toast.success("Record deleted");
      if (rows.length === 1 && page > 1) setPage((p) => p - 1);
      else reload();
    } catch (e) {
      toast.error(e.response?.data?.message || "Delete failed");
    }
  }

  const columns = COLUMNS[type].map(([key, label]) => ({
    key,
    label,
    render: (r) => {
      if (DATE_KEYS.includes(key)) return formatDate(r[key]);
      if (key === "message") {
        return r.message ? <span className="cell-clip">{clip(r.message, 60)}</span> : "—";
      }
      return r[key] || "—";
    },
  }));

  columns.push({
    key: "actions",
    label: "Actions",
    render: (r) => (
      <div
        className="actions"
        style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "nowrap" }}
      >
        <button
          type="button"
          title="View"
          aria-label="View"
          onClick={() => setDrawer({ open: true, id: r.id, view: true })}
          style={iconButton("#eff6ff", "#2563eb", "#dbe4ea")}
        >
          <VisibilityOutlinedIcon fontSize="small" />
        </button>

        <button
          type="button"
          title="Edit"
          aria-label="Edit"
          onClick={() => setDrawer({ open: true, id: r.id, view: false })}
          style={iconButton("#f0fdfa", "#0f766e", "#dbe4ea")}
        >
          <EditOutlinedIcon fontSize="small" />
        </button>

        <button
          type="button"
          title="Delete"
          aria-label="Delete"
          onClick={() => setDeleting(r)}
          style={iconButton("#fef2f2", "#dc2626", "#fecaca")}
        >
          <DeleteOutlinedIcon fontSize="small" />
        </button>
      </div>
    ),
  });

  return (
    <div>
      <div className="page-head" style={{ gap: 16, flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {TABS.map(([key, label]) => (
            <button
              type="button"
              key={key}
              onClick={() => changeTab(key)}
              className={type === key ? "btn" : "btn secondary"}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* LIVE SEARCH + SINGLE DATE FILTER */}
      <div
        className="toolbar"
        style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}
      >
        <input
          type="text"
          placeholder="Search name, mobile, email, department..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          style={{ width: 320, maxWidth: "100%" }}
        />

        <input
          type="date"
          value={selectedDate}
          onChange={(e) => {
            setSelectedDate(e.target.value);
            setPage(1);
          }}
          aria-label="Filter by submitted date"
          title="Filter by submitted date"
          style={{ width: 200, maxWidth: "100%" }}
        />

        {(searchInput || selectedDate) && (
          <button
            type="button"
            className="btn secondary"
            onClick={() => {
              setSearchInput("");
              setSearch("");
              setSelectedDate("");
              setPage(1);
            }}
          >
            Clear
          </button>
        )}
      </div>

      {loading ? (
        <div style={{ padding: 16 }}>Loading...</div>
      ) : (
        <DataTable columns={columns} rows={rows} />
      )}
      <Pagination page={page} limit={limit} total={total} onPage={setPage} />
      <ConfirmDeleteModal
        title={deleting?.patient_name || ""}
        onClose={() => setDeleting(null)}
        onConfirm={remove}
      />
      <HealthLibraryForm
        open={drawer.open}
        id={drawer.id}
        type={type}
        view={drawer.view}
        onClose={() => setDrawer({ open: false, id: null, view: false })}
        onSaved={reload}
      />
    </div>
  );
}




