
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { randomBytes } = require('crypto'); 
const moment = require('moment-timezone');
const { createObjectCsvWriter } = require('csv-writer');
const fs = require('fs');
const path = require('path');
const { format } = require('date-fns'); 

const xlsx = require('xlsx');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());


//I used my personal database

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL,
        pass: 'sdjb lfai xtyx osrx',
    },
});

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);   
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

const sendVerificationEmail = async (user) => {
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    const url = `https://admit-one.vercel.app//verify/${token}`;
    const mailOptions = {
        from: process.env.EMAIL,
        to: user.email,
        subject: 'Email Verification',
        html: `<p>Please click the link below to verify your email to enter into the application:</p><a href="${url}">${url}</a>`,
    };
    console.log(mailOptions)

    await transporter.sendMail(mailOptions);
};

app.post('/register', async (req, res) => {
    const { email , name, mobileNumber, address} = req.body;
    const checkDuplicateEmailQuery = 'SELECT COUNT(*) FROM users WHERE email = $1';

    try {
        // Check for duplicate email
        const result = await pool.query(checkDuplicateEmailQuery, [email]);
        const emailExists = parseInt(result.rows[0].count, 10) > 0;

        if (emailExists) {
            return res.status(400).json({ error: "Email already exists. Please use a different email address." });
        } else {
            // Create a verification token
            const verificationToken = jwt.sign({ email, name, mobileNumber, address }, process.env.JWT_SECRET, { expiresIn: '1d' });
            const verificationUrl = `${verificationToken}`;

            // Prepare the email for verification
            const mailOptions = {
                from: process.env.EMAIL,
                to: email,
                subject: 'Email Verification',
                html: `<p>Please click the link below to verify your email:</p><a href="https://admit-one.vercel.app//verify/${verificationToken}">${verificationUrl}</a>`,
            };

            // Send the verification email
            await transporter.sendMail(mailOptions);

            return res.json({ success: true, message: "Registration successful. Please check your email to verify." });
        }
    } catch (error) {
        console.error("Error during registration:", error);
        return res.status(500).json({ error: "An error occurred during registration. Please try again!" });
    }
});

app.post('/verify/:token', async (req, res) => {
    const { token } = req.params;

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log(token);
        console.log(process.env.JWT_SECRET);
        const { email, name, mobileNumber, address } = decoded;
        const checkEmailQuery = 'SELECT COUNT(*) FROM users WHERE email = $1';
        const emailCheckResult = await pool.query(checkEmailQuery, [email]);
        const emailExists = parseInt(emailCheckResult.rows[0].count, 10) > 0;
        if (emailExists) {
            return res.status(400).json({ error: "Email already exists. Please use a different email address." });
        }
        const password = Math.floor(100000 + Math.random() * 900000).toString(); 
        const hashedPassword = await bcrypt.hash(password, 10);
        const insertUserQuery = 'INSERT INTO users (email, name, mobileNumber, address, password) VALUES ($1, $2, $3, $4, $5)';
        await pool.query(insertUserQuery, [email, name, mobileNumber, address, hashedPassword]);
        const mailOptions = {
            from: process.env.EMAIL,
            to: email,
            subject: 'Your Account has been Verified',
            html: `<p>Dear ${name},</p>
                   <p>Your account has been verified successfully!</p>
                   <p>Your password is: <strong>${password}</strong></p>
                   <p>Please keep it safe and do not share it with anyone.</p>`,
        };
        await transporter.sendMail(mailOptions);
        return res.json({ success: true, message: "Email verified successfully! A confirmation email with your password has been sent." });
    } catch (error) {
        console.error('Error verifying token:', error);
        return res.status(400).json({ error: "Invalid or expired token." });
    }
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = result.rows[0];
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({ token });
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ message: 'Error logging in', error });
    }
});

app.post('/request-password-reset', async (req, res) => {
    const { email } = req.body;
    const checkUserQuery = 'SELECT * FROM users WHERE email = $1';
    try {
        const result = await pool.query(checkUserQuery, [email]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "User not found." });
        }
      const user = result.rows[0];
        const password = Math.floor(100000 + Math.random() * 900000).toString();
        const hashedPassword = await bcrypt.hash(password, 10);
        await pool.query('UPDATE users SET password = $1 WHERE email = $2', [hashedPassword, email]);
        const mailOptions = {
            from: process.env.EMAIL,
            to: email,
            subject: 'Password Reset Request',
            text: `Your updated/new password is ${password}.`,
        };

        await transporter.sendMail(mailOptions);
        return res.json({ success: true, message: "Reset password sent to your email." });
    } catch (error) {
        console.error("Error in password reset request:", error);
        return res.status(500).json({ error: "An error occurred. Please try again!" });
    }
});

app.post('/contacts', authenticateToken, async (req, res) => {
    const { name, email, phone, address, timezone } = req.body;
    const timestamp = new Date().toISOString();
    const insertQuery = `
        INSERT INTO contacts (name, email, phone, address, timezone, created_at, updated_at) 
        VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *;
    `;
    const values = [name, email, phone, address, timezone, timestamp, timestamp];

    try {
        const result = await pool.query(insertQuery, values);
        res.status(201).json({ message: 'Contact added successfully', contact: result.rows[0] });
    } catch (error) {
        console.error('Error adding contact:', error);
        res.status(500).json({ error: 'An error occurred while adding contact' });
    }
});

app.put('/contacts/:id', authenticateToken, async (req, res) => {
   const { id } = req.params;
    const { name, email, phone, address, timezone } = req.body;
    console.log(req.body)
    const updated_at = new Date();
    const updateQuery = `
        UPDATE contacts
        SET name = $1, email = $2, phone = $3, address = $4, timezone = $5, updated_at = $6
        WHERE id = $7
        RETURNING *;
    `;
    const values = [name, email, phone, address, timezone, updated_at, id];
    console.log(name, email, phone, address, timezone, updated_at, id)

    try {
        const result = await pool.query(updateQuery, values);
        res.status(200).json({ message: 'Contact updated successfully', contact: result.rows[0] });
    } catch (error) {
        console.error('Error updating contact:', error);
        res.status(500).json({ error: 'An error occurred while updating contact' });
    }
});

app.get('/getcontacts', authenticateToken, async (req, res) => {
    const selectQuery = 'SELECT * FROM contacts ORDER BY created_at;';
    try {
        const result = await pool.query(selectQuery);
        res.status(200).json(result.rows); 
    } catch (error) {
        console.error('Error fetching contacts:', error);
        res.status(500).json({ error: 'An error occurred while fetching contacts' });
    }
});

app.get('/getcontacts/by-date', async (req, res) => {
    const { startDate, endDate } = req.query;
    console.log(startDate)
    console.log(endDate)
    if (!startDate || !endDate) {
        return res.status(400).json({ error: "Please provide both a start and end date." });
    }

    try {
        
      const utcStartDate = moment.tz(startDate, 'UTC').format('YYYY-MM-DD HH:mm:ss');
       const utcEndDate = moment.tz(endDate, 'UTC').format('YYYY-MM-DD HH:mm:ss');

        console.log(utcStartDate)
        console.log(utcEndDate)
        const contactsResult = await pool.query(
            'SELECT * FROM contacts WHERE created_at BETWEEN $1 AND $2',
            [utcStartDate, utcEndDate]
        );
        const contacts = contactsResult.rows;
        const formattedContacts = contacts.map(contact => {
                const createdAt = moment(contact.created_at).tz('UTC').format('YYYY-MM-DD HH:mm:ss');
               const updatedAt = moment(contact.updated_at).tz('UTC').format('YYYY-MM-DD HH:mm:ss');

            return {
                ...contact,
                created_at: createdAt,
                updated_at: updatedAt
            };
        });

        res.json({ contacts: formattedContacts });
    } catch (error) {
        console.error("Error retrieving contacts by date range:", error);
        res.status(500).json({ error: "An error occurred while retrieving contacts." });
    }
});

app.delete('/contacts/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const deleteQuery = `
        DELETE FROM contacts 
        WHERE id = $1;
    `;

    try {
        const result = await pool.query(deleteQuery, [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Contact not found' });
        }

        res.status(200).json({ message: 'Contact deleted successfully' });
    } catch (error) {
        console.error('Error deleting contact:', error);
        res.status(500).json({ error: 'An error occurred while deleting contact' });
    }
});

app.get('/download/contacts-excel', async (req, res) => {
    try {
        const contactsResult = await pool.query('SELECT * FROM contacts order by id');
        const contacts = contactsResult.rows;
        const formattedContacts = contacts.map(contact => {
            return {               
                Name: contact.name,
                Email: contact.email,
                MobileNumber:contact.phone,
                Address:contact.address,
                CreatedDate: contact.created_at ? format(new Date(contact.created_at), 'dd/MM/yyyy hh:mm a') : 'N/A',
                LastUpdatedOn: contact.updated_at ? format(new Date(contact.updated_at), 'dd/MM/yyyy hh:mm a') : 'N/A',

            };
        });

        const workbook = xlsx.utils.book_new();
        const worksheet = xlsx.utils.json_to_sheet(formattedContacts);
        xlsx.utils.book_append_sheet(workbook, worksheet, 'Contacts');
        const filePath = path.join(__dirname, 'contacts.xlsx');
        xlsx.writeFile(workbook, filePath);
        res.download(filePath, 'contacts.xlsx', (err) => {
            if (err) {
                console.error('Error downloading file:', err);
            }
            fs.unlinkSync(filePath);
        });

    } catch (error) {
        console.error("Error generating Excel:", error);
        res.status(500).json({ error: 'Error generating Excel file' });
    }
});

app.get('/download/contacts-csv', async (req, res) => {
    try {
        const contactsResult = await pool.query('SELECT * FROM contacts order by id');
        const contacts = contactsResult.rows;
        const formattedContacts = contacts.map(contact => {
            if (!contact.created_at) {
                console.warn(`Missing created_at for contact ID: ${contact.id}`);
            }
            if (!contact.updated_at) {
                console.warn(`Missing updated_at for contact ID: ${contact.id}`);
            }
            return {
                Name: contact.name,
                Email: contact.email,
                MobileNumber: contact.phone || 'N/A',
                created_at: contact.created_at ? format(new Date(contact.created_at), 'dd/MM/yyyy hh:mm a') : 'N/A',
                updated_at: contact.updated_at ? format(new Date(contact.updated_at), 'dd/MM/yyyy hh:mm a') : 'N/A',
            };
        });
        const csvWriter = createObjectCsvWriter({
            path: 'contacts.csv', 
            header: [
                { id: 'Name', title: 'Name' },
                { id: 'Email', title: 'Email' },
                { id: 'MobileNumber', title: 'MobileNumber' },
                { id: 'created_at', title: 'Created At' },
                { id: 'updated_at', title: 'Updated At' },
            ]
        });
        await csvWriter.writeRecords(formattedContacts);
        const filePath = path.join(__dirname, 'contacts.csv');
        res.download(filePath, 'contacts.csv', (err) => {
            if (err) {
                console.error('Error downloading file:', err);
            }
            fs.unlinkSync(filePath);
        });

    } catch (error) {
        console.error("Error generating CSV:", error);
        res.status(500).json({ error: 'Error generating CSV file' });
    }
});

app.listen(process.env.PORT || 4000,()=>console.log("server on "+process.env.PORT))


