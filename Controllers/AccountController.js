const Account = require("../Models/Accounts");
const Customer = require("../Models/Customers");
const { createNibssAccount } = require("../Services/nibssclient");

const createAccount = async (req, res) => {
  try {
    const customerId = req.user.id;

    const customer = await Customer.findById(customerId);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    if (customer.onboardingStatus !== "verified") {
      return res.status(403).json({
        success: false,
        message: "Customer must complete BVN/NIN verification before creating an account",
      });
    }

    const existingAccount = await Account.findOne({ customerId });

    if (existingAccount) {
      return res.status(409).json({
        success: false,
        message: "Customer already has an account",
      });
    }

    // Format dob as YYYY-MM-DD for NIBSS
    const dob = customer.dob.toISOString().split("T")[0];

    // Call NIBSS to create the account using the customer's verified KYC
    const nibssAccount = await createNibssAccount({
      kycType: customer.verificationType.toLowerCase(), // "BVN" -> "bvn"
      kycID: customer.verificationRef,
      dob,
    });

    // Mirror NIBSS's account data locally
    const account = await Account.create({
      accountNumber: nibssAccount.accountNumber,
      accountName: nibssAccount.accountName,
      bankCode: nibssAccount.bankCode,
      nibssFintechId: nibssAccount.fintechId,
      customerId,
      balance: nibssAccount.balance,
    });

    return res.status(201).json({
      success: true,
      message: "Account created successfully",
      account: {
        id: account._id,
        accountNumber: account.accountNumber,
        accountName: account.accountName,
        bankCode: account.bankCode,
        balance: account.balance,
        currency: account.currency,
        status: account.status,
      },
    });
  } catch (error) {
    console.error("Create account error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Customer already has an account",
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};


// Get the logged-in customer's account balance
const getBalance = async (req, res) => {
  try {
    const customerId = req.user.id;

    const account = await Account.findOne({ customerId });

    if (!account) {
      return res.status(404).json({
        success: false,
        message: "Account not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        accountNumber: account.accountNumber,
        balance: account.balance,
        currency: account.currency,
        status: account.status,
      },
    });
  } catch (error) {
    console.error("Get balance error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get the logged-in customer's full account details
const getAccountDetails = async (req, res) => {
  try {
    const customerId = req.user.id;

    const account = await Account.findOne({ customerId });

    if (!account) {
      return res.status(404).json({
        success: false,
        message: "Account not found",
      });
    }

    return res.status(200).json({
      success: true,
      account,
    });
  } catch (error) {
    console.error("Get account details error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  createAccount,
  getBalance,
  getAccountDetails,
};