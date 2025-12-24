import React, { useState, useEffect } from "react";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";
import OtpInput from "./OtpInput";

const Login = () => {
  const {
    setShowUserLogin,
    setUser,
    setCartItems,   // ✅ MISSING — THIS FIXES THE BUG
    axios,
    navigate,
    redirectAfterLogin,
    setRedirectAfterLogin,
     suppressCartAutoOpen,
  setSuppressCartAutoOpen
  } = useAppContext();


  const [step, setStep] = useState("mobile"); // mobile | otp | name
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  const otpValue = otp.join("");

  /* ---------------- RESEND TIMER ---------------- */
  useEffect(() => {
    if (resendTimer === 0) return;
    const t = setInterval(() => {
      setResendTimer((s) => s - 1);
    }, 1000);
    return () => clearInterval(t);
  }, [resendTimer]);

  /* ---------------- SEND OTP ---------------- */
  const sendOtp = async () => {
    if (!/^[6-9]\d{9}$/.test(mobile)) {
      toast.error("Enter valid 10-digit mobile number");
      return;
    }

    try {
      setLoading(true);
      const { data } = await axios.post("/api/auth/send-otp", { mobile });

      if (data.success) {
        toast.success("OTP sent");
        setStep("otp");
        setOtp(["", "", "", "", "", ""]);
        setResendTimer(30);
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- VERIFY OTP ---------------- */
  const verifyOtp = async () => {
    if (otpValue.length !== 6) {
      toast.error("Enter 6-digit OTP");
      return;
    }

    try {
      setLoading(true);
      const { data } = await axios.post("/api/auth/verify-otp", {
        mobile,
        otp: otpValue,
      });

      if (data.requireName) {
        setStep("name");
        return;
      }

      if (data.success) {
        finishLogin(data.user);
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- SUBMIT NAME ---------------- */
  const submitName = async () => {
    if (name.trim().length < 2) {
      toast.error("Enter your name");
      return;
    }

    try {
      setLoading(true);
      const { data } = await axios.post("/api/auth/verify-otp", {
        mobile,
        otp: otpValue,
        name,
      });

      if (data.success) {
        finishLogin(data.user);
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

 const finishLogin = async (user) => {
  const guestCart = JSON.parse(localStorage.getItem("guest_cart")) || {};

  setSuppressCartAutoOpen(true);
  setUser(user);

  let finalCart = user.cartItems || {};

  if (!user.hasMergedGuestCart && Object.keys(guestCart).length > 0) {
    finalCart = { ...finalCart, ...guestCart };
    await axios.post("/api/cart/mark-cart-merged");
    localStorage.removeItem("guest_cart");
  }

  setCartItems(finalCart);
  setShowUserLogin(false);

  // 🔐 ROLE-BASED REDIRECT (THIS WAS MISSING)
  if (user.role === "admin") {
    navigate("/admin");
  } else {
    navigate(redirectAfterLogin || "/");
  }

  setRedirectAfterLogin(null);
};




  return (
    <div
      onClick={() => setShowUserLogin(false)}
      className="fixed inset-0 z-30 flex items-center justify-center bg-black/50 text-sm text-gray-600"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex flex-col gap-4 p-8 py-10 w-80 sm:w-[352px] bg-white border border-gray-200 rounded-lg shadow-xl"
      >
        <p className="text-2xl font-medium text-center">
          <span className="text-primary">User</span> Login
        </p>

        {/* MOBILE STEP */}
        {step === "mobile" && (
          <>
            <input
              type="tel"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={10}
              value={mobile}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "");
                if (value.length <= 10) {
                  setMobile(value);
                }
              }}
              placeholder="Enter mobile number"
              className="w-full p-2 border rounded outline-primary"
            />

            <button
              onClick={sendOtp}
              disabled={loading}
              className="bg-primary text-white py-2 rounded hover:bg-primary-dull"
            >
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </>
        )}

        {/* OTP STEP */}
        {step === "otp" && (
          <>
            <OtpInput
              otp={otp}
              setOtp={setOtp}
              onEnter={verifyOtp}
              disabled={loading}
            />

            <button
              onClick={verifyOtp}
              disabled={loading || otpValue.length !== 6}
              className="bg-primary text-white py-2 rounded hover:bg-primary-dull mt-2"
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>

            {resendTimer > 0 ? (
              <p className="text-center text-gray-400">
                Resend OTP in {resendTimer}s
              </p>
            ) : (
              <button
                onClick={sendOtp}
                className="text-primary text-sm underline"
              >
                Resend OTP
              </button>
            )}
          </>
        )}

        {/* NAME STEP (FIRST LOGIN ONLY) */}
        {step === "name" && (
          <>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submitName()}
              placeholder="Your name"
              disabled={loading}
              className="border p-2 rounded outline-primary"
            />
            <button
              onClick={submitName}
              disabled={loading}
              className="bg-primary text-white py-2 rounded hover:bg-primary-dull"
            >
              {loading ? "Saving..." : "Continue"}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Login;
