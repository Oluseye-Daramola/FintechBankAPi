const mongoose = require("mongoose"); // Import mongoose

// Define the account schema

const accountSchema = new mongoose.Schema(
  {
    accountNumber: {
      type: String,
      required: true,
      unique: true,
    },
    accountName: {
      type: String,
      required: true,
    },
    bankCode: {
      type: String,
      required: true,
    },
    nibssFintechId: {
      type: String, // the "fintechId" NIBSS returned
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
      unique: true,
    },
    balance: {
      type: Number,
      required: true,
      default: 15000,
      min: 0,
    },
    currency: {
      type: String,
      required: true,
      default: "NGN",
    },
    status: {
      type: String,
      enum: ["active", "blocked", "closed"],
      default: "active",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Account", accountSchema); // Export the Account model for use in other parts of the application