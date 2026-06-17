import { Card, Button, Image, Row, Col } from 'react-bootstrap';
import { FaPlay, FaMapMarkedAlt, FaArrowLeft } from 'react-icons/fa';

import MetroMapSvg from './../../assets/metro-with-lines.svg';
import { useNavigate } from 'react-router';

export function SetupPhase({ onPlay }) {
  const navigate = useNavigate();

  return (
    <div className="p-4 w-100 flex-grow-1 d-flex flex-column" style={{ minWidth: "360px" }}>
      <div className="p-4 w-100 flex-grow-1 d-flex flex-column" style={{ minWidth: "360px" }}>
        <Row className="align-items-center mb-5 w-100 gx-0 gy-3 text-center text-sm-start">
          <Col xs={12} sm={3} className="d-flex justify-content-center justify-content-sm-start">
            <Button 
              variant="outline-secondary" 
              className="px-3 py-2 rounded-pill fw-bold"
              onClick={() => navigate('/')}
            >
              <FaArrowLeft className="me-2" /> Back to Home
            </Button>
          </Col>

          <Col xs={12} sm={6} className="text-center">
            <h2 className="text-primary fw-bold m-0 fs-3 d-inline-flex align-items-center justify-content-center">
              <FaMapMarkedAlt className="me-2" /> Phase 0: Mission Setup
            </h2>
          </Col>

          <Col sm={3} className="d-none d-sm-block">
          </Col>
        </Row>
      </div>

      <Row className="flex-grow-1 g-4">
        <Col md={4} className="d-flex flex-column justify-content-between">
          <Card className="shadow-sm p-4 rounded-4 border-0 bg-white h-100 d-flex flex-column justify-content-between">
            <div>
              <h4 className="fw-bold text-secondary mb-3">Your Objectives</h4>

              <p className="text-muted mt-3 small">
                Take your time to analyze the metro grid on the right. Plan the shortest path or look for strategic lines. 
                Once you press <strong>START MISSION</strong>, the 90-second execution countdown will trigger immediately!
              </p>
            </div>

            <Button 
              variant="success" 
              size="lg" 
              className="fw-bold w-100 py-3 mt-4 text-uppercase shadow"
              onClick={onPlay}
            >
              <FaPlay className="me-2 animate-pulse" /> Start Mission
            </Button>
          </Card>
        </Col>

        <Col md={8}>
          <Card className="shadow-sm p-3 rounded-4 border-0 h-100 d-flex flex-column">
            <h5 className="text-muted mb-3">🚊 Subway Network Grid</h5>
            <div className="flex-grow-1 d-flex align-items-center justify-content-center border border-secondary border-dashed rounded-3 p-3 bg-light">
              <Image src={MetroMapSvg} rounded fluid alt="Metro Map" />                
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}