import { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import DataTable from '../../components/DataTable';
import Pagination from '../../components/Pagination';
import ConfirmDeleteModal from '../../components/ConfirmDeleteModal';
import { specialitiesApi } from '../../api';
import { usePagedList } from '../../hooks';
import { clip, mediaUrl, yesNo } from '../../utils';
import SpecialityForm from './SpecialityForm';

function formatAilments(value) {
  if (!value) return '—';

  let items = value;

  // JSON string అయితే array గా convert చేయడం
  if (typeof items === 'string') {
    try {
      const parsed = JSON.parse(items);

      if (Array.isArray(parsed)) {
        items = parsed;
      } else {
        return items;
      }
    } catch {
      return items;
    }
  }

  if (!Array.isArray(items)) return '—';

  return items
    .map((item) => {
      if (typeof item === 'string') return item;

      return [
        item?.title,
        item?.description,
      ]
        .filter(Boolean)
        .join(' - ');
    })
    .filter(Boolean)
    .join(', ') || '—';
}

export default function SpecialityList() {
  const { rows, total, page, setPage, search, setSearch, onSearch, reload, limit } = usePagedList(specialitiesApi);
  const [deleting, setDeleting] = useState(null);
  const [drawer, setDrawer] = useState({ open: false, id: null });

  function openAdd() {
    setDrawer({ open: true, id: null });
  }
  function openEdit(id) {
    setDrawer({ open: true, id });
  }
  function closeDrawer() {
    setDrawer({ open: false, id: null });
  }

  async function confirmDelete() {
    try {
      await specialitiesApi.remove(deleting.id);
      toast.success('Speciality deleted');
      setDeleting(null);
      reload();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  }

  const columns = [
    { key: 'about_image', label: 'Image', render: (r) => r.about_image ? <img className="thumb" src={mediaUrl(r.about_image)} alt="" /> : '—' },
    { key: 'name', label: 'Speciality name' },
    { key: 'about_content', label: 'About', render: (r) => <span className="cell-clip">{clip(r.about_content)}</span> },
    { key: 'highlights_text', label: 'Key highlights', render: (r) => <span className="cell-clip">{clip(r.highlights_text)}</span> },
    { key: 'subspecialities_text', label: 'Sub specialities', render: (r) => <span className="cell-clip">{clip(r.subspecialities_text)}</span> },
    // { key: 'ailments_text', label: 'Ailments', render: (r) => <span className="cell-clip">{clip(r.ailments_text)}</span> },
    {
  key: 'ailments_text',
  label: 'Ailments',
  render: (r) => (
    <span className="cell-clip">
      {clip(
        formatAilments(
          r.ailments || r.ailments_text
        )
      )}
    </span>
  )
},
    { key: 'is_active', label: 'Active', render: (r) => <span className={`badge ${r.is_active ? '' : 'off'}`}>{yesNo(r.is_active)}</span> },
    {
  key: 'actions',
  label: 'Actions',
  render: (r) => (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }}
    >
      {/* EDIT ICON */}
      <button
        type="button"
        title="Edit Speciality"
        aria-label={`Edit ${r.name}`}
        onClick={() => openEdit(r.id)}
        style={{
          width: '34px',
          height: '34px',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid #cfe2e0',
          borderRadius: '7px',
          background: '#f0f8f7',
          color: '#064b50',
          cursor: 'pointer',
        }}
      >
        <Pencil size={16} />
      </button>

      {/* DELETE ICON */}
      <button
        type="button"
        title="Delete Speciality"
        aria-label={`Delete ${r.name}`}
        onClick={() => setDeleting(r)}
        style={{
          width: '34px',
          height: '34px',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid #fecaca',
          borderRadius: '7px',
          background: '#fef2f2',
          color: '#dc2626',
          cursor: 'pointer',
        }}
      >
        <Trash2 size={16} />
      </button>
    </div>
  ),
},
    // {
    //   key: 'actions',
    //   label: 'Actions',
    //   render: (r) => (
    //     <div className="actions">
    //       <button className="btn secondary small" type="button" onClick={() => openEdit(r.id)}>Edit</button>
    //       <button className="btn danger small" type="button" onClick={() => setDeleting(r)}>Delete</button>
    //     </div>
    //   ),
    // },
  ];

  return (
    <div>
      <div className="toolbar-row">

  {/* LEFT SIDE */}
  <form className="toolbar" onSubmit={onSearch}>
    <input
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      placeholder="Search specialities..."
    />

    <button className="btn secondary" type="submit">
      Search
    </button>
  </form>

  {/* RIGHT SIDE */}
  <button
    className="btn"
    type="button"
    onClick={openAdd}
  >
    + Add New
  </button>

</div>
      {/* <div className="page-head">
        <h1>Specialities</h1>
        <button className="btn" type="button" onClick={openAdd}>Add New</button>
      </div> */}
      {/* <form className="toolbar" onSubmit={onSearch}>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search specialities..." />
        <button className="btn secondary" type="submit">Search</button>
        <button className="btn" type="button" onClick={openAdd}>Add New</button>
      </form> */}
      {/* <DataTable columns={columns} rows={rows} /> */}
      <div className="speciality-table">
  <DataTable columns={columns} rows={rows} />
</div>
      <Pagination page={page} limit={limit} total={total} onPage={setPage} />
      <ConfirmDeleteModal title={deleting?.name} onClose={() => setDeleting(null)} onConfirm={confirmDelete} />
      <SpecialityForm open={drawer.open} id={drawer.id} onClose={closeDrawer} onSaved={reload} />
    </div>
  );
}
