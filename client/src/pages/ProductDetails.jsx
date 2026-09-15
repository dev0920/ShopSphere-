import { API_BASE_URL } from "../config/apiConfig";
import { useEffect, useState } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import "./ProductDetails.css";

function getImages(images) {
  if (!images) return [];
  if (Array.isArray(images)) return images.filter(Boolean);
  if (typeof images === "string" && images.startsWith("http"))
    return images.split(" ").filter((u) => u.startsWith("http"));
  return [];
}

function formatReviews(n) {
  if (!n) return "0";
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

function StarRow({ rating = 4.5 }) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  return (
    <span className="pd-stars">
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className={
            i <= full ? "pd-star--full"
            : i === full + 1 && half ? "pd-star--half"
            : "pd-star--empty"
          }
        >★</span>
      ))}
    </span>
  );
}

const SPEC_LABELS = {
  color:      "Colour",
  material:   "Material",
  weight:     "Weight / Quantity",
  dimensions: "Dimensions",
  warranty:   "Warranty",
};

// Helper: Seeded pseudo-random generator from string ID
function stringHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

// Deterministic generator for product-specific original reviews
function getProductSpecificReviews(product) {
  if (!product) return [];

  const name = product.name || "item";
  const brand = product.brand || "brand";
  const cat = (product.category || "").toLowerCase();
  const seed = stringHash(product._id || product.name || "prod");

  const namesPool = [
    ["Ananya Deshmukh", "Rahul Verma", "Kavya Patel", "Siddharth Rao"],
    ["Neha Kapoor", "Vikram Singh", "Pooja Hegde", "Amitab Joshi"],
    ["Sneha Kulkarni", "Manish Malhotra", "Deepika Roy", "Rohan Mehta"],
    ["Ritu Sen", "Arjun Nair", "Divya Pillai", "Karan Sharma"],
  ][seed % 4];

  const dates = ["3 days ago", "1 week ago", "2 weeks ago", "1 month ago"];

  let categorySpecificReviews = [];

  if (cat.includes("ethnic") || cat.includes("saree") || cat.includes("dress") || cat.includes("clothing") || cat.includes("menswear")) {
    categorySpecificReviews = [
      {
        name: namesPool[0],
        rating: 5,
        date: `${dates[0]} · Verified Buyer`,
        comment: `The fabric and stitching of this ${name} by ${brand} are absolutely top notch! The color is vibrant and exactly like the pictures.`
      },
      {
        name: namesPool[1],
        rating: 4.5,
        date: `${dates[1]} · Verified Buyer`,
        comment: `Fits perfectly and feels very comfortable on skin. Received multiple compliments when I wore it.`
      },
      {
        name: namesPool[2],
        rating: 5,
        date: `${dates[2]} · Verified Buyer`,
        comment: `Premium material quality from ${brand}. Delivery was fast and packaging was neat. Worth buying!`
      }
    ];
  } else if (cat.includes("footwear") || cat.includes("shoe")) {
    categorySpecificReviews = [
      {
        name: namesPool[0],
        rating: 5,
        date: `${dates[0]} · Verified Buyer`,
        comment: `Extremely comfortable sole and stylish design! Walked around all day with zero heel pain. True to size ${name}.`
      },
      {
        name: namesPool[1],
        rating: 4,
        date: `${dates[1]} · Verified Buyer`,
        comment: `Sturdy grip and clean finishing by ${brand}. Good value for money.`
      },
      {
        name: namesPool[2],
        rating: 5,
        date: `${dates[2]} · Verified Buyer`,
        comment: `Looks very elegant with casuals. The cushioning inside is great for daily wear.`
      }
    ];
  } else if (cat.includes("electronics") || cat.includes("watch") || cat.includes("gadget")) {
    categorySpecificReviews = [
      {
        name: namesPool[0],
        rating: 5,
        date: `${dates[0]} · Verified Buyer`,
        comment: `Fantastic build quality and performance! The ${name} operates smoothly without any lag.`
      },
      {
        name: namesPool[1],
        rating: 4.5,
        date: `${dates[1]} · Verified Buyer`,
        comment: `Battery backup and feature responsiveness from ${brand} exceeded my expectations. High recommendation!`
      },
      {
        name: namesPool[2],
        rating: 4,
        date: `${dates[2]} · Verified Buyer`,
        comment: `Clean minimalistic design and crisp display. Packaging was very safe and secure.`
      }
    ];
  } else if (cat.includes("decor") || cat.includes("home")) {
    categorySpecificReviews = [
      {
        name: namesPool[0],
        rating: 5,
        date: `${dates[0]} · Verified Buyer`,
        comment: `Completely enhanced the aesthetic of my living room! The craftsmanship of this ${name} is remarkable.`
      },
      {
        name: namesPool[1],
        rating: 5,
        date: `${dates[1]} · Verified Buyer`,
        comment: `Strong durable build and premium finish. ${brand} delivered high quality.`
      },
      {
        name: namesPool[2],
        rating: 4.5,
        date: `${dates[2]} · Verified Buyer`,
        comment: `Safe bubble packaging and fast delivery. Item matches description 100%.`
      }
    ];
  } else {
    categorySpecificReviews = [
      {
        name: namesPool[0],
        rating: 5,
        date: `${dates[0]} · Verified Buyer`,
        comment: `Super satisfied with this purchase of ${name}. Genuine product from ${brand}!`
      },
      {
        name: namesPool[1],
        rating: 4.5,
        date: `${dates[1]} · Verified Buyer`,
        comment: `Great packaging and authentic product. Would definitely order again from this seller.`
      },
      {
        name: namesPool[2],
        rating: 5,
        date: `${dates[2]} · Verified Buyer`,
        comment: `High quality, durable, and value for money item. Highly recommended for shoppers!`
      }
    ];
  }

  return categorySpecificReviews;
}

import ProductCard from "../components/ProductCard.jsx";

export default function ProductDetails() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [product,           setProduct]           = useState(null);
  const [loading,           setLoading]           = useState(true);
  const [activeImg,         setActiveImg]         = useState(0);
  const [qty,               setQty]               = useState(1);
  const [toast,             setToast]             = useState(null);
  const [addedToCart,       setAddedToCart]       = useState(false);
  const [suggestedProducts, setSuggestedProducts] = useState([]);

  // Review submission state
  const [userReviews,     setUserReviews]     = useState([]);
  const [newRating,       setNewRating]       = useState(5);
  const [newReviewerName, setNewReviewerName] = useState("");
  const [newComment,      setNewComment]      = useState("");
  const [showReviewForm,  setShowReviewForm]  = useState(false);

  useEffect(() => {
    setLoading(true);
    setActiveImg(0);
    window.scrollTo({ top: 0, behavior: "smooth" });

    fetch(`${API_BASE_URL}/api/products/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setProduct(data.product);

          // Load local user reviews for this product
          try {
            const saved = localStorage.getItem(`reviews_${data.product._id}`);
            if (saved) setUserReviews(JSON.parse(saved));
            else setUserReviews([]);
          } catch {}

          // Fetch suggested products from same category or fallback
          fetch(`${API_BASE_URL}/api/products?category=${encodeURIComponent(data.product.category)}&limit=12`)
            .then((res) => res.json())
            .then((catData) => {
              let list = (catData.products || []).filter((p) => p._id !== data.product._id);
              if (list.length < 4) {
                fetch(`${API_BASE_URL}/api/products?limit=12`)
                  .then((res2) => res2.json())
                  .then((allData) => {
                    const extra = (allData.products || []).filter(
                      (p) => p._id !== data.product._id && !list.some((item) => item._id === p._id)
                    );
                    setSuggestedProducts([...list, ...extra].slice(0, 4));
                  })
                  .catch(() => setSuggestedProducts(list));
              } else {
                setSuggestedProducts(list.slice(0, 4));
              }
            })
            .catch(() => {});
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const userStr = localStorage.getItem("user") || sessionStorage.getItem("user");
  const loggedUser = userStr ? JSON.parse(userStr) : null;
  const isVendor = loggedUser?.role === "vendor";

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2800);
  };

  const handleAddToCart = () => {
    if (!product) return;
    if (isVendor) {
      showToast("🏪 Vendors cannot purchase products. Switch to a customer account.", "error");
      return;
    }
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const idx  = cart.findIndex((i) => i._id === product._id);
    if (idx > -1) cart[idx].quantity += qty;
    else cart.push({ ...product, quantity: qty });
    localStorage.setItem("cart", JSON.stringify(cart));
    setAddedToCart(true);
    showToast("✓ Added to cart!");
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleBuyNow = () => {
    if (!product) return;
    if (isVendor) {
      showToast("🏪 Vendors cannot purchase products. Switch to a customer account.", "error");
      return;
    }
    // Delete previous cart items and load only this product for direct checkout
    const freshCart = [{ ...product, quantity: qty }];
    localStorage.setItem("cart", JSON.stringify(freshCart));
    navigate("/cart");
  };

  const handleToggleReviewForm = () => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token || !loggedUser) {
      showToast("🔑 Please sign in to your account to write a review!", "error");
      setTimeout(() => {
        navigate("/login", { state: { from: location } });
      }, 1000);
      return;
    }
    if (!showReviewForm) {
      setNewReviewerName(loggedUser.name || "");
    }
    setShowReviewForm((prev) => !prev);
  };

  const handleAddReview = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token || !loggedUser) {
      showToast("🔑 Please sign in to submit a review.", "error");
      navigate("/login", { state: { from: location } });
      return;
    }

    if (!newComment.trim()) {
      showToast("Please write a review comment.", "error");
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/products/${product._id}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          rating: Number(newRating),
          comment: newComment.trim(),
          name: newReviewerName.trim() || loggedUser.name || "Verified Customer",
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        showToast(data.message || "Failed to submit review.", "error");
        return;
      }

      if (data.product) {
        setProduct(data.product);
      }

      const reviewObj = data.review || {
        id: Date.now(),
        name: newReviewerName.trim() || loggedUser.name || "Verified Customer",
        rating: Number(newRating),
        date: "Just now · Verified Buyer",
        comment: newComment.trim(),
      };

      const updated = [reviewObj, ...userReviews];
      setUserReviews(updated);
      try {
        localStorage.setItem(`reviews_${product._id}`, JSON.stringify(updated));
      } catch {}

      setNewComment("");
      setShowReviewForm(false);
      showToast("🌟 Thank you! Your real-time review has been published.");
    } catch (err) {
      console.error("Review error:", err);
      showToast("Unable to connect to server.", "error");
    }
  };

  /* ── early returns ─────────────────────────────── */
  if (loading) {
    return (
      <div className="pd-loading">
        <span className="pd-spinner" />
        <p>Loading product…</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="pd-loading">
        <p>Product not found. <Link to="/catalogue">Back to catalogue</Link></p>
      </div>
    );
  }

  /* ── derived values ────────────────────────────── */
  const images   = getImages(product.images);
  const specs    = product.specifications || {};
  const discount = product.oldPrice && product.oldPrice > product.price
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : 0;
  const inStock  = product.stock === undefined || product.stock > 0;
  const lowStock = product.stock > 0 && product.stock <= 10;

  const dbReviews = product.reviewsList || [];
  const generatedReviews = getProductSpecificReviews(product);
  const allReviewsList = [...dbReviews, ...userReviews, ...generatedReviews];

  const ratingBars = [
    { star: 5, pct: Math.min(95, Math.round((product.rating - 3.5) * 33 + 45)) },
    { star: 4, pct: Math.max(3,  Math.round(30 - (product.rating - 4) * 10)) },
    { star: 3, pct: 8 },
    { star: 2, pct: 4 },
    { star: 1, pct: 3 },
  ];

  const handleShare = () => {
    const text = `🛍️ *${product.name}*\n💰 ₹${product.price}${discount > 0 ? ` (${discount}% OFF)` : ""}\n⭐ ${product.rating} ★ · ${formatReviews(product.reviews)} reviews\n🚚 Free Delivery & COD\n👉 ${window.location.href}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
  };

  /* ── render ────────────────────────────────────── */
  return (
    <div className="pd-root">

      {isVendor && (
        <div style={{ background: "linear-gradient(135deg, #7e22ce 0%, #6b21a8 100%)", color: "#ffffff", padding: "12px 20px", textAlign: "center", fontWeight: 800, fontSize: "14px", display: "flex", justifyContent: "center", alignItems: "center", gap: "10px", boxShadow: "0 4px 12px rgba(126,34,206,0.2)" }}>
          <span>👁️ VENDOR LIVE PREVIEW MODE</span>
          <span style={{ fontSize: "12px", background: "rgba(255,255,255,0.2)", padding: "2px 8px", borderRadius: "4px" }}>Purchasing Disabled for Vendors</span>
          <button
            type="button"
            onClick={() => navigate("/vendor-dashboard")}
            style={{ background: "#ffffff", color: "#6b21a8", border: "none", padding: "4px 12px", borderRadius: "6px", fontSize: "12px", fontWeight: 900, cursor: "pointer", marginLeft: "12px" }}
          >
            ← Exit Preview
          </button>
        </div>
      )}

      {toast && (
        <div className={`pd-toast pd-toast--${toast.type}`}>{toast.msg}</div>
      )}

      {/* Breadcrumb */}
      <nav className="pd-breadcrumb">
        <div className="pd-breadcrumb-inner">
          <Link to="/">Home</Link><span>›</span>
          <Link to="/catalogue">Catalogue</Link><span>›</span>
          <Link to={`/catalogue?category=${encodeURIComponent(product.category)}`}>
            {product.category}
          </Link><span>›</span>
          <span className="pd-breadcrumb-current">{product.name}</span>
        </div>
      </nav>

      {/* ── Two-column layout ── */}
      <div className="pd-page">

        {/* LEFT — Gallery */}
        <section className="pd-gallery">
          {images.length > 1 && (
            <div className="pd-thumbs">
              {images.map((img, i) => (
                <button
                  key={i} type="button"
                  className={`pd-thumb${activeImg === i ? " pd-thumb--active" : ""}`}
                  onClick={() => setActiveImg(i)}
                >
                  <img
                    src={img}
                    alt={`view ${i + 1}`}
                    loading="lazy"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80";
                    }}
                  />
                </button>
              ))}
            </div>
          )}

          <div className="pd-main-img-wrap">
            {images.length > 0 ? (
              <img
                src={images[activeImg]}
                alt={product.name}
                className="pd-main-img"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80";
                }}
              />
            ) : (
              <div className="pd-img-placeholder">
                {product.category === "Grocery" ? "🛒"
                  : product.category === "Beauty" ? "💄"
                  : product.category === "Footwear" ? "👟"
                  : product.category === "Menswear" ? "👔"
                  : product.category === "Home Decor" ? "🛋️"
                  : "🛍️"}
              </div>
            )}
            {discount >= 5 && <span className="pd-img-badge">{discount}% OFF</span>}
            {images.length > 1 && (
              <div className="pd-img-dots">
                {images.map((_, i) => (
                  <button key={i} type="button"
                    className={`pd-dot${activeImg === i ? " pd-dot--active" : ""}`}
                    onClick={() => setActiveImg(i)}
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* RIGHT — Info */}
        <section className="pd-info">

          <div className="pd-trust-strip">
            <span>✅ Verified Seller</span>
            <span>↩️ 7-Day Returns</span>
            <span>🚚 Free Delivery</span>
            <span>💳 COD Available</span>
          </div>

          <div className="pd-cat-row">
            <Link
              to={`/catalogue?category=${encodeURIComponent(product.category)}`}
              className="pd-cat-link"
            >
              {product.category}
            </Link>
            {product.subCategory && product.subCategory !== product.category && (
              <>
                <span className="pd-cat-sep">›</span>
                <span className="pd-subcat">{product.subCategory}</span>
              </>
            )}
          </div>

          <h1 className="pd-title">{product.name}</h1>

          <p className="pd-brand">
            by <strong>{product.brand}</strong>
          </p>

          {/* 🏪 Vendor & Shop Info Card */}
          <div className="pd-vendor-card">
            <div className="pd-vendor-left">
              <div className="pd-vendor-avatar">🏪</div>
              <div className="pd-vendor-meta">
                <span className="pd-vendor-tag">Sold &amp; Fulfilled By</span>
                <Link
                  to={`/vendor/${product.createdBy?._id || product.createdBy || encodeURIComponent(product.seller || "store")}`}
                  className="pd-vendor-shop-name"
                  style={{ textDecoration: "none" }}
                >
                  {product.seller || product.createdBy?.name || "Official Factory Store"} →
                </Link>
                {product.createdBy?.name && (
                  <div className="pd-vendor-name">
                    Vendor Partner: <strong>{product.createdBy.name}</strong>
                  </div>
                )}
              </div>
            </div>

            <div className="pd-vendor-badges">
              <Link
                to={`/vendor/${product.createdBy?._id || product.createdBy || encodeURIComponent(product.seller || "store")}`}
                className="pd-vendor-badge-verified"
                style={{ textDecoration: "none", display: "inline-block" }}
              >
                Visit Vendor Store →
              </Link>
              <span className="pd-vendor-rating-sub">⚡ Direct Factory Dispatch</span>
            </div>
          </div>

          <div className="pd-rating-row">
            <StarRow rating={product.rating || 4.5} />
            <span className="pd-rating-num">{product.rating || 4.5}</span>
            <span className="pd-review-count">{allReviewsList.length} verified reviews</span>
            {inStock ? (
              <span className="pd-stock-badge pd-stock-badge--in">
                📦 {product.stock !== undefined ? product.stock : 50} Pieces Available
              </span>
            ) : (
              <span className="pd-stock-badge pd-stock-badge--out">❌ 0 Pieces (Out of Stock)</span>
            )}
          </div>

          <div className="pd-price-box">
            <span className="pd-price">₹{product.price.toLocaleString("en-IN")}</span>
            {product.oldPrice > product.price && (
              <span className="pd-old-price">₹{product.oldPrice.toLocaleString("en-IN")}</span>
            )}
            {discount >= 5 && (
              <span className="pd-discount-tag">{discount}% OFF</span>
            )}
          </div>

          {Object.values(specs).some((v) => v && String(v).trim()) && (
            <div className="pd-specs-grid">
              {Object.entries(SPEC_LABELS).map(([key, label]) => {
                const val = specs[key];
                if (!val || !String(val).trim() || val === "0") return null;
                return (
                  <div key={key} className="pd-spec-item">
                    <span className="pd-spec-label">{label}</span>
                    <span className="pd-spec-val">{val}</span>
                  </div>
                );
              })}
            </div>
          )}

          <div className="pd-qty-row">
            <span className="pd-qty-label">Quantity</span>
            <div className="pd-qty-control">
              <button type="button" className="pd-qty-btn"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                disabled={qty <= 1}>−</button>
              <span className="pd-qty-val">{qty}</span>
              <button type="button" className="pd-qty-btn"
                onClick={() => setQty((q) => Math.min(product.stock || 99, q + 1))}>+</button>
            </div>
          </div>

          {isVendor ? (
            <div style={{ background: "#faf5ff", border: "2px dashed #a855f7", borderRadius: "14px", padding: "18px 24px", margin: "20px 0", textAlign: "center" }}>
              <span style={{ fontSize: "24px", display: "block", marginBottom: "6px" }}>🏪</span>
              <h4 style={{ margin: 0, fontSize: "16px", fontWeight: 900, color: "#7e22ce" }}>
                Vendor Store Live Preview Mode
              </h4>
              <p style={{ margin: "6px 0 14px", fontSize: "13px", color: "#6b21a8" }}>
                You are inspecting your product listing in Vendor Mode. Cart &amp; Direct Buying controls are disabled so vendors cannot purchase their own products.
              </p>
              <button
                type="button"
                onClick={() => navigate("/vendor-dashboard")}
                style={{ background: "#9333ea", color: "#ffffff", border: "none", padding: "10px 20px", borderRadius: "8px", fontWeight: 800, fontSize: "13px", cursor: "pointer", boxShadow: "0 4px 12px rgba(147,51,234,0.3)" }}
              >
                ← Back to Vendor Dashboard
              </button>
            </div>
          ) : (
            <div className="pd-cta-row">
              <button type="button"
                className={`pd-btn-cart${addedToCart ? " pd-btn-cart--added" : ""}`}
                onClick={handleAddToCart} disabled={!inStock}>
                {addedToCart ? "✓ Added to Cart!" : "🛒 Add to Cart"}
              </button>
              <button type="button" className="pd-btn-buy"
                onClick={handleBuyNow} disabled={!inStock}>
                ⚡ Buy Now
              </button>
            </div>
          )}

          <button type="button" className="pd-btn-share" onClick={handleShare}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Share Product
          </button>

          <div className="pd-seller-card">
            <div className="pd-seller-avatar">
              {(product.seller || product.brand || "S").charAt(0).toUpperCase()}
            </div>
            <div className="pd-seller-info">
              <strong>{product.seller || product.brand || "ShopSphere Direct"}</strong>
              <p>⭐ 4.7 Seller Rating · Verified Supplier</p>
            </div>
            <span className="pd-seller-badge">✅ Verified</span>
          </div>

        </section>
      </div>

      {/* ── Lower section ── */}
      <div className="pd-lower">

        <div className="pd-section-card">
          <h2 className="pd-section-title">Product Details</h2>
          <div className="pd-feature-row">
            {["✅ Premium Quality","🚚 Free Delivery","💳 Cash on Delivery",
              "🔄 Easy Returns","⭐ Trusted Seller","🏷️ Best Price"].map((f) => (
              <span key={f} className="pd-feature-chip">{f}</span>
            ))}
          </div>
          <p className="pd-description">{product.description}</p>
          {Object.values(specs).some((v) => v && String(v).trim()) && (
            <div className="pd-spec-table">
              <h3>Specifications</h3>
              {Object.entries(specs).map(([key, value]) =>
                value && String(value).trim() && value !== "0" ? (
                  <div key={key} className="pd-spec-row">
                    <span>{SPEC_LABELS[key] || key}</span>
                    <strong>{value}</strong>
                  </div>
                ) : null
              )}
            </div>
          )}
        </div>

        {/* ── Dynamic Reviews & Submission ── */}
        <div className="pd-section-card">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <h2 className="pd-section-title" style={{ margin: 0 }}>Ratings &amp; Original Reviews</h2>
            <button
              className="pd-write-review-btn"
              onClick={handleToggleReviewForm}
            >
              {showReviewForm ? "Cancel" : "✏️ Write a Review"}
            </button>
          </div>

          {/* Write a review form */}
          {showReviewForm && (
            <form className="pd-review-form" onSubmit={handleAddReview}>
              <h3>Write a Product Review</h3>
              
              <div className="pd-rf-group">
                <label>Your Rating:</label>
                <div className="pd-star-select">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className={`pd-star-btn ${star <= newRating ? "active" : ""}`}
                      onClick={() => setNewRating(star)}
                    >
                      ★
                    </button>
                  ))}
                  <span className="pd-star-label-text">{newRating} Stars</span>
                </div>
              </div>

              <div className="pd-rf-group">
                <label>Your Name (Optional):</label>
                <input
                  type="text"
                  placeholder="e.g. Priya Sharma"
                  value={newReviewerName}
                  onChange={(e) => setNewReviewerName(e.target.value)}
                />
              </div>

              <div className="pd-rf-group">
                <label>Your Review Comment:</label>
                <textarea
                  rows={3}
                  placeholder={`Share your experience with ${product.name}…`}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="pd-btn-buy" style={{ padding: "10px 20px" }}>
                Publish Review →
              </button>
            </form>
          )}

          <div className="pd-reviews-layout">
            <div className="pd-rating-summary">
              <span className="pd-rating-big">{product.rating || 4.5}</span>
              <StarRow rating={product.rating || 4.5} />
              <p>{allReviewsList.length} Ratings &amp; Reviews</p>
            </div>
            <div className="pd-rating-bars">
              {ratingBars.map(({ star, pct }) => (
                <div key={star} className="pd-bar-row">
                  <span className="pd-bar-label">{star} ★</span>
                  <div className="pd-bar-track">
                    <div className="pd-bar-fill" style={{ width: `${Math.max(2, pct)}%` }} />
                  </div>
                  <span className="pd-bar-pct">{pct}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Product-Specific Reviews List */}
          <div className="pd-sample-reviews" style={{ marginTop: 20 }}>
            {allReviewsList.map((r, idx) => (
              <div key={r.id || idx} className="pd-review">
                <div className="pd-review-header">
                  <span className="pd-reviewer-avatar">
                    {(r.name || "U").charAt(0).toUpperCase()}
                  </span>
                  <div>
                    <strong>{r.name}</strong>
                    <span className="pd-review-date">{r.date}</span>
                  </div>
                  <StarRow rating={r.rating} />
                </div>
                <p>{r.comment}</p>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ── Suggested Products Section ── */}
      {suggestedProducts.length > 0 && (
        <div className="pd-suggested-section">
          <div className="pd-suggested-header">
            <div>
              <h2 className="pd-suggested-title">✨ Suggested Products You May Like</h2>
              <p className="pd-suggested-sub">Handpicked items based on {product.category}</p>
            </div>
            <Link to={`/catalogue?category=${encodeURIComponent(product.category)}`} className="pd-view-more-link">
              Explore {product.category} →
            </Link>
          </div>

          <div className="pd-suggested-grid">
            {suggestedProducts.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
