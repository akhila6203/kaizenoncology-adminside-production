import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Drawer from '../../components/Drawer';
import { serviceContentApi } from '../../api';
import { slugify } from '../../utils';
import { UploadedImage } from './FieldEditor';

const emptyPoint = () => ({ heading: '', description: '' });
const emptyType = () => ({ heading: '', description: '', image: '', points: [emptyPoint()] });

const emptyBase = {
  name: '', slug: '', description: '', icon_image: '', is_active: true, sort_order: 0,
};

// make sure every type/point has all keys so inputs stay controlled
const normalizeTypes = (list) =>
  Array.isArray(list) && list.length
    ? list.map((t) => ({
        heading: t.heading || '',
        description: t.description || '',
        image: t.image || '',
        points: Array.isArray(t.points) && t.points.length
          ? t.points.map((p) => ({ heading: p.heading || '', description: p.description || '' }))
          : [emptyPoint()],
      }))
    : [emptyType()];

// drop empty rows before saving
const cleanTypes = (list) =>
  list
    .map((t) => ({
      heading: t.heading.trim(),
      description: t.description.trim(),
      image: t.image,
      points: t.points
        .map((p) => ({ heading: p.heading.trim(), description: p.description.trim() }))
        .filter((p) => p.heading || p.description),
    }))
    .filter((t) => t.heading || t.description || t.image || t.points.length);

export default function ServiceForm({ open, id, onClose, onSaved }) {
  const [base, setBase] = useState(emptyBase);
  const [types, setTypes] = useState([emptyType()]);
  const [otherExtra, setOtherExtra] = useState({}); // keeps any other keys already in `extra`
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const setB = (k, v) => setBase((p) => ({ ...p, [k]: v }));

  /* ---------- service type helpers ---------- */
  const updateType = (ti, patch) =>
    setTypes((p) => p.map((t, i) => (i === ti ? { ...t, ...patch } : t)));

  const addType = () => setTypes((p) => [...p, emptyType()]);

  const removeType = (ti) =>
    setTypes((p) => {
      const next = p.filter((_, i) => i !== ti);
      return next.length ? next : [emptyType()];
    });

  const updatePoint = (ti, pi, patch) =>
    setTypes((p) =>
      p.map((t, i) =>
        i !== ti ? t : { ...t, points: t.points.map((pt, j) => (j === pi ? { ...pt, ...patch } : pt)) }
      )
    );

  const addPoint = (ti) =>
    setTypes((p) => p.map((t, i) => (i === ti ? { ...t, points: [...t.points, emptyPoint()] } : t)));

  const removePoint = (ti, pi) =>
    setTypes((p) =>
      p.map((t, i) => {
        if (i !== ti) return t;
        const points = t.points.filter((_, j) => j !== pi);
        return { ...t, points: points.length ? points : [emptyPoint()] };
      })
    );

  /* ---------- load ---------- */
  useEffect(() => {
    if (!open) return;
    setError('');
    if (!id) {
      setBase(emptyBase);
      setTypes([emptyType()]);
      setOtherExtra({});
      return;
    }
    serviceContentApi
      .getService(id)
      .then((res) => {
        const s = res.data.data;
        const { service_types, ...rest } = s.extra || {};
        setBase({
          name: s.name || '',
          slug: s.slug || '',
          description: s.description || '',
          icon_image: s.icon_image || '',
          is_active: Boolean(s.is_active),
          sort_order: s.sort_order ?? 0,
        });
        setTypes(normalizeTypes(service_types));
        setOtherExtra(rest);
      })
      .catch(() => toast.error('Failed to load service'));
  }, [open, id]);

  /* ---------- save ---------- */
  async function onSubmit(e) {
    e.preventDefault();
    if (!base.name.trim()) return setError('Service name is required');
    setError('');
    setSaving(true);
    try {
      const payload = {
        ...base,
        slug: base.slug || slugify(base.name),
        extra: { ...otherExtra, service_types: cleanTypes(types) },
      };
      if (id) await serviceContentApi.updateService(id, payload);
      else await serviceContentApi.createService(payload);
      toast.success(id ? 'Service updated' : 'Service created');
      onSaved?.();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    }
    setSaving(false);
  }

  return (
    <Drawer open={open} title={id ? 'Edit service' : 'Add service'} onClose={onClose} width="760px">
      <form className="drawer-body form-grid" onSubmit={onSubmit}>
        <div className="full">
          <label>Service name *</label>
          <input
            value={base.name}
            placeholder="e.g. Cancer Types"
            onChange={(e) => {
              setB('name', e.target.value);
              if (!id) setB('slug', slugify(e.target.value));
            }}
          />
        </div>

        <div className="full">
          <label>Slug</label>
          <input value={base.slug} onChange={(e) => setB('slug', e.target.value)} />
          {base.slug && <small>Page URL: /services/{base.slug}</small>}
        </div>

        <div className="full">
          <label>About</label>
          <textarea
            rows={4}
            value={base.description || ''}
            onChange={(e) => setB('description', e.target.value)}
          />
        </div>

        <div className="full">
          <UploadedImage
            label="Service image"
            value={base.icon_image}
            onChange={(url) => setB('icon_image', url)}
          />
        </div>

        <div className="full">
          <label>Display order (smallest first)</label>
          <input
            type="number"
            value={base.sort_order}
            onChange={(e) => setB('sort_order', e.target.value)}
          />
        </div>

        {/* ---------------- SERVICE TYPES ---------------- */}
        <div className="full">
          <label>Service types</label>

          {types.map((t, ti) => (
            <div className="service-type-card" key={ti}>
              <div className="service-type-head">
                <strong>Service type {ti + 1}</strong>
                <button
                  type="button"
                  className="btn secondary small"
                  onClick={() => removeType(ti)}
                >
                  Remove type
                </button>
              </div>

              <input
                value={t.heading}
                placeholder="Heading (e.g. Breast Cancer)"
                onChange={(e) => updateType(ti, { heading: e.target.value })}
              />

              <textarea
                rows={3}
                value={t.description}
                placeholder="Paragraph"
                onChange={(e) => updateType(ti, { description: e.target.value })}
              />

              <UploadedImage
                label="Image"
                value={t.image}
                onChange={(url) => updateType(ti, { image: url })}
              />

              <label className="sub-label">Sub points</label>
              {t.points.map((p, pi) => (
                <div className="ailment-row" key={pi}>
                  <input
                    className="ailment-title"
                    value={p.heading}
                    placeholder="Point heading"
                    onChange={(e) => updatePoint(ti, pi, { heading: e.target.value })}
                  />
                  <textarea
                    className="ailment-description"
                    rows={2}
                    value={p.description}
                    placeholder="Point paragraph"
                    onChange={(e) => updatePoint(ti, pi, { description: e.target.value })}
                  />
                  <button
                    type="button"
                    className="btn secondary small ailment-remove"
                    onClick={() => removePoint(ti, pi)}
                  >
                    Remove
                  </button>
                </div>
              ))}

              <button type="button" className="btn secondary small" onClick={() => addPoint(ti)}>
                Add sub point
              </button>
            </div>
          ))}

          <button type="button" className="btn secondary small" onClick={addType}>
            Add service type
          </button>
        </div>

        <label className="check">
          <input
            type="checkbox"
            checked={base.is_active}
            onChange={(e) => setB('is_active', e.target.checked)}
          />
          Active (show on website)
        </label>

        {error ? <div className="error full">{error}</div> : null}
        <div className="actions full">
          <button className="btn" type="submit" disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </button>
          <button className="btn secondary" type="button" onClick={onClose}>
            Cancel
          </button>
        </div>
      </form>
    </Drawer>
  );
}













// import { useEffect, useState } from 'react';
// import toast from 'react-hot-toast';
// import Drawer from '../../components/Drawer';
// import ImageUpload from '../../components/ImageUpload';
// import { servicesApi } from '../../api';
// import { toFormData } from '../../api/client';
// import { mediaUrl, slugify } from '../../utils';

// const empty = { name: '', slug: '', description: '', is_active: true, sort_order: 0 };

// export default function ServiceForm({ open, id, onClose, onSaved }) {
//   const [form, setForm] = useState(empty);
//   const [file, setFile] = useState(null);
//   const [existing, setExisting] = useState('');
//   const [error, setError] = useState('');

//   useEffect(() => {
//     if (!open) return;
//     setError('');
//     setFile(null);
//     if (!id) {
//       setForm(empty);
//       setExisting('');
//       return;
//     }
//     servicesApi.get(id).then((res) => {
//       const d = res.data.data;
//       setForm({ ...d, is_active: Boolean(d.is_active) });
//       setExisting(mediaUrl(d.icon_image));
//     });
//   }, [open, id]);

//   function set(key, value) {
//     setForm((prev) => ({ ...prev, [key]: value }));
//   }

//   async function onSubmit(e) {
//     e.preventDefault();
//     if (!form.name) {
//       setError('Name is required');
//       return;
//     }
//     try {
//       const payload = toFormData(form, 'icon_image', file);
//       if (id) await servicesApi.update(id, payload);
//       else await servicesApi.create(payload);
//       toast.success(id ? 'Service updated' : 'Service created');
//       onSaved?.();
//       onClose();
//     } catch (err) {
//       toast.error(err.response?.data?.message || 'Save failed');
//     }
//   }

//   return (
//     <Drawer open={open} title={id ? 'Edit service' : 'Add service'} onClose={onClose}>
//       <form className="drawer-body form-grid" onSubmit={onSubmit}>
//         <div>
//           <label>Name *</label>
//           <input value={form.name} onChange={(e) => {
//             set('name', e.target.value);
//             if (!id) set('slug', slugify(e.target.value));
//           }} />
//         </div>
//         <div>
//           <label>Slug</label>
//           <input value={form.slug} onChange={(e) => set('slug', e.target.value)} />
//         </div>
//         <div>
//           <label>Sort order</label>
//           <input type="number" value={form.sort_order} onChange={(e) => set('sort_order', e.target.value)} />
//         </div>
//         <label className="check">
//           <input type="checkbox" checked={form.is_active} onChange={(e) => set('is_active', e.target.checked)} />
//           Active
//         </label>
//         <div className="full">
//           <label>Description</label>
//           <textarea value={form.description || ''} onChange={(e) => set('description', e.target.value)} />
//         </div>
//         <div className="full">
//           <ImageUpload label="Icon image" existingUrl={existing} onFile={setFile} />
//         </div>
//         {error ? <div className="error full">{error}</div> : null}
//         <div className="actions full">
//           <button className="btn" type="submit">Save</button>
//           <button className="btn secondary" type="button" onClick={onClose}>Cancel</button>
//         </div>
//       </form>
//     </Drawer>
//   );
// }
