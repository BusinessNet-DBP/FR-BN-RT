import { useState, useRef } from "react";
import { postService } from "../services/api";
import { MS_POSTS_BASE, MS_AUTH_BASE } from "../config";

const CreatePost = ({ currentUser, onPostCreated }) => {
  const [texto, setTexto] = useState("");
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [mediaType, setMediaType] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
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
    setError("");
    setLoading(true);

    const previewActual = mediaPreview;
    const tipoActual = mediaType;

    try {
      const formData = new FormData();
      formData.append("contenido", texto);
      if (mediaFile) formData.append("media", mediaFile);

      let newPost;
      try {
        newPost = await postService.createPost(formData);
      } catch {
        // Fallback optimista si el backend falla
        newPost = {
          id: Date.now(),
          usuario_id: currentUser?.id || 0,
          contenido: texto,
          imagen_url: tipoActual === "image" ? previewActual : null,
          video_url: tipoActual === "video" ? previewActual : null,
          fecha_creacion: new Date().toISOString(),
          perfil: {
            nombre: currentUser?.nombre || currentUser?.username || "Tú",
            foto_url: currentUser?.foto_url || null,   // ✅ sin duplicado
          },
          likes_count: 0,
          comentarios: [],
          liked_by_me: false,
        };
      }

      onPostCreated(newPost);
      setTexto("");
      removeMedia();
    } finally {
      setLoading(false);
    }
  };

  const initials = (currentUser?.nombre || currentUser?.username || "U")[0].toUpperCase();

  // ✅ construir URL del avatar correctamente
  const fotoRaw = currentUser?.foto_url || null;
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
        <p style={{ color: "var(--bn-danger)", fontSize: "0.83rem", marginTop: "8px" }}>
          {error}
        </p>
      )}

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