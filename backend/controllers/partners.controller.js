
const db = require("../config/db");

const filePath = (file) =>
  `/uploads/partners/${file.filename}`;

const validateWebsiteUrl = (value) => {
  if (!value || !value.trim()) return null;

  try {
    const url = new URL(value.trim());

    if (!["http:", "https:"].includes(url.protocol)) {
      return false;
    }

    return url.href;
  } catch {
    return false;
  }
};

// GET ALL PARTNERS
exports.list = async (req, res, next) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM partners ORDER BY id DESC"
    );

    res.json({
      success: true,
      data: rows,
    });
  } catch (error) {
    next(error);
  }
};

// GET SINGLE PARTNER
exports.getOne = async (req, res, next) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM partners WHERE id = ?",
      [req.params.id]
    );

    if (!rows.length) {
      return res.status(404).json({
        success: false,
        message: "Partner not found",
      });
    }

    res.json({
      success: true,
      data: rows[0],
    });
  } catch (error) {
    next(error);
  }
};

// CREATE PARTNER
exports.create = async (req, res, next) => {
  try {
    const { name, website_url } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Partner name is required",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Logo is required",
      });
    }

    const websiteUrl = validateWebsiteUrl(website_url);

    if (websiteUrl === false) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid website URL starting with http:// or https://",
      });
    }

    const logo = filePath(req.file);

    const [result] = await db.query(
      `INSERT INTO partners (name, logo, website_url)
       VALUES (?, ?, ?)`,
      [name.trim(), logo, websiteUrl]
    );

    res.status(201).json({
      success: true,
      message: "Partner added successfully",
      data: {
        id: result.insertId,
        name: name.trim(),
        logo,
        website_url: websiteUrl,
      },
    });
  } catch (error) {
    next(error);
  }
};

// UPDATE PARTNER
exports.update = async (req, res, next) => {
  try {
    const { name, website_url } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Partner name is required",
      });
    }

    const [rows] = await db.query(
      "SELECT * FROM partners WHERE id = ?",
      [req.params.id]
    );

    if (!rows.length) {
      return res.status(404).json({
        success: false,
        message: "Partner not found",
      });
    }

    const websiteUrl = validateWebsiteUrl(website_url);

    if (websiteUrl === false) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid website URL starting with http:// or https://",
      });
    }

    const logo = req.file
      ? filePath(req.file)
      : rows[0].logo;

    await db.query(
      `UPDATE partners
       SET name = ?, logo = ?, website_url = ?
       WHERE id = ?`,
      [name.trim(), logo, websiteUrl, req.params.id]
    );

    res.json({
      success: true,
      message: "Partner updated successfully",
    });
  } catch (error) {
    next(error);
  }
};

// DELETE PARTNER
exports.remove = async (req, res, next) => {
  try {
    await db.query(
      "DELETE FROM partners WHERE id = ?",
      [req.params.id]
    );

    res.json({
      success: true,
      message: "Partner deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};






// const db = require('../config/db'); // COPY the same db import your specialities controller uses

// // COPY: use the same logo path format that specialities stores for about_image,
// // so mediaUrl() on the frontend works unchanged.
// const filePath = (file) => `/uploads/partners/${file.filename}`;

// exports.list = async (req, res) => {
//   const [rows] = await db.query('SELECT * FROM partners ORDER BY id DESC');
//   res.json({ success: true, data: rows });
// };

// exports.getOne = async (req, res) => {
//   const [rows] = await db.query('SELECT * FROM partners WHERE id = ?', [req.params.id]);
//   if (!rows.length) return res.status(404).json({ success: false, message: 'Partner not found' });
//   res.json({ success: true, data: rows[0] });
// };

// exports.create = async (req, res) => {
//   const { name } = req.body;
//   if (!name || !name.trim()) return res.status(400).json({ success: false, message: 'Partner name is required' });
//   if (!req.file) return res.status(400).json({ success: false, message: 'Logo is required' });
//   const [result] = await db.query('INSERT INTO partners (name, logo) VALUES (?, ?)', [name.trim(), filePath(req.file)]);
//   res.status(201).json({ success: true, data: { id: result.insertId } });
// };

// exports.update = async (req, res) => {
//   const { name } = req.body;
//   if (!name || !name.trim()) return res.status(400).json({ success: false, message: 'Partner name is required' });
//   const [rows] = await db.query('SELECT * FROM partners WHERE id = ?', [req.params.id]);
//   if (!rows.length) return res.status(404).json({ success: false, message: 'Partner not found' });
//   const logo = req.file ? filePath(req.file) : rows[0].logo; // keep old logo if none uploaded
//   await db.query('UPDATE partners SET name = ?, logo = ? WHERE id = ?', [name.trim(), logo, req.params.id]);
//   res.json({ success: true });
// };

// exports.remove = async (req, res) => {
//   await db.query('DELETE FROM partners WHERE id = ?', [req.params.id]);
//   res.json({ success: true });
// };