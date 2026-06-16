import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './App.css'

import { useEffect, useState } from 'react';
import { Container} from 'react-bootstrap/';

import API from "./API.js";

import Header from './components/Header.jsx';
import { Route, Routes, Navigate } from 'react-router-dom';
import { LoginForm } from './components/Auth.jsx';
import { RulesLayout } from './components/RulesLayout.jsx';
import { Rank } from './components/Rank.jsx';
import GameContainer from './components/phases/GameContainer.jsx';


function App() {

  const [user, setUser] = useState(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentPhase, setCurrentPhase] = useState('SETUP');

  useEffect(() => {
    API.getUserInfo()
      .then(user => {
        setLoggedIn(true);
        setUser(user);
        setLoading(false); 
      }).catch(e => {
        setLoggedIn(false); 
        setUser(null);
        setLoading(false); 
      }); 
  }, [loggedIn]);

  /**
   * This function handles the logout process.
   */ 
  const handleLogout = async () => {
      await API.logOut();
      // clean up everything
      setLoggedIn(false); setUser(null);
      setCurrentPhase("SETUP");
  };

  const handleLogin = async (credentials) => {
    const user = await API.logIn(credentials);
    setUser(user); setLoggedIn(true);
  };

  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Session loading...</span>
        </div>
      </div>
    );
  }
  return (
      <div className="min-vh-100 d-flex flex-column" style={{ minWidth: "360px" }}>
        <Header logout={handleLogout} user={user} loggedIn={loggedIn} currentPhase={currentPhase} setCurrentPhase={setCurrentPhase}/>
        
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
                : <GameContainer loggedIn={loggedIn} setCurrentPhase={setCurrentPhase} currentPhase={currentPhase}/>
            } />
          </Routes>
        </Container>
      </div>
  )
}

export default App
