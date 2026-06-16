import { useState } from "react"; // 1. Aggiunto useState per il modale
import PropTypes from "prop-types";
import { Badge, Col, Container, Row, Modal, Button } from "react-bootstrap/"; // 2. Importato Modal e Button
import { LogoutButton, LoginButton } from "./Auth";
import { Link, useLocation, useNavigate } from "react-router-dom"; 

function Header(props) {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Stato per controllare l'apertura del modale di conferma
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleLogoClick = (e) => {
    if (location.pathname === "/play" && props.currentPhase === "PLANNING") {
      e.preventDefault();
      setShowConfirmModal(true);
    }
  };

  const handleConfirmExit = () => {
    setShowConfirmModal(false);
    navigate("/");
    props.setCurrentPhase('SETUP');
  };

  return (
    <>
      <header className="py-1 py-md-3 border-bottom bg-warning shadow-sm">
        <Container fluid className="gap-3 align-items-center">
          <Row>
            <Col xs={4} md={4}>
              <Link
                to="/"
                onClick={handleLogoClick}
                className="d-flex align-items-center justify-content-center justify-content-md-start h-100 link-dark text-decoration-none"
              >
                <i className="bi bi-controller fs-3 me-2 flex-shrink-0"></i>
                <span className="h5 mb-0 fw-bold">Last Race game</span>
              </Link>
            </Col>
            <Col
              xs={8}
              md={8}
              className="d-flex align-items-center justify-content-end"
            >
              <span className="ml-md-auto">
                {props.loggedIn && props.user && (
                  <Badge pill bg="dark" className="me-4 px-4 py-2 fs-6">
                    <i className="bi bi-person-circle me-2"></i>
                    {props.user.username}
                  </Badge>
                )}
                {props.loggedIn ? (
                  <LogoutButton logout={props.logout} />
                ) : (
                  <LoginButton />
                )}
              </span>
            </Col>
          </Row>
        </Container>
      </header>

      <Modal 
        show={showConfirmModal} 
        onHide={() => setShowConfirmModal(false)}
        centered
        backdrop="static" 
      >
        <Modal.Header closeButton className="bg-light">
          <Modal.Title className="text-danger fw-bold fs-5">
            <i className="bi bi-exclamation-triangle-fill me-2"></i> Abbandonare la partita?
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          If you return to the Home page now, you will lose all your progress and the stations selected in the current route planning.
        </Modal.Body>
        <Modal.Footer className="bg-light">
          <Button variant="outline-secondary" className="rounded-pill" onClick={() => setShowConfirmModal(false)}>
            Countinue to play
          </Button>
          <Button variant="danger" className="rounded-pill px-4" onClick={handleConfirmExit}>
            Yes, quit
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

Header.propTypes = {
  logout: PropTypes.func,
  user: PropTypes.object,
  loggedIn: PropTypes.bool,
  currentPhase: PropTypes.string,
};

export default Header;