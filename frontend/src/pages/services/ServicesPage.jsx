import { useEffect, useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import DataTable from '../../components/DataTable';
import ConfirmDeleteModal from '../../components/ConfirmDeleteModal';
import { serviceContentApi } from '../../api';
import { clip, mediaUrl, yesNo } from '../../utils';
import { SERVICE_TYPES } from './serviceSchemas';
import ServiceForm from './ServiceForm';
import ServicePageForm from './ServicePageForm';

const iconBtn = {
  width: '34px', height: '34px', display: 'inline-flex', alignItems: 'center',
  justifyContent: 'center', borderRadius: '7px', cursor: 'pointer',
};

function Actions({ name, onEdit, onDelete }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <button type="button" title="Edit" aria-label={`Edit ${name}`} onClick={onEdit}
        style={{ ...iconBtn, border: '1px solid #cfe2e0', background: '#f0f8f7', color: '#064b50' }}>
        <Pencil size={16} />
      </button>
      <button type="button" title="Delete" aria-label={`Delete ${name}`} onClick={onDelete}
        style={{ ...iconBtn, border: '1px solid #fecaca', background: '#fef2f2', color: '#dc2626' }}>
        <Trash2 size={16} />
      </button>
    </div>
  );
}

export default function ServicesPage() {
  const [tab, setTab] = useState('services'); // 'services' | 'pages'
  const [services, setServices] = useState([]);
  const [pages, setPages] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');
  const [deleting, setDeleting] = useState(null); // { kind, row }
  const [serviceDrawer, setServiceDrawer] = useState({ open: false, id: null });
  const [pageDrawer, setPageDrawer] = useState({ open: false, id: null });

  function reload() {
    serviceContentApi.listServices().then((r) => setServices(r.data?.data || [])).catch(() => toast.error('Failed to load services'));
    serviceContentApi.listPages().then((r) => setPages(r.data?.data || [])).catch(() => toast.error('Failed to load pages'));
  }
  useEffect(reload, []);

  async function confirmDelete() {
    try {
      if (deleting.kind === 'service') await serviceContentApi.deleteService(deleting.row.id);
      else await serviceContentApi.deletePage(deleting.row.id);
      toast.success('Deleted');
      setDeleting(null);
      reload();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  }

  const q = search.trim().toLowerCase();
  const serviceRows = services.filter((r) => `${r.name} ${r.slug}`.toLowerCase().includes(q));
  const pageRows = pages.filter(
    (r) => (!filter || String(r.service_id) === String(filter)) && `${r.name} ${r.slug}`.toLowerCase().includes(q)
  );
  const pageServices = services.filter((s) => SERVICE_TYPES[s.slug]?.hasPages);

  const serviceColumns = [
    { key: 'icon_image', label: 'Image', render: (r) => (r.icon_image ? <img className="thumb" src={mediaUrl(r.icon_image)} alt="" /> : '—') },
    { key: 'sort_order', label: 'Order' },
    { key: 'name', label: 'Menu name' },
    { key: 'slug', label: 'URL', render: (r) => `/services/${r.slug}` },
    { key: 'description', label: 'Intro', render: (r) => <span className="cell-clip">{clip(r.description)}</span> },
    { key: 'is_active', label: 'Active', render: (r) => <span className={`badge ${r.is_active ? '' : 'off'}`}>{yesNo(r.is_active)}</span> },
    {
      key: 'actions', label: 'Actions',
      render: (r) => (
        <Actions name={r.name}
          onEdit={() => setServiceDrawer({ open: true, id: r.id })}
          onDelete={() => setDeleting({ kind: 'service', row: r })} />
      ),
    },
  ];

  const pageColumns = [
    { key: 'image', label: 'Image', render: (r) => (r.image ? <img className="thumb" src={mediaUrl(r.image)} alt="" /> : '—') },
    { key: 'service_name', label: 'Service' },
    { key: 'name', label: 'Page name' },
    { key: 'slug', label: 'URL', render: (r) => `/services/${SERVICE_TYPES[r.service_slug]?.urlBase || r.service_slug}/${r.slug}` },
    { key: 'short_description', label: 'Card text', render: (r) => <span className="cell-clip">{clip(r.short_description)}</span> },
    { key: 'is_active', label: 'Active', render: (r) => <span className={`badge ${r.is_active ? '' : 'off'}`}>{yesNo(r.is_active)}</span> },
    {
      key: 'actions', label: 'Actions',
      render: (r) => (
        <Actions name={r.name}
          onEdit={() => setPageDrawer({ open: true, id: r.id })}
          onDelete={() => setDeleting({ kind: 'page', row: r })} />
      ),
    },
  ];

  return (
    <div>
      <div className="toolbar-row">
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="button" className={`btn ${tab === 'services' ? '' : 'secondary'}`} onClick={() => setTab('services')}>
            Main services
          </button>
          <button type="button" className={`btn ${tab === 'pages' ? '' : 'secondary'}`} onClick={() => setTab('pages')}>
            Service pages
          </button>
        </div>
        <button
          className="btn"
          type="button"
          onClick={() => (tab === 'services' ? setServiceDrawer({ open: true, id: null }) : setPageDrawer({ open: true, id: null }))}
        >
          + Add New
        </button>
      </div>

      <form className="toolbar" onSubmit={(e) => e.preventDefault()} style={{ marginBottom: 12 }}>
        {tab === 'pages' && (
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="">All services</option>
            {pageServices.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        )}
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={tab === 'services' ? 'Search services...' : 'Search pages...'} />
      </form>

      <div className="speciality-table">
        {tab === 'services' ? (
          <DataTable columns={serviceColumns} rows={serviceRows} />
        ) : (
          <DataTable columns={pageColumns} rows={pageRows} />
        )}
      </div>

      <ConfirmDeleteModal title={deleting?.row?.name} onClose={() => setDeleting(null)} onConfirm={confirmDelete} />

      <ServiceForm
        open={serviceDrawer.open}
        id={serviceDrawer.id}
        rows={services}
        onClose={() => setServiceDrawer({ open: false, id: null })}
        onSaved={reload}
      />
      <ServicePageForm
        open={pageDrawer.open}
        id={pageDrawer.id}
        services={pageServices}
        defaultServiceId={filter}
        onClose={() => setPageDrawer({ open: false, id: null })}
        onSaved={reload}
      />
    </div>
  );
}