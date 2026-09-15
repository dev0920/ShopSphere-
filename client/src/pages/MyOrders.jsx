import { API_BASE_URL } from "../config/apiConfig";
import { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/myOrders.css";

const STATUS_CONFIG = {
  "Order Placed":     { label: "Order Placed", badgeClass: "placed", stepIndex: 0 },
  "Processing":       { label: "Processing 📦", badgeClass: "processing", stepIndex: 1 },
  "Dispatched":       { label: "Dispatched 🚀", badgeClass: "shipped", stepIndex: 2 },
  "Out for Delivery": { label: "Out for Delivery 🚚", badgeClass: "shipped", stepIndex: 2 },
  "Shipped":          { label: "Shipped 🚚", badgeClass: "shipped", stepIndex: 2 },
  "Delivered":        { label: "Delivered ✅", badgeClass: "delivered", stepIndex: 3 },
  "Cancelled":        { label: "Cancelled ❌", badgeClass: "cancelled", stepIndex: -1 },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG["Order Placed"];
  return (
    <span className={`mo-status-badge mo-status-badge--${cfg.badgeClass}`}>
      ● {cfg.label}
    </span>
  );
}

// Interactive Live Timeline Step Tracker
function LiveTracker({ status, createdAt }) {
  const currentCfg = STATUS_CONFIG[status] || STATUS_CONFIG["Order Placed"];
  const currentStep = currentCfg.stepIndex;

  if (status === "Cancelled") {
    return (
      <div className="mo-timeline-container" style={{ background: "#fff1f2", borderColor: "#fecdd3" }}>
        <div style={{ color: "#be123c", fontWeight: 700, fontSize: "0.9rem", textAlign: "center" }}>
          ❌ This order was cancelled. If you were charged, a full refund will be processed within 24-48 hours.
        </div>
      </div>
    );
  }

  // Calculate delivery date estimate
  const getDeliveryEst = () => {
    const d = createdAt ? new Date(createdAt) : new Date();
    d.setDate(d.getDate() + 4);
    return d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
  };

  // Progress width calculation
  const progressPercent = currentStep === 0 ? 25 : currentStep === 1 ? 50 : currentStep === 2 ? 75 : 100;

  return (
    <div className="mo-timeline-container">
      <div className="mo-timeline-title-row">
        <span>🚚 Live Shipment Progress</span>
        <span>Est. Delivery: <strong style={{ color: "#059669" }}>{getDeliveryEst()}</strong></span>
      </div>

      <div className="mo-timeline-track">
        <div className="mo-timeline-line-bg">
          <div className="mo-timeline-line-fill" style={{ width: `${progressPercent}%` }} />
        </div>

        <div className={`mo-t-step ${currentStep >= 0 ? "completed" : ""} ${currentStep === 0 ? "active" : ""}`}>
          <div className="mo-t-icon">{currentStep > 0 ? "✓" : "1"}</div>
          <span className="mo-t-label">Order Placed</span>
        </div>

        <div className={`mo-t-step ${currentStep >= 1 ? "completed" : ""} ${currentStep === 1 ? "active" : ""}`}>
          <div className="mo-t-icon">{currentStep > 1 ? "✓" : "📦"}</div>
          <span className="mo-t-label">Processing</span>
        </div>

        <div className={`mo-t-step ${currentStep >= 2 ? "completed" : ""} ${currentStep === 2 ? "active" : ""}`}>
          <div className="mo-t-icon">{currentStep > 2 ? "✓" : "🚀"}</div>
          <span className="mo-t-label">Dispatched</span>
        </div>

        <div className={`mo-t-step ${currentStep >= 3 ? "completed" : ""} ${currentStep === 3 ? "active" : ""}`}>
          <div className="mo-t-icon">{currentStep >= 3 ? "✓" : "🏠"}</div>
          <span className="mo-t-label">Delivered</span>
        </div>
      </div>
    </div>
  );
}

function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("in_progress");
  const [copiedId, setCopiedId] = useState(null);
  
  // Cancel Order Modal State
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedOrderToCancel, setSelectedOrderToCancel] = useState(null);
  const [cancelReason, setCancelReason] = useState("Changed my mind / Placed by mistake");
  const [cancelling, setCancelling] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 3000);
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/api/orders/my-orders`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setOrders(data.orders || []);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCancelModal = (order) => {
    setSelectedOrderToCancel(order);
    setShowCancelModal(true);
  };

  const handleConfirmCancel = async () => {
    if (!selectedOrderToCancel) return;
    setCancelling(true);

    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/orders/${selectedOrderToCancel._id}/cancel`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reason: cancelReason }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        alert(`❌ Order #${selectedOrderToCancel._id.slice(-6).toUpperCase()} cancelled successfully.${selectedOrderToCancel.paymentStatus === "PAID" || selectedOrderToCancel.paymentMethod !== "COD" ? " Full refund will be credited to your account in 24-48 hours." : ""}`);
        setShowCancelModal(false);
        fetchOrders();
      } else {
        alert(data.message || "Could not cancel order.");
      }
    } catch (err) {
      console.error("Cancel order error:", err);
      alert("Error connecting to server to cancel order.");
    } finally {
      setCancelling(false);
    }
  };

  const copyToClipboard = (id) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filtered orders list
  const filteredOrders = useMemo(() => {
    if (activeFilter === "in_progress") {
      return orders.filter(o => o.orderStatus !== "Delivered" && o.orderStatus !== "Cancelled");
    }
    if (activeFilter === "delivered") {
      return orders.filter(o => o.orderStatus === "Delivered");
    }
    if (activeFilter === "cancelled") {
      return orders.filter(o => o.orderStatus === "Cancelled");
    }
    return orders;
  }, [orders, activeFilter]);

  return (
    <div className="mo-root">

      {/* ── Top Header Navigation ── */}
      <header className="mo-header">
        <div className="mo-header-container">
          <Link to="/" className="mo-logo">
            <span>🛍️</span> ShopSphere
          </Link>
          <Link to="/catalogue" className="mo-back-btn">
            ← Continue Shopping
          </Link>
        </div>
      </header>

      {/* ── Main Container ── */}
      <div className="mo-container">

        {/* ── Banner ── */}
        <section className="mo-banner">
          <div>
            <h1 className="mo-banner-title">📦 My Orders &amp; Live Tracking</h1>
            <p className="mo-banner-sub">Track real-time shipment status &amp; order history across all vendors.</p>
          </div>
          <div className="mo-stat-badge">
            Total Orders: {orders.length}
          </div>
        </section>

        {/* ── Filter Bar ── */}
        {orders.length > 0 && (
          <div className="mo-filter-bar">
            <button
              type="button"
              className={`mo-tab ${activeFilter === "in_progress" ? "active" : ""}`}
              onClick={() => setActiveFilter("in_progress")}
            >
              Active Orders 🚚 ({orders.filter(o => o.orderStatus !== "Delivered" && o.orderStatus !== "Cancelled").length})
            </button>
            <button
              type="button"
              className={`mo-tab ${activeFilter === "delivered" ? "active" : ""}`}
              onClick={() => setActiveFilter("delivered")}
            >
              Delivered ✅ ({orders.filter(o => o.orderStatus === "Delivered").length})
            </button>
            <button
              type="button"
              className={`mo-tab ${activeFilter === "cancelled" ? "active" : ""}`}
              onClick={() => setActiveFilter("cancelled")}
            >
              Cancelled ❌ ({orders.filter(o => o.orderStatus === "Cancelled").length})
            </button>
            <button
              type="button"
              className={`mo-tab ${activeFilter === "all" ? "active" : ""}`}
              onClick={() => setActiveFilter("all")}
            >
              All Orders ({orders.length})
            </button>
          </div>
        )}

        {/* ── Loading Skeleton ── */}
        {loading ? (
          <div>
            <div className="mo-skeleton" />
            <div className="mo-skeleton" />
            <div className="mo-skeleton" />
          </div>
        ) : filteredOrders.length === 0 ? (
          /* ── Empty State Card ── */
          <div className="mo-empty-card">
            <div className="mo-empty-icon">📦</div>
            <h2 className="mo-empty-title">
              {activeFilter === "all" ? "No Orders Placed Yet" : "No Orders Found"}
            </h2>
            <p className="mo-empty-desc">
              {activeFilter === "all"
                ? "Explore our catalogue to discover thousands of factory-priced products!"
                : "You don't have any orders matching this status filter."}
            </p>
            <Link to="/catalogue" className="mo-empty-btn">
              Explore Catalogue →
            </Link>
          </div>
        ) : (
          /* ── Orders List ── */
          filteredOrders.map((order) => (
            <div key={order._id} className="mo-order-card">

              {/* Order Card Top Header */}
              <div className="mo-card-header">
                <div>
                  <div className="mo-order-id-tag">
                    <span>Order #{order._id.slice(-8).toUpperCase()}</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(order._id)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        fontSize: "0.8rem",
                        color: copiedId === order._id ? "#10b981" : "#64748b",
                      }}
                      title="Copy Order ID"
                    >
                      {copiedId === order._id ? "✓ Copied" : "📋"}
                    </button>
                  </div>
                  <div className="mo-order-date">
                    📅 Placed on: <strong>{new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</strong>
                  </div>
                </div>

                <div>
                  <StatusBadge status={order.orderStatus || "Order Placed"} />
                </div>
              </div>

              {/* Live Tracking Timeline */}
              <LiveTracker status={order.orderStatus || "Order Placed"} createdAt={order.createdAt} />

              {/* Delivery Partner Assigned & OTP Banner */}
              {(order.deliveryBoyName || order.orderStatus === "Dispatched" || order.orderStatus === "Out for Delivery") && (
                <div style={{ background: "#f0fdf4", border: "2px solid #bbf7d0", padding: "14px 18px", borderRadius: "12px", margin: "14px 0", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
                  <div>
                    <div style={{ fontSize: "11px", fontWeight: 900, color: "#166534", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "4px" }}>
                      🚀 DISPATCHED &amp; OUT FOR DELIVERY • ASSIGNED DRIVER
                    </div>
                    <div style={{ fontSize: "15px", fontWeight: 900, color: "#0f172a" }}>
                      👨‍💼 {order.deliveryBoyName || "Ramesh Kumar (Ekart Express)"}
                    </div>
                    <div style={{ fontSize: "12px", color: "#166534", fontWeight: 700, marginTop: "2px", display: "flex", alignItems: "center", gap: "8px" }}>
                      <span>📞 {order.deliveryBoyPhone || "+91 98765 43210"}</span>
                      <a href={`tel:${order.deliveryBoyPhone || "9876543210"}`} style={{ background: "#166534", color: "#fff", textDecoration: "none", padding: "2px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: 800 }}>
                        Call Driver 📞
                      </a>
                    </div>
                  </div>

                  <div style={{ background: "#ffffff", border: "2px dashed #9333ea", padding: "8px 14px", borderRadius: "10px", textAlign: "center" }}>
                    <span style={{ fontSize: "10px", fontWeight: 900, color: "#64748b", textTransform: "uppercase", display: "block" }}>DELIVERY VERIFICATION OTP</span>
                    <span style={{ fontSize: "24px", fontWeight: 900, color: "#9333ea", letterSpacing: "4px" }}>{order.deliveryOtp || "4920"}</span>
                    <span style={{ fontSize: "9px", color: "#64748b", display: "block", marginTop: "2px" }}>Share with driver upon arrival</span>
                  </div>
                </div>
              )}

              {/* Ordered Items Grid */}
              <div className="mo-items-grid">
                {order.items.map((item, idx) => (
                  <div key={item._id || idx} className="mo-item-card">
                    <img
                      src={item.image || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&q=80"}
                      alt={item.name}
                      className="mo-item-thumb"
                      onError={(e) => {
                        e.target.src = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&q=80";
                      }}
                    />
                    <div className="mo-item-details">
                      <h4 className="mo-item-title">{item.name}</h4>
                      <div className="mo-item-sub">
                        Qty: <strong>{item.quantity}</strong> {item.seller ? `• Sold by: ${item.seller}` : ""}
                      </div>
                    </div>
                    <div className="mo-item-price-tag">
                      ₹{Number(item.price * item.quantity).toLocaleString("en-IN")}
                    </div>
                  </div>
                ))}
              </div>

              {/* Shipping Address & Total Footer */}
              <div className="mo-card-footer">
                <div className="mo-shipping-summary">
                  📍 <strong>Shipping Address:</strong> {order.shippingAddress?.fullName}, {order.shippingAddress?.address}, {order.shippingAddress?.city}, {order.shippingAddress?.state} - <strong>{order.shippingAddress?.pincode}</strong> (Ph: {order.shippingAddress?.phone})
                  <div style={{ marginTop: "6px", fontSize: "12px", color: order.paymentStatus === "REFUNDED" ? "#166534" : order.paymentStatus === "PAID" || order.paymentMethod !== "COD" ? "#166534" : "#92400e" }}>
                    💳 <strong>Payment:</strong> {order.paymentMethod === "UPI" ? "⚡ Instant UPI Gateway" : order.paymentMethod === "CARD" ? "💳 Debit / Credit Card" : "💵 Cash on Delivery (COD)"}
                    <span style={{ marginLeft: "8px", background: order.paymentStatus === "REFUNDED" ? "#dcfce7" : order.paymentStatus === "PAID" || order.paymentMethod !== "COD" ? "#dcfce7" : "#fef3c7", color: order.paymentStatus === "REFUNDED" ? "#15803d" : order.paymentStatus === "PAID" || order.paymentMethod !== "COD" ? "#166534" : "#92400e", padding: "2px 7px", borderRadius: "6px", fontWeight: 800 }}>
                      {order.paymentStatus === "REFUNDED" ? "🟢 REFUND INITIATED ✅" : order.paymentStatus === "PAID" || order.paymentMethod !== "COD" ? "PAID ONLINE ✅" : "PENDING (COD)"}
                    </span>
                    {order.paymentDetails?.refundId ? (
                      <span style={{ marginLeft: "8px", fontFamily: "monospace", color: "#16a34a", fontWeight: 800 }}>
                        (Refund Ref: #{order.paymentDetails.refundId})
                      </span>
                    ) : order.transactionId ? (
                      <span style={{ marginLeft: "8px", fontFamily: "monospace", color: "#9333ea", fontWeight: 700 }}>
                        ({order.transactionId})
                      </span>
                    ) : null}
                  </div>
                </div>

                <div className="mo-card-actions">
                  <div className="mo-total-price-pill">
                    Total: ₹{Number(order.totalAmount || 0).toLocaleString("en-IN")}
                  </div>
                  <button
                    type="button"
                    className="mo-btn-secondary"
                    onClick={() => {
                      localStorage.setItem("latestOrder", JSON.stringify(order));
                      navigate("/order-success");
                    }}
                  >
                    🧾 Invoice
                  </button>
                  {order.orderStatus !== "Delivered" && order.orderStatus !== "Cancelled" && (
                    <button
                      type="button"
                      style={{ background: "#fff1f2", color: "#be123c", border: "1px solid #fecdd3", padding: "8px 14px", borderRadius: "10px", fontWeight: 800, fontSize: "13px", cursor: "pointer" }}
                      onClick={() => handleOpenCancelModal(order)}
                    >
                      ❌ Cancel Order
                    </button>
                  )}
                  <Link to="/catalogue" className="mo-btn-primary">
                    🛍️ Buy Again
                  </Link>
                </div>
              </div>

            </div>
          ))
        )}

      </div>

      {/* ── Cancel Order Confirmation Modal ── */}
      {showCancelModal && selectedOrderToCancel && (
        <div className="chk-modal-backdrop" style={{ zIndex: 9999 }}>
          <div className="chk-modal-card" style={{ maxWidth: "480px", textAlign: "left", padding: "24px", background: "#ffffff" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 900, color: "#be123c" }}>
                ❌ Cancel Order #{selectedOrderToCancel._id.slice(-6).toUpperCase()}
              </h3>
              <button type="button" onClick={() => setShowCancelModal(false)} style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "#64748b" }}>✕</button>
            </div>

            <p style={{ fontSize: "13px", color: "#475569", marginBottom: "16px" }}>
              Are you sure you want to cancel this order? Once cancelled, the seller will be notified to stop dispatch.
            </p>

            {selectedOrderToCancel.paymentStatus === "PAID" || selectedOrderToCancel.paymentMethod !== "COD" ? (
              <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "12px", borderRadius: "10px", marginBottom: "16px", fontSize: "12px", color: "#166534" }}>
                💡 <strong>Online Refund Policy:</strong> Your payment of <strong>₹{selectedOrderToCancel.totalAmount}</strong> will be refunded to your original UPI/Card account within 24-48 business hours.
              </div>
            ) : null}

            <div style={{ marginBottom: "20px" }}>
              <label style={{ fontSize: "12px", fontWeight: 800, color: "#334155", display: "block", marginBottom: "6px" }}>
                Please select reason for cancellation:
              </label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1.5px solid #cbd5e1", fontSize: "13px", outline: "none" }}
              >
                <option value="Changed my mind / Placed by mistake">Changed my mind / Placed by mistake</option>
                <option value="Want to change shipping address">Want to change shipping address</option>
                <option value="Delivery time is too long">Delivery time is too long</option>
                <option value="Found lower price elsewhere">Found lower price elsewhere</option>
                <option value="Ordered duplicate item">Ordered duplicate item</option>
                <option value="Other reason">Other reason</option>
              </select>
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button
                type="button"
                disabled={cancelling}
                onClick={handleConfirmCancel}
                style={{ flex: 1, background: "#be123c", color: "#ffffff", border: "none", padding: "12px", borderRadius: "10px", fontWeight: 900, fontSize: "14px", cursor: "pointer" }}
              >
                {cancelling ? "Cancelling…" : "Yes, Cancel My Order"}
              </button>
              <button
                type="button"
                onClick={() => setShowCancelModal(false)}
                style={{ background: "#f1f5f9", color: "#475569", border: "1px solid #cbd5e1", padding: "12px 18px", borderRadius: "10px", fontWeight: 800, cursor: "pointer" }}
              >
                Keep Order
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default MyOrders;