import { useEffect, useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';

import toast from 'react-hot-toast';
import DataTable from '../../components/DataTable';
import Pagination from '../../components/Pagination';
import ConfirmDeleteModal from '../../components/ConfirmDeleteModal';
import { faqsApi, specialitiesApi } from '../../api';
import { usePagedList } from '../../hooks';
import { clip } from '../../utils';
import FaqForm, { PAGE_OPTIONS } from './FaqForm';

const pillStyle = {
  padding: '2px 10px',
  borderRadius: 999,
  background: '#e3f3f5',
  color: '#0a5c64',
  fontSize: 12,
  whiteSpace: 'nowrap',
};

const otherPillStyle = {
  ...pillStyle,
  background: '#fef3c7',
  color: '#92400e',
};

const iconBtn = {
  width: '34px',
  height: '34px',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '7px',
  cursor: 'pointer',
};

// "home,services" -> ["Home", "Services"]
const pageLabel = (value) => PAGE_OPTIONS.find((p) => p.value === value)?.label || value;

export default function FaqList() {
  // '' = all, 'other' = Other FAQs, or a speciality id
  const [filter, setFilter] = useState('');
  const [specialities, setSpecialities] = useState([]);

  const { rows, total, page, setPage, search, setSearch, onSearch, reload, limit } = usePagedList(faqsApi, {
    speciality_id: filter || undefined,
  });
  const [deleting, setDeleting] = useState(null);
  const [drawer, setDrawer] = useState({ open: false, id: null });

  useEffect(() => {
    specialitiesApi
      .options()
      .then((res) => setSpecialities(res.data.rows || []))
      .catch(() => {});
  }, []);

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
      await faqsApi.remove(deleting.id);
      toast.success('FAQ deleted');
      setDeleting(null);
      reload();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  }

  const columns = [
    {
      key: 'speciality_label',
      label: 'Speciality',
      render: (r) => {
        if (r.is_other) return <span style={otherPillStyle}>Other</span>;
        if (r.speciality_name) return <span style={pillStyle}>{r.speciality_name}</span>;
        return '—';
      },
    },
    {
      key: 'display_pages',
      label: 'Shown on pages',
      render: (r) => {
        if (!r.is_other || !r.display_pages) return '—';
        return (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {String(r.display_pages)
              .split(',')
              .filter(Boolean)
              .map((p) => (
                <span key={p} style={pillStyle}>
                  {pageLabel(p)}
                </span>
              ))}
          </div>
        );
      },
    },
    { key: 'question', label: 'Question', render: (r) => <span className="cell-clip">{clip(r.question, 80)}</span> },
    { key: 'answer', label: 'Answer', render: (r) => <span className="cell-clip">{clip(r.answer, 80)}</span> },
    {
      key: 'actions',
      label: 'Actions',
      render: (r) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            title="Edit FAQ"
            aria-label="Edit FAQ"
            onClick={() => openEdit(r.id)}
            style={{ ...iconBtn, border: '1px solid #cfe2e0', background: '#f0f8f7', color: '#064b50' }}
          >
            <Pencil size={16} />
          </button>

          <button
            type="button"
            title="Delete FAQ"
            aria-label="Delete FAQ"
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
      {/* SEARCH + FILTER + ADD NEW */}
      <div className="toolbar-row">
        <form className="toolbar" onSubmit={onSearch}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search FAQs..."
          />

          <select
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All specialities</option>
            {specialities.map((s) => (
              <option key={s.id} value={String(s.id)}>
                {s.name}
              </option>
            ))}
            <option value="other">Other</option>
          </select>

          <button className="btn secondary" type="submit">
            Search
          </button>
        </form>

        <button className="btn" type="button" onClick={openAdd}>
          Add New
        </button>
      </div>

      <DataTable columns={columns} rows={rows} />
      <Pagination page={page} limit={limit} total={total} onPage={setPage} />
      <ConfirmDeleteModal title={deleting?.question} onClose={() => setDeleting(null)} onConfirm={confirmDelete} />
      <FaqForm open={drawer.open} id={drawer.id} onClose={closeDrawer} onSaved={reload} />
    </div>
  );
}




