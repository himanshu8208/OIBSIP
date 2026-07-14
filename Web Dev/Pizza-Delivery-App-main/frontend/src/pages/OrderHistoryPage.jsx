import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../store/CartContext';
import { useToast } from '../App';
import { motion } from 'framer-motion';
import { ShoppingBag, ChevronRight, RefreshCw, Star, ShieldCheck } from 'lucide-react';

export default function OrderHistoryPage() {
  const { addToCart } = useCart();
  const { showToast } = useToast();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/orders/my-orders');
      if (res.data.success) {
        setOrders(res.data.orders);
      }
    } catch (err) {
      console.error('[History Page] Error fetching orders:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Quick reorder trigger helper
  const handleReorder = async (pastOrder, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    let successCount = 0;

    for (const item of pastOrder.items) {
      try {
        const res = await addToCart({
          pizzaId: item.isCustom ? null : item.pizza?._id || item.pizza,
          isCustom: item.isCustom,
          customPizzaDetails: item.customPizzaDetails,
          size: item.size,
          price: item.price,
          quantity: item.quantity
        });
        if (res.success) successCount++;
      } catch (err) {
        console.error('[History Page] Reorder single item failed:', err);
      }
    }

    if (successCount > 0) {
      showToast(`Successfully reloaded ${successCount} item(s) to your cart! 🍕🔥`, 'success');
    } else {
      showToast('Failed to duplicate previous order configurations', 'error');
    }
  };

  // Helper status badge color mapping
  const getStatusBadgeStyles = (status) => {
    if (status === 'Delivered') return 'bg-veg/10 border-veg/30 text-veg shadow-glow-green';
    if (status === 'Out for Delivery') return 'bg-orange-500/10 border-orange-500/30 text-orange-400 shadow-glow';
    if (status === 'Pending' || status === 'Failed') return 'bg-nonveg/10 border-nonveg/30 text-nonveg shadow-glow-red';
    return 'bg-primary/10 border-primary/30 text-primary shadow-glow'; // Preparing, Kitchen
  };

  if (loading) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center bg-dark-bg text-primary">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-6 md:px-12 py-10 max-w-4xl mx-auto flex flex-col gap-10">
      {/* Page Header */}
      <div>
        <h1 className="font-accent text-3xl md:text-5xl font-black uppercase tracking-wider text-white">
          ORDER <span className="text-primary glow-text">HISTORY</span>
        </h1>
        <p className="text-xs text-dark-muted mt-1">Review your recent transaction logs, verify tracking, or clone previous recipes.</p>
      </div>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center text-dark-muted gap-4">
          <span className="text-6xl animate-bounce">📦</span>
          <p className="font-bold text-sm">No transactions registered yet!</p>
          <p className="text-xs max-w-sm leading-normal">
            You haven't ordered any pizzas in the PizzaVerse yet. Head over to our menu or Visual Builder to initiate checkout.
          </p>
          <Link
            to="/menu"
            className="mt-3 px-6 h-11 bg-primary hover:bg-primary-dark text-white font-accent font-black tracking-widest text-xs rounded-xl shadow-glow transition-all"
          >
            ORDER YOUR FIRST PIZZA ⚡
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {orders.map((ord) => (
            <div
              key={ord._id}
              className="p-5 md:p-6 rounded-[28px] bg-white/5 border border-white/5 shadow-glass flex flex-col gap-5 hover:border-primary/20 transition-all group"
            >
              {/* Order Card Header */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/5 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-primary/10 border border-primary/20 text-primary rounded-xl">
                    <ShoppingBag size={18} />
                  </div>
                  <div>
                    <h3 className="font-accent text-xs font-black text-white tracking-widest uppercase">ID: #{ord._id.slice(-6).toUpperCase()}</h3>
                    <p className="text-[10px] text-dark-muted mt-0.5">Placed on: {new Date(ord.createdAt).toLocaleString()}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  {/* Status Badge */}
                  <span className={`text-[10px] font-black uppercase tracking-widest py-1 px-3.5 rounded-full border ${getStatusBadgeStyles(ord.orderStatus)}`}>
                    ⚡ {ord.orderStatus}
                  </span>
                  
                  {/* Payment status badge */}
                  <span className={`text-[10px] font-black uppercase tracking-widest py-1 px-3.5 rounded-full border ${
                    ord.paymentStatus === 'Paid' ? 'bg-veg/10 border-veg/20 text-veg' : 'bg-nonveg/10 border-nonveg/20 text-nonveg'
                  }`}>
                    {ord.paymentStatus === 'Paid' ? '💰 PAID' : '❌ UNPAID'}
                  </span>
                </div>
              </div>

              {/* Items summary list */}
              <div className="flex flex-col gap-3">
                {ord.items.map((item, idx) => {
                  const title = item.isCustom
                    ? `Custom Sourdough Creation (Base: ${item.customPizzaDetails?.base})`
                    : item.pizza?.name || 'Curated Signature Recipe';
                  return (
                    <div key={idx} className="flex justify-between items-center text-xs">
                      <div>
                        <span className="font-bold text-white group-hover:text-primary transition-colors leading-snug">{title}</span>
                        <span className="text-[10px] text-dark-muted block mt-0.5 leading-none">Size: {item.size} x{item.quantity}</span>
                      </div>
                      <span className="font-bold text-white">₹{item.price * item.quantity}</span>
                    </div>
                  );
                })}
              </div>

              {/* Financial Subtotals and Action triggers */}
              <div className="border-t border-white/5 pt-4 mt-1 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-baseline gap-1.5 self-start sm:self-center">
                  <span className="text-xs text-dark-muted uppercase font-bold tracking-wider">Total Paid</span>
                  <span className="text-xl font-black text-primary glow-text">₹{ord.totalAmount}</span>
                </div>

                <div className="flex gap-2 w-full sm:w-auto">
                  {/* Quick Reorder CTA */}
                  <button
                    onClick={(e) => handleReorder(ord, e)}
                    className="flex-grow sm:flex-none flex items-center justify-center gap-1.5 h-11 px-5 border border-white/10 hover:border-primary/40 bg-white/5 hover:bg-primary/10 text-xs font-black tracking-widest text-dark-text hover:text-primary rounded-xl transition-all"
                  >
                    <RefreshCw size={14} /> CLONE REORDER
                  </button>

                  {/* Active radar tracking CTA */}
                  <Link
                    to={`/track-order/${ord._id}`}
                    className="flex-grow sm:flex-none flex items-center justify-center gap-1.5 h-11 px-5 bg-primary hover:bg-primary-dark text-white text-xs font-black tracking-widest rounded-xl shadow-glow hover:shadow-glow transition-all"
                  >
                    RADAR TRACK <ChevronRight size={14} />
                  </Link>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}
