import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

import Drawer from '../../components/Drawer';
import ImageUpload from '../../components/ImageUpload';
import RepeatableList from '../../components/RepeatableList';
import { doctorsApi, specialitiesApi } from '../../api';
import { toFormData } from '../../api/client';
import { mediaUrl, slugify } from '../../utils';

/*
  Repeatable list fields (same behaviour as "Area of Expertise").
  key   = field name sent to the API
  label = heading shown in the form
*/
const LIST_FIELDS = [
  { key: 'expertise', label: 'Area of Expertise', placeholder: 'e.g. Medical Oncology' },
  { key: 'qualifications', label: 'Education & Training', placeholder: 'MBBS, MD...' },
  { key: 'awards_recognition', label: 'Awards & Recognition', placeholder: 'e.g. Best Oncologist Award 2022' },
  { key: 'professional_experience', label: 'Professional Experience', placeholder: 'e.g. Senior Consultant, ABC Hospital (2015 - 2020)' },
  { key: 'conferences_workshops', label: 'Conferences & Workshops', placeholder: 'e.g. ESMO Congress 2023, Madrid' },
  { key: 'fellowship_memberships', label: 'Fellowship & Membership', placeholder: 'e.g. Fellow, Royal College of Surgeons' },
  { key: 'research_publications', label: 'Research & Publications', placeholder: 'e.g. Title of paper, Journal, Year' },
  { key: 'procedures_treatments', label: 'Procedures & Treatments', placeholder: 'e.g. Knee Replacement' },
  { key: 'languages', label: 'Languages', placeholder: 'e.g. English, Hindi, Telugu' },
  {
  key: 'youtube_videos',
  label: 'YouTube Videos',
  placeholder: 'Paste YouTube video URL',
},
];

const LIST_KEYS = LIST_FIELDS.map((f) => f.key);

const emptyLists = LIST_KEYS.reduce((acc, key) => {
  acc[key] = [''];
  return acc;
}, {});

const empty = {
  name: '',
  slug: '',
  speciality_ids: [],
  experience_years: '',
  license_number: '',
  hospital_location: '',
  youtube_url: '',
  about: '',
  is_active: true,
  ...emptyLists,
};

const isValidYoutubeUrl = (value) => {
  try {
    const url = new URL(value);

    if (!['http:', 'https:'].includes(url.protocol)) {
      return false;
    }

    const hostname = url.hostname
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
};

const editorModules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ['bold', 'italic', 'underline'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['link'],
    ['clean'],
  ],
};

const specialityCss = `
.spec-picker { border: 1px solid #dbe7ee; border-radius: 12px; padding: 12px; background: #fff; }
.spec-picker-head { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 10px; }
.spec-picker-count { font-size: 12px; color: #5b7083; }
.spec-picker-actions button { background: none; border: 0; color: #0e7c86; font-size: 12px; cursor: pointer; padding: 2px 6px; }
.spec-picker-actions button:hover { text-decoration: underline; }
.spec-chips { display: flex; flex-wrap: wrap; gap: 8px; max-height: 200px; overflow-y: auto; }
.spec-chip { position: relative; display: inline-flex; align-items: center; gap: 6px; margin: 0; padding: 7px 14px; border: 1px solid #dbe7ee; border-radius: 999px; background: #f7fafc; color: #33475b; font-size: 13px; font-weight: 500; line-height: 1.2; cursor: pointer; user-select: none; transition: background .15s, border-color .15s, color .15s; }
.spec-chip:hover { border-color: #0e7c86; background: #eef7f8; }
.spec-chip input { position: absolute; opacity: 0; width: 0 !important; height: 0 !important; margin: 0; padding: 0; border: 0; pointer-events: none; }
.spec-chip .spec-tick { display: none; width: 14px; height: 14px; }
.spec-chip.is-on { background: #e3f3f5; border-color: #0e7c86; color: #0a5c64; }
.spec-chip.is-on .spec-tick { display: inline-block; }
.spec-chip:focus-within { outline: 2px solid #0e7c86; outline-offset: 2px; }
.spec-empty { font-size: 13px; color: #5b7083; }
`;

export default function DoctorDrawer({ open, id, onClose, onSaved }) {
  const [form, setForm] = useState(empty);
  const [file, setFile] = useState(null);
  const [existing, setExisting] = useState('');
  const [specialities, setSpecialities] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;

    specialitiesApi.options()
      .then((res) => setSpecialities(res.data.rows || []))
      .catch(() => toast.error('Unable to load specialities'));
  }, [open]);

  useEffect(() => {
    if (!open) return;

    setError('');
    setFile(null);

    if (!id) {
      setForm({ ...empty });
      setExisting('');
      return;
    }

    doctorsApi.get(id).then((res) => {
      const d = res.data.data;

      // Support both new (speciality_ids) and old (speciality_id) API shapes
      const ids = Array.isArray(d.speciality_ids)
        ? d.speciality_ids.map(Number)
        : d.speciality_id
          ? [Number(d.speciality_id)]
          : [];

      const lists = LIST_KEYS.reduce((acc, key) => {
        acc[key] = Array.isArray(d[key]) && d[key].length ? d[key] : [''];
        return acc;
      }, {});

      setForm({
        ...empty,
        ...d,
        ...lists,
        speciality_ids: ids,
        license_number: d.license_number || '',
        hospital_location: d.hospital_location || '',
        youtube_url: d.youtube_url || '',
        experience_years: d.experience_years ?? '',
        about: d.about || '',
        is_active: Boolean(d.is_active),
      });

      setExisting(mediaUrl(d.photo));
    }).catch((err) => {
      toast.error(err.response?.data?.message || 'Unable to load doctor');
    });
  }, [open, id]);

  function set(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function toggleSpeciality(specialityId) {
    setForm((prev) => {
      const current = prev.speciality_ids;
      const next = current.includes(specialityId)
        ? current.filter((x) => x !== specialityId)
        : [...current, specialityId];
      return { ...prev, speciality_ids: next };
    });
  }

  async function onSubmit(e) {
    e.preventDefault();

    if (!form.name.trim()) {
      setError('Name is required');
      return;
    }

    const youtubeVideos = (form.youtube_videos || [])
  .map((url) => url.trim())
  .filter(Boolean);

const invalidYoutubeUrl = youtubeVideos.some(
  (url) => !isValidYoutubeUrl(url)
);

if (invalidYoutubeUrl) {
  setError('Please enter valid YouTube video URLs (youtube.com or youtu.be)');
  return;
}

    setError('');

    try {
      const cleanedLists = LIST_KEYS.reduce((acc, key) => {
        acc[key] = form[key].filter((v) => v.trim());
        return acc;
      }, {});

      const payload = toFormData(
        {
          ...form,
          ...cleanedLists,
          slug: form.slug || slugify(form.name),
          // youtube_url: form.youtube_url.trim(),
          youtube_url: cleanedLists.youtube_videos[0] || '',
          experience_years: form.experience_years || '',
          speciality_ids: form.speciality_ids,
          // first selected speciality kept as primary for older code
          speciality_id: form.speciality_ids[0] || '',
        },
        'photo',
        file
      );

      if (id) {
        await doctorsApi.update(id, payload);
      } else {
        await doctorsApi.create(payload);
      }

      toast.success(id ? 'Doctor updated' : 'Doctor created');
      onSaved?.();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    }
  }

  return (
    <Drawer
      open={open}
      title={id ? 'Edit doctor' : 'Add doctor'}
      onClose={onClose}
    >
      <form className="drawer-body form-grid" onSubmit={onSubmit}>
        <div>
          <label>Name *</label>
          <input
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
          />
        </div>

        <div>
          <label>License number</label>
          <input
            value={form.license_number}
            onChange={(e) => set('license_number', e.target.value)}
          />
        </div>

        {/* SPECIALITIES (multi select) */}
        <div className="full">
          <label>Specialities</label>
          <style>{specialityCss}</style>
          <div className="spec-picker">
            <div className="spec-picker-head">
              <span className="spec-picker-count">
                {form.speciality_ids.length
                  ? `${form.speciality_ids.length} selected`
                  : 'Select one or more'}
              </span>
              <span className="spec-picker-actions">
                <button
                  type="button"
                  onClick={() => set('speciality_ids', specialities.map((s) => Number(s.id)))}
                >
                  Select all
                </button>
                <button type="button" onClick={() => set('speciality_ids', [])}>
                  Clear
                </button>
              </span>
            </div>

            <div className="spec-chips">
              {specialities.length === 0 ? (
                <span className="spec-empty">No specialities available</span>
              ) : (
                specialities.map((s) => {
                  const on = form.speciality_ids.includes(Number(s.id));
                  return (
                    <label key={s.id} className={`spec-chip${on ? ' is-on' : ''}`}>
                      <input
                        type="checkbox"
                        checked={on}
                        onChange={() => toggleSpeciality(Number(s.id))}
                      />
                      <svg className="spec-tick" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                        <path d="M3 8.5l3.2 3.2L13 4.8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      {s.name}
                    </label>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <div>
          <label>Experience (years)</label>
          <input
            type="number"
            min="0"
            value={form.experience_years}
            onChange={(e) => set('experience_years', e.target.value)}
            placeholder="e.g. 15"
          />
        </div>

        <div className="full">
          <label>Hospital / location</label>
          <input
            value={form.hospital_location}
            onChange={(e) => set('hospital_location', e.target.value)}
            placeholder="Hospital name or city"
          />
        </div>

        {/* YOUTUBE VIDEO LINK */}
        {/* <div className="full">
          <label>YouTube video link</label>
          <input
            type="url"
            value={form.youtube_url}
            onChange={(e) => set('youtube_url', e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
          />
        </div> */}

        {/* ABOUT */}
        <div className="full doctor-editor-field">
          <label>About</label>
          <ReactQuill
            theme="snow"
            value={form.about}
            onChange={(value) => set('about', value)}
            modules={editorModules}
            placeholder="Enter doctor's profile and introduction..."
          />
        </div>

        {/* ALL REPEATABLE LIST FIELDS */}
        {LIST_FIELDS.map((field) => (
          <div className="full" key={field.key}>
            <RepeatableList
              label={field.label}
              values={form[field.key]}
              onChange={(values) => set(field.key, values)}
              placeholder={field.placeholder}
            />
          </div>
        ))}

        <div className="full">
          <ImageUpload
            label="Photo"
            existingUrl={existing}
            onFile={setFile}
          />
        </div>

        {error ? <div className="error full">{error}</div> : null}

        <div className="actions full">
          <button className="btn" type="submit">
            Save
          </button>
          <button
            className="btn secondary"
            type="button"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </form>
    </Drawer>
  );
}


