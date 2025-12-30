// Payment Gateway Configuration
// Supports both Stripe and Razorpay

const stripe = require('stripe');
const Razorpay = require('razorpay');

// Stripe Configuration
let stripeClient = null;
if (process.env.STRIPE_SECRET_KEY) {
  stripeClient = stripe(process.env.STRIPE_SECRET_KEY);
} else {
  console.warn('⚠️  STRIPE_SECRET_KEY not set. Stripe payments disabled.');
}

// Razorpay Configuration
let razorpayClient = null;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  razorpayClient = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
} else {
  console.warn('⚠️  Razorpay keys not set. Razorpay payments disabled.');
}

module.exports = {
  stripe: stripeClient,
  razorpay: razorpayClient,
  stripeEnabled: !!stripeClient,
  razorpayEnabled: !!razorpayClient,
};

