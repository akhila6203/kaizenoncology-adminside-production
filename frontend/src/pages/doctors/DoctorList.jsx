
import { useEffect, useState } from 'react';
import {
  Eye,
  Pencil,
  Trash2,
  X,
  MapPin,
  BriefcaseBusiness,
  Languages,
  Award,
  BookOpen,
  Stethoscope,
  PlayCircle,
  FileText,
  GraduationCap,
  ShieldCheck,
} from 'lucide-react';
import toast from 'react-hot-toast';

import Pagination from '../../components/Pagination';
import ConfirmDeleteModal from '../../components/ConfirmDeleteModal';
import { doctorsApi, specialitiesApi } from '../../api';
import { usePagedList } from '../../hooks';
import { mediaUrl } from '../../utils';
import DoctorDrawer from './DoctorForm';

import './DoctorList.css';

const PAGE_SIZE = 12;

const profileSections = [
  { key: 'expertise', title: 'Area of Expertise', Icon: Stethoscope },
  // { key: 'qualifications', title: 'Education & Training', Icon: GraduationCap },
  { key: 'professional_experience', title: 'Professional Experience', Icon: BriefcaseBusiness },
  { key: 'awards_recognition', title: 'Awards & Recognition', Icon: Award },
  { key: 'conferences_workshops', title: 'Conferences & Workshops', Icon: BookOpen },
  { key: 'fellowship_memberships', title: 'Fellowship & Membership', Icon: ShieldCheck },
  { key: 'research_publications', title: 'Research & Publications', Icon: FileText },
  // { key: 'procedures_treatments', title: 'Procedures & Treatments', Icon: Stethoscope },
  // { key: 'languages', title: 'Languages', Icon: Languages },
];

function getList(value) {
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (typeof item === 'string') return item;
        return item?.title || item?.name || item?.value || '';
      })
      .filter(Boolean);
  }

  if (typeof value === 'string' && value.trim()) {
    return value.split(/\r?\n|,/).map((item) => item.trim()).filter(Boolean);
  }

  return [];
}

function getSpecialities(doctor) {
  const value = doctor?.speciality_names || doctor?.speciality_name || '';

  if (Array.isArray(value)) {
    return value
      .map((item) => typeof item === 'string' ? item : item?.name)
      .filter(Boolean);
  }

  return String(value).split(',').map((item) => item.trim()).filter(Boolean);
}

function DoctorProfile({ doctor, loading, onClose, onEdit, onDelete }) {
  if (!doctor && !loading) return null;

  const d = doctor || {};
  const specialities = getSpecialities(d);

  return (
    <div className="doctor-profile-overlay" onMouseDown={onClose}>
      <section
        className="doctor-profile-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Doctor profile"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="doctor-profile-header">
          <div>
            <span className="doctor-profile-kicker">Kaizen Oncology Hospital</span>
            <h2>Doctor Profile</h2>
          </div>

          <button
            type="button"
            className="doctor-profile-close"
            onClick={onClose}
            aria-label="Close profile"
          >
            <X size={19} />
          </button>
        </header>

        {loading ? (
          <div className="doctor-profile-loading">
            <span className="doctor-spinner" />
            Loading doctor details...
          </div>
        ) : (
          <>
            <div className="doctor-profile-content">
              <aside className="doctor-profile-sidebar">
                <div className="doctor-profile-name">
                  <span className="doctor-profile-label">MEDICAL PROFESSIONAL</span>
                  <h1>{d.name || 'Doctor Name'}</h1>
                  {d.designation && <p>{d.designation}</p>}
                </div>

                {specialities.length > 0 && (
                  <section className="doctor-profile-section">
                    <h3><Stethoscope size={16} /> Specialities</h3>
                    <ul>
                      {specialities.map((item, index) => (
                        <li key={`${item}-${index}`}>{item}</li>
                      ))}
                    </ul>
                  </section>
                )}

                <section className="doctor-profile-section">
                  <h3><MapPin size={16} /> Professional Details</h3>

                  {d.experience_years !== null &&
                    d.experience_years !== undefined &&
                    d.experience_years !== '' && (
                      <div className="doctor-profile-detail">
                        <BriefcaseBusiness size={16} />
                        <div>
                          <span>Experience</span>
                          <p>{d.experience_years} Years</p>
                        </div>
                      </div>
                    )}

                  {d.hospital_location && (
                    <div className="doctor-profile-detail">
                      <MapPin size={16} />
                      <div>
                        <span>Hospital / Location</span>
                        <p>{d.hospital_location}</p>
                      </div>
                    </div>
                  )}

                  {d.license_number && (
                    <div className="doctor-profile-detail">
                      <ShieldCheck size={16} />
                      <div>
                        <span>License Number</span>
                        <p>{d.license_number}</p>
                      </div>
                    </div>
                  )}
                </section>
                {/* EDUCATION & TRAINING - LEFT SIDE */}
{getList(d.qualifications).length > 0 && (
  <section className="doctor-profile-section">
    <h3>
      <GraduationCap size={16} />
      Education & Training
    </h3>

    <ul>
      {getList(d.qualifications).map((item, index) => (
        <li key={`qualification-${index}`}>{item}</li>
      ))}
    </ul>
  </section>
)}
                {/* LANGUAGES - LEFT SIDE */}
{getList(d.languages).length > 0 && (
  <section className="doctor-profile-section">
    <h3>
      <Languages size={16} />
      Languages
    </h3>

    <ul>
      {getList(d.languages).map((language, index) => (
        <li key={`language-${index}`}>{language}</li>
      ))}
    </ul>
  </section>
)}
{/* TREATMENTS & PROCEDURES - LEFT SIDE */}
{getList(d.procedures_treatments).length > 0 && (
  <section className="doctor-profile-section">
    <h3>
      <Stethoscope size={16} />
      Treatments & Procedures
    </h3>

    <ul>
      {getList(d.procedures_treatments).map((item, index) => (
        <li key={`procedure-${index}`}>{item}</li>
      ))}
    </ul>
  </section>
)}
{/* VIDEOS - LEFT SIDE */}
{getList(d.youtube_videos).length > 0 && (
  <section className="doctor-profile-section">
    <h3>
      <PlayCircle size={16} />
      Videos
    </h3>

    <div className="doctor-profile-video-list">
      {getList(d.youtube_videos).map((url, index) => (
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          key={`${url}-${index}`}
        >
          <PlayCircle size={15} />
          Watch Video {index + 1}
        </a>
      ))}
    </div>
  </section>
)}
              </aside>

              <main className="doctor-profile-main">
                <div className="doctor-profile-photo">
                  {d.photo ? (
                    <img src={mediaUrl(d.photo)} alt={d.name || 'Doctor'} />
                  ) : (
                    <div className="doctor-profile-photo-empty">
                      {d.name?.charAt(0) || 'D'}
                    </div>
                  )}
                </div>

                {d.about && (
                  <section className="doctor-profile-section">
                    <h3><FileText size={16} /> Profile</h3>
                    <div
                      className="doctor-profile-about"
                      dangerouslySetInnerHTML={{ __html: d.about }}
                    />
                  </section>
                )}

                {profileSections.map(({ key, title, Icon }) => {
                  const items = getList(d[key]);
                  if (!items.length) return null;

                  return (
                    <section className="doctor-profile-section" key={key}>
                      <h3><Icon size={16} /> {title}</h3>
                      <ul>
                        {items.map((item, index) => (
                          <li key={`${key}-${index}`}>{item}</li>
                        ))}
                      </ul>
                    </section>
                  );
                })}

              </main>
            </div>

            <footer className="doctor-profile-footer">
  <button
    type="button"
    className="doctor-profile-cancel"
    onClick={onClose}
  >
    Close
  </button>

  <button
    type="button"
    className="doctor-profile-edit"
    onClick={() => onEdit(d.id)}
  >
    <Pencil size={15} />
    Edit Doctor
  </button>

  <button
    type="button"
    className="doctor-profile-delete"
    onClick={() => onDelete(d)}
  >
    <Trash2 size={15} />
    Delete Doctor
  </button>
</footer>
          </>
        )}
      </section>
    </div>
  );
}

export default function DoctorList() {
  const [specialityId, setSpecialityId] = useState('');
  const [specialities, setSpecialities] = useState([]);

  const {
    rows,
    total,
    page,
    setPage,
    search,
    setSearch,
    onSearch,
    reload,
    limit,
    loading,
  } = usePagedList(
    doctorsApi,
    { speciality_id: specialityId || undefined },
    PAGE_SIZE
  );

  const [deleting, setDeleting] = useState(null);
  const [drawer, setDrawer] = useState({ open: false, id: null });
  const [viewDoctor, setViewDoctor] = useState(null);
  const [viewLoading, setViewLoading] = useState(false);

  useEffect(() => {
    specialitiesApi.options()
      .then((res) => setSpecialities(res.data.rows || []))
      .catch(() => toast.error('Unable to load specialities'));
  }, []);

  function openAdd() {
    setDrawer({ open: true, id: null });
  }

  function openEdit(id) {
    setViewDoctor(null);
    setDrawer({ open: true, id });
  }

  function closeDrawer() {
    setDrawer({ open: false, id: null });
  }

  async function openView(id) {
    setViewDoctor({});
    setViewLoading(true);

    try {
      const res = await doctorsApi.get(id);
      setViewDoctor(res.data.data);
    } catch (err) {
      setViewDoctor(null);
      toast.error(err.response?.data?.message || 'Unable to load doctor details');
    } finally {
      setViewLoading(false);
    }
  }

  async function confirmDelete() {
    if (!deleting) return;

    try {
      await doctorsApi.remove(deleting.id);
      toast.success('Doctor deleted');
      setDeleting(null);

      if (rows.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        reload();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  }

  return (
    <div className="doctor-page">
      <div className="doctor-toolbar">
        <form className="doctor-search-form" onSubmit={onSearch}>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search doctors..."
            aria-label="Search doctors"
          />

          <select
            value={specialityId}
            onChange={(event) => {
              setSpecialityId(event.target.value);
              setPage(1);
            }}
            aria-label="Filter by speciality"
          >
            <option value="">All specialities</option>
            {specialities.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>

          <button type="submit" className="doctor-search-button">
            Search
          </button>
        </form>

        <button type="button" className="doctor-add-button" onClick={openAdd}>
          <span>+</span> Add New
        </button>
      </div>

      {loading ? (
        <div className="doctor-empty-state">
          <span className="doctor-spinner" />
          Loading doctors...
        </div>
      ) : rows.length === 0 ? (
        <div className="doctor-empty-state">
          No doctors found. Try another search.
        </div>
      ) : (
        <div className="doctor-grid">
          {rows.map((doctor) => {
            const names = getSpecialities(doctor);
           

            return (
              <article className="doctor-card" key={doctor.id}>
                <button
                  type="button"
                  className="doctor-card-main"
                  onClick={() => openView(doctor.id)}
                  aria-label={`View ${doctor.name}`}
                >
                  <div className="doctor-card-image-wrap">
                    {doctor.photo ? (
                      <img
                        src={mediaUrl(doctor.photo)}
                        alt={doctor.name || 'Doctor'}
                        className="doctor-card-image"
                        loading="lazy"
                      />
                    ) : (
                      <div className="doctor-card-image-empty">
                        {doctor.name?.charAt(0) || 'D'}
                      </div>
                    )}
                  </div>

                  <div className="doctor-card-content">
                    <h3>{doctor.name}</h3>

                    {doctor.designation && (
                      <p className="doctor-designation">{doctor.designation}</p>
                    )}

                    <div className="doctor-speciality-tags">
                      {names.length ? (
                        names.slice(0, 2).map((name, index) => (
                          <span key={`${name}-${index}`}>{name}</span>
                        ))
                      ) : (
                        <span>Speciality not added</span>
                      )}
                      {names.length > 2 && <span>+{names.length - 2}</span>}
                    </div>

                    <div className="doctor-card-meta">
                      {doctor.experience_years !== null &&
                        doctor.experience_years !== undefined &&
                        doctor.experience_years !== '' && (
                          <span title={`${doctor.experience_years} years experience`}>
                            <BriefcaseBusiness size={16} />
                            {doctor.experience_years} Years
                          </span>
                        )}

                      {doctor.hospital_location && (
                        <span title={doctor.hospital_location}>
                          <MapPin size={16} />
                          {doctor.hospital_location}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
{/* 
                <div className="doctor-card-actions">
                  <button
                    type="button"
                    title="View"
                    aria-label={`View ${doctor.name}`}
                    onClick={() => openView(doctor.id)}
                  >
                    <Eye size={17} />
                  </button>

                  <button
                    type="button"
                    title="Edit"
                    aria-label={`Edit ${doctor.name}`}
                    onClick={() => openEdit(doctor.id)}
                  >
                    <Pencil size={16} />
                  </button>

                  <button
                    type="button"
                    className="doctor-delete-icon"
                    title="Delete"
                    aria-label={`Delete ${doctor.name}`}
                    onClick={() => setDeleting(doctor)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div> */}
              </article>
            );
          })}
        </div>
      )}

      <Pagination
        page={page}
        limit={limit}
        total={total}
        onPage={setPage}
      />

      <ConfirmDeleteModal
        title={deleting?.name}
        onClose={() => setDeleting(null)}
        onConfirm={confirmDelete}
      />

      <DoctorDrawer
        open={drawer.open}
        id={drawer.id}
        onClose={closeDrawer}
        onSaved={() => {
          closeDrawer();
          reload();
        }}
      />

      <DoctorProfile
  doctor={viewDoctor}
  loading={viewLoading}
  onClose={() => setViewDoctor(null)}
  onEdit={openEdit}
  onDelete={(doctor) => {
    setViewDoctor(null);
    setDeleting(doctor);
  }}
/>
    </div>
  );
}
















// import { useEffect, useState } from 'react';
// import { Pencil, Trash2 } from 'lucide-react';
// import toast from 'react-hot-toast';
// import DataTable from '../../components/DataTable';
// import Pagination from '../../components/Pagination';
// import ConfirmDeleteModal from '../../components/ConfirmDeleteModal';
// import { doctorsApi, specialitiesApi } from '../../api';
// import { usePagedList } from '../../hooks';
// import { clip, mediaUrl, yesNo } from '../../utils';
// import DoctorDrawer from './DoctorForm';

// const pillStyle = {
//   padding: '2px 10px',
//   borderRadius: 999,
//   background: '#e3f3f5',
//   color: '#0a5c64',
//   fontSize: 12,
//   whiteSpace: 'nowrap',
// };

// const iconBtn = {
//   width: '34px',
//   height: '34px',
//   display: 'inline-flex',
//   alignItems: 'center',
//   justifyContent: 'center',
//   borderRadius: '7px',
//   cursor: 'pointer',
// };

// export default function DoctorList() {
//   const [specialityId, setSpecialityId] = useState('');
//   const [specialities, setSpecialities] = useState([]);
//   const { rows, total, page, setPage, search, setSearch, onSearch, reload, limit } = usePagedList(doctorsApi, {
//     speciality_id: specialityId || undefined,
//   });
//   const [deleting, setDeleting] = useState(null);
//   const [drawer, setDrawer] = useState({ open: false, id: null });

//   function openAdd() {
//     setDrawer({ open: true, id: null });
//   }
//   function openEdit(id) {
//     setDrawer({ open: true, id });
//   }
//   function closeDrawer() {
//     setDrawer({ open: false, id: null });
//   }

//   useEffect(() => {
//     specialitiesApi.options().then((res) => setSpecialities(res.data.rows || [])).catch(() => {});
//   }, []);

//   async function confirmDelete() {
//     try {
//       await doctorsApi.remove(deleting.id);
//       toast.success('Doctor deleted');
//       setDeleting(null);
//       reload();
//     } catch (err) {
//       toast.error(err.response?.data?.message || 'Delete failed');
//     }
//   }

//   const columns = [
//     {
//       key: 'photo',
//       label: 'Photo',
//       render: (r) => (r.photo ? <img className="thumb" src={mediaUrl(r.photo)} alt="" /> : '—'),
//     },
//     { key: 'name', label: 'Name' },
//     { key: 'license_number', label: 'License' },
//     {
//       key: 'speciality_names',
//       label: 'Specialities',
//       render: (r) => {
//         // falls back to the old single field until the backend returns speciality_names
//         const names = r.speciality_names || r.speciality_name || '';
//         if (!names) return '—';
//         return (
//           <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
//             {names.split(',').map((n) => (
//               <span key={n.trim()} style={pillStyle}>
//                 {n.trim()}
//               </span>
//             ))}
//           </div>
//         );
//       },
//     },
//     { key: 'experience_years', label: 'Experience' },
//     {
//       key: 'expertise_text',
//       label: 'Area of Expertise',
//       render: (r) => <span className="cell-clip">{clip(r.expertise_text, 60)}</span>,
//     },
//     { key: 'hospital_location', label: 'Hospital / location' },
//     {
//       key: 'qualifications_text',
//       label: 'Education & Training',
//       render: (r) => <span className="cell-clip">{clip(r.qualifications_text, 60)}</span>,
//     },
//     {
//       key: 'languages_text',
//       label: 'Languages',
//       render: (r) => <span className="cell-clip">{clip(r.languages_text, 40)}</span>,
//     },
//     {
//       key: 'is_active',
//       label: 'Active',
//       render: (r) => <span className={`badge ${r.is_active ? '' : 'off'}`}>{yesNo(r.is_active)}</span>,
//     },
//     {
//       key: 'actions',
//       label: 'Actions',
//       render: (r) => (
//         <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
//           <button
//             type="button"
//             title="Edit Doctor"
//             aria-label={`Edit ${r.name}`}
//             onClick={() => openEdit(r.id)}
//             style={{
//               ...iconBtn,
//               border: '1px solid #cfe2e0',
//               background: '#f0f8f7',
//               color: '#064b50',
//             }}
//           >
//             <Pencil size={16} />
//           </button>

//           <button
//             type="button"
//             title="Delete Doctor"
//             aria-label={`Delete ${r.name}`}
//             onClick={() => setDeleting(r)}
//             style={{
//               ...iconBtn,
//               border: '1px solid #fecaca',
//               background: '#fef2f2',
//               color: '#dc2626',
//             }}
//           >
//             <Trash2 size={16} />
//           </button>
//         </div>
//       ),
//     },
//   ];

//   return (
//     <div>
//       <div className="doctor-toolbar">
//         <form className="toolbar" onSubmit={onSearch}>
//           <input
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//             placeholder="Search doctors..."
//           />

//           <select
//             value={specialityId}
//             onChange={(e) => {
//               setSpecialityId(e.target.value);
//               setPage(1);
//             }}
//           >
//             <option value="">All specialities</option>
//             {specialities.map((s) => (
//               <option key={s.id} value={s.id}>
//                 {s.name}
//               </option>
//             ))}
//           </select>

//           <button className="btn secondary" type="submit">
//             Search
//           </button>
//         </form>

//         <button className="btn" type="button" onClick={openAdd}>
//           + Add New
//         </button>
//       </div>

//       <DataTable columns={columns} rows={rows} />
//       <Pagination page={page} limit={limit} total={total} onPage={setPage} />
//       <ConfirmDeleteModal
//         title={deleting?.name}
//         onClose={() => setDeleting(null)}
//         onConfirm={confirmDelete}
//       />
//       <DoctorDrawer open={drawer.open} id={drawer.id} onClose={closeDrawer} onSaved={reload} />
//     </div>
//   );
// }




