import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Drawer from '../../components/Drawer';
import ImageUpload from '../../components/ImageUpload';
// import { technologyDetailsApi } from '../../api';
import { mediaUrl, slugify } from '../../utils';
import { technologyDetailsApi, specialitiesApi } from '../../api';

const key = () => Math.random().toString(36).slice(2);
const newPoint = () => ({ _k: key(), text: '' });
const newSection = () => ({ _k: key(), heading: '', paragraph: '', image: '', points: [newPoint()] });
const newFaq = () => ({ _k: key(), question: '', answer: '' });

const empty = {
  title: '', slug: '', short_description: '', thumbnail: '', is_published: true,
   speciality_ids: [],
  sections: [newSection()],
  faqs: [newFaq()],
};

// ImageUpload gives us a File; upload it right away and keep the returned URL
function UploadedImage({ label, value, onChange }) {
  return (
    <ImageUpload
      label={label}
      existingUrl={value ? mediaUrl(value) : ''}
      onFile={async (file) => {
        if (!file) return;
        try {
          const res = await technologyDetailsApi.upload(file);
          onChange(res.data.url);
        } catch {
          toast.error('Image upload failed');
        }
      }}
    />
  );
}

const block = { border: '1px solid #e3e8ee', borderRadius: 10, padding: 14, marginBottom: 12, background: '#fafbfc' };
const rowHead = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 };

export default function TechnologyForm({ open, id, onClose, onSaved }) {
  const [form, setForm] = useState(empty);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [specialityOptions, setSpecialityOptions] = useState([]);
const [loadingSpecialities, setLoadingSpecialities] = useState(false);


useEffect(() => {
  let cancelled = false;

  async function loadSpecialities() {
    setLoadingSpecialities(true);

    try {
      const res = await specialitiesApi.options();

const rows =
  res.data?.rows ??
  res.data?.data?.rows ??
  res.data?.data ??
  [];

const list = Array.isArray(rows) ? rows : [];

     if (!cancelled) {
  setSpecialityOptions(
    list
      .filter(
        (item) =>
          item.is_active === undefined ||
          Number(item.is_active) === 1
      )
      .map((item) => ({
        id: Number(item.id),
        name: item.name,
      }))
      .filter((item) => item.id && item.name)
  );
}
    } catch (err) {
      console.error(
        'Specialities loading failed:',
        err.response?.data || err
      );

      if (!cancelled) {
        setSpecialityOptions([]);
        toast.error('Failed to load specialities');
      }
    } finally {
      // IMPORTANT: Stop loading in success AND failure cases
      if (!cancelled) {
        setLoadingSpecialities(false);
      }
    }
  }

  loadSpecialities();

  return () => {
    cancelled = true;
  };
}, []);


  useEffect(() => {
    if (!open) return;
    setError('');
    if (!id) {
      setForm({ ...empty, sections: [newSection()], faqs: [newFaq()] });
      return;
    }
    Promise.all([technologyDetailsApi.getItem(id), technologyDetailsApi.get(id)])
      .then(([itemRes, detailRes]) => {
        const t = itemRes.data.data;
        const d = detailRes.data.data;
        setForm({
          title: t.title || '',
          slug: t.slug || '',
          short_description: t.short_description || '',
          thumbnail: t.thumbnail || '',
          is_published: Boolean(t.is_published),
          speciality_ids: (t.speciality_ids || []).map(Number),
          sections: d.sections?.length
            ? d.sections.map((s) => ({
                _k: key(), heading: s.heading || '', paragraph: s.paragraph || '', image: s.image || '',
                points: s.points?.length
                ? s.points.map((p) => ({
                    _k: key(),
                    text: p.text || '',
                  }))
                : [newPoint()],
              }))
            : [newSection()],
          faqs: d.faqs?.length ? d.faqs.map((f) => ({ _k: key(), question: f.question || '', answer: f.answer || '' })) : [newFaq()],
        });
      })
      .catch(() => toast.error('Failed to load technology'));
  }, [open, id]);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  // sections
  const updSection = (i, patch) => set('sections', form.sections.map((s, k) => (k === i ? { ...s, ...patch } : s)));
  const delSection = (i) => set('sections', form.sections.filter((_, k) => k !== i));
  const updPoint = (i, j, patch) =>
    updSection(i, { points: form.sections[i].points.map((p, m) => (m === j ? { ...p, ...patch } : p)) });
  const addPoint = (i) => updSection(i, { points: [...form.sections[i].points, newPoint()] });
  const delPoint = (i, j) => updSection(i, { points: form.sections[i].points.filter((_, m) => m !== j) });

  // faqs
  const updFaq = (i, patch) => set('faqs', form.faqs.map((f, k) => (k === i ? { ...f, ...patch } : f)));
  const delFaq = (i) => set('faqs', form.faqs.filter((_, k) => k !== i));

  async function onSubmit(e) {
    e.preventDefault();
    if (!form.title.trim()) {
      setError('Technology name is required');
      return;
    }
    setError('');
    setSaving(true);
    try {
      const base = {
        title: form.title,
        slug: form.slug || slugify(form.title),
        short_description: form.short_description,
        thumbnail: form.thumbnail,
        is_published: form.is_published,
        speciality_ids: [...new Set(form.speciality_ids.map(Number))],
      };
      let techId = id;
      if (id) await technologyDetailsApi.updateItem(id, base);
      else techId = (await technologyDetailsApi.createItem(base)).data.data.id;

      await technologyDetailsApi.save(techId, {
        sections: form.sections
          .filter((s) => s.heading.trim())
          .map((s) => ({ heading: s.heading, paragraph: s.paragraph, image: s.image, points: s.points.filter((p) => p.text.trim()) })),
        faqs: form.faqs.filter((f) => f.question.trim() && f.answer.trim()),
      });

      toast.success(id ? 'Technology updated' : 'Technology created');
      onSaved?.();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    }
    setSaving(false);
  }

  return (
    <Drawer open={open} title={id ? 'Edit technology' : 'Add technology'} onClose={onClose} width="720px">
      <form className="drawer-body form-grid" onSubmit={onSubmit}>
        <div className="full">
          <label>Technology name *</label>
          <input
            value={form.title}
            onChange={(e) => {
              set('title', e.target.value);
              if (!id) set('slug', slugify(e.target.value));
            }}
          />
        </div>
        <div className="full">
          <label>Slug (used in the URL)</label>
          <input value={form.slug} placeholder="radixact-x9-synchrony" onChange={(e) => set('slug', e.target.value)} />
        </div>
        <div className="full">
          <label>Short description</label>
          <textarea value={form.short_description || ''} onChange={(e) => set('short_description', e.target.value)} />
        </div>
        <div className="full">
          <UploadedImage label="Thumbnail / banner image" value={form.thumbnail} onChange={(url) => set('thumbnail', url)} />
        </div>

            {/* ---------- Specialities ---------- */}
<div className="full">
  <label>Related Specialities</label>

  <div
    style={{
      border: '1px solid #d8e1e8',
      borderRadius: 10,
      padding: 12,
      background: '#fff',
    }}
  >
    {loadingSpecialities ? (
      <p style={{ color: '#64748b', fontSize: 14 }}>
        Loading specialities...
      </p>
    ) : specialityOptions.length === 0 ? (
      <p style={{ color: '#64748b', fontSize: 14 }}>
        No active specialities available. Please add specialities first.
      </p>
    ) : (
      <div
        style={{
          display: 'grid',
gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
gap: 8,
maxHeight: 190,
overflowY: 'auto',
padding: 3,
        }}
      >
        {specialityOptions.map((speciality) => {
          const selected = form.speciality_ids
  .map(Number)
  .includes(Number(speciality.id));

          return (
            <label
              key={speciality.id}
              style={{
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  padding: '8px 10px',
  border: `1px solid ${selected ? '#4F7359' : '#e2e8f0'}`,
  background: selected ? '#f0f7f2' : '#ffffff',
  borderRadius: 8,
  cursor: 'pointer',
  fontSize: 13,
  fontWeight: selected ? 600 : 400,
  color: '#334155',
  minWidth: 0,
  transition: 'background 0.2s, border-color 0.2s',
}}
            >
              <input
  type="checkbox"
  checked={selected}
  style={{
    width: 15,
    height: 15,
    minWidth: 15,
    margin: 0,
    flexShrink: 0,
    accentColor: '#4F7359',
    cursor: 'pointer',
  }}
  onChange={(e) => {
    const checked = e.target.checked;
    const specialityId = Number(speciality.id);

    set(
      'speciality_ids',
      checked
        ? [...new Set([...form.speciality_ids.map(Number), specialityId])]
        : form.speciality_ids.filter(
            (id) => Number(id) !== specialityId
          )
    );
  }}
/>

              <span>{speciality.name}</span>
            </label>
          );
        })}
      </div>
    )}

    {/* Selected specialities */}
    {form.speciality_ids.length > 0 && (
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 6,
          marginTop: 12,
        }}
      >
        {form.speciality_ids.map((id) => {
          const speciality = specialityOptions.find(
            (item) => item.id === id
          );

          if (!speciality) return null;

          return (
            <span
              key={id}
              style={{
                background: '#eaf3ed',
                color: '#304b3c',
                borderRadius: 20,
                padding: '5px 10px',
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              {speciality.name}
            </span>
          );
        })}
      </div>
    )}
  </div>
</div>
        {/* ---------- Details ---------- */}
        <div className="full">
          <label>Details</label>
          {form.sections.map((s, i) => (
            <div key={s._k} style={block}>
              <div style={rowHead}>
                <strong>Detail {i + 1}</strong>
                <button className="btn secondary small" type="button" onClick={() => delSection(i)}>Remove</button>
              </div>

              <input value={s.heading} placeholder="Heading" onChange={(e) => updSection(i, { heading: e.target.value })} />
              <textarea style={{ marginTop: 8 }} rows={3} value={s.paragraph} placeholder="Paragraph" onChange={(e) => updSection(i, { paragraph: e.target.value })} />
              <div style={{ marginTop: 8 }}>
                <UploadedImage label="Section image (optional)" value={s.image} onChange={(url) => updSection(i, { image: url })} />
              </div>

              <label style={{ marginTop: 12 }}>Points</label>
              {s.points.map((p, j) => (
                <div key={p._k} style={{ marginBottom: 10, paddingBottom: 10, borderBottom: '1px dashed #e3e8ee' }}>
                  <div className="repeat-row">
                    <input value={p.text} placeholder={`Point ${j + 1}`} onChange={(e) => updPoint(i, j, { text: e.target.value })} />
                    <button className="btn secondary small" type="button" onClick={() => delPoint(i, j)}>Remove</button>
                  </div>
                  {/* <UploadedImage label="Point image (optional)" value={p.image} onChange={(url) => updPoint(i, j, { image: url })} /> */}
                </div>
              ))}
              <button className="btn secondary small" type="button" onClick={() => addPoint(i)}>Add row</button>
            </div>
          ))}
          <button className="btn secondary small" type="button" onClick={() => set('sections', [...form.sections, newSection()])}>
            Add row
          </button>
        </div>

        {/* ---------- FAQs ---------- */}
        <div className="full">
          <label>FAQs</label>
          {form.faqs.map((f, i) => (
            <div key={f._k} style={block}>
              <div style={rowHead}>
                <strong>FAQ {i + 1}</strong>
                <button className="btn secondary small" type="button" onClick={() => delFaq(i)}>Remove</button>
              </div>
              <input value={f.question} placeholder="Question" onChange={(e) => updFaq(i, { question: e.target.value })} />
              <textarea style={{ marginTop: 8 }} rows={3} value={f.answer} placeholder="Answer" onChange={(e) => updFaq(i, { answer: e.target.value })} />
            </div>
          ))}
          <button className="btn secondary small" type="button" onClick={() => set('faqs', [...form.faqs, newFaq()])}>
            Add row
          </button>
        </div>

        <label className="check">
          <input type="checkbox" checked={form.is_published} onChange={(e) => set('is_published', e.target.checked)} />
          Published
        </label>

        {error ? <div className="error full">{error}</div> : null}
        <div className="actions full">
          <button className="btn" type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
          <button className="btn secondary" type="button" onClick={onClose}>Cancel</button>
        </div>
      </form>
    </Drawer>
  );
}