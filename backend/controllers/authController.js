const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.signup = async (req, res) => {
  const { name, email, password, role } = req.body;

  console.log('Signup attempt:', { name, email, role });

  if (!name || !email || !password)
    return res.status(400).json({ message: 'All fields are required' });

  try {
    const [existing] = await db.query(
      'SELECT id FROM users WHERE email = ?', [email]
    );
    if (existing.length > 0)
      return res.status(409).json({ message: 'Email already registered' });

    const hashed = await bcrypt.hash(password, 10);
    const userRole = role === 'admin' ? 'admin' : 'member';

    await db.query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashed, userRole]
    );

    console.log('User created:', email);
    res.status(201).json({ message: 'User created successfully' });

  } catch (err) {
    console.error('Signup error:', err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  console.log('Login attempt:', { email });

  if (!email || !password)
    return res.status(400).json({ message: 'Email and password are required' });

  try {
    // Find user by email
    const [users] = await db.query(
      'SELECT * FROM users WHERE email = ?', [email.trim().toLowerCase()]
    );

    console.log('Users found:', users.length);

    if (users.length === 0)
      return res.status(404).json({ message: 'User not found' });

    const user = users[0];
    console.log('User from DB:', { id: user.id, email: user.email, role: user.role });

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Password match:', isMatch);

    if (!isMatch)
      return res.status(401).json({ message: 'Invalid password' });

    const token = jwt.sign(
      { id: user.id, name: user.name, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: { id: user.id, name: user.name, role: user.role }
    });

  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};