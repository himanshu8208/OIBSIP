import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, ShoppingCart, Leaf } from 'lucide-react';
import { useCart } from '../store/CartContext';
import { useToast } from '../App';

export default function PizzaCard({ pizza }) {
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const [selectedSize, setSelectedSize] = useState('Medium');

  // Find multiplier based on chosen size
  const sizeOption = pizza.sizes.find(s => s.size === selectedSize) || { priceMultiplier: 1.3 };
  const dynamicPrice = Math.round(pizza.basePrice * sizeOption.priceMultiplier);

  const handleAddToCart = async () => {
    const res = await addToCart({
      pizzaId: pizza._id,
      isCustom: false,
      size: selectedSize,
      price: dynamicPrice,
      quantity: 1
    });

    if (res.success) {
      showToast(res.message, 'success');
    } else {
      showToast(res.message, 'warning');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="group relative rounded-3xl glass-card overflow-hidden border border-white/5 flex flex-col h-full shadow-glass"
    >
      {/* Product Image Section */}
      <div className="relative h-56 w-full overflow-hidden bg-white/5">
        <img 
          src={pizza.image} 
          alt={pizza.name} 
          className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" 
        />
        
        {/* Backdrop vignette shadow */}
        <div className="absolute inset-0 bg-gradient-to-t from-dark-bg via-transparent to-transparent opacity-80" />

        {/* Category Indicator Badges */}
        <div className="absolute top-4 left-4 flex gap-2">
          {pizza.category === 'veg' ? (
            <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest bg-veg/10 border border-veg/30 text-veg py-1 px-2.5 rounded-full shadow-glow-green">
              <Leaf size={10} /> VEG
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest bg-nonveg/10 border border-nonveg/30 text-nonveg py-1 px-2.5 rounded-full shadow-glow-red">
              🥩 NON-VEG
            </span>
          )}
        </div>

        {/* Rating Pill */}
        <div className="absolute top-4 right-4 flex items-center gap-1 bg-black/60 backdrop-blur-md border border-white/10 px-2 py-1 rounded-full text-xs font-bold text-yellow-400">
          <Star size={12} fill="currentColor" />
          <span>{pizza.rating}</span>
        </div>
      </div>

      {/* Product Detail Content */}
      <div className="p-5 flex-grow flex flex-col gap-4">
        <div>
          <h3 className="font-accent text-lg font-bold group-hover:text-primary transition-colors tracking-wide leading-snug">
            {pizza.name}
          </h3>
          <p className="text-xs text-dark-muted mt-1.5 leading-relaxed line-clamp-2">
            {pizza.description}
          </p>
        </div>

        {/* Ingredients Tags */}
        <div className="flex flex-wrap gap-1">
          {pizza.ingredients.slice(0, 4).map((ing, idx) => (
            <span 
              key={idx} 
              className="text-[10px] font-medium text-dark-muted bg-white/5 border border-white/5 py-0.5 px-2 rounded"
            >
              {ing}
            </span>
          ))}
          {pizza.ingredients.length > 4 && (
            <span className="text-[10px] font-medium text-primary bg-primary/5 py-0.5 px-1.5 rounded">
              +{pizza.ingredients.length - 4} more
            </span>
          )}
        </div>

        {/* Dynamic Sizing Selectors */}
        <div className="flex justify-between items-center bg-black/40 border border-white/5 rounded-2xl p-1 mt-auto">
          {pizza.sizes.map((s) => (
            <button
              key={s.size}
              onClick={() => setSelectedSize(s.size)}
              className={`flex-grow py-1.5 text-xs font-bold tracking-wide rounded-xl transition-all duration-300 ${
                selectedSize === s.size 
                  ? 'bg-primary text-white shadow-glow' 
                  : 'text-dark-muted hover:text-white'
              }`}
            >
              {s.size.slice(0, 3).toUpperCase()}
            </button>
          ))}
        </div>

        {/* Dynamic Price & Purchase Trigger */}
        <div className="flex items-center justify-between mt-2 pt-3 border-t border-white/5">
          <div className="flex flex-col">
            <span className="text-[10px] text-dark-muted uppercase font-bold tracking-wider">Price</span>
            <span className="text-xl font-black text-white">₹{dynamicPrice}</span>
          </div>

          <button 
            onClick={handleAddToCart}
            className="flex items-center gap-1.5 px-4 h-11 bg-white/5 hover:bg-primary border border-white/10 hover:border-primary text-primary hover:text-white text-xs font-black tracking-widest rounded-2xl transition-all duration-300 shadow-glass hover:shadow-glow"
          >
            <ShoppingCart size={14} />
            ADD TO CART
          </button>
        </div>
      </div>
    </motion.div>
  );
}
