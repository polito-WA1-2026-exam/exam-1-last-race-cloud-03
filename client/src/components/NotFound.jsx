import { Col, Row } from "react-bootstrap";
import { Link } from "react-router";

export function NotFound() {
  return(
      <div className="flex-grow-1 d-flex align-items-center justify-content-center text-center my-auto" style={{ minHeight: '70vh' }}>
  <div style={{ maxWidth: '500px' }}> {/* Mantiene il blocco compatto e centrato */}
    
    <Row className="mb-3">
      <Col>
        <h2 className="fw-bold text-dark">Error: page not found!</h2>
      </Col>
    </Row>

    <Row className="justify-content-center mb-4">
      <Col xs="auto">
        <img 
          src="/404.png" 
          alt="page not found" 
          className="img-fluid mx-auto d-block" 
          style={{ maxHeight: '300px' }} 
        />
      </Col>
    </Row>

    <Row>
      <Col>
        <Link to="/" className="btn btn-primary px-4 py-2 fw-semibold rounded-pill shadow-sm">
          Go Home!
        </Link>
      </Col>
    </Row>

  </div>
</div>
  );
}