import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Welcome = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Revisar si hay token en localStorage
    const token = localStorage.getItem("access_token");

    if (!token) {
      // Si no hay token, redirige al login
      navigate("/login");
    } else {
      // Si hay token, podemos guardar datos del usuario
      try {
        const userData = JSON.parse(atob(token.split(".")[1])); // decodifica payload del JWT
        setUser(userData);
      } catch (error) {
        console.error("Token inválido", error);
        navigate("/login");
      }
    }
  }, [navigate]);

  if (!user) {
    // Mientras verificamos, no mostramos nada
    return null;
  }

  // Función para cerrar sesión
  const handleLogout = () => {
    localStorage.removeItem("access_token");
    navigate("/login");
  };

  return (
    <div className="container text-center mt-5">
      <div className="card p-5 shadow-sm">
        <h1 className="mb-3">¡Bienvenido!</h1>
        <p className="mb-4">Has iniciado sesión correctamente.</p>
        <button className="btn btn-danger" onClick={handleLogout}>
          Cerrar sesión
        </button>
      </div>
    </div>
  );
};

export default Welcome;