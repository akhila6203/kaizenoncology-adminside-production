import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import Drawer from '../../components/Drawer';
import ImageUpload from '../../components/ImageUpload';
import RepeatableList from '../../components/RepeatableList';
import { specialitiesApi } from '../../api';
import { toFormData } from '../../api/client';
import { mediaUrl, slugify } from '../../utils';

const empty = {
  name: '',
  slug: '',
  about_content: '',
  is_active: true,
  highlights: [''],
  subspecialities: [''],
  ailments: [{ title: '', description: '' }],
};

const quillModules = {
  toolbar: [
    [{ header: [2, 3, false] }],
    ['bold', 'italic', 'underline'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['link'],
    ['clean'],
  ],
};

// Quill returns this when the editor is empty
function cleanHtml(html) {
  return !html || html === '<p><br></p>' ? '' : html;
}

export default function SpecialityForm({ open, id, onClose, onSaved }) {
  const [form, setForm] = useState(empty);
  const [file, setFile] = useState(null);
  const [existing, setExisting] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setError('');
    setFile(null);
    if (!id) {
      setForm(empty);
      setExisting('');
      return;
    }
    specialitiesApi.get(id).then((res) => {
      const d = res.data.data;
      // Old records stored ailments as an array: convert to a bullet list
      // const ailmentsHtml = Array.isArray(d.ailments)
      //   ? (d.ailments.length ? `<ul>${d.ailments.map((a) => `<li>${a}</li>`).join('')}</ul>` : '')
      //   : (d.ailments || '');
      // Support both old array data and new rich HTML content
let ailmentsHtml = '';
const ailmentsRows = Array.isArray(d.ailments)
  ? d.ailments.map((item) =>
      typeof item === 'string'
        ? { title: item, description: '' }
        : {
            title: item.title || '',
            description: item.description || '',
          }
    )
  : [{ title: '', description: '' }];

      setForm({
        ...empty,
        ...d,
        is_active: Boolean(d.is_active),
        highlights: d.highlights?.length ? d.highlights : [''],
        subspecialities: d.subspecialities?.length ? d.subspecialities : [''],
        // ailments: ailmentsHtml,
        ailments: ailmentsRows.length
  ? ailmentsRows
  : [{ title: '', description: '' }],
      });
      setExisting(mediaUrl(d.about_image));
    });
  }, [open, id]);

  function set(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    if (!form.name) {
      setError('Name is required');
      return;
    }
    try {
      const payload = toFormData({
        name: form.name,
        slug: form.slug || slugify(form.name),
        about_content: form.about_content,
        is_active: form.is_active,
        highlights: form.highlights.filter(Boolean),
        subspecialities: form.subspecialities.filter(Boolean),
        // ailments: cleanHtml(form.ailments),
        ailments: form.ailments.filter(
  (item) =>
    item.title.trim() || item.description.trim()
),
      }, 'about_image', file);
      if (id) await specialitiesApi.update(id, payload);
      else await specialitiesApi.create(payload);
      toast.success(id ? 'Speciality updated' : 'Speciality created');
      onSaved?.();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    }
  }

  return (
    <Drawer open={open} title={id ? 'Edit speciality' : 'Add speciality'} onClose={onClose} width="720px">
      <form className="drawer-body form-grid" onSubmit={onSubmit}>
        <div className="full">
          <label>Speciality name *</label>
          <input value={form.name} onChange={(e) => {
            set('name', e.target.value);
            if (!id) set('slug', slugify(e.target.value));
          }} />
        </div>
        <div className="full">
          <label>About</label>
          <textarea value={form.about_content || ''} onChange={(e) => set('about_content', e.target.value)} />
        </div>
        <div className="full">
          <ImageUpload label="About image" existingUrl={existing} onFile={setFile} />
        </div>
        <RepeatableList label="Key highlights" values={form.highlights} onChange={(v) => set('highlights', v)} placeholder="Highlight" />
        <RepeatableList label="Sub specialities" values={form.subspecialities} onChange={(v) => set('subspecialities', v)} placeholder="Sub speciality" />
        {/* <div className="full">
          <label>Ailments</label>
          <ReactQuill
            theme="snow"
            value={form.ailments}
            onChange={(v) => set('ailments', v)}
            modules={quillModules}
            placeholder="Describe the ailments treated"
          />
        </div> */}
        <div className="full">
  <label>Ailments</label>

  {(form.ailments?.length
    ? form.ailments
    : [{ title: '', description: '' }]
  ).map((item, index) => (
    // <div className="repeat-row" key={index}>
    <div className="ailment-row" key={index}>
      <input
      className="ailment-title"
        value={item.title}
        placeholder="Ailment heading"
        onChange={(e) => {
          const updated = [...form.ailments];
          updated[index] = {
            ...updated[index],
            title: e.target.value,
          };
          set('ailments', updated);
        }}
      />

      <textarea
  className="ailment-description"
  value={item.description}
  placeholder="Ailment description"
  rows={2}
  onChange={(e) => {
    const updated = [...form.ailments];
    updated[index] = {
      ...updated[index],
      description: e.target.value,
    };
    set('ailments', updated);
  }}
/>

      <button
        // className="btn secondary small"
        className="btn secondary small ailment-remove"
        type="button"
        onClick={() => {
          const updated = form.ailments.filter(
            (_, i) => i !== index
          );
          set(
            'ailments',
            updated.length
              ? updated
              : [{ title: '', description: '' }]
          );
        }}
      >
        Remove
      </button>
    </div>
  ))}

  <button
    className="btn secondary small"
    type="button"
    onClick={() =>
      set('ailments', [
        ...form.ailments,
        { title: '', description: '' },
      ])
    }
  >
    Add row
  </button>
</div>
        <label className="check">
          <input type="checkbox" checked={form.is_active} onChange={(e) => set('is_active', e.target.checked)} />
          Active
        </label>
        {error ? <div className="error full">{error}</div> : null}
        <div className="actions full">
          <button className="btn" type="submit">Save</button>
          <button className="btn secondary" type="button" onClick={onClose}>Cancel</button>
        </div>
      </form>
    </Drawer>
  );
}