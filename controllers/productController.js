import Product from '../models/Product.js';

// @desc    Fetch all products with filtering, search, sorting, and pagination
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
  const pageSize = Number(req.query.limit) || 9;
  const page = Number(req.query.pageNumber) || 1;

  // Search by keyword in name/description/tags
  const keyword = req.query.keyword
    ? {
        $or: [
          { name: { $regex: req.query.keyword, $options: 'i' } },
          { description: { $regex: req.query.keyword, $options: 'i' } },
          { brand: { $regex: req.query.keyword, $options: 'i' } },
          { tags: { $in: [new RegExp(req.query.keyword, 'i')] } }
        ]
      }
    : {};

  // Filtering by Category
  const category = req.query.category && req.query.category !== 'All'
    ? { category: req.query.category }
    : {};

  // Filtering by Price Range
  let priceFilter = {};
  if (req.query.minPrice || req.query.maxPrice) {
    priceFilter.price = {};
    if (req.query.minPrice) priceFilter.price.$gte = Number(req.query.minPrice);
    if (req.query.maxPrice) priceFilter.price.$lte = Number(req.query.maxPrice);
  }

  // Filtering by Rating
  const ratingFilter = req.query.rating
    ? { rating: { $gte: Number(req.query.rating) } }
    : {};

  // Combine query filters
  const query = { ...keyword, ...category, ...priceFilter, ...ratingFilter };

  // Sorting
  let sort = {};
  if (req.query.sortBy) {
    if (req.query.sortBy === 'priceAsc') sort = { price: 1 };
    else if (req.query.sortBy === 'priceDesc') sort = { price: -1 };
    else if (req.query.sortBy === 'rating') sort = { rating: -1 };
    else if (req.query.sortBy === 'newest') sort = { createdAt: -1 };
  } else {
    sort = { createdAt: -1 }; // Default: Newest
  }

  try {
    const count = await Product.countDocuments(query);
    const products = await Product.find(query)
      .limit(pageSize)
      .skip(pageSize * (page - 1))
      .sort(sort);

    res.json({ products, page, pages: Math.ceil(count / pageSize), total: count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      await Product.deleteOne({ _id: product._id });
      res.json({ message: 'Product removed' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res) => {
  const {
    name,
    price,
    description,
    images,
    brand,
    category,
    countInStock,
    sizes,
    colors,
    isFeatured,
    isNewArrival,
    isTrending,
    tags
  } = req.body;

  try {
    const product = new Product({
      name: name || 'Sample Product',
      price: price || 0,
      user: req.user._id,
      images: images || [{ url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=60' }],
      brand: brand || 'Sample Brand',
      category: category || 'Sample Category',
      countInStock: countInStock || 0,
      description: description || 'Sample Description',
      sizes: sizes || [],
      colors: colors || [],
      isFeatured: isFeatured || false,
      isNewArrival: isNewArrival || false,
      isTrending: isTrending || false,
      tags: tags || []
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res) => {
  const {
    name,
    price,
    discountPrice,
    description,
    images,
    brand,
    category,
    countInStock,
    sizes,
    colors,
    isFeatured,
    isNewArrival,
    isTrending,
    tags
  } = req.body;

  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      product.name = name ?? product.name;
      product.price = price ?? product.price;
      product.discountPrice = discountPrice ?? product.discountPrice;
      product.description = description ?? product.description;
      product.images = images ?? product.images;
      product.brand = brand ?? product.brand;
      product.category = category ?? product.category;
      product.countInStock = countInStock ?? product.countInStock;
      product.sizes = sizes ?? product.sizes;
      product.colors = colors ?? product.colors;
      product.isFeatured = isFeatured ?? product.isFeatured;
      product.isNewArrival = isNewArrival ?? product.isNewArrival;
      product.isTrending = isTrending ?? product.isTrending;
      product.tags = tags ?? product.tags;

      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new review
// @route   POST /api/products/:id/reviews
// @access  Private
const createProductReview = async (req, res) => {
  const { rating, comment } = req.body;

  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      const alreadyReviewed = product.reviews.find(
        (r) => r.user.toString() === req.user._id.toString()
      );

      if (alreadyReviewed) {
        return res.status(400).json({ message: 'Product already reviewed' });
      }

      const review = {
        name: req.user.name,
        rating: Number(rating),
        comment,
        user: req.user._id
      };

      product.reviews.push(review);
      product.numReviews = product.reviews.length;
      product.rating =
        product.reviews.reduce((acc, item) => item.rating + acc, 0) /
        product.reviews.length;

      await product.save();
      res.status(201).json({ message: 'Review added' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get top rated products
// @route   GET /api/products/top
// @access  Public
const getTopProducts = async (req, res) => {
  try {
    const products = await Product.find({}).sort({ rating: -1 }).limit(4);
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get AI/personalized recommendations
// @route   GET /api/products/recommendations
// @access  Public
const getProductRecommendations = async (req, res) => {
  try {
    // Recommend based on tags or category matching
    const currentProductId = req.query.productId;
    let query = {};
    if (currentProductId) {
      const currentProduct = await Product.findById(currentProductId);
      if (currentProduct) {
        // Find products in the same category or sharing tags
        query = {
          _id: { $ne: currentProduct._id },
          $or: [
            { category: currentProduct.category },
            { tags: { $in: currentProduct.tags } }
          ]
        };
      }
    }
    
    // Fallback: high rating trending items
    const recommendations = await Product.find(query)
      .sort({ rating: -1, numReviews: -1 })
      .limit(6);
      
    res.json(recommendations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export {
  getProducts,
  getProductById,
  deleteProduct,
  createProduct,
  updateProduct,
  createProductReview,
  getTopProducts,
  getProductRecommendations
};
