import { API_BASE_URL } from "../config/apiConfig";
import { useState, useRef, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/navbar.css";

const NAV_CATEGORIES = [
  {
    label: "All", value: "",
    icon: "🛍️",
    desc: "Explore all products across 14 categories",
    subs: []
  },
  {
    label: "Ethnic Wear", value: "Ethnic Wear",
    icon: "🥻",
    image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&q=80",
    desc: "Handcrafted Banarasi Sarees, Embroidered Kurtis, Lehengas & Suits",
    subs: ["Sarees", "Kurtis", "Kurti Sets", "Lehengas", "Suit Sets", "Dupatta Sets"]
  },
  {
    label: "Western Dresses", value: "Western Dresses",
    icon: "👗",
    image: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=400&q=80",
    desc: "Midi dresses, party bodysuits, maxi gowns & jumpsuits",
    subs: ["Midi Dresses", "Party Dresses", "Maxi Dresses", "Shirt Dresses", "Casual Dresses", "Mini Dresses", "Jumpsuits", "Co-ord Sets"]
  },
  {
    label: "Menswear", value: "Menswear",
    icon: "👔",
    image: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400&q=80",
    desc: "Formal shirts, casual linen tees, dark wash jeans & ethnic kurtas",
    subs: ["Formal Shirts", "Casual Shirts", "Jeans", "Trousers", "T-Shirts", "Ethnic Kurta", "Sweatshirts", "Blazers", "Jackets", "Sherwani"]
  },
  {
    label: "Footwear", value: "Footwear",
    icon: "👟",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80",
    desc: "Running sneakers, leather oxfords, block heels & Kolhapuris",
    subs: ["Sports Shoes", "Heels", "Formal Shoes", "Ethnic Footwear", "Casual Shoes", "Flats", "Boots"]
  },
  {
    label: "Home Decor", value: "Home Decor",
    icon: "🛋️",
    image: "https://images.unsplash.com/photo-1616046229478-9901c5536a45?w=400&q=80",
    desc: "Wall hangings, velvet cushions, non-stick cookware & bedding",
    subs: ["Wall Decor", "Cushions & Pillows", "Cookware", "Bedding", "Lighting", "Planters", "Rugs & Carpets", "Candles & Fragrance", "Storage"]
  },
  {
    label: "Beauty", value: "Beauty",
    icon: "💄",
    image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&q=80",
    desc: "Vitamin C serums, matte lipsticks, hair oils & luxury EDP perfumes",
    subs: ["Serums", "Lip Makeup", "Moisturisers", "Hair Care", "Fragrances", "Eye Makeup", "Skin Care", "Face Masks"]
  },
  {
    label: "Accessories", value: "Accessories",
    icon: "🕶️",
    image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&q=80",
    desc: "Polarized aviators, RFID leather wallets, silk scarves & hair pins",
    subs: ["Sunglasses", "Wallets & Belts", "Scarves & Caps", "Hair Accessories"]
  },
  {
    label: "Grocery", value: "Grocery",
    icon: "🛒",
    image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&q=80",
    desc: "Basmati rice, pure A2 cow ghee, organic spices & chia seeds",
    subs: ["Rice & Grains", "Oils & Ghee", "Tea & Coffee", "Spices & Masala", "Dry Fruits & Nuts", "Sweeteners", "Superfoods", "Flour & Atta", "Breakfast & Cereals"]
  },
  {
    label: "Electronics", value: "Electronics",
    icon: "🎧",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80",
    desc: "Wireless ANC headphones, laptops, smartwatches & power banks",
    subs: ["Wireless Headphones", "Laptops", "Smartwatches", "Smartphones", "Portable Speakers", "Power Banks"]
  },
  {
    label: "Kids & Toys", value: "Kids & Toys",
    icon: "🧸",
    image: "https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=400&q=80",
    desc: "Wooden blocks, plush teddy bears, remote control cars & kids apparel",
    subs: ["Boys Wear", "Girls Wear", "Educational Toys", "Soft Toys", "Action Figures", "Board Games"]
  },
  {
    label: "Sports & Fitness", value: "Sports & Fitness",
    icon: "🧘",
    image: "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400&q=80",
    desc: "Eco yoga mats, hex dumbbells, gym t-shirts & cricket bats",
    subs: ["Yoga Mats", "Dumbbells & Weights", "Sportswear", "Gym Accessories", "Cricket Gear", "Fitness Trackers"]
  },
  {
    label: "Jewellery", value: "Jewellery",
    icon: "💎",
    image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&q=80",
    desc: "Gold plated Kundan chokers, silver zircon rings & oxidised jhumkas",
    subs: ["Gold Plated Necklaces", "Rings", "Earrings", "Bracelets", "Bangles", "Silver Jewellery"]
  },
  {
    label: "Bags", value: "Bags",
    icon: "👜",
    image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&q=80",
    desc: "Faux leather totes, 30L laptop backpacks & canvas travel duffles",
    subs: ["Tote Bags", "Backpacks", "Sling Bags", "Travel Duffle Bags", "Handbags", "Laptop Sleeves"]
  },
  {
    label: "Watches", value: "Watches",
    icon: "⌚",
    image: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=400&q=80",
    desc: "Chronographs, leather analog watches & AMOLED call smartwatches",
    subs: ["Chronograph Watches", "Analog Leather Watches", "Smartwatches", "Digital Sports Watches", "Luxury Steel Watches"]
  },
];

function Navbar({ user: propUser, handleLogout, searchTerm: externalSearchTerm, setSearchTerm: externalSetSearchTerm, cartCount = 0 }) {
  const user = propUser || JSON.parse(localStorage.getItem("user")) || JSON.parse(sessionStorage.getItem("user")) || null;
  const [activeCategory, setActiveCategory]     = useState("All");
  const [hoveredCatLabel, setHoveredCatLabel]   = useState(null);
  const [showProfile, setShowProfile]           = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [localSearchTerm, setLocalSearchTerm]   = useState(externalSearchTerm || "");
  const [productsList, setProductsList]         = useState([]);
  const [showSuggestions, setShowSuggestions]   = useState(false);

  // Address Location State in Navbar
  const [savedAddresses, setSavedAddresses]     = useState([]);
  const [activeAddress, setActiveAddress]       = useState(null);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showAddForm, setShowAddForm]           = useState(false);
  const [newAddr, setNewAddr]                   = useState({ fullName: "", phone: "", address: "", city: "", state: "", pincode: "" });

  const profileRef          = useRef(null);
  const headerRef           = useRef(null);
  const searchContainerRef  = useRef(null);
  const navigate            = useNavigate();

  const loadAddresses = () => {
    const localUser = JSON.parse(localStorage.getItem("user")) || null;
    const addrs = user?.addresses || localUser?.addresses || JSON.parse(localStorage.getItem("savedAddresses")) || [];
    setSavedAddresses(addrs);
    if (addrs.length > 0) {
      const def = addrs.find(a => a.isDefault) || addrs[0];
      setActiveAddress(def);
    }
  };

  useEffect(() => {
    loadAddresses();
    window.addEventListener("addressChanged", loadAddresses);
    return () => window.removeEventListener("addressChanged", loadAddresses);
  }, [user]);

  const handleSaveNavbarAddress = async (e) => {
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
          if (data.user) {
            localStorage.setItem("user", JSON.stringify(data.user));
          }
          window.dispatchEvent(new Event("addressChanged"));
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
    window.dispatchEvent(new Event("addressChanged"));
    setShowAddForm(false);
    setShowAddressModal(false);
    alert("📍 Delivery address saved!");
  };

  // Load products list for live search suggestions on mount
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/products?limit=200`);
        const data = await res.json();
        if (isMounted && res.ok && data.products) {
          setProductsList(data.products);
        }
      } catch (e) {
        console.log("Error loading suggestions products:", e);
      }
    })();
    return () => { isMounted = false; };
  }, []);

  // Close search suggestions when clicking outside
  useEffect(() => {
    function handleOutsideSearch(e) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleOutsideSearch);
    return () => document.removeEventListener("mousedown", handleOutsideSearch);
  }, []);

  // Keep local search term in sync if external prop changes
  useEffect(() => {
    if (externalSearchTerm !== undefined) {
      setLocalSearchTerm(externalSearchTerm || "");
    }
  }, [externalSearchTerm]);

  const effectiveSearchTerm = externalSearchTerm !== undefined ? externalSearchTerm : localSearchTerm;

  const handleSearchInputChange = (e) => {
    const val = e.target.value;
    setLocalSearchTerm(val);
    setShowSuggestions(true);
    if (typeof externalSetSearchTerm === "function") {
      externalSetSearchTerm(val);
    }
  };

  const executeSearch = () => {
    const term = String(effectiveSearchTerm || "").trim();
    setShowSuggestions(false);
    if (term) {
      navigate(`/catalogue?search=${encodeURIComponent(term)}`);
    } else {
      navigate("/catalogue");
    }
    setMobileSearchOpen(false);
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter") {
      executeSearch();
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  // Compute live product suggestions
  const matchingProducts = useMemo(() => {
    const term = String(effectiveSearchTerm || "").trim().toLowerCase();
    if (!term || term.length < 1) return [];
    return productsList
      .filter((p) =>
        p.name?.toLowerCase().includes(term) ||
        p.category?.toLowerCase().includes(term) ||
        p.subCategory?.toLowerCase().includes(term) ||
        p.brand?.toLowerCase().includes(term)
      )
      .slice(0, 5);
  }, [effectiveSearchTerm, productsList]);

  // Compute live category/subcategory tag suggestions
  const matchingCategoryTags = useMemo(() => {
    const term = String(effectiveSearchTerm || "").trim().toLowerCase();
    if (!term || term.length < 1) return [];
    const tags = [];
    NAV_CATEGORIES.forEach((cat) => {
      if (cat.label !== "All" && cat.label.toLowerCase().includes(term)) {
        tags.push({ label: cat.label, category: cat.value, sub: "" });
      }
      cat.subs?.forEach((sub) => {
        if (sub.toLowerCase().includes(term)) {
          tags.push({ label: `${sub} (${cat.label})`, category: cat.value, sub });
        }
      });
    });
    return tags.slice(0, 4);
  }, [effectiveSearchTerm]);

  const hasSuggestions = matchingProducts.length > 0 || matchingCategoryTags.length > 0;

  const handleSelectProduct = (productId) => {
    setShowSuggestions(false);
    navigate(`/product/${productId}`);
  };

  const handleSelectCategoryTag = (catVal, subVal) => {
    setShowSuggestions(false);
    if (subVal) {
      navigate(`/catalogue?category=${encodeURIComponent(catVal)}&sub=${encodeURIComponent(subVal)}`);
    } else {
      navigate(`/catalogue?category=${encodeURIComponent(catVal)}`);
    }
  };

  // Active hovered category object
  const hoveredCatObj = NAV_CATEGORIES.find(c => c.label === hoveredCatLabel);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    function handleOutsideClick(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfile(false);
      }
    }
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const handleCategoryClick = (cat) => {
    setActiveCategory(cat.label);
    setHoveredCatLabel(null);
    navigate(cat.value ? `/catalogue?category=${encodeURIComponent(cat.value)}` : "/catalogue");
  };

  const handleSubClick = (categoryValue, subName) => {
    setActiveCategory(categoryValue);
    setHoveredCatLabel(null);
    navigate(`/catalogue?category=${encodeURIComponent(categoryValue)}&sub=${encodeURIComponent(subName)}`);
  };

  const onLogout = () => {
    setShowProfile(false);
    if (typeof handleLogout === "function") {
      handleLogout();
    }
  };

  return (
    <header className="nb-header" ref={headerRef} onMouseLeave={() => setHoveredCatLabel(null)}>

      {/* ── Top bar ── */}
      <div className="nb-topbar">
        <div className="nb-inner">

          {/* Logo */}
          <Link to="/" className="nb-logo">
            <span className="nb-logo-icon">🛍️</span>
            <span className="nb-logo-text">ShopSphere</span>
          </Link>

          {/* Delivery Location Selector Widget in Navbar (Shown to customers/guests) */}
          {(!user || user?.role === "user") && (
            <button
              type="button"
              className="nb-location-widget nb-hide-sm"
              onClick={() => {
                setShowAddressModal(true);
                if (savedAddresses.length === 0) {
                  setShowAddForm(true);
                  setNewAddr({ fullName: user?.name || "", phone: user?.phone || "", address: "", city: "", state: "", pincode: "" });
                }
              }}
            >
              <span className="nb-location-icon">📍</span>
              <div className="nb-location-text">
                <span className="nb-location-label">
                  {activeAddress ? `Deliver to ${activeAddress.fullName?.split(" ")[0] || user?.name || "Customer"}` : "Select Location"}
                </span>
                <span className="nb-location-value">
                  {activeAddress ? `${activeAddress.city} ${activeAddress.pincode}` : "Add Address ▾"}
                </span>
              </div>
            </button>
          )}

          {/* Search — desktop */}
          <div className="nb-search-wrap" ref={searchContainerRef}>
            <div className="nb-search">
              <span className="nb-search-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              </span>
              <input
                type="text"
                placeholder="Search sarees, kurtis, shoes and more..."
                value={effectiveSearchTerm}
                onChange={handleSearchInputChange}
                onFocus={() => setShowSuggestions(true)}
                onKeyDown={handleSearchKeyDown}
                aria-label="Search products"
              />
              <button className="nb-search-btn" onClick={executeSearch} type="button">
                Search
              </button>
            </div>

            {/* Live Autocomplete Suggestions Dropdown */}
            {showSuggestions && String(effectiveSearchTerm || "").trim().length >= 1 && (
              <div className="nb-suggestions-dropdown">
                {matchingCategoryTags.length > 0 && (
                  <div>
                    <div className="nb-suggestion-header">Categories &amp; Trending Searches</div>
                    {matchingCategoryTags.map((tag, idx) => (
                      <div
                        key={idx}
                        className="nb-suggestion-tag"
                        onClick={() => handleSelectCategoryTag(tag.category, tag.sub)}
                      >
                        <span>🔍</span>
                        <span>{tag.label}</span>
                      </div>
                    ))}
                  </div>
                )}

                {matchingProducts.length > 0 && (
                  <div>
                    <div className="nb-suggestion-header">Matching Products</div>
                    {matchingProducts.map((prod) => (
                      <div
                        key={prod._id}
                        className="nb-suggestion-item"
                        onClick={() => handleSelectProduct(prod._id)}
                      >
                        <img
                          src={prod.images?.[0] || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&q=80"}
                          alt={prod.name}
                          className="nb-suggestion-img"
                        />
                        <div className="nb-suggestion-details">
                          <div className="nb-suggestion-title">{prod.name}</div>
                          <div className="nb-suggestion-meta">
                            <span className="nb-suggestion-price">₹{prod.price?.toLocaleString("en-IN")}</span>
                            {prod.category && <span className="nb-suggestion-cat">{prod.category}</span>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {!hasSuggestions && (
                  <div style={{ padding: "16px", textAlign: "center", color: "#64748b", fontSize: "13px" }}>
                    No quick suggestions found for "<strong>{effectiveSearchTerm}</strong>"
                  </div>
                )}

                <button className="nb-suggestion-all-btn" onClick={executeSearch} type="button">
                  <span>See all matching results in Catalogue →</span>
                </button>
              </div>
            )}
          </div>

          {/* Right actions */}
          <nav className="nb-actions" aria-label="Site navigation">

            {/* Mobile search toggle */}
            <button
              className="nb-icon-btn nb-mobile-search-toggle"
              onClick={() => setMobileSearchOpen((v) => !v)}
              type="button"
              aria-label="Toggle search"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </button>

            {/* Supplier / Admin / Vendor Portal (Become a Seller hidden when logged in as User) */}
            {user?.role === "admin" ? (
              <Link to="/admin-dashboard" className="nb-action-link nb-hide-sm">
                <span className="nb-action-icon">🛡️</span>
                <span>Admin Portal</span>
              </Link>
            ) : user?.role === "vendor" ? (
              <Link to="/vendor-dashboard" className="nb-action-link nb-hide-sm">
                <span className="nb-action-icon">🏪</span>
                <span>Vendor Dashboard</span>
              </Link>
            ) : !user ? (
              <Link to="/sell-online" className="nb-action-link nb-hide-sm">
                <span className="nb-action-icon">🏪</span>
                <span>Become a Seller</span>
              </Link>
            ) : null}

            {/* Delivery Partner Hub (Shown ONLY to Delivery Executives or Admin) */}
            {(user?.role === "delivery" || user?.role === "admin") && (
              <Link to="/delivery-dashboard" className="nb-action-link nb-hide-sm">
                <span className="nb-action-icon">🚚</span>
                <span>Delivery Hub</span>
              </Link>
            )}

            {/* Profile */}
            <div className="nb-profile-wrap" ref={profileRef}>
              <button
                className="nb-action-link nb-profile-trigger"
                type="button"
                onClick={() => setShowProfile((v) => !v)}
                aria-haspopup="true"
                aria-expanded={showProfile}
              >
                <span className="nb-action-icon">
                  {user ? (
                    <span className="nb-avatar">
                      {((user.name || user.email || "U").charAt(0) || "U").toUpperCase()}
                    </span>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  )}
                </span>
                <span className="nb-hide-sm">{user ? ((user.name || user.email || "User").split(" ")[0]) : "Profile"}</span>
                <svg className="nb-chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>
              </button>

              {showProfile && (
                <div className="nb-dropdown" role="menu">
                  {user ? (
                    <>
                      <div className="nb-dropdown-user">
                        <span className="nb-dropdown-avatar">
                          {((user.name || user.email || "U").charAt(0) || "U").toUpperCase()}
                        </span>
                        <div>
                          <strong>{user.name || user.email || "User"}</strong>
                          <p>{user.email || ""}</p>
                        </div>
                      </div>
                      <div className="nb-dropdown-divider" />
                      {user?.role === "admin" && (
                        <Link to="/admin-dashboard" className="nb-dropdown-item" onClick={() => setShowProfile(false)} style={{ color: "#f43397", fontWeight: 800 }}>
                          <span>👑</span> Admin Dashboard
                        </Link>
                      )}
                      {user?.role === "vendor" && (
                        <Link to="/vendor-dashboard" className="nb-dropdown-item" onClick={() => setShowProfile(false)} style={{ color: "#9333ea", fontWeight: 800 }}>
                          <span>🏪</span> Vendor Dashboard
                        </Link>
                      )}
                      {(!user || user?.role === "user") && (
                        <Link to="/my-orders" className="nb-dropdown-item" onClick={() => setShowProfile(false)}>
                          <span>📦</span> My Orders
                        </Link>
                      )}
                      <div className="nb-dropdown-divider" />
                      <button type="button" className="nb-dropdown-item nb-logout-item" onClick={onLogout}>
                        <span>🚪</span> Logout
                      </button>
                    </>
                  ) : (
                    <div className="nb-dropdown-guest">
                      <p className="nb-dropdown-guest-title">Welcome to ShopSphere</p>
                      <p className="nb-dropdown-guest-sub">Login to access orders &amp; reselling</p>
                      <Link to="/login" className="nb-dropdown-login-btn" onClick={() => setShowProfile(false)}>
                        Login / Sign Up
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* My Orders & Cart (Customer Only) */}
            {(!user || user?.role === "user") && (
              <>
                <Link to="/my-orders" className="nb-orders-btn" title="My Orders & Live Tracking">
                  <span style={{ fontSize: "1.2rem" }}>📦</span>
                  <span className="nb-hide-sm">Orders</span>
                </Link>

                <Link to="/cart" className="nb-cart-btn" aria-label={`Cart, ${cartCount} items`}>
                  <span className="nb-cart-icon-wrap">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
                    {cartCount > 0 && (
                      <span className="nb-cart-badge">{cartCount > 99 ? "99+" : cartCount}</span>
                    )}
                  </span>
                  <span className="nb-hide-sm">Cart</span>
                </Link>
              </>
            )}

          </nav>
        </div>

        {/* Mobile search bar */}
        {mobileSearchOpen && (
          <div className="nb-mobile-search">
            <div className="nb-mobile-search-inner">
              <input
                type="text"
                placeholder="Search products..."
                value={effectiveSearchTerm}
                onChange={handleSearchInputChange}
                onKeyDown={handleSearchKeyDown}
                autoFocus
              />
              <button type="button" onClick={executeSearch} className="nb-search-btn">
                Search
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Category strip ── */}
      <nav className="nb-cat-strip" aria-label="Product categories">
        <div className="nb-cat-inner">
          {NAV_CATEGORIES.map((cat) => {
            const isHovered = hoveredCatLabel === cat.label;
            const hasSubs   = cat.subs && cat.subs.length > 0;

            return (
              <div
                key={cat.label}
                className="nb-cat-item-wrap"
                onMouseEnter={() => setHoveredCatLabel(cat.label)}
              >
                <button
                  type="button"
                  className={`nb-cat-btn${activeCategory === cat.label ? " nb-cat-btn--active" : ""}${isHovered ? " nb-cat-btn--hovered" : ""}`}
                  onClick={() => handleCategoryClick(cat)}
                >
                  <span>{cat.label}</span>
                  {hasSubs && <span className="nb-cat-caret">▾</span>}
                </button>
              </div>
            );
          })}
        </div>
      </nav>

      {/* ── MEGA MENU PANEL DROPDOWN ── */}
      {hoveredCatObj && hoveredCatObj.subs && hoveredCatObj.subs.length > 0 && (
        <div
          className="nb-mega-panel"
          onMouseEnter={() => setHoveredCatLabel(hoveredCatObj.label)}
          onMouseLeave={() => setHoveredCatLabel(null)}
        >
          <div className="nb-mega-panel-inner">

            {/* Column 1: Category Info */}
            <div className="nb-mega-col-info">
              <div className="nb-mega-icon">{hoveredCatObj.icon}</div>
              <h3>{hoveredCatObj.label}</h3>
              <p>{hoveredCatObj.desc}</p>
              <button
                type="button"
                className="nb-mega-all-btn"
                onClick={() => handleCategoryClick(hoveredCatObj)}
              >
                Shop All {hoveredCatObj.label} →
              </button>
            </div>

            {/* Column 2: Subcategories Grid */}
            <div className="nb-mega-col-subs">
              <span className="nb-mega-eyebrow">POPULAR SUBCATEGORIES</span>
              <div className="nb-mega-subs-grid">
                {hoveredCatObj.subs.map((sub) => (
                  <button
                    key={sub}
                    type="button"
                    className="nb-mega-sub-chip"
                    onClick={() => handleSubClick(hoveredCatObj.value, sub)}
                  >
                    <span className="nb-mega-dot">•</span>
                    <span>{sub}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Column 3: Featured Preview Card */}
            {hoveredCatObj.image && (
              <div className="nb-mega-col-image">
                <img src={hoveredCatObj.image} alt={hoveredCatObj.label} />
                <div className="nb-mega-image-overlay">
                  <span>Factory Wholesale Rates</span>
                  <strong>{hoveredCatObj.label} Collection</strong>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* ── Navbar Delivery Address Management Modal Overlay ── */}
      {showAddressModal && (
        <div className="chk-modal-backdrop" style={{ zIndex: 99999 }}>
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
                        onClick={() => {
                          setActiveAddress(addr);
                          setShowAddressModal(false);
                          window.dispatchEvent(new Event("addressChanged"));
                        }}
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
              <form onSubmit={handleSaveNavbarAddress}>
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

    </header>
  );
}

export default Navbar;
