const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const User = require('../models/User');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const router = express.Router();

const registerSchema = Joi.object({
  name: Joi.string().trim().min(1).required(),
  email: Joi.string().trim().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('student', 'admin').default('student')
}).required();
const loginSchema = Joi.object({
  email: Joi.string().trim().email().required(),
  password: Joi.string().required()
}).required();

router.post('/register', async (req, res, next) => {
  try {
    const { error, value } = registerSchema.validate(req.body, { abortEarly: false, convert: true });
    if (error) return res.status(400).json({ message: 'Invalid registration data', details: error.details.map((d) => d.message) });
    const email = value.email.toLowerCase();
    if (await User.exists({ email })) return res.status(400).json({ message: 'Email is already registered' });
    const password = await bcrypt.hash(value.password, 12);
    const user = await User.create({ ...value, email, password });
    res.status(201).json({ message: 'Registration successful', user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    if (error.code === 11000) return res.status(400).json({ message: 'Email is already registered' });
    next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { error, value } = loginSchema.validate(req.body, { abortEarly: false });
    if (error) return res.status(400).json({ message: 'Invalid login data', details: error.details.map((d) => d.message) });
    const user = await User.findOne({ email: value.email.toLowerCase() }).select('+password');
    if (!user || !(await bcrypt.compare(value.password, user.password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    if (!process.env.JWT_SECRET) return res.status(500).json({ message: 'JWT_SECRET is not configured' });
    const token = jwt.sign({ sub: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({ message: 'Login successful', token, expiresIn: '1h' });
  } catch (error) { next(error); }
});

router.get('/profile', authMiddleware, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password -__v');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json({ user });
  } catch (error) { next(error); }
});

router.get('/students', authMiddleware, adminMiddleware, async (_req, res, next) => {
  try {
    const students = await User.find({ role: 'student' }).select('-password -__v').sort({ createdAt: -1 });
    res.status(200).json({ students });
  } catch (error) { next(error); }
});

module.exports = router;
