import { Card, Container, Button } from "react-bootstrap";

function WelcomeCard() {
  return (
    <Container className="mt-5">
      <Card className="text-center">
        <Card.Body>
          <Card.Title>Bienvenido a BusinessNet</Card.Title>

          <Card.Text>
            La red social para emprendedores donde puedes conectar,
            compartir tus productos y hacer crecer tu negocio.
          </Card.Text>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default WelcomeCard;