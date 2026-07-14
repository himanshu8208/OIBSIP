import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FileText, Printer, Navigation, CheckCircle2 } from 'lucide-react';

export default function OrderSuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSuccessOrder = async () => {
      const orderId = searchParams.get('orderId');
      if (!orderId) {
        navigate('/');
        return;
      }
      try {
        const res = await axios.get(`/orders/${orderId}`);
        if (res.data.success) {
          setOrder(res.data.order);
        }
      } catch (err) {
        console.error('[Success Page] Error loading order details:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchSuccessOrder();
  }, [searchParams]);

  // Invoice dynamic print trigger
  const handlePrintInvoice = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center bg-dark-bg text-primary">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center text-center text-dark-muted gap-4">
        <span>⚠️</span>
        <h2 className="font-accent text-lg font-black text-white uppercase tracking-wider">Order Not Found</h2>
        <Link to="/" className="text-xs font-bold text-primary hover:underline uppercase">Return to home</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-6 md:px-12 py-10 max-w-3xl mx-auto flex flex-col gap-8 print:p-0 print:m-0 print:bg-white print:text-black">
      
      {/* 1. ANIMATED SUCCESS TICK & CONFIRMATION (Hidden on print) */}
      <div className="text-center flex flex-col items-center gap-4 print:hidden">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="h-16 w-16 rounded-full bg-veg/10 border border-veg/30 text-veg flex items-center justify-center shadow-glow-green"
        >
          <CheckCircle2 size={36} className="animate-pulse" />
        </motion.div>

        <div className="flex flex-col gap-1">
          <h1 className="font-accent text-2xl md:text-3xl font-black uppercase tracking-widest text-veg glow-text">ORDER PAID SUCCESSFULLY!</h1>
          <p className="text-xs text-dark-muted">We have received your payment. Our chefs are hand-tossing your creation.</p>
        </div>

        {/* Dynamic Timeline tracker link */}
        <Link 
          to={`/track-order/${order._id}`}
          className="mt-2 flex items-center gap-2 px-6 h-12 bg-primary hover:bg-primary-dark text-white font-accent font-black tracking-widest text-xs rounded-2xl shadow-glow hover:scale-103 transition-all duration-300 w-fit"
        >
          <Navigation size={14} className="animate-bounce" /> REAL-TIME ORDER TRACKING ⚡
        </Link>
      </div>

      {/* 2. PRINTABLE INVOICE RECEIPT COMPONENT */}
      <div className="p-6 md:p-8 rounded-3xl bg-white/5 border border-white/5 shadow-glass flex flex-col gap-6 print:border-none print:shadow-none print:bg-white print:text-black">
        {/* Invoice Header */}
        <div className="flex justify-between items-start border-b border-white/5 pb-5 print:border-black/10">
          <div>
            <span className="text-2xl font-accent font-black text-primary uppercase tracking-widest print:text-orange-600">🍕 PIZZAVERSE</span>
            <p className="text-[10px] text-dark-muted mt-1 print:text-neutral-500">Sector 9, Cyber City Core, Neo-Mumbai</p>
          </div>
          <div className="text-right">
            <h3 className="font-accent text-sm font-bold tracking-widest text-white uppercase print:text-black">INVOICE</h3>
            <p className="text-[10px] text-dark-muted font-bold print:text-neutral-500">ID: #{order._id.toString().toUpperCase()}</p>
            <p className="text-[10px] text-dark-muted print:text-neutral-500">Date: {new Date(order.createdAt).toLocaleDateString()}</p>
          </div>
        </div>

        {/* Address and account information info details */}
        <div className="grid grid-cols-2 gap-6 text-xs border-b border-white/5 pb-5 print:border-black/10 print:text-black">
          <div>
            <h4 className="text-[10px] font-black text-primary tracking-widest uppercase mb-1.5 print:text-orange-600">SHIPPED TO:</h4>
            <p className="font-bold text-white print:text-black">{order.user?.name || 'Citizen Profile'}</p>
            <p className="text-dark-muted mt-0.5 print:text-neutral-600">
              {order.deliveryAddress.street}, {order.deliveryAddress.city}, <br/>
              {order.deliveryAddress.state} - {order.deliveryAddress.zipCode}
            </p>
          </div>
          <div className="text-right">
            <h4 className="text-[10px] font-black text-primary tracking-widest uppercase mb-1.5 print:text-orange-600">PAYMENT DETAILS:</h4>
            <p className="text-white font-bold print:text-black">Razorpay Gateway</p>
            <p className="text-dark-muted mt-0.5 print:text-neutral-600">Status: <span className="text-veg font-black uppercase">PAID</span></p>
            <p className="text-[10px] text-dark-muted truncate max-w-[200px] print:text-neutral-600">TxnID: {order.paymentDetails?.razorpayPaymentId}</p>
          </div>
        </div>

        {/* Invoice lines ledger table */}
        <div className="flex flex-col gap-4">
          <h4 className="text-[10px] font-black text-primary tracking-widest uppercase print:text-orange-600">ORDER ITEMS</h4>
          
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 text-dark-muted print:border-black/10 print:text-neutral-500">
                <th className="py-2">Item Description</th>
                <th className="py-2 text-center">Size</th>
                <th className="py-2 text-center">Qty</th>
                <th className="py-2 text-right">Unit Price</th>
                <th className="py-2 text-right">Line Total</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, idx) => {
                const name = item.isCustom
                  ? `Custom Craft Pizza (Base: ${item.customPizzaDetails.base}, Sauce: ${item.customPizzaDetails.sauce})`
                  : item.pizza?.name;
                return (
                  <tr key={idx} className="border-b border-white/5 print:border-black/5 print:text-black">
                    <td className="py-3 font-bold pr-4">
                      {name}
                      {item.isCustom && item.customPizzaDetails && (
                        <div className="text-[9px] text-dark-muted font-normal mt-0.5 max-w-sm print:text-neutral-500">
                          Toppings: { [...item.customPizzaDetails.cheeses, ...item.customPizzaDetails.veggies, ...item.customPizzaDetails.meats].join(', ') }
                        </div>
                      )}
                    </td>
                    <td className="py-3 text-center font-bold">{item.size}</td>
                    <td className="py-3 text-center font-bold">{item.quantity}</td>
                    <td className="py-3 text-right font-bold">₹{item.price}</td>
                    <td className="py-3 text-right font-bold text-white print:text-black">₹{item.price * item.quantity}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Financial subtotal calculations */}
        <div className="flex flex-col gap-1.5 text-xs text-dark-muted ml-auto w-full max-w-xs border-t border-white/5 pt-4 print:border-black/10 print:text-black">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span className="font-bold text-white print:text-black">₹{order.totalAmount - Math.round(order.totalAmount * 0.05) - (order.totalAmount > 500 ? 0 : 40)}</span>
          </div>
          <div className="flex justify-between">
            <span>GST (5%)</span>
            <span>₹{Math.round(order.totalAmount * 0.05)}</span>
          </div>
          <div className="flex justify-between">
            <span>Delivery Fee</span>
            <span>{order.totalAmount > 500 ? 'FREE' : '₹40'}</span>
          </div>
          <div className="flex justify-between items-baseline pt-3 border-t border-white/5 mt-1">
            <span className="font-bold text-white print:text-black">Grand Total Paid</span>
            <span className="text-xl font-black text-primary glow-text print:text-orange-600">₹{order.totalAmount}</span>
          </div>
        </div>
      </div>

      {/* 3. CONTROL ACTIONS TRIGGER FOOTER (Hidden on print) */}
      <div className="flex gap-4 ml-auto print:hidden">
        <button
          onClick={handlePrintInvoice}
          className="flex items-center gap-1.5 px-6 h-12 border border-white/10 hover:border-primary/50 text-white hover:text-primary bg-white/5 hover:bg-primary/5 font-accent font-black tracking-widest text-xs rounded-2xl transition-all duration-300"
        >
          <Printer size={14} /> DOWNLOAD INVOICE PDF / PRINT
        </button>
        <Link
          to="/menu"
          className="flex items-center gap-1.5 px-6 h-12 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-accent font-black tracking-widest text-xs rounded-2xl transition-all duration-300"
        >
          BACK TO MENU
        </Link>
      </div>

      {/* Tailwind Print Specific Styles Injection */}
      <style>{`
        @media print {
          body {
            background-color: white !important;
            color: black !important;
          }
          nav, footer, .print\\:hidden {
            display: none !important;
          }
          main {
            padding: 0 !important;
            margin: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}
