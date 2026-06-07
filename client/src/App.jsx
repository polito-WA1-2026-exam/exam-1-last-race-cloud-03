import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './App.css'

import { useEffect, useState } from 'react';
import { Container } from 'react-bootstrap/';

import API from "./API.js";
import FeedbackContext from "./contexts/FeedbackContext.js";

import Header from './components/Header.jsx';
import { Route, Routes, Navigate, useLocation } from 'react-router-dom';
import { LoginForm } from './components/Auth.jsx';

function App() {
  const [count, setCount] = useState(0)

  const [user, setUser] = useState(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [shouldRefresh, setShouldRefresh] = useState(true);
  

  const setFeedbackFromError = (err) => {
    let message = '';
    if (err.message) message = err.message;
    else message = "Unknown Error";
    setFeedback(message); // Assuming only one error message at a time
  };

  useEffect(() => {
      // Checking if the user is already logged-in
      // This useEffect is called only the first time the component is mounted (i.e., when the page is (re)loaded.)
      API.getUserInfo()
        .then(user => {
          setLoggedIn(true);
          setUser(user);  // here you have the user info, if already logged in
        }).catch(e => {
          if(loggedIn)    // printing error only if the state is inconsistent (i.e., the app was configured to be logged-in)
            setFeedbackFromError(e);
          setLoggedIn(false); setUser(null);
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


  return (
    <FeedbackContext.Provider value={{setFeedback, setFeedbackFromError, setShouldRefresh}}>
      <div className="min-vh-100 d-flex flex-column">
        <Header logout={handleLogout} user={user} loggedIn={loggedIn} />
        
        <Container fluid className="flex-grow-1 d-flex flex-column">
          <Routes>
            <Route path="/login" element={ /* If the user is ALREADY logged-in, redirect to root */
                loggedIn ? <Navigate replace to='/' />
                : <LoginForm login={handleLogin} />
            } />
          </Routes>
        </Container>
      </div>
    </FeedbackContext.Provider>
  )
}

export default App
