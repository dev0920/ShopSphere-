import { API_BASE_URL } from "../config/apiConfig";
import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/dashboard.css";

const API = `${API_BASE_URL}/api`;

function getToken() {
  return localStorage.getItem("token") || sessionStorage.getItem("token");
}
function getUser() {
  try {
    return JSON.parse(localStorage.getItem("user") || sessionStorage.getItem("user"));
  } catch { return null; }
}

const STATUS_META = {
  approved: { label: "Approved", bg: "#f0fdf4", color: "#166534" },
  pending:  { label: "Pending",  bg: "#fffbeb", color: "#92400e" },
  rejected: { label: "Rejected", bg: "#fff1f2", color: "#be123c" },
};

function StatusBadge({ status }) {
  const m = STATUS_META[status] || STATUS_META.pending;
  return (
    <span className="ap-status-badge" style={{ background: m.bg, color: m.color }}>
      {status === "approved" && "✅ "}
      {status === "pending"  && "🕐 "}
      {status === "rejected" && "❌ "}
      {m.label}
    </span>
  );
}

const ROLE_COLORS = {
  admin:  { bg: "#fef3c7", color: "#92400e" },
  vendor: { bg: "#ede9fe", color: "#5b21b6" },
  user:   { bg: "#f0fdf4", color: "#166534" },
};

function RoleBadge({ role }) {
  const s = ROLE_COLORS[role] || ROLE_COLORS.user;
  return (
    <span style={{
      background: s.bg,
      color: s.color,
      padding: "3px 12px",
      borderRadius: "14px",
      fontSize: "12px",
      fontWeight: 700,
      display: "inline-flex",
      alignItems: "center",
      gap: "4px"
    }}>
      {role === "admin" && "👑 "}
      {role === "vendor" && "🏪 "}
      {role === "user" && "👤 "}
      {role.charAt(0).toUpperCase() + role.slice(1)}
    </span>
  );
}

export default function AdminDashboard() {
  const [activeTab,           setActiveTab]           = useState("approvals");
  const [users,               setUsers]               = useState([]);
  const [stats,               setStats]               = useState({ total: 0, admins: 0, vendors: 0, users: 0 });
  const [allProducts,         setAllProducts]         = useState([]);
  const [pendingProds,        setPendingProds]        = useState([]);
  const [allOrders,           setAllOrders]           = useState([]);
  const [loading,             setLoading]             = useState(true);
  const [toast,               setToast]               = useState(null);
  const [search,              setSearch]              = useState("");
  const [userRoleFilter,      setUserRoleFilter]      = useState("all");
  const [selectedVendorId,    setSelectedVendorId]    = useState("all");
  const [rejectModal,         setRejectModal]         = useState(null); // { id, name }
  const [rejectReason,        setRejectReason]        = useState("");
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState(null);

  const navigate = useNavigate();
  const me = getUser();

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const authHeaders = () => ({
    Authorization: `Bearer ${getToken()}`,
    "Content-Type": "application/json",
  });

  // ── fetch helpers ──────────────────────────────
  const fetchUsers = useCallback(async () => {
    const res  = await fetch(`${API}/auth/users`, { headers: authHeaders() });
    const data = await res.json();
    if (data.success) {
      setUsers(data.users || []);
      setStats(data.stats || { total: 0, admins: 0, vendors: 0, users: 0 });
    }
  }, []);

  const fetchAllProducts = useCallback(async () => {
    const [approved, pending, rejected] = await Promise.all([
      fetch(`${API}/products?limit=500&status=approved`).then(r => r.json()),
      fetch(`${API}/products?limit=500&status=pending`).then(r => r.json()),
      fetch(`${API}/products?limit=500&status=rejected`).then(r => r.json()),
    ]);
    const combined = [
      ...(pending.products  || []),
      ...(approved.products || []),
      ...(rejected.products || []),
    ];
    setPendingProds(pending.products || []);
    setAllProducts(combined);
  }, []);

  const fetchAllOrders = useCallback(async () => {
    try {
      const res = await fetch(`${API}/orders/vendor-orders`, { headers: authHeaders() });
      const data = await res.json();
      if (data.success) {
        setAllOrders(data.orders || []);
      }
    } catch { console.error("Error fetching orders for admin"); }
  }, []);

  useEffect(() => {
    Promise.all([fetchUsers(), fetchAllProducts(), fetchAllOrders()]).finally(() => setLoading(false));

    // Real-time live polling every 3 seconds for instant order, GMV, and Admin profit updates
    const timer = setInterval(() => {
      fetchAllOrders();
    }, 3000);

    return () => clearInterval(timer);
  }, [fetchUsers, fetchAllProducts, fetchAllOrders]);

  // ── actions ────────────────────────────────────
  const handleApprove = async (id, name) => {
    try {
      const res  = await fetch(`${API}/products/${id}/approve`, {
        method: "PATCH", headers: authHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`✅ "${name}" is now live!`);
        fetchAllProducts();
        fetchUsers();
      } else showToast(data.message, "error");
    } catch { showToast("Approve failed", "error"); }
  };

  const openRejectModal = (id, name) => {
    setRejectModal({ id, name });
    setRejectReason("");
  };

  const handleReject = async () => {
    if (!rejectModal) return;
    try {
      const res  = await fetch(`${API}/products/${rejectModal.id}/reject`, {
        method: "PATCH",
        headers: authHeaders(),
        body:   JSON.stringify({ reason: rejectReason || "Does not meet listing guidelines." }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`❌ "${rejectModal.name}" rejected.`, "error");
        setRejectModal(null);
        fetchAllProducts();
        fetchUsers();
      } else showToast(data.message, "error");
    } catch { showToast("Reject failed", "error"); }
  };

  const handleDeleteProduct = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      const res  = await fetch(`${API}/products/${id}`, {
        method: "DELETE", headers: authHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        showToast("Product deleted");
        fetchAllProducts();
        fetchUsers();
      } else showToast(data.message, "error");
    } catch { showToast("Delete failed", "error"); }
  };

  const handleRoleChange = async (userId, newRole) => {
    const res  = await fetch(`${API}/auth/users/${userId}/role`, {
      method: "PATCH", headers: authHeaders(),
      body: JSON.stringify({ role: newRole }),
    });
    const data = await res.json();
    if (data.success) {
      showToast(`Role updated to "${newRole}"`);
      fetchUsers();
    } else showToast(data.message, "error");
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Delete user "${userName}"?`)) return;
    const res  = await fetch(`${API}/auth/users/${userId}`, {
      method: "DELETE", headers: authHeaders(),
    });
    const data = await res.json();
    if (data.success) {
      setUsers(prev => prev.filter(u => u._id !== userId));
      showToast("User deleted");
      fetchUsers();
    } else showToast(data.message, "error");
  };

  const handleLogout = () => { localStorage.clear(); sessionStorage.clear(); navigate("/login"); };

  // ── Computations ──
  const vendorsList = users.filter(u => u.role === "vendor");
  
  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
                          u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = userRoleFilter === "all" ? true : u.role === userRoleFilter;
    return matchesSearch && matchesRole;
  });

  const filteredVendors = vendorsList.filter(v =>
    v.name.toLowerCase().includes(search.toLowerCase()) ||
    v.email.toLowerCase().includes(search.toLowerCase())
  );

  const displayedProducts = selectedVendorId === "all"
    ? allProducts
    : allProducts.filter(p => p.createdBy?._id === selectedVendorId || p.createdBy === selectedVendorId);

  const approvedProducts = allProducts.filter(p => p.status === "approved");
  const rejectedProducts = allProducts.filter(p => p.status === "rejected");

  // Admin Financial Analytics
  const totalGrossGMV = allOrders.reduce((acc, o) => acc + (o.totalAmount || 0), 0);
  const totalAdminProfit = totalGrossGMV * 0.05; // 5% Commission
  const totalVendorPayouts = totalGrossGMV * 0.95; // 95% Vendor Disbursal

  const handleViewVendorProducts = (vendorId) => {
    setSelectedVendorId(vendorId);
    setActiveTab("products");
  };

  if (loading) return (
    <div className="dash-loading">
      <span className="dash-spinner" />
      <p>Loading Admin Portal…</p>
    </div>
  );

  return (
    <div className="dash-root">

      {/* ── Toast ── */}
      {toast && <div className={`dash-toast dash-toast--${toast.type}`}>{toast.msg}</div>}

      {/* ── Reject modal ── */}
      {rejectModal && (
        <div className="ap-modal-backdrop">
          <div className="ap-modal">
            <h3>Reject Product</h3>
            <p className="ap-modal-product-name">"{rejectModal.name}"</p>
            <label>Reason for rejection</label>
            <textarea
              rows={3}
              placeholder="e.g. Low quality images, incorrect category…"
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
            />
            <div className="ap-modal-actions">
              <button className="ap-btn-cancel" onClick={() => setRejectModal(null)}>Cancel</button>
              <button className="ap-btn-reject" onClick={handleReject}>Reject Product</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Admin Tax Invoice Modal ── */}
      {selectedInvoiceOrder && (
        <div className="ap-modal-backdrop" style={{ background: "rgba(15,23,42,0.8)", zIndex: 9999 }}>
          <div className="ap-modal" style={{ maxWidth: "750px", width: "95%", padding: "32px", background: "#ffffff", borderRadius: "20px", color: "#0f172a" }}>
            
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "2px solid #0f172a", paddingBottom: "16px", marginBottom: "20px" }}>
              <div>
                <h2 style={{ margin: 0, color: "#0f172a", fontSize: "24px", fontWeight: 900 }}>🛍️ ShopSphere</h2>
                <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#64748b" }}>Admin Platform Master Invoice &amp; Tax Receipt</p>
                <p style={{ margin: "2px 0 0", fontSize: "11px", color: "#94a3b8" }}>GSTIN: 27AAACS1234F1Z9 • PAN: AAACS1234F</p>
              </div>
              <div style={{ textAlign: "right" }}>
                <span style={{ background: "#f43397", color: "#ffffff", padding: "4px 12px", borderRadius: "6px", fontSize: "12px", fontWeight: 800 }}>MASTER INVOICE</span>
                <h4 style={{ margin: "8px 0 2px", fontSize: "14px", fontFamily: "monospace" }}>Invoice #{selectedInvoiceOrder._id.slice(-8).toUpperCase()}</h4>
                <p style={{ margin: 0, fontSize: "12px", color: "#64748b" }}>Date: {new Date(selectedInvoiceOrder.createdAt).toLocaleDateString("en-IN")}</p>
              </div>
            </div>

            {/* Address & Admin Details */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", background: "#f8fafc", padding: "16px", borderRadius: "12px", marginBottom: "20px", fontSize: "12px" }}>
              <div>
                <strong style={{ color: "#475569", textTransform: "uppercase" }}>Customer Delivery Address:</strong>
                <div style={{ marginTop: "4px", fontSize: "13px", fontWeight: 700, color: "#0f172a" }}>{selectedInvoiceOrder.shippingAddress?.fullName}</div>
                <div>📞 Phone: {selectedInvoiceOrder.shippingAddress?.phone}</div>
                <div>📍 {selectedInvoiceOrder.shippingAddress?.address}, {selectedInvoiceOrder.shippingAddress?.city}, {selectedInvoiceOrder.shippingAddress?.state} - {selectedInvoiceOrder.shippingAddress?.pincode}</div>
              </div>
              <div>
                <strong style={{ color: "#475569", textTransform: "uppercase" }}>Platform Admin Details:</strong>
                <div style={{ marginTop: "4px", fontSize: "13px", fontWeight: 700, color: "#0f172a" }}>ShopSphere Super Admin</div>
                <div>✉️ admin@shopsphere.com</div>
                <div style={{ marginTop: "4px" }}>Order Status: <span style={{ color: "#059669", fontWeight: 700 }}>PAID / VERIFIED ✓</span></div>
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
                      {item.seller && <div style={{ fontSize: "11px", color: "#64748b" }}>Vendor Seller: {item.seller}</div>}
                    </td>
                    <td style={{ padding: "12px" }}>{item.quantity}</td>
                    <td style={{ padding: "12px" }}>₹{Number(item.price).toLocaleString("en-IN")}</td>
                    <td style={{ padding: "12px", textAlign: "right", fontWeight: 700 }}>₹{(item.price * item.quantity).toLocaleString("en-IN")}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Admin Financial Attribution */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", background: "#f8fafc", padding: "16px", borderRadius: "12px", marginBottom: "24px" }}>
              <div>
                <div style={{ fontSize: "11px", color: "#64748b" }}>Gross GMV Value</div>
                <strong style={{ fontSize: "16px", color: "#0f172a" }}>₹{Number(selectedInvoiceOrder.totalAmount).toLocaleString("en-IN")}</strong>
              </div>
              <div>
                <div style={{ fontSize: "11px", color: "#64748b" }}>Vendor Disbursal (95%)</div>
                <strong style={{ fontSize: "16px", color: "#047857" }}>₹{(selectedInvoiceOrder.totalAmount * 0.95).toFixed(2)}</strong>
              </div>
              <div>
                <div style={{ fontSize: "11px", color: "#64748b" }}>Admin Fee (5%)</div>
                <strong style={{ fontSize: "16px", color: "#f43397" }}>₹{(selectedInvoiceOrder.totalAmount * 0.05).toFixed(2)}</strong>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
              <button type="button" className="ap-btn-cancel" onClick={() => setSelectedInvoiceOrder(null)}>Close</button>
              <button type="button" className="ap-btn-approve" style={{ background: "#2563eb", color: "#fff" }} onClick={() => window.print()}>🖨️ Print / Download Master PDF</button>
            </div>

          </div>
        </div>
      )}

      {/* ── Sidebar ── */}
      <aside className="dash-sidebar">
        <Link to="/admin-dashboard" className="dash-brand" onClick={() => setActiveTab("overview")}>
          <span>🛍️</span><span>ShopSphere</span>
        </Link>

        <nav className="dash-nav">
          <button className={`dash-nav-item${activeTab === "approvals" ? " active" : ""}`}
            onClick={() => setActiveTab("approvals")}>
            <span>🕐</span> Approvals
            {pendingProds.length > 0 && (
              <span className="dash-nav-badge ap-pending-count">{pendingProds.length}</span>
            )}
          </button>

          <button className={`dash-nav-item${activeTab === "financials" ? " active" : ""}`}
            onClick={() => setActiveTab("financials")}>
            <span>👑</span> Revenue &amp; Profits
          </button>
          
          <button className={`dash-nav-item${activeTab === "overview" ? " active" : ""}`}
            onClick={() => setActiveTab("overview")}>
            <span>📊</span> Overview
          </button>

          <button className={`dash-nav-item${activeTab === "vendors" ? " active" : ""}`}
            onClick={() => setActiveTab("vendors")}>
            <span>🏪</span> Vendors
            <span className="dash-nav-badge">{stats.vendors}</span>
          </button>

          <button className={`dash-nav-item${activeTab === "users" ? " active" : ""}`}
            onClick={() => setActiveTab("users")}>
            <span>👥</span> Users &amp; Roles
            <span className="dash-nav-badge">{stats.total}</span>
          </button>

          <button className={`dash-nav-item${activeTab === "products" ? " active" : ""}`}
            onClick={() => setActiveTab("products")}>
            <span>📦</span> All Products
            <span className="dash-nav-badge">{allProducts.length}</span>
          </button>

          <button className={`dash-nav-item${activeTab === "orders" ? " active" : ""}`}
            onClick={() => setActiveTab("orders")}>
            <span>📄</span> All Orders &amp; Invoices
            <span className="dash-nav-badge">{allOrders.length}</span>
          </button>
        </nav>

        <div className="dash-sidebar-footer">
          <div className="dash-sidebar-user">
            <span className="dash-avatar">{me?.name?.charAt(0).toUpperCase()}</span>
            <div>
              <strong>{me?.name}</strong>
              <span>Super Admin</span>
            </div>
          </div>
          <button className="dash-logout-btn" onClick={handleLogout}>🚪 Logout</button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main className="dash-main">

        {/* ═══════════ REVENUE & ADMIN PROFIT TAB ═══════════ */}
        {activeTab === "financials" && (
          <div className="dash-section">
            <h1 className="dash-page-title">Admin Platform Revenue &amp; Profit Analytics</h1>
            <p className="dash-subtitle">Real-time platform financial breakdown: 5% Admin Commission vs 95% Vendor Disbursals.</p>

            {/* Financial Overview Cards */}
            <div className="dash-stat-grid" style={{ margin: "20px 0 24px" }}>
              <div className="dash-stat-card dash-stat-card--gold">
                <span className="dash-stat-icon">👑</span>
                <div>
                  <p>Total Admin Net Profit (5%)</p>
                  <strong style={{ color: "#b45309", fontSize: 24 }}>₹{totalAdminProfit.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</strong>
                </div>
              </div>

              <div className="dash-stat-card dash-stat-card--blue">
                <span className="dash-stat-icon">🌐</span>
                <div>
                  <p>Gross Platform Sales (GMV)</p>
                  <strong>₹{totalGrossGMV.toLocaleString("en-IN")}</strong>
                </div>
              </div>

              <div className="dash-stat-card dash-stat-card--green">
                <span className="dash-stat-icon">🏪</span>
                <div>
                  <p>Vendor Disbursals (95%)</p>
                  <strong>₹{totalVendorPayouts.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</strong>
                </div>
              </div>

              <div className="dash-stat-card dash-stat-card--purple">
                <span className="dash-stat-icon">📊</span>
                <div>
                  <p>Avg. Admin Earnings / Order</p>
                  <strong>₹{allOrders.length > 0 ? (totalAdminProfit / allOrders.length).toFixed(2) : "0.00"}</strong>
                </div>
              </div>
            </div>

            {/* Platform Revenue Model Info Card */}
            <div className="ap-info-banner" style={{ marginBottom: 24, background: "#fefce8", borderColor: "#fef08a", color: "#713f12" }}>
              <span>💡</span>
              <div>
                <strong>ShopSphere Business Model:</strong> The Admin platform automatically earns a <strong>5% Commission Fee</strong> on every customer order. The remaining <strong>95%</strong> is credited to the fulfilling vendor's payout balance.
              </div>
            </div>

            {/* Transaction Ledger */}
            <div className="dash-card">
              <h2 className="dash-card-title">
                🧾 Order Financial Ledger ({allOrders.length} Transactions)
              </h2>
              {allOrders.length === 0 ? (
                <div className="ap-empty-state">
                  <span>💰</span>
                  <h3>No transactions recorded yet</h3>
                  <p>When customer orders are placed, the 5% Admin Commission and 95% Vendor Share will be logged here.</p>
                </div>
              ) : (
                <table className="dash-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer Name</th>
                      <th>Gross Amount</th>
                      <th>👑 Admin Profit (5%)</th>
                      <th>🏪 Vendor Share (95%)</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allOrders.map((o) => {
                      const gross = o.totalAmount || 0;
                      const adminProfit = gross * 0.05;
                      const vendorShare = gross * 0.95;
                      return (
                        <tr key={o._id}>
                          <td><strong style={{ fontSize: 12 }}>#{o._id.slice(-6).toUpperCase()}</strong></td>
                          <td>{o.shippingAddress?.fullName || o.user?.name || "Customer"}</td>
                          <td><strong>₹{gross.toLocaleString("en-IN")}</strong></td>
                          <td>
                            <span className="dash-metric-pill dash-metric-pill--gold">
                              +₹{adminProfit.toFixed(2)}
                            </span>
                          </td>
                          <td>
                            <span className="dash-metric-pill dash-metric-pill--green">
                              ₹{vendorShare.toFixed(2)}
                            </span>
                          </td>
                          <td className="dash-muted">
                            {new Date(o.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
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

        {/* ═══════════ APPROVALS TAB ═══════════ */}
        {activeTab === "approvals" && (
          <div className="dash-section">
            <h1 className="dash-page-title">Product Approvals</h1>

            <div className="dash-stat-grid">
              <div className="dash-stat-card dash-stat-card--pink">
                <span className="dash-stat-icon">🕐</span>
                <div><p>Pending Review</p><strong>{pendingProds.length}</strong></div>
              </div>
              <div className="dash-stat-card dash-stat-card--green">
                <span className="dash-stat-icon">✅</span>
                <div><p>Approved</p><strong>{approvedProducts.length}</strong></div>
              </div>
              <div className="dash-stat-card dash-stat-card--blue">
                <span className="dash-stat-icon">❌</span>
                <div><p>Rejected</p><strong>{rejectedProducts.length}</strong></div>
              </div>
            </div>

            {pendingProds.length === 0 ? (
              <div className="ap-empty-state">
                <span>🎉</span>
                <h3>All caught up!</h3>
                <p>No products waiting for approval.</p>
              </div>
            ) : (
              <div className="dash-card">
                <h2 className="dash-card-title">
                  🕐 Pending Approval ({pendingProds.length})
                </h2>
                <div className="ap-approval-list">
                  {pendingProds.map(p => (
                    <div key={p._id} className="ap-approval-card">
                      <div className="ap-product-img">
                        {p.images?.[0]
                          ? <img src={p.images[0]} alt={p.name} />
                          : <span>📦</span>}
                      </div>

                      <div className="ap-product-info">
                        <h3>{p.name}</h3>
                        <div className="ap-product-meta">
                          <span className="ap-meta-tag">{p.category}</span>
                          <span className="ap-meta-tag">{p.subCategory}</span>
                          <span className="ap-meta-tag">₹{p.price}</span>
                          {p.oldPrice > p.price && (
                            <span className="ap-meta-tag ap-meta-old">was ₹{p.oldPrice}</span>
                          )}
                        </div>
                        <p className="ap-product-desc">{p.description?.slice(0, 120)}…</p>
                        <div className="ap-vendor-row">
                          <span className="ap-vendor-label">Submitted by:</span>
                          <strong>{p.createdBy?.name || "Unknown Vendor"}</strong>
                          <span className="ap-vendor-email">{p.createdBy?.email}</span>
                          <span className="ap-vendor-date">
                            {new Date(p.createdAt).toLocaleDateString("en-IN", {
                              day: "numeric", month: "short", year: "numeric"
                            })}
                          </span>
                        </div>
                      </div>

                      <div className="ap-action-col">
                        <button
                          className="ap-btn-approve"
                          onClick={() => handleApprove(p._id, p.name)}
                        >
                          ✅ Approve
                        </button>
                        <button
                          className="ap-btn-reject"
                          onClick={() => openRejectModal(p._id, p.name)}
                        >
                          ❌ Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {rejectedProducts.length > 0 && (
              <div className="dash-card">
                <h2 className="dash-card-title">❌ Recently Rejected</h2>
                <table className="dash-table">
                  <thead>
                    <tr><th>Product</th><th>Vendor</th><th>Reason</th><th>Action</th></tr>
                  </thead>
                  <tbody>
                    {rejectedProducts.slice(0, 10).map(p => (
                      <tr key={p._id}>
                        <td>
                          <div className="dash-product-cell">
                            {p.images?.[0]
                              ? <img src={p.images[0]} alt="" className="dash-product-thumb" />
                              : <span className="dash-product-thumb-placeholder">📦</span>}
                            <span>{p.name}</span>
                          </div>
                        </td>
                        <td className="dash-muted">{p.createdBy?.name || "—"}</td>
                        <td className="dash-muted" style={{ maxWidth: 200, fontSize: 12 }}>
                          {p.rejectionReason || "—"}
                        </td>
                        <td>
                          <button className="ap-btn-approve ap-btn-sm"
                            onClick={() => handleApprove(p._id, p.name)}>
                            ✅ Approve Now
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ═══════════ OVERVIEW TAB ═══════════ */}
        {activeTab === "overview" && (
          <div className="dash-section">
            <h1 className="dash-page-title">Overview</h1>
            <div className="dash-stat-grid">
              <div className="dash-stat-card dash-stat-card--gold">
                <span className="dash-stat-icon">👑</span>
                <div><p>Admin Platform Profit (5%)</p><strong>₹{totalAdminProfit.toFixed(2)}</strong></div>
              </div>
              <div className="dash-stat-card dash-stat-card--blue">
                <span className="dash-stat-icon">👥</span>
                <div><p>Total Users</p><strong>{stats.total}</strong></div>
              </div>
              <div className="dash-stat-card dash-stat-card--purple">
                <span className="dash-stat-icon">🏪</span>
                <div><p>Vendors</p><strong>{stats.vendors}</strong></div>
              </div>
              <div className="dash-stat-card dash-stat-card--green">
                <span className="dash-stat-icon">✅</span>
                <div><p>Live Products</p><strong>{approvedProducts.length}</strong></div>
              </div>
            </div>

            <div className="dash-card">
              <h2 className="dash-card-title">Recently Joined Users</h2>
              <table className="dash-table">
                <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th></tr></thead>
                <tbody>
                  {users.slice(0, 5).map(u => (
                    <tr key={u._id}>
                      <td><strong>{u.name}</strong></td>
                      <td>{u.email}</td>
                      <td><RoleBadge role={u.role} /></td>
                      <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ═══════════ VENDORS TAB ═══════════ */}
        {activeTab === "vendors" && (
          <div className="dash-section">
            <div className="dash-section-header">
              <div>
                <h1 className="dash-page-title">Vendor Directory</h1>
                <p className="dash-subtitle">Manage store partners, view product counts, and audit vendor activity.</p>
              </div>
              <input
                className="dash-search"
                placeholder="Search vendor name or email…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            <div className="dash-stat-grid" style={{ marginBottom: 24 }}>
              <div className="dash-stat-card dash-stat-card--purple">
                <span className="dash-stat-icon">🏪</span>
                <div><p>Active Vendors</p><strong>{stats.vendors}</strong></div>
              </div>
              <div className="dash-stat-card dash-stat-card--blue">
                <span className="dash-stat-icon">📦</span>
                <div><p>Total Products Submitted</p><strong>{allProducts.length}</strong></div>
              </div>
              <div className="dash-stat-card dash-stat-card--pink">
                <span className="dash-stat-icon">🕐</span>
                <div><p>Pending Vendor Products</p><strong>{pendingProds.length}</strong></div>
              </div>
            </div>

            <div className="dash-card">
              <h2 className="dash-card-title">
                🏪 Registered Vendor Stores ({filteredVendors.length})
              </h2>
              <table className="dash-table">
                <thead>
                  <tr>
                    <th>Vendor Name</th>
                    <th>Email Address</th>
                    <th>Listed Products</th>
                    <th>Approval Status</th>
                    <th>Joined Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVendors.map(v => (
                    <tr key={v._id}>
                      <td>
                        <div className="dash-user-cell">
                          <span className="dash-avatar dash-avatar--sm" style={{ background: "#ede9fe", color: "#5b21b6" }}>
                            🏪
                          </span>
                          <div>
                            <strong>{v.name}</strong>
                            <div style={{ fontSize: 11, color: "#888" }}>Vendor Store</div>
                          </div>
                        </div>
                      </td>
                      <td className="dash-muted">{v.email}</td>
                      <td>
                        <span className="dash-metric-pill">
                          📦 {v.vendorStats?.totalProducts || 0} Total
                        </span>
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                          <span className="dash-metric-pill dash-metric-pill--green">
                            ✅ {v.vendorStats?.approvedProducts || 0} Live
                          </span>
                          {(v.vendorStats?.pendingProducts || 0) > 0 && (
                            <span className="dash-metric-pill dash-metric-pill--pink">
                              🕐 {v.vendorStats?.pendingProducts} Pending
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="dash-muted">{new Date(v.createdAt).toLocaleDateString()}</td>
                      <td>
                        <div className="dash-action-row">
                          <button
                            className="ap-btn-approve ap-btn-sm"
                            onClick={() => handleViewVendorProducts(v._id)}
                            title="View all products from this vendor"
                          >
                            🔍 View Products
                          </button>
                          <select
                            className="dash-role-select"
                            value={v.role}
                            disabled={v._id === me?._id}
                            onChange={e => handleRoleChange(v._id, e.target.value)}
                          >
                            <option value="user">Demote to User</option>
                            <option value="vendor">Vendor</option>
                            <option value="admin">Promote to Admin</option>
                          </select>
                          <button
                            className="dash-del-btn"
                            disabled={v._id === me?._id}
                            onClick={() => handleDeleteUser(v._id, v.name)}
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredVendors.length === 0 && (
                    <tr><td colSpan={6} className="dash-empty">No vendors found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ═══════════ USERS & ROLES TAB ═══════════ */}
        {activeTab === "users" && (
          <div className="dash-section">
            <div className="dash-section-header">
              <div>
                <h1 className="dash-page-title">User Account Management</h1>
                <p className="dash-subtitle">View system users, change access levels, or remove accounts.</p>
              </div>
              <input
                className="dash-search"
                placeholder="Search by name or email…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            {/* Filter Tabs */}
            <div className="dash-filter-bar">
              <button
                className={`dash-filter-btn ${userRoleFilter === "all" ? "active" : ""}`}
                onClick={() => setUserRoleFilter("all")}
              >
                All Users ({stats.total})
              </button>
              <button
                className={`dash-filter-btn ${userRoleFilter === "user" ? "active" : ""}`}
                onClick={() => setUserRoleFilter("user")}
              >
                👤 Customers ({stats.users})
              </button>
              <button
                className={`dash-filter-btn ${userRoleFilter === "vendor" ? "active" : ""}`}
                onClick={() => setUserRoleFilter("vendor")}
              >
                🏪 Vendors ({stats.vendors})
              </button>
              <button
                className={`dash-filter-btn ${userRoleFilter === "admin" ? "active" : ""}`}
                onClick={() => setUserRoleFilter("admin")}
              >
                👑 Admins ({stats.admins})
              </button>
            </div>

            <div className="dash-card">
              <table className="dash-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Current Role</th>
                    <th>Joined</th>
                    <th>Change Access Level</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(u => (
                    <tr key={u._id}>
                      <td>
                        <div className="dash-user-cell">
                          <span className="dash-avatar dash-avatar--sm">
                            {u.name.charAt(0).toUpperCase()}
                          </span>
                          <div>
                            <strong>{u.name}</strong>
                            {u._id === me?._id && <span style={{ fontSize: 11, color: "#f43397", marginLeft: 6 }}>(You)</span>}
                          </div>
                        </div>
                      </td>
                      <td className="dash-muted">{u.email}</td>
                      <td><RoleBadge role={u.role} /></td>
                      <td className="dash-muted">{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td>
                        <div className="dash-action-row">
                          <select
                            className="dash-role-select"
                            value={u.role}
                            disabled={u._id === me?._id}
                            onChange={e => handleRoleChange(u._id, e.target.value)}
                          >
                            <option value="user">Customer / User</option>
                            <option value="vendor">Vendor</option>
                            <option value="admin">Admin</option>
                          </select>
                          <button
                            className="dash-del-btn"
                            disabled={u._id === me?._id}
                            onClick={() => handleDeleteUser(u._id, u.name)}
                            title="Delete User"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredUsers.length === 0 && (
                    <tr><td colSpan={5} className="dash-empty">No accounts match search or role criteria.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ═══════════ ALL PRODUCTS TAB ═══════════ */}
        {activeTab === "products" && (
          <div className="dash-section">
            <div className="dash-section-header">
              <h1 className="dash-page-title">
                All Products ({displayedProducts.length})
              </h1>
              
              {/* Vendor Selector */}
              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                <span style={{ fontSize: "14px", color: "#666", fontWeight: 600 }}>Filter by Vendor:</span>
                <select
                  className="dash-role-select"
                  value={selectedVendorId}
                  onChange={e => setSelectedVendorId(e.target.value)}
                  style={{ padding: "8px 14px", borderRadius: "8px", border: "1px solid #ddd" }}
                >
                  <option value="all">All Vendors ({allProducts.length} items)</option>
                  {vendorsList.map(v => (
                    <option key={v._id} value={v._id}>
                      🏪 {v.name} ({v.vendorStats?.totalProducts || 0} items)
                    </option>
                  ))}
                </select>
                {selectedVendorId !== "all" && (
                  <button
                    className="ap-btn-cancel ap-btn-sm"
                    onClick={() => setSelectedVendorId("all")}
                  >
                    Clear Filter
                  </button>
                )}
              </div>
            </div>

            <div className="dash-card">
              <table className="dash-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Vendor</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedProducts.map(p => (
                    <tr key={p._id}>
                      <td>
                        <div className="dash-product-cell">
                          {p.images?.[0]
                            ? <img src={p.images[0]} alt="" className="dash-product-thumb" />
                            : <span className="dash-product-thumb-placeholder">📦</span>}
                          <span style={{ fontSize: 13, fontWeight: 600 }}>{p.name}</span>
                        </div>
                      </td>
                      <td className="dash-muted" style={{ fontSize: 13 }}>
                        <strong>{p.createdBy?.name || "System Seeded"}</strong>
                        {p.createdBy?.email && <div style={{ fontSize: 11 }}>{p.createdBy.email}</div>}
                      </td>
                      <td className="dash-muted">{p.category}</td>
                      <td><strong>₹{p.price}</strong></td>
                      <td><StatusBadge status={p.status} /></td>
                      <td>
                        <div className="dash-action-row">
                          {p.status !== "approved" && (
                            <button
                              className="ap-btn-approve ap-btn-sm"
                              onClick={() => handleApprove(p._id, p.name)}
                            >
                              ✅ Approve
                            </button>
                          )}
                          {p.status !== "rejected" && (
                            <button
                              className="ap-btn-reject ap-btn-sm"
                              onClick={() => openRejectModal(p._id, p.name)}
                            >
                              ❌ Reject
                            </button>
                          )}
                          <button
                            className="dash-del-btn"
                            onClick={() => handleDeleteProduct(p._id, p.name)}
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {displayedProducts.length === 0 && (
                    <tr><td colSpan={6} className="dash-empty">No products found for this vendor.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ═══════════ ALL ORDERS & INVOICES TAB ═══════════ */}
        {activeTab === "orders" && (
          <div className="dash-section">
            <h1 className="dash-page-title">All Customer Orders ({allOrders.length})</h1>
            <p className="dash-subtitle">Master store orders log across all vendors &amp; customers with tax invoice generation.</p>

            <div className="dash-card" style={{ marginTop: 20 }}>
              {allOrders.length === 0 ? (
                <div className="ap-empty-state">
                  <span>📄</span>
                  <h3>No customer orders placed yet</h3>
                  <p>When buyers complete purchases across the store, their master orders will appear here.</p>
                </div>
              ) : (
                <table className="dash-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer Details</th>
                      <th>Items Purchased</th>
                      <th>Total GMV</th>
                      <th>Admin Fee (5%)</th>
                      <th>Status</th>
                      <th>Order Date</th>
                      <th>Master Invoice</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allOrders.map(o => {
                      const gross = o.totalAmount || 0;
                      const adminFee = gross * 0.05;
                      return (
                        <tr key={o._id}>
                          <td><strong style={{ fontSize: 12, fontFamily: "monospace" }}>#{o._id.slice(-8).toUpperCase()}</strong></td>
                          <td>
                            <div>
                              <strong>{o.shippingAddress?.fullName || o.user?.name || "Customer"}</strong>
                              <div style={{ fontSize: 11, color: "#64748b" }}>📞 {o.shippingAddress?.phone}</div>
                              <div style={{ fontSize: 11, color: "#94a3b8" }}>{o.shippingAddress?.city}, {o.shippingAddress?.state}</div>
                            </div>
                          </td>
                          <td>
                            <div style={{ fontSize: 12 }}>
                              {o.items?.map((item, idx) => (
                                <div key={idx}>• {item.name} (x{item.quantity})</div>
                              ))}
                            </div>
                          </td>
                          <td><strong>₹{gross.toLocaleString("en-IN")}</strong></td>
                          <td>
                            <span className="dash-metric-pill dash-metric-pill--green" style={{ fontSize: 13, background: "#fdf2f8", color: "#db2777", borderColor: "#fbcfe8" }}>
                              +₹{adminFee.toFixed(2)}
                            </span>
                          </td>
                          <td>
                            <span className="dash-metric-pill dash-metric-pill--gold">
                              {o.orderStatus || "Order Placed"}
                            </span>
                          </td>
                          <td className="dash-muted">
                            {new Date(o.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                          </td>
                          <td>
                            <button
                              type="button"
                              className="ap-btn-approve ap-btn-sm"
                              style={{ background: "#f43397", color: "#fff", border: "none", padding: "6px 12px", borderRadius: "6px", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}
                              onClick={() => setSelectedInvoiceOrder(o)}
                            >
                              🧾 Master Invoice
                            </button>
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

      </main>
    </div>
  );
}
