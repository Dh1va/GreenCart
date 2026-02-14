import React, { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";
import OtpInput from "../components/OtpInput";
import { User, Phone, Mail, Save, AlertCircle, Edit2, X } from "lucide-react";

const Profile = () => {
  const { axios } = useAppContext();

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  
  // Form States
  const [formData, setFormData] = useState({ name: "", email: "" });
  const [mobileData, setMobileData] = useState({ mobile: "", otp: ["", "", "", "", "", ""] });
  
  // UI States
  const [isEditingBasic, setIsEditingBasic] = useState(false);
  const [mobileStep, setMobileStep] = useState("view"); // view | input | otp
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data } = await axios.get("/api/profile");
      if (data.success) {
        setUser(data.user);
        setFormData({ 
            name: data.user.name || "", 
            email: data.user.email || "" 
        });
      }
    } catch (error) {
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  /* --- BASIC INFO HANDLERS --- */
  const handleSaveBasic = async () => {
    if(!formData.name.trim()) return toast.error("Name is required");
    
    setIsSaving(true);
    try {
      
      const { data } = await axios.put("/api/profile/basic", formData);
      if (data.success) {
        toast.success("Profile updated successfully");
        setUser(data.user);
        setIsEditingBasic(false);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Update failed");
    } finally {
      setIsSaving(false);
    }
  };

  /* --- MOBILE HANDLERS --- */
  const sendMobileOtp = async () => {
    if (!/^[6-9]\d{9}$/.test(mobileData.mobile)) {
        return toast.error("Enter valid mobile number");
    }
    
    setIsSaving(true);
    try {
      const { data } = await axios.post("/api/profile/mobile/send-otp", { mobile: mobileData.mobile });
      if (data.success) {
        toast.success(`OTP sent to ${mobileData.mobile}`);
        setMobileStep("otp");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Failed to send OTP");
    } finally {
      setIsSaving(false);
    }
  };

  const verifyMobileOtp = async () => {
    const otpValue = mobileData.otp.join("");
    if (otpValue.length !== 6) return toast.error("Enter valid OTP");

    setIsSaving(true);
    try {
      const { data } = await axios.post("/api/profile/mobile/verify", {
        mobile: mobileData.mobile,
        otp: otpValue
      });

      if (data.success) {
        toast.success("Mobile number updated successfully");
        setMobileStep("view");
        setMobileData({ mobile: "", otp: ["", "", "", "", "", ""] });
        fetchProfile(); // Refresh data
      } else {
        toast.error(data.message || "Invalid OTP");
      }
    } catch (error) {
      toast.error("Verification failed");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-[#1E2A5E] border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50/50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-8">
        
        {/* Header */}
        <div>
            <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
            <p className="mt-1 text-sm text-gray-500">Manage your profile details and contact information.</p>
        </div>

        {/* 1. Basic Information Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/30">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <User className="w-5 h-5 text-gray-400" /> Basic Information
                </h2>
                {!isEditingBasic ? (
                    <button 
                        onClick={() => setIsEditingBasic(true)}
                        className="text-sm font-medium text-[#1E2A5E] hover:text-[#151f42] flex items-center gap-1"
                    >
                        <Edit2 className="w-3 h-3" /> Edit
                    </button>
                ) : (
                    <button 
                        onClick={() => {
                            setIsEditingBasic(false);
                            setFormData({ name: user.name, email: user.email || "" }); // Reset
                        }}
                        className="text-sm font-medium text-gray-500 hover:text-gray-700 flex items-center gap-1"
                    >
                        <X className="w-3 h-3" /> Cancel
                    </button>
                )}
            </div>

            <div className="p-6 space-y-6">
                {/* Missing Email Alert */}
                {!user.email && !isEditingBasic && (
                    <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-100 rounded-xl">
                        <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
                        <div>
                            <h3 className="text-sm font-bold text-amber-800">Email Address Missing</h3>
                            <p className="text-xs text-amber-700 mt-1">Please add an email address to receive order updates and invoices.</p>
                            <button 
                                onClick={() => setIsEditingBasic(true)}
                                className="mt-2 text-xs font-semibold text-amber-900 underline hover:text-amber-700"
                            >
                                Add Email Now
                            </button>
                        </div>
                    </div>
                )}

                <div className="grid gap-6 md:grid-cols-2">
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                            Full Name
                        </label>
                        {isEditingBasic ? (
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E2A5E]/20 focus:border-[#1E2A5E] outline-none transition-all text-sm font-medium text-gray-900"
                            />
                        ) : (
                            <p className="text-gray-900 font-medium text-base">{user.name}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                            Email Address
                        </label>
                        {isEditingBasic ? (
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                    placeholder="your@email.com"
                                    className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E2A5E]/20 focus:border-[#1E2A5E] outline-none transition-all text-sm font-medium text-gray-900"
                                />
                            </div>
                        ) : (
                            <p className={`text-base font-medium ${user.email ? "text-gray-900" : "text-gray-400 italic"}`}>
                                {user.email || "Not provided"}
                            </p>
                        )}
                    </div>
                </div>

                {isEditingBasic && (
                    <div className="flex justify-end pt-2">
                        <button
                            onClick={handleSaveBasic}
                            disabled={isSaving}
                            className="flex items-center gap-2 bg-[#1E2A5E] text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#151f42] transition-all shadow-sm disabled:opacity-70"
                        >
                            {isSaving ? "Saving..." : <> <Save className="w-4 h-4" /> Save Changes </>}
                        </button>
                    </div>
                )}
            </div>
        </div>

        {/* 2. Contact Information Card (Mobile) */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/30">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Phone className="w-5 h-5 text-gray-400" /> Contact Number
                </h2>
            </div>

            <div className="p-6">
                {mobileStep === "view" && (
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-sm text-gray-500 mb-1">Registered Mobile</p>
                            <p className="text-xl font-bold text-gray-900 tracking-wide font-mono">
                                +91 {user.mobile}
                            </p>
                        </div>
                        <button 
                            onClick={() => setMobileStep("input")}
                            className="text-sm font-medium text-[#1E2A5E] hover:underline"
                        >
                            Change Number
                        </button>
                    </div>
                )}

                {mobileStep === "input" && (
                    <div className="max-w-xs animate-fadeIn">
                        <label className="block text-sm font-medium text-gray-700 mb-2">New Mobile Number</label>
                        <div className="flex gap-2">
                            <input
                                type="tel"
                                maxLength={10}
                                value={mobileData.mobile}
                                onChange={(e) => {
                                    const val = e.target.value.replace(/\D/g, "");
                                    if(val.length <= 10) setMobileData({...mobileData, mobile: val});
                                }}
                                className="flex-1 p-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E2A5E]/20 focus:border-[#1E2A5E] outline-none text-sm font-mono"
                                placeholder="9876543210"
                            />
                            <button
                                onClick={sendMobileOtp}
                                disabled={isSaving || mobileData.mobile.length !== 10}
                                className="px-4 py-2 bg-[#1E2A5E] text-white rounded-lg text-sm font-medium hover:bg-[#151f42] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                {isSaving ? "..." : "Send OTP"}
                            </button>
                        </div>
                        <button 
                            onClick={() => {
                                setMobileStep("view"); 
                                setMobileData({ mobile: "", otp: ["","","","","",""] }); 
                            }}
                            className="mt-3 text-xs text-gray-500 hover:text-gray-700"
                        >
                            Cancel
                        </button>
                    </div>
                )}

                {mobileStep === "otp" && (
                    <div className="max-w-sm animate-fadeIn">
                        <div className="flex justify-between items-center mb-4">
                            <label className="block text-sm font-medium text-gray-700">
                                Verify OTP sent to <span className="font-bold text-gray-900">+91 {mobileData.mobile}</span>
                            </label>
                            <button onClick={() => setMobileStep("input")} className="text-xs text-blue-600 hover:underline">Edit</button>
                        </div>
                        
                        <OtpInput 
                            otp={mobileData.otp} 
                            setOtp={(newOtp) => setMobileData({...mobileData, otp: newOtp})} 
                            onEnter={verifyMobileOtp}
                        />

                        <div className="mt-6 flex gap-3">
                            <button
                                onClick={verifyMobileOtp}
                                disabled={isSaving || mobileData.otp.join("").length !== 6}
                                className="flex-1 py-2.5 bg-[#1E2A5E] text-white rounded-lg text-sm font-bold hover:bg-[#151f42] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                            >
                                {isSaving ? "Verifying..." : "Verify & Update"}
                            </button>
                            <button
                                onClick={() => setMobileStep("view")}
                                className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-all"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>

      </div>
    </div>
  );
};

export default Profile;