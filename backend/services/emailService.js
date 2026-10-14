const nodemailer = require('nodemailer');

const createTransporter = () => {
  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true' || process.env.SMTP_PORT === '465',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS || process.env.SMTP_PASSWORD,
      },
    });
  }

  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    return nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  return null;
};

const sendPasswordResetEmail = async (email, resetToken) => {
  const transporter = createTransporter();
  const fromAddress = process.env.EMAIL_FROM || process.env.SMTP_USER || process.env.EMAIL_USER || 'no-reply@roommatefinder.com';

  if (!transporter) {
    return;
  }

  const mailOptions = {
    from: fromAddress,
    to: email,
    subject: 'Roommate Finder - Password Reset Code',
    text: `Your password reset code is: ${resetToken}. This code is valid for 10 minutes.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #aa3000;">Roommate Finder</h2>
        <p>You requested a password reset. Please use the following code to reset your password:</p>
        <div style="background-color: #fff8f6; border: 1px dashed #aa3000; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 4px; color: #aa3000; margin: 20px 0;">
          ${resetToken}
        </div>
        <p>This code is valid for <strong>10 minutes</strong>. If you did not request this, you can safely ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 12px; color: #888;">This is an automated message, please do not reply.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = {
  sendPasswordResetEmail,
};
