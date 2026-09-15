import { API_BASE_URL } from "../config/apiConfig";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

function ResellerDashboard() {
  const [bankDetails, setBankDetails] = useState({
    accountName: "",
    accountNumber: "",
    ifscCode: "",
    upiId: "",
  });
  const [savedBank, setSavedBank] = useState(false);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetchTopProducts();
  }, []);

  const fetchTopProducts = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/products`);
      const data = await res.json();
      if (data.success) setProducts(data.products.slice(0, 4));
    } catch (e) {
      console.log(e);
    }
  };

  const handleBankSubmit = (e) => {
    e.preventDefault();
    setSavedBank(true);
    setTimeout(() => setSavedBank(false), 3000);
  };

  const handleShareCatalog = (product) => {
    const text = `🔥 Check out *${product.name}* at factory price!\n⭐ Rating: ${product.rating || 4.5} ★\n🚚 Free Delivery & Cash on Delivery Available!\nMessage me to order directly!`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  return (
    <div style={{ background: "#f8f9fa", minHeight: "100vh", paddingBottom: "60px" }}>
      <header className="catalogue-header">
        <Link to="/" className="catalogue-logo">
          <span>🛍️</span>
          ShopSphere
        </Link>

        <span className="reseller-badge-pill" style={{ fontSize: "13px", padding: "6px 12px" }}>
          💸 Reseller Earnings Hub
        </span>

        <Link to="/" className="back-home">
          ← Home
        </Link>
      </header>

      <main className="reseller-dashboard-page">
        {/* Banner header */}
        <div
          style={{
            background: "linear-gradient(135deg, #9f2089 0%, #f43397 100%)",
            color: "white",
            padding: "30px",
            borderRadius: "20px",
            marginBottom: "30px",
            boxShadow: "0 8px 24px rgba(244, 51, 151, 0.25)",
          }}
        >
          <h1 style={{ margin: "0 0 10px 0", fontSize: "32px", fontWeight: 900 }}>
            Reseller Earnings & Margin Hub
          </h1>
          <p style={{ margin: 0, fontSize: "16px", opacity: 0.9 }}>
            Track your profit margins, manage bank payout accounts, and share catalog items to earn daily!
          </p>
        </div>

        {/* Stats Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "20px",
            marginBottom: "40px",
          }}
        >
          <div className="reseller-stat-card">
            <span style={{ fontSize: "32px" }}>💰</span>
            <p style={{ margin: "6px 0 0 0", color: "#666", fontSize: "13px", fontWeight: 700 }}>
              TOTAL PROFIT EARNED
            </p>
            <h2>₹4,850</h2>
            <small style={{ color: "#038d63", fontWeight: 700 }}>+₹650 this week</small>
          </div>

          <div className="reseller-stat-card">
            <span style={{ fontSize: "32px" }}>📦</span>
            <p style={{ margin: "6px 0 0 0", color: "#666", fontSize: "13px", fontWeight: 700 }}>
              DELIVERED ORDERS
            </p>
            <h2 style={{ color: "#111" }}>18</h2>
            <small style={{ color: "#666" }}>100% On-time Delivery</small>
          </div>

          <div className="reseller-stat-card">
            <span style={{ fontSize: "32px" }}>🏦</span>
            <p style={{ margin: "6px 0 0 0", color: "#666", fontSize: "13px", fontWeight: 700 }}>
              PENDING BANK PAYOUT
            </p>
            <h2 style={{ color: "#038d63" }}>₹950</h2>
            <small style={{ color: "#666" }}>Transfers every Tuesday</small>
          </div>
        </div>

        <div className="catalogue-layout">
          {/* Bank Account Setup Form */}
          <div className="filter-panel" style={{ width: "100%" }}>
            <h2 style={{ margin: "0 0 14px 0", borderBottom: "1px solid #eee", paddingBottom: "10px" }}>
              🏦 Bank Payout Account Setup
            </h2>
            <p style={{ fontSize: "13px", color: "#666", marginBottom: "20px" }}>
              Your reseller margins are directly transferred to your bank account or UPI ID on every delivered customer order.
            </p>

            <form onSubmit={handleBankSubmit}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "20px" }}>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: 700, display: "block", marginBottom: "4px" }}>
                    Account Holder Name
                  </label>
                  <input
                    type="text"
                    value={bankDetails.accountName}
                    onChange={(e) => setBankDetails({ ...bankDetails, accountName: e.target.value })}
                    placeholder="As per bank passbook"
                    required
                    style={{ width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: "6px" }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: "12px", fontWeight: 700, display: "block", marginBottom: "4px" }}>
                    UPI ID (Google Pay/PhonePe)
                  </label>
                  <input
                    type="text"
                    value={bankDetails.upiId}
                    onChange={(e) => setBankDetails({ ...bankDetails, upiId: e.target.value })}
                    placeholder="e.g. mobile@upi"
                    required
                    style={{ width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: "6px" }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: "12px", fontWeight: 700, display: "block", marginBottom: "4px" }}>
                    Bank Account Number
                  </label>
                  <input
                    type="text"
                    value={bankDetails.accountNumber}
                    onChange={(e) => setBankDetails({ ...bankDetails, accountNumber: e.target.value })}
                    placeholder="11-16 digit account number"
                    style={{ width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: "6px" }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: "12px", fontWeight: 700, display: "block", marginBottom: "4px" }}>
                    IFSC Code
                  </label>
                  <input
                    type="text"
                    value={bankDetails.ifscCode}
                    onChange={(e) => setBankDetails({ ...bankDetails, ifscCode: e.target.value })}
                    placeholder="e.g. SBIN0001234"
                    style={{ width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: "6px" }}
                  />
                </div>
              </div>

              <button
                type="submit"
                style={{
                  background: "#f43397",
                  color: "white",
                  border: "none",
                  padding: "12px 24px",
                  borderRadius: "8px",
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                Save Bank Details ✓
              </button>

              {savedBank && (
                <p style={{ color: "#038d63", fontWeight: 800, fontSize: "13px", marginTop: "10px" }}>
                  ✓ Bank account updated successfully!
                </p>
              )}
            </form>
          </div>

          {/* Top Selling Products to Share */}
          <aside>
            <div
              style={{
                background: "white",
                padding: "20px",
                borderRadius: "14px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                border: "1px solid #eee",
              }}
            >
              <h3 style={{ margin: "0 0 16px 0", fontSize: "16px", borderBottom: "1px solid #eee", paddingBottom: "10px" }}>
                🔥 Top Margin Products to Share
              </h3>

              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                {products.map((item) => (
                  <div key={item._id} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div
                      style={{
                        width: "50px",
                        height: "50px",
                        borderRadius: "8px",
                        overflow: "hidden",
                        background: "#f8f9fa",
                      }}
                    >
                      {item.images && item.images.length > 0 ? (
                        <img src={item.images[0]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <span style={{ fontSize: "24px" }}>{item.icon}</span>
                      )}
                    </div>

                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: "0 0 2px 0", fontSize: "13px" }}>{item.name}</h4>
                      <small style={{ color: "#038d63", fontWeight: 800 }}>Factory: ₹{item.price}</small>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleShareCatalog(item)}
                      style={{
                        background: "#25d366",
                        color: "white",
                        border: "none",
                        padding: "6px 10px",
                        borderRadius: "6px",
                        fontSize: "12px",
                        fontWeight: 800,
                        cursor: "pointer",
                      }}
                    >
                      📲 Share
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

export default ResellerDashboard;
