const Notification = require('../models/Notification');

const createNotification = async (recipient, sender, type, title, content, relatedId = null) => {
  try {
    const notification = await Notification.create({
      recipient,
      sender,
      type,
      title,
      content,
      relatedId,
    });
    return notification;
  } catch (error) {
    console.error('Error creating notification Service:', error.message);
    throw error;
  }
};

module.exports = { createNotification };
