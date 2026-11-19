const db = require('../config/db');

const Blog = {
  async list({ search, page, limit, offset, category, is_published }) {
    const where = [];
    const params = [];
    if (search) {
      where.push('(title LIKE ? OR author_name LIKE ? OR slug LIKE ?)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (category) {
      where.push('category = ?');
      params.push(category);
    }
    if (is_published !== undefined && is_published !== '') {
      where.push('is_published = ?');
      params.push(Number(is_published) ? 1 : 0);
    }
    const clause = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const [[{ total }]] = await db.query(`SELECT COUNT(*) AS total FROM blogs ${clause}`, params);
    const [rows] = await db.query(
      `SELECT * FROM blogs ${clause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );
    return { rows, total, page, limit };
  },

  async findById(id) {
    const [rows] = await db.query('SELECT * FROM blogs WHERE id = ? LIMIT 1', [id]);
    return rows[0] || null;
  },

    // PUBLIC: Get only published blogs
// PUBLIC: Get only published blogs
async listPublished({
  search,
  speciality_id,
  page,
  limit,
  offset,
}) {
  const where = ["b.is_published = 1"];
  const params = [];

  if (search) {
    where.push(`
      (
        b.title LIKE ?
        OR b.content LIKE ?
        OR b.category LIKE ?
        OR s.name LIKE ?
      )
    `);

    const value = `%${search}%`;
    params.push(value, value, value, value);
  }

  if (speciality_id) {
    where.push("b.speciality_id = ?");
    params.push(Number(speciality_id));
  }

  const clause = `WHERE ${where.join(" AND ")}`;

  const join = `
    FROM blogs b
    LEFT JOIN specialities s
      ON s.id = b.speciality_id
  `;

  const [[{ total }]] = await db.query(
    `
      SELECT COUNT(*) AS total
      ${join}
      ${clause}
    `,
    params
  );

  const [rows] = await db.query(
    `
      SELECT
        b.*,
        s.name AS speciality_name
      ${join}
      ${clause}
      ORDER BY b.published_at DESC, b.created_at DESC
      LIMIT ? OFFSET ?
    `,
    [...params, limit, offset]
  );

  return { rows, total, page, limit };
},

  // PUBLIC: Get one published blog by slug
 
// PUBLIC: Get one published blog by slug
async findPublishedBySlug(slug) {
  const [rows] = await db.query(
    `
      SELECT
        b.*,
        s.name AS speciality_name
      FROM blogs b
      LEFT JOIN specialities s
        ON s.id = b.speciality_id
      WHERE b.slug = ?
        AND b.is_published = 1
      LIMIT 1
    `,
    [slug]
  );

  return rows[0] || null;
},


async create(data) {
  const [result] = await db.query(
    `INSERT INTO blogs
      (
        title,
        slug,
        speciality_id,
        author_name,
        thumbnail,
        category,
        content,
        tags,
        is_published,
        published_at,
        meta_title,
        meta_description
      )
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.title,
      data.slug,
      data.speciality_id || null,
      data.author_name || null,
      data.thumbnail || null,
      data.category || null,
      data.content || null,
      data.tags,
      data.is_published,
      data.published_at,
      data.meta_title || null,
      data.meta_description || null,
    ]
  );

  return this.findById(result.insertId);
},

  // async create(data) {
  //   const [result] = await db.query(
  //     `INSERT INTO blogs
  //       (title, slug, author_name, thumbnail, category, content, tags, is_published, published_at, meta_title, meta_description)
  //      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  //     [
  //       data.title,
  //       data.slug,
  //       data.author_name || null,
  //       data.thumbnail || null,
  //       data.category || null,
  //       data.content || null,
  //       data.tags,
  //       data.is_published,
  //       data.published_at,
  //       data.meta_title || null,
  //       data.meta_description || null,
  //     ]
  //   );
  //   return this.findById(result.insertId);
  // },

  // async update(id, data) {
  //   await db.query(
  //     `UPDATE blogs SET
  //       title = ?, slug = ?, author_name = ?, thumbnail = ?, category = ?, content = ?,
  //       tags = ?, is_published = ?, published_at = ?, meta_title = ?, meta_description = ?
  //      WHERE id = ?`,
  //     [
  //       data.title,
  //       data.slug,
  //       data.author_name || null,
  //       data.thumbnail,
  //       data.category || null,
  //       data.content || null,
  //       data.tags,
  //       data.is_published,
  //       data.published_at,
  //       data.meta_title || null,
  //       data.meta_description || null,
  //       id,
  //     ]
  //   );
  //   return this.findById(id);
  // },


async update(id, data) {
  await db.query(
    `UPDATE blogs SET
      title = ?,
      slug = ?,
      speciality_id = ?,
      author_name = ?,
      thumbnail = ?,
      category = ?,
      content = ?,
      tags = ?,
      is_published = ?,
      published_at = ?,
      meta_title = ?,
      meta_description = ?
     WHERE id = ?`,
    [
      data.title,
      data.slug,
      data.speciality_id || null,
      data.author_name || null,
      data.thumbnail,
      data.category || null,
      data.content || null,
      data.tags,
      data.is_published,
      data.published_at,
      data.meta_title || null,
      data.meta_description || null,
      id,
    ]
  );

  return this.findById(id);
},

  async remove(id) {
    await db.query('DELETE FROM blogs WHERE id = ?', [id]);
  },
};

module.exports = Blog;
