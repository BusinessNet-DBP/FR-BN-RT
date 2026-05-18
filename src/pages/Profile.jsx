import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { MS_AUTH_URL, MS_POSTS_BASE, MS_AUTH_BASE } from "../config";
import { postService, authService } from "../services/api";
import NavbarComponent from "../components/Navbar";
import PostCard from "../components/PostCard";
import "./Feed.css";

const BUSINESS_TYPES = [
  "restaurante","tienda","servicio","tecnologia",
  "educacion","salud","moda","entretenimiento","otro",
];

const toDateInput  = (val) => val ? val.toString().slice(0, 10) : "";

const formatDate = (val) => {
  if (!val) return null;
  const [y, m, d] = val.toString().slice(0, 10).split("-");
  return new Date(parseInt(y), parseInt(m) - 1, parseInt(d))
    .toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" });
};

const normalizarPosts = (posts) =>
  posts.map(post => ({
    ...post,
    perfil: post.perfil ? {
      ...post.perfil,
      foto_url: post.perfil.foto_url || post.perfil.foto_perfil || null,
    } : post.perfil,
  }));

const getAvatarUrl = (url) => {
  if (!url) return null;
  if (url.startsWith("http") || url.startsWith("blob")) return url;
  return `${MS_AUTH_BASE}/${url.replace(/^\//, "")}`;
};

// ── Hook para cargar usuarios por ID ─────────────────────────────────────────
const useUsuarios = (ids) => {
  const [usuarios, setUsuarios] = useState({});

  useEffect(() => {
    if (!ids || ids.length === 0) return;
    ids.forEach((uid) => {
      setUsuarios((prev) => {
        if (prev[uid]) return prev;
        authService.getUser(uid)
          .then((u) => setUsuarios((p) => ({ ...p, [uid]: u })))
          .catch(() => {});
        return prev;
      });
    });
  }, [JSON.stringify(ids)]);

  return usuarios;
};

// ── Modal seguidores / siguiendo ─────────────────────────────────────────────
const FollowListModal = ({ title, userIds, onClose, onNavigate }) => {
  const usuarios = useUsuarios(userIds);

  const getNombre = (uid) => {
    const u = usuarios[uid];
    if (!u) return `Usuario #${uid}`;
    return u.tipo_cuenta === "empresa"
      ? (u.nombre_negocio || u.email)
      : (u.nombre_completo || u.email);
  };

  const getAvatar = (uid) => {
    const u = usuarios[uid];
    if (!u?.foto_perfil) return null;
    return getAvatarUrl(u.foto_perfil);
  };

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
      zIndex: 2000, display: "flex", alignItems: "center",
      justifyContent: "center", padding: 16,
    }} onClick={onClose}>
      <div style={{
        background: "#fff", borderRadius: 16, width: "100%", maxWidth: 380,
        maxHeight: "70vh", display: "flex", flexDirection: "column",
        overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
      }} onClick={(e) => e.stopPropagation()}>

        <div style={{ padding: "16px 20px", borderBottom: "1px solid #e5e7eb",
          display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h6 style={{ margin: 0, fontWeight: 700, fontSize: "1rem" }}>{title}</h6>
          <button onClick={onClose} style={{ background: "none", border: "none",
            fontSize: "1.1rem", cursor: "pointer", color: "#6b7280" }}>✕</button>
        </div>

        <div style={{ overflowY: "auto", padding: "12px 20px",
          display: "flex", flexDirection: "column", gap: 8 }}>
          {userIds.length === 0 ? (
            <p style={{ color: "#9ca3af", textAlign: "center",
              padding: "20px 0", margin: 0 }}>
              No hay usuarios aún.
            </p>
          ) : userIds.map((uid) => (
            <div key={uid}
              onClick={() => { onNavigate(uid); onClose(); }}
              style={{
                display: "flex", alignItems: "center", gap: 12,
                cursor: "pointer", padding: "10px 12px", borderRadius: 12,
                transition: "background 0.15s", border: "1px solid #e5e7eb",
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "#f3f4f6"}
              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
            >
              <div style={{
                width: 44, height: 44, borderRadius: "50%", flexShrink: 0,
                background: "#1a6cff", overflow: "hidden",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#fff", fontWeight: 700, fontSize: "1rem",
              }}>
                {getAvatar(uid)
                  ? <img src={getAvatar(uid)} alt=""
                      style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : getNombre(uid)[0].toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontWeight: 600, fontSize: "0.9rem",
                  color: "#1a1f36", whiteSpace: "nowrap", overflow: "hidden",
                  textOverflow: "ellipsis" }}>
                  {getNombre(uid)}
                </p>
                <p style={{ margin: 0, fontSize: "0.78rem", color: "#6b7599" }}>
                  {usuarios[uid]
                    ? (usuarios[uid].tipo_cuenta === "empresa" ? "🏢 Empresa" : "👤 Persona")
                    : "Cargando..."}
                </p>
              </div>
              <span style={{ color: "#1a6cff", fontSize: "0.8rem", flexShrink: 0 }}>→</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ── Página principal ──────────────────────────────────────────────────────────
export default function Profile() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [profile, setProfile]           = useState(null);
  const [myId, setMyId]                 = useState(null);
  const [saving, setSaving]             = useState(false);
  const [form, setForm]                 = useState({});
  const [photoFile, setPhotoFile]       = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [error, setError]               = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [userPosts, setUserPosts]       = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);

  const [siguiendo, setSiguiendo]             = useState(false);
  const [seguidoresCount, setSeguidoresCount] = useState(0);
  const [siguiendoCount, setSiguiendoCount]   = useState(0);
  const [seguidoresIds, setSeguidoresIds]     = useState([]);
  const [siguiendoIds, setSiguiendoIds]       = useState([]);
  const [showFollowers, setShowFollowers]     = useState(false);
  const [showFollowing, setShowFollowing]     = useState(false);

  const token = localStorage.getItem("access_token");

  useEffect(() => {
    if (!token) { navigate("/login"); return; }
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      setMyId(parseInt(payload.sub));
    } catch { navigate("/login"); }
  }, []);

  useEffect(() => {
    if (myId === null) return;
    const url = id ? `${MS_AUTH_URL}/users/${id}` : `${MS_AUTH_URL}/me`;
    axios.get(url, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => { setProfile(r.data); setForm(r.data); })
      .catch(() => setError("No se pudo cargar el perfil."));
  }, [id, myId]);

  useEffect(() => {
    if (myId === null) return;
    const targetId = id ? parseInt(id) : myId;

    postService.userStats(targetId)
      .then((res) => {
        setSiguiendo(res.siguiendo);
        setSeguidoresCount(res.seguidores_count);
        setSiguiendoCount(res.siguiendo_count);
      }).catch(() => {});

    postService.getSeguidores(targetId)
      .then(setSeguidoresIds).catch(() => {});

    postService.getSiguiendo(targetId)
      .then(setSiguiendoIds).catch(() => {});
  }, [id, myId]);

  useEffect(() => {
    if (!profile) return;
    const profileUserId = id ? parseInt(id) : myId;
    if (!profileUserId) return;
    setLoadingPosts(true);
    postService.getPosts()
      .then(allPosts => {
        const filtered = allPosts.filter(
          p => String(p.usuario_id) === String(profileUserId)
        );
        setUserPosts(normalizarPosts(filtered));
      })
      .catch(() => setUserPosts([]))
      .finally(() => setLoadingPosts(false));
  }, [profile, id, myId]);

  const isOwnProfile = !id || parseInt(id) === myId;
  const isPersona    = profile?.tipo_cuenta === "persona";

  const openModal = () => {
    setForm({ ...profile, fecha_nacimiento: toDateInput(profile?.fecha_nacimiento) });
    setPhotoFile(null); setPhotoPreview(null); setShowEditModal(true);
  };
  const closeModal = () => { setShowEditModal(false); setPhotoFile(null); setPhotoPreview(null); };

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const fd = new FormData();
      const fields = isPersona
        ? ["nombre_completo","fecha_nacimiento","biografia","ubicacion"]
        : ["nombre_negocio","tipo_negocio","descripcion_negocio","direccion","telefono"];
      fields.forEach(k => { if (form[k] != null && form[k] !== "") fd.append(k, form[k]); });
      if (photoFile) fd.append("foto_perfil", photoFile);
      const { data } = await axios.put(`${MS_AUTH_URL}/me`, fd, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
      });
      setProfile(data); closeModal();
    } catch (e) {
      alert(e.response?.data?.detail || "Error al guardar");
    } finally { setSaving(false); }
  };

  const handleFollowToggle = async () => {
    const targetId = id ? parseInt(id) : myId;
    try {
      const res = await postService.toggleFollow(targetId);
      setSiguiendo(res.siguiendo);
      setSeguidoresCount(res.seguidores_count);
      setSiguiendoCount(res.siguiendo_count);
      // Actualizar lista
      postService.getSeguidores(targetId).then(setSeguidoresIds).catch(() => {});
    } catch { alert("Error al seguir."); }
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    navigate("/login");
  };

  const displayName = isPersona
    ? (profile?.nombre_completo || "Usuario")
    : (profile?.nombre_negocio  || "Empresa");

  const initials = displayName.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
  const rawFoto   = profile?.foto_perfil || null;
  const avatarSrc = photoPreview || (rawFoto ? getAvatarUrl(rawFoto) : null);
  const memberYear = profile?.fecha_creacion
    ? new Date(profile.fecha_creacion).getFullYear() : "—";

  if (error)    return <div className="container mt-5 text-danger">{error}</div>;
  if (!profile) return <div className="container mt-5 text-muted">Cargando...</div>;

  return (
    <>
      <NavbarComponent username={displayName} onLogout={handleLogout} isProfileView={true} />

      <div className="bg-primary bg-opacity-10 border-bottom" style={{ height: 160 }} />

      <div className="container py-4">

        {/* Avatar + identidad */}
        <div className="d-flex flex-wrap align-items-end justify-content-between gap-3 mb-3"
          style={{ marginTop: -56 }}>
          <div className="d-flex align-items-end gap-3">
            <div className="rounded-circle border border-3 border-white shadow overflow-hidden
                           bg-primary text-white d-flex align-items-center justify-content-center fw-bold fs-3"
              style={{ width: 96, height: 96, flexShrink: 0 }}>
              {avatarSrc
                ? <img src={avatarSrc} alt="avatar"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : initials}
            </div>
            <div className="mb-1">
              <h2 className="fw-bold mb-0">{displayName}</h2>
              {isPersona
                ? <p className="text-muted small mb-1">@{(profile.email || "").split("@")[0]}</p>
                : <p className="text-muted small mb-1">🏢 {profile.tipo_negocio}</p>}
              {(profile.ubicacion || profile.direccion) && (
                <p className="text-muted small mb-0">
                  📍 {profile.ubicacion || profile.direccion}
                </p>
              )}
            </div>
          </div>

          <div className="d-flex gap-2 align-items-center">
            {isOwnProfile ? (
              <button className="btn btn-outline-secondary btn-sm px-3" onClick={openModal}>
                ✏️ Editar perfil
              </button>
            ) : (
              <button
                className={`btn btn-sm px-3 ${siguiendo ? "btn-outline-secondary" : "btn-primary"}`}
                onClick={handleFollowToggle}
              >
                {siguiendo ? "✓ Siguiendo" : "+ Seguir"}
              </button>
            )}
            {!isOwnProfile && (
              <button className="btn btn-outline-primary btn-sm px-3"
                onClick={() => navigate("/feed")}>
                ← Volver al feed
              </button>
            )}
          </div>
        </div>

        {/* Descripción */}
        <p className="text-muted mb-3" style={{ maxWidth: 520 }}>
          {(isPersona ? profile.biografia : profile.descripcion_negocio) || "Sin descripción aún."}
        </p>

        {/* Contadores */}
        <div className="d-flex gap-4 mb-4">
          <button onClick={() => setShowFollowers(true)} style={{
            background: "none", border: "none", padding: 0,
            cursor: "pointer", textAlign: "left",
          }}>
            <span style={{ fontWeight: 700, fontSize: "1.1rem", color: "#1a1f36" }}>
              {seguidoresCount}
            </span>
            <span style={{ color: "#6b7599", fontSize: "0.88rem", marginLeft: 4 }}>
              seguidores
            </span>
          </button>
          <button onClick={() => setShowFollowing(true)} style={{
            background: "none", border: "none", padding: 0,
            cursor: "pointer", textAlign: "left",
          }}>
            <span style={{ fontWeight: 700, fontSize: "1.1rem", color: "#1a1f36" }}>
              {siguiendoCount}
            </span>
            <span style={{ color: "#6b7599", fontSize: "0.88rem", marginLeft: 4 }}>
              siguiendo
            </span>
          </button>
          <div>
            <span style={{ fontWeight: 700, fontSize: "1.1rem", color: "#1a1f36" }}>
              {userPosts.length}
            </span>
            <span style={{ color: "#6b7599", fontSize: "0.88rem", marginLeft: 4 }}>
              publicaciones
            </span>
          </div>
        </div>

        <div className="row g-4">

          {/* Sidebar */}
          <div className="col-12 col-md-4 d-flex flex-column gap-4">
            <div className="card shadow-sm border-0">
              <div className="card-body">
                <h6 className="text-uppercase text-muted fw-semibold small mb-3 border-bottom pb-2">
                  Información
                </h6>
                <ul className="list-unstyled mb-0 small text-muted d-flex flex-column gap-2">
                  <li>✉️ &nbsp; {profile.email}</li>
                  <li>📅 &nbsp; Miembro desde <strong className="text-dark">{memberYear}</strong></li>
                  {isPersona ? (
                    <>
                      {profile.fecha_nacimiento && <li>🎂 &nbsp; {formatDate(profile.fecha_nacimiento)}</li>}
                      {profile.ubicacion        && <li>📍 &nbsp; {profile.ubicacion}</li>}
                    </>
                  ) : (
                    <>
                      {profile.tipo_negocio && <li>🏷️ &nbsp; {profile.tipo_negocio}</li>}
                      {profile.direccion    && <li>📍 &nbsp; {profile.direccion}</li>}
                      {profile.telefono     && <li>📞 &nbsp; {profile.telefono}</li>}
                    </>
                  )}
                </ul>
              </div>
            </div>
          </div>

          {/* Publicaciones */}
          <div className="col-12 col-md-8">
            <div className="card shadow-sm border-0">
              <div className="card-body">
                <h6 className="text-uppercase text-muted fw-semibold small mb-3 border-bottom pb-2">
                  Publicaciones {userPosts.length > 0 &&
                    <span className="badge bg-secondary ms-1">{userPosts.length}</span>}
                </h6>

                {loadingPosts ? (
                  <div className="text-center py-4 text-muted">
                    <div className="spinner-border spinner-border-sm me-2" role="status" />
                    Cargando publicaciones...
                  </div>
                ) : userPosts.length === 0 ? (
                  <div className="text-center py-5 text-muted">
                    <p className="fs-1 mb-2">📝</p>
                    <p className="small">Aún no hay publicaciones.</p>
                    {isOwnProfile && (
                      <Link to="/feed" className="btn btn-outline-primary btn-sm mt-2">
                        Ir al feed a publicar
                      </Link>
                    )}
                  </div>
                ) : (
                  userPosts.map(post => (
                    <PostCard
                      key={post.id}
                      post={post}
                      currentUserId={myId}
                      onDeleted={(postId) =>
                        setUserPosts(prev => prev.filter(p => p.id !== postId))}
                      onUpdated={(updated) =>
                        setUserPosts(prev => prev.map(p => p.id === updated.id ? updated : p))}
                    />
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className="text-center text-muted small py-4 mt-5 border-top">
        BusinessNet · Red social para emprendedores y negocios
      </footer>

      {/* Modal edición perfil */}
      {showEditModal && (
        <div className="modal d-block" style={{ background: "rgba(0,0,0,0.5)" }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Editar perfil</h5>
                <button className="btn-close" onClick={closeModal} />
              </div>
              <div className="modal-body">
                <div className="text-center mb-4">
                  <div className="rounded-circle border overflow-hidden bg-primary text-white
                                 d-flex align-items-center justify-content-center fw-bold fs-3 mx-auto mb-2"
                    style={{ width: 80, height: 80, cursor: "pointer" }}
                    onClick={() => document.getElementById("modalAvatarInput").click()}>
                    {(photoPreview || rawFoto)
                      ? <img src={photoPreview || getAvatarUrl(rawFoto)} alt="avatar"
                          style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      : initials}
                  </div>
                  <input id="modalAvatarInput" type="file" accept="image/*"
                    style={{ display: "none" }} onChange={handlePhoto} />
                  <small className="text-muted" style={{ cursor: "pointer" }}
                    onClick={() => document.getElementById("modalAvatarInput").click()}>
                    Cambiar foto de perfil
                  </small>
                </div>

                {isPersona ? (
                  <div className="d-flex flex-column gap-3">
                    <div>
                      <label className="form-label small fw-semibold">Nombre completo</label>
                      <input className="form-control" value={form.nombre_completo || ""}
                        onChange={e => setForm(f => ({ ...f, nombre_completo: e.target.value }))} />
                    </div>
                    <div>
                      <label className="form-label small fw-semibold">Fecha de nacimiento</label>
                      <input className="form-control" type="date"
                        value={toDateInput(form.fecha_nacimiento)}
                        onChange={e => setForm(f => ({ ...f, fecha_nacimiento: e.target.value }))} />
                    </div>
                    <div>
                      <label className="form-label small fw-semibold">Ubicación</label>
                      <input className="form-control" placeholder="Ciudad o país"
                        value={form.ubicacion || ""}
                        onChange={e => setForm(f => ({ ...f, ubicacion: e.target.value }))} />
                    </div>
                    <div>
                      <label className="form-label small fw-semibold">Biografía</label>
                      <textarea className="form-control" rows={3}
                        value={form.biografia || ""}
                        onChange={e => setForm(f => ({ ...f, biografia: e.target.value }))} />
                    </div>
                  </div>
                ) : (
                  <div className="d-flex flex-column gap-3">
                    <div>
                      <label className="form-label small fw-semibold">Nombre del negocio</label>
                      <input className="form-control" value={form.nombre_negocio || ""}
                        onChange={e => setForm(f => ({ ...f, nombre_negocio: e.target.value }))} />
                    </div>
                    <div>
                      <label className="form-label small fw-semibold">Tipo de negocio</label>
                      <select className="form-control" value={form.tipo_negocio || ""}
                        onChange={e => setForm(f => ({ ...f, tipo_negocio: e.target.value }))}>
                        <option value="">Selecciona...</option>
                        {BUSINESS_TYPES.map(t => (
                          <option key={t} value={t}>
                            {t.charAt(0).toUpperCase() + t.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="form-label small fw-semibold">Dirección</label>
                      <input className="form-control" value={form.direccion || ""}
                        onChange={e => setForm(f => ({ ...f, direccion: e.target.value }))} />
                    </div>
                    <div>
                      <label className="form-label small fw-semibold">Teléfono</label>
                      <input className="form-control" value={form.telefono || ""}
                        onChange={e => setForm(f => ({ ...f, telefono: e.target.value }))} />
                    </div>
                    <div>
                      <label className="form-label small fw-semibold">Descripción</label>
                      <textarea className="form-control" rows={3}
                        value={form.descripcion_negocio || ""}
                        onChange={e => setForm(f => ({ ...f, descripcion_negocio: e.target.value }))} />
                    </div>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button className="btn btn-outline-secondary" onClick={closeModal}>Cancelar</button>
                <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                  {saving ? "Guardando…" : "Guardar cambios"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal seguidores */}
      {showFollowers && (
        <FollowListModal
          title={`Seguidores · ${seguidoresCount}`}
          userIds={seguidoresIds}
          onClose={() => setShowFollowers(false)}
          onNavigate={(uid) => navigate(`/profile/${uid}`)}
        />
      )}

      {/* Modal siguiendo */}
      {showFollowing && (
        <FollowListModal
          title={`Siguiendo · ${siguiendoCount}`}
          userIds={siguiendoIds}
          onClose={() => setShowFollowing(false)}
          onNavigate={(uid) => navigate(`/profile/${uid}`)}
        />
      )}
    </>
  );
}
