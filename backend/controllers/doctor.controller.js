const Doctor = require('../models/doctor.model');
const { uniqueSlug } = require('../utils/slug');
const {
  pagination,
  parseBoolean,
  parseIntOrNull,
  parseList,
  deleteUploadedFile,
} = require('../utils/helpers');
const { toPublicPath } = require('../config/multer');

/*
  New repeatable sections. Each one is stored as rows in doctor_profile_items
  with section = the key below. Keep this list in sync with the model
  and with LIST_FIELDS in DoctorForm.jsx.
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

exports.PROFILE_SECTIONS = PROFILE_SECTIONS;

exports.list = async (req, res, next) => {
  try {
    const { page, limit, offset } = pagination(req.query);
    const data = await Doctor.list({
      search: req.query.search,
      speciality_id: req.query.speciality_id,
      is_active: req.query.is_active,
      page,
      limit,
      offset,
    });
    res.json({ success: true, ...data });
  } catch (err) {
    next(err);
  }
};

exports.options = async (req, res, next) => {
  try {
    const rows = await Doctor.options();
    res.json({ success: true, rows });
  } catch (err) {
    next(err);
  }
};

exports.getOne = async (req, res, next) => {
  try {
    const row = await Doctor.findById(req.params.id);
    if (!row) return res.status(404).json({ success: false, message: 'Doctor not found' });
    res.json({ success: true, data: row });
  } catch (err) {
    next(err);
  }
};

// "1,2,3" / ["1","2"] / [1,2] -> [1,2,3] (unique, valid numbers only)
function parseIdList(value) {
  const ids = parseList(value)
    .map((v) => Number(v))
    .filter((n) => Number.isInteger(n) && n > 0);
  return [...new Set(ids)];
}

function isValidYoutube(url) {
  if (!url) return true;

  try {
    const parsedUrl = new URL(String(url).trim());

    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return false;
    }

    const hostname = parsedUrl.hostname
      .toLowerCase()
      .replace(/^www\./, '');

    return (
      hostname === 'youtube.com' ||
      hostname === 'm.youtube.com' ||
      hostname === 'youtu.be'
    );
  } catch {
    return false;
  }
}

function payload(body, photo) {
  const speciality_ids = parseIdList(body.speciality_ids);

  // fallback for older clients that still send a single speciality_id
  if (!speciality_ids.length && body.speciality_id) {
    const single = parseIntOrNull(body.speciality_id);
    if (single) speciality_ids.push(single);
  }

  const profile = {};
  PROFILE_SECTIONS.forEach((key) => {
    profile[key] = parseList(body[key]);
  });

  return {
    name: body.name,
    slug: body.slug,
    designation: body.designation,

    // first selected speciality is kept as the primary one in doctors.speciality_id
    speciality_id: speciality_ids[0] || null,
    speciality_ids,

    photo,
    license_number: body.license_number,
    hospital_location: body.hospital_location,
    // youtube_url: (body.youtube_url || '').trim() || null,
    youtube_url:
      profile.youtube_videos[0] ||
      (body.youtube_url || '').trim() ||
  null,
    about: body.about || null,

    short_bio: body.short_bio,
    experience_years: parseIntOrNull(body.experience_years),

    is_featured: parseBoolean(body.is_featured, false) ? 1 : 0,
    is_active: parseBoolean(body.is_active, true) ? 1 : 0,

    meta_title: body.meta_title,
    meta_description: body.meta_description,

    qualifications: parseList(body.qualifications), // shown as "Education & Training"
    expertise: parseList(body.expertise),

    profile, // { awards_recognition: [...], languages: [...], ... }
  };
}

exports.create = async (req, res, next) => {
  try {
    if (!req.body.name) {
      return res.status(400).json({ success: false, message: 'Name is required' });
    }
    const youtubeVideos = parseList(req.body.youtube_videos);

const invalidYoutubeVideo = youtubeVideos.some(
  (url) => !isValidYoutube(url)
);

if (invalidYoutubeVideo) {
  return res.status(400).json({
    success: false,
    message: 'Invalid YouTube video URL',
  });
}
    const slug = await uniqueSlug('doctors', req.body.name, req.body.slug);
    const data = await Doctor.create({ ...payload(req.body, toPublicPath(req.file)), slug });
    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const existing = await Doctor.findById(req.params.id);
    if (!existing) return res.status(404).json({ success: false, message: 'Doctor not found' });
    const youtubeVideos = parseList(req.body.youtube_videos);

const invalidYoutubeVideo = youtubeVideos.some(
  (url) => !isValidYoutube(url)
);

if (invalidYoutubeVideo) {
  return res.status(400).json({
    success: false,
    message: 'Invalid YouTube video URL',
  });
}
    const slug = await uniqueSlug('doctors', req.body.name || existing.name, req.body.slug, existing.id);
    let photo = existing.photo;
    if (req.file) {
      deleteUploadedFile(existing.photo);
      photo = toPublicPath(req.file);
    }
    const body = { ...req.body, name: req.body.name || existing.name };
    const data = await Doctor.update(existing.id, { ...payload(body, photo), slug });
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const existing = await Doctor.findById(req.params.id);
    if (!existing) return res.status(404).json({ success: false, message: 'Doctor not found' });
    deleteUploadedFile(existing.photo);
    await Doctor.remove(existing.id);
    res.json({ success: true, message: 'Doctor deleted' });
  } catch (err) {
    next(err);
  }
};
