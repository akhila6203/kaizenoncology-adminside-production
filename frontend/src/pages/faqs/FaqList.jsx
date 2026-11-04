import { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';

import toast from 'react-hot-toast';
import DataTable from '../../components/DataTable';
import Pagination from '../../components/Pagination';
import ConfirmDeleteModal from '../../components/ConfirmDeleteModal';
import { faqsApi } from '../../api';
import { usePagedList } from '../../hooks';
import { clip } from '../../utils';
import FaqForm from './FaqForm';

export default function FaqList() {
  const { rows, total, page, setPage, search, setSearch, onSearch, reload, limit } = usePagedList(faqsApi);
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
      await faqsApi.remove(deleting.id);
      toast.success('FAQ deleted');
      setDeleting(null);
      reload();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  }

  const columns = [
    { key: 'question', label: 'Question', render: (r) => <span className="cell-clip">{clip(r.question, 80)}</span> },
    { key: 'answer', label: 'Answer', render: (r) => <span className="cell-clip">{clip(r.answer, 80)}</span> },
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
        title="Edit FAQ"
        aria-label={`Edit FAQ`}
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
        title="Delete FAQ"
        aria-label={`Delete FAQ`}
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
  ];

  return (
    <div>
      {/* SEARCH + ADD NEW */}
<div className="toolbar-row">

  {/* LEFT SIDE */}
  <form className="toolbar" onSubmit={onSearch}>
    <input
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      placeholder="Search FAQs..."
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
    Add New
  </button>

</div>
      {/* <div className="page-head">
        <h1>FAQs</h1>
        <button className="btn" type="button" onClick={openAdd}>Add New</button>
      </div>
      <form className="toolbar" onSubmit={onSearch}>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search FAQs..." />
        <button className="btn secondary" type="submit">Search</button>
      </form> */}
      <DataTable columns={columns} rows={rows} />
      <Pagination page={page} limit={limit} total={total} onPage={setPage} />
      <ConfirmDeleteModal title={deleting?.question} onClose={() => setDeleting(null)} onConfirm={confirmDelete} />
      <FaqForm open={drawer.open} id={drawer.id} onClose={closeDrawer} onSaved={reload} />
    </div>
  );
}
