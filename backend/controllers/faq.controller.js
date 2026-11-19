const Faq = require('../models/faq.model');
const { pagination, parseBoolean, parseIntOrNull } = require('../utils/helpers');

/*
  speciality_id from the form can be:
    ''       -> no speciality (optional)
    'other'  -> the "Other" option
    '12'     -> a speciality id
  If the field is not sent at all (older clients), keep what is already saved.
*/
function parseSpeciality(body, existing) {
  const raw = body.speciality_id;

  if (raw === undefined) {
    return {
      speciality_id: existing ? existing.speciality_id : null,
      is_other: existing ? existing.is_other : 0,
    };
  }
  if (String(raw).trim().toLowerCase() === 'other') {
    return { speciality_id: null, is_other: 1 };
  }
  return { speciality_id: parseIntOrNull(raw) || null, is_other: 0 };
}

/*
  display_pages from the form: array like ['home','services'] (or "home,services").
  Saved as a comma separated string. Only used for "Other" FAQs.
*/
function parseDisplayPages(body, existing, isOther) {
  if (!isOther) return null;
  const raw = body.display_pages;
  if (raw === undefined) return existing ? existing.display_pages : null;
  const list = Array.isArray(raw) ? raw : String(raw).split(',');
  const clean = [...new Set(list.map((p) => String(p).trim().toLowerCase()).filter((p) => /^[a-z0-9-]+$/.test(p)))];
  return clean.length ? clean.join(',') : null;
}

function handleSaveError(err, res, next) {
  if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    return res.status(400).json({ success: false, message: 'Selected speciality does not exist' });
  }
  return next(err);
}

exports.list = async (req, res, next) => {
  try {
    const { page, limit, offset } = pagination(req.query);
    const data = await Faq.list({
      search: req.query.search,
      speciality_id: req.query.speciality_id,
      display_page: req.query.display_page,
      page,
      limit,
      offset,
    });
    res.json({ success: true, ...data });
  } catch (err) {
    next(err);
  }
};

exports.getOne = async (req, res, next) => {
  try {
    const row = await Faq.findById(req.params.id);
    if (!row) return res.status(404).json({ success: false, message: 'FAQ not found' });
    res.json({ success: true, data: row });
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    if (!req.body.question || !req.body.answer) {
      return res.status(400).json({ success: false, message: 'Question and answer are required' });
    }
    const spec = parseSpeciality(req.body, null);
    if (spec.is_other && !parseDisplayPages(req.body, null, true)) {
      return res.status(400).json({ success: false, message: 'Select at least one page for an Other FAQ' });
    }
    const data = await Faq.create({
      question: req.body.question,
      answer: req.body.answer,
      ...spec,
      display_pages: parseDisplayPages(req.body, null, spec.is_other === 1),
      sort_order: parseIntOrNull(req.body.sort_order) || 0,
      is_published: parseBoolean(req.body.is_published, true) ? 1 : 0,
    });
    res.status(201).json({ success: true, data });
  } catch (err) {
    handleSaveError(err, res, next);
  }
};

exports.update = async (req, res, next) => {
  try {
    const existing = await Faq.findById(req.params.id);
    if (!existing) return res.status(404).json({ success: false, message: 'FAQ not found' });
    const spec = parseSpeciality(req.body, existing);
    const pages = parseDisplayPages(req.body, existing, spec.is_other === 1);
    if (spec.is_other && !pages) {
      return res.status(400).json({ success: false, message: 'Select at least one page for an Other FAQ' });
    }
    const data = await Faq.update(existing.id, {
      question: req.body.question || existing.question,
      answer: req.body.answer || existing.answer,
      ...spec,
      display_pages: pages,
      sort_order: parseIntOrNull(req.body.sort_order) ?? existing.sort_order,
      is_published: parseBoolean(req.body.is_published, existing.is_published) ? 1 : 0,
    });
    res.json({ success: true, data });
  } catch (err) {
    handleSaveError(err, res, next);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const existing = await Faq.findById(req.params.id);
    if (!existing) return res.status(404).json({ success: false, message: 'FAQ not found' });
    await Faq.remove(existing.id);
    res.json({ success: true, message: 'FAQ deleted' });
  } catch (err) {
    next(err);
  }
};







