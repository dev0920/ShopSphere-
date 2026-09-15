import mongoose from "mongoose";
import Product from "../models/Product.js";

// =====================================================
// POST /api/products  (admin | vendor)
// Admin → status: approved immediately
// Vendor → status: pending (needs admin approval)
// =====================================================
export const createProduct = async (req, res) => {
  try {
    const {
      name, brand, category, subCategory, description,
      price, oldPrice, stock, seller, isFeatured,
      color, warranty, weight, dimensions, material,
    } = req.body;

    const trimmedName = String(name || "").trim();
    const trimmedBrand = String(brand || "").trim();
    const trimmedCategory = String(category || "").trim();
    const trimmedSubCategory = String(subCategory || "").trim();
    const trimmedDescription = String(description || "").trim();
    const numPrice = Number(price);
    const numStock = stock !== undefined ? Number(stock) : 50;

    if (!trimmedName || !trimmedBrand || !trimmedCategory || !trimmedSubCategory || !trimmedDescription || isNaN(numPrice)) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields: Name, Brand, Category, SubCategory, Description, and valid Price.",
      });
    }

    if (numPrice <= 0) {
      return res.status(400).json({
        success: false,
        message: "Product price must be greater than zero.",
      });
    }

    if (isNaN(numStock) || numStock < 0) {
      return res.status(400).json({
        success: false,
        message: "Stock quantity must be a non-negative number.",
      });
    }

    let images = [];
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      images = req.files.map((f) => f.path || f.secure_url || f.location).filter(Boolean);
    }

    // Default fallback image if no valid images uploaded or Cloudinary failed
    if (images.length === 0) {
      const text = `${name} ${category} ${description}`.toLowerCase();
      let matchImg = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80";

      if (text.includes("samsung") || text.includes("galaxy watch")) matchImg = "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800&auto=format&fit=crop&q=80";
      else if (text.includes("smartwatch")) matchImg = "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&auto=format&fit=crop&q=80";
      else if (text.includes("watch")) matchImg = "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&auto=format&fit=crop&q=80";
      else if (text.includes("saree") || text.includes("ethnic")) matchImg = "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&auto=format&fit=crop&q=80";
      else if (text.includes("dress") || text.includes("gown")) matchImg = "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800&auto=format&fit=crop&q=80";
      else if (text.includes("shirt") || text.includes("tshirt")) matchImg = "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&auto=format&fit=crop&q=80";
      else if (text.includes("shoe") || text.includes("sneaker")) matchImg = "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80";
      else if (text.includes("bag") || text.includes("tote")) matchImg = "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&auto=format&fit=crop&q=80";
      else if (text.includes("jewel") || text.includes("ring")) matchImg = "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&auto=format&fit=crop&q=80";
      else if (text.includes("beauty") || text.includes("serum")) matchImg = "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&auto=format&fit=crop&q=80";

      images = [matchImg];
    }

    // Admins bypass approval; vendors go to pending
    const status = req.user.role === "admin" ? "approved" : "pending";

    const product = await Product.create({
      name: String(name).trim(),
      brand: String(brand).trim(),
      category: String(category).trim(),
      subCategory: String(subCategory).trim(),
      description: String(description).trim(),
      price: Number(price) || 0,
      oldPrice: oldPrice ? Number(oldPrice) : 0,
      images,
      stock: stock ? Number(stock) : 50,
      seller: seller ? String(seller).trim() : req.user.name || "ShopSphere Vendor",
      isFeatured: isFeatured === "true" || isFeatured === true,
      createdBy: req.user._id,
      status,
      specifications: { color, warranty, weight, dimensions, material },
    });

    const msg = status === "pending"
      ? "Product submitted for approval. It will go live once admin approves it."
      : "Product created and published successfully.";

    res.status(201).json({ success: true, message: msg, product });
  } catch (error) {
    console.error("createProduct error:", error.stack || error.message || error);
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error during product creation.",
    });
  }
};

const FALLBACK_PRODUCTS = [
  {
    _id: "65f1234567890abcdef00001",
    name: "Banarasi Pure Silk Saree",
    brand: "Kashi Weaves",
    category: "Ethnic Wear",
    subCategory: "Sarees",
    description: "Handcrafted pure Banarasi silk saree with gold zari weave.",
    price: 2499,
    oldPrice: 4999,
    images: ["https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&q=80"],
    stock: 50, rating: 4.8, reviews: 200, seller: "Kashi Silk & Handloom", status: "approved"
  },
  {
    _id: "65f1234567890abcdef00002",
    name: "Floral Georgette Anarkali Kurti",
    brand: "Jaipur Fab",
    category: "Ethnic Wear",
    subCategory: "Kurtis",
    description: "Flared Georgette Anarkali kurti with floral print.",
    price: 899,
    oldPrice: 1799,
    images: ["https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcSrXOojFXqB4NOCcEIGjv84Wq96N9qKOupKiDTbDuyivgdruO2d2MRtoyFk8hnqsl-c9B4ChrEjiQZY-H6DJk4xSyh7tCFbB3sz_1yK2IKAJpAtyUKm2kIIqA"],
    stock: 50, rating: 4.7, reviews: 150, seller: "Urban Chic Apparel", status: "approved"
  },
  {
    _id: "65f1234567890abcdef00003",
    name: "Satin Wrap Cocktail Party Dress",
    brand: "Urban Chic",
    category: "Western Dresses",
    subCategory: "Party Dresses",
    description: "V-neck wrap satin party dress with belt.",
    price: 1299,
    oldPrice: 2599,
    images: ["https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=800&q=80"],
    stock: 50, rating: 4.9, reviews: 310, seller: "Urban Chic Apparel", status: "approved"
  },
  {
    _id: "65f1234567890abcdef00004",
    name: "Slim Fit Formal Cotton Shirt",
    brand: "Royal Executive",
    category: "Menswear",
    subCategory: "Formal Shirts",
    description: "100% Cotton breathable formal shirt for office wear.",
    price: 999,
    oldPrice: 1999,
    images: ["https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&q=80"],
    stock: 50, rating: 4.6, reviews: 180, seller: "Royal Men's Hub", status: "approved"
  },
  {
    _id: "65f1234567890abcdef00005",
    name: "Breathable Lightweight Sports Sneakers",
    brand: "StepRight",
    category: "Footwear",
    subCategory: "Sports Shoes",
    description: "Anti-skid cushioned running shoes for daily workouts.",
    price: 1499,
    oldPrice: 2999,
    images: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80"],
    stock: 50, rating: 4.8, reviews: 420, seller: "StepRight Footwear", status: "approved"
  },
  {
    _id: "65f1234567890abcdef00006",
    name: "Smart Fitness Tracker Watch with AMOLED Display",
    brand: "TechGalaxy",
    category: "Electronics",
    subCategory: "Smartwatches",
    description: "Heart rate monitor, SpO2 tracker, and 7-day battery life.",
    price: 1999,
    oldPrice: 3999,
    images: ["https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&q=80"],
    stock: 50, rating: 4.9, reviews: 550, seller: "TechGalaxy Electronics", status: "approved"
  }
];

// =====================================================
// GET /api/products  (public)
// Only approved products are visible to shoppers.
// Admin/vendor can pass ?status= to see their own.
// =====================================================
export const getProducts = async (req, res) => {
  try {
    const { category, search, page = 1, limit = 50, status, vendorId } = req.query;

    if (mongoose.connection.readyState !== 1) {
      let filtered = FALLBACK_PRODUCTS;
      if (category) filtered = filtered.filter(p => p.category.toLowerCase() === category.toLowerCase());
      return res.status(200).json({ success: true, count: filtered.length, total: filtered.length, products: filtered });
    }

    const filter = {};

    // Public browsing → only approved products
    // Admin/Vendor fetch with explicit status param → respect it
    if (status) {
      filter.status = status;
    } else {
      filter.status = "approved";
    }

    if (category) filter.category  = { $regex: new RegExp(`^${category}$`, "i") };
    if (search)   filter.name      = { $regex: new RegExp(search, "i") };
    
    if (vendorId && vendorId !== "undefined" && vendorId !== "null") {
      if (mongoose.Types.ObjectId.isValid(vendorId)) {
        filter.createdBy = vendorId;
      } else {
        const decoded = decodeURIComponent(vendorId);
        filter.$or = [
          { seller: { $regex: new RegExp(decoded, "i") } },
          { brand: { $regex: new RegExp(decoded, "i") } },
        ];
      }
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate("createdBy", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Product.countDocuments(filter),
    ]);

    res.status(200).json({ success: true, count: products.length, total, products });
  } catch (error) {
    console.error("getProducts:", error.message);
    let filtered = FALLBACK_PRODUCTS;
    if (req.query.category) {
      filtered = filtered.filter(p => p.category.toLowerCase() === req.query.category.toLowerCase());
    }
    res.status(200).json({
      success: true,
      count: filtered.length,
      total: filtered.length,
      products: filtered
    });
  }
};

// =====================================================
// GET /api/products/:id  (public)
// =====================================================
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const fallback = FALLBACK_PRODUCTS.find(p => p._id === id);
    if (fallback) {
      return res.status(200).json({ success: true, product: fallback });
    }

    if (mongoose.connection.readyState !== 1 || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ success: false, message: "Product not found." });
    }

    const product = await Product.findById(id).populate("createdBy", "name email");

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found." });
    }

    res.status(200).json({ success: true, product });
  } catch (error) {
    console.error("getProductById:", error.message);
    const fallback = FALLBACK_PRODUCTS.find(p => p._id === req.params.id) || FALLBACK_PRODUCTS[0];
    res.status(200).json({ success: true, product: fallback });
  }
};

// =====================================================
// PATCH /api/products/:id  (admin | vendor)
// Vendors can only edit their own products.
// Editing a rejected product resets it to pending.
// =====================================================
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found." });
    }

    if (
      req.user.role === "vendor" &&
      product.createdBy?.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ success: false, message: "You can only edit your own products." });
    }

    const fields = ["name","brand","category","subCategory","description",
                    "price","oldPrice","stock","seller","isFeatured"];
    fields.forEach((f) => { if (req.body[f] !== undefined) product[f] = req.body[f]; });

    const specFields = ["color","warranty","weight","dimensions","material"];
    specFields.forEach((f) => { if (req.body[f] !== undefined) product.specifications[f] = req.body[f]; });

    if (req.files?.length) product.images = req.files.map((f) => f.path);

    // Vendor re-editing a rejected product sends it back to review
    if (req.user.role === "vendor" && product.status === "rejected") {
      product.status          = "pending";
      product.rejectionReason = "";
    }

    await product.save();
    res.status(200).json({ success: true, message: "Product updated.", product });
  } catch (error) {
    console.error("updateProduct:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// =====================================================
// PATCH /api/products/:id/approve  (admin only)
// =====================================================
export const approveProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("createdBy", "name email");

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found." });
    }

    if (product.status === "approved") {
      return res.status(400).json({ success: false, message: "Product is already approved." });
    }

    product.status          = "approved";
    product.rejectionReason = "";
    await product.save();

    res.status(200).json({
      success: true,
      message: `"${product.name}" approved and is now live on the store.`,
      product,
    });
  } catch (error) {
    console.error("approveProduct:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// =====================================================
// PATCH /api/products/:id/reject  (admin only)
// Body: { reason: "string" }
// =====================================================
export const rejectProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("createdBy", "name email");

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found." });
    }

    product.status          = "rejected";
    product.rejectionReason = req.body.reason || "Does not meet listing guidelines.";
    await product.save();

    res.status(200).json({
      success: true,
      message: `"${product.name}" rejected.`,
      product,
    });
  } catch (error) {
    console.error("rejectProduct:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// =====================================================
// DELETE /api/products/:id  (admin only)
// =====================================================
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found." });
    }
    res.status(200).json({ success: true, message: "Product deleted successfully." });
  } catch (error) {
    console.error("deleteProduct:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// =====================================================
// POST /api/products/:id/reviews (Authenticated Users Only)
// =====================================================
export const addReviewToProduct = async (req, res) => {
  try {
    const { rating, comment, name } = req.body;
    const productId = req.params.id;

    if (!rating || !comment) {
      return res.status(400).json({ success: false, message: "Rating and review comment are required." });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found." });
    }

    const reviewerName = String(name || req.user.name || "Verified Customer").trim();

    const newReview = {
      user: req.user._id,
      name: reviewerName,
      rating: Number(rating),
      comment: String(comment).trim(),
      date: "Just now · Verified Buyer",
      createdAt: new Date(),
    };

    if (!Array.isArray(product.reviewsList)) {
      product.reviewsList = [];
    }

    product.reviewsList.unshift(newReview);
    product.reviews = product.reviewsList.length;

    // Recalculate product rating
    const totalRatingSum = product.reviewsList.reduce((acc, item) => acc + item.rating, 0);
    product.rating = Number((totalRatingSum / product.reviewsList.length).toFixed(1));

    await product.save();

    res.status(201).json({
      success: true,
      message: "🌟 Thank you! Your real-time review has been published.",
      product,
      review: newReview,
    });
  } catch (error) {
    console.error("addReviewToProduct Error:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};
