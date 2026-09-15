import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./herobanner.css";

const SLIDES = [
  {
    id: 1,
    badge: "🔥 Festive Special 2026",
    heading: "Festive Ethnic Wear",
    subheading: "Up to 70% Off",
    desc: "Handpicked Banarasi Sarees, Embroidered Kurtis, Lehengas & Suits — Direct factory wholesale rates with free delivery across India.",
    primaryBtn: { label: "Shop Ethnic Collection →", to: "/catalogue?category=Ethnic%20Wear" },
    secondaryBtn: { label: "View All Sarees 🛍️", to: "/catalogue?category=Ethnic%20Wear" },
    image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=900&q=80",
    accent: "#f43397",
    bgGradient: "linear-gradient(135deg, #1e0022 0%, #4a0044 50%, #800858 100%)",
  },
  {
    id: 2,
    badge: "⚡ Tech Zone 2026",
    heading: "Smart Gadgets & Electronics",
    subheading: "Starting at ₹499",
    desc: "Noise-cancelling ANC headphones, ultra-slim laptops, smartwatches and Bluetooth speakers with official manufacturer warranty.",
    primaryBtn: { label: "Explore Electronics →", to: "/catalogue?category=Electronics" },
    secondaryBtn: { label: "View Daily Deals 🏷️", to: "/catalogue" },
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=900&q=80",
    accent: "#2563eb",
    bgGradient: "linear-gradient(135deg, #0b132b 0%, #1c2541 50%, #3a506b 100%)",
  },
  {
    id: 3,
    badge: "✨ Trending Style",
    heading: "Western Dresses & Accessories",
    subheading: "Flat 50% Off",
    desc: "Midi dresses, party bodysuits, leather totes and luxury analog watches to make your everyday style effortless and chic.",
    primaryBtn: { label: "Shop Western Outfits →", to: "/catalogue?category=Western%20Dresses" },
    secondaryBtn: { label: "Explore Accessories 🕶️", to: "/catalogue?category=Accessories" },
    image: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=900&q=80",
    accent: "#9333ea",
    bgGradient: "linear-gradient(135deg, #1f0033 0%, #3b0066 50%, #6b0099 100%)",
  },
];

const TRUST_BADGES = [
  { icon: "🚚", label: "Free Shipping" },
  { icon: "↩️", label: "7-Day Returns" },
  { icon: "💳", label: "Cash on Delivery" },
  { icon: "🔒", label: "100% Secure" },
];

const CATEGORY_SHORTCUTS = [
  { label: "🥻 Ethnic Wear", to: "/catalogue?category=Ethnic%20Wear" },
  { label: "👗 Western Dresses", to: "/catalogue?category=Western%20Dresses" },
  { label: "👔 Menswear", to: "/catalogue?category=Menswear" },
  { label: "👟 Footwear", to: "/catalogue?category=Footwear" },
  { label: "🎧 Electronics", to: "/catalogue?category=Electronics" },
  { label: "🛋️ Home Decor", to: "/catalogue?category=Home%20Decor" },
  { label: "💄 Beauty", to: "/catalogue?category=Beauty" },
  { label: "💎 Jewellery", to: "/catalogue?category=Jewellery" },
];

function HeroBanner() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [isPaused]);

  const slide = SLIDES[currentSlide];

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
  };

  const handleNext = () => {
    setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
  };

  return (
    <section className="hb-section">
      <div className="hb-container">
        {/* ── Main Hero Split Grid Layout ── */}
        <div className="hb-inner">
          {/* Left Column: Hero Slider */}
          <div
            className="hb-main-card"
            style={{ backgroundImage: slide.bgGradient }}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {/* Prev / Next Arrows */}
            <button
              type="button"
              className="hb-arrow-btn hb-arrow-prev"
              onClick={handlePrev}
              aria-label="Previous Slide"
            >
              ‹
            </button>

            <button
              type="button"
              className="hb-arrow-btn hb-arrow-next"
              onClick={handleNext}
              aria-label="Next Slide"
            >
              ›
            </button>

            {/* Slide Text Content */}
            <div className="hb-content">
              <span className="hb-badge">
                {slide.badge}
              </span>

              <h1 className="hb-heading">
                {slide.heading}
                <span className="hb-heading-accent">{slide.subheading}</span>
              </h1>

              <p className="hb-desc">{slide.desc}</p>

              {/* Action Buttons */}
              <div className="hb-cta-row">
                <Link
                  to={slide.primaryBtn.to}
                  className="hb-btn-primary"
                  style={{ background: slide.accent }}
                >
                  {slide.primaryBtn.label}
                </Link>
                <Link to={slide.secondaryBtn.to} className="hb-btn-secondary">
                  {slide.secondaryBtn.label}
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="hb-trust-row">
                {TRUST_BADGES.map((b) => (
                  <div key={b.label} className="hb-trust-item">
                    <span>{b.icon}</span>
                    <span>{b.label}</span>
                  </div>
                ))}
              </div>

              {/* Progress Dots */}
              <div className="hb-dots-bar">
                {SLIDES.map((s, idx) => (
                  <button
                    key={s.id}
                    type="button"
                    className={`hb-dot ${idx === currentSlide ? "active" : ""}`}
                    onClick={() => setCurrentSlide(idx)}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
            </div>

            {/* Slide Image Card Showcase */}
            <div className="hb-image-card">
              <img src={slide.image} alt={slide.heading} className="hb-img" />
              <div className="hb-img-overlay">
                <div className="hb-img-tag">
                  <span className="hb-img-tag-title">Direct Factory Wholesale</span>
                  <span className="hb-img-tag-sub">Free Delivery &amp; COD Available</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Side Promo Cards */}
          <div className="hb-side-column">
            {/* Widget 1: Deal of the Hour */}
            <div className="hb-side-card">
              <div>
                <span className="hb-deal-badge">🔥 Deal of the Hour</span>
                <div className="hb-deal-timer">Ends in 03h 45m 12s ⏳</div>
                <h3 className="hb-side-card-title">Festive Banarasi Sarees</h3>
                <p className="hb-side-card-sub">
                  Pure silk zari woven sarees starting at ₹399 only. Limited factory stock!
                </p>
              </div>
              <Link to="/catalogue?category=Ethnic%20Wear" className="hb-side-card-link">
                Grab Deal Now →
              </Link>
            </div>

            {/* Widget 2: Wholesale Savings */}
            <div className="hb-side-card hb-reseller-card">
              <div>
                <span className="hb-deal-badge hb-reseller-badge">🏭 Factory Direct</span>
                <h3 className="hb-side-card-title">Save Up To 70% Off</h3>
                <p className="hb-side-card-sub">
                  Buy directly from manufacturers with free shipping &amp; cash on delivery.
                </p>
              </div>
              <Link to="/catalogue" className="hb-side-card-link" style={{ color: "#a5b4fc" }}>
                Explore All Products →
              </Link>
            </div>
          </div>
        </div>

        {/* ── Quick Category Shortcut Strip ── */}
        <div className="hb-cat-strip">
          {CATEGORY_SHORTCUTS.map((cat) => (
            <Link key={cat.label} to={cat.to} className="hb-cat-pill">
              {cat.label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export default HeroBanner;
