const pool = require('../config/db');

// the website uses /services/cancer/... for the "cancer-types" service
const ALIASES = { cancer: 'cancer-types' };
const resolveSlug = (s) => ALIASES[s] || s;

const slugify = (s) =>
  String(s || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

const parseJson = (v) => {
  if (!v) return {};
  if (typeof v === 'object') return v;
  try {
    const o = JSON.parse(v);
    return o && typeof o === 'object' ? o : {};
  } catch {
    return {};
  }
};
const toJson = (v) => JSON.stringify(v && typeof v === 'object' ? v : {});

const dupError = (e, res, message) =>
  e.code === 'ER_DUP_ENTRY' ? res.status(409).json({ success: false, message }) : null;

/* =========================================================
   ADMIN: main services (the 4 menu items)
   ========================================================= */
exports.listServices = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, slug, icon_image, description, is_active, sort_order FROM services ORDER BY sort_order, id'
    );
    res.json({ success: true, data: rows });
  } catch (e) { next(e); }
};

exports.getService = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, slug, icon_image, description, is_active, sort_order, extra FROM services WHERE id=?',
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ success: false, message: 'Service not found' });
    res.json({ success: true, data: { ...rows[0], extra: parseJson(rows[0].extra) } });
  } catch (e) { next(e); }
};

exports.createService = async (req, res, next) => {
  try {
    const { name, description, icon_image, is_active, sort_order, extra } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ success: false, message: 'Name is required' });
    const slug = slugify(req.body.slug || name);
    const [r] = await pool.query(
      'INSERT INTO services (name, slug, icon_image, description, is_active, sort_order, extra) VALUES (?,?,?,?,?,?,?)',
      [name.trim(), slug, icon_image || null, description || null, is_active ? 1 : 0, Number(sort_order) || 0, toJson(extra)]
    );
    res.status(201).json({ success: true, data: { id: r.insertId } });
  } catch (e) {
    if (dupError(e, res, 'Slug already exists')) return;
    next(e);
  }
};

exports.updateService = async (req, res, next) => {
  try {
    const { name, description, icon_image, is_active, sort_order, extra } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ success: false, message: 'Name is required' });
    const slug = slugify(req.body.slug || name);
    await pool.query(
      'UPDATE services SET name=?, slug=?, icon_image=?, description=?, is_active=?, sort_order=?, extra=? WHERE id=?',
      [name.trim(), slug, icon_image || null, description || null, is_active ? 1 : 0, Number(sort_order) || 0, toJson(extra), req.params.id]
    );
    res.json({ success: true, message: 'Service updated' });
  } catch (e) {
    if (dupError(e, res, 'Slug already exists')) return;
    next(e);
  }
};

exports.deleteService = async (req, res, next) => {
  try {
    await pool.query('DELETE FROM services WHERE id=?', [req.params.id]); // its pages are deleted by cascade
    res.json({ success: true, message: 'Service deleted' });
  } catch (e) { next(e); }
};

/* =========================================================
   ADMIN: service pages (Breast Cancer, 3D Mammography, Cancer Surgery ...)
   ========================================================= */
exports.listPages = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT i.id, i.service_id, i.name, i.slug, i.short_description, i.image, i.is_active, i.sort_order,
              s.name AS service_name, s.slug AS service_slug
       FROM service_items i JOIN services s ON s.id = i.service_id
       ORDER BY s.sort_order, i.sort_order, i.id`
    );
    res.json({ success: true, data: rows });
  } catch (e) { next(e); }
};

exports.getPage = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, service_id, name, slug, short_description, image, is_active, sort_order, content FROM service_items WHERE id=?',
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ success: false, message: 'Page not found' });
    res.json({ success: true, data: { ...rows[0], content: parseJson(rows[0].content) } });
  } catch (e) { next(e); }
};

exports.createPage = async (req, res, next) => {
  try {
    const { service_id, name, short_description, image, is_active, sort_order, content } = req.body;
    if (!service_id) return res.status(400).json({ success: false, message: 'Choose a service' });
    if (!name || !name.trim()) return res.status(400).json({ success: false, message: 'Name is required' });
    const slug = slugify(req.body.slug || name);
    const [r] = await pool.query(
      `INSERT INTO service_items (service_id, name, slug, short_description, image, content, is_active, sort_order)
       VALUES (?,?,?,?,?,?,?,?)`,
      [service_id, name.trim(), slug, short_description || null, image || null, toJson(content), is_active ? 1 : 0, Number(sort_order) || 0]
    );
    res.status(201).json({ success: true, data: { id: r.insertId } });
  } catch (e) {
    if (dupError(e, res, 'This URL already exists under that service')) return;
    next(e);
  }
};

exports.updatePage = async (req, res, next) => {
  try {
    const { name, short_description, image, is_active, sort_order, content } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ success: false, message: 'Name is required' });
    const slug = slugify(req.body.slug || name);
    await pool.query(
      `UPDATE service_items SET name=?, slug=?, short_description=?, image=?, content=?, is_active=?, sort_order=?
       WHERE id=?`,
      [name.trim(), slug, short_description || null, image || null, toJson(content), is_active ? 1 : 0, Number(sort_order) || 0, req.params.id]
    );
    res.json({ success: true, message: 'Page updated' });
  } catch (e) {
    if (dupError(e, res, 'This URL already exists under that service')) return;
    next(e);
  }
};

exports.deletePage = async (req, res, next) => {
  try {
    await pool.query('DELETE FROM service_items WHERE id=?', [req.params.id]);
    res.json({ success: true, message: 'Page deleted' });
  } catch (e) { next(e); }
};

/* =========================================================
   PUBLIC (website)
   ========================================================= */

// GET /api/public/services -> menu items
exports.publicServices = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, slug, icon_image, description FROM services WHERE is_active=1 ORDER BY sort_order, id'
    );
    res.json({ success: true, data: rows });
  } catch (e) { next(e); }
};

// GET /api/public/services/:service -> a main page (listing pages and Second Opinion)
exports.publicService = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, slug, icon_image, description, extra FROM services WHERE slug=? AND is_active=1',
      [resolveSlug(req.params.service)]
    );
    if (!rows.length) return res.status(404).json({ success: false, message: 'Service not found' });
    res.json({ success: true, data: { ...rows[0], extra: parseJson(rows[0].extra) } });
  } catch (e) { next(e); }
};

// GET /api/public/services/:service/pages -> the cards on a listing page
exports.publicPages = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT i.id, i.name, i.slug, i.short_description, i.image
       FROM service_items i JOIN services s ON s.id = i.service_id
       WHERE s.slug=? AND s.is_active=1 AND i.is_active=1
       ORDER BY i.sort_order, i.id`,
      [resolveSlug(req.params.service)]
    );
    res.json({ success: true, data: rows });
  } catch (e) { next(e); }
};

// GET /api/public/services/:service/pages/:page -> a detail page
exports.publicPage = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT i.id, i.name, i.slug, i.short_description, i.image, i.content,
              s.name AS service_name, s.slug AS service_slug
       FROM service_items i JOIN services s ON s.id = i.service_id
       WHERE s.slug=? AND i.slug=? AND s.is_active=1 AND i.is_active=1`,
      [resolveSlug(req.params.service), req.params.page]
    );
    if (!rows.length) return res.status(404).json({ success: false, message: 'Page not found' });

    const { content: rawContent, service_name, service_slug, ...page } = rows[0];
    const content = parseJson(rawContent);

    // related technologies picked in the admin, kept in the chosen order
    let technologies = [];
    const ids = (content.technologies?.tech_ids || []).map(Number).filter(Boolean);
    if (ids.length) {
      const [t] = await pool.query(
        'SELECT id, title, slug, short_description, thumbnail FROM technologies WHERE id IN (?) AND is_published=1',
        [ids]
      );
      technologies = ids.map((id) => t.find((x) => x.id === id)).filter(Boolean);
    }

    res.json({
      success: true,
      data: { page, service: { name: service_name, slug: service_slug }, content, technologies },
    });
  } catch (e) { next(e); }
};