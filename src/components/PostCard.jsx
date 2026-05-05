import { useState } from "react";
import { postService } from "../services/api";
import { MS_POSTS_BASE, MS_AUTH_BASE } from "../config";

const timeAgo = (dateStr) => {
  if (!dateStr) return "";
  // Forzar parseo UTC agregando Z si no tiene info de zona horaria
  const str = dateStr.toString().includes("Z") || dateStr.toString().includes("+")
    ? dateStr
    : dateStr.toString().replace(" ", "T") + "Z";
  const date = new Date(str);
  if (isNaN(date.getTime())) return "";
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "ahora mismo";
  if (mins < 60) return `hace ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `hace ${hrs}h`;
  return `hace ${Math.floor(hrs / 24)}d`;
};

const getMediaUrl = (url) => {
  if (!url) return null;
  if (url.startsWith("http") || url.startsWith("blob")) return url;
  return `${MS_POSTS_BASE}/${url.replace(/^\//, "")}`;
};

const getAvatarUrl = (url) => {
  if (!url) return null;
  if (url.startsWith("http") || url.startsWith("blob")) return url;
  return `${MS_AUTH_BASE}/${url.replace(/^\//, "")}`;
};

const PostCard = ({ post, currentUserId, onDeleted }) => {
  const [liked, setLiked] = useState(post.liked_by_me || false);
  const [likesCount, setLikesCount] = useState(post.likes_count || 0);
  const [showComments, setShowComments] = useState(false);
  const [comentarios, setComentarios] = useState(post.comentarios || []);
  const [newComment, setNewComment] = useState("");
  const [sendingComment, setSendingComment] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const nombre = post.perfil?.nombre || post.username || "Usuario";
  const initials = nombre[0].toUpperCase();
  const isOwner = currentUserId && String(post.usuario_id) === String(currentUserId);

  const handleLike = async () => {
    const wasLiked = liked;
    setLiked(!wasLiked);
    setLikesCount((c) => wasLiked ? c - 1 : c + 1);
    try {
      await postService.likePost(post.id);
    } catch {
      setLiked(wasLiked);
      setLikesCount((c) => wasLiked ? c + 1 : c - 1);
    }
  };

  const handleComment = async () => {
    if (!newComment.trim()) return;
    setSendingComment(true);
    const texto = newComment;
    setNewComment("");
    try {
      let comentario;
      try {
        comentario = await postService.commentPost(post.id, texto);
      } catch {
        comentario = {
          id: Date.now(),
          contenido: texto,
          perfil: { nombre: "Tú" },
          fecha_creacion: new Date().toISOString(),
        };
      }
      setComentarios((prev) => [...prev, comentario]);
    } finally {
      setSendingComment(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("¿Eliminar esta publicación?")) return;
    setDeleting(true);
    try {
      await postService.deletePost(post.id);
      onDeleted(post.id);
    } catch {
      alert("No se pudo eliminar la publicación.");
      setDeleting(false);
    }
  };

  return (
    <div className="post-card">

      {/* ── Header ── */}
      <div className="post-header">
        <div className="avatar" style={{ width: 40, height: 40, minWidth: 40, borderRadius: "50%", overflow: "hidden", background: "var(--bn-accent)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "#fff", flexShrink: 0 }}>
          {post.perfil?.foto_url
            ? <img src={getAvatarUrl(post.perfil.foto_url)} alt={nombre}
              style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            : initials}
        </div>
        <div className="post-user-info">
          <p className="post-username">{nombre}</p>
          <p className="post-date">{timeAgo(post.fecha_creacion)}</p>
        </div>

        {/* Menú solo para el dueño */}
        {isOwner && (
          <div style={{ position: "relative", marginLeft: "auto" }}>
            <button
              onClick={() => setShowMenu((v) => !v)}
              style={{
                background: "transparent",
                border: "none",
                color: "var(--bn-muted)",
                fontSize: "1.2rem",
                cursor: "pointer",
                padding: "4px 8px",
                borderRadius: "6px",
              }}
            >
              ···
            </button>
            {showMenu && (
              <div style={{
                position: "absolute",
                right: 0,
                top: "100%",
                background: "var(--bn-surface2)",
                border: "1px solid var(--bn-border)",
                borderRadius: "10px",
                overflow: "hidden",
                zIndex: 10,
                minWidth: "140px",
              }}>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  style={{
                    width: "100%",
                    background: "transparent",
                    border: "none",
                    color: "var(--bn-danger)",
                    padding: "10px 16px",
                    textAlign: "left",
                    cursor: "pointer",
                    fontSize: "0.88rem",
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  🗑️ {deleting ? "Eliminando..." : "Eliminar post"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Contenido ── */}
      <div className="post-body">
        {post.contenido && <p className="post-text">{post.contenido}</p>}

        {post.imagen_url && !post.video_url && (
          <div className="post-media">
            <img src={getMediaUrl(post.imagen_url)} alt="publicación" />
          </div>
        )}

        {post.video_url && (
          <div className="post-media">
            <video src={getMediaUrl(post.video_url)} controls />
          </div>
        )}
      </div>

      {/* ── Acciones ── */}
      <div className="post-actions">
        <button className={`btn-action ${liked ? "liked" : ""}`} onClick={handleLike}>
          {liked ? "❤️" : "🤍"}
          {likesCount > 0 && <span>{likesCount}</span>}
        </button>

        <button className="btn-action" onClick={() => setShowComments((v) => !v)}>
          💬 {comentarios.length > 0 && <span>{comentarios.length}</span>}
        </button>
      </div>

      {/* ── Comentarios ── */}
      {showComments && (
        <div className="comments-section">
          {comentarios.map((c) => (
            <div className="comment-item" key={c.id}>
              <div className="avatar" style={{ width: 30, height: 30, fontSize: "0.75rem" }}>
                {(c.perfil?.nombre || "U")[0].toUpperCase()}
              </div>
              <div className="comment-bubble">
                <p className="comment-author">{c.perfil?.nombre || "Usuario"}</p>
                <p className="comment-text">{c.contenido}</p>
              </div>
            </div>
          ))}

          <div className="comment-input-row">
            <input
              className="comment-input"
              placeholder="Escribe un comentario..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleComment()}
            />
            <button
              className="btn-comment-send"
              onClick={handleComment}
              disabled={sendingComment}
            >
              ➤
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostCard;