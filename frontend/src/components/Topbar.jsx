
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';

const pageTitles = [
  { path: '/dashboard', title: 'Dashboard' },
  // { path: '/patients', title: 'Patients' },
  { path: '/doctors', title: 'Doctors' },
  { path: '/specialities', title: 'Specialities' },
  // { path: '/partners', title: 'Partners' },
  { path: '/services', title: 'Services' },
  { path: '/hospitals', title: 'Hospitals' },
  { path: '/health-library', title: 'Health Library' },
  { path: '/our-stories', title: 'Our Stories' },
  { path: '/blogs', title: 'Blogs' },
  { path: '/faqs', title: 'FAQs' },
  { path: '/settings', title: 'Settings' },
];

export default function Topbar({ menuOpen, toggleMenu }) {
  const { admin, logout } = useAuth();
  const location = useLocation();

  const currentPage =
    pageTitles.find(
      (item) =>
        location.pathname === item.path ||
        location.pathname.startsWith(`${item.path}/`)
    )?.title || 'Dashboard';

  return (
    <header className="app-topbar">
      <div className="app-topbar-left">
        <button
          type="button"
          className="app-menu-button"
          onClick={toggleMenu}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={Boolean(menuOpen)}
        >
          {menuOpen ? <CloseIcon /> : <MenuIcon />}
        </button>

        <h1 className="app-page-title">{currentPage}</h1>
      </div>

      <div className="app-topbar-right">
        <span className="app-admin-name">
          {admin?.name || 'Admin'}
          {admin?.role ? ` (${admin.role})` : ''}
        </span>

        <button
          type="button"
          className="app-logout-button"
          onClick={logout}
        >
          Logout
        </button>
      </div>
    </header>
  );
}



// import { useAuth } from '../context/AuthContext';
// import MenuIcon from '@mui/icons-material/Menu';
// import CloseIcon from '@mui/icons-material/Close';

// export default function Topbar({ menuOpen, toggleMenu }) {
//   const { admin, logout } = useAuth();

//   return (
//     <header className="topbar">

//       <div className="topbar-left">

//         <button
//           type="button"
//           className="mobile-menu-btn"
//           onClick={toggleMenu}
//           aria-label={menuOpen ? 'Close menu' : 'Open menu'}
//           aria-expanded={Boolean(menuOpen)}
//         >
//           {menuOpen ? <CloseIcon /> : <MenuIcon />}
//         </button>

//         <strong className="topbar-title">
//           Content management
//         </strong>

//       </div>

//       <div className="actions">
//         <span className="admin-info">
//           {admin?.name} ({admin?.role})
//         </span>

//         <button
//           className="btn secondary small"
//           onClick={logout}
//           type="button"
//         >
//           Logout
//         </button>
//       </div>

//     </header>
//   );
// }


