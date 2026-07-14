import Cart from '../models/Cart.js';
import Pizza from '../models/Pizza.js';

// Helper to find or create cart for user
const getOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
  }
  return cart;
};

// @desc    Get current user cart
// @route   GET /api/cart
// @access  Private
export const getCart = async (req, res) => {
  try {
    const cart = await getOrCreateCart(req.user.id);
    // Populate standard pizza detail objects
    await cart.populate('items.pizza');
    res.status(200).json({ success: true, cart });
  } catch (error) {
    console.error('[Cart Controller] Get cart error:', error.message);
    res.status(500).json({ success: false, message: 'Server error retrieving cart' });
  }
};

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
export const addToCart = async (req, res) => {
  try {
    const { pizzaId, isCustom, customPizzaDetails, quantity, size, price } = req.body;
    const cart = await getOrCreateCart(req.user.id);

    if (isCustom) {
      // For custom pizzas, always add as a new item since each creation is unique
      cart.items.push({
        isCustom: true,
        customPizzaDetails,
        quantity: Number(quantity) || 1,
        size: size || 'Medium',
        price: Number(price)
      });
    } else {
      // For standard pizzas, check if pizza with same size already exists
      const existingItemIndex = cart.items.findIndex(
        item => !item.isCustom && item.pizza.toString() === pizzaId && item.size === size
      );

      if (existingItemIndex > -1) {
        // Increment quantity
        cart.items[existingItemIndex].quantity += Number(quantity) || 1;
      } else {
        // Verify pizza exists
        const pizza = await Pizza.findById(pizzaId);
        if (!pizza) {
          return res.status(404).json({ success: false, message: 'Pizza not found' });
        }

        cart.items.push({
          pizza: pizzaId,
          isCustom: false,
          quantity: Number(quantity) || 1,
          size: size || 'Medium',
          price: Number(price)
        });
      }
    }

    await cart.save();
    await cart.populate('items.pizza');
    res.status(200).json({ success: true, message: 'Added to cart!', cart });
  } catch (error) {
    console.error('[Cart Controller] Add to cart error:', error.message);
    res.status(500).json({ success: false, message: 'Server error adding item to cart' });
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/:itemId
// @access  Private
export const removeFromCart = async (req, res) => {
  try {
    const cart = await getOrCreateCart(req.user.id);
    
    cart.items = cart.items.filter(item => item._id.toString() !== req.params.itemId);
    
    await cart.save();
    await cart.populate('items.pizza');
    res.status(200).json({ success: true, message: 'Item removed from cart', cart });
  } catch (error) {
    console.error('[Cart Controller] Remove from cart error:', error.message);
    res.status(500).json({ success: false, message: 'Server error removing item' });
  }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/:itemId
// @access  Private
export const updateCartItemQuantity = async (req, res) => {
  try {
    const { quantity } = req.body;
    const cart = await getOrCreateCart(req.user.id);

    const itemIndex = cart.items.findIndex(item => item._id.toString() === req.params.itemId);
    if (itemIndex === -1) {
      return res.status(404).json({ success: false, message: 'Item not found in cart' });
    }

    cart.items[itemIndex].quantity = Number(quantity);
    await cart.save();
    await cart.populate('items.pizza');

    res.status(200).json({ success: true, message: 'Quantity updated', cart });
  } catch (error) {
    console.error('[Cart Controller] Update quantity error:', error.message);
    res.status(500).json({ success: false, message: 'Server error updating quantity' });
  }
};

// @desc    Clear cart
// @route   DELETE /api/cart
// @access  Private
export const clearCart = async (req, res) => {
  try {
    const cart = await getOrCreateCart(req.user.id);
    cart.items = [];
    await cart.save();
    res.status(200).json({ success: true, message: 'Cart cleared successfully', cart });
  } catch (error) {
    console.error('[Cart Controller] Clear cart error:', error.message);
    res.status(500).json({ success: false, message: 'Server error clearing cart' });
  }
};
