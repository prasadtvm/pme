const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');

const authController = {
  // User login
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      // Validate input
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      // Find user in database
      const userResult = await pool.query(
        'SELECT * FROM users WHERE email = $1',
        [email]
      );

      if (userResult.rows.length === 0) {
        return res.status(400).json({ error: 'Invalid credentials' });
      }

      const user = userResult.rows[0];

      // Verify password (for demo, using simple comparison)
      // In production, use bcrypt.compare()
     // const isPasswordValid = password === 'password'; // Demo password

     //const _psw=await bcrypt('password');
     //console.log(_psw);

     const bcrypt = require("bcryptjs");

// The plain text password to hash and test
const plainPassword = "password";

{/* Generate a hash (10 salt rounds — standard)
const saltRounds = 10;

(async () => {
  try {
    console.log("Plain password:", plainPassword);

    // Generate hash
    const hash = await bcrypt.hash(plainPassword, saltRounds);
    console.log("Generated hash:", hash);

    // Verify hash works
    const isMatch = await bcrypt.compare(plainPassword, hash);
    console.log("Password matches hash:", isMatch ? "✅ YES" : "❌ NO");

    // Example: compare against your DB hash
    const dbHash = "$2a$10$X1R5z6g/Zkslj6aEJAb8OeDlsRhT0vGyCGXbR7DLHJK1lUavmLDiG";
    const isDbMatch = await bcrypt.compare(plainPassword, dbHash);
    console.log("Compare with DB hash:", isDbMatch ? "✅ YES" : "❌ NO");
  } catch (err) {
    console.error("Error:", err);
  }
})();*/}
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        return res.status(400).json({ error: 'Invalid credentials' });
      }

      // Generate JWT token
      const token = jwt.sign(
        { 
          id: user.id, 
          email: user.email, 
          name: user.name ,
          role: user.role
        },
        process.env.JWT_SECRET || 'fallback_secret',
        { expiresIn: '24h' }
      );

      res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      });

    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },
  // User registration
  register: async (req, res) => {
    try {
      const { name, email, password } = req.body;

      // Validate input
      if (!name || !email || !password) {
        return res.status(400).json({ error: 'Name, email and password are required' });
      }

      // Check if user already exists
      const existingUser = await pool.query(
        'SELECT id FROM users WHERE email = $1',
        [email]
      );

      if (existingUser.rows.length > 0) {
        return res.status(400).json({ error: 'User already exists' });
      }

      // Hash password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Create user
      const role=2
      const newUser = await pool.query(
        'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, created_at',
        [name, email, hashedPassword,role]
      );

      // Generate token
      const token = jwt.sign(
        { 
          id: newUser.rows[0].id, 
          email: newUser.rows[0].email, 
          name: newUser.rows[0].name 
        },
        process.env.JWT_SECRET || 'fallback_secret',
        { expiresIn: '24h' }
      );

      res.status(201).json({
        token,
        user: {
          id: newUser.rows[0].id,
          email: newUser.rows[0].email,
          name: newUser.rows[0].name
        }
      });

    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },
  // Get current user
  getMe: async (req, res) => {
    try {
      const userResult = await pool.query(
        'SELECT id, name, email, created_at FROM users WHERE id = $1',
        [req.user.id]
      );

      if (userResult.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({ user: userResult.rows[0] });
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};
module.exports = authController;