import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home    from './pages/Home';
import Login   from './pages/Login';
import Welcome from './pages/Welcome';
import Feed    from './pages/Feed';

/**
 * Protege rutas que requieren sesión activa.
 * Si no hay token en localStorage redirige a /login.
 */
function PrivateRoute({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"       element={<Home />} />
        <Route path="/login"  element={<Login />} />
        <Route path="/welcome" element={<Welcome />} />

        {/* Rutas protegidas */}
        <Route
          path="/feed"
          element={
            <PrivateRoute>
              <Feed />
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;