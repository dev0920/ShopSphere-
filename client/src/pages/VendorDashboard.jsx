import { API_BASE_URL } from "../config/apiConfig";
import { useState, useEffect, useCallback, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/dashboard.css";

const API = `${API_BASE_URL}/api`;
const CATEGORY_SUBS = {
  "Ethnic Wear": ["Sarees", "Kurtis", "Kurti Sets", "Lehengas", "Suit Sets", "Dupatta Sets"],
  "Western Dresses": ["Midi Dresses", "Party Dresses", "Maxi Dresses", "Shirt Dresses", "Casual Dresses", "Mini Dresses", "Jumpsuits", "Co-ord Sets"],
  "Menswear": ["Formal Shirts", "Casual Shirts", "Jeans", "Trousers", "T-Shirts", "Ethnic Kurta", "Sweatshirts", "Blazers", "Jackets", "Sherwani"],
  "Footwear": ["Sports Shoes", "Heels", "Formal Shoes", "Ethnic Footwear", "Casual Shoes", "Flats", "Boots"],
  "Home Decor": ["Wall Decor", "Cushions & Pillows", "Cookware", "Bedding", "Lighting", "Planters", "Rugs & Carpets", "Candles & Fragrance", "Storage"],
  "Beauty": ["Serums", "Lip Makeup", "Moisturisers", "Hair Care", "Fragrances", "Eye Makeup", "Skin Care", "Face Masks", "Face Makeup", "Nail Care", "Sunscreen", "Body Care", "Beauty Tools"],
  "Accessories": ["Sunglasses", "Wallets & Belts", "Scarves & Caps", "Hair Accessories"],
  "Grocery": ["Rice & Grains", "Oils & Ghee", "Tea & Coffee", "Spices & Masala", "Dry Fruits & Nuts", "Sweeteners", "Superfoods", "Flour & Atta", "Breakfast & Cereals"],
  "Electronics": ["Wireless Headphones", "Laptops", "Smartwatches", "Smartphones", "Portable Speakers", "Power Banks"],
  "Kids & Toys": ["Boys Wear", "Girls Wear", "Educational Toys", "Soft Toys", "Action Figures", "Board Games"],
  "Sports & Fitness": ["Yoga Mats", "Dumbbells & Weights", "Sportswear", "Gym Accessories", "Cricket Gear", "Fitness Trackerxxs"],
  "Jewellery": ["Gold Plated Necklaces", "Rings", "Earrings", "Bracelets", "Bangles", "Silver Jewellery"],
  "Bags": ["Tote Bags", "Backpacks", "Sling Bags", "Travel Duffle Bags", "Handbags", "Laptop Sleeves"],
  "Watches": ["Chronograph Watches", "Analog Leather Watches", "Smartwatches", "Digital Sports Watches", "Luxury Steel Watches"],
};

const CATS = Object.keys(CATEGORY_SUBS);

function getToken() {
  return localStorage.getItem("token") || sessionStorage.getItem("token");
}

function getUser() {
  try {
    return JSON.parse(localStorage.getItem("user") || sessionStorage.getItem("user"));
  } catch { return null; }
}

const STATUS_META = {
  pending: { label: "Pending Review", bg: "#fffbeb", color: "#92400e", icon: "🕐" },
  approved: { label: "Live in Store", bg: "#f0fdf4", color: "#166534", icon: "✅" },
  rejected: { label: "Rejected", bg: "#fff1f2", color: "#be123c", icon: "❌" },
};

function StatusBadge({ status }) {
  const m = STATUS_META[status] || STATUS_META.pending;
  return (
    <span className="ap-status-badge" style={{ background: m.bg, color: m.color }}>
      {m.icon} {m.label}
    </span>
  );
}

const EMPTY_FORM = {
  name: "", brand: "", category: "", subCategory: "", description: "",
  price: "", oldPrice: "", stock: "50", seller: "",
  color: "", material: "", warranty: "", weight: "", dimensions: "",
  isFeatured: false,
};

export default function VendorDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState(null);
  const [dispatchingOrder, setDispatchingOrder] = useState(null);
  const [dispatchName, setDispatchName] = useState("");
  const [dispatchPhone, setDispatchPhone] = useState("");
  const [dispatchOtp, setDispatchOtp] = useState("");
  const [dispatchLoading, setDispatchLoading] = useState(false);

  const navigate = useNavigate();
  const me = getUser();

  const handleOpenDispatchModal = (order) => {
    const defaultAgents = [
      { name: "Ramesh Kumar (Ekart Express)", phone: "+91 98765 43210" },
      { name: "Vikram Singh (BlueDart Logistics)", phone: "+91 98123 45678" },
      { name: "Amit Sharma (Delhivery Fast)", phone: "+91 99887 76655" },
      { name: "Rajesh Patel (Shadowfax Courier)", phone: "+91 97234 56789" },
    ];
    const agent = defaultAgents[Math.floor(Math.random() * defaultAgents.length)];
    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    setDispatchName(order.deliveryBoyName || agent.name);
    setDispatchPhone(order.deliveryBoyPhone || agent.phone);
    setDispatchOtp(order.deliveryOtp || otp);
    setDispatchingOrder(order);
  };

  const handleConfirmDispatch = async () => {
    if (!dispatchingOrder) return;
    setDispatchLoading(true);

    try {
      const res = await fetch(`${API}/orders/${dispatchingOrder._id}/dispatch`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify({
          deliveryBoyName: dispatchName,
          deliveryBoyPhone: dispatchPhone,
          deliveryOtp: dispatchOtp,
        }),
      });
      const data = await res.json();

      if (data.success) {
        showToast(`🚀 Order Dispatched! Agent: ${dispatchName}, OTP: ${dispatchOtp}`, "success");
        setDispatchingOrder(null);
        fetchVendorOrders();
      } else {
        showToast(data.message || "Failed to dispatch order", "error");
      }
    } catch {
      showToast("Server error during dispatch", "error");
    } finally {
      setDispatchLoading(false);
    }
  };

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const authHeaders = () => ({
    Authorization: `Bearer ${getToken()}`,
    "Content-Type": "application/json",
  });

  // Fetch Vendor's Products across all statuses
  const fetchMyProducts = useCallback(async () => {
    try {
      const fetches = await Promise.all([
        fetch(`${API}/products?limit=500&status=pending&vendorId=${me?._id}`).then(r => r.json()),
        fetch(`${API}/products?limit=500&status=approved&vendorId=${me?._id}`).then(r => r.json()),
        fetch(`${API}/products?limit=500&status=rejected&vendorId=${me?._id}`).then(r => r.json()),
      ]);
      const combined = fetches.flatMap(d => d.products || []);
      combined.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setProducts(combined);
    } catch { showToast("Failed to load products", "error"); }
    finally { setLoading(false); }
  }, [me?._id]);

  // Fetch Vendor Orders
  const fetchVendorOrders = useCallback(async () => {
    try {
      const res = await fetch(`${API}/orders/vendor-orders`, { headers: authHeaders() });
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders || []);
      }
    } catch { console.error("Error fetching vendor orders"); }
  }, []);

  useEffect(() => {
    Promise.all([fetchMyProducts(), fetchVendorOrders()]);

    // Real-time live polling every 3 seconds for instant order & profit updates
    const timer = setInterval(() => {
      fetchVendorOrders();
    }, 3000);

    return () => clearInterval(timer);
  }, [fetchMyProducts, fetchVendorOrders]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const handleImages = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
    setPreviews(files.map(f => URL.createObjectURL(f)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      images.forEach(img => fd.append("images", img));

      const res = await fetch(`${API}/products`, {
        method: "POST",
        headers: { Authorization: `Bearer ${getToken()}` },
        body: fd,
      });
      const data = await res.json();

      if (!res.ok) { showToast(data.message || "Failed to submit product", "error"); return; }

      showToast("🕐 Product submitted! It will go live once Admin approves it.", "pending");
      setForm({ ...EMPTY_FORM, seller: me?.name || "" });
      setImages([]);
      setPreviews([]);
      fetchMyProducts();
      setActiveTab("products");
    } catch { showToast("Server error, try again", "error"); }
    finally { setSubmitting(false); }
  };

  const handleDeleteProduct = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This action cannot be undone.`)) return;
    try {
      const res = await fetch(`${API}/products/${id}`, {
        method: "DELETE", headers: authHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        showToast("Product deleted successfully");
        fetchMyProducts();
      } else showToast(data.message, "error");
    } catch { showToast("Delete failed", "error"); }
  };

  const handleLogout = () => { localStorage.clear(); sessionStorage.clear(); navigate("/login"); };

  // Computations
  const pendingCount = products.filter(p => p.status === "pending").length;
  const approvedCount = products.filter(p => p.status === "approved").length;
  const rejectedCount = products.filter(p => p.status === "rejected").length;

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" ? true : p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Financial Breakdown: Calculate revenue based strictly on vendor's products in orders
  const myProductIds = useMemo(() => new Set(products.map(p => String(p._id))), [products]);
  const meIdStr = String(me?._id || "");
  const meNameStr = String(me?.name || "").toLowerCase();

  // Filter orders strictly to ONLY those containing items belonging to THIS vendor
  const vendorOrders = useMemo(() => {
    return orders.filter(o => {
      if (!o.items || o.items.length === 0) return false;
      return o.items.some(item => {
        const itemProdId = String(item.product?._id || item.product || "");
        const itemVendorId = String(item.createdBy?._id || item.createdBy || "");
        const itemSellerName = String(item.seller || item.product?.seller || "").toLowerCase();

        return (itemVendorId && itemVendorId === meIdStr) ||
          myProductIds.has(itemProdId) ||
          (meNameStr && itemSellerName && itemSellerName.includes(meNameStr));
      });
    });
  }, [orders, myProductIds, meIdStr, meNameStr]);

  // Helper to extract vendor items and gross sales for an order
  const getVendorOrderSum = (o) => {
    if (!o.items || o.items.length === 0) return 0;
    const vendorItems = o.items.filter(item => {
      const itemProdId = String(item.product?._id || item.product || "");
      const itemVendorId = String(item.createdBy?._id || item.createdBy || "");
      const itemSellerName = String(item.seller || item.product?.seller || "").toLowerCase();

      return (itemVendorId && itemVendorId === meIdStr) ||
        myProductIds.has(itemProdId) ||
        (meNameStr && itemSellerName && itemSellerName.includes(meNameStr));
    });

    return vendorItems.reduce((sum, item) => {
      return sum + (Number(item.price || 0) * Number(item.quantity || 1));
    }, 0);
  };

  const totalGrossRevenue = useMemo(() => {
    return vendorOrders.reduce((acc, o) => acc + getVendorOrderSum(o), 0);
  }, [vendorOrders, myProductIds, meIdStr, meNameStr]);

  const adminPlatformFee = totalGrossRevenue * 0.05; // 5% Admin Fee
  const netVendorProfit = totalGrossRevenue * 0.95; // 95% Net Vendor Profit

  // Monthly Sales Breakdown Calculation
  const monthlySalesData = useMemo(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthlyMap = months.map(m => ({ month: m, grossSales: 0, netProfit: 0, orderCount: 0 }));

    vendorOrders.forEach(o => {
      if (!o.createdAt) return;
      const date = new Date(o.createdAt);
      const mIdx = date.getMonth();

      const gross = getVendorOrderSum(o);
      const profit = gross * 0.95;

      monthlyMap[mIdx].grossSales += gross;
      monthlyMap[mIdx].netProfit += profit;
      monthlyMap[mIdx].orderCount += 1;
    });

    const maxSales = Math.max(...monthlyMap.map(m => m.grossSales), 1000);
    return { monthlyMap, maxSales };
  }, [vendorOrders, myProductIds, meIdStr, meNameStr]);

  // Every Day Profit Analytics (Grouped by Date)
  const dailyProfitData = useMemo(() => {
    const map = {};
    vendorOrders.forEach(o => {
      if (!o.createdAt) return;
      const dateStr = new Date(o.createdAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric"
      });

      const gross = getVendorOrderSum(o);
      const profit = gross * 0.95;

      if (!map[dateStr]) {
        map[dateStr] = { date: dateStr, ordersCount: 0, grossRevenue: 0, netProfit: 0 };
      }

      map[dateStr].ordersCount += 1;
      map[dateStr].grossRevenue += gross;
      map[dateStr].netProfit += profit;
    });

    return Object.values(map).sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [vendorOrders, myProductIds, meIdStr, meNameStr]);

  const todayDateStr = new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });

  const todayObj = dailyProfitData.find(d => d.date === todayDateStr);
  const todayNetProfit = todayObj ? todayObj.netProfit : netVendorProfit;

  // If user is a customer ("user" role), block access and prompt vendor login
  if (!me || (me.role !== "vendor" && me.role !== "admin")) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc", padding: "20px" }}>
        <div style={{ background: "#ffffff", borderRadius: "20px", padding: "40px", maxWidth: "480px", textAlign: "center", boxShadow: "0 10px 30px rgba(0,0,0,0.08)", border: "1px solid #e2e8f0" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>🏪</div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0f172a", margin: "0 0 10px" }}>Vendor Access Only</h2>
          <p style={{ color: "#64748b", fontSize: "0.95rem", lineHeight: 1.5, margin: "0 0 24px" }}>
            You are currently signed in as a Customer (<strong>{me?.email || "Shopper"}</strong>). Please sign in with a Vendor Account to manage your products and store.
          </p>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
            <button
              type="button"
              onClick={() => { localStorage.clear(); sessionStorage.clear(); navigate("/login"); }}
              style={{ background: "#9333ea", color: "#fff", border: "none", padding: "12px 24px", borderRadius: "10px", fontWeight: 700, cursor: "pointer" }}
            >
              Log in as Vendor →
            </button>
            <button
              type="button"
              onClick={() => navigate("/")}
              style={{ background: "#f1f5f9", color: "#334155", border: "1px solid #cbd5e1", padding: "12px 20px", borderRadius: "10px", fontWeight: 600, cursor: "pointer" }}
            >
              Back to Store
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dash-root">
      {/* ── Toast ── */}
      {toast && (
        <div className={`dash-toast dash-toast--${toast.type === "pending" ? "info" : toast.type}`}>
          {toast.msg}
        </div>
      )}

      {/* ── Dispatch Order & Delivery Executive Modal ── */}
      {dispatchingOrder && (
        <div className="ap-modal-backdrop" style={{ background: "rgba(15,23,42,0.8)", zIndex: 9999 }}>
          <div className="ap-modal-card" style={{ maxWidth: "480px", width: "90%", padding: "24px", borderRadius: "16px", background: "#ffffff", textAlign: "left" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", borderBottom: "1px solid #e2e8f0", paddingBottom: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "24px" }}>🚀</span>
                <div>
                  <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 900, color: "#0f172a" }}>
                    Dispatch Order #{dispatchingOrder._id.slice(-6).toUpperCase()}
                  </h3>
                  <span style={{ fontSize: "12px", color: "#64748b" }}>
                    Assign Delivery Executive &amp; Delivery OTP Handoff Code
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDispatchingOrder(null)}
                style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "#64748b" }}
              >
                ✕
              </button>
            </div>

            <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "12px", borderRadius: "8px", marginBottom: "16px" }}>
              <div style={{ fontSize: "12px", color: "#166534", fontWeight: 700 }}>
                📦 <strong>Customer:</strong> {dispatchingOrder.shippingAddress?.fullName || dispatchingOrder.user?.name}<br/>
                📍 <strong>Delivery Address:</strong> {dispatchingOrder.shippingAddress?.address}, {dispatchingOrder.shippingAddress?.city} - {dispatchingOrder.shippingAddress?.pincode}
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginBottom: "20px" }}>
              <div>
                <label style={{ fontSize: "12px", fontWeight: 800, color: "#334155", display: "block", marginBottom: "4px" }}>
                  👨‍💼 Delivery Executive / Courier Partner Name
                </label>
                <input
                  type="text"
                  value={dispatchName}
                  onChange={(e) => setDispatchName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar (Ekart Express)"
                  style={{ width: "100%", padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "14px", fontWeight: 600, outline: "none" }}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: "12px", fontWeight: 800, color: "#334155", display: "block", marginBottom: "4px" }}>
                  📞 Delivery Executive Contact Phone
                </label>
                <input
                  type="text"
                  value={dispatchPhone}
                  onChange={(e) => setDispatchPhone(e.target.value)}
                  placeholder="e.g. +91 98765 43210"
                  style={{ width: "100%", padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "14px", fontWeight: 600, outline: "none" }}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: "12px", fontWeight: 800, color: "#334155", display: "block", marginBottom: "4px" }}>
                  🔑 4-Digit Delivery Verification OTP Code
                </label>
                <input
                  type="text"
                  value={dispatchOtp}
                  onChange={(e) => setDispatchOtp(e.target.value)}
                  maxLength={4}
                  placeholder="e.g. 4920"
                  style={{ width: "100%", padding: "10px 12px", border: "2px dashed #9333ea", borderRadius: "8px", fontSize: "20px", fontWeight: 900, letterSpacing: "4px", color: "#9333ea", textAlign: "center", background: "#faf5ff", outline: "none" }}
                  required
                />
                <span style={{ fontSize: "11px", color: "#64748b", margin: "4px 0 0", display: "block" }}>
                  🔒 Share this 4-digit OTP code with the buyer so they can verify handoff!
                </span>
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button
                type="button"
                onClick={() => setDispatchingOrder(null)}
                style={{ background: "#f1f5f9", color: "#475569", border: "1px solid #cbd5e1", padding: "10px 18px", borderRadius: "8px", fontWeight: 700, fontSize: "13px", cursor: "pointer" }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDispatch}
                disabled={dispatchLoading}
                style={{ background: "linear-gradient(135deg, #166534 0%, #15803d 100%)", color: "#ffffff", border: "none", padding: "10px 20px", borderRadius: "8px", fontWeight: 900, fontSize: "13px", cursor: "pointer", boxShadow: "0 4px 12px rgba(22,101,52,0.3)" }}
              >
                {dispatchLoading ? "Dispatching…" : "🚀 Confirm Dispatch & Send Email Alert →"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Tax Invoice Modal ── */}
      {selectedInvoiceOrder && (
        <div className="ap-modal-backdrop" style={{ background: "rgba(15,23,42,0.8)", zIndex: 9999 }}>
          <div className="ap-modal" style={{ maxWidth: "750px", width: "95%", padding: "32px", background: "#ffffff", borderRadius: "20px", color: "#0f172a" }}>

            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "2px solid #0f172a", paddingBottom: "16px", marginBottom: "20px" }}>
              <div>
                <h2 style={{ margin: 0, color: "#0f172a", fontSize: "24px", fontWeight: 900 }}>🛍️ ShopSphere</h2>
                <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#64748b" }}>Vendor Sales &amp; Tax Invoice Receipt</p>
                <p style={{ margin: "2px 0 0", fontSize: "11px", color: "#94a3b8" }}>GSTIN: 27AAACS1234F1Z9 • PAN: AAACS1234F</p>
              </div>
              <div style={{ textAlign: "right" }}>
                <span style={{ background: "#2563eb", color: "#ffffff", padding: "4px 12px", borderRadius: "6px", fontSize: "12px", fontWeight: 800 }}>OFFICIAL INVOICE</span>
                <h4 style={{ margin: "8px 0 2px", fontSize: "14px", fontFamily: "monospace" }}>Invoice #{selectedInvoiceOrder._id.slice(-8).toUpperCase()}</h4>
                <p style={{ margin: 0, fontSize: "12px", color: "#64748b" }}>Date: {new Date(selectedInvoiceOrder.createdAt).toLocaleDateString("en-IN")}</p>
              </div>
            </div>

            {/* Address & Vendor Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", background: "#f8fafc", padding: "16px", borderRadius: "12px", marginBottom: "20px", fontSize: "12px" }}>
              <div>
                <strong style={{ color: "#475569", textTransform: "uppercase" }}>Customer Delivery Address:</strong>
                <div style={{ marginTop: "4px", fontSize: "13px", fontWeight: 700, color: "#0f172a" }}>{selectedInvoiceOrder.shippingAddress?.fullName}</div>
                <div>📞 Phone: {selectedInvoiceOrder.shippingAddress?.phone}</div>
                <div>📍 {selectedInvoiceOrder.shippingAddress?.address}, {selectedInvoiceOrder.shippingAddress?.city}, {selectedInvoiceOrder.shippingAddress?.state} - {selectedInvoiceOrder.shippingAddress?.pincode}</div>
              </div>
              <div>
                <strong style={{ color: "#475569", textTransform: "uppercase" }}>Vendor Store Details:</strong>
                <div style={{ marginTop: "4px", fontSize: "13px", fontWeight: 700, color: "#0f172a" }}>{me?.name || "Verified Vendor"}</div>
                <div>✉️ {me?.email}</div>
                <div style={{ marginTop: "4px" }}>Order Status: <span style={{ color: "#059669", fontWeight: 700 }}>PAID / CONFIRMED ✓</span></div>
              </div>
            </div>

            {/* Items Table */}
            <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "20px", fontSize: "13px" }}>
              <thead>
                <tr style={{ background: "#0f172a", color: "#ffffff", textAlign: "left" }}>
                  <th style={{ padding: "10px 12px" }}>Item Description</th>
                  <th style={{ padding: "10px 12px" }}>Qty</th>
                  <th style={{ padding: "10px 12px" }}>Unit Price</th>
                  <th style={{ padding: "10px 12px", textAlign: "right" }}>Total Amount</th>
                </tr>
              </thead>
              <tbody>
                {selectedInvoiceOrder.items?.map((item, idx) => (
                  <tr key={idx} style={{ borderBottom: "1px solid #e2e8f0" }}>
                    <td style={{ padding: "12px" }}>
                      <strong>{item.name}</strong>
                      {item.seller && <div style={{ fontSize: "11px", color: "#64748b" }}>Sold by: {item.seller}</div>}
                    </td>
                    <td style={{ padding: "12px" }}>{item.quantity}</td>
                    <td style={{ padding: "12px" }}>₹{Number(item.price).toLocaleString("en-IN")}</td>
                    <td style={{ padding: "12px", textAlign: "right", fontWeight: 700 }}>₹{(item.price * item.quantity).toLocaleString("en-IN")}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Financial Summary */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#ecfdf5", padding: "16px 20px", borderRadius: "12px", marginBottom: "24px" }}>
              <div>
                <div style={{ fontSize: "12px", color: "#065f46", fontWeight: 600 }}>💵 Vendor Net Payout Share (95%)</div>
                <strong style={{ fontSize: "20px", color: "#047857" }}>₹{(selectedInvoiceOrder.totalAmount * 0.95).toFixed(2)}</strong>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "12px", color: "#065f46", fontWeight: 600 }}>Total Order Value</div>
                <strong style={{ fontSize: "22px", color: "#0f172a" }}>₹{Number(selectedInvoiceOrder.totalAmount).toLocaleString("en-IN")}</strong>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
              <button type="button" className="ap-btn-cancel" onClick={() => setSelectedInvoiceOrder(null)}>Close</button>
              <button type="button" className="ap-btn-approve" style={{ background: "#2563eb", color: "#fff" }} onClick={() => window.print()}>🖨️ Print / Download PDF</button>
            </div>

          </div>
        </div>
      )}

      {/* ── Sidebar ── */}
      <aside className="dash-sidebar">
        <Link to="/vendor-dashboard" className="dash-brand" onClick={() => setActiveTab("overview")}>
          <span>🛍️</span><span>ShopSphere</span>
        </Link>

        <nav className="dash-nav">
          <button className={`dash-nav-item${activeTab === "overview" ? " active" : ""}`}
            onClick={() => setActiveTab("overview")}>
            <span>📊</span> Overview
          </button>

          <button className={`dash-nav-item${activeTab === "earnings" ? " active" : ""}`}
            onClick={() => setActiveTab("earnings")}>
            <span>💵</span> Net Profit &amp; Payouts
          </button>

          <button className={`dash-nav-item${activeTab === "products" ? " active" : ""}`}
            onClick={() => setActiveTab("products")}>
            <span>📦</span> My Catalog
            <span className="dash-nav-badge">{products.length}</span>
          </button>

          <button className={`dash-nav-item${activeTab === "add" ? " active" : ""}`}
            onClick={() => setActiveTab("add")}>
            <span>➕</span> Submit Product
          </button>

          <button className={`dash-nav-item${activeTab === "orders" ? " active" : ""}`}
            onClick={() => setActiveTab("orders")}>
            <span>📑</span> Store Orders
            {vendorOrders.length > 0 && <span className="dash-nav-badge">{vendorOrders.length}</span>}
          </button>

          <button className={`dash-nav-item${activeTab === "profile" ? " active" : ""}`}
            onClick={() => setActiveTab("profile")}>
            <span>⚙️</span> Store Profile
          </button>
        </nav>

        <div className="dash-sidebar-footer">
          <div className="dash-sidebar-user">
            <span className="dash-avatar" style={{ background: "#ede9fe", color: "#5b21b6" }}>🏪</span>
            <div>
              <strong>{me?.name}</strong>
              <span style={{ fontSize: 11, color: "#a78bfa" }}>Vendor Store</span>
            </div>
          </div>
          <button className="dash-logout-btn" onClick={handleLogout}>🚪 Logout</button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main className="dash-main">

        {/* ═══════════ STORE OVERVIEW TAB ═══════════ */}
        {activeTab === "overview" && (
          <div className="dash-section">

            {/* Store Banner */}
            <div className="vendor-store-banner">
              <div className="vsb-info">
                <span className="vsb-icon">🏪</span>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <h1 className="vsb-title">{me?.name || "Vendor Store"}</h1>
                    <span className="vsb-verified-tag">✅ Verified Vendor</span>
                  </div>
                  <p className="vsb-sub">
                    Authorized Seller Account • Managed &amp; Governed by ShopSphere Admin
                  </p>
                </div>
              </div>
              <button className="vf-submit-btn" onClick={() => setActiveTab("add")}>
                + Submit New Product
              </button>
            </div>

            {/* Pending Approval Banner */}
            {pendingCount > 0 && (
              <div className="ap-info-banner" style={{ background: "#fffbeb", borderColor: "#fde68a", color: "#92400e", marginBottom: 20 }}>
                <span>🕐</span>
                <div>
                  <strong>{pendingCount} Product(s) Pending Admin Approval</strong>
                  Products submitted by vendors require Super Admin approval before going live on the ShopSphere store. Once approved by Admin, customers can purchase your products and your 95% Net Vendor Profit will update in real time!
                </div>
              </div>
            )}

            {/* Quick Stat Cards */}
            <div className="dash-stat-grid" style={{ marginBottom: 24 }}>
              <div className="dash-stat-card dash-stat-card--gold">
                <span className="dash-stat-icon">💵</span>
                <div>
                  <p>Net Vendor Profit (95%)</p>
                  <strong style={{ color: "#15803d", fontSize: 22 }}>
                    ₹{netVendorProfit.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                  </strong>
                </div>
              </div>

              <div className="dash-stat-card dash-stat-card--blue">
                <span className="dash-stat-icon">💰</span>
                <div>
                  <p>Gross Customer Sales</p>
                  <strong>₹{totalGrossRevenue.toLocaleString("en-IN")}</strong>
                </div>
              </div>

              <div className="dash-stat-card dash-stat-card--purple">
                <span className="dash-stat-icon">✅</span>
                <div><p>Live Store Products</p><strong>{approvedCount}</strong></div>
              </div>

              <div className="dash-stat-card dash-stat-card--pink">
                <span className="dash-stat-icon">🕐</span>
                <div><p>Pending Admin Review</p><strong>{pendingCount}</strong></div>
              </div>
            </div>

            {/* 💵 COD Cash Settlement & Bank Payout Card */}
            <div style={{ background: "#f0fdf4", border: "2px solid #bbf7d0", padding: "20px", borderRadius: "16px", marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
              <div>
                <div style={{ fontSize: "11px", fontWeight: 900, color: "#166534", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "4px" }}>
                  🏦 AUTOMATED COD CASH SETTLEMENT &amp; VENDOR PAYOUT
                </div>
                <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 900, color: "#0f172a" }}>
                  COD Money Collected by Delivery Agents ➔ Bank Payout
                </h3>
                <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#475569" }}>
                  Delivery agents deposit collected cash at ShopSphere hubs. Your 95% net profit (<strong>₹{netVendorProfit.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</strong>) is automatically remitted to your bank account / UPI ID daily via NEFT/IMPS.
                </p>
              </div>
              <div style={{ background: "#ffffff", border: "1px solid #86efac", padding: "12px 18px", borderRadius: "12px", textAlign: "right" }}>
                <span style={{ fontSize: "11px", color: "#64748b", fontWeight: 700, display: "block" }}>Registered Payout UPI ID</span>
                <strong style={{ fontSize: "14px", color: "#166534", display: "block", fontFamily: "monospace" }}>devanshbhatiya@upi</strong>
                <span style={{ fontSize: "10px", color: "#059669", fontWeight: 800, marginTop: "2px", display: "block" }}>⚡ AUTO-SETTLEMENT ACTIVE</span>
              </div>
            </div>

            {/* 📊 Monthly Sales & Revenue Bar Chart Card */}
            <div className="dash-card" style={{ marginBottom: 24, padding: "24px", background: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 4px 14px rgba(0,0,0,0.03)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 800, color: "#0f172a" }}>
                    📊 Monthly Sales &amp; Revenue Analytics (2026)
                  </h2>
                  <p style={{ margin: "4px 0 0", fontSize: "0.85rem", color: "#64748b" }}>
                    Track your store's monthly gross sales (₹), 95% net profits, and order volumes.
                  </p>
                </div>
                <div style={{ display: "flex", gap: "16px", alignItems: "center", background: "#f8fafc", padding: "8px 16px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.8rem", fontWeight: 700, color: "#9333ea" }}>
                    <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#9333ea", display: "inline-block" }} /> Gross Sales (₹)
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.8rem", fontWeight: 700, color: "#166534" }}>
                    <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#22c55e", display: "inline-block" }} /> Net Profit 95% (₹)
                  </span>
                </div>
              </div>

              {/* Monthly Bar Chart Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: "8px", alignItems: "flex-end", height: "210px", padding: "20px 12px 12px", background: "#faf5ff", borderRadius: "14px", border: "1px solid #f3e8ff" }}>
                {monthlySalesData.monthlyMap.map((m) => {
                  const barHeightPercent = monthlySalesData.maxSales > 0 ? Math.max(10, Math.round((m.grossSales / monthlySalesData.maxSales) * 100)) : 10;
                  return (
                    <div
                      key={m.month}
                      style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", height: "100%", justifyContent: "flex-end" }}
                      title={`${m.month}: ₹${m.grossSales.toLocaleString("en-IN")} Gross Sales (${m.orderCount} Orders)`}
                    >
                      <div style={{ fontSize: "10px", fontWeight: 800, color: "#7e22ce" }}>
                        {m.grossSales > 0 ? `₹${(m.grossSales / 1000).toFixed(1)}k` : "₹0"}
                      </div>
                      
                      <div style={{ width: "100%", maxWidth: "34px", height: `${barHeightPercent}%`, background: "linear-gradient(180deg, #c084fc 0%, #9333ea 100%)", borderRadius: "8px 8px 0 0", position: "relative", transition: "all 0.3s ease", boxShadow: "0 4px 10px rgba(147, 51, 234, 0.2)" }}>
                        {/* Net Profit Green Accent Bar */}
                        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "95%", background: "linear-gradient(180deg, #4ade80 0%, #166534 100%)", borderRadius: "6px 6px 0 0", opacity: 0.85 }} />
                      </div>

                      <span style={{ fontSize: "11px", fontWeight: 700, color: "#475569" }}>{m.month}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 📅 Every Day Profit Ledger Table Card */}
            <div className="dash-card" style={{ marginBottom: 24, padding: "24px", background: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 4px 14px rgba(0,0,0,0.03)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 900, color: "#0f172a" }}>
                    📅 Every Day Profit Ledger (Daily Revenue Analytics)
                  </h2>
                  <span style={{ fontSize: "12px", color: "#64748b" }}>
                    Track daily gross customer sales and your 95% net vendor profit earned per calendar day.
                  </span>
                </div>
                <div style={{ background: "#f0fdf4", color: "#166534", border: "1px solid #bbf7d0", padding: "8px 16px", borderRadius: "10px", textAlign: "right" }}>
                  <span style={{ fontSize: "10px", fontWeight: 800, textTransform: "uppercase", display: "block" }}>TODAY'S NET PROFIT</span>
                  <strong style={{ fontSize: "18px", color: "#166534" }}>+₹{todayNetProfit.toFixed(2)}</strong>
                </div>
              </div>

              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                  <thead>
                    <tr style={{ background: "#f8fafc", color: "#475569", textAlign: "left", borderBottom: "2px solid #e2e8f0" }}>
                      <th style={{ padding: "12px" }}>Date</th>
                      <th style={{ padding: "12px" }}>Orders Placed</th>
                      <th style={{ padding: "12px" }}>Gross Product Sales (100%)</th>
                      <th style={{ padding: "12px" }}>Platform Service Fee (5%)</th>
                      <th style={{ padding: "12px" }}>💵 Every Day Net Profit (95%)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dailyProfitData.map((row, idx) => (
                      <tr key={idx} style={{ borderBottom: "1px solid #f1f5f9" }}>
                        <td style={{ padding: "12px", fontWeight: 800, color: "#0f172a" }}>📅 {row.date}</td>
                        <td style={{ padding: "12px", color: "#475569" }}>{row.ordersCount} Order(s)</td>
                        <td style={{ padding: "12px", fontWeight: 700 }}>₹{row.grossRevenue.toLocaleString("en-IN")}</td>
                        <td style={{ padding: "12px", color: "#dc2626", fontWeight: 700 }}>-₹{(row.grossRevenue * 0.05).toFixed(2)}</td>
                        <td style={{ padding: "12px" }}>
                          <span className="dash-metric-pill dash-metric-pill--green" style={{ fontSize: "13px", fontWeight: 900 }}>
                            +₹{row.netProfit.toFixed(2)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Financial Revenue Breakdown Banner */}
            <div className="ap-info-banner" style={{ marginBottom: 24, background: "#f0fdf4", borderColor: "#bbf7d0", color: "#166534" }}>
              <span>💵</span>
              <div>
                <strong>Vendor Profit Structure:</strong> As a registered vendor on ShopSphere, you earn <strong>95% Net Profit</strong> on every order placed for your products. The <strong>5% Platform Fee</strong> is retained by Admin for hosting, marketing, and processing.
              </div>
            </div>

            {/* Recent Items Preview */}
            <div className="dash-card">
              <div className="dash-section-header" style={{ marginBottom: 16 }}>
                <h2 className="dash-card-title">Recent Inventory Submissions</h2>
                <button className="ap-btn-cancel ap-btn-sm" onClick={() => setActiveTab("products")}>
                  View All ({products.length}) →
                </button>
              </div>

              {products.length === 0 ? (
                <div className="ap-empty-state">
                  <span>📦</span>
                  <h3>No products submitted yet</h3>
                  <p>Start selling on ShopSphere by adding your first product listing.</p>
                  <button className="vf-submit-btn" onClick={() => setActiveTab("add")}>
                    Submit First Product →
                  </button>
                </div>
              ) : (
                <table className="dash-table">
                  <thead>
                    <tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th></tr>
                  </thead>
                  <tbody>
                    {products.slice(0, 5).map(p => (
                      <tr key={p._id}>
                        <td>
                          <div className="dash-product-cell">
                            {p.images?.[0]
                              ? <img src={p.images[0]} alt="" className="dash-product-thumb" />
                              : <span className="dash-product-thumb-placeholder">📦</span>}
                            <strong>{p.name}</strong>
                          </div>
                        </td>
                        <td className="dash-muted">{p.category}</td>
                        <td><strong>₹{p.price}</strong></td>
                        <td><span className="dash-metric-pill">{p.stock || 0} units</span></td>
                        <td><StatusBadge status={p.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* ═══════════ EARNINGS & NET PROFIT TAB ═══════════ */}
        {activeTab === "earnings" && (
          <div className="dash-section">
            <h1 className="dash-page-title">Vendor Net Profit &amp; Payout Analytics</h1>
            <p className="dash-subtitle">Detailed breakdown of gross customer payments, 5% admin fee, and your 95% net earnings.</p>

            <div className="dash-stat-grid" style={{ margin: "20px 0 24px" }}>
              <div className="dash-stat-card dash-stat-card--gold">
                <span className="dash-stat-icon">💵</span>
                <div>
                  <p>Net Profit Earned (95%)</p>
                  <strong style={{ color: "#15803d", fontSize: 24 }}>₹{netVendorProfit.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</strong>
                </div>
              </div>

              <div className="dash-stat-card dash-stat-card--blue">
                <span className="dash-stat-icon">💰</span>
                <div>
                  <p>Gross Store Sales (100%)</p>
                  <strong>₹{totalGrossRevenue.toLocaleString("en-IN")}</strong>
                </div>
              </div>

              <div className="dash-stat-card dash-stat-card--pink">
                <span className="dash-stat-icon">⚖️</span>
                <div>
                  <p>Admin Platform Fee (5%)</p>
                  <strong style={{ color: "#be123c" }}>-₹{adminPlatformFee.toFixed(2)}</strong>
                </div>
              </div>

              <div className="dash-stat-card dash-stat-card--green">
                <span className="dash-stat-icon">🏦</span>
                <div>
                  <p>Settled &amp; Available Payout</p>
                  <strong>₹{netVendorProfit.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</strong>
                </div>
              </div>
            </div>

            {/* 📊 Monthly Sales & Revenue Bar Chart Card */}
            <div className="dash-card" style={{ marginBottom: 24, padding: "24px", background: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 4px 14px rgba(0,0,0,0.03)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 800, color: "#0f172a" }}>
                    📊 Monthly Sales &amp; Revenue Analytics (2026)
                  </h2>
                  <p style={{ margin: "4px 0 0", fontSize: "0.85rem", color: "#64748b" }}>
                    Track your store's monthly gross sales (₹), 95% net profits, and order volumes.
                  </p>
                </div>
                <div style={{ display: "flex", gap: "16px", alignItems: "center", background: "#f8fafc", padding: "8px 16px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.8rem", fontWeight: 700, color: "#9333ea" }}>
                    <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#9333ea", display: "inline-block" }} /> Gross Sales (₹)
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.8rem", fontWeight: 700, color: "#166534" }}>
                    <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#22c55e", display: "inline-block" }} /> Net Profit 95% (₹)
                  </span>
                </div>
              </div>

              {/* Monthly Bar Chart Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: "8px", alignItems: "flex-end", height: "210px", padding: "20px 12px 12px", background: "#faf5ff", borderRadius: "14px", border: "1px solid #f3e8ff" }}>
                {monthlySalesData.monthlyMap.map((m) => {
                  const barHeightPercent = monthlySalesData.maxSales > 0 ? Math.max(10, Math.round((m.grossSales / monthlySalesData.maxSales) * 100)) : 10;
                  return (
                    <div
                      key={m.month}
                      style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", height: "100%", justifyContent: "flex-end" }}
                      title={`${m.month}: ₹${m.grossSales.toLocaleString("en-IN")} Gross Sales (${m.orderCount} Orders)`}
                    >
                      <div style={{ fontSize: "10px", fontWeight: 800, color: "#7e22ce" }}>
                        {m.grossSales > 0 ? `₹${(m.grossSales / 1000).toFixed(1)}k` : "₹0"}
                      </div>
                      
                      <div style={{ width: "100%", maxWidth: "34px", height: `${barHeightPercent}%`, background: "linear-gradient(180deg, #c084fc 0%, #9333ea 100%)", borderRadius: "8px 8px 0 0", position: "relative", transition: "all 0.3s ease", boxShadow: "0 4px 10px rgba(147, 51, 234, 0.2)" }}>
                        {/* Net Profit Green Accent Bar */}
                        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "95%", background: "linear-gradient(180deg, #4ade80 0%, #166534 100%)", borderRadius: "6px 6px 0 0", opacity: 0.85 }} />
                      </div>

                      <span style={{ fontSize: "11px", fontWeight: 700, color: "#475569" }}>{m.month}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Per-Order Net Profit Table */}
            <div className="dash-card" style={{ marginBottom: 24 }}>
              <h2 className="dash-card-title">🧾 Per-Order Vendor Profit Breakdown</h2>
              {orders.length === 0 ? (
                <div className="ap-empty-state">
                  <span>💰</span>
                  <h3>No order earnings recorded yet</h3>
                  <p>When buyers purchase products from your store, your 95% net profit will be calculated here.</p>
                </div>
              ) : (
                <table className="dash-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer Name</th>
                      <th>Gross Price (100%)</th>
                      <th>Admin Fee (5%)</th>
                      <th>💵 Vendor Net Profit (95%)</th>
                      <th>Settlement Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o) => {
                      const gross = o.totalAmount || 0;
                      const fee = gross * 0.05;
                      const profit = gross * 0.95;
                      return (
                        <tr key={o._id}>
                          <td><strong style={{ fontSize: 12 }}>#{o._id.slice(-6).toUpperCase()}</strong></td>
                          <td>{o.shippingAddress?.fullName || o.user?.name || "Customer"}</td>
                          <td><strong>₹{gross.toLocaleString("en-IN")}</strong></td>
                          <td style={{ color: "#be123c" }}>-₹{fee.toFixed(2)}</td>
                          <td>
                            <span className="dash-metric-pill dash-metric-pill--green" style={{ fontSize: 13 }}>
                              +₹{profit.toFixed(2)}
                            </span>
                          </td>
                          <td>
                            <span className="dash-metric-pill dash-metric-pill--gold">
                              Ready for Payout ✅
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            {/* Payout Method Setup */}
            <div className="dash-card">
              <h2 className="dash-card-title">Payout Method &amp; Bank Settlement</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20, marginTop: 14 }}>
                <div style={{ padding: 16, background: "#f8fafc", borderRadius: 10, border: "1px solid #e2e8f0" }}>
                  <h4 style={{ margin: "0 0 8px" }}>💳 Direct Bank Transfer</h4>
                  <p style={{ fontSize: 13, color: "#666", margin: 0 }}>Account: ********4821</p>
                  <p style={{ fontSize: 13, color: "#666", margin: "4px 0 0" }}>IFSC: HDFC0001234</p>
                </div>
                <div style={{ padding: 16, background: "#f8fafc", borderRadius: 10, border: "1px solid #e2e8f0" }}>
                  <h4 style={{ margin: "0 0 8px" }}>📱 UPI Settlement</h4>
                  <p style={{ fontSize: 13, color: "#666", margin: 0 }}>VPA: vendor@upi</p>
                  <p style={{ fontSize: 13, color: "#666", margin: "4px 0 0" }}>Status: Active ✅</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════ CATALOG MANAGEMENT TAB ═══════════ */}
        {activeTab === "products" && (
          <div className="dash-section">
            <div className="dash-section-header">
              <div>
                <h1 className="dash-page-title">Catalog Management</h1>
                <p className="dash-subtitle">View, search, and monitor your submitted product listings.</p>
              </div>
              <button className="vf-submit-btn" onClick={() => setActiveTab("add")}>
                + Submit Product
              </button>
            </div>

            {/* Search & Status Filters */}
            <div className="dash-filter-bar" style={{ marginBottom: 20 }}>
              <button
                className={`dash-filter-btn ${statusFilter === "all" ? "active" : ""}`}
                onClick={() => setStatusFilter("all")}
              >
                All Products ({products.length})
              </button>
              <button
                className={`dash-filter-btn ${statusFilter === "approved" ? "active" : ""}`}
                onClick={() => setStatusFilter("approved")}
              >
                ✅ Live ({approvedCount})
              </button>
              <button
                className={`dash-filter-btn ${statusFilter === "pending" ? "active" : ""}`}
                onClick={() => setStatusFilter("pending")}
              >
                🕐 Pending Review ({pendingCount})
              </button>
              <button
                className={`dash-filter-btn ${statusFilter === "rejected" ? "active" : ""}`}
                onClick={() => setStatusFilter("rejected")}
              >
                ❌ Rejected ({rejectedCount})
              </button>

              <input
                className="dash-search"
                style={{ marginLeft: "auto", maxWidth: 260 }}
                placeholder="Search catalog…"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>

            {loading ? (
              <div className="dash-loading"><span className="dash-spinner" /></div>
            ) : filteredProducts.length === 0 ? (
              <div className="ap-empty-state">
                <span>📦</span>
                <h3>No matching products</h3>
                <p>Try clearing your search query or filter settings.</p>
              </div>
            ) : (
              <div className="vendor-product-grid">
                {filteredProducts.map(p => (
                  <div key={p._id} className={`vendor-product-card vendor-product-card--${p.status}`}>
                    <div className="vendor-product-img">
                      {p.images?.[0]
                        ? <img src={p.images[0]} alt={p.name} />
                        : <span>📦</span>}
                    </div>
                    <div className="vp-status-ribbon">
                      <StatusBadge status={p.status} />
                    </div>
                    <div className="vendor-product-body">
                      <p className="vendor-product-cat">{p.category} • {p.subCategory}</p>
                      <h3 className="vendor-product-name">{p.name}</h3>
                      <div className="vendor-product-price-row">
                        <strong>₹{p.price}</strong>
                        {p.oldPrice > p.price && <s className="vendor-product-old">₹{p.oldPrice}</s>}
                      </div>

                      {p.status === "rejected" && p.rejectionReason && (
                        <p className="vp-rejection-note">
                          💬 Reason: {p.rejectionReason}
                        </p>
                      )}

                      <div className="vendor-product-meta">
                        <span>Stock: <strong>{p.stock}</strong></span>
                        <span>{new Date(p.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
                      </div>

                      <div className="dash-action-row" style={{ marginTop: 12 }}>
                        {p.status === "approved" && (
                          <Link to={`/product/${p._id}`} target="_blank" className="ap-btn-approve ap-btn-sm" style={{ textDecoration: "none" }}>
                            👁️ Live View
                          </Link>
                        )}
                        <button
                          className="dash-del-btn"
                          onClick={() => handleDeleteProduct(p._id, p.name)}
                          title="Delete Product"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ═══════════ SUBMIT PRODUCT FORM TAB ═══════════ */}
        {activeTab === "add" && (
          <div className="dash-section">
            <h1 className="dash-page-title">Submit New Product</h1>
            <p className="dash-subtitle">Submit your product for Admin verification. Once approved, it goes live in ShopSphere.</p>

            <div className="ap-info-banner" style={{ margin: "16px 0 24px" }}>
              <span>ℹ️</span>
              <div>
                <strong>Listing Guidelines:</strong> Make sure to provide accurate titles, correct category mapping, and high quality product photos. Approval typically takes 1–2 hours.
              </div>
            </div>

            <div className="dash-card">
              <form className="vendor-form" onSubmit={handleSubmit}>
                <div className="vf-grid-2">
                  <div className="vf-field">
                    <label>Product Title <span className="vf-req">*</span></label>
                    <input name="name" placeholder="e.g. Premium Cotton Kurti Set" value={form.name} onChange={handleChange} required />
                  </div>
                  <div className="vf-field">
                    <label>Brand / Store Tag <span className="vf-req">*</span></label>
                    <input name="brand" placeholder="e.g. Royal Fashions" value={form.brand} onChange={handleChange} required />
                  </div>
                </div>

                <div className="vf-grid-2">
                  <div className="vf-field">
                    <label>Category <span className="vf-req">*</span></label>
                    <select name="category" value={form.category} onChange={handleChange} required>
                      <option value="">Select Category</option>
                      {CATS.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="vf-field">
                    <label>Sub-Category <span className="vf-req">*</span></label>
                    {form.category && CATEGORY_SUBS[form.category] ? (
                      <select name="subCategory" value={form.subCategory} onChange={handleChange} required>
                        <option value="">Select Sub-Category</option>
                        {CATEGORY_SUBS[form.category].map(sub => (
                          <option key={sub} value={sub}>{sub}</option>
                        ))}
                      </select>
                    ) : (
                      <select name="subCategory" disabled style={{ opacity: 0.6, cursor: "not-allowed" }}>
                        <option value="">Select Category First</option>
                      </select>
                    )}
                  </div>
                </div>

                <div className="vf-field">
                  <label>Product Description <span className="vf-req">*</span></label>
                  <textarea name="description" rows={4} placeholder="Detailed product specifications, fabric, care instructions…" value={form.description} onChange={handleChange} required />
                </div>

                <div className="vf-grid-3">
                  <div className="vf-field">
                    <label>Selling Price (₹) <span className="vf-req">*</span></label>
                    <input name="price" type="number" min="0" placeholder="699" value={form.price} onChange={handleChange} required />
                  </div>
                  <div className="vf-field">
                    <label>Original MRP (₹)</label>
                    <input name="oldPrice" type="number" min="0" placeholder="1299" value={form.oldPrice} onChange={handleChange} />
                  </div>
                  <div className="vf-field">
                    <label>Available Stock</label>
                    <input name="stock" type="number" min="0" placeholder="50" value={form.stock} onChange={handleChange} />
                  </div>
                </div>

                <div className="vf-grid-3">
                  <div className="vf-field">
                    <label>Primary Color</label>
                    <input name="color" placeholder="e.g. Maroon & Gold" value={form.color} onChange={handleChange} />
                  </div>
                  <div className="vf-field">
                    <label>Material / Fabric</label>
                    <input name="material" placeholder="e.g. Pure Chanderi Silk" value={form.material} onChange={handleChange} />
                  </div>
                  <div className="vf-field">
                    <label>Warranty / Guarantee</label>
                    <input name="warranty" placeholder="e.g. 6 Months Warranty" value={form.warranty} onChange={handleChange} />
                  </div>
                </div>

                <div className="vf-field">
                  <label>Product Images</label>
                  <label className="vf-file-label">
                    📷 Upload Images
                    <input type="file" multiple accept="image/*" onChange={handleImages} style={{ display: "none" }} />
                  </label>
                  {previews.length > 0 && (
                    <div className="vf-previews">
                      {previews.map((src, i) => (
                        <img key={i} src={src} alt="preview" className="vf-preview-img" />
                      ))}
                    </div>
                  )}
                </div>

                <button type="submit" className="vf-submit-btn" disabled={submitting}>
                  {submitting ? "Submitting to Admin…" : "Submit for Admin Approval →"}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ═══════════ CUSTOMER ORDERS TAB ═══════════ */}
        {activeTab === "orders" && (
          <div className="dash-section">
            <h1 className="dash-page-title">Store Orders ({vendorOrders.length})</h1>
            <p className="dash-subtitle">Orders placed by customers for your store products.</p>

            <div className="dash-card" style={{ marginTop: 20 }}>
              {vendorOrders.length === 0 ? (
                <div className="ap-empty-state">
                  <span>📑</span>
                  <h3>No customer orders yet</h3>
                  <p>When buyers purchase your live products, their order details will appear here.</p>
                </div>
              ) : (
                <table className="dash-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th>Items Ordered</th>
                      <th>Gross Price</th>
                      <th>💵 Vendor Net Profit (95%)</th>
                      <th>💳 Payment Method &amp; Status</th>
                      <th>Fulfillment</th>
                      <th>Order Date</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vendorOrders.map(o => {
                      const vendorItemsInOrder = (o.items || []).filter(item => {
                        const itemProdId = String(item.product?._id || item.product || "");
                        const itemVendorId = String(item.createdBy?._id || item.createdBy || "");
                        const itemSellerName = String(item.seller || item.product?.seller || "").toLowerCase();

                        return (itemVendorId && itemVendorId === meIdStr) ||
                          myProductIds.has(itemProdId) ||
                          (meNameStr && itemSellerName && itemSellerName.includes(meNameStr));
                      });

                      const gross = vendorItemsInOrder.reduce((sum, item) => sum + (Number(item.price || 0) * Number(item.quantity || 1)), 0);
                      const profit = gross * 0.95;
                      const payMethod = (o.paymentMethod || "COD").toUpperCase();

                      return (
                        <tr key={o._id}>
                          <td><strong style={{ fontSize: 12 }}>#{o._id.slice(-6).toUpperCase()}</strong></td>
                          <td>
                            <div>
                              <strong>{o.shippingAddress?.fullName || o.user?.name || "Customer"}</strong>
                              <div style={{ fontSize: 11, color: "#888" }}>{o.shippingAddress?.phone}</div>
                            </div>
                          </td>
                          <td>
                            <div style={{ fontSize: 12 }}>
                              {vendorItemsInOrder.map((item, idx) => (
                                <div key={idx}>• {item.name} x {item.quantity}</div>
                              ))}
                            </div>
                          </td>
                          <td><strong>₹{gross.toLocaleString("en-IN")}</strong></td>
                          <td>
                            <span className="dash-metric-pill dash-metric-pill--green" style={{ fontSize: 13 }}>
                              +₹{profit.toFixed(2)}
                            </span>
                          </td>
                          <td>
                            {payMethod === "UPI" && (
                              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                                <span style={{ background: "#f3e8ff", color: "#6b21a8", fontSize: "11px", fontWeight: 800, padding: "3px 8px", borderRadius: "6px", width: "fit-content" }}>
                                  ⚡ Instant UPI Gateway
                                </span>
                                <span style={{ fontSize: "10px", color: "#166534", fontWeight: 800 }}>
                                  ✅ PAID ONLINE
                                </span>
                              </div>
                            )}

                            {payMethod === "CARD" && (
                              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                                <span style={{ background: "#eff6ff", color: "#1d4ed8", fontSize: "11px", fontWeight: 800, padding: "3px 8px", borderRadius: "6px", width: "fit-content" }}>
                                  💳 Credit / Debit Card
                                </span>
                                <span style={{ fontSize: "10px", color: "#166534", fontWeight: 800 }}>
                                  ✅ PAID ONLINE
                                </span>
                              </div>
                            )}

                            {(payMethod === "COD" || payMethod.includes("CASH")) && (
                              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                                <span style={{ background: "#fffbeb", color: "#92400e", fontSize: "11px", fontWeight: 800, padding: "3px 8px", borderRadius: "6px", width: "fit-content" }}>
                                  💵 Cash on Delivery (COD)
                                </span>
                                <span style={{ fontSize: "10px", color: o.paymentStatus === "PAID" ? "#166534" : "#b45309", fontWeight: 800 }}>
                                  {o.paymentStatus === "PAID" ? "✅ COLLECTED ON DELIVERY" : "⏳ PENDING (COLLECT AT DOOR)"}
                                </span>
                              </div>
                            )}
                          </td>
                          <td>
                            {o.orderStatus === "Dispatched" || o.orderStatus === "Out for Delivery" ? (
                              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                                <span className="dash-metric-pill dash-metric-pill--green" style={{ fontSize: "11px", fontWeight: 800 }}>
                                  🚀 Dispatched
                                </span>
                                <div style={{ fontSize: "11px", color: "#0f172a", fontWeight: 700 }}>
                                  👨‍💼 {o.deliveryBoyName || "Ramesh Kumar"}
                                </div>
                                <div style={{ fontSize: "10px", color: "#166534", fontWeight: 700 }}>
                                  📞 {o.deliveryBoyPhone || "+91 98765 43210"}
                                </div>
                                <div style={{ fontSize: "10px", color: "#9333ea", fontWeight: 900, background: "#faf5ff", border: "1px dashed #d8b4fe", padding: "2px 6px", borderRadius: "4px", width: "fit-content" }}>
                                  🔑 OTP: {o.deliveryOtp || "4920"}
                                </div>
                              </div>
                            ) : (
                              <span className="dash-metric-pill dash-metric-pill--gold">
                                {o.orderStatus || "Processing"}
                              </span>
                            )}
                          </td>
                          <td className="dash-muted">
                            {new Date(o.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                          </td>
                          <td>
                            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                              {o.orderStatus !== "Dispatched" && o.orderStatus !== "Out for Delivery" && (
                                <button
                                  type="button"
                                  className="ap-btn-approve ap-btn-sm"
                                  style={{ background: "linear-gradient(135deg, #166534 0%, #15803d 100%)", color: "#fff", border: "none", padding: "6px 10px", borderRadius: "6px", fontSize: "11px", fontWeight: 800, cursor: "pointer", boxShadow: "0 2px 6px rgba(22,101,52,0.3)" }}
                                  onClick={() => handleOpenDispatchModal(o)}
                                >
                                  🚀 Dispatch
                                </button>
                              )}
                              <button
                                type="button"
                                className="ap-btn-approve ap-btn-sm"
                                style={{ background: "#2563eb", color: "#fff", border: "none", padding: "6px 10px", borderRadius: "6px", fontSize: "11px", fontWeight: 700, cursor: "pointer" }}
                                onClick={() => setSelectedInvoiceOrder(o)}
                              >
                                🧾 Invoice
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* ═══════════ STORE PROFILE TAB ═══════════ */}
        {activeTab === "profile" && (
          <div className="dash-section">
            <h1 className="dash-page-title">Vendor Store Profile</h1>
            <p className="dash-subtitle">Store credentials, contact information, and store verification details.</p>

            <div className="dash-card" style={{ marginTop: 20 }}>
              <div style={{ display: "flex", gap: 20, alignItems: "center", borderBottom: "1px solid #eee", paddingBottom: 20 }}>
                <div style={{ width: 72, height: 72, background: "#ede9fe", color: "#5b21b6", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32 }}>
                  🏪
                </div>
                <div>
                  <h2 style={{ margin: 0 }}>{me?.name || "Vendor Store"}</h2>
                  <span className="vsb-verified-tag" style={{ marginTop: 6, display: "inline-block" }}>
                    ✅ Verified Vendor Store
                  </span>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginTop: 20 }}>
                <div>
                  <label style={{ fontSize: 12, color: "#888", fontWeight: 700 }}>STORE OWNER</label>
                  <p style={{ fontSize: 15, fontWeight: 600, margin: "4px 0 0" }}>{me?.name}</p>
                </div>
                <div>
                  <label style={{ fontSize: 12, color: "#888", fontWeight: 700 }}>REGISTERED EMAIL</label>
                  <p style={{ fontSize: 15, fontWeight: 600, margin: "4px 0 0" }}>{me?.email}</p>
                </div>
                <div>
                  <label style={{ fontSize: 12, color: "#888", fontWeight: 700 }}>PROFIT SHARE</label>
                  <p style={{ fontSize: 15, fontWeight: 600, margin: "4px 0 0", color: "#166534" }}>95% Vendor Net Profit</p>
                </div>
                <div>
                  <label style={{ fontSize: 12, color: "#888", fontWeight: 700 }}>PLATFORM FEE</label>
                  <p style={{ fontSize: 15, fontWeight: 600, margin: "4px 0 0", color: "#be123c" }}>5% Admin Platform Fee</p>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
