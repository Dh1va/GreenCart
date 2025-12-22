import React, { useRef, useEffect } from "react";

const OtpInput = ({ otp, setOtp, onEnter, disabled }) => {
  const inputsRef = useRef([]);

  const otpValue = otp.join("");

  useEffect(() => {
    if (otpValue.length === 6 && !otp.includes("")) {
      onEnter(); // ✅ AUTO SUBMIT
    }
  }, [otpValue]);

  const handleChange = (e, index) => {
    const value = e.target.value.replace(/\D/g, "");
    if (!value) return;

    const newOtp = [...otp];
    newOtp[index] = value[0];
    setOtp(newOtp);

    if (index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      const newOtp = [...otp];
      if (!newOtp[index] && index > 0) {
        inputsRef.current[index - 1]?.focus();
      }
      newOtp[index] = "";
      setOtp(newOtp);
    }

    if (e.key === "Enter") {
      onEnter();
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);

    if (pasted.length === 6) {
      setOtp(pasted.split(""));
      inputsRef.current[5]?.focus();
    }
  };

  return (
    <div className="flex justify-center gap-2" onPaste={handlePaste}>
      {otp.map((digit, index) => (
        <input
          key={index}
          ref={(el) => (inputsRef.current[index] = el)}
          type="text"
          inputMode="numeric"
          maxLength="1"
          value={digit}
          disabled={disabled}
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          className="w-10 h-12 border rounded text-center text-lg outline-primary"
        />
      ))}
    </div>
  );
};

export default OtpInput;
