import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useCart } from '../store/CartContext';
import { useToast } from '../App';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Sparkles, ChefHat } from 'lucide-react';

export default function CustomPizzaBuilder() {
  const { addToCart } = useCart();
  const { showToast } = useToast();

  const [activeStep, setActiveStep] = useState(0); // 0: Base, 1: Sauce, 2: Cheese, 3: Veggies, 4: Meats
  const [options, setOptions] = useState({ bases: [], sauces: [], cheeses: [], veggies: [], meats: [] });
  const [loading, setLoading] = useState(true);

  // Selections state
  const [selectedBase, setSelectedBase] = useState(null);
  const [selectedSauce, setSelectedSauce] = useState(null);
  const [selectedCheeses, setSelectedCheeses] = useState([]);
  const [selectedVeggies, setSelectedVeggies] = useState([]);
  const [selectedMeats, setSelectedMeats] = useState([]);
  const [selectedSize, setSelectedSize] = useState('Medium'); // Small, Medium, Large

  // Retrieve custom builder elements from DB
  useEffect(() => {
    const fetchBuilderOptions = async () => {
      try {
        setLoading(true);
        const res = await axios.get('/custom/options');
        if (res.data.success) {
          const opts = res.data.options;
          setOptions(opts);

          // Select defaults
          if (opts.bases.length > 0) setSelectedBase(opts.bases[0]);
          if (opts.sauces.length > 0) setSelectedSauce(opts.sauces[0]);
        }
      } catch (error) {
        console.error('[Builder Page] Error fetching topping options:', error.message);
        showToast('Error loading builder options. Using simulated fallback.', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchBuilderOptions();
  }, []);

  // Multipliers for sizing
  const sizeMultipliers = { Small: 1.0, Medium: 1.3, Large: 1.6 };

  // Live Price Calculation
  const calculateTotalPrice = () => {
    if (!selectedBase || !selectedSauce) return 0;
    
    // Base pizza starts at ₹149 (crust + sauce) + extra price for premium crusts/sauces
    let basePrice = 149 + selectedBase.price + selectedSauce.price;
    let multiplier = sizeMultipliers[selectedSize];
    
    let toppingsPrice = 
      selectedCheeses.reduce((sum, item) => sum + item.price, 0) +
      selectedVeggies.reduce((sum, item) => sum + item.price, 0) +
      selectedMeats.reduce((sum, item) => sum + item.price, 0);

    return Math.round(basePrice * multiplier + toppingsPrice);
  };

  const currentPrice = calculateTotalPrice();

  // Multi-select handlers
  const handleToggleCheese = (item) => {
    if (selectedCheeses.some(c => c._id === item._id)) {
      setSelectedCheeses(selectedCheeses.filter(c => c._id !== item._id));
    } else {
      setSelectedCheeses([...selectedCheeses, item]);
    }
  };

  const handleToggleVeggie = (item) => {
    if (selectedVeggies.some(v => v._id === item._id)) {
      setSelectedVeggies(selectedVeggies.filter(v => v._id !== item._id));
    } else {
      setSelectedVeggies([...selectedVeggies, item]);
    }
  };

  const handleToggleMeat = (item) => {
    if (selectedMeats.some(m => m._id === item._id)) {
      setSelectedMeats(selectedMeats.filter(m => m._id !== item._id));
    } else {
      setSelectedMeats([...selectedMeats, item]);
    }
  };

  // Add constructed pizza to shopping basket
  const handleAddCustomPizzaToCart = async () => {
    if (!selectedBase || !selectedSauce) {
      showToast('Please select a crust and sauce to continue', 'warning');
      return;
    }

    const customPizzaDetails = {
      base: selectedBase.itemName,
      sauce: selectedSauce.itemName,
      cheeses: selectedCheeses.map(c => c.itemName),
      veggies: selectedVeggies.map(v => v.itemName),
      meats: selectedMeats.map(m => m.itemName)
    };

    const res = await addToCart({
      isCustom: true,
      customPizzaDetails,
      size: selectedSize,
      price: currentPrice,
      quantity: 1
    });

    if (res.success) {
      showToast('Custom pizza loaded in your cart!', 'success');
      // Reset selections
      setSelectedCheeses([]);
      setSelectedVeggies([]);
      setSelectedMeats([]);
      setActiveStep(0);
    } else {
      showToast(res.message, 'error');
    }
  };

  const steps = [
    { title: 'CRUST BASE', list: options.bases },
    { title: 'SAUCE', list: options.sauces },
    { title: 'CHEESE', list: options.cheeses },
    { title: 'VEGGIES', list: options.veggies },
    { title: 'MEATS', list: options.meats }
  ];

  // Visual ingredient placement mock coordinate generators
  const renderVisualTopping = (type, colorStr, labelText) => {
    // Generate absolute positions for toppings on the round pizza
    const positions = [
      { top: '25%', left: '35%' }, { top: '30%', left: '55%' }, { top: '45%', left: '25%' },
      { top: '50%', left: '65%' }, { top: '65%', left: '40%' }, { top: '35%', left: '45%' },
      { top: '55%', left: '48%' }, { top: '40%', left: '33%' }, { top: '58%', left: '30%' },
      { top: '35%', left: '65%' }, { top: '60%', left: '60%' }, { top: '70%', left: '50%' }
    ];

    return positions.slice(0, 8).map((pos, idx) => (
      <motion.div
        key={`${type}-${idx}`}
        initial={{ opacity: 0, scale: 2, y: -80 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.5 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15, delay: idx * 0.05 }}
        style={{ ...pos }}
        className={`absolute w-3.5 h-3.5 rounded-full shadow-[0_2px_5px_rgba(0,0,0,0.3)] flex items-center justify-center font-bold text-[8px] z-20 pointer-events-none select-none`}
      >
        <span style={{ color: colorStr }}>{labelText}</span>
      </motion.div>
    ));
  };

  return (
    <div className="min-h-screen px-6 md:px-12 py-10 max-w-7xl mx-auto flex flex-col gap-10">
      {/* Page Header */}
      <div>
        <h1 className="font-accent text-3xl md:text-5xl font-black uppercase tracking-wider text-white">
          PIZZA <span className="text-primary glow-text">BUILDER</span> LAB
        </h1>
        <p className="text-xs text-dark-muted mt-1">
          Select your custom crust, dynamic sauce, premium cheeses, and freshly cut ingredients live on our preview radar.
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center h-96 text-primary gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
          <p className="text-xs font-bold uppercase tracking-wider">Calibrating Visual RADAR...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* LEFT COLUMN: PIZZA VISUAL PREVIEW CANVAS (Col span 5) */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center bg-white/5 border border-white/5 rounded-[40px] p-8 shadow-glass relative select-none min-h-[450px]">
            {/* Visual sizing controller */}
            <div className="absolute top-6 left-6 right-6 flex gap-2 justify-center bg-black/40 border border-white/5 p-1 rounded-2xl z-20">
              {['Small', 'Medium', 'Large'].map((sz) => (
                <button
                  key={sz}
                  onClick={() => setSelectedSize(sz)}
                  className={`px-4 py-1.5 text-xs font-bold tracking-wider rounded-xl transition-all ${
                    selectedSize === sz 
                      ? 'bg-primary text-white shadow-glow' 
                      : 'text-dark-muted hover:text-white'
                  }`}
                >
                  {sz.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Glowing circle radars */}
            <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
              <div className="w-[380px] h-[380px] border border-dashed border-primary rounded-full animate-spin-slow"></div>
              <div className="w-[280px] h-[280px] border border-dashed border-white rounded-full absolute"></div>
            </div>

            {/* Outer scale dynamic container */}
            <motion.div 
              animate={{ 
                scale: selectedSize === 'Small' ? 0.85 : selectedSize === 'Medium' ? 1.0 : 1.15
              }}
              transition={{ type: 'spring', stiffness: 200, damping: 18 }}
              className="relative w-72 h-72 md:w-80 md:h-80 rounded-full flex items-center justify-center z-10"
            >
              {/* 1. CRUST PREVIEW BACKGROUND LAYER */}
              <div className={`absolute inset-2 rounded-full overflow-hidden border-4 border-yellow-800 bg-amber-100 shadow-[0_15px_30px_rgba(0,0,0,0.4)] transition-all duration-500 z-0 ${
                selectedBase?.itemName.includes('Wheat') ? 'bg-amber-200 border-amber-950' : 
                selectedBase?.itemName.includes('Burst') ? 'bg-yellow-50 border-yellow-700 shadow-glow' : 'bg-amber-100'
              }`} />

              {/* 2. SAUCE SMEAR OVERLAY LAYER */}
              {selectedSauce && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 0.85, scale: 0.95 }}
                  key={selectedSauce._id}
                  style={{
                    backgroundColor: 
                      selectedSauce.itemName.includes('BBQ') ? '#5c2a18' : 
                      selectedSauce.itemName.includes('Alfredo') ? '#fff9e6' : 
                      selectedSauce.itemName.includes('Pesto') ? '#4f7942' : '#c0392b'
                  }}
                  className="absolute inset-6 rounded-full blur-[2px] transition-all duration-500 z-10"
                />
              )}

              {/* 3. CHEESE OVERLAYS */}
              {selectedCheeses.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 0.7, scale: 0.98 }}
                  className="absolute inset-8 rounded-full border-4 border-dashed border-yellow-100 bg-yellow-200/40 blur-[3px] z-10"
                />
              )}

              {/* 4. DRAGGED TOPPINGS SPRINGS OVERLAYS */}
              <AnimatePresence>
                {selectedVeggies.some(v => v.itemName.includes('Olives')) && renderVisualTopping('olives', '#000000', '⭕')}
                {selectedVeggies.some(v => v.itemName.includes('Jalapenos')) && renderVisualTopping('jalapenos', '#2ecc71', '🟢')}
                {selectedVeggies.some(v => v.itemName.includes('Corn')) && renderVisualTopping('corn', '#f1c40f', '🟡')}
                {selectedVeggies.some(v => v.itemName.includes('Tomatoes')) && renderVisualTopping('tomatoes', '#e74c3c', '🍅')}
                {selectedVeggies.some(v => v.itemName.includes('Mushrooms')) && renderVisualTopping('mushrooms', '#d5dbdb', '🍄')}
                {selectedMeats.some(m => m.itemName.includes('Pepperoni')) && renderVisualTopping('pepperoni', '#e74c3c', '🔴')}
                {selectedMeats.some(m => m.itemName.includes('Chicken')) && renderVisualTopping('chicken', '#f5cba7', '🍗')}
                {selectedMeats.some(m => m.itemName.includes('Ham')) && renderVisualTopping('ham', '#f5b7b1', '🥓')}
              </AnimatePresence>
            </motion.div>

            {/* Bottom active description status banner */}
            <div className="mt-8 text-center flex flex-col gap-1 z-10">
              <span className="text-[10px] text-primary font-bold uppercase tracking-widest">Active Configuration</span>
              <p className="font-accent text-sm font-bold text-white uppercase truncate max-w-xs">
                {selectedBase?.itemName} + {selectedSauce?.itemName}
              </p>
            </div>
          </div>

          {/* RIGHT COLUMN: WORKFLOW STEP-BY-STEP CUSTOMIZER PANEL (Col span 7) */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            
            {/* Step navigation tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 border-b border-white/5">
              {steps.map((st, idx) => (
                <button
                  key={st.title}
                  onClick={() => setActiveStep(idx)}
                  className={`px-4 py-2 text-xs font-accent font-black tracking-widest uppercase rounded-xl transition-all border whitespace-nowrap ${
                    activeStep === idx 
                      ? 'bg-primary/10 border-primary/30 text-primary shadow-glow' 
                      : 'bg-black/30 border-white/5 text-dark-muted hover:text-white'
                  }`}
                >
                  {st.title}
                </button>
              ))}
            </div>

            {/* Step ingredient items list grid */}
            <div className="min-h-[220px] max-h-[300px] overflow-y-auto pr-2 flex flex-col gap-3">
              <h3 className="text-xs font-black tracking-wider text-white uppercase flex items-center gap-1.5 mb-1">
                <ChefHat size={14} className="text-primary" /> CHOOSE {steps[activeStep].title}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {steps[activeStep].list.map((item) => {
                  
                  // Check selection criteria
                  let isSelected = false;
                  if (activeStep === 0) isSelected = selectedBase?._id === item._id;
                  else if (activeStep === 1) isSelected = selectedSauce?._id === item._id;
                  else if (activeStep === 2) isSelected = selectedCheeses.some(c => c._id === item._id);
                  else if (activeStep === 3) isSelected = selectedVeggies.some(v => v._id === item._id);
                  else if (activeStep === 4) isSelected = selectedMeats.some(m => m._id === item._id);

                  // Set selection handler
                  const handleSelect = () => {
                    if (activeStep === 0) setSelectedBase(item);
                    else if (activeStep === 1) setSelectedSauce(item);
                    else if (activeStep === 2) handleToggleCheese(item);
                    else if (activeStep === 3) handleToggleVeggie(item);
                    else if (activeStep === 4) handleToggleMeat(item);
                  };

                  return (
                    <button
                      key={item._id}
                      onClick={handleSelect}
                      className={`p-3.5 rounded-2xl border text-left transition-all flex justify-between items-center group relative overflow-hidden shadow-glass ${
                        isSelected 
                          ? 'bg-primary/10 border-primary/30 text-white' 
                          : 'bg-white/5 border-white/5 hover:bg-white/[0.08] text-dark-text'
                      }`}
                    >
                      <div className="flex flex-col gap-0.5">
                        <span className="font-bold text-xs group-hover:text-primary transition-colors">{item.itemName}</span>
                        <span className="text-[10px] text-dark-muted leading-none">
                          {item.price > 0 ? `+ ₹${item.price}` : 'Default Option (Included)'}
                        </span>
                      </div>
                      
                      {/* Checked dot indicator */}
                      <div className={`h-5 w-5 rounded-full border flex items-center justify-center transition-all ${
                        isSelected 
                          ? 'bg-primary border-primary text-white shadow-glow' 
                          : 'border-white/10 group-hover:border-primary/50 bg-black/40'
                      }`}>
                        {isSelected && <span className="text-[10px] font-bold">✓</span>}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bottom calculation price banner & stepper triggers */}
            <div className="bg-white/5 border border-white/5 rounded-3xl p-6 shadow-glass flex flex-col sm:flex-row items-center justify-between gap-6 mt-auto">
              <div>
                <span className="text-[10px] text-dark-muted uppercase font-bold tracking-widest">Calculated Price</span>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <h3 className="text-3xl font-black text-primary glow-text">₹{currentPrice}</h3>
                  <span className="text-[10px] text-dark-muted font-medium">({selectedSize} Size)</span>
                </div>
              </div>

              {/* Stepper CTAs */}
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  disabled={activeStep === 0}
                  onClick={() => setActiveStep(prev => prev - 1)}
                  className="p-3 bg-white/5 border border-white/5 hover:border-primary/20 text-white disabled:opacity-30 disabled:cursor-not-allowed rounded-2xl transition-all"
                >
                  <ChevronLeft size={20} />
                </button>

                {activeStep < 4 ? (
                  <button
                    onClick={() => setActiveStep(prev => prev + 1)}
                    className="flex-grow sm:flex-none h-12 px-6 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-accent font-black tracking-widest text-xs rounded-2xl transition-all flex items-center justify-center gap-1.5"
                  >
                    NEXT STEP <ChevronRight size={16} />
                  </button>
                ) : (
                  <button
                    onClick={handleAddCustomPizzaToCart}
                    className="flex-grow sm:flex-none h-12 px-6 bg-gradient-to-r from-primary to-orange-400 text-white font-accent font-black tracking-widest text-xs rounded-2xl shadow-glow hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center gap-1.5"
                  >
                    <Sparkles size={14} className="animate-pulse" /> LOAD TO CART ⚡
                  </button>
                )}
              </div>
            </div>

          </div>

        </div>
      )}
    </div>
  );
}
