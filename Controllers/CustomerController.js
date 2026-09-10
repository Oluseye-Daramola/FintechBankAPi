const Customer = require("../Models/Customers");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const OnboardingService = require("../Services/OnboardingService");

// Register a new customer
const registerCustomer = async (req, res) => {
  try {
    const { fullName, email, phone, dob, password, gender } = req.body;

    // Check if all required fields were provided
    if (!fullName || !email || !phone || !dob || !password || !gender) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Check if customer already exists
    const existingCustomer = await Customer.findOne({
      $or: [{ email }, { phone }],
    });

    if (existingCustomer) {
      return res.status(409).json({
        success: false,
        message: "Customer with this email or phone already exists",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create customer
    const customer = await Customer.create({
      fullName,
      email,
      phone,
      dob,
      password: hashedPassword,
      gender,
      onboardingStatus: "pending",
    });

    return res.status(201).json({
      success: true,
      message: "Customer registered successfully",
      customer: {
        id: customer._id,
        fullName: customer.fullName,
        email: customer.email,
        phone: customer.phone,
        onboardingStatus: customer.onboardingStatus,
      },
    });
  } catch (error) {
    console.error("Register customer error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Customer onboarding
const onboardCustomer = async (req, res) => {
  try {
    const {
      customerId,
      verificationType,
      verificationValue,
    } = req.body;

    // Check required fields
    if (!customerId || !verificationType || !verificationValue) {
      return res.status(400).json({
        success: false,
        message:
          "Customer ID, verification type and verification value are required",
      });
    }

    // Normalize verification type
    const type = String(verificationType).trim().toUpperCase();

    // Check verification type
    if (!["BVN", "NIN"].includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Verification type must be either BVN or NIN",
      });
    }

    // Verify customer
    const result = await OnboardingService.verifyCustomer({
      customerId,
      verificationType: type,
      verificationValue: String(verificationValue).trim(),
    });

    // Successful response
    return res.status(200).json({
      success: true,
      message: "Customer verified successfully",
      data: result,
    });
  } catch (error) {
    console.error("Customer onboarding error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Customer onboarding failed",
    });
  }
};


// Customer login
const loginCustomer = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if email and password are provided
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Find customer
    const customer = await Customer.findOne({ email });

    if (!customer) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Compare password
    const passwordMatch = await bcrypt.compare(
      password,
      customer.password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Generate JWT
    const token = jwt.sign(
      {
        id: customer._id,
        email: customer.email,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      customer: {
        id: customer._id,
        fullName: customer.fullName,
        email: customer.email,
        onboardingStatus: customer.onboardingStatus,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  registerCustomer,
  onboardCustomer,
  loginCustomer,
};