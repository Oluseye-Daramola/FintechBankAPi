require("dotenv").config();

const axios = require("axios");

const BASE_URL = process.env.NIBSS_BASE_URL;

let cachedToken = null;
let tokenExpiry = null;

const getNibssToken = async () => {
  // Return existing token if it hasn't expired
  if (cachedToken && tokenExpiry && Date.now() < tokenExpiry) {
    return cachedToken;
  }

  try {
    const response = await axios.post(
      `${BASE_URL}/api/auth/token`,
      {
        apiKey: process.env.NIBSS_API_KEY,
        apiSecret: process.env.NIBSS_API_SECRET,
      }
    );

    cachedToken = response.data.token;

    // Cache token for 45 minutes
    tokenExpiry = Date.now() + 45 * 60 * 1000;

    return cachedToken;
  } catch (error) {
    console.error(
      "Nibss token error:",
      error.response?.data || error.message
    );

    throw new Error("Unable to authenticate with NibssByPhoenix");
  }
};

const clearTokenCache = () => {
  cachedToken = null;
  tokenExpiry = null;
};

module.exports = {
  BASE_URL,
  getNibssToken,
  clearTokenCache,
};
