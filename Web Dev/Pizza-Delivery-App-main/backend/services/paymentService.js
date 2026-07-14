import Razorpay from 'razorpay';
import crypto from 'crypto';

let razorpayInstance;

// Instantiate Razorpay helper with fallback check
const getRazorpayInstance = () => {
  if (razorpayInstance) return razorpayInstance;

  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || keyId === 'rzp_test_dummykey123' || !keySecret || keySecret === 'dummysecret12345') {
    console.log('[Payment Service] Using Simulated Razorpay Mock (No active credentials configured).');
    return null;
  }

  try {
    razorpayInstance = new Razorpay({
      key_id: keyId,
      key_secret: keySecret
    });
    return razorpayInstance;
  } catch (error) {
    console.error('[Payment Service] Failed to initialize Razorpay SDK:', error.message);
    return null;
  }
};

// Create a Razorpay Order
export const createRazorpayOrder = async (amountInINR, receiptId) => {
  const instance = getRazorpayInstance();
  const amountInPaise = Math.round(amountInINR * 100);

  if (!instance) {
    // Generate standard simulated transaction ID & mock order configuration
    const simulatedOrderId = `order_sim_${crypto.randomBytes(8).toString('hex')}`;
    console.log(`[Payment Service] Generated Mock Order: ${simulatedOrderId}`);
    return {
      id: simulatedOrderId,
      amount: amountInPaise,
      currency: 'INR',
      receipt: receiptId,
      status: 'simulated'
    };
  }

  try {
    const options = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: receiptId
    };
    const order = await instance.orders.create(options);
    return order;
  } catch (error) {
    console.error('[Payment Service] Error creating Razorpay Order:', error);
    throw error;
  }
};

// Verify Razorpay Payment Signature
export const verifyRazorpayPayment = (razorpayOrderId, razorpayPaymentId, razorpaySignature) => {
  const instance = getRazorpayInstance();

  // If order status was simulated/mocked, bypass active crypto validation
  if (!instance || razorpayOrderId.startsWith('order_sim_')) {
    console.log(`[Payment Service] Mock signature verification approved for Order ID: ${razorpayOrderId}`);
    return true;
  }

  try {
    const body = razorpayOrderId + '|' + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    const isValid = expectedSignature === razorpaySignature;
    console.log(`[Payment Service] Signature Verification: ${isValid ? 'PASSED' : 'FAILED'}`);
    return isValid;
  } catch (error) {
    console.error('[Payment Service] Signature verification failed with exception:', error.message);
    return false;
  }
};
