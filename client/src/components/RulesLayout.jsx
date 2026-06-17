import { Col, Container, Row, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

export function Rules(props) {
  const navigate = useNavigate();
  return (
    <Container className="py-4 py-md-5">
      {props.loggedIn && (
        <Row className="justify-content-center mb-4">
          <Col xs={12} md={10} lg={8} className="d-flex justify-content-center gap-3">
            <Button
              variant="outline-secondary"
              className="px-4 py-2.5 fs-5 fw-semibold"
              style={{ minWidth: "160px" }}
              onClick={() => navigate("/rank")}
            >
              Rank
            </Button>
            <Button
              variant="primary"
              className="px-5 py-2.5 fs-5 fw-semibold shadow-sm"
              style={{ minWidth: "160px" }}
              onClick={() => navigate("/play")}
            >
              Play
            </Button>
          </Col>
        </Row>
      )}

      <Row className="justify-content-center">
        <Col xs={12} md={10} lg={8} className="text-start">
          <div className="bg-white border rounded-4 shadow-sm p-4 p-md-5">
            <h1 className="h3 fw-bold mb-2">Last Race Game Rules</h1>
            <p className="text-muted mb-4">
              Plan fast, follow connected stations, and keep your coins above
              zero.
            </p>

            <section className="mb-4">
              <h2 className="h5 fw-bold mb-2">1. Objective</h2>
              <p className="mb-0">
                Reach the destination from the assigned start station before
                time runs out.
              </p>
            </section>

            <section className="mb-4">
              <h2 className="h5 fw-bold mb-2">2. Planning</h2>
              <ul className="mb-0 ps-3">
                <li>You start with 20 coins.</li>
                <li>You have 90 seconds to build the route.</li>
                <li>The route must start and end on the assigned stations.</li>
                <li>
                  You can only use connected stations, without reusing the same
                  segment.
                </li>
              </ul>
            </section>

            <section className="mb-4">
              <h2 className="h5 fw-bold mb-2">3. Execution</h2>
              <p className="mb-2">
                Once submitted, the trip runs step by step and each move can
                trigger a random event.
              </p>
              <ul className="mb-0 ps-3">
                <li>Positive: gain coins.</li>
                <li>Negative: lose coins.</li>
                <li>Neutral: no change.</li>
              </ul>
            </section>

            <section>
              <h2 className="h5 fw-bold mb-2">4. Win or Lose</h2>
              <ul className="mb-0 ps-3">
                <li>You win if you arrive with more than 0 coins.</li>
                <li>If you end with 0 coins, the run is lost.</li>
                <li>Winning scores can enter the leaderboard.</li>
              </ul>
            </section>
          </div>
        </Col>
      </Row>
    </Container>
  );
}