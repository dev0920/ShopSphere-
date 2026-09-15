import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MERCHANT_PAYMENT_CONFIG } from "../config/paymentConfig";
import "../styles/orderSuccess.css";

function OrderSuccess() {
  const [order, setOrder] = useState(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const savedOrder = localStorage.getItem("latestOrder");

    if (savedOrder) {
      try {
        setOrder(JSON.parse(savedOrder));
      } catch (err) {
        console.error("Error parsing saved order:", err);
      }
    }
  }, []);

  const handlePrint = () => {
    window.print();
  };

  // Estimated delivery date (4 days from order)
  const getEstimatedDeliveryDate = (createdAt) => {
    const baseDate = createdAt ? new Date(createdAt) : new Date();
    baseDate.setDate(baseDate.getDate() + 4);
    return baseDate.toLocaleDateString("en-IN", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const invoiceNo = `INV-2026-${order?._id?.slice(-8)?.toUpperCase() || '894021'}`;
  const totalAmt = Number(order?.totalAmount || 0);
  const taxableAmt = (totalAmt / 1.18).toFixed(2);
  const totalGst = (totalAmt - taxableAmt).toFixed(2);
  const cgst = (totalGst / 2).toFixed(2);
  const sgst = (totalGst / 2).toFixed(2);

  return (
    <div className="os-root">

      {/* ── Official GST Tax Invoice Modal ── */}
      {showInvoiceModal && (
        <div className="chk-modal-backdrop" style={{ zIndex: 9999 }}>
          <div className="chk-modal-card" style={{ maxWidth: "700px", textAlign: "left", padding: "24px", background: "#ffffff" }}>
            
            {/* Invoice Printable Document */}
            <div id="printable-tax-invoice" style={{ border: "2px solid #0f172a", borderRadius: "12px", padding: "24px", background: "#ffffff" }}>
              {/* Header Company Details */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "2px solid #0f172a", paddingBottom: "16px", marginBottom: "20px" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "28px" }}>🛍️</span>
                    <div>
                      <h2 style={{ margin: 0, fontSize: "20px", fontWeight: 900, color: "#0f172a" }}>
                        ShopSphere E-Commerce Private Limited
                      </h2>
                      <small style={{ fontSize: "11px", color: "#64748b", fontWeight: 700 }}>India's Premier Social E-Commerce Marketplace</small>
                    </div>
                  </div>
                  <div style={{ fontSize: "11px", color: "#475569", marginTop: "8px", lineHeight: "1.4" }}>
                    Plot No. 102, ShopSphere Towers, SG Highway, Ahmedabad, Gujarat - 380054<br />
                    <strong>GSTIN:</strong> 24AAACS9842M1Z8 | <strong>PAN:</strong> AAACS9842M | <strong>CIN:</strong> U74999GJ2026PTC109842<br />
                    📞 Support: 1800-419-7890 | ✉️ billing@shopsphere.com
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span style={{ background: "#0f172a", color: "#ffffff", fontSize: "11px", fontWeight: 900, padding: "4px 10px", borderRadius: "6px", textTransform: "uppercase" }}>
                    TAX INVOICE
                  </span>
                  <div style={{ fontSize: "13px", fontWeight: 800, color: "#9333ea", marginTop: "8px" }}>
                    {invoiceNo}
                  </div>
                  <div style={{ fontSize: "11px", color: "#64748b" }}>
                    Date: {new Date(order?.createdAt || Date.now()).toLocaleDateString("en-IN")}
                  </div>
                </div>
              </div>

              {/* Billed To & Payment Meta */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px", background: "#f8fafc", padding: "14px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                <div>
                  <div style={{ fontSize: "11px", fontWeight: 800, color: "#9333ea", textTransform: "uppercase" }}>Billed &amp; Shipped To:</div>
                  <strong style={{ fontSize: "14px", color: "#0f172a", display: "block", marginTop: "2px" }}>{order?.shippingAddress?.fullName || "Valued Customer"}</strong>
                  <div style={{ fontSize: "12px", color: "#475569", marginTop: "2px", lineHeight: "1.4" }}>
                    {order?.shippingAddress?.address}<br />
                    {order?.shippingAddress?.city}, {order?.shippingAddress?.state} - <strong>{order?.shippingAddress?.pincode}</strong><br />
                    📞 Phone: {order?.shippingAddress?.phone}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: "11px", fontWeight: 800, color: "#9333ea", textTransform: "uppercase" }}>Payment &amp; Transaction Details:</div>
                  <div style={{ fontSize: "12px", color: "#475569", marginTop: "4px", lineHeight: "1.5" }}>
                    <strong>Payment Mode:</strong> {order?.paymentMethod === "UPI" ? `Instant UPI (${order?.paymentDetails?.upiId || MERCHANT_PAYMENT_CONFIG.merchantUpiId})` : order?.paymentMethod === "CARD" ? "Debit / Credit Card (3D Secure)" : "Cash on Delivery (COD)"}<br />
                    <strong>Payment Status:</strong> <span style={{ color: "#166534", fontWeight: 800 }}>{order?.paymentStatus === "PAID" || order?.paymentMethod !== "COD" ? "PAID ONLINE ✅" : "PENDING (COD)"}</span><br />
                    {order?.paymentDetails?.utrNumber && (
                      <>
                        <strong>Bank UTR / Ref No:</strong> <span style={{ fontFamily: "monospace", color: "#16a34a", fontWeight: 800 }}>#{order.paymentDetails.utrNumber}</span><br />
                      </>
                    )}
                    <strong>Txn ID:</strong> <span style={{ fontFamily: "monospace", color: "#9333ea", fontWeight: 700 }}>{order?.transactionId || "TXN_ONLINE_SETTLED"}</span>
                  </div>
                </div>
              </div>

              {/* Itemized Table */}
              <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "20px", fontSize: "12px" }}>
                <thead>
                  <tr style={{ background: "#f1f5f9", borderBottom: "2px solid #cbd5e1", textAlign: "left" }}>
                    <th style={{ padding: "8px" }}>#</th>
                    <th style={{ padding: "8px" }}>Item Description</th>
                    <th style={{ padding: "8px" }}>Seller</th>
                    <th style={{ padding: "8px" }}>HSN</th>
                    <th style={{ padding: "8px", textAlign: "center" }}>Qty</th>
                    <th style={{ padding: "8px", textAlign: "right" }}>Unit Price</th>
                    <th style={{ padding: "8px", textAlign: "right" }}>Total (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {order?.items?.map((item, idx) => (
                    <tr key={idx} style={{ borderBottom: "1px solid #e2e8f0" }}>
                      <td style={{ padding: "8px" }}>{idx + 1}</td>
                      <td style={{ padding: "8px" }}><strong>{item.name}</strong></td>
                      <td style={{ padding: "8px", color: "#64748b" }}>{item.seller || "ShopSphere Vendor"}</td>
                      <td style={{ padding: "8px", fontFamily: "monospace", color: "#64748b" }}>6204</td>
                      <td style={{ padding: "8px", textAlign: "center" }}>{item.quantity}</td>
                      <td style={{ padding: "8px", textAlign: "right" }}>₹{Number(item.price).toLocaleString("en-IN")}</td>
                      <td style={{ padding: "8px", textAlign: "right", fontWeight: 800 }}>₹{(Number(item.price) * Number(item.quantity)).toLocaleString("en-IN")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Bill Totals & Tax Calculation */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ fontSize: "11px", color: "#64748b", maxWidth: "300px" }}>
                  <strong>Terms &amp; Conditions:</strong><br />
                  1. All disputes subject to Ahmedabad jurisdiction only.<br />
                  2. This is a computer-generated Tax Invoice issued by <strong>ShopSphere E-Commerce Pvt Ltd</strong> and requires no physical signature under IT Act 2000.
                </div>
                <div style={{ width: "240px", fontSize: "12px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                    <span>Taxable Amount:</span>
                    <span>₹{taxableAmt}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px", color: "#64748b" }}>
                    <span>CGST (9%):</span>
                    <span>₹{cgst}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px", color: "#64748b" }}>
                    <span>SGST (9%):</span>
                    <span>₹{sgst}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px", color: "#166534" }}>
                    <span>Shipping &amp; Delivery:</span>
                    <span>FREE ⚡</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", borderTop: "2px solid #0f172a", paddingTop: "6px", fontSize: "15px", fontWeight: 900, color: "#0f172a" }}>
                    <span>Grand Total:</span>
                    <span>₹{totalAmt.toLocaleString("en-IN")}</span>
                  </div>
                </div>
              </div>

              {/* Authorised Signatory Stamp */}
              <div style={{ marginTop: "24px", paddingTop: "16px", borderTop: "1px dashed #cbd5e1", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontSize: "11px", color: "#166534", fontWeight: 800, background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "6px 12px", borderRadius: "6px" }}>
                  ✅ Digitally Verified GST Tax Invoice • ShopSphere Marketplace
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "12px", fontWeight: 900, color: "#0f172a" }}>For ShopSphere E-Commerce Pvt. Ltd.</div>
                  <div style={{ fontSize: "10px", color: "#64748b", marginTop: "2px" }}>Authorised Signatory</div>
                </div>
              </div>

            </div>

            <div style={{ display: "flex", gap: "12px", marginTop: "20px" }}>
              <button
                type="button"
                onClick={handlePrint}
                style={{ flex: 1, background: "#9333ea", color: "#ffffff", border: "none", padding: "12px", borderRadius: "10px", fontWeight: 900, fontSize: "15px", cursor: "pointer", boxShadow: "0 4px 14px rgba(147, 51, 234, 0.3)" }}
              >
                🖨️ Print / Download Official Invoice PDF
              </button>
              <button
                type="button"
                onClick={() => setShowInvoiceModal(false)}
                style={{ background: "#f1f5f9", color: "#475569", border: "1px solid #cbd5e1", padding: "12px 20px", borderRadius: "10px", fontWeight: 800, cursor: "pointer" }}
              >
                Close Preview
              </button>
            </div>

          </div>
        </div>
      )}

      <div className="os-container">

        {/* ── Celebration Hero Card ── */}
        <section className="os-hero-card">
          <div className="os-icon-wrapper">
            ✓
          </div>

          <div className="os-badge">
            🎉 ORDER CONFIRMED & VERIFIED
          </div>

          <h1 className="os-title">Thank You for Your Order!</h1>
          <p className="os-subtitle">
            We've received your order and are preparing it for fast dispatch.
          </p>

          <div className="os-order-meta-pill">
            <span>Order ID: <strong className="os-order-id-highlight">{order?._id || "ORD-PENDING"}</strong></span>
            <span>•</span>
            <span>Date: <strong>{order?.createdAt ? new Date(order.createdAt).toLocaleDateString("en-IN") : new Date().toLocaleDateString("en-IN")}</strong></span>
          </div>
        </section>

        {/* ── Order Status Timeline Tracker ── */}
        <section className="os-tracker-card">
          <div className="os-tracker-header">
            <span className="os-tracker-title">🚚 Delivery Tracker</span>
            <span className="os-est-date">Est. Delivery: <b>{getEstimatedDeliveryDate(order?.createdAt)}</b></span>
          </div>

          <div className="os-timeline">
            <div className="os-timeline-line">
              <div className="os-timeline-line-progress" style={{ width: order?.orderStatus === "Dispatched" ? "66%" : "33%" }} />
            </div>

            <div className="os-timeline-step completed">
              <div className="os-step-icon">✓</div>
              <span className="os-step-label">Order Placed</span>
            </div>

            <div className={`os-timeline-step ${order?.orderStatus === "Dispatched" ? "completed" : "active"}`}>
              <div className="os-step-icon">📦</div>
              <span className="os-step-label">Processing</span>
            </div>

            <div className={`os-timeline-step ${order?.orderStatus === "Dispatched" ? "active" : ""}`}>
              <div className="os-step-icon">🚚</div>
              <span className="os-step-label">Dispatched</span>
            </div>

            <div className="os-timeline-step">
              <div className="os-step-icon">🏠</div>
              <span className="os-step-label">Delivered</span>
            </div>
          </div>
        </section>

        {/* ── Assigned Delivery Executive & OTP Card ── */}
        {(order?.deliveryBoyName || order?.orderStatus === "Dispatched") && (
          <div style={{ background: "#f0fdf4", border: "2px solid #bbf7d0", padding: "18px 24px", borderRadius: "16px", marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px", boxShadow: "0 4px 14px rgba(22, 101, 52, 0.06)" }}>
            <div>
              <div style={{ fontSize: "11px", fontWeight: 900, color: "#166534", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "4px" }}>
                🚀 ASSIGNED DELIVERY EXECUTIVE &amp; HANDOFF OTP
              </div>
              <div style={{ fontSize: "18px", fontWeight: 900, color: "#0f172a" }}>
                👨‍💼 {order?.deliveryBoyName || "Ramesh Kumar (Ekart Express)"}
              </div>
              <div style={{ fontSize: "13px", color: "#166534", fontWeight: 700, marginTop: "2px" }}>
                📞 Driver Contact Phone: <strong>{order?.deliveryBoyPhone || "+91 98765 43210"}</strong>
              </div>
            </div>
            <div style={{ background: "#ffffff", border: "2px dashed #9333ea", padding: "10px 18px", borderRadius: "12px", textAlign: "center" }}>
              <span style={{ fontSize: "10px", fontWeight: 900, color: "#64748b", textTransform: "uppercase", display: "block" }}>DELIVERY VERIFICATION OTP</span>
              <span style={{ fontSize: "28px", fontWeight: 900, color: "#9333ea", letterSpacing: "4px" }}>{order?.deliveryOtp || "4920"}</span>
            </div>
          </div>
        )}

        {/* ── Content Grid: Items & Details ── */}
        <div className="os-grid">

          {/* Left Column: Product Items Purchased */}
          <div className="os-card">
            <h2 className="os-card-title">🛍️ Purchased Items ({order?.items?.length || 0})</h2>

            <div className="os-items-list">
              {order?.items && order.items.length > 0 ? (
                order.items.map((item, idx) => (
                  <div key={item._id || idx} className="os-item-row">
                    <img
                      src={item.image || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&q=80"}
                      alt={item.name}
                      className="os-item-img"
                      onError={(e) => {
                        e.target.src = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&q=80";
                      }}
                    />
                    <div className="os-item-info">
                      <h3 className="os-item-name">{item.name}</h3>
                      <div className="os-item-meta">
                        Qty: <b>{item.quantity}</b> {item.seller ? `• Sold by: ${item.seller}` : ""}
                      </div>
                    </div>
                    <div className="os-item-price">
                      ₹{Number(item.price * item.quantity).toLocaleString("en-IN")}
                    </div>
                  </div>
                ))
              ) : (
                <p style={{ color: "#64748b" }}>Order items summary available in My Orders.</p>
              )}
            </div>

            {/* Bill Subtotal Summary */}
            <div className="os-bill-table">
              <div className="os-bill-row">
                <span>Items Subtotal</span>
                <span>₹{Number(order?.totalAmount || 0).toLocaleString("en-IN")}</span>
              </div>
              <div className="os-bill-row">
                <span>Delivery & Shipping</span>
                <span className="os-free-badge">FREE ⚡</span>
              </div>
              <div className="os-bill-row total">
                <span>Total Amount Paid</span>
                <span>₹{Number(order?.totalAmount || 0).toLocaleString("en-IN")}</span>
              </div>
            </div>
          </div>

          {/* Right Column: Delivery Address & Payment Info */}
          <div className="os-card">
            <h2 className="os-card-title">📍 Shipping & Payment</h2>

            <div className="os-info-block">
              <div className="os-info-label">Delivery Address</div>
              <div className="os-info-value">
                <strong>{order?.shippingAddress?.fullName || "Valued Customer"}</strong><br />
                {order?.shippingAddress?.address}<br />
                {order?.shippingAddress?.city}, {order?.shippingAddress?.state} - <strong>{order?.shippingAddress?.pincode}</strong><br />
                📞 Phone: {order?.shippingAddress?.phone || "N/A"}
              </div>
            </div>

            <div className="os-info-block">
              <div className="os-info-label">Payment Information</div>
              <div className="os-info-value">
                <strong>Method:</strong> {order?.paymentMethod === "UPI" ? "⚡ Instant UPI Gateway" : order?.paymentMethod === "CARD" ? "💳 Debit / Credit Card" : "💵 Cash on Delivery (COD)"} <br />
                <strong>Payment Status:</strong> <span style={{ color: order?.paymentStatus === "PAID" || order?.paymentMethod !== "COD" ? "#059669" : "#d97706", fontWeight: 800 }}>{order?.paymentStatus === "PAID" || order?.paymentMethod !== "COD" ? "PAID ONLINE ✅" : "PENDING (Pay on Delivery)"}</span><br />
                {order?.transactionId && <div><strong>Txn ID:</strong> <span style={{ fontFamily: "monospace", fontSize: "12px", color: "#9333ea", fontWeight: 700 }}>{order.transactionId}</span></div>}
              </div>
            </div>

            <div className="os-info-block">
              <div className="os-info-label">Need Assistance?</div>
              <div className="os-info-value" style={{ fontSize: "0.85rem", color: "#64748b" }}>
                Reach out to ShopSphere Customer Support 24/7 for order updates or returns.
              </div>
            </div>
          </div>

        </div>

        {/* ── Action Buttons ── */}
        <div className="os-actions">
          <Link to="/my-orders" className="os-btn-primary">
            📦 Track Order in My Orders
          </Link>
          <button type="button" onClick={() => setShowInvoiceModal(true)} className="os-btn-secondary" style={{ background: "#fdf2f8", borderColor: "#fbcfe8", color: "#be185d", fontWeight: 800 }}>
            🧾 View / Print Official GST Tax Invoice
          </button>
          <Link to="/catalogue" className="os-btn-secondary">
            🛍️ Continue Shopping
          </Link>
        </div>

      </div>
    </div>
  );
}

export default OrderSuccess;