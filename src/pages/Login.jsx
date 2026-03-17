import { useState } from "react";
import axios from "axios";
import NavbarComponent from "../components/Navbar";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post("http://localhost:8001/auth/login", {
        email,
        password
      });

      // Guardar token
      localStorage.setItem("access_token", res.data.access_token);
      navigate("/welcome");

      console.log("TOKEN:", res.data.access_token);

    } catch (error) {
      alert(error.response?.data?.detail || "Error en login");
    }
  };

  return (
    <div>
      <NavbarComponent />

      <div className="container mt-5">
        <div className="col-md-4 mx-auto">
          <div className="card p-4 shadow login-card">
            <h4 className="text-center mb-3">Iniciar Sesión</h4>

            <form onSubmit={handleLogin}>
              <input
                type="email"
                className="form-control mb-3"
                placeholder="Correo electrónico"
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <input
                type="password"
                className="form-control mb-3"
                placeholder="Contraseña"
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <button className="btn btn-primary w-100">
                Ingresar
              </button>
            </form>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}