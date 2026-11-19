const db = require('../config/db');

// shared SELECT: FAQ + speciality name ("Other" when is_other = 1)
const SELECT_FAQ = `
  SELECT f.*,
         s.name AS speciality_name,
         CASE
           WHEN f.is_other = 1 THEN 'Other'
           ELSE s.name
         END AS speciality_label
  FROM faqs f
  LEFT JOIN specialities s ON s.id = f.speciality_id
`;

const Faq = {
  async list({ search, speciality_id, display_page, page, limit, offset }) {
    const where = [];
    const params = [];

    if (search) {
      where.push('(f.question LIKE ? OR f.answer LIKE ? OR s.name LIKE ?)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    // optional filter: ?speciality_id=12  or  ?speciality_id=other
    if (speciality_id === 'other') {
      where.push('f.is_other = 1');
    } else if (speciality_id) {
      where.push('f.speciality_id = ?');
      params.push(Number(speciality_id));
    }

    // website use: ?display_page=home -> published "Other" FAQs chosen for that page
    if (display_page) {
      where.push('f.is_other = 1 AND f.is_published = 1 AND FIND_IN_SET(?, f.display_pages) > 0');
      params.push(String(display_page));
    }

    const clause = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const [[{ total }]] = await db.query(
      `SELECT COUNT(*) AS total
       FROM faqs f
       LEFT JOIN specialities s ON s.id = f.speciality_id
       ${clause}`,
      params
    );
    const [rows] = await db.query(
      `${SELECT_FAQ} ${clause} ORDER BY f.sort_order ASC, f.created_at DESC LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );
    return { rows, total, page, limit };
  },

  async findById(id) {
    const [rows] = await db.query(`${SELECT_FAQ} WHERE f.id = ? LIMIT 1`, [id]);
    return rows[0] || null;
  },

  async create(data) {
    const [result] = await db.query(
      `INSERT INTO faqs (question, answer, speciality_id, is_other, display_pages, sort_order, is_published)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        data.question,
        data.answer,
        data.speciality_id,
        data.is_other,
        data.display_pages || null,
        data.sort_order || 0,
        data.is_published,
      ]
    );
    return this.findById(result.insertId);
  },

  async update(id, data) {
    await db.query(
      `UPDATE faqs
       SET question = ?, answer = ?, speciality_id = ?, is_other = ?, display_pages = ?, sort_order = ?, is_published = ?
       WHERE id = ?`,
      [
        data.question,
        data.answer,
        data.speciality_id,
        data.is_other,
        data.display_pages || null,
        data.sort_order || 0,
        data.is_published,
        id,
      ]
    );
    return this.findById(id);
  },

  async remove(id) {
    await db.query('DELETE FROM faqs WHERE id = ?', [id]);
  },
};

module.exports = Faq;