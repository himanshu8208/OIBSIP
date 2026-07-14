import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import { useToast } from '../App';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff } from 'lucide-react';

export default function ResetPasswordPage() {
  const { resetPassword } = useAuth();
  const { showToast } = useToast();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = searchParams.get('token');

    if (!token) {
      showToast('Missing password reset token.', 'error');
      return;
    }
    if (password.length < 6) {
      showToast('Password must be at least 6 characters long', 'error');
      return;
    }
    if (password !== confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }

    setLoading(true);
    const res = await resetPassword(token, password);
    if (res.success) {
      showToast(res.message, 'success');
      navigate('/auth');
    } else {
      showToast(res.message, 'error');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 relative">
      <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-primary/10 blur-[100px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md rounded-[32px] glass-panel border border-white/5 p-8 md:p-10 shadow-glass relative overflow-hidden"
      >
        <div className="text-center flex flex-col items-center gap-2 mb-8">
          <span className="text-4xl animate-bounce">🔒</span>
          <h2 className="font-accent text-xl font-black tracking-widest text-primary glow-text uppercase">Reset Password</h2>
          <p className="text-xs text-dark-muted">Please provide a new strong password below to secure your citizen account.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* New password */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-dark-text tracking-wide uppercase">New Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-dark-muted"><Lock size={16} /></span>
              <input 
                type={showPassword ? 'text' : 'password'} 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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

          {/* Confirm new password */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-dark-text tracking-wide uppercase">Confirm New Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-dark-muted"><Lock size={16} /></span>
              <input 
                type={showPassword ? 'text' : 'password'} 
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full h-12 pl-11 pr-4 bg-white/5 border border-white/5 rounded-2xl text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-dark-muted" 
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full h-12 mt-2 bg-primary hover:bg-primary-dark text-white font-accent font-black tracking-widest text-xs rounded-2xl shadow-glow hover:shadow-glow transition-all duration-300 flex items-center justify-center gap-2"
          >
            {loading ? 'SAVING DETAILS...' : 'SAVE NEW PASSWORD ⚡'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
