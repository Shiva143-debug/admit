

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import "./App.css"

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post('https://screeching-chivalrous-stamp.glitch.me/login', { email, password, });
      localStorage.setItem('token', response.data.token);
      alert("login successful");
      navigate("/contacts");
    } catch (error) {
      alert('Invalid login credentials');
    }
    finally {
      setLoading(false);
    }
  };

  const onRegister = () => {
    navigate("/")
  }

  const forgotPassword = () => {
    navigate("/forgotPassword")
  }

  return (
    <form onSubmit={handleLogin} className="register-form">
      <h2 className="form-title">Login</h2>
      <p>If you don't have already an Account? <span onClick={onRegister} style={{ color: "blue", cursor: "pointer" }}>Register</span></p>
      <div className="form-group">
        <label htmlFor="email">Email:</label>
        <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="form-input" required />
      </div>

      <div className="form-group">
        <label htmlFor="password">Password: </label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="form-input" required />
      </div>

      <p style={{ float: "right", color: "blue", cursor: "pointer" }} onClick={forgotPassword}>Forgot Password?</p>
      <button type="submit" className="form-button mt-5" disabled={loading}>{loading ? <div className="spinner"></div> : "Login"} </button>
    </form>
  );
};

export default Login;
