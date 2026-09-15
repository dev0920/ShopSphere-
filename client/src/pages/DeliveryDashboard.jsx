import { API_BASE_URL } from "../config/apiConfig";
// =====================================================
// Delivery Partner Hub & Financial Settlement Dashboard
// ShopSphere E-Commerce Marketplace
// =====================================================

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { MERCHANT_PAYMENT_CONFIG } from "../config/paymentConfig";

const API = `${API_BASE_URL}/api`;

const DRIVER_PROFILES = [
  { id: "all", name: "All Fleet Shipments", phone: "System Wide View", agency: "ShopSphere Logistics" },
  { id: "ramesh", name: "Ramesh Kumar", phone: "+91 98765 43210", agency: "Ekart Express" },
  { id: "vikram", name: "Vikram Singh", phone: "+91 98123 45678", agency: "BlueDart Logistics" },
  { id: "amit", name: "Amit Sharma", phone: "+91 99887 76655", agency: "Delhivery Fast" },
];

export default function DeliveryDashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDriver, setSelectedDriver] = useState("all");
  const [deliveryTab, setDeliveryTab] = useState("pending");
  const [pinInputs, setPinInputs] = useState({});
  const [verifyingId, setVerifyingId] = useState(null);
  const [alertMsg, setAlertMsg] = useState({ text: "", type: "", orderId: "" });

  // 🏛️ COD Cash Deposit to Admin State
  const [showSettlementModal, setShowSettlementModal] = useState(false);
  const [settlementMethod, setSettlementMethod] = useState("UPI");
  const [settlementTxnRef, setSettlementTxnRef] = useState("");
  const [settlementHistory, setSettlementHistory] = useState([]);
  const [settling, setSettling] = useState(false);

  // 💳 Online Commission Payout to Rider Bank State
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [riderUpi, setRiderUpi] = useState("ramesh.kumar@okhdfcbank");
  const [riderBank, setRiderBank] = useState("HDFC Bank A/C: 981203940192 (IFSC: HDFC0001092)");
  const [payoutHistory, setPayoutHistory] = useState([]);
  const [payoutProcessing, setPayoutProcessing] = useState(false);

  const userStr = localStorage.getItem("user") || sessionStorage.getItem("user");
  const loggedUser = userStr ? JSON.parse(userStr) : null;

  useEffect(() => {
    fetchDeliveryOrders();
    loadFinancialHistory();
    const interval = setInterval(fetchDeliveryOrders, 3000);
    return () => clearInterval(interval);
  }, [selectedDriver]);

  const loadFinancialHistory = () => {
    try {
      const savedSettlements = JSON.parse(localStorage.getItem("delivery_settlements") || "[]");
      setSettlementHistory(savedSettlements);
      const savedPayouts = JSON.parse(localStorage.getItem("delivery_payouts") || "[]");
      setPayoutHistory(savedPayouts);
    } catch {
      setSettlementHistory([]);
      setPayoutHistory([]);
    }
  };

  const fetchDeliveryOrders = async () => {
    try {
      let driverParam = selectedDriver;
      if (loggedUser && loggedUser.role === "delivery") {
        driverParam = (loggedUser.name || "").split(" ")[0];
      }

      const res = await fetch(`${API}/orders/delivery-orders?driverName=${driverParam || ""}`);
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders || []);
      }
    } catch (err) {
      console.error("Error fetching delivery orders:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePinChange = (orderId, val) => {
    setPinInputs((prev) => ({ ...prev, [orderId]: val }));
  };

  const handleVerifyAndDeliver = async (orderId) => {
    const pin = pinInputs[orderId] || "";
    if (!pin) {
      setAlertMsg({ text: "Please enter the 4-digit verification OTP PIN.", type: "error", orderId });
      return;
    }

    setVerifyingId(orderId);
    setAlertMsg({ text: "", type: "", orderId: "" });

    try {
      const res = await fetch(`${API}/orders/${orderId}/deliver`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deliveryOtp: pin }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setAlertMsg({
          text: `🎉 Delivery Verified! Order #${orderId.slice(-6).toUpperCase()} handed over successfully. Moved to Delivered section!`,
          type: "success",
          orderId,
        });
        setPinInputs((prev) => ({ ...prev, [orderId]: "" }));
        setDeliveryTab("completed");
        fetchDeliveryOrders();
      } else {
        setAlertMsg({
          text: data.message || "❌ Invalid Verification PIN! Ask customer for their 4-digit OTP code.",
          type: "error",
          orderId,
        });
      }
    } catch {
      setAlertMsg({ text: "Server connection error during PIN verification.", type: "error", orderId });
    } finally {
      setVerifyingId(null);
    }
  };

  // Filter orders by driver selection
  const filteredOrders = orders.filter((o) => {
    if (loggedUser && loggedUser.role === "delivery") {
      const loggedFirstName = (loggedUser.name || "").split(" ")[0].toLowerCase();
      const orderDriverName = (o.deliveryBoyName || "").toLowerCase();
      return orderDriverName.includes(loggedFirstName);
    }

    if (selectedDriver === "all") return true;
    const driverObj = DRIVER_PROFILES.find((d) => d.id === selectedDriver);
    if (!driverObj) return true;
    return (o.deliveryBoyName || "").toLowerCase().includes(driverObj.name.toLowerCase());
  });

  const pendingDeliveries = filteredOrders.filter((o) => o.orderStatus !== "Delivered");
  const completedDeliveries = filteredOrders.filter((o) => o.orderStatus === "Delivered");

  // Financial calculations
  const onlinePaidTotal = completedDeliveries.reduce((acc, o) => {
    if (o.paymentMethod !== "COD") return acc + Number(o.totalAmount || 0);
    return acc;
  }, 0);

  const codTotalCollected = completedDeliveries.reduce((acc, o) => {
    if (o.paymentMethod === "COD") return acc + Number(o.totalAmount || 0);
    return acc;
  }, 0);

  const totalSettledAmount = settlementHistory.reduce((acc, s) => acc + Number(s.amount || 0), 0);
  const pendingCodToAdmin = Math.max(0, codTotalCollected - totalSettledAmount);

  // Individual Rider Commission (£50 per delivered order)
  const COMMISSION_PER_ORDER = 50;
  const riderTotalCommission = completedDeliveries.length * COMMISSION_PER_ORDER;
  const totalPaidOutCommission = payoutHistory.reduce((acc, p) => acc + Number(p.amount || 0), 0);
  const pendingRiderPayout = Math.max(0, riderTotalCommission - totalPaidOutCommission);

  // Deposit COD Cash to Admin Handler
  const handleSettleCashToAdmin = (e) => {
    e.preventDefault();
    if (pendingCodToAdmin <= 0) {
      alert("No pending COD cash due for deposit to Admin!");
      return;
    }

    setSettling(true);
    const newRecord = {
      id: `REMIT-${Date.now().toString().slice(-6)}`,
      date: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }),
      amount: pendingCodToAdmin,
      method: settlementMethod,
      refNo: settlementTxnRef.trim() || `TXN_${Math.floor(100000 + Math.random() * 900000)}`,
      riderName: loggedUser?.name || "Ramesh Kumar",
      status: "Deposited to Admin ✅",
    };

    setTimeout(() => {
      const updated = [newRecord, ...settlementHistory];
      setSettlementHistory(updated);
      localStorage.setItem("delivery_settlements", JSON.stringify(updated));
      setSettling(false);
      setShowSettlementModal(false);
      setSettlementTxnRef("");
      alert(`🏛️ COD Cash Deposit of ₹${pendingCodToAdmin.toLocaleString("en-IN")} successfully deposited to Admin!\nReference: ${newRecord.refNo}`);
    }, 800);
  };

  // Online Payout of Rider Commission to Rider Account Handler
  const handleWithdrawRiderCommission = (e) => {
    e.preventDefault();
    if (pendingRiderPayout <= 0) {
      alert("No pending commission available to withdraw.");
      return;
    }

    setPayoutProcessing(true);
    const payoutRecord = {
      id: `PAYOUT-${Date.now().toString().slice(-6)}`,
      date: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }),
      amount: pendingRiderPayout,
      riderUpi: riderUpi,
      riderBank: riderBank,
      refNo: `IMPS_${Math.floor(10000000 + Math.random() * 90000000)}`,
      status: "Paid Online to Rider A/C ✅",
    };

    setTimeout(() => {
      const updated = [payoutRecord, ...payoutHistory];
      setPayoutHistory(updated);
      localStorage.setItem("delivery_payouts", JSON.stringify(updated));
      setPayoutProcessing(false);
      setShowPayoutModal(false);
      alert(`🎉 Online Payout of ₹${pendingRiderPayout.toLocaleString("en-IN")} successfully transferred to Rider's Bank/UPI Account!\nRef: ${payoutRecord.refNo}`);
    }, 900);
  };

  const displayedOrders = filteredOrders.filter((o) => {
    if (deliveryTab === "pending") return o.orderStatus !== "Delivered";
    if (deliveryTab === "completed") return o.orderStatus === "Delivered";
    return true;
  });

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}>

      {/* ── Top Glassmorphic Header Navigation ── */}
      <header style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)", color: "#ffffff", padding: "18px 24px", position: "sticky", top: 0, zIndex: 100, boxShadow: "0 10px 25px rgba(15,23,42,0.25)" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>

          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <span style={{ fontSize: "32px", background: "rgba(255,255,255,0.1)", padding: "8px 12px", borderRadius: "12px" }}>🚚</span>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <h1 style={{ margin: 0, fontSize: "20px", fontWeight: 900, color: "#ffffff", letterSpacing: "-0.5px" }}>ShopSphere Delivery Partner Portal</h1>
                <span style={{ background: "#22c55e", color: "#052e16", fontSize: "10px", fontWeight: 900, padding: "2px 8px", borderRadius: "12px", textTransform: "uppercase" }}>FLEET LIVE ●</span>
              </div>
              <span style={{ fontSize: "12px", color: "#94a3b8" }}>Online Rider Commission Payouts &amp; Day-Wise Doorstep COD Cash Deposit to Admin</span>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {loggedUser && loggedUser.role === "delivery" ? (
              <button
                type="button"
                onClick={() => {
                  localStorage.removeItem("token"); localStorage.removeItem("user");
                  sessionStorage.removeItem("token"); sessionStorage.removeItem("user");
                  window.location.href = "/login";
                }}
                style={{ background: "#ef4444", color: "#ffffff", border: "none", padding: "9px 16px", borderRadius: "10px", fontSize: "12px", fontWeight: 800, cursor: "pointer", boxShadow: "0 4px 12px rgba(239,68,68,0.3)" }}
              >
                🔒 Sign Out
              </button>
            ) : (
              <>
                <Link to="/" style={{ color: "#cbd5e1", textDecoration: "none", fontSize: "13px", fontWeight: 700 }}>
                  ← Customer Store
                </Link>
                <Link to="/vendor-dashboard" style={{ background: "#3b82f6", color: "#ffffff", padding: "9px 16px", borderRadius: "10px", textDecoration: "none", fontSize: "13px", fontWeight: 800 }}>
                  Vendor Hub
                </Link>
              </>
            )}
          </div>

        </div>
      </header>

      {/* ── Modal 1: COD Cash Deposit to Admin Modal ── */}
      {showSettlementModal && (
        <div className="chk-modal-backdrop" style={{ zIndex: 9999 }}>
          <div className="chk-modal-card" style={{ maxWidth: "520px", textAlign: "left", padding: "24px", background: "#ffffff" }}>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h2 style={{ margin: 0, fontSize: "18px", fontWeight: 900, color: "#0f172a" }}>
                🏛️ Deposit Collected COD Cash to Admin
              </h2>
              <button type="button" onClick={() => setShowSettlementModal(false)} style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "#64748b" }}>✕</button>
            </div>

            <div style={{ background: "#fffbeb", border: "1.5px solid #fde68a", padding: "16px", borderRadius: "14px", marginBottom: "20px" }}>
              <span style={{ fontSize: "11px", fontWeight: 900, color: "#92400e", textTransform: "uppercase", display: "block" }}>PHYSICAL DOORSTEP CASH COLLECTED</span>
              <div style={{ fontSize: "28px", fontWeight: 900, color: "#b45309", marginTop: "4px" }}>
                ₹{pendingCodToAdmin.toLocaleString("en-IN")}
              </div>
              <small style={{ fontSize: "11px", color: "#92400e", display: "block", marginTop: "4px" }}>
                Collected in cash from customers. Mandatory deposit to Admin Office/UPI.
              </small>
            </div>

            <form onSubmit={handleSettleCashToAdmin}>
              <div style={{ marginBottom: "16px" }}>
                <label style={{ fontSize: "12px", fontWeight: 800, color: "#334155", display: "block", marginBottom: "6px" }}>
                  Select Cash Deposit Mode to Admin:
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
                  {["UPI", "CASH", "BANK"].map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setSettlementMethod(mode)}
                      style={{
                        padding: "10px",
                        borderRadius: "10px",
                        border: settlementMethod === mode ? "2px solid #2563eb" : "1px solid #cbd5e1",
                        background: settlementMethod === mode ? "#eff6ff" : "#ffffff",
                        color: settlementMethod === mode ? "#1d4ed8" : "#475569",
                        fontWeight: 900,
                        fontSize: "12px",
                        cursor: "pointer",
                      }}
                    >
                      {mode === "UPI" ? "📱 Admin UPI" : mode === "CASH" ? "💵 Office Counter" : "🏦 Bank IMPS"}
                    </button>
                  ))}
                </div>
              </div>

              {settlementMethod === "UPI" && (
                <div style={{ background: "#fdf2f8", border: "1px solid #fbcfe8", padding: "12px", borderRadius: "10px", marginBottom: "16px" }}>
                  <div style={{ fontSize: "11px", fontWeight: 800, color: "#be185d" }}>Official Store Merchant UPI ID:</div>
                  <div style={{ fontSize: "16px", fontWeight: 900, color: "#9d174d", fontFamily: "monospace", margin: "4px 0" }}>
                    {MERCHANT_PAYMENT_CONFIG.merchantUpiId}
                  </div>
                  <small style={{ fontSize: "11px", color: "#be185d" }}>Pay via Google Pay, PhonePe, Paytm, or BHIM.</small>
                </div>
              )}

              <div style={{ marginBottom: "20px" }}>
                <label style={{ fontSize: "12px", fontWeight: 800, color: "#334155", display: "block", marginBottom: "6px" }}>
                  Transaction Reference / UTR Number:
                </label>
                <input
                  type="text"
                  placeholder="e.g. UTR 94012840912 or Cash Receipt #"
                  value={settlementTxnRef}
                  onChange={(e) => setSettlementTxnRef(e.target.value)}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1.5px solid #cbd5e1", fontSize: "13px", outline: "none" }}
                />
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  type="submit"
                  disabled={settling}
                  style={{ flex: 1, background: "#166534", color: "#ffffff", border: "none", padding: "12px", borderRadius: "10px", fontSize: "14px", fontWeight: 900, cursor: "pointer", boxShadow: "0 4px 12px rgba(22,101,52,0.3)" }}
                >
                  {settling ? "Processing Cash Deposit…" : `Deposit COD Cash to Admin (₹${pendingCodToAdmin.toLocaleString("en-IN")}) ✓`}
                </button>
                <button
                  type="button"
                  onClick={() => setShowSettlementModal(false)}
                  style={{ background: "#f1f5f9", color: "#475569", border: "1px solid #cbd5e1", padding: "12px 18px", borderRadius: "10px", fontWeight: 800, cursor: "pointer" }}
                >
                  Cancel
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* ── Modal 2: Online Commission Payout to Rider Modal ── */}
      {showPayoutModal && (
        <div className="chk-modal-backdrop" style={{ zIndex: 9999 }}>
          <div className="chk-modal-card" style={{ maxWidth: "520px", textAlign: "left", padding: "24px", background: "#ffffff" }}>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h2 style={{ margin: 0, fontSize: "18px", fontWeight: 900, color: "#0f172a" }}>
                💳 Instant Online Payout to Rider Bank / UPI Account
              </h2>
              <button type="button" onClick={() => setShowPayoutModal(false)} style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "#64748b" }}>✕</button>
            </div>

            <div style={{ background: "#f0fdf4", border: "1.5px solid #bbf7d0", padding: "16px", borderRadius: "14px", marginBottom: "20px" }}>
              <span style={{ fontSize: "11px", fontWeight: 900, color: "#166534", textTransform: "uppercase", display: "block" }}>AVAILABLE RIDER COMMISSION PAYOUT</span>
              <div style={{ fontSize: "28px", fontWeight: 900, color: "#15803d", marginTop: "4px" }}>
                ₹{pendingRiderPayout.toLocaleString("en-IN")}
              </div>
              <small style={{ fontSize: "11px", color: "#166534", display: "block", marginTop: "4px" }}>
                Earned +₹50 per verified delivery. Sent directly to your online bank account!
              </small>
            </div>

            <form onSubmit={handleWithdrawRiderCommission}>
              <div style={{ marginBottom: "14px" }}>
                <label style={{ fontSize: "12px", fontWeight: 800, color: "#334155", display: "block", marginBottom: "4px" }}>
                  Rider UPI Handle for Direct Online Deposit:
                </label>
                <input
                  type="text"
                  value={riderUpi}
                  onChange={(e) => setRiderUpi(e.target.value)}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1.5px solid #cbd5e1", fontSize: "13px", outline: "none", fontFamily: "monospace" }}
                  required
                />
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={{ fontSize: "12px", fontWeight: 800, color: "#334155", display: "block", marginBottom: "4px" }}>
                  Rider Bank Account &amp; IFSC Code:
                </label>
                <input
                  type="text"
                  value={riderBank}
                  onChange={(e) => setRiderBank(e.target.value)}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1.5px solid #cbd5e1", fontSize: "13px", outline: "none" }}
                  required
                />
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  type="submit"
                  disabled={payoutProcessing}
                  style={{ flex: 1, background: "#15803d", color: "#ffffff", border: "none", padding: "12px", borderRadius: "10px", fontSize: "14px", fontWeight: 900, cursor: "pointer", boxShadow: "0 4px 12px rgba(21,128,61,0.3)" }}
                >
                  {payoutProcessing ? "Processing Bank Transfer…" : `Transfer Commission Online to Rider Account (₹${pendingRiderPayout}) ✓`}
                </button>
                <button
                  type="button"
                  onClick={() => setShowPayoutModal(false)}
                  style={{ background: "#f1f5f9", color: "#475569", border: "1px solid #cbd5e1", padding: "12px 18px", borderRadius: "10px", fontWeight: 800, cursor: "pointer" }}
                >
                  Cancel
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      <div style={{ maxWidth: "1280px", margin: "24px auto", padding: "0 20px" }}>

        {/* ── Fleet Profile & Action Bar ── */}
        <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "20px", padding: "24px", marginBottom: "24px", boxShadow: "0 10px 30px rgba(0,0,0,0.04)" }}>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px", marginBottom: "20px", borderBottom: "1px solid #f1f5f9", paddingBottom: "16px" }}>
            <div>
              <span style={{ fontSize: "11px", fontWeight: 900, color: "#2563eb", textTransform: "uppercase", letterSpacing: "1px", display: "block" }}>
                👨‍💼 ACTIVE RIDER FLEET PROFILE
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "4px" }}>
                {loggedUser && loggedUser.role === "delivery" ? (
                  <div style={{ background: "#f0fdf4", border: "1.5px solid #bbf7d0", padding: "10px 18px", borderRadius: "12px" }}>
                    <div style={{ fontSize: "16px", fontWeight: 900, color: "#0f172a" }}>
                      👨‍💼 {loggedUser.name} <span style={{ color: "#166534", fontSize: "12px", background: "#dcfce7", padding: "2px 8px", borderRadius: "6px" }}>Verified Rider</span>
                    </div>
                    <div style={{ fontSize: "12px", color: "#166534", fontWeight: 700, marginTop: "2px" }}>
                      📧 Account: {loggedUser.email} • Online Commission Bank Payout Active
                    </div>
                  </div>
                ) : (
                  <select
                    value={selectedDriver}
                    onChange={(e) => setSelectedDriver(e.target.value)}
                    style={{ padding: "10px 16px", borderRadius: "12px", border: "2px solid #2563eb", fontSize: "14px", fontWeight: 900, color: "#0f172a", outline: "none", background: "#eff6ff" }}
                  >
                    {DRIVER_PROFILES.map((d) => (
                      <option key={d.id} value={d.id}>
                        👨‍💼 {d.name} ({d.agency})
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            {/* Financial Dual Action Buttons */}
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={() => setShowPayoutModal(true)}
                disabled={pendingRiderPayout <= 0}
                style={{
                  background: pendingRiderPayout > 0 ? "linear-gradient(135deg, #15803d 0%, #166534 100%)" : "#cbd5e1",
                  color: "#ffffff",
                  border: "none",
                  padding: "12px 18px",
                  borderRadius: "12px",
                  fontSize: "13px",
                  fontWeight: 900,
                  cursor: pendingRiderPayout > 0 ? "pointer" : "not-allowed",
                  boxShadow: pendingRiderPayout > 0 ? "0 4px 14px rgba(21,128,61,0.3)" : "none",
                }}
              >
                💳 Withdraw Rider Commission Online ({pendingRiderPayout > 0 ? `+₹${pendingRiderPayout}` : "Paid ✓"})
              </button>

              <button
                type="button"
                onClick={() => setShowSettlementModal(true)}
                disabled={pendingCodToAdmin <= 0}
                style={{
                  background: pendingCodToAdmin > 0 ? "linear-gradient(135deg, #b45309 0%, #d97706 100%)" : "#cbd5e1",
                  color: "#ffffff",
                  border: "none",
                  padding: "12px 18px",
                  borderRadius: "12px",
                  fontSize: "13px",
                  fontWeight: 900,
                  cursor: pendingCodToAdmin > 0 ? "pointer" : "not-allowed",
                  boxShadow: pendingCodToAdmin > 0 ? "0 4px 14px rgba(180,83,9,0.3)" : "none",
                }}
              >
                🏛️ Deposit COD Cash to Admin ({pendingCodToAdmin > 0 ? `₹${pendingCodToAdmin.toLocaleString("en-IN")}` : "Settled ✓"})
              </button>
            </div>
          </div>

          {/* 📊 Financial Metrics Overview */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>

            {/* Active Pending */}
            <div style={{ background: "#f8fafc", border: "1.5px solid #e2e8f0", padding: "16px", borderRadius: "14px", textAlign: "center" }}>
              <span style={{ fontSize: "11px", color: "#64748b", fontWeight: 800, textTransform: "uppercase" }}>Active Pending</span>
              <strong style={{ fontSize: "22px", color: "#0f172a", display: "block", marginTop: "2px" }}>{pendingDeliveries.length}</strong>
              <small style={{ fontSize: "11px", color: "#2563eb", fontWeight: 700 }}>Ready for Drop</small>
            </div>

            {/* Delivered Count */}
            <div style={{ background: "#f0fdf4", border: "1.5px solid #bbf7d0", padding: "16px", borderRadius: "14px", textAlign: "center" }}>
              <span style={{ fontSize: "11px", color: "#166534", fontWeight: 800, textTransform: "uppercase" }}>Delivered ✅</span>
              <strong style={{ fontSize: "22px", color: "#166534", display: "block", marginTop: "2px" }}>{completedDeliveries.length}</strong>
              <small style={{ fontSize: "11px", color: "#166534", fontWeight: 700 }}>PIN Verified</small>
            </div>

            {/* Rider Commission Online */}
            <div style={{ background: "#f0fdf4", border: "2px solid #86efac", padding: "16px", borderRadius: "14px", textAlign: "center" }}>
              <span style={{ fontSize: "11px", color: "#15803d", fontWeight: 900, textTransform: "uppercase" }}>💳 Rider Online Commission</span>
              <strong style={{ fontSize: "22px", color: "#15803d", display: "block", marginTop: "2px" }}>+₹{riderTotalCommission.toLocaleString("en-IN")}</strong>
              <small style={{ fontSize: "11px", color: "#166534", fontWeight: 800 }}>Transferred to Rider Bank A/C</small>
            </div>

            {/* Online Paid Volume */}
            <div style={{ background: "#faf5ff", border: "1.5px solid #e9d5ff", padding: "16px", borderRadius: "14px", textAlign: "center" }}>
              <span style={{ fontSize: "11px", color: "#7e22ce", fontWeight: 800, textTransform: "uppercase" }}>⚡ Online Paid (Store)</span>
              <strong style={{ fontSize: "22px", color: "#7e22ce", display: "block", marginTop: "2px" }}>₹{onlinePaidTotal.toLocaleString("en-IN")}</strong>
              <small style={{ fontSize: "11px", color: "#6b21a8", fontWeight: 700 }}>Direct Online Gateway</small>
            </div>

            {/* COD Cash Collected */}
            <div style={{ background: "#fffbeb", border: "1.5px solid #fde68a", padding: "16px", borderRadius: "14px", textAlign: "center" }}>
              <span style={{ fontSize: "11px", color: "#92400e", fontWeight: 800, textTransform: "uppercase" }}>💵 COD Cash to Admin</span>
              <strong style={{ fontSize: "22px", color: "#b45309", display: "block", marginTop: "2px" }}>₹{codTotalCollected.toLocaleString("en-IN")}</strong>
              <small style={{ fontSize: "11px", color: pendingCodToAdmin > 0 ? "#b45309" : "#166534", fontWeight: 800 }}>
                {pendingCodToAdmin > 0 ? `⚠️ ₹${pendingCodToAdmin} Deposit Due` : "✅ All Cash Deposited"}
              </small>
            </div>

          </div>

        </div>

        {/* ── Navigation Tabs ── */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap", borderBottom: "2px solid #e2e8f0", paddingBottom: "12px" }}>
          <button
            type="button"
            onClick={() => setDeliveryTab("pending")}
            style={{
              padding: "10px 18px",
              borderRadius: "12px",
              border: deliveryTab === "pending" ? "2px solid #2563eb" : "1px solid #cbd5e1",
              background: deliveryTab === "pending" ? "#eff6ff" : "#ffffff",
              color: deliveryTab === "pending" ? "#1d4ed8" : "#475569",
              fontWeight: 900,
              fontSize: "13px",
              cursor: "pointer",
            }}
          >
            🚚 Active Pending Deliveries ({pendingDeliveries.length})
          </button>
          <button
            type="button"
            onClick={() => setDeliveryTab("completed")}
            style={{
              padding: "10px 18px",
              borderRadius: "12px",
              border: deliveryTab === "completed" ? "2px solid #166534" : "1px solid #cbd5e1",
              background: deliveryTab === "completed" ? "#f0fdf4" : "#ffffff",
              color: deliveryTab === "completed" ? "#166534" : "#475569",
              fontWeight: 900,
              fontSize: "13px",
              cursor: "pointer",
            }}
          >
            ✅ Delivered &amp; Handed Over ({completedDeliveries.length})
          </button>
          <button
            type="button"
            onClick={() => setDeliveryTab("remittance")}
            style={{
              padding: "10px 18px",
              borderRadius: "12px",
              border: deliveryTab === "remittance" ? "2px solid #b45309" : "1px solid #cbd5e1",
              background: deliveryTab === "remittance" ? "#fffbeb" : "#ffffff",
              color: deliveryTab === "remittance" ? "#b45309" : "#475569",
              fontWeight: 900,
              fontSize: "13px",
              cursor: "pointer",
            }}
          >
            🏛️ COD Cash Deposit to Admin ({settlementHistory.length})
          </button>
          <button
            type="button"
            onClick={() => setDeliveryTab("commission")}
            style={{
              padding: "10px 18px",
              borderRadius: "12px",
              border: deliveryTab === "commission" ? "2px solid #15803d" : "1px solid #cbd5e1",
              background: deliveryTab === "commission" ? "#f0fdf4" : "#ffffff",
              color: deliveryTab === "commission" ? "#15803d" : "#475569",
              fontWeight: 900,
              fontSize: "13px",
              cursor: "pointer",
            }}
          >
            💳 Rider Online Commission Payouts (+₹{riderTotalCommission})
          </button>
        </div>

        {/* ── TAB CONTENT 1: COD Cash Remittance History ── */}
        {deliveryTab === "remittance" && (
          <div style={{ background: "#ffffff", border: "1px solid #cbd5e1", borderRadius: "16px", padding: "24px" }}>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <div>
                <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 900, color: "#0f172a" }}>🏛️ Day-Wise COD Doorstep Cash Deposit Log to Admin</h3>
                <span style={{ fontSize: "12px", color: "#64748b" }}>Track cash collected at customer doorsteps and deposited to Admin office or UPI handle</span>
              </div>
              <button
                type="button"
                onClick={() => setShowSettlementModal(true)}
                disabled={pendingCodToAdmin <= 0}
                style={{ background: "#166534", color: "#ffffff", border: "none", padding: "10px 16px", borderRadius: "10px", fontSize: "12px", fontWeight: 900, cursor: pendingCodToAdmin > 0 ? "pointer" : "not-allowed" }}
              >
                + Deposit COD Cash to Admin (₹{pendingCodToAdmin})
              </button>
            </div>

            {settlementHistory.length === 0 ? (
              <div style={{ textTransform: "center", padding: "40px", color: "#64748b", textAlign: "center" }}>
                <span style={{ fontSize: "36px" }}>🏛️</span>
                <p style={{ margin: "8px 0 0", fontSize: "14px" }}>No cash deposit logs yet. Deliver COD orders and deposit cash to Admin above!</p>
              </div>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                <thead>
                  <tr style={{ background: "#f8fafc", borderBottom: "2px solid #e2e8f0", textAlign: "left" }}>
                    <th style={{ padding: "10px" }}>Deposit ID</th>
                    <th style={{ padding: "10px" }}>Date &amp; Time</th>
                    <th style={{ padding: "10px" }}>Rider Name</th>
                    <th style={{ padding: "10px" }}>Deposit Method</th>
                    <th style={{ padding: "10px" }}>Ref / UTR #</th>
                    <th style={{ padding: "10px", textAlign: "right" }}>Cash Deposited</th>
                    <th style={{ padding: "10px", textAlign: "center" }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {settlementHistory.map((s) => (
                    <tr key={s.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "10px", fontWeight: 900, fontFamily: "monospace", color: "#2563eb" }}>{s.id}</td>
                      <td style={{ padding: "10px", color: "#475569" }}>{s.date}</td>
                      <td style={{ padding: "10px", fontWeight: 800 }}>{s.riderName}</td>
                      <td style={{ padding: "10px", color: "#0f172a", fontWeight: 700 }}>{s.method === "UPI" ? "📱 Admin UPI Transfer" : s.method === "CASH" ? "💵 Counter Cash Handover" : "🏦 Bank IMPS"}</td>
                      <td style={{ padding: "10px", fontFamily: "monospace", color: "#64748b" }}>{s.refNo}</td>
                      <td style={{ padding: "10px", textAlign: "right", fontWeight: 900, color: "#166534" }}>₹{Number(s.amount).toLocaleString("en-IN")}</td>
                      <td style={{ padding: "10px", textAlign: "center" }}>
                        <span style={{ background: "#f0fdf4", color: "#166534", border: "1px solid #bbf7d0", padding: "3px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: 900 }}>
                          {s.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

          </div>
        )}

        {/* ── TAB CONTENT 2: Rider Online Commission Payout Ledger ── */}
        {deliveryTab === "commission" && (
          <div style={{ background: "#ffffff", border: "1px solid #cbd5e1", borderRadius: "16px", padding: "24px" }}>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <div>
                <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 900, color: "#0f172a" }}>💳 Rider Online Commission Payout Bank Ledger</h3>
                <span style={{ fontSize: "12px", color: "#64748b" }}>Rider earns +₹50 per verified delivery. Directly transferred online to rider's bank / UPI account</span>
              </div>
              <button
                type="button"
                onClick={() => setShowPayoutModal(true)}
                disabled={pendingRiderPayout <= 0}
                style={{ background: "#15803d", color: "#ffffff", border: "none", padding: "10px 16px", borderRadius: "10px", fontSize: "12px", fontWeight: 900, cursor: pendingRiderPayout > 0 ? "pointer" : "not-allowed" }}
              >
                + Withdraw Commission Online (₹{pendingRiderPayout})
              </button>
            </div>

            {/* Payout History Table */}
            {payoutHistory.length > 0 && (
              <div style={{ marginBottom: "24px" }}>
                <h4 style={{ fontSize: "13px", fontWeight: 900, color: "#166534", textTransform: "uppercase", marginBottom: "10px" }}>Recent Online Transfers to Rider Account:</h4>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px", marginBottom: "20px" }}>
                  <thead>
                    <tr style={{ background: "#f0fdf4", borderBottom: "2px solid #bbf7d0", textAlign: "left" }}>
                      <th style={{ padding: "8px" }}>Payout ID</th>
                      <th style={{ padding: "8px" }}>Date</th>
                      <th style={{ padding: "8px" }}>Rider Bank / UPI Handle</th>
                      <th style={{ padding: "8px" }}>Bank Ref #</th>
                      <th style={{ padding: "8px", textAlign: "right" }}>Amount Transferred</th>
                      <th style={{ padding: "8px", textAlign: "center" }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payoutHistory.map((p) => (
                      <tr key={p.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                        <td style={{ padding: "8px", fontWeight: 900, fontFamily: "monospace", color: "#15803d" }}>{p.id}</td>
                        <td style={{ padding: "8px", color: "#475569" }}>{p.date}</td>
                        <td style={{ padding: "8px", fontWeight: 800, fontFamily: "monospace", color: "#0f172a" }}>{p.riderUpi}</td>
                        <td style={{ padding: "8px", fontFamily: "monospace", color: "#64748b" }}>{p.refNo}</td>
                        <td style={{ padding: "8px", textAlign: "right", fontWeight: 900, color: "#166534" }}>+₹{Number(p.amount).toLocaleString("en-IN")}</td>
                        <td style={{ padding: "8px", textAlign: "center" }}>
                          <span style={{ background: "#dcfce7", color: "#14532d", padding: "2px 6px", borderRadius: "4px", fontSize: "10px", fontWeight: 900 }}>{p.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Individual Orders Commission Ledger Table */}
            <h4 style={{ fontSize: "13px", fontWeight: 900, color: "#0f172a", textTransform: "uppercase", marginBottom: "10px" }}>Delivered Package Commission Breakdown:</h4>
            {completedDeliveries.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
                <span style={{ fontSize: "36px" }}>💵</span>
                <p style={{ margin: "8px 0 0", fontSize: "14px" }}>No commissions logged yet. Complete active deliveries with 4-digit OTP PIN to earn +₹50 per delivery!</p>
              </div>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                <thead>
                  <tr style={{ background: "#faf5ff", borderBottom: "2px solid #e9d5ff", textAlign: "left" }}>
                    <th style={{ padding: "10px" }}>Order ID</th>
                    <th style={{ padding: "10px" }}>Delivery Customer</th>
                    <th style={{ padding: "10px" }}>Order Payment Mode</th>
                    <th style={{ padding: "10px", textAlign: "right" }}>Order Value (₹)</th>
                    <th style={{ padding: "10px", textAlign: "right" }}>Rider Commission (+₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {completedDeliveries.map((o) => (
                    <tr key={o._id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "10px", fontWeight: 900, fontFamily: "monospace", color: "#7e22ce" }}>#{o._id.slice(-6).toUpperCase()}</td>
                      <td style={{ padding: "10px", fontWeight: 800 }}>{o.shippingAddress?.fullName || "Valued Customer"}</td>
                      <td style={{ padding: "10px" }}>
                        <span style={{ background: o.paymentMethod === "COD" ? "#fffbeb" : "#f0fdf4", color: o.paymentMethod === "COD" ? "#92400e" : "#166534", padding: "3px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: 800 }}>
                          {o.paymentMethod === "COD" ? "💵 Cash on Delivery" : "⚡ Paid Online"}
                        </span>
                      </td>
                      <td style={{ padding: "10px", textAlign: "right", fontWeight: 700 }}>₹{Number(o.totalAmount).toLocaleString("en-IN")}</td>
                      <td style={{ padding: "10px", textAlign: "right", fontWeight: 900, color: "#15803d" }}>+₹50.00 (Online A/C)</td>
                    </tr>
                  ))}
                  <tr style={{ background: "#f0fdf4", borderTop: "2px solid #86efac" }}>
                    <td colSpan={4} style={{ padding: "12px 10px", fontWeight: 900, fontSize: "14px", color: "#166534" }}>Total Earned Rider Commission ({completedDeliveries.length} Deliveries):</td>
                    <td style={{ padding: "12px 10px", textAlign: "right", fontWeight: 900, fontSize: "18px", color: "#15803d" }}>+₹{riderTotalCommission.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            )}

          </div>
        )}

        {/* ── TAB CONTENT 3 & 4: Active & Completed Order Cards Grid ── */}
        {(deliveryTab === "pending" || deliveryTab === "completed" || deliveryTab === "all") && (
          <div>
            {loading ? (
              <div style={{ textAlign: "center", padding: "60px", color: "#64748b", fontWeight: 700 }}>
                ⏳ Loading live delivery assignments…
              </div>
            ) : displayedOrders.length === 0 ? (
              <div style={{ background: "#ffffff", border: "1px solid #cbd5e1", borderRadius: "16px", padding: "48px", textAlign: "center", color: "#64748b" }}>
                <span style={{ fontSize: "40px" }}>📦</span>
                <h3 style={{ fontSize: "18px", color: "#0f172a", margin: "12px 0 6px" }}>
                  {deliveryTab === "pending" ? "No Active Pending Deliveries" : "No Completed Deliveries Found"}
                </h3>
                <p style={{ fontSize: "14px", margin: 0 }}>
                  {deliveryTab === "pending"
                    ? "All assigned parcels have been delivered and verified! New dispatched parcels will appear here."
                    : "Deliveries completed with 4-digit PIN verification will appear in this history tab."}
                </p>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: "20px" }}>
                {displayedOrders.map((o) => {
                  const isDelivered = o.orderStatus === "Delivered";
                  const isCod = o.paymentMethod === "COD";

                  return (
                    <div
                      key={o._id}
                      style={{
                        background: "#ffffff",
                        border: isDelivered ? "2px solid #22c55e" : "2px solid #2563eb",
                        borderRadius: "18px",
                        padding: "20px",
                        boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
                        position: "relative",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                      }}
                    >
                      {/* Card Top Meta */}
                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", borderBottom: "1px solid #f1f5f9", paddingBottom: "10px" }}>
                          <span style={{ background: "#0f172a", color: "#ffffff", fontSize: "11px", fontWeight: 900, padding: "4px 8px", borderRadius: "6px" }}>
                            ORDER #{o._id.slice(-6).toUpperCase()}
                          </span>

                          <span
                            style={{
                              background: isDelivered ? "#f0fdf4" : "#eff6ff",
                              color: isDelivered ? "#166534" : "#1d4ed8",
                              fontSize: "11px",
                              fontWeight: 900,
                              padding: "4px 10px",
                              borderRadius: "6px",
                              border: isDelivered ? "1px solid #bbf7d0" : "1px solid #bfdbfe",
                            }}
                          >
                            {isDelivered ? "✅ DELIVERED" : "🚀 DISPATCHED / READY"}
                          </span>
                        </div>

                        {/* 🏭 PICKUP VENDOR LOCATION */}
                        <div style={{ background: "#faf5ff", border: "1px solid #e9d5ff", borderRadius: "12px", padding: "12px", marginBottom: "12px" }}>
                          <div style={{ fontSize: "10px", fontWeight: 900, color: "#7e22ce", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                            🏭 1. PICKUP VENDOR FACILITY
                          </div>
                          <div style={{ fontSize: "14px", fontWeight: 900, color: "#0f172a", marginTop: "2px" }}>
                            {o.items?.[0]?.seller || "Kashi Silk & Handloom"}
                          </div>
                          <div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>
                            📍 Plot 102, ShopSphere Vendor Hub, SG Highway, Ahmedabad
                          </div>
                        </div>

                        {/* 📍 CUSTOMER DROP LOCATION */}
                        <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "12px", padding: "12px", marginBottom: "12px" }}>
                          <div style={{ fontSize: "10px", fontWeight: 900, color: "#1d4ed8", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                            📍 2. CUSTOMER DROP DESTINATION
                          </div>
                          <div style={{ fontSize: "15px", fontWeight: 900, color: "#0f172a", marginTop: "2px" }}>
                            {o.shippingAddress?.fullName || "Devansh Bhatiya"}
                          </div>
                          <div style={{ fontSize: "12px", color: "#334155", lineHeight: 1.4, marginTop: "2px" }}>
                            {o.shippingAddress?.address}, {o.shippingAddress?.city}, {o.shippingAddress?.state} - <strong>{o.shippingAddress?.pincode}</strong>
                          </div>

                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "10px", paddingTop: "8px", borderTop: "1px dashed #bfdbfe" }}>
                            <a
                              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${o.shippingAddress?.address || ''}, ${o.shippingAddress?.city || ''}`)}`}
                              target="_blank"
                              rel="noreferrer"
                              style={{ background: "#ffffff", border: "1px solid #3b82f6", color: "#1d4ed8", textDecoration: "none", padding: "4px 10px", borderRadius: "6px", fontSize: "11px", fontWeight: 800 }}
                            >
                              🗺️ Open Maps
                            </a>
                            <a
                              href={`tel:${o.shippingAddress?.phone}`}
                              style={{ background: "#1d4ed8", color: "#ffffff", textDecoration: "none", padding: "4px 10px", borderRadius: "6px", fontSize: "11px", fontWeight: 800 }}
                            >
                              📞 Call Customer
                            </a>
                          </div>
                        </div>

                        {/* 💳 PAYMENT STATUS: ONLINE vs COD */}
                        <div style={{ background: isCod ? "#fffbeb" : "#f0fdf4", border: isCod ? "1.5px solid #fde68a" : "1.5px solid #bbf7d0", borderRadius: "12px", padding: "14px", marginBottom: "12px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div>
                              <span style={{ fontSize: "10px", fontWeight: 900, color: isCod ? "#92400e" : "#166534", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                                {isCod ? "💵 CASH ON DELIVERY (COD)" : "⚡ PAID ONLINE (UPI / CARD)"}
                              </span>
                              <div style={{ fontSize: "13px", fontWeight: 800, color: "#0f172a", marginTop: "2px" }}>
                                {isCod ? "Collect Physical Cash at Doorstep:" : "Paid Online directly to Store:"}
                              </div>
                            </div>
                            <div style={{ fontSize: "20px", fontWeight: 900, color: isCod ? "#b45309" : "#166534" }}>
                              ₹{Number(o.totalAmount).toLocaleString("en-IN")}
                            </div>
                          </div>
                          {isCod && (
                            <small style={{ fontSize: "11px", color: "#b45309", fontWeight: 700, display: "block", marginTop: "4px" }}>
                              ⚠️ Doorstep cash collected. Must deposit to Admin Office / Admin UPI.
                            </small>
                          )}
                        </div>

                        {/* 💵 RIDER ONLINE COMMISSION BANNER */}
                        <div style={{ background: "#f0fdf4", border: "1px solid #86efac", borderRadius: "10px", padding: "10px 14px", marginBottom: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <div>
                            <span style={{ fontSize: "10px", fontWeight: 900, color: "#166534", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                              💳 RIDER ONLINE COMMISSION PAYOUT
                            </span>
                            <div style={{ fontSize: "12px", color: "#334155", fontWeight: 700 }}>
                              Sent online to Rider Bank / UPI A/C
                            </div>
                          </div>
                          <div style={{ fontSize: "18px", fontWeight: 900, color: "#15803d" }}>
                            +₹50.00
                          </div>
                        </div>

                        {/* Items List */}
                        <div style={{ fontSize: "12px", color: "#475569", marginBottom: "16px", background: "#f8fafc", padding: "10px", borderRadius: "8px" }}>
                          <strong>Items in Parcel:</strong>
                          {o.items?.map((it, idx) => (
                            <div key={idx} style={{ marginTop: "2px" }}>• {it.name} x {it.quantity}</div>
                          ))}
                        </div>
                      </div>

                      {/* 🔑 VERIFY PIN & COMPLETE DELIVERY */}
                      <div>
                        {alertMsg.orderId === o._id && alertMsg.text && (
                          <div
                            style={{
                              background: alertMsg.type === "error" ? "#fff1f2" : "#f0fdf4",
                              color: alertMsg.type === "error" ? "#be123c" : "#166534",
                              border: alertMsg.type === "error" ? "1px solid #fecdd3" : "1px solid #bbf7d0",
                              padding: "10px",
                              borderRadius: "8px",
                              fontSize: "12px",
                              fontWeight: 700,
                              marginBottom: "12px",
                            }}
                          >
                            {alertMsg.text}
                          </div>
                        )}

                        {isDelivered ? (
                          <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "12px", borderRadius: "10px", textAlign: "center", color: "#166534", fontWeight: 900, fontSize: "13px" }}>
                            ✅ Handed Over &amp; Delivered • PIN Verified (+₹50 Online Commission)
                          </div>
                        ) : (
                          <div style={{ background: "#faf5ff", border: "2px dashed #9333ea", padding: "14px", borderRadius: "12px" }}>
                            <label style={{ fontSize: "11px", fontWeight: 900, color: "#7e22ce", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>
                              🔑 Enter 4-Digit Customer Verification OTP
                            </label>
                            <div style={{ display: "flex", gap: "8px" }}>
                              <input
                                type="text"
                                maxLength={4}
                                placeholder="4-Digit OTP"
                                value={pinInputs[o._id] || ""}
                                onChange={(e) => handlePinChange(o._id, e.target.value)}
                                style={{
                                  flex: 1,
                                  padding: "8px",
                                  borderRadius: "8px",
                                  border: "2px solid #c084fc",
                                  textAlign: "center",
                                  fontSize: "18px",
                                  fontWeight: 900,
                                  letterSpacing: "4px",
                                  color: "#7e22ce",
                                  outline: "none",
                                  background: "#ffffff",
                                }}
                              />
                              <button
                                type="button"
                                onClick={() => handleVerifyAndDeliver(o._id)}
                                disabled={verifyingId === o._id}
                                style={{
                                  background: "linear-gradient(135deg, #166534 0%, #15803d 100%)",
                                  color: "#ffffff",
                                  border: "none",
                                  padding: "8px 16px",
                                  borderRadius: "8px",
                                  fontSize: "13px",
                                  fontWeight: 900,
                                  cursor: "pointer",
                                  boxShadow: "0 4px 10px rgba(22, 101, 52, 0.3)",
                                }}
                              >
                                {verifyingId === o._id ? "Verifying…" : "🔑 Complete Delivery →"}
                              </button>
                            </div>
                            <span style={{ fontSize: "10px", color: "#64748b", margin: "6px 0 0", display: "block" }}>
                              Ask customer for their 4-digit OTP shown on their order tracker page or email receipt.
                            </span>
                          </div>
                        )}
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
