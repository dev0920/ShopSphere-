import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import "../styles/sellOnline.css";

const FAQ_ITEMS = [
  {
    q: "Who can sell on ShopSphere?",
    a: "Anyone selling authentic products can register as a supplier on ShopSphere — including manufacturers, distributors, wholesalers, retail store owners, and independent brands. Both GSTIN and Non-GST suppliers can list products."
  },
  {
    q: "What are the fees for selling on ShopSphere?",
    a: "ShopSphere charges 0% commission fee! You retain 100% of your selling price. There are zero hidden listing fees or subscription costs."
  },
  {
    q: "How fast do I get paid for my orders?",
    a: "Payments are deposited directly into your registered bank account following a swift 7-day payment cycle from the date of order delivery."
  },
  {
    q: "How does shipping and delivery work?",
    a: "ShopSphere manages doorstep pickup and express shipping across 28,000+ Indian pincodes through our logistics partners. You simply pack the item and hand it to our delivery partner."
  },
  {
    q: "What documents are required to start selling?",
    a: "All you need to start selling is: 1) Active Bank Account, 2) GSTIN (for GST sellers) or Enrolment ID / UIN (for non-GST sellers), and 3) Phone number."
  }
];

const CATEGORIES_TO_SELL = [
  { name: "Sell Sarees Online", path: "/catalogue?category=Ethnic%20Wear" },
  { name: "Sell Jewellery Online", path: "/catalogue?category=Jewellery" },
  { name: "Sell T-Shirts Online", path: "/catalogue?category=Menswear" },
  { name: "Sell Shirts Online", path: "/catalogue?category=Menswear" },
  { name: "Sell Watches Online", path: "/catalogue?category=Watches" },
  { name: "Sell Electronics Online", path: "/catalogue?category=Electronics" },
  { name: "Sell Clothes Online", path: "/catalogue?category=Western%20Dresses" },
  { name: "Sell Footwear Online", path: "/catalogue?category=Footwear" },
  { name: "Sell Home Decor Online", path: "/catalogue?category=Home%20Decor" },
  { name: "Sell Beauty Products Online", path: "/catalogue?category=Beauty" },
  { name: "Sell Bags Online", path: "/catalogue?category=Bags" },
  { name: "Sell Kids Toys Online", path: "/catalogue?category=Kids%20%26%20Toys" },
];

export default function SellOnline() {
  const [openFaq, setOpenFaq] = useState(null);
  const navigate = useNavigate();

  const toggleFaq = (idx) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  const handleStartSelling = () => {
    const userStr = localStorage.getItem("user") || sessionStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.role === "vendor" || user.role === "admin") {
          navigate("/vendor-dashboard");
          return;
        }
      } catch {}
    }
    navigate("/register?role=vendor");
  };

  return (
    <div className="so-wrapper">
      <Navbar />

      {/* ── Secondary Supplier Navigation Bar ── */}
      <nav className="so-subnav">
        <div className="so-subnav-container">
          <div className="so-subnav-brand">
            <span className="so-subnav-logo">🛍️ ShopSphere</span>
            <span className="so-subnav-tag">Supplier Central</span>
          </div>

          <div className="so-subnav-links">
            <a href="#benefits">Why ShopSphere</a>
            <a href="#how-it-works">How It Works</a>
            <a href="#rewards">Rewards</a>
            <a href="#testimonials">Success Stories</a>
            <a href="#faq">FAQs</a>
          </div>

          <div className="so-subnav-actions">
            <Link to="/login" className="so-btn-login">Login</Link>
            <button type="button" onClick={handleStartSelling} className="so-btn-primary">
              Start Selling →
            </button>
          </div>
        </div>
      </nav>

      {/* ── 1. Hero Banner ── */}
      <section className="so-hero">
        <div className="so-hero-container">
          <div className="so-hero-content">
            <span className="so-hero-badge">
              🔥 0% Commission Platform for Indian Sellers
            </span>
            <h1 className="so-hero-title">
              Sell Online to Crores of Customers at <span className="so-highlight">0% Commission</span>
            </h1>
            <p className="so-hero-subtitle">
              Become a <strong>ShopSphere</strong> seller and grow your business across India with zero order penalties, 7-day payments &amp; 28,000+ delivery pincodes.
            </p>

            <div className="so-hero-gst-note">
              <span className="so-gst-icon">🏷️</span>
              <span><strong>Don’t have a GSTIN?</strong> You can still sell on ShopSphere using Enrolment ID / UIN.</span>
            </div>

            <div className="so-hero-cta-group">
              <button type="button" onClick={handleStartSelling} className="so-hero-cta-btn">
                Start Selling Now →
              </button>
              <a href="#how-it-works" className="so-hero-secondary-btn">
                See How It Works ⚡
              </a>
            </div>
          </div>

          {/* Hero Visual Card */}
          <div className="so-hero-visual">
            <div className="so-supplier-card">
              <div className="so-card-header">
                <span className="so-card-avatar">🏪</span>
                <div>
                  <h3 className="so-card-name">Kashi Silk &amp; Handloom</h3>
                  <span className="so-card-badge">✅ Verified Supplier</span>
                </div>
              </div>

              <div className="so-card-stats-grid">
                <div className="so-card-stat">
                  <span>DAILY ORDERS</span>
                  <strong>1,450+</strong>
                  <small style={{ color: "#10b981" }}>↑ 320% growth</small>
                </div>
                <div className="so-card-stat">
                  <span>COMMISSION</span>
                  <strong style={{ color: "#9333ea" }}>0% FREE</strong>
                  <small>Keep 100% Margin</small>
                </div>
                <div className="so-card-stat">
                  <span>PAYMENT CYCLE</span>
                  <strong>7 Days</strong>
                  <small>Direct Bank Deposit</small>
                </div>
              </div>

              <div className="so-card-banner">
                <span>⚡ Next Day Dispatch Eligible</span>
                <span>⭐ 4.9 Supplier Rating</span>
              </div>
            </div>
          </div>
        </div>

        {/* Trust Counter Strip */}
        <div className="so-counters-strip">
          <div className="so-counters-container">
            <div className="so-counter-item">
              <strong className="so-counter-num">5 Lakhs+</strong>
              <span className="so-counter-label">Sellers Trust ShopSphere</span>
            </div>
            <div className="so-counter-divider" />
            <div className="so-counter-item">
              <strong className="so-counter-num">10 Crores+</strong>
              <span className="so-counter-label">Active Buyers Across India</span>
            </div>
            <div className="so-counter-divider" />
            <div className="so-counter-item">
              <strong className="so-counter-num">28,000+</strong>
              <span className="so-counter-label">Serviceable Delivery Pincodes</span>
            </div>
            <div className="so-counter-divider" />
            <div className="so-counter-item">
              <strong className="so-counter-num">100+</strong>
              <span className="so-counter-label">Product Categories to Sell</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. Why Suppliers Love ShopSphere ── */}
      <section id="benefits" className="so-section so-benefits-section">
        <div className="so-section-header">
          <span className="so-section-tag">SUPPLIER ADVANTAGES</span>
          <h2 className="so-section-title">Why Suppliers Love Selling on ShopSphere</h2>
          <p className="so-section-desc">
            All the features and benefits built into ShopSphere are tailored to maximize your daily order volume and eliminate selling friction.
          </p>
        </div>

        <div className="so-benefits-grid">
          <div className="so-benefit-card">
            <div className="so-benefit-icon">💰</div>
            <h3>0% Commission Fee</h3>
            <p>Suppliers selling on ShopSphere keep 100% of their gross sales revenue by paying 0% platform commission on every order.</p>
          </div>

          <div className="so-benefit-card">
            <div className="so-benefit-icon">🛡️</div>
            <h3>0 Penalty Charges</h3>
            <p>Sell online without fear of cancellation fines. Enjoy 0 penalty charges for late dispatches or unavoidable cancellations.</p>
          </div>

          <div className="so-benefit-card">
            <div className="so-benefit-icon">🚀</div>
            <h3>Growth for Every Supplier</h3>
            <p>From small workshops to large manufacturers, branded or unbranded, and now open for Non-GST Enrolment sellers too!</p>
          </div>

          <div className="so-benefit-card">
            <div className="so-benefit-icon">✨</div>
            <h3>Easy Product Listing</h3>
            <p>Upload your product catalogs in minutes with smart automated background removal and instant Admin approval workflow.</p>
          </div>

          <div className="so-benefit-card">
            <div className="so-benefit-icon">🚚</div>
            <h3>Lowest Cost Shipping</h3>
            <p>Doorstep order pickup and express delivery across 28,000+ Indian pincodes at industry-leading discounted shipping rates.</p>
          </div>

          <div className="so-benefit-card">
            <div className="so-benefit-icon">🏦</div>
            <h3>7-Day Payment Cycle</h3>
            <p>Earnings are automatically deposited into your registered bank account following a reliable 7-day delivery cycle.</p>
          </div>
        </div>
      </section>

      {/* ── 3. First 30 Days Supplier+ Rewards ── */}
      <section id="rewards" className="so-section so-rewards-section">
        <div className="so-rewards-card">
          <div className="so-rewards-content">
            <span className="so-rewards-pill">🎁 Exclusive Supplier+ Welcome Package</span>
            <h2>Get Rewards for Your First 30 Days</h2>
            <p>Accelerate your initial sales momentum with automated platform credits and dedicated seller onboarding support.</p>

            <div className="so-rewards-list">
              <div className="so-reward-item">
                <span className="so-reward-icon">📢</span>
                <div>
                  <strong>Free Catalog Visibility Credits (₹600)</strong>
                  <p>Run sponsored product advertisements to boost your catalog visibility to millions of active Indian shoppers.</p>
                </div>
              </div>

              <div className="so-reward-item">
                <span className="so-reward-icon">🚫</span>
                <div>
                  <strong>Zero Order Cancellation Penalties</strong>
                  <p>Fulfill orders with peace of mind. Zero penalty fees for any unforeseen order cancellations during your first month.</p>
                </div>
              </div>

              <div className="so-reward-item">
                <span className="so-reward-icon">👨‍💼</span>
                <div>
                  <strong>Dedicated Account Growth Specialist</strong>
                  <p>Get 1-on-1 assistance for catalog upload, pricing strategy, and Next Day Dispatch (NDD) eligibility.</p>
                </div>
              </div>
            </div>

            <button type="button" onClick={handleStartSelling} className="so-rewards-btn">
              Claim 30-Day Welcome Rewards →
            </button>
          </div>
        </div>
      </section>

      {/* ── 4. How It Works (5 Steps) ── */}
      <section id="how-it-works" className="so-section so-steps-section">
        <div className="so-section-header">
          <span className="so-section-tag">SIMPLE 5-STEP PROCESS</span>
          <h2 className="so-section-title">How Selling on ShopSphere Works</h2>
          <p className="so-section-desc">Get your online store live and start receiving orders across India in 5 quick steps.</p>
        </div>

        <div className="so-steps-grid">
          <div className="so-step-card">
            <div className="so-step-badge">1</div>
            <h3>Create Account</h3>
            <p>Register with your active GSTIN (or Enrolment ID for non-GST sellers), bank account details, and phone number.</p>
          </div>

          <div className="so-step-card">
            <div className="so-step-badge">2</div>
            <h3>List Products</h3>
            <p>Upload the products you want to sell with images, descriptions, and wholesale factory prices in your Supplier Panel.</p>
          </div>

          <div className="so-step-card">
            <div className="so-step-badge">3</div>
            <h3>Get Orders</h3>
            <p>Receive live order notifications from crores of active Indian shoppers browsing ShopSphere daily.</p>
          </div>

          <div className="so-step-card">
            <div className="so-step-badge">4</div>
            <h3>Doorstep Shipping</h3>
            <p>Pack the item and hand it over to ShopSphere doorstep pickup partners delivering to 28,000+ pincodes.</p>
          </div>

          <div className="so-step-card">
            <div className="so-step-badge">5</div>
            <h3>7-Day Bank Payout</h3>
            <p>Your 100% sales revenue is deposited directly into your bank account on a strict 7-day delivery schedule.</p>
          </div>
        </div>
      </section>

      {/* ── 5. Supplier Testimonials ── */}
      <section id="testimonials" className="so-section so-stories-section">
        <div className="so-section-header">
          <span className="so-section-tag">SUCCESS STORIES</span>
          <h2 className="so-section-title">Experiences Indian Suppliers Love to Share</h2>
          <p className="so-section-desc">See how real manufacturers and wholesalers scaled their daily orders with ShopSphere.</p>
        </div>

        <div className="so-stories-grid">
          <div className="so-story-card">
            <div className="so-story-header">
              <span className="so-story-avatar">👨‍💼👨‍💼</span>
              <div>
                <h4>Amit &amp; Rajat Jain</h4>
                <span className="so-story-location">Smartees • Tiruppur</span>
              </div>
            </div>
            <p className="so-story-quote">
              “Our apparel manufacturing business has grown beyond our imagination, receiving up to <strong>10,000 orders daily</strong> consistently during major sale events. ShopSphere’s real-time analytics helped us launch top-selling items!”
            </p>
            <div className="so-story-tag">📈 10,000+ Orders / Sale Day</div>
          </div>

          <div className="so-story-card">
            <div className="so-story-header">
              <span className="so-story-avatar">👩‍💼</span>
              <div>
                <h4>Suman</h4>
                <span className="so-story-location">Keshav Fashion • Hisar</span>
              </div>
            </div>
            <p className="so-story-quote">
              “I started selling ethnic wear on ShopSphere with 4-5 orders on day one. In no time, I was getting over <strong>1,000 orders a day</strong>! It feels like a dream come true to run my own brand nationwide.”
            </p>
            <div className="so-story-tag">📦 1,000+ Orders Daily</div>
          </div>

          <div className="so-story-card">
            <div className="so-story-header">
              <span className="so-story-avatar">👨‍💼</span>
              <div>
                <h4>Mohit Rathi</h4>
                <span className="so-story-location">Meira Jewellery • Ahmedabad</span>
              </div>
            </div>
            <p className="so-story-quote">
              “ShopSphere made transitioning to online selling completely seamless. Suddenly our jewellery items were shipping to every corner of India, witnessing up to <strong>5X sales growth</strong>!”
            </p>
            <div className="so-story-tag">⚡ 5X Business Growth</div>
          </div>
        </div>
      </section>

      {/* ── 6. Growth Tools ── */}
      <section className="so-section so-growth-section">
        <div className="so-section-header">
          <span className="so-section-tag">BUSINESS SCALING TOOLS</span>
          <h2 className="so-section-title">Grow Your Business With ShopSphere Tools</h2>
          <p className="so-section-desc">Powerful features designed to increase your sales velocity and operational efficiency.</p>
        </div>

        <div className="so-growth-grid">
          <div className="so-growth-card">
            <span className="so-growth-icon">⚡</span>
            <h3>Next Day Dispatch (NDD) Program</h3>
            <p>Get priority search visibility and dedicated logistics support by dispatching orders within 24 hours.</p>
          </div>

          <div className="so-growth-card">
            <span className="so-growth-icon">📢</span>
            <h3>ShopSphere Sponsored Ads</h3>
            <p>Promote your products directly on high-intent search pages and category banners to boost order conversion.</p>
          </div>

          <div className="so-growth-card">
            <span className="so-growth-icon">📊</span>
            <h3>Real-Time Business Analytics</h3>
            <p>Access live pricing recommendations, trending search terms, and stock alert insights in your Vendor Dashboard.</p>
          </div>
        </div>
      </section>

      {/* ── 7. Popular Categories to Sell ── */}
      <section className="so-section so-cats-section">
        <div className="so-section-header">
          <span className="so-section-tag">HIGH DEMAND CATEGORIES</span>
          <h2 className="so-section-title">Popular Categories to Sell Online</h2>
          <p className="so-section-desc">Explore the most searched factory product categories on ShopSphere.</p>
        </div>

        <div className="so-cats-grid">
          {CATEGORIES_TO_SELL.map((cat) => (
            <Link key={cat.name} to={cat.path} className="so-cat-link">
              <span>🏷️ {cat.name}</span>
              <span>→</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── 8. FAQs ── */}
      <section id="faq" className="so-section so-faq-section">
        <div className="so-section-header">
          <span className="so-section-tag">HELP &amp; SUPPORT</span>
          <h2 className="so-section-title">Frequently Asked Questions</h2>
          <p className="so-section-desc">Everything you need to know about starting your online supplier journey.</p>
        </div>

        <div className="so-faq-accordion">
          {FAQ_ITEMS.map((item, idx) => (
            <div key={idx} className={`so-faq-item${openFaq === idx ? " active" : ""}`}>
              <button type="button" className="so-faq-question" onClick={() => toggleFaq(idx)}>
                <span>{item.q}</span>
                <span className="so-faq-icon">{openFaq === idx ? "−" : "+"}</span>
              </button>
              {openFaq === idx && (
                <div className="so-faq-answer">
                  <p>{item.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="so-support-box">
          <h3>Need help getting started?</h3>
          <p>ShopSphere supplier support team is available 24/7 to assist you before and after you start selling.</p>
          <div className="so-support-actions">
            <a href="mailto:sell@shopsphere.com" className="so-support-email-btn">
              ✉️ Email: sell@shopsphere.com
            </a>
            <span className="so-support-phone">📞 Helpline: 1800-123-SPHERE (24x7)</span>
          </div>
        </div>
      </section>

      {/* ── 9. Bottom CTA Strip ── */}
      <section className="so-bottom-cta">
        <div className="so-bottom-cta-container">
          <h2>Ready to sell to crores of Indian buyers at 0% commission?</h2>
          <p>Register your supplier store on ShopSphere in under 5 minutes.</p>
          <button type="button" onClick={handleStartSelling} className="so-bottom-cta-btn">
            Start Selling on ShopSphere →
          </button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
