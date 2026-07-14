import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import { useCart } from '../store/CartContext';
import { useToast } from '../App';
import { ShoppingBag, User as UserIcon, LogOut, Menu, X, Trash2, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { 
    cart, itemsCount, subtotal, discountAmount, totalAmount, 
    updateQuantity, removeFromCart, couponCode, applyCoupon, removeCoupon,
    deliveryCharges, gstCharges
  } = useCart();
  const { showToast } = useToast();
  
  const navigate = useNavigate();
  const location = useLocation();

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [couponInput, setCouponInput] = useState('');

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (!couponInput) return;
    const res = applyCoupon(couponInput);
    if (res.success) {
      showToast(res.message, 'success');
      setCouponInput('');
    } else {
      showToast(res.message, 'error');
    }
  };

  const handleLogout = () => {
    logout();
    setIsProfileDropdownOpen(false);
    showToast('Logged out successfully', 'info');
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-40 h-20 glass-panel border-b border-white/5 flex items-center justify-between px-6 md:px-12">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <span className="text-3xl transition-transform group-hover:rotate-12 duration-300">🍕</span>
          <span className="font-accent text-2xl font-black tracking-widest text-primary glow-text uppercase">
            Pizza<span className="text-white">Verse</span>
          </span>
        </Link>

        {/* Desktop Nav Items */}
        <div className="hidden md:flex items-center gap-8">
          <Link 
            to="/menu" 
            className={`font-semibold tracking-wide text-sm transition-colors hover:text-primary ${isActive('/menu') ? 'text-primary' : 'text-dark-text'}`}
          >
            MENU
          </Link>
          <Link 
            to="/builder" 
            className={`font-semibold tracking-wide text-sm transition-colors hover:text-primary ${isActive('/builder') ? 'text-primary' : 'text-dark-text'}`}
          >
            PIZZA BUILDER
          </Link>
          {user && (
            <Link 
              to="/orders" 
              className={`font-semibold tracking-wide text-sm transition-colors hover:text-primary ${isActive('/orders') ? 'text-primary' : 'text-dark-text'}`}
            >
              ORDER HISTORY
            </Link>
          )}
          {user && user.role === 'admin' && (
            <a 
              href="http://localhost:5174" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex items-center gap-1.5 font-semibold text-xs tracking-wider bg-red-500/10 border border-red-500/20 text-red-400 py-1.5 px-3 rounded-full hover:bg-red-500/20 transition-all shadow-glow-red"
            >
              <ShieldAlert size={14} /> ADMIN PANEL
            </a>
          )}
        </div>

        {/* Interaction Icons */}
        <div className="flex items-center gap-4">
          {/* Cart Trigger Button */}
          <button 
            onClick={() => setIsCartOpen(true)}
            className="relative p-2.5 rounded-full border border-white/5 hover:border-primary/30 bg-white/5 hover:bg-primary/10 text-dark-text hover:text-primary transition-all duration-300 shadow-glass"
          >
            <ShoppingBag size={20} />
            {itemsCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-primary text-white font-bold text-xs h-5 w-5 rounded-full flex items-center justify-center border border-dark-bg animate-pulse">
                {itemsCount}
              </span>
            )}
          </button>

          {/* User Profile / Access Button */}
          {user ? (
            <div className="relative">
              <button 
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="flex items-center gap-2 p-1.5 pr-3 rounded-full border border-white/5 hover:border-primary/20 bg-white/5 hover:bg-white/10 transition-all duration-300 shadow-glass"
              >
                {user.profileImage ? (
                  <img 
                    src={user.profileImage} 
                    alt={user.name} 
                    className="h-8 w-8 rounded-full object-cover border border-white/10" 
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-primary to-orange-400 flex items-center justify-center font-bold text-white text-sm">
                    {user.name[0].toUpperCase()}
                  </div>
                )}
                <span className="hidden sm:inline font-semibold text-sm max-w-[100px] truncate">{user.name.split(' ')[0]}</span>
              </button>

              <AnimatePresence>
                {isProfileDropdownOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 15, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-3 w-48 rounded-2xl glass-card border border-white/5 shadow-glass p-2 flex flex-col gap-1 z-50 text-sm"
                  >
                    <div className="px-3 py-2 border-b border-white/5 text-dark-muted text-xs">
                      Logged in as <br/>
                      <span className="font-bold text-dark-text truncate block">{user.email}</span>
                    </div>
                    <Link 
                      to="/orders" 
                      onClick={() => setIsProfileDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-white/5 text-dark-text transition-colors"
                    >
                      <UserIcon size={16} /> My Orders
                    </Link>
                    <button 
                      onClick={handleLogout}
                      className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-nonveg/10 text-nonveg transition-colors w-full text-left"
                    >
                      <LogOut size={16} /> Log Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link 
              to="/auth" 
              className="hidden sm:inline-flex items-center justify-center px-5 h-10 border border-primary/20 hover:border-primary text-sm font-semibold tracking-wide text-primary bg-primary/5 hover:bg-primary hover:text-white rounded-full transition-all duration-300 shadow-glass hover:shadow-glow"
            >
              SIGN IN
            </Link>
          )}

          {/* Mobile Menu Icon */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-full hover:bg-white/5 text-dark-text"
          >
            {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer Navigation Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-0 right-0 z-30 md:hidden glass-panel border-b border-white/5 p-6 flex flex-col gap-4 shadow-glass"
          >
            <Link 
              to="/menu" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="font-bold tracking-widest text-lg hover:text-primary"
            >
              🍕 PIZZA MENU
            </Link>
            <Link 
              to="/builder" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="font-bold tracking-widest text-lg hover:text-primary"
            >
              🧑‍🍳 PIZZA BUILDER
            </Link>
            {user && (
              <Link 
                to="/orders" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="font-bold tracking-widest text-lg hover:text-primary"
              >
                📦 ORDER HISTORY
              </Link>
            )}
            {!user && (
              <Link 
                to="/auth" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-center font-bold tracking-widest text-lg py-3 rounded-xl border border-primary text-primary bg-primary/10 hover:bg-primary hover:text-white transition-all shadow-glow"
              >
                SIGN IN / REGISTER
              </Link>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Slide-out Cart Drawer Overlay */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            {/* Backdrop filter */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 bg-black z-50 pointer-events-auto"
            />
            
            {/* Drawer */}
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-dark-bg border-l border-white/5 shadow-glass z-50 flex flex-col pointer-events-auto"
            >
              {/* Drawer Header */}
              <div className="h-20 border-b border-white/5 flex items-center justify-between px-6">
                <div className="flex items-center gap-2.5">
                  <ShoppingBag className="text-primary" />
                  <h3 className="font-accent text-lg font-black tracking-wider text-primary">YOUR CART</h3>
                  <span className="text-xs bg-white/5 text-dark-muted px-2 py-0.5 rounded-full">{itemsCount} Items</span>
                </div>
                <button 
                  onClick={() => setIsCartOpen(false)}
                  className="p-1.5 rounded-full hover:bg-white/5 text-dark-muted hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Drawer Content Items */}
              <div className="flex-grow overflow-y-auto p-6 flex flex-col gap-4">
                {cart.items.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-80 text-center gap-4 text-dark-muted">
                    <span className="text-6xl animate-bounce">🛒</span>
                    <p className="font-bold text-sm">Your cart is empty!</p>
                    <p className="text-xs max-w-xs">Return to the menu or jump into our Pizza Builder to stack your glowing creation.</p>
                    <button 
                      onClick={() => { setIsCartOpen(false); navigate('/menu'); }}
                      className="mt-2 text-xs font-bold tracking-wider px-4 py-2 bg-primary/10 border border-primary/20 text-primary rounded-full hover:bg-primary hover:text-white transition-all shadow-glass"
                    >
                      GO TO MENU
                    </button>
                  </div>
                ) : (
                  cart.items.map((item) => (
                    <div 
                      key={item._id}
                      className="p-3.5 rounded-xl border border-white/5 bg-white/5 hover:bg-white/[0.08] transition-all flex gap-3 relative group shadow-glass"
                    >
                      {/* Image Preview */}
                      <div className="h-16 w-16 rounded-lg overflow-hidden flex-shrink-0 border border-white/5 bg-white/5">
                        <img 
                          src={item.isCustom ? 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=200' : item.pizza?.image} 
                          alt="Pizza" 
                          className="h-full w-full object-cover" 
                        />
                      </div>

                      {/* Line Item details */}
                      <div className="flex-grow flex flex-col gap-1 min-w-0 pr-8">
                        <h4 className="font-bold text-sm leading-tight truncate">
                          {item.isCustom ? 'Custom Craft Pizza' : item.pizza?.name}
                        </h4>
                        
                        <p className="text-xs text-primary font-bold">
                          {item.size} Size • ₹{item.price}
                        </p>

                        {/* Custom ingredients chips */}
                        {item.isCustom && item.customPizzaDetails && (
                          <div className="text-[10px] text-dark-muted flex flex-wrap gap-1 mt-1 leading-normal max-h-12 overflow-y-auto">
                            <span className="bg-white/5 px-1 py-0.5 rounded text-white font-medium border border-white/5">Base: {item.customPizzaDetails.base}</span>
                            <span className="bg-white/5 px-1 py-0.5 rounded text-white font-medium border border-white/5">Sauce: {item.customPizzaDetails.sauce}</span>
                            {item.customPizzaDetails.cheeses.map((c, i) => (
                              <span key={i} className="bg-orange-500/10 px-1 py-0.5 rounded text-primary border border-orange-500/10 font-bold">{c}</span>
                            ))}
                            {item.customPizzaDetails.veggies.map((v, i) => (
                              <span key={i} className="bg-green-500/10 px-1 py-0.5 rounded text-veg border border-green-500/10 font-medium">{v}</span>
                            ))}
                            {item.customPizzaDetails.meats.map((m, i) => (
                              <span key={i} className="bg-red-500/10 px-1 py-0.5 rounded text-nonveg border border-red-500/10 font-medium">{m}</span>
                            ))}
                          </div>
                        )}

                        {/* Increment / Decrement Counter */}
                        <div className="flex items-center gap-3 mt-2">
                          <div className="flex items-center rounded-full bg-black/40 border border-white/5 overflow-hidden">
                            <button 
                              onClick={() => updateQuantity(item._id, item.quantity - 1)}
                              className="px-2.5 py-1 text-dark-muted hover:text-white hover:bg-white/5 transition-all text-xs"
                            >
                              -
                            </button>
                            <span className="px-2 text-xs font-bold text-center min-w-[20px]">{item.quantity}</span>
                            <button 
                              onClick={() => updateQuantity(item._id, item.quantity + 1)}
                              className="px-2.5 py-1 text-dark-muted hover:text-white hover:bg-white/5 transition-all text-xs"
                            >
                              +
                            </button>
                          </div>
                          <span className="text-sm font-black text-white ml-auto">₹{item.price * item.quantity}</span>
                        </div>
                      </div>

                      {/* Remove Line Item */}
                      <button 
                        onClick={() => removeFromCart(item._id)}
                        className="absolute top-3.5 right-3.5 p-1 rounded-lg bg-black/20 hover:bg-nonveg/20 border border-white/5 hover:border-nonveg/30 text-dark-muted hover:text-nonveg transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Drawer Footer Calculations */}
              {cart.items.length > 0 && (
                <div className="border-t border-white/5 p-6 bg-black/35 flex flex-col gap-4">
                  {/* Coupon Entry Box */}
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="ENTER COUPON (e.g. PIZZAVERSE20)" 
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      className="flex-grow bg-white/5 border border-white/5 rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-wider focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-dark-muted placeholder:normal-case placeholder:font-normal"
                    />
                    <button 
                      type="submit"
                      className="px-4 py-2 bg-primary/20 hover:bg-primary border border-primary/30 hover:border-primary text-primary hover:text-white rounded-xl text-xs font-bold tracking-wider transition-all"
                    >
                      APPLY
                    </button>
                  </form>

                  {/* Active coupon banner */}
                  {couponCode && (
                    <div className="flex items-center justify-between bg-primary/10 border border-primary/20 text-primary text-xs font-bold py-1.5 px-3 rounded-lg">
                      <span>⚡ Coupon "{couponCode}" Active</span>
                      <button type="button" onClick={removeCoupon} className="hover:text-white">✕ Remove</button>
                    </div>
                  )}

                  {/* Financial calculations */}
                  <div className="flex flex-col gap-1.5 text-xs text-dark-muted border-b border-white/5 pb-3">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span className="font-bold text-dark-text">₹{subtotal}</span>
                    </div>
                    {discountAmount > 0 && (
                      <div className="flex justify-between text-primary">
                        <span>Coupon Discount</span>
                        <span className="font-bold">-₹{discountAmount}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Delivery Fee</span>
                      <span>{deliveryCharges === 0 ? <span className="text-veg font-bold uppercase">FREE</span> : `₹${deliveryCharges}`}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>GST (5%)</span>
                      <span>₹{gstCharges}</span>
                    </div>
                  </div>

                  {/* Total line item */}
                  <div className="flex justify-between items-baseline mb-2">
                    <span className="text-sm font-bold text-dark-text">Grand Total</span>
                    <span className="text-2xl font-black text-primary glow-text">₹{totalAmount}</span>
                  </div>

                  {/* Checkout CTA */}
                  <button 
                    onClick={() => { setIsCartOpen(false); navigate('/checkout'); }}
                    className="w-full py-4 bg-primary hover:bg-primary-dark text-white font-accent font-black tracking-widest text-sm rounded-2xl shadow-glow hover:shadow-glow transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    PROCEED TO CHECKOUT ⚡
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
