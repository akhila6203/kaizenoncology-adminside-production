import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Drawer from '../../components/Drawer';
import { faqsApi, specialitiesApi } from '../../api';

/*
  Pages of the website where an "Other" FAQ can be shown.
  value = key saved in the database and used by the website (?display_page=home)
  label = text shown in the admin form
  Add or remove pages here whenever you need.
*/
export const PAGE_OPTIONS = [
  { value: 'home', label: 'Home' },
  { value: 'about-us', label: 'About Us' },
  { value: 'services', label: 'Services' },
  { value: 'our-technology', label: 'Our Technology' },
  { value: 'our-doctors', label: 'Our Doctors' },
  { value: 'patient-support', label: 'Patient Support' },
  { value: 'health-library', label: 'Health Library' },
  { value: 'contact-us', label: 'Contact Us' },
];

// speciality_id: ''      -> nothing selected (optional)
//                'other' -> the "Other" option (then display_pages is used)
//                '12'    -> id of a speciality
const empty = { question: '', answer: '', speciality_id: '', display_pages: [] };

const pageCss = `
.pg-box { border: 1px solid #dbe7ee; border-radius: 12px; padding: 12px; background: #fff; }
.pg-head { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 10px; }
.pg-count { font-size: 12px; color: #5b7083; }
.pg-actions button { background: none; border: 0; color: #0e7c86; font-size: 12px; cursor: pointer; padding: 2px 6px; }
.pg-actions button:hover { text-decoration: underline; }
.pg-chips { display: flex; flex-wrap: wrap; gap: 8px; }
.pg-chip { position: relative; display: inline-flex; align-items: center; gap: 6px; margin: 0; padding: 7px 14px; border: 1px solid #dbe7ee; border-radius: 999px; background: #f7fafc; color: #33475b; font-size: 13px; font-weight: 500; line-height: 1.2; cursor: pointer; user-select: none; transition: background .15s, border-color .15s, color .15s; }
.pg-chip:hover { border-color: #0e7c86; background: #eef7f8; }
.pg-chip input { position: absolute; opacity: 0; width: 0 !important; height: 0 !important; margin: 0; padding: 0; border: 0; pointer-events: none; }
.pg-chip .pg-tick { display: none; width: 14px; height: 14px; }
.pg-chip.is-on { background: #e3f3f5; border-color: #0e7c86; color: #0a5c64; }
.pg-chip.is-on .pg-tick { display: inline-block; }
.pg-chip:focus-within { outline: 2px solid #0e7c86; outline-offset: 2px; }
`;

export default function FaqForm({ open, id, onClose, onSaved }) {
  const [form, setForm] = useState(empty);
  const [specialities, setSpecialities] = useState([]);
  const [error, setError] = useState('');

  // load every speciality that has been added in the Specialities page
  useEffect(() => {
    if (!open) return;
    specialitiesApi
      .options()
      .then((res) => setSpecialities(res.data.rows || []))
      .catch(() => toast.error('Unable to load specialities'));
  }, [open]);

  useEffect(() => {
    if (!open) return;
    setError('');
    if (!id) {
      setForm(empty);
      return;
    }
    faqsApi
      .get(id)
      .then((res) => {
        const d = res.data.data;
        setForm({
          question: d.question || '',
          answer: d.answer || '',
          speciality_id: d.is_other ? 'other' : d.speciality_id ? String(d.speciality_id) : '',
          display_pages: d.display_pages ? String(d.display_pages).split(',').filter(Boolean) : [],
        });
      })
      .catch(() => toast.error('Unable to load FAQ'));
  }, [open, id]);

  function set(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function togglePage(value) {
    setForm((prev) => ({
      ...prev,
      display_pages: prev.display_pages.includes(value)
        ? prev.display_pages.filter((p) => p !== value)
        : [...prev.display_pages, value],
    }));
  }

  const isOther = form.speciality_id === 'other';

  async function onSubmit(e) {
    e.preventDefault();
    if (!form.question.trim() || !form.answer.trim()) {
      setError('Question and answer are required');
      return;
    }
    if (isOther && form.display_pages.length === 0) {
      setError('Select at least one page where this FAQ should appear');
      return;
    }
    setError('');
    try {
      const payload = {
        ...form,
        // pages only matter for "Other"
        display_pages: isOther ? form.display_pages : [],
      };
      if (id) await faqsApi.update(id, payload);
      else await faqsApi.create(payload);
      toast.success(id ? 'FAQ updated' : 'FAQ created');
      onSaved?.();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    }
  }

  return (
    <Drawer open={open} title={id ? 'Edit FAQ' : 'Add FAQ'} onClose={onClose}>
      <form className="drawer-body form-grid" onSubmit={onSubmit}>
        <div className="full">
          <label>Speciality (optional)</label>
          <select
            value={form.speciality_id}
            onChange={(e) => set('speciality_id', e.target.value)}
          >
            <option value="">Select speciality or Other</option>
            {specialities.map((s) => (
              <option key={s.id} value={String(s.id)}>
                {s.name}
              </option>
            ))}
            <option value="other">Other</option>
          </select>
        </div>

        {/* shown only when "Other" is selected */}
        {isOther ? (
          <div className="full">
            <label>Show this FAQ on pages *</label>
            <style>{pageCss}</style>
            <div className="pg-box">
              <div className="pg-head">
                <span className="pg-count">
                  {form.display_pages.length
                    ? `${form.display_pages.length} selected`
                    : 'Select one or more pages'}
                </span>
                <span className="pg-actions">
                  <button
                    type="button"
                    onClick={() => set('display_pages', PAGE_OPTIONS.map((p) => p.value))}
                  >
                    Select all
                  </button>
                  <button type="button" onClick={() => set('display_pages', [])}>
                    Clear
                  </button>
                </span>
              </div>
              <div className="pg-chips">
                {PAGE_OPTIONS.map((p) => {
                  const on = form.display_pages.includes(p.value);
                  return (
                    <label key={p.value} className={`pg-chip${on ? ' is-on' : ''}`}>
                      <input type="checkbox" checked={on} onChange={() => togglePage(p.value)} />
                      <svg className="pg-tick" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                        <path
                          d="M3 8.5l3.2 3.2L13 4.8"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      {p.label}
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        ) : null}

        <div className="full">
          <label>Question *</label>
          <input value={form.question} onChange={(e) => set('question', e.target.value)} />
        </div>

        <div className="full">
          <label>Answer *</label>
          <textarea value={form.answer} onChange={(e) => set('answer', e.target.value)} />
        </div>

        {error ? <div className="error full">{error}</div> : null}

        <div className="actions full">
          <button className="btn" type="submit">Save</button>
          <button className="btn secondary" type="button" onClick={onClose}>Cancel</button>
        </div>
      </form>
    </Drawer>
  );
}

