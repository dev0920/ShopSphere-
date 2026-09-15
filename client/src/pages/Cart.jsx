import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/cart.css";

const FREE_SHIPPING_THRESHOLD = 499;

const AVAILABLE_COUPONS = [
  { code: "MEESHO100", discount: 100, label: "₹100 OFF on orders" },
  { code: "WELCOME50", discount: 50, label: "₹50 OFF welcome gift" },
  { code: "FESTIVE200", discount: 200, label: "₹200 OFF festive special" },
  { code: "VIP2782", discount: 2782, label: "₹2,782 OFF Secret VIP Code", isSecret: true },
  { code: "SECRET2782", discount: 2782, label: "₹2,782 OFF Secret VIP Code", isSecret: true },
  { code: "SPHERE432", discount: 432, label: "₹432 OFF Secret VIP Discount", isSecret: true },
  { code: "SPHERE548", discount: 548, label: "₹548 OFF Exclusive VIP Discount", isSecret: true },
  { code: "SPHERE596", discount: 596, label: "₹596 OFF Secret Mega Discount", isSecret: true },
  { code: "SPHERE583", discount: 583, label: "₹583 OFF Special VIP Discount", isSecret: true },
];

function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [savedForLater, setSavedForLater] = useState([]);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem("cart")) || [];
    const savedLater = JSON.parse(localStorage.getItem("savedForLater")) || [];
    setCartItems(savedCart);
    setSavedForLater(savedLater);
    // Original price by default — coupon only applies when user clicks Apply
    localStorage.removeItem("appliedCoupon");
    setAppliedCoupon(null);
    setCouponCode("");
  }, []);

  const saveCart = (updatedCart) => {
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    setCartItems(updatedCart);
  };

  const saveLaterStorage = (updatedSaved) => {
    localStorage.setItem("savedForLater", JSON.stringify(updatedSaved));
    setSavedForLater(updatedSaved);
  };

  const updateQuantity = (productId, change) => {
    const updatedCart = cartItems
      .map((item) => {
        if (item._id === productId) {
          return {
            ...item,
            quantity: item.quantity + change,
          };
        }
        return item;
      })
      .filter((item) => item.quantity > 0);

    saveCart(updatedCart);
  };

  const removeItem = (productId) => {
    const updatedCart = cartItems.filter((item) => item._id !== productId);
    saveCart(updatedCart);
  };

  const handleSaveForLater = (item) => {
    const updatedCart = cartItems.filter((i) => i._id !== item._id);
    const updatedSaved = [...savedForLater.filter((i) => i._id !== item._id), item];
    saveCart(updatedCart);
    saveLaterStorage(updatedSaved);
  };

  const handleMoveToCart = (item) => {
    const updatedSaved = savedForLater.filter((i) => i._id !== item._id);
    const existing = cartItems.find((i) => i._id === item._id);
    const updatedCart = existing
      ? cartItems.map((i) => (i._id === item._id ? { ...i, quantity: i.quantity + 1 } : i))
      : [...cartItems, { ...item, quantity: 1 }];

    saveCart(updatedCart);
    saveLaterStorage(updatedSaved);
  };

  const handleApplyCoupon = (codeToApply) => {
    const targetCode = (codeToApply || couponCode).trim().toUpperCase();
    setCouponError("");
    setCouponSuccess("");

    if (!targetCode) {
      setCouponError("Please enter a valid coupon code.");
      return;
    }

    const matched = AVAILABLE_COUPONS.find((c) => c.code === targetCode);

    if (matched) {
      setAppliedCoupon(matched);
      localStorage.setItem("appliedCoupon", JSON.stringify(matched));
      setCouponCode(matched.code);
      setCouponSuccess(`🎉 Code ${matched.code} applied! You saved ₹${matched.discount}`);
    } else {
      setCouponError("Invalid coupon code. Try MEESHO100, WELCOME50, or FESTIVE200");
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponSuccess("");
    localStorage.removeItem("appliedCoupon");
  };

  const cartSummary = useMemo(() => {
    const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);
    const rawPrice = cartItems.reduce(
      (total, item) => total + Number(item.price) * item.quantity,
      0
    );
    const totalMrp = cartItems.reduce(
      (total, item) => total + Number(item.oldPrice || item.price) * item.quantity,
      0
    );
    const mrpDiscount = Math.max(0, totalMrp - rawPrice);
    const couponDiscount = appliedCoupon ? appliedCoupon.discount : 0;
    const finalPrice = Math.max(0, rawPrice - couponDiscount);
    const totalSavings = mrpDiscount + couponDiscount;

    // Free shipping progress
    const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - rawPrice);
    const shippingProgress = Math.min(100, (rawPrice / FREE_SHIPPING_THRESHOLD) * 100);

    return {
      totalItems,
      rawPrice,
      totalMrp,
      mrpDiscount,
      couponDiscount,
      finalPrice,
      totalSavings,
      remainingForFreeShipping,
      shippingProgress,
    };
  }, [cartItems, appliedCoupon]);

  return (
    <div className="cart-page-wrapper">
      {/* ── Top Header Bar ── */}
      <header className="cart-header-nav">
        <div className="cart-header-container">
          <Link to="/" className="cart-brand-logo">
            <span>🛍️</span>
            <span>ShopSphere</span>
          </Link>

          {/* Step Progress */}
          <div className="cart-step-tracker">
            <div className="cart-step-item active">
              <span className="cart-step-badge">1</span>
              <span>Shopping Bag</span>
            </div>
            <div className="cart-step-divider" />
            <div className="cart-step-item">
              <span className="cart-step-badge">2</span>
              <span>Address</span>
            </div>
            <div className="cart-step-divider" />
            <div className="cart-step-item">
              <span className="cart-step-badge">3</span>
              <span>Payment</span>
            </div>
          </div>

          <Link to="/catalogue" className="cart-continue-link">
            ← Continue Shopping
          </Link>
        </div>
      </header>

      {/* ── Main Content Container ── */}
      <main className="cart-main-container">
        {cartItems.length === 0 ? (
          /* Empty Cart State */
          <div className="cart-empty-container">
            <div className="cart-empty-icon">🛒</div>
            <h1 className="cart-empty-title">Your Shopping Bag is Empty</h1>
            <p className="cart-empty-sub">
              Looks like you haven't added anything to your cart yet. Discover high-quality products at direct factory prices!
            </p>

            <Link to="/catalogue" className="cart-empty-cta">
              Explore Factory Catalogue →
            </Link>

            <div className="cart-popular-categories">
              <div className="cart-popular-title">Explore Trending Categories</div>
              <div className="cart-cat-chips">
                <Link to="/catalogue?category=Ethnic%20Wear" className="cart-cat-chip-item">🥻 Ethnic Wear</Link>
                <Link to="/catalogue?category=Western%20Dresses" className="cart-cat-chip-item">👗 Western Dresses</Link>
                <Link to="/catalogue?category=Menswear" className="cart-cat-chip-item">👔 Menswear</Link>
                <Link to="/catalogue?category=Footwear" className="cart-cat-chip-item">👟 Footwear</Link>
                <Link to="/catalogue?category=Electronics" className="cart-cat-chip-item">🎧 Electronics</Link>
                <Link to="/catalogue?category=Home%20Decor" className="cart-cat-chip-item">🛋️ Home Decor</Link>
              </div>
            </div>
          </div>
        ) : (
          <div>
            {/* Page Title & Count */}
            <div className="cart-page-title-row">
              <h1 className="cart-page-title">
                My Shopping Bag
                <span className="cart-item-count-badge">
                  {cartSummary.totalItems} {cartSummary.totalItems === 1 ? "Item" : "Items"}
                </span>
              </h1>
            </div>

            {/* Free Shipping Progress Banner */}
            <div className="cart-free-shipping-card">
              <div className="cart-free-shipping-header">
                <span>
                  {cartSummary.remainingForFreeShipping === 0 ? (
                    <>🎉 You unlocked FREE Express Shipping!</>
                  ) : (
                    <>🚚 Add ₹{cartSummary.remainingForFreeShipping} more to get FREE Express Shipping!</>
                  )}
                </span>
                <span>{cartSummary.shippingProgress.toFixed(0)}%</span>
              </div>
              <div className="cart-progress-bar-track">
                <div
                  className="cart-progress-bar-fill"
                  style={{ width: `${cartSummary.shippingProgress}%` }}
                />
              </div>
            </div>

            {/* Cart Grid Layout */}
            <div className="cart-grid">
              {/* Left Column: Cart Items */}
              <div className="cart-items-section">
                {cartItems.map((item) => {
                  const itemSavings =
                    item.oldPrice && item.oldPrice > item.price
                      ? Math.round(((item.oldPrice - item.price) / item.oldPrice) * 100)
                      : 0;

                  return (
                    <div key={item._id} className="cart-item-card">
                      {/* Product Thumbnail */}
                      <div className="cart-item-image-wrapper">
                        {item.images && item.images.length > 0 ? (
                          <img src={item.images[0]} alt={item.name} />
                        ) : (
                          <span style={{ fontSize: "40px" }}>{item.icon || "🛍️"}</span>
                        )}
                      </div>

                      {/* Product Details */}
                      <div className="cart-item-details">
                        <span className="cart-item-category-tag">
                          {item.category}
                        </span>

                        <h3 className="cart-item-title">{item.name}</h3>

                        <div className="cart-item-meta-pills">
                          {item.size && <span className="cart-meta-chip">Size: {item.size}</span>}
                          <span className="cart-meta-chip">🏪 Vendor Verified</span>
                          <span className="cart-meta-chip">⚡ In Stock</span>
                        </div>

                        <div className="cart-item-price-row">
                          <span className="cart-item-price">
                            ₹{Number(item.price).toLocaleString("en-IN")}
                          </span>

                          {item.oldPrice > item.price && (
                            <span className="cart-item-old-price">
                              ₹{Number(item.oldPrice).toLocaleString("en-IN")}
                            </span>
                          )}

                          {itemSavings > 0 && (
                            <span className="cart-item-savings-pill">
                              {itemSavings}% OFF
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Quantity & Actions Column */}
                      <div className="cart-item-controls">
                        {/* Quantity Selector */}
                        <div className="cart-qty-selector">
                          <button
                            type="button"
                            className="cart-qty-btn"
                            onClick={() => updateQuantity(item._id, -1)}
                            title="Decrease quantity"
                          >
                            −
                          </button>
                          <span className="cart-qty-value">{item.quantity}</span>
                          <button
                            type="button"
                            className="cart-qty-btn"
                            onClick={() => updateQuantity(item._id, 1)}
                            title="Increase quantity"
                          >
                            +
                          </button>
                        </div>

                        {/* Save for later / Remove */}
                        <div className="cart-item-action-btns">
                          <button
                            type="button"
                            className="cart-btn-save-later"
                            onClick={() => handleSaveForLater(item)}
                          >
                            🔖 Save for Later
                          </button>

                          <button
                            type="button"
                            className="cart-btn-remove"
                            onClick={() => removeItem(item._id)}
                          >
                            🗑️ Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Saved For Later Items Section */}
                {savedForLater.length > 0 && (
                  <div className="cart-saved-section">
                    <h3 className="cart-saved-title">
                      🔖 Saved For Later ({savedForLater.length})
                    </h3>
                    <div className="cart-saved-grid">
                      {savedForLater.map((savedItem) => (
                        <div key={savedItem._id} className="cart-saved-card">
                          {savedItem.images && savedItem.images.length > 0 ? (
                            <img
                              src={savedItem.images[0]}
                              alt={savedItem.name}
                              className="cart-saved-thumb"
                            />
                          ) : (
                            <div className="cart-saved-thumb" style={{ background: "#eee", display: "flex", alignItems: "center", justifyContent: "center" }}>
                              🛍️
                            </div>
                          )}
                          <div className="cart-saved-info">
                            <h4>{savedItem.name.slice(0, 25)}…</h4>
                            <p>₹{savedItem.price}</p>
                            <button
                              type="button"
                              className="cart-saved-move-btn"
                              onClick={() => handleMoveToCart(savedItem)}
                            >
                              Move to Bag
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Order Summary Sidebar */}
              <aside className="cart-summary-sidebar">
                {/* Coupon Code Card */}
                <div className="cart-card-widget">
                  <h3 className="cart-widget-title">🏷️ Apply Promo / Coupon Code</h3>
                  {appliedCoupon ? (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#f0fdf4", border: "1px solid #86efac", padding: "10px 12px", borderRadius: "10px", marginTop: "8px" }}>
                      <span style={{ fontSize: "13px", fontWeight: 800, color: "#15803d" }}>
                        🎉 {appliedCoupon.code} Applied (₹{appliedCoupon.discount} OFF)
                      </span>
                      <button
                        type="button"
                        onClick={handleRemoveCoupon}
                        style={{ background: "#fee2e2", color: "#b91c1c", border: "1px solid #fca5a5", padding: "4px 10px", borderRadius: "6px", fontSize: "11px", fontWeight: 800, cursor: "pointer" }}
                      >
                        Remove ✕
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="cart-coupon-input-group">
                        <input
                          type="text"
                          className="cart-coupon-input"
                          placeholder="ENTER PROMO CODE"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value)}
                        />
                        <button
                          type="button"
                          className="cart-coupon-apply-btn"
                          onClick={() => handleApplyCoupon()}
                        >
                          Apply
                        </button>
                      </div>

                      {/* Quick Coupon Pills */}
                      <div className="cart-quick-coupons">
                        {AVAILABLE_COUPONS.filter((c) => !c.isSecret).map((c) => (
                          <button
                            key={c.code}
                            type="button"
                            className="cart-coupon-pill"
                            onClick={() => handleApplyCoupon(c.code)}
                          >
                            ⚡ {c.code} ({c.label})
                          </button>
                        ))}
                      </div>
                    </>
                  )}

                  {couponSuccess && !appliedCoupon && (
                    <div className="cart-coupon-msg success">{couponSuccess}</div>
                  )}
                  {couponError && (
                    <div className="cart-coupon-msg error">{couponError}</div>
                  )}
                </div>

                {/* Price Details Card */}
                <div className="cart-price-details-card">
                  <h3 className="cart-price-header">Order Summary</h3>

                  <div className="cart-price-row">
                    <span>Subtotal ({cartSummary.totalItems} items)</span>
                    <strong>₹{cartSummary.totalMrp.toLocaleString("en-IN")}</strong>
                  </div>

                  {cartSummary.mrpDiscount > 0 && (
                    <div className="cart-price-row discount-row">
                      <span>Factory Discount</span>
                      <span>- ₹{cartSummary.mrpDiscount.toLocaleString("en-IN")}</span>
                    </div>
                  )}

                  {cartSummary.couponDiscount > 0 && (
                    <div className="cart-price-row discount-row">
                      <span>Promo Coupon Discount</span>
                      <span>- ₹{cartSummary.couponDiscount.toLocaleString("en-IN")}</span>
                    </div>
                  )}

                  <div className="cart-price-row">
                    <span>Delivery Charges</span>
                    <strong style={{ color: "#10b981" }}>FREE</strong>
                  </div>

                  <hr className="cart-price-divider" />

                  <div className="cart-total-payable-row">
                    <span className="cart-total-payable-label">Total Payable</span>
                    <span className="cart-total-payable-amount">
                      ₹{cartSummary.finalPrice.toLocaleString("en-IN")}
                    </span>
                  </div>

                  {cartSummary.totalSavings > 0 && (
                    <div className="cart-savings-banner">
                      🎉 You save ₹{cartSummary.totalSavings.toLocaleString("en-IN")} on this order!
                    </div>
                  )}

                  <Link to="/checkout" className="cart-checkout-btn">
                    Proceed to Checkout →
                  </Link>

                  {/* Trust Badges Widget */}
                  <div className="cart-trust-widget" style={{ marginTop: "20px" }}>
                    <div className="cart-trust-item">
                      <span className="cart-trust-icon">🔒</span>
                      <span className="cart-trust-text">100% Secure</span>
                    </div>
                    <div className="cart-trust-item">
                      <span className="cart-trust-icon">🔄</span>
                      <span className="cart-trust-text">7-Day Return</span>
                    </div>
                    <div className="cart-trust-item">
                      <span className="cart-trust-icon">⚡</span>
                      <span className="cart-trust-text">Direct Factory</span>
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default Cart;