const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    reference: {
      type: String,
      required: true,
      unique: true,
    },

    type: {
      type: String,
      enum: ["intra", "inter"],
      required: true,
    },

    fromAccount: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: true,
    },

    toAccount: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
    },
    toAccountNumber: {
      type: String,
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 1,
    },

    status: {
      type: String,
      enum: ["pending", "successful", "failed"],
      default: "pending",
    },

    nibssReference: {
      type: String,
    },

    initiatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Transaction", transactionSchema);