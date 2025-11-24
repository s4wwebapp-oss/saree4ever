import nodemailer from 'nodemailer';

// Email configuration from environment
const smtpConfig = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
};

// Create transporter
const transporter = nodemailer.createTransport(smtpConfig);

/**
 * Send email
 */
export const sendEmail = async (
  to: string,
  subject: string,
  html: string,
  text?: string
): Promise<void> => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('Email not configured. Skipping email send.');
    return;
  }

  try {
    const info = await transporter.sendMail({
      from: `"Saree4ever" <${process.env.SMTP_USER}>`,
      to,
      subject,
      text: text || html.replace(/<[^>]*>/g, ''), // Strip HTML for text version
      html,
    });

    console.log('Email sent:', info.messageId);
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

/**
 * Send order confirmation email
 */
export const sendOrderConfirmation = async (
  email: string,
  orderNumber: string,
  orderDetails: any
): Promise<void> => {
  const html = `
    <h2>Order Confirmation</h2>
    <p>Thank you for your order!</p>
    <p><strong>Order Number:</strong> ${orderNumber}</p>
    <p><strong>Total:</strong> ₹${orderDetails.total}</p>
    <p>We'll send you another email when your order ships.</p>
  `;

  await sendEmail(email, `Order Confirmation - ${orderNumber}`, html);
};

