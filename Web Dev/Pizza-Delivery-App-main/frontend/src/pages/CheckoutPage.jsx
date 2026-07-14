import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import { useCart } from '../store/CartContext';
import { useToast } from '../App';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, CreditCard, ShoppingBag, Plus, Sparkles } from 'lucide-react';

export default function CheckoutPage() {
  const { user, updateProfile } = useAuth();
  const { cart, subtotal, discountAmount, deliveryCharges, gstCharges, totalAmount, clearCart } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [selectedAddressIndex, setSelectedAddressIndex] = useState(0);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({ street: '', city: '', state: '', zipCode: '' });
  
  // Checkout simulation states
  const [loading, setLoading] = useState(false);
  const [simulatedPaymentOrder, setSimulatedPaymentOrder] = useState(null);
  const [isSimulatingPayment, setIsSimulatingPayment] = useState(false);

  // Redirect to menu if cart is empty on mount
  useEffect(() => {
    if (!loading && (!cart || cart.items.length === 0)) {
      showToast('Your cart is empty. Please select pizzas first.', 'warning');
      navigate('/menu');
    }
  }, [cart]);

  // Load Razorpay script dynamically helper
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleAddNewAddressSubmit = async (e) => {
    e.preventDefault();
    const { street, city, state, zipCode } = newAddress;
    if (!street || !city || !state || !zipCode) {
      showToast('Please fill in all address parameters', 'error');
      return;
    }

    try {
      const updatedAddresses = [...(user.addresses || []), newAddress];
      const res = await updateProfile({ addresses: updatedAddresses });
      if (res.success) {
        showToast('Address added to profile!', 'success');
        setNewAddress({ street: '', city: '', state: '', zipCode: '' });
        setShowNewAddressForm(false);
        setSelectedAddressIndex(updatedAddresses.length - 1);
      }
    } catch (err) {
      showToast('Failed to save address details', 'error');
    }
  };

  // Main checkout payment submit handler
  const handlePlaceOrderAndPay = async () => {
    if (!user.addresses || user.addresses.length === 0) {
      showToast('Please specify a delivery address to checkout', 'warning');
      return;
    }

    setLoading(true);
    const chosenAddress = user.addresses[selectedAddressIndex];

    try {
      // 1. Create order record on the backend server
      const orderPayload = {
        items: cart.items.map(item => ({
          pizza: item.isCustom ? null : item.pizza?._id,
          isCustom: item.isCustom,
          customPizzaDetails: item.customPizzaDetails,
          quantity: item.quantity,
          size: item.size,
          price: item.price
        })),
        totalAmount,
        deliveryAddress: {
          street: chosenAddress.street,
          city: chosenAddress.city,
          state: chosenAddress.state,
          zipCode: chosenAddress.zipCode
        }
      };

      const res = await axios.post('/orders', orderPayload);
      
      if (res.data.success) {
        const { order, razorpayOrder } = res.data;

        // 2. Determine if we bypass to Mock Payment Simulator
        if (razorpayOrder.id.startsWith('order_sim_') || razorpayOrder.status === 'simulated') {
          // Launch custom beautiful simulated terminal
          setSimulatedPaymentOrder({ orderId: order._id, razorpayOrder });
          setIsSimulatingPayment(true);
          setLoading(false);
          return;
        }

        // 3. Launch Real Razorpay SDK Checkout if valid credentials exist
        const scriptLoaded = await loadRazorpayScript();
        if (!scriptLoaded) {
          showToast('Failed to load Razorpay Payment Gateway. Trying simulator fallback.', 'warning');
          setSimulatedPaymentOrder({ orderId: order._id, razorpayOrder });
          setIsSimulatingPayment(true);
          setLoading(false);
          return;
        }

        const options = {
          key: process.env.RAZORPAY_KEY_ID || 'rzp_test_dummykey123',
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
          name: 'PizzaVerse Delivery net',
          description: `Order Ref #${order._id.slice(-6)}`,
          order_id: razorpayOrder.id,
          handler: async (response) => {
            // Verify payment
            await triggerPaymentVerification(
              order._id,
              response.razorpay_order_id,
              response.razorpay_payment_id,
              response.razorpay_signature
            );
          },
          prefill: {
            name: user.name,
            email: user.email
          },
          theme: {
            color: '#ff6b08'
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      }
    } catch (error) {
      console.error('[Checkout Page] Place order failed:', error);
      showToast(error.response?.data?.message || 'Failed to place order. Out of stock toppings?', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Call verification backend
  const triggerPaymentVerification = async (orderId, rzpOrderId, rzpPaymentId, rzpSignature) => {
    try {
      setLoading(true);
      const res = await axios.post('/orders/verify', {
        orderId,
        razorpayOrderId: rzpOrderId,
        razorpayPaymentId: rzpPaymentId,
        razorpaySignature: rzpSignature
      });

      if (res.data.success) {
        showToast('Payment successful! Order processed 🔥', 'success');
        await clearCart();
        navigate(`/order-success?orderId=${orderId}`);
      }
    } catch (err) {
      showToast('Payment verification failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSimulatePaymentSuccess = async () => {
    setIsSimulatingPayment(false);
    if (!simulatedPaymentOrder) return;
    const { orderId, razorpayOrder } = simulatedPaymentOrder;
    
    // Generate simulated payment references
    const simulatedPaymentId = `pay_sim_${Math.random().toString(36).substring(2, 10)}`;
    const simulatedSignature = `sig_sim_${Math.random().toString(36).substring(2, 15)}`;

    await triggerPaymentVerification(orderId, razorpayOrder.id, simulatedPaymentId, simulatedSignature);
  };

  const handleSimulatePaymentFailure = () => {
    setIsSimulatingPayment(false);
    showToast('Simulated Payment: Transaction Failed.', 'error');
  };

  return (
    <div className="min-h-screen px-6 md:px-12 py-10 max-w-7xl mx-auto flex flex-col gap-10">
      {/* Page Header */}
      <div>
        <h1 className="font-accent text-3xl md:text-5xl font-black uppercase tracking-wider text-white">
          SECURE <span className="text-primary glow-text">CHECKOUT</span>
        </h1>
        <p className="text-xs text-dark-muted mt-1">Review your basket, select your shipping address, and authorize payment.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* LEFT COLUMN: Shipping details & address cards (col span 7) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="p-6 rounded-3xl bg-white/5 border border-white/5 shadow-glass flex flex-col gap-5">
            <h3 className="font-accent text-sm font-bold tracking-wider text-white uppercase flex items-center gap-2">
              <MapPin className="text-primary" size={16} /> DELIVERY ADDRESS
            </h3>

            {/* Address grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {user.addresses && user.addresses.map((addr, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedAddressIndex(idx)}
                  className={`p-4 rounded-2xl border text-left flex flex-col gap-1.5 transition-all shadow-glass ${
                    selectedAddressIndex === idx
                      ? 'bg-primary/10 border-primary/30 text-white'
                      : 'bg-black/30 border-white/5 hover:bg-white/5 text-dark-text'
                  }`}
                >
                  <div className="flex justify-between items-center w-full">
                    <span className="text-[10px] font-black text-primary tracking-widest uppercase">ADDRESS #{idx + 1}</span>
                    <div className={`h-4.5 w-4.5 rounded-full border flex items-center justify-center text-[10px] ${
                      selectedAddressIndex === idx ? 'bg-primary border-primary text-white shadow-glow' : 'border-white/10'
                    }`}>
                      {selectedAddressIndex === idx && '✓'}
                    </div>
                  </div>
                  <p className="text-xs font-bold leading-normal mt-1">{addr.street}</p>
                  <p className="text-[10px] text-dark-muted font-medium">{addr.city}, {addr.state} - {addr.zipCode}</p>
                </button>
              ))}

              {/* Add address trigger */}
              <button
                onClick={() => setShowNewAddressForm(!showNewAddressForm)}
                className="p-4 rounded-2xl border border-dashed border-white/10 hover:border-primary/40 bg-black/10 hover:bg-primary/5 transition-all flex flex-col items-center justify-center text-center gap-1.5 text-dark-muted hover:text-primary h-full min-h-[120px]"
              >
                <Plus size={20} />
                <span className="text-xs font-bold uppercase tracking-wider">ADD NEW ADDRESS</span>
              </button>
            </div>

            {/* Add Address Form popup/container */}
            <AnimatePresence>
              {showNewAddressForm && (
                <motion.form
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  onSubmit={handleAddNewAddressSubmit}
                  className="bg-black/40 border border-white/5 rounded-2xl p-4 flex flex-col gap-4 overflow-hidden mt-2"
                >
                  <h4 className="text-[10px] font-black tracking-widest text-white uppercase">NEW SHIPMENT TARGET</h4>
                  <div className="flex flex-col gap-3">
                    <input
                      type="text"
                      placeholder="Street Address (e.g. Flat 402, Sector 9)"
                      value={newAddress.street}
                      onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                      className="h-10 bg-white/5 border border-white/5 rounded-xl px-3 text-xs focus:outline-none focus:border-primary placeholder:text-dark-muted text-white"
                    />
                    <div className="grid grid-cols-3 gap-2">
                      <input
                        type="text"
                        placeholder="City"
                        value={newAddress.city}
                        onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                        className="h-10 bg-white/5 border border-white/5 rounded-xl px-3 text-xs focus:outline-none focus:border-primary placeholder:text-dark-muted text-white"
                      />
                      <input
                        type="text"
                        placeholder="State"
                        value={newAddress.state}
                        onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                        className="h-10 bg-white/5 border border-white/5 rounded-xl px-3 text-xs focus:outline-none focus:border-primary placeholder:text-dark-muted text-white"
                      />
                      <input
                        type="text"
                        placeholder="Zip Code"
                        value={newAddress.zipCode}
                        onChange={(e) => setNewAddress({ ...newAddress, zipCode: e.target.value })}
                        className="h-10 bg-white/5 border border-white/5 rounded-xl px-3 text-xs focus:outline-none focus:border-primary placeholder:text-dark-muted text-white"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 ml-auto">
                    <button
                      type="button"
                      onClick={() => setShowNewAddressForm(false)}
                      className="px-4 h-9 border border-white/5 text-dark-muted hover:text-white rounded-lg text-xs font-bold transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 h-9 bg-primary text-white rounded-lg text-xs font-bold shadow-glow hover:bg-primary-dark transition-all"
                    >
                      Save Address
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* RIGHT COLUMN: Order Summary & Checkout Trigger (Col span 5) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="p-6 rounded-3xl bg-white/5 border border-white/5 shadow-glass flex flex-col gap-5">
            <h3 className="font-accent text-sm font-bold tracking-wider text-white uppercase flex items-center gap-2">
              <ShoppingBag className="text-primary" size={16} /> BILLING SUMMARY
            </h3>

            {/* List items mini scroll */}
            <div className="max-h-[160px] overflow-y-auto pr-2 flex flex-col gap-3">
              {cart.items.map((item) => (
                <div key={item._id} className="flex justify-between items-center text-xs text-dark-muted border-b border-white/5 pb-2">
                  <div className="max-w-[70%] truncate">
                    <span className="font-bold text-dark-text">{item.isCustom ? 'Custom Craft Pizza' : item.pizza?.name}</span>
                    <span className="text-[10px] bg-white/5 px-1.5 py-0.5 rounded ml-2 font-medium">{item.size} x{item.quantity}</span>
                  </div>
                  <span className="font-bold text-white">₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>

            {/* Price Calculations ledger */}
            <div className="flex flex-col gap-2 text-xs text-dark-muted pt-2 border-t border-white/5">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{subtotal}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-primary font-bold">
                  <span>Coupon Applied</span>
                  <span>-₹{discountAmount}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>GST (5%)</span>
                <span>₹{gstCharges}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Service</span>
                <span>{deliveryCharges === 0 ? <strong className="text-veg uppercase text-[10px]">FREE</strong> : `₹${deliveryCharges}`}</span>
              </div>
              <div className="flex justify-between items-baseline pt-3 border-t border-white/5 mt-1">
                <span className="text-sm font-bold text-dark-text">Grand Total</span>
                <span className="text-2xl font-black text-primary glow-text">₹{totalAmount}</span>
              </div>
            </div>

            <button
              onClick={handlePlaceOrderAndPay}
              disabled={loading || !cart || cart.items.length === 0}
              className="w-full py-4 bg-primary hover:bg-primary-dark text-white font-accent font-black tracking-widest text-xs rounded-2xl shadow-glow hover:shadow-glow transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              ) : (
                <>
                  <CreditCard size={14} /> AUTHORIZE SECURE PAYMENT ⚡
                </>
              )}
            </button>
          </div>
        </div>

      </div>

      {/* PAYMENT SIMULATOR MODAL POPUP */}
      <AnimatePresence>
        {isSimulatingPayment && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-50 pointer-events-auto"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed inset-x-4 top-[15%] max-w-md mx-auto rounded-[36px] glass-panel border border-primary/20 p-6 md:p-8 shadow-[0_0_50px_rgba(255,107,8,0.25)] z-50 text-center flex flex-col gap-6 pointer-events-auto text-dark-text"
            >
              <div className="flex flex-col items-center gap-2">
                <span className="text-5xl animate-bounce">🛡️</span>
                <h3 className="font-accent text-lg font-black tracking-widest text-primary glow-text uppercase">SIMULATED PAYMENT</h3>
                <p className="text-[10px] text-dark-muted max-w-xs leading-normal">
                  Your server is operating on Sandbox/Simulated mode. Please select your simulated transaction response.
                </p>
              </div>

              <div className="bg-black/40 border border-white/5 rounded-2xl p-4 text-xs text-left flex flex-col gap-2.5 font-bold tracking-wide">
                <div className="flex justify-between">
                  <span className="text-dark-muted font-normal">SIMULATED ORDER REF</span>
                  <span className="text-white">#{simulatedPaymentOrder?.orderId.slice(-6)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dark-muted font-normal">SIMULATED KEY REFERENCE</span>
                  <span className="text-white truncate max-w-[150px]">{simulatedPaymentOrder?.razorpayOrder.id}</span>
                </div>
                <div className="flex justify-between border-t border-white/5 pt-2 mt-1">
                  <span className="text-dark-muted font-normal">AMOUNT AUTHORIZED</span>
                  <span className="text-primary text-sm font-black">₹{totalAmount}</span>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={handleSimulatePaymentSuccess}
                  className="w-full py-3.5 bg-veg hover:bg-green-600 text-white font-accent font-black tracking-widest text-xs rounded-xl shadow-glow-green hover:scale-102 transition-all flex items-center justify-center gap-1.5"
                >
                  <Sparkles size={14} className="animate-pulse" /> SIMULATE SUCCESSFUL TRANSACTION
                </button>
                <button
                  onClick={handleSimulatePaymentFailure}
                  className="w-full py-3.5 border border-nonveg hover:bg-nonveg/10 text-nonveg font-accent font-black tracking-widest text-xs rounded-xl hover:scale-102 transition-all"
                >
                  SIMULATE REJECTED / FAILED TRANSACTION
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
