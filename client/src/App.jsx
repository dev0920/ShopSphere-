import { Routes, Route } from "react-router-dom";
import "./App.css";

// Pages
import Home             from "./pages/Home.jsx";
import Login            from "./pages/Login.jsx";
import Register         from "./pages/Register.jsx";
import Catalogue        from "./pages/Catalogue.jsx";
import Cart             from "./pages/Cart.jsx";
import Checkout         from "./pages/Checkout.jsx";
import OrderSuccess     from "./pages/OrderSuccess.jsx";
import MyOrders         from "./pages/MyOrders.jsx";
import ProductDetails   from "./pages/ProductDetails.jsx";
import ResellerDashboard from "./pages/ResellerDashboard.jsx";
import AdminDashboard   from "./pages/AdminDashboard.jsx";
import VendorDashboard  from "./pages/VendorDashboard.jsx";
import VendorStore      from "./pages/VendorStore.jsx";
import SellOnline       from "./pages/SellOnline.jsx";
import DeliveryDashboard from "./pages/DeliveryDashboard.jsx";

// Route guard
import ProtectedRoute, { CustomerOnlyRoute } from "./components/ProtectedRoute.jsx";

function App() {
  return (
    <Routes>
      {/* ── Public / Customer UI (Redirects vendor/admin/delivery to their dashboards) ── */}
      <Route path="/"          element={<CustomerOnlyRoute><Home /></CustomerOnlyRoute>} />
      <Route path="/login"     element={<Login />} />
      <Route path="/register"  element={<Register />} />
      <Route path="/catalogue" element={<CustomerOnlyRoute><Catalogue /></CustomerOnlyRoute>} />
      <Route path="/product/:id" element={<CustomerOnlyRoute><ProductDetails /></CustomerOnlyRoute>} />
      <Route path="/vendor/:id" element={<CustomerOnlyRoute><VendorStore /></CustomerOnlyRoute>} />
      <Route path="/sell-online" element={<CustomerOnlyRoute><SellOnline /></CustomerOnlyRoute>} />
      <Route path="/sell" element={<CustomerOnlyRoute><SellOnline /></CustomerOnlyRoute>} />
      <Route path="/delivery-dashboard" element={
        <ProtectedRoute allowedRoles={["delivery"]}><DeliveryDashboard /></ProtectedRoute>
      } />
      <Route path="/delivery-portal" element={
        <ProtectedRoute allowedRoles={["delivery"]}><DeliveryDashboard /></ProtectedRoute>
      } />

      {/* ── Customer / User only (Shopping, Cart, Checkout & Orders) ── */}
      <Route path="/cart" element={
        <ProtectedRoute allowedRoles={["user"]}><Cart /></ProtectedRoute>
      } />
      <Route path="/checkout" element={
        <ProtectedRoute allowedRoles={["user"]}><Checkout /></ProtectedRoute>
      } />
      <Route path="/order-success" element={
        <ProtectedRoute allowedRoles={["user"]}><OrderSuccess /></ProtectedRoute>
      } />
      <Route path="/my-orders" element={
        <ProtectedRoute allowedRoles={["user"]}><MyOrders /></ProtectedRoute>
      } />
      <Route path="/reseller-hub" element={
        <ProtectedRoute allowedRoles={["user"]}><ResellerDashboard /></ProtectedRoute>
      } />

      {/* ── Vendor only ── */}
      <Route path="/vendor-dashboard" element={
        <ProtectedRoute allowedRoles={["vendor"]}>
          <VendorDashboard />
        </ProtectedRoute>
      } />

      {/* ── Admin only ── */}
      <Route path="/admin-dashboard" element={
        <ProtectedRoute allowedRoles={["admin"]}>
          <AdminDashboard />
        </ProtectedRoute>
      } />

      {/* Admin path */}
      <Route path="/admin" element={
        <ProtectedRoute allowedRoles={["admin"]}>
          <AdminDashboard />
        </ProtectedRoute>
      } />

      {/* ── 404 fallback ── */}
      <Route path="*" element={
        <div style={{ textAlign: "center", padding: "80px 20px" }}>
          <h1 style={{ fontSize: "60px" }}>404</h1>
          <p style={{ color: "#888" }}>Page not found.</p>
          <a href="/" style={{ color: "#f43397", fontWeight: 700 }}>← Back to Home</a>
        </div>
      } />
    </Routes>
  );
}

export default App;
