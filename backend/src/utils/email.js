const nodemailer = require('nodemailer');
const config = require('../config');

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: config.email.host,
    port: config.email.port,
    secure: config.email.port === 465,
    auth: {
      user: config.email.user,
      pass: config.email.pass,
    },
  });
};

/**
 * Send email verification
 */
const sendEmailVerification = async (email, firstName, token) => {
  const transporter = createTransporter();
  
  const verificationUrl = `${config.cors.origin}/verify-email?token=${token}`;
  
  const mailOptions = {
    from: config.email.from,
    to: email,
    subject: 'Verify Your Balmuya Account',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c3e50;">Welcome to Balmuya, ${firstName}!</h2>
        <p>Thank you for joining our marketplace for women entrepreneurs.</p>
        <p>Please click the button below to verify your email address:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" 
             style="background-color: #e74c3c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Verify Email Address
          </a>
        </div>
        <p>If the button doesn't work, copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #7f8c8d;">${verificationUrl}</p>
        <p>This link will expire in 24 hours.</p>
        <hr style="border: none; border-top: 1px solid #ecf0f1; margin: 30px 0;">
        <p style="color: #7f8c8d; font-size: 14px;">
          If you didn't create an account with Balmuya, please ignore this email.
        </p>
      </div>
    `
  };

  return await transporter.sendMail(mailOptions);
};

/**
 * Send password reset email
 */
const sendPasswordReset = async (email, firstName, token) => {
  const transporter = createTransporter();
  
  const resetUrl = `${config.cors.origin}/reset-password?token=${token}`;
  
  const mailOptions = {
    from: config.email.from,
    to: email,
    subject: 'Reset Your Balmuya Password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c3e50;">Password Reset Request</h2>
        <p>Hello ${firstName},</p>
        <p>We received a request to reset your password for your Balmuya account.</p>
        <p>Click the button below to reset your password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" 
             style="background-color: #e74c3c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Reset Password
          </a>
        </div>
        <p>If the button doesn't work, copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #7f8c8d;">${resetUrl}</p>
        <p>This link will expire in 1 hour.</p>
        <hr style="border: none; border-top: 1px solid #ecf0f1; margin: 30px 0;">
        <p style="color: #7f8c8d; font-size: 14px;">
          If you didn't request a password reset, please ignore this email.
        </p>
      </div>
    `
  };

  return await transporter.sendMail(mailOptions);
};

/**
 * Send welcome email
 */
const sendWelcomeEmail = async (email, firstName, role) => {
  const transporter = createTransporter();
  
  const roleMessage = role === 'SELLER' 
    ? 'You can now start listing your products and building your store!'
    : 'You can now browse and purchase from our amazing women entrepreneurs!';
  
  const mailOptions = {
    from: config.email.from,
    to: email,
    subject: 'Welcome to Balmuya!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c3e50;">Welcome to Balmuya, ${firstName}!</h2>
        <p>Your email has been verified and your account is now active.</p>
        <p>${roleMessage}</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${config.cors.origin}" 
             style="background-color: #e74c3c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Get Started
          </a>
        </div>
        <p>Thank you for joining our community of women entrepreneurs!</p>
        <hr style="border: none; border-top: 1px solid #ecf0f1; margin: 30px 0;">
        <p style="color: #7f8c8d; font-size: 14px;">
          Balmuya - Empowering women entrepreneurs through technology
        </p>
      </div>
    `
  };

  return await transporter.sendMail(mailOptions);
};

/**
 * Send order confirmation email
 */
const sendOrderConfirmation = async (email, firstName, order) => {
  const transporter = createTransporter();
  
  const mailOptions = {
    from: config.email.from,
    to: email,
    subject: `Order Confirmation - ${order.orderNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c3e50;">Order Confirmed!</h2>
        <p>Hello ${firstName},</p>
        <p>Your order has been confirmed and payment received.</p>
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3>Order Details</h3>
          <p><strong>Order Number:</strong> ${order.orderNumber}</p>
          <p><strong>Total Amount:</strong> ETB ${order.total}</p>
          <p><strong>Status:</strong> ${order.status}</p>
        </div>
        <p>You will receive updates about your order status via email.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${config.cors.origin}/orders/${order.id}" 
             style="background-color: #e74c3c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
            View Order
          </a>
        </div>
      </div>
    `
  };

  return await transporter.sendMail(mailOptions);
};

module.exports = {
  sendEmailVerification,
  sendPasswordReset,
  sendWelcomeEmail,
  sendOrderConfirmation
};
