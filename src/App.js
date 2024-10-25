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
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  useEffect(() => {
    const handleTokenChange = () => {
      setIsAuthenticated(!!localStorage.getItem('token'));
    };
    window.addEventListener('storage', handleTokenChange);
    return () => {
      window.removeEventListener('storage', handleTokenChange);
    };
  }, []);


  return (
    <Router>
      <div className="App">
      <Routes>
          <Route path="/" element={!isAuthenticated ? <Register/> : <Navigate to="/contacts" />} />
          <Route path="/login" element={!isAuthenticated ? <Login setIsAuthenticated={setIsAuthenticated} /> : <Navigate to="/contacts" />} />
          <Route path="/contacts" element={isAuthenticated ? <ContactList setIsAuthenticated={setIsAuthenticated}/> : <Navigate to="/login" />} />
          <Route path="/forgotPassword" element={!isAuthenticated ? <ForgotPassword/> : <Navigate to="/contacts" />} />
          <Route path="/verify/:token" element={<VerifyEmail />} />
          <Route path="*" element={<Navigate to={isAuthenticated ? '/contacts' : '/login'} />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
