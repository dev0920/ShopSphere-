import { API_BASE_URL } from "../config/apiConfig";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MERCHANT_PAYMENT_CONFIG } from "../config/paymentConfig";
import "../styles/checkout.css";

function Checkout() {
  const [cartItems, setCartItems] = useState([]);
  const [isReselling, setIsReselling] = useState(false);
  const [resellerMarginAmount, setResellerMarginAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("COD"); // COD, UPI, CARD
  const [showUpiModal, setShowUpiModal] = useState(false);
  const [showCardOtpModal, setShowCardOtpModal] = useState(false);

  // Online Card State
  const [cardData, setCardData] = useState({
    number: "",
    name: "",
    expiry: "",
    cvv: "",
  });

  // Online UPI State
  const [upiOption, setUpiOption] = useState("QR"); // "QR" or "VPA"
  const [upiId, setUpiId] = useState("");
  const [upiVerified, setUpiVerified] = useState(false);
  const [utrNumber, setUtrNumber] = useState("");
  const [utrVerified, setUtrVerified] = useState(false);
  const [isVerifyingUtr, setIsVerifyingUtr] = useState(false);
  const [isCheckingUpiStatus, setIsCheckingUpiStatus] = useState(false);

  // Card 3D Secure OTP State
  const [cardOtp, setCardOtp] = useState("");
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  const [userProfile, setUserProfile] = useState(null);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressIndex, setSelectedAddressIndex] = useState(null);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [saveAddressToProfile, setSaveAddressToProfile] = useState(true);

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const navigate = useNavigate();

  const [appliedCoupon, setAppliedCoupon] = useState(null);

  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem("cart")) || [];
    const savedCoupon = JSON.parse(localStorage.getItem("appliedCoupon")) || null;
    setCartItems(savedCart);
    setAppliedCoupon(savedCoupon);

    // Auto-fetch Logged-in User Profile & Saved Addresses
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    const localUser = JSON.parse(localStorage.getItem("user")) || JSON.parse(sessionStorage.getItem("user")) || null;

    if (localUser) {
      setUserProfile(localUser);
      const localAddrs = localUser.addresses || JSON.parse(localStorage.getItem("savedAddresses")) || [];
      setSavedAddresses(localAddrs);

      if (localAddrs.length > 0) {
        const defaultIdx = localAddrs.findIndex(a => a.isDefault) !== -1 ? localAddrs.findIndex(a => a.isDefault) : 0;
        setSelectedAddressIndex(defaultIdx);
        const activeAddr = localAddrs[defaultIdx];
        setFormData({
          fullName: activeAddr.fullName || localUser.name || "",
          phone: activeAddr.phone || localUser.phone || "",
          address: activeAddr.address || "",
          city: activeAddr.city || "",
          state: activeAddr.state || "",
          pincode: activeAddr.pincode || "",
        });
        setShowNewAddressForm(false);
      } else {
        setFormData(prev => ({
          ...prev,
          fullName: localUser.name || "",
          phone: localUser.phone || ""
        }));
        setShowNewAddressForm(true);
      }
    }

    if (token) {
      fetch(`${API_BASE_URL}/api/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.success && data.user) {
            setUserProfile(data.user);
            localStorage.setItem("user", JSON.stringify(data.user));
            const addrs = data.user.addresses || [];
            setSavedAddresses(addrs);

            if (addrs.length > 0) {
              const defaultIdx = addrs.findIndex(a => a.isDefault) !== -1 ? addrs.findIndex(a => a.isDefault) : 0;
              setSelectedAddressIndex(defaultIdx);
              const activeAddr = addrs[defaultIdx];
              setFormData({
                fullName: activeAddr.fullName || data.user.name || "",
                phone: activeAddr.phone || data.user.phone || "",
                address: activeAddr.address || "",
                city: activeAddr.city || "",
                state: activeAddr.state || "",
                pincode: activeAddr.pincode || "",
              });
              setShowNewAddressForm(false);
            } else {
              setFormData(prev => ({
                ...prev,
                fullName: data.user.name || prev.fullName,
                phone: data.user.phone || prev.phone
              }));
              setShowNewAddressForm(true);
            }
          }
        })
        .catch(err => console.error("Profile fetch error:", err));
    }
  }, []);

  const handleSelectSavedAddress = (index) => {
    setSelectedAddressIndex(index);
    setShowNewAddressForm(false);
    const addr = savedAddresses[index];
    if (addr) {
      setFormData({
        fullName: addr.fullName || userProfile?.name || "",
        phone: addr.phone || "",
        address: addr.address || "",
        city: addr.city || "",
        state: addr.state || "",
        pincode: addr.pincode || "",
      });
    }
  };

  const handleSaveNewAddress = async () => {
    const isFormComplete = Object.values(formData).every((val) => String(val || "").trim() !== "");
    if (!isFormComplete) {
      alert("Please fill all delivery address fields.");
      return;
    }

    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    const newAddrObj = { ...formData, isDefault: true };

    if (token && saveAddressToProfile) {
      try {
        const res = await fetch(`${API_BASE_URL}/api/auth/address`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(newAddrObj)
        });
        const data = await res.json();
        if (data.success && data.addresses) {
          setSavedAddresses(data.addresses);
          setSelectedAddressIndex(data.addresses.length - 1);
          setShowNewAddressForm(false);
          alert("Delivery address saved to your account!");
          return;
        }
      } catch (err) {
        console.error("Save address API error:", err);
      }
    }

    const updated = [...savedAddresses, newAddrObj];
    setSavedAddresses(updated);
    localStorage.setItem("savedAddresses", JSON.stringify(updated));
    setSelectedAddressIndex(updated.length - 1);
    setShowNewAddressForm(false);
  };

  const rawTotalAmount = useMemo(() => {
    return cartItems.reduce(
      (total, item) => total + Number(item.price) * Number(item.quantity),
      0
    );
  }, [cartItems]);

  const couponDiscount = useMemo(() => {
    return appliedCoupon ? Number(appliedCoupon.discount || 0) : 0;
  }, [appliedCoupon]);

  const finalOrderTotal = useMemo(() => {
    const margin = isReselling ? Number(resellerMarginAmount || 0) : 0;
    const upiDiscount = paymentMethod === "UPI" ? 15 : 0;
    return Math.max(0, rawTotalAmount - couponDiscount + margin - upiDiscount);
  }, [rawTotalAmount, couponDiscount, isReselling, resellerMarginAmount, paymentMethod]);

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  // Card Formatters
  const handleCardNumberChange = (e) => {
    let val = e.target.value.replace(/\D/g, "").slice(0, 16);
    let formatted = val.replace(/(.{4})/g, "$1 ").trim();
    setCardData({ ...cardData, number: formatted });
  };

  const handleCardExpiryChange = (e) => {
    let val = e.target.value.replace(/\D/g, "").slice(0, 4);
    if (val.length >= 3) {
      val = val.slice(0, 2) + "/" + val.slice(2);
    }
    setCardData({ ...cardData, expiry: val });
  };

  const handleCardCvvChange = (e) => {
    let val = e.target.value.replace(/\D/g, "").slice(0, 4);
    setCardData({ ...cardData, cvv: val });
  };

  const getCardBrand = (num) => {
    const clean = num.replace(/\D/g, "");
    if (clean.startsWith("4")) return "Visa 💳";
    if (/^5[1-5]/.test(clean) || /^2[2-7]/.test(clean)) return "Mastercard 💳";
    if (/^60|^65|^508/.test(clean)) return "RuPay 💳";
    if (/^3[47]/.test(clean)) return "American Express 💳";
    return "Debit / Credit Card 💳";
  };

  const handleVerifyUpi = () => {
    if (!upiId.trim() || !upiId.includes("@")) {
      alert("Please enter a valid UPI ID / VPA (e.g. yourname@okicici)");
      return;
    }
    setUpiVerified(true);
  };

  const handleVerifyUtr = () => {
    const clean = utrNumber.replace(/\D/g, "");
    if (clean.length !== 12) {
      alert("Please enter a valid 12-digit UPI UTR / Transaction Reference Number.");
      return;
    }
    setIsVerifyingUtr(true);
    setTimeout(() => {
      setIsVerifyingUtr(false);
      setUtrVerified(true);
    }, 1000);
  };

  const handleConfirmUpiPayment = async () => {
    setIsCheckingUpiStatus(true);
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/api/orders/verify-upi-status`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: finalOrderTotal,
          upiId: MERCHANT_PAYMENT_CONFIG.merchantUpiId,
          utrNumber: utrNumber || ""
        })
      });

      const data = await response.json();
      setIsCheckingUpiStatus(false);

      if (!response.ok || !data.verified) {
        alert(data.message || "❌ Payment Verification Failed: Payment not received on merchant bank account yet. Please scan the QR code in your UPI app and complete payment first.");
        // Stay on QR modal, do NOT proceed!
        return;
      }

      const autoTxnId = data.transactionId || `UPI${Date.now()}${Math.floor(1000 + Math.random() * 9000)}`;

      await finalizeOrderSubmission("UPI", "PAID", {
        upiId: MERCHANT_PAYMENT_CONFIG.merchantUpiId,
        utrNumber: autoTxnId,
        paymentTimestamp: new Date().toISOString()
      });
    } catch (err) {
      setIsCheckingUpiStatus(false);
      alert("❌ Payment verification connection failed. Please ensure the backend server is running.");
    }
  };

  const placeOrder = async (event) => {
    event.preventDefault();

    if (cartItems.length === 0) {
      alert("Your cart is empty. Please add items from catalogue first.");
      navigate("/catalogue");
      return;
    }

    const isFormComplete = Object.values(formData).every((value) => value.trim() !== "");
    if (!isFormComplete) {
      alert("Please fill all required delivery address fields.");
      return;
    }

    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) {
      alert("Please login before placing an order.");
      navigate("/login", { state: { from: { pathname: "/checkout" } } });
      return;
    }

    if (paymentMethod === "CARD") {
      const cleanNum = cardData.number.replace(/\D/g, "");
      if (cleanNum.length < 15 || !cardData.name.trim() || !cardData.expiry || !cardData.cvv) {
        alert("Please enter complete Debit/Credit Card details (16-digit Card Number, Expiry MM/YY, CVV, Cardholder Name).");
        return;
      }
      setShowCardOtpModal(true);
      return;
    }

    if (paymentMethod === "UPI") {
      setShowUpiModal(true);
      return;
    }

    await finalizeOrderSubmission("COD", "PENDING", {});
  };

  const handleVerifyCardOtpAndPay = async () => {
    if (!cardOtp || cardOtp.length < 4) {
      alert("Please enter the 6-digit Bank SMS OTP sent to your registered mobile.");
      return;
    }

    setIsVerifyingOtp(true);
    setTimeout(async () => {
      setIsVerifyingOtp(false);
      setShowCardOtpModal(false);
      const last4 = cardData.number.replace(/\D/g, "").slice(-4) || "8892";
      const brand = getCardBrand(cardData.number);
      await finalizeOrderSubmission("CARD", "PAID", {
        cardLast4: last4,
        cardBrand: brand,
        bankName: "Verified Gateway Bank"
      });
    }, 1500);
  };

  const finalizeOrderSubmission = async (method = paymentMethod, status = "PAID", details = {}) => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");

    const txnId = status === "PAID" ? `TXN_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}` : "";

    const orderData = {
      items: cartItems.map((item) => ({
        product: item._id,
        name: item.name,
        price: Number(item.price),
        quantity: Number(item.quantity),
        image: item.images && item.images.length > 0 ? item.images[0] : null,
        icon: item.icon || "🛍️",
        seller: item.seller || "",
        createdBy: item.createdBy?._id || item.createdBy || null,
      })),

      shippingAddress: {
        fullName: formData.fullName,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
      },

      totalAmount: finalOrderTotal,
      isResellerOrder: isReselling,
      resellerProfit: isReselling ? Number(resellerMarginAmount) : 0,
      paymentMethod: method,
      paymentStatus: status,
      transactionId: txnId,
      paymentDetails: {
        upiId: upiId || (method === "UPI" ? "instant.qr@shopsphere" : ""),
        ...details
      }
    };

    try {
      setIsPlacingOrder(true);

      const response = await fetch(`${API_BASE_URL}/api/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orderData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to place order");
      }

      localStorage.setItem("latestOrder", JSON.stringify(data.order));
      localStorage.removeItem("cart");
      localStorage.removeItem("appliedCoupon");

      // Maintain active user login session
      if (token) {
        localStorage.setItem("token", token);
        sessionStorage.setItem("token", token);
      }
      const activeUser = data.order?.user || userProfile || JSON.parse(localStorage.getItem("user"));
      if (activeUser) {
        localStorage.setItem("user", JSON.stringify(activeUser));
        sessionStorage.setItem("user", JSON.stringify(activeUser));
      }

      setCartItems([]);
      setShowUpiModal(false);
      setShowCardOtpModal(false);
      navigate("/order-success");
    } catch (error) {
      console.error("Order Placement Error:", error);
      alert(error.message || "Unable to place order. Please try again.");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  // Auto-detect UPI QR Payment Completion Listener
  useEffect(() => {
    let timer;
    if (showUpiModal && !isPlacingOrder && !isCheckingUpiStatus) {
      timer = setTimeout(() => {
        handleConfirmUpiPayment();
      }, 5000);
    }
    return () => clearTimeout(timer);
  }, [showUpiModal, isPlacingOrder, isCheckingUpiStatus]);

  return (
    <div className="checkout-page-wrapper">
      {/* ── Top Header Navigation ── */}
      <header className="chk-header-nav">
        <div className="chk-header-container">
          <Link to="/" className="chk-brand-logo">
            <span>🛍️</span>
            <span>ShopSphere</span>
          </Link>

          {/* Step Progress Tracker */}
          <div className="chk-step-tracker">
            <div className="chk-step-item completed">
              <span className="chk-step-badge">✓</span>
              <span>Shopping Bag</span>
            </div>
            <div className="chk-step-divider active" />
            <div className="chk-step-item active">
              <span className="chk-step-badge">2</span>
              <span>Address &amp; Payment</span>
            </div>
            <div className="chk-step-divider" />
            <div className="chk-step-item">
              <span className="chk-step-badge">3</span>
              <span>Order Placed</span>
            </div>
          </div>

          <Link to="/cart" className="chk-back-link">
            ← Back to Cart
          </Link>
        </div>
      </header>

      {/* ── 3D Secure Card OTP Verification Modal ── */}
      {showCardOtpModal && (
        <div className="chk-modal-backdrop">
          <div className="chk-modal-card" style={{ maxWidth: "440px" }}>
            <div style={{ textAlign: "center", marginBottom: "16px" }}>
              <span style={{ fontSize: "36px" }}>🔒</span>
              <h2 className="chk-modal-title" style={{ marginTop: "8px" }}>
                3D Secure Bank Gateway
              </h2>
              <p className="chk-modal-sub">
                An SMS OTP has been sent to your bank registered mobile number for authorization.
              </p>
            </div>

            <div style={{ background: "#f8fafc", padding: "14px", borderRadius: "12px", border: "1px solid #e2e8f0", marginBottom: "20px", fontSize: "13px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                <span style={{ color: "#64748b" }}>Merchant:</span>
                <strong>ShopSphere Marketplace</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                <span style={{ color: "#64748b" }}>Amount:</span>
                <strong style={{ color: "#9333ea", fontSize: "15px" }}>₹{finalOrderTotal.toLocaleString("en-IN")}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#64748b" }}>Card Number:</span>
                <strong style={{ fontFamily: "monospace" }}>•••• {cardData.number.replace(/\D/g, "").slice(-4) || "8892"}</strong>
              </div>
            </div>

            <div className="chk-field-group" style={{ marginBottom: "16px" }}>
              <label className="chk-label">Enter 6-Digit Bank SMS OTP</label>
              <input
                type="text"
                maxLength={6}
                className="chk-input"
                style={{ textAlign: "center", fontSize: "20px", letterSpacing: "8px", fontWeight: "900" }}
                value={cardOtp}
                onChange={(e) => setCardOtp(e.target.value.replace(/\D/g, ""))}
                placeholder="542910"
              />
            </div>

            <button
              type="button"
              onClick={() => setCardOtp("542910")}
              style={{ width: "100%", background: "#f1f5f9", color: "#475569", border: "1px solid #cbd5e1", padding: "8px", borderRadius: "8px", fontSize: "12px", fontWeight: 700, cursor: "pointer", marginBottom: "16px" }}
            >
              ⚡ Auto-Fill Demo OTP (542910)
            </button>

            <button
              type="button"
              className="chk-modal-confirm-btn"
              onClick={handleVerifyCardOtpAndPay}
              disabled={isVerifyingOtp || isPlacingOrder}
            >
              {isVerifyingOtp ? "Verifying OTP & Authorizing..." : `Authorize Payment • ₹${finalOrderTotal.toLocaleString("en-IN")}`}
            </button>

            <button
              type="button"
              className="chk-modal-cancel-btn"
              onClick={() => setShowCardOtpModal(false)}
            >
              Cancel Payment
            </button>
          </div>
        </div>
      )}

      {/* ── High-Trust Instant UPI Modal Overlay ── */}
      {showUpiModal && (
        <div className="chk-modal-backdrop">
          <div className="chk-modal-card" style={{ maxWidth: "480px" }}>
            <h2 className="chk-modal-title">Pay via Instant UPI QR 📲</h2>
            <p className="chk-modal-sub">
              Scan QR code using your UPI app to pay <b>₹{finalOrderTotal.toLocaleString("en-IN")}</b>
            </p>

            {/* Live Auto-Fetching Payment Status Box */}
            <div style={{ background: isCheckingUpiStatus ? "#fef3c7" : "#f0fdf4", border: `1.5px solid ${isCheckingUpiStatus ? "#fde68a" : "#bbf7d0"}`, padding: "12px 16px", borderRadius: "14px", marginBottom: "16px", textAlign: "center" }}>
              <div style={{ fontSize: "13px", fontWeight: 800, color: isCheckingUpiStatus ? "#b45309" : "#166534", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
                <span style={{ display: "inline-block", width: "10px", height: "10px", borderRadius: "50%", background: isCheckingUpiStatus ? "#f59e0b" : "#22c55e", boxShadow: "0 0 0 4px rgba(34,197,94,0.2)" }} />
                <span>{isCheckingUpiStatus ? "📡 Contacting NPCI Banking Gateway & Verifying Payment..." : "📡 Listening for UPI Payment... Scan QR Code"}</span>
              </div>
              <small style={{ fontSize: "11px", color: "#64748b", marginTop: "4px", display: "block" }}>
                {isCheckingUpiStatus ? "Please wait a moment while we register your payment." : "Modal stays on QR code until payment is received. Will proceed to next page automatically once done."}
              </small>
            </div>

            {/* Official Store UPI ID Badge Box */}
            <div style={{ background: "#fdf2f8", border: "1.5px solid #fbcfe8", padding: "12px 16px", borderRadius: "14px", marginBottom: "16px", textAlign: "center" }}>
              <div style={{ fontSize: "11px", fontWeight: 800, color: "#9d174d", textTransform: "uppercase", letterSpacing: "0.5px" }}>Official Store Merchant UPI ID</div>
              <div style={{ fontSize: "18px", fontWeight: 900, color: "#be185d", fontFamily: "monospace", margin: "6px 0", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
                <span>{MERCHANT_PAYMENT_CONFIG.merchantUpiId}</span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(MERCHANT_PAYMENT_CONFIG.merchantUpiId);
                    alert(`Merchant UPI ID Copied: ${MERCHANT_PAYMENT_CONFIG.merchantUpiId}`);
                  }}
                  style={{ background: "#ffffff", border: "1px solid #f472b6", padding: "3px 10px", borderRadius: "6px", fontSize: "11px", color: "#be185d", fontWeight: 800, cursor: "pointer", boxShadow: "0 2px 6px rgba(190,24,93,0.15)" }}
                >
                  📋 Copy
                </button>
              </div>
              <small style={{ fontSize: "11px", color: "#9d174d", fontWeight: 600 }}>Pay via Google Pay, PhonePe, Paytm, BHIM</small>
            </div>

            {/* Official QR Code Box */}
            <div style={{ background: "#ffffff", border: "2px dashed #d8b4fe", padding: "16px", borderRadius: "16px", textAlign: "center", marginBottom: "16px" }}>
              <div style={{ display: "inline-block", background: "#ffffff", padding: "10px", borderRadius: "12px", boxShadow: "0 4px 14px rgba(0,0,0,0.08)", border: "1px solid #f3e8ff" }}>
                <img
                  src={MERCHANT_PAYMENT_CONFIG.customQrImageUrl || `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(`upi://pay?pa=${MERCHANT_PAYMENT_CONFIG.merchantUpiId}&pn=${encodeURIComponent(MERCHANT_PAYMENT_CONFIG.merchantName)}&am=${finalOrderTotal}&cu=INR&tn=ShopSphereOrder`)}`}
                  alt="Scan UPI QR Code to Pay"
                  style={{ width: "190px", height: "190px", display: "block" }}
                />
              </div>
              <div style={{ fontSize: "13px", fontWeight: 800, color: "#7e22ce", marginTop: "10px" }}>
                Scan with Google Pay, PhonePe, Paytm or BHIM
              </div>
              <small style={{ fontSize: "11px", color: "#64748b" }}>Merchant: {MERCHANT_PAYMENT_CONFIG.merchantUpiId} • Amount: ₹{finalOrderTotal.toLocaleString("en-IN")}</small>
            </div>

            {/* Direct Mobile App Quick Launch Buttons */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px", marginBottom: "16px" }}>
              <a
                href={`upi://pay?pa=${MERCHANT_PAYMENT_CONFIG.merchantUpiId}&pn=${encodeURIComponent(MERCHANT_PAYMENT_CONFIG.merchantName)}&am=${finalOrderTotal}&cu=INR`}
                style={{ display: "block", textAlign: "center", background: "#f1f5f9", border: "1px solid #cbd5e1", padding: "8px 4px", borderRadius: "8px", color: "#0f172a", textDecoration: "none", fontSize: "11px", fontWeight: 800 }}
              >
                🔵 GPay
              </a>
              <a
                href={`upi://pay?pa=${MERCHANT_PAYMENT_CONFIG.merchantUpiId}&pn=${encodeURIComponent(MERCHANT_PAYMENT_CONFIG.merchantName)}&am=${finalOrderTotal}&cu=INR`}
                style={{ display: "block", textAlign: "center", background: "#f1f5f9", border: "1px solid #cbd5e1", padding: "8px 4px", borderRadius: "8px", color: "#0f172a", textDecoration: "none", fontSize: "11px", fontWeight: 800 }}
              >
                🟣 PhonePe
              </a>
              <a
                href={`upi://pay?pa=${MERCHANT_PAYMENT_CONFIG.merchantUpiId}&pn=${encodeURIComponent(MERCHANT_PAYMENT_CONFIG.merchantName)}&am=${finalOrderTotal}&cu=INR`}
                style={{ display: "block", textAlign: "center", background: "#f1f5f9", border: "1px solid #cbd5e1", padding: "8px 4px", borderRadius: "8px", color: "#0f172a", textDecoration: "none", fontSize: "11px", fontWeight: 800 }}
              >
                🟦 Paytm
              </a>
              <a
                href={`upi://pay?pa=${MERCHANT_PAYMENT_CONFIG.merchantUpiId}&pn=${encodeURIComponent(MERCHANT_PAYMENT_CONFIG.merchantName)}&am=${finalOrderTotal}&cu=INR`}
                style={{ display: "block", textAlign: "center", background: "#f1f5f9", border: "1px solid #cbd5e1", padding: "8px 4px", borderRadius: "8px", color: "#0f172a", textDecoration: "none", fontSize: "11px", fontWeight: 800 }}
              >
                🟠 BHIM
              </a>
            </div>

            {/* Primary Action Button: Confirm Payment & Auto-Proceed to Next Page */}
            <button
              type="button"
              className="chk-modal-confirm-btn"
              onClick={handleConfirmUpiPayment}
              disabled={isCheckingUpiStatus || isPlacingOrder}
            >
              {isCheckingUpiStatus || isPlacingOrder
                ? "📡 Auto-Fetching NPCI Payment & Placing Order..."
                : `⚡ I Have Paid on App • Confirm & Proceed to Next Page (₹${finalOrderTotal.toLocaleString("en-IN")}) ✓`}
            </button>

            <button
              type="button"
              className="chk-modal-cancel-btn"
              onClick={() => setShowUpiModal(false)}
            >
              Cancel Payment
            </button>
          </div>
        </div>
      )}

      {/* ── Main Content Container ── */}
      <main className="chk-main-container">
        <div className="chk-page-title-row">
          <span className="chk-eyebrow">FINAL CHECKOUT STEP</span>
          <h1 className="chk-page-title">Delivery &amp; Payment Details</h1>
        </div>

        <div className="chk-grid">
          {/* Left Column: Delivery Form & Payment Selection */}
          <form className="chk-form-column" onSubmit={placeOrder}>
            {/* Address Card */}
            <div className="chk-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <h2 className="chk-card-title" style={{ margin: 0 }}>
                  <span>📍</span> 1. Delivery Shipping Address
                </h2>
                {userProfile && (
                  <span style={{ fontSize: "12px", background: "#f0fdf4", color: "#166534", border: "1px solid #bbf7d0", padding: "4px 10px", borderRadius: "8px", fontWeight: 800 }}>
                    👤 {userProfile.name} ({userProfile.email})
                  </span>
                )}
              </div>

              {/* ── Saved Delivery Address Selector Cards ── */}
              {savedAddresses.length > 0 && (
                <div style={{ marginBottom: "20px" }}>
                  <div style={{ fontSize: "13px", fontWeight: 800, color: "#475569", marginBottom: "10px" }}>
                    Select a Saved Delivery Address (1-Click Selection):
                  </div>

                  <div className="chk-saved-addresses-grid">
                    {savedAddresses.map((addr, idx) => {
                      const isSelected = selectedAddressIndex === idx && !showNewAddressForm;
                      return (
                        <div
                          key={idx}
                          className={`chk-address-card ${isSelected ? "selected" : ""}`}
                          onClick={() => handleSelectSavedAddress(idx)}
                        >
                          <div className="chk-address-header">
                            <span className="chk-address-name">{addr.fullName || userProfile?.name}</span>
                            {addr.isDefault && <span className="chk-address-badge">Default</span>}
                            {isSelected && <span style={{ color: "#9333ea", fontWeight: 900, fontSize: "12px" }}>✓ Selected</span>}
                          </div>
                          <div className="chk-address-phone">📞 {addr.phone}</div>
                          <div className="chk-address-text">
                            {addr.address}<br />
                            <strong>{addr.city}, {addr.state} - {addr.pincode}</strong>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    className="chk-add-address-toggle"
                    onClick={() => {
                      setShowNewAddressForm(!showNewAddressForm);
                      if (!showNewAddressForm) {
                        setSelectedAddressIndex(null);
                        setFormData({
                          fullName: userProfile?.name || "",
                          phone: userProfile?.phone || "",
                          address: "",
                          city: "",
                          state: "",
                          pincode: "",
                        });
                      }
                    }}
                  >
                    {showNewAddressForm ? "✕ Cancel New Address" : "➕ Add New Delivery Address"}
                  </button>
                </div>
              )}

              {/* ── Address Input Form (Shown if no saved address or when adding new) ── */}
              {(savedAddresses.length === 0 || showNewAddressForm) && (
                <div style={{ background: "#f8fafc", padding: "18px", borderRadius: "16px", border: "1px solid #e2e8f0", marginBottom: "16px" }}>
                  <div style={{ fontSize: "14px", fontWeight: 800, color: "#9333ea", marginBottom: "14px" }}>
                    {savedAddresses.length > 0 ? "➕ Add & Save New Delivery Address:" : "📍 Enter Delivery Address Details:"}
                  </div>

                  <div className="chk-form-grid">
                    <div className="chk-field-group">
                      <label className="chk-label">
                        Full Name <span className="chk-required">*</span>
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        className="chk-input"
                        value={formData.fullName}
                        onChange={handleChange}
                        placeholder="Enter full name"
                        required
                      />
                    </div>

                    <div className="chk-field-group">
                      <label className="chk-label">
                        Mobile Phone Number <span className="chk-required">*</span>
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        className="chk-input"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="10-digit mobile number"
                        required
                      />
                    </div>

                    <div className="chk-field-group chk-form-grid full-width">
                      <label className="chk-label">
                        Street Address &amp; House No. <span className="chk-required">*</span>
                      </label>
                      <input
                        type="text"
                        name="address"
                        className="chk-input"
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="Flat/House No., Colony, Street, Landmark"
                        required
                      />
                    </div>

                    <div className="chk-field-group">
                      <label className="chk-label">
                        City <span className="chk-required">*</span>
                      </label>
                      <input
                        type="text"
                        name="city"
                        className="chk-input"
                        value={formData.city}
                        onChange={handleChange}
                        placeholder="City / Town"
                        required
                      />
                    </div>

                    <div className="chk-field-group">
                      <label className="chk-label">
                        State <span className="chk-required">*</span>
                      </label>
                      <input
                        type="text"
                        name="state"
                        className="chk-input"
                        value={formData.state}
                        onChange={handleChange}
                        placeholder="State"
                        required
                      />
                    </div>

                    <div className="chk-field-group">
                      <label className="chk-label">
                        Pincode <span className="chk-required">*</span>
                      </label>
                      <input
                        type="text"
                        name="pincode"
                        className="chk-input"
                        value={formData.pincode}
                        onChange={handleChange}
                        placeholder="6-digit pincode"
                        required
                      />
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "14px", flexWrap: "wrap", gap: "10px" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", fontWeight: 700, color: "#475569", cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={saveAddressToProfile}
                        onChange={(e) => setSaveAddressToProfile(e.target.checked)}
                      />
                      Save this address to my account for 1-click checkout next time
                    </label>

                    {savedAddresses.length > 0 && (
                      <button
                        type="button"
                        onClick={handleSaveNewAddress}
                        style={{ background: "#9333ea", color: "#fff", border: "none", padding: "8px 18px", borderRadius: "8px", fontWeight: 800, cursor: "pointer" }}
                      >
                        💾 Save &amp; Select Address
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Payment Method Card */}
            <div className="chk-card">
              <h2 className="chk-card-title">
                <span>💳</span> 2. Select Payment Method
              </h2>

              <div className="chk-payment-options">
                <label
                  className={`chk-payment-card ${paymentMethod === "COD" ? "selected" : ""}`}
                >
                  <input
                    type="radio"
                    name="payment"
                    className="chk-payment-radio"
                    value="COD"
                    checked={paymentMethod === "COD"}
                    onChange={() => setPaymentMethod("COD")}
                  />
                  <div className="chk-payment-info">
                    <div className="chk-payment-title">
                      💵 Cash on Delivery (COD)
                    </div>
                    <p className="chk-payment-sub">
                      Pay cash at doorstep when your parcel arrives. No prepayment needed!
                    </p>
                  </div>
                </label>

                <label
                  className={`chk-payment-card ${paymentMethod === "UPI" ? "selected" : ""}`}
                >
                  <input
                    type="radio"
                    name="payment"
                    className="chk-payment-radio"
                    value="UPI"
                    checked={paymentMethod === "UPI"}
                    onChange={() => setPaymentMethod("UPI")}
                  />
                  <div className="chk-payment-info">
                    <div className="chk-payment-title">
                      ⚡ Instant UPI / QR (Google Pay, PhonePe, Paytm)
                      <span className="chk-payment-chip">Extra ₹15 OFF</span>
                    </div>
                    <p className="chk-payment-sub">
                      Fast 1-scan payment. Instant verification &amp; priority dispatch!
                    </p>
                  </div>
                </label>

                <label
                  className={`chk-payment-card ${paymentMethod === "CARD" ? "selected" : ""}`}
                >
                  <input
                    type="radio"
                    name="payment"
                    className="chk-payment-radio"
                    value="CARD"
                    checked={paymentMethod === "CARD"}
                    onChange={() => setPaymentMethod("CARD")}
                  />
                  <div className="chk-payment-info">
                    <div className="chk-payment-title">
                      💳 Credit / Debit Card (Visa, Mastercard, RuPay, Amex)
                    </div>
                    <p className="chk-payment-sub">
                      100% Encrypted bank transaction via 3D Secure SSL Gateway.
                    </p>

                    {paymentMethod === "CARD" && (
                      <div style={{ marginTop: "14px", padding: "16px", background: "#ffffff", borderRadius: "12px", border: "1px solid #cbd5e1", textAlign: "left" }} onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                          <span style={{ fontSize: "13px", fontWeight: 800, color: "#9333ea" }}>
                            {getCardBrand(cardData.number)}
                          </span>
                          <span style={{ fontSize: "11px", color: "#166534", fontWeight: 800, background: "#f0fdf4", padding: "2px 8px", borderRadius: "6px" }}>
                            🔒 256-Bit SSL Encrypted
                          </span>
                        </div>

                        <div className="chk-field-group" style={{ marginBottom: "12px" }}>
                          <label className="chk-label">Card Number <span className="chk-required">*</span></label>
                          <input
                            type="text"
                            className="chk-input"
                            placeholder="4532 8900 1234 5678"
                            value={cardData.number}
                            onChange={handleCardNumberChange}
                            required
                          />
                        </div>

                        <div className="chk-field-group" style={{ marginBottom: "12px" }}>
                          <label className="chk-label">Cardholder Name <span className="chk-required">*</span></label>
                          <input
                            type="text"
                            className="chk-input"
                            placeholder="Name as printed on card"
                            value={cardData.name}
                            onChange={(e) => setCardData({ ...cardData, name: e.target.value })}
                            required
                          />
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                          <div className="chk-field-group">
                            <label className="chk-label">Expiry Date <span className="chk-required">*</span></label>
                            <input
                              type="text"
                              className="chk-input"
                              placeholder="MM/YY"
                              value={cardData.expiry}
                              onChange={handleCardExpiryChange}
                              required
                            />
                          </div>

                          <div className="chk-field-group">
                            <label className="chk-label">CVV / CVC <span className="chk-required">*</span></label>
                            <input
                              type="password"
                              maxLength={4}
                              className="chk-input"
                              placeholder="•••"
                              value={cardData.cvv}
                              onChange={handleCardCvvChange}
                              required
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </label>
              </div>
            </div>

            {/* Place Order CTA Button */}
            <button
              type="submit"
              className="chk-submit-btn"
              disabled={isPlacingOrder}
            >
              {isPlacingOrder
                ? "Placing Your Order..."
                : `Place Order • ₹${finalOrderTotal.toLocaleString("en-IN")}`}
            </button>
          </form>

          {/* Right Column: Order Summary Sidebar */}
          <aside className="chk-summary-sidebar">
            <div className="chk-summary-card">
              <h3 className="chk-summary-title">
                Order Summary ({cartItems.length} {cartItems.length === 1 ? "Item" : "Items"})
              </h3>

              {/* Items List */}
              <div className="chk-items-list">
                {cartItems.map((item) => (
                  <div key={item._id} className="chk-item-row">
                    {item.images && item.images.length > 0 ? (
                      <img src={item.images[0]} alt={item.name} className="chk-item-thumb" />
                    ) : (
                      <div className="chk-item-thumb" style={{ display: "grid", placeItems: "center" }}>
                        🛍️
                      </div>
                    )}
                    <div className="chk-item-details">
                      <span className="chk-item-name">{item.name}</span>
                      <span className="chk-item-qty">Qty: {item.quantity}</span>
                    </div>
                    <span className="chk-item-price">
                      ₹{(Number(item.price) * Number(item.quantity)).toLocaleString("en-IN")}
                    </span>
                  </div>
                ))}
              </div>

              <hr className="chk-summary-divider" />

              {/* Price Calculation Rows */}
              <div className="chk-summary-row">
                <span>Items Subtotal</span>
                <strong>₹{rawTotalAmount.toLocaleString("en-IN")}</strong>
              </div>

              {appliedCoupon && couponDiscount > 0 && (
                <div className="chk-summary-row" style={{ color: "#10b981", fontWeight: 700 }}>
                  <span>Promo Coupon ({appliedCoupon.code})</span>
                  <span>- ₹{couponDiscount.toLocaleString("en-IN")}</span>
                </div>
              )}

              {isReselling && Number(resellerMarginAmount) > 0 && (
                <div className="chk-summary-row" style={{ color: "#9f2089", fontWeight: 700 }}>
                  <span>Reseller Profit Added</span>
                  <span>+ ₹{Number(resellerMarginAmount).toLocaleString("en-IN")}</span>
                </div>
              )}

              {paymentMethod === "UPI" && (
                <div className="chk-summary-row" style={{ color: "#10b981", fontWeight: 700 }}>
                  <span>UPI Instant Discount</span>
                  <span>- ₹15</span>
                </div>
              )}

              <div className="chk-summary-row">
                <span>Delivery Charge</span>
                <strong style={{ color: "#10b981" }}>FREE</strong>
              </div>

              <hr className="chk-summary-divider" />

              <div className="chk-total-row">
                <span className="chk-total-label">Total Amount</span>
                <span className="chk-total-amount">
                  ₹{finalOrderTotal.toLocaleString("en-IN")}
                </span>
              </div>

              {/* Trust Box */}
              <div className="chk-trust-box">
                <div className="chk-trust-item">
                  <span>🛡️</span> 100% Purchase Protection
                </div>
                <div className="chk-trust-item">
                  <span>🚚</span> Guaranteed Direct Factory Delivery
                </div>
                <div className="chk-trust-item">
                  <span>🔄</span> 7-Day Easy Return / Exchange
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

export default Checkout;