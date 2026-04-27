import { Navbar, Nav, Container, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

function NavbarComponent({ onLogout, username }) {
  const navigate = useNavigate();

  return (
    <Navbar bg="primary" variant="dark">
      <Container>
        <Navbar.Brand>BusinessNet</Navbar.Brand>

        <Nav className="me-auto">
          <Nav.Link href="/feed">Inicio</Nav.Link>
        </Nav>

        {username && (
          <Nav className="ms-auto align-items-center gap-2">
            <Button
              variant="outline-light"
              size="sm"
              onClick={() => navigate("/profile")}
            >
              👤 {username}
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