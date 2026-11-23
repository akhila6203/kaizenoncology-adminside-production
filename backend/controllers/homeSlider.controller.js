
const homeSliderModel = require("../models/homeSlider.model");

const clean = (value) => {
  if (value === undefined || value === null) return "";
  return String(value).trim();
};

const getSlideData = (body, file, existingImage = "") => ({
  image: file
    ? `/uploads/home-sliders/${file.filename}`
    : clean(body.image) || existingImage,

  eyebrow: clean(body.eyebrow),
  title: clean(body.title),
  description: clean(body.description),

  primary_text: clean(body.primary_text),
  primary_path: clean(body.primary_path),

  secondary_text: clean(body.secondary_text),
  secondary_path: clean(body.secondary_path),

  sort_order: Number(body.sort_order) || 0,
  status: body.status === "inactive" ? "inactive" : "active",
});

// PUBLIC - ACTIVE SLIDES ONLY
exports.getPublic = async (req, res, next) => {
  try {
    const data = await homeSliderModel.getActive();

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

// ADMIN - GET ALL SLIDES
exports.getAll = async (req, res, next) => {
  try {
    const data = await homeSliderModel.getAll();

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

// ADMIN - CREATE SLIDE
exports.create = async (req, res, next) => {
  try {
    const data = getSlideData(req.body, req.file);

    if (!data.title) {
      return res.status(400).json({
        success: false,
        message: "Slide title is required.",
      });
    }

    if (!data.image) {
      return res.status(400).json({
        success: false,
        message: "Slide image is required.",
      });
    }

    const id = await homeSliderModel.create(data);

    res.status(201).json({
      success: true,
      message: "Slide created successfully.",
      data: { id, ...data },
    });
  } catch (error) {
    next(error);
  }
};

// ADMIN - UPDATE SLIDE
exports.update = async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid slide ID.",
      });
    }

    const existing = await homeSliderModel.getById(id);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Slide not found.",
      });
    }

    // If new image uploaded use it, otherwise keep existing image
    const data = getSlideData(req.body, req.file, existing.image);

    if (!data.title) {
      return res.status(400).json({
        success: false,
        message: "Slide title is required.",
      });
    }

    if (!data.image) {
      return res.status(400).json({
        success: false,
        message: "Slide image is required.",
      });
    }

    await homeSliderModel.update(id, data);

    res.status(200).json({
      success: true,
      message: "Slide updated successfully.",
      data: { id, ...data },
    });
  } catch (error) {
    next(error);
  }
};

// ADMIN - DELETE SLIDE
exports.delete = async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid slide ID.",
      });
    }

    const existing = await homeSliderModel.getById(id);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Slide not found.",
      });
    }

    await homeSliderModel.delete(id);

    res.status(200).json({
      success: true,
      message: "Slide deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};
