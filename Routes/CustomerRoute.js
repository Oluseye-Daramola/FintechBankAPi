const express = require("express"); // Import the Express framework

const {
  registerCustomer,
  onboardCustomer,
  loginCustomer,
} = require("../Controllers/CustomerController"); // Import controller functions for customer operations

const router = express.Router(); // Create a new router instance

// Customer registration
router.post("/register", registerCustomer);

// Customer BVN/NIN onboarding
router.post("/onboard", onboardCustomer);

// Customer login
router.post("/login", loginCustomer); 

module.exports = router;