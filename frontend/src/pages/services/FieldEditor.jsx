import toast from 'react-hot-toast';
import ImageUpload from '../../components/ImageUpload';
import { serviceContentApi } from '../../api';
import { mediaUrl } from '../../utils';

const key = () => Math.random().toString(36).slice(2);

/* ---------- state helpers: saved data -> editable state ---------- */
export function normalizeValue(def, v) {
  switch (def.type) {
    case 'strings':
      return Array.isArray(v) && v.length ? v.map(String) : [''];
    case 'techs':
      return Array.isArray(v) ? v.map(Number) : [];
    case 'cards': {
      const arr = Array.isArray(v) && v.length ? v : [{}];
      return arr.map((item) => ({ _k: key(), ...normalizeObject(def.fields, item) }));
    }
    case 'group':
      return normalizeObject(def.fields, v);
    default:
      return v == null ? '' : String(v);
  }
}

export function normalizeObject(fields, obj) {
  const src = obj && typeof obj === 'object' ? obj : {};
  return Object.fromEntries(fields.map((f) => [f.key, normalizeValue(f, src[f.key])]));
}

const newCard = (def) => ({ _k: key(), ...normalizeObject(def.fields, {}) });

/* ---------- save helpers: editable state -> clean JSON (empty things are dropped) ---------- */
const placeholderOf = (def, name) =>
  typeof def.placeholder === 'function' ? def.placeholder(name || 'this condition') : def.placeholder || '';

export function cleanValue(def, v, name) {
  switch (def.type) {
    case 'strings': {
      const a = (Array.isArray(v) ? v : []).map((x) => String(x).trim()).filter(Boolean);
      return a.length ? a : undefined;
    }
    case 'techs': {
      const a = (Array.isArray(v) ? v : []).map(Number).filter(Boolean);
      return a.length ? a : undefined;
    }
    case 'cards': {
      const a = (Array.isArray(v) ? v : []).map((item) => cleanObject(def.fields, item, name)).filter(Boolean);
      return a.length ? a : undefined;
    }
    case 'group':
      return cleanObject(def.fields, v, name, true);
    default: {
      const s = String(v ?? '').trim();
      return s || undefined;
    }
  }
}

export function cleanObject(fields, obj, name, fillDefaults = false) {
  const out = {};
  fields.forEach((f) => {
    const c = cleanValue(f, obj?.[f.key], name);
    if (c !== undefined) out[f.key] = c;
  });
  if (!Object.keys(out).length) return undefined;
  // a block that has content gets its default heading / label filled in
  if (fillDefaults) fields.forEach((f) => { if (f.fill && !out[f.key]) out[f.key] = placeholderOf(f, name); });
  return out;
}

/* ---------- immutable update by path ---------- */
export function setIn(obj, path, val) {
  if (!path.length) return val;
  const [k, ...rest] = path;
  if (Array.isArray(obj)) {
    const c = [...obj];
    c[k] = setIn(obj[k], rest, val);
    return c;
  }
  return { ...(obj || {}), [k]: setIn(obj?.[k], rest, val) };
}

/* ---------- image ---------- */
export function UploadedImage({ label, value, onChange }) {
  return (
    <ImageUpload
      label={label}
      existingUrl={value ? mediaUrl(value) : ''}
      onFile={async (file) => {
        if (!file) return;
        try {
          const res = await serviceContentApi.upload(file);
          onChange(res.data.url);
        } catch {
          toast.error('Image upload failed');
        }
      }}
    />
  );
}

/* ---------- field renderer ---------- */
const box = { border: '1px solid #e3e8ee', borderRadius: 10, padding: 14, marginBottom: 12, background: '#fafbfc' };
const head = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 };

export function Field({ def, value, path, update, ctx }) {
  const placeholder = placeholderOf(def, ctx.name);
  const set = (v) => update(path, v);

  if (def.type === 'text') {
    return (
      <div className="full">
        <label>{def.label}</label>
        <input value={value || ''} placeholder={placeholder} onChange={(e) => set(e.target.value)} />
      </div>
    );
  }

  if (def.type === 'textarea') {
    return (
      <div className="full">
        <label>{def.label}</label>
        <textarea rows={3} value={value || ''} placeholder={placeholder} onChange={(e) => set(e.target.value)} />
      </div>
    );
  }

  if (def.type === 'image') {
    return (
      <div className="full">
        <UploadedImage label={def.label} value={value} onChange={set} />
      </div>
    );
  }

  if (def.type === 'strings') {
    const list = value || [];
    return (
      <div className="full">
        <label>{def.label}</label>
        {list.map((v, i) => (
          <div className="repeat-row" key={i}>
            {def.textarea ? (
              <textarea rows={3} value={v} placeholder={placeholder} onChange={(e) => update([...path, i], e.target.value)} />
            ) : (
              <input value={v} placeholder={placeholder} onChange={(e) => update([...path, i], e.target.value)} />
            )}
            <button className="btn secondary small" type="button" onClick={() => set(list.filter((_, k) => k !== i))}>Remove</button>
          </div>
        ))}
        <button className="btn secondary small" type="button" onClick={() => set([...list, ''])}>Add row</button>
      </div>
    );
  }

  if (def.type === 'techs') {
    const selected = value || [];
    const options = ctx.techs || [];
    return (
      <div className="full">
        <label>{def.label} (tick the ones to show as cards)</label>
        {options.length === 0 && <small>No technologies yet. Add them on the Technologies page first.</small>}
        {options.map((t) => (
          <label key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '6px 0' }}>
            <input
              type="checkbox"
              style={{ width: 'auto' }}
              checked={selected.includes(t.id)}
              onChange={() => set(selected.includes(t.id) ? selected.filter((x) => x !== t.id) : [...selected, t.id])}
            />
            {t.title}
          </label>
        ))}
      </div>
    );
  }

  if (def.type === 'cards') {
    const list = value || [];
    return (
      <div className="full">
        <label>{def.label}</label>
        {list.map((item, i) => (
          <div key={item._k || i} style={box}>
            <div style={head}>
              <strong>{def.itemLabel || 'Item'} {i + 1}</strong>
              <button className="btn secondary small" type="button" onClick={() => set(list.filter((_, k) => k !== i))}>Remove</button>
            </div>
            <Fields fields={def.fields} values={item} path={[...path, i]} update={update} ctx={ctx} />
          </div>
        ))}
        <button className="btn secondary small" type="button" onClick={() => set([...list, newCard(def)])}>Add row</button>
      </div>
    );
  }

  if (def.type === 'group') {
    return (
      <details className="full" style={box}>
        <summary style={{ cursor: 'pointer', fontWeight: 600 }}>{def.label}</summary>
        <div style={{ marginTop: 12 }}>
          <Fields fields={def.fields} values={value} path={path} update={update} ctx={ctx} />
        </div>
      </details>
    );
  }

  return null;
}

export function Fields({ fields, values, path, update, ctx }) {
  return (
    <>
      {fields.map((f) => (
        <Field key={f.key} def={f} value={values?.[f.key]} path={[...path, f.key]} update={update} ctx={ctx} />
      ))}
    </>
  );
}