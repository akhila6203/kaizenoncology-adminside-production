
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Trash2, X, CalendarDays, Tag, Pencil } from "lucide-react";
import { specialitiesApi } from "../../api";

import Pagination from "../../components/Pagination";
import ConfirmDeleteModal from "../../components/ConfirmDeleteModal";

import { usePagedList } from "../../hooks";
import { editorialApi } from "../../api/editorial";
import { mediaUrl } from "../../utils";

import BlogForm from "./BlogForm";
import "./BlogList.css";

function descriptionPreview(row) {
  const html = row.content || row.short_description || "";

  return String(html)
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function formatDate(date) {
  if (!date) return "—";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function BlogList() {
  const api = useMemo(() => editorialApi("blogs"), []);

  // Blog page size: 12
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
  } = usePagedList(api, {}, 12);

  const [deleting, setDeleting] = useState(null);
  const [viewBlog, setViewBlog] = useState(null);
  const [specialities, setSpecialities] = useState([]);

  const [drawer, setDrawer] = useState({
    open: false,
    id: null,
  });

  useEffect(() => {
    let cancelled = false;

    async function loadSpecialities() {
      try {
        const response = await specialitiesApi.list({
          page: 1,
          limit: 100,
        });

        const payload = response.data;

        const options =
          payload?.rows ??
          payload?.data?.rows ??
          payload?.data ??
          [];

        if (!cancelled) {
          setSpecialities(
            Array.isArray(options) ? options : []
          );
        }
      } catch (error) {
        console.error(
          "Failed to load specialities:",
          error.response?.data || error
        );
      }
    }

    loadSpecialities();

    return () => {
      cancelled = true;
    };
  }, []);

  function openAdd() {
    setDrawer({ open: true, id: null });
  }

  function closeDrawer() {
    setDrawer({ open: false, id: null });
  }

  function openView(blog) {
    setViewBlog(blog);
  }

  function closeView() {
    setViewBlog(null);
  }

  function getSpecialityName(blog) {
    const speciality = specialities.find(
      (item) =>
        Number(item.id) === Number(blog.speciality_id)
    );

    return speciality?.name || "General";
  }

  async function confirmDelete() {
    if (!deleting) return;

    try {
      await api.remove(deleting.id);

      toast.success("Blog deleted successfully");

      setDeleting(null);
      setViewBlog(null);

      if (rows.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        reload();
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Delete failed"
      );
    }
  }

  return (
    <div className="blog-list-page">

      {/* SEARCH + ADD BLOG - EXISTING DESIGN */}
      <form
        onSubmit={onSearch}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          width: "100%",
          marginBottom: 18,
        }}
      >
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search blogs..."
          style={{
            width: 270,
            maxWidth: "35%",
            minWidth: 0,
            height: 40,
            padding: "9px 12px",
            borderRadius: 8,
            border: "1px solid #E1E9EF",
            outlineColor: "#13899B",
            boxSizing: "border-box",
          }}
        />

        <button
          type="submit"
          style={{
            padding: "10px 16px",
            height: 40,
            border: "none",
            borderRadius: 8,
            background: "#E7EDF2",
            color: "#153F4A",
            fontWeight: 600,
            cursor: "pointer",
            flexShrink: 0,
          }}
        >
          Search
        </button>

        <span
          style={{
            marginLeft: "auto",
            flexShrink: 0,
            whiteSpace: "nowrap",
            color: "#6B7C89",
            fontSize: 16,
          }}
        >
          {total} {total === 1 ? "Blog" : "Blogs"}
        </span>

        <button
          type="button"
          onClick={openAdd}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 7,
            padding: "10px 16px",
            height: 40,
            borderRadius: 8,
            border: "none",
            background: "#13899B",
            color: "#FFFFFF",
            fontSize: 16,
            fontWeight: 600,
            cursor: "pointer",
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}
        >
          <span style={{ fontSize: 19, lineHeight: 1 }}>+</span>
          Add New Blog
        </button>
      </form>

      {/* BLOG GRID */}
      {rows.length > 0 ? (
        <div className="blog-grid">
          {rows.map((blog) => {
            const published =
              Number(blog.is_published) === 1;

            const description = descriptionPreview(blog);

            return (
              <article
                className="blog-card"
                key={blog.id}
              >
                <button
                  type="button"
                  className="blog-card-view"
                  onClick={() => openView(blog)}
                  aria-label={`View ${blog.title}`}
                >
                  {/* BLOG IMAGE */}
                  <div className="blog-card-image-wrap">
                    {blog.thumbnail ? (
                      <img
                        src={mediaUrl(blog.thumbnail)}
                        alt={blog.title || "Blog image"}
                        className="blog-card-image"
                      />
                    ) : (
                      <div className="blog-card-no-image">
                        No Image Available
                      </div>
                    )}

                    <span
                      className={`blog-card-status ${
                        published ? "published" : "draft"
                      }`}
                    >
                      {published ? "Published" : "Draft"}
                    </span>
                  </div>

                  {/* BLOG CONTENT */}
                  <div className="blog-card-content">
                    <h3 className="blog-card-title">
                      {blog.title}
                    </h3>

                    <p className="blog-card-description">
                      {description || "No description available."}
                    </p>

                    <div className="blog-card-meta">
                      <span>
                        <Tag size={16} />
                        {getSpecialityName(blog)}
                      </span>

                      <span>
                        <CalendarDays size={16} />
                        {formatDate(blog.created_at)}
                      </span>
                    </div>

                  </div>
                </button>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="blog-empty">
          <h3>No blogs found</h3>
          <p>
            {search
              ? "Try searching with another keyword."
              : "Add your first blog to display it here."}
          </p>
        </div>
      )}

      {/* PAGINATION - SAME COMPONENT AS DOCTORS */}
      <Pagination
        page={page}
        limit={limit}
        total={total}
        onPage={setPage}
      />

      {/* COMPLETE BLOG VIEW */}
      {viewBlog && (
        <div
          className="blog-view-overlay"
          onClick={closeView}
        >
          <div
            className="blog-view-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="blog-view-header">
              <div>
                <span className="blog-view-eyebrow">
                  BLOG DETAILS
                </span>

                <h2>{viewBlog.title}</h2>
              </div>

              <button
                type="button"
                className="blog-view-close"
                onClick={closeView}
                aria-label="Close blog details"
              >
                <X size={22} />
              </button>
            </div>

            <div className="blog-view-body">
              {viewBlog.thumbnail && (
                <img
                  src={mediaUrl(viewBlog.thumbnail)}
                  alt={viewBlog.title || "Blog image"}
                  className="blog-view-image"
                />
              )}

              <div className="blog-view-meta">
                <span>
                  <Tag size={17} />
                  {getSpecialityName(viewBlog)}
                </span>

                <span>
                  <CalendarDays size={17} />
                  {formatDate(viewBlog.created_at)}
                </span>

                <span
                  className={
                    Number(viewBlog.is_published) === 1
                      ? "blog-view-published"
                      : "blog-view-draft"
                  }
                >
                  {Number(viewBlog.is_published) === 1
                    ? "Published"
                    : "Draft"}
                </span>
              </div>

              <div
                className="blog-view-description"
                dangerouslySetInnerHTML={{
                  __html:
                    viewBlog.content ||
                    viewBlog.short_description ||
                    "<p>No description available.</p>",
                }}
              />
            </div>

            {/* ONLY DELETE OPTION INSIDE VIEW */}
            {/* EDIT + DELETE BUTTONS */}
<div className="blog-view-footer">

  <button
    type="button"
    className="blog-view-edit"
    onClick={() => {
      const selectedId = viewBlog.id;

      setViewBlog(null);
      setDrawer({
        open: true,
        id: selectedId,
      });
    }}
  >
    <Pencil size={17} />
    Edit Blog
  </button>

  <button
  type="button"
  className="blog-view-delete"
  onClick={() => {
    setViewBlog(null);
    setDeleting(viewBlog);
  }}
>
  <Trash2 size={17} />
  Delete Blog
</button>

</div>
          </div>
        </div>
      )}

      {/* ADD / EDIT BLOG DRAWER */}
      <BlogForm
        open={drawer.open}
        id={drawer.id}
        onClose={closeDrawer}
        onSaved={reload}
      />

      {/* DELETE CONFIRMATION */}
      {deleting && (
        <ConfirmDeleteModal
          title={deleting.title}
          onClose={() => setDeleting(null)}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  );
}


















// import { useEffect, useMemo, useState } from "react";
// import toast from "react-hot-toast";
// import { Pencil, Trash2 } from "lucide-react";
// import { specialitiesApi } from "../../api";

// import DataTable from "../../components/DataTable";
// import Pagination from "../../components/Pagination";
// import ConfirmDeleteModal from "../../components/ConfirmDeleteModal";

// import { usePagedList } from "../../hooks";
// import { editorialApi } from "../../api/editorial";
// import { mediaUrl } from "../../utils";

// import BlogForm from "./BlogForm";

// function descriptionPreview(row) {
//   const html = row.content || row.short_description || "";

//   return String(html)
//     .replace(/<[^>]*>/g, " ")
//     .replace(/&nbsp;/gi, " ")
//     .replace(/&amp;/gi, "&")
//     .replace(/&lt;/gi, "<")
//     .replace(/&gt;/gi, ">")
//     .replace(/\s+/g, " ")
//     .trim();
// }

// export default function BlogList() {
//   const api = useMemo(() => editorialApi("blogs"), []);

//   const {
//     rows,
//     total,
//     page,
//     setPage,
//     search,
//     setSearch,
//     onSearch,
//     reload,
//     limit,
//   } = usePagedList(api);

//   const [deleting, setDeleting] = useState(null);
//   const [specialities, setSpecialities] = useState([]);
//   const [drawer, setDrawer] = useState({
//     open: false,
//     id: null,
//   });

//   useEffect(() => {
//   let cancelled = false;

//   async function loadSpecialities() {
//     try {
//       const response = await specialitiesApi.list({
//         page: 1,
//         limit: 100,
//       });

//       const payload = response.data;

//       const options =
//         payload?.rows ??
//         payload?.data?.rows ??
//         payload?.data ??
//         [];

//       if (!cancelled) {
//         setSpecialities(
//           Array.isArray(options) ? options : []
//         );
//       }
//     } catch (error) {
//       console.error(
//         "Failed to load specialities:",
//         error.response?.data || error
//       );
//     }
//   }

//   loadSpecialities();

//   return () => {
//     cancelled = true;
//   };
// }, []);

//   function openAdd() {
//     setDrawer({ open: true, id: null });
//   }

//   function openEdit(id) {
//     setDrawer({ open: true, id });
//   }

//   function closeDrawer() {
//     setDrawer({ open: false, id: null });
//   }

//   async function confirmDelete() {
//     if (!deleting) return;

//     try {
//       await api.remove(deleting.id);

//       toast.success("Blog deleted successfully");
//       setDeleting(null);
//       reload();
//     } catch (error) {
//       toast.error(
//         error.response?.data?.message || "Delete failed"
//       );
//     }
//   }

//   const columns = [
//     {
//       key: "thumbnail",
//       label: "Image",
//       render: (row) =>
//         row.thumbnail ? (
//           <img
//             src={mediaUrl(row.thumbnail)}
//             alt={row.title || ""}
//             style={{
//               width: 76,
//               height: 54,
//               objectFit: "cover",
//               borderRadius: 8,
//             }}
//           />
//         ) : (
//           "—"
//         ),
//     },
//     {
//       key: "title",
//       label: "Blog Name",
//       render: (row) => (
//         <span style={{ fontWeight: 600 }}>
//           {row.title}
//         </span>
//       ),
//     },
//     {
//   key: "speciality_id",
//   label: "Speciality",
//   render: (row) => {
//     const speciality = specialities.find(
//       (item) =>
//         Number(item.id) === Number(row.speciality_id)
//     );

//     return (
//       <span style={{ fontWeight: 500 }}>
//         {speciality?.name || "—"}
//       </span>
//     );
//   },
// },
//     {
//       key: "content",
//       label: "Description",
//       render: (row) => {
//         const description = descriptionPreview(row);

//         return (
//           <span
//             title={description}
//             style={{
//               display: "block",
//               maxWidth: 280,
//               overflow: "hidden",
//               textOverflow: "ellipsis",
//               whiteSpace: "nowrap",
//             }}
//           >
//             {description || "—"}
//           </span>
//         );
//       },
//     },
//     {
//       key: "created_at",
//       label: "Added Date",
//       render: (row) =>
//         row.created_at
//           ? new Date(row.created_at).toLocaleDateString(
//               "en-IN",
//               {
//                 day: "2-digit",
//                 month: "short",
//                 year: "numeric",
//               }
//             )
//           : "—",
//     },
//     {
//       key: "is_published",
//       label: "Status",
//       render: (row) => {
//         const published = Number(row.is_published) === 1;

//         return (
//           <span
//             style={{
//               color: published ? "#047857" : "#B45309",
//               fontWeight: 600,
//             }}
//           >
//             {published ? "Published" : "Draft"}
//           </span>
//         );
//       },
//     },
//     {
//       key: "actions",
//       label: "Actions",
//       render: (row) => (
//         <div
//           style={{
//             display: "flex",
//             alignItems: "center",
//             gap: 8,
//           }}
//         >
//           <button
//             type="button"
//             title="Edit Blog"
//             onClick={() => openEdit(row.id)}
//             style={{
//               width: 34,
//               height: 34,
//               display: "inline-flex",
//               alignItems: "center",
//               justifyContent: "center",
//               border: "1px solid #cfe2e0",
//               borderRadius: 7,
//               background: "#f0f8f7",
//               color: "#064b50",
//               cursor: "pointer",
//             }}
//           >
//             <Pencil size={16} />
//           </button>

//           <button
//             type="button"
//             title="Delete Blog"
//             onClick={() => setDeleting(row)}
//             style={{
//               width: 34,
//               height: 34,
//               display: "inline-flex",
//               alignItems: "center",
//               justifyContent: "center",
//               border: "1px solid #fecaca",
//               borderRadius: 7,
//               background: "#fef2f2",
//               color: "#dc2626",
//               cursor: "pointer",
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
  

      
// {/* SEARCH + ADD BLOG */}
// <form
//   onSubmit={onSearch}
//   style={{
//     display: "flex",
//     alignItems: "center",
//     gap: 10,
//     width: "100%",
//     marginBottom: 18,
//   }}
// >
//   <input
//     type="search"
//     value={search}
//     onChange={(event) => setSearch(event.target.value)}
//     placeholder="Search blogs..."
//     style={{
//       width: 270,
//       maxWidth: "35%",
//       minWidth: 0,
//       height: 40,
//       padding: "9px 12px",
//       borderRadius: 8,
//       border: "1px solid #E1E9EF",
//       outlineColor: "#13899B",
//       boxSizing: "border-box",
//     }}
//   />

//   <button
//     type="submit"
//     style={{
//       padding: "10px 16px",
//       height: 40,
//       border: "none",
//       borderRadius: 8,
//       background: "#E7EDF2",
//       color: "#153F4A",
//       fontWeight: 600,
//       cursor: "pointer",
//       flexShrink: 0,
//     }}
//   >
//     Search
//   </button>

//   <span
//     style={{
//       marginLeft: "auto",
//       flexShrink: 0,
//       whiteSpace: "nowrap",
//       color: "#6B7C89",
//       fontSize: 13,
//     }}
//   >
//     {total} {total === 1 ? "Blog" : "Blogs"}
//   </span>

//   <button
//     type="button"
//     onClick={openAdd}
//     style={{
//       display: "inline-flex",
//       alignItems: "center",
//       gap: 7,
//       padding: "10px 16px",
//       height: 40,
//       borderRadius: 8,
//       border: "none",
//       background: "#13899B",
//       color: "#FFFFFF",
//       fontSize: 13,
//       fontWeight: 600,
//       cursor: "pointer",
//       whiteSpace: "nowrap",
//       flexShrink: 0,
//     }}
//   >
//     <span style={{ fontSize: 19, lineHeight: 1 }}>+</span>
//     Add New Blog
//   </button>
// </form>


//         <DataTable columns={columns} rows={rows} />

//       <Pagination
//         page={page}
//         limit={limit}
//         total={total}
//         onPage={setPage}
//       />

//       {/* ADD / EDIT BLOG */}
//       <BlogForm
//         open={drawer.open}
//         id={drawer.id}
//         onClose={closeDrawer}
//         onSaved={reload}
//       />

//       {/* DELETE BLOG */}
//       {deleting && (
//         <ConfirmDeleteModal
//           title={deleting.title}
//           onClose={() => setDeleting(null)}
//           onConfirm={confirmDelete}
//         />
//       )}
//     </div>
//   );
// }

