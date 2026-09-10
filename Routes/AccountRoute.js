const express = require("express");

const {
  createAccount,
  getBalance,
  getAccountDetails,
} = require("../Controllers/AccountController");

const { protect } = require("../Middleware/auth");

const router = express.Router();

// Create account for the authenticated, onboarded customer
router.post("/account", protect, createAccount);

// Get authenticated customer's balance
router.get("/balance", protect, getBalance);

// Get authenticated customer's full account details
router.get("/details", protect, getAccountDetails);

module.exports = router;