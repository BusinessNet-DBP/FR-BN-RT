import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import './Feed.css';
import CreatePost from "../components/CreatePost";
import PostCard from "../components/PostCard";
import { postService, authService } from "../services/api";
import NavbarComponent from "../components/Navbar";

const Feed = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) { navigate("/login"); return; }

    // Decodificar el token para obtener el id
    let tokenPayload;
    try {
      tokenPayload = JSON.parse(atob(token.split(".")[1]));
    } catch {
      navigate("/login");
      return;
    }

    // Cargar el perfil completo desde la API para tener nombre real
    const loadUserAndPosts = async () => {
      try {
        // Carga el perfil real del usuario autenticado
        const userData = await authService.me();
        // Combinar datos del token (id numérico) con datos del perfil (nombre)
        setCurrentUser({
          ...tokenPayload,
          id: userData.id,
          nombre: userData.nombre_completo || userData.nombre_negocio || userData.email,
          foto_url: userData.foto_perfil || null,
        });
      } catch {
        // Si falla la API, al menos usar el token para tener el id
        setCurrentUser({
          ...tokenPayload,
          id: parseInt(tokenPayload.sub),
        });
      }

      try {
        const data = await postService.getPosts();
        setPosts(data);
      } catch (e) {
        console.error("Error cargando posts:", e);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    loadUserAndPosts();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    navigate("/login");
  };

  const handlePostCreated = (newPost) => {
    setPosts((prev) => [newPost, ...prev]);
  };

  const handlePostDeleted = (postId) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  };

  // Nombre para mostrar en el navbar: nombre real del perfil
  const username = currentUser?.nombre || currentUser?.email || "Mi perfil";

  return (
    <div className="feed-wrapper">

      {/* Navbar */}
      <NavbarComponent
        username={username}
        onLogout={handleLogout}
        isProfileView={false} // opcional, pero explícito
      />

      {/* Feed */}
      <main className="feed-main">

        {currentUser && (
          <CreatePost
            currentUser={currentUser}
            onPostCreated={handlePostCreated}
          />
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
            <div className="feed-empty-icon">📭</div>
            <p>Aún no hay publicaciones.<br />¡Sé el primero en compartir algo!</p>
          </div>
        ) : (
          posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              currentUserId={currentUser?.id}
              onDeleted={handlePostDeleted}
            />
          ))
        )}

      </main>
    </div>
  );
};

export default Feed;