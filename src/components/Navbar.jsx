import { Navbar, Nav, Container } from "react-bootstrap";

function NavbarComponent() {
  return (
    <Navbar bg="primary" variant="dark">
      <Container>
        <Navbar.Brand>BusinessNet</Navbar.Brand>

        <Nav className="me-auto">
          <Nav.Link href="/">Inicio</Nav.Link>
          <Nav.Link href="/login">Login</Nav.Link>
          <Nav.Link href="/register">Registro</Nav.Link>
        </Nav>
      </Container>
    </Navbar>
  );
}

export default NavbarComponent;