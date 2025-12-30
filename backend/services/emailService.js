const nodemailer = require('nodemailer');

const FROM_EMAIL = process.env.FROM_EMAIL || process.env.SMTP_USER || 'noreply@saree4ever.com';
const FROM_NAME = process.env.FROM_NAME || 'Saree4Ever';
const EMAIL_ENABLED = process.env.EMAIL_ENABLED !== 'false';

let transporter = null;
let transporterError = null;

const createTransporter = () => {
  if (transporter || transporterError) return transporter;

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    transporterError = new Error(
      'SMTP credentials missing. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS to enable emails.'
    );
    console.warn('[EmailService] SMTP credentials not configured. Emails will be skipped.');
    return null;
  }

  const port = Number(SMTP_PORT || 587);

  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    secure: port === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });

  transporter.verify().catch((error) => {
    transporterError = error;
    console.error('[EmailService] SMTP verification failed:', error.message || error);
  });

  return transporter;
};

const htmlToText = (html) => {
  if (!html) return '';
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
};

const canSendToCustomer = (customer, label) => {
  if (customer?.email) return true;
  console.warn(`[EmailService] Cannot send ${label} email: missing customer email address.`);
  return false;
};

const formatAmount = (value) => {
  const amount = Number(value || 0);
  return amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

async function sendEmail({ to, subject, html, text }) {
  if (!EMAIL_ENABLED) {
    console.warn('[EmailService] EMAIL_ENABLED=false. Skipping email send.');
    return;
  }

  if (!to) {
    console.warn('[EmailService] Missing recipient email. Skipping send.');
    return;
  }

  const activeTransporter = createTransporter();
  if (!activeTransporter) {
    console.warn('[EmailService] Transporter not available. Email not sent.');
    return;
  }

  const mailOptions = {
    from: `${FROM_NAME} <${FROM_EMAIL}>`,
    to,
    subject,
    html,
    text: text || htmlToText(html),
  };

  try {
    const info = await activeTransporter.sendMail(mailOptions);
    return info;
  } catch (error) {
    console.error('[EmailService] Failed to send email:', error.message || error);
    throw error;
  }
}

/**
 * Send order confirmation email
 */
exports.sendOrderConfirmation = async (order, customer) => {
  if (!canSendToCustomer(customer, 'order confirmation')) return;

  const subject = `Order Confirmation - ${order.order_number}`;
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #000; color: #fff; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .order-details { background: #fff; padding: 15px; margin: 15px 0; border-left: 4px solid #000; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Saree4Ever</h1>
        </div>
        <div class="content">
          <h2>Thank you for your order!</h2>
          <p>Dear ${customer.name || 'Customer'},</p>
          <p>We've received your order and are processing it. Here are your order details:</p>
          
          <div class="order-details">
            <h3>Order #${order.order_number}</h3>
            <p><strong>Total:</strong> ₹${formatAmount(order.total_amount)}</p>
            <p><strong>Status:</strong> ${order.status}</p>
            <p><strong>Payment:</strong> ${order.payment_status}</p>
          </div>
          
          <p>We'll send you another email when your order ships.</p>
          <p>Thank you for shopping with Saree4Ever!</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} Saree4Ever. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  const text = `
    Thank you for your order!
    
    Order #${order.order_number}
    Total: ₹${formatAmount(order.total_amount)}
    Status: ${order.status}
    Payment: ${order.payment_status}
    
    We'll send you another email when your order ships.
    Thank you for shopping with Saree4Ever!
  `;
  
  return sendEmail({
    to: customer.email,
    subject,
    html,
    text,
  });
};

/**
 * Send payment confirmation email
 */
exports.sendPaymentConfirmation = async (order, customer) => {
  if (!canSendToCustomer(customer, 'payment confirmation')) return;

  const subject = `Payment Confirmed - Order ${order.order_number}`;
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #000; color: #fff; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .success { background: #d4edda; color: #155724; padding: 15px; border-radius: 5px; margin: 15px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Saree4Ever</h1>
        </div>
        <div class="content">
          <div class="success">
            <h2>✓ Payment Confirmed</h2>
          </div>
          <p>Dear ${customer.name || 'Customer'},</p>
          <p>Your payment for Order #${order.order_number} has been confirmed.</p>
          <p><strong>Amount Paid:</strong> ₹${formatAmount(order.total_amount)}</p>
          <p>We're now preparing your order for shipment.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  return sendEmail({
    to: customer.email,
    subject,
    html,
    text: `Payment confirmed for Order #${order.order_number}. Amount: ₹${formatAmount(order.total_amount)}`,
  });
};

/**
 * Send shipping update email
 */
exports.sendShippingUpdate = async (order, shipment, customer) => {
  if (!canSendToCustomer(customer, 'shipping update')) return;

  const subject = `Your Order ${order.order_number} Has Shipped!`;
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #000; color: #fff; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .tracking { background: #fff; padding: 15px; margin: 15px 0; border: 2px solid #000; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Saree4Ever</h1>
        </div>
        <div class="content">
          <h2>Your order has shipped!</h2>
          <p>Dear ${customer.name || 'Customer'},</p>
          <p>Great news! Your order #${order.order_number} has been shipped.</p>
          
          <div class="tracking">
            <h3>Tracking Information</h3>
            <p><strong>Carrier:</strong> ${shipment.carrier}</p>
            <p><strong>Tracking Number:</strong> ${shipment.tracking_number}</p>
          </div>
          
          <p>You can track your package using the tracking number above.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  return sendEmail({
    to: customer.email,
    subject,
    html,
    text: `Your order #${order.order_number} has shipped. Tracking: ${shipment.tracking_number} (${shipment.carrier})`,
  });
};

/**
 * Send delivery confirmation email
 */
exports.sendDeliveryConfirmation = async (order, customer) => {
  if (!canSendToCustomer(customer, 'delivery confirmation')) return;

  const subject = `Order Delivered - ${order.order_number}`;
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #000; color: #fff; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .success { background: #d4edda; color: #155724; padding: 15px; border-radius: 5px; margin: 15px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Saree4Ever</h1>
        </div>
        <div class="content">
          <div class="success">
            <h2>✓ Order Delivered</h2>
          </div>
          <p>Dear ${customer.name || 'Customer'},</p>
          <p>Your order #${order.order_number} has been delivered!</p>
          <p>We hope you love your purchase. If you have any questions or concerns, please don't hesitate to contact us.</p>
          <p>Thank you for shopping with Saree4Ever!</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  return sendEmail({
    to: customer.email,
    subject,
    html,
    text: `Your order #${order.order_number} has been delivered. Thank you for shopping with Saree4Ever!`,
  });
};

module.exports = exports;

