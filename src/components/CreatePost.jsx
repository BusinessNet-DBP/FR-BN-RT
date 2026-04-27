import { useState, useRef } from "react";
import { postService } from "../services/api";

const CreatePost = ({ currentUser, onPostCreated }) => {
  const [texto, setTexto]               = useState("");
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
    // Validación: texto obligatorio siempre
    if (!texto.trim()) {
      setError("✍️ Agrega una descripción antes de publicar.");
      return;
    }

    setError("");
    setLoading(true);

    const previewActual = mediaPreview;
    const tipoActual    = mediaType;

    try {
      const formData = new FormData();
      formData.append("contenido", texto);
      if (mediaFile) formData.append("media", mediaFile);

      let newPost;
      try {
        newPost = await postService.createPost(formData);
      } catch {
        newPost = {
          id: Date.now(),
          usuario_id: currentUser?.id || 0,
          contenido: texto,
          imagen_url: tipoActual === "image" ? previewActual : null,
          video_url:  tipoActual === "video" ? previewActual : null,
          fecha_creacion: new Date().toISOString(),
          perfil: {
            nombre:   currentUser?.nombre || currentUser?.username || "Tú",
            foto_url: null,
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

  return (
    <div className="create-post-card">
      <div className="create-post-header">
        <div className="avatar">{initials}</div>
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

      {/* Mensaje de error */}
      {error && (
        <p style={{
          color: "var(--bn-danger)",
          fontSize: "0.83rem",
          marginTop: "8px",
          fontFamily: "'DM Sans', sans-serif",
        }}>
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
            <input
              type="file"
              accept="image/*"
              ref={imgRef}
              onChange={(e) => handleMedia(e, "image")}
            />
          </label>
          <label className="btn-media">
            🎥 Video
            <input
              type="file"
              accept="video/*"
              ref={vidRef}
              onChange={(e) => handleMedia(e, "video")}
            />
          </label>
        </div>

        <button
          className="btn-publish"
          onClick={handlePublish}
          disabled={loading}
        >
          {loading ? "Publicando..." : "Publicar"}
        </button>
      </div>
    </div>
  );
};

export default CreatePost;