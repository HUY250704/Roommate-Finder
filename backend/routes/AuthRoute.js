const express = require('express');
const { rateLimit } = require('express-rate-limit');
const router = express.Router();
const {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerificationCode,
  googleLogin,
  firebaseLogin,
} = require('../controllers/AuthController');

const AUTH_RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const createAuthRateLimiter = (limit) => rateLimit({
  windowMs: AUTH_RATE_LIMIT_WINDOW_MS,
  limit,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many authentication attempts. Please try again later.' },
});

const authRateLimit = createAuthRateLimiter(60);
const loginRateLimit = createAuthRateLimiter(10);
const firebaseLoginRateLimit = createAuthRateLimiter(10);
const registrationRateLimit = createAuthRateLimiter(10);
const forgotPasswordRateLimit = createAuthRateLimiter(5);
const resetPasswordRateLimit = createAuthRateLimiter(5);
const verifyEmailRateLimit = createAuthRateLimiter(5);
const resendVerificationRateLimit = createAuthRateLimiter(5);

router.use(authRateLimit);

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication operations
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Registered successfully; a verification code was sent by email
 *       429:
 *         description: Too many registration attempts
 */
router.post('/register', registrationRateLimit, registerUser);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful; returns a short-lived access token and sets a refresh cookie
 *       403:
 *         description: Email address has not been verified
 *       429:
 *         description: Too many login attempts
 */
router.post('/login', loginRateLimit, loginUser);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Auth]
 *     security: []
 *     responses:
 *       200:
 *         description: Logout successful; revokes the refresh token, invalidates issued access tokens, and clears its cookie
 */
router.post('/logout', logoutUser);

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Refresh the access token using the HTTP-only refresh cookie
 *     tags: [Auth]
 *     security: []
 *     responses:
 *       200:
 *         description: Access token refreshed and refresh cookie rotated
 *       401:
 *         description: Refresh token is missing, invalid, or expired
 */
router.post('/refresh', refreshAccessToken);

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Request a password reset code
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Reset code sent successfully
 *       429:
 *         description: Too many password-reset requests
 */
router.post('/forgot-password', forgotPasswordRateLimit, forgotPassword);

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Reset password with code
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - code
 *               - newPassword
 *             properties:
 *               email:
 *                 type: string
 *               code:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset successful
 *       429:
 *         description: Too many password-reset attempts
 */
router.post('/reset-password', resetPasswordRateLimit, resetPassword);

/**
 * @swagger
 * /api/auth/verify-email:
 *   post:
 *     summary: Verify email verification code
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - code
 *             properties:
 *               email:
 *                 type: string
 *               code:
 *                 type: string
 *                 pattern: '^[0-9]{6}$'
 *     responses:
 *       200:
 *         description: Email verified successfully
 *       400:
 *         description: Verification code is invalid or expired
 *       429:
 *         description: Too many email verification attempts
 */
router.post('/verify-email', verifyEmailRateLimit, verifyEmail);

/**
 * @swagger
 * /api/auth/resend-verification:
 *   post:
 *     summary: Resend an email verification code
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: A verification code was sent if the account is awaiting verification
 *       429:
 *         description: Too many verification-code requests
 */
router.post('/resend-verification', resendVerificationRateLimit, resendVerificationCode);


router.post('/firebase', firebaseLoginRateLimit, firebaseLogin);

module.exports = router;