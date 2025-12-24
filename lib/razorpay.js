import Razorpay from "razorpay";
import crypto from "crypto";

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/**
 * Create a Razorpay order
 * @param {Object} options - Order options
 * @param {number} options.amount - Amount in INR (will be converted to paise)
 * @param {string} options.currency - Currency code (default: INR)
 * @param {string} options.receipt - Unique receipt ID
 * @param {Object} options.notes - Additional notes
 * @returns {Promise<Object>} Razorpay order object
 */
export async function createOrder({
  amount,
  currency = "INR",
  receipt,
  notes = {},
}) {
  const options = {
    amount: Math.round(amount * 100), // Convert to paise
    currency,
    receipt,
    notes,
  };

  const order = await razorpay.orders.create(options);
  return order;
}

/**
 * Verify Razorpay payment signature
 * @param {Object} options - Verification options
 * @param {string} options.orderId - Razorpay order ID
 * @param {string} options.paymentId - Razorpay payment ID
 * @param {string} options.signature - Razorpay signature
 * @returns {boolean} Whether signature is valid
 */
export function verifyPaymentSignature({ orderId, paymentId, signature }) {
  const body = orderId + "|" + paymentId;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body.toString())
    .digest("hex");

  return expectedSignature === signature;
}

/**
 * Verify Razorpay webhook signature
 * @param {string} body - Raw request body
 * @param {string} signature - X-Razorpay-Signature header
 * @returns {boolean} Whether webhook signature is valid
 */
export function verifyWebhookSignature(body, signature) {
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
    .update(body)
    .digest("hex");

  return expectedSignature === signature;
}

/**
 * Fetch payment details from Razorpay
 * @param {string} paymentId - Razorpay payment ID
 * @returns {Promise<Object>} Payment details
 */
export async function fetchPayment(paymentId) {
  return await razorpay.payments.fetch(paymentId);
}

/**
 * Fetch order details from Razorpay
 * @param {string} orderId - Razorpay order ID
 * @returns {Promise<Object>} Order details
 */
export async function fetchOrder(orderId) {
  return await razorpay.orders.fetch(orderId);
}

/**
 * Initiate refund for a payment
 * @param {string} paymentId - Razorpay payment ID
 * @param {number} amount - Amount to refund in INR (optional, full refund if not provided)
 * @returns {Promise<Object>} Refund details
 */
export async function initiateRefund(paymentId, amount = null) {
  const options = {};
  if (amount) {
    options.amount = Math.round(amount * 100); // Convert to paise
  }
  return await razorpay.payments.refund(paymentId, options);
}

export default razorpay;
