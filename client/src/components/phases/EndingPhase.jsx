import React from 'react';
import { Card, Button, Alert } from 'react-bootstrap';
import { FaRedo } from 'react-icons/fa';

export function EndingPhase({ gameResults, onRestart }) {
  return (
    <div className="p-4 mx-auto" style={{ maxWidth: "600px" }}>
      <h2 className="text-center mb-4 text-dark fw-bold">🏆 Game Over</h2>
      
      <Alert variant="success" className="text-center rounded-4 shadow-sm py-4">
        <h4 className="fw-bold">Trip Completed Successfully!</h4>
        <div className="display-4 my-2">🪙 {gameResults.totCoins}</div>
        <p className="mb-0 text-muted">Final Score Calculated by the Server</p>
      </Alert>

      <Button variant="primary" size="lg" className="w-100 py-3 fw-bold" onClick={onRestart}>
        <FaRedo className="me-2" /> PLAY AGAIN
      </Button>
    </div>
  );
}