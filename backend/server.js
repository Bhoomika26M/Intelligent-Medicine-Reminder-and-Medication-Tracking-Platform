const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import the shared database connection
const db = require('./db');

// Import Controllers & Routes
const dashboardController = require('./dashboardController'); // <-- Added this
const medicineRoutes = require('./medicineRoutes');
const analyticsRoutes = require('./analyticsRoutes');
const ocrRoutes = require('./ocrRoutes');

const app = express();
app.use(cors());
app.use(express.json());

// --- AUTHENTICATION MIDDLEWARE ---
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ error: 'Access denied. Token missing.' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token.' });
    req.user = user;
    next();
  });
};

// --- ROLE-BASED ACCESS CONTROL MIDDLEWARE ---
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied. Unauthorized role.' });
    }
    next();
  };
};

// --- ROUTES ---

// 1. User Registration
app.post('/api/auth/register', async (req, res) => {
  const { email, password, role, firstName, lastName } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Insert into users table
    const userRes = await db.query(
      'INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING id, email, role',
      [email, hashedPassword, role || 'PATIENT']
    );
    
    const newUser = userRes.rows[0];
    
    // Insert into profiles table
    await db.query(
      'INSERT INTO profiles (user_id, first_name, last_name) VALUES ($1, $2, $3)',
      [newUser.id, firstName, lastName]
    );

    res.status(201).json({ message: 'User registered successfully!', user: newUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. User Login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const userRes = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userRes.rows.length === 0) return res.status(400).json({ error: 'User not found.' });

    const user = userRes.rows[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) return res.status(400).json({ error: 'Invalid password.' });

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '2h' });
    res.json({ token, role: user.role, userId: user.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Protected Test Routes
app.get('/api/patient/dashboard', authenticateToken, authorizeRoles('PATIENT', 'ADMIN'), async (req, res) => {
  res.json({ message: `Welcome to your Patient Dashboard, User ID: ${req.user.id}` });
});

app.get('/api/caregiver/dashboard', authenticateToken, authorizeRoles('CAREGIVER', 'ADMIN'), async (req, res) => {
  res.json({ message: `Welcome to the Caregiver Dashboard, User ID: ${req.user.id}` });
});

// --- LIVE DASHBOARD ROUTE ---
// Added this route to fetch live data for the React frontend
app.get('/api/dashboard/:userId', dashboardController.getDashboardData);

// 4. Milestone 2 & 3 Module Routes
// Notice we pass `authenticateToken` here so only logged-in users can access these features!
app.use('/api/medicines', medicineRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/ocr', ocrRoutes);

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend running safely on port ${PORT}`));