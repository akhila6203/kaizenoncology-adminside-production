
const db = require("../config/db");

const homeSliderModel = {
  // PUBLIC - active slides only
  getActive: async () => {
    const [rows] = await db.query(
      `SELECT * FROM homepage_slides
       WHERE status = 'active'
       ORDER BY sort_order ASC, id ASC`
    );

    return rows;
  },

  // ADMIN - all slides
  getAll: async () => {
    const [rows] = await db.query(
      `SELECT * FROM homepage_slides
       ORDER BY sort_order ASC, id ASC`
    );

    return rows;
  },

  getById: async (id) => {
    const [rows] = await db.query(
      `SELECT * FROM homepage_slides
       WHERE id = ?
       LIMIT 1`,
      [id]
    );

    return rows[0] || null;
  },

  create: async (data) => {
    const [result] = await db.query(
      `INSERT INTO homepage_slides (
        image,
        eyebrow,
        title,
        description,
        primary_text,
        primary_path,
        secondary_text,
        secondary_path,
        sort_order,
        status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.image,
        data.eyebrow,
        data.title,
        data.description,
        data.primary_text,
        data.primary_path,
        data.secondary_text,
        data.secondary_path,
        data.sort_order,
        data.status,
      ]
    );

    return result.insertId;
  },

  update: async (id, data) => {
    await db.query(
      `UPDATE homepage_slides SET
        image = ?,
        eyebrow = ?,
        title = ?,
        description = ?,
        primary_text = ?,
        primary_path = ?,
        secondary_text = ?,
        secondary_path = ?,
        sort_order = ?,
        status = ?
      WHERE id = ?`,
      [
        data.image,
        data.eyebrow,
        data.title,
        data.description,
        data.primary_text,
        data.primary_path,
        data.secondary_text,
        data.secondary_path,
        data.sort_order,
        data.status,
        id,
      ]
    );

    return true;
  },

  delete: async (id) => {
    await db.query(
      `DELETE FROM homepage_slides WHERE id = ?`,
      [id]
    );

    return true;
  },
};

module.exports = homeSliderModel;
