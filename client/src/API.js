
const SERVER_URL = 'http://localhost:3001/api';

const logIn = async (credentials) => {
    return await fetch(SERVER_URL + '/sessions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',  // this parameter specifies that authentication cookie must be forwared. It is included in all the authenticated APIs.
        body: JSON.stringify(credentials),
    }).then(handleInvalidResponse)
    .then(response => response.json());
};
  

const getUserInfo = async () => {
    return await fetch(SERVER_URL + '/sessions/current', {
        credentials: 'include'
    }).then(handleInvalidResponse)
    .then(response => response.json());
};


const logOut = async() => {
  return await fetch(SERVER_URL + '/sessions/current', {
    method: 'DELETE',
    credentials: 'include'
  }).then(handleInvalidResponse);
}

function handleInvalidResponse(response) {
    if (!response.ok) { throw Error(response.statusText) }
    let type = response.headers.get('Content-Type');
    if (type !== null && type.indexOf('application/json') === -1){
        throw new TypeError(`Expected JSON, got ${type}`)
    }
    return response;
}

function getRank() {
    return fetch(SERVER_URL + '/rank', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include',
    }).then(handleInvalidResponse)
}

function startNewGame() {
    return fetch(SERVER_URL + '/game/start', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include',
    }).then(handleInvalidResponse)
}

function getAllSegments() {
    return fetch(SERVER_URL + '/segments', {
        method: 'GET',
        headers: {
            'Accept': 'application/json'
        },
        credentials: 'include' 
    })
    .then(handleInvalidResponse);
}

function getAllStations() {
    return fetch(SERVER_URL + '/stations', {
        method: 'GET',
        headers: {
            'Accept': 'application/json'
        },
        credentials: 'include' 
    })
    .then(handleInvalidResponse);
}

function endGame(gameId, routes) {
    return fetch(SERVER_URL + '/game/end', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            gameId: Number(gameId),
            route: routes
        }),
        credentials: 'include' 
    })
    .then(handleInvalidResponse);
}

const API = {logIn, getUserInfo, logOut, getRank, startNewGame, getAllSegments, getAllStations, endGame};
export default API;
