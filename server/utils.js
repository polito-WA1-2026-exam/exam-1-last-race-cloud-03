import LinesDao from "./dao-lines.js";

const linesDao = new LinesDao();


/// function that validate the route
/// the route segment is an array of from, to object(not sorted)
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

    let orderedFrom = null;
    let orderedTo = null;

    // sort of the stations
    if (sFrom === currentStation) {
      currentStation = sTo;
      orderedFrom = sFrom;
      orderedTo = sTo;
    } else if (sTo === currentStation) {
      currentStation = sFrom;
      orderedFrom = sTo;   
      orderedTo = sFrom;   
    } else {
      if (i === 0) {
        return { error: "Doesn't start from assigned station", validRoute: null };
      } else {
        return { error: `Segment not in order or disconnected at step ${i + 1}`, validRoute: null };
      }
    }

    //control if user add not real segments
    const existsStandard = networkGraph[sFrom]?.includes(sTo);
    const existsInverse = networkGraph[sTo]?.includes(sFrom);

    if (!existsStandard && !existsInverse) {
      return { error: `Segment ${i + 1} (${sFrom} <-> ${sTo}) does not exist in the network map`, validRoute: null };
    }

    //control if double use of segments
    const segmentKey = [String(sFrom), String(sTo)].sort().join("-");
    if (usedSegments.has(segmentKey)) {
      return { error: `Segment ${i + 1} (${sFrom} <-> ${sTo}) has already been used in this route!`, validRoute: null };
    }
    
    usedSegments.add(segmentKey);

    orderedRoute.push({
      from: orderedFrom,
      to: orderedTo
    });
  }

  //control if last station is not the final destination
  if (currentStation !== Number(game.destinationStationId)) {
    return { error: "Doesn't reach final destination", validRoute: null };
  }

  return { error: null, validRoute: orderedRoute };
}

export function generateRouteEvents(route, allEvents) {
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
    graph[s.id] = [];
  });
  const connections = await linesDao.getConnections();
  connections.forEach((c) => {
    const a = c.station1;
    const b = c.station2;
    if (!graph[a] || !graph[b]) return;
    graph[a].push(b);
    graph[b].push(a);
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
    for (const neighbor of currentStation) {
      const nid = neighbor;
      if (distances[nid] === undefined) {
        distances[nid] = currentDistance + 1;
        queue.push(nid);
      }
    }
  }
  return distances;
};