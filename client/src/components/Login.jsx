import React, { useState, useEffect } from "react";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";
import OtpInput from "./OtpInput";
import { Mail, Phone, Lock, User, ArrowRight, Loader2 } from "lucide-react";

const Login = () => {
  const {
    setShowUserLogin,
    setUser,
    setCartItems,
    axios,
    navigate,
    redirectAfterLogin,
    setRedirectAfterLogin,
    setSuppressCartAutoOpen
  } = useAppContext();

  // --- SETTINGS STATE ---
  const [authConfig, setAuthConfig] = useState({
    enableOtp: true,
    enablePassword: false, 
    loaded: false
  });

  const [activeMethod, setActiveMethod] = useState("otp"); 
  const [passwordMode, setPasswordMode] = useState("login"); 
  
  // --- FORM DATA ---
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  
  // --- OTP STATE ---
  const [step, setStep] = useState("mobile");
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [resendTimer, setResendTimer] = useState(0);
  
  const [loading, setLoading] = useState(false);
  const otpValue = otp.join("");
  const DISABLE_OTP = import.meta.env.VITE_DISABLE_OTP === "true";

  // 1. Fetch Public Settings on Mount
  useEffect(() => {
    const loadSettings = async () => {
        try {
            const { data } = await axios.get('/api/settings');
            if (data.success) {
                const { enableOtpLogin, enablePasswordLogin } = data.settings;
                
                setAuthConfig({
                    enableOtp: enableOtpLogin,
                    enablePassword: enablePasswordLogin,
                    loaded: true
                });

                // 🧠 Smart Switching Logic: Ensure correct tab is active based on settings
                if (enableOtpLogin && !enablePasswordLogin) {
                    setActiveMethod('otp');
                } else if (!enableOtpLogin && enablePasswordLogin) {
                    setActiveMethod('password');
                }
                // If both are true, it defaults to 'otp' (set in useState)
            }
        } catch (e) {
            console.error("Auth settings error", e);
            setAuthConfig(prev => ({ ...prev, loaded: true }));
        }
    };
    loadSettings();
  }, []);

  // Timer Logic
  useEffect(() => {
    if (resendTimer > 0) {
        const t = setInterval(() => setResendTimer(s => s - 1), 1000);
        return () => clearInterval(t);
    }
  }, [resendTimer]);

  const handleSuccess = async (user) => {
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

    if (user.role === "admin") navigate("/admin");
    else navigate(redirectAfterLogin || "/");
    setRedirectAfterLogin(null);
  };

  // --- OTP HANDLERS ---
  const sendOtp = async () => {
    if (!/^[6-9]\d{9}$/.test(mobile)) return toast.error("Invalid mobile number");
    setLoading(true);
    try {
        if (DISABLE_OTP) {
            // 🔥 DEV MODE FLOW
            const { data } = await axios.post("/api/auth/verify-otp", { mobile });
            if(data.requireDetails) { 
                setStep("details"); 
                setLoading(false); 
                return; 
            }
            if(data.success) {
                toast.success("Login Successful (Dev Mode)"); // ✅ Dev Toast
                handleSuccess(data.user);
            } else {
                toast.error(data.message);
            }
        } else {
            // 🚀 PRODUCTION FLOW
            const { data } = await axios.post("/api/auth/send-otp", { mobile });
            if(data.success) {
                toast.success("OTP Sent");
                setStep("otp");
                setResendTimer(30);
            } else {
                toast.error(data.message);
            }
        }
    } catch(e) { toast.error(e.message); }
    finally { setLoading(false); }
  };

  const verifyOtp = async () => {
    const finalOtp = DISABLE_OTP ? "123456" : otpValue;
    setLoading(true);
    try {
        const payload = { mobile, otp: finalOtp };
        if (step === 'details') {
            if(!name || !email) return toast.error("Please fill all details");
            payload.name = name;
            payload.email = email;
        }
        const { data } = await axios.post("/api/auth/verify-otp", payload);
        
        if (data.requireDetails) {
            setStep("details");
        } else if (data.success) {
            toast.success("Login Successful"); // ✅ Standard Toast
            handleSuccess(data.user);
        } else {
            toast.error(data.message);
        }
    } catch(e) { toast.error(e.message); }
    finally { setLoading(false); }
  };

  // --- PASSWORD HANDLER ---
  const handlePasswordAuth = async () => {
    setLoading(true);
    try {
        const endpoint = passwordMode === 'login' ? '/api/auth/login-password' : '/api/auth/register-password';
        const payload = passwordMode === 'login' 
            ? { identifier: email, password } 
            : { name, email, mobile, password };

        const { data } = await axios.post(endpoint, payload);
        if (data.success) {
            toast.success("Login Successful"); // ✅ Standard Toast
            handleSuccess(data.user);
        } else {
            toast.error(data.message);
        }
    } catch(e) { toast.error(e.message); }
    finally { setLoading(false); }
  };

  if (!authConfig.loaded) return null; // Prevent flickering

  return (
    <div onClick={() => setShowUserLogin(false)} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-fade-in mx-4">
        
        {/* Header */}
        <div className="bg-[#F8FAFC] px-8 py-6 border-b border-gray-100 text-center">
            <h2 className="text-2xl font-bold text-[#1E2A5E]">Welcome Back</h2>
            <p className="text-sm text-gray-500 mt-1">Please login to continue</p>
        </div>

        {/* TABS - Only show if BOTH are enabled */}
        {authConfig.enableOtp && authConfig.enablePassword && (
            <div className="flex border-b border-gray-100">
                <button onClick={() => setActiveMethod('otp')} className={`flex-1 py-3 text-sm font-semibold transition-colors ${activeMethod === 'otp' ? 'text-[#1E2A5E] border-b-2 border-[#1E2A5E]' : 'text-gray-400 hover:text-gray-600'}`}>
                    OTP Login
                </button>
                <button onClick={() => setActiveMethod('password')} className={`flex-1 py-3 text-sm font-semibold transition-colors ${activeMethod === 'password' ? 'text-[#1E2A5E] border-b-2 border-[#1E2A5E]' : 'text-gray-400 hover:text-gray-600'}`}>
                    Password Login
                </button>
            </div>
        )}

        <div className="p-8">
            
            {/* 1. OTP VIEW */}
            {activeMethod === 'otp' && authConfig.enableOtp && (
                <div className="space-y-5">
                    {step === 'mobile' && (
                        <>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Mobile Number</label>
                                <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2.5 focus-within:ring-2 focus-within:ring-[#1E2A5E] transition-all">
                                    <span className="text-gray-500 mr-2">+91</span>
                                    <input type="tel" maxLength={10} value={mobile} onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))} className="w-full outline-none text-gray-900 font-medium placeholder-gray-400" placeholder="00000 00000"/>
                                </div>
                            </div>
                            <button onClick={sendOtp} disabled={loading} className="w-full bg-[#1E2A5E] text-white py-3 rounded-lg font-bold hover:bg-[#151f46] transition-all flex justify-center items-center gap-2">
                                {loading ? <Loader2 className="w-4 h-4 animate-spin"/> : <>Get OTP <ArrowRight className="w-4 h-4"/></>}
                            </button>
                        </>
                    )}

                    {step === 'otp' && (
                        <>
                            <div className="text-center mb-4">
                                <p className="text-sm text-gray-600">Enter OTP sent to <span className="font-bold">+91 {mobile}</span></p>
                                <button onClick={() => setStep('mobile')} className="text-xs text-[#1E2A5E] font-bold underline mt-1">Change Number</button>
                            </div>
                            <OtpInput otp={otp} setOtp={setOtp} onEnter={verifyOtp} />
                            <button onClick={verifyOtp} disabled={loading || otpValue.length !== 6} className="w-full bg-[#1E2A5E] text-white py-3 rounded-lg font-bold hover:bg-[#151f46] transition-all mt-4 disabled:opacity-70">
                                {loading ? "Verifying..." : "Verify & Login"}
                            </button>
                            <div className="text-center mt-4">
                                {resendTimer > 0 ? (
                                    <span className="text-sm text-gray-400 font-medium">Resend in {resendTimer}s</span>
                                ) : (
                                    <button onClick={sendOtp} className="text-sm font-bold text-[#1E2A5E] hover:underline">Resend OTP</button>
                                )}
                            </div>
                        </>
                    )}

                    {step === 'details' && (
                        <div className="space-y-4">
                            <p className="text-sm text-gray-500 text-center">New here? Let's finish setting up your account.</p>
                            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Full Name" className="w-full border p-3 rounded-lg outline-none focus:border-[#1E2A5E]" />
                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email Address" className="w-full border p-3 rounded-lg outline-none focus:border-[#1E2A5E]" />
                            <button onClick={verifyOtp} disabled={loading} className="w-full bg-[#1E2A5E] text-white py-3 rounded-lg font-bold hover:bg-[#151f46]">
                                {loading ? "Creating Account..." : "Complete Registration"}
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* 2. PASSWORD VIEW */}
            {(activeMethod === 'password' && authConfig.enablePassword) && (
                <div className="space-y-5">
                    {passwordMode === 'register' && (
                        <>
                            <div className="relative">
                                <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Full Name" className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg outline-none focus:border-[#1E2A5E]" />
                            </div>
                            <div className="relative">
                                <Phone className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                <input type="tel" value={mobile} onChange={(e) => setMobile(e.target.value)} placeholder="Mobile Number" className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg outline-none focus:border-[#1E2A5E]" />
                            </div>
                        </>
                    )}
                    
                    <div className="relative">
                        <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email Address" className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg outline-none focus:border-[#1E2A5E]" />
                    </div>

                    <div className="relative">
                        <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg outline-none focus:border-[#1E2A5E]" />
                    </div>

                    <button onClick={handlePasswordAuth} disabled={loading} className="w-full bg-[#1E2A5E] text-white py-3 rounded-lg font-bold hover:bg-[#151f46] transition-all shadow-md flex justify-center items-center gap-2">
                        {loading ? <Loader2 className="w-4 h-4 animate-spin"/> : (passwordMode === 'login' ? "Login" : "Create Account")}
                    </button>

                    <div className="text-center pt-2">
                        {passwordMode === 'login' ? (
                            <p className="text-sm text-gray-600">
                                Don't have an account? <button onClick={() => setPasswordMode('register')} className="text-[#1E2A5E] font-bold hover:underline">Register</button>
                            </p>
                        ) : (
                            <p className="text-sm text-gray-600">
                                Already have an account? <button onClick={() => setPasswordMode('login')} className="text-[#1E2A5E] font-bold hover:underline">Login</button>
                            </p>
                        )}
                    </div>
                </div>
            )}

        </div>
      </div>
    </div>
  );
};

export default Login;