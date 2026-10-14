const User = require('../models/User');
const generateToken = require('../utils/tokenGenerator');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { sendPasswordResetEmail, sendEmailVerificationCode } = require('../services/emailService');
const { getApps, initializeApp } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');

const EMAIL_VERIFICATION_CODE_TTL = 10 * 60 * 1000;

const createEmailVerificationCode = () => String(crypto.randomInt(100000, 1000000));

const hashEmailVerificationCode = (code) => bcrypt.hash(code, 10);

const matchesEmailVerificationCode = async (code, storedHash) => {
  if (!/^\d{6}$/.test(code) || !/^\$2[aby]\$\d\d\$[./A-Za-z0-9]{53}$/.test(storedHash || '')) {
    return false;
  }

  return bcrypt.compare(code, storedHash);
};

const getFirebaseAdminAuth = () => {
  const app = getApps()[0] || initializeApp({ projectId: process.env.FIREBASE_PROJECT_ID });
  return getAuth(app);
};

const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (
      typeof username !== 'string' ||
      !username.trim() ||
      typeof email !== 'string' ||
      !email.trim() ||
      typeof password !== 'string' ||
      !password
    ) {
      return res.status(400).json({ message: 'Please add all fields' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const userExists = await User.findOne({ $or: [{ email: normalizedEmail }, { username }] });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const verificationCode = createEmailVerificationCode();
    const user = await User.create({
      username,
      email: normalizedEmail,
      password,
      emailVerificationCodeHash: await hashEmailVerificationCode(verificationCode),
      emailVerificationExpire: new Date(Date.now() + EMAIL_VERIFICATION_CODE_TTL),
    });
    if (user) {
      try {
        await sendEmailVerificationCode(user.email, verificationCode);
      } catch (mailError) {
        console.error('Failed to send email verification code:', mailError.message);
        await User.deleteOne({ _id: user._id });
        return res.status(503).json({ message: 'Could not send verification email. Please try again.' });
      }

      return res.status(201).json({
        _id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        message: 'Account created. Check your email for a verification code.',
      });
    } else {
      return res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (typeof email !== 'string' || !email.trim() || typeof password !== 'string' || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (user && (await user.matchPassword(password))) {
      if (!user.isVerified) {
        return res.status(403).json({ message: 'Please verify your email before signing in' });
      }

      return res.json({
        _id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        token: generateToken(user._id),
      });
    } else {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const logoutUser = async (req, res) => {
  return res.status(200).json({ message: 'Logged out successfully' });
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email });
    if (user) {
      const resetToken = Math.floor(100000 + Math.random() * 900000).toString();
      user.resetPasswordToken = resetToken;
      user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
      await user.save({ validateBeforeSave: false });

      try {
        await sendPasswordResetEmail(user.email, resetToken);
      } catch (mailError) {
        console.error('Failed to send password reset email:', mailError.message);
      }
    }

    return res.status(200).json({
      message: 'If an account exists with this email, a password reset code has been sent.',
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    if (!email || !code || !newPassword) {
      return res.status(400).json({ message: 'Please provide all fields' });
    }

    const user = await User.findOne({
      email,
      resetPasswordToken: code,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset code' });
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    return res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const verifyEmail = async (req, res) => {
  try {
    const { email, code } = req.body;
    if (typeof email !== 'string' || !email.trim() || typeof code !== 'string' || !/^\d{6}$/.test(code)) {
      return res.status(400).json({ message: 'Please provide email and code' });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() })
      .select('+emailVerificationCodeHash');
    if (
      !user ||
      user.isVerified ||
      !user.emailVerificationExpire ||
      user.emailVerificationExpire.getTime() <= Date.now() ||
      !(await matchesEmailVerificationCode(code, user.emailVerificationCodeHash))
    ) {
      return res.status(400).json({ message: 'Invalid or expired verification code' });
    }

    user.isVerified = true;
    user.emailVerificationCodeHash = undefined;
    user.emailVerificationExpire = undefined;
    await user.save({ validateBeforeSave: false });

    return res.status(200).json({ message: 'Email verified successfully', isVerified: true });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const resendVerificationCode = async (req, res) => {
  try {
    const { email } = req.body;
    if (typeof email !== 'string' || !email.trim()) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (user && !user.isVerified) {
      const verificationCode = createEmailVerificationCode();
      user.emailVerificationCodeHash = await hashEmailVerificationCode(verificationCode);
      user.emailVerificationExpire = new Date(Date.now() + EMAIL_VERIFICATION_CODE_TTL);
      await user.save({ validateBeforeSave: false });
      await sendEmailVerificationCode(user.email, verificationCode);
    }

    return res.status(200).json({
      message: 'If an account is awaiting verification, a new code has been sent.',
    });
  } catch (error) {
    console.error('Failed to resend email verification code:', error.message);
    return res.status(503).json({ message: 'Could not send verification email. Please try again.' });
  }
};

const googleLogin = async (req, res) => {
  return res.status(410).json({ message: 'Use Firebase sign-in with a verified ID token' });
};

const firebaseLogin = async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({ message: 'Firebase ID token is required' });
    }

    let decodedToken;
    try {
      decodedToken = await getFirebaseAdminAuth().verifyIdToken(idToken);
    } catch {
      return res.status(401).json({ message: 'Invalid Firebase ID token' });
    }

    const email = decodedToken.email?.toLowerCase();
    if (!email || decodedToken.email_verified !== true) {
      return res.status(401).json({ message: 'Verified account email is required' });
    }

    const uid = decodedToken.uid;
    const displayName = decodedToken.name || email.split('@')[0];
    const photoURL = decodedToken.picture;
    const signInProvider = decodedToken.firebase?.sign_in_provider;
    const providerId = signInProvider === 'google.com'
      ? 'google'
      : signInProvider === 'facebook.com' ? 'facebook' : 'firebase';
    let user = await User.findOne({ email });
    if (user) {
      if (!user.firebaseUid && uid) user.firebaseUid = uid;
      if (photoURL && !user.avatar) user.avatar = photoURL;
      user.isVerified = true;
      await user.save({ validateBeforeSave: false });
    } else {
      let baseUsername = ((displayName || email.split("@")[0])).replace(/[^a-zA-Z0-9_]/g, "");
      if (!baseUsername) baseUsername = "user";
      let uniqueUsername = baseUsername;
      let counter = 1;
      while (await User.findOne({ username: uniqueUsername })) {
        uniqueUsername = baseUsername + counter;
        counter++;
      }
      user = await User.create({
        username: uniqueUsername,
        email: email,
        firebaseUid: uid,
        avatar: photoURL,
        authProvider: ["local", "google", "facebook", "firebase"].includes(providerId) ? providerId : "firebase",
        isVerified: true,
      });
    }
    return res.status(200).json({
      _id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      avatar: user.avatar,
      token: generateToken(user._id),
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  firebaseLogin,
  googleLogin,
  registerUser,
  loginUser,
  logoutUser,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerificationCode,
};
