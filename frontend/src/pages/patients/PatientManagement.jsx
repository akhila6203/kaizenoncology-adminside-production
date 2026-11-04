import { useEffect, useState } from "react";
import api from "../../api/client";


const SECTIONS = {

  personal: [
    ["fullName", "Full name"],
    ["dob", "Date of birth", "date"],
    ["gender", "Gender"],
    ["phone", "Phone number"],
    ["email", "Email address"],
    ["address", "Address", "textarea"],
    ["emergencyName", "Emergency contact name"],
    ["emergencyRelation", "Emergency contact relationship"],
    ["emergencyPhone", "Emergency contact phone"],
  ],

  passport: [
    ["passportNumber", "Passport number"],
    ["citizenship", "Citizenship"],
    ["nationality", "Nationality"],
    ["residence", "Country of residence"],
    ["passportIssue", "Passport issue date", "date"],
    ["passportExpiry", "Passport expiry date", "date"],
  ],

  medical: [
    ["condition", "Medical condition", "textarea"],
    ["diagnosis", "Diagnosis", "textarea"],
    ["medicalHistory", "Medical history", "textarea"],
    ["existingConditions", "Existing conditions", "textarea"],
    ["previousSurgeries", "Previous surgeries", "textarea"],
    ["medications", "Current medications", "textarea"],
    ["allergies", "Allergies", "textarea"],
    ["labReportsSummary", "Lab reports summary", "textarea"],
    ["scanSummary", "Scan summary", "textarea"],
    ["diagnosticHistory", "Diagnostic history", "textarea"],
    ["medicalSummary", "Medical summary", "textarea"],
    ["previousTreatmentSummary", "Previous treatment summary", "textarea"],
    ["doctorNotes", "Treating doctor notes and recommendations", "textarea"],
  ],

  documents: [],

  visa: [
    ["visaType", "Visa type"],
    ["visaCategory", "Visa category"],
    [
      "visaStatus",
      "Visa application status",
      "select",
      [
        "Not Started",
        "In Progress",
        "Submitted",
        "Under Review",
        "Approved",
        "Rejected",
        "On Hold",
      ],
    ],
    ["visaReference", "Visa application / reference number"],
    ["visaApplicationDate", "Application date", "date"],
    ["visaApprovalDate", "Approval date", "date"],
    ["visaValidity", "Visa validity"],
    ["visaExpiry", "Visa expiry date", "date"],
    ["medicalVisaType", "Medical visa type"],
    ["medicalVisaNumber", "Medical visa number"],
    ["attendantName", "Medical attendant name"],
    ["attendantRelationship", "Attendant relationship"],
    ["attendantPassport", "Attendant passport number"],
    ["attendantVisa", "Medical attendant visa details", "textarea"],
    // ["internalRemarks", "Internal visa remarks", "textarea"],
  ],

  treatment: [
    ["treatmentType", "Type of surgery / medical treatment"],
    ["specialty", "Medical specialty"],
    ["department", "Department"],
    ["treatmentPlan", "Proposed treatment plan", "textarea"],
    ["estimatedCost", "Estimated treatment cost"],
    ["approvedQuotation", "Approved quotation / reference"],
    ["treatmentDuration", "Expected treatment duration"],
    [
      "treatmentStatus",
      "Treatment status",
      "select",
      [
        "Under Review",
        "Consultation Pending",
        "Treatment Planned",
        "Confirmed",
        "Admitted",
        "In Treatment",
        "Discharged",
        "Follow-up",
      ],
    ],
    ["plannedAdmission", "Planned admission date", "date"],
    ["plannedDischarge", "Planned discharge date", "date"],
    ["actualAdmission", "Actual admission date", "date"],
    ["actualDischarge", "Actual discharge date", "date"],
  ],

 hospital: [
  ["doctorName", "Treating doctor's name"],
  ["doctorSpecialty", "Doctor's specialty"],

  ["hospitalName", "Hospital / healthcare facility name"],
  ["hospitalAddress", "Hospital address", "textarea"],
  ["hospitalPhone", "Hospital contact number"],
  ["hospitalEmail", "Hospital email address"],

  ["coordinatorName", "Assigned medical coordinator"],
  ["coordinatorPhone", "Coordinator contact number"],
  ["coordinatorEmail", "Coordinator email address"],

  ["appointmentDate", "Appointment date", "date"],
  ["appointmentTime", "Consultation timing", "time"],
  [
    "additionalAppointments",
    "Additional appointment dates and consultation timings",
    "textarea",
  ],

  ["admissionConfirmation", "Hospital admission confirmation", "textarea"],
],

stay: [
  ["hotelName", "Hotel or accommodation name"],

  [
    "accommodationType",
    "Accommodation type",
    "select",
    [
      "Hotel",
      "Guest House",
      "Serviced Apartment",
      "Hospital Accommodation",
      "Other",
    ],
  ],

  ["hotelAddress", "Full accommodation address", "textarea"],
  ["accommodationContactName", "Accommodation contact person"],
  ["hotelPhone", "Accommodation contact number"],
  ["accommodationEmail", "Accommodation email address"],

  ["checkIn", "Check-in date", "date"],
  ["checkOut", "Check-out date", "date"],

  ["bookingReference", "Booking confirmation / reservation number"],
  ["bookingConfirmation", "Booking confirmation details", "textarea"],

  [
    "accommodationStatus",
    "Accommodation status",
    "select",
    [
      "Not Arranged",
      "Pending",
      "Confirmed",
      "Checked In",
      "Checked Out",
      "Cancelled",
    ],
  ],

  [
    "airportPickupRequired",
    "Airport pickup required",
    "select",
    ["Yes", "No"],
  ],
  ["airportPickupDate", "Airport pickup date", "date"],
  ["airportPickupTime", "Airport pickup time", "time"],
  ["airportPickupLocation", "Airport pickup location"],
  ["airportDropLocation", "Airport drop-off location"],

  ["localTransport", "Local transportation arrangements", "textarea"],
  ["transportationContact", "Transportation contact person"],
  ["transportationPhone", "Transportation contact number"],

  ["additionalStayNotes", "Additional accommodation notes", "textarea"],
],

travel: [
  // Departure Details
  ["departureCountry", "Country of departure"],
  ["departureCity", "City of departure"],
  ["departureAirport", "Departure airport"],

  // Arrival Details
  ["arrivalDate", "Planned arrival date", "date"],
  ["arrivalTime", "Planned arrival time", "time"],
  ["arrivalAirport", "Arrival airport"],
  ["arrivalCity", "Destination city"],
  ["arrivalCountry", "Destination country"],

  // Outbound Flight Details
  ["airline", "Airline name"],
  ["flightNumber", "Outbound flight number"],
  ["flightBookingReference", "Flight booking reference / PNR"],
  ["ticketNumber", "E-ticket number"],
  ["flightClass", "Flight class"],

  // Airport Pickup and Transfers
  ["pickupStatus", "Airport pickup status"],
  ["pickupDate", "Airport pickup date", "date"],
  ["pickupTime", "Airport pickup time", "time"],
  ["pickupContactName", "Airport pickup contact person"],
  ["pickupContactNumber", "Airport pickup contact number"],
  ["pickupLocation", "Airport pickup location"],
  ["transferDetails", "Airport transfer arrangements", "textarea"],

  // Return Journey
  ["returnDate", "Return journey date", "date"],
  ["returnTime", "Return journey time", "time"],
  ["returnAirline", "Return airline name"],
  ["returnFlight", "Return flight number"],
  ["returnAirport", "Return departure airport"],
  ["returnDestination", "Return destination"],
  ["returnPnr", "Return booking reference / PNR"],
  ["returnTicketNumber", "Return e-ticket number"],

  // Travel Companions
  ["companions", "Travel companion details", "textarea"],

  // Itinerary
  ["itinerary", "Complete travel itinerary", "textarea"],
  ["travelNotes", "Additional travel notes", "textarea"],
],

appointments: [
  ["consultationDate", "Initial online consultation date", "date"],

  ["doctorName", "Doctor's name"],
  ["doctorSpecialty", "Doctor's specialty"],

  ["upcomingAppointments", "Upcoming teleconsultation appointments", "textarea"],

  ["appointmentDateTime", "Appointment date and time", "datetime-local"],
  ["appointmentTimeZone", "Appointment time zone"],

  ["meetingLink", "Meeting link or consultation instructions", "textarea"],

  ["appointmentConfirmation", "Appointment confirmation and reminders", "textarea"],

  ["previousConsultations", "Previous consultation history", "textarea"],

  ["nextFollowup", "Next follow-up appointment", "date"],

  ["postTreatmentSchedule", "Post-treatment teleconsultation schedule", "textarea"],
],

payments: [
  ["estimatedTreatmentPackageCost", "Estimated treatment package cost", "number"],
  ["advancePaymentReceived", "Advance payment received", "number"],
  [
    "hospitalAndTreatmentPaymentStatus",
    "Hospital and treatment payment status",
    "select",
    ["Pending", "Partially Paid", "Paid"],
  ],
  ["accommodationAndTransportationExpenses", "Accommodation and transportation expenses", "number"],
  ["otherApprovedExpenses", "Other approved expenses", "number"],
  ["outstandingBalance", "Outstanding balance, if any", "number"],
  ["transactionReference", "Transaction reference"],
],

  journey: [
    ["stage", "Current journey stage"],
    ["status", "Status"],
    ["date", "Date", "date"],
    ["requirements", "Pending requirements", "textarea"],
    ["remarks", "Remarks", "textarea"],
  ],
};

const hasSectionData = (data = {}) =>
  Object.values(data).some(
    (value) =>
      value !== null &&
      value !== undefined &&
      String(value).trim() !== ""
  );

const box = {
  border: "1px solid #dce7e6",
  borderRadius: 12,
  padding: 18,
  background: "#fff",
  marginBottom: 16,
};
const inp = {
  width: "100%",
  border: "1px solid #d4e1df",
  borderRadius: 8,
  padding: "10px 12px",
  fontSize: 14,
};
const btn = {
  background: "#064B50",
  color: "#fff",
  border: 0,
  borderRadius: 8,
  padding: "10px 18px",
  cursor: "pointer",
  fontWeight: 600,
};

const sectionHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 12,
  flexWrap: "wrap",
  marginBottom: 22,
};


const fieldGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 20,
  marginTop: 22,
};

const fieldLabel = {
  display: "block",
  color: "#30494a",
  fontSize: 13,
  fontWeight: 600,
};

const formActions = {
  display: "flex",
  justifyContent: "flex-end",
  gap: 10,
  marginTop: 24,
  paddingTop: 18,
  borderTop: "1px solid #e6eeee",
};

const countBadge = {
  background: "#e8f3f1",
  color: "#064B50",
  padding: "7px 12px",
  borderRadius: 20,
  fontSize: 12,
  fontWeight: 600,
};

const readOnlyBadge = {
  background: "#edf3f2",
  color: "#52716e",
  padding: "7px 12px",
  borderRadius: 20,
  fontSize: 12,
  fontWeight: 600,
};

const documentRow = {
  display: "flex",
  alignItems: "center",
  gap: 14,
  padding: "14px 0",
  borderBottom: "1px solid #edf1f1",
  flexWrap: "wrap",
};

const documentIcon = {
  width: 42,
  height: 42,
  borderRadius: 9,
  background: "#e8f3f1",
  color: "#064B50",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 10,
  fontWeight: 700,
  flexShrink: 0,
};

const documentName = {
  color: "#263f41",
  fontSize: 14,
  fontWeight: 600,
  overflowWrap: "anywhere",
};

const documentMeta = {
  color: "#718181",
  fontSize: 12,
  marginTop: 5,
};

const downloadBtn = {
  background: "#064B50",
  color: "#fff",
  border: 0,
  borderRadius: 7,
  padding: "8px 13px",
  cursor: "pointer",
  fontSize: 12,
  fontWeight: 600,
};

const emptyDocuments = {
  padding: "35px 15px",
  textAlign: "center",
  color: "#718181",
  fontSize: 14,
  background: "#f8fbfa",
  borderRadius: 9,
};

const docCategories = {
  treatment: "Consent Forms & Treatment Documentation",
  hospital: "Admission Confirmation",
  stay: "Accommodation Confirmation",
  travel: "Flight Ticket",
  appointments: "Doctor Consultation",
  payments: "Invoice",
  medical: "Medical Reports",
  visa: "Visa",
  documents: "Patient Document",
};

function AdminField({ field, value, onChange, readOnly = false }) {
  const [key, label, type = "text", options = []] = field;

  const common = {
    ...inp,
    marginTop: 7,
    background: readOnly ? "#f3f6f6" : "#fff",
    color: "#263f41",
  };

  if (type === "textarea") {
    return (
      <textarea
        style={{ ...common, minHeight: 105, resize: "vertical" }}
        value={value || ""}
        readOnly={readOnly}
        onChange={(e) => onChange(key, e.target.value)}
        placeholder={`Enter ${label.toLowerCase()} here...`}
      />
    );
  }

  if (type === "select") {
    return (
      <select
        style={common}
        value={value || ""}
        disabled={readOnly}
        onChange={(e) => onChange(key, e.target.value)}
      >
        <option value="">Select {label.toLowerCase()}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    );
  }

  return (
    <input
      type={type}
      style={common}
      value={value || ""}
      readOnly={readOnly}
      onChange={(e) => onChange(key, e.target.value)}
      placeholder={`Enter ${label.toLowerCase()} here...`}
    />
  );
}

export default function PatientManagement() {
const [rows, setRows] = useState([]),
  [search, setSearch] = useState(""),
  [selected, setSelected] = useState(null),
  [section, setSection] = useState("treatment"),
  [draft, setDraft] = useState({}),
  [message, setMessage] = useState(""),
  [busy, setBusy] = useState(false),
  [documentCategory, setDocumentCategory] = useState("Consent Form"),
[hospitalDocumentCategory, setHospitalDocumentCategory] =
  useState("Admission Confirmation"),
[stayDocumentCategory, setStayDocumentCategory] =
  useState("Booking Confirmation"),
[travelDocumentCategory, setTravelDocumentCategory] =
  useState("Outbound Flight Ticket");

  const [visaDocumentCategory, setVisaDocumentCategory] =
  useState("Medical Visa");

const [appointmentDocumentCategory, setAppointmentDocumentCategory] =
  useState("Doctor Consultation");
const [paymentDocumentCategory, setPaymentDocumentCategory] =
  useState("Payment Receipt");

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [isEditing, setIsEditing] = useState(false);
 

  const totalPages = Math.max(1, Math.ceil(rows.length / limit));

const paginatedRows = rows.slice(
  (page - 1) * limit,
  page * limit
);

  async function load() {
    try {
      const { data } = await api.get("/patient-care/admin", {
        params: { search },
      });
      setRows(data.rows || []);
    } catch (e) {
      setMessage(e.response?.data?.message || "Could not load patients");
    }
  }
  useEffect(() => {
    load();
  }, [search]);

  useEffect(() => {
  if (!message) return;

  const timer = setTimeout(() => {
    setMessage("");
  }, 3000);

  return () => clearTimeout(timer);
}, [message]);


async function open(id) {
  try {
    const { data } = await api.get(`/patient-care/admin/${id}`);

    setSelected(data);
   setSection("visa");
  setDraft(data.sections?.visa || {});
  setIsEditing(false);
  } catch (e) {
    setMessage(e.response?.data?.message || "Could not load patient");
  }
}

function changeSection(key) {
  setSection(key);
  setDraft(selected?.sections?.[key] || {});
  setIsEditing(false);
}

async function save() {
  if (!selected?.customer?.id) return;

  setBusy(true);

  try {
    const patientId = selected.customer.id;

    await api.patch(
      `/patient-care/admin/${patientId}/${section}`,
      draft
    );

    const { data } = await api.get(
      `/patient-care/admin/${patientId}`
    );

    setSelected(data);
    setDraft(data.sections?.[section] || {});
    setIsEditing(false);

    await load();

    setMessage("Patient details saved successfully.");
  } catch (e) {
    setMessage(e.response?.data?.message || "Save failed");
  } finally {
    setBusy(false);
  }
}


async function uploadMultiple(files, category, targetSection) {
  if (!files.length || !selected?.customer?.id) return;

  if (!category?.trim()) {
    setMessage("Please select a document category.");
    return;
  }

  const patientId = selected.customer.id;
  const allowed = /\.(pdf|doc|docx|jpg|jpeg|png|webp)$/i;
  const maxSize = 10 * 1024 * 1024;

  let successCount = 0;
  const failedFiles = [];

  setBusy(true);

  try {
    for (const file of files) {
      if (!allowed.test(file.name)) {
        failedFiles.push(`${file.name} (Invalid file type)`);
        continue;
      }

      if (file.size > maxSize) {
        failedFiles.push(`${file.name} (Maximum size is 10 MB)`);
        continue;
      }

      try {
        const fd = new FormData();

        fd.append("file", file);
        fd.append("sectionId", targetSection);
        fd.append("category", category.trim());

        await api.post(
          `/patient-care/admin/${patientId}/documents`,
          fd
        );

        successCount++;
      } catch (error) {
        console.error(`Upload failed: ${file.name}`, error);
        failedFiles.push(file.name);
      }
    }

    // Refresh only once after all uploads finish
    const { data } = await api.get(
      `/patient-care/admin/${patientId}`
    );

    setSelected(data);

    setMessage(
      `${successCount} document(s) uploaded successfully.` +
      (failedFiles.length
        ? ` Failed: ${failedFiles.join(", ")}`
        : "")
    );
  } catch (error) {
    setMessage(
      error.response?.data?.message ||
      "Documents uploaded, but refreshing the list failed."
    );
  } finally {
    setBusy(false);
  }
}




  async function download(doc) {
    try {
      const response = await api.get(
        `/patient-care/admin/${selected.customer.id}/documents/${doc.id}`,
        { responseType: "blob" },
      );
      const url = URL.createObjectURL(response.data);
      const a = document.createElement("a");
      a.href = url;
      a.download = doc.name;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      setMessage("Download failed");
    }
  }

  async function removeSavedDocument(doc) {
  if (!window.confirm(`Remove ${doc.name}?`)) return;

  try {
    await api.delete(
      `/patient-care/admin/${selected.customer.id}/documents/${doc.id}`
    );

    setSelected((previous) => ({
      ...previous,
      documents: (previous.documents || []).filter(
        (item) => item.id !== doc.id
      ),
    }));

    setMessage("Document removed successfully.");
  } catch (e) {
    setMessage(
      e.response?.data?.message || "Could not remove document"
    );
  }
}

function renderDocumentActions(doc) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        flexWrap: "wrap",
      }}
    >
      <button
        type="button"
        style={downloadBtn}
        onClick={() => download(doc)}
      >
        Download
      </button>

      <button
        type="button"
        disabled={busy}
        onClick={() => removeSavedDocument(doc)}
        style={{
          ...downloadBtn,
          background: "#b42318",
          opacity: busy ? 0.6 : 1,
        }}
      >
        Remove
      </button>
    </div>
  );
}

  return (
    <div>
      <div className="page-head">
        {/* <h1>Patient Management</h1> */}
      </div>
      {message && (
  <div className="patient-toast" role="status">
    <span className="patient-toast-icon">✓</span>
    <span>{message}</span>

    <button
      type="button"
      onClick={() => setMessage("")}
      aria-label="Close notification"
    >
      ×
    </button>
  </div>
)}
      {!selected ? (
  <div style={box}>
    <input
      style={{ ...inp, maxWidth: 420, marginBottom: 18 }}
      value={search}
      onChange={(e) => {
        setSearch(e.target.value);
        setPage(1);
      }}
      placeholder="Search by name, email or Patient ID"
    />

    <div style={{ overflowX: "auto" }}>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          textAlign: "left",
        }}
      >
        <thead>
          <tr>
            {[
              "Patient ID",
              "Name",
              "Email",
              "Treatment Status",
              "Arrival Date",
              "Action",
            ].map((heading) => (
              <th
                key={heading}
                style={{
                  padding: 12,
                  borderBottom: "1px solid #ddd",
                }}
              >
                {heading}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {paginatedRows.map((r) => (
            <tr key={r.id}>
              {[
                r.patientId || `AKESO-${String(r.id).padStart(8, "0")}`,
                r.name,
                r.email,
                r.treatmentStatus || "—",
                r.arrivalDate || "—",
              ].map((value, index) => (
                <td
                  key={index}
                  style={{
                    padding: 12,
                    borderBottom: "1px solid #eee",
                  }}
                >
                  {value}
                </td>
              ))}

              <td style={{ padding: 12 }}>
                <button
                  type="button"
                  style={btn}
                  onClick={() => open(r.id)}
                >
                  Manage
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {rows.length === 0 && (
        <p>No registered patients found.</p>
      )}

      {rows.length > 0 && (
        <div className="patient-pagination">
          <span>
            Showing {(page - 1) * limit + 1}–
            {Math.min(page * limit, rows.length)} of {rows.length} patients
          </span>

          <div className="patient-pagination-buttons">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            >
              Previous
            </button>

            <span>
              {page} / {totalPages}
            </span>

            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() =>
                setPage((prev) => Math.min(totalPages, prev + 1))
              }
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  </div>
) : (
        <div className="patient-details-page">

  <div className="patient-profile-header">

  <div className="patient-profile-info">

    <button
      type="button"
      className="patient-back-btn"
      onClick={() => {
        setSelected(null);
        setIsEditing(false);
        setMessage("");
      }}
    >
      ← Back to Patients
    </button>

    <div className="patient-name-row">
  <h3>{selected.customer.name}</h3>

  <span className="patient-id-badge">
    {selected.patientId || selected.customer?.patientId || "Registration ID Not Available"}
  </span>
</div>

    <p>{selected.customer.email}</p>
    <p>{selected.customer.phone}</p>

  </div>

  <div className="patient-profile-image">
    {selected.customer.profileImage ||
    selected.customer.profile_image ? (
      <img
        src={
          selected.customer.profileImage ||
          selected.customer.profile_image
        }
        alt={selected.customer.name}
      />
    ) : (
      <div className="patient-image-placeholder">
        {selected.customer.name?.charAt(0)?.toUpperCase() || "P"}
      </div>
    )}
  </div>

</div>

          {/* <div style={{ ...box, display: "flex", gap: 8, flexWrap: "wrap" }}> */}
          <div className="patient-tabs">
           {[
  "personal",
  "passport",
  "medical",
  "documents",
    "visa",
  "treatment",
  "hospital",
  "stay",
  "travel",
  "appointments",
  "payments",
  "journey",
].map((k) => (
  <button
    key={k}
    onClick={() => changeSection(k)}
    className={`patient-tab ${section === k ? "active" : ""}`}
  >
    {{
      visa: "Visa & Immigration",
      personal: "Personal Information",
      passport: "Passport & Identity",
      medical: "Medical Records",
      documents: "Documents",
      treatment: "Treatment & Surgery",
      hospital: "Hospital",
      stay: "Accommodation & Stay",
      // travel: "Travel",
      travel: "International Journey & Travel",
      // appointments: "Appointments",
      appointments: "Appointment & Teleconsultation",
      payments: "Payments",
      journey: "Journey",
    }[k]}
  </button>
))}
          </div>
          {section === "documents" ? (
  <div style={box}>
    <div style={sectionHeader}>
      <div>
        <h3 style={{ margin: 0, color: "#203b3d", fontSize: 18 }}>
          Patient Documents
        </h3>
        <p style={{ margin: "6px 0 0", color: "#718181", fontSize: 13 }}>
          All documents uploaded by this patient
        </p>
      </div>

      <span style={countBadge}>
        {selected.documents?.length || 0} Files
      </span>
    </div>

    {selected.documents?.length > 0 ? (
      <div>
        {selected.documents.map((doc) => (
          <div key={doc.id} style={documentRow}>
            <div style={documentIcon}>
              <span>FILE</span>
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={documentName}>
                {doc.name || doc.originalName || doc.original_name}
              </div>

              <div style={documentMeta}>
                {doc.category || "Patient document"}
                {" · "}
                {doc.sectionId || doc.section_id || "Documents"}
              </div>
            </div>

            {/* <button
              type="button"
              style={downloadBtn}
              onClick={() => download(doc)}
            >
              Download
            </button> */}
            {renderDocumentActions(doc)}
          </div>
        ))}
      </div>
    ) : (
      <div style={emptyDocuments}>
        No documents uploaded by this patient yet.
      </div>
    )}
  </div>
) : (
  <div style={box}>
    <div style={sectionHeader}>
      <div>
        <h3 style={{ margin: 0, color: "#203b3d", fontSize: 18 }}>
          {{
            visa: "Visa & Immigration Details",
            personal: "Personal Information",
            passport: "Passport & Identity Details",
            medical: "Medical Records",
            treatment: "Treatment & Surgery Details",
            hospital: "Hospital Details",
            stay: "Accommodation & Stay Details",
            // travel: "Travel Details",
            travel: "International Journey & Travel Details",
            // appointments: "Appointment Details",
            appointments: "Appointment & Teleconsultation Details",
            payments: "Payment Details",
            journey: "Patient Journey Details",
          }[section]}
        </h3>

        <p style={{ margin: "6px 0 0", color: "#718181", fontSize: 13 }}>
          {["personal", "passport"].includes(section)
            ? "Information submitted by the patient"
            : section === "medical"
              ? "Patient medical information and doctor notes"
              : "Manage patient information"}
        </p>
      </div>

   
     
<div className="patient-section-actions">
  {(() => {
    const sectionHasData = hasSectionData(
      selected.sections?.[section] || {}
    );

    const isPatientReadOnly = [
      "personal",
      "passport",
      "medical",
    ].includes(section);

    if (isPatientReadOnly) {
      return (
        <span style={readOnlyBadge}>
          Patient Submitted · View Only
        </span>
      );
    }

    // Empty section: directly show Save Details
    if (!sectionHasData) {
      return (
        <button
          type="button"
          className="patient-edit-btn"
          disabled={busy}
          onClick={save}
        >
          {busy ? "Saving..." : "Save Details"}
        </button>
      );
    }

    // Existing details: show Edit Details
    if (!isEditing) {
      return (
        <button
          type="button"
          className="patient-edit-btn"
          onClick={() => {
            setDraft(selected.sections?.[section] || {});
            setIsEditing(true);
          }}
        >
          Edit Details
        </button>
      );
    }

    // Editing existing details: show Cancel and Save
    return (
      <>
        <button
          type="button"
          className="patient-cancel-btn"
          onClick={() => {
            setDraft(selected.sections?.[section] || {});
            setIsEditing(false);
          }}
        >
          Cancel
        </button>

        <button
          type="button"
          className="patient-edit-btn"
          disabled={busy}
          onClick={save}
        >
          {busy ? "Saving..." : "Save Details"}
        </button>
      </>
    );
  })()}
</div>


    </div>

    <div className="patient-field-grid" style={fieldGrid}>
      {(SECTIONS[section] || []).map((field) => {
        const [key, label, type] = field;

        return (
          <label
  key={key}
  className={`patient-field ${
    type === "textarea" ? "patient-field-wide" : ""
  }`}
  style={fieldLabel}
>
            {label}

            <AdminField
  field={field}
  value={draft[key]}
 readOnly={
  ["personal", "passport", "medical"].includes(section)
    ? true
    : hasSectionData(selected.sections?.[section] || {})
      ? !isEditing
      : false
}
//   readOnly={
//   !isEditing ||
//   ["personal", "passport", "medical"].includes(section)
// }
  onChange={(fieldKey, value) =>
    setDraft((prev) => ({
      ...prev,
      [fieldKey]: value,
    }))
  }
/>
          </label>
        );
      })}
    </div>




{/* DOCUMENTS UPLOADED FOR THIS SECTION */}
{!["documents", "payments", "treatment", "hospital", "stay", "travel","visa","appointments",].includes(section) && (
  <div
    style={{
      marginTop: 28,
      paddingTop: 22,
      borderTop: "1px solid #e6eeee",
    }}
  >
    <div style={sectionHeader}>
      <div>
        <h3 style={{ margin: 0, color: "#203b3d", fontSize: 18 }}>
          {section === "personal" ||
          section === "passport" ||
          section === "medical"
            ? "Patient Uploaded Documents"
            : "Documents for this Section"}
        </h3>

        <p style={{ margin: "6px 0 0", color: "#718181", fontSize: 13 }}>
          Documents related to this patient section
        </p>
      </div>

      <span style={countBadge}>
        {(selected.documents || []).filter(
          (doc) =>
            (doc.sectionId || doc.section_id) === section
        ).length} Files
      </span>
    </div>

    {(selected.documents || []).filter(
      (doc) =>
        (doc.sectionId || doc.section_id) === section
    ).length > 0 ? (
      (selected.documents || [])
        .filter(
          (doc) =>
            (doc.sectionId || doc.section_id) === section
        )
        .map((doc) => (
          <div key={doc.id} style={documentRow}>
            <div style={documentIcon}>FILE</div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={documentName}>
                {doc.name || doc.originalName || doc.original_name}
              </div>

              <div style={documentMeta}>
                {doc.category || "Patient Document"}
                {" · "}
                {doc.date
                  ? new Date(doc.date).toLocaleDateString()
                  : ""}
              </div>
            </div>

            <button
              type="button"
              style={downloadBtn}
              onClick={() => download(doc)}
            >
              Download
            </button>
          </div>
        ))
    ) : (
      <div style={emptyDocuments}>
        No documents uploaded for this section yet.
      </div>
    )}
  </div>
)}

{/* VISA & IMMIGRATION DOCUMENT UPLOAD SECTION */}
{section === "visa" && (
  <div
    style={{
      marginTop: 28,
      paddingTop: 22,
      borderTop: "1px solid #e6eeee",
    }}
  >
    <div style={sectionHeader}>
      <div>
        <h3
          style={{
            margin: 0,
            color: "#203b3d",
            fontSize: 18,
          }}
        >
          Visa & Immigration Documents
        </h3>

        <p
          style={{
            margin: "6px 0 0",
            color: "#718181",
            fontSize: 13,
          }}
        >
          Upload visa applications, approved visas, passport
          copies and medical attendant visa documents.
        </p>
      </div>

      <span style={countBadge}>
        {(selected.documents || []).filter(
          (doc) =>
            (doc.sectionId || doc.section_id) === "visa"
        ).length} Files
      </span>
    </div>

    <div
      style={{
        background: "#f8fbfa",
        border: "1px solid #e2ecea",
        borderRadius: 10,
        padding: 16,
        marginBottom: 20,
      }}
    >
      <label style={fieldLabel}>
        Document Category

        <select
          value={visaDocumentCategory}
          onChange={(e) =>
            setVisaDocumentCategory(e.target.value)
          }
          style={{
            ...inp,
            marginTop: 8,
            background: "#fff",
          }}
        >
          <option value="Medical Visa">Medical Visa</option>

          <option value="Medical Attendant Visa">
            Medical Attendant Visa
          </option>

          <option value="Visa Application Form">
            Visa Application Form
          </option>

          <option value="Visa Approval Letter">
            Visa Approval Letter
          </option>

          <option value="Visa Reference / Acknowledgement">
            Visa Reference / Acknowledgement
          </option>

          <option value="Passport Copy">
            Passport Copy
          </option>

          <option value="Visa Validity / Extension Document">
            Visa Validity / Extension Document
          </option>

          <option value="Other Visa Document">
            Other Visa Document
          </option>
        </select>
      </label>

      <label
        style={{
          ...fieldLabel,
          display: "block",
          marginTop: 18,
        }}
      >
        Upload Visa Documents

        <input
          type="file"
          multiple
          accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx"
          style={{
            ...inp,
            marginTop: 8,
            background: "#fff",
          }}
          onChange={async (e) => {
  const files = Array.from(e.target.files || []);

  await uploadMultiple(
    files,
    visaDocumentCategory,
    "visa"
  );

  e.target.value = "";
}}
        />
      </label>

      <p
        style={{
          color: "#718181",
          fontSize: 12,
          marginBottom: 0,
          marginTop: 10,
        }}
      >
        You can upload multiple PDF, JPG, PNG, WEBP, DOC or
        DOCX files. All uploaded visa documents will be
        available in the patient's profile.
      </p>
    </div>

    <h4
      style={{
        color: "#263f41",
        fontSize: 15,
        marginBottom: 12,
      }}
    >
      Uploaded Visa Documents
    </h4>

    {(selected.documents || []).filter(
      (doc) =>
        (doc.sectionId || doc.section_id) === "visa"
    ).length > 0 ? (
      (selected.documents || [])
        .filter(
          (doc) =>
            (doc.sectionId || doc.section_id) === "visa"
        )
        .map((doc) => (
          <div key={doc.id} style={documentRow}>
            <div style={documentIcon}>
              FILE
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={documentName}>
                {doc.name ||
                  doc.originalName ||
                  doc.original_name}
              </div>

              <div style={documentMeta}>
                {doc.category || "Visa Document"}
                {" · "}
                {doc.date
                  ? new Date(doc.date).toLocaleDateString()
                  : ""}
              </div>
            </div>
                  {renderDocumentActions(doc)}
            {/* <button
              type="button"
              style={downloadBtn}
              onClick={() => download(doc)}
            >
              Download
            </button> */}
          </div>
        ))
    ) : (
      <div style={emptyDocuments}>
        No visa documents uploaded yet.
      </div>
    )}
  </div>
)}

{/* APPOINTMENT DOCUMENT UPLOAD SECTION */}
{section === "appointments" && (
  <div
    style={{
      marginTop: 28,
      paddingTop: 22,
      borderTop: "1px solid #e6eeee",
    }}
  >
    <div style={sectionHeader}>
      <div>
        <h3
          style={{
            margin: 0,
            color: "#203b3d",
            fontSize: 18,
          }}
        >
          Appointment & Consultation Documents
        </h3>

        <p
          style={{
            margin: "6px 0 0",
            color: "#718181",
            fontSize: 13,
          }}
        >
          Upload appointment confirmations, consultation
          reports, prescriptions and related documents.
        </p>
      </div>

      <span style={countBadge}>
        {(selected.documents || []).filter(
          (doc) =>
            (doc.sectionId || doc.section_id) === "appointments"
        ).length} Files
      </span>
    </div>

    <div
      style={{
        background: "#f8fbfa",
        border: "1px solid #e2ecea",
        borderRadius: 10,
        padding: 16,
        marginBottom: 20,
      }}
    >
      <label style={fieldLabel}>
        Document Category

        <select
          value={appointmentDocumentCategory}
          onChange={(e) =>
            setAppointmentDocumentCategory(e.target.value)
          }
          style={{
            ...inp,
            marginTop: 8,
            background: "#fff",
          }}
        >
          <option value="Doctor Consultation">
            Doctor Consultation
          </option>

          <option value="Appointment Confirmation">
            Appointment Confirmation
          </option>

          <option value="Prescription">
            Prescription
          </option>

          <option value="Medical Advice">
            Medical Advice
          </option>

          <option value="Follow-up Report">
            Follow-up Report
          </option>

          <option value="Teleconsultation Report">
            Teleconsultation Report
          </option>

          <option value="Other Appointment Document">
            Other Appointment Document
          </option>
        </select>
      </label>

      <label
        style={{
          ...fieldLabel,
          display: "block",
          marginTop: 18,
        }}
      >
        Upload Appointment Documents

        <input
          type="file"
          multiple
          accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx"
          style={{
            ...inp,
            marginTop: 8,
            background: "#fff",
          }}
          onChange={async (e) => {
  const files = Array.from(e.target.files || []);

  await uploadMultiple(
    files,
    appointmentDocumentCategory,
    "appointments"
  );

  e.target.value = "";
}}
        />
      </label>

      <p
        style={{
          color: "#718181",
          fontSize: 12,
          marginBottom: 0,
          marginTop: 10,
        }}
      >
        You can upload multiple PDF, JPG, PNG, WEBP, DOC or DOCX files.
      </p>
    </div>

    <h4
      style={{
        color: "#263f41",
        fontSize: 15,
        marginBottom: 12,
      }}
    >
      Uploaded Appointment Documents
    </h4>

    {(selected.documents || []).filter(
      (doc) =>
        (doc.sectionId || doc.section_id) === "appointments"
    ).length > 0 ? (
      (selected.documents || [])
        .filter(
          (doc) =>
            (doc.sectionId || doc.section_id) === "appointments"
        )
        .map((doc) => (
          <div key={doc.id} style={documentRow}>
            <div style={documentIcon}>
              FILE
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={documentName}>
                {doc.name ||
                  doc.originalName ||
                  doc.original_name}
              </div>

              <div style={documentMeta}>
                {doc.category || "Appointment Document"}
                {" · "}
                {doc.date
                  ? new Date(doc.date).toLocaleDateString()
                  : ""}
              </div>
            </div>

            {/* <button
              type="button"
              style={downloadBtn}
              onClick={() => download(doc)}
            >
              Download
            </button> */}
            {renderDocumentActions(doc)}
          </div>
        ))
    ) : (
      <div style={emptyDocuments}>
        No appointment documents uploaded yet.
      </div>
    )}
  </div>
)}

{/* PAYMENT DOCUMENT UPLOAD SECTION */}
{section === "payments" && (
  <div style={{ marginTop: 28, paddingTop: 22, borderTop: "1px solid #e6eeee" }}>
    <div style={sectionHeader}>
      <div>
        <h3 style={{ margin: 0, color: "#203b3d", fontSize: 18 }}>
          Payment Documents
        </h3>
        <p style={{ margin: "6px 0 0", color: "#718181", fontSize: 13 }}>
          Upload approved quotations, invoices, payment receipts and final expense statements.
        </p>
      </div>

      <span style={countBadge}>
        {(selected.documents || []).filter(
          (doc) => (doc.sectionId || doc.section_id) === "payments"
        ).length} Files
      </span>
    </div>

    <div
      style={{
        background: "#f8fbfa",
        border: "1px solid #e2ecea",
        borderRadius: 10,
        padding: 16,
        marginBottom: 20,
      }}
    >
      <label style={fieldLabel}>
        Document Type

        <select
  value={paymentDocumentCategory}
  onChange={(e) => setPaymentDocumentCategory(e.target.value)}
  style={{ ...inp, marginTop: 8, background: "#fff" }}
>
          <option value="Approved Quotation">Approved Quotation</option>
          <option value="Invoice">Invoice</option>
          <option value="Payment Receipt">Payment Receipt</option>
          <option value="Final Statement of Expenses">
            Final Statement of Expenses
          </option>
        </select>
      </label>

      <label style={{ ...fieldLabel, display: "block", marginTop: 18 }}>
        Upload Payment Documents

        <input
          type="file"
          multiple
          accept=".pdf,.jpg,.jpeg,.png,.webp"
          style={{ ...inp, marginTop: 8, background: "#fff" }}
          onChange={async (e) => {
  const files = Array.from(e.target.files || []);

  await uploadMultiple(
    files,
    paymentDocumentCategory,
    "payments"
  );

  e.target.value = "";
}}
        />
      </label>
    </div>

    <h4 style={{ color: "#263f41", fontSize: 15, marginBottom: 12 }}>
      Uploaded Payment Documents
    </h4>

    {(selected.documents || []).filter(
      (doc) => (doc.sectionId || doc.section_id) === "payments"
    ).length > 0 ? (
      (selected.documents || [])
        .filter(
          (doc) => (doc.sectionId || doc.section_id) === "payments"
        )
        .map((doc) => (
          <div key={doc.id} style={documentRow}>
            <div style={documentIcon}>FILE</div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={documentName}>
                {doc.name || doc.originalName || doc.original_name}
              </div>

              <div style={documentMeta}>
                {doc.category || "Payment Document"}
                {" · "}
                {doc.date ? new Date(doc.date).toLocaleDateString() : ""}
              </div>
            </div>

            {renderDocumentActions(doc)}
          </div>
        ))
    ) : (
      <div style={emptyDocuments}>
        No payment documents uploaded yet.
      </div>
    )}
  </div>
)}



{/* TREATMENT DOCUMENT UPLOAD SECTION */}
{section === "treatment" && (
  <div
    style={{
      marginTop: 28,
      paddingTop: 22,
      borderTop: "1px solid #e6eeee",
    }}
  >
    <div style={sectionHeader}>
      <div>
        <h3
          style={{
            margin: 0,
            color: "#203b3d",
            fontSize: 18,
          }}
        >
          Consent Forms & Relevant Treatment Documentation
        </h3>

        <p
          style={{
            margin: "6px 0 0",
            color: "#718181",
            fontSize: 13,
          }}
        >
          Upload consent forms, surgery consent forms and
          other relevant treatment documents for this patient.
        </p>
      </div>

      <span style={countBadge}>
        {(selected.documents || []).filter(
          (doc) => (doc.sectionId || doc.section_id) === "treatment"
        ).length} Files
      </span>
    </div>

    {/* DOCUMENT CATEGORY */}
    <div
      style={{
        background: "#f8fbfa",
        border: "1px solid #e2ecea",
        borderRadius: 10,
        padding: 16,
        marginBottom: 20,
      }}
    >
      <label style={fieldLabel}>
  Document Category

  <input
    type="text"
    value={documentCategory}
    onChange={(e) => setDocumentCategory(e.target.value)}
    placeholder="Enter document category (e.g. Consent Form)"
    style={{
      ...inp,
      marginTop: 8,
      background: "#fff",
    }}
  />
</label>

      {/* FILE UPLOAD */}
      <label
        style={{
          ...fieldLabel,
          display: "block",
          marginTop: 18,
        }}
      >
        Upload files

        <input
          type="file"
          multiple
          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
          style={{
            ...inp,
            marginTop: 8,
            background: "#fff",
          }}
        onChange={async (e) => {
  const files = Array.from(e.target.files || []);

  await uploadMultiple(
    files,
    documentCategory,
    "treatment"
  );

  e.target.value = "";
}}
        />
      </label>

      <p
        style={{
          color: "#718181",
          fontSize: 12,
          marginBottom: 0,
          marginTop: 10,
        }}
      >
        You can select multiple documents. All uploaded
        documents will be visible in the patient's profile.
      </p>
    </div>

    {/* UPLOADED DOCUMENT LIST */}
    <h4
      style={{
        color: "#263f41",
        fontSize: 15,
        marginBottom: 12,
      }}
    >
      Uploaded Treatment Documents
    </h4>

    {selected.documents?.filter(
     (doc) => (doc.sectionId || doc.section_id) === "treatment"
    ).length > 0 ? (
      selected.documents
        // .filter((doc) => doc.sectionId === "treatment")
        .filter(
  (doc) => (doc.sectionId || doc.section_id) === "treatment"
)
        .map((doc) => (
          <div key={doc.id} style={documentRow}>
            <div style={documentIcon}>
              FILE
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={documentName}>
                {doc.name || doc.originalName || doc.original_name}
              </div>

              <div style={documentMeta}>
                {doc.category || "Treatment Document"}
                {" · "}
                {doc.date
                  ? new Date(doc.date).toLocaleDateString()
                  : ""}
              </div>
            </div>
            {renderDocumentActions(doc)}
            {/* <button
              type="button"
              style={downloadBtn}
              onClick={() => download(doc)}
            >
              Download
            </button> */}
          </div>
        ))
    ) : (
      <div style={emptyDocuments}>
        No treatment documents uploaded yet.
      </div>
    )}
  </div>
)}

{/* HOSPITAL RELATED DOCUMENT UPLOAD SECTION */}
{section === "hospital" && (
  <div
    style={{
      marginTop: 28,
      paddingTop: 22,
      borderTop: "1px solid #e6eeee",
    }}
  >
    <div style={sectionHeader}>
      <div>
        <h3
          style={{
            margin: 0,
            color: "#203b3d",
            fontSize: 18,
          }}
        >
          Hospital & Doctor Documents
        </h3>

        <p
          style={{
            margin: "6px 0 0",
            color: "#718181",
            fontSize: 13,
          }}
        >
         Upload admission confirmations, appointment confirmations,
doctor consultation documents, hospital medical records
and other related hospital documents.
        </p>
      </div>

      <span style={countBadge}>
        {(selected.documents || []).filter(
          (doc) => (doc.sectionId || doc.section_id) === "hospital"
        ).length} Files
      </span>
    </div>

    <div
      style={{
        background: "#f8fbfa",
        border: "1px solid #e2ecea",
        borderRadius: 10,
        padding: 16,
        marginBottom: 20,
      }}
    >
     <label style={fieldLabel}>
  Document Category

  <select
    value={hospitalDocumentCategory}
    onChange={(e) =>
      setHospitalDocumentCategory(e.target.value)
    }
    style={{
      ...inp,
      marginTop: 8,
      background: "#fff",
    }}
  >
    <option value="Admission Confirmation">
      Admission Confirmation
    </option>

    <option value="Appointment Confirmation">
      Appointment Confirmation
    </option>

    <option value="Doctor Consultation Documents">
      Doctor Consultation Documents
    </option>

    <option value="Hospital Medical Records">
      Hospital Medical Records
    </option>

    <option value="Hospital Estimate / Quotation">
      Hospital Estimate / Quotation
    </option>

    <option value="Other Hospital Document">
      Other Hospital Document
    </option>
  </select>
</label>

      <label
        style={{
          ...fieldLabel,
          display: "block",
          marginTop: 18,
        }}
      >
        Upload Hospital Documents

        <input
          type="file"
          multiple
          accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx"
          style={{
            ...inp,
            marginTop: 8,
            background: "#fff",
          }}
          onChange={async (e) => {
  const files = Array.from(e.target.files || []);

  await uploadMultiple(
    files,
    hospitalDocumentCategory,
    "hospital"
  );

  e.target.value = "";
}}
        />
      </label>

      <p
        style={{
          color: "#718181",
          fontSize: 12,
          marginBottom: 0,
          marginTop: 10,
        }}
      >
        Select multiple files. Uploaded documents will be
        available in the patient's profile.
      </p>
    </div>

    <h4
      style={{
        color: "#263f41",
        fontSize: 15,
        marginBottom: 12,
      }}
    >
      Uploaded Hospital Documents
    </h4>

    {(selected.documents || []).filter(
      (doc) => (doc.sectionId || doc.section_id) === "hospital"
    ).length > 0 ? (
      selected.documents
       .filter((doc) => (doc.sectionId || doc.section_id) === "hospital")
        .map((doc) => (
          <div key={doc.id} style={documentRow}>
            <div style={documentIcon}>
              FILE
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={documentName}>
                {doc.name || doc.originalName || doc.original_name}
              </div>

              <div style={documentMeta}>
                {doc.category || "Hospital Document"}
                {" · "}
                {doc.date
                  ? new Date(doc.date).toLocaleDateString()
                  : ""}
              </div>
            </div>
                  {renderDocumentActions(doc)}
            {/* <button
              type="button"
              style={downloadBtn}
              onClick={() => download(doc)}
            >
              Download
            </button> */}
          </div>
        ))
    ) : (
      <div style={emptyDocuments}>
        No hospital documents uploaded yet.
      </div>
    )}
  </div>
)}

{/* ACCOMMODATION & RESERVATION DOCUMENT UPLOAD */}
{section === "stay" && (
  <div
    style={{
      marginTop: 28,
      paddingTop: 22,
      borderTop: "1px solid #e6eeee",
    }}
  >
    <div style={sectionHeader}>
      <div>
        <h3
          style={{
            margin: 0,
            color: "#203b3d",
            fontSize: 18,
          }}
        >
          Accommodation & Reservation Documents
        </h3>

        <p
          style={{
            margin: "6px 0 0",
            color: "#718181",
            fontSize: 13,
          }}
        >
          Upload hotel booking confirmations, reservation
          documents, accommodation invoices and transportation
          confirmations.
        </p>
      </div>

      <span style={countBadge}>
        {(selected.documents || []).filter(
          (doc) =>
            (doc.sectionId || doc.section_id) === "stay"
        ).length} Files
      </span>
    </div>

    <div
      style={{
        background: "#f8fbfa",
        border: "1px solid #e2ecea",
        borderRadius: 10,
        padding: 16,
        marginBottom: 20,
      }}
    >
      <label style={fieldLabel}>
        Document Category

        <select
          value={stayDocumentCategory}
          onChange={(e) =>
            setStayDocumentCategory(e.target.value)
          }
          style={{
            ...inp,
            marginTop: 8,
            background: "#fff",
          }}
        >
          <option value="Booking Confirmation">
            Booking Confirmation
          </option>

          <option value="Hotel Reservation">
            Hotel Reservation
          </option>

          <option value="Accommodation Invoice">
            Accommodation Invoice
          </option>

          <option value="Payment Receipt">
            Payment Receipt
          </option>

          <option value="Airport Pickup Confirmation">
            Airport Pickup Confirmation
          </option>

          <option value="Transportation Confirmation">
            Transportation Confirmation
          </option>

          <option value="Other Accommodation Document">
            Other Accommodation Document
          </option>
        </select>
      </label>

      <label
        style={{
          ...fieldLabel,
          display: "block",
          marginTop: 18,
        }}
      >
        Upload Reservation Documents

        <input
          type="file"
          multiple
          accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx"
          style={{
            ...inp,
            marginTop: 8,
            background: "#fff",
          }}
          onChange={async (e) => {
  const files = Array.from(e.target.files || []);

  await uploadMultiple(
    files,
    stayDocumentCategory,
    "stay"
  );

  e.target.value = "";
}}
        />
      </label>

      <p
        style={{
          color: "#718181",
          fontSize: 12,
          marginBottom: 0,
          marginTop: 10,
        }}
      >
        You can select multiple PDF, JPG, PNG, WEBP, DOC or DOCX
        files. Uploaded documents will be available in the
        patient's profile.
      </p>
    </div>

    <h4
      style={{
        color: "#263f41",
        fontSize: 15,
        marginBottom: 12,
      }}
    >
      Uploaded Accommodation Documents
    </h4>

    {(selected.documents || []).filter(
      (doc) => (doc.sectionId || doc.section_id) === "stay"
    ).length > 0 ? (
      selected.documents
        .filter(
          (doc) => (doc.sectionId || doc.section_id) === "stay"
        )
        .map((doc) => (
          <div key={doc.id} style={documentRow}>
            <div style={documentIcon}>
              FILE
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={documentName}>
                {doc.name || doc.originalName || doc.original_name}
              </div>

              <div style={documentMeta}>
                {doc.category || "Accommodation Document"}
                {" · "}
                {doc.date
                  ? new Date(doc.date).toLocaleDateString()
                  : ""}
              </div>
            </div>
{renderDocumentActions(doc)}
            {/* <button
              type="button"
              style={downloadBtn}
              onClick={() => download(doc)}
            >
              Download
            </button> */}
          </div>
        ))
    ) : (
      <div style={emptyDocuments}>
        No accommodation documents uploaded yet.
      </div>
    )}
  </div>
)}

{/* INTERNATIONAL JOURNEY & TRAVEL DOCUMENT UPLOAD */}
{section === "travel" && (
  <div
    style={{
      marginTop: 28,
      paddingTop: 22,
      borderTop: "1px solid #e6eeee",
    }}
  >
    <div style={sectionHeader}>
      <div>
        <h3
          style={{
            margin: 0,
            color: "#203b3d",
            fontSize: 18,
          }}
        >
          Flight Tickets & Travel Documents
          {/* Upload outbound and return flight tickets, e-tickets, PNR confirmations, travel itineraries, companion documents and airport transfer confirmations. */}
        </h3>

        <p
          style={{
            margin: "6px 0 0",
            color: "#718181",
            fontSize: 13,
          }}
        >
          Upload outbound and return flight tickets, e-tickets,
          travel itineraries, booking confirmations and other
          relevant travel documents.
        </p>
      </div>

      <span style={countBadge}>
        {(selected.documents || []).filter(
          (doc) =>
            (doc.sectionId || doc.section_id) === "travel"
        ).length} Files
      </span>
    </div>

    {/* DOCUMENT UPLOAD */}
    <div
      style={{
        background: "#f8fbfa",
        border: "1px solid #e2ecea",
        borderRadius: 10,
        padding: 16,
        marginBottom: 20,
      }}
    >
   <label style={fieldLabel}>
  Document Category

  <select
    value={travelDocumentCategory}
    onChange={(e) =>
      setTravelDocumentCategory(e.target.value)
    }
    style={{
      ...inp,
      marginTop: 8,
      background: "#fff",
    }}
  >
    <option value="Outbound Flight Ticket">
      Outbound Flight Ticket
    </option>

    <option value="Outbound E-Ticket">
      Outbound E-Ticket
    </option>

    <option value="Outbound Booking Confirmation / PNR">
      Outbound Booking Confirmation / PNR
    </option>

    <option value="Return Flight Ticket">
      Return Flight Ticket
    </option>

    <option value="Return E-Ticket">
      Return E-Ticket
    </option>

    <option value="Return Booking Confirmation / PNR">
      Return Booking Confirmation / PNR
    </option>

    <option value="Travel Itinerary">
      Travel Itinerary
    </option>

    <option value="Travel Companion Documents">
      Travel Companion Documents
    </option>

    <option value="Airport Pickup Confirmation">
      Airport Pickup Confirmation
    </option>

    <option value="Airport Transfer Confirmation">
      Airport Transfer Confirmation
    </option>

    <option value="Other Travel Document">
      Other Travel Document
    </option>
  </select>
</label>

      <label
        style={{
          ...fieldLabel,
          display: "block",
          marginTop: 18,
        }}
      >
        Upload Travel Documents

        <input
          type="file"
          multiple
          accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx"
          style={{
            ...inp,
            marginTop: 8,
            background: "#fff",
          }}
          onChange={async (e) => {
  const files = Array.from(e.target.files || []);

  await uploadMultiple(
    files,
    travelDocumentCategory,
    "travel"
  );

  e.target.value = "";
}}
        />
      </label>

      <p
        style={{
          color: "#718181",
          fontSize: 12,
          marginBottom: 0,
          marginTop: 10,
        }}
      >
        You can select multiple PDF, JPG, PNG, WEBP, DOC or DOCX
        files. You can upload flight tickets, e-tickets,
        return tickets, PNR confirmations and travel itineraries.
      </p>
    </div>

    {/* UPLOADED DOCUMENTS */}
    <h4
      style={{
        color: "#263f41",
        fontSize: 15,
        marginBottom: 12,
      }}
    >
      Uploaded Travel Documents
    </h4>

    {(selected.documents || []).filter(
      (doc) =>
        (doc.sectionId || doc.section_id) === "travel"
    ).length > 0 ? (
      selected.documents
        .filter(
          (doc) =>
            (doc.sectionId || doc.section_id) === "travel"
        )
        .map((doc) => (
          <div key={doc.id} style={documentRow}>
            <div style={documentIcon}>
              FILE
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={documentName}>
                {doc.name || doc.originalName || doc.original_name}
              </div>

              <div style={documentMeta}>
                {doc.category || "Travel Document"}
                {" · "}
                {doc.date
                  ? new Date(doc.date).toLocaleDateString()
                  : ""}
              </div>
            </div>
{/* 
            <button
              type="button"
              style={downloadBtn}
              onClick={() => download(doc)}
            >
              Download
            </button> */}
            {renderDocumentActions(doc)}
          </div>
        ))
    ) : (
      <div style={emptyDocuments}>
        No travel documents uploaded yet.
      </div>
    )}
  </div>
)}


  </div>
)}
          
        </div>
      )}
    </div>
  );
}





