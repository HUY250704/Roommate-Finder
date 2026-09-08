const User = require('../models/User');
const generateToken = require('../utils/tokenGenerator');

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
  try {
    const { credential, googleId, email, name, avatar } = req.body;
    let userEmail = email;
    let userName = name;
    let userGoogleId = googleId;
    let userAvatar = avatar;
    if (credential) {
      try {
        const response = await fetch("https://oauth2.googleapis.com/tokeninfo?id_token=" + credential);
        if (response.ok) {
          const payload = await response.json();
          userEmail = payload.email;
          userName = payload.name || payload.email.split("@")[0];
          userGoogleId = payload.sub;
          userAvatar = payload.picture;
        }
      } catch (err) {
        console.error("Google token verification error:", err);
      }
    }
    if (!userEmail) {
      return res.status(400).json({ message: "Email is required for Google login" });
    }
    let user = await User.findOne({ email: userEmail });
    if (user) {
      if (!user.googleId && userGoogleId) user.googleId = userGoogleId;
      if (userAvatar && !user.avatar) user.avatar = userAvatar;
      user.isVerified = true;
      await user.save({ validateBeforeSave: false });
    } else {
      let baseUsername = (userName || userEmail.split("@")[0]).replace(/[^a-zA-Z0-9_]/g, "");
      if (!baseUsername) baseUsername = "user";
      let uniqueUsername = baseUsername;
      let counter = 1;
      while (await User.findOne({ username: uniqueUsername })) {
        uniqueUsername = baseUsername + counter;
        counter++;
      }
      user = await User.create({
        username: uniqueUsername,
        email: userEmail,
        googleId: userGoogleId,
        avatar: userAvatar,
        authProvider: "google",
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

const firebaseLogin = async (req, res) => {
  try {
    const { uid, email, displayName, photoURL, providerId } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required for Firebase login" });
    }
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
        authProvider: providerId || "firebase",
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
