import { Container, Table } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

export function Rank(props) {
  const data = [];
  return (
    <Container className="py-4 py-md-5">
      {props.loggedIn && (
        <Container>
          <h2 className="text-center mb-4">🏆 Global Leaderboard 🏆</h2>

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
                <th>Achieved At</th>
              </tr>
            </thead>
            <tbody className="text-center align-middle">
              {data.map((row, index) => {
                const rank = index + 1;
                const isMe =
                  currentUser && currentUser.username === row.username;

                let rankDisplay = rank;
                if (rank === 1) rankDisplay = "🥇";
                if (rank === 2) rankDisplay = "🥈";
                if (rank === 3) rankDisplay = "🥉";

                return (
                  <tr
                    key={index}
                    className={isMe ? "table-warning fw-bold" : ""}
                  >
                    <td>{rankDisplay}</td>
                    <td>
                      {row.username}{" "}
                      {isMe && (
                        <span className="badge bg-primary ms-1">Tu</span>
                      )}
                    </td>
                    <td className="text-success">{row.best_score} 🪙</td>
                    <td className="text-muted text-sm">
                      {new Date(row.created_at).toLocaleDateString("it-IT", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </td>
                  </tr>
                );
              })}

              {data.length === 0 && (
                <tr>
                  <td colSpan="4" className="text-muted py-4">
                    Nessuna partita completata finora. Sii il primo!
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
