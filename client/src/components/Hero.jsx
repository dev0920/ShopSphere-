import { Link } from "react-router-dom";

function Hero() {
  return (
    <section className="hero-section">
      <div className="hero-container">
        <div className="hero-content">
          <div className="hero-badge-tag">
            <span>🔥</span> #1 Social E-Commerce & Reselling Platform
          </div>

          <h1>
            Lowest Prices & <span>Zero Investment Reselling</span>
          </h1>

          <p>
            Shop top quality Sarees, Kurtis, Smartwatches, Beauty products at factory prices or start your own zero-investment reselling business with WhatsApp sharing!
          </p>

          <div className="hero-cta-group">
            <Link to="/catalogue" className="hero-primary-btn">
              Explore Products →
            </Link>

            <Link to="/reseller-hub" className="hero-secondary-btn">
              Start Reselling & Earn 💰
            </Link>
          </div>

          <div className="hero-features-list">
            <span>✅ Cash on Delivery</span>
            <span>✅ 7-Day Easy Returns</span>
            <span>✅ Free Shipping</span>
          </div>
        </div>

        <div className="hero-banner-card">
          <div style={{ position: "relative" }}>
            <img
              src="https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=700&auto=format&fit=crop"
              alt="Festive Fashion Collection"
            />
            <div
              style={{
                position: "absolute",
                bottom: "16px",
                left: "16px",
                background: "rgba(0,0,0,0.75)",
                color: "white",
                padding: "10px 16px",
                borderRadius: "10px",
                backdropFilter: "blur(4px)"
              }}
            >
              <h4 style={{ margin: 0, fontSize: "16px", fontWeight: 800 }}>
                Festive Ethnic Wear Sale
              </h4>
              <p style={{ margin: "2px 0 0 0", fontSize: "12px", color: "#f43397" }}>
                Starting at just ₹299 • Up to 70% OFF
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;