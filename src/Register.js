

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import axios from 'axios';
import "./App.css"


const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post('https://screeching-chivalrous-stamp.glitch.me/register', { name, email, mobileNumber, address });
      if (response.data.success === true) {
        alert(response.data.message)
        // navigate("/register")
      }
    } catch (error) {
      alert("An error Occured! Please try again Later")
    }
    finally {
      setLoading(false);
    }
  };

  const onlogin = () => {
    navigate("/login")
  }

  return (
    <div className='form-container'> 
      <form onSubmit={handleRegister} className="register-form">
        <h2 className="form-title">Register</h2>
        <p>If you already have an Account?<span onClick={onlogin} style={{ color: "blue", cursor: "pointer" }}>Login</span></p>
        <div className="form-group">
          <label htmlFor="name">Name: </label>
          <input className='form-input' type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" required/>
        </div>

        <div className="form-group">
          <label htmlFor="email">Email: </label>
          <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="form-input" required/>
        </div>

        <div className="form-group">
          <label htmlFor="mobileNumber">Mobile Number: </label>
          <input type="text" id="mobileNumber" value={mobileNumber} onChange={(e) => {const val = e.target.value;
              if (/^\d{0,10}$/.test(val)) {
                setMobileNumber(val);
              }
            }} placeholder="Mobile Number" className="form-input" required/>
        </div>

        <div className="form-group ">
          <label htmlFor="address">Address: </label>
          <input type="text" id="address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Address" className="form-input" required/>
        </div>

        <button type="submit" className="form-button mt-3" disabled={loading}>
          {loading ? <div className="spinner"></div> : "Register"}
        </button>
      </form>


    </div>
  );
};

export default Register;
