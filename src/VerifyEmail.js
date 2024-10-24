import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const VerifyEmail = () => {
    const { token } = useParams(); // Get the token from the URL
    const navigate = useNavigate();

    useEffect(() => {
        const verifyToken = async () => {
            try {
                const response = await axios.post(`https://screeching-chivalrous-stamp.glitch.me/verify/${token}`, {
                    // Add any additional data you need here if necessary
                });
                // alert(response.data.message); // Notify user of success
                alert("Verification Done. Password Sent to your EMail check and login.")
                // Assuming you might want to store a token upon successful verification
                // localStorage.setItem('token', response.data.token);
                navigate('/login'); // Redirect to the contacts page


            } catch (error) {
                console.error('Error verifying email:', error);
                alert(error.response.data.error || 'Verification failed. Please try again.');
            }
        };

        verifyToken();
    }, [token, navigate]);

    return <div>Verifying your email...</div>; // Optional loading state or message
};

export default VerifyEmail;
