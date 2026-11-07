
import { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Pencil, Trash2, Plus, Search } from 'lucide-react';

import { partnersApi } from '../../api';
import { mediaUrl } from '../../utils';
import PartnerForm from './PartnerForm';

const PAGE_SIZE = 10;

export default function Partners() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');

  const [page, setPage] = useState(1);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editId, setEditId] = useState(null);

  const [deletingId, setDeletingId] = useState(null);

  // LOAD PARTNERS
  const load = useCallback(async () => {
    try {
      setLoading(true);

      const res = await partnersApi.list();

      const data = res?.data?.data;

      setItems(
        Array.isArray(data)
          ? data
          : Array.isArray(data?.items)
            ? data.items
            : []
      );
    } catch (error) {
      console.error('Partners loading error:', error);
      toast.error(
        error.response?.data?.message || 'Could not load partners'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // SEARCH
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    if (!q) return items;

    return items.filter((item) =>
      (item.name || '').toLowerCase().includes(q)
    );
  }, [items, search]);

  // PAGINATION
  const pages = Math.max(
    1,
    Math.ceil(filtered.length / PAGE_SIZE)
  );

  const current = Math.min(page, pages);

  const rows = filtered.slice(
    (current - 1) * PAGE_SIZE,
    current * PAGE_SIZE
  );

  function onSearch(e) {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  }

  function openAdd() {
    setEditId(null);
    setDrawerOpen(true);
  }

  function openEdit(id) {
    setEditId(id);
    setDrawerOpen(true);
  }

  function closeDrawer() {
    setDrawerOpen(false);
    setEditId(null);
  }

  // DELETE PARTNER
  async function onDelete(item) {
    if (!window.confirm(`Delete "${item.name}"?`)) {
      return;
    }

    try {
      setDeletingId(item.id);

      await partnersApi.remove(item.id);

      toast.success('Partner deleted successfully');

      await load();
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Delete failed'
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div>
    
     
      {/* SEARCH + ADD NEW */}
<div className="toolbar-row">

  {/* LEFT SIDE */}
  <form className="toolbar" onSubmit={onSearch}>
    <input
      type="text"
      placeholder="Search partners..."
      value={searchInput}
      onChange={(e) => setSearchInput(e.target.value)}
    />

    <button
      className="btn secondary"
      type="submit"
    >
      <Search size={16} />
      Search
    </button>
  </form>

  {/* RIGHT SIDE */}
  <button
    className="btn"
    type="button"
    onClick={openAdd}
  >
    <Plus size={17} />
    Add New
  </button>

</div>

      {/* PARTNERS TABLE */}
      <div className="card">
        <table>
          <thead>
            <tr>
              <th style={{ width: '120px' }}>Logo</th>
              <th>Partner Name</th>
               <th>Website URL</th>
              <th style={{ width: '130px' }}>Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', padding: 30 }}>
                  Loading partners...
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', padding: 30 }}>
                  No partners found.
                </td>
              </tr>
            ) : (
              rows.map((item) => (
                <tr key={item.id}>
                  {/* LOGO */}
                  <td>
                    <div
                      style={{
                        width: '75px',
                        height: '60px',
                        padding: '5px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        background: '#fff',
                      }}
                    >
                      <img
                        src={mediaUrl(item.logo)}
                        alt={item.name}
                        style={{
                          display: 'block',
                          width: '100%',
                          height: '100%',
                          maxWidth: '100%',
                          maxHeight: '100%',
                          objectFit: 'contain',
                        }}
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  </td>

                  {/* NAME */}
                  <td>
                    <span style={{ fontWeight: 600 }}>
                      {item.name}
                    </span>
                  </td>

                  {/* WEBSITE URL */}
                  <td>
                    {item.website_url ? (
                      <a
                        href={item.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          color: "#064b50",
                          textDecoration: "underline",
                          wordBreak: "break-word",
                        }}
                      >
                        {item.website_url}
                      </a>
                    ) : (
                      <span style={{ color: "#94a3b8" }}>
                        Not added
                      </span>
                    )}
                  </td>

                  {/* ACTION ICONS */}
                  <td>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                      }}
                    >
                      <button
                        type="button"
                        title="Edit partner"
                        aria-label={`Edit ${item.name}`}
                        onClick={() => openEdit(item.id)}
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

                      <button
                        type="button"
                        title="Delete partner"
                        aria-label={`Delete ${item.name}`}
                        disabled={deletingId === item.id}
                        onClick={() => onDelete(item)}
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
                          cursor: deletingId === item.id
                            ? 'not-allowed'
                            : 'pointer',
                          opacity: deletingId === item.id ? 0.5 : 1,
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      <div className="pagination">
        <span>
          Showing page {current} of {pages} ({filtered.length} records)
        </span>

        <div className="pager">
          <button
            className="btn secondary small"
            type="button"
            disabled={current <= 1}
            onClick={() => setPage(current - 1)}
          >
            Previous
          </button>

          <button
            className="btn secondary small"
            type="button"
            disabled={current >= pages}
            onClick={() => setPage(current + 1)}
          >
            Next
          </button>
        </div>
      </div>

      {/* ADD / EDIT DRAWER */}
      <PartnerForm
        open={drawerOpen}
        id={editId}
        onClose={closeDrawer}
        onSaved={load}
      />
    </div>
  );
}

