import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Drawer from '../../components/Drawer';
import { serviceContentApi, technologyDetailsApi } from '../../api';
import { slugify } from '../../utils';
import { SERVICE_TYPES } from './serviceSchemas';
import { Fields, UploadedImage, normalizeObject, cleanObject, setIn } from './FieldEditor';

const schemaOf = (slug) => SERVICE_TYPES[slug]?.pageFields || [];

const blankBase = (sid = '') => ({
  service_id: sid, name: '', slug: '', short_description: '', image: '', sort_order: 0, is_active: true,
});

export default function ServicePageForm({ open, id, services = [], defaultServiceId = '', onClose, onSaved }) {
  const [base, setBase] = useState(blankBase());
  const [values, setValues] = useState({});
  const [techs, setTechs] = useState([]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const slugOf = (sid) => services.find((s) => String(s.id) === String(sid))?.slug;
  const parentSlug = slugOf(base.service_id);
  const parent = SERVICE_TYPES[parentSlug];

  const update = (path, v) => setValues((p) => setIn(p, path, v));
  const setB = (k, v) => setBase((p) => ({ ...p, [k]: v }));

  useEffect(() => {
    if (!open) return;
    setError('');
    technologyDetailsApi.list().then((r) => setTechs(r.data?.data || [])).catch(() => {});

    if (!id) {
      setBase(blankBase(defaultServiceId || ''));
      setValues(normalizeObject(schemaOf(slugOf(defaultServiceId)), {}));
      return;
    }
    serviceContentApi
      .getPage(id)
      .then((res) => {
        const d = res.data.data;
        setBase({
          service_id: d.service_id, name: d.name || '', slug: d.slug || '',
          short_description: d.short_description || '', image: d.image || '',
          sort_order: d.sort_order ?? 0, is_active: Boolean(d.is_active),
        });
        setValues(normalizeObject(schemaOf(slugOf(d.service_id)), d.content));
      })
      .catch(() => toast.error('Failed to load page'));
  }, [open, id]);

  function chooseService(sid) {
    setB('service_id', sid);
    if (!id) setValues(normalizeObject(schemaOf(slugOf(sid)), {}));
  }

  async function onSubmit(e) {
    e.preventDefault();
    if (!base.service_id) return setError('Choose a service');
    if (!base.name.trim()) return setError('Name is required');
    setError('');
    setSaving(true);
    try {
      const content = cleanObject(schemaOf(parentSlug), values, base.name) || {};
      const payload = { ...base, slug: base.slug || slugify(base.name), content };
      if (id) await serviceContentApi.updatePage(id, payload);
      else await serviceContentApi.createPage(payload);
      toast.success(id ? 'Page updated' : 'Page created');
      onSaved?.();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    }
    setSaving(false);
  }

  return (
    <Drawer open={open} title={id ? 'Edit service page' : 'Add service page'} onClose={onClose} width="760px">
      <form className="drawer-body form-grid" onSubmit={onSubmit}>
        <div className="full">
          <label>Service *</label>
          <select value={base.service_id} onChange={(e) => chooseService(e.target.value)} disabled={Boolean(id)}>
            <option value="">Select a service…</option>
            {services.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>

        {parent && (
          <>
            <div className="full">
              <label>{parent.pageLabel} name *</label>
              <input
                value={base.name}
                placeholder="e.g. Breast Cancer"
                onChange={(e) => {
                  setB('name', e.target.value);
                  if (!id) setB('slug', slugify(e.target.value));
                }}
              />
            </div>
            <div className="full">
              <label>Slug</label>
              <input value={base.slug} onChange={(e) => setB('slug', e.target.value)} />
              {base.slug && <small>Page URL: /services/{parent.urlBase}/{base.slug}</small>}
            </div>
            <div className="full">
              <label>Display order (smallest first)</label>
              <input type="number" value={base.sort_order} onChange={(e) => setB('sort_order', e.target.value)} />
            </div>
            <div className="full">
              <label>Intro paragraph 1 (also the card text on the listing page)</label>
              <textarea value={base.short_description || ''} onChange={(e) => setB('short_description', e.target.value)} />
            </div>
            <div className="full">
              <UploadedImage label="Main image (top of page and card)" value={base.image} onChange={(url) => setB('image', url)} />
            </div>

            <Fields
              fields={schemaOf(parentSlug)}
              values={values}
              path={[]}
              update={update}
              ctx={{ name: base.name, techs }}
            />

            <label className="check">
              <input type="checkbox" checked={base.is_active} onChange={(e) => setB('is_active', e.target.checked)} />
              Active (visible on website)
            </label>
          </>
        )}

        {error ? <div className="error full">{error}</div> : null}
        <div className="actions full">
          <button className="btn" type="submit" disabled={saving || !parent}>{saving ? 'Saving…' : 'Save'}</button>
          <button className="btn secondary" type="button" onClick={onClose}>Cancel</button>
        </div>
      </form>
    </Drawer>
  );
}