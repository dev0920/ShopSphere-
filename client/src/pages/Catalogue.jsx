import { API_BASE_URL } from "../config/apiConfig";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import "./Catalogue.css";

const CATEGORY_SUBS = {
  "Ethnic Wear":     ["Sarees","Kurtis","Kurti Sets","Lehengas","Suit Sets","Dupatta Sets"],
  "Western Dresses": ["Midi Dresses","Party Dresses","Maxi Dresses","Shirt Dresses","Casual Dresses","Mini Dresses","Jumpsuits","Co-ord Sets"],
  "Menswear":        ["Formal Shirts","Casual Shirts","Jeans","Trousers","T-Shirts","Ethnic Kurta","Sweatshirts","Blazers","Jackets","Sherwani"],
  "Footwear":        ["Sports Shoes","Heels","Formal Shoes","Ethnic Footwear","Casual Shoes","Flats","Boots"],
  "Home Decor":      ["Wall Decor","Cushions & Pillows","Cookware","Bedding","Lighting","Planters","Rugs & Carpets","Candles & Fragrance","Storage"],
  "Beauty":          ["Serums","Lip Makeup","Moisturisers","Hair Care","Fragrances","Eye Makeup","Skin Care","Face Masks","Face Makeup","Nail Care","Sunscreen","Body Care","Beauty Tools"],
  "Accessories":     ["Sunglasses","Wallets & Belts","Scarves & Caps","Hair Accessories"],
  "Grocery":         ["Rice & Grains","Oils & Ghee","Tea & Coffee","Spices & Masala","Dry Fruits & Nuts","Sweeteners","Superfoods","Flour & Atta","Breakfast & Cereals"],
  "Electronics":     ["Wireless Headphones","Laptops","Smartwatches","Smartphones","Portable Speakers","Power Banks"],
  "Kids & Toys":     ["Boys Wear","Girls Wear","Educational Toys","Soft Toys","Action Figures","Board Games"],
  "Sports & Fitness":["Yoga Mats","Dumbbells & Weights","Sportswear","Gym Accessories","Cricket Gear","Fitness Trackers"],
  "Jewellery":        ["Gold Plated Necklaces","Rings","Earrings","Bracelets","Bangles","Silver Jewellery"],
  "Bags":             ["Tote Bags","Backpacks","Sling Bags","Travel Duffle Bags","Handbags","Laptop Sleeves"],
  "Watches":          ["Chronograph Watches","Analog Leather Watches","Smartwatches","Digital Sports Watches","Luxury Steel Watches"],
};

const ALL_CATS = ["All", ...Object.keys(CATEGORY_SUBS)];

const SORT_OPTIONS = [
  { value: "relevance",  label: "Relevance" },
  { value: "lowToHigh",  label: "Price: Low to High" },
  { value: "highToLow",  label: "Price: High to Low" },
  { value: "rating",     label: "Highest Rated" },
  { value: "newest",     label: "Newest First" },
];

export default function Catalogue() {
  const [products,    setProducts]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState("");
  const [cartCount,   setCartCount]   = useState(0);
  const [toast,       setToast]       = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Filters
  const [selectedCat,  setSelectedCat]  = useState("All");
  const [selectedSub,  setSelectedSub]  = useState("All");
  const [priceRange,   setPriceRange]   = useState([0, 10000]);
  const [minRating,    setMinRating]    = useState(0);
  const [sortBy,       setSortBy]       = useState("relevance");
  const [searchText,   setSearchText]   = useState("");
  const [inStockOnly,  setInStockOnly]  = useState(false);

  const [searchParams] = useSearchParams();
  const navigate       = useNavigate();
  const catFromUrl     = searchParams.get("category") || "All";
  const subFromUrl     = searchParams.get("sub")      || "All";
  const searchFromUrl  = searchParams.get("search")   || "";

  // Sync URL params → state
  useEffect(() => {
    setSelectedCat(catFromUrl);
    setSelectedSub(subFromUrl);
    setSearchText(searchFromUrl);
  }, [catFromUrl, subFromUrl, searchFromUrl]);

  useEffect(() => {
    const cart  = JSON.parse(localStorage.getItem("cart")) || [];
    setCartCount(cart.reduce((t, i) => t + i.quantity, 0));

    (async () => {
      try {
        const res  = await fetch(`${API_BASE_URL}/api/products?limit=500`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        setProducts(data.products);
      } catch (e) {
        setError("Could not load products. Is the server running?");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const addToCart = (product) => {
    const cart     = JSON.parse(localStorage.getItem("cart")) || [];
    const existing = cart.find(i => i._id === product._id);
    const updated  = existing
      ? cart.map(i => i._id === product._id ? { ...i, quantity: i.quantity + 1 } : i)
      : [...cart, { ...product, quantity: 1 }];
    localStorage.setItem("cart", JSON.stringify(updated));
    setCartCount(updated.reduce((t, i) => t + i.quantity, 0));
    setToast(`✓ Added "${product.name}" to Cart!`);
    setTimeout(() => setToast(""), 2000);
  };

  const handleCatChange = (cat) => {
    setSelectedCat(cat);
    setSelectedSub("All");
    navigate(cat === "All" ? "/catalogue" : `/catalogue?category=${encodeURIComponent(cat)}`);
  };

  const handleSubChange = (sub) => {
    setSelectedSub(sub);
    if (sub === "All") navigate(`/catalogue?category=${encodeURIComponent(selectedCat)}`);
    else navigate(`/catalogue?category=${encodeURIComponent(selectedCat)}&sub=${encodeURIComponent(sub)}`);
  };

  const clearFilters = () => {
    setSelectedCat("All"); setSelectedSub("All");
    setPriceRange([0, 10000]); setMinRating(0);
    setSortBy("relevance"); setSearchText("");
    setInStockOnly(false);
    navigate("/catalogue");
  };

  const filtered = useMemo(() => {
    let r = [...products];

    if (selectedCat !== "All")
      r = r.filter(p => p.category?.toLowerCase() === selectedCat.toLowerCase());
    if (selectedSub !== "All")
      r = r.filter(p => p.subCategory?.toLowerCase() === selectedSub.toLowerCase());
    if (searchText.trim()) {
      const q = searchText.trim().toLowerCase();
      r = r.filter(p =>
        p.name?.toLowerCase().includes(q) ||
        p.brand?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q) ||
        p.subCategory?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q)
      );
    }

    r = r.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);

    if (minRating > 0)
      r = r.filter(p => (p.rating || 0) >= minRating);

    if (inStockOnly)
      r = r.filter(p => !p.stock || p.stock > 0);

    if (sortBy === "lowToHigh")  r.sort((a, b) => a.price - b.price);
    if (sortBy === "highToLow")  r.sort((a, b) => b.price - a.price);
    if (sortBy === "rating")     r.sort((a, b) => (b.rating||0) - (a.rating||0));
    if (sortBy === "newest")     r.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return r;
  }, [products, selectedCat, selectedSub, searchText, priceRange, minRating, sortBy, inStockOnly]);

  const subcats = selectedCat !== "All" ? ["All", ...(CATEGORY_SUBS[selectedCat] || [])] : [];
  const activeFilterCount = [
    selectedCat !== "All", selectedSub !== "All",
    priceRange[1] < 10000, minRating > 0, searchText.trim() !== "",
  ].filter(Boolean).length;

  return (
    <div className="cat-root">

      {/* Toast */}
      {toast && <div className="cat-toast">{toast}</div>}

      {/* ── Header ── */}
      <header className="cat-header">
        <Link to="/" className="cat-logo">🛍️ ShopSphere</Link>

        <div className="cat-search-wrap">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input placeholder="Search products, brands…"
            value={searchText} onChange={e => setSearchText(e.target.value)} />
          {searchText && (
            <button className="cat-search-clear" onClick={() => setSearchText("")}>✕</button>
          )}
        </div>

        <div className="cat-header-right">
          <Link to="/" className="cat-back-btn">← Home</Link>
          <Link to="/cart" className="cat-cart-btn">
            🛒 Cart
            {cartCount > 0 && <span className="cat-cart-badge">{cartCount}</span>}
          </Link>
        </div>
      </header>

      {/* ── Category strip ── */}
      <div className="cat-strip">
        {ALL_CATS.map(cat => (
          <button
            key={cat}
            className={`cat-strip-btn${selectedCat === cat ? " active" : ""}`}
            onClick={() => handleCatChange(cat)}
          >{cat}</button>
        ))}
      </div>

      {/* ── Sub-category strip (visible when a category is selected) ── */}
      {subcats.length > 1 && (
        <div className="cat-sub-strip">
          {subcats.map(sub => (
            <button
              key={sub}
              className={`cat-sub-btn${selectedSub === sub ? " active" : ""}`}
              onClick={() => handleSubChange(sub)}
            >{sub}</button>
          ))}
        </div>
      )}

      <div className="cat-body">

        {/* ── Sidebar ── */}
        <aside className={`cat-sidebar${sidebarOpen ? " cat-sidebar--open" : ""}`}>
          <div className="cat-sidebar-head">
            <h3>Filters {activeFilterCount > 0 && <span className="cat-filter-count">{activeFilterCount}</span>}</h3>
            <button className="cat-clear-btn" onClick={clearFilters}>Clear All</button>
          </div>

          {/* Category */}
          <div className="cat-filter-block">
            <h4>Category</h4>
            {ALL_CATS.map(cat => (
              <label key={cat} className={`cat-filter-radio${selectedCat === cat ? " checked" : ""}`}>
                <input type="radio" name="cat" checked={selectedCat === cat}
                  onChange={() => handleCatChange(cat)} />
                <span>{cat}</span>
                <span className="cat-filter-count-pill">
                  {cat === "All" ? products.length : products.filter(p => p.category === cat).length}
                </span>
              </label>
            ))}
          </div>

          {/* Sub-category */}
          {subcats.length > 1 && (
            <div className="cat-filter-block">
              <h4>Sub-Category</h4>
              {subcats.map(sub => (
                <label key={sub} className={`cat-filter-radio${selectedSub === sub ? " checked" : ""}`}>
                  <input type="radio" name="sub" checked={selectedSub === sub}
                    onChange={() => handleSubChange(sub)} />
                  <span>{sub}</span>
                </label>
              ))}
            </div>
          )}

          {/* Price range */}
          <div className="cat-filter-block">
            <h4>Price Range</h4>
            <div className="cat-price-display">₹0 — ₹{priceRange[1].toLocaleString("en-IN")}</div>
            <input type="range" min="0" max="10000" step="100"
              value={priceRange[1]}
              onChange={e => setPriceRange([0, Number(e.target.value)])}
              className="cat-range-slider"
            />
            <div className="cat-price-presets">
              {[[499,"Under ₹499"],[999,"Under ₹999"],[2499,"Under ₹2499"],[10000,"All"]].map(([v, l]) => (
                <button key={v}
                  className={`cat-price-preset${priceRange[1] === v ? " active" : ""}`}
                  onClick={() => setPriceRange([0, v])}>{l}</button>
              ))}
            </div>
          </div>

          {/* Rating */}
          <div className="cat-filter-block">
            <h4>Min Rating</h4>
            {[0, 4.5, 4.0, 3.5].map(r => (
              <label key={r} className={`cat-filter-radio${minRating === r ? " checked" : ""}`}>
                <input type="radio" name="rating" checked={minRating === r}
                  onChange={() => setMinRating(r)} />
                <span>{r === 0 ? "All Ratings" : `${r} ★ & above`}</span>
              </label>
            ))}
          </div>

          {/* Stock Availability */}
          <div className="cat-filter-block">
            <h4>Stock Availability</h4>
            <label className={`cat-filter-radio${inStockOnly ? " checked" : ""}`}>
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={e => setInStockOnly(e.target.checked)}
              />
              <span>⚡ In Stock Only ({products.filter(p => !p.stock || p.stock > 0).length})</span>
            </label>
          </div>

          {/* Reseller tip */}
          <div className="cat-reseller-tip">
            <strong>💡 Reseller Tip</strong>
            <p>Click <b>Share</b> on any product to share via WhatsApp and earn a profit margin!</p>
          </div>
        </aside>

        {/* ── Product section ── */}
        <div className="cat-products-wrap">

          {/* Toolbar */}
          <div className="cat-toolbar">
            <div className="cat-toolbar-left">
              <button className="cat-filter-toggle" onClick={() => setSidebarOpen(v => !v)}>
                ⚙ Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
              </button>
              <span className="cat-result-count">
                {loading ? "Loading…" : `${filtered.length} products`}
                {selectedCat !== "All" && ` in ${selectedCat}`}
                {selectedSub !== "All" && ` › ${selectedSub}`}
              </span>
            </div>
            <select className="cat-sort-select" value={sortBy}
              onChange={e => setSortBy(e.target.value)}>
              {SORT_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          {/* States */}
          {loading && (
            <div className="cat-state">
              <span className="cat-spinner" />
              <p>Loading products…</p>
            </div>
          )}

          {!loading && error && (
            <div className="cat-state cat-state--error">
              <span>⚠️</span><p>{error}</p>
            </div>
          )}

          {!loading && !error && filtered.length === 0 && (
            <div className="cat-state">
              <span style={{ fontSize: 48 }}>🔍</span>
              <h3>No products found</h3>
              <p>Try adjusting your filters or search term</p>
              <button className="cat-reset-btn" onClick={clearFilters}>Reset Filters</button>
            </div>
          )}

          {!loading && !error && filtered.length > 0 && (
            <div className="cat-grid">
              {filtered.map(p => (
                <ProductCard key={p._id} product={p} onAddToCart={addToCart} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile filter overlay */}
      {sidebarOpen && (
        <div className="cat-overlay" onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  );
}
