
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './App.css';

const AddContact = ({ editData, onClose }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [timezone, setTimezone] = useState('');
  const [loading, setLoading] = useState(false); 
  const navigate = useNavigate();

  const timezones = [
    { label: 'Pacific Time (US & Canada)', value: 'America/Los_Angeles' },
    { label: 'Mountain Time (US & Canada)', value: 'America/Denver' },
    { label: 'Central Time (US & Canada)', value: 'America/Chicago' },
    { label: 'Eastern Time (US & Canada)', value: 'America/New_York' },
    { label: 'Greenwich Mean Time', value: 'GMT' },
    { label: 'Central European Time', value: 'Europe/Berlin' },
    { label: 'India Standard Time', value: 'Asia/Kolkata' },
    { label: 'China Standard Time', value: 'Asia/Shanghai' },
  ];

  useEffect(() => {
    if (editData) {
      setName(editData.name || '');
      setEmail(editData.email || '');
      setPhone(editData.phone || '');
      setAddress(editData.address || '');
      setTimezone(editData.timezone || '');
    }
  }, [editData]);

  const handleAddContact = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      if (editData) {

        await axios.put(`https://screeching-chivalrous-stamp.glitch.me/contacts/${editData.id}`, {name,email,phone,address,timezone,}, {headers: { Authorization: `Bearer ${token}` },});
        alert('Contact updated successfully');
      } else {
        await axios.post('https://screeching-chivalrous-stamp.glitch.me/contacts', {name,email,phone,address,timezone,}, {headers: { Authorization: `Bearer ${token}` },});
        alert('Contact added successfully');
      }
      onClose("1");
      navigate("/contacts");
    } catch (error) {
      alert("Email already Exist/ User already Exists.");
      console.error('Error adding/updating contact', error);
    } finally {
      setLoading(false);
    }
  };

  
  return (
    <form className="contact-form" onSubmit={handleAddContact}>
      <h2 className="form-title">{editData ? "Update Contact" : "Add Contact"}</h2>      
      <input type="text" className="form-input" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required/>
      <input type="email" className="form-input" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required/>
      <input type="number" className="form-input" placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)}/>
      <input type="text" className="form-input" placeholder="Address" value={address} onChange={(e) => setAddress(e.target.value)}/>
      <select className="form-select" value={timezone} onChange={(e) => setTimezone(e.target.value)} required>
        <option value="">Select Timezone</option>
        {timezones.map((tz) => (
          <option key={tz.value} value={tz.value}>{tz.label}</option>
        ))}
      </select>
      <button type="submit" className="form-button" disabled={loading}>{loading ? <div className="spinner"></div> : (editData ? "Update Contact" : "Add Contact")} </button>
    </form>
  );
};

export default AddContact;
