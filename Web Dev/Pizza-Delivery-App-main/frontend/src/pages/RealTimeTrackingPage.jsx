import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import io from 'socket.io-client';
import { useAuth } from '../store/AuthContext';
import { useToast } from '../App';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Clock, MapPin, Truck, Compass, CheckCircle2, Flame, RotateCcw } from 'lucide-react';

export default function RealTimeTrackingPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentStatus, setCurrentStatus] = useState('');
  const [eta, setEta] = useState('');

  // 1. Fetch Order on mount
  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`/orders/${id}`);
        if (res.data.success) {
          const ord = res.data.order;
          setOrder(ord);
          setCurrentStatus(ord.orderStatus);
          setEta(ord.deliveryETA);
        }
      } catch (error) {
        console.error('[Tracking Page] Fetch order details failed:', error.message);
        showToast('Failed to load order tracking details', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchOrderDetails();
  }, [id]);

  // 2. Establish Socket.IO Real-time Connection
  useEffect(() => {
    if (!order || !user) return;

    // Connect to backend server
    const socket = io('http://localhost:5000');

    socket.on('connect', () => {
      console.log('[Socket.IO Client] Connected! Joining room:', order.user._id || order.user);
      // Securely join room bound to user ID so order leakage is impossible
      socket.emit('joinRoom', order.user._id || order.user);
    });

    // Listen for real-time status updates from Admin Panel
    socket.on('orderStatusUpdated', (data) => {
      console.log('[Socket.IO Client] Received orderStatusUpdated event:', data);
      if (data.orderId === id) {
        setCurrentStatus(data.orderStatus);
        setEta(data.deliveryETA);
        showToast(`Pizza Update: ${data.orderStatus}! 🍕⚡`, 'info');
      }
    });

    return () => {
      socket.disconnect();
      console.log('[Socket.IO Client] Disconnected.');
    };
  }, [order, id, user]);

  // Dynamic ETA display helper
  const calculateRemainingMinutes = () => {
    if (!eta) return 0;
    const diffMs = new Date(eta) - new Date();
    const diffMins = Math.max(0, Math.ceil(diffMs / 60000));
    return diffMins;
  };

  const remainingMins = calculateRemainingMinutes();

  const trackingSteps = [
    {
      status: 'Order Received',
      label: 'Order Locked',
      desc: 'Our system has verified your transaction. Ingredients calibrated.',
      icon: <FileText size={20} />
    },
    {
      status: 'Preparing',
      label: 'Prep Phase',
      desc: 'Chefs are hand-stretching the sourdough crust and applying dynamic base sauces.',
      icon: <RotateCcw size={20} className="animate-spin-slow" />
    },
    {
      status: 'In Kitchen',
      label: 'Fire Baking',
      desc: 'Baking inside our 450°C stone-deck convection chambers for a crispy blister crust.',
      icon: <Flame size={20} className="animate-pulse" />
    },
    {
      status: 'Out for Delivery',
      label: 'On Transit',
      desc: 'Pizza dispatched on our hyper-route visual couriers. ETA downcounter active.',
      icon: <Truck size={20} />
    },
    {
      status: 'Delivered',
      label: 'Delivered',
      desc: 'Touchdown successful! Open your glowing thermal package and dig into the Verse.',
      icon: <CheckCircle2 size={20} />
    }
  ];

  // Helper to check index states
  const getStepState = (stepStatus) => {
    const statusOrder = ['Order Received', 'Preparing', 'In Kitchen', 'Out for Delivery', 'Delivered'];
    const currentIndex = statusOrder.indexOf(currentStatus);
    const stepIndex = statusOrder.indexOf(stepStatus);

    if (stepIndex === currentIndex) return 'active';
    if (stepIndex < currentIndex) return 'completed';
    return 'pending';
  };

  if (loading) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center bg-dark-bg text-primary">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center text-center text-dark-muted gap-4">
        <span>⚠️</span>
        <h2 className="font-accent text-lg font-black text-white uppercase tracking-wider">Order Not Found</h2>
        <Link to="/orders" className="text-xs font-bold text-primary hover:underline uppercase">Go to history</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-6 md:px-12 py-10 max-w-4xl mx-auto flex flex-col gap-10">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="font-accent text-3xl md:text-5xl font-black uppercase tracking-wider text-white">
            RADAR <span className="text-primary glow-text">TRACKER</span>
          </h1>
          <p className="text-xs text-dark-muted mt-1">Real-time WebSocket telemetry syncing live preparation parameters.</p>
        </div>
        <div className="flex gap-2">
          <Link
            to={`/order-success?orderId=${order._id}`}
            className="flex items-center gap-1.5 px-4 h-10 border border-white/5 hover:border-primary/20 text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-white/5 transition-all"
          >
            VIEW INVOICE
          </Link>
          <Link
            to="/menu"
            className="flex items-center gap-1.5 px-4 h-10 bg-white/5 border border-white/5 text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-white/10 transition-all text-white"
          >
            ORDER MORE
          </Link>
        </div>
      </div>

      {/* Grid: Tracker & Order Summary Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: The timeline progress timeline track (Col span 7) */}
        <div className="lg:col-span-8 p-6 rounded-3xl bg-white/5 border border-white/5 shadow-glass flex flex-col gap-8 relative overflow-hidden">
          {/* Glowing blur */}
          <div className="absolute top-10 right-10 w-48 h-48 rounded-full bg-primary/10 blur-[80px] pointer-events-none" />

          <div className="flex justify-between items-center border-b border-white/5 pb-4">
            <div>
              <span className="text-[10px] text-primary font-bold uppercase tracking-widest">ORDER TElemetry</span>
              <h3 className="text-sm font-bold text-white uppercase mt-0.5">ID: #{order._id.slice(-6).toUpperCase()}</h3>
            </div>
            {currentStatus !== 'Delivered' && (
              <div className="text-right flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary py-1.5 px-3.5 rounded-xl shadow-glow">
                <Clock size={16} className="animate-pulse" />
                <div className="flex flex-col text-left">
                  <span className="text-[8px] text-orange-200 uppercase font-black tracking-widest leading-none">ETA DOWNCOUNTER</span>
                  <span className="text-xs font-black text-white mt-0.5">{remainingMins} MINS REMAINING</span>
                </div>
              </div>
            )}
          </div>

          {/* Glowing Neon Timeline Progress Tracker */}
          <div className="flex flex-col gap-6 relative pl-10 md:pl-12">
            
            {/* The vertical timeline bar */}
            <div className="absolute left-[21px] md:left-[25px] top-4 bottom-4 w-0.5 bg-white/5 z-0" />
            
            {/* The active glowing fill progress line */}
            <div 
              style={{
                height: 
                  currentStatus === 'Order Received' ? '0%' :
                  currentStatus === 'Preparing' ? '25%' :
                  currentStatus === 'In Kitchen' ? '50%' :
                  currentStatus === 'Out for Delivery' ? '75%' : '100%'
              }}
              className="absolute left-[21px] md:left-[25px] top-4 w-0.5 bg-gradient-to-b from-primary to-orange-400 z-0 shadow-glow transition-all duration-1000 ease-out"
            />

            {trackingSteps.map((step, idx) => {
              const state = getStepState(step.status);

              return (
                <div key={idx} className="flex gap-4 relative z-10 py-1.5">
                  
                  {/* Timeline icon dot */}
                  <div className={`absolute -left-10 md:-left-12 h-11 w-11 rounded-full border flex items-center justify-center transition-all duration-500 ${
                    state === 'active' 
                      ? 'bg-primary border-primary text-white shadow-glow' 
                      : state === 'completed'
                      ? 'bg-veg/10 border-veg text-veg shadow-glow-green'
                      : 'bg-black/80 border-white/5 text-dark-muted'
                  }`}>
                    {step.icon}
                  </div>

                  {/* Step details content */}
                  <div className="flex flex-col gap-1">
                    <h4 className={`font-accent text-xs font-black tracking-widest uppercase transition-colors ${
                      state === 'active' ? 'text-primary glow-text' : 
                      state === 'completed' ? 'text-veg' : 'text-dark-muted'
                    }`}>
                      {step.label}
                    </h4>
                    <p className={`text-xs font-bold leading-normal transition-colors ${state === 'active' ? 'text-white' : 'text-dark-muted'}`}>
                      {step.status}
                    </p>
                    {state === 'active' && (
                      <p className="text-[10px] text-dark-muted leading-relaxed max-w-md mt-1 animate-pulse">
                        {step.desc}
                      </p>
                    )}
                  </div>

                </div>
              );
            })}
          </div>

        </div>

        {/* RIGHT COLUMN: Address & Items summary cards (Col span 4) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Address Details */}
          <div className="p-5 rounded-3xl bg-white/5 border border-white/5 shadow-glass flex flex-col gap-4">
            <h3 className="font-accent text-[10px] font-black tracking-widest text-primary uppercase flex items-center gap-1.5">
              <MapPin size={14} /> SHIPPING SECTOR
            </h3>
            <div className="text-xs">
              <p className="font-bold text-white">{order.user?.name || 'Citizen profile'}</p>
              <p className="text-dark-muted mt-1 leading-normal">
                {order.deliveryAddress.street}, <br/>
                {order.deliveryAddress.city}, {order.deliveryAddress.state} - {order.deliveryAddress.zipCode}
              </p>
            </div>
          </div>

          {/* Items Summary details list */}
          <div className="p-5 rounded-3xl bg-white/5 border border-white/5 shadow-glass flex flex-col gap-4">
            <h3 className="font-accent text-[10px] font-black tracking-widest text-primary uppercase flex items-center gap-1.5">
              <Compass size={14} /> ITEM TELEMETRY
            </h3>
            <div className="flex flex-col gap-3 max-h-[180px] overflow-y-auto pr-1">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs border-b border-white/5 pb-2 last:border-0 last:pb-0">
                  <div className="max-w-[70%]">
                    <p className="font-bold text-white truncate leading-none">
                      {item.isCustom ? 'Custom Craft Pizza' : item.pizza?.name}
                    </p>
                    <span className="text-[9px] text-dark-muted mt-1 block">Size: {item.size} x{item.quantity}</span>
                  </div>
                  <span className="font-bold text-primary text-xs">₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-white/5 pt-3 flex justify-between items-baseline text-xs mt-1">
              <span className="font-bold text-dark-text">Paid Grand Total</span>
              <span className="text-base font-black text-primary">₹{order.totalAmount}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
