// =====================================================
// Email Utility — Nodemailer Service for ShopSphere
// =====================================================

import nodemailer from "nodemailer";

/**
 * Send Email helper function using Nodemailer
 * @param {Object} options - { email, subject, message, html }
 */
export const sendEmail = async (options) => {
  const userEmail = process.env.EMAIL_USER || "devanshbhatiya102@gmail.com";
  const pass = (process.env.EMAIL_PASS || "").replace(/\s+/g, "");

  // Create SMTP Transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: false, // true for 465, false for 587
    auth: {
      user: userEmail,
      pass: pass,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  const mailOptions = {
    from: `"ShopSphere Marketplace" <${userEmail}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html || `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px;">
        <div style="text-align: center; border-bottom: 2px solid #0f172a; padding-bottom: 16px; margin-bottom: 20px;">
          <h1 style="color: #0f172a; font-size: 24px; font-weight: 900; margin: 0;">🛍️ ShopSphere</h1>
          <p style="color: #64748b; font-size: 12px; margin: 4px 0 0;">India's Premier Social E-Commerce Marketplace</p>
        </div>

        <h2 style="color: #0f172a; font-size: 18px; font-weight: 800;">Password Reset Request</h2>
        <p style="color: #475569; font-size: 14px; line-height: 1.5;">
          Hello,<br/><br/>
          We received a request to reset the password for your ShopSphere account (<strong>${options.email}</strong>).
        </p>

        <div style="background-color: #f8fafc; border: 2px dashed #9333ea; border-radius: 10px; padding: 18px; text-align: center; margin: 24px 0;">
          <span style="font-size: 12px; font-weight: 800; color: #64748b; letter-spacing: 1px; text-transform: uppercase; display: block; margin-bottom: 6px;">Your 6-Digit Verification OTP</span>
          <span style="font-size: 32px; font-weight: 900; color: #9333ea; letter-spacing: 6px;">${options.otp || "849201"}</span>
        </div>

        <p style="color: #64748b; font-size: 13px; line-height: 1.4;">
          ⏳ This verification code is valid for <strong>15 minutes</strong>.<br/>
          🔒 If you did not request a password reset, please ignore this email or contact support immediately.
        </p>

        <div style="border-top: 1px solid #cbd5e1; margin-top: 24px; padding-top: 16px; text-align: center; font-size: 11px; color: #94a3b8;">
          © ${new Date().getFullYear()} ShopSphere E-Commerce Pvt Ltd. All rights reserved.<br/>
          Plot No. 102, ShopSphere Towers, SG Highway, Ahmedabad, Gujarat - 380054
        </div>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("📨 Email sent successfully:", info.messageId);
    return info;
  } catch (err) {
    console.warn("⚠️ Nodemailer Email notice (supressed):", err.message);
    return null;
  }
};

/**
 * Send Order Tax Invoice Email via Nodemailer
 * @param {Object} order - Order document populated with items, shippingAddress, totalAmount, etc.
 * @param {String} recipientEmail - User's email address
 */
export const sendOrderInvoiceEmail = async (order, recipientEmail) => {
  const invoiceNo = `INV-2026-${order._id ? order._id.toString().slice(-8).toUpperCase() : '894021'}`;
  const totalAmt = Number(order.totalAmount || 0);
  const taxableAmt = (totalAmt / 1.18).toFixed(2);
  const totalGst = (totalAmt - taxableAmt).toFixed(2);
  const cgst = (totalGst / 2).toFixed(2);
  const sgst = (totalGst / 2).toFixed(2);

  const itemsRowsHtml = (order.items || []).map((item, idx) => `
    <tr style="border-bottom: 1px solid #e2e8f0;">
      <td style="padding: 10px; font-size: 12px; color: #475569;">${idx + 1}</td>
      <td style="padding: 10px; font-size: 13px;"><strong>${item.name}</strong></td>
      <td style="padding: 10px; font-size: 12px; color: #64748b;">${item.seller || "ShopSphere Vendor"}</td>
      <td style="padding: 10px; font-size: 12px; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; font-size: 12px; text-align: right;">₹${Number(item.price).toLocaleString("en-IN")}</td>
      <td style="padding: 10px; font-size: 13px; text-align: right; font-weight: 800; color: #0f172a;">₹${(Number(item.price) * Number(item.quantity)).toLocaleString("en-IN")}</td>
    </tr>
  `).join("");

  const emailHtml = `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 650px; margin: 0 auto; padding: 24px; background-color: #ffffff; border: 2px solid #0f172a; border-radius: 12px;">
      <!-- Header -->
      <div style="border-bottom: 2px solid #0f172a; padding-bottom: 16px; margin-bottom: 20px;">
        <h2 style="margin: 0; font-size: 20px; font-weight: 900; color: #0f172a;">🛍️ ShopSphere E-Commerce Pvt Ltd</h2>
        <p style="margin: 2px 0 0; font-size: 11px; color: #64748b;">India's Premier Social E-Commerce Marketplace</p>
        <div style="font-size: 11px; color: #475569; margin-top: 6px; line-height: 1.4;">
          Plot No. 102, ShopSphere Towers, SG Highway, Ahmedabad, Gujarat - 380054<br/>
          <strong>GSTIN:</strong> 24AAACS9842M1Z8 | <strong>PAN:</strong> AAACS9842M<br/>
          📞 Support: 1800-419-7890 | ✉️ billing@shopsphere.com
        </div>
      </div>

      <!-- Tax Invoice Title & Meta -->
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; margin-bottom: 20px;">
        <span style="background-color: #0f172a; color: #ffffff; font-size: 10px; font-weight: 900; padding: 3px 8px; border-radius: 4px; text-transform: uppercase;">OFFICIAL TAX INVOICE</span>
        <h3 style="margin: 6px 0 2px; font-size: 16px; color: #9333ea; font-weight: 900;">${invoiceNo}</h3>
        <span style="font-size: 12px; color: #64748b;">Order Date: ${new Date(order.createdAt || Date.now()).toLocaleDateString("en-IN")}</span>
        <div style="font-size: 12px; color: #475569; margin-top: 8px; line-height: 1.5;">
          <strong>Payment Mode:</strong> ${order.paymentMethod === "UPI" ? `Instant UPI (${order.paymentDetails?.upiId || "Merchant UPI"})` : order.paymentMethod === "CARD" ? "Debit / Credit Card (3D Secure)" : "Cash on Delivery (COD)"}<br/>
          <strong>Payment Status:</strong> <span style="color: #166534; font-weight: 800;">${order.paymentStatus === "PAID" || order.paymentMethod !== "COD" ? "PAID ONLINE ✅" : "PENDING (COD)"}</span><br/>
          ${order.paymentDetails?.utrNumber ? `<strong>Bank UTR / Ref No:</strong> <span style="font-family: monospace; color: #16a34a; font-weight: 800;">#${order.paymentDetails.utrNumber}</span><br/>` : ""}
          <strong>Txn ID:</strong> <span style="font-family: monospace; color: #9333ea; font-weight: 700;">${order.transactionId || "TXN_ONLINE_SETTLED"}</span>
        </div>
      </div>

      <!-- Shipping Address -->
      <div style="background-color: #ffffff; border: 1px solid #cbd5e1; border-radius: 8px; padding: 14px; margin-bottom: 20px;">
        <div style="font-size: 11px; font-weight: 800; color: #9333ea; text-transform: uppercase; margin-bottom: 4px;">📍 Shipped & Billed To:</div>
        <strong style="font-size: 14px; color: #0f172a;">${order.shippingAddress?.fullName || "Valued Customer"}</strong><br/>
        <span style="font-size: 12px; color: #475569; line-height: 1.4; display: block; margin-top: 2px;">
          ${order.shippingAddress?.address}<br/>
          ${order.shippingAddress?.city}, ${order.shippingAddress?.state} - <strong>${order.shippingAddress?.pincode}</strong><br/>
          📞 Phone: ${order.shippingAddress?.phone}
        </span>
      </div>

      <!-- Items Table -->
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <thead>
          <tr style="background-color: #f1f5f9; border-bottom: 2px solid #cbd5e1; text-align: left; font-size: 11px; color: #475569;">
            <th style="padding: 8px;">#</th>
            <th style="padding: 8px;">Product Description</th>
            <th style="padding: 8px;">Seller</th>
            <th style="padding: 8px; text-align: center;">Qty</th>
            <th style="padding: 8px; text-align: right;">Unit Price</th>
            <th style="padding: 8px; text-align: right;">Total (₹)</th>
          </tr>
        </thead>
        <tbody>
          ${itemsRowsHtml}
        </tbody>
      </table>

      <!-- Breakdown & Totals -->
      <div style="border-top: 2px solid #0f172a; padding-top: 14px; margin-bottom: 20px;">
        <div style="font-size: 12px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
            <span>Taxable Subtotal:</span>
            <span>₹${taxableAmt}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 4px; color: #64748b;">
            <span>CGST (9%):</span>
            <span>₹${cgst}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 4px; color: #64748b;">
            <span>SGST (9%):</span>
            <span>₹${sgst}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 4px; color: #166534;">
            <span>Delivery & Packaging:</span>
            <span>FREE ⚡</span>
          </div>
          <div style="display: flex; justify-content: space-between; border-top: 2px solid #0f172a; padding-top: 6px; font-size: 16px; font-weight: 900; color: #0f172a;">
            <span>Grand Total Paid:</span>
            <span>₹${totalAmt.toLocaleString("en-IN")}</span>
          </div>
        </div>
      </div>

      <!-- Footer Stamp -->
      <div style="border-top: 1px dashed #cbd5e1; padding-top: 12px; display: flex; justify-content: space-between; align-items: center;">
        <span style="font-size: 11px; color: #166534; font-weight: 800; background-color: #f0fdf4; padding: 4px 8px; border-radius: 4px;">
          ✅ Digitally Verified GST Tax Invoice • ShopSphere Marketplace
        </span>
        <div style="text-align: right; font-size: 11px; color: #0f172a; font-weight: 800;">
          For ShopSphere E-Commerce Pvt. Ltd.
        </div>
      </div>
    </div>
  `;

  return sendEmail({
    email: recipientEmail,
    subject: `🛍️ Order Confirmed! Tax Invoice #${invoiceNo} - ShopSphere`,
    html: emailHtml,
  });
};

/**
 * Send Vendor New Order Notification Email via Nodemailer
 * @param {Object} order - Order document
 * @param {Array} vendorItems - List of order items belonging to this vendor
 * @param {Object} vendorUser - Vendor user object { name, email }
 */
export const sendVendorOrderNotificationEmail = async (order, vendorItems, vendorUser) => {
  const invoiceNo = `INV-2026-${order._id ? order._id.toString().slice(-8).toUpperCase() : '894021'}`;
  
  let vendorTotalGross = 0;
  const itemsHtml = vendorItems.map((item, idx) => {
    const itemTotal = Number(item.price) * Number(item.quantity);
    vendorTotalGross += itemTotal;
    return `
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 10px; font-size: 12px; color: #475569;">${idx + 1}</td>
        <td style="padding: 10px; font-size: 13px;"><strong>${item.name}</strong></td>
        <td style="padding: 10px; font-size: 12px; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; font-size: 12px; text-align: right;">₹${Number(item.price).toLocaleString("en-IN")}</td>
        <td style="padding: 10px; font-size: 13px; text-align: right; font-weight: 800; color: #0f172a;">₹${itemTotal.toLocaleString("en-IN")}</td>
      </tr>
    `;
  }).join("");

  const netVendorProfit = (vendorTotalGross * 0.95).toFixed(2);

  const emailHtml = `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 650px; margin: 0 auto; padding: 24px; background-color: #ffffff; border: 2px solid #2563eb; border-radius: 12px;">
      <!-- Header -->
      <div style="border-bottom: 2px solid #2563eb; padding-bottom: 16px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;">
        <div>
          <h2 style="margin: 0; font-size: 20px; font-weight: 900; color: #0f172a;">🏪 ShopSphere Supplier Portal</h2>
          <p style="margin: 2px 0 0; font-size: 12px; color: #2563eb; font-weight: 800;">🎉 0% Commission Vendor Dispatch Alert</p>
        </div>
        <span style="background-color: #2563eb; color: #ffffff; font-size: 11px; font-weight: 900; padding: 6px 12px; border-radius: 6px;">
          NEW ORDER #ORDER-${order._id ? order._id.toString().slice(-6).toUpperCase() : '84920'}
        </span>
      </div>

      <!-- Greeting & Overview -->
      <p style="color: #0f172a; font-size: 15px; font-weight: 700; margin-bottom: 8px;">
        Hello ${vendorUser.name || "Valued ShopSphere Vendor"},
      </p>
      <p style="color: #475569; font-size: 14px; line-height: 1.5; margin-bottom: 20px;">
        🎉 Great news! A customer just placed an order for your product(s) on ShopSphere. Please prepare the package for courier dispatch.
      </p>

      <!-- Customer Shipping Address -->
      <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 14px; margin-bottom: 20px;">
        <div style="font-size: 11px; font-weight: 800; color: #1d4ed8; text-transform: uppercase; margin-bottom: 4px;">🚚 Customer Shipping Address:</div>
        <strong style="font-size: 14px; color: #0f172a;">${order.shippingAddress?.fullName || "Customer"}</strong><br/>
        <span style="font-size: 12px; color: #334155; line-height: 1.4; display: block; margin-top: 2px;">
          ${order.shippingAddress?.address}<br/>
          ${order.shippingAddress?.city}, ${order.shippingAddress?.state} - <strong>${order.shippingAddress?.pincode}</strong><br/>
          📞 Phone: ${order.shippingAddress?.phone}
        </span>
      </div>

      <!-- Ordered Items Table -->
      <h3 style="font-size: 14px; font-weight: 800; color: #0f172a; margin: 0 0 10px;">🛍️ Items to Pack & Dispatch:</h3>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <thead>
          <tr style="background-color: #f1f5f9; border-bottom: 2px solid #cbd5e1; text-align: left; font-size: 11px; color: #475569;">
            <th style="padding: 8px;">#</th>
            <th style="padding: 8px;">Product Name</th>
            <th style="padding: 8px; text-align: center;">Qty</th>
            <th style="padding: 8px; text-align: right;">Unit Price</th>
            <th style="padding: 8px; text-align: right;">Gross Payout</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>

      <!-- Profit Calculation Box -->
      <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 14px; margin-bottom: 20px;">
        <div style="display: flex; justify-content: space-between; font-size: 13px; color: #166534; margin-bottom: 4px;">
          <span>Gross Product Total:</span>
          <strong>₹${vendorTotalGross.toLocaleString("en-IN")}</strong>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 13px; color: #166534; margin-bottom: 4px;">
          <span>Platform Fee (5%):</span>
          <span>- ₹${(vendorTotalGross * 0.05).toFixed(2)}</span>
        </div>
        <div style="display: flex; justify-content: space-between; border-top: 2px solid #166534; padding-top: 6px; font-size: 16px; font-weight: 900; color: #166534;">
          <span>Your 95% Net Vendor Profit:</span>
          <span>₹${Number(netVendorProfit).toLocaleString("en-IN")}</span>
        </div>
      </div>

      <!-- Action Button -->
      <div style="text-align: center; margin-top: 24px;">
        <a href="http://localhost:5173/vendor-dashboard" style="background-color: #2563eb; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-size: 14px; font-weight: 900; display: inline-block;">
          📦 Log into Vendor Dashboard to Update Dispatch Status
        </a>
      </div>
    </div>
  `;

  return sendEmail({
    email: vendorUser.email,
    subject: `📦 NEW ORDER RECEIVED! Dispatch Alert #${invoiceNo} - ShopSphere Vendor Hub`,
    html: emailHtml,
  });
};

/**
 * Send Customer Dispatch & Delivery Executive Notification Email
 * @param {Object} order - Order document populated with user, shippingAddress, deliveryBoyName, deliveryBoyPhone, deliveryOtp
 */
export const sendOrderDispatchedEmail = async (order) => {
  const recipientEmail = order.user?.email || order.shippingAddress?.email;
  if (!recipientEmail) return;

  const emailHtml = `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 650px; margin: 0 auto; padding: 24px; background-color: #ffffff; border: 2px solid #166534; border-radius: 12px;">
      <!-- Header -->
      <div style="border-bottom: 2px solid #166534; padding-bottom: 16px; margin-bottom: 20px;">
        <h2 style="margin: 0; font-size: 20px; font-weight: 900; color: #0f172a;">🚚 Order Dispatched! - ShopSphere</h2>
        <p style="margin: 2px 0 0; font-size: 12px; color: #166534; font-weight: 800;">Your package has left the vendor facility and is out for delivery!</p>
      </div>

      <p style="color: #0f172a; font-size: 15px; font-weight: 700; margin-bottom: 8px;">
        Hello ${order.shippingAddress?.fullName || "Valued Customer"},
      </p>
      <p style="color: #475569; font-size: 14px; line-height: 1.5; margin-bottom: 20px;">
        Great news! Your order <strong>#${order._id.toString().slice(-6).toUpperCase()}</strong> has been packed and handed over to our delivery partner.
      </p>

      <!-- Delivery Executive Card -->
      <div style="background-color: #f0fdf4; border: 2px solid #bbf7d0; border-radius: 10px; padding: 18px; margin-bottom: 20px;">
        <div style="font-size: 12px; font-weight: 900; color: #166534; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">
          🚚 Assigned Delivery Executive & Handoff OTP
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <div style="font-size: 16px; font-weight: 900; color: #0f172a;">👨‍💼 ${order.deliveryBoyName || "Ramesh Kumar (Ekart Express)"}</div>
            <div style="font-size: 13px; color: #166534; font-weight: 700; margin-top: 2px;">📞 Driver Phone: ${order.deliveryBoyPhone || "+91 98765 43210"}</div>
          </div>
          <div style="text-align: right; background-color: #ffffff; border: 2px dashed #166534; padding: 8px 14px; border-radius: 8px;">
            <span style="font-size: 10px; font-weight: 800; color: #64748b; display: block;">DELIVERY OTP</span>
            <span style="font-size: 24px; font-weight: 900; color: #166534; letter-spacing: 3px;">${order.deliveryOtp || "4920"}</span>
          </div>
        </div>
      </div>

      <!-- Instructions -->
      <p style="font-size: 13px; color: #64748b; line-height: 1.4;">
        🔒 <strong>Safety Note:</strong> Please share the 4-digit Delivery OTP code <strong>(${order.deliveryOtp})</strong> with your delivery agent only upon receiving your parcel.
      </p>
    </div>
  `;

  return sendEmail({
    email: recipientEmail,
    subject: `🚚 Order Dispatched! Delivery Agent: ${order.deliveryBoyName || "Ramesh Kumar"} (OTP: ${order.deliveryOtp || "4920"}) - ShopSphere`,
    html: emailHtml,
  });
};

/**
 * Send Order Cancellation & Refund Email Notification
 */
export const sendOrderCancelledRefundEmail = async (order, userEmail) => {
  try {
    const isOnlinePaid = order.paymentStatus === "PAID" || order.paymentStatus === "REFUNDED" || order.paymentMethod !== "COD";
    const refundRef = order.paymentDetails?.refundId || `RFND_${Date.now()}`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px;">
        <div style="text-align: center; border-bottom: 2px solid #be123c; padding-bottom: 16px; margin-bottom: 20px;">
          <h1 style="color: #be123c; font-size: 24px; font-weight: 900; margin: 0;">❌ Order Cancelled</h1>
          <p style="color: #64748b; font-size: 12px; margin: 4px 0 0;">ShopSphere E-Commerce Marketplace</p>
        </div>

        <p style="color: #334155; font-size: 14px;">
          Dear Customer,<br/><br/>
          Your order <strong>#${order._id.toString().slice(-6).toUpperCase()}</strong> has been cancelled.
        </p>

        ${isOnlinePaid ? `
          <div style="background-color: #f0fdf4; border: 2px solid #bbf7d0; border-radius: 12px; padding: 18px; margin: 20px 0;">
            <div style="font-size: 14px; font-weight: 900; color: #166534;">🟢 ONLINE REFUND INITIATED</div>
            <div style="font-size: 20px; font-weight: 900; color: #15803d; margin: 6px 0;">₹${Number(order.totalAmount).toLocaleString("en-IN")}</div>
            <div style="font-size: 12px; color: #166534; line-height: 1.5;">
              <strong>Refund Reference ID:</strong> <span style="font-family: monospace;">${refundRef}</span><br/>
              <strong>Status:</strong> Processing back to original payment account (GPay/PhonePe/Card)<br/>
              <strong>Estimated Credit:</strong> 24-48 business hours
            </div>
          </div>
        ` : `
          <div style="background-color: #fffbeb; border: 1.5px solid #fde68a; border-radius: 12px; padding: 16px; margin: 20px 0;">
            <div style="font-size: 13px; font-weight: 800; color: #92400e;">💵 Cash on Delivery (COD) Order</div>
            <div style="font-size: 12px; color: #b45309; margin-top: 4px;">Since this was a COD order, no payment was collected and no refund is required.</div>
          </div>
        `}

        <div style="font-size: 12px; color: #64748b; margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0; text-align: center;">
          Thank you for using ShopSphere. Reach out to billing@shopsphere.com for any questions.
        </div>
      </div>
    `;

    await sendEmail({
      email: userEmail,
      subject: `❌ Order Cancelled & ${isOnlinePaid ? 'Refund Initiated' : 'Confirmation'} - #${order._id.toString().slice(-6).toUpperCase()}`,
      html: html,
    });
  } catch (err) {
    console.error("Cancellation Email Error:", err);
  }
};

export default sendEmail;
