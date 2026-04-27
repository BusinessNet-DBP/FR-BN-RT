import { useState } from "react";
import axios from "axios";
import NavbarComponent from "../components/Navbar";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";
import { MS_AUTH_URL } from "../config";

export default function Register() {
  const [accountType, setAccountType] = useState("persona");
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  // Campos persona
  const [fullName, setFullName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");

  // Campos empresa
  const [businessName, setBusinessName] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [businessDescription, setBusinessDescription] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");

  // Campos comunes
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const navigate = useNavigate();

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePhoto(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Las contraseñas no coinciden");
      return;
    }

    // Validar contraseña
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(password)) {
      alert("La contraseña debe tener mínimo 8 caracteres, una mayúscula, una minúscula y un número");
      return;
    }

    // Validar edad
    if (accountType === "persona") {
      const [year, month, day] = birthDate.split("-").map(Number);
      const today = new Date();
      let age = today.getFullYear() - year;
      if (
        today.getMonth() + 1 < month ||
        (today.getMonth() + 1 === month && today.getDate() < day)
      ) {
        age--;
      }

      if (age < 18) {
        alert("Debes ser mayor de edad para registrarte");
        return;
      }
    }

    try {
      const formData = new FormData();
      formData.append("tipo_cuenta", accountType);
      formData.append("email", email);
      formData.append("password", password);

      if (profilePhoto) {
        formData.append("foto_perfil", profilePhoto);
      }

      if (accountType === "persona") {
        formData.append("nombre_completo", fullName);
        formData.append("fecha_nacimiento", birthDate);
        formData.append("biografia", bio);
        formData.append("ubicacion", location);
      } else {
        formData.append("nombre_negocio", businessName);
        formData.append("tipo_negocio", businessType);
        formData.append("descripcion_negocio", businessDescription);
        formData.append("direccion", address);
        formData.append("telefono", phone);
      }

      const url = `${MS_AUTH_URL}/register/${accountType}`;
      const res = await axios.post(url, formData, { headers: { "Content-Type": "multipart/form-data" } });

      localStorage.setItem("access_token", res.data.access_token);
      navigate("/profile");
    } catch (error) {
      alert(error.response?.data?.detail || "Error al registrarse");
    }
  };

  return (
    <div>
      <NavbarComponent />

      <div className="container mt-5 mb-5">
        <div className="col-md-6 mx-auto">
          <div className="card p-4 shadow register-card">
            <h4 className="text-center mb-1">Crear cuenta</h4>
            <p className="text-center text-muted mb-4" style={{ fontSize: "0.9rem" }}>
              Únete a la comunidad de emprendimientos
            </p>

            {/* Selector de tipo de cuenta */}
            <div className="d-flex mb-4 account-type-selector">
              <button
                type="button"
                className={`btn flex-fill me-2 ${accountType === "persona" ? "btn-primary" : "btn-outline-secondary"}`}
                onClick={() => setAccountType("persona")}
              >
                👤 Persona
              </button>
              <button
                type="button"
                className={`btn flex-fill ms-2 ${accountType === "empresa" ? "btn-primary" : "btn-outline-secondary"}`}
                onClick={() => setAccountType("empresa")}
              >
                🏢 Empresa
              </button>
            </div>

            <form onSubmit={handleRegister}>

              {/* Foto de perfil */}
              <div className="text-center mb-4">
                <div
                  className="profile-photo-preview mx-auto mb-2"
                  style={{
                    width: 90,
                    height: 90,
                    borderRadius: "50%",
                    border: "2px dashed #ced4da",
                    overflow: "hidden",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "#f8f9fa",
                    cursor: "pointer",
                  }}
                  onClick={() => document.getElementById("photoInput").click()}
                >
                  {previewUrl ? (
                    <img src={previewUrl} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <span style={{ fontSize: 28, color: "#adb5bd" }}>📷</span>
                  )}
                </div>
                <input
                  id="photoInput"
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={handlePhotoChange}
                />
                <small className="text-muted">
                  {previewUrl ? "Cambiar foto de perfil" : "Subir foto de perfil"}
                </small>
              </div>

              {/* Campos persona */}
              {accountType === "persona" && (
                <>
                  <input
                    type="text"
                    className="form-control mb-3"
                    placeholder="Nombre completo"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />

                  <div className="mb-3">
                    <label className="form-label text-muted" style={{ fontSize: "0.85rem" }}>
                      Fecha de nacimiento
                    </label>
                    <input
                      type="date"
                      className="form-control"
                      value={birthDate}
                      onChange={(e) => setBirthDate(e.target.value)}
                      required
                    />
                  </div>

                  <textarea
                    className="form-control mb-3"
                    placeholder="Biografía / descripción corta"
                    rows={3}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                  />

                  <input
                    type="text"
                    className="form-control mb-3"
                    placeholder="Ciudad o país"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    required
                  />
                </>
              )}

              {/* Campos empresa */}
              {accountType === "empresa" && (
                <>
                  <input
                    type="text"
                    className="form-control mb-3"
                    placeholder="Nombre del negocio"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    required
                  />

                  <select
                    className="form-control mb-3"
                    value={businessType}
                    onChange={(e) => setBusinessType(e.target.value)}
                    required
                  >
                    <option value="">Tipo de negocio...</option>
                    <option value="restaurante">Restaurante</option>
                    <option value="tienda">Tienda</option>
                    <option value="servicio">Servicio</option>
                    <option value="tecnologia">Tecnología</option>
                    <option value="educacion">Educación</option>
                    <option value="salud">Salud</option>
                    <option value="moda">Moda</option>
                    <option value="entretenimiento">Entretenimiento</option>
                    <option value="otro">Otro</option>
                  </select>

                  <textarea
                    className="form-control mb-3"
                    placeholder="Descripción del negocio"
                    rows={3}
                    value={businessDescription}
                    onChange={(e) => setBusinessDescription(e.target.value)}
                  />

                  <input
                    type="text"
                    className="form-control mb-3"
                    placeholder="Dirección física"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                  />

                  <input
                    type="tel"
                    className="form-control mb-3"
                    placeholder="Número de contacto"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </>
              )}

              {/* Campos comunes */}
              <hr className="my-3" />

              <input
                type="email"
                className="form-control mb-3"
                placeholder="Correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <input
                type="password"
                className="form-control mb-3"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <input
                type="password"
                className="form-control mb-4"
                placeholder="Confirmar contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />

              <button type="submit" className="btn btn-primary w-100">
                Registrarse
              </button>

              <p className="text-center mt-3 mb-0" style={{ fontSize: "0.875rem" }}>
                ¿Ya tienes cuenta?{" "}
                <a href="/login" className="text-primary">
                  Inicia sesión
                </a>
              </p>
            </form>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}