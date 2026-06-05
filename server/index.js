// imports
import express from "express";
import session from 'express-session';
import morgan from 'morgan'; // logging middleware
import cors from 'cors'; // CORS middleware

import passport from 'passport';
import LocalStrategy from 'passport-local';

// init express
const app = new express();
app.use(morgan('dev'));
app.use(express.json());
const port = 3001;


////PASSPORT THINGS
passport.use(new LocalStrategy(async function verify(username, password, callback) {
    const user = await userDao.getUserByCredentials(username, password)
    if(!user)
      return callback(null, false, 'Incorrect username or password');

    return callback(null, user); // NOTE: user info in the session (all fields returned by userDao.getUserByCredentials(), i.e, id, username, name)
}));

// Serializing in the session the user object given from LocalStrategy(verify).
passport.serializeUser(function (user, callback) { // this user is id + username + name
    callback(null, user);
});

// Starting from the data in the session, we extract the current (logged-in) user.
passport.deserializeUser(function (user, callback) { // this user is id + email + name
    return callback(null, user); // this will be available in req.user

    // In this method, if needed, we can do extra check here (e.g., double check that the user is still in the database, etc.)
    // e.g.: return userDao.getUserById(id).then(user => callback(null, user)).catch(err => callback(err, null));
});

app.use(session({
  secret: "This is a very secret information used to initialize the session!",
  resave: false,
  saveUninitialized: false,
}));
app.use(passport.authenticate('session'));

/** Defining authentication verification middleware **/
const isLoggedIn = (req, res, next) => {
    if(req.isAuthenticated()) {
      return next();
    }
    return res.status(401).json({error: 'Not authorized'});
};



/*** Users APIs ***/

// POST /api/sessions
// This route is used for performing login.
app.post('/api/sessions', function(req, res, next) {
  passport.authenticate('local', (err, user, info) => {
    if (err)
      return next(err);
      if (!user) {
        // display wrong login messages
        return res.status(401).json({ error: info});
      }
      // success, perform the login and extablish a login session
      req.login(user, (err) => {
        if (err)
          return next(err);
        // req.user contains the authenticated user, we send all the user info back
        // this is coming from userDao.getUserByCredentials() in LocalStratecy Verify Function
        return res.json(req.user);
      });
  })(req, res, next);
});

// GET /api/sessions/current
// This route checks whether the user is logged in or not.
app.get('/api/sessions/current', (req, res) => {
  if(req.isAuthenticated()) {
    res.status(200).json(req.user);}
  else
    res.status(401).json({error: 'Not authenticated'});
});

// DELETE /api/session/current
// This route is used for loggin out the current user.
app.delete('/api/sessions/current', (req, res) => {
  req.logout(() => {
    res.end();
  });
});



// activate the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});

