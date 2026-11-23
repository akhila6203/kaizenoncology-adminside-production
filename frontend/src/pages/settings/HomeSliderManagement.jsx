
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  getAdminSlides,
  createSlide,
  updateSlide,
  deleteSlide,
} from "../../api/homeSliderApi";
import { toFormData } from "../../api/client";
import { mediaUrl } from "../../utils";

const emptySlide = {
  image: "",
  eyebrow: "",
  title: "",
  description: "",
  primary_text: "",
  primary_path: "",
  secondary_text: "",
  secondary_path: "",
  sort_order: 0,
  status: "active",
};

export default function HomeSliderManagement() {
  const [slides, setSlides] = useState([]);
  const [form, setForm] = useState({ ...emptySlide });
  const [imageFile, setImageFile] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState("");

  const loadSlides = async () => {
    try {
      const res = await getAdminSlides();
      setSlides(res?.data?.data || []);
    } catch (err) {
      toast.error("Failed to load slides");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSlides();
  }, []);

  // Image preview for newly selected file
  useEffect(() => {
    if (!imageFile) {
      setPreview("");
      return;
    }

    const objectUrl = URL.createObjectURL(imageFile);
    setPreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [imageFile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const selectedFile = e.target.files?.[0];

    if (!selectedFile) return;

    if (!selectedFile.type.startsWith("image/")) {
      toast.error("Please select a valid image");
      e.target.value = "";
      return;
    }

    setImageFile(selectedFile);
  };

  const resetForm = () => {
    setForm({ ...emptySlide });
    setImageFile(null);
    setEditingId(null);
  };

  const handleEdit = (slide) => {
    setEditingId(slide.id);

    setForm({
      image: slide.image || "",
      eyebrow: slide.eyebrow || "",
      title: slide.title || "",
      description: slide.description || "",
      primary_text: slide.primary_text || "",
      primary_path: slide.primary_path || "",
      secondary_text: slide.secondary_text || "",
      secondary_path: slide.secondary_path || "",
      sort_order: slide.sort_order ?? 0,
      status: slide.status || "active",
    });

    setImageFile(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title.trim()) {
      toast.error("Slide title is required");
      return;
    }

    if (!editingId && !imageFile) {
      toast.error("Please upload a slide image");
      return;
    }

    try {
      setSaving(true);

      const payload = toFormData(form, "image", imageFile);

      if (editingId) {
        await updateSlide(editingId, payload);
        toast.success("Slide updated successfully");
      } else {
        await createSlide(payload);
        toast.success("Slide added successfully");
      }

      resetForm();
      await loadSlides();
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Failed to save slide"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this slide?")) {
      return;
    }

    try {
      await deleteSlide(id);
      toast.success("Slide deleted successfully");

      if (editingId === id) {
        resetForm();
      }

      await loadSlides();
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Failed to delete slide"
      );
    }
  };

  if (loading) {
    return <div className="settings-loading">Loading slides...</div>;
  }

  return (
    <div className="settings-section home-slider-admin">
      {/* PAGE HEADING */}
      <div className="home-slider-admin-heading">
        <h2>{editingId ? "Edit Home Slide" : "Add Home Slide"}</h2>
      </div>

      {/* MAIN 2-COLUMN LAYOUT */}
      <div className="home-slider-layout">

        {/* LEFT SIDE - FORM */}
        <form onSubmit={handleSubmit} className="home-slider-form">

          {/* EYEBROW + TITLE + IMAGE + DESCRIPTION */}
          <div className="home-slider-content-row">

            {/* EYEBROW */}
            <div className="settings-field">
              <label>Eyebrow</label>
              <input
                name="eyebrow"
                value={form.eyebrow}
                onChange={handleChange}
                placeholder="Small heading"
              />
            </div>

            {/* TITLE */}
            <div className="settings-field">
              <label>Slide Title *</label>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                required
                placeholder="Enter slide title"
              />
            </div>

            {/* IMAGE UPLOAD */}
            <div className="settings-field home-slider-image-field">
              <label>Slide Image *</label>

              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="home-slider-file-input"
              />

              <small>Upload JPG, PNG, WEBP or other image formats</small>

              {(preview || form.image) && (
                <div className="home-slider-preview">
                  <img
                    src={preview || mediaUrl(form.image)}
                    alt="Slide Preview"
                  />
                </div>
              )}
            </div>

            {/* DESCRIPTION */}
            <div className="settings-field home-slider-description-field">
              <label>Description</label>
              <textarea
                name="description"
                rows="4"
                value={form.description}
                onChange={handleChange}
                placeholder="Enter slide description"
              />
            </div>
          </div>

          {/* BUTTONS ROW */}
          <div className="home-slider-buttons-row">

            {/* PRIMARY BUTTON */}
            <div className="home-slider-button-group">
              <h3>Primary Button</h3>

              <div className="settings-field">
                <label>Button Text</label>
                <input
                  name="primary_text"
                  value={form.primary_text}
                  onChange={handleChange}
                  placeholder="Explore Treatments"
                />
              </div>

              <div className="settings-field">
                <label>Button Link</label>
                <input
                  name="primary_path"
                  value={form.primary_path}
                  onChange={handleChange}
                  placeholder="/services/treatments"
                />
              </div>
            </div>

            {/* SECONDARY BUTTON */}
            <div className="home-slider-button-group">
              <h3>Secondary Button</h3>

              <div className="settings-field">
                <label>Button Text</label>
                <input
                  name="secondary_text"
                  value={form.secondary_text}
                  onChange={handleChange}
                  placeholder="Book Appointment"
                />
              </div>

              <div className="settings-field">
                <label>Button Link</label>
                <input
                  name="secondary_path"
                  value={form.secondary_path}
                  onChange={handleChange}
                  placeholder="/appointments"
                />
              </div>
            </div>
          </div>

          {/* ORDER & STATUS */}
          <div className="home-slider-settings-row">
            <div className="settings-field">
              <label>Display Order</label>
              <input
                name="sort_order"
                type="number"
                value={form.sort_order}
                onChange={handleChange}
              />
            </div>

            <div className="settings-field">
              <label>Status</label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="settings-actions home-slider-actions">
            <button type="submit" className="btn" disabled={saving}>
              {saving
                ? "Saving..."
                : editingId
                  ? "Update Slide"
                  : "Add Slide"}
            </button>

            {editingId && (
              <button
                type="button"
                className="btn danger"
                onClick={resetForm}
              >
                Cancel Edit
              </button>
            )}
          </div>
        </form>

        {/* RIGHT SIDE - EXISTING SLIDES */}
        <div className="home-slider-existing">
          <div className="home-slider-existing-heading">
            <h2>Existing Home Slides ({slides.length})</h2>
          </div>

          <div className="settings-locations-list">
            {slides.map((slide) => (
              <div
                className="settings-location-card home-slider-card"
                key={slide.id}
              >
                <div className="home-slider-card-inner">

                  {slide.image && (
                    <img
                      src={mediaUrl(slide.image)}
                      alt={slide.title}
                      className="home-slider-card-image"
                    />
                  )}

                  <div className="home-slider-card-content">
                    <h3>{slide.title}</h3>

                    {slide.eyebrow && (
                      <p className="home-slider-card-eyebrow">
                        {slide.eyebrow}
                      </p>
                    )}

                    {slide.description && (
                      <p className="home-slider-card-description">
                        {slide.description}
                      </p>
                    )}

                    <div className="home-slider-card-meta">
                      <span>Order: {slide.sort_order}</span>

                      <span
                        className={`home-slider-status ${
                          slide.status === "active"
                            ? "active"
                            : "inactive"
                        }`}
                      >
                        {slide.status}
                      </span>
                    </div>

                    <div className="home-slider-card-buttons">
                      {slide.primary_text && (
                        <span>Primary: {slide.primary_text}</span>
                      )}

                      {slide.secondary_text && (
                        <span>Secondary: {slide.secondary_text}</span>
                      )}
                    </div>
                  </div>

                  <div className="home-slider-card-actions">
                    <button
                      type="button"
                      className="btn"
                      onClick={() => handleEdit(slide)}
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      className="btn danger small"
                      onClick={() => handleDelete(slide.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {!slides.length && <p>No slides added yet.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
