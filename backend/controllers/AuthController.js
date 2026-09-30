const User = require('../models/User');
const generateToken = require('../utils/tokenGenerator');
const { getApps, initializeApp } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');

const getFirebaseAdminAuth = () => {
  const app = getApps()[0] || initializeApp({ projectId: process.env.FIREBASE_PROJECT_ID });
  return getAuth(app);
};

const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Please add all fields' });
    }

    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({ username, email, password });
    if (user) {
      return res.status(201).json({
        _id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        token: generateToken(user._id),
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
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
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
    if (!user) {
      return res.status(404).json({ message: 'No user found with this email' });
    }

    const resetToken = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
    await user.save({ validateBeforeSave: false });

    console.log(`Password reset code for ${email} is: ${resetToken}`);

    return res.status(200).json({
      message: 'Password reset code generated successfully',
      code: resetToken, // For dev testing ease
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
    if (!email || !code) {
      return res.status(400).json({ message: 'Please provide email and code' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isVerified = true;
    await user.save({ validateBeforeSave: false });

    return res.status(200).json({ message: 'Email verified successfully', isVerified: true });
  } catch (error) {
    return res.status(500).json({ message: error.message });
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
    if (!email) return res.status(401).json({ message: 'Verified account email is required' });

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
};

