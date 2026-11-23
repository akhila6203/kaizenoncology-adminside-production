import { useEffect, useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import DataTable from '../../components/DataTable';
import ConfirmDeleteModal from '../../components/ConfirmDeleteModal';
import { technologyDetailsApi } from '../../api';
import { clip, mediaUrl, yesNo } from '../../utils';
import TechnologyForm from './TechnologyForm';

const iconBtn = {
  width: '34px', height: '34px', display: 'inline-flex', alignItems: 'center',
  justifyContent: 'center', borderRadius: '7px', cursor: 'pointer',
};

export default function TechnologiesPage() {
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState('');
  const [deleting, setDeleting] = useState(null);
  const [drawer, setDrawer] = useState({ open: false, id: null });

  function reload() {
  technologyDetailsApi
    .list()
    .then((res) => {
      setRows(res.data?.data || []);
    })
    .catch((err) => {
      console.error(
        'Technologies loading error:',
        err.response?.data || err
      );

      setRows([]);
      toast.error('Failed to load technologies');
    });
}
  useEffect(reload, []);

  async function confirmDelete() {
    try {
      await technologyDetailsApi.deleteItem(deleting.id);
      toast.success('Technology deleted');
      setDeleting(null);
      reload();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  }

  const filtered = rows.filter((r) =>
    `${r.title} ${r.slug}`.toLowerCase().includes(search.trim().toLowerCase())
  );

  const columns = [
    { key: 'thumbnail', label: 'Image', render: (r) => (r.thumbnail ? <img className="thumb" src={mediaUrl(r.thumbnail)} alt="" /> : '—') },
   {
  key: 'title',
  label: 'Technology name',
  render: (r) => <strong>{r.title}</strong>,
},
{
  key: 'specialities',
  label: 'Specialities',
  render: (r) => (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 6,
        minWidth: 160,
      }}
    >
      {r.specialities?.length > 0 ? (
        r.specialities.map((name, index) => (
          <span
            key={`${r.id}-${index}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '4px 9px',
              borderRadius: 20,
              background: '#eef5f0',
              color: '#304b3c',
              fontSize: 11,
              fontWeight: 600,
              whiteSpace: 'nowrap',
            }}
          >
            {name}
          </span>
        ))
      ) : (
        <span style={{ color: '#94a3b8' }}>—</span>
      )}
    </div>
  ),
},
    { key: 'slug', label: 'Slug' },
    { key: 'short_description', label: 'Short description', render: (r) => <span className="cell-clip">{clip(r.short_description)}</span> },
    { key: 'is_published', label: 'Published', render: (r) => <span className={`badge ${r.is_published ? '' : 'off'}`}>{yesNo(r.is_published)}</span> },
    {
      key: 'actions',
      label: 'Actions',
      render: (r) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button" title="Edit Technology" aria-label={`Edit ${r.title}`}
            onClick={() => setDrawer({ open: true, id: r.id })}
            style={{ ...iconBtn, border: '1px solid #cfe2e0', background: '#f0f8f7', color: '#064b50' }}
          >
            <Pencil size={16} />
          </button>
          <button
            type="button" title="Delete Technology" aria-label={`Delete ${r.title}`}
            onClick={() => setDeleting(r)}
            style={{ ...iconBtn, border: '1px solid #fecaca', background: '#fef2f2', color: '#dc2626' }}
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="toolbar-row">
        <form className="toolbar" onSubmit={(e) => e.preventDefault()}>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search technologies..." />
        </form>
        <button className="btn" type="button" onClick={() => setDrawer({ open: true, id: null })}>
          + Add New
        </button>
      </div>

      <div className="speciality-table">
        <DataTable columns={columns} rows={filtered} />
      </div>

      <ConfirmDeleteModal title={deleting?.title} onClose={() => setDeleting(null)} onConfirm={confirmDelete} />
      <TechnologyForm open={drawer.open} id={drawer.id} onClose={() => setDrawer({ open: false, id: null })} onSaved={reload} />
    </div>
  );
}