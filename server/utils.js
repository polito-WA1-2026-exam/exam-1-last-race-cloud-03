import db from "./db.js";

export function validateRoute(routeSegments, game, networkGraph) {
  if (!routeSegments || routeSegments.length === 0) {
    return {error: "Empty route" };
  }

  const firstSegment = routeSegments[0];
  if (firstSegment.from !== game.startStationId) {
    return { error: "Doesn't start from assigned station" };
  }

  let last_station = null;

  for (let i = 0; i < routeSegments.length; i++) {
    const segment = routeSegments[i];

    const availableSegment = networkGraph[segment.from].neighbors.contains(segment.to());

    if(!availableSegment){
      return { error: `Segment ${i+1} does not exist` };
    }

    if (i!=0) {
      if (last_station!=segment.from) {
        return {
          error: `Segment not in order`,
        };
      }
    }
    last_station = segment.to;
  }

  const lastSegment = routeSegments[routeSegments.length - 1];
  if (lastSegment.to !== game.destinationStationId) {
    return { error: "Doesn't reach final destination" };
  }

  return null;
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
      updated_coins: currentCoins,
    };

    stepsExecuted.push(stepData);
  }

  return stepsExecuted;
}
