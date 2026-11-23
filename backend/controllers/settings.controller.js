
const settingsModel = require('../models/settings.model');

const clean = (value) => {
  if (value === undefined || value === null) {
    return '';
  }

  const result = String(value).trim();

  if (
    result === '<p><br></p>' ||
    result === '<p></p>'
  ) {
    return '';
  }

  return result;
};

const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const parseContacts = (value) => {
  if (!value) return [];

  let parsed;

  try {
    parsed = typeof value === 'string'
      ? JSON.parse(value)
      : value;
  } catch {
    const error = new Error('Invalid hospital contacts data.');
    error.statusCode = 400;
    throw error;
  }

  if (!Array.isArray(parsed)) {
    const error = new Error('Hospital contacts must be an array.');
    error.statusCode = 400;
    throw error;
  }

  return parsed
    .filter((item) => item && typeof item === 'object')
    .map((item) => ({
      location_name: clean(item.location_name),
      email: clean(item.email),
      phone: clean(item.phone),
      alt_phone: clean(item.alt_phone),
      address: clean(item.address),
      location_url: clean(item.location_url),
    }))
    .filter((item) => {
      return (
        item.location_name ||
        item.email ||
        item.phone ||
        item.alt_phone ||
        item.address ||
        item.location_url
      );
    });
};

// GET SETTINGS + HOSPITAL CONTACT LOCATIONS
exports.get = async (req, res, next) => {
  try {
    const data = await settingsModel.get();

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

// UPDATE SETTINGS + HOSPITAL CONTACT LOCATIONS
exports.update = async (req, res, next) => {
  try {
    const email = clean(req.body.email);

    if (email && !isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid general email address.',
      });
    }

    const contacts = parseContacts(req.body.contacts);

    // Validate hospital location emails
    for (const contact of contacts) {
      if (contact.email && !isValidEmail(contact.email)) {
        return res.status(400).json({
          success: false,
          message: `Please enter a valid email for ${contact.location_name || 'hospital location'}.`,
        });
      }
    }

    // Keep existing logo if no new logo is uploaded
    const currentLogo = await settingsModel.getLogo();
const currentLogo2 = await settingsModel.getLogo2();

const logoFile = req.files?.logo?.[0];
const logo2File = req.files?.logo2?.[0];


const logo = logoFile
  ? `/uploads/settings/${logoFile.filename}`
  : currentLogo;

const logo2 = logo2File
  ? `/uploads/settings/${logo2File.filename}`
  : currentLogo2;

    const data = {
      logo,
      logo2,
      email,
      phone: clean(req.body.phone),
      alt_phone: clean(req.body.alt_phone),
      address: clean(req.body.address),

      // SEO Settings
      meta_keywords: clean(req.body.meta_keywords),
      meta_description: clean(req.body.meta_description),

      // Social Media Links
      facebook_url: clean(req.body.facebook_url),
      instagram_url: clean(req.body.instagram_url),
      linkedin_url: clean(req.body.linkedin_url),
      youtube_url: clean(req.body.youtube_url),

      // Legal Pages
      terms_conditions: clean(req.body.terms_conditions),
      privacy_policy: clean(req.body.privacy_policy),
    };

    // Save settings and contacts together
    await settingsModel.update(data, contacts);

    return res.status(200).json({
      success: true,
      message: 'Settings updated successfully.',
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }

    next(error);
  }
};


