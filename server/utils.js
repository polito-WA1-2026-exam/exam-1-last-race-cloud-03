import db from "./db.js";

export function validateRoute(route, game, graph) {
  const errors = [];

  if (!Array.isArray(route) || route.length < 2) {
    errors.push({ row: -1, desc: "Not enough stations" });
  }

  const startId = String(route[0]);
  const destId = String(route[route.length - 1]);

  if (String(game.startStationId) !== startId) {
    errors.push({ row: 0, desc: "Start station does not match game start" });
  }

  if (String(game.destinationStationId) !== destId) {
    errors.push({
      row: route.length - 1,
      desc: "Route does not reach assigned destination",
    });
  }

  const usedSegments = new Set();
  
  for (let i = 0; i < route.length - 1; i++) {
    const currentId = String(route[i]);
    const nextId = String(route[i + 1]);

    const currentNode = graph[currentId];
    if (!currentNode) {
      errors.push({ row: i, desc: `Unknown station ${currentId}` });
    }

    const connectionExists = currentNode.neighbors.some(
      (n) => String(n.id) === nextId,
    );
    if (!connectionExists) {
      errors.push({
        row: i,
        desc: `Illegal connection: no direct link between station ${currentId} and station ${nextId}`,
      });
    }

    const edgeKey = [currentId, nextId].sort().join("-");
    if (usedSegments.has(edgeKey)) {
      errors.push({
        row: i,
        desc: `Segment between ${currentId} and ${nextId} reused`,
      });
    }
    usedSegments.add(edgeKey);
  }

  return { errors };
}


export async function generateRouteEvents(route) {
    const allEvents = await db.all("SELECT id, description, coins FROM events");
    
    let currentCoins = 20;
    const stepsExecuted = [];

    for (let i = 0; i < route.length - 1; i++) {
        const fromStation = route[i];
        const toStation = route[i + 1];

        const randomIndex = Math.floor(Math.random() * allEvents.length);
        const randomEvent = allEvents[randomIndex];

        currentCoins += randomEvent.coins;

        if (currentCoins < 0) {
            currentCoins = 0;
        }

        const stepData = {
            step: i + 1,
            from_station_id: fromStation,
            to_station_id: toStation,
            event_id: randomEvent.id,
            event_description: randomEvent.description,
            coin_effect: randomEvent.coins,
            updated_coins: currentCoins
        };

        stepsExecuted.push(stepData);
    }

    return stepsExecuted;
}