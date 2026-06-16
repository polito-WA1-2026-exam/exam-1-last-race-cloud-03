import { Button, Alert, Row, Col } from 'react-bootstrap';
import { FaRedo, FaHome, FaTimesCircle, FaCheckCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

export function EndingPhase({ gameResults, onRestart }) {
  const navigate = useNavigate(); 

  const hasError = gameResults?.error;

  return (
    <div className="p-4 mx-auto" style={{ maxWidth: "600px" }}>
      <h2 className="text-center mb-4 text-dark fw-bold">🏆 Game Over</h2>
      
      <Alert variant={hasError ? "danger" : "success"} className="text-center rounded-4 shadow-sm py-4">
        {hasError ? (
          <>
            <h4 className="fw-bold text-danger d-flex align-items-center justify-content-center gap-2">
              <FaTimesCircle /> Trip Failed!
            </h4>
            <p className="fs-5 text-dark my-3 px-2">
              {gameResults.error}
            </p>
            <p className="mb-0 text-muted small">The simulation could not be completed</p>
          </>
        ) : (
          <>
            <h4 className="fw-bold text-success d-flex align-items-center justify-content-center gap-2">
              <FaCheckCircle /> Trip Completed Successfully!
            </h4>
            <div className="display-4 my-2">🪙 {gameResults?.totCoins ?? 0}</div>
            <p className="mb-0 text-muted">Final Score Calculated by the Server</p>
          </>
        )}
      </Alert>

      <Row className="g-3">
        <Col xs={6}>
          <Button 
            variant="outline-secondary" 
            size="lg" 
            className="w-100 py-3 fw-bold rounded-pill" 
            onClick={() => navigate('/')}
          >
            <FaHome className="me-2" /> HOME
          </Button>
        </Col>
        
        <Col xs={6}>
          <Button 
            variant="primary" 
            size="lg" 
            className="w-100 py-3 fw-bold rounded-pill shadow-sm" 
            onClick={onRestart}
          >
            <FaRedo className="me-2" /> PLAY AGAIN
          </Button>
        </Col>
      </Row>
    </div>
  );
}