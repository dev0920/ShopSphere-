import { API_BASE_URL } from "../config/apiConfig";
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import ProductCard from "../components/ProductCard";
import Footer from "../components/Footer";
import "../styles/vendorstore.css";

const API = `${API_BASE_URL}/api`;

export default function VendorStore() {
  const { id } = useParams();

  const [vendor, setVendor] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    // Update cart count
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    setCartCount(cart.reduce((t, i) => t + i.quantity, 0));

    window.scrollTo({ top: 0, behavior: "smooth" });

    // Fetch vendor info & products
    Promise.all([
      fetch(`${API}/auth/vendor/${id}`).then((r) => (r.ok ? r.json() : null)),
      fetch(`${API}/products?limit=500&status=approved&vendorId=${encodeURIComponent(id)}`).then((r) =>
        r.ok ? r.json() : null
      ),
    ])
      .then(async ([vendorData, productsData]) => {
        if (vendorData && vendorData.success) {
          setVendor(vendorData.vendor);
        }

        let loadedProducts = (productsData && productsData.products) || [];

        if (loadedProducts.length === 0) {
          // Fallback search across all approved products by decoded ID / seller / brand name
          try {
            const allRes = await fetch(`${API}/products?limit=500&status=approved`);
            const allData = await allRes.json();
            const decodedId = decodeURIComponent(id).toLowerCase();

            loadedProducts = (allData.products || []).filter(
              (p) =>
                String(p.createdBy?._id) === id ||
                String(p.createdBy) === id ||
                p.createdBy?.name?.toLowerCase().includes(decodedId) ||
                p.seller?.toLowerCase().includes(decodedId) ||
                p.brand?.toLowerCase().includes(decodedId)
            );
          } catch {}
        }

        setProducts(loadedProducts);
      })
      .catch((err) => console.error("Vendor Store load error:", err))
      .finally(() => setLoading(false));
  }, [id]);

  const addToCart = (product) => {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const existing = cart.find((i) => i._id === product._id);
    const updated = existing
      ? cart.map((i) => (i._id === product._id ? { ...i, quantity: i.quantity + 1 } : i))
      : [...cart, { ...product, quantity: 1 }];

    localStorage.setItem("cart", JSON.stringify(updated));
    setCartCount(updated.reduce((t, i) => t + i.quantity, 0));
  };

  const filteredProducts = products.filter((p) =>
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const vendorName = vendor?.name || products[0]?.seller || products[0]?.createdBy?.name || "Verified Factory Seller";
  const userObj = JSON.parse(localStorage.getItem("user") || "null");

  if (loading) {
    return (
      <div className="vs-page-wrapper">
        <div style={{ textAlign: "center", padding: "100px 20px", color: "#64748b" }}>
          <span className="dash-spinner" style={{ margin: "0 auto 16px" }} />
          <h2>Loading Vendor Store…</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="vs-page-wrapper">
      {/* Top Navbar */}
      <Navbar
        user={userObj}
        handleLogout={() => {
          localStorage.clear();
          sessionStorage.clear();
          window.location.href = "/login";
        }}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        cartCount={cartCount}
      />

      {/* Vendor Store Header Banner */}
      <section className="vs-banner-section">
        <div className="vs-banner-container">
          <div className="vs-store-identity">
            <div className="vs-store-avatar">🏪</div>
            <div className="vs-store-info">
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <h1>{vendorName}</h1>
                <span className="vs-verified-badge">✅ Verified Seller</span>
              </div>
              <p className="vs-store-sub">
                Official ShopSphere Partner Store • Direct Factory Dispatch &amp; Wholesale Pricing
              </p>
            </div>
          </div>

          {/* Stats pills */}
          <div className="vs-stats-row">
            <div className="vs-stat-pill">
              <span>📦</span> {products.length} Live Items
            </div>
            <div className="vs-stat-pill">
              <span>⭐</span> 4.9 Rating (1.4k+ Orders)
            </div>
            <div className="vs-stat-pill">
              <span>⚡</span> 24h Priority Dispatch
            </div>
          </div>
        </div>
      </section>

      {/* Main Store Content */}
      <main className="vs-main-container">
        <div className="vs-toolbar">
          <h2 className="vs-section-title">
            <span>🛍️</span> Store Collection ({filteredProducts.length} Items)
          </h2>

          <input
            type="text"
            className="vs-search-input"
            placeholder="Search within this store…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Product Cards Grid */}
        {filteredProducts.length === 0 ? (
          <div className="vs-empty-card">
            <div className="vs-empty-icon">📦</div>
            <h3>No products found</h3>
            <p>This vendor has no active live products matching your search criteria right now.</p>
            <Link
              to="/catalogue"
              style={{
                background: "#f43397",
                color: "#fff",
                padding: "12px 24px",
                borderRadius: "10px",
                textDecoration: "none",
                fontWeight: "800",
              }}
            >
              Explore Full Catalogue →
            </Link>
          </div>
        ) : (
          <div className="vs-product-grid">
            {filteredProducts.map((p) => (
              <ProductCard key={p._id} product={p} onAddToCart={addToCart} />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
