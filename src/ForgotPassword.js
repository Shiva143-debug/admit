import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import axios from 'axios';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false); 
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true); 
        try {
            const response = await axios.post('https://screeching-chivalrous-stamp.glitch.me/request-password-reset', { email });
            alert(response.data.message);
            navigate("/login")
        } catch (error) {
            alert(error.response.data.error);
        }
        finally {
            setLoading(false); 
           
          }
    };

    return (
        <form onSubmit={handleSubmit} className="login-form">
            <p className='p-2'>Enter Your Email For Password:</p>
            <input  type="email"  value={email}  onChange={(e) => setEmail(e.target.value)}  placeholder="Enter your email"  className="form-input" required />
            <button type="submit" className="form-button" disabled={loading}>{loading ? <div className="spinner"></div> : "Request Password Reset"} </button>
        </form>
    );
};

export default ForgotPassword