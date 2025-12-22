import React, { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";
import OtpInput from "../components/OtpInput";

const Profile = () => {
  const { axios } = useAppContext();

  const [user, setUser] = useState(null);
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [step, setStep] = useState("view");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);

  useEffect(() => {
    axios.get("/api/profile").then(res => {
      setUser(res.data.user);
      setName(res.data.user.name);
    });
  }, []);

  const updateName = async () => {
    await axios.put("/api/profile/name", { name });
    toast.success("Name updated");
  };

  const sendOtp = async () => {
    await axios.post("/api/profile/mobile/send-otp", { mobile });
    toast.success("OTP sent");
    setStep("otp");
  };

  const verifyOtp = async () => {
    const otpValue = otp.join("");
    const res = await axios.post("/api/profile/mobile/verify", {
      mobile,
      otp: otpValue
    });

    if (res.data.success) {
      toast.success("Mobile updated");
      window.location.reload();
    } else {
      toast.error("Invalid OTP");
    }
  };

  return (
    <div className="max-w-xl mx-auto py-20">
      <h1 className="text-3xl font-medium mb-6">Your Profile</h1>

      {/* NAME */}
      <div className="mb-6">
        <p>Name</p>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          className="border p-2 w-full mt-1"
        />
        <button onClick={updateName} className="mt-2 text-primary">
          Save
        </button>
      </div>

      {/* MOBILE */}
      <div>
        <p>Mobile</p>
        <p className="text-gray-500">{user?.mobile}</p>

        {step === "view" && (
          <button onClick={() => setStep("mobile")} className="text-primary">
            Change mobile
          </button>
        )}

        {step === "mobile" && (
          <>
            <input
              placeholder="New mobile"
              value={mobile}
              onChange={e => setMobile(e.target.value)}
              className="border p-2 w-full mt-2"
            />
            <button onClick={sendOtp} className="mt-2 text-primary">
              Send OTP
            </button>
          </>
        )}

        {step === "otp" && (
          <>
            <OtpInput otp={otp} setOtp={setOtp} onEnter={verifyOtp} />
            <button onClick={verifyOtp} className="mt-4 text-primary">
              Verify & Update
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Profile;
