const db = require("../config/db");
const TYPES = ["estimate", "contact", "callback"];

const columns = [
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
  "contact_consent",
];

const HealthLibrary = {
  async list({
    type = "estimate",
    search = "",
    date = "",
    page = 1,
    limit = 10,
    offset = 0,
  }) {
    if (!TYPES.includes(type))
      throw Object.assign(new Error("Invalid type"), { status: 400 });

    const where = ["form_type = ?"];
    const args = [type];

    if (search) {
      const searchColumns = [
        "patient_name",
        "phone",
        "email",
        "disease",
        "subject",
        "department",
        "preferred_doctor",
        "country",
      ];
      where.push(`(${searchColumns.map((c) => `${c} LIKE ?`).join(" OR ")})`);
      args.push(...Array(searchColumns.length).fill(`%${search}%`));
    }

    if (date) {
      where.push("created_at >= ? AND created_at < DATE_ADD(?, INTERVAL 1 DAY)");
      args.push(`${date} 00:00:00`, date);
    }

    const sql = `WHERE ${where.join(" AND ")}`;
    const [[{ total }]] = await db.query(
      `SELECT COUNT(*) total FROM health_library ${sql}`,
      args
    );
    const [rows] = await db.query(
      `SELECT * FROM health_library ${sql} ORDER BY created_at DESC, id DESC LIMIT ? OFFSET ?`,
      [...args, Number(limit), Number(offset)]
    );
    return { rows, total, page, limit };
  },

  async findById(id) {
    const [rows] = await db.query(
      "SELECT * FROM health_library WHERE id=? LIMIT 1",
      [id]
    );
    return rows[0] || null;
  },

  async create(data) {
    const keys = [
      "title",
      "slug",
      "form_type",
      ...columns,
      "form_details",
      "previous_reports",
    ];
    const values = keys.map((k) => data[k] ?? null);
    const [r] = await db.query(
      `INSERT INTO health_library (${keys.map((k) => "`" + k + "`").join(",")}) VALUES (${keys.map(() => "?").join(",")})`,
      values
    );
    return this.findById(r.insertId);
  },

  async update(id, data) {
    const keys = [...columns, "form_details", "previous_reports"];
    const values = keys.map((k) => data[k] ?? null);
    await db.query(
      `UPDATE health_library SET ${keys.map((k) => "`" + k + "`=?").join(",")} WHERE id=?`,
      [...values, id]
    );
    return this.findById(id);
  },

  async remove(id) {
    await db.query("DELETE FROM health_library WHERE id=?", [id]);
  },
};

module.exports = HealthLibrary;








