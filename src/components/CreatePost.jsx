import { useState, useRef } from "react";
import { postService } from "../services/api";
import { MS_AUTH_BASE } from "../config";
import { verificarContenido, MENSAJE_POLITICA } from "../utils/contentFilter";

const CATEGORIAS = [
  { key: "general",    label: "General" },
  { key: "tecnologia", label: "💻 Tecnología" },
  { key: "finanzas",   label: "💰 Finanzas" },
  { key: "marketing",  label: "📣 Marketing" },
  { key: "salud",      label: "🏥 Salud" },
  { key: "educacion",  label: "📚 Educación" },
  { key: "retail",     label: "🛍️ Retail" },
  { key: "servicios",  label: "🔧 Servicios" },
  { key: "agro",       label: "🌱 Agro" },
  { key: "otro",       label: "✨ Otro" },
];

const CreatePost = ({ currentUser, onPostCreated }) => {
  const [texto, setTexto]               = useState("");
  const [categoria, setCategoria]       = useState("general");
  const [mediaFile, setMediaFile]       = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [mediaType, setMediaType]       = useState(null);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState("");
  const imgRef = useRef();
  const vidRef = useRef();

  const handleMedia = (e, tipo) => {
    const file = e.target.files[0];
    if (!file) return;
    setMediaFile(file);
    setMediaType(tipo);
    setMediaPreview(URL.createObjectURL(file));
    setError("");
  };

  const removeMedia = () => {
    setMediaFile(null);
    setMediaPreview(null);
    setMediaType(null);
    if (imgRef.current) imgRef.current.value = "";
    if (vidRef.current) vidRef.current.value = "";
  };

  const handlePublish = async () => {
    if (!texto.trim()) {
      setError("✍️ Agrega una descripción antes de publicar.");
      return;
    }

    const { prohibido } = verificarContenido(texto);
    if (prohibido) {
      setError(MENSAJE_POLITICA);
      return;
    }

    setError("");
    setLoading(true);
    const previewActual = mediaPreview;
    const tipoActual    = mediaType;

    try {
      const formData = new FormData();
      formData.append("contenido", texto);
      formData.append("categoria", categoria);
      if (mediaFile) formData.append("media", mediaFile);

      let newPost;
      try {
        newPost = await postService.createPost(formData);
      } catch {
        newPost = {
          id: Date.now(),
          usuario_id:     currentUser?.id || 0,
          contenido:      texto,
          categoria,
          imagen_url:     tipoActual === "image" ? previewActual : null,
          video_url:      tipoActual === "video" ? previewActual : null,
          fecha_creacion: new Date().toISOString(),
          perfil: {
            nombre:   currentUser?.nombre_completo || currentUser?.nombre ||
                      currentUser?.email?.split("@")[0] || "Tú",
            foto_url: currentUser?.foto_perfil || null,
          },
          likes_count: 0, comentarios: [], liked_by_me: false, vistas: 0,
        };
      }

      onPostCreated(newPost);
      setTexto("");
      setCategoria("general");
      removeMedia();
    } finally {
      setLoading(false);
    }
  };

  const initials = (
    currentUser?.nombre_completo ||
    currentUser?.nombre_negocio ||
    currentUser?.email || "U"
  )[0].toUpperCase();

  const fotoRaw   = currentUser?.foto_perfil || currentUser?.foto_url || null;
  const avatarUrl = fotoRaw
    ? (fotoRaw.startsWith("http") || fotoRaw.startsWith("blob")
        ? fotoRaw
        : `${MS_AUTH_BASE}/${fotoRaw.replace(/^\//, "")}`)
    : null;

  return (
    <div className="create-post-card">
      <div className="create-post-header">
        <div className="avatar">
          {avatarUrl
            ? <img src={avatarUrl} alt={initials}
                style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} />
            : initials}
        </div>
        <span style={{ color: "var(--bn-muted)", fontSize: "0.9rem" }}>
          ¿Qué está pasando en tu emprendimiento?
        </span>
      </div>

      <textarea
        className="create-post-textarea"
        placeholder="Comparte una idea, logro o aprendizaje..."
        value={texto}
        onChange={(e) => { setTexto(e.target.value); setError(""); }}
        rows={3}
        style={error ? { borderColor: "var(--bn-danger)" } : {}}
      />

      {error && (
        <div style={{
          background: "rgba(229,62,62,0.08)",
          border: "1px solid rgba(229,62,62,0.3)",
          borderRadius: 10,
          padding: "10px 14px",
          marginTop: 8,
          color: "var(--bn-danger)",
          fontSize: "0.83rem",
          fontFamily: "'DM Sans', sans-serif",
          lineHeight: 1.5,
        }}>
          {error}
        </div>
      )}

      <select
        className="categoria-select"
        value={categoria}
        onChange={(e) => setCategoria(e.target.value)}
      >
        {CATEGORIAS.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
      </select>

      {mediaPreview && (
        <div className="media-preview">
          {mediaType === "image"
            ? <img src={mediaPreview} alt="preview" />
            : <video src={mediaPreview} controls />}
          <button className="media-preview-remove" onClick={removeMedia}>✕</button>
        </div>
      )}

      <div className="create-post-footer">
        <div className="create-post-media">
          <label className="btn-media">
            🖼️ Imagen
            <input type="file" accept="image/*" ref={imgRef}
              onChange={(e) => handleMedia(e, "image")} />
          </label>
          <label className="btn-media">
            🎥 Video
            <input type="file" accept="video/*" ref={vidRef}
              onChange={(e) => handleMedia(e, "video")} />
          </label>
        </div>
        <button className="btn-publish" onClick={handlePublish} disabled={loading}>
          {loading ? "Publicando..." : "Publicar"}
        </button>
      </div>
    </div>
  );
};

export default CreatePost;