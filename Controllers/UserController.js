import User from "../Models/UserModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import sendEmail from "../utils/sendemail.js"; // Import the email utility

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET || "your-default-secret-key",
    { expiresIn: "24h" }
  );
};

// Register new user
export const register = async (req, res) => {
  try {
    const { name, email, password, role = "patient" } = req.body;
    
    console.log("Incoming request:", req.body); // Debugging
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.error("User already exists:", email);
      return res.status(400).json({ message: "Email already exists" });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create new user
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role
    });
    
    console.log("Saving user to database:", user); // Debugging
    
    // Save user
    await user.save();
    
    // Generate token
    const token = generateToken(user);
    user.tokens = [{ token }];
    await user.save();
    
    // Create HTML content for registration confirmation email
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #3498db;">Registration Successful!</h2>
        <p>Hello ${name},</p>
        <p>Thank you for registering with Future Focus Rwanda. Your account has been successfully created.</p>
        
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0; border: 1px solid #dee2e6;">
          <p><strong>Your account details:</strong></p>
          <p>Email: ${email}</p>
          <p>Role: ${role}</p>
        </div>
        
        <p>You can now log in to your account using your email and password.</p>
        
        <div style="margin-top: 30px; padding: 10px 0; border-top: 1px solid #eee;">
          <p>Best Regards,<br>Future Focus Rwanda Team</p>
        </div>
      </div>
    `;
    
    // Send confirmation email
    const subject = "Welcome to Future Focus Rwanda - Registration Successful";
    const emailSent = await sendEmail(email, subject, htmlContent);
    
    if (emailSent) {
      console.log("Registration confirmation email sent to:", email);
    } else {
      console.log("Failed to send registration email to:", email);
      // Note: We continue even if email fails - don't return an error to the user
    }
    
    console.log("User created successfully:", user); // Debugging
    
    // Return user data
    res.status(201).json({
      message: "Account created successfully!",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (error) {
    console.error("Registration error:", error); // Print full error
    res.status(500).json({ message: "Failed to register user", error: error.message });
  }
};

// Login user
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Validate password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate token
    const token = generateToken(user);
    
    // Update user token
    user.tokens = { token };
    await user.save();

    // Return user data
    res.status(200).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get user profile
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error("Profile error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};