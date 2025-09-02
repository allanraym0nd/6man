// routes/auth.js
import express from 'express';
import authController from '../controllers/authController.js';
import validation from '../middleware/validation.js';

const router = express.Router();

// POST /api/auth/register
router.post('/register', validation.validationRegistration, authController.register);

// POST /api/auth/login
router.post('/login', validation.validateLogin,authController.login);

export default router;