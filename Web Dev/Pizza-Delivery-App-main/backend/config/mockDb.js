import fs from 'fs';
import path from 'path';

const dbPath = path.resolve('data/db_fallback.json');

// Ensure data folder exists
if (!fs.existsSync(path.dirname(dbPath))) {
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
}

export const mockStore = {
  User: [],
  Pizza: [],
  Inventory: [],
  Order: [],
  Cart: [],
  Review: []
};

// Default seed list for pure out-of-the-box operation
const seedDefaults = () => {
  console.log('[Mock DB] Initializing default seed data...');
  
  // Custom Toppings & crusts
  mockStore.Inventory = [
    // Bases (Crust types)
    { _id: 'b1', itemType: 'base', itemName: 'Hand-Tossed Classic', quantity: 150, threshold: 20, price: 0, isAvailable: true },
    { _id: 'b2', itemType: 'base', itemName: 'Thin Crust', quantity: 120, threshold: 20, price: 20, isAvailable: true },
    { _id: 'b3', itemType: 'base', itemName: 'Cheese Burst Crust', quantity: 90, threshold: 15, price: 90, isAvailable: true },
    { _id: 'b4', itemType: 'base', itemName: '100% Wheat Crust', quantity: 100, threshold: 15, price: 30, isAvailable: true },
    { _id: 'b5', itemType: 'base', itemName: 'Gluten-Free Crust', quantity: 60, threshold: 10, price: 80, isAvailable: true },

    // Sauces
    { _id: 's1', itemType: 'sauce', itemName: 'Classic Marinara', quantity: 160, threshold: 25, price: 0, isAvailable: true },
    { _id: 's2', itemType: 'sauce', itemName: 'Smoky BBQ Sauce', quantity: 110, threshold: 20, price: 15, isAvailable: true },
    { _id: 's3', itemType: 'sauce', itemName: 'Creamy Garlic Alfredo', quantity: 100, threshold: 20, price: 20, isAvailable: true },
    { _id: 's4', itemType: 'sauce', itemName: 'Zesty Basil Pesto', quantity: 80, threshold: 15, price: 30, isAvailable: true },
    { _id: 's5', itemType: 'sauce', itemName: 'Fiery Schezwan', quantity: 130, threshold: 20, price: 10, isAvailable: true },

    // Cheese Options
    { _id: 'c1', itemType: 'cheese', itemName: 'Premium Mozzarella', quantity: 180, threshold: 30, price: 40, isAvailable: true },
    { _id: 'c2', itemType: 'cheese', itemName: 'Sharp White Cheddar', quantity: 110, threshold: 20, price: 50, isAvailable: true },
    { _id: 'c3', itemType: 'cheese', itemName: 'Grated Italian Parmesan', quantity: 90, threshold: 15, price: 45, isAvailable: true },
    { _id: 'c4', itemType: 'cheese', itemName: 'Crumbled Feta', quantity: 70, threshold: 10, price: 60, isAvailable: true },
    { _id: 'c5', itemType: 'cheese', itemName: 'Liquid Cheddar Cheese', quantity: 120, threshold: 20, price: 35, isAvailable: true },

    // Veggie Options
    { _id: 'v1', itemType: 'veggie', itemName: 'Caramelized Onions', quantity: 200, threshold: 25, price: 20, isAvailable: true },
    { _id: 'v2', itemType: 'veggie', itemName: 'Vine-Ripened Tomatoes', quantity: 180, threshold: 25, price: 20, isAvailable: true },
    { _id: 'v3', itemType: 'veggie', itemName: 'Crispy Capsicum', quantity: 190, threshold: 25, price: 20, isAvailable: true },
    { _id: 'v4', itemType: 'veggie', itemName: 'Spicy Green Jalapenos', quantity: 140, threshold: 20, price: 25, isAvailable: true },
    { _id: 'v5', itemType: 'veggie', itemName: 'Sliced Black Olives', quantity: 130, threshold: 20, price: 30, isAvailable: true },
    { _id: 'v6', itemType: 'veggie', itemName: 'Golden Sweet Corn', quantity: 170, threshold: 20, price: 25, isAvailable: true },
    { _id: 'v7', itemType: 'veggie', itemName: 'Sautéed Mushrooms', quantity: 110, threshold: 15, price: 30, isAvailable: true },

    // Meat Options
    { _id: 'm1', itemType: 'meat', itemName: 'Spicy Pepperoni', quantity: 160, threshold: 25, price: 60, isAvailable: true },
    { _id: 'm2', itemType: 'meat', itemName: 'Smoked Grilled Chicken', quantity: 140, threshold: 20, price: 50, isAvailable: true },
    { _id: 'm3', itemType: 'meat', itemName: 'Italian Sausage Chunks', quantity: 100, threshold: 15, price: 55, isAvailable: true },
    { _id: 'm4', itemType: 'meat', itemName: 'Shredded Smoked Ham', quantity: 90, threshold: 15, price: 50, isAvailable: true },
    { _id: 'm5', itemType: 'meat', itemName: 'Crispy Bacon Bits', quantity: 110, threshold: 15, price: 70, isAvailable: true }
  ];

  // Curated Signature Menu
  mockStore.Pizza = [
    {
      _id: 'p1',
      name: 'Futuristic Margherita',
      description: 'A classic neon-infused classic! Abundant premium mozzarella, fresh vine-ripened tomatoes, and aromatic basil pesto oil drizzle.',
      category: 'veg',
      basePrice: 199,
      rating: 4.8,
      reviewsCount: 142,
      ingredients: ['Premium Mozzarella', 'Classic Marinara', 'Vine-Ripened Tomatoes', 'Basil Pesto'],
      image: 'https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=500',
      sizes: [
        { size: 'Small', priceMultiplier: 1.0 },
        { size: 'Medium', priceMultiplier: 1.3 },
        { size: 'Large', priceMultiplier: 1.6 }
      ],
      isAvailable: true
    },
    {
      _id: 'p2',
      name: 'Neon Pepperoni Blaze',
      description: 'Double layer of fiery, crispy pepperoni over strings of sharp cheddar and garlic alfredo sauce.',
      category: 'non-veg',
      basePrice: 349,
      rating: 4.9,
      reviewsCount: 328,
      ingredients: ['Spicy Pepperoni', 'Premium Mozzarella', 'Sharp White Cheddar', 'Creamy Garlic Alfredo'],
      image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=500',
      sizes: [
        { size: 'Small', priceMultiplier: 1.0 },
        { size: 'Medium', priceMultiplier: 1.3 },
        { size: 'Large', priceMultiplier: 1.6 }
      ],
      isAvailable: true
    },
    {
      _id: 'p3',
      name: 'Cyber Veggie Supreme',
      description: 'Vibrant medley of sweet corn, crispy capsicum, red onions, mushrooms, and sliced black olives on thin crust.',
      category: 'veg',
      basePrice: 279,
      rating: 4.6,
      reviewsCount: 96,
      ingredients: ['Classic Marinara', 'Premium Mozzarella', 'Caramelized Onions', 'Crispy Capsicum', 'Sautéed Mushrooms', 'Sliced Black Olives', 'Golden Sweet Corn'],
      image: 'https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?w=500',
      sizes: [
        { size: 'Small', priceMultiplier: 1.0 },
        { size: 'Medium', priceMultiplier: 1.3 },
        { size: 'Large', priceMultiplier: 1.6 }
      ],
      isAvailable: true
    },
    {
      _id: 'p4',
      name: 'Galactic BBQ Chicken',
      description: 'Tender smoked grilled chicken tossed in sticky smoky BBQ sauce, sweet corn, and red onions with bubbling liquid cheddar.',
      category: 'non-veg',
      basePrice: 389,
      rating: 4.7,
      reviewsCount: 184,
      ingredients: ['Smoked Grilled Chicken', 'Smoky BBQ Sauce', 'Caramelized Onions', 'Golden Sweet Corn', 'Liquid Cheddar Cheese'],
      image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500',
      sizes: [
        { size: 'Small', priceMultiplier: 1.0 },
        { size: 'Medium', priceMultiplier: 1.3 },
        { size: 'Large', priceMultiplier: 1.6 }
      ],
      isAvailable: true
    }
  ];
  saveToDisk();
};

export const saveToDisk = () => {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(mockStore, null, 2), 'utf-8');
  } catch (err) {
    console.error('[Mock DB] Failed to save database to disk:', err.message);
  }
};

export const loadFromDisk = () => {
  if (fs.existsSync(dbPath)) {
    try {
      const data = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
      Object.assign(mockStore, data);
      console.log('[Mock DB] Successfully loaded persisted data from JSON database.');
    } catch (e) {
      console.error('[Mock DB] Failed to parse JSON database, reseeding defaults:', e.message);
      seedDefaults();
    }
  } else {
    seedDefaults();
  }
};

loadFromDisk();
