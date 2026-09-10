const axios = require("axios");

const { getNibssToken } = require("../Config/nibss");

const BASE_URL = process.env.NIBSS_BASE_URL;

// Verify BVN
const verifyBVN = async ({
  bvn,
  firstName,
  lastName,
  dob,
  phone,
}) => {
  try {
    const token = await getNibssToken();

    const headers = {
      Authorization: `Bearer ${token}`,
    };

    // Insert BVN
    await axios.post(
      `${BASE_URL}/api/insertBvn`,
      {
        bvn,
        firstName,
        lastName,
        dob,
        phone,
      },
      {
        headers,
        timeout: 5000,
      }
    );

    // Validate BVN
    const response = await axios.post(
      `${BASE_URL}/api/validateBvn`,
      {
        bvn,
      },
      {
        headers,
        timeout: 5000,
      }
    );

    return response.data;
 } catch (error) {
  const nibssMessage = error.response?.data?.message || error.message;

  console.error("BVN verification error:", nibssMessage);

  // Distinguish "already exists" as a conflict, not a server error
  if (nibssMessage.toLowerCase().includes("already exists")) {
    const conflictError = new Error(nibssMessage);
    conflictError.statusCode = 409;
    throw conflictError;
  }

  throw new Error(nibssMessage || "BVN verification failed");
}
};

// Verify NIN
const verifyNIN = async ({
  nin,
  firstName,
  lastName,
  dob,
}) => {
  try {
    const token = await getNibssToken();

    const headers = {
      Authorization: `Bearer ${token}`,
    };

    // Insert NIN
    await axios.post(
      `${BASE_URL}/api/insertNin`,
      {
        nin,
        firstName,
        lastName,
        dob,
      },
      {
        headers,
        timeout: 5000,
      }
    );

    // Validate NIN
    const response = await axios.post(
      `${BASE_URL}/api/validateNin`,
      {
        nin,
      },
      {
        headers,
        timeout: 5000,
      }
    );

    return response.data;
  } catch (error) {
    console.error(
      "NIN verification error:",
      error.response?.data || error.message
    );

    throw new Error(
      error.response?.data?.message ||
        "NIN verification failed"
    );
  }
};


// Name Enquiry — verify recipient details before a transfer
const nameEnquiry = async (accountNumber) => {
  try {
    const token = await getNibssToken();

     console.log("BASE_URL is:", BASE_URL); // ← add this
    console.log("Full URL:", `${BASE_URL}/api/account/name-enquiry/${accountNumber}`); // ← and this

    const headers = {
      Authorization: `Bearer ${token}`,
    };

    const response = await axios.get(
      `${BASE_URL}/api/account/name-enquiry/${accountNumber}`,
      {
        headers,
        timeout: 5000,
      }
    );

    return response.data;
  } catch (error) {
    console.error(
      "Name enquiry error:",
      error.response?.data || error.message
    );

    throw new Error(
      error.response?.data?.message || "Name enquiry failed"
    );
  }
};




// Create account on NIBSS using the customer's verified KYC
const createNibssAccount = async ({ kycType, kycID, dob }) => {
  try {
    const token = await getNibssToken();

    const headers = {
      Authorization: `Bearer ${token}`,
    };

    const response = await axios.post(
      `${BASE_URL}/api/account/create`,
      {
        kycType,   // "bvn" or "nin" — lowercase, per NIBSS's example
        kycID,
        dob,       // format: "YYYY-MM-DD"
      },
      {
        headers,
        timeout: 5000,
      }
    );

    return response.data.account; // the nested "account" object
  } catch (error) {
    console.error(
      "NIBSS account creation error:",
      error.response?.data || error.message
    );

    throw new Error(
      error.response?.data?.message || "NIBSS account creation failed"
    );
  }
};


// Transfer funds
const transferFunds = async ({ from, to, amount }) => {
  try {
    const token = await getNibssToken();
    const headers = { Authorization: `Bearer ${token}` };

    const response = await axios.post(
      `${BASE_URL}/api/transfer`,
      { from, to, amount },
      { headers, timeout: 5000 }
    );

    return response.data;
  } catch (error) {
    console.error("Transfer error:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Transfer failed");
  }
};

// Get real-time balance from NIBSS (used to sync local DB after a transfer)
const getNibssBalance = async (accountNumber) => {
  try {
    const token = await getNibssToken();
    const headers = { Authorization: `Bearer ${token}` };

    const response = await axios.get(
      `${BASE_URL}/api/account/balance/${accountNumber}`,
      { headers, timeout: 5000 }
    );

    return response.data;
  } catch (error) {
    console.error("Get NIBSS balance error:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Failed to fetch balance");
  }
};

module.exports = {
  verifyBVN,
  verifyNIN,
  nameEnquiry,
  createNibssAccount,
  transferFunds,
  getNibssBalance,
};