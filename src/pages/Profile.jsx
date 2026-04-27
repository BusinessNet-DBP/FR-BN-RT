import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { MS_AUTH_URL } from "../config";

const BUSINESS_TYPES = [
  "restaurante","tienda","servicio","tecnologia",
  "educacion","salud","moda","entretenimiento","otro",
];

/* Normaliza cualquier formato de fecha a YYYY-MM-DD */
const toDateInput = (val) => {
  if (!val) return "";
  return val.toString().slice(0, 10);
};

/* Formatea fecha para mostrar en español */
const formatDate = (val) => {
  if (!val) return null;
  const [y, m, d] = val.toString().slice(0, 10).split("-");
  return new Date(parseInt(y), parseInt(m) - 1, parseInt(d))
    .toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" });
};

export default function Profile() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [profile, setProfile]     = useState(null);
  const [myId, setMyId]           = useState(null);
  const [saving, setSaving]       = useState(false);
  const [form, setForm]           = useState({});
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [error, setError]         = useState(null);
  const [showModal, setShowModal] = useState(false);

  const token = localStorage.getItem("access_token");

  /* ── Mi ID desde el token ── */
  useEffect(() => {
    if (!token) { navigate("/login"); return; }
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      setMyId(parseInt(payload.sub));
    } catch { navigate("/login"); }
  }, []);

  /* ── Cargar perfil ── */
  useEffect(() => {
    if (myId === null) return;
    const url = id ? `${MS_AUTH_URL}/users/${id}` : `${MS_AUTH_URL}/me`;
    axios.get(url, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => { setProfile(r.data); setForm(r.data); })
      .catch(() => setError("No se pudo cargar el perfil."));
  }, [id, myId]);

  const isOwnProfile = !id || parseInt(id) === myId;
  const isPersona    = profile?.tipo_cuenta === "persona";

  /* ── Abrir modal ── */
  const openModal = () => {
    setForm({
      ...profile,
      fecha_nacimiento: toDateInput(profile?.fecha_nacimiento),
    });
    setPhotoFile(null);
    setPhotoPreview(null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setPhotoFile(null);
    setPhotoPreview(null);
  };

  /* ── Foto ── */
  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  /* ── Guardar ── */
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
      setProfile(data);
      closeModal();
    } catch (e) {
      alert(e.response?.data?.detail || "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    navigate("/login");
  };

  /* ── Helpers visuales ── */
  const displayName = isPersona
    ? (profile?.nombre_completo || "Usuario")
    : (profile?.nombre_negocio  || "Empresa");

  const initials = displayName
    .split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();

  const avatarSrc = photoPreview
    || (profile?.foto_perfil ? `http://localhost:8001/${profile.foto_perfil}` : null);

  const memberYear = profile?.fecha_creacion
    ? new Date(profile.fecha_creacion).getFullYear() : "—";

  /* ════════════════════════════════════════════════════════════ */
  if (error)    return <div className="container mt-5 text-danger">{error}</div>;
  if (!profile) return <div className="container mt-5 text-muted">Cargando...</div>;

  return (
    <>
      {/* ── Navbar ── */}
      <nav className="navbar navbar-expand navbar-dark bg-primary px-4">
        <span className="navbar-brand fw-bold text-white">BusinessNet</span>
        <div className="ms-auto">
          <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>
            Cerrar sesión
          </button>
        </div>
      </nav>

      {/* ── Banner ── */}
      <div className="bg-primary bg-opacity-10 border-bottom" style={{ height: 160 }} />

      <div className="container py-4">

        {/* ── Avatar + identidad ── */}
        <div
          className="d-flex flex-wrap align-items-end justify-content-between gap-3 mb-3"
          style={{ marginTop: -56 }}
        >
          <div className="d-flex align-items-end gap-3">
            <div
              className="rounded-circle border border-3 border-white shadow overflow-hidden
                         bg-primary text-white d-flex align-items-center justify-content-center fw-bold fs-3"
              style={{ width: 96, height: 96, flexShrink: 0 }}
            >
              {avatarSrc
                ? <img src={avatarSrc} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : initials}
            </div>

            <div className="mb-1">
              <h2 className="fw-bold mb-0">{displayName}</h2>
              {isPersona
                ? <p className="text-muted small mb-1">@{(profile.email || "").split("@")[0]}</p>
                : <p className="text-muted small mb-1">🏢 {profile.tipo_negocio}</p>}
              <p className="text-muted small mb-0">
                {(profile.ubicacion || profile.direccion)
                  ? `📍 ${profile.ubicacion || profile.direccion} ` : ""}
              </p>
            </div>
          </div>

          {isOwnProfile
            ? <button className="btn btn-outline-secondary btn-sm px-3" onClick={openModal}>✏️ Editar perfil</button>
            : <button className="btn btn-primary btn-sm px-3">+ Conectar</button>}
        </div>

        {/* ── Bio ── */}
        <p className="text-muted mb-4" style={{ maxWidth: 520 }}>
          {(isPersona ? profile.biografia : profile.descripcion_negocio) || "Sin descripción aún."}
        </p>

        {/* ── Grid ── */}
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
                      {profile.fecha_nacimiento &&
                        <li>🎂 &nbsp; {formatDate(profile.fecha_nacimiento)}</li>}
                      {profile.ubicacion &&
                        <li>📍 &nbsp; {profile.ubicacion}</li>}
                    </>
                  ) : (
                    <>
                      {profile.tipo_negocio &&
                        <li>🏷️ &nbsp; {profile.tipo_negocio}</li>}
                      {profile.direccion &&
                        <li>📍 &nbsp; {profile.direccion}</li>}
                      {profile.telefono &&
                        <li>📞 &nbsp; {profile.telefono}</li>}
                    </>
                  )}
                </ul>
              </div>
            </div>

            {!isOwnProfile &&
              <button className="btn btn-outline-primary w-100">Enviar mensaje</button>}
          </div>

          {/* Publicaciones */}
          <div className="col-12 col-md-8">
            <div className="card shadow-sm border-0">
              <div className="card-body">
                <h6 className="text-uppercase text-muted fw-semibold small mb-3 border-bottom pb-2">
                  Publicaciones
                </h6>
                <div className="text-center py-5 text-muted">
                  <p className="fs-1 mb-2">📝</p>
                  <p className="small">Aún no hay publicaciones.</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      <footer className="text-center text-muted small py-4 mt-5 border-top">
        BusinessNet · Red social para emprendedores y negocios
      </footer>

      {/* ════════════════════════════════════════════════════════
          MODAL DE EDICIÓN
          ════════════════════════════════════════════════════════ */}
      {showModal && (
        <div className="modal d-block" style={{ background: "rgba(0,0,0,0.5)" }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content">

              <div className="modal-header">
                <h5 className="modal-title">Editar perfil</h5>
                <button className="btn-close" onClick={closeModal} />
              </div>

              <div className="modal-body">

                {/* Foto de perfil */}
                <div className="text-center mb-4">
                  <div
                    className="rounded-circle border overflow-hidden bg-primary text-white
                               d-flex align-items-center justify-content-center fw-bold fs-3 mx-auto mb-2"
                    style={{ width: 80, height: 80, cursor: "pointer" }}
                    onClick={() => document.getElementById("modalAvatarInput").click()}
                    title="Cambiar foto"
                  >
                    {(photoPreview || (profile?.foto_perfil ? `http://localhost:8001/${profile.foto_perfil}` : null))
                      ? <img
                          src={photoPreview || `http://localhost:8001/${profile.foto_perfil}`}
                          alt="avatar"
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      : initials}
                  </div>
                  <input id="modalAvatarInput" type="file" accept="image/*"
                    style={{ display: "none" }} onChange={handlePhoto} />
                  <small className="text-muted" style={{ cursor: "pointer" }}
                    onClick={() => document.getElementById("modalAvatarInput").click()}>
                    Cambiar foto de perfil
                  </small>
                </div>

                {/* Campos persona */}
                {isPersona ? (
                  <div className="d-flex flex-column gap-3">
                    <div>
                      <label className="form-label small fw-semibold">Nombre completo</label>
                      <input className="form-control" placeholder="Nombre completo"
                        value={form.nombre_completo || ""}
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
                      <textarea className="form-control" rows={3} placeholder="Cuéntanos sobre ti..."
                        value={form.biografia || ""}
                        onChange={e => setForm(f => ({ ...f, biografia: e.target.value }))} />
                    </div>
                  </div>
                ) : (
                  /* Campos empresa */
                  <div className="d-flex flex-column gap-3">
                    <div>
                      <label className="form-label small fw-semibold">Nombre del negocio</label>
                      <input className="form-control" placeholder="Nombre del negocio"
                        value={form.nombre_negocio || ""}
                        onChange={e => setForm(f => ({ ...f, nombre_negocio: e.target.value }))} />
                    </div>
                    <div>
                      <label className="form-label small fw-semibold">Tipo de negocio</label>
                      <select className="form-control"
                        value={form.tipo_negocio || ""}
                        onChange={e => setForm(f => ({ ...f, tipo_negocio: e.target.value }))}>
                        <option value="">Selecciona...</option>
                        {BUSINESS_TYPES.map(t => (
                          <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="form-label small fw-semibold">Dirección</label>
                      <input className="form-control" placeholder="Dirección física"
                        value={form.direccion || ""}
                        onChange={e => setForm(f => ({ ...f, direccion: e.target.value }))} />
                    </div>
                    <div>
                      <label className="form-label small fw-semibold">Teléfono</label>
                      <input className="form-control" placeholder="Número de contacto"
                        value={form.telefono || ""}
                        onChange={e => setForm(f => ({ ...f, telefono: e.target.value }))} />
                    </div>
                    <div>
                      <label className="form-label small fw-semibold">Descripción</label>
                      <textarea className="form-control" rows={3} placeholder="Describe tu negocio..."
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
    </>
  );
}