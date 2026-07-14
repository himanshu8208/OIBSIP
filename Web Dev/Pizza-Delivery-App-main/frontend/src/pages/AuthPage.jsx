import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import { useToast } from '../App';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Eye, EyeOff, ShieldCheck } from 'lucide-react';

export default function AuthPage() {
  const { login, register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    const { name, email, password, confirmPassword } = formData;

    if (!email || !password) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    setLoading(true);

    if (isLogin) {
      // 1. LOGIN WORKFLOW
      const res = await login(email, password);
      if (res.success) {
        showToast(res.message, 'success');
        navigate('/menu');
      } else {
        showToast(res.message, 'error');
      }
    } else {
      // 2. SIGNUP WORKFLOW
      if (!name) {
        showToast('Please provide your name', 'error');
        setLoading(false);
        return;
      }
      if (password.length < 6) {
        showToast('Password must be at least 6 characters long', 'error');
        setLoading(false);
        return;
      }
      if (password !== confirmPassword) {
        showToast('Passwords do not match', 'error');
        setLoading(false);
        return;
      }

      const res = await register(name, email, password);
      if (res.success) {
        showToast(res.message, 'success');
        setIsLogin(true); // Switch to login screen
        setFormData({ name: '', email: '', password: '', confirmPassword: '' });
      } else {
        showToast(res.message, 'error');
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 relative">
      {/* Background glowing particles */}
      <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-primary/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 rounded-full bg-orange-500/5 blur-[120px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md rounded-[32px] glass-panel border border-white/5 p-8 md:p-10 shadow-glass relative overflow-hidden"
      >
        <div className="text-center flex flex-col items-center gap-2 mb-8">
          <span className="text-4xl animate-bounce">🍕</span>
          <h2 className="font-accent text-2xl font-black tracking-widest text-primary glow-text uppercase">
            {isLogin ? 'WELCOME CITIZEN' : 'CREATE CITIZEN'}
          </h2>
          <p className="text-xs text-dark-muted">
            {isLogin ? 'Enter your credentials to enter the PizzaVerse.' : 'Register a new account to unlock full custom crafting.'}
          </p>
        </div>

        <form onSubmit={handleAuthSubmit} className="flex flex-col gap-5">
          {/* User Name (Register only) */}
          {!isLogin && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-dark-text tracking-wide uppercase">Your Name</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-dark-muted"><User size={16} /></span>
                <input 
                  type="text" 
                  name="name"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full h-12 pl-11 pr-4 bg-white/5 border border-white/5 rounded-2xl text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-dark-muted" 
                />
              </div>
            </div>
          )}

          {/* Email input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-dark-text tracking-wide uppercase">Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-dark-muted"><Mail size={16} /></span>
              <input 
                type="email" 
                name="email"
                placeholder="john@example.com"
                value={formData.email}
                onChange={handleChange}
                className="w-full h-12 pl-11 pr-4 bg-white/5 border border-white/5 rounded-2xl text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-dark-muted" 
              />
            </div>
          </div>

          {/* Password input */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-baseline">
              <label className="text-xs font-bold text-dark-text tracking-wide uppercase">Password</label>
              {isLogin && (
                <Link to="/forgot-password" className="text-[10px] font-bold text-primary hover:underline uppercase">Forgot Password?</Link>
              )}
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-dark-muted"><Lock size={16} /></span>
              <input 
                type={showPassword ? 'text' : 'password'} 
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                className="w-full h-12 pl-11 pr-11 bg-white/5 border border-white/5 rounded-2xl text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-dark-muted" 
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-dark-muted hover:text-white"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Confirm Password (Register only) */}
          {!isLogin && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-dark-text tracking-wide uppercase">Confirm Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-dark-muted"><Lock size={16} /></span>
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  name="confirmPassword"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full h-12 pl-11 pr-4 bg-white/5 border border-white/5 rounded-2xl text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-dark-muted" 
                />
              </div>
            </div>
          )}

          {/* Submit Action Button */}
          <button 
            type="submit"
            disabled={loading}
            className="w-full h-12 mt-2 bg-primary hover:bg-primary-dark text-white font-accent font-black tracking-widest text-xs rounded-2xl shadow-glow hover:shadow-glow transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
            ) : (
              isLogin ? 'ENTER THE PIZZAVERSE ⚡' : 'REGISTER PROFILE 🎉'
            )}
          </button>
        </form>

        {/* Screen switcher */}
        <div className="text-center mt-6 text-xs text-dark-muted">
          {isLogin ? (
            <p>
              New citizen here?{' '}
              <button 
                onClick={() => { setIsLogin(false); setFormData({ name:'', email:'', password:'', confirmPassword:'' }); }} 
                className="font-bold text-primary hover:underline uppercase"
              >
                Register Account
              </button>
            </p>
          ) : (
            <p>
              Already registered?{' '}
              <button 
                onClick={() => { setIsLogin(true); setFormData({ name:'', email:'', password:'', confirmPassword:'' }); }} 
                className="font-bold text-primary hover:underline uppercase"
              >
                Log In Here
              </button>
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
