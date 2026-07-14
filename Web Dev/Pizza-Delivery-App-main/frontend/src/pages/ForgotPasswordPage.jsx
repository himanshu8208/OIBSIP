import React, { useState } from 'react';
import { useAuth } from '../store/AuthContext';
import { useToast } from '../App';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

export default function ForgotPasswordPage() {
  const { forgotPassword } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      showToast('Please enter your registered email address', 'error');
      return;
    }

    setLoading(true);
    const res = await forgotPassword(email);
    if (res.success) {
      showToast('Reset password link sent to email!', 'success');
      setSubmitted(true);
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
        <Link to="/auth" className="inline-flex items-center gap-1 text-[10px] font-black text-dark-muted hover:text-primary uppercase tracking-widest mb-6">
          <ArrowLeft size={12} /> Return to login
        </Link>

        {submitted ? (
          <div className="text-center flex flex-col items-center gap-5">
            <div className="h-16 w-16 rounded-full bg-primary/10 border border-primary/30 text-primary flex items-center justify-center text-3xl shadow-glow animate-pulse">
              ⚡
            </div>
            <h2 className="font-accent text-xl font-black tracking-widest text-primary glow-text uppercase">Link Dispatched</h2>
            <p className="text-xs text-dark-muted leading-relaxed">
              We have dispatched a password reset link to <strong className="text-white">{email}</strong>. Please check your inbox (or spam) to continue.
            </p>
            <button 
              onClick={() => navigate('/auth')}
              className="w-full h-12 mt-2 bg-primary hover:bg-primary-dark text-white font-accent font-black tracking-widest text-xs rounded-2xl shadow-glow hover:shadow-glow transition-all duration-300"
            >
              LOG IN NOW
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            <div className="text-center flex flex-col items-center gap-2 mb-2">
              <span className="text-4xl animate-bounce">🔑</span>
              <h2 className="font-accent text-xl font-black tracking-widest text-primary glow-text uppercase">Recover Password</h2>
              <p className="text-xs text-dark-muted">Enter your registered email address and we will mail you a reset token link.</p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-dark-text tracking-wide uppercase">Email Address</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-dark-muted"><Mail size={16} /></span>
                  <input 
                    type="email" 
                    placeholder="john@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-12 pl-11 pr-4 bg-white/5 border border-white/5 rounded-2xl text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-dark-muted" 
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full h-12 mt-2 bg-primary hover:bg-primary-dark text-white font-accent font-black tracking-widest text-xs rounded-2xl shadow-glow hover:shadow-glow transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? 'SENDING RESET LINK...' : 'DISPATCH RESET LINK ⚡'}
              </button>
            </form>
          </div>
        )}
      </motion.div>
    </div>
  );
}
