const db = require('../config/db');
const { baseSlug } = require('../utils/slug');

const Speciality = {
  async list({ search, page, limit, offset, is_active }) {
    const where = [];
    const params = [];
    if (search) {
      where.push('(sp.name LIKE ? OR sp.slug LIKE ? OR sp.about_content LIKE ?)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (is_active !== undefined && is_active !== '') {
      where.push('sp.is_active = ?');
      params.push(Number(is_active) ? 1 : 0);
    }
    const clause = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const [[{ total }]] = await db.query(`SELECT COUNT(*) AS total FROM specialities sp ${clause}`, params);
    const [rows] = await db.query(
      `SELECT sp.*,
        (SELECT GROUP_CONCAT(h.area_text ORDER BY h.sort_order SEPARATOR ', ')
 FROM speciality_care_treatment_areas h WHERE h.speciality_id = sp.id) AS highlights_text,
        (SELECT GROUP_CONCAT(ss.name ORDER BY ss.sort_order SEPARATOR ', ')
 FROM speciality_subspecialities ss WHERE ss.speciality_id = sp.id) AS subspecialities_text
FROM specialities sp ${clause}
       ORDER BY sp.sort_order ASC, sp.name ASC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );
    return { rows, total, page, limit };
  },

//  (SELECT GROUP_CONCAT(ai.title ORDER BY ai.sort_order SEPARATOR ', ')
//  FROM speciality_ailment_items ai WHERE ai.speciality_id = sp.id) AS ailments_text

async findById(id) {
  const [rows] = await db.query(
    'SELECT * FROM specialities WHERE id = ? LIMIT 1',
    [id]
  );

  const row = rows[0];
  if (!row) return null;

  const [highlights] = await db.query(
    `SELECT area_text
     FROM speciality_care_treatment_areas
     WHERE speciality_id = ?
     ORDER BY sort_order, id`,
    [id]
  );

  const [subs] = await db.query(
    `SELECT name
     FROM speciality_subspecialities
     WHERE speciality_id = ?
     ORDER BY sort_order, id`,
    [id]
  );

  // Existing speciality gallery images
  const [galleryImages] = await db.query(
    `SELECT id, image_path, alt_text, sort_order
     FROM speciality_images
     WHERE speciality_id = ?
     ORDER BY sort_order ASC, id ASC`,
    [id]
  );

  return {
    ...row,
    highlights: highlights.map((h) => h.area_text),
    subspecialities: subs.map((s) => s.name),
    gallery_images: galleryImages,
  };
},


  async create(data) {
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();
      const [result] = await conn.query(
  `INSERT INTO specialities
    (name, icon_name, slug, about_content, when_to_consult,
     about_image, is_active, sort_order)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
  [
    data.name,
    data.icon_name,
    data.slug,
    data.about_content || null,
    data.when_to_consult || null,
    data.about_image || null,
    data.is_active,
    data.sort_order || 0,
  ]
);
     await this.replaceChildren(conn, result.insertId, data);

for (let i = 0; i < (data.galleryImages || []).length; i += 1) {
  await conn.query(
    `INSERT INTO speciality_images
      (speciality_id, image_path, sort_order)
     VALUES (?, ?, ?)`,
    [
      result.insertId,
      data.galleryImages[i].image_path,
      i,
    ]
  );
}
      await conn.commit();
      return this.findById(result.insertId);
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  },

  async update(id, data) {
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();
     await conn.query(
  `UPDATE specialities
   SET name = ?, icon_name = ?, slug = ?, about_content = ?,
       when_to_consult = ?, about_image = ?, is_active = ?,
       sort_order = ?
   WHERE id = ?`,
  [
    data.name,
    data.icon_name,
    data.slug,
    data.about_content || null,
    data.when_to_consult || null,
    data.about_image,
    data.is_active,
    data.sort_order || 0,
    id,
  ]
);
      await this.replaceChildren(conn, id, data);

    const [[{ maxSortOrder }]] = await conn.query(
  `SELECT COALESCE(MAX(sort_order), -1) AS maxSortOrder
   FROM speciality_images
   WHERE speciality_id = ?`,
  [id]
);

for (let i = 0; i < (data.galleryImages || []).length; i += 1) {
  await conn.query(
    `INSERT INTO speciality_images
      (speciality_id, image_path, sort_order)
     VALUES (?, ?, ?)`,
    [
      id,
      data.galleryImages[i].image_path,
      maxSortOrder + i + 1,
    ]
  );
}

      await conn.commit();
      return this.findById(id);
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  },

  async replaceChildren(conn, specialityId, data) {
    await conn.query('DELETE FROM speciality_care_treatment_areas WHERE speciality_id = ?', [specialityId]);
    await conn.query('DELETE FROM speciality_subspecialities WHERE speciality_id = ?', [specialityId]);
    // await conn.query('DELETE FROM speciality_ailment_items WHERE speciality_id = ?', [specialityId]);

    for (let i = 0; i < (data.highlights || []).length; i += 1) {
    await conn.query(
  'INSERT INTO speciality_care_treatment_areas (speciality_id, area_text, sort_order) VALUES (?, ?, ?)',
  [specialityId, data.highlights[i], i]
);
    }
    const usedSlugs = new Set();
    for (let i = 0; i < (data.subspecialities || []).length; i += 1) {
      let slug = baseSlug(data.subspecialities[i]);
      let n = 2;
      while (usedSlugs.has(slug)) {
        slug = `${baseSlug(data.subspecialities[i])}-${n}`;
        n += 1;
      }
      usedSlugs.add(slug);
      await conn.query(
        'INSERT INTO speciality_subspecialities (speciality_id, name, slug, sort_order) VALUES (?, ?, ?, ?)',
        [specialityId, data.subspecialities[i], slug, i]
      );
    }
    // for (let i = 0; i < (data.ailments || []).length; i += 1) {
    //   await conn.query(
    //     'INSERT INTO speciality_ailment_items (speciality_id, name, sort_order) VALUES (?, ?, ?)',
    //     [specialityId, data.ailments[i], i]
    //   );
    // }
//     for (let i = 0; i < (data.ailments || []).length; i += 1) {
//   const item = data.ailments[i];

//   await conn.query(
//     `INSERT INTO speciality_ailment_items
//       (speciality_id, title, description, sort_order)
//      VALUES (?, ?, ?, ?)`,
//     [
//       specialityId,
//       item.title,
//       item.description || null,
//       i,
//     ]
//   );
// }
  },

async findPublicDetailsBySlug(slug) {
  // SPECIALITY MAIN DATA
  const [rows] = await db.query(
    `SELECT *
     FROM specialities
     WHERE slug = ?
       AND is_active = 1
     LIMIT 1`,
    [slug]
  );

  const row = rows[0];

  if (!row) {
    return null;
  }

  const specialityId = row.id;

  // RELATED DATA
  const [
    [highlights],
    [subspecialities],
    [galleryImages],
    [stories],
  ] = await Promise.all([
    // CARE & TREATMENT AREAS
    db.query(
      `SELECT id, area_text, sort_order
       FROM speciality_care_treatment_areas
       WHERE speciality_id = ?
       ORDER BY sort_order ASC, id ASC`,
      [specialityId]
    ),

    // SUB SPECIALITIES
    db.query(
      `SELECT id, name, slug, sort_order
       FROM speciality_subspecialities
       WHERE speciality_id = ?
       ORDER BY sort_order ASC, id ASC`,
      [specialityId]
    ),

    // SPECIALITY GALLERY IMAGES
    db.query(
      `SELECT id, image_path, alt_text, sort_order
       FROM speciality_images
       WHERE speciality_id = ?
       ORDER BY sort_order ASC, id ASC`,
      [specialityId]
    ),

    // PATIENT STORIES
    db.query(
      `SELECT
         id,
         patient_name,
         title,
         slug,
         speciality_id,
         video_url,
         created_at
       FROM our_stories
       WHERE speciality_id = ?
         AND is_published = 1
       ORDER BY created_at DESC`,
      [specialityId]
    ),
  ]);

  // PUBLIC RESPONSE
  return {
    ...row,
    highlights: highlights.map((item) => item.area_text),
    subspecialities,
    gallery_images: galleryImages,
    patient_stories: stories,
  };
},


  async remove(id) {
    await db.query('DELETE FROM specialities WHERE id = ?', [id]);
  },

  async options() {
    const [rows] = await db.query(
      'SELECT id, name FROM specialities WHERE is_active = 1 ORDER BY sort_order ASC, name ASC'
    );
    return rows;
  },
};

module.exports = Speciality;


