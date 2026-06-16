import { useEffect, useState } from "react";
import { Container, Table, Alert, Spinner, Button } from "react-bootstrap";
import API from "../API.js"
import { FaArrowLeft, FaTrophy } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';

export function Rank(props) {
  const navigate = useNavigate();

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    API.getRank()
      .then((res) => {
        if (!res.ok) throw new Error("Impossibile caricare la classifica");
        return res.json();
      })
      .then((json) => {
        setData(json.rank);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <Container className="text-center mt-5"><Spinner animation="border" /></Container>;
  if (error) return <Container className="mt-5"><Alert variant="danger">{error}</Alert></Container>;
  return (
    <Container className="py-4 py-md-5">
      {props.loggedIn && (
          <Container>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <Button 
                variant="outline-secondary" 
                className="px-3 py-2 rounded-pill fw-bold"
                onClick={() => navigate('/')}
              >
                <FaArrowLeft className="me-2" /> Back to Home
              </Button>
              
              <h2 className="text-primary fw-bold m-0 flex-grow-1 text-center">
                <FaTrophy className="text-warning me-2" /> Global Leaderboard
              </h2>
              
              <div style={{ width: '135px' }} className="d-none d-md-block"></div>
            </div>

          <Table
            hover
            responsive
            className="shadow-sm rounded-3 overflow-hidden"
          >
            <thead className="bg-dark text-white text-center">
              <tr>
                <th>Rank</th>
                <th>Player</th>
                <th>High Score</th>
              </tr>
            </thead>
            <tbody className="text-center align-middle">
              {data.map((row, index) => {
                const rank = index + 1;

                let rankDisplay = String(rank);
                if (rank === 1) rankDisplay = "🥇";
                if (rank === 2) rankDisplay = "🥈";
                if (rank === 3) rankDisplay = "🥉";

                return (
                  <tr
                    key={index}
                  >
                    <td>{rankDisplay}</td>
                    <td>
                      {row.username}{" "}
                    </td>
                    <td className="text-success">{row.coins} 🪙</td>
                  </tr>
                );
              })}

              {data.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-muted py-4">
                    No completed games yet. Be the first to top the leaderboard!
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Container>
      )}
    </Container>
  );
}
