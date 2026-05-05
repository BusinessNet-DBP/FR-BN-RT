import { Navbar, Nav, Container, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

function NavbarComponent({ onLogout, username, isProfileView = false }) {
  const navigate = useNavigate();

  return (
    <Navbar bg="primary" variant="dark">
      <Container>
        <Navbar.Brand style={{ cursor: "pointer" }} onClick={() => navigate("/feed")}>
          BusinessNet
        </Navbar.Brand>

        {username && (
          <Nav className="ms-auto align-items-center gap-2">

            {/* 🔥 BOTÓN DINÁMICO */}
            <Button
              variant="outline-light"
              size="sm"
              onClick={() => navigate(isProfileView ? "/feed" : "/profile")}
            >
              {isProfileView ? "🏠 Feed" : `👤 ${username}`}
            </Button>

            <Button
              variant="outline-light"
              size="sm"
              onClick={onLogout}
            >
              Cerrar sesión
            </Button>

          </Nav>
        )}
      </Container>
    </Navbar>
  );
}

export default NavbarComponent;