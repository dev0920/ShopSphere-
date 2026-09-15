import { API_BASE_URL } from "../config/apiConfig";
import { useState, useMemo, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/auth.css";

function getPasswordStrength(pwd) {
  if (!pwd) return { score: 0, label: "", color: "" };
  let score = 0;
  if (pwd.length >= 6)            score++;
  if (pwd.length >= 10)           score++;
  if (/[A-Z]/.test(pwd))          score++;
  if (/[0-9]/.test(pwd))          score++;
  if (/[^A-Za-z0-9]/.test(pwd))   score++;
  if (score <= 1) return { score, label: "Weak",   color: "#ef4444" };
  if (score <= 2) return { score, label: "Fair",   color: "#f59e0b" };
  if (score <= 3) return { score, label: "Good",   color: "#3b82f6" };
  return            { score, label: "Strong", color: "#22c55e" };
}

const ROLE_OPTIONS = [
  {
    value: "user",
    label: "Customer",
    icon: "🛍️",
    desc: "Shop products at factory-direct prices",
  },
  {
    value: "vendor",
    label: "Vendor / Seller",
    icon: "🏪",
    desc: "List your products & reach millions of buyers",
  },
  {
    value: "delivery",
    label: "Delivery Partner",
    icon: "🚚",
    desc: "Deliver orders & earn commission per parcel",
  },
];

const REAL_GOOGLE_CLIENT_ID = "59730576369-05lvqfqkgau6hf87iel62c7slp8f5r9k.apps.googleusercontent.com";

function Register() {
  const [name,            setName]            = useState("");
  const [email,           setEmail]           = useState("");
  const [phone,           setPhone]           = useState("");
  const [password,        setPassword]        = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role,            setRole]            = useState("user");
  const [showPassword,    setShowPassword]    = useState(false);
  const [showConfirm,     setShowConfirm]     = useState(false);
  const [agreeTerms,      setAgreeTerms]      = useState(true);
  const [message,         setMessage]         = useState({ text: "", type: "" });
  const [loading,         setLoading]         = useState(false);
  const [googleClientId] = useState(
    localStorage.getItem("google_client_id") || import.meta.env.VITE_GOOGLE_CLIENT_ID || REAL_GOOGLE_CLIENT_ID
  );
  const navigate = useNavigate();

  const strength        = useMemo(() => getPasswordStrength(password), [password]);
  const passwordsMatch  = confirmPassword.length > 0 && password === confirmPassword;
  const passwordsMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  const handlePhoneChange = (e) => {
    const digitsOnly = e.target.value.replace(/\D/g, "").slice(0, 10);
    setPhone(digitsOnly);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage({ text: "", type: "" });

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedPhone = phone.trim();

    if (!trimmedName || trimmedName.length < 2) {
      return setMessage({ text: "Please enter your full name (at least 2 characters).", type: "error" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!trimmedEmail || !trimmedEmail.includes("@") || !emailRegex.test(trimmedEmail)) {
      return setMessage({ text: "Please enter a valid Gmail / Email address containing '@' (e.g., example@gmail.com).", type: "error" });
    }

    if (!trimmedPhone || trimmedPhone.length !== 10 || !/^\d{10}$/.test(trimmedPhone)) {
      return setMessage({ text: "Please enter a valid 10-digit mobile phone number.", type: "error" });
    }

    if (password.length < 6) {
      return setMessage({ text: "Password must be at least 6 characters.", type: "error" });
    }
    if (password !== confirmPassword) {
      return setMessage({ text: "Passwords do not match.", type: "error" });
    }
    if (!agreeTerms) {
      return setMessage({ text: "Please accept the terms and conditions.", type: "error" });
    }

    setLoading(true);
    try {
      const res  = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ name: trimmedName, email: trimmedEmail, phone: trimmedPhone, password, role }),
      });
      const data = await res.json();

      if (!res.ok) {
        setMessage({ text: data.message || "Registration failed.", type: "error" });
        setLoading(false);
        return;
      }

      // Persist auth data in localStorage & sessionStorage if token is present
      if (data.token && data.user) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        sessionStorage.setItem("token", data.token);
        sessionStorage.setItem("user", JSON.stringify(data.user));
      }

      setMessage({ text: "Account created successfully! Redirecting… 🎉", type: "success" });

      const targetPath = data.user?.role === "vendor"
        ? "/vendor-dashboard"
        : data.user?.role === "delivery"
        ? "/delivery-dashboard"
        : "/";

      setTimeout(() => {
        window.location.href = targetPath;
      }, 500);
    } catch {
      setMessage({ text: "Unable to connect to server.", type: "error" });
      setLoading(false);
    }
  };

  const handleGoogleLogin = async (googleEmail, googleName, picture = "", googleId = "", pwd = "") => {
    setMessage({ text: "", type: "" });
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: googleEmail, name: googleName, picture, googleId, role, password: pwd }),
      });
      const data = await res.json();

      if (!res.ok) {
        setMessage({ text: data.message || "Google authentication failed.", type: "error" });
        setLoading(false);
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      sessionStorage.setItem("token", data.token);
      sessionStorage.setItem("user", JSON.stringify(data.user));

      if (data.alreadyExists) {
        setMessage({ text: `✅ Existing Account Found! Welcome back, ${data.user.name} 👋 (Logging in…)`, type: "success" });
      } else {
        setMessage({ text: `🎉 New Google Account Created! Welcome, ${data.user.name} 🎉`, type: "success" });
      }

      const targetPath = data.user?.role === "vendor"
        ? "/vendor-dashboard"
        : data.user?.role === "delivery"
        ? "/delivery-dashboard"
        : "/";

      setTimeout(() => {
        window.location.href = targetPath;
      }, 500);
    } catch (error) {
      setMessage({ text: "Unable to connect to Google Auth server.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleCallbackResponse = async (response) => {
    try {
      const base64Url = response.credential.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      const gUser = JSON.parse(jsonPayload);

      await handleGoogleLogin(gUser.email, gUser.name, gUser.picture, gUser.sub);
    } catch (err) {
      console.error("Google Callback Error:", err);
    }
  };

  useEffect(() => {
    const activeClientId = googleClientId || REAL_GOOGLE_CLIENT_ID;

    const initGIS = () => {
      if (window.google?.accounts?.id) {
        try {
          window.google.accounts.id.initialize({
            client_id: activeClientId,
            callback: handleGoogleCallbackResponse,
            auto_select: false,
          });
        } catch (e) {
          console.log("Google GSI Init:", e);
        }
      }
    };

    const existingScript = document.getElementById("google-gsi-script");
    if (!existingScript) {
      const script = document.createElement("script");
      script.id = "google-gsi-script";
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = initGIS;
      document.body.appendChild(script);
    } else {
      initGIS();
    }
  }, [googleClientId]);

  const triggerRealGooglePrompt = () => {
    const activeClientId = googleClientId || REAL_GOOGLE_CLIENT_ID;

    // Trigger standard Google OAuth2 popup displaying user's real browser Gmail accounts
    if (window.google?.accounts?.oauth2) {
      try {
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: activeClientId,
          scope: "openid profile email",
          prompt: "select_account",
          callback: async (tokenResponse) => {
            if (tokenResponse && tokenResponse.access_token) {
              try {
                setLoading(true);
                const userRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
                  headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
                });
                const googleUser = await userRes.json();
                if (googleUser && googleUser.email) {
                  await handleGoogleLogin(
                    googleUser.email,
                    googleUser.name || googleUser.email.split("@")[0],
                    googleUser.picture || "",
                    googleUser.sub || ""
                  );
                } else {
                  setMessage({ text: "Could not retrieve Google profile data.", type: "error" });
                  setLoading(false);
                }
              } catch (err) {
                console.error("Google UserInfo Fetch Error:", err);
                setMessage({ text: "Failed to connect to Google profile service.", type: "error" });
                setLoading(false);
              }
            }
          },
        });
        client.requestAccessToken();
        return;
      } catch (e) {
        console.error("OAuth2 Token Client Error:", e);
      }
    }

    // Fallback: One-Tap prompt
    if (window.google?.accounts?.id) {
      try {
        window.google.accounts.id.initialize({
          client_id: activeClientId,
          callback: handleGoogleCallbackResponse,
        });
        window.google.accounts.id.prompt();
        return;
      } catch (e) {
        console.error("Google Accounts ID Prompt Error:", e);
      }
    }

    setMessage({ text: "Google Sign-In is initializing. Please try again in 2 seconds.", type: "info" });
  };

  return (
    <div className="auth-page">

      <div className="auth-container auth-container--register">

        {/* ── Brand panel ── */}
        <aside className="auth-brand">
          <div className="auth-brand-inner">
            <Link to="/" className="auth-brand-logo">🛍️</Link>
            <h1 className="auth-brand-name">ShopSphere</h1>
            <p className="auth-brand-tagline">
              Join 1 lakh+ smart shoppers and sellers. Start earning from day one — zero investment needed.
            </p>
            <ul className="auth-feature-list">
              <li>
                <span className="auth-feature-icon">⚡</span>
                <div><strong>Instant Sign Up</strong><p>Ready in under 60 seconds</p></div>
              </li>
              <li>
                <span className="auth-feature-icon">🏪</span>
                <div><strong>Sell Your Products</strong><p>Reach millions of buyers</p></div>
              </li>
              <li>
                <span className="auth-feature-icon">🎁</span>
                <div><strong>Exclusive Discounts</strong><p>Special coupons for new members</p></div>
              </li>
            </ul>
            <div className="auth-brand-stat-row">
              <div className="auth-stat"><strong>Free</strong><span>to Join</span></div>
              <div className="auth-stat"><strong>70%</strong><span>Max Savings</span></div>
              <div className="auth-stat"><strong>24/7</strong><span>Support</span></div>
            </div>
          </div>
        </aside>

        {/* ── Form panel ── */}
        <main className="auth-form-side">
          <div className="auth-form-card">
            <Link to="/" className="auth-back-btn">← Back to Home</Link>

            <div className="auth-form-header">
              <h2>Create your account 🚀</h2>
              <p>Takes less than a minute to get started</p>
            </div>

            <form className="auth-form" onSubmit={handleRegister} noValidate>

              {/* ── Role picker ── */}
              <div className="auth-field">
                <label>I want to join as</label>
                <div className="auth-role-picker">
                  {ROLE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      className={`auth-role-card${role === opt.value ? " auth-role-card--active" : ""}`}
                      onClick={() => setRole(opt.value)}
                    >
                      <span className="auth-role-icon">{opt.icon}</span>
                      <strong>{opt.label}</strong>
                      <p>{opt.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Full name */}
              <div className="auth-field">
                <label htmlFor="reg-name">Full name</label>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon">👤</span>
                  <input id="reg-name" type="text" placeholder="John Doe"
                    value={name} onChange={(e) => setName(e.target.value)}
                    autoComplete="name" required />
                </div>
              </div>

              {/* Email / Gmail address */}
              <div className="auth-field">
                <label htmlFor="reg-email">Email / Gmail address (Must include '@')</label>
                <div className={`auth-input-wrap${email.length > 0 && email.includes("@") && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? " auth-input-wrap--valid" : ""}${email.length > 0 && !email.includes("@") ? " auth-input-wrap--invalid" : ""}`}>
                  <span className="auth-input-icon">✉️</span>
                  <input id="reg-email" type="email" placeholder="name@gmail.com"
                    value={email} onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email" required />
                  {email.length > 0 && email.includes("@") && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && (
                    <span className="auth-check-icon">✅</span>
                  )}
                </div>
                {email.length > 0 && !email.includes("@") && (
                  <p className="auth-field-error" style={{ color: "#ef4444", fontSize: "12px", marginTop: "4px" }}>
                    ⚠️ Email must contain '@' symbol (e.g. name@gmail.com)
                  </p>
                )}
              </div>

              {/* Mobile Phone Number (10 digits) */}
              <div className="auth-field">
                <label htmlFor="reg-phone">Mobile Phone Number (10 Digits)</label>
                <div className={`auth-input-wrap${phone.length === 10 ? " auth-input-wrap--valid" : ""}${phone.length > 0 && phone.length < 10 ? " auth-input-wrap--invalid" : ""}`}>
                  <span className="auth-input-icon">📱</span>
                  <input
                    id="reg-phone"
                    type="tel"
                    placeholder="10-digit Mobile Number (e.g. 9876543210)"
                    value={phone}
                    onChange={handlePhoneChange}
                    maxLength={10}
                    required
                  />
                  {phone.length === 10 && <span className="auth-check-icon">✅</span>}
                </div>
                {phone.length > 0 && phone.length < 10 && (
                  <p className="auth-field-error" style={{ color: "#ef4444", fontSize: "12px", marginTop: "4px" }}>
                    ⚠️ Mobile number must be exactly 10 digits ({phone.length}/10 entered)
                  </p>
                )}
                {phone.length === 10 && (
                  <p style={{ color: "#16a34a", fontSize: "12px", marginTop: "4px", fontWeight: 700 }}>
                    ✅ 10-Digit Mobile Verified
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="auth-field">
                <label htmlFor="reg-password">Create password</label>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon">🔒</span>
                  <input id="reg-password" type={showPassword ? "text" : "password"}
                    placeholder="Minimum 6 characters" value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password" required />
                  <button type="button" className="auth-eye-btn"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Hide" : "Show"}>
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                </div>
                {password.length > 0 && (
                  <div className="auth-strength">
                    <div className="auth-strength-bar">
                      {[1,2,3,4,5].map((s) => (
                        <span key={s} className="auth-strength-segment"
                          style={{ background: s <= strength.score ? strength.color : "#e2e8f0" }} />
                      ))}
                    </div>
                    <span className="auth-strength-label" style={{ color: strength.color }}>
                      {strength.label}
                    </span>
                  </div>
                )}
              </div>

              {/* Confirm password */}
              <div className="auth-field">
                <label htmlFor="reg-confirm">Confirm password</label>
                <div className={`auth-input-wrap${passwordsMatch ? " auth-input-wrap--valid" : ""}${passwordsMismatch ? " auth-input-wrap--invalid" : ""}`}>
                  <span className="auth-input-icon">🔑</span>
                  <input id="reg-confirm" type={showConfirm ? "text" : "password"}
                    placeholder="Re-enter your password" value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    autoComplete="new-password" required />
                  <button type="button" className="auth-eye-btn"
                    onClick={() => setShowConfirm((v) => !v)}
                    aria-label={showConfirm ? "Hide" : "Show"}>
                    {showConfirm ? "🙈" : "👁️"}
                  </button>
                  {passwordsMatch   && <span className="auth-check-icon">✅</span>}
                  {passwordsMismatch && <span className="auth-check-icon">❌</span>}
                </div>
                {passwordsMismatch && <p className="auth-field-error">Passwords do not match</p>}
              </div>

              {/* Terms */}
              <label className="auth-checkbox-label auth-terms-label">
                <input type="checkbox" checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)} />
                <span>
                  I agree to the{" "}
                  <button type="button" className="auth-inline-link"
                    onClick={() => setMessage({ text: "Terms coming soon!", type: "info" })}>
                    Terms &amp; Conditions
                  </button>
                  {" "}and{" "}
                  <button type="button" className="auth-inline-link"
                    onClick={() => setMessage({ text: "Privacy policy coming soon!", type: "info" })}>
                    Privacy Policy
                  </button>
                </span>
              </label>

              {message.text && (
                <div className={`auth-message auth-message--${message.type}`} role="alert">
                  {message.type === "error"   && <span>⚠️</span>}
                  {message.type === "success" && <span>✅</span>}
                  {message.type === "info"    && <span>ℹ️</span>}
                  {message.text}
                </div>
              )}

              <button type="submit" className="auth-submit-btn"
                disabled={loading || passwordsMismatch}>
                {loading
                  ? <span className="auth-spinner-row"><span className="auth-spinner" />Creating account…</span>
                  : `Create ${role === "vendor" ? "Vendor" : "Customer"} Account →`}
              </button>
            </form>

            <div className="auth-divider"><span>or</span></div>

            <button type="button" className="auth-social-btn" onClick={triggerRealGooglePrompt}>
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" width="18" height="18" />
              Sign up with Google
            </button>

            <p className="auth-switch-text">
              Already have an account? <Link to="/login">Sign in here</Link>
            </p>
          </div>
        </main>

      </div>
    </div>
  );
}

export default Register;
