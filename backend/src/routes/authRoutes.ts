import { Router } from 'express';
import * as authController from '../controllers/authController';
import { validateRegister, validateLogin, validatePasswordChange, validatePasswordReset } from '../middleware/validationMiddleware';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

/**
 * @route   POST /api/auth/register
 * @desc    Rejestracja nowego użytkownika
 * @access  Public
 */
router.post('/register', validateRegister, authController.register);

/**
 * @route   GET /api/auth/verify-email/:token
 * @desc    Weryfikacja adresu email
 * @access  Public
 */
router.get('/verify-email/:token', authController.verifyEmail);

/**
 * @route   POST /api/auth/login
 * @desc    Logowanie użytkownika
 * @access  Public
 */
router.post('/login', validateLogin, authController.loginLimiter, authController.login);

/**
 * @route   POST /api/auth/logout
 * @desc    Wylogowanie użytkownika
 * @access  Private
 */
router.post('/logout', authController.logout);

/**
 * @route   POST /api/auth/refresh-token
 * @desc    Odświeżanie tokenu
 * @access  Public
 */
router.post('/refresh-token', authController.refreshToken);

/**
 * @route   POST /api/auth/change-password
 * @desc    Zmiana hasła zalogowanego użytkownika
 * @access  Private
 */
router.post('/change-password', authenticate, validatePasswordChange, authController.changePassword);

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Generowanie tokenu do resetowania hasła
 * @access  Public
 */
router.post('/forgot-password', authController.forgotPassword);

/**
 * @route   POST /api/auth/reset-password
 * @desc    Resetowanie hasła za pomocą tokenu
 * @access  Public
 */
router.post('/reset-password', validatePasswordReset, authController.resetPassword);

/**
 * @route   GET /api/auth/profile
 * @desc    Pobieranie profilu zalogowanego użytkownika
 * @access  Private
 */
router.get('/profile', authenticate, authController.getProfile);

export default router;