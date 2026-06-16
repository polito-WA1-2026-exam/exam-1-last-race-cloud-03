import React, { useState } from 'react';
import { Card, Button, Row, Col, ProgressBar, Badge } from 'react-bootstrap';
// 1. CORRETTO: Aggiunto FaArrowLeft negli import
import { FaCheckCircle, FaFlagCheckered, FaCoins, FaExclamationTriangle, FaArrowRight, FaArrowLeft } from 'react-icons/fa';

export function ExecutionPhase({ gameResults, onGameEnd }) {
  // Gestiamo il caso d'emergenza in cui i dati non siano ancora pronti
  const steps = gameResults?.steps || [];
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  if (steps.length === 0) {
    return <div className="text-center mt-5">No steps available for this journey. 🚇</div>;
  }

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const progressPercentage = ((currentStepIndex + 1) / steps.length) * 100;
  const currentStep = steps[currentStepIndex];

  return (
    <div className="p-4 w-100 flex-grow-1 d-flex flex-column align-items-center" style={{ minWidth: "360px" }}>
      <h2 className="text-center mb-4 text-success fw-bold">Phase 2: Execution Journey</h2>

      <div className="w-100 mb-4" style={{ maxWidth: "600px" }}>
        <small className="text-muted d-block text-end mb-1">
          Step {currentStepIndex + 1} of {steps.length}
        </small>
        <ProgressBar variant="success" now={progressPercentage} animated label={`${Math.round(progressPercentage)}%`} />
      </div>

      <ExecutionCard 
        currentStep={currentStep} 
        currentStepIndex={currentStepIndex} 
        steps={steps} 
      />

      <Row className="w-100 justify-content-center" style={{ maxWidth: "600px" }}>
        <Col xs={6} className="text-end">
          <Button 
            variant="outline-secondary" 
            size="lg" 
            className="px-4 py-2 fw-bold rounded-pill"
            onClick={handlePrev}
            disabled={currentStepIndex === 0}
          >
            <FaArrowLeft className="me-2" /> Back
          </Button>
        </Col>
        
        <Col xs={6} className="text-start">
          {currentStepIndex === steps.length - 1 ? (
            <Button 
              variant="danger" 
              size="lg" 
              className="px-4 py-2 fw-bold rounded-pill shadow"
              // Passiamo il punteggio REALE dell'ultimo turno all'EndingPhase
              onClick={() => onGameEnd({ 
                score: steps[steps.length - 1]?.updated_coins || 0, 
                stepsCount: steps.length 
              })} 
            >
              Finish Game <FaFlagCheckered className="ms-2" />
            </Button>
          ) : (
            <Button 
              variant="success" 
              size="lg" 
              className="px-4 py-2 fw-bold rounded-pill shadow"
              onClick={handleNext}
            >
              Next <FaArrowRight className="ms-2" />
            </Button>
          )}
        </Col>
      </Row>
    </div>
  );
}

function ExecutionCard({ currentStep, currentStepIndex, steps }) {
  const isLastStep = currentStepIndex === steps.length - 1;

  const getCoinEffectColor = (effect) => {
    if (effect > 0) return 'text-success fw-bold';
    if (effect < 0) return 'text-danger fw-bold';
    return 'text-muted';
  };

  return (
    <Card className="shadow-lg border-0 rounded-4 p-4 mb-4 w-100 bg-white" style={{ maxWidth: '600px', minHeight: '300px' }}>
      <Card.Body className="d-flex flex-column justify-content-between">
        
        <div className="d-flex justify-content-between align-items-center mb-4">
          <Badge bg="secondary" className="px-3 py-2 fs-6 rounded-pill">
            Step {currentStep.step} di {steps.length}
          </Badge>
          <div className="fs-1">
            {isLastStep ? <FaFlagCheckered className="text-danger" /> : <FaCheckCircle className="text-success" />}
          </div>
        </div>

        <div className="bg-light rounded-3 p-3 mb-4 d-flex align-items-center justify-content-center gap-3 shadow-sm">
          <span className="fw-bold text-dark text-truncate fs-5">{currentStep.from_station}</span>
          <FaArrowRight className="text-primary fs-5 flex-shrink-0" />
          <span className="fw-bold text-dark text-truncate fs-5">{currentStep.to_station}</span>
        </div>

        <div className="text-center my-2 flex-grow-1">
          <div className="d-flex align-items-center justify-content-center gap-2 text-warning mb-2">
            <FaExclamationTriangle className="fs-5" />
            <span className="text-uppercase fw-bold tracking-wider small text-muted">Imprevisto in viaggio</span>
          </div>
          <Card.Text className="text-dark fs-5 fw-medium px-2">
            {currentStep.event_description}
          </Card.Text>
        </div>

        <hr className="my-3 text-muted opacity-25" />

        <Row className="align-items-center text-center g-2">
          <Col xs={6} className="border-end border-light">
            <div className="small text-muted text-uppercase">Effetto Turno</div>
            <div className={`fs-5 ${getCoinEffectColor(currentStep.coin_effect)}`}>
              {currentStep.coin_effect > 0 ? `+${currentStep.coin_effect}` : currentStep.coin_effect} <FaCoins className="ms-1" />
            </div>
          </Col>
          <Col xs={6}>
            <div className="small text-muted text-uppercase">Monete Totali</div>
            <div className="fs-5 fw-bold text-primary">
              {currentStep.updated_coins} <FaCoins className="ms-1 text-warning" />
            </div>
          </Col>
        </Row>

      </Card.Body>
    </Card>
  );
}