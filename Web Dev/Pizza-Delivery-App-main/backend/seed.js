import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import Pizza from './models/Pizza.js';
import Inventory from './models/Inventory.js';
import User from './models/User.js';
import Cart from './models/Cart.js';
import Order from './models/Order.js';
import Review from './models/Review.js';

dotenv.config();

// Connect to Database
// Connect to Database
// Connect to Database
await connectDB();

const seedData = async () => {
  try {
    // 1. Wipe out existing database records
    console.log('[Seed] Wiping out existing collections...');
    await Pizza.deleteMany({});
    await Inventory.deleteMany({});
    await Review.deleteMany({});
    // We intentionally preserve User/Cart/Order unless requested to fully clear, let's keep it clean
    
    console.log('[Seed] Seeding builder crust bases, sauces, and toppings into Inventory...');
    
    const inventoryItems = [
      // Bases (Crust types)
      { itemType: 'base', itemName: 'Hand-Tossed Classic', quantity: 150, threshold: 20, price: 0, isAvailable: true },
      { itemType: 'base', itemName: 'Thin Crust', quantity: 120, threshold: 20, price: 20, isAvailable: true },
      { itemType: 'base', itemName: 'Cheese Burst Crust', quantity: 90, threshold: 15, price: 90, isAvailable: true },
      { itemType: 'base', itemName: '100% Wheat Crust', quantity: 100, threshold: 15, price: 30, isAvailable: true },
      { itemType: 'base', itemName: 'Gluten-Free Crust', quantity: 60, threshold: 10, price: 80, isAvailable: true },

      // Sauces
      { itemType: 'sauce', itemName: 'Classic Marinara', quantity: 160, threshold: 25, price: 0, isAvailable: true },
      { itemType: 'sauce', itemName: 'Smoky BBQ Sauce', quantity: 110, threshold: 20, price: 15, isAvailable: true },
      { itemType: 'sauce', itemName: 'Creamy Garlic Alfredo', quantity: 100, threshold: 20, price: 20, isAvailable: true },
      { itemType: 'sauce', itemName: 'Zesty Basil Pesto', quantity: 80, threshold: 15, price: 30, isAvailable: true },
      { itemType: 'sauce', itemName: 'Fiery Schezwan', quantity: 130, threshold: 20, price: 10, isAvailable: true },

      // Cheese Options
      { itemType: 'cheese', itemName: 'Premium Mozzarella', quantity: 180, threshold: 30, price: 40, isAvailable: true },
      { itemType: 'cheese', itemName: 'Sharp White Cheddar', quantity: 110, threshold: 20, price: 50, isAvailable: true },
      { itemType: 'cheese', itemName: 'Grated Italian Parmesan', quantity: 90, threshold: 15, price: 45, isAvailable: true },
      { itemType: 'cheese', itemName: 'Crumbled Feta', quantity: 70, threshold: 10, price: 60, isAvailable: true },
      { itemType: 'cheese', itemName: 'Liquid Cheddar Cheese', quantity: 120, threshold: 20, price: 35, isAvailable: true },

      // Veggie Options
      { itemType: 'veggie', itemName: 'Caramelized Onions', quantity: 200, threshold: 25, price: 20, isAvailable: true },
      { itemType: 'veggie', itemName: 'Vine-Ripened Tomatoes', quantity: 180, threshold: 25, price: 20, isAvailable: true },
      { itemType: 'veggie', itemName: 'Crispy Capsicum', quantity: 190, threshold: 25, price: 20, isAvailable: true },
      { itemType: 'veggie', itemName: 'Spicy Green Jalapenos', quantity: 140, threshold: 20, price: 25, isAvailable: true },
      { itemType: 'veggie', itemName: 'Sliced Black Olives', quantity: 130, threshold: 20, price: 30, isAvailable: true },
      { itemType: 'veggie', itemName: 'Golden Sweet Corn', quantity: 170, threshold: 20, price: 25, isAvailable: true },
      { itemType: 'veggie', itemName: 'Sautéed Mushrooms', quantity: 110, threshold: 15, price: 30, isAvailable: true },

      // Meat Options
      { itemType: 'meat', itemName: 'Spicy Pepperoni', quantity: 160, threshold: 25, price: 60, isAvailable: true },
      { itemType: 'meat', itemName: 'Smoked Grilled Chicken', quantity: 140, threshold: 20, price: 50, isAvailable: true },
      { itemType: 'meat', itemName: 'Italian Sausage Chunks', quantity: 100, threshold: 15, price: 55, isAvailable: true },
      { itemType: 'meat', itemName: 'Shredded Smoked Ham', quantity: 90, threshold: 15, price: 50, isAvailable: true },
      { itemType: 'meat', itemName: 'Crispy Bacon Bits', quantity: 110, threshold: 15, price: 70, isAvailable: true }
    ];

    await Inventory.insertMany(inventoryItems);
    console.log('[Seed] Inventory database populated successfully!');

    console.log('[Seed] Seeding menu Pizzas...');

    const menuPizzas = [
      {
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
        ]
      },
      {
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
        ]
      },
      {
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
        ]
      },
      {
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
        ]
      },
      {
        name: 'Volcanic Chilli Overload',
        description: 'A spicy blast of green jalapenos, fire schezwan base, crispy capsicum, sweet corn, and a double layer of crumbed feta cheese.',
        category: 'veg',
        basePrice: 249,
        rating: 4.5,
        reviewsCount: 78,
        ingredients: ['Fiery Schezwan', 'Spicy Green Jalapenos', 'Crispy Capsicum', 'Golden Sweet Corn', 'Crumbled Feta'],
        image: 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=500',
        sizes: [
          { size: 'Small', priceMultiplier: 1.0 },
          { size: 'Medium', priceMultiplier: 1.3 },
          { size: 'Large', priceMultiplier: 1.6 }
        ]
      },
      {
        name: 'The Ultimate MeatVerse',
        description: 'An absolute feast loaded to the brim with bacon bits, Italian sausage, smoked ham, crispy pepperoni, and grilled chicken!',
        category: 'non-veg',
        basePrice: 499,
        rating: 4.95,
        reviewsCount: 412,
        ingredients: ['Spicy Pepperoni', 'Smoked Grilled Chicken', 'Italian Sausage Chunks', 'Shredded Smoked Ham', 'Crispy Bacon Bits', 'Premium Mozzarella'],
        image: 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=500',
        sizes: [
          { size: 'Small', priceMultiplier: 1.0 },
          { size: 'Medium', priceMultiplier: 1.3 },
          { size: 'Large', priceMultiplier: 1.6 }
        ]
      }
    ];

    await Pizza.insertMany(menuPizzas);
    console.log('[Seed] Menu pizzas populated successfully!');
    
    console.log('[Seed] Database seeding completed successfully! Exiting.');
    process.exit(0);
  } catch (error) {
    console.error(`[Seed] Error running seed script: ${error.message}`);
    process.exit(1);
  }
};

await seedData();
