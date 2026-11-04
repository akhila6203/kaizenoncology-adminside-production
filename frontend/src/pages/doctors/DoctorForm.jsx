
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

const empty = {
  name: '',
  slug: '',
  speciality_id: '',
  experience_years: '',
  license_number: '',
  hospital_location: '',

  // NEW FIELDS
  about: '',
  expertise: [''],
  academics_achievements: '',

  is_active: true,
  qualifications: [''],
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

      setForm({
        ...empty,
        ...d,
        speciality_id: d.speciality_id || '',
        license_number: d.license_number || '',
        hospital_location: d.hospital_location || '',
        experience_years: d.experience_years ?? '',
        about: d.about || '',
        academics_achievements: d.academics_achievements || '',
        is_active: Boolean(d.is_active),

        qualifications: d.qualifications?.length
          ? d.qualifications
          : [''],

        expertise: d.expertise?.length
          ? d.expertise
          : [''],
      });

      setExisting(mediaUrl(d.photo));
    }).catch((err) => {
      toast.error(err.response?.data?.message || 'Unable to load doctor');
    });
  }, [open, id]);

  function set(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function onSubmit(e) {
    e.preventDefault();

    if (!form.name.trim()) {
      setError('Name is required');
      return;
    }

    setError('');

    try {
      const payload = toFormData(
        {
          ...form,
          slug: form.slug || slugify(form.name),
          experience_years: form.experience_years || '',
          qualifications: form.qualifications.filter((v) => v.trim()),
          expertise: form.expertise.filter((v) => v.trim()),
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

        <div>
          <label>Speciality</label>
          <select
            value={form.speciality_id}
            onChange={(e) => set('speciality_id', e.target.value)}
          >
            <option value="">Select speciality</option>
            {specialities.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        {/* EXPERIENCE */}
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

        {/* AREA OF EXPERTISE */}
        <div className="full">
          <RepeatableList
            label="Area of Expertise"
            values={form.expertise}
            onChange={(values) => set('expertise', values)}
            placeholder="e.g. Medical Oncology"
          />
        </div>

        {/* ACADEMICS / ACHIEVEMENTS */}
        <div className="full doctor-editor-field">
          <label>Academics / Achievements</label>
          <ReactQuill
            theme="snow"
            value={form.academics_achievements}
            onChange={(value) => set('academics_achievements', value)}
            modules={editorModules}
            placeholder="Enter academic qualifications, awards and achievements..."
          />
        </div>

        {/* EXISTING QUALIFICATIONS */}
        <div className="full">
          <RepeatableList
            label="Qualifications"
            values={form.qualifications}
            onChange={(values) => set('qualifications', values)}
            placeholder="MBBS, MD..."
          />
        </div>

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


// import { useEffect, useState } from 'react';
// import toast from 'react-hot-toast';
// import Drawer from '../../components/Drawer';
// import ImageUpload from '../../components/ImageUpload';
// import RepeatableList from '../../components/RepeatableList';
// import { doctorsApi, specialitiesApi } from '../../api';
// import { toFormData } from '../../api/client';
// import { mediaUrl, slugify } from '../../utils';

// const empty = {
//   name: '',
//   slug: '',
//   speciality_id: '',
//   experience_years: '',
//   license_number: '',
//   hospital_location: '',
//   is_active: true,
//   qualifications: [''],
// };

// export default function DoctorDrawer({ open, id, onClose, onSaved }) {
//   const [form, setForm] = useState(empty);
//   const [file, setFile] = useState(null);
//   const [existing, setExisting] = useState('');
//   const [specialities, setSpecialities] = useState([]);
//   const [error, setError] = useState('');

//   useEffect(() => {
//     if (!open) return;
//     specialitiesApi.options().then((res) => setSpecialities(res.data.rows || []));
//   }, [open]);

//   useEffect(() => {
//     if (!open) return;
//     setError('');
//     setFile(null);
//     if (!id) {
//       setForm(empty);
//       setExisting('');
//       return;
//     }
//     doctorsApi.get(id).then((res) => {
//       const d = res.data.data;
//       setForm({
//         ...empty,
//         ...d,
//         speciality_id: d.speciality_id || '',
//         license_number: d.license_number || '',
//         hospital_location: d.hospital_location || '',
//         is_active: Boolean(d.is_active),
//         qualifications: d.qualifications?.length ? d.qualifications : [''],
//       });
//       setExisting(mediaUrl(d.photo));
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
//     setError('');
//     try {
//       const payload = toFormData({
//         ...form,
//         slug: form.slug || slugify(form.name),
//         qualifications: form.qualifications.filter(Boolean),
//       }, 'photo', file);
//       if (id) await doctorsApi.update(id, payload);
//       else await doctorsApi.create(payload);
//       toast.success(id ? 'Doctor updated' : 'Doctor created');
//       onSaved?.();
//       onClose();
//     } catch (err) {
//       toast.error(err.response?.data?.message || 'Save failed');
//     }
//   }

//   return (
//     <Drawer open={open} title={id ? 'Edit doctor' : 'Add doctor'} onClose={onClose}>
//       <form className="drawer-body form-grid" onSubmit={onSubmit}>
//         <div>
//           <label>Name *</label>
//           <input value={form.name} onChange={(e) => set('name', e.target.value)} />
//         </div>
//         <div>
//           <label>License number</label>
//           <input value={form.license_number} onChange={(e) => set('license_number', e.target.value)} />
//         </div>
//         <div>
//           <label>Speciality</label>
//           <select value={form.speciality_id} onChange={(e) => set('speciality_id', e.target.value)}>
//             <option value="">Select speciality</option>
//             {specialities.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
//           </select>
//         </div>
//         <div>
//           <label>Experience (years)</label>
//           <input type="number" value={form.experience_years || ''} onChange={(e) => set('experience_years', e.target.value)} />
//         </div>
//         <div className="full">
//           <label>Hospital / location</label>
//           <input value={form.hospital_location} onChange={(e) => set('hospital_location', e.target.value)} placeholder="Hospital name or city" />
//         </div>
//         <div className="full">
//           <RepeatableList label="Qualifications" values={form.qualifications} onChange={(v) => set('qualifications', v)} placeholder="MBBS, MD..." />
//         </div>
//         <div className="full">
//           <ImageUpload label="Photo" existingUrl={existing} onFile={setFile} />
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
