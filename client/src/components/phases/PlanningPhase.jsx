import { useState, useEffect } from 'react';
import { Card, Button, Badge, Row, Col, ListGroup } from 'react-bootstrap';
import { FaClock, FaCheckCircle, FaTimes, FaMapMarkedAlt } from 'react-icons/fa';

import MetroMapSvg from './../../assets/metro-without.svg';
import API from '../../API';

export function PlanningPhase({ gameGoals, segments = [], stations=[], setCurrentPhase, onGameEnd }) {
  const [timeLeft, setTimeLeft] = useState(90);
  const [selectedRoute, setSelectedRoute] = useState([]); 

  const handleFinishGame = async () => {
    const formattedRoute = selectedRoute.map(step => ({
      from: Number(step.station1),
      to: Number(step.station2)
    }));
    const gameId = gameGoals?.gameId; 

    if (!gameId) {
      alert("Error: Game ID not found. Save failed.");
      return;
    }

    try {
      const serverResponse = await API.endGame(gameId, formattedRoute);
      const data = await serverResponse.json();
      if(data.error){
        setCurrentPhase("ENDING");
      } else {
        setCurrentPhase('EXECUTION');
      }
      onGameEnd(data);
    } catch (error) {
      console.error("Error ending the game:", error);
      alert("Unable to save the game on the server. Please try again.");
    }
  };

  useEffect(() => {
    if (timeLeft === 0) {
      handleFinishGame();
      return;
    }
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleSelectSegment = (segment) => {
    if (!selectedRoute.some(s => s.id === segment.id)) {
      setSelectedRoute(prev => [...prev, segment]);
    }
  };

  const handleRemoveSegment = (indexToRemove) => {
    setSelectedRoute(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const availableSegments = segments.filter(
    (seg) => !selectedRoute.some((selected) => selected.id === seg.id)
  );

  return (
    <div className="p-3 w-100 flex-grow-1 d-flex flex-column" style={{ fontSize: "0.9rem" }}>
      
      <Row className="mb-3 align-items-center justify-content-between g-2">
        <Col xs={12} md={9} className="text-center text-md-start">
          <h3 className="text-success fw-bold mb-1 fs-4">Phase 1: Planning...</h3>
          <div className="text-muted small lh-base">
            Mission: Starting from{" "}
            <Badge bg="danger" className="mx-1 px-2 py-1 rounded-pill shadow-sm align-middle" style={{ fontSize: "0.75rem" }}>
              🏁 {stations.find(s => s.id === gameGoals?.startStationId)?.name || "Loading..."}
            </Badge>
            , reach{" "}
            <Badge bg="primary" className="mx-1 px-2 py-1 rounded-pill shadow-sm align-middle" style={{ fontSize: "0.75rem" }}>
              🏆 {stations.find(s => s.id === gameGoals?.destinationStationId)?.name || "Loading..."}
            </Badge>
          </div>
        </Col>
        <Col xs={12} md={3} className="text-center text-md-end">
          <Badge 
            bg={timeLeft > 20 ? "dark" : "danger"} 
            className="fs-5 p-1.5 px-3 rounded-pill shadow-sm"
          >
            <FaClock className="me-1 mb-0.5" /> {timeLeft}s
          </Badge>
        </Col>
      </Row>

      <div className="d-flex flex-column gap-3">
        
        <Row className="g-3 align-items-stretch">
          
          <Col md={8} xs={12}>
            <Card className="shadow-sm border-0 p-2 bg-light h-100">
              <div className="text-muted mb-1 fw-bold" style={{ fontSize: "0.75rem" }}>
                <FaMapMarkedAlt className="me-1" /> Subway Grid Blueprint
              </div>
              <div className="d-flex align-items-center justify-content-center p-1 bg-white rounded-3 border h-100">
                <img 
                  src={MetroMapSvg} 
                  alt="Metro Lines Network" 
                  className="img-fluid rounded" 
                  style={{ maxHeight: "420px", width: "100%", objectFit: "contain" }}
                />
              </div>
            </Card>
          </Col>

          <Col md={4} xs={12}>
            <Card className="shadow-sm border-0 h-100 p-2 bg-white d-flex flex-column justify-content-between">
              <div>
                <h6 className="fw-bold text-success mb-2 ps-1">Your Live Route</h6>

                {selectedRoute.length === 0 ? (
                  <div className="text-center text-muted py-4 border border-dashed rounded-3" style={{ fontSize: "0.75rem" }}>
                    No segments selected.<br/>Choose lines from below!
                  </div>
                ) : (
                  <ListGroup variant="flush" className="overflow-auto" style={{ maxHeight: "310px", paddingRight: "3px" }}>
                    {selectedRoute.map((step, index) => (
                      <ListGroup.Item 
                        key={index} 
                        className="d-flex align-items-center justify-content-between border-0 bg-light rounded-3 shadow-sm py-1.5 px-2 mb-1.5"
                      >
                        <div className="d-flex align-items-center gap-2 flex-grow-1 min-width-0">
                          <Badge bg="success" pill className="d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: '20px', height: '20px', fontSize: '0.7rem' }}>
                            {index + 1}
                          </Badge>
                          
                          <div className="min-width-0 flex-grow-1 text-wrap fw-bold text-dark lh-sm" style={{ fontSize: "0.8rem" }}>
                            {stations.find(s => s.id === step.station1)?.name} - {stations.find(s => s.id === step.station2)?.name}
                          </div>
                        </div>
                        
                        <Button 
                          variant="link" 
                          className="text-danger p-0 ms-1 text-decoration-none d-flex align-items-center justify-content-center flex-shrink-0"
                          onClick={() => handleRemoveSegment(index)}
                        >
                          <FaTimes size={12} />
                        </Button>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                )}
              </div>

              <Button 
                variant="success" 
                size="md"
                className="w-100 py-2.5 fw-bold mt-2 text-uppercase shadow-sm rounded-pill small" 
                onClick={handleFinishGame}
                disabled={selectedRoute.length === 0}
              >
                <FaCheckCircle className="me-1.5" /> Complete Trip
              </Button>
            </Card>
          </Col>
        </Row>

        <Card className="shadow-sm border-0 p-2.5 bg-white">
          <h6 className="fw-bold text-secondary mb-2 ps-1">Available Segments</h6>
          <div className="overflow-auto" style={{ maxHeight: "260px", paddingRight: "3px" }}>
            {availableSegments.length === 0 ? (
              <div className="text-center text-muted py-3 small border border-dashed rounded-3">
                All segments selected or map empty!
              </div>
            ) : (
              <Row className="g-1.5">
                {availableSegments.map((seg) => (
                  <Col xl={3} lg={4} sm={6} xs={12} key={seg.id}>
                    <Button
                      variant="outline-primary"
                      className="w-100 text-center py-1 px-2 rounded-2 border-2 shadow-sm h-100 d-flex align-items-center justify-content-center"
                      style={{ minHeight: "36px" }} 
                      onClick={() => handleSelectSegment(seg)}
                    >
                      <div className="fw-bold text-wrap lh-sm w-100 text-dark" style={{ fontSize: "0.8rem", letterSpacing: "-0.1px" }}>
                        {stations.find(s => s.id === seg.station1)?.name} - {stations.find(s => s.id === seg.station2)?.name}
                      </div>
                    </Button>
                  </Col>
                ))}
              </Row>
            )}
          </div>
        </Card>

      </div>
    </div>
  );
}