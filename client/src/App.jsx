import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './App.css'

import { useEffect, useState } from 'react';
import { Container, Toast, ToastBody } from 'react-bootstrap/';

import API from "./API.js";
import FeedbackContext from "./contexts/FeedbackContext.js";

import Header from './components/Header.jsx';
import { Route, Routes, Navigate } from 'react-router-dom';
import { LoginForm } from './components/Auth.jsx';
import { RulesLayout } from './components/RulesLayout.jsx';
import { Rank } from './components/Rank.jsx';
import GameContainer from './components/phases/GameContainer.jsx';


function App() {

  const [user, setUser] = useState(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(true); // <--- NUOVO

  const setFeedbackFromError = (err) => {
    let message = '';
    if (err.message) message = err.message;
    else message = "Unknown Error";
    setFeedback(message); // Assuming only one error message at a time
  };

  useEffect(() => {
    API.getUserInfo()
      .then(user => {
        setLoggedIn(true);
        setUser(user);
        setLoading(false); 
      }).catch(e => {
        if(loggedIn) setFeedbackFromError(e);
        setLoggedIn(false); 
        setUser(null);
        setLoading(false); 
      }); 
  }, []);

  /**
   * This function handles the logout process.
   */ 
  const handleLogout = async () => {
      await API.logOut();
      // clean up everything
      setLoggedIn(false); setUser(null);
  };

  const handleLogin = async (credentials) => {
    const user = await API.logIn(credentials);
    setUser(user); setLoggedIn(true);
    setFeedback("Welcome, "+user.name);
  };

  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Caricamento sessione...</span>
        </div>
      </div>
    );
  }
  return (
    <FeedbackContext.Provider value={{setFeedback, setFeedbackFromError}}>
      <div className="min-vh-100 d-flex flex-column" style={{ minWidth: "360px" }}>
        <Header logout={handleLogout} user={user} loggedIn={loggedIn} />
        
        <Container fluid className="flex-grow-1 d-flex flex-column">
          <Routes>
            <Route path="/login" element={
                loggedIn ? <Navigate replace to='/' />
                : <LoginForm login={handleLogin} />
            } />
            <Route path="/" element={
                <RulesLayout loggedIn={loggedIn}/>
            } />
            <Route path="/rank" element={ 
                !loggedIn ? <Navigate replace to='/login'/>
                : <Rank loggedIn={loggedIn}/>
            } />
            <Route path="/play" element={
                !loggedIn ? <Navigate replace to='/login'/>
                : <GameContainer loggedIn={loggedIn}/>
            } />
          </Routes>

          <Toast
              show={feedback !== ''}
              autohide
              onClose={() => setFeedback('')}
              delay={4000}
              position="top-end"
              className="position-fixed end-0 m-3"
          >
              <ToastBody>
                  {feedback}
              </ToastBody>
          </Toast>
        </Container>
      </div>
    </FeedbackContext.Provider>
  )
}

export default App
