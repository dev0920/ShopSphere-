import { API_BASE_URL } from "../config/apiConfig";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import HeroBanner from "../components/HeroBanner";
import ProductCard from "../components/ProductCard";
import Footer from "../components/Footer";
import "../styles/home.css";

const CATEGORIES = [
  {
    name: "Ethnic Wear", slug: "Ethnic Wear",
    image: "/images/categories/ethentic.png",
    gradient: "linear-gradient(135deg,#fdf2f8,#fce7f3)",
    accent: "#f43397",
    subs: ["Sarees", "Kurtis", "Lehengas", "Suit Sets", "Kurti Sets"],
  },
  {
    name: "Western Dresses", slug: "Western Dresses",
    image: "/images/categories/western.png",
    gradient: "linear-gradient(135deg,#f0f4ff,#e0e7ff)",
    accent: "#6366f1",
    subs: ["Midi Dresses", "Party Dresses", "Maxi Dresses", "Jumpsuits", "Co-ord Sets"],
  },
  {
    name: "Menswear", slug: "Menswear",
    image: "/images/categories/mens.png",
    gradient: "linear-gradient(135deg,#f0fdf4,#dcfce7)",
    accent: "#16a34a",
    subs: ["Formal Shirts", "T-Shirts", "Jeans", "Ethnic Kurta", "Blazers"],
  },
  {
    name: "Footwear", slug: "Footwear",
    image: "/images/categories/footware.png",
    gradient: "linear-gradient(135deg,#fff7ed,#ffedd5)",
    accent: "#ea580c",
    subs: ["Sports Shoes", "Heels", "Formal Shoes", "Casual Shoes", "Boots"],
  },
  {
    name: "Home Decor", slug: "Home Decor",
    image: "/images/categories/homedecor.png",
    gradient: "linear-gradient(135deg,#fefce8,#fef9c3)",
    accent: "#ca8a04",
    subs: ["Wall Decor", "Lighting", "Bedding", "Cookware", "Rugs & Carpets"],
  },
  {
    name: "Beauty", slug: "Beauty",
    image: "/images/categories/beauty.png",
    gradient: "linear-gradient(135deg,#fdf4ff,#fae8ff)",
    accent: "#a21caf",
    subs: ["Serums", "Skin Care", "Eye Makeup", "Hair Care", "Fragrances"],
  },
  {
    name: "Accessories", slug: "Accessories",
    image: "/images/categories/Accessories.png",
    gradient: "linear-gradient(135deg,#fff1f2,#ffe4e6)",
    accent: "#e11d48",
    subs: ["Sunglasses", "Wallets & Belts", "Scarves & Caps", "Hair Accessories"],
  },
  {
    name: "Grocery", slug: "Grocery",
    image: "/images/categories/grocery.png",
    gradient: "linear-gradient(135deg,#f0fdfa,#ccfbf1)",
    accent: "#0d9488",
    subs: ["Rice & Grains", "Oils & Ghee", "Tea & Coffee", "Spices & Masala", "Dry Fruits & Nuts"],
  },
  {
    name: "Electronics", slug: "Electronics",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80",
    gradient: "linear-gradient(135deg,#eff6ff,#dbeafe)",
    accent: "#2563eb",
    subs: ["Wireless Headphones", "Laptops", "Smartwatches", "Smartphones", "Portable Speakers"],
  },
  {
    name: "Kids & Toys", slug: "Kids & Toys",
    image: "https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=600&q=80",
    gradient: "linear-gradient(135deg,#fef2f2,#fee2e2)",
    accent: "#dc2626",
    subs: ["Boys Wear", "Girls Wear", "Educational Toys", "Soft Toys", "Action Figures"],
  },
  {
    name: "Sports & Fitness", slug: "Sports & Fitness",
    image: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&q=80",
    gradient: "linear-gradient(135deg,#f0fdf4,#bbf7d0)",
    accent: "#15803d",
    subs: ["Yoga Mats", "Dumbbells & Weights", "Sportswear", "Gym Accessories", "Cricket Gear"],
  },
  {
    name: "Jewellery", slug: "Jewellery",
    image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&q=80",
    gradient: "linear-gradient(135deg,#fffbeb,#fef3c7)",
    accent: "#d97706",
    subs: ["Gold Plated Necklaces", "Rings", "Earrings", "Bracelets", "Silver Jewellery"],
  },
  {
    name: "Bags", slug: "Bags",
    image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&q=80",
    gradient: "linear-gradient(135deg,#faf5ff,#f3e8ff)",
    accent: "#9333ea",
    subs: ["Tote Bags", "Backpacks", "Sling Bags", "Travel Duffle Bags", "Handbags"],
  },
  {
    name: "Watches", slug: "Watches",
    image: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=600&q=80",
    gradient: "linear-gradient(135deg,#f8fafc,#e2e8f0)",
    accent: "#475569",
    subs: ["Chronograph Watches", "Analog Leather Watches", "Smartwatches", "Digital Sports Watches"],
  },
];

const PROMISES = [
  { icon: "🚚", title: "Free Shipping",     sub: "On all orders above ₹199" },
  { icon: "↩️", title: "7-Day Returns",     sub: "Hassle-free return policy" },
  { icon: "💳", title: "Cash on Delivery",  sub: "Pay when you receive" },
  { icon: "🔒", title: "100% Secure",       sub: "Safe & encrypted payments" },
];

const REVIEWS = [
  {
    name: "Ananya Sharma",
    location: "Mumbai",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&q=80",
    rating: 5,
    comment: "The Banarasi Saree quality exceeded my expectations! Delivered in 3 days with COD. Extremely satisfied with ShopSphere!",
    item: "Banarasi Pure Silk Saree"
  },
  {
    name: "Rohan Verma",
    location: "Delhi",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&q=80",
    rating: 5,
    comment: "Bought Sony noise-cancelling headphones at a unbeatable factory price. Original product with full brand warranty!",
    item: "Wireless Noise Cancelling Headphones"
  },
  {
    name: "Priya Nair",
    location: "Bengaluru",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&q=80",
    rating: 5,
    comment: "Super fast delivery and true to picture quality. Loving the shopping experience here!",
    item: "Floral Wrap Midi Dress"
  },
];

export default function Home() {
  const [user,           setUser]           = useState(null);
  const [loading,        setLoading]        = useState(true);
  const [products,       setProducts]       = useState([]);
  const [searchTerm,     setSearchTerm]     = useState("");
  const [activeTab,      setActiveTab]      = useState("All");
  const [copiedCoupon,   setCopiedCoupon]   = useState(false);
  const [timeLeft,       setTimeLeft]       = useState({ hours: 5, minutes: 42, seconds: 18 });

  // Address Section State on Homepage
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [activeAddress,  setActiveAddress]  = useState(null);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showAddForm,    setShowAddForm]    = useState(false);
  const [newAddr,        setNewAddr]        = useState({ fullName: "", phone: "", address: "", city: "", state: "", pincode: "" });

  const navigate = useNavigate();

  // Flash sale countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 5, minutes: 45, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");

    const fetchProfile = async () => {
      const localAddrs = JSON.parse(localStorage.getItem("savedAddresses")) || [];
      if (localAddrs.length > 0) {
        setSavedAddresses(localAddrs);
        setActiveAddress(localAddrs[0]);
      }

      if (!token) { setLoading(false); return; }
      try {
        const res  = await fetch(`${API_BASE_URL}/api/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) {
          setUser(data.user);
          const addrs = data.user?.addresses || localAddrs;
          setSavedAddresses(addrs);
          if (addrs.length > 0) {
            const def = addrs.find(a => a.isDefault) || addrs[0];
            setActiveAddress(def);
          }
          if (data.user?.role === "delivery") {
            navigate("/delivery-dashboard", { replace: true });
            return;
          }
        } else {
          localStorage.removeItem("token"); localStorage.removeItem("user");
          sessionStorage.removeItem("token"); sessionStorage.removeItem("user");
        }
      } catch { /* silent */ }
      finally { setLoading(false); }
    };

    const fetchProducts = async () => {
      try {
        const res  = await fetch(`${API_BASE_URL}/api/products?limit=500`);
        const data = await res.json();
        if (data.success) setProducts(data.products);
      } catch { /* silent */ }
    };

    fetchProfile();
    fetchProducts();
  }, []);

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");

    if (!newAddr.fullName || !newAddr.phone || !newAddr.address || !newAddr.city || !newAddr.pincode) {
      alert("Please fill all required delivery address fields.");
      return;
    }

    if (token) {
      try {
        const res = await fetch(`${API_BASE_URL}/api/auth/address`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ ...newAddr, isDefault: true })
        });
        const data = await res.json();
        if (data.success && data.addresses) {
          setSavedAddresses(data.addresses);
          const latest = data.addresses[data.addresses.length - 1];
          setActiveAddress(latest);
          localStorage.setItem("savedAddresses", JSON.stringify(data.addresses));
          setShowAddForm(false);
          setShowAddressModal(false);
          alert("📍 Delivery address saved to your account!");
          return;
        }
      } catch (err) {
        console.error("Save address error:", err);
      }
    }

    const updated = [...savedAddresses, { ...newAddr, isDefault: true }];
    setSavedAddresses(updated);
    setActiveAddress({ ...newAddr, isDefault: true });
    localStorage.setItem("savedAddresses", JSON.stringify(updated));
    setShowAddForm(false);
    setShowAddressModal(false);
    alert("📍 Delivery address saved!");
  };

  const handleLogout = () => {
    ["token","user"].forEach(k => {
      localStorage.removeItem(k); sessionStorage.removeItem(k);
    });
    setUser(null);
  };

  const addToCart = (product) => {
    const cart     = JSON.parse(localStorage.getItem("cart")) || [];
    const existing = cart.find(i => i._id === product._id);
    const updated  = existing
      ? cart.map(i => i._id === product._id ? { ...i, quantity: i.quantity + 1 } : i)
      : [...cart, { ...product, quantity: 1 }];
    localStorage.setItem("cart", JSON.stringify(updated));
  };

  const copyCoupon = () => {
    navigator.clipboard.writeText("SPHERE15");
    setCopiedCoupon(true);
    setTimeout(() => setCopiedCoupon(false), 2000);
  };

  if (loading) return (
    <div className="home-loading">
      <span className="home-spinner" />
      <p>Loading ShopSphere…</p>
    </div>
  );

  // Filtered products for Tabbed Section
  const tabProducts = activeTab === "All"
    ? products.slice(0, 10)
    : products.filter(p => p.category === activeTab).slice(0, 10);

  // Flash Sale Deals (highest discount)
  const flashSaleDeals = products
    .filter(p => p.oldPrice && p.oldPrice > p.price)
    .sort((a, b) => ((b.oldPrice - b.price) / b.oldPrice) - ((a.oldPrice - a.price) / a.oldPrice))
    .slice(0, 6);

  return (
    <div className="home-root">

      {/* ── Top Announcement Ticker Bar ── */}
      <div className="home-announcement-bar">
        <span>🔥 <strong>FESTIVAL MEGA SALE IS LIVE!</strong> Get Extra 15% OFF with code <code onClick={copyCoupon}>SPHERE15</code> | Free Delivery Across India 🚚</span>
      </div>

      {/* ── Header Navbar ── */}
      <Navbar user={user} handleLogout={handleLogout}
        searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

      <main>
        {/* ── 1. Hero Carousel ── */}
        <HeroBanner />

        {/* ── Delivery Location & Address Manager Strip ── */}
        <div style={{ background: "#ffffff", borderBottom: "1px solid #e2e8f0", padding: "10px 20px" }}>
          <div style={{ maxWidth: "1300px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "22px" }}>📍</span>
              <div>
                <div style={{ fontSize: "11px", fontWeight: 800, color: "#9333ea", textTransform: "uppercase", letterSpacing: "0.5px" }}>Deliver To:</div>
                <div style={{ fontSize: "13px", fontWeight: 800, color: "#0f172a" }}>
                  {activeAddress ? (
                    <span>{activeAddress.fullName || user?.name} — <strong>{activeAddress.city}, {activeAddress.pincode}</strong> ({activeAddress.address})</span>
                  ) : user ? (
                    <span>{user.name} — <em>No delivery address added yet</em></span>
                  ) : (
                    <span>Select your location for fast factory delivery</span>
                  )}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setShowAddressModal(true);
                if (savedAddresses.length === 0) {
                  setShowAddForm(true);
                  setNewAddr({ fullName: user?.name || "", phone: user?.phone || "", address: "", city: "", state: "", pincode: "" });
                }
              }}
              style={{ background: "#fdf2f8", border: "1.5px solid #f472b6", color: "#be185d", padding: "7px 16px", borderRadius: "20px", fontSize: "12px", fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
            >
              📍 {activeAddress ? "Change Delivery Address" : "➕ Add Delivery Address"}
            </button>
          </div>
        </div>

        {/* ── 2. Trust Promise Strip ── */}
        <div className="home-promise-strip">
          <div className="home-promise-inner">
            {PROMISES.map(p => (
              <div key={p.title} className="home-promise-item">
                <span className="home-promise-icon">{p.icon}</span>
                <div>
                  <strong>{p.title}</strong>
                  <p>{p.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── 3. Category Bubbles Explorer Section ── */}
        <section className="home-section home-cats-section">
          <div className="home-section-head">
            <div>
              <span className="home-eyebrow">Explore Collections</span>
              <h2 className="home-section-title">Shop by Category</h2>
            </div>
            <Link to="/catalogue" className="home-view-all-btn">View All 14 Categories →</Link>
          </div>

          <div className="home-cats-grid">
            {CATEGORIES.map(cat => {
              const catCount = products.filter(p => p.category === cat.slug).length;
              return (
                <div key={cat.slug} className="home-cat-card">
                  <Link
                    to={`/catalogue?category=${encodeURIComponent(cat.slug)}`}
                    className="home-cat-img-link"
                    style={{ background: cat.gradient }}
                  >
                    <img src={cat.image} alt={cat.name} loading="lazy" />
                    <span className="home-cat-count">
                      {catCount} items
                    </span>
                  </Link>
                  <p className="home-cat-name" style={{ color: cat.accent }}>{cat.name}</p>
                  <div className="home-cat-subs">
                    {cat.subs.slice(0, 2).map(s => (
                      <Link
                        key={s}
                        to={`/catalogue?category=${encodeURIComponent(cat.slug)}&sub=${encodeURIComponent(s)}`}
                        className="home-cat-sub-chip"
                      >
                        {s}
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── 4. Flash Sale Ticker Section ── */}
        <section className="home-section home-flash-section">
          <div className="home-flash-header">
            <div className="home-flash-title-wrap">
              <span className="home-flash-badge">⚡ LIMITED TIME ONLY</span>
              <h2>Flash Sale Deals</h2>
              <p>Grab top trending items at factory wholesale prices before stock runs out!</p>
            </div>
            <div className="home-timer-box">
              <span>Ending in:</span>
              <div className="home-timer-digits">
                <div><strong>{String(timeLeft.hours).padStart(2, '0')}</strong><small>hrs</small></div>
                <span>:</span>
                <div><strong>{String(timeLeft.minutes).padStart(2, '0')}</strong><small>mins</small></div>
                <span>:</span>
                <div><strong>{String(timeLeft.seconds).padStart(2, '0')}</strong><small>secs</small></div>
              </div>
            </div>
          </div>

          <div className="home-product-grid">
            {flashSaleDeals.map(p => (
              <ProductCard key={p._id} product={p} onAddToCart={addToCart} />
            ))}
          </div>
        </section>

        {/* ── 5. Tabbed Product Showcase ── */}
        <section className="home-section home-tabbed-section">
          <div className="home-section-head">
            <div>
              <span className="home-eyebrow">⚡ Handpicked Specials</span>
              <h2 className="home-section-title">Trending Right Now</h2>
            </div>
            <Link to="/catalogue" className="home-view-all-btn">Browse Full Catalogue →</Link>
          </div>

          {/* Category Filter Tabs */}
          <div className="home-tabs-wrap">
            {["All", "Ethnic Wear", "Electronics", "Western Dresses", "Menswear", "Footwear", "Beauty", "Home Decor", "Jewellery", "Bags", "Watches"].map((catName) => (
              <button
                key={catName}
                type="button"
                className={`home-tab-btn ${activeTab === catName ? "home-tab-btn--active" : ""}`}
                onClick={() => setActiveTab(catName)}
              >
                {catName === "All" ? "🔥 All Featured" : catName}
              </button>
            ))}
          </div>

          <div className="home-product-grid">
            {tabProducts.map((p) => (
              <ProductCard key={p._id} product={p} onAddToCart={addToCart} />
            ))}
          </div>
        </section>

        {/* ── 6. Promotional Feature Banner Grid ── */}
        <section className="home-section home-promo-grid-section">
          <div className="home-promo-grid">
            <div className="home-promo-card home-promo-card--ethnic">
              <div className="home-promo-content">
                <span className="home-promo-tag">FESTIVE EDIT</span>
                <h3>Royal Banarasi & Silk Sarees</h3>
                <p>Pure silk textures, intricate zari borders & rich festive colors.</p>
                <Link to="/catalogue?category=Ethnic%20Wear" className="home-promo-btn">Explore Ethnic Wear →</Link>
              </div>
            </div>
            <div className="home-promo-card home-promo-card--tech">
              <div className="home-promo-content">
                <span className="home-promo-tag">SMART TECH</span>
                <h3>Wireless Audio & Laptops</h3>
                <p>High performance gadgets with noise cancellation & fast charging.</p>
                <Link to="/catalogue?category=Electronics" className="home-promo-btn">Explore Electronics →</Link>
              </div>
            </div>
            <div className="home-promo-card home-promo-card--fashion">
              <div className="home-promo-content">
                <span className="home-promo-tag">TRENDING STYLES</span>
                <h3>Western Fashion & Bags</h3>
                <p>Midi dresses, party tops, leather totes & chic footwear.</p>
                <Link to="/catalogue?category=Western%20Dresses" className="home-promo-btn">Explore Western Dresses →</Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── 7. Category Spotlight Product Rows ── */}
        {["Electronics", "Ethnic Wear", "Western Dresses", "Menswear", "Footwear", "Home Decor", "Beauty", "Jewellery", "Bags", "Watches"].map(catSlug => {
          const catObj = CATEGORIES.find(c => c.slug === catSlug);
          const catProds = products.filter(p => p.category === catSlug).slice(0, 5);
          if (!catObj || catProds.length === 0) return null;

          return (
            <section key={catSlug} className="home-section home-cat-spotlight">
              <div className="home-section-head">
                <div>
                  <span className="home-eyebrow" style={{ color: catObj.accent }}>
                    {catObj.name} Collection
                  </span>
                  <h2 className="home-section-title">{catObj.name}</h2>
                  <div className="home-subcat-chips">
                    <Link
                      to={`/catalogue?category=${encodeURIComponent(catObj.slug)}`}
                      className="home-subcat-chip home-subcat-chip--all"
                      style={{ borderColor: catObj.accent, color: catObj.accent }}
                    >
                      All {catObj.name}
                    </Link>
                    {catObj.subs.map(s => (
                      <Link
                        key={s}
                        to={`/catalogue?category=${encodeURIComponent(catObj.slug)}&sub=${encodeURIComponent(s)}`}
                        className="home-subcat-chip"
                      >
                        {s}
                      </Link>
                    ))}
                  </div>
                </div>
                <Link
                  to={`/catalogue?category=${encodeURIComponent(catObj.slug)}`}
                  className="home-view-all-btn"
                  style={{ borderColor: catObj.accent, color: catObj.accent }}
                >
                  View All ({products.filter(p => p.category === catObj.slug).length}) →
                </Link>
              </div>

              <div className="home-product-grid">
                {catProds.map(p => (
                  <ProductCard key={p._id} product={p} onAddToCart={addToCart} />
                ))}
              </div>
            </section>
          );
        })}

        {/* ── 8. Customer Testimonials & Reviews ── */}
        <section className="home-section home-reviews-section">
          <div className="home-section-head" style={{ textAlign: "center", display: "block" }}>
            <span className="home-eyebrow">❤️ CUSTOMER LOVE</span>
            <h2 className="home-section-title">Loved by Over 50,000+ Shoppers</h2>
            <p className="home-section-subtitle">Real reviews from verified buyers across India</p>
          </div>

          <div className="home-reviews-grid">
            {REVIEWS.map(r => (
              <div key={r.name} className="home-review-card">
                <div className="home-review-user">
                  <img src={r.avatar} alt={r.name} className="home-review-avatar" />
                  <div>
                    <strong>{r.name}</strong>
                    <span>{r.location} • Verified Buyer</span>
                  </div>
                </div>
                <div className="home-review-stars">{"★".repeat(r.rating)}</div>
                <p className="home-review-comment">"{r.comment}"</p>
                <span className="home-review-item">Purchased: {r.item}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── 9. Newsletter Coupon Unlock ── */}
        <section className="home-newsletter-section">
          <div className="home-newsletter-inner">
            <span className="home-newsletter-badge">🎁 SPECIAL GIFT</span>
            <h2>Unlock Extra 15% Discount</h2>
            <p>Use code <strong onClick={copyCoupon} style={{ cursor: "pointer", color: "#f43397", textDecoration: "underline" }}>SPHERE15</strong> at checkout for instant savings on your first purchase.</p>
            <div className="home-newsletter-box">
              <input type="email" placeholder="Enter your email address…" />
            </div>
          </div>
        </section>

      {/* ── Homepage Delivery Address Management Modal ── */}
      {showAddressModal && (
        <div className="chk-modal-backdrop" style={{ zIndex: 9999 }}>
          <div className="chk-modal-card" style={{ maxWidth: "520px", textAlign: "left", padding: "24px", borderRadius: "20px", background: "#ffffff" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h2 className="chk-modal-title" style={{ margin: 0, fontSize: "18px" }}>📍 Manage Delivery Address</h2>
              <button
                type="button"
                onClick={() => setShowAddressModal(false)}
                style={{ background: "#f1f5f9", border: "none", width: "32px", height: "32px", borderRadius: "50%", fontWeight: 900, cursor: "pointer" }}
              >
                ✕
              </button>
            </div>

            {savedAddresses.length > 0 && !showAddForm && (
              <div>
                <div style={{ fontSize: "12px", fontWeight: 800, color: "#64748b", marginBottom: "10px" }}>
                  Select Active Delivery Address:
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "16px" }}>
                  {savedAddresses.map((addr, idx) => {
                    const isSelected = activeAddress?.address === addr.address;
                    return (
                      <div
                        key={idx}
                        onClick={() => { setActiveAddress(addr); setShowAddressModal(false); }}
                        style={{
                          border: `2px solid ${isSelected ? "#9333ea" : "#cbd5e1"}`,
                          background: isSelected ? "#fdf2f8" : "#ffffff",
                          padding: "12px 14px",
                          borderRadius: "12px",
                          cursor: "pointer"
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800, fontSize: "14px", color: "#0f172a" }}>
                          <span>{addr.fullName || user?.name}</span>
                          {isSelected && <span style={{ color: "#9333ea", fontSize: "12px" }}>✓ Active Location</span>}
                        </div>
                        <div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>📞 {addr.phone}</div>
                        <div style={{ fontSize: "12px", color: "#334155", marginTop: "4px" }}>
                          {addr.address}, <strong>{addr.city}, {addr.state} - {addr.pincode}</strong>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(true);
                    setNewAddr({ fullName: user?.name || "", phone: user?.phone || "", address: "", city: "", state: "", pincode: "" });
                  }}
                  style={{ width: "100%", background: "#fdf2f8", color: "#be185d", border: "1.5px dashed #f472b6", padding: "10px", borderRadius: "10px", fontWeight: 800, cursor: "pointer" }}
                >
                  ➕ Add New Delivery Address
                </button>
              </div>
            )}

            {(savedAddresses.length === 0 || showAddForm) && (
              <form onSubmit={handleSaveAddress}>
                <div style={{ fontSize: "13px", fontWeight: 800, color: "#9333ea", marginBottom: "12px" }}>
                  Enter Delivery Address Details:
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "10px" }}>
                  <div>
                    <label style={{ fontSize: "11px", fontWeight: 800, color: "#475569" }}>Full Name *</label>
                    <input
                      type="text"
                      className="chk-input"
                      value={newAddr.fullName}
                      onChange={(e) => setNewAddr({ ...newAddr, fullName: e.target.value })}
                      placeholder="Full Name"
                      required
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: "11px", fontWeight: 800, color: "#475569" }}>Mobile Phone *</label>
                    <input
                      type="tel"
                      className="chk-input"
                      value={newAddr.phone}
                      onChange={(e) => setNewAddr({ ...newAddr, phone: e.target.value })}
                      placeholder="10-digit Phone"
                      required
                    />
                  </div>
                </div>

                <div style={{ marginBottom: "10px" }}>
                  <label style={{ fontSize: "11px", fontWeight: 800, color: "#475569" }}>House No., Street &amp; Area *</label>
                  <input
                    type="text"
                    className="chk-input"
                    value={newAddr.address}
                    onChange={(e) => setNewAddr({ ...newAddr, address: e.target.value })}
                    placeholder="Flat/House No., Colony, Street, Landmark"
                    required
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", marginBottom: "14px" }}>
                  <div>
                    <label style={{ fontSize: "11px", fontWeight: 800, color: "#475569" }}>City *</label>
                    <input
                      type="text"
                      className="chk-input"
                      value={newAddr.city}
                      onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                      placeholder="City"
                      required
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: "11px", fontWeight: 800, color: "#475569" }}>State *</label>
                    <input
                      type="text"
                      className="chk-input"
                      value={newAddr.state}
                      onChange={(e) => setNewAddr({ ...newAddr, state: e.target.value })}
                      placeholder="State"
                      required
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: "11px", fontWeight: 800, color: "#475569" }}>Pincode *</label>
                    <input
                      type="text"
                      className="chk-input"
                      value={newAddr.pincode}
                      onChange={(e) => setNewAddr({ ...newAddr, pincode: e.target.value })}
                      placeholder="6-digit Pincode"
                      required
                    />
                  </div>
                </div>

                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    type="submit"
                    style={{ flex: 1, background: "#10b981", color: "#ffffff", border: "none", padding: "10px", borderRadius: "10px", fontWeight: 900, cursor: "pointer" }}
                  >
                    💾 Save Delivery Address
                  </button>
                  {savedAddresses.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      style={{ background: "#f1f5f9", color: "#475569", border: "1px solid #cbd5e1", padding: "10px 16px", borderRadius: "10px", fontWeight: 800, cursor: "pointer" }}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      </main>

      <Footer />
    </div>
  );
}
