
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import HomeSliderManagement from "./HomeSliderManagement";

import ImageUpload from '../../components/ImageUpload';
import { settingsApi } from '../../api';
import { toFormData } from '../../api/client';
import { mediaUrl } from '../../utils';

const emptyForm = {
  email: '',
  phone: '',
  alt_phone: '',
  address: "",
   meta_keywords: '',
  meta_description: '',
  facebook_url: '',
  instagram_url: '',
  linkedin_url: '',
  youtube_url: '',
  terms_conditions: '',
  privacy_policy: '',
};

const emptyContact = {
  location_name: '',
  email: '',
  phone: '',
  alt_phone: '',
  address: '',
  location_url: '',
};

const cleanHtml = (value) => {
  if (!value) return '';
  if (value === '<p><br></p>' || value === '<p></p>') return '';
  return value;
};

export default function Settings() {
  const [form, setForm] = useState({ ...emptyForm });
  const [contacts, setContacts] = useState([{ ...emptyContact }]);

  const [file, setFile] = useState(null);
  const [existing, setExisting] = useState('');

  const [file2, setFile2] = useState(null);
const [existing2, setExisting2] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [activeTab, setActiveTab] = useState("general");

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await settingsApi.get();
      const d = response?.data?.data || response?.data || {};

      setForm({
        email: d.email || '',
        phone: d.phone || '',
        alt_phone: d.alt_phone || '',
        address: d.address || "",
        meta_keywords: d.meta_keywords || '',
        meta_description: d.meta_description || '',
        facebook_url: d.facebook_url || '',
        instagram_url: d.instagram_url || '',
        linkedin_url: d.linkedin_url || '',
        youtube_url: d.youtube_url || '',
        terms_conditions: d.terms_conditions || '',
        privacy_policy: d.privacy_policy || '',
      });

      setExisting(d.logo ? mediaUrl(d.logo) : '');
      setExisting2(d.logo2 ? mediaUrl(d.logo2) : "");

      setContacts(
        Array.isArray(d.contacts) && d.contacts.length
          ? d.contacts.map((item) => ({
              location_name: item.location_name || '',
              email: item.email || '',
              phone: item.phone || '',
              alt_phone: item.alt_phone || '',
              address: item.address || '',
              location_url: item.location_url || '',
            }))
          : [{ ...emptyContact }]
      );
    } catch (err) {
      console.error('Settings load error:', err);
      setError(
        err?.response?.data?.message || 'Unable to load settings.'
      );
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const set = (name, value) => {
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const updateContact = (index, name, value) => {
    setContacts((prev) =>
      prev.map((contact, i) =>
        i === index
          ? { ...contact, [name]: value }
          : contact
      )
    );
  };

  const addContact = () => {
    setContacts((prev) => [...prev, { ...emptyContact }]);
  };

  const removeContact = (index) => {
    setContacts((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      return updated.length ? updated : [{ ...emptyContact }];
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError('');

      const payload = toFormData(
        {
          ...form,
          contacts: JSON.stringify(contacts),
          terms_conditions: cleanHtml(form.terms_conditions),
          privacy_policy: cleanHtml(form.privacy_policy),
        },
        'logo',
        file
      );
      if (file2) {
  payload.append("logo2", file2);
}
      await settingsApi.update(payload);

      toast.success('Settings updated successfully');
      setFile(null);
      setFile2(null);

      await loadSettings();
    } catch (err) {
      console.error('Settings save error:', err);

      const message =
        err?.response?.data?.message || 'Failed to update settings';

      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="settings-page">
        <div className="settings-loading">Loading settings...</div>
      </div>
    );
  }

return (
  <div className="settings-page">

    {error && activeTab !== "homeSlider" && (
      <div className="settings-error">
        {error}
      </div>
    )}

    {/* SETTINGS TABS */}
    <div className="settings-tabs">
  <button
    type="button"
    className={`settings-tab ${activeTab === "general" ? "active" : ""}`}
    onClick={() => setActiveTab("general")}
  >
    General Settings
  </button>

  <button
    type="button"
    className={`settings-tab ${activeTab === "legal" ? "active" : ""}`}
    onClick={() => setActiveTab("legal")}
  >
    Terms & Privacy
  </button>
  <button
  type="button"
  className={`settings-tab ${activeTab === "homeSlider" ? "active" : ""}`}
  onClick={() => setActiveTab("homeSlider")}
>
  Home Slider
</button>
</div>


      {(activeTab === "general" || activeTab === "legal") && (
  <form onSubmit={handleSubmit}>

    {/* ADD THIS CONDITION */}
    {activeTab === "general" && (
      <>

        {/* TOP SECTION: LOGO 20% | GENERAL 40% | SOCIAL 40% */}
        <div className="settings-top-grid">

          {/* WEBSITE LOGO */}
          <section className="settings-section settings-logo-section">
            <h2>Website Logo</h2>

            <div className="settings-logo">
              <ImageUpload
                label="Upload Website Logo"
                existingUrl={existing}
                onFile={setFile}
              />
            </div>
            <div className="settings-logo" style={{ marginTop: 20 }}>
          <ImageUpload
            label="Upload Website Logo 2"
            existingUrl={existing2}
            onFile={setFile2}
          />
        </div>
          </section>

          {/* GENERAL CONTACT DETAILS */}
          <section className="settings-section">
            <h2>General Contact Details</h2>

            <div className="settings-fields-grid">
              <div className="settings-field">
                <label>General Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => set('email', e.target.value)}
                  placeholder="Enter general email"
                />
              </div>

              <div className="settings-field">
                <label>General Mobile Number</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => set('phone', e.target.value)}
                  placeholder="Enter mobile number"
                />
              </div>

              <div className="settings-field ">
                <label>Alternate Mobile Number</label>
                <input
                  type="tel"
                  value={form.alt_phone}
                  onChange={(e) => set('alt_phone', e.target.value)}
                  placeholder="Enter alternate mobile number"
                />
              </div>
              <div className="settings-field">
                <label>General Address</label>
                <textarea
                  rows="3"
                  value={form.address}
                  onChange={(e) => set("address", e.target.value)}
                  placeholder="Enter general hospital address"
                />
              </div>
            </div>
          </section>

          {/* SOCIAL MEDIA LINKS */}
          <section className="settings-section">
            <h2>Social Media Links</h2>

            <div className="settings-fields-grid">
              <div className="settings-field">
                <label>Facebook</label>
                <input
                  type="url"
                  value={form.facebook_url}
                  onChange={(e) => set('facebook_url', e.target.value)}
                  placeholder="https://facebook.com/..."
                />
              </div>

              <div className="settings-field">
                <label>Instagram</label>
                <input
                  type="url"
                  value={form.instagram_url}
                  onChange={(e) => set('instagram_url', e.target.value)}
                  placeholder="https://instagram.com/..."
                />
              </div>

              <div className="settings-field">
                <label>LinkedIn</label>
                <input
                  type="url"
                  value={form.linkedin_url}
                  onChange={(e) => set('linkedin_url', e.target.value)}
                  placeholder="https://linkedin.com/..."
                />
              </div>

              <div className="settings-field">
                <label>YouTube</label>
                <input
                  type="url"
                  value={form.youtube_url}
                  onChange={(e) => set('youtube_url', e.target.value)}
                  placeholder="https://youtube.com/..."
                />
              </div>
            </div>
          </section>
        </div>

        {/* SEO SETTINGS */}
<section className="settings-section">
  <h2>SEO Settings</h2>

  <div className="settings-fields-grid">
    <div className="settings-field">
      <label>Meta Keywords</label>
      <textarea
        rows="4"
        value={form.meta_keywords}
        onChange={(e) => set('meta_keywords', e.target.value)}
        placeholder="Example: cancer hospital, oncology hospital, cancer treatment, cancer specialists"
      />
    </div>

    <div className="settings-field">
      <label>Meta Description</label>
      <textarea
        rows="4"
        maxLength={520}
        value={form.meta_description}
        onChange={(e) => set('meta_description', e.target.value)}
        placeholder="Enter your website meta description"
      />
      <small>
        {form.meta_description.length}/520 characters
      </small>
    </div>
  </div>
</section>

        {/* HOSPITAL CONTACT LOCATIONS */}
        <section className="settings-section">
          <div className="settings-section-heading">
            <h2>Hospital Contact Locations</h2>

            <button
              type="button"
              className="btn"
              onClick={addContact}
            >
              + Add Location
            </button>
          </div>

          <div className="settings-locations-list">
            {contacts.map((contact, index) => (
              <div className="settings-location-card" key={index}>
                <div className="settings-location-heading">
                  <h3>
                    Hospital Location {index + 1}
                  </h3>

                  {contacts.length > 1 && (
                    <button
                      type="button"
                      className="btn danger small"
                      onClick={() => removeContact(index)}
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className="settings-fields-grid">
                  <div className="settings-field">
                    <label>Hospital / Location Name</label>
                    <input
                      type="text"
                      value={contact.location_name}
                      onChange={(e) =>
                        updateContact(index, 'location_name', e.target.value)
                      }
                      placeholder="Enter hospital location name"
                    />
                  </div>

                  <div className="settings-field">
                    <label>Email ID</label>
                    <input
                      type="email"
                      value={contact.email}
                      onChange={(e) =>
                        updateContact(index, 'email', e.target.value)
                      }
                      placeholder="Enter location email"
                    />
                  </div>

                  <div className="settings-field">
                    <label>Contact Number</label>
                    <input
                      type="tel"
                      value={contact.phone}
                      onChange={(e) =>
                        updateContact(index, 'phone', e.target.value)
                      }
                      placeholder="Enter contact number"
                    />
                  </div>

                  <div className="settings-field">
                    <label>Alternate Contact Number</label>
                    <input
                      type="tel"
                      value={contact.alt_phone}
                      onChange={(e) =>
                        updateContact(index, 'alt_phone', e.target.value)
                      }
                      placeholder="Enter alternate number"
                    />
                  </div>

                  <div className="settings-field">
                    <label>Full Address</label>
                    <textarea
                      rows="3"
                      value={contact.address}
                      onChange={(e) =>
                        updateContact(index, 'address', e.target.value)
                      }
                      placeholder="Enter complete hospital address"
                    />
                  </div>

                  <div className="settings-field">
                    <label>Location URL (Google Maps)</label>
                    <input
                      type="url"
                      value={contact.location_url}
                      onChange={(e) =>
                        updateContact(index, 'location_url', e.target.value)
                      }
                      placeholder="Paste Google Maps location URL"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
         </>
        )}

      {activeTab === "legal" && (
      <>
        {/* TERMS AND PRIVACY */}
        <div className="settings-legal-grid">
          <section className="settings-section">
            <h2>Terms &amp; Conditions</h2>
            <ReactQuill
              theme="snow"
              value={form.terms_conditions}
              onChange={(value) => set('terms_conditions', value)}
              placeholder="Enter terms and conditions..."
            />
          </section>

          <section className="settings-section">
            <h2>Privacy Policy</h2>
            <ReactQuill
              theme="snow"
              value={form.privacy_policy}
              onChange={(value) => set('privacy_policy', value)}
              placeholder="Enter privacy policy..."
            />
          </section>
        </div>
          </>
        )}

        {/* SAVE BUTTON - GENERAL & LEGAL TABS ONLY */}
<div className="settings-actions">
  <button
    type="submit"
    className="btn"
    disabled={saving}
  >
    {saving ? 'Saving...' : 'Save Settings'}
  </button>
</div>

</form>
)}

{/* HOME SLIDER - SEPARATE FORM */}
{activeTab === "homeSlider" && <HomeSliderManagement />}

</div>
  );
}



