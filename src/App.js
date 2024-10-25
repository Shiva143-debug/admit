import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import ForgotPassword from "./ForgotPassword"
import ContactList from './ContactList';
import VerifyEmail from "./VerifyEmail"
import Login from './Login';
import Register from './Register';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

const App = () => {
  // const isAuthenticated = !!localStorage.getItem('token');

  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));

  useEffect(() => {
    const handleTokenChange = () => {
      setIsAuthenticated(!!localStorage.getItem('token'));
    };

    window.addEventListener('storage', handleTokenChange); // listens to localStorage changes

    return () => {
      window.removeEventListener('storage', handleTokenChange);
    };
  }, []);


  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Register />} />
          <Route path="/login"  element={!localStorage.getItem('token') ? <Login /> : <Navigate to="/contacts" />}/> 
          <Route path="/contacts" element={localStorage.getItem('token') ? <ContactList /> : <Navigate to="/login" />} />

          {/* <Route path="/login" element={<Login />} />
          <Route path="/contacts" element={<ContactList />} /> */}

          <Route path="/forgotPassword" element={<ForgotPassword />} />
          <Route path="/verify/:token" element={<VerifyEmail />} />
          {/* {isAuthenticated && (
            <>
              <Route path="/contacts" element={<ContactList />} />
            </>
          )} */}
          <Route path="*" element={<Navigate to={localStorage.getItem('token') ? '/contacts' : '/login'} />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
