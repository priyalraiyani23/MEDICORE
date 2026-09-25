import User from "../models/userModel.js";
import Staff from "../models/staffModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            throw new Error("all fields are required");
        }
        const lowercaseEmail=email.toLowerCase();

    const salt = await bcrypt.genSalt(10);
    const hashedpassward = await bcrypt.hash(password,salt);

        const existingUser = await User.findOne({ email:lowercaseEmail })
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "user already exists",
            })
        }
        const user = await User.create({
            name,
            email : lowercaseEmail,
            password : hashedpassward,
        })

        res.status(201).json({
            success: true,
            message: "user registered successfully",
            data: user,
        })
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
        console.log(error);
    }
}

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and Password are required",
      });
    }

    const lowercaseEmail = email.toLowerCase();

    const user = await User.findOne({ email: lowercaseEmail });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    let isMatch = false;
    if (user.password) {
      if (user.password.startsWith('$2')) {
        isMatch = await bcrypt.compare(password, user.password);
      } else {
        isMatch = (password === user.password);
        if (isMatch) {
          try {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            user.password = hashedPassword;
            await user.save();
            console.log(`Auto-migrated plain-text password for ${user.email} to bcrypt hash.`);
          } catch (migrateErr) {
            console.error("Failed to migrate plain text password:", migrateErr);
          }
        }
      }
    }

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid Password",
      });
    }
const token = jwt.sign(
  { id: user._id },
  process.env.JWT_SECRET,
  { expiresIn: "7d" }
);

return res.status(200).json({
  success: true,
  message: "Login successful",
  token,
  data: user,
});
  } catch (error) {
        res.status(403).json({
            success: false,
            message: error.message
        });
        console.log(error);
  }
};

export const logoutUser = async (req, res) => {
    // For JWT, logout is typically handled client-side by deleting the token.
    res.status(200).json({ success: true, message: "Logged out successfully" });
}

export const googleLogin = async (req, res) => {
  try {
    const { token: accessToken } = req.body;
    
    if (!accessToken) {
      return res.status(400).json({ success: false, message: "Google access token is required" });
    }

    // Fetch user info from Google
    const googleRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    
    if (!googleRes.ok) {
      return res.status(401).json({ success: false, message: "Invalid Google token" });
    }

    const payload = await googleRes.json();
    const { email, name, picture } = payload;
    const lowercaseEmail = email.toLowerCase();

    let user = await User.findOne({ email: lowercaseEmail });
    
    if (!user) {
      // Create a new user without password since they use Google
      user = await User.create({
        name,
        email: lowercaseEmail,
        image: picture,
      });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      success: true,
      message: "Google login successful",
      token,
      data: user,
    });
  } catch (error) {
    res.status(403).json({
        success: false,
        message: error.message
    });
    console.log(error);
  }
};

export const loginStaff = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and Password are required",
      });
    }

    const lowercaseEmail = email.toLowerCase();
    const staff = await Staff.findOne({ email: lowercaseEmail });

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: "Staff member not found",
      });
    }

    if (staff.status !== "Active") {
      return res.status(403).json({
        success: false,
        message: "Your account is inactive. Please contact the administrator.",
      });
    }

    const isMatch = await bcrypt.compare(password, staff.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid Password",
      });
    }

    const token = jwt.sign(
      { id: staff._id, role: staff.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      data: {
        id: staff._id,
        name: staff.name,
        email: staff.email,
        role: staff.role,
        phone: staff.phone,
        address: staff.address
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
    console.log(error);
  }
};