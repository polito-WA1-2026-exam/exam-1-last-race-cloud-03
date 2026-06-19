import LinesDao from "./dao-lines.js";

const linesDao = new LinesDao();

export function validateRoute(routeSegments, game, networkGraph) {
  if (!routeSegments || routeSegments.length === 0) {
    return { error: "Empty route", validRoute: null };
  }

  const usedSegments = new Set();
  let currentStation = Number(game.startStationId);
  
  const orderedRoute = [];

  for (let i = 0; i < routeSegments.length; i++) {
    const segment = routeSegments[i];
    const sFrom = Number(segment.from);
    const sTo = Number(segment.to);

    let nextStation = null;
    let orderedFrom = null;
    let orderedTo = null;

    if (sFrom === currentStation) {
      nextStation = sTo;
      orderedFrom = sFrom;
      orderedTo = sTo;
    } else if (sTo === currentStation) {
      nextStation = sFrom;
      orderedFrom = sTo;   
      orderedTo = sFrom;   
    } else {
      if (i === 0) {
        return { error: "Doesn't start from assigned station", validRoute: null };
      } else {
        return { error: `Segment not in order or disconnected at step ${i + 1}`, validRoute: null };
      }
    }

    const existsStandard = networkGraph[sFrom]?.neighbors.includes(sTo);
    const existsInverse = networkGraph[sTo]?.neighbors.includes(sFrom);

    if (!existsStandard && !existsInverse) {
      return { error: `Segment ${i + 1} (${sFrom} <-> ${sTo}) does not exist in the network map`, validRoute: null };
    }

    const segmentKey = [String(sFrom), String(sTo)].sort().join("-");
    if (usedSegments.has(segmentKey)) {
      return { error: `Segment ${i + 1} (${sFrom} <-> ${sTo}) has already been used in this route!`, validRoute: null };
    }
    
    usedSegments.add(segmentKey);

    orderedRoute.push({
      ...segment,
      from: orderedFrom,
      to: orderedTo
    });

    currentStation = nextStation;
  }

  if (currentStation !== Number(game.destinationStationId)) {
    return { error: "Doesn't reach final destination", validRoute: null };
  }

  return { error: null, validRoute: orderedRoute };
}

export async function generateRouteEvents(route, allEvents, graph) {
  let currentCoins = 20;
  const stepsExecuted = [];

  for (let i = 0; i < route.length; i++) {
    const fromStation = route[i].from;
    const toStation = route[i].to;

    const randomIndex = Math.floor(Math.random() * allEvents.length);
    const randomEvent = allEvents[randomIndex];

    currentCoins += randomEvent.coins;

    if (currentCoins < 0) {
      currentCoins = 0;
    }

    const stepData = {
      step: i + 1,
      from_station: fromStation,
      to_station: toStation,
      event_id: randomEvent.id,
      event_description: randomEvent.description,
      coin_effect: randomEvent.coins,
      updated_coins: currentCoins,
    };

    stepsExecuted.push(stepData);
  }

  return {totCoins: currentCoins, steps: stepsExecuted};
}

export async function buildGraph(){
  const graph = {};
  const stations = await linesDao.getStations();
  stations.forEach((s) => {
    graph[s.id] = { id: s.id, name: s.name, neighbors: [] };
  });
  const connections = await linesDao.getConnections();
  connections.forEach((c) => {
    const a = c.station1;
    const b = c.station2;
    if (!graph[a] || !graph[b]) return;
    graph[a].neighbors.push(graph[b].id);
    graph[b].neighbors.push(graph[a].id);
  });
  return graph;
};

export function getDistancesFromStart(startStationId, graph) {
  const distances = {};
  const queue = [];
  distances[startStationId] = 0;
  queue.push(startStationId);
  while (queue.length > 0) {
    const currentId = queue.shift();
    const currentStation = graph[currentId];
    if (!currentStation) continue;
    const currentDistance = distances[currentId];
    for (const neighbor of currentStation.neighbors) {
      const nid = neighbor;
      if (distances[nid] === undefined) {
        distances[nid] = currentDistance + 1;
        queue.push(nid);
      }
    }
  }
  return distances;
};