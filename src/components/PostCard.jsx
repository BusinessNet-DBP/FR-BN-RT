import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { postService } from "../services/api";
import { MS_POSTS_BASE, MS_AUTH_BASE } from "../config";
import { verificarContenido, MENSAJE_POLITICA } from "../utils/contentFilter";

const CATEGORIAS_LABEL = {
  general: "General", tecnologia: "💻 Tecnología", finanzas: "💰 Finanzas",
  marketing: "📣 Marketing", salud: "🏥 Salud", educacion: "📚 Educación",
  retail: "🛍️ Retail", servicios: "🔧 Servicios", agro: "🌱 Agro", otro: "✨ Otro",
};

const timeAgo = (dateStr) => {
  if (!dateStr) return "";
  const str = dateStr.toString().includes("Z") || dateStr.toString().includes("+")
    ? dateStr : dateStr.toString().replace(" ", "T") + "Z";
  const date = new Date(str);
  if (isNaN(date.getTime())) return "";
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return "ahora mismo";
  if (mins < 60) return `hace ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `hace ${hrs}h`;
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

// ── Aviso de política ─────────────────────────────────────────────────────────
const AvisoPolitica = ({ onClose }) => (
  <div style={{
    background: "rgba(229,62,62,0.08)",
    border: "1px solid rgba(229,62,62,0.3)",
    borderRadius: 10, padding: "10px 14px",
    marginBottom: 8,
    color: "#e53e3e", fontSize: "0.83rem",
    fontFamily: "'DM Sans', sans-serif",
    lineHeight: 1.5,
    display: "flex", alignItems: "flex-start", gap: 8,
  }}>
    <span style={{ flexShrink: 0 }}>⚠️</span>
    <span style={{ flex: 1 }}>{MENSAJE_POLITICA.replace("⚠️ ", "")}</span>
    <button onClick={onClose} style={{
      background: "none", border: "none", color: "#e53e3e",
      cursor: "pointer", fontSize: "1rem", flexShrink: 0, padding: 0,
    }}>✕</button>
  </div>
);

// ── Comentario individual ─────────────────────────────────────────────────────
const ComentarioItem = ({ comentario: c, postId, postOwnerId, currentUserId, onDeleted }) => {
  const [likes, setLikes]         = useState(c.likes_count || 0);
  const [liked, setLiked]         = useState(c.liked_by_me || false);
  const [showReply, setShowReply] = useState(false);
  const [replies, setReplies]     = useState(c.respuestas || []);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending]     = useState(false);
  const [avisoReply, setAvisoReply] = useState(false);

  const canDelete = String(c.usuario_id) === String(currentUserId) ||
                    String(postOwnerId)   === String(currentUserId);

  const handleLike = async () => {
    const was = liked;
    setLiked(!was);
    setLikes((n) => was ? n - 1 : n + 1);
    try { await postService.likeComment(postId, c.id); }
    catch { setLiked(was); setLikes((n) => was ? n + 1 : n - 1); }
  };

  const handleReply = async () => {
    if (!replyText.trim()) return;

    const { prohibido } = verificarContenido(replyText);
    if (prohibido) {
      setAvisoReply(true);
      return;
    }

    setSending(true);
    const txt = replyText;
    setReplyText("");
    try {
      const r = await postService.replyComment(postId, c.id, txt);
      setReplies((prev) => [...prev, r]);
    } catch {
      setReplies((prev) => [...prev, {
        id: Date.now(), contenido: txt,
        perfil: { nombre: "Tú" }, usuario_id: currentUserId,
        fecha_creacion: new Date().toISOString(),
      }]);
    } finally { setSending(false); setShowReply(false); }
  };

  const handleDelete = async () => {
    try {
      await postService.deleteComment(postId, c.id);
      onDeleted(c.id);
    } catch { alert("No se pudo eliminar el comentario."); }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div className="comment-item">
        <div className="avatar" style={{
          width: 32, height: 32, minWidth: 32, fontSize: "0.8rem",
          borderRadius: "50%", background: "var(--bn-accent)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontWeight: 700, color: "#fff", flexShrink: 0,
        }}>
          {(c.perfil?.nombre || "U")[0].toUpperCase()}
        </div>

        <div className="comment-bubble" style={{ flex: 1 }}>
          <p className="comment-author">{c.perfil?.nombre || "Usuario"}</p>
          <p className="comment-text">{c.contenido}</p>
          <div style={{ display: "flex", gap: 14, marginTop: 6, alignItems: "center" }}>
            <button onClick={handleLike} style={{
              background: "none", border: "none", cursor: "pointer",
              fontSize: "0.78rem", color: liked ? "var(--bn-danger)" : "var(--bn-muted)",
              padding: 0, display: "flex", alignItems: "center", gap: 4,
              fontFamily: "'DM Sans', sans-serif",
            }}>
              {liked ? "❤️" : "🤍"} {likes > 0 && <span>{likes}</span>}
            </button>
            <button onClick={() => { setShowReply((v) => !v); setAvisoReply(false); }} style={{
              background: "none", border: "none", cursor: "pointer",
              fontSize: "0.78rem", color: "var(--bn-muted)", padding: 0,
              fontFamily: "'DM Sans', sans-serif",
            }}>
              💬 {showReply ? "Cancelar" : "Responder"}
            </button>
            {replies.length > 0 && (
              <span style={{ fontSize: "0.75rem", color: "var(--bn-muted)" }}>
                {replies.length} {replies.length === 1 ? "respuesta" : "respuestas"}
              </span>
            )}
          </div>
        </div>

        {canDelete && (
          <button onClick={handleDelete} title="Eliminar"
            style={{
              background: "transparent", border: "none", color: "var(--bn-muted)",
              cursor: "pointer", fontSize: "0.85rem", padding: "4px 6px",
              flexShrink: 0, transition: "color 0.2s",
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = "var(--bn-danger)"}
            onMouseLeave={(e) => e.currentTarget.style.color = "var(--bn-muted)"}
          >🗑️</button>
        )}
      </div>

      {/* Input respuesta */}
      {showReply && (
        <div style={{ marginLeft: 42 }}>
          {avisoReply && <AvisoPolitica onClose={() => setAvisoReply(false)} />}
          <div className="comment-input-row">
            <input
              className="comment-input"
              placeholder="Escribe una respuesta..."
              value={replyText}
              onChange={(e) => { setReplyText(e.target.value); setAvisoReply(false); }}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleReply()}
              autoFocus
            />
            <button className="btn-comment-send" onClick={handleReply} disabled={sending}>➤</button>
          </div>
        </div>
      )}

      {/* Respuestas */}
      {replies.length > 0 && (
        <div style={{ marginLeft: 42, display: "flex", flexDirection: "column", gap: 8 }}>
          {replies.map((r) => (
            <div key={r.id} className="comment-item">
              <div className="avatar" style={{
                width: 26, height: 26, minWidth: 26, fontSize: "0.72rem",
                borderRadius: "50%", background: "var(--bn-accent2)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontWeight: 700, color: "#fff", flexShrink: 0,
              }}>
                {(r.perfil?.nombre || "U")[0].toUpperCase()}
              </div>
              <div className="comment-bubble" style={{ flex: 1 }}>
                <p className="comment-author">{r.perfil?.nombre || "Usuario"}</p>
                <p className="comment-text">{r.contenido}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};


// ── PostCard ──────────────────────────────────────────────────────────────────
const PostCard = ({ post, currentUserId, onDeleted, onUpdated }) => {
  const navigate = useNavigate();

  const [liked, setLiked]               = useState(post.liked_by_me || false);
  const [likesCount, setLikesCount]     = useState(post.likes_count || 0);
  const [showModal, setShowModal]       = useState(false);
  const [comentarios, setComentarios]   = useState(post.comentarios || []);
  const [newComment, setNewComment]     = useState("");
  const [sending, setSending]           = useState(false);
  const [avisoPolitica, setAvisoPolitica] = useState(false);
  const [showMenu, setShowMenu]         = useState(false);
  const [editing, setEditing]           = useState(false);
  const [editText, setEditText]         = useState(post.contenido);
  const [editCategoria, setEditCategoria] = useState(post.categoria || "general");
  const [savingEdit, setSavingEdit]     = useState(false);
  const [deleting, setDeleting]         = useState(false);
  const [siguiendo, setSiguiendo]       = useState(false);
  const [vistas, setVistas]             = useState(post.vistas || 0);
  const viewedRef = useRef(false);
  const menuRef   = useRef();

  const nombre   = post.perfil?.nombre || "Usuario";
  const initials = nombre[0].toUpperCase();
  const isOwner  = currentUserId && String(post.usuario_id) === String(currentUserId);

  useEffect(() => {
    if (!isOwner && post.usuario_id && currentUserId) {
      postService.followStatus(post.usuario_id)
        .then((res) => setSiguiendo(res.siguiendo))
        .catch(() => {});
    }
  }, [post.usuario_id, isOwner, currentUserId]);

  useEffect(() => {
    if (!viewedRef.current) {
      viewedRef.current = true;
      postService.registerView(post.id).catch(() => {});
      setVistas((v) => v + 1);
    }
  }, [post.id]);

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setShowMenu(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    document.body.style.overflow = showModal ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [showModal]);

  const handleLike = async () => {
    const wasLiked = liked;
    setLiked(!wasLiked);
    setLikesCount((c) => wasLiked ? c - 1 : c + 1);
    try { await postService.likePost(post.id); }
    catch { setLiked(wasLiked); setLikesCount((c) => wasLiked ? c + 1 : c - 1); }
  };

  const handleComment = async () => {
    if (!newComment.trim()) return;

    const { prohibido } = verificarContenido(newComment);
    if (prohibido) {
      setAvisoPolitica(true);
      return;
    }

    setSending(true);
    const texto = newComment;
    setNewComment("");
    setAvisoPolitica(false);
    try {
      const c = await postService.commentPost(post.id, texto);
      setComentarios((prev) => [...prev, c]);
    } catch {
      setComentarios((prev) => [...prev, {
        id: Date.now(), contenido: texto,
        perfil: { nombre: "Tú" }, usuario_id: currentUserId,
        fecha_creacion: new Date().toISOString(),
        likes_count: 0, liked_by_me: false, respuestas: [],
      }]);
    } finally { setSending(false); }
  };

  const handleDelete = async () => {
    if (!window.confirm("¿Eliminar esta publicación?")) return;
    setDeleting(true);
    try { await postService.deletePost(post.id); onDeleted(post.id); }
    catch { alert("No se pudo eliminar."); setDeleting(false); }
  };

  const handleEdit = async () => {
    if (!editText.trim()) return;
    const { prohibido } = verificarContenido(editText);
    if (prohibido) {
      alert(MENSAJE_POLITICA);
      return;
    }
    setSavingEdit(true);
    try {
      const updated = await postService.editPost(post.id,
        { contenido: editText, categoria: editCategoria });
      if (onUpdated) onUpdated(updated);
      setEditing(false);
    } catch { alert("No se pudo editar."); }
    finally { setSavingEdit(false); }
  };

  const handleFollow = async () => {
    try {
      const res = await postService.toggleFollow(post.usuario_id);
      setSiguiendo(res.siguiendo);
    } catch { alert("Error al seguir usuario."); }
  };

  const goToProfile = () => navigate(`/profile/${post.usuario_id}`);

  return (
    <>
      <div className="post-card">

        {/* ── Header ── */}
        <div className="post-header">
          <div onClick={goToProfile} className="avatar" style={{
            width: 40, height: 40, minWidth: 40, borderRadius: "50%",
            overflow: "hidden", background: "var(--bn-accent)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 700, color: "#fff", flexShrink: 0, cursor: "pointer",
          }}>
            {post.perfil?.foto_url
              ? <img src={getAvatarUrl(post.perfil.foto_url)} alt={nombre}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              : initials}
          </div>

          <div className="post-user-info">
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <p className="post-username" onClick={goToProfile}
                style={{ cursor: "pointer" }}
                onMouseEnter={(e) => e.currentTarget.style.color = "var(--bn-accent)"}
                onMouseLeave={(e) => e.currentTarget.style.color = "var(--bn-text)"}
              >
                {nombre}
              </p>
              {!isOwner && (
                <button className="btn-follow" onClick={handleFollow}
                  style={siguiendo ? {
                    background: "var(--bn-surface2)",
                    borderColor: "var(--bn-border)",
                    color: "var(--bn-muted)",
                  } : {}}>
                  {siguiendo ? "✓ Siguiendo" : "+ Seguir"}
                </button>
              )}
            </div>
            <p className="post-date">{timeAgo(post.fecha_creacion)}</p>
          </div>

          {isOwner && (
            <div style={{ position: "relative", marginLeft: "auto" }} ref={menuRef}>
              <button className="btn-menu" onClick={() => setShowMenu((v) => !v)}>···</button>
              {showMenu && (
                <div className="post-menu">
                  <button className="post-menu-item"
                    onClick={() => { setEditing(true); setShowMenu(false); }}>
                    ✏️ Editar
                  </button>
                  <button className="post-menu-item danger"
                    onClick={handleDelete} disabled={deleting}>
                    🗑️ {deleting ? "Eliminando..." : "Eliminar"}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Edición ── */}
        {editing ? (
          <div className="post-body">
            <textarea
              className="create-post-textarea"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              rows={3}
            />
            <select className="categoria-select" value={editCategoria}
              onChange={(e) => setEditCategoria(e.target.value)}>
              {Object.entries(CATEGORIAS_LABEL).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
            <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
              <button className="btn-publish" onClick={handleEdit} disabled={savingEdit}>
                {savingEdit ? "Guardando..." : "Guardar"}
              </button>
              <button onClick={() => setEditing(false)} style={{
                background: "transparent", border: "1px solid var(--bn-border)",
                color: "var(--bn-muted)", padding: "9px 18px", borderRadius: "100px",
                cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: "0.88rem",
              }}>Cancelar</button>
            </div>
          </div>
        ) : (
          <div className="post-body">
            {post.categoria && post.categoria !== "general" && (
              <span className="categoria-badge">
                {CATEGORIAS_LABEL[post.categoria] || post.categoria}
              </span>
            )}
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
        )}

        {/* ── Acciones ── */}
        <div className="post-actions">
          <button className={`btn-action ${liked ? "liked" : ""}`} onClick={handleLike}>
            {liked ? "❤️" : "🤍"} {likesCount > 0 && <span>{likesCount}</span>}
          </button>
          <button className="btn-action" onClick={() => setShowModal(true)}>
            💬 {comentarios.length > 0 && <span>{comentarios.length}</span>}
          </button>
          <span className="post-views">👁️ {vistas}</span>
        </div>
      </div>

      {/* ── Modal comentarios ── */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: 580 }}>

            <div className="modal-header">
              <h3 className="modal-title">Comentarios</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>

            <div className="modal-body">
              {comentarios.length === 0 ? (
                <p style={{ color: "var(--bn-muted)", textAlign: "center",
                  padding: "20px 0", fontFamily: "'DM Sans', sans-serif" }}>
                  Sé el primero en comentar.
                </p>
              ) : (
                comentarios.map((c) => (
                  <ComentarioItem
                    key={c.id}
                    comentario={c}
                    postId={post.id}
                    postOwnerId={post.usuario_id}
                    currentUserId={currentUserId}
                    onDeleted={(cid) =>
                      setComentarios((prev) => prev.filter((x) => x.id !== cid))}
                  />
                ))
              )}
            </div>

            <div className="modal-footer">
              {avisoPolitica && (
                <AvisoPolitica onClose={() => setAvisoPolitica(false)} />
              )}
              <div className="comment-input-row">
                <input
                  className="comment-input"
                  placeholder="Escribe un comentario..."
                  value={newComment}
                  onChange={(e) => { setNewComment(e.target.value); setAvisoPolitica(false); }}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleComment()}
                  autoFocus
                />
                <button className="btn-comment-send"
                  onClick={handleComment} disabled={sending}>➤</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PostCard;