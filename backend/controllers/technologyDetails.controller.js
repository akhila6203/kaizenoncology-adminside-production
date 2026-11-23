const pool = require('../config/db');

async function loadDetails(technologyId) {
  // Fetch technology detail sections
  const [sections] = await pool.query(
    `SELECT id, technology_id, heading, paragraph, image, sort_order
     FROM technology_sections
     WHERE technology_id = ?
     ORDER BY sort_order ASC, id ASC`,
    [technologyId]
  );

  let points = [];

  if (sections.length) {
    const sectionIds = sections.map((section) => section.id);

    [points] = await pool.query(
      `SELECT section_id, point_text AS text
       FROM technology_section_points
       WHERE section_id IN (?)
       ORDER BY sort_order ASC, id ASC`,
      [sectionIds]
    );
  }

  // Fetch FAQs
  const [faqs] = await pool.query(
    `SELECT id, technology_id, question, answer, sort_order
     FROM technology_faqs
     WHERE technology_id = ?
     ORDER BY sort_order ASC, id ASC`,
    [technologyId]
  );

  return {
    sections: sections.map((section) => ({
      ...section,
      points: points
        .filter((point) => point.section_id === section.id)
        .map(({ text }) => ({ text })),
    })),
    faqs,
  };
}

// Admin: GET /api/technology-details/:technologyId
exports.get = async (req, res, next) => {
  try {
    res.json({ success: true, data: await loadDetails(req.params.technologyId) });
  } catch (e) { next(e); }
};

// Admin: PUT /api/technology-details/:technologyId  (replaces everything in one transaction)
exports.save = async (req, res, next) => {
  const conn = await pool.getConnection();
  try {
    const { technologyId } = req.params;
    const sections = Array.isArray(req.body.sections) ? req.body.sections : [];
    const faqs = Array.isArray(req.body.faqs) ? req.body.faqs : [];

    await conn.beginTransaction();
    await conn.query('DELETE FROM technology_sections WHERE technology_id=?', [technologyId]); // points cascade
    await conn.query('DELETE FROM technology_faqs WHERE technology_id=?', [technologyId]);

    for (let i = 0; i < sections.length; i++) {
      const s = sections[i];
      if (!s.heading || !s.heading.trim()) continue;
      const [r] = await conn.query(
        'INSERT INTO technology_sections (technology_id, heading, paragraph, image, sort_order) VALUES (?,?,?,?,?)',
        [technologyId, s.heading.trim(), s.paragraph || null, s.image || null, i]
      );
      const pts = (s.points || []).filter((p) => p.text && p.text.trim());
      for (let j = 0; j < pts.length; j++) {
        await conn.query(
  `INSERT INTO technology_section_points
   (section_id, point_text, sort_order)
   VALUES (?, ?, ?)`,
  [r.insertId, pts[j].text.trim(), j]
);
      }
    }

    const validFaqs = faqs.filter((f) => f.question?.trim() && f.answer?.trim());
    for (let i = 0; i < validFaqs.length; i++) {
      await conn.query(
        'INSERT INTO technology_faqs (technology_id, question, answer, sort_order) VALUES (?,?,?,?)',
        [technologyId, validFaqs[i].question.trim(), validFaqs[i].answer.trim(), i]
      );
    }

    await conn.commit();
    res.json({ success: true, message: 'Technology details saved' });
  } catch (e) {
    await conn.rollback();
    next(e);
  } finally {
    conn.release();
  }
};

// Public: GET /api/public/technologies/:slug/details
exports.getPublicBySlug = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, title, slug, short_description, content, thumbnail FROM technologies WHERE slug=? AND is_published=1',
      [req.params.slug]
    );
    if (!rows.length) return res.status(404).json({ success: false, message: 'Technology not found' });
    const details = await loadDetails(rows[0].id);
    res.json({ success: true, data: { technology: rows[0], ...details } });
  } catch (e) { next(e); }
};
const slugify = (s) =>
  String(s || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

// Convert speciality_ids from request into an array of valid IDs.
function parseSpecialityIds(value) {
  let ids = value;

  if (typeof ids === "string") {
    try {
      ids = JSON.parse(ids);
    } catch {
      ids = ids.split(",");
    }
  }

  if (!Array.isArray(ids)) return [];

  return [
    ...new Set(
      ids
        .map(Number)
        .filter((id) => Number.isInteger(id) && id > 0)
    ),
  ];
}

// Save selected specialities using the EXISTING speciality_technologies table
async function saveTechnologySpecialities(conn, technologyId, specialityIds) {
  // Remove old mappings
  await conn.query(
    `DELETE FROM speciality_technologies
     WHERE technology_id = ?`,
    [technologyId]
  );

  // Insert selected specialities
  for (let i = 0; i < specialityIds.length; i++) {
    await conn.query(
      `INSERT INTO speciality_technologies
        (speciality_id, technology_id, sort_order)
       VALUES (?, ?, ?)`,
      [specialityIds[i], technologyId, i]
    );
  }
}

// Get speciality names and IDs for multiple technologies.
// Attach speciality names and IDs to technology records
async function attachTechnologySpecialities(rows) {
  if (!rows.length) return rows;

  const technologyIds = rows.map((item) => item.id);

  const [mappings] = await pool.query(
    `SELECT
       st.technology_id,
       st.speciality_id,
       s.name AS speciality_name
     FROM speciality_technologies st
     INNER JOIN specialities s
       ON s.id = st.speciality_id
     WHERE st.technology_id IN (?)
       AND s.is_active = 1
     ORDER BY st.sort_order ASC, s.name ASC`,
    [technologyIds]
  );

  return rows.map((item) => {
    const assigned = mappings.filter(
      (mapping) =>
        Number(mapping.technology_id) === Number(item.id)
    );

    return {
      ...item,
      speciality_ids: assigned.map((s) => Number(s.speciality_id)),
      specialities: assigned.map((s) => s.speciality_name),
    };
  });
}

// GET /api/technology-details/item/:id
exports.getTechnology = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT
         id,
         title,
         slug,
         short_description,
         thumbnail,
         is_published
       FROM technologies
       WHERE id = ?`,
      [req.params.id]
    );

    if (!rows.length) {
      return res.status(404).json({
        success: false,
        message: "Technology not found",
      });
    }

    const [mappings] = await pool.query(
  `SELECT speciality_id
   FROM speciality_technologies
   WHERE technology_id = ?
   ORDER BY sort_order ASC, id ASC`,
  [req.params.id]
);
    res.json({
      success: true,
      data: {
        ...rows[0],
        speciality_ids: mappings.map((item) => item.speciality_id),
      },
    });
  } catch (e) {
    next(e);
  }
};

// POST /api/technology-details/item
exports.createTechnology = async (req, res, next) => {
  const conn = await pool.getConnection();

  try {
    const {
      title,
      short_description,
      thumbnail,
      is_published,
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Title is required",
      });
    }

    const slug = slugify(req.body.slug || title);
    const specialityIds = parseSpecialityIds(req.body.speciality_ids);

    await conn.beginTransaction();

    const [result] = await conn.query(
      `INSERT INTO technologies
        (title, slug, short_description, thumbnail, is_published)
       VALUES (?, ?, ?, ?, ?)`,
      [
        title.trim(),
        slug,
        short_description || null,
        thumbnail || null,
        is_published ? 1 : 0,
      ]
    );

    await saveTechnologySpecialities(
      conn,
      result.insertId,
      specialityIds
    );

    await conn.commit();

    res.status(201).json({
      success: true,
      data: {
        id: result.insertId,
        speciality_ids: specialityIds,
      },
    });
  } catch (e) {
    await conn.rollback();

    if (e.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        success: false,
        message: "Slug already exists",
      });
    }

    next(e);
  } finally {
    conn.release();
  }
};

// PUT /api/technology-details/item/:id
exports.updateTechnology = async (req, res, next) => {
  const conn = await pool.getConnection();

  try {
    const {
      title,
      short_description,
      thumbnail,
      is_published,
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Title is required",
      });
    }

    const slug = slugify(req.body.slug || title);
    const specialityIds = parseSpecialityIds(req.body.speciality_ids);

    await conn.beginTransaction();

    const [result] = await conn.query(
      `UPDATE technologies
       SET title = ?,
           slug = ?,
           short_description = ?,
           thumbnail = ?,
           is_published = ?
       WHERE id = ?`,
      [
        title.trim(),
        slug,
        short_description || null,
        thumbnail || null,
        is_published ? 1 : 0,
        req.params.id,
      ]
    );

    const [existingTechnology] = await conn.query(
  `SELECT id FROM technologies WHERE id = ?`,
  [req.params.id]
);

if (!existingTechnology.length) {
  await conn.rollback();

  return res.status(404).json({
    success: false,
    message: "Technology not found",
  });
}

    await saveTechnologySpecialities(
      conn,
      req.params.id,
      specialityIds
    );

    await conn.commit();

    res.json({
      success: true,
      message: "Technology updated",
      speciality_ids: specialityIds,
    });
  } catch (e) {
    await conn.rollback();

    if (e.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        success: false,
        message: "Slug already exists",
      });
    }

    next(e);
  } finally {
    conn.release();
  }
};

// DELETE /api/technology-details/item/:id
exports.deleteTechnology = async (req, res, next) => {
  try {
    await pool.query('DELETE FROM technologies WHERE id=?', [req.params.id]);
    res.json({ success: true, message: 'Technology deleted' });
  } catch (e) { next(e); }
};

// GET /api/technology-details (list for admin page)

exports.list = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT
        id,
        title,
        slug,
        short_description,
        thumbnail,
        is_published
      FROM technologies
      ORDER BY id DESC`
    );

    const data = await attachTechnologySpecialities(rows);

    res.json({
      success: true,
      data,
    });
  } catch (e) {
    next(e);
  }
};


exports.listPublic = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT
         id,
         title,
         slug,
         short_description,
         thumbnail,
         is_published,
         created_at
       FROM technologies
       WHERE is_published = 1
       ORDER BY id DESC`
    );

    const data = await attachTechnologySpecialities(rows);

    
    res.json({
      success: true,
      data,
    });

  } catch (error) {
    console.error("Public technologies list error:", error);
    next(error);
  }
};