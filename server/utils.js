export function validateRoute(routeSegments, game, networkGraph) {
  if (!routeSegments || routeSegments.length === 0) {
    return { error: "Empty route" };
  }

  const firstSegment = routeSegments[0];
  if (firstSegment.from !== game.startStationId) {
    return { error: "Doesn't start from assigned station" };
  }

  let last_station = null;
  
  const usedSegments = new Set();

  for (let i = 0; i < routeSegments.length; i++) {
    const segment = routeSegments[i];

    const availableSegment = networkGraph[segment.from].neighbors.includes(segment.to);
    if (!availableSegment) {
      return { error: `Segment ${i + 1} does not exist` };
    }

    if (i != 0) {
      if (last_station != segment.from) {
        return { error: `Segment not in order` };
      }
    }

    const segmentKey = [String(segment.from), String(segment.to)].sort().join("-");

    if (usedSegments.has(segmentKey)) {
      return { error: `Segment ${i + 1} (${segment.from} <-> ${segment.to}) has already been used in this route!` };
    }
    
    usedSegments.add(segmentKey);
    last_station = segment.to;
  }

  const lastSegment = routeSegments[routeSegments.length - 1];
  if (lastSegment.to !== game.destinationStationId) {
    return { error: "Doesn't reach final destination" };
  }

  return null;
}

export async function generateRouteEvents(route, allEvents) {
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
      from_station_id: fromStation,
      to_station_id: toStation,
      event_id: randomEvent.id,
      event_description: randomEvent.description,
      coin_effect: randomEvent.coins,
      updated_coins: currentCoins,
    };

    stepsExecuted.push(stepData);
  }

  return stepsExecuted;
}
