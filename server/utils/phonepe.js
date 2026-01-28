import axios from "axios";
import crypto from "crypto";

// Determines Host based on ENV
const BASE_URL =
  process.env.PHONEPE_ENV === "PROD"
    ? "https://api.phonepe.com/apis"
    : "https://api-preprod.phonepe.com/apis/pg-sandbox";

// Global Token Cache
let cachedToken = null;
let tokenExpiry = 0;

/* =====================================================
   1. AUTH TOKEN MANAGER (Singleton Pattern)
===================================================== */
const getAuthToken = async () => {
  const now = Math.floor(Date.now() / 1000);

  // Return cached token if valid (buffer 60s)
  if (cachedToken && tokenExpiry - 60 > now) {
    return cachedToken;
  }

  try {
    const params = new URLSearchParams({
      client_id: process.env.PHONEPE_CLIENT_ID,
      client_secret: process.env.PHONEPE_CLIENT_SECRET,
      client_version: process.env.PHONEPE_CLIENT_VERSION || 1,
      grant_type: "client_credentials",
    });

    const { data } = await axios.post(
      `${BASE_URL}${process.env.PHONEPE_ENV === "PROD" ? "/identity-manager" : ""}/v1/oauth/token`,
      params.toString(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    cachedToken = data.access_token;
    tokenExpiry = now + data.expires_in; // Store expiry time

    return cachedToken;
  } catch (error) {
    console.error("PhonePe Auth Error:", error.response?.data || error.message);
    throw new Error("PhonePe Authentication Failed");
  }
};

/* =====================================================
   2. CREATE PAYMENT REQUEST
===================================================== */
export const phonepeCreatePayment = async ({
  merchantTransactionId,
  amountInPaise,
  userId,
  redirectUrl,
  callbackUrl,
  mobileNumber
}) => {
  const token = await getAuthToken();

  // ✅ Standard V2 Payload (PG_CHECKOUT)
  // This structure is the most reliable for getting the Bank Page URL
  const payload = {
    merchantOrderId: merchantTransactionId,
    amount: amountInPaise,
    merchantUserId: String(userId),
    // mobileNumber: mobileNumber || "9999999999", // Optional: Commenting out to reduce errors
    callbackUrl: callbackUrl,
    
    paymentFlow: {
      type: "PG_CHECKOUT",
      merchantUrls: {
        redirectUrl: redirectUrl 
      }
    }
  };

  try {
    const { data } = await axios.post(
      `${BASE_URL}${process.env.PHONEPE_ENV === "PROD" ? "/pg" : ""}/checkout/v2/pay`,
      payload,
      {
        headers: {
          Authorization: `O-Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return data;
  } catch (error) {
    console.error("Create Payment Error:", error.response?.data || error.message);
    throw error;
  }
};
/* =====================================================
   3. CHECK STATUS (Server-to-Server)
===================================================== */
export const phonepeCheckStatus = async ({ merchantTransactionId }) => {
  const token = await getAuthToken();

  try {
    const { data } = await axios.get(
      `${BASE_URL}${process.env.PHONEPE_ENV === "PROD" ? "/pg" : ""}/checkout/v2/order/${merchantTransactionId}/status`,
      {
        headers: {
          Authorization: `O-Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return data;
  } catch (error) {
    console.error("Check Status Error:", error.response?.data || error.message);
    throw error;
  }
};