import db from "./db.js";
import dayjs from "dayjs";

//// All the query with db, exluded that refears to users

export default function LinesDao() {
    this.getStations = () => {
        return new Promise((resolve, reject) => {
        db.all("SELECT id, name FROM station ORDER BY id;", (err, rows) => {
            if (err) return reject(err);
            resolve(rows);
        });
        });
    }

    this.getConnections = () => {
        return new Promise((resolve, reject) => {
        db.all("SELECT station1, station2 FROM connection;", (err, rows) => {
            if (err) return reject(err);
            resolve(rows);
        });
        });
    }

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
                `SELECT 
                    u.id AS userId, 
                    username, 
                    MAX(g.coins) AS coins
                FROM game g
                JOIN user u ON g.userId = u.id
                WHERE g.status = 'COMPLETED'
                GROUP BY u.id, u.username
                ORDER BY coins DESC LIMIT 20;`,
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
            db.run(
                `UPDATE game SET status="INVALID" WHERE id=?`,
                function (err) {
                    if (err) return reject(err);
                    resolve(this.changes);
                }
            );
        });
    }

    this.getEvents = () => {
        return new Promise((resolve, reject) => {
            db.all("SELECT id, description, coins FROM events", 
                function (err, rows) {
                if (err) return reject(err);
                else return resolve(rows);
                },
            );
        })
    }

    this.completeGame = (gameId, coins) => {
        return new Promise((resolve, reject) => {
            db.run(`UPDATE game SET status = "COMPLETED", coins=?  WHERE id=?`,
                [coins, gameId], 
                function (err, rows) {
                    if (err) return reject(err);
                    if (this.changes === 0) {
                        return reject(new Error(`Game with ID ${gameId} not found.`));
                    }
                    return resolve(true);
                }
            );
        })
    }
}
