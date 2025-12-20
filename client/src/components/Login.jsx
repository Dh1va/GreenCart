import React, { useEffect, useRef, useState } from "react";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";

const Login = () => {
  const {
    axios,
    setUser,
    setShowUserLogin,
    navigate,
    redirectAfterLogin,
    setRedirectAfterLogin,
  } = useAppContext();

  const [step, setStep] = useState("mobile"); // mobile | otp
  const [mobile, setMobile] = useState("");
  const [name, setName] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(30);

  const otpRefs = useRef([]);

  /* ---------------- TIMER ---------------- */
  useEffect(() => {
    if (step !== "otp" || timer === 0) return;
    const interval = setInterval(() => {
      setTimer((t) => t - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [step, timer]);

  /* ---------------- SEND OTP ---------------- */
  const sendOtp = async () => {
    if (mobile.length !== 10) {
      toast.error("Enter valid 10-digit mobile number");
      return;
    }

    try {
      setLoading(true);
      const { data } = await axios.post("/api/auth/send-otp", { mobile });

      if (data.success) {
        toast.success("OTP sent");
        setStep("otp");
        setTimer(30);
        setOtp(["", "", "", "", "", ""]);
        setTimeout(() => otpRefs.current[0]?.focus(), 100);
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
    const otpValue = otp.join("");
    if (otpValue.length !== 6) {
      toast.error("Enter complete OTP");
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
        setUser(data.user);
        toast.success("Logged in successfully");
        setShowUserLogin(false);

        if (redirectAfterLogin) {
          navigate(redirectAfterLogin);
          setRedirectAfterLogin(null);
        } else {
          navigate("/");
        }
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- OTP INPUT HANDLER ---------------- */
  const handleOtpChange = (index, value) => {
    if (!/^[0-9]?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  return (
    <div
      onClick={() => setShowUserLogin(false)}
      className="fixed inset-0 z-30 flex items-center justify-center bg-black/50 text-sm text-gray-600"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-80 sm:w-[360px] bg-white p-8 rounded-lg shadow-xl border"
      >
        <p className="text-2xl font-medium text-center mb-6">
          <span className="text-primary">User</span> Login
        </p>

        {/* ---------- MOBILE STEP ---------- */}
        {step === "mobile" && (
          <>
            <div className="mb-4">
              <p>Mobile Number</p>
              <input
                type="tel"
                value={mobile}
                onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
                placeholder="10-digit mobile number"
                maxLength={10}
                className="w-full mt-1 p-2 border rounded outline-primary"
              />
            </div>

            <div className="mb-4">
              <p>Name (first time only)</p>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="w-full mt-1 p-2 border rounded outline-primary"
              />
            </div>

            <button
              onClick={sendOtp}
              disabled={loading}
              className={`w-full py-2 rounded-md text-white ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-primary hover:bg-primary-dull"
              }`}
            >
              {loading ? "Sending OTP..." : "Continue"}
            </button>
          </>
        )}

        {/* ---------- OTP STEP ---------- */}
        {step === "otp" && (
          <>
            <p className="text-center mb-4">
              Enter OTP sent to <b>{mobile}</b>
            </p>

            <div className="flex justify-between gap-2 mb-4">
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => (otpRefs.current[i] = el)}
                  value={digit}
                  onChange={(e) =>
                    handleOtpChange(i, e.target.value)
                  }
                  onKeyDown={(e) => handleOtpKeyDown(i, e)}
                  maxLength={1}
                  className="w-10 h-10 text-center border rounded text-lg outline-primary"
                />
              ))}
            </div>

            <button
              onClick={verifyOtp}
              disabled={loading}
              className={`w-full py-2 rounded-md text-white ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-primary hover:bg-primary-dull"
              }`}
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>

            <div className="text-center mt-4">
              {timer > 0 ? (
                <p className="text-gray-500">
                  Resend OTP in {timer}s
                </p>
              ) : (
                <button
                  onClick={sendOtp}
                  className="text-primary hover:underline"
                >
                  Resend OTP
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Login;
