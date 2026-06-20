import { useEffect, useState } from "react";
import { SetupPhase } from "./SetupPhase";
import { PlanningPhase } from "./PlanningPhase";
import { ExecutionPhase } from "./ExecutionPhase";
import { EndingPhase } from "./EndingPhase";
import API from "../../API";

export default function GameContainer(props) {
  // phases: 'SETUP', 'PLANNING', 'EXECUTION', 'ENDING'
  const [gameGoals, setGameGoals] = useState(null);
  const [gameResults, setGameResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [segments, setSegments] = useState([]);
  const [stations, setStations] = useState([]);

  const handleGenerateGame = () => {
    setLoading(true);
    API.startNewGame()
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load game targets");
        return res.json();
      })
      .then((json) => {
        setGameGoals(json);
        props.setCurrentPhase("PLANNING");
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error generating game phase:", err);
        setLoading(false);
        alert("Server unreachable. Please try again.");
      });
  };

  useEffect(() => {
    props.setCurrentPhase("SETUP");

    Promise.all([
      API.getAllSegments().then((res) => {
        if (!res.ok) throw new Error("Failed to load map segments");
        return res.json();
      }),
      API.getAllStations().then((res) => {
        if (!res.ok) throw new Error("Failed to load map stations");
        return res.json();
      }),
    ])
      .then(([segmentsData, stationsData]) => {
        setSegments(segmentsData);
        setStations(stationsData);
      })
      .catch((err) => {
        console.error("Critical error loading map infrastructure:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleRestartGame = () => {
    setGameGoals(null);
    setGameResults(null);
    props.setCurrentPhase("SETUP");
  };

  if (!props.loggedIn) {
    return null;
  }

  if (loading)
    return (
      <div className="text-center mt-5">
        Generating metro transit route... 🚇
      </div>
    );

  switch (props.currentPhase) {
    case "SETUP":
      return <SetupPhase onPlay={handleGenerateGame} />;

    case "PLANNING":
      return (
        <PlanningPhase
          gameGoals={gameGoals}
          segments={segments}
          stations={stations}
          setCurrentPhase={props.setCurrentPhase}
          onGameEnd={(results) => {
            setGameResults(results);
          }}
        />
      );

    case "EXECUTION":
      return (
        <ExecutionPhase
          gameResults={gameResults}
          stations={stations}
          onGameEnd={() => {
            props.setCurrentPhase("ENDING");
          }}
        />
      );

    case "ENDING":
      return (
        <EndingPhase gameResults={gameResults} onRestart={handleRestartGame} />
      );

    default:
      return (
        <div className="text-center mt-5">
          Internal Error: Invalid game phase state.
        </div>
      );
  }
}
