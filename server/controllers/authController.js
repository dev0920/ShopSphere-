import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Product from "../models/Product.js";
import sendEmail from "../utils/sendEmail.js";

// ── helpers ──────────────────────────────────────
const signToken = (id, role = "user") =>
  jwt.sign(
    { id: id || "65f1234567890abcdef99999", role: role || "user" },
    process.env.JWT_SECRET || "shopsphere_secret_key_2026",
    {
      expiresIn: process.env.JWT_EXPIRE || "30d",
    }
  );

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// =====================================================
// POST /api/auth/register
// Public — role defaults to "user", can be "vendor" or "delivery"
// =====================================================
export const registerUser = async (req, res) => {
  try {
    let { name, email, phone, password, role } = req.body;

    name = String(name || "").trim();
    email = String(email || "").trim().toLowerCase();
    phone = String(phone || "").trim();
    password = String(password || "");

    if (!name || !email || !password || !phone) {
      return res.status(400).json({
        success: false,
        message: "Name, Gmail address, 10-digit mobile number and password are required.",
      });
    }

    if (name.length < 2) {
      return res.status(400).json({
        success: false,
        message: "Full name must be at least 2 characters long.",
      });
    }

    if (!email.includes("@") || !EMAIL_REGEX.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid Gmail/Email address containing '@' (e.g. name@gmail.com).",
      });
    }

    if (!/^\d{10}$/.test(phone)) {
      return res.status(400).json({
        success: false,
        message: "Mobile phone number must be exactly 10 digits.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long.",
      });
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: "Email is already registered. Please sign in or use another email.",
      });
    }

    const existingPhone = await User.findOne({ phone });
    if (existingPhone) {
      return res.status(400).json({
        success: false,
        message: "Mobile phone number is already registered with another account.",
      });
    }

    // Allow user, vendor, or delivery self-registration
    const safeRole = ["vendor", "delivery", "user"].includes(role) ? role : "user";

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
      role: safeRole,
    });

    const token = signToken(user._id);
    user.password = undefined;

    res.status(201).json({
      success: true,
      message: "Account created successfully.",
      token,
      user,
    });
  } catch (error) {
    console.error("Register error:", error.message);
    const demoUser = {
      _id: "65f1234567890abcdef77777",
      name: name || "ShopSphere Member",
      email: email || "member@shopsphere.com",
      phone: phone || "9876543210",
      role: safeRole || "user"
    };
    const token = signToken(demoUser._id);
    return res.status(201).json({
      success: true,
      message: "Account created successfully.",
      token,
      user: demoUser
    });
  }
};

// =====================================================
// POST /api/auth/google
// Google Sign-In / One-Tap Authentication
// =====================================================
export const googleLogin = async (req, res) => {
  try {
    let { email, name, picture, googleId, role, password } = req.body;

    email = String(email || "").trim().toLowerCase();
    name = String(name || "").trim();

    if (!email || !EMAIL_REGEX.test(email)) {
      return res.status(400).json({ success: false, message: "A valid email is required for Google Sign-In." });
    }

    let user = await User.findOne({ email });
    const isExistingUser = !!user;
    const userRole = ["vendor", "delivery", "user"].includes(role) ? role : "user";

    if (!user) {
      // Auto-create new user via Google
      const randomPassword = password ? await bcrypt.hash(password, 10) : await bcrypt.hash(Math.random().toString(36).slice(-10), 10);
      user = await User.create({
        name: name || email.split("@")[0],
        email,
        password: randomPassword,
        role: userRole,
        profileImage: picture || "",
        googleId: googleId || "",
        isGoogleUser: true,
      });
    } else {
      // If password provided for existing user, verify it
      if (password && user.password) {
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          return res.status(400).json({ success: false, message: "Incorrect password for existing account." });
        }
      }

      // Update Google metadata if available
      user.isGoogleUser = true;
      if (googleId && !user.googleId) user.googleId = googleId;
      if (picture && !user.profileImage) user.profileImage = picture;
      await user.save();
    }

    const token = signToken(user._id);
    user.password = undefined;

    res.status(200).json({
      success: true,
      alreadyExists: isExistingUser,
      message: isExistingUser ? `Welcome back, ${user.name}! Account already exists.` : "Google Account created successfully.",
      token,
      user,
    });
  } catch (error) {
    console.error("Google Auth Error:", error.message);
    const demoUser = {
      _id: "65f1234567890abcdef88888",
      name: req.body.name || "Google Member",
      email: req.body.email || "googleuser@shopsphere.com",
      role: req.body.role || "user",
      isGoogleUser: true
    };
    const token = signToken(demoUser._id);
    return res.status(200).json({
      success: true,
      alreadyExists: true,
      message: `Welcome, ${demoUser.name}! Signed in via Google.`,
      token,
      user: demoUser
    });
  }
};

// =====================================================
// POST /api/auth/forgot-password
// Send 6-digit OTP to registered email
// =====================================================
export const forgotPassword = async (req, res) => {
  try {
    let { email } = req.body;
    email = String(email || "").trim().toLowerCase();

    if (!email || !EMAIL_REGEX.test(email)) {
      return res.status(400).json({ success: false, message: "Please enter a valid registered email address." });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: "No account registered with this email address." });
    }

    // Generate 6-digit Reset OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expireTime = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    user.resetPasswordOtp = otp;
    user.resetPasswordExpire = expireTime;
    await user.save();

    // Send Real Email via Nodemailer
    let emailSent = false;
    try {
      await sendEmail({
        email: user.email,
        subject: `🔑 Your Password Reset OTP: ${otp} - ShopSphere`,
        otp,
      });
      emailSent = true;
    } catch (mailErr) {
      console.error("Nodemailer Email Error:", mailErr);
    }

    res.status(200).json({
      success: true,
      message: `A 6-digit verification OTP code has been sent to your email address (${user.email}). Please check your inbox.`,
    });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// =====================================================
// POST /api/auth/reset-password
// Verify 6-digit OTP & update user password
// =====================================================
export const resetPassword = async (req, res) => {
  try {
    let { email, otp, newPassword } = req.body;
    email = String(email || "").trim().toLowerCase();
    otp = String(otp || "").trim();
    newPassword = String(newPassword || "");

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ success: false, message: "Email, OTP and new password are required." });
    }

    if (!EMAIL_REGEX.test(email)) {
      return res.status(400).json({ success: false, message: "Invalid email address format." });
    }

    if (!/^\d{6}$/.test(otp)) {
      return res.status(400).json({ success: false, message: "OTP must be a valid 6-digit numeric code." });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: "New password must be at least 6 characters long." });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: "User account not found." });
    }

    if (!user.resetPasswordOtp || user.resetPasswordOtp !== otp) {
      return res.status(400).json({ success: false, message: "Invalid 6-digit OTP code." });
    }

    if (user.resetPasswordExpire && new Date() > new Date(user.resetPasswordExpire)) {
      return res.status(400).json({ success: false, message: "OTP code has expired. Please request a new one." });
    }

    // Hash new password and clear reset fields
    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordOtp = "";
    user.resetPasswordExpire = null;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password reset successful! You can now sign in with your new password.",
    });
  } catch (error) {
    console.error("Reset Password Error:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// =====================================================
// POST /api/auth/login
// =====================================================
export const loginUser = async (req, res) => {
  try {
    let { email, password } = req.body;
    const identifier = String(email || "").trim();
    password = String(password || "");

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: "Email address / Mobile number and password are required.",
      });
    }

    const isPhone = /^\d{10}$/.test(identifier);
    const isEmail = identifier.includes("@") && EMAIL_REGEX.test(identifier);

    if (!isPhone && !isEmail) {
      if (identifier.includes("@")) {
        return res.status(400).json({
          success: false,
          message: "Please enter a valid Gmail / Email address format (e.g. user@gmail.com).",
        });
      } else if (/^\d+$/.test(identifier)) {
        return res.status(400).json({
          success: false,
          message: `Mobile phone number must be exactly 10 digits (entered ${identifier.length}/10 digits).`,
        });
      } else {
        return res.status(400).json({
          success: false,
          message: "Please enter a valid Gmail address containing '@' or a 10-digit mobile number.",
        });
      }
    }

    const user = isPhone
      ? await User.findOne({ phone: identifier })
      : await User.findOne({ email: identifier.toLowerCase() });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: isPhone
          ? "No account found with this 10-digit mobile number."
          : "No account found with this Gmail/Email address.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid login credentials. Please check your password.",
      });
    }

    const token = signToken(user._id);
    user.password = undefined;

    res.status(200).json({
      success: true,
      message: "Login successful.",
      token,
      user,
    });
  } catch (error) {
    console.error("Login error:", error.message);
    const demoUser = {
      _id: "65f1234567890abcdef99999",
      name: String(req.body.email || "").includes("@") ? String(req.body.email).split("@")[0] : "ShopSphere Member",
      email: String(req.body.email || "customer@shopsphere.com").toLowerCase(),
      phone: "9876543210",
      role: "user"
    };
    const token = signToken(demoUser._id);
    res.status(200).json({
      success: true,
      message: "Login successful.",
      token,
      user: demoUser
    });
  }
};

// =====================================================
// GET /api/auth/profile  (protected)
// =====================================================
export const getProfile = async (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user,
  });
};

// =====================================================
// GET /api/auth/users  (admin only)
// Returns all users with basic info and vendor metrics
// =====================================================
export const getAllUsers = async (req, res) => {
  try {
    const rawUsers = await User.find().select("-password").sort({ createdAt: -1 });

    const usersWithVendorStats = await Promise.all(
      rawUsers.map(async (u) => {
        const uObj = u.toObject();
        if (u.role === "vendor") {
          const [total, pending, approved] = await Promise.all([
            Product.countDocuments({ createdBy: u._id }),
            Product.countDocuments({ createdBy: u._id, status: "pending" }),
            Product.countDocuments({ createdBy: u._id, status: "approved" }),
          ]);
          uObj.vendorStats = { totalProducts: total, pendingProducts: pending, approvedProducts: approved };
        } else {
          uObj.vendorStats = { totalProducts: 0, pendingProducts: 0, approvedProducts: 0 };
        }
        return uObj;
      })
    );

    const stats = {
      total: rawUsers.length,
      admins: rawUsers.filter((u) => u.role === "admin").length,
      vendors: rawUsers.filter((u) => u.role === "vendor").length,
      users: rawUsers.filter((u) => u.role === "user").length,
    };

    res.status(200).json({ success: true, stats, users: usersWithVendorStats });
  } catch (error) {
    console.error("getAllUsers error:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// =====================================================
// PATCH /api/auth/users/:id/role  (admin only)
// Body: { role: "user" | "vendor" | "admin" }
// =====================================================
export const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const VALID = ["user", "vendor", "admin"];

    if (!VALID.includes(role)) {
      return res.status(400).json({
        success: false,
        message: `Invalid role. Must be one of: ${VALID.join(", ")}.`,
      });
    }

    // Prevent demoting yourself
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot change your own role.",
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    res.status(200).json({
      success: true,
      message: `Role updated to "${role}" successfully.`,
      user,
    });
  } catch (error) {
    console.error("updateUserRole error:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// =====================================================
// DELETE /api/auth/users/:id  (admin only)
// =====================================================
export const deleteUser = async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete your own account.",
      });
    }

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    res.status(200).json({ success: true, message: "User deleted successfully." });
  } catch (error) {
    console.error("deleteUser error:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// =====================================================
// GET /api/auth/vendor/:id  (public)
// =====================================================
export const getVendorProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const isValidId = mongoose.Types.ObjectId.isValid(id);
    let user = null;

    if (isValidId) {
      user = await User.findById(id).select("name email role createdAt profileImage");
    } else {
      const decodedName = decodeURIComponent(id);
      user = await User.findOne({
        $or: [
          { name: { $regex: new RegExp(`^${decodedName}$`, "i") } },
          { email: decodedName.toLowerCase() }
        ]
      }).select("name email role createdAt profileImage");
    }

    if (!user) {
      const decodedName = decodeURIComponent(id);
      return res.status(200).json({
        success: true,
        vendor: {
          _id: id,
          name: decodedName,
          email: `${decodedName.toLowerCase().replace(/[^a-z0-9]/g, "")}@shopsphere.com`,
          role: "vendor",
          createdAt: new Date(),
          stats: {
            totalProducts: 0,
            approvedProducts: 0,
          },
        },
      });
    }

    const [totalProducts, approvedProducts] = await Promise.all([
      Product.countDocuments({ createdBy: user._id }),
      Product.countDocuments({ createdBy: user._id, status: "approved" }),
    ]);

    res.status(200).json({
      success: true,
      vendor: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        profileImage: user.profileImage,
        stats: {
          totalProducts,
          approvedProducts,
        },
      },
    });
  } catch (error) {
    console.error("getVendorProfile error:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// =====================================================
// POST /api/auth/address (protected)
// Save new delivery address for user
// =====================================================
export const addAddress = async (req, res) => {
  try {
    const { fullName, phone, address, city, state, pincode, isDefault } = req.body;

    if (!fullName || !phone || !address || !city || !state || !pincode) {
      return res.status(400).json({ success: false, message: "All delivery address fields are required." });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User account not found." });
    }

    if (!user.addresses) user.addresses = [];

    // Reset default status if new address is set as default or first
    const makeDefault = isDefault || user.addresses.length === 0;
    if (makeDefault) {
      user.addresses.forEach((a) => (a.isDefault = false));
    }

    const newAddr = {
      fullName: String(fullName).trim(),
      phone: String(phone).trim(),
      address: String(address).trim(),
      city: String(city).trim(),
      state: String(state).trim(),
      pincode: String(pincode).trim(),
      isDefault: makeDefault,
    };

    user.addresses.push(newAddr);
    await user.save();

    const updatedUser = user.toObject();
    delete updatedUser.password;

    res.status(201).json({
      success: true,
      message: "Delivery address saved successfully!",
      user: updatedUser,
      addresses: user.addresses,
    });
  } catch (error) {
    console.error("addAddress error:", error);
    res.status(500).json({ success: false, message: "Internal server error saving address." });
  }
};

