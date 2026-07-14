import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, Truck, Zap, Flame, Star } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();

  // Floating animations for floating decorations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 35 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
  };

  const testimonials = [
    { name: 'Aarav Mehta', role: 'Cyberpunk Designer', text: 'The custom pizza builder is a game-changer. Watching ingredients fall onto my neon pizza live was unreal, and the taste is out of this world!', rating: 5 },
    { name: 'Samantha Ross', role: 'UI Engineer', text: 'Stunning Zomato+Domino+Apple design indeed! Dark mode looks gorgeous, real-time tracking is ultra-precise, and the hand-tossed classic crust is 10/10.', rating: 5 },
    { name: 'Kunal Sharma', role: 'Full Stack Developer', text: 'Fastest delivery I have ever experienced. My neon blaze pepperoni arrived steaming hot! The email verification and checkout flow are super smooth.', rating: 5 }
  ];

  return (
    <div className="flex flex-col gap-24 pb-20 overflow-x-hidden">
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[85vh] flex items-center justify-between px-6 md:px-16 pt-8">
        {/* Background glowing gradients */}
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-primary/20 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 rounded-full bg-orange-500/10 blur-[130px] pointer-events-none" />

        <div className="max-w-2xl flex flex-col gap-6 z-10">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold tracking-widest uppercase w-fit"
          >
            <Flame size={12} className="animate-pulse" /> THE NEON FLAVOR REVOLUTION
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="text-4xl md:text-7xl font-accent font-black tracking-tight leading-tight uppercase"
          >
            CRAFT YOUR <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-400 glow-text">PIZZA VERSE</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-sm md:text-base text-dark-muted max-w-lg leading-relaxed"
          >
            Welcome to the future of pizza delivery. Stack premium cheese layers, dynamic sauces, and glowing veggies live in our 3D visual builder, or order our hyper-focused signature selections.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-wrap gap-4 mt-4"
          >
            <Link 
              to="/builder"
              className="px-8 py-4 bg-primary hover:bg-primary-dark text-white font-accent font-black tracking-widest text-xs rounded-2xl shadow-glow hover:shadow-glow transition-all duration-300"
            >
              BUILD YOUR VERSE ⚡
            </Link>
            <Link 
              to="/menu"
              className="px-8 py-4 border border-white/10 hover:border-primary/50 text-white hover:text-primary bg-white/5 hover:bg-primary/5 font-accent font-black tracking-widest text-xs rounded-2xl transition-all duration-300"
            >
              BROWSE SIGNATURES
            </Link>
          </motion.div>
        </div>

        {/* Hero Interactive Pizza Display */}
        <div className="hidden lg:flex relative w-1/2 h-[600px] items-center justify-center pointer-events-none select-none z-10">
          {/* Main Pizza */}
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 35, repeat: Infinity, ease: 'linear' }}
            className="w-[420px] h-[420px] rounded-full overflow-hidden shadow-[0_0_80px_rgba(255,107,8,0.25)] border-4 border-primary/20 relative"
          >
            <img 
              src="https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600" 
              alt="Futuristic Pizza" 
              className="w-full h-full object-cover scale-105" 
            />
          </motion.div>

          {/* Floating dynamic ingredients around the pizza */}
          <motion.div className="absolute top-16 right-20 text-6xl animate-float-slow">🧅</motion.div>
          <motion.div className="absolute bottom-20 left-16 text-6xl animate-float-fast">🥩</motion.div>
          <motion.div className="absolute top-1/2 left-8 text-5xl animate-float-slow">🫑</motion.div>
          <motion.div className="absolute bottom-1/3 right-10 text-5xl animate-float-fast">🍄</motion.div>
          <motion.div className="absolute top-24 left-1/3 text-4xl animate-float-fast">🧀</motion.div>
        </div>
      </section>

      {/* 2. SERVICES FEATURE BANNER */}
      <section className="px-6 md:px-12">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <motion.div variants={itemVariants} className="p-6 rounded-3xl glass-card border border-white/5 shadow-glass flex gap-5 items-start">
            <div className="p-3.5 bg-primary/10 border border-primary/20 text-primary rounded-2xl shadow-glow">
              <Zap size={24} />
            </div>
            <div>
              <h3 className="font-accent font-bold text-base uppercase tracking-wider mb-2 text-white">Ultra-Speed Delivery</h3>
              <p className="text-xs text-dark-muted leading-relaxed">Our smart cybernetic delivery grid calculates optimal routes using WebSockets to guarantee your pizza arrives steaming hot within 30 minutes.</p>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="p-6 rounded-3xl glass-card border border-white/5 shadow-glass flex gap-5 items-start">
            <div className="p-3.5 bg-veg/10 border border-veg/20 text-veg rounded-2xl shadow-glow-green">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h3 className="font-accent font-bold text-base uppercase tracking-wider mb-2 text-white">Curated Ingredients</h3>
              <p className="text-xs text-dark-muted leading-relaxed">No preservatives or stale freezing. We source organic, vine-ripened tomatoes, crumbed premium feta, and farm-fresh meat cuts daily.</p>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="p-6 rounded-3xl glass-card border border-white/5 shadow-glass flex gap-5 items-start">
            <div className="p-3.5 bg-orange-500/10 border border-orange-500/20 text-orange-400 rounded-2xl shadow-glow">
              <Truck size={24} />
            </div>
            <div>
              <h3 className="font-accent font-bold text-base uppercase tracking-wider mb-2 text-white">Live Tracking</h3>
              <p className="text-xs text-dark-muted leading-relaxed">Watch every step from kitchen prep, fire-deck baking, packaging, and dispatch maps with high-fidelity real-time WebSocket sync.</p>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* 3. SIGNATURE CALLOUT (PROMOTIONAL GRID) */}
      <section className="px-6 md:px-12 flex flex-col gap-12">
        <div className="text-center max-w-xl mx-auto flex flex-col gap-3">
          <h2 className="text-2xl md:text-4xl font-accent font-black tracking-wider uppercase text-white">SIGNATURE CREATIONS</h2>
          <p className="text-xs md:text-sm text-dark-muted leading-relaxed">Explore our highly rated premium menu items built by seasoned culinary cyber-chefs using dynamic flavor profiles.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Quick Mock Card 1 */}
          <div className="rounded-3xl overflow-hidden glass-card border border-white/5 flex flex-col group shadow-glass">
            <div className="h-52 w-full overflow-hidden relative bg-white/5">
              <img src="https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=400" alt="Margherita" className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
            </div>
            <div className="p-5 flex flex-col gap-2">
              <h3 className="font-accent font-bold text-base text-white">FUTURISTIC MARGHERITA</h3>
              <p className="text-xs text-dark-muted leading-relaxed">Abundant premium mozzarella, classic marinara, vine-ripened tomatoes, and basil pesto oil drizzle.</p>
              <Link to="/menu" className="mt-2 text-xs font-bold text-primary group-hover:underline flex items-center gap-1">VIEW ON MENU ➔</Link>
            </div>
          </div>
          
          {/* Quick Mock Card 2 */}
          <div className="rounded-3xl overflow-hidden glass-card border border-white/5 flex flex-col group shadow-glass">
            <div className="h-52 w-full overflow-hidden relative bg-white/5">
              <img src="https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400" alt="Pepperoni" className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
            </div>
            <div className="p-5 flex flex-col gap-2">
              <h3 className="font-accent font-bold text-base text-white">NEON PEPPERONI BLAZE</h3>
              <p className="text-xs text-dark-muted leading-relaxed">Double layer of crispy spicy pepperoni over sharp white cheddar and creamy garlic alfredo sauce.</p>
              <Link to="/menu" className="mt-2 text-xs font-bold text-primary group-hover:underline flex items-center gap-1">VIEW ON MENU ➔</Link>
            </div>
          </div>

          {/* Quick Mock Card 3 */}
          <div className="rounded-3xl overflow-hidden glass-card border border-white/5 flex flex-col group shadow-glass">
            <div className="h-52 w-full overflow-hidden relative bg-white/5">
              <img src="https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=400" alt="Meatverse" className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
            </div>
            <div className="p-5 flex flex-col gap-2">
              <h3 className="font-accent font-bold text-base text-white">THE ULTIMATE MEATVERSE</h3>
              <p className="text-xs text-dark-muted leading-relaxed">A massive feast loaded with crispy pepperoni, grilled chicken, smoked ham, bacon bits, and Italian sausage.</p>
              <Link to="/menu" className="mt-2 text-xs font-bold text-primary group-hover:underline flex items-center gap-1">VIEW ON MENU ➔</Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4. BUILDER CALL TO ACTION */}
      <section className="px-6 md:px-12">
        <div className="rounded-[40px] relative overflow-hidden bg-gradient-to-br from-primary/20 via-orange-500/5 to-transparent border border-primary/20 p-8 md:p-16 flex flex-col md:flex-row items-center justify-between gap-10 shadow-glass">
          {/* Glowing back blurs */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full bg-primary/10 blur-[100px] pointer-events-none" />

          <div className="flex flex-col gap-4 max-w-lg z-10">
            <span className="text-[10px] font-black tracking-widest text-primary bg-primary/10 border border-primary/20 px-3 py-1 rounded-full uppercase w-fit">INTERACTIVE LAB</span>
            <h2 className="text-3xl md:text-5xl font-accent font-black tracking-wider uppercase leading-tight text-white">DON'T SETTLE.<br/>BUILD YOUR PIZZA.</h2>
            <p className="text-xs md:text-sm text-dark-muted leading-relaxed">Ditch the default menu configurations. Open our custom visual lab and select from 5 crusts, 5 gourmet sauces, multiple premium cheeses, and freshly chopped farm toppings with dynamic pricing.</p>
            <button 
              onClick={() => navigate('/builder')}
              className="mt-2 px-8 h-14 bg-primary hover:bg-primary-dark text-white font-accent font-black tracking-widest text-xs rounded-2xl shadow-glow hover:shadow-glow transition-all duration-300 w-fit"
            >
              LAUNCH BUILDER LAB ⚡
            </button>
          </div>

          <div className="w-full md:w-1/2 flex items-center justify-center relative select-none">
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="w-72 h-72 md:w-96 md:h-96"
            >
              <img src="https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500" alt="Visual Pizza" className="w-full h-full object-cover rounded-full border-4 border-white/5 shadow-glow" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* 5. TESTIMONIAL CAROUSEL */}
      <section className="px-6 md:px-12 flex flex-col gap-12">
        <div className="text-center max-w-md mx-auto">
          <h2 className="text-2xl md:text-3xl font-accent font-black tracking-wider uppercase text-white">CUSTOMER VERSE</h2>
          <p className="text-xs text-dark-muted mt-2">Hear from registered cyber-citizens who experienced our premium delivery service.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <div key={i} className="p-6 rounded-3xl glass-card border border-white/5 shadow-glass flex flex-col gap-4">
              <div className="flex gap-1 text-yellow-400">
                {[...Array(t.rating)].map((_, idx) => (
                  <Star key={idx} size={14} fill="currentColor" />
                ))}
              </div>
              <p className="text-xs text-dark-muted leading-relaxed flex-grow italic">"{t.text}"</p>
              <div className="border-t border-white/5 pt-3 mt-2">
                <h4 className="font-bold text-sm text-white">{t.name}</h4>
                <span className="text-[10px] text-primary font-bold uppercase tracking-wider">{t.role}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. NEON FOOTER */}
      <footer className="border-t border-white/5 pt-16 pb-8 bg-black/40">
        <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-4 gap-10 border-b border-white/5 pb-12 mb-8">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <span className="text-3xl">🍕</span>
              <span className="font-accent text-2xl font-black tracking-widest text-primary glow-text uppercase">PIZZAVERSE</span>
            </div>
            <p className="text-xs text-dark-muted leading-relaxed">Gourmet futuristic pizza delivery system built on the high-speed MERN framework. Crafting stunning, premium culinary experiences.</p>
          </div>
          <div>
            <h4 className="font-accent font-bold text-xs tracking-wider text-white uppercase mb-4">CYBER LAB</h4>
            <div className="flex flex-col gap-2.5 text-xs text-dark-muted">
              <Link to="/builder" className="hover:text-primary transition-colors">Visual Topping Builder</Link>
              <Link to="/menu" className="hover:text-primary transition-colors">Veg Premium Menu</Link>
              <Link to="/menu" className="hover:text-primary transition-colors">Non-Veg Blaze Selection</Link>
              <Link to="/menu" className="hover:text-primary transition-colors">Curated AI Combos</Link>
            </div>
          </div>
          <div>
            <h4 className="font-accent font-bold text-xs tracking-wider text-white uppercase mb-4">CITIZENS</h4>
            <div className="flex flex-col gap-2.5 text-xs text-dark-muted">
              <Link to="/auth" className="hover:text-primary transition-colors">Register Account</Link>
              <Link to="/orders" className="hover:text-primary transition-colors">Live Delivery Timelines</Link>
              <Link to="/orders" className="hover:text-primary transition-colors">Order Logs</Link>
              <a href="http://localhost:5174" target="_blank" rel="noreferrer" className="hover:text-primary transition-colors">Admin Dashboard</a>
            </div>
          </div>
          <div>
            <h4 className="font-accent font-bold text-xs tracking-wider text-white uppercase mb-4">CONTACT GRID</h4>
            <div className="flex flex-col gap-2.5 text-xs text-dark-muted">
              <p>📍 Sector 9, Cyber City Core, Neo-Mumbai</p>
              <p>📞 +91 999 888 7766</p>
              <p>✉️ support@pizzaverse.net</p>
            </div>
          </div>
        </div>
        <div className="text-center text-[10px] text-dark-muted">
          © 2026 PizzaVerse Delivery App. Built with precision MERN Stack. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
