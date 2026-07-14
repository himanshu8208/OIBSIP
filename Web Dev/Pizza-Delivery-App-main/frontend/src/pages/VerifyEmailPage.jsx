import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import { motion } from 'framer-motion';

export default function VerifyEmailPage() {
  const { verifyEmail } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('');

  useEffect(() => {
    const triggerVerify = async () => {
      const token = searchParams.get('token');
      if (!token) {
        setStatus('error');
        setMessage('Missing email verification token.');
        return;
      }

      try {
        const response = await verifyEmail(token);
        if (response.success) {
          setStatus('success');
          setMessage(response.message);
        } else {
          setStatus('error');
          setMessage(response.message);
        }
      } catch (error) {
        setStatus('error');
        setMessage('An unexpected error occurred during email verification.');
      }
    };
    triggerVerify();
  }, [searchParams]);

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 relative">
      <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-primary/10 blur-[100px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md rounded-[32px] glass-panel border border-white/5 p-8 md:p-10 shadow-glass text-center relative overflow-hidden"
      >
        {status === 'verifying' && (
          <div className="flex flex-col items-center gap-6">
            <div className="relative flex items-center justify-center">
              <div className="absolute animate-ping h-16 w-16 rounded-full border border-primary/30 opacity-75"></div>
              <span className="text-5xl animate-bounce">🍕</span>
            </div>
            <h2 className="font-accent text-xl font-black tracking-widest text-primary glow-text uppercase">Verifying Email...</h2>
            <p className="text-xs text-dark-muted">Synchronizing verification tokens in the PizzaVerse blockchain.</p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center gap-5">
            <div className="h-16 w-16 rounded-full bg-veg/10 border border-veg/30 text-veg flex items-center justify-center text-4xl shadow-glow-green animate-pulse">
              ✓
            </div>
            <h2 className="font-accent text-xl font-black tracking-widest text-veg glow-text uppercase">Verification Successful!</h2>
            <p className="text-xs text-dark-muted leading-relaxed">
              Your citizen profile email is verified. Welcome to the Verse! You can now log in to place orders.
            </p>
            <button 
              onClick={() => navigate('/auth')}
              className="w-full h-12 mt-2 bg-primary hover:bg-primary-dark text-white font-accent font-black tracking-widest text-xs rounded-2xl shadow-glow hover:shadow-glow transition-all duration-300"
            >
              LOG IN NOW ⚡
            </button>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center gap-5">
            <div className="h-16 w-16 rounded-full bg-nonveg/10 border border-nonveg/30 text-nonveg flex items-center justify-center text-3xl shadow-glow-red">
              ✕
            </div>
            <h2 className="font-accent text-xl font-black tracking-widest text-nonveg glow-text uppercase">Verification Failed</h2>
            <p className="text-xs text-dark-muted leading-relaxed">
              {message || 'The verification link is invalid, expired, or has already been used.'}
            </p>
            <button 
              onClick={() => navigate('/auth')}
              className="w-full h-12 mt-2 border border-white/10 hover:border-primary/50 text-white hover:text-primary bg-white/5 hover:bg-primary/5 font-accent font-black tracking-widest text-xs rounded-2xl transition-all duration-300"
            >
              RETURN TO SIGN IN
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
