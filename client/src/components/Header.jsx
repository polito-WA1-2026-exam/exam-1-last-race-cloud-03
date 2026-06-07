import PropTypes from "prop-types";
import { Badge, Col, Container, Row } from "react-bootstrap/";
import { LogoutButton, LoginButton } from "./Auth";

function Header(props) {
  return (
    <header className="py-1 py-md-3 border-bottom bg-warning">
      <Container fluid className="gap-3 align-items-center">
        <Row>
          <Col xs={4} md={4}>
            <a
              href="/"
              className="d-flex align-items-center justify-content-center justify-content-md-start h-100 link-dark text-decoration-none"
            >
              <i className="bi bi-controller fs-3 me-2 flex-shrink-0"></i>
              <span className="h5 mb-0">Last Race game</span>
            </a>
          </Col>
          <Col
            xs={5}
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
  );
}

Header.propTypes = {
  isSidebarExpanded: PropTypes.bool,
  setIsSidebarExpanded: PropTypes.func,
  logout: PropTypes.func,
  user: PropTypes.object,
  loggedIn: PropTypes.bool,
};

export default Header;
