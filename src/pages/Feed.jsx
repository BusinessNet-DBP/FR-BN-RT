import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import './Feed.css';
import CreatePost from "../components/CreatePost";
import PostCard   from "../components/PostCard";
import { postService } from "../services/api";

const TABS = [
  { key: "recientes",  label: "🏠 Para ti" },
  { key: "siguiendo",  label: "👥 Siguiendo" },
  { key: "explorar",   label: "🔍 Explorar" },
];

const CATEGORIAS = [
  { key: "todos",       label: "Todos" },
  { key: "tecnologia",  label: "💻 Tecnología" },
  { key: "finanzas",    label: "💰 Finanzas" },
  { key: "marketing",   label: "📣 Marketing" },
  { key: "salud",       label: "🏥 Salud" },
  { key: "educacion",   label: "📚 Educación" },
  { key: "retail",      label: "🛍️ Retail" },
  { key: "servicios",   label: "🔧 Servicios" },
  { key: "agro",        label: "🌱 Agro" },
  { key: "otro",        label: "✨ Otro" },
];

const Feed = () => {
  const navigate  = useNavigate();
  const [posts, setPosts]             = useState([]);
  const [loading, setLoading]         = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab]     = useState("recientes");
  const [categoria, setCategoria]     = useState("todos");

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) { navigate("/login"); return; }
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      setCurrentUser({ ...payload, id: parseInt(payload.sub) });
    } catch { navigate("/login"); }
  }, [navigate]);

  const loadPosts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await postService.getPosts(
        activeTab,
        activeTab === "explorar" ? categoria : null
      );
      setPosts(data);
    } catch (e) {
      console.error("Error cargando posts:", e);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [activeTab, categoria]);

  useEffect(() => {
    if (currentUser) loadPosts();
  }, [currentUser, loadPosts]);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    navigate("/login");
  };

  const handlePostCreated  = (p) => setPosts((prev) => [p, ...prev]);
  const handlePostDeleted  = (id) => setPosts((prev) => prev.filter((p) => p.id !== id));
  const handlePostUpdated  = (updated) =>
    setPosts((prev) => prev.map((p) => p.id === updated.id ? updated : p));

  const username = currentUser?.username || currentUser?.email?.split("@")[0] || "Mi perfil";

  return (
    <div className="feed-wrapper">

      {/* ── Topbar ── */}
      <header className="feed-topbar">
        <span className="feed-topbar-logo">BusinessNet</span>

        {/* Tabs centrados */}
        <nav className="feed-tabs">
          {TABS.map((t) => (
            <button
              key={t.key}
              className={`feed-tab ${activeTab === t.key ? "active" : ""}`}
              onClick={() => { setActiveTab(t.key); setCategoria("todos"); }}
            >
              {t.label}
            </button>
          ))}
        </nav>

        <div className="feed-topbar-actions">
          <button className="btn-profile" onClick={() => navigate("/profile")}>
            👤 <span>{username}</span>
          </button>
          <button className="btn-logout" onClick={handleLogout}>Salir</button>
        </div>
      </header>

      {/* Filtros de categoría — solo en Explorar */}
      {activeTab === "explorar" && (
        <div className="feed-categorias">
          {CATEGORIAS.map((c) => (
            <button
              key={c.key}
              className={`categoria-chip ${categoria === c.key ? "active" : ""}`}
              onClick={() => setCategoria(c.key)}
            >
              {c.label}
            </button>
          ))}
        </div>
      )}

      {/* ── Feed ── */}
      <main className="feed-main">
        {currentUser && activeTab === "recientes" && (
          <CreatePost currentUser={currentUser} onPostCreated={handlePostCreated} />
        )}

        {loading ? (
          [1, 2, 3].map((i) => (
            <div key={i} className="post-card" style={{ padding: 18, marginBottom: 16 }}>
              <div className="skeleton" style={{ height: 16, width: "40%", marginBottom: 10 }} />
              <div className="skeleton" style={{ height: 12, width: "80%", marginBottom: 6 }} />
              <div className="skeleton" style={{ height: 12, width: "60%" }} />
            </div>
          ))
        ) : posts.length === 0 ? (
          <div className="feed-empty">
            <div className="feed-empty-icon">
              {activeTab === "siguiendo" ? "👥" : "📭"}
            </div>
            <p>
              {activeTab === "siguiendo"
                ? "Sigue a otros emprendedores para ver sus publicaciones."
                : "Aún no hay publicaciones aquí."}
            </p>
          </div>
        ) : (
          posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              currentUserId={currentUser?.id}
              onDeleted={handlePostDeleted}
              onUpdated={handlePostUpdated}
            />
          ))
        )}
      </main>
    </div>
  );
};

export default Feed;