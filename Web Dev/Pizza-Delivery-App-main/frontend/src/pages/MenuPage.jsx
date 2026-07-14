import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PizzaCard from '../components/PizzaCard';
import { Search, SlidersHorizontal, Sparkles, BrainCircuit, Flame, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function MenuPage() {
  const [pizzas, setPizzas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState('newest');

  // AI Recommendation system states
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [aiPrefCategory, setAiPrefCategory] = useState('any');
  const [aiPrefToppings, setAiPrefToppings] = useState('');
  const [aiSpicyLevel, setAiSpicyLevel] = useState('any');
  const [aiRecommendations, setAiRecommendations] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);

  // Fetch standard pizzas based on query filters
  const fetchPizzas = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/pizzas?category=${category}&sort=${sort}&search=${search}`);
      if (res.data.success) {
        setPizzas(res.data.pizzas);
      }
    } catch (error) {
      console.error('[Menu Page] Error loading pizzas:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchPizzas();
    }, 400); // Debounce search changes

    return () => clearTimeout(delayDebounceFn);
  }, [category, sort, search]);

  // Request AI Recommendations from API
  const handleAiRecommend = async (e) => {
    e.preventDefault();
    setAiLoading(true);
    try {
      const res = await axios.get(
        `/pizzas/recommendations?prefCategory=${aiPrefCategory}&prefToppings=${aiPrefToppings}&spicyLevel=${aiSpicyLevel}`
      );
      if (res.data.success) {
        setAiRecommendations(res.data.recommendations);
      }
    } catch (err) {
      console.error('[Menu Page] AI recommend failed:', err.message);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="min-h-screen px-6 md:px-12 py-10 flex flex-col gap-8 max-w-7xl mx-auto">
      {/* 1. Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="font-accent text-3xl md:text-5xl font-black uppercase tracking-wider text-white">
            SIGNATURE <span className="text-primary glow-text">MENU</span>
          </h1>
          <p className="text-xs text-dark-muted mt-1.5 leading-relaxed">
            Browse from our curated recipes prepared dynamically on fire-deck stone ovens.
          </p>
        </div>

        {/* AI Recommendation Floating Trigger Button */}
        <button
          onClick={() => setIsAiOpen(true)}
          className="flex items-center gap-2 px-6 h-12 bg-gradient-to-r from-primary to-orange-400 text-white font-accent font-black tracking-widest text-xs rounded-2xl shadow-glow hover:scale-105 active:scale-95 transition-all duration-300 w-fit"
        >
          <BrainCircuit size={16} className="animate-pulse" />
          AI PIZZA RECOMMENDATION
        </button>
      </div>

      {/* 2. Filters & Search Controls */}
      <div className="flex flex-col md:flex-row items-center gap-4 bg-white/5 border border-white/5 p-4 rounded-3xl shadow-glass w-full">
        {/* Search Input */}
        <div className="relative flex-grow w-full">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-dark-muted">
            <Search size={16} />
          </span>
          <input
            type="text"
            placeholder="Search pizzas or toppings (e.g. pepperoni, mushroom)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-11 pl-11 pr-4 bg-black/40 border border-white/5 rounded-2xl text-xs focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-dark-muted"
          />
        </div>

        {/* Category Veg/Non-veg Filter Buttons */}
        <div className="flex gap-2 w-full md:w-auto">
          {['all', 'veg', 'non-veg'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`flex-grow md:flex-none px-5 h-11 text-xs font-bold uppercase tracking-wider rounded-2xl border transition-all duration-300 ${
                category === cat
                  ? 'bg-primary border-primary text-white shadow-glow'
                  : 'bg-black/40 border-white/5 text-dark-muted hover:text-white'
              }`}
            >
              {cat === 'all' ? 'All Items' : cat === 'veg' ? '🥦 Veg' : '🥩 Non-Veg'}
            </button>
          ))}
        </div>

        {/* Sorting Dropdown */}
        <div className="relative w-full md:w-48">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-dark-muted pointer-events-none">
            <SlidersHorizontal size={14} />
          </span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="w-full h-11 pl-9 pr-4 bg-black/40 border border-white/5 rounded-2xl text-xs font-bold focus:outline-none focus:border-primary appearance-none cursor-pointer text-dark-text"
          >
            <option value="newest" className="bg-dark-card">NEWEST RELEASES</option>
            <option value="price-low" className="bg-dark-card">PRICE: LOW TO HIGH</option>
            <option value="price-high" className="bg-dark-card">PRICE: HIGH TO LOW</option>
            <option value="rating" className="bg-dark-card">HIGHEST RATED</option>
          </select>
        </div>
      </div>

      {/* 3. Products Grid */}
      {loading ? (
        // Rendering Loading Skeleton Cards
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(6)].map((_, idx) => (
            <div key={idx} className="h-96 rounded-3xl border border-white/5 bg-white/5 p-5 flex flex-col gap-4 shadow-glass">
              <div className="w-full h-48 skeleton rounded-2xl" />
              <div className="w-3/4 h-6 skeleton rounded" />
              <div className="w-full h-4 skeleton rounded" />
              <div className="w-full h-4 skeleton rounded" />
              <div className="mt-auto flex justify-between">
                <div className="w-16 h-8 skeleton rounded" />
                <div className="w-24 h-8 skeleton rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : pizzas.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center text-dark-muted gap-4">
          <span className="text-6xl animate-bounce">🍕</span>
          <p className="font-bold text-sm">No pizzas found matching your query!</p>
          <p className="text-xs">Try adjusting your filters, searching for other ingredients, or opening the custom builder.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {pizzas.map((pizza) => (
            <PizzaCard key={pizza._id} pizza={pizza} />
          ))}
        </div>
      )}

      {/* 4. AI RECOMMENDATION DRAWER MODAL */}
      <AnimatePresence>
        {isAiOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAiOpen(false)}
              className="fixed inset-0 bg-black z-50 pointer-events-auto"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed inset-x-4 top-[10%] bottom-[10%] md:inset-x-[20%] max-w-4xl mx-auto rounded-[36px] glass-panel border border-primary/20 shadow-[0_0_50px_rgba(255,107,8,0.2)] p-6 md:p-10 z-50 overflow-y-auto flex flex-col gap-6 pointer-events-auto text-dark-text"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <div className="flex items-center gap-3">
                  <BrainCircuit className="text-primary animate-pulse" size={24} />
                  <div>
                    <h3 className="font-accent text-xl font-black tracking-widest text-primary glow-text uppercase">
                      AI RECOMMENDATION
                    </h3>
                    <p className="text-[10px] text-dark-muted">Answer a few questions to find your dream pizza combinations.</p>
                  </div>
                </div>
                <button
                  onClick={() => { setIsAiOpen(false); setAiRecommendations([]); }}
                  className="p-1.5 rounded-full hover:bg-white/5 text-dark-muted hover:text-white"
                >
                  ✕
                </button>
              </div>

              {/* Questionnaire Form */}
              <form onSubmit={handleAiRecommend} className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* 1. Category */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-white uppercase tracking-wider">Preference</label>
                  <div className="flex flex-col gap-2 bg-black/40 border border-white/5 p-2 rounded-2xl">
                    {[
                      { val: 'any', txt: 'Anything goes' },
                      { val: 'veg', txt: '🥦 Pure Veg' },
                      { val: 'non-veg', txt: '🥩 Meat Eater' }
                    ].map((opt) => (
                      <button
                        key={opt.val}
                        type="button"
                        onClick={() => setAiPrefCategory(opt.val)}
                        className={`py-2 px-3 rounded-xl text-xs font-bold text-left transition-all ${
                          aiPrefCategory === opt.val
                            ? 'bg-primary text-white shadow-glow'
                            : 'text-dark-muted hover:text-white hover:bg-white/5'
                        }`}
                      >
                        {opt.txt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Spicy Preference */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-white uppercase tracking-wider">Spicy Level</label>
                  <div className="flex flex-col gap-2 bg-black/40 border border-white/5 p-2 rounded-2xl">
                    {[
                      { val: 'any', txt: 'Mellow / Creamy' },
                      { val: 'high', txt: '🔥 Fiery Hot' }
                    ].map((opt) => (
                      <button
                        key={opt.val}
                        type="button"
                        onClick={() => setAiSpicyLevel(opt.val)}
                        className={`py-2 px-3 rounded-xl text-xs font-bold text-left transition-all ${
                          aiSpicyLevel === opt.val
                            ? 'bg-primary text-white shadow-glow'
                            : 'text-dark-muted hover:text-white hover:bg-white/5'
                        }`}
                      >
                        {opt.txt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Preferred Toppings Search */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-white uppercase tracking-wider">Loved Toppings</label>
                  <div className="flex flex-col gap-3 h-full">
                    <input
                      type="text"
                      placeholder="e.g. chicken, corn, mushroom"
                      value={aiPrefToppings}
                      onChange={(e) => setAiPrefToppings(e.target.value)}
                      className="w-full h-12 px-4 bg-black/40 border border-white/5 rounded-2xl text-xs focus:outline-none focus:border-primary placeholder:text-dark-muted"
                    />
                    <button
                      type="submit"
                      disabled={aiLoading}
                      className="w-full h-12 bg-primary hover:bg-primary-dark text-white font-accent font-black tracking-widest text-xs rounded-2xl shadow-glow hover:shadow-glow transition-all flex items-center justify-center gap-2"
                    >
                      {aiLoading ? 'COMPUTING...' : 'RUN ALGORITHM ⚡'}
                    </button>
                  </div>
                </div>
              </form>

              {/* Recommendations Output Grid */}
              <div className="flex-grow flex flex-col gap-4 mt-4 border-t border-white/5 pt-6">
                <h4 className="text-xs font-bold uppercase text-white tracking-widest flex items-center gap-1.5">
                  <Sparkles size={14} className="text-yellow-400" /> AI ENGINE RECOMMENDATIONS
                </h4>

                {aiRecommendations.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {aiRecommendations.map((pizza) => (
                      <div 
                        key={pizza._id}
                        className="rounded-3xl border border-primary/30 bg-primary/5 p-4 flex flex-col h-full shadow-glow group hover:border-primary relative overflow-hidden transition-all duration-300"
                      >
                        <div className="h-32 rounded-2xl overflow-hidden mb-3 bg-white/5 border border-white/5">
                          <img src={pizza.image} alt={pizza.name} className="h-full w-full object-cover" />
                        </div>
                        <h4 className="font-accent text-xs font-black tracking-wider text-white uppercase group-hover:text-primary transition-colors">{pizza.name}</h4>
                        <p className="text-[10px] text-dark-muted mt-1 leading-normal line-clamp-2">{pizza.description}</p>
                        <span className="text-sm font-black text-primary mt-3">₹{pizza.basePrice}</span>
                        
                        {/* Short action button inside recommandation */}
                        <button
                          onClick={() => {
                            setIsAiOpen(false);
                            setAiRecommendations([]);
                            setSearch(pizza.name);
                          }}
                          className="mt-3 py-1.5 bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-wider rounded-xl text-primary hover:bg-primary hover:text-white transition-all w-full text-center"
                        >
                          SHOW IN MENU
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-48 border border-dashed border-white/5 rounded-3xl text-dark-muted text-xs text-center p-6">
                    <span>🧠 AI Recommendation idle</span>
                    <p className="text-[10px] max-w-xs mt-1">Specify your category, spice and topping preferences, and click "Run Algorithm" to calculate your best fits.</p>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
