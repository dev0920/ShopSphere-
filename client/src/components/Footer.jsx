import { Link } from "react-router-dom";
import "../styles/footer.css";

function Footer() {
  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  })();

  return (
    <footer className="footer-root">

      {/* ── Top Trust Banner ── */}
      <div className="footer-trust-banner">
        <div className="footer-container footer-trust-grid">
          <div className="footer-trust-item">
            <span className="footer-trust-icon">🚚</span>
            <div>
              <strong>Free Delivery Across India</strong>
              <p>On all orders above ₹199 with real-time tracking</p>
            </div>
          </div>
          <div className="footer-trust-item">
            <span className="footer-trust-icon">↩️</span>
            <div>
              <strong>7-Day Easy Returns</strong>
              <p>Hassle-free instant return & exchange policy</p>
            </div>
          </div>
          <div className="footer-trust-item">
            <span className="footer-trust-icon">💳</span>
            <div>
              <strong>Cash on Delivery Available</strong>
              <p>Pay comfortably at your doorstep when delivered</p>
            </div>
          </div>
          <div className="footer-trust-item">
            <span className="footer-trust-icon">🔒</span>
            <div>
              <strong>100% Secure Payments</strong>
              <p>256-bit encrypted UPI, Cards & NetBanking</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Multi-Column Footer ── */}
      <div className="footer-main">
        <div className="footer-container footer-grid">

          {/* Col 1: Brand & Contact Info */}
          <div className="footer-col footer-col-brand">
            <Link to="/" className="footer-logo">
              <span className="footer-logo-icon">🛍️</span>
              <span className="footer-logo-text">ShopSphere</span>
            </Link>
            <p className="footer-brand-desc">
              India's premier factory-direct shopping destination. Connecting millions of shoppers with verified manufacturers & sellers at true wholesale prices.
            </p>
            <div className="footer-contact-info">
              <p><span>📞</span> <strong>Customer Care:</strong> +91 1800-123-4567</p>
              <p><span>✉️</span> <strong>Support Email:</strong> support@shopsphere.com</p>
              <p><span>📍</span> <strong>Headquarters:</strong> Mumbai, Maharashtra, India</p>
            </div>
            <div className="footer-social-links">
              <a href="https://whatsapp.com" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">💬</a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">📸</a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">📘</a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">🐤</a>
            </div>
          </div>

          {/* Col 2: Top Categories */}
          <div className="footer-col">
            <h4 className="footer-col-title">Shop Categories</h4>
            <ul className="footer-links-list">
              <li><Link to="/catalogue?category=Ethnic%20Wear">Ethnic Wear & Sarees</Link></li>
              <li><Link to="/catalogue?category=Western%20Dresses">Western Fashion & Midi</Link></li>
              <li><Link to="/catalogue?category=Menswear">Menswear & Formal Shirts</Link></li>
              <li><Link to="/catalogue?category=Footwear">Sneakers, Heels & Boots</Link></li>
              <li><Link to="/catalogue?category=Electronics">Headphones & Smartwatches</Link></li>
              <li><Link to="/catalogue?category=Beauty">Skincare & Fragrances</Link></li>
              <li><Link to="/catalogue?category=Home%20Decor">Home Decor & Bedding</Link></li>
            </ul>
          </div>

          {/* Col 3: Customer Assistance */}
          <div className="footer-col">
            <h4 className="footer-col-title">Customer Care</h4>
            <ul className="footer-links-list">
              <li><Link to="/my-orders">Track Order Status</Link></li>
              <li><Link to="/my-orders">Returns & Exchange</Link></li>
              <li><Link to="/cart">Shopping Cart</Link></li>
              <li><Link to="/reseller-hub">Reseller Earnings Program</Link></li>
              <li><a href="#faq">Shipping & Delivery Info</a></li>
              <li><a href="#cod">Cash on Delivery FAQs</a></li>
              <li><a href="#help">Help & Customer Support</a></li>
            </ul>
          </div>

          {/* Col 4: Supplier & Partner Hub */}
          <div className="footer-col">
            <h4 className="footer-col-title">Become a Seller</h4>
            <ul className="footer-links-list">
              <li><Link to="/sell-online">Sell Online on ShopSphere (0% Fee)</Link></li>
              <li><Link to="/sell-online#how-it-works">How Selling Works</Link></li>
              <li><Link to="/sell-online#rewards">Supplier 30-Day Rewards</Link></li>
              <li><Link to="/register?role=vendor">Supplier Store Registration</Link></li>
              <li><Link to="/vendor-dashboard">Vendor Dashboard</Link></li>
              <li><Link to="/admin-dashboard">Admin Approval Portal</Link></li>
            </ul>
          </div>

        </div>
      </div>

      {/* ── Payments & Verification Bar ── */}
      <div className="footer-payments-bar">
        <div className="footer-container footer-payments-inner">
          <div className="footer-payments-left">
            <span>Accepted Payment Methods:</span>
            <div className="footer-pay-badges">
              <span className="footer-pay-pill">⚡ GPay / PhonePe</span>
              <span className="footer-pay-pill">💳 Paytm / UPI</span>
              <span className="footer-pay-pill">💳 Visa / Mastercard</span>
              <span className="footer-pay-pill">💳 RuPay</span>
              <span className="footer-pay-pill">💵 Cash on Delivery</span>
            </div>
          </div>
          <div className="footer-payments-right">
            <span className="footer-secure-tag">🔒 256-Bit SSL Encrypted</span>
            <span className="footer-secure-tag">✅ Verified Merchant</span>
          </div>
        </div>
      </div>

      {/* ── Bottom Copyright ── */}
      <div className="footer-bottom">
        <div className="footer-container footer-bottom-inner">
          <p>© 2026 ShopSphere E-Commerce Pvt. Ltd. All rights reserved.</p>
          <p>Made with ❤️ for Indian Shoppers &amp; Resellers.</p>
        </div>
      </div>

    </footer>
  );
}

export default Footer;