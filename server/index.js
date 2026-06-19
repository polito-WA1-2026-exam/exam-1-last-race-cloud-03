// imports
import express from "express";
import session from "express-session";
import morgan from "morgan"; // logging middleware
import cors from "cors"; // CORS middleware
import dayjs from "dayjs";

import passport from "passport";
import LocalStrategy from "passport-local";
import UserDao from "./dao-users.js";
import LinesDao from "./dao-lines.js";

import {validateRoute,  generateRouteEvents, buildGraph, getDistancesFromStart} from "./utils.js";

const userDao = new UserDao();
const linesDao = new LinesDao();

// init express
const app = new express();
app.use(morgan("dev"));
app.use(express.json());
const port = 3001;

/** Set up and enable Cross-Origin Resource Sharing (CORS) **/
const corsOptions = {
  origin: "http://localhost:5173",
  credentials: true,
};
app.use(cors(corsOptions));

let MAIN_GRAPH = {};

async function initializeServer() {
  console.log("loading metro graph from DB...");

  MAIN_GRAPH = await buildGraph();
  console.log("Metro network loaded successfully");
}

////PASSPORT THINGS
passport.use(
  new LocalStrategy(async function verify(username, password, callback) {
    const user = await userDao.getUserByCredentials(username, password);
    if (!user) return callback(null, false, "Incorrect username or password");

    return callback(null, user); // NOTE: user info in the session (all fields returned by userDao.getUserByCredentials(), i.e, id, username, name)
  }),
);

// Serializing in the session the user object given from LocalStrategy(verify).
passport.serializeUser(function (user, callback) {
  // this user is id + username + name
  callback(null, user);
});

// Starting from the data in the session, we extract the current (logged-in) user.
passport.deserializeUser(function (user, callback) {
  // this user is id + email + name
  return callback(null, user); // this will be available in req.user

  // In this method, if needed, we can do extra check here (e.g., double check that the user is still in the database, etc.)
  // e.g.: return userDao.getUserById(id).then(user => callback(null, user)).catch(err => callback(err, null));
});

app.use(
  session({
    secret: "This is a very secret information used to initialize the session!",
    resave: false,
    saveUninitialized: false,
  }),
);
app.use(passport.authenticate("session"));

/** Defining authentication verification middleware **/
const isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ error: "Not authorized" });
};

/*** Users APIs ***/

// POST /api/sessions
// This route is used for performing login.
app.post("/api/sessions", function (req, res, next) {
  passport.authenticate("local", (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      // display wrong login messages
      return res.status(401).json({ error: info });
    }
    // success, perform the login and extablish a login session
    req.login(user, (err) => {
      if (err) return next(err);
      // req.user contains the authenticated user, we send all the user info back
      // this is coming from userDao.getUserByCredentials() in LocalStratecy Verify Function
      return res.json(req.user);
    });
  })(req, res, next);
});

// GET /api/sessions/current
// This route checks whether the user is logged in or not.
app.get('/api/sessions/current', (req, res) => {
  if (req.isAuthenticated()) {
    return res.status(200).json(req.user); 
  }
  return res.status(200).json({ loggedIn: false }); 
});

// DELETE /api/session/current
// This route is used for loggin out the current user.
app.delete("/api/sessions/current", (req, res) => {
  req.logout(() => {
    res.end();
  });
});

/*** lines APIs ***/
// 1. start the game
// POST /api/game/start
app.post("/api/game/start", isLoggedIn, async (req, res) => {
  const userId = req.user.id;

  const allStationIds = Object.keys(MAIN_GRAPH);
  let startStationId;
  let validDestinations = [];

  while (validDestinations.length === 0) {
    startStationId =
      allStationIds[Math.floor(Math.random() * allStationIds.length)];
    const distances = getDistancesFromStart(
      startStationId,
      MAIN_GRAPH,
    );
    validDestinations = Object.keys(distances).filter(
      (id) => distances[id] >= 3,
    );
  }

  const destinationStationId =
    validDestinations[Math.floor(Math.random() * validDestinations.length)];

  const newGameId = await linesDao.addGame(
    userId,
    startStationId,
    destinationStationId,
  );

  res.json({
    gameId: newGameId,
    startStationId: parseInt(startStationId),
    destinationStationId: parseInt(destinationStationId),
  });
});

app.post("/api/game/end", isLoggedIn, async (req, res) => {
  const userId = req.user.id;

  const finishTime = dayjs();

  const { gameId, route } = req.body || {};
  if (!gameId)
    return res.status(400).json({ error: "Missing gameId in request body" });
  const game = await linesDao.getGame(parseInt(gameId, 10), userId);

  if (!game || game.status !== "PLANNING") 
    return res.status(404).json({ error: "Game invalid or not associated with current user" });

  const startTime = dayjs(game.created_at);
  const secondsElapsed = finishTime.diff(startTime, 'second');

  if (secondsElapsed > 94) {
    linesDao.invalidateGame(gameId);
    
    return res.status(400).json({ 
      error: "Timeout expired! You exceeded the 90 seconds limit.",
      secondsElapsed: secondsElapsed
    });
  }

  const validation =  validateRoute(route, game, MAIN_GRAPH);

  if(validation.error){
    linesDao.completeGame(gameId, 0);
    return res.json({
      error: validation.error
    })
  } 

  const finalRoute = validation.validRoute;

  const allEvents = await linesDao.getEvents();

  const response = await generateRouteEvents(finalRoute, allEvents, MAIN_GRAPH);

  linesDao.completeGame(gameId, response.totCoins);

  res.json( response );
});

app.get("/api/stations", isLoggedIn, async (req, res) => {
  try {
    const stations = await linesDao.getStations();
    res.json(stations);
  } catch (err) {
    console.error("Errore nel recupero stazioni:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/segments", isLoggedIn, async (req, res) => {
  let segments = [];
  const visti = new Set();
  let idContatore = 1;

  for (const stationId in MAIN_GRAPH) {
        const station = MAIN_GRAPH[stationId];
        
        station.neighbors.forEach((neighborId) => {
            const coppiaChiave = [station.id, neighborId].sort().join('-');

            if (!visti.has(coppiaChiave)) {
                visti.add(coppiaChiave); 

                segments.push({
                    id: idContatore++, 
                    from: station.id,
                    to: neighborId
                });
            }
        });
    }

    res.json(segments)
});

app.get("/api/rank", isLoggedIn, async (req, res) => {
  const rank = await linesDao.getRank();

  res.json({
    rank,
  });
});

// activate the server
app.listen(port, async () => {
  await initializeServer();
  console.log(`Server listening at http://localhost:${port}`);
});
