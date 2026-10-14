const Notification = require('../models/Notification');

const createNotification = async (recipient, sender, type, title, content, relatedId = null, io = null) => {
  try {
    const notification = await Notification.create({
      recipient,
      sender,
      type,
      title,
      content,
      relatedId,
    });

    if (io && recipient) {
      io.to(recipient.toString()).emit('newNotification', notification);
    }

    return notification;
  } catch (error) {
    console.error('Error creating notification Service:', error.message);
    return null;
  }
};

module.exports = { createNotification };
