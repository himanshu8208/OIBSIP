import Inventory from '../models/Inventory.js';

// @desc    Get all inventory items (including crusts, sauces, cheese, toppings)
// @route   GET /api/inventory
// @access  Private/Admin
export const getInventoryList = async (req, res) => {
  try {
    const inventory = await Inventory.find({}).sort('itemType');
    res.status(200).json({ success: true, count: inventory.length, inventory });
  } catch (error) {
    console.error('[Inventory Controller] Get list error:', error.message);
    res.status(500).json({ success: false, message: 'Server error loading inventory catalog' });
  }
};

// @desc    Update single inventory item details / quantity stock values
// @route   PUT /api/inventory/:id
// @access  Private/Admin
export const updateInventoryItem = async (req, res) => {
  try {
    const { itemName, quantity, threshold, price, isAvailable } = req.body;
    let item = await Inventory.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ success: false, message: 'Inventory item not found' });
    }

    if (itemName !== undefined) item.itemName = itemName;
    if (quantity !== undefined) item.quantity = Number(quantity);
    if (threshold !== undefined) item.threshold = Number(threshold);
    if (price !== undefined) item.price = Number(price);
    if (isAvailable !== undefined) item.isAvailable = isAvailable;

    await item.save();
    res.status(200).json({ success: true, message: 'Inventory item restocked successfully!', item });
  } catch (error) {
    console.error('[Inventory Controller] Update item error:', error.message);
    res.status(500).json({ success: false, message: 'Server error updating stock details' });
  }
};

// @desc    Create new inventory item (Admin)
// @route   POST /api/inventory
// @access  Private/Admin
export const createInventoryItem = async (req, res) => {
  try {
    const { itemType, itemName, quantity, threshold, price } = req.body;

    const exists = await Inventory.findOne({ itemName });
    if (exists) {
      return res.status(400).json({ success: false, message: 'Ingredient already registered under this name' });
    }

    const item = await Inventory.create({
      itemType,
      itemName,
      quantity: Number(quantity) || 100,
      threshold: Number(threshold) || 15,
      price: Number(price) || 0
    });

    res.status(201).json({ success: true, message: 'New builder ingredient added!', item });
  } catch (error) {
    console.error('[Inventory Controller] Create item error:', error.message);
    res.status(500).json({ success: false, message: 'Server error registering new ingredient' });
  }
};

// @desc    Get low stock warnings
// @route   GET /api/inventory/alerts
// @access  Private/Admin
export const getInventoryAlerts = async (req, res) => {
  try {
    // Find all items where quantity is below threshold limit
    const alerts = await Inventory.find({
      $expr: { $lt: ['$quantity', '$threshold'] }
    });
    res.status(200).json({ success: true, count: alerts.length, alerts });
  } catch (error) {
    console.error('[Inventory Controller] Alerts query error:', error.message);
    res.status(500).json({ success: false, message: 'Server error retrieving stock warnings' });
  }
};
