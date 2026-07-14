import React, { useState, useEffect, createContext, useContext } from 'react';
import axios from 'axios';
import { useAnimate, motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldAlert, LayoutDashboard, ShoppingCart, Library, Info,
  LineChart, Package, Users, LogOut, Check, ArrowRight, Sparkles, Plus, Trash2, Eye
} from 'lucide-react';

// Configure Axios defaults for Admin
const API_URL = 'http://localhost:5000/api';
axios.defaults.baseURL = API_URL;

// Context for Toasts in Admin
const ToastContext = createContext();
const useToast = () => useContext(ToastContext);

export default function App() {
  const [adminToken, setAdminToken] = useState(localStorage.getItem('adminToken') || '');
  const [adminUser, setAdminUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard'); // dashboard, orders, inventory, menu
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [toasts, setToasts] = useState([]);

  // Login form states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  // Setup Axios defaults & request interceptor
  useEffect(() => {
    axios.defaults.baseURL = 'http://localhost:5000/api';
    const requestInterceptor = axios.interceptors.request.use(
      (config) => {
        const activeToken = localStorage.getItem('adminToken');
        if (activeToken) {
          config.headers['Authorization'] = `Bearer ${activeToken}`;
        } else {
          delete config.headers['Authorization'];
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.request.eject(requestInterceptor);
    };
  }, []);

  // Trigger admin toast helper
  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  // Validate admin token on mount
  useEffect(() => {
    const checkAdminSession = async () => {
      if (!adminToken) {
        setLoadingProfile(false);
        return;
      }
      try {
        const response = await axios.get('/auth/profile');
        if (response.data.success && response.data.user.role === 'admin') {
          setAdminUser(response.data.user);
        } else {
          handleLogout();
          showToast('Access denied: Admin role required.', 'error');
        }
      } catch (error) {
        handleLogout();
      } finally {
        setLoadingProfile(false);
      }
    };
    checkAdminSession();
  }, [adminToken]);

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      showToast('Please fill in credentials', 'error');
      return;
    }
    setLoggingIn(true);
    try {
      const response = await axios.post('/auth/login', { email: loginEmail, password: loginPassword });
      if (response.data.success) {
        const { token, user } = response.data;
        if (user.role !== 'admin') {
          showToast('Access denied: Citizen is not an administrator.', 'error');
        } else {
          localStorage.setItem('adminToken', token);
          setAdminToken(token);
          setAdminUser(user);
          showToast('Clearance verified. Welcome commander!', 'success');
        }
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Verification failed. Invalid credentials.', 'error');
    } finally {
      setLoggingIn(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setAdminToken('');
    setAdminUser(null);
  };

  if (loadingProfile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-dark-bg text-primary">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
        <p className="text-xs font-accent tracking-widest text-primary animate-pulse mt-4 uppercase">Decrypting Clearance...</p>
      </div>
    );
  }

  // 1. CLEARANCE LOGIN GATE SCREEN
  if (!adminUser) {
    return (
      <ToastContext.Provider value={{ showToast }}>
        <div className="min-h-screen flex items-center justify-center px-4 relative bg-dark-bg">
          <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full bg-red-600/10 blur-[130px] pointer-events-none" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-primary/10 blur-[120px] pointer-events-none" />

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md rounded-[32px] glass-panel border border-red-500/25 p-8 md:p-10 shadow-[0_0_50px_rgba(239,68,68,0.15)] text-center relative overflow-hidden"
          >
            <div className="flex flex-col items-center gap-2 mb-8">
              <ShieldAlert className="text-red-500 animate-pulse" size={44} />
              <h2 className="font-accent text-xl font-black tracking-widest text-red-500 glow-text uppercase mt-2">
                ADMIN AUTHORIZATION
              </h2>
              <p className="text-xs text-dark-muted">Please provide security administrator credentials to gain database clearance.</p>
            </div>

            <form onSubmit={handleAdminLogin} className="flex flex-col gap-5 text-left">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-dark-text tracking-wide uppercase">Admin Email</label>
                <input 
                  type="email" 
                  placeholder="admin@pizzaverse.net"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full h-12 px-4 bg-white/5 border border-white/5 focus:border-red-500 rounded-2xl text-sm focus:outline-none focus:ring-1 focus:ring-red-500 transition-all placeholder:text-dark-muted text-white" 
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-dark-text tracking-wide uppercase">Clearance Password</label>
                <input 
                  type="password" 
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full h-12 px-4 bg-white/5 border border-white/5 focus:border-red-500 rounded-2xl text-sm focus:outline-none focus:ring-1 focus:ring-red-500 transition-all placeholder:text-dark-muted text-white" 
                />
              </div>

              <button 
                type="submit"
                disabled={loggingIn}
                className="w-full h-12 mt-2 bg-gradient-to-r from-red-600 to-primary text-white font-accent font-black tracking-widest text-xs rounded-2xl shadow-glow-red hover:scale-102 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loggingIn ? 'VERIFYING KEY...' : 'DECRYPT CLEARANCE SECURELY ⚡'}
              </button>
            </form>
          </motion.div>

          {/* Floating Toast Notification overlay for Admin Login */}
          <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 pointer-events-none">
            <AnimatePresence>
              {toasts.map((toast) => (
                <motion.div
                  key={toast.id}
                  initial={{ opacity: 0, y: 30, scale: 0.9, x: 20 }}
                  animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.85, x: 20, transition: { duration: 0.2 } }}
                  className={`pointer-events-auto flex items-center gap-3 px-5 py-4 rounded-xl shadow-glass border backdrop-blur-glass text-sm font-semibold tracking-wide ${
                    toast.type === 'error'
                      ? 'border-red-500/30 bg-red-500/10 text-red-200 shadow-glow-red'
                      : 'border-veg/30 bg-veg/10 text-green-200 shadow-glow-green'
                  }`}
                >
                  <span>🛡️</span>
                  <span>{toast.message}</span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </ToastContext.Provider>
    );
  }

  // 2. MAIN ADMIN WORKSPACE LAYOUT
  return (
    <ToastContext.Provider value={{ showToast }}>
      <div className="min-h-screen flex bg-dark-bg text-dark-text font-sans">
        
        {/* SIDEBAR DASHBOARD CONTROL NAVIGATION */}
        <aside className="w-64 bg-dark-card border-r border-white/5 flex flex-col gap-8 p-6 flex-shrink-0">
          {/* Brand header */}
          <div className="flex items-center gap-2 border-b border-white/5 pb-5">
            <span className="text-3xl">🍕</span>
            <div className="flex flex-col">
              <span className="font-accent text-lg font-black tracking-widest text-primary glow-text leading-none uppercase">PIZZAVERSE</span>
              <span className="text-[8px] text-red-400 font-bold uppercase tracking-widest mt-1">COMMAND RADAR v1.0</span>
            </div>
          </div>

          {/* Nav Items */}
          <div className="flex flex-col gap-1.5 flex-grow">
            {[
              { id: 'dashboard', label: 'ANALYTICS', icon: <LayoutDashboard size={18} /> },
              { id: 'orders', label: 'LIVE ORDERS', icon: <ShoppingCart size={18} /> },
              { id: 'inventory', label: 'INVENTORY STOCK', icon: <Package size={18} /> },
              { id: 'menu', label: 'PIZZA MENU CRUD', icon: <Library size={18} /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-accent font-black tracking-widest uppercase transition-all ${
                  activeTab === tab.id
                    ? 'bg-primary/10 border border-primary/20 text-primary shadow-glow'
                    : 'text-dark-muted border border-transparent hover:text-white hover:bg-white/5'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          {/* User footer / Logout */}
          <div className="border-t border-white/5 pt-5 flex items-center justify-between gap-4">
            <div className="min-w-0 flex flex-col gap-0.5">
              <span className="font-bold text-xs text-white truncate block">{adminUser.name}</span>
              <span className="text-[8px] text-dark-muted font-bold uppercase tracking-wider block">Administrator</span>
            </div>
            <button 
              onClick={handleLogout}
              className="p-2 rounded-lg bg-black/40 hover:bg-red-500/10 border border-white/5 hover:border-red-500/30 text-dark-muted hover:text-red-400 transition-all"
            >
              <LogOut size={16} />
            </button>
          </div>
        </aside>

        {/* WORKSPACE PAGES CONTAINER */}
        <main className="flex-grow p-8 md:p-12 overflow-y-auto max-h-screen">
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && <DashboardView key="dashboard" />}
            {activeTab === 'orders' && <OrdersView key="orders" />}
            {activeTab === 'inventory' && <InventoryView key="inventory" />}
            {activeTab === 'menu' && <MenuView key="menu" />}
          </AnimatePresence>
        </main>

        {/* Dynamic Toast notifications overlay center */}
        <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 pointer-events-none">
          <AnimatePresence>
            {toasts.map((toast) => (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: 30, scale: 0.9, x: 20 }}
                animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.85, x: 20, transition: { duration: 0.2 } }}
                className={`pointer-events-auto flex items-center gap-3 px-5 py-4 rounded-xl shadow-glass border backdrop-blur-glass text-sm font-semibold tracking-wide ${
                  toast.type === 'error'
                    ? 'border-red-500/30 bg-red-500/10 text-red-200 shadow-glow-red'
                    : toast.type === 'warning'
                    ? 'border-primary/30 bg-primary/10 text-orange-200 shadow-glow'
                    : 'border-veg/30 bg-veg/10 text-green-200 shadow-glow-green'
                }`}
              >
                <span>🍕</span>
                <span>{toast.message}</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

      </div>
    </ToastContext.Provider>
  );
}

// ==========================================
// VIEW 1: ANALYTICS COMMAND DASHBOARD VIEW
// ==========================================
function DashboardView() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const res = await axios.get('/admin/analytics');
      if (res.data.success) {
        setStats(res.data.stats);
      }
    } catch (err) {
      console.error('[Dashboard View] Fetch stats failed:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-primary gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
        <p className="text-xs font-accent tracking-widest text-primary animate-pulse">Aggregating telemetry logs...</p>
      </div>
    );
  }

  const { 
    totalRevenue, totalOrdersCount, activeUsersCount, lowStockCount, 
    vegCount, nonVegCount, customPizzasOrdered, recentOrders, chartData,
    averageOrderValue, paidOrdersCount
  } = stats;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }} 
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="flex flex-col gap-10"
    >
      {/* View Header */}
      <div>
        <h1 className="font-accent text-3xl font-black uppercase tracking-wider text-white">DASHBOARD ANALYTICS</h1>
        <p className="text-xs text-dark-muted mt-1">Aggregated server calculations and visual revenue performance telemetry.</p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        {/* Card 1: Revenue */}
        <div className="p-6 rounded-3xl bg-white/5 border border-white/5 shadow-glass flex flex-col gap-1 relative overflow-hidden">
          <div className="absolute top-4 right-4 text-primary text-xl">💰</div>
          <span className="text-[10px] text-dark-muted font-bold uppercase tracking-widest">Gross Revenue</span>
          <h2 className="text-2xl font-black text-white mt-1">₹{totalRevenue}</h2>
          <span className="text-[8px] text-veg font-bold mt-2">⚡ paid database orders only</span>
        </div>

        {/* Card 2: Orders */}
        <div className="p-6 rounded-3xl bg-white/5 border border-white/5 shadow-glass flex flex-col gap-1 relative overflow-hidden">
          <div className="absolute top-4 right-4 text-primary text-xl">🛒</div>
          <span className="text-[10px] text-dark-muted font-bold uppercase tracking-widest">Total Orders</span>
          <h2 className="text-2xl font-black text-white mt-1">{totalOrdersCount}</h2>
          <span className="text-[8px] text-primary font-bold mt-2">⚡ transaction registers</span>
        </div>

        {/* Card 3: Users */}
        <div className="p-6 rounded-3xl bg-white/5 border border-white/5 shadow-glass flex flex-col gap-1 relative overflow-hidden">
          <div className="absolute top-4 right-4 text-primary text-xl">👥</div>
          <span className="text-[10px] text-dark-muted font-bold uppercase tracking-widest">Active Citizens</span>
          <h2 className="text-2xl font-black text-white mt-1">{activeUsersCount}</h2>
          <span className="text-[8px] text-primary font-bold mt-2">⚡ registered profiles</span>
        </div>

        {/* Card 4: Avg Order Value */}
        <div className="p-6 rounded-3xl bg-white/5 border border-white/5 shadow-glass flex flex-col gap-1 relative overflow-hidden">
          <div className="absolute top-4 right-4 text-primary text-xl">🎯</div>
          <span className="text-[10px] text-dark-muted font-bold uppercase tracking-widest">Avg Ticket Value</span>
          <h2 className="text-2xl font-black text-white mt-1">₹{averageOrderValue || 0}</h2>
          <span className="text-[8px] text-veg font-bold mt-2">⚡ dynamically computed AOV</span>
        </div>

        {/* Card 5: Inventory Alerts */}
        <div className="p-6 rounded-3xl bg-white/5 border border-white/5 shadow-glass flex flex-col gap-1 relative overflow-hidden">
          <div className="absolute top-4 right-4 text-xl">⚠️</div>
          <span className="text-[10px] text-dark-muted font-bold uppercase tracking-widest">Stock Warnings</span>
          <h2 className={`text-2xl font-black mt-1 ${lowStockCount > 0 ? 'text-red-500' : 'text-white'}`}>{lowStockCount}</h2>
          <span className={`text-[8px] font-bold mt-2 ${lowStockCount > 0 ? 'text-red-400 animate-pulse' : 'text-veg'}`}>
            {lowStockCount > 0 ? '⚡ items below threshold safety limit' : '✓ all ingredient counts safe'}
          </span>
        </div>
      </div>

      {/* Grid: Visual Recharts Mock & Popularity ledger */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Visual Revenue Daily Chart (Col span 7) */}
        <div className="lg:col-span-7 p-6 rounded-3xl bg-white/5 border border-white/5 shadow-glass flex flex-col gap-5 relative">
          <h3 className="font-accent text-xs font-black tracking-widest text-primary uppercase">7-DAY DAILY REVENUE TELEMETRY</h3>
          
          {/* Beautiful styled CSS vertical bar chart */}
          <div className="flex h-56 items-end justify-between gap-3 pt-6 border-b border-white/5 pb-2">
            {chartData.map((d, i) => {
              const maxRev = Math.max(...chartData.map(item => item.revenue)) || 1000;
              const percentageHeight = Math.round((d.revenue / maxRev) * 100);

              return (
                <div key={i} className="flex flex-col items-center gap-2 flex-grow animate-pulse-once">
                  <div className="text-[9px] font-bold text-primary">{d.revenue > 0 ? `₹${d.revenue}` : ''}</div>
                  
                  {/* Glowing vertical bar */}
                  <div 
                    style={{ height: `${Math.max(5, percentageHeight)}%` }}
                    className={`w-full max-w-[40px] rounded-t-lg bg-gradient-to-t from-primary to-orange-400 shadow-glow hover:brightness-110 transition-all`}
                  />
                  <span className="text-[10px] font-black text-white uppercase tracking-wider">{d.day}</span>
                </div>
              );
            })}
          </div>

          {/* Daily Telemetry Metrics Table (Live Analysis) */}
          <div className="mt-4 overflow-x-auto border-t border-white/5 pt-4">
            <h4 className="text-[9px] font-accent font-black text-primary uppercase tracking-widest mb-3">7-DAY TELEMETRY DATA LOGS</h4>
            <table className="w-full text-[10px] text-left text-dark-muted border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-dark-muted uppercase font-bold tracking-wider">
                  <th className="pb-2">Day/Date</th>
                  <th className="pb-2 text-center">Orders Ticketed</th>
                  <th className="pb-2 text-right">Daily Revenue</th>
                  <th className="pb-2 text-right">Avg Order Value</th>
                </tr>
              </thead>
              <tbody>
                {chartData.map((d, i) => {
                  const aov = d.orders > 0 ? Math.round(d.revenue / d.orders) : 0;
                  return (
                    <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                      <td className="py-2 text-white font-semibold">
                        {d.day} <span className="text-dark-muted font-normal">({d.date})</span>
                      </td>
                      <td className="py-2 text-center text-white">{d.orders} tickets</td>
                      <td className="py-2 text-right text-primary font-bold">₹{d.revenue}</td>
                      <td className="py-2 text-right text-white">₹{aov}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Recipe Category Popularity (Col span 5) */}
        <div className="lg:col-span-5 p-6 rounded-3xl bg-white/5 border border-white/5 shadow-glass flex flex-col gap-5">
          <h3 className="font-accent text-xs font-black tracking-widest text-primary uppercase">RECIPE POPULARITY INDEX</h3>
          
          <div className="flex flex-col gap-4 py-2">
            {/* Veg vs Non-veg progress bars */}
            <div className="flex flex-col gap-1.5 text-xs text-dark-muted font-bold uppercase tracking-wider">
              <div className="flex justify-between">
                <span className="text-veg">🥦 Vegetarian Recipes</span>
                <span className="text-white">{vegCount} ordered</span>
              </div>
              <div className="w-full bg-black/40 h-2 border border-white/5 rounded-full overflow-hidden">
                <div 
                  style={{ width: `${vegCount + nonVegCount > 0 ? (vegCount / (vegCount + nonVegCount)) * 100 : 50}%` }}
                  className="bg-veg h-full shadow-glow-green" 
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5 text-xs text-dark-muted font-bold uppercase tracking-wider">
              <div className="flex justify-between">
                <span className="text-nonveg">🥩 Meat Creations</span>
                <span className="text-white">{nonVegCount} ordered</span>
              </div>
              <div className="w-full bg-black/40 h-2 border border-white/5 rounded-full overflow-hidden">
                <div 
                  style={{ width: `${vegCount + nonVegCount > 0 ? (nonVegCount / (vegCount + nonVegCount)) * 100 : 50}%` }}
                  className="bg-nonveg h-full shadow-glow-red" 
                />
              </div>
            </div>

            {/* Custom crafted pizzas counts */}
            <div className="border-t border-white/5 pt-4 mt-2 flex justify-between items-center text-xs text-dark-muted font-bold uppercase tracking-wider">
              <span>🛠️ Visual Lab Creations</span>
              <span className="text-primary glow-text text-sm font-black">{customPizzasOrdered} CRAFTED</span>
            </div>
          </div>
        </div>

      </div>

      {/* Real-time Activity Ledger & Console Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Recent Live Ticket Activity (Col span 7) */}
        <div className="lg:col-span-7 p-6 rounded-3xl bg-white/5 border border-white/5 shadow-glass flex flex-col gap-5 relative">
          <h3 className="font-accent text-xs font-black tracking-widest text-primary uppercase">RECENT LIVE TICKET ACTIVITY</h3>
          
          <div className="flex flex-col gap-3.5">
            {!recentOrders || recentOrders.length === 0 ? (
              <div className="text-center py-6 text-dark-muted text-xs uppercase font-bold tracking-wider">
                No active orders recorded yet
              </div>
            ) : (
              recentOrders.map((ord, idx) => (
                <div key={idx} className="flex justify-between items-center p-3.5 rounded-2xl border border-white/5 bg-white/5 hover:bg-white/[0.08] transition-all text-xs">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-bold text-white uppercase tracking-wider">TICKET #{ord._id.slice(-6).toUpperCase()}</span>
                    <span className="text-[10px] text-dark-muted">{ord.user?.name || 'Citizen'} • {ord.items?.length || 0} Items</span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className={`text-[9px] font-black uppercase tracking-widest py-0.5 px-2.5 rounded-full border ${
                      ord.orderStatus === 'Delivered' ? 'bg-veg/10 border-veg/30 text-veg shadow-glow-green' : 
                      ord.orderStatus === 'Out for Delivery' ? 'bg-orange-500/10 border-orange-500/30 text-orange-400 shadow-glow' : 'bg-primary/10 border-primary/30 text-primary shadow-glow'
                    }`}>
                      {ord.orderStatus}
                    </span>
                    <span className="font-black text-primary">₹{ord.totalAmount}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Real-Time Live Console Logs (Col span 5) */}
        <div className="lg:col-span-5 p-6 rounded-3xl bg-white/5 border border-white/5 shadow-glass flex flex-col gap-5">
          <h3 className="font-accent text-xs font-black tracking-widest text-primary uppercase">TELEMETRY MONITOR CONSOLE</h3>
          
          <div className="flex flex-col gap-2.5 p-4 bg-black/40 border border-white/5 rounded-2xl font-mono text-[9px] text-green-400 h-52 overflow-y-auto leading-relaxed shadow-inner">
            <div>[SYSTEM LOG] Decrypting database stream...</div>
            <div className="text-green-500/80">[WEBSOCKET] Socket.IO link successfully bound to port 5000.</div>
            <div className="text-green-500/80">[MOCK DB] JSON database loaded: {paidOrdersCount || 0} paid ledgers.</div>
            <div className="text-green-500/80">[PAYMENT] Razorpay API test suite active in simulation mode.</div>
            <div className="text-green-500/80">[MAILER] Nodemailer SMTP sandbox cleared & listening.</div>
            <div className="text-green-500/80">[SECURITY] Encrypted JWT authentication session active.</div>
            <div className="text-primary animate-pulse font-bold">[READY] Live monitoring server running correctly.</div>
          </div>
        </div>

      </div>
    </motion.div>
  );
}

// ==========================================
// VIEW 2: LIVE ORDERS ADMINISTRATION PANEL
// ==========================================
function OrdersView() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const { showToast } = useToast();

  const statusOptions = ['All', 'Order Received', 'Preparing', 'In Kitchen', 'Out for Delivery', 'Delivered'];

  const getStatusCount = (status) => {
    if (status === 'All') return orders.length;
    return orders.filter(o => o.orderStatus === status).length;
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/orders/admin/all');
      if (res.data.success) {
        setOrders(res.data.orders);
      }
    } catch (err) {
      console.error('[Orders View] Fetch error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStepStatus = async (orderId, currentStatus) => {
    const statusOrder = ['Order Received', 'Preparing', 'In Kitchen', 'Out for Delivery', 'Delivered'];
    const currentIndex = statusOrder.indexOf(currentStatus);
    
    if (currentIndex === statusOrder.length - 1) {
      showToast('Order is already fully delivered!', 'warning');
      return;
    }

    const nextStatus = statusOrder[currentIndex + 1];

    try {
      const res = await axios.put(`/orders/${orderId}/status`, { orderStatus: nextStatus });
      if (res.data.success) {
        showToast(`Order status stepped to: ${nextStatus} 🍕⚡`, 'success');
        // Refresh local items
        setOrders(orders.map(ord => ord._id === orderId ? { ...ord, orderStatus: nextStatus } : ord));
      }
    } catch (error) {
      showToast('Failed to update status', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-primary gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
        <p className="text-xs font-accent tracking-widest text-primary animate-pulse">Decrypting system live orders queue...</p>
      </div>
    );
  }

  const filteredOrders = statusFilter === 'All' 
    ? orders 
    : orders.filter(o => o.orderStatus === statusFilter);

  const statusOrder = ['Order Received', 'Preparing', 'In Kitchen', 'Out for Delivery', 'Delivered'];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }} 
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="flex flex-col gap-10"
    >
      {/* View Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="font-accent text-3xl font-black uppercase tracking-wider text-white">LIVE ORDERS COMMAND</h1>
          <p className="text-xs text-dark-muted mt-1">Manage active orders, change preparation tracking stages, and trigger sockets.</p>
        </div>
        <button
          onClick={fetchOrders}
          className="px-4 py-2 border border-white/5 hover:border-primary/20 text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-white/5 transition-all text-white"
        >
          REFRESH RADAR
        </button>
      </div>

      {/* Sliding Status tab filter bar */}
      <div className="flex flex-wrap gap-2.5 mb-2 bg-white/5 p-2 rounded-2xl border border-white/5 w-fit">
        {statusOptions.map((opt) => (
          <button
            key={opt}
            onClick={() => setStatusFilter(opt)}
            className={`px-4 py-2.5 rounded-xl text-[10px] font-accent font-black tracking-wider uppercase transition-all flex items-center gap-2 ${
              statusFilter === opt
                ? 'bg-primary/20 border border-primary/30 text-primary shadow-glow'
                : 'text-dark-muted hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            <span>{opt}</span>
            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
              statusFilter === opt ? 'bg-primary text-white shadow-glow' : 'bg-white/5 text-dark-muted'
            }`}>
              {getStatusCount(opt)}
            </span>
          </button>
        ))}
      </div>

      {filteredOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-80 border border-dashed border-white/5 rounded-3xl text-dark-muted gap-2 text-center p-6">
          <span>📦</span>
          <p className="font-bold text-xs uppercase tracking-wider">No matching active orders found!</p>
          <p className="text-[10px] max-w-xs mt-0.5">As customer checkouts match this stage, live tracking tickets will dynamically list here.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {filteredOrders.map((ord) => {
            const currentStep = statusOrder.indexOf(ord.orderStatus);

            return (
              <div 
                key={ord._id}
                className="p-6 rounded-[28px] bg-white/5 border border-white/5 shadow-glass flex flex-col gap-5 hover:border-primary/20 transition-all group"
              >
                {/* Order Card header */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/5 pb-4">
                  <div className="flex flex-col">
                    <span className="font-accent text-xs font-black text-white tracking-widest uppercase">TICKET ID: #{ord._id.slice(-6).toUpperCase()}</span>
                    <span className="text-[10px] text-dark-muted mt-0.5">User: {ord.user?.name} ({ord.user?.email})</span>
                    <span className="text-[9px] text-dark-muted mt-0.5">Ship To: {ord.deliveryAddress.street}, {ord.deliveryAddress.city}</span>
                  </div>

                  <div className="flex gap-2.5">
                    <span className={`text-[10px] font-black uppercase tracking-widest py-1 px-3.5 rounded-full border ${
                      ord.orderStatus === 'Delivered' ? 'bg-veg/10 border-veg/30 text-veg shadow-glow-green' : 
                      ord.orderStatus === 'Out for Delivery' ? 'bg-orange-500/10 border-orange-500/30 text-orange-400 shadow-glow' : 'bg-primary/10 border-primary/30 text-primary shadow-glow'
                    }`}>
                      {ord.orderStatus}
                    </span>
                    
                    <span className={`text-[10px] font-black uppercase tracking-widest py-1 px-3.5 rounded-full border ${
                      ord.paymentStatus === 'Paid' ? 'bg-veg/10 border-veg/20 text-veg' : 'bg-nonveg/10 border-nonveg/20 text-nonveg'
                    }`}>
                      {ord.paymentStatus === 'Paid' ? '💰 PAID' : '❌ UNPAID'}
                    </span>
                  </div>
                </div>

                {/* Sleek, interactive visual progress bar */}
                <div className="flex items-center justify-between gap-2 mt-2 px-2 relative mb-2">
                  {/* Connecting Line */}
                  <div className="absolute left-4 right-4 top-[15px] h-[3px] bg-white/5 -z-10 rounded" />
                  <div 
                    style={{ width: `${(currentStep / (statusOrder.length - 1)) * 100}%` }}
                    className="absolute left-4 top-[15px] h-[3px] bg-gradient-to-r from-primary to-orange-400 -z-10 rounded transition-all duration-500 shadow-glow" 
                  />

                  {statusOrder.map((stepName, stepIdx) => {
                    const isCompleted = stepIdx < currentStep;
                    const isActive = stepIdx === currentStep;

                    return (
                      <div key={stepIdx} className="flex flex-col items-center gap-1.5 flex-grow">
                        {/* Step Node */}
                        <div 
                          className={`h-8 w-8 rounded-full border flex items-center justify-center font-bold text-xs transition-all duration-300 ${
                            isCompleted ? 'bg-primary border-primary text-white shadow-glow' :
                            isActive ? 'bg-dark-bg border-primary text-primary shadow-glow animate-pulse ring-4 ring-primary/10' :
                            'bg-dark-bg border-white/10 text-dark-muted'
                          }`}
                        >
                          {isCompleted ? '✓' : stepIdx + 1}
                        </div>
                        
                        {/* Step Label */}
                        <span className={`text-[8px] font-accent font-black tracking-wider uppercase text-center hidden sm:block ${
                          isActive ? 'text-primary' : isCompleted ? 'text-white' : 'text-dark-muted'
                        }`}>
                          {stepName}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Items checklist */}
                <div className="flex flex-col gap-3.5 border-t border-white/5 pt-4 mt-1">
                  {ord.items.map((item, idx) => {
                    const title = item.isCustom
                      ? `Custom Craft (Crust: ${item.customPizzaDetails?.base}, Sauce: ${item.customPizzaDetails?.sauce})`
                      : item.pizza?.name || 'Curated Signature Recipe';
                    
                    return (
                      <div key={idx} className="flex justify-between items-center text-xs">
                        <div className="max-w-[75%]">
                          <span className="font-bold text-white group-hover:text-primary transition-colors leading-snug">{title}</span>
                          <span className="text-[10px] text-dark-muted block mt-0.5 leading-none">Size: {item.size} x{item.quantity}</span>
                          {item.isCustom && item.customPizzaDetails && (
                            <div className="text-[9px] text-dark-muted leading-relaxed flex flex-wrap gap-1 mt-1 max-w-xl">
                              <span className="bg-white/5 px-1 py-0.5 rounded">Cheeses: {item.customPizzaDetails.cheeses.join(', ') || 'None'}</span>
                              <span className="bg-white/5 px-1 py-0.5 rounded">Veggies: {item.customPizzaDetails.veggies.join(', ') || 'None'}</span>
                              <span className="bg-white/5 px-1 py-0.5 rounded">Meats: {item.customPizzaDetails.meats.join(', ') || 'None'}</span>
                            </div>
                          )}
                        </div>
                        <span className="font-bold text-white">₹{item.price * item.quantity}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Action controller footer */}
                <div className="border-t border-white/5 pt-4 mt-1 flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div className="flex items-baseline gap-1.5 self-start sm:self-center">
                    <span className="text-xs text-dark-muted font-bold uppercase tracking-wider">Order Value</span>
                    <span className="text-xl font-black text-primary glow-text">₹{ord.totalAmount}</span>
                  </div>

                  {/* Step trigger */}
                  {ord.orderStatus !== 'Delivered' ? (
                    <button
                      onClick={() => handleStepStatus(ord._id, ord.orderStatus)}
                      className="w-full sm:w-auto h-11 px-5 bg-primary hover:bg-primary-dark text-white text-xs font-accent font-black tracking-widest rounded-xl shadow-glow hover:scale-102 transition-all flex items-center justify-center gap-1.5"
                    >
                      STEP TO NEXT STAGE <ArrowRight size={14} />
                    </button>
                  ) : (
                    <div className="flex items-center gap-1 text-xs text-veg font-bold uppercase tracking-wider bg-veg/10 border border-veg/20 py-2 px-4 rounded-xl shadow-glow-green">
                      ✓ ORDER COMPLETED & DELIVERED
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}

// ==========================================
// VIEW 3: INVENTORY STOCK CONTROL PANEL
// ==========================================
function InventoryView() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  // Edit stock modal states
  const [editingItem, setEditingItem] = useState(null);
  const [stockVolumeInput, setStockVolumeInput] = useState('');
  const [priceInput, setPriceInput] = useState('');

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/inventory');
      if (res.data.success) {
        setInventory(res.data.inventory);
      }
    } catch (err) {
      console.error('[Inventory View] Fetch error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleOpenRestock = (item) => {
    setEditingItem(item);
    setStockVolumeInput(item.quantity.toString());
    setPriceInput(item.price.toString());
  };

  const handleSaveStock = async (e) => {
    e.preventDefault();
    if (!editingItem) return;

    try {
      const res = await axios.put(`/inventory/${editingItem._id}`, {
        quantity: Number(stockVolumeInput),
        price: Number(priceInput)
      });

      if (res.data.success) {
        showToast(`${editingItem.itemName} updated successfully!`, 'success');
        setInventory(inventory.map(item => item._id === editingItem._id ? res.data.item : item));
        setEditingItem(null);
      }
    } catch (err) {
      showToast('Failed to restock ingredient details', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-primary gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
        <p className="text-xs font-accent tracking-widest text-primary animate-pulse">Decrypting topping stocks registry...</p>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }} 
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="flex flex-col gap-10 relative"
    >
      {/* Header */}
      <div>
        <h1 className="font-accent text-3xl font-black uppercase tracking-wider text-white">INVENTORY CONTROL</h1>
        <p className="text-xs text-dark-muted mt-1">Manage custom builder topping crusts, sauces, cheeses, veggies, meats, and price multipliers.</p>
      </div>

      {/* Inventory table listing */}
      <div className="rounded-3xl bg-white/5 border border-white/5 shadow-glass overflow-hidden">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5 text-dark-muted uppercase font-bold tracking-wider bg-black/30">
              <th className="p-4 pl-6">Ingredient</th>
              <th className="p-4">Type</th>
              <th className="p-4">Stock Volume</th>
              <th className="p-4">Alert Threshold</th>
              <th className="p-4">Builder Price</th>
              <th className="p-4 text-right pr-6">Action</th>
            </tr>
          </thead>
          <tbody>
            {inventory.map((item) => {
              const isLow = item.quantity < item.threshold;
              return (
                <tr key={item._id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td className="p-4 pl-6 font-bold text-white flex items-center gap-2">
                    {item.itemName}
                    {isLow && (
                      <span className="flex items-center text-[8px] bg-red-500/10 border border-red-500/30 text-red-400 py-0.5 px-2 rounded-full shadow-glow-red animate-pulse">
                        ⚠️ LOW STOCK
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-dark-muted uppercase tracking-wider font-bold text-[10px]">{item.itemType}</td>
                  <td className={`p-4 font-bold ${isLow ? 'text-red-500' : 'text-white'}`}>{item.quantity} Units</td>
                  <td className="p-4 text-dark-muted">{item.threshold} Units</td>
                  <td className="p-4 font-bold text-primary">₹{item.price}</td>
                  <td className="p-4 text-right pr-6">
                    <button
                      onClick={() => handleOpenRestock(item)}
                      className="px-3.5 py-1.5 bg-white/5 border border-white/10 hover:border-primary text-primary hover:text-white rounded-lg font-bold transition-all"
                    >
                      EDIT / RESTOCK
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* EDIT MODAL CONTROLLER POPUP */}
      <AnimatePresence>
        {editingItem && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingItem(null)}
              className="fixed inset-0 bg-black z-50 pointer-events-auto"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed inset-x-4 top-[20%] max-w-sm mx-auto rounded-[36px] glass-panel border border-primary/20 p-6 md:p-8 shadow-[0_0_50px_rgba(255,107,8,0.25)] z-50 flex flex-col gap-6 pointer-events-auto text-dark-text"
            >
              <div className="text-center flex flex-col gap-1.5">
                <span className="text-4xl animate-bounce">📦</span>
                <h3 className="font-accent text-sm font-bold tracking-widest text-primary glow-text uppercase">RESTOCK DETAILS</h3>
                <p className="text-[10px] text-dark-muted uppercase font-bold">{editingItem.itemName} ({editingItem.itemType})</p>
              </div>

              <form onSubmit={handleSaveStock} className="flex flex-col gap-4 text-left">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-dark-text tracking-wide uppercase">Deduct/Replenish Stock Units</label>
                  <input
                    type="number"
                    value={stockVolumeInput}
                    onChange={(e) => setStockVolumeInput(e.target.value)}
                    className="w-full h-11 px-4 bg-white/5 border border-white/5 rounded-xl focus:outline-none focus:border-primary text-sm text-white"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-dark-text tracking-wide uppercase">Builder Extra Cost (₹)</label>
                  <input
                    type="number"
                    value={priceInput}
                    onChange={(e) => setPriceInput(e.target.value)}
                    className="w-full h-11 px-4 bg-white/5 border border-white/5 rounded-xl focus:outline-none focus:border-primary text-sm text-white"
                  />
                </div>

                <div className="flex gap-3 mt-2">
                  <button
                    type="button"
                    onClick={() => setEditingItem(null)}
                    className="flex-grow py-3 border border-white/5 text-dark-muted hover:text-white rounded-xl text-xs font-bold transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-grow py-3 bg-primary text-white rounded-xl text-xs font-bold shadow-glow hover:bg-primary-dark transition-all"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ==========================================
// VIEW 4: MENU CURATED PIZZAS CRUD VIEW
// ==========================================
function MenuView() {
  const [pizzas, setPizzas] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const [isAdding, setIsAdding] = useState(false);
  const [pizzaForm, setPizzaForm] = useState({
    name: '',
    description: '',
    category: 'veg',
    basePrice: '',
    ingredients: '',
    image: ''
  });

  const fetchPizzas = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/pizzas');
      if (res.data.success) {
        setPizzas(res.data.pizzas);
      }
    } catch (err) {
      console.error('[Menu CRUD] Fetch error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPizzas();
  }, []);

  const handleDeletePizza = async (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm('Wipe out this signature pizza from menu directory?')) return;

    try {
      const res = await axios.delete(`/pizzas/${id}`);
      if (res.data.success) {
        showToast('Pizza deleted successfully!', 'success');
        setPizzas(pizzas.filter(p => p._id !== id));
      }
    } catch (err) {
      showToast('Error deleting item', 'error');
    }
  };

  const handleCreatePizzaSubmit = async (e) => {
    e.preventDefault();
    const { name, description, category, basePrice, ingredients } = pizzaForm;

    if (!name || !description || !basePrice || !ingredients) {
      showToast('Please fill in all details', 'error');
      return;
    }

    try {
      const res = await axios.post('/pizzas', pizzaForm);
      if (res.data.success) {
        showToast('New curated pizza seeded to database!', 'success');
        setPizzas([...pizzas, res.data.pizza]);
        setIsAdding(false);
        setPizzaForm({ name: '', description: '', category: 'veg', basePrice: '', ingredients: '', image: '' });
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to create pizza', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-primary gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
        <p className="text-xs font-accent tracking-widest text-primary animate-pulse">Decrypting menu catalog directory...</p>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }} 
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="flex flex-col gap-10 relative"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="font-accent text-3xl font-black uppercase tracking-wider text-white">MENU MANAGEMENT</h1>
          <p className="text-xs text-dark-muted mt-1">Configure signature menu items, upload illustrations, set categories, and CRUD recipes.</p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="px-6 h-12 bg-primary hover:bg-primary-dark text-white font-accent font-black tracking-widest text-xs rounded-2xl shadow-glow hover:scale-103 transition-all flex items-center justify-center gap-1.5"
        >
          <Plus size={16} /> ADD NEW PIZZA
        </button>
      </div>

      {/* Pizzas grid CRUD */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {pizzas.map((pizza) => (
          <div key={pizza._id} className="rounded-3xl overflow-hidden bg-white/5 border border-white/5 shadow-glass flex flex-col group relative">
            <div className="h-44 bg-white/5 overflow-hidden border-b border-white/5">
              <img src={pizza.image} alt={pizza.name} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
            </div>
            
            <div className="p-5 flex flex-col gap-3 flex-grow">
              <div className="flex justify-between items-start">
                <h4 className="font-accent font-bold text-sm text-white group-hover:text-primary transition-colors leading-snug">{pizza.name}</h4>
                <span className={`text-[8px] font-black uppercase py-0.5 px-2 rounded-full border ${
                  pizza.category === 'veg' ? 'bg-veg/10 border-veg/20 text-veg' : 'bg-nonveg/10 border-nonveg/20 text-nonveg'
                }`}>
                  {pizza.category}
                </span>
              </div>
              <p className="text-[10px] text-dark-muted leading-relaxed line-clamp-2">{pizza.description}</p>
              
              <div className="border-t border-white/5 pt-3 mt-auto flex items-center justify-between">
                <span className="text-base font-black text-primary">₹{pizza.basePrice}</span>
                <button
                  onClick={(e) => handleDeletePizza(pizza._id, e)}
                  className="p-2 rounded-lg bg-black/40 hover:bg-nonveg/10 border border-white/5 hover:border-nonveg/30 text-dark-muted hover:text-nonveg transition-all"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CREATE MODAL CONTROLLER POPUP */}
      <AnimatePresence>
        {isAdding && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAdding(false)}
              className="fixed inset-0 bg-black z-50 pointer-events-auto"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed inset-x-4 top-[10%] bottom-[10%] max-w-xl mx-auto rounded-[36px] glass-panel border border-primary/20 p-6 md:p-8 shadow-[0_0_50px_rgba(255,107,8,0.25)] z-50 flex flex-col gap-6 pointer-events-auto text-dark-text overflow-y-auto"
            >
              <div className="text-center flex flex-col gap-1 items-center">
                <span className="text-4xl animate-bounce">🍕</span>
                <h3 className="font-accent text-sm font-bold tracking-widest text-primary glow-text uppercase">ADD CURATED PIZZA</h3>
                <p className="text-[10px] text-dark-muted">Seed a new high-quality signature creation to the online customer menu.</p>
              </div>

              <form onSubmit={handleCreatePizzaSubmit} className="flex flex-col gap-4 text-left text-xs">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="font-bold text-dark-text tracking-wide uppercase">Pizza Name</label>
                    <input
                      type="text"
                      placeholder="Futuristic Margherita"
                      value={pizzaForm.name}
                      onChange={(e) => setPizzaForm({ ...pizzaForm, name: e.target.value })}
                      className="h-10 bg-white/5 border border-white/5 rounded-xl px-3 focus:outline-none focus:border-primary text-white"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="font-bold text-dark-text tracking-wide uppercase">Category Type</label>
                    <select
                      value={pizzaForm.category}
                      onChange={(e) => setPizzaForm({ ...pizzaForm, category: e.target.value })}
                      className="h-10 bg-white/5 border border-white/5 rounded-xl px-3 focus:outline-none focus:border-primary text-white font-bold"
                    >
                      <option value="veg" className="bg-dark-card">🥦 VEGETARIAN</option>
                      <option value="non-veg" className="bg-dark-card">🥩 NON-VEGETARIAN</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-dark-text tracking-wide uppercase">Description Logs</label>
                  <textarea
                    rows={2}
                    placeholder="Classic Italian recipe with organic tomatoes, double cheddar cheese grids, and peri peri toppings..."
                    value={pizzaForm.description}
                    onChange={(e) => setPizzaForm({ ...pizzaForm, description: e.target.value })}
                    className="p-3 bg-white/5 border border-white/5 rounded-xl focus:outline-none focus:border-primary text-white resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="font-bold text-dark-text tracking-wide uppercase">Base Price (₹)</label>
                    <input
                      type="number"
                      placeholder="299"
                      value={pizzaForm.basePrice}
                      onChange={(e) => setPizzaForm({ ...pizzaForm, basePrice: e.target.value })}
                      className="h-10 bg-white/5 border border-white/5 rounded-xl px-3 focus:outline-none focus:border-primary text-white"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="font-bold text-dark-text tracking-wide uppercase">Main Ingredients (comma separated)</label>
                    <input
                      type="text"
                      placeholder="Mozzarella, Mushrooms, Olives"
                      value={pizzaForm.ingredients}
                      onChange={(e) => setPizzaForm({ ...pizzaForm, ingredients: e.target.value })}
                      className="h-10 bg-white/5 border border-white/5 rounded-xl px-3 focus:outline-none focus:border-primary text-white"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-dark-text tracking-wide uppercase">Image Illustration URL</label>
                  <input
                    type="text"
                    placeholder="https://images.unsplash.com/photo-1513104890138-7c749659a591"
                    value={pizzaForm.image}
                    onChange={(e) => setPizzaForm({ ...pizzaForm, image: e.target.value })}
                    className="h-10 bg-white/5 border border-white/5 rounded-xl px-3 focus:outline-none focus:border-primary text-white"
                  />
                </div>

                <div className="flex gap-3 mt-4">
                  <button
                    type="button"
                    onClick={() => setIsAdding(false)}
                    className="flex-grow py-3 border border-white/5 text-dark-muted hover:text-white rounded-xl font-bold transition-all text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-grow py-3 bg-primary text-white rounded-xl font-bold shadow-glow hover:bg-primary-dark transition-all text-xs"
                  >
                    Publish Curated Pizza ⚡
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
