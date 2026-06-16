import React, { useState, useEffect } from 'react';
import { Card, Button, Badge, Row, Col, ListGroup } from 'react-bootstrap';
import { FaClock, FaCheckCircle, FaTimes, FaMapMarkedAlt } from 'react-icons/fa';

import MetroMapSvg from './../../assets/metro-without.svg';
import API from '../../API';

export function PlanningPhase({ gameGoals, segments = [], stations=[], onGameEnd }) {
  const [timeLeft, setTimeLeft] = useState(90);
  
  const [selectedRoute, setSelectedRoute] = useState([]); 

  const handleFinishGame = async () => {
    const formattedRoute = selectedRoute.map(step => ({
      from: Number(step.fromId),
      to: Number(step.toId)
    }));
    const gameId = gameGoals?.gameId; 

    if (!gameId) {
      alert("Errore: ID partita non trovato. Impossibile salvare.");
      return;
    }

    try {
      const serverResponse = await API.endGame(gameId, formattedRoute);
      const data = await serverResponse.json();
    
      onGameEnd(data);

    } catch (error) {
      console.error("Errore durante la chiusura della partita:", error);
      alert("Impossibile salvare la partita sul server. Riprova.");
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
    <div className="p-4 w-100 flex-grow-1 d-flex flex-column">
      
      <Row className="mb-4 align-items-center justify-content-between g-3">
        <Col xs={12} md={3} className="d-none d-md-block">
        </Col>

        <Col xs={12} md={6} className="text-center">
          <h2 className="text-success fw-bold mb-1">Phase 1: Planning...</h2>
          <p className="text-muted mb-0">
            Mission: Starting from <strong>Station {stations.find(s => s.id === gameGoals?.startStationId)?.name}</strong>, reach <strong>Station {stations.find(s => s.id === gameGoals?.destinationStationId)?.name}</strong>          </p>
        </Col>

        <Col xs={12} md={3} className="text-center text-md-end">
          <Badge 
            bg={timeLeft > 20 ? "dark" : "danger"} 
            className="fs-4 p-2 px-3 rounded-pill shadow-sm"
            style={{ letterSpacing: "0.5px" }}
          >
            <FaClock className="me-2 mb-1" /> {timeLeft}s
          </Badge>
        </Col>
      </Row>

      <Row className="flex-grow-1 g-4">
        
        <Col md={3}>
          <Card className="shadow-sm border-0 h-100 p-3 bg-white">
            <h5 className="fw-bold text-secondary mb-3">Available Segments</h5>
            <div className="overflow-auto" style={{ maxHeight: "450px" }}>
              {availableSegments.length === 0 ? (
                <div className="text-center text-muted py-5 small border border-dashed rounded-3">
                  All segments selected<br />or map empty!
                </div>
              ) : (
                availableSegments.map((seg) => (
                  <Button
                    key={seg.id}
                    variant="outline-primary"
                    className="w-100 text-start mb-2 py-2 px-3 rounded-3 border-2 shadow-sm transition-all"
                    onClick={() => handleSelectSegment(seg)}
                  >
                    <div className="small fw-bold text-truncate">
                      {seg.from} - {seg.to}
                    </div>
                  </Button>
                ))
              )}
            </div>
          </Card>
        </Col>

        <Col md={5}>
          <Card className="shadow-sm border-0 h-100 p-3 bg-light d-flex flex-column align-items-center justify-content-center">
            <div className="w-100 text-muted mb-2 small fw-bold">
              <FaMapMarkedAlt className="me-1" /> Subway Grid Blueprint
            </div>
            <div className="flex-grow-1 d-flex align-items-center justify-content-center p-2 bg-white rounded-3 border w-100">
              <img 
                src={MetroMapSvg} 
                alt="Metro Lines Network" 
                className="img-fluid rounded" 
                style={{ maxHeight: "400px", objectFit: "contain" }}
              />
            </div>
          </Card>
        </Col>

        <Col md={4} className="d-flex flex-column justify-content-between">
          <Card className="shadow-sm border-0 h-100 p-3 bg-white d-flex flex-column justify-content-between">
            <div>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold text-success mb-0">Your Live Route</h5>
              </div>

              {selectedRoute.length === 0 ? (
                <div className="text-center text-muted my-5 py-4 border border-dashed rounded-3">
                  No segments selected yet.<br/>Click a rail from the left list to start your journey!
                </div>
              ) : (
                <ListGroup variant="flush" className="overflow-auto bg-transparent" style={{ maxHeight: "350px" }}>
                  {selectedRoute.map((step, index) => (
                    <ListGroup.Item 
                      key={index} 
                      className="d-flex align-items-center justify-content-between border-0 bg-light rounded-3 shadow-sm py-2 px-3 mb-2 animate-fade-in"
                    >
                      <div className="d-flex align-items-center gap-3 min-width-0 flex-grow-1">
                        <Badge bg="success" pill className="d-flex align-items-center justify-content-center shadow-sm" style={{ width: '26px', height: '26px', fontSize: '0.8rem' }}>
                          {index + 1}
                        </Badge>
                        
                        <div className="min-width-0 flex-grow-1 d-flex align-items-center gap-2">
                          <span className="fw-bold text-truncate small">{step.from}</span>
                          <span className="text-success fw-bold small">-</span>
                          <span className="fw-bold text-truncate small">{step.to}</span>
                        </div>
                      </div>
                      
                      <Button 
                        variant="link" 
                        className="text-danger p-1 ms-2 text-decoration-none d-flex align-items-center justify-content-center"
                        onClick={() => handleRemoveSegment(index)}
                        title="Remove this step"
                      >
                        <FaTimes size={16} />
                      </Button>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
            </div>

            <Button 
              variant="success" 
              size="lg" 
              className="w-100 py-3 fw-bold mt-3 text-uppercase shadow-sm" 
              onClick={handleFinishGame}
              disabled={selectedRoute.length === 0}
            >
              <FaCheckCircle className="me-2" /> Complete Trip
            </Button>
          </Card>
        </Col>

      </Row>
    </div>
  );
}