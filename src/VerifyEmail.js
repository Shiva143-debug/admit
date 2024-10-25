import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const VerifyEmail = () => {
    const { token } = useParams(); 
    const navigate = useNavigate();

    useEffect(() => {
        const verifyToken = async () => {
            try {
                 await axios.post(`https://screeching-chivalrous-stamp.glitch.me/verify/${token}`, {
                });
                alert("Verification Done. Password Sent to your EMail check and login.")
                navigate('/login');
            } catch (error) {
                console.error('Error verifying email:', error);
                alert("Already Verification Done. Please Login with valid credentials. check the mail for password");
                navigate('/login');
            }
        };

        verifyToken();
    }, [token, navigate]);

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <h1>Verifying your email...</h1>
        </div>
      );
      
};

export default VerifyEmail;
