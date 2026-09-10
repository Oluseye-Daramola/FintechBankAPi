const Customer = require("../Models/Customers");

const {
  verifyBVN,
  verifyNIN,
} = require("./nibssclient");

const verifyCustomer = async ({
  customerId,
  verificationType,
  verificationValue,
}) => {
  // Find customer
  const customer = await Customer.findById(customerId);

  if (!customer) {
    throw new Error("Customer not found"); 
  }

  // Check if customer is already verified
  if (customer.onboardingStatus === "verified") {
    throw new Error("Customer has already been verified");
  }

  let verificationResult;

  // =========================
  // BVN VERIFICATION
  // =========================
  if (verificationType === "BVN") {
    verificationResult = await verifyBVN({
      bvn: verificationValue,
      firstName: customer.fullName.split(" ")[0],
      lastName: customer.fullName.split(" ").slice(1).join(" "),
      dob: customer.dob,
      phone: customer.phone,
    });
  }

  // =========================
  // NIN VERIFICATION
  // =========================
  else if (verificationType === "NIN") {
    verificationResult = await verifyNIN({
      nin: verificationValue,
      firstName: customer.fullName.split(" ")[0],
      lastName: customer.fullName.split(" ").slice(1).join(" "),
      dob: customer.dob,
    });
  }

  // Invalid verification type
  else {
    throw new Error("Verification type must be BVN or NIN");
  }

  // Make sure Nibss returned something
  if (!verificationResult) {
    throw new Error("Verification failed");
  }

  // Update customer after successful verification
  customer.onboardingStatus = "verified";
  customer.verificationType = verificationType;

  // Store a reference to the verification
  customer.verificationRef =
    verificationResult.reference ||
    verificationResult.transactionReference ||
    verificationValue;

  customer.verifiedAt = new Date();

  await customer.save();

  return {
    customerId: customer._id,
    onboardingStatus: customer.onboardingStatus,
    verificationType: customer.verificationType,
    verificationRef: customer.verificationRef,
    verifiedAt: customer.verifiedAt,
  };
};

module.exports = {
  verifyCustomer,
};