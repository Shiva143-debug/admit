import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import ForgotPassword from "./ForgotPassword"
import ContactList from './ContactList';
import UploadFile from './UploadFile';
import VerifyEmail from "./VerifyEmail"
import Login from './Login';
import Register from './Register';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

const App = () => {
  const isAuthenticated = !!localStorage.getItem('token'); 

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Register />} />
          <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/contacts" />}
            />
          <Route path="/forgotPassword" element={<ForgotPassword />} />
          <Route path="/verify/:token" element={<VerifyEmail />} />
          {isAuthenticated && (
            <>
              <Route path="/contacts" element={<ContactList />} />
              <Route path="/upload-file" element={<UploadFile />} />
            </>
          )}
          <Route path="*" element={<Navigate to={isAuthenticated ? '/contacts' : '/login'} />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
