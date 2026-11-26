import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Drawer from "../../components/Drawer";
import { healthLibraryApi } from "../../api";
import api from "../../api/client";

/* Every field the form can send. Keys not shown for a tab are simply left empty. */
const empty = {
  patient_name: "",
  phone: "",
  email: "",
  country: "",
  preferred_location: "",
  age: "",
  gender: "",
  visited_before: "",
  appointment_date: "",
  preferred_time: "",
  department: "",
  preferred_doctor: "",
  contact_consent: "0",
  subject: "",
  message: "",
  disease: "",
  hospital_name: "",
  treatment_start_date: "",
  treatment_end_date: "",
  amount: "",
  post_op_details: "",
};

const names = {
  estimate: "Book Appointment",
  contact: "Contact Enquiry",
  // callback: "Call Request",
};

/*
  Fields per tab: [key, label, kind, options?]
  kind: text | email | tel | number | date | time | select | textarea | checkbox
*/
const fields = {
  estimate: [
    ["patient_name", "Patient name", "text"],
    ["phone", "Mobile number", "tel"],
    ["email", "Email address", "email"],
    ["country", "City / Country", "text"],
    ["preferred_location", "Preferred KIMS RENOVA location", "text"],
    ["age", "Age", "number"],
    ["gender", "Gender", "select", ["Male", "Female", "Other"]],
    ["visited_before", "Have you visited us before?", "select", ["Yes", "No"]],
    ["appointment_date", "Preferred appointment date", "date"],
    ["preferred_time", "Preferred appointment time", "time"],
    ["department", "Department", "text"],
    ["preferred_doctor", "Preferred doctor", "text"],
    ["message", "Additional information", "textarea"],
    ["contact_consent", "Agreed to be contacted about this appointment", "checkbox"],
  ],
  contact: [
    ["patient_name", "Name", "text"],
    ["email", "Email address", "email"],
    ["phone", "Mobile number", "tel"],
    ["message", "How can we help?", "textarea"],
  ],
  // callback: [
  //   ["patient_name", "Name", "text"],
  //   ["phone", "Phone", "tel"],
  //   ["email", "Email", "email"],
  //   ["preferred_time", "Preferred time", "text"],
  //   ["message", "Message", "textarea"],
  // ],
};

const REQUIRED = ["patient_name", "phone"];

const parse = (x) => {
  try {
    const v = typeof x === "string" ? JSON.parse(x || "[]") : x || [];
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
};

/* MySQL DATE may arrive as "2026-11-20" or as an ISO timestamp. Return yyyy-mm-dd. */
function toDateInput(value) {
  if (!value) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

const isOn = (v) => ["1", "true", "on", "yes"].includes(String(v).toLowerCase());

const fileBox = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 12,
  padding: "9px 12px",
  marginTop: 7,
  border: "1px solid #e2e8f0",
  borderRadius: 8,
};

export default function HealthLibraryForm({
  open,
  id,
  type = "estimate",
  view = false,
  onClose,
  onSaved,
}) {
  const [form, setForm] = useState(empty);
  const [reports, setReports] = useState([]);
  const [files, setFiles] = useState([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm(empty);
    setReports([]);
    setFiles([]);

    if (id) {
      healthLibraryApi
        .get(id)
        .then(({ data }) => {
          const row = data.data;
          setForm({
            ...empty,
            ...row,
            age: row.age ?? "",
            appointment_date: toDateInput(row.appointment_date),
            treatment_start_date: row.treatment_start_date?.slice(0, 10) || "",
            treatment_end_date: row.treatment_end_date?.slice(0, 10) || "",
            contact_consent: row.contact_consent ? "1" : "0",
          });
          setReports(parse(row.previous_reports));
        })
        .catch(() => toast.error("Unable to load record"));
    }
  }, [open, id, type]);

  function setValue(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function submit(e) {
    e.preventDefault();
    if (view) return;
    setBusy(true);
    try {
      const fd = new FormData();
      // send only the form's own fields (not id, slug, form_details, etc.)
      Object.keys(empty).forEach((k) => {
        const v = form[k];
        fd.append(k, v === null || v === undefined ? "" : v);
      });
      fd.append("type", type);
      files.forEach((f) => fd.append("reports[]", f));
      if (id) await healthLibraryApi.update(id, fd);
      else await healthLibraryApi.create(fd);
      toast.success(id ? "Record updated" : "Record added");
      onSaved?.();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Save failed");
    } finally {
      setBusy(false);
    }
  }

  async function download(index, name) {
    try {
      const response = await api.get(`/health-library/${id}/reports/${index}`, {
        responseType: "blob",
      });
      const url = URL.createObjectURL(response.data);
      const a = document.createElement("a");
      a.href = url;
      a.download = name || "report";
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      toast.error("Download failed");
    }
  }

  function addFiles(e) {
    const newFiles = Array.from(e.target.files || []);
    setFiles((previous) => {
      const combined = [...previous];
      newFiles.forEach((file) => {
        const exists = combined.some(
          (f) =>
            f.name === file.name &&
            f.size === file.size &&
            f.lastModified === file.lastModified
        );
        if (!exists) combined.push(file);
      });
      if (combined.length > 20) {
        toast.error("Maximum 20 medical reports allowed.");
        return previous;
      }
      return combined;
    });
    e.target.value = ""; // allow picking more files again
  }

  function renderField([key, label, kind, options]) {
    const value = form[key] ?? "";
    const required = REQUIRED.includes(key);
    const full = kind === "textarea" || kind === "checkbox";
    const wrapperStyle = full ? { gridColumn: "1 / -1" } : undefined;

    if (kind === "checkbox") {
      return (
        <div key={key} style={wrapperStyle}>
          <label
            style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 400, margin: 0 }}
          >
            <input
              type="checkbox"
              disabled={view}
              checked={isOn(value)}
              onChange={(e) => setValue(key, e.target.checked ? "1" : "0")}
              style={{ width: "auto", flex: "none" }}
            />
            {label}
          </label>
        </div>
      );
    }

    return (
      <div key={key} style={wrapperStyle}>
        <label>
          {label}
          {required ? " *" : ""}
        </label>

        {kind === "textarea" && (
          <textarea
            rows={4}
            disabled={view}
            value={value}
            onChange={(e) => setValue(key, e.target.value)}
          />
        )}

        {kind === "select" && (
          <select disabled={view} value={value} onChange={(e) => setValue(key, e.target.value)}>
            <option value="">Select</option>
            {/* keep any older/different saved value so it is not lost on save */}
            {value && !options.includes(value) ? <option value={value}>{value}</option> : null}
            {options.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        )}

        {kind !== "textarea" && kind !== "select" && (
          <input
            disabled={view}
            required={required}
            type={
              kind === "time" && value && !/^\d{2}:\d{2}/.test(value) ? "text" : kind
            }
            min={kind === "number" ? 0 : undefined}
            value={kind === "time" && /^\d{2}:\d{2}/.test(value) ? value.slice(0, 5) : value}
            onChange={(e) => setValue(key, e.target.value)}
          />
        )}
      </div>
    );
  }

  return (
    <Drawer
      open={open}
      title={`${view ? "View" : id ? "Edit" : "Add"} ${names[type]}`}
      onClose={onClose}
      width="720px"
    >
      <form className="drawer-body form-grid" onSubmit={submit}>
        {fields[type].map(renderField)}

        {type === "estimate" && (
          <div style={{ gridColumn: "1 / -1" }}>
            <label>Medical Reports</label>

            {!view && (
              <>
                <input
                  type="file"
                  name="reports[]"
                  accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx"
                  multiple
                  onChange={addFiles}
                  style={{ width: "100%", marginTop: 8 }}
                />
                <p style={{ fontSize: 12, color: "#64748b", marginTop: 6 }}>
                  You can select multiple files or add more files one by one. PDF, images and
                  Word documents are supported.
                </p>
              </>
            )}

            {files.length > 0 && !view && (
              <div style={{ marginTop: 14 }}>
                <strong>Selected Medical Reports ({files.length})</strong>
                {files.map((file, index) => (
                  <div key={`${file.name}-${index}`} style={fileBox}>
                    <span style={{ fontSize: 13, overflowWrap: "anywhere" }}>
                      {index + 1}. {file.name}
                    </span>
                    <button
                      type="button"
                      className="btn secondary small"
                      onClick={() => setFiles((prev) => prev.filter((_, i) => i !== index))}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}

            {reports.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <strong>Uploaded Medical Reports ({reports.length})</strong>
                {reports.map((report, index) => (
                  <div key={index} style={fileBox}>
                    <span style={{ fontSize: 13, overflowWrap: "anywhere" }}>
                      {index + 1}. {report.name}
                    </span>
                    <button
                      type="button"
                      className="btn secondary small"
                      onClick={() => download(index, report.name)}
                    >
                      Download
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div
          className="drawer-actions"
          style={{
            gridColumn: "1 / -1",
            display: "flex",
            justifyContent: "end",
            gap: 10,
          }}
        >
          <button type="button" className="btn secondary" onClick={onClose}>
            {view ? "Close" : "Cancel"}
          </button>
          {!view && (
            <button className="btn" type="submit" disabled={busy}>
              {busy ? "Saving..." : id ? "Update" : "Save"}
            </button>
          )}
        </div>
      </form>
    </Drawer>
  );
}




