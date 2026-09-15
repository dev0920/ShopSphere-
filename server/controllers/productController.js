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
    "_id": "65f1234567890abcdef00001",
    "name": "Banarasi Pure Silk Saree",
    "brand": "Kashi Weaves",
    "category": "Ethnic Wear",
    "subCategory": "Sarees",
    "description": "Handcrafted pure Banarasi silk saree with gold zari weave.",
    "price": 2499,
    "oldPrice": 4999,
    "images": [
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&q=80"
    ],
    "stock": 50,
    "rating": 4.8,
    "reviews": 180,
    "seller": "Kashi Silk & Handloom",
    "status": "approved"
  },
  {
    "_id": "65f1234567890abcdef00002",
    "name": "Floral Georgette Anarkali Kurti",
    "brand": "Jaipur Fab",
    "category": "Ethnic Wear",
    "subCategory": "Kurtis",
    "description": "Flared Georgette Anarkali kurti with floral print.",
    "price": 899,
    "oldPrice": 1799,
    "images": [
      "https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcSrXOojFXqB4NOCcEIGjv84Wq96N9qKOupKiDTbDuyivgdruO2d2MRtoyFk8hnqsl-c9B4ChrEjiQZY-H6DJk4xSyh7tCFbB3sz_1yK2IKAJpAtyUKm2kIIqA"
    ],
    "stock": 50,
    "rating": 4.8,
    "reviews": 187,
    "seller": "Kashi Silk & Handloom",
    "status": "approved"
  },
  {
    "_id": "65f1234567890abcdef00003",
    "name": "Art Silk Kurti & Pant Set",
    "brand": "Kashi Weaves",
    "category": "Ethnic Wear",
    "subCategory": "Kurti Sets",
    "description": "2-piece silk straight kurti and trouser set.",
    "price": 1499,
    "oldPrice": 2999,
    "images": [
      "https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcT-X52RpBXSOQfkHXoX4r1nIl0Ansf2RCqJFT6TX1aYV20Q3AAA7aZfp-KyEIZISt_uJj0xFZcKVOLMKHKbA3vEEDLBMPFlU1Lvb2jCqbeaINbOPJiDL9zPbA"
    ],
    "stock": 50,
    "rating": 4.8,
    "reviews": 194,
    "seller": "Kashi Silk & Handloom",
    "status": "approved"
  },
  {
    "_id": "65f1234567890abcdef00004",
    "name": "Heavy Bridal Velvet Lehenga",
    "brand": "Rajwada Bridal",
    "category": "Ethnic Wear",
    "subCategory": "Lehengas",
    "description": "Heavy velvet bridal lehenga set with dupatta.",
    "price": 4999,
    "oldPrice": 9999,
    "images": [
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSvcD9c7eg-J47a0DzxFrMk2g1C9ag2rVzIhfDokxAPuw&s=10"
    ],
    "stock": 50,
    "rating": 4.8,
    "reviews": 201,
    "seller": "Kashi Silk & Handloom",
    "status": "approved"
  },
  {
    "_id": "65f1234567890abcdef00005",
    "name": "Phulkari Punjabi Salwar Suit Set",
    "brand": "Bengal Handloom",
    "category": "Ethnic Wear",
    "subCategory": "Suit Sets",
    "description": "Traditional Punjabi suit set with Phulkari embroidery.",
    "price": 1299,
    "oldPrice": 2599,
    "images": [
      "https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcS6ZYcG3dbobHGNcnwFq3hPEa43UmwGP7XVDmJethrpaNNcIrAJwMjFS2j1kxiVxVeCSbvzCO95uDzXn1ReAn-1aKDAIg4UUg"
    ],
    "stock": 50,
    "rating": 4.8,
    "reviews": 208,
    "seller": "Kashi Silk & Handloom",
    "status": "approved"
  },
  {
    "_id": "65f1234567890abcdef00006",
    "name": "Cotton Kurti Pant & Bandhani Dupatta Set",
    "brand": "Kashi Weaves",
    "category": "Ethnic Wear",
    "subCategory": "Dupatta Sets",
    "description": "Cotton kurti pant set with tie-dye Bandhani silk dupatta.",
    "price": 1399,
    "oldPrice": 2799,
    "images": [
      "https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcRqOeuzCERIawOBZN8kqtir1SZNjADaRWLORCxdpyb-_Pyk6tlh4UaT0g1cdrlHcUUu_-NR7dja-OeOmsxPXNKS8ixCqaHjFD23CJjn-y5NbWfDH7eAUX_N5A"
    ],
    "stock": 50,
    "rating": 4.8,
    "reviews": 215,
    "seller": "Kashi Silk & Handloom",
    "status": "approved"
  },
  {
    "_id": "65f1234567890abcdef00007",
    "name": "Floral Wrap Chiffon Midi Dress",
    "brand": "Zara Style",
    "category": "Western Dresses",
    "subCategory": "Midi Dresses",
    "description": "Floral printed wrap midi dress with V-neckline.",
    "price": 999,
    "oldPrice": 1999,
    "images": [
      "https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcQbzTgHfgbb7_C6ETwUD08HuR24BDnGc5OLChdI4MqWSv_C6yYLN7mj_RjihF5Lk0pYHQSVDN1mtd8wWvpxi_-HLLmHTzYn53e1a01WgPk"
    ],
    "stock": 50,
    "rating": 4.8,
    "reviews": 222,
    "seller": "Urban Chic Apparel",
    "status": "approved"
  },
  {
    "_id": "65f1234567890abcdef00008",
    "name": "Strapless Satin Party Dress",
    "brand": "Club Chic",
    "category": "Western Dresses",
    "subCategory": "Party Dresses",
    "description": "Bodycon strapless evening satin party dress.",
    "price": 1299,
    "oldPrice": 2599,
    "images": [
      "https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcRgy3tEiOzrr81uNkYYGmYgmxU0Uq2Xi_XUWm1ows35Wb2ECipiUNcMSBkZbnSTvsPeR8N5cJYaLX1kflz1NYe_2_Nk9YNxT-PNRNDl53aTzpfN8WoyjqtnCkI"
    ],
    "stock": 50,
    "rating": 4.8,
    "reviews": 229,
    "seller": "Urban Chic Apparel",
    "status": "approved"
  },
  {
    "_id": "65f1234567890abcdef00009",
    "name": "Off-Shoulder Boho Chiffon Maxi Dress",
    "brand": "Free Spirit",
    "category": "Western Dresses",
    "subCategory": "Maxi Dresses",
    "description": "Boho off-shoulder maxi dress with smocked waist.",
    "price": 1199,
    "oldPrice": 2399,
    "images": [
      "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRWkRC2JjOmmaP2Eul6I7UNtuTciCHPWkBGuLkkaNpMpyvpv8xlPMsqS2TiBx--KYKTOBib-bDwfvc1Iitd1N40ZDXlalnqktsj9-RuIKEtoLDnBH9VtNwu9J4"
    ],
    "stock": 50,
    "rating": 4.8,
    "reviews": 236,
    "seller": "Urban Chic Apparel",
    "status": "approved"
  },
  {
    "_id": "65f1234567890abcdef0000a",
    "name": "Cotton Button Down Shirt Dress",
    "brand": "Urban Chic",
    "category": "Western Dresses",
    "subCategory": "Shirt Dresses",
    "description": "Casual button down cotton shirt dress with belt.",
    "price": 899,
    "oldPrice": 1799,
    "images": [
      "https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcQP9pwMkHd_jpnn5HMc2HKlruqedtyrGPR7XrWy1MwR-EPYrPd1WuDEx1ewVi-mzItqa4rafl-IYsG1bBurm7N9UxvAcjcVVRI2DDF53I65Ymct556hC3deGA"
    ],
    "stock": 50,
    "rating": 4.8,
    "reviews": 243,
    "seller": "Urban Chic Apparel",
    "status": "approved"
  },
  {
    "_id": "65f1234567890abcdef0000b",
    "name": "A-Line Summer Cotton Dress",
    "brand": "Mango Style",
    "category": "Western Dresses",
    "subCategory": "Casual Dresses",
    "description": "Breezy daily casual summer cotton dress.",
    "price": 799,
    "oldPrice": 1599,
    "images": [
      "https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcQvZGLAeS-U2n1bKwAVarhhEKAxQtFpGIT4gWmHdLuKGzX8P0Ys_h1yXECUNmWMdovkvwaej3NQ_WuV63nW8CnVadPKRyWtAXFttKYmdKsPE0awTcyDrekrFA"
    ],
    "stock": 50,
    "rating": 4.8,
    "reviews": 250,
    "seller": "Urban Chic Apparel",
    "status": "approved"
  },
  {
    "_id": "65f1234567890abcdef0000c",
    "name": "Ribbed Bodycon Mini Dress",
    "brand": "Forever 21",
    "category": "Western Dresses",
    "subCategory": "Mini Dresses",
    "description": "Stretch ribbed knit sleeveless mini dress.",
    "price": 699,
    "oldPrice": 1399,
    "images": [
      "https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcQhzRMr1hIkFKqq1yaRq9WJ_qyAYKsJ42idekLhSks22_T3GyWJ1KBZC5bLnZSiYrkEhMJZVLOAvTQ98Hg5yMcbgzPRiFi9Bhx5MvMhuNh9dn_3pL2_INIG0g"
    ],
    "stock": 50,
    "rating": 4.8,
    "reviews": 257,
    "seller": "Urban Chic Apparel",
    "status": "approved"
  },
  {
    "_id": "65f1234567890abcdef0000d",
    "name": "Wide Leg Belted Linen Jumpsuit",
    "brand": "Zara Style",
    "category": "Western Dresses",
    "subCategory": "Jumpsuits",
    "description": "Sophisticated wide-leg linen jumpsuit with waist belt.",
    "price": 1399,
    "oldPrice": 2799,
    "images": [
      "https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcTVYhXueSOCUQyTJZrYmEeAOPi4tyuDbrdJutMyd3dHTW7KSu2EfbdDrNXcZ5YeXEZqSfL42zkN0KMkrgoarH20tDyNj7zwnHlc98jT5Rs"
    ],
    "stock": 50,
    "rating": 4.8,
    "reviews": 264,
    "seller": "Urban Chic Apparel",
    "status": "approved"
  },
  {
    "_id": "65f1234567890abcdef0000e",
    "name": "Printed Crop Top & Skirt Co-ord Set",
    "brand": "Urban Chic",
    "category": "Western Dresses",
    "subCategory": "Co-ord Sets",
    "description": "Matching 2-piece printed crop top and midi skirt.",
    "price": 1199,
    "oldPrice": 2399,
    "images": [
      "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcTMs3D50hlWVDlkaXPCqBGI6bxO0O99NQpQuA4Mz2zrKtFUgvD0ZBcVqe0eWu0UIirbTdg-8RNG7ssawnEe4CMoHKeuFxFhAMnhMLC-CkMWzOrCoKqO_eolt7g"
    ],
    "stock": 50,
    "rating": 4.8,
    "reviews": 271,
    "seller": "Urban Chic Apparel",
    "status": "approved"
  },
  {
    "_id": "65f1234567890abcdef0000f",
    "name": "Slim Fit Oxford Formal Shirt",
    "brand": "Peter England",
    "category": "Menswear",
    "subCategory": "Formal Shirts",
    "description": "100% Oxford cotton formal button-down shirt.",
    "price": 799,
    "oldPrice": 1599,
    "images": [
      "https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcQ4U1kUX2vlIs4BGqLH0YDqUF5NtS6esljQVjF7LSEGCletki7gW3Z5RvzhEhHIeTYFcq8lyiAaOWbe1QxyGC0tUml2YhtraTIQIv_g2uYHAx3Afan59L5m0w"
    ],
    "stock": 50,
    "rating": 4.8,
    "reviews": 278,
    "seller": "Royal Men's Hub",
    "status": "approved"
  },
  {
    "_id": "65f1234567890abcdef00010",
    "name": "Linen Printed Casual Shirt",
    "brand": "Arrow",
    "category": "Menswear",
    "subCategory": "Casual Shirts",
    "description": "Breathable linen casual short sleeve printed shirt.",
    "price": 699,
    "oldPrice": 1399,
    "images": [
      "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcSESfnyQH5cRHRaIFYO07jKTkBwyGC1_-lIORQIghzO3oOG6lNquWoS1PdT6k_OdalE_bAzXu-l0pO7MzhUYnF6UTjzY2xFksHQ6aBaowlGRPMTegZwqSVq5w"
    ],
    "stock": 50,
    "rating": 4.8,
    "reviews": 285,
    "seller": "Royal Men's Hub",
    "status": "approved"
  },
  {
    "_id": "65f1234567890abcdef00011",
    "name": "Slim Fit Dark Wash Denim Jeans",
    "brand": "Levi's Style",
    "category": "Menswear",
    "subCategory": "Jeans",
    "description": "Stretch denim dark wash slim leg jeans.",
    "price": 1199,
    "oldPrice": 2399,
    "images": [
      "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcQgQdgB6FWa6nzQAe5S0IbSXfUlI13RFqpAHoicUmSEWelkAjtuFuSImHFoNtkPizXYKb4rQ_dUF688ZyK0pgZnYyK2Wj-QgOVEQczfrTTIBuC_CqQfS__s"
    ],
    "stock": 50,
    "rating": 4.8,
    "reviews": 292,
    "seller": "Royal Men's Hub",
    "status": "approved"
  },
  {
    "_id": "65f1234567890abcdef00012",
    "name": "Slim Fit Chino Formal Trousers",
    "brand": "Dockers",
    "category": "Menswear",
    "subCategory": "Trousers",
    "description": "Flat-front cotton stretch formal chino trousers.",
    "price": 999,
    "oldPrice": 1999,
    "images": [
      "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcQgQdgB6FWa6nzQAe5S0IbSXfUlI13RFqpAHoicUmSEWelkAjtuFuSImHFoNtkPizXYKb4rQ_dUF688ZyK0pgZnYyK2Wj-QgOVEQczfrTTIBuC_CqQfS__s"
    ],
    "stock": 50,
    "rating": 4.8,
    "reviews": 299,
    "seller": "Royal Men's Hub",
    "status": "approved"
  },
  {
    "_id": "65f1234567890abcdef00013",
    "name": "Pique Cotton Navy Polo T-Shirt",
    "brand": "Lacoste Style",
    "category": "Menswear",
    "subCategory": "T-Shirts",
    "description": "Classic pique cotton polo t-shirt with ribbed collar.",
    "price": 599,
    "oldPrice": 1199,
    "images": [
      "https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcRlElqEQi2bBDPHlS3TOFFudHCo37HBWREvLhmoymcRNaslhl1GEwShHYXUdAGEndu5BLTj6cfDLJNlgfRYLMpydgGJkXeCi4sWsUIw5kk"
    ],
    "stock": 50,
    "rating": 4.8,
    "reviews": 306,
    "seller": "Royal Men's Hub",
    "status": "approved"
  },
  {
    "_id": "65f1234567890abcdef00014",
    "name": "Cotton Silk Jacquard Short Kurta",
    "brand": "Manyavar Style",
    "category": "Menswear",
    "subCategory": "Ethnic Kurta",
    "description": "Men's festive jacquard print short kurta.",
    "price": 899,
    "oldPrice": 1799,
    "images": [
      "https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcTP45b1lkrep-nXIZN9kXDv8A5L70LAt62V3dUeOag0s9YNevI1pkURGskyoi9WtIWqnji0rMkei8GY7__C9zilKoGrw97RludsiVChEiw0q90sYkp623K8"
    ],
    "stock": 50,
    "rating": 4.8,
    "reviews": 313,
    "seller": "Royal Men's Hub",
    "status": "approved"
  },
  {
    "_id": "65f1234567890abcdef00015",
    "name": "Fleece Hooded Casual Sweatshirt",
    "brand": "HRX Style",
    "category": "Menswear",
    "subCategory": "Sweatshirts",
    "description": "Warm fleece drawstring hooded sweatshirt.",
    "price": 799,
    "oldPrice": 1599,
    "images": [
      "https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcRKolA5ek2JUFUFQAmyqNzW5o_2Nco_E1Bk41qjbelWNvxapbfMiTvKrt26qLZCb8GFDEc-cBybyhsqRSU4IkTRlJYl2DmFyyyRY2N9WMk"
    ],
    "stock": 50,
    "rating": 4.8,
    "reviews": 320,
    "seller": "Royal Men's Hub",
    "status": "approved"
  },
  {
    "_id": "65f1234567890abcdef00016",
    "name": "Checked Wool Blend Slim Blazer",
    "brand": "Raymond Style",
    "category": "Menswear",
    "subCategory": "Blazers",
    "description": "Tailored checked wool blend formal blazer.",
    "price": 2499,
    "oldPrice": 4999,
    "images": [
      "https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcTBwffk61RcuslmkcVyX_tYTcitj7C1kTX9N1L38md_GmtTKeyKgfryIU0vTh02UO9RRbCktHrTzzGCpoWs1g6JFozwq5gcgOgndNSCjZ7e0r566GvAahlrhLM"
    ],
    "stock": 50,
    "rating": 4.8,
    "reviews": 327,
    "seller": "Royal Men's Hub",
    "status": "approved"
  },
  {
    "_id": "65f1234567890abcdef00017",
    "name": "Distressed Biker Denim Jacket",
    "brand": "Roadster",
    "category": "Menswear",
    "subCategory": "Jackets",
    "description": "Classic button-up denim biker jacket.",
    "price": 1499,
    "oldPrice": 2999,
    "images": [
      "https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcSWtTsb0LZ8nd23ePzdgkvzi1chllXv__kx0fG9btMkKtL8Yy_IEeBn4GHfUgy8IWN0edZwfKA9kJguLpbhkOBIPVK6iMxp2CsWYR55jGBr7TUHuiZJQ6Ta"
    ],
    "stock": 50,
    "rating": 4.8,
    "reviews": 334,
    "seller": "Royal Men's Hub",
    "status": "approved"
  },
  {
    "_id": "65f1234567890abcdef00018",
    "name": "Silk Indo-Western Wedding Sherwani Set",
    "brand": "Manyavar",
    "category": "Menswear",
    "subCategory": "Sherwani",
    "description": "Heavy embroidered silk wedding sherwani with churidar.",
    "price": 4999,
    "oldPrice": 9999,
    "images": [
      "https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcQPAlp0K84IteAtpHVxTBI1XOqVug7QGYXR3llIn7FFO3MHZvX_ZQQu382QSvHIx_DJeIgyshS_4FMgF2xK6wkBeJ-VwM-nJA3mgR9_5tLNToXuJLrldes-0ss"
    ],
    "stock": 50,
    "rating": 4.8,
    "reviews": 341,
    "seller": "Royal Men's Hub",
    "status": "approved"
  },
  {
    "_id": "65f1234567890abcdef00019",
    "name": "Mesh Athletic Running Shoes",
    "brand": "Nike Style",
    "category": "Footwear",
    "subCategory": "Sports Shoes",
    "description": "Lightweight mesh running shoes with rubber sole.",
    "price": 1499,
    "oldPrice": 2999,
    "images": [
      "https://images.meesho.com/images/products/444955635/dzofw_512.avif?width=512"
    ],
    "stock": 50,
    "rating": 4.8,
    "reviews": 348,
    "seller": "StepRight Footwear",
    "status": "approved"
  },
  {
    "_id": "65f1234567890abcdef0001a",
    "name": "Tan Synthetic Leather Block Heels",
    "brand": "Catwalk",
    "category": "Footwear",
    "subCategory": "Heels",
    "description": "2.5-inch block heel sandals with cushioned sole.",
    "price": 999,
    "oldPrice": 1999,
    "images": [
      "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcTKjR5M8wp_lZWNX7WPwFwSt4BqfoQrdk67wgIeLfgnr_jeTEnOlCK2tog7amaFmlCDGipS08x6LGSJvzBnV5grEgU8lfSW9uLU1c0rDM7Zv0atg-Q8RmgCZ6c"
    ],
    "stock": 50,
    "rating": 4.8,
    "reviews": 355,
    "seller": "StepRight Footwear",
    "status": "approved"
  },
  {
    "_id": "65f1234567890abcdef0001b",
    "name": "Black Genuine Leather Oxford Shoes",
    "brand": "Red Tape",
    "category": "Footwear",
    "subCategory": "Formal Shoes",
    "description": "Lace-up genuine leather Oxford formal shoes.",
    "price": 1799,
    "oldPrice": 3599,
    "images": [
      "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcSr47zzgp25GeyntVR-QlZ-4iu3hRexMXRSQpSpuQkFtOc3AJLWNamgACO997gvX1nif-OQ_uPv1M59421EHrCYhPVwnH-Jrg"
    ],
    "stock": 50,
    "rating": 4.8,
    "reviews": 362,
    "seller": "StepRight Footwear",
    "status": "approved"
  },
  {
    "_id": "65f1234567890abcdef0001c",
    "name": "Handcrafted Jutti Mojari Sandals",
    "brand": "Rajasthani Crafts",
    "category": "Footwear",
    "subCategory": "Ethnic Footwear",
    "description": "Traditional embroidered Punjabi jutti mojari.",
    "price": 699,
    "oldPrice": 1399,
    "images": [
      "https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcRmpnQHDpE2YvnoMplWQLMaGViP6W3qudoiqIJ0lpP05TiM0rpl62hEcjDv9nhknOXhmeLDxlFWn8B4NM7FZMoBktLGjUYe9mRGpf4k10PXbejntd6IUJep"
    ],
    "stock": 50,
    "rating": 4.8,
    "reviews": 369,
    "seller": "StepRight Footwear",
    "status": "approved"
  },
  {
    "_id": "65f1234567890abcdef0001d",
    "name": "White Canvas Lace-up Sneakers",
    "brand": "Puma Style",
    "category": "Footwear",
    "subCategory": "Casual Shoes",
    "description": "Daily casual white canvas sneakers.",
    "price": 899,
    "oldPrice": 1799,
    "images": [
      "https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcTNWxPQVMEd0okq5Z_RzEhB8_Qw6JZRhdt7qD8s3p7lBwigjNTS1ojueoZ1p5U6rDAP5SwYz7wCW6lL8BS2roWUvjZATixKgw"
    ],
    "stock": 50,
    "rating": 4.8,
    "reviews": 376,
    "seller": "StepRight Footwear",
    "status": "approved"
  },
  {
    "_id": "65f1234567890abcdef0001e",
    "name": "Strappy Synthetic Leather Flat Sandals",
    "brand": "Bata",
    "category": "Footwear",
    "subCategory": "Flats",
    "description": "Open toe comfortable daily flat sandals.",
    "price": 499,
    "oldPrice": 999,
    "images": [
      "https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcQZjnmiOAbJSBrWdbGBZnGxvC9OgClzJTnwDPK7Jnom2Nc_ky8azv5tYjKYbJ57E6fvcH5BYyBFH3vqbvl1G3U4OBlwsBw0LVuRNXZNJFgw"
    ],
    "stock": 50,
    "rating": 4.8,
    "reviews": 383,
    "seller": "StepRight Footwear",
    "status": "approved"
  },
  {
    "_id": "65f1234567890abcdef0001f",
    "name": "Ankle Length Leather Chelsea Boots",
    "brand": "Woodland Style",
    "category": "Footwear",
    "subCategory": "Boots",
    "description": "Rugged genuine leather Chelsea ankle boots.",
    "price": 2199,
    "oldPrice": 4399,
    "images": [
      "https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcTxq-YEPUx2pM2uu1byo6CcsX8h4f06momXTxbMbpYLQMf8q2hfCaChMS60gCV0XMLVfkKSNmMCIH-zp_mnQ6uJ2Kojf2beiUZS7_P5dl3VizLTCZwoRR4FVA"
    ],
    "stock": 50,
    "rating": 4.8,
    "reviews": 390,
    "seller": "StepRight Footwear",
    "status": "approved"
  },
  {
    "_id": "65f1234567890abcdef00020",
    "name": "Macrame Boho Wall Hanging Tapestry",
    "brand": "Artisan Home",
    "category": "Home Decor",
    "subCategory": "Wall Decor",
    "description": "Handmade cotton macrame wall hanging tapestry.",
    "price": 799,
    "oldPrice": 1599,
    "images": [
      "https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcQDcKa1dkchnCp_E6l1EGcOcDIImOzFyTAArsQk46NiXUKjOWAYlE79quSk2xRpWuT3N_nh8bIl6TB_dgtUJhtsWHx1Pr2fqUWbFU89Qn4"
    ],
    "stock": 50,
    "rating": 4.8,
    "reviews": 397,
    "seller": "TechGalaxy Electronics",
    "status": "approved"
  },
  {
    "_id": "65f1234567890abcdef00021",
    "name": "Velvet Embroidered Cushion Covers Pack of 2",
    "brand": "Home Centre",
    "category": "Home Decor",
    "subCategory": "Cushions & Pillows",
    "description": "Soft velvet square cushion covers.",
    "price": 499,
    "oldPrice": 999,
    "images": [
      "https://cdn.vaaree.com/catalog/assets/ast_7a02ecc8b9d24320b6d79631538ef3c1/variants/product_gallery_640x640_webp.webp"
    ],
    "stock": 50,
    "rating": 4.8,
    "reviews": 404,
    "seller": "TechGalaxy Electronics",
    "status": "approved"
  },
  {
    "_id": "65f1234567890abcdef00022",
    "name": "Non-Stick Granite Cookware Set 3 Pcs",
    "brand": "Prestige",
    "category": "Home Decor",
    "subCategory": "Cookware",
    "description": "Induction friendly non-stick granite pan set.",
    "price": 1499,
    "oldPrice": 2999,
    "images": [
      "https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcQXErVQP5HDkWRaDXtdphUZODdzqPKyHbEIfGLo72g8WYbjJc2F4CgqbDDTF54ftinfzLg1Pxg0W1u4F_EidL3VXkDZBvvh0w"
    ],
    "stock": 50,
    "rating": 4.8,
    "reviews": 411,
    "seller": "TechGalaxy Electronics",
    "status": "approved"
  },
  {
    "_id": "65f1234567890abcdef00023",
    "name": "Cotton King Size Double Bedsheet",
    "brand": "Bombay Dyeing",
    "category": "Home Decor",
    "subCategory": "Bedding",
    "description": "100% cotton double bedsheet with 2 pillow covers.",
    "price": 899,
    "oldPrice": 1799,
    "images": [
      "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcSrd0atKMps0WB8ZlVw266x09Kdx8u247Z4j465GxDhBsOiGtuSNv7gBG736HEsOjE3U5JUAwGiUL83j0d89MXx46eWbe5ErNXgulh535k"
    ],
    "stock": 50,
    "rating": 4.8,
    "reviews": 418,
    "seller": "TechGalaxy Electronics",
    "status": "approved"
  },
  {
    "_id": "65f1234567890abcdef00024",
    "name": "Nordic Wooden Tripod Floor Lamp",
    "brand": "Decor Studio",
    "category": "Home Decor",
    "subCategory": "Lighting",
    "description": "Modern wooden tripod floor lamp with linen shade.",
    "price": 1999,
    "oldPrice": 3999,
    "images": [
      "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRo0KIB0qvz6bHAnbcZupws8Po-wO4J_bCzDRpiRSrb-5dCAsW1It3S1ACsDliHN3B9L_k5ksRj-y3rmonmnEzwqwSIETS_g9Sru-vultEe"
    ],
    "stock": 50,
    "rating": 4.8,
    "reviews": 425,
    "seller": "TechGalaxy Electronics",
    "status": "approved"
  },
  {
    "_id": "65f1234567890abcdef00025",
    "name": "Ceramic Indoor Tabletop Planter Pot",
    "brand": "Gardenia",
    "category": "Home Decor",
    "subCategory": "Planters",
    "description": "Handcrafted ceramic planter pot for indoor succulents and houseplants.",
    "price": 499,
    "oldPrice": 999,
    "images": [
      "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRZ6bn7UZWe-JdEvkz82hR3R2H1c8Hd7czdOBbQpV-c9kXNTvFJnBy_knC8ZW9SZqSBpmKAJUuwwkWFTvFHsjYFb6LYHRJm2g2N55OD1Og"
    ],
    "stock": 50,
    "rating": 4.8,
    "reviews": 432,
    "seller": "TechGalaxy Electronics",
    "status": "approved"
  },
  {
    "_id": "65f1234567890abcdef00026",
    "name": "Bohemian Woven Area Floor Rug",
    "brand": "Carpeto",
    "category": "Home Decor",
    "subCategory": "Rugs & Carpets",
    "description": "Soft woven bohemian geometrical cotton floor area rug.",
    "price": 1499,
    "oldPrice": 2999,
    "images": [
      "https://www.obeetee.in/cdn/shop/files/1_301e5471-b075-4b3d-aeb5-432d488c5315.jpg?v=1756800249&width=1200"
    ],
    "stock": 50,
    "rating": 4.8,
    "reviews": 439,
    "seller": "TechGalaxy Electronics",
    "status": "approved"
  },
  {
    "_id": "65f1234567890abcdef00027",
    "name": "Aromatherapy Scented Soy Wax Candle Jar",
    "brand": "Iris Fragrance",
    "category": "Home Decor",
    "subCategory": "Candles & Fragrance",
    "description": "Organic lavender scented glass jar soy wax candle.",
    "price": 399,
    "oldPrice": 799,
    "images": [
      "https://m.media-amazon.com/images/I/81HSydTuXVL.jpg"
    ],
    "stock": 50,
    "rating": 4.8,
    "reviews": 446,
    "seller": "TechGalaxy Electronics",
    "status": "approved"
  },
  {
    "_id": "65f1234567890abcdef00028",
    "name": "Handwoven Cotton Rope Storage Basket",
    "brand": "OrganiseIt",
    "category": "Home Decor",
    "subCategory": "Storage",
    "description": "Multi-purpose handwoven cotton rope storage basket organizer.",
    "price": 699,
    "oldPrice": 1399,
    "images": [
      "https://www.obeetee.in/cdn/shop/files/1_301e5471-b075-4b3d-aeb5-432d488c5315.jpg?v=1756800249&width=1200"
    ],
    "stock": 50,
    "rating": 4.8,
    "reviews": 453,
    "seller": "TechGalaxy Electronics",
    "status": "approved"
  },
  {
    "_id": "65f1234567890abcdef00029",
    "name": "Vitamin C 10% Glow Serum 30ml",
    "brand": "Minimalist",
    "category": "Beauty",
    "subCategory": "Serums",
    "description": "Vitamin C face serum for glowing radiant skin.",
    "price": 599,
    "oldPrice": 999,
    "images": [
      "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&q=80"
    ],
    "stock": 50,
    "rating": 4.8,
    "reviews": 460,
    "seller": "Urban Chic Apparel",
    "status": "approved"
  },
  {
    "_id": "65f1234567890abcdef0002a",
    "name": "Matte Liquid Lipstick Longwear",
    "brand": "Maybelline",
    "category": "Beauty",
    "subCategory": "Lip Makeup",
    "description": "16-hour longwear matte liquid lipstick.",
    "price": 399,
    "oldPrice": 699,
    "images": [
      "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&q=80"
    ],
    "stock": 50,
    "rating": 4.8,
    "reviews": 467,
    "seller": "Urban Chic Apparel",
    "status": "approved"
  },
  {
    "_id": "65f1234567890abcdef0002b",
    "name": "Hyaluronic Acid Oil-Free Gel Moisturiser",
    "brand": "Neutrogena",
    "category": "Beauty",
    "subCategory": "Moisturisers",
    "description": "Hydrating oil-free water gel moisturizer.",
    "price": 499,
    "oldPrice": 899,
    "images": [
      "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&q=80"
    ],
    "stock": 50,
    "rating": 4.8,
    "reviews": 474,
    "seller": "Urban Chic Apparel",
    "status": "approved"
  },
  {
    "_id": "65f1234567890abcdef0002c",
    "name": "Active Noise Cancelling Headphones",
    "brand": "Sony Style",
    "category": "Electronics",
    "subCategory": "Wireless Headphones",
    "description": "Over-ear bluetooth headphones with 30-hour playback.",
    "price": 3499,
    "oldPrice": 6999,
    "images": [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80"
    ],
    "stock": 50,
    "rating": 4.8,
    "reviews": 181,
    "seller": "TechGalaxy Electronics",
    "status": "approved"
  },
  {
    "_id": "65f1234567890abcdef0002d",
    "name": "Ultra Slim Core i5 Aluminum Laptop",
    "brand": "Asus Style",
    "category": "Electronics",
    "subCategory": "Laptops",
    "description": "Intel Core i5 laptop with 16GB RAM & 512GB SSD.",
    "price": 42999,
    "oldPrice": 59999,
    "images": [
      "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80"
    ],
    "stock": 50,
    "rating": 4.8,
    "reviews": 188,
    "seller": "TechGalaxy Electronics",
    "status": "approved"
  },
  {
    "_id": "65f1234567890abcdef0002e",
    "name": "Full Screen Calling Smartwatch SpO2",
    "brand": "Noise Style",
    "category": "Electronics",
    "subCategory": "Smartwatches",
    "description": "Smartwatch with bluetooth calling and health sensors.",
    "price": 2199,
    "oldPrice": 4399,
    "images": [
      "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800&q=80"
    ],
    "stock": 50,
    "rating": 4.8,
    "reviews": 195,
    "seller": "TechGalaxy Electronics",
    "status": "approved"
  },
  {
    "_id": "65f1234567890abcdef0002f",
    "name": "Polarized Aviator Gold Sunglasses",
    "brand": "Ray-Ban Style",
    "category": "Accessories",
    "subCategory": "Sunglasses",
    "description": "Gold aviator sunglasses with polarized lenses.",
    "price": 899,
    "oldPrice": 1799,
    "images": [
      "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&q=80"
    ],
    "stock": 50,
    "rating": 4.8,
    "reviews": 202,
    "seller": "Urban Chic Apparel",
    "status": "approved"
  },
  {
    "_id": "65f1234567890abcdef00030",
    "name": "Genuine Leather RFID Bifold Wallet",
    "brand": "Wildhorn",
    "category": "Accessories",
    "subCategory": "Wallets & Belts",
    "description": "Handcrafted leather bifold wallet with RFID shield.",
    "price": 599,
    "oldPrice": 1199,
    "images": [
      "https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&q=80"
    ],
    "stock": 50,
    "rating": 4.8,
    "reviews": 209,
    "seller": "Urban Chic Apparel",
    "status": "approved"
  },
  {
    "_id": "65f1234567890abcdef00031",
    "name": "India Gate Royal Basmati Rice 5kg",
    "brand": "India Gate",
    "category": "Grocery",
    "subCategory": "Rice & Grains",
    "description": "Aged long grain premium Basmati rice.",
    "price": 549,
    "oldPrice": 799,
    "images": [
      "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&q=80"
    ],
    "stock": 50,
    "rating": 4.8,
    "reviews": 216,
    "seller": "TechGalaxy Electronics",
    "status": "approved"
  },
  {
    "_id": "65f1234567890abcdef00032",
    "name": "Wooden 50-Piece Building Blocks Set",
    "brand": "Fisher-Price",
    "category": "Kids & Toys",
    "subCategory": "Educational Toys",
    "description": "Organic wooden rainbow building block set.",
    "price": 799,
    "oldPrice": 1599,
    "images": [
      "https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=800&q=80"
    ],
    "stock": 50,
    "rating": 4.8,
    "reviews": 223,
    "seller": "StepRight Footwear",
    "status": "approved"
  },
  {
    "_id": "65f1234567890abcdef00033",
    "name": "6mm Extra Thick TPE Yoga Mat",
    "brand": "Boldfit",
    "category": "Sports & Fitness",
    "subCategory": "Yoga Mats",
    "description": "Anti-slip eco TPE foam yoga mat with strap.",
    "price": 699,
    "oldPrice": 1399,
    "images": [
      "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=800&q=80"
    ],
    "stock": 50,
    "rating": 4.8,
    "reviews": 230,
    "seller": "StepRight Footwear",
    "status": "approved"
  },
  {
    "_id": "65f1234567890abcdef00034",
    "name": "24K Gold Kundan Choker Necklace Set",
    "brand": "Zaveri Pearls",
    "category": "Jewellery",
    "subCategory": "Gold Plated Necklaces",
    "description": "Traditional Kundan & pearl drop choker necklace set.",
    "price": 1299,
    "oldPrice": 2599,
    "images": [
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&q=80"
    ],
    "stock": 50,
    "rating": 4.8,
    "reviews": 237,
    "seller": "TechGalaxy Electronics",
    "status": "approved"
  },
  {
    "_id": "65f1234567890abcdef00035",
    "name": "Premium Leather Structured Tote Bag",
    "brand": "Caprese Style",
    "category": "Bags",
    "subCategory": "Tote Bags",
    "description": "Structured faux leather tote bag with laptop sleeve.",
    "price": 1599,
    "oldPrice": 3199,
    "images": [
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&q=80"
    ],
    "stock": 50,
    "rating": 4.8,
    "reviews": 244,
    "seller": "Royal Men's Hub",
    "status": "approved"
  },
  {
    "_id": "65f1234567890abcdef00036",
    "name": "Stainless Steel Chronograph Watch",
    "brand": "Titan Style",
    "category": "Watches",
    "subCategory": "Chronograph Watches",
    "description": "Waterproof stainless steel chronograph dial watch.",
    "price": 2799,
    "oldPrice": 5599,
    "images": [
      "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&q=80"
    ],
    "stock": 50,
    "rating": 4.8,
    "reviews": 251,
    "seller": "Royal Men's Hub",
    "status": "approved"
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
