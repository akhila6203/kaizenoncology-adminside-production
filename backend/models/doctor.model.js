const db = require('../config/db');

/*
  Sections stored in doctor_profile_items (section column).
  Keep in sync with the controller and LIST_FIELDS in DoctorForm.jsx.
*/
const PROFILE_SECTIONS = [
  'awards_recognition',
  'professional_experience',
  'conferences_workshops',
  'fellowship_memberships',
  'research_publications',
  'procedures_treatments',
  'languages',
  'youtube_videos',
];

const Doctor = {
  async list({ search, page, limit, offset, speciality_id, is_active }) {
    const where = [];
    const params = [];
    if (search) {
      where.push('(d.name LIKE ? OR d.license_number LIKE ? OR d.hospital_location LIKE ? OR d.slug LIKE ?)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (speciality_id) {
      // matches the primary speciality OR any of the doctor's extra specialities
      where.push(
        '(d.speciality_id = ? OR d.id IN (SELECT ds.doctor_id FROM doctor_specialities ds WHERE ds.speciality_id = ?))'
      );
      params.push(Number(speciality_id), Number(speciality_id));
    }
    if (is_active !== undefined && is_active !== '') {
      where.push('d.is_active = ?');
      params.push(Number(is_active) ? 1 : 0);
    }
    const clause = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const [[{ total }]] = await db.query(
      `SELECT COUNT(*) AS total FROM doctors d ${clause}`,
      params
    );
    const [rows] = await db.query(
      `SELECT d.*, s.name AS speciality_name,
        (SELECT GROUP_CONCAT(sp.name ORDER BY sp.name SEPARATOR ', ')
         FROM doctor_specialities ds
         JOIN specialities sp ON sp.id = ds.speciality_id
         WHERE ds.doctor_id = d.id) AS speciality_names,
        (SELECT GROUP_CONCAT(dq.qualification ORDER BY dq.sort_order SEPARATOR ', ')
         FROM doctor_qualifications dq
         WHERE dq.doctor_id = d.id) AS qualifications_text,
        (SELECT GROUP_CONCAT(de.expertise ORDER BY de.sort_order SEPARATOR ', ')
         FROM doctor_expertise de
         WHERE de.doctor_id = d.id) AS expertise_text,
        (SELECT GROUP_CONCAT(pi.item_text ORDER BY pi.sort_order SEPARATOR ', ')
         FROM doctor_profile_items pi
         WHERE pi.doctor_id = d.id AND pi.section = 'languages') AS languages_text
       FROM doctors d
       LEFT JOIN specialities s ON s.id = d.speciality_id
       ${clause}
       ORDER BY d.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );
    return { rows, total, page, limit };
  },

  async findById(id) {
    const [rows] = await db.query(
      `SELECT d.*, s.name AS speciality_name
       FROM doctors d
       LEFT JOIN specialities s ON s.id = d.speciality_id
       WHERE d.id = ? LIMIT 1`,
      [id]
    );
    const doctor = rows[0];
    if (!doctor) return null;

    const [qualifications] = await db.query(
      'SELECT id, qualification, sort_order FROM doctor_qualifications WHERE doctor_id = ? ORDER BY sort_order, id',
      [id]
    );
    const [expertise] = await db.query(
      'SELECT id, expertise, sort_order FROM doctor_expertise WHERE doctor_id = ? ORDER BY sort_order, id',
      [id]
    );

    // multiple specialities
    const [specRows] = await db.query(
      `SELECT sp.id, sp.name
       FROM doctor_specialities ds
       JOIN specialities sp ON sp.id = ds.speciality_id
       WHERE ds.doctor_id = ?
       ORDER BY sp.name`,
      [id]
    );
    let speciality_ids = specRows.map((r) => r.id);
    let speciality_names = specRows.map((r) => r.name).join(', ');
    // fallback for doctors saved before the join table existed
    if (!speciality_ids.length && doctor.speciality_id) {
      speciality_ids = [doctor.speciality_id];
      speciality_names = doctor.speciality_name || '';
    }

    // new list sections
    const [items] = await db.query(
      'SELECT section, item_text FROM doctor_profile_items WHERE doctor_id = ? ORDER BY sort_order, id',
      [id]
    );
    const profile = {};

PROFILE_SECTIONS.forEach((key) => {
  profile[key] = [];
});

items.forEach((row) => {
  if (profile[row.section]) {
    profile[row.section].push(row.item_text);
  }
});

// Backward compatibility:
// Existing doctors with only doctors.youtube_url
// should also display that URL in the repeatable list.
if (
  profile.youtube_videos.length === 0 &&
  doctor.youtube_url
) {
  profile.youtube_videos = [doctor.youtube_url];
}

    return {
      ...doctor,
      speciality_ids,
      speciality_names,
      qualifications: qualifications.map((q) => q.qualification),
      expertise: expertise.map((e) => e.expertise),
      ...profile, // awards_recognition, professional_experience, ... languages
    };
  },

  async create(data) {
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();
      const [result] = await conn.query(
        `INSERT INTO doctors
          (
            name, slug, designation, speciality_id, photo,
            license_number, hospital_location, short_bio,
            about, youtube_url,
            experience_years, is_featured, is_active,
            meta_title, meta_description
          )
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          data.name,
          data.slug,
          data.designation || null,
          data.speciality_id,
          data.photo || null,
          data.license_number || null,
          data.hospital_location || null,
          data.short_bio || null,
          data.about || null,
          data.youtube_url || null,
          data.experience_years,
          data.is_featured,
          data.is_active,
          data.meta_title || null,
          data.meta_description || null,
        ]
      );
      const id = result.insertId;
      await this.replaceChildren(conn, id, data);
      await conn.commit();
      return this.findById(id);
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
        `UPDATE doctors SET
          name = ?, slug = ?, designation = ?, speciality_id = ?,
          photo = ?, license_number = ?, hospital_location = ?,
          short_bio = ?, about = ?, youtube_url = ?,
          experience_years = ?, is_featured = ?, is_active = ?,
          meta_title = ?, meta_description = ?
         WHERE id = ?`,
        [
          data.name,
          data.slug,
          data.designation || null,
          data.speciality_id,
          data.photo,
          data.license_number || null,
          data.hospital_location || null,
          data.short_bio || null,
          data.about || null,
          data.youtube_url || null,
          data.experience_years,
          data.is_featured,
          data.is_active,
          data.meta_title || null,
          data.meta_description || null,
          id,
        ]
      );
      await this.replaceChildren(conn, id, data);
      await conn.commit();
      return this.findById(id);
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  },

  async replaceChildren(conn, doctorId, data) {
    await conn.query('DELETE FROM doctor_qualifications WHERE doctor_id = ?', [doctorId]);
    await conn.query('DELETE FROM doctor_expertise WHERE doctor_id = ?', [doctorId]);
    await conn.query('DELETE FROM doctor_specialities WHERE doctor_id = ?', [doctorId]);
    await conn.query('DELETE FROM doctor_profile_items WHERE doctor_id = ?', [doctorId]);

    for (let i = 0; i < (data.qualifications || []).length; i += 1) {
      await conn.query(
        'INSERT INTO doctor_qualifications (doctor_id, qualification, sort_order) VALUES (?, ?, ?)',
        [doctorId, data.qualifications[i], i]
      );
    }
    for (let i = 0; i < (data.expertise || []).length; i += 1) {
      await conn.query(
        'INSERT INTO doctor_expertise (doctor_id, expertise, sort_order) VALUES (?, ?, ?)',
        [doctorId, data.expertise[i], i]
      );
    }

    // multiple specialities
    for (const specialityId of data.speciality_ids || []) {
      await conn.query(
        'INSERT INTO doctor_specialities (doctor_id, speciality_id) VALUES (?, ?)',
        [doctorId, specialityId]
      );
    }

    // new list sections
    const profile = data.profile || {};
    for (const section of PROFILE_SECTIONS) {
      const list = profile[section] || [];
      for (let i = 0; i < list.length; i += 1) {
        await conn.query(
          'INSERT INTO doctor_profile_items (doctor_id, section, item_text, sort_order) VALUES (?, ?, ?, ?)',
          [doctorId, section, list[i], i]
        );
      }
    }
  },

  async remove(id) {
    await db.query('DELETE FROM doctors WHERE id = ?', [id]);
  },

  async options() {
    const [rows] = await db.query(
      'SELECT id, name, designation FROM doctors WHERE is_active = 1 ORDER BY name ASC'
    );
    return rows;
  },
};

module.exports = Doctor;


