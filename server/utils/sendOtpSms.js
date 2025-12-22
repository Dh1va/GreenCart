import axios from "axios";
import Otp from "../models/Otp.js";

export const sendOtpSms = async (mobile, otp) => {
  const message = `Dear Customer Your verification code for Pragadeesh Publication is ${otp}`;

  const url = "http://promo.smso2.com/api/sendhttp.php";

  const params = {
    authkey: process.env.SMSO2_AUTH_KEY,
    mobiles: mobile,                 // 10-digit mobile
    sender: process.env.SMSO2_SENDER_ID,
    route: 2,                        // transactional
    country: 0,                      // India
    DLT_TE_ID: process.env.SMSO2_TEMPLATE_ID,
    message: message,
  };

  const response = await axios.get(url, { params });
  return response.data;


};
