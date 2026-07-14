import Pizza from '../models/Pizza.js';
import Review from '../models/Review.js';

// @desc    Get all pizzas (with filtering and search)
// @route   GET /api/pizzas
// @access  Public
export const getAllPizzas = async (req, res) => {
  try {
    const { category, search, sort } = req.query;
    let query = { isAvailable: true };

    // Apply Veg / Non-Veg Category filters
    if (category && category !== 'all') {
      query.category = category;
    }

    // Apply Search Query
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { ingredients: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    let apiQuery = Pizza.find(query);

    // Apply Sorting Options
    if (sort === 'price-low') {
      apiQuery = apiQuery.sort('basePrice');
    } else if (sort === 'price-high') {
      apiQuery = apiQuery.sort('-basePrice');
    } else if (sort === 'rating') {
      apiQuery = apiQuery.sort('-rating');
    } else {
      apiQuery = apiQuery.sort('-createdAt'); // Default newest
    }

    const pizzas = await apiQuery;
    res.status(200).json({ success: true, count: pizzas.length, pizzas });
  } catch (error) {
    console.error('[Pizza Controller] Get all pizzas error:', error.message);
    res.status(500).json({ success: false, message: 'Server error retrieving pizzas' });
  }
};

// @desc    Get a single pizza by ID
// @route   GET /api/pizzas/:id
// @access  Public
export const getPizzaById = async (req, res) => {
  try {
    const pizza = await Pizza.findById(req.params.id);
    if (!pizza) {
      return res.status(404).json({ success: false, message: 'Pizza not found' });
    }

    // Retrieve reviews for this pizza
    const reviews = await Review.find({ pizza: pizza._id })
      .populate('user', 'name profileImage')
      .sort('-createdAt');

    res.status(200).json({ success: true, pizza, reviews });
  } catch (error) {
    console.error('[Pizza Controller] Get pizza by ID error:', error.message);
    res.status(500).json({ success: false, message: 'Server error retrieving pizza details' });
  }
};

// @desc    Add review for a pizza
// @route   POST /api/pizzas/:id/reviews
// @access  Private
export const addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const pizzaId = req.params.id;

    // Check if pizza exists
    const pizza = await Pizza.findById(pizzaId);
    if (!pizza) {
      return res.status(404).json({ success: false, message: 'Pizza not found' });
    }

    // Check if review already exists by this user
    const alreadyReviewed = await Review.findOne({ user: req.user.id, pizza: pizzaId });
    if (alreadyReviewed) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this pizza' });
    }

    // Create review
    const review = await Review.create({
      user: req.user.id,
      pizza: pizzaId,
      rating: Number(rating),
      comment
    });

    // Recalculate average rating & review count for the pizza
    const allReviews = await Review.find({ pizza: pizzaId });
    pizza.reviewsCount = allReviews.length;
    pizza.rating = parseFloat(
      (allReviews.reduce((acc, item) => item.rating + acc, 0) / allReviews.length).toFixed(1)
    );

    await pizza.save();

    res.status(201).json({ success: true, message: 'Review added successfully!', review });
  } catch (error) {
    console.error('[Pizza Controller] Add review error:', error.message);
    res.status(500).json({ success: false, message: 'Server error adding review' });
  }
};

// @desc    AI Recommendation Engine
// @route   GET /api/pizzas/recommendations
// @access  Public
export const getRecommendations = async (req, res) => {
  try {
    // Dynamic Query Parameters: preferences (veg, spicy, cheese, custom)
    const { prefCategory, prefToppings, spicyLevel } = req.query;
    let query = { isAvailable: true };

    if (prefCategory && prefCategory !== 'any') {
      query.category = prefCategory;
    }

    let pizzas = await Pizza.find(query);

    // Apply smart recommendation score based on matching preference tags
    const scoredPizzas = pizzas.map(pizza => {
      let score = pizza.rating * 1.5; // Base score on its current organic rating

      // If user provided preferred topping search words (e.g. "pepperoni, mushrooms")
      if (prefToppings) {
        const toppingWords = prefToppings.toLowerCase().split(',').map(t => t.trim());
        const matchCount = pizza.ingredients.filter(ing => 
          toppingWords.some(tw => ing.toLowerCase().includes(tw))
        ).length;
        score += matchCount * 2.0; // Boost score for every matching topping ingredient
      }

      // If user prefers spicy items, check for spicy ingredients
      if (spicyLevel === 'high') {
        const spicyIngredients = ['jalapeno', 'chilli', 'peri peri', 'spicy', 'paprika'];
        const isSpicy = pizza.ingredients.some(ing => 
          spicyIngredients.some(si => ing.toLowerCase().includes(si))
        );
        score += isSpicy ? 3.0 : -1.0;
      }

      return { pizza, score };
    });

    // Sort by best recommended score and take top 3
    const recommendations = scoredPizzas
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(item => item.pizza);

    res.status(200).json({ success: true, recommendations });
  } catch (error) {
    console.error('[Pizza Controller] Recommendation error:', error.message);
    res.status(500).json({ success: false, message: 'Server error retrieving recommendations' });
  }
};

// @desc    Create a new pizza
// @route   POST /api/pizzas
// @access  Private/Admin
export const createPizza = async (req, res) => {
  try {
    const { name, description, category, basePrice, ingredients, image, sizes } = req.body;

    const pizzaExists = await Pizza.findOne({ name });
    if (pizzaExists) {
      return res.status(400).json({ success: false, message: 'Pizza already exists with this name' });
    }

    const pizza = await Pizza.create({
      name,
      description,
      category,
      basePrice: Number(basePrice),
      ingredients: Array.isArray(ingredients) ? ingredients : ingredients.split(',').map(i => i.trim()),
      image: image || 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500',
      sizes: sizes || [
        { size: 'Small', priceMultiplier: 1.0 },
        { size: 'Medium', priceMultiplier: 1.3 },
        { size: 'Large', priceMultiplier: 1.6 }
      ]
    });

    res.status(201).json({ success: true, message: 'Pizza created successfully!', pizza });
  } catch (error) {
    console.error('[Pizza Controller] Create pizza error:', error.message);
    res.status(500).json({ success: false, message: 'Server error creating pizza' });
  }
};

// @desc    Update a pizza
// @route   PUT /api/pizzas/:id
// @access  Private/Admin
export const updatePizza = async (req, res) => {
  try {
    const { name, description, category, basePrice, ingredients, image, sizes, isAvailable } = req.body;
    let pizza = await Pizza.findById(req.params.id);

    if (!pizza) {
      return res.status(404).json({ success: false, message: 'Pizza not found' });
    }

    pizza.name = name || pizza.name;
    pizza.description = description || pizza.description;
    pizza.category = category || pizza.category;
    pizza.basePrice = basePrice ? Number(basePrice) : pizza.basePrice;
    pizza.isAvailable = isAvailable !== undefined ? isAvailable : pizza.isAvailable;
    
    if (ingredients) {
      pizza.ingredients = Array.isArray(ingredients) ? ingredients : ingredients.split(',').map(i => i.trim());
    }
    if (image) pizza.image = image;
    if (sizes) pizza.sizes = sizes;

    await pizza.save();
    res.status(200).json({ success: true, message: 'Pizza updated successfully!', pizza });
  } catch (error) {
    console.error('[Pizza Controller] Update pizza error:', error.message);
    res.status(500).json({ success: false, message: 'Server error updating pizza' });
  }
};

// @desc    Delete a pizza
// @route   DELETE /api/pizzas/:id
// @access  Private/Admin
export const deletePizza = async (req, res) => {
  try {
    const pizza = await Pizza.findById(req.params.id);
    if (!pizza) {
      return res.status(404).json({ success: false, message: 'Pizza not found' });
    }

    await Pizza.findByIdAndDelete(req.params.id);
    // Delete corresponding reviews too
    await Review.deleteMany({ pizza: req.params.id });

    res.status(200).json({ success: true, message: 'Pizza deleted successfully!' });
  } catch (error) {
    console.error('[Pizza Controller] Delete pizza error:', error.message);
    res.status(500).json({ success: false, message: 'Server error deleting pizza' });
  }
};
