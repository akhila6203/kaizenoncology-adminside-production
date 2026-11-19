const HealthLibrary = require("../models/healthLibrary.model");
const { randomUUID } = require("crypto");
const path = require("path");
const fs = require("fs");
const fsp = require("fs/promises");
const { sendHealthEnquiryEmail } = require("../services/mail.service");

const TYPES = ["estimate", "contact", "callback"];

const parse = (x) => {
  try {
    return typeof x === "string" ? JSON.parse(x || "{}") : x || {};
  } catch {
    return {};
  }
};

const text = (x) => String(x ?? "").trim();

// plain text fields copied straight from the request body
const fields = [
  "patient_name",
  "phone",
  "email",
  "country",
  "disease",
  "hospital_name",
  "treatment_start_date",
  "treatment_end_date",
  "amount",
  "post_op_details",
  "subject",
  "message",
  "preferred_time",
  // Book Appointment fields
  "age",
  "gender",
  "visited_before",
  "preferred_location",
  "appointment_date",
  "department",
  "preferred_doctor",
];

const isTrue = (x) => ["1", "true", "on", "yes"].includes(text(x).toLowerCase());

function build(body = {}, existing = {}) {
  const name = text(
    body.patient_name ||
      body.name ||
      body.fullName ||
      body.full_name ||
      [body.first_name, body.last_name].filter(Boolean).join(" ") ||
      existing.patient_name
  );
  const phone = text(
    body.phone ||
      body.mobile ||
      body.mobileNumber ||
      body.mobile_number ||
      existing.phone
  );
  const email = text(body.email || existing.email);

  if (!name || !phone)
    throw Object.assign(new Error("Name and phone are required"), {
      status: 400,
    });
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    throw Object.assign(new Error("Invalid email"), { status: 400 });

  const data = { ...existing, patient_name: name, phone, email: email || null };

  for (const k of fields) {
    if (k in body) data[k] = text(body[k]) || null;
  }

  // ---- alternative field names the website forms may send ----
  data.country =
    data.country ||
    text(body.country_name || body.city_country || body.cityCountry || body.city) ||
    null;
  data.disease =
    data.disease ||
    text(body.speciality || body.disease_name || body.treatment) ||
    null;
  data.hospital_name = data.hospital_name || text(body.hospital) || null;
  data.message =
    data.message ||
    text(
      body.comments ||
        body.query ||
        body.description ||
        body.additional_information ||
        body.additionalInformation ||
        body.how_can_we_help
    ) ||
    null;
  data.preferred_time =
    data.preferred_time ||
    text(
      body.preferredTime ||
        body.time ||
        body.appointment_time ||
        body.appointmentTime
    ) ||
    null;
  data.preferred_location =
    data.preferred_location ||
    text(
      body.preferredLocation ||
        body.location ||
        body.kaizen_location ||
        body.preferred_kaizen_location
    ) ||
    null;
  data.appointment_date =
    data.appointment_date ||
    text(
      body.appointmentDate ||
        body.preferred_date ||
        body.preferredDate ||
        body.preferred_appointment_date
    ) ||
    null;
  data.department =
    data.department ||
    text(body.department_name || body.departmentName || body.speciality) ||
    null;
  data.preferred_doctor =
    data.preferred_doctor ||
    text(body.doctor || body.doctor_name || body.preferredDoctor) ||
    null;
  data.visited_before =
    data.visited_before ||
    text(body.visitedBefore || body.visited || body.visited_us_before) ||
    null;

  // age: keep it short so it always fits the column
  data.age = data.age ? text(data.age).slice(0, 10) : null;

  // "I agree to be contacted" checkbox
  const consentRaw =
    body.contact_consent ?? body.consent ?? body.agree ?? body.agreed;
  if (consentRaw !== undefined) data.contact_consent = isTrue(consentRaw) ? 1 : 0;
  else if (data.contact_consent === undefined || data.contact_consent === null)
    data.contact_consent = 0;

  if (data.amount !== null && data.amount !== undefined && data.amount !== "") {
    const n = Number(data.amount);
    if (!Number.isFinite(n))
      throw Object.assign(new Error("Invalid amount"), { status: 400 });
    data.amount = n;
  } else data.amount = null;

  for (const k of ["treatment_start_date", "treatment_end_date", "appointment_date"])
    if (!/^\d{4}-\d{2}-\d{2}$/.test(data[k] || "")) data[k] = null;

  return data;
}

function fail(res, e, next) {
  if (e.status)
    return res.status(e.status).json({ success: false, message: e.message });
  next(e);
}

exports.list = async (req, res, next) => {
  try {
    const type = req.query.type || "estimate";

    if (!TYPES.includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid type",
      });
    }

    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 10));

    // Single date filter
    const date = text(req.query.date);

    if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({
        success: false,
        message: "Invalid date",
      });
    }

    const result = await HealthLibrary.list({
      type,
      search: text(req.query.search),
      date,
      page,
      limit,
      offset: (page - 1) * limit,
    });

    res.json({
      success: true,
      ...result,
    });
  } catch (e) {
    fail(res, e, next);
  }
};

exports.getOne = async (req, res, next) => {
  try {
    const row = await HealthLibrary.findById(req.params.id);
    if (!row)
      return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, data: row });
  } catch (e) {
    next(e);
  }
};

exports.create = async (req, res, next) => {
  try {
    const type = text(req.body.type || req.body.form_type);

    if (!TYPES.includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid form type",
      });
    }

    // Build form data
    const data = build(req.body);

    // Uploaded reports
    const files = (req.files || []).map((f) => ({
      name: f.originalname,
      filename: f.filename,
      size: f.size,
    }));

    // Save data in MySQL
    const saved = await HealthLibrary.create({
      ...data,
      title: data.patient_name,
      slug: `${type}-${randomUUID()}`,
      form_type: type,
      form_details: JSON.stringify(req.body),
      previous_reports: JSON.stringify(files),
    });

    // Send email only for public website submissions
    // Admin panel submissions will not send emails
    if (!req.isAdminEntry) {
      try {
        await sendHealthEnquiryEmail({
          type,
          data: saved,
        });
      } catch (err) {
        console.error("Enquiry email failed:", err);
      }
    }

    return res.status(201).json({
      success: true,
      data: saved,
      message: "Form submitted successfully",
    });
  } catch (e) {
    fail(res, e, next);
  }
};

exports.update = async (req, res, next) => {
  try {
    const existing = await HealthLibrary.findById(req.params.id);
    if (!existing)
      return res.status(404).json({ success: false, message: "Not found" });
    const data = build(req.body, existing);
    const details = { ...parse(existing.form_details), ...req.body };
    const newFiles = (req.files || []).map((f) => ({
      name: f.originalname,
      filename: f.filename,
      size: f.size,
    }));
    const oldFiles = parse(existing.previous_reports);
    const files = [...(Array.isArray(oldFiles) ? oldFiles : []), ...newFiles];
    const updated = await HealthLibrary.update(existing.id, {
      ...data,
      form_details: JSON.stringify(details),
      previous_reports: JSON.stringify(files),
    });
    res.json({ success: true, data: updated });
  } catch (e) {
    fail(res, e, next);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const row = await HealthLibrary.findById(req.params.id);
    if (!row)
      return res.status(404).json({ success: false, message: "Not found" });
    await HealthLibrary.remove(row.id);
    const reports = parse(row.previous_reports);
    if (Array.isArray(reports))
      await Promise.allSettled(
        reports.map((r) =>
          fsp.unlink(
            path.join(
              __dirname,
              "../uploads/health-library",
              path.basename(r.filename || "")
            )
          )
        )
      );
    res.json({ success: true, message: "Deleted" });
  } catch (e) {
    next(e);
  }
};

exports.downloadReport = async (req, res, next) => {
  try {
    const row = await HealthLibrary.findById(req.params.id);
    if (!row)
      return res.status(404).json({ success: false, message: "Not found" });
    const reports = parse(row.previous_reports);
    const i = Number(req.params.index);
    if (
      !Array.isArray(reports) ||
      !Number.isInteger(i) ||
      i < 0 ||
      i >= reports.length
    )
      return res
        .status(404)
        .json({ success: false, message: "Report not found" });
    const r = reports[i];
    const filePath = path.join(
      __dirname,
      "../uploads/health-library",
      path.basename(r.filename)
    );

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: "Report file not found. Please upload it again.",
      });
    }

    return res.download(filePath, r.name);
  } catch (e) {
    next(e);
  }
};


