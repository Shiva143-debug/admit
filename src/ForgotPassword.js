import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoMdArrowRoundBack } from "react-icons/io";
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

    const backtologin=()=>{
        navigate("/login")
    }

    return (
        <form onSubmit={handleSubmit} className="register-form">
            <p className='p-2'><span><IoMdArrowRoundBack onClick={backtologin} style={{cursor:"pointer"}}/></span>  Enter Your Email For Password:</p>
            <div className="form-group">
                <label htmlFor="email">Email:</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" className="form-input" required />
            </div>

            <button type="submit" className="form-button mt-5" disabled={loading}>{loading ? <div className="spinner"></div> : "Request Password Reset"} </button>
        </form>
    );
};

export default ForgotPassword