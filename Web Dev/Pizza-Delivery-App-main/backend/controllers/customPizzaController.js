import Inventory from '../models/Inventory.js';

// @desc    Get all active ingredients for the custom pizza builder
// @route   GET /api/custom/options
// @access  Public
export const getBuilderOptions = async (req, res) => {
  try {
    // Retrieve all active inventory elements
    const ingredients = await Inventory.find({ isAvailable: true });

    // Group items dynamically by type for frontend step-by-step rendering
    const bases = ingredients.filter(item => item.itemType === 'base');
    const sauces = ingredients.filter(item => item.itemType === 'sauce');
    const cheeses = ingredients.filter(item => item.itemType === 'cheese');
    const veggies = ingredients.filter(item => item.itemType === 'veggie');
    const meats = ingredients.filter(item => item.itemType === 'meat');

    res.status(200).json({
      success: true,
      options: {
        bases,
        sauces,
        cheeses,
        veggies,
        meats
      }
    });
  } catch (error) {
    console.error('[Custom Pizza Controller] Error fetching builder options:', error.message);
    res.status(500).json({ success: false, message: 'Server error loading pizza builder ingredients' });
  }
};
