import { useState } from "react";
import { Link } from "react-router-dom";
import "./ProductCard.css";

// ── Category → which spec chips to show ──────────────────
const CATEGORY_SPECS = {
  "Ethnic Wear":     ["color", "material"],
  "Western Dresses": ["color", "material"],
  "Menswear":        ["color", "material"],
  "Footwear":        ["color", "material"],
  "Home Decor":      ["color", "material"],
  "Beauty":          ["material"],
  "Accessories":     ["color", "material"],
  "Grocery":         ["weight", "material"],
  "Electronics":     ["warranty", "color"],
  "Kids & Toys":     ["color", "material"],
  "Sports & Fitness":["weight", "material"],
  "Jewellery":        ["color", "material"],
  "Bags":             ["color", "material"],
  "Watches":          ["warranty", "color"],
};

function getSpecChips(product) {
  const specs = product.specifications || {};
  const keys  = CATEGORY_SPECS[product.category] || ["color", "material"];
  return keys
    .map((k) => specs[k])
    .filter((v) => v && v.trim() !== "" && v !== "0");
}

// ── Normalise images field (array or legacy string) ───────
function getImageUrl(images) {
  if (!images) return null;
  if (Array.isArray(images) && images.length > 0) return images[0];
  if (typeof images === "string" && images.startsWith("http")) return images;
  return null;
}

// ── Format review count (1200 → 1.2k) ────────────────────
function formatReviews(n) {
  if (!n) return "0";
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

// ── Star fill (whole + half) ──────────────────────────────
function StarRating({ rating = 4.5 }) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  return (
    <span className="pc-stars" aria-label={`${rating} stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className={
            i <= full
              ? "pc-star pc-star--full"
              : i === full + 1 && half
              ? "pc-star pc-star--half"
              : "pc-star pc-star--empty"
          }
        >
          ★
        </span>
      ))}
    </span>
  );
}

function ProductCard({ product, onAddToCart }) {
  const [wishlisted, setWishlisted] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  const discount =
    product.oldPrice && product.oldPrice > product.price
      ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
      : 0;

  const imageUrl  = getImageUrl(product.images);
  const specChips = getSpecChips(product);
  const inStock   = !product.stock || product.stock > 0;
  const lowStock  = product.stock > 0 && product.stock <= 10;

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setWishlisted((v) => !v);
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!inStock) return;
    onAddToCart && onAddToCart(product);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 1800);
  };

  const handleShare = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const text = `🛍️ *${product.name}*\n💰 Only ₹${product.price} — ${discount > 0 ? `${discount}% OFF!` : "Great price!"}\n⭐ ${product.rating} ★ rated\n🚚 Free Delivery & COD\n👉 ${window.location.origin}/product/${product._id}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
  };

  return (
    <article className="pc-card">

      {/* ── Image area ── */}
      <Link to={`/product/${product._id}`} className="pc-img-link" tabIndex={-1}>
        <div className="pc-img-wrap">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={product.name}
              className="pc-img"
              loading="lazy"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80";
              }}
            />
          ) : (
            <div className="pc-img-placeholder">
              {product.category === "Grocery"    ? "🛒" :
               product.category === "Beauty"     ? "💄" :
               product.category === "Footwear"   ? "👟" :
               product.category === "Menswear"   ? "👔" :
               product.category === "Home Decor" ? "🛋️" : "🛍️"}
            </div>
          )}

          {/* Badges */}
          {discount >= 5 && (
            <span className="pc-badge pc-badge--discount">{discount}% OFF</span>
          )}
          {product.isFeatured && !discount && (
            <span className="pc-badge pc-badge--featured">⭐ Featured</span>
          )}
          {inStock && (
            <span
              className={`pc-badge ${lowStock ? "pc-badge--stock" : ""}`}
              style={!lowStock ? { background: "#f0fdf4", color: "#15803d", border: "1px solid #bbf7d0", fontWeight: 800 } : {}}
            >
              📦 {product.stock !== undefined ? product.stock : 50} Pcs Left
            </span>
          )}
          {!inStock && (
            <span className="pc-badge pc-badge--oos">Out of Stock</span>
          )}

          {/* Wishlist */}
          <button
            type="button"
            className={`pc-wish-btn${wishlisted ? " pc-wish-btn--active" : ""}`}
            onClick={handleWishlist}
            aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          >
            {wishlisted ? "❤️" : "🤍"}
          </button>
        </div>
      </Link>

      {/* ── Body ── */}
      <div className="pc-body">
        <Link to={`/product/${product._id}`} className="pc-body-link">

          {/* Category + subCategory */}
          <div className="pc-category-row">
            <span className="pc-category">{product.category}</span>
            {product.subCategory && product.subCategory !== product.category && (
              <span className="pc-dot">·</span>
            )}
            {product.subCategory && product.subCategory !== product.category && (
              <span className="pc-subcategory">{product.subCategory}</span>
            )}
          </div>

          {/* Product name */}
          <h3 className="pc-name">{product.name}</h3>

          {/* Brand + Seller */}
          <p className="pc-brand">
            {product.brand}
            {product.seller && product.seller !== product.brand && (
              <span className="pc-seller"> · {product.seller}</span>
            )}
          </p>

          {/* Spec chips — category-aware, no fake sizes */}
          {specChips.length > 0 && (
            <div className="pc-chips">
              {specChips.map((chip, i) => (
                <span key={i} className="pc-chip">{chip}</span>
              ))}
            </div>
          )}

          {/* Price */}
          <div className="pc-price-row">
            <span className="pc-price">₹{product.price.toLocaleString("en-IN")}</span>
            {product.oldPrice > product.price && (
              <span className="pc-old-price">₹{product.oldPrice.toLocaleString("en-IN")}</span>
            )}
            {discount >= 5 && (
              <span className="pc-discount-pct">{discount}% off</span>
            )}
          </div>

          {/* Rating */}
          <div className="pc-rating-row">
            <StarRating rating={product.rating || 4.5} />
            <span className="pc-rating-val">{product.rating || 4.5}</span>
            <span className="pc-review-count">
              ({formatReviews(product.reviews)})
            </span>
          </div>

          {/* Free delivery tag */}
          <p className="pc-delivery">🚚 Free Delivery · COD Available</p>

        </Link>

        {/* ── Actions ── */}
        <div className="pc-actions">
          <button
            type="button"
            className={`pc-cart-btn${addedToCart ? " pc-cart-btn--added" : ""}${!inStock ? " pc-cart-btn--disabled" : ""}`}
            onClick={handleAddToCart}
            disabled={!inStock}
          >
            {addedToCart ? "✓ Added!" : !inStock ? "Out of Stock" : "Add to Cart"}
          </button>

          <button
            type="button"
            className="pc-share-btn"
            onClick={handleShare}
            aria-label="Share on WhatsApp"
            title="Share & Resell on WhatsApp"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Share
          </button>
        </div>
      </div>

    </article>
  );
}

export default ProductCard;
