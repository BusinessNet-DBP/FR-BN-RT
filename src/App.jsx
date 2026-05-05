import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Feed from './pages/Feed';
 
/**
 * Protege rutas que requieren sesión activa.
 * Usa 'access_token' que es la key real guardada en localStorage.
 */
function PrivateRoute({ children }) {
  const token = localStorage.getItem('access_token'); // ← corregido: era 'token'
  return token ? children : <Navigate to="/login" replace />;
}
 
function PublicRoute({ children }) {
  const token = localStorage.getItem('access_token');
  return token ? <Navigate to="/feed" replace /> : children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/home" element={<Home />} />

        {/* Rutas públicas: si ya tiene sesión, redirige al feed */}
        <Route path="/" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

        {/* Rutas privadas */}
        <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
        <Route path="/profile/:id" element={<PrivateRoute><Profile /></PrivateRoute>} />
        <Route path="/feed" element={<PrivateRoute><Feed /></PrivateRoute>} />

        {/* Cualquier ruta desconocida → login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;