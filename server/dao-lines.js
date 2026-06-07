import db from "./db.js";
import dayjs from "dayjs";

export default function LinesDao() {
    this.getStations = () => {
        return new Promise((resolve, reject) => {
        db.all("SELECT id, name FROM station;", (err, rows) => {
            if (err) return reject(err);
            resolve(rows);
        });
        });
    }

    function getConnections() {
        return new Promise((resolve, reject) => {
        db.all("SELECT station1, station2 FROM connection;", (err, rows) => {
            if (err) return reject(err);
            resolve(rows);
        });
        });
    }

    this.buildGraph = async function () {
        // stations: id -> { id, name, neighbors: [stationObj] }
        const graph = {};
        const stations = await this.getStations();
        stations.forEach((s) => {
        graph[s.id] = { id: s.id, name: s.name, neighbors: [] };
        });

        const connections = await getConnections();
        connections.forEach((c) => {
        const a = c.station1;
        const b = c.station2;
        // Ignore unknown stations (defensive)
        if (!graph[a] || !graph[b]) return;
        graph[a].neighbors.push(graph[b]);
        graph[b].neighbors.push(graph[a]);
        });

        return graph;
    };

    this.getDistancesFromStart = function (startStationId, graph) {
        const distances = {};
        const queue = [];

        // startStationId deve essere l'id (number|string) della stazione
        distances[startStationId] = 0;
        queue.push(startStationId);

        while (queue.length > 0) {
        const currentId = queue.shift();
        const currentStation = graph[currentId];
        if (!currentStation) continue; // difensivo

        const currentDistance = distances[currentId];

        // Esplora le stazioni vicine (currentStation.neighbors contiene oggetti stazione)
        for (const neighbor of currentStation.neighbors) {
            const nid = neighbor.id;
            if (distances[nid] === undefined) {
            // Se non è ancora stata visitata
            distances[nid] = currentDistance + 1;
            queue.push(nid);
            }
        }
        }
        return distances; // { '1': 0, '2': 1, '5': 3, ... }
    };

    this.addGame = (userId, startStationId, destinationStationId) => {
        return new Promise((resolve, reject) => {
            db.run(
                `INSERT INTO game (userid, startstationid, destinationstationid, status, created_at) VALUES (?, ?, ?, 'PLANNING', ?)`,
                [
                userId,
                startStationId,
                destinationStationId,
                dayjs().format("YYYY-MM-DD HH:MM:SS"),
                ],
                function (err) {
                if (err) return reject(err);
                resolve(this.lastID);
                },
            );
        });
    };

    this.getRank = () => {
        return new Promise((resolve, reject) => {
            db.all(
                `SELECT username, coins FROM game, user 
                    WHERE STATUS="COMPLETED" AND user.id=game.userid ORDER BY coins;`,
                function (err, rows) {
                if (err) return reject(err);
                else return resolve(rows);
                },
            );
        });
    };

    this.getGame = (gameId, userId) => {
        return new Promise((resolve, reject) => {
            db.get(
                `SELECT * FROM game WHERE id=? AND userid=?;`,
                [gameId, userId],
                function (err, rows) {
                if (err) return reject(err);
                else return resolve(rows);
                },
            );
        });
    }

    this.invalidateGame = (gameId) => {
        return new Promise((resolve, reject) => {
            db.run(`UPDATE game SET status="INVALID" WHERE id=?`,
                [gameId],
                function (err) {
                    if (err) return reject(err);
                    resolve(this.changes);
                }
            );
        });
    }
}
