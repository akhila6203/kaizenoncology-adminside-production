import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
// import ReactQuill from 'react-quill-new';
// import 'react-quill-new/dist/quill.snow.css';
import Drawer from '../../components/Drawer';
import ImageUpload from '../../components/ImageUpload';
import RepeatableList from '../../components/RepeatableList';
import { specialitiesApi } from '../../api';
import { toFormData } from '../../api/client';
import { mediaUrl, slugify } from '../../utils';

import * as LucideIcons from 'lucide-react';

const empty = {
  name: '',
  slug: '',
  icon_name: '',
  about_content: '',
  when_to_consult: '',
  is_active: true,
  highlights: [''],
  subspecialities: [''],
};

const specialityIconOptions = [
  'Stethoscope',
  'Microscope',
  'Brain',
  'BrainCircuit',
  'Radiation',
  'HeartPulse',
  'Heart',
  'Scissors',
  'Baby',
  'Scan',
  'Dna',
  'Activity',
  'ShieldCheck',
  'Syringe',
  'FlaskConical',
  'Pill',
  'Bone',
  'Ribbon',
  'Hospital',
  'ClipboardPlus',
  'Cross',
  'Eye',
  'HandHeart',
  'UserRound',
];

export default function SpecialityForm({ open, id, onClose, onSaved }) {
  const [form, setForm] = useState(empty);
  const [file, setFile] = useState(null);
  const [galleryFiles, setGalleryFiles] = useState([]);
const [existingGallery, setExistingGallery] = useState([]);
  const [existing, setExisting] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setError('');
    setFile(null);
    if (!id) {
  setForm(empty);
  setExisting('');
  setGalleryFiles([]);
  setExistingGallery([]);
  return;
}
    specialitiesApi.get(id).then((res) => {
      const d = res.data.data;

      setForm({
        ...empty,
        ...d,
        is_active: Boolean(d.is_active),
        highlights: d.highlights?.length ? d.highlights : [''],
        subspecialities: d.subspecialities?.length ? d.subspecialities : [''],
      
      });
      setExisting(mediaUrl(d.about_image));
      setExistingGallery(d.gallery_images || []);
setGalleryFiles([]);
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
  icon_name: form.icon_name || '',
  about_content: form.about_content,
  when_to_consult: form.when_to_consult,
  is_active: form.is_active,
  highlights: form.highlights.filter(Boolean),
  subspecialities: form.subspecialities.filter(Boolean),
}, 'about_image', file);

galleryFiles.forEach((image) => {
  payload.append('gallery_images', image);
});
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
        <div className="full speciality-icon-field">
  <label>Speciality Icon</label>

  <div className="speciality-icon-row">
    <select
      value={form.icon_name || ''}
      onChange={(e) => set('icon_name', e.target.value)}
      className="speciality-icon-select"
    >
      <option value="">Select an icon</option>

      {specialityIconOptions.map((iconName) => (
        <option key={iconName} value={iconName}>
          {iconName}
        </option>
      ))}
    </select>

    <div className="speciality-icon-preview">
      {(() => {
        const SelectedIcon =
          LucideIcons[form.icon_name] || LucideIcons.Stethoscope;

        return (
          <>
            <SelectedIcon />
            <span>{form.icon_name || 'Preview'}</span>
          </>
        );
      })()}
    </div>
  </div>

  <p className="speciality-icon-help">
    Select an icon that represents this speciality.
  </p>
</div>
        <div className="full">
          <label>About</label>
          <textarea value={form.about_content || ''} onChange={(e) => set('about_content', e.target.value)} />
        </div>
        <div className="full">
  <label>When to Consult</label>
  <input
    type="text"
    value={form.when_to_consult || ''}
    onChange={(e) => set('when_to_consult', e.target.value)}
    placeholder="When should a patient consult this specialist?"
  />
</div>
        <div className="full">
          <ImageUpload label="About image" existingUrl={existing} onFile={setFile} />
        </div>
        <RepeatableList label="Care & Treatment Areas" values={form.highlights} onChange={(v) => set('highlights', v)} placeholder="Care & Treatment Areas" />
          <div className="full speciality-gallery-section">
  <label>Gallery Images</label>

  <input
    type="file"
    accept="image/*"
    multiple
    onChange={(e) => {
      const selectedFiles = Array.from(e.target.files || []);

      if (selectedFiles.length > 0) {
        setGalleryFiles((prev) => [
          ...prev,
          ...selectedFiles,
        ]);
      }

      e.target.value = '';
    }}
  />

  {/* Existing gallery images */}
  {existingGallery.length > 0 && (
    <div className="speciality-gallery-preview-list">
      {existingGallery.map((image) => (
        <div key={image.id} className="speciality-gallery-preview-item">
          <img
            src={mediaUrl(image.image_path)}
            alt={image.alt_text || 'Gallery image'}
            className="speciality-gallery-preview-image"
          />
        </div>
      ))}
    </div>
  )}

  {/* Newly selected images */}
  {galleryFiles.length > 0 && (
    <div className="speciality-gallery-preview-list">
      {galleryFiles.map((image, index) => (
        <div
          key={`${image.name}-${index}`}
          className="speciality-gallery-preview-item"
        >
          <img
            src={URL.createObjectURL(image)}
            alt={image.name}
            className="speciality-gallery-preview-image"
          />

          <button
            type="button"
            className="speciality-gallery-remove"
            onClick={() =>
              setGalleryFiles((prev) =>
                prev.filter((_, i) => i !== index)
              )
            }
          >
            Remove
          </button>
        </div>
      ))}
    </div>
  )}
</div>
        <RepeatableList label="Sub specialities" values={form.subspecialities} onChange={(v) => set('subspecialities', v)} placeholder="Sub speciality" />
        
       
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



