import { API_BASE_URL } from "../config/apiConfig";
import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "../styles/auth.css";

// Redirect to the right dashboard based on role
function getDashboardPath(role) {
  if (role === "admin")    return "/admin-dashboard";
  if (role === "vendor")   return "/vendor-dashboard";
  if (role === "delivery") return "/delivery-dashboard";
  return "/";
}

function Login() {
  const [email,        setEmail]        = useState("");
  const [password,     setPassword]     = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe,   setRememberMe]   = useState(false);
  const [message,      setMessage]      = useState({ text: "", type: "" });
  const [loading,      setLoading]      = useState(false);
  const navigate  = useNavigate();
  const location  = useLocation();

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage({ text: "", type: "" });

    const trimmedInput = email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isPhone = /^\d{10}$/.test(trimmedInput);
    const isEmail = trimmedInput.includes("@") && emailRegex.test(trimmedInput);

    if (!trimmedInput) {
      return setMessage({ text: "Please enter your Email address or 10-digit Mobile Number.", type: "error" });
    }

    if (!isEmail && !isPhone) {
      if (trimmedInput.includes("@")) {
        return setMessage({ text: "Invalid Email address format. Please enter full email (e.g. user@gmail.com).", type: "error" });
      } else if (/^\d+$/.test(trimmedInput)) {
        return setMessage({ text: `Mobile phone number must be exactly 10 digits (entered ${trimmedInput.length}/10 digits).`, type: "error" });
      } else {
        return setMessage({ text: "Please enter a valid Gmail address containing '@' or a 10-digit mobile number.", type: "error" });
      }
    }

    if (!password) {
      return setMessage({ text: "Please enter your password.", type: "error" });
    }

    setLoading(true);

    try {
      const res  = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email: trimmedInput, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setMessage({ text: data.message || "Login failed. Please try again.", type: "error" });
        setLoading(false);
        return;
      }

      // Persist auth token and user data in both localStorage and sessionStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("user",  JSON.stringify(data.user));
      sessionStorage.setItem("token", data.token);
      sessionStorage.setItem("user",  JSON.stringify(data.user));

      setMessage({ text: "Login successful! Redirecting…", type: "success" });

      // Non-customer roles (vendor, admin, delivery) MUST always go to their dashboard
      const from = location.state?.from?.pathname;
      let dest = getDashboardPath(data.user.role);
      if (data.user.role === "user" && from && from !== "/login" && from !== "/register") {
        dest = from;
      }

      setTimeout(() => {
        window.location.href = dest;
      }, 500);
    } catch (err) {
      console.error("Login Error:", err);
      setMessage({ text: "Unable to connect to server.", type: "error" });
      setLoading(false);
    }
  };

  const REAL_GOOGLE_CLIENT_ID = "59730576369-05lvqfqkgau6hf87iel62c7slp8f5r9k.apps.googleusercontent.com";

  const [googleClientId] = useState(
    localStorage.getItem("google_client_id") || import.meta.env.VITE_GOOGLE_CLIENT_ID || REAL_GOOGLE_CLIENT_ID
  );

  useEffect(() => {
    // Load real Google Identity Services script on mount
    const activeClientId = googleClientId || REAL_GOOGLE_CLIENT_ID;
    const existingScript = document.getElementById("google-gsi-script");
    
    const initScript = () => {
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

    if (!existingScript) {
      const script = document.createElement("script");
      script.id = "google-gsi-script";
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = initScript;
      document.body.appendChild(script);
    } else {
      initScript();
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

  const handleGoogleLogin = async (googleEmail, googleName, picture = "", googleId = "", pwd = "") => {
    setMessage({ text: "", type: "" });
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: googleEmail, name: googleName, picture, googleId, password: pwd }),
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
        setMessage({ text: `✅ Account Already Exists! Welcome back, ${data.user.name} 👋 (Logging in…)`, type: "success" });
      } else {
        setMessage({ text: `🎉 Google Sign-In successful! Welcome, ${data.user.name} 🎉`, type: "success" });
      }

      const from = location.state?.from?.pathname;
      let dest = getDashboardPath(data.user.role);
      if (data.user.role === "user" && from && from !== "/login" && from !== "/register") {
        dest = from;
      }

      setTimeout(() => {
        window.location.href = dest;
      }, 500);
    } catch (error) {
      setMessage({ text: "Unable to connect to Google Auth server.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState(1);
  const [resetEmail, setResetEmail] = useState("");
  const [resetOtp, setResetOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [resetMessage, setResetMessage] = useState({ text: "", type: "" });
  const [resetLoading, setResetLoading] = useState(false);

  const openForgotModal = () => {
    setResetEmail(email || "");
    setResetOtp("");
    setNewPassword("");
    setConfirmNewPassword("");
    setForgotStep(1);
    setResetMessage({ text: "", type: "" });
    setShowForgotModal(true);
  };

  const handleSendResetOtp = async (e) => {
    e.preventDefault();
    setResetMessage({ text: "", type: "" });

    const trimmedResetEmail = resetEmail.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!trimmedResetEmail || !emailRegex.test(trimmedResetEmail)) {
      return setResetMessage({ text: "Please enter a valid registered email address.", type: "error" });
    }

    setResetLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmedResetEmail }),
      });
      const data = await res.json();

      if (!res.ok) {
        setResetMessage({ text: data.message || "Failed to send reset OTP.", type: "error" });
        setResetLoading(false);
        return;
      }

      setForgotStep(2);
      setResetMessage({ text: data.message || `Password reset OTP sent to ${trimmedResetEmail}! Check your inbox.`, type: "success" });
    } catch {
      setResetMessage({ text: "Unable to connect to server.", type: "error" });
    } finally {
      setResetLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setResetMessage({ text: "", type: "" });

    const trimmedResetEmail = resetEmail.trim();
    const trimmedOtp = resetOtp.trim();

    if (!/^\d{6}$/.test(trimmedOtp)) {
      setResetMessage({ text: "Please enter a valid 6-digit numeric OTP code.", type: "error" });
      return;
    }

    if (newPassword.length < 6) {
      setResetMessage({ text: "New password must be at least 6 characters.", type: "error" });
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setResetMessage({ text: "Passwords do not match.", type: "error" });
      return;
    }

    setResetLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmedResetEmail, otp: trimmedOtp, newPassword }),
      });
      const data = await res.json();

      if (!res.ok) {
        setResetMessage({ text: data.message || "Failed to reset password.", type: "error" });
        setResetLoading(false);
        return;
      }

      setEmail(resetEmail);
      setPassword(newPassword);
      setMessage({ text: "Password reset successful! You can now sign in with your new password.", type: "success" });
      setShowForgotModal(false);
    } catch {
      setResetMessage({ text: "Unable to connect to server.", type: "error" });
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="auth-page">

      {/* ── Forgot Password Reset Modal ── */}
      {showForgotModal && (
        <div className="chk-modal-backdrop" style={{ zIndex: 9999 }}>
          <div className="chk-modal-card" style={{ maxWidth: "440px", textAlign: "left" }}>
            <div style={{ textAlign: "center", marginBottom: "18px" }}>
              <span style={{ fontSize: "36px" }}>🔑</span>
              <h2 style={{ fontSize: "20px", fontWeight: 900, color: "#0f172a", margin: "6px 0 4px" }}>
                Reset Your Password
              </h2>
              <p style={{ fontSize: "13px", color: "#64748b", margin: 0 }}>
                {forgotStep === 1 ? "Enter your registered email to receive a 6-digit OTP code." : "Enter the 6-digit OTP and set your new password."}
              </p>
            </div>

            {resetMessage.text && (
              <div className={`auth-message auth-message--${resetMessage.type}`} style={{ marginBottom: "16px" }}>
                {resetMessage.type === "error" ? "⚠️ " : "✅ "}
                {resetMessage.text}
              </div>
            )}

            {forgotStep === 1 ? (
              <form onSubmit={handleSendResetOtp}>
                <div className="auth-field" style={{ marginBottom: "16px" }}>
                  <label htmlFor="reset-email">Registered Email Address</label>
                  <div className="auth-input-wrap">
                    <span className="auth-input-icon">✉️</span>
                    <input
                      id="reset-email"
                      type="email"
                      placeholder="name@example.com"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="auth-submit-btn"
                  disabled={resetLoading}
                  style={{ width: "100%" }}
                >
                  {resetLoading ? "Sending OTP Code…" : "⚡ Send Reset OTP Code →"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleResetPassword}>

                <div className="auth-field" style={{ marginBottom: "14px" }}>
                  <label htmlFor="reset-otp">6-Digit Reset OTP Code</label>
                  <div className="auth-input-wrap">
                    <span className="auth-input-icon">🔢</span>
                    <input
                      id="reset-otp"
                      type="text"
                      placeholder="Enter 6-digit OTP"
                      value={resetOtp}
                      onChange={(e) => setResetOtp(e.target.value)}
                      maxLength={6}
                      required
                    />
                  </div>
                </div>

                <div className="auth-field" style={{ marginBottom: "14px" }}>
                  <label htmlFor="reset-new-pass">New Password</label>
                  <div className="auth-input-wrap">
                    <span className="auth-input-icon">🔒</span>
                    <input
                      id="reset-new-pass"
                      type="password"
                      placeholder="Minimum 6 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="auth-field" style={{ marginBottom: "16px" }}>
                  <label htmlFor="reset-confirm-pass">Confirm New Password</label>
                  <div className="auth-input-wrap">
                    <span className="auth-input-icon">🔑</span>
                    <input
                      id="reset-confirm-pass"
                      type="password"
                      placeholder="Re-enter new password"
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="auth-submit-btn"
                  disabled={resetLoading}
                  style={{ width: "100%" }}
                >
                  {resetLoading ? "Updating Password…" : "🔒 Save New Password →"}
                </button>
              </form>
            )}

            <button
              type="button"
              onClick={() => setShowForgotModal(false)}
              style={{ width: "100%", marginTop: "12px", background: "#f1f5f9", color: "#475569", border: "1px solid #cbd5e1", padding: "10px", borderRadius: "8px", fontWeight: 700, fontSize: "13px", cursor: "pointer" }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="auth-container">

        {/* ── Brand panel ── */}
        <aside className="auth-brand">
          <div className="auth-brand-inner">
            <Link to="/" className="auth-brand-logo">🛍️</Link>
            <h1 className="auth-brand-name">ShopSphere</h1>
            <p className="auth-brand-tagline">
              Your one-stop destination for factory-direct prices and zero-investment reselling.
            </p>
            <ul className="auth-feature-list">
              <li>
                <span className="auth-feature-icon">🏭</span>
                <div><strong>Factory Direct Prices</strong><p>Save up to 70%</p></div>
              </li>
              <li>
                <span className="auth-feature-icon">🏪</span>
                <div><strong>Vendor Portal</strong><p>List &amp; manage your products</p></div>
              </li>
              <li>
                <span className="auth-feature-icon">🚚</span>
                <div><strong>Free Delivery &amp; COD</strong><p>On all orders across India</p></div>
              </li>
            </ul>
            <div className="auth-brand-stat-row">
              <div className="auth-stat"><strong>1L+</strong><span>Happy Shoppers</span></div>
              <div className="auth-stat"><strong>50K+</strong><span>Products</span></div>
              <div className="auth-stat"><strong>4.8★</strong><span>App Rating</span></div>
            </div>
          </div>
        </aside>

        {/* ── Form panel ── */}
        <main className="auth-form-side">
          <div className="auth-form-card">
            <Link to="/" className="auth-back-btn">← Back to Home</Link>

            <div className="auth-form-header">
              <h2>Welcome back 👋</h2>
              <p>Sign in to continue to your ShopSphere account</p>
            </div>

            {/* Role hint chips */}
            <div className="auth-role-hint-row">
              <span className="auth-role-chip auth-role-chip--user">🛍️ Customer</span>
              <span className="auth-role-chip auth-role-chip--vendor">🏪 Vendor</span>
              <span className="auth-role-chip auth-role-chip--admin">🛡️ Admin</span>
            </div>

            <form className="auth-form" onSubmit={handleLogin} noValidate>
              <div className="auth-field">
                <label htmlFor="login-email">Email / Gmail address or 10-Digit Mobile Number</label>
                <div className={`auth-input-wrap${
                  email.trim().length > 0 && (/^\d{10}$/.test(email.trim()) || (email.includes("@") && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())))
                    ? " auth-input-wrap--valid"
                    : email.trim().length > 0 && !email.includes("@") && !/^\d{10}$/.test(email.trim())
                    ? " auth-input-wrap--invalid"
                    : ""
                }`}>
                  <span className="auth-input-icon">{/^\d+$/.test(email.trim()) ? "📱" : "✉️"}</span>
                  <input id="login-email" type="text" placeholder="name@gmail.com or 10-digit Mobile"
                    value={email} onChange={(e) => setEmail(e.target.value)}
                    autoComplete="username" required />
                  {email.trim().length > 0 && (/^\d{10}$/.test(email.trim()) || (email.includes("@") && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))) && (
                    <span className="auth-check-icon">✅</span>
                  )}
                </div>
                {email.trim().length > 0 && !email.includes("@") && !/^\d+$/.test(email.trim()) && (
                  <p className="auth-field-error" style={{ color: "#ef4444", fontSize: "12px", marginTop: "4px" }}>
                    ⚠️ Email must contain '@' symbol (e.g. name@gmail.com)
                  </p>
                )}
                {email.trim().length > 0 && /^\d+$/.test(email.trim()) && email.trim().length !== 10 && (
                  <p className="auth-field-error" style={{ color: "#ef4444", fontSize: "12px", marginTop: "4px" }}>
                    ⚠️ Mobile number must be exactly 10 digits ({email.trim().length}/10 entered)
                  </p>
                )}
              </div>

              <div className="auth-field">
                <label htmlFor="login-password">Password</label>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon">🔒</span>
                  <input id="login-password" type={showPassword ? "text" : "password"}
                    placeholder="Enter your password" value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password" required />
                  <button type="button" className="auth-eye-btn"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Hide" : "Show"}>
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>

              <div className="auth-options-row">
                <label className="auth-checkbox-label">
                  <input type="checkbox" checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)} />
                  <span>Remember me</span>
                </label>
                <button type="button" className="auth-forgot-link" onClick={openForgotModal}>
                  Forgot password?
                </button>
              </div>

              {message.text && (
                <div className={`auth-message auth-message--${message.type}`} role="alert">
                  {message.type === "error"   && <span>⚠️</span>}
                  {message.type === "success" && <span>✅</span>}
                  {message.type === "info"    && <span>ℹ️</span>}
                  {message.text}
                </div>
              )}

              <button type="submit" className="auth-submit-btn" disabled={loading}>
                {loading
                  ? <span className="auth-spinner-row"><span className="auth-spinner" />Signing in…</span>
                  : "Sign In →"}
              </button>
            </form>

            <div className="auth-divider"><span>or</span></div>

            <button type="button" className="auth-social-btn" onClick={triggerRealGooglePrompt}>
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" width="18" height="18" />
              Continue with Google
            </button>

            <p className="auth-switch-text">
              Don&apos;t have an account?{" "}
              <Link to="/register">Create a free account</Link>
            </p>
          </div>
        </main>

      </div>
    </div>
  );
}

export default Login;
