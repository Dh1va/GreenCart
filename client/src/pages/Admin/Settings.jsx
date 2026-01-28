import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useAppContext } from "../../context/AppContext";
import {
  Store,
  ShoppingBag,
  Truck,
  FileText,
  TicketPercent,
  ShieldCheck,
  Save,
  Send,
  Loader2,
  AlertTriangle
} from "lucide-react";

const Settings = () => {
  const { axios } = useAppContext();

  const tabs = useMemo(
    () => [
      { key: "store", label: "Store Details", icon: Store },
      { key: "order", label: "Orders & Payment", icon: ShoppingBag },
      { key: "shipping", label: "Shipping", icon: Truck },
      { key: "invoice", label: "Invoicing", icon: FileText },
      { key: "coupon", label: "Coupons", icon: TicketPercent },
      { key: "security", label: "Security", icon: ShieldCheck },
    ],
    []
  );

  const [activeTab, setActiveTab] = useState("store");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testingEmail, setTestingEmail] = useState(false);

  // --- STATE ---
  const [form, setForm] = useState({
    storeName: "",
    storeEmail: "",
    supportPhone: "",
    storeAddress: { line1: "", line2: "", city: "", state: "", pincode: "", country: "India" },
    currencySymbol: "₹",
    storeLogo: { url: "", publicId: "" },
    taxPercent: 2,
    minimumOrderAmount: 0,
    defaultOrderStatus: "order_placed",
    enableCOD: true,
    enableRazorpay: true,
    enablePhonePe: false,
    autoInvoice: true,
    autoOrderNotification: { email: false, sms: false },
    cancelWindowHours: 24,
    defaultCourierId: "",
    freeShippingThreshold: 999,
    shippingTaxPercent: 0,
    invoicePrefix: "INV",
    invoiceStartNumber: 1001,
    gstNumber: "",
    invoiceTerms: "",
    returnPolicy: "",
    enableCoupons: true,
    allowCouponStacking: false,
    maxDiscountPerOrder: 0,
    enableOtpLogin: true,
    enablePasswordLogin: false,
    sessionDays: 7,
    maintenanceMode: false,
  });

  const [originalSettings, setOriginalSettings] = useState(null);

  // Detect Changes
  const hasChanges = useMemo(() => {
    return JSON.stringify(form) !== JSON.stringify(originalSettings);
  }, [form, originalSettings]);

  // --- LOGIC ---
  const validateForm = () => {
    if (!form.storeName?.trim()) return "Store name is required";
    if (!form.storeEmail?.trim()) return "Store email is required";
    if (!form.invoicePrefix?.trim()) return "Invoice prefix is required";
    return null;
  };

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get("/api/admin/settings");
      if (!data?.success) return toast.error(data?.message || "Failed to load");
      
      const loadedSettings = {
        ...form, 
        ...data.settings,
        storeAddress: { ...form.storeAddress, ...(data.settings?.storeAddress || {}) },
        storeLogo: { ...form.storeLogo, ...(data.settings?.storeLogo || {}) },
        autoOrderNotification: { ...form.autoOrderNotification, ...(data.settings?.autoOrderNotification || {}) },
      };

      setForm(loadedSettings);
      setOriginalSettings(loadedSettings);
    } catch (err) {
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSettings(); }, []);

  const saveSettings = async () => {
    const error = validateForm();
    if (error) return toast.error(error);
    try {
      setSaving(true);
      const { data } = await axios.put("/api/admin/settings", form);
      if (!data?.success) return toast.error("Update failed");
      
      toast.success("Settings updated successfully");
      setOriginalSettings(form); 
    } catch (err) {
      toast.error("Update failed");
    } finally {
      setSaving(false);
    }
  };

  const testOrderEmail = async () => {
    try {
      setTestingEmail(true);
      const { data } = await axios.post("/api/admin/settings/test-email", { to: form.storeEmail });
      if (data.success) toast.success("Test email sent!");
      else toast.error("Email failed");
    } catch (err) {
      toast.error("Email failed");
    } finally {
      setTestingEmail(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-[50vh] text-[#1E2A5E]">
        <Loader2 className="w-10 h-10 animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-8 font-sans">
      
      {/* --- PAGE HEADER --- */}
      <div className=" mx-auto flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
        <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Settings</h1>
            <p className="text-gray-500 mt-1">Manage global store configurations.</p>
        </div>
        
        <div className="flex items-center gap-3">
            {activeTab === 'store' && (
                <button
                    onClick={testOrderEmail}
                    disabled={testingEmail}
                    className="hidden md:flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all shadow-sm"
                >
                    {testingEmail ? <Loader2 className="w-4 h-4 animate-spin"/> : <Send className="w-4 h-4"/>}
                    Test Email
                </button>
            )}
            <button
                onClick={saveSettings}
                disabled={saving || !hasChanges} 
                className={`flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-[#1E2A5E] rounded-lg shadow-md transition-all 
                  ${(saving || !hasChanges) ? "opacity-50 cursor-not-allowed" : "hover:bg-[#151f42] hover:shadow-lg"}
                `}
            >
                {saving ? <Loader2 className="w-4 h-4 animate-spin"/> : <Save className="w-4 h-4"/>}
                Save Changes
            </button>
        </div>
      </div>

      <div className=" mx-auto">
        
        {/* --- TABS --- */}
        <div className="flex overflow-x-auto no-scrollbar gap-1 mb-6 border-b border-gray-200">
            {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.key;
                return (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold whitespace-nowrap border-b-2 transition-all ${
                            isActive 
                            ? "border-[#1E2A5E] text-[#1E2A5E] bg-indigo-50/50 rounded-t-lg" 
                            : "border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300"
                        }`}
                    >
                        <Icon className={`w-4 h-4 ${isActive ? "text-[#1E2A5E]" : "text-gray-400"}`} />
                        {tab.label}
                    </button>
                )
            })}
        </div>

        {/* --- CONTENT --- */}
        <div className="space-y-6">
                
            {/* --- STORE TAB --- */}
            {activeTab === "store" && (
                <Section title="Store Information" description="General details about your business shown to customers.">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input label="Store Name" value={form.storeName} onChange={(v) => setForm({ ...form, storeName: v })} />
                        <Input label="Support Phone" value={form.supportPhone} onChange={(v) => setForm({ ...form, supportPhone: v })} />
                        <Input label="Store Email (Reply-To)" value={form.storeEmail} onChange={(v) => setForm({ ...form, storeEmail: v })} fullWidth />
                        <Input label="Currency Symbol" value={form.currencySymbol} onChange={(v) => setForm({ ...form, currencySymbol: v })} />
                        <Input label="Logo URL" value={form.storeLogo?.url} onChange={(v) => setForm({ ...form, storeLogo: { ...form.storeLogo, url: v } })} />
                    </div>

                    <div className="mt-8 border-t border-gray-100 pt-6">
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Address Details</h3>
                        <div className="grid grid-cols-1 gap-4">
                            <Input label="Address Line 1" value={form.storeAddress.line1} onChange={(v) => setForm({ ...form, storeAddress: { ...form.storeAddress, line1: v } })} />
                            <Input label="Address Line 2" value={form.storeAddress.line2} onChange={(v) => setForm({ ...form, storeAddress: { ...form.storeAddress, line2: v } })} />
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                <Input label="City" value={form.storeAddress.city} onChange={(v) => setForm({ ...form, storeAddress: { ...form.storeAddress, city: v } })} />
                                <Input label="State" value={form.storeAddress.state} onChange={(v) => setForm({ ...form, storeAddress: { ...form.storeAddress, state: v } })} />
                                <Input label="Pincode" value={form.storeAddress.pincode} onChange={(v) => setForm({ ...form, storeAddress: { ...form.storeAddress, pincode: v } })} />
                            </div>
                        </div>
                    </div>
                </Section>
            )}

            {/* --- ORDERS TAB --- */}
            {activeTab === "order" && (
                <Section title="Order Processing" description="Configure how orders are handled and paid for.">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Select 
                            label="Default Order Status" 
                            value={form.defaultOrderStatus} 
                            onChange={(v) => setForm({...form, defaultOrderStatus: v})}
                            options={[
                                { value: "order_placed", label: "Order Placed" },
                                { value: "processing", label: "Processing" },
                                { value: "shipped", label: "Shipped" },
                            ]}
                        />
                        <Input label="Cancellation Window (Hours)" type="number" value={form.cancelWindowHours} onChange={(v) => setForm({ ...form, cancelWindowHours: v })} />
                        <Input label="Tax Percentage (%)" type="number" value={form.taxPercent} onChange={(v) => setForm({ ...form, taxPercent: v })} />
                        <Input label="Min Order Amount" type="number" value={form.minimumOrderAmount} onChange={(v) => setForm({ ...form, minimumOrderAmount: v })} />
                    </div>

                    <div className="mt-8 border-t border-gray-100 pt-6 space-y-4">
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Payment Gateways</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Toggle label="Cash on Delivery (COD)" checked={form.enableCOD} onChange={(v) => setForm({ ...form, enableCOD: v })} />
                            <Toggle label="Razorpay" checked={form.enableRazorpay} onChange={(v) => setForm({ ...form, enableRazorpay: v })} />
                            <Toggle label="PhonePe" checked={form.enablePhonePe} onChange={(v) => setForm({ ...form, enablePhonePe: v })} />
                        </div>
                    </div>

                    <div className="mt-8 border-t border-gray-100 pt-6 space-y-4">
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Automation</h3>
                        <Toggle label="Auto-Generate Invoice" description="Create PDF invoice immediately after payment" checked={form.autoInvoice} onChange={(v) => setForm({ ...form, autoInvoice: v })} />
                        <Toggle label="Email Notification" description="Send confirmation email to customer" checked={form.autoOrderNotification.email} onChange={(v) => setForm({ ...form, autoOrderNotification: { ...form.autoOrderNotification, email: v } })} />
                    </div>
                </Section>
            )}

            {/* --- SHIPPING TAB --- */}
            {activeTab === "shipping" && (
                <Section title="Shipping Configuration" description="Manage delivery thresholds and courier partners.">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input label="Free Shipping Threshold (Amount)" type="number" value={form.freeShippingThreshold} onChange={(v) => setForm({ ...form, freeShippingThreshold: v })} />
                        <Input label="Shipping Tax %" type="number" value={form.shippingTaxPercent} onChange={(v) => setForm({ ...form, shippingTaxPercent: v })} />
                        <Input label="Default Courier ID" value={form.defaultCourierId} onChange={(v) => setForm({ ...form, defaultCourierId: v })} fullWidth />
                    </div>
                </Section>
            )}

            {/* --- INVOICE TAB --- */}
            {activeTab === "invoice" && (
                <Section title="Invoice Settings" description="Customize the PDF invoices generated for customers.">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input label="Invoice Prefix (e.g., INV-)" value={form.invoicePrefix} onChange={(v) => setForm({ ...form, invoicePrefix: v })} />
                        <Input label="Start Number" type="number" value={form.invoiceStartNumber} onChange={(v) => setForm({ ...form, invoiceStartNumber: v })} />
                        <Input label="GST Number" value={form.gstNumber} onChange={(v) => setForm({ ...form, gstNumber: v })} fullWidth />
                    </div>
                    <div className="mt-6 space-y-6">
                        <TextArea label="Invoice Terms & Conditions" value={form.invoiceTerms} onChange={(v) => setForm({ ...form, invoiceTerms: v })} />
                        <TextArea label="Return Policy Text" value={form.returnPolicy} onChange={(v) => setForm({ ...form, returnPolicy: v })} />
                    </div>
                </Section>
            )}

            {/* --- COUPON TAB --- */}
            {activeTab === "coupon" && (
                <Section title="Discounts & Coupons" description="Control how coupons are applied in the cart.">
                    <div className="space-y-4">
                        <Toggle label="Enable Coupons System" checked={form.enableCoupons} onChange={(v) => setForm({ ...form, enableCoupons: v })} />
                        <Toggle label="Allow Coupon Stacking" description="Allow multiple coupons per order (Not recommended)" checked={form.allowCouponStacking} onChange={(v) => setForm({ ...form, allowCouponStacking: v })} />
                        <div className="pt-4 max-w-xs">
                            <Input label="Max Discount Per Order (0 = Unlimited)" type="number" value={form.maxDiscountPerOrder} onChange={(v) => setForm({ ...form, maxDiscountPerOrder: v })} />
                        </div>
                    </div>
                </Section>
            )}

            {/* --- SECURITY TAB --- */}
            {activeTab === "security" && (
                <Section title="Security & Access" description="Manage login methods and store availability.">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <Select 
                            label="User Session Duration" 
                            value={String(form.sessionDays)} 
                            onChange={(v) => setForm({...form, sessionDays: Number(v)})}
                            options={[
                                { value: "1", label: "1 Day" },
                                { value: "7", label: "7 Days" },
                                { value: "30", label: "30 Days" },
                            ]}
                        />
                    </div>
                    
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* ✅ MUTUALLY EXCLUSIVE TOGGLES */}
                            <Toggle 
                                label="Enable OTP Login" 
                                description="Users login via SMS OTP."
                                checked={form.enableOtpLogin} 
                                onChange={(v) => setForm({ 
                                    ...form, 
                                    enableOtpLogin: v, 
                                    enablePasswordLogin: !v  // Auto-switch Password OFF
                                })} 
                            />
                            <Toggle 
                                label="Enable Password Login" 
                                description="Users login via Email/Password."
                                checked={form.enablePasswordLogin} 
                                onChange={(v) => setForm({ 
                                    ...form, 
                                    enablePasswordLogin: v, 
                                    enableOtpLogin: !v // Auto-switch OTP OFF
                                })} 
                            />
                        </div>

                        <div className="p-4 bg-red-50 border border-red-100 rounded-xl">
                            <div className="flex items-center gap-3 mb-2">
                                <AlertTriangle className="w-5 h-5 text-red-600" />
                                <h3 className="font-bold text-red-700">Danger Zone</h3>
                            </div>
                            <Toggle 
                                label="Maintenance Mode" 
                                description="This will block all customer checkouts immediately."
                                checked={form.maintenanceMode} 
                                onChange={(v) => setForm({ ...form, maintenanceMode: v })} 
                                danger
                            />
                        </div>
                    </div>
                </Section>
            )}

        </div>
      </div>
    </div>
  );
};

/* ---------------- UI COMPONENTS ---------------- */

const Section = ({ title, description, children }) => (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
            <h2 className="text-lg font-bold text-gray-900">{title}</h2>
            {description && <p className="text-sm text-gray-500 mt-0.5">{description}</p>}
        </div>
        <div className="p-6">
            {children}
        </div>
    </div>
);

const Input = ({ label, value, onChange, type = "text", fullWidth }) => (
  <div className={fullWidth ? "col-span-1 md:col-span-2" : ""}>
    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">{label}</label>
    <input
      type={type}
      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 text-sm focus:ring-2 focus:ring-[#1E2A5E]/20 focus:border-[#1E2A5E] outline-none transition-all"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);

const TextArea = ({ label, value, onChange }) => (
  <div>
    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">{label}</label>
    <textarea
      rows={4}
      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 text-sm focus:ring-2 focus:ring-[#1E2A5E]/20 focus:border-[#1E2A5E] outline-none transition-all resize-none"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);

const Select = ({ label, value, onChange, options }) => (
  <div>
    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">{label}</label>
    <div className="relative">
        <select
        className="w-full appearance-none border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 text-sm focus:ring-2 focus:ring-[#1E2A5E]/20 focus:border-[#1E2A5E] outline-none transition-all bg-white"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        >
        {options.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
        ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-500">
            <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
        </div>
    </div>
  </div>
);

const Toggle = ({ label, description, checked, onChange, danger }) => (
  <label className="flex items-center justify-between cursor-pointer group">
    <div className="flex-1 pr-4">
        <span className={`text-sm font-semibold ${danger ? 'text-red-700' : 'text-gray-900'}`}>{label}</span>
        {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
    </div>
    <div className="relative">
      <input type="checkbox" className="sr-only peer" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <div className={`w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer 
        peer-checked:after:translate-x-full peer-checked:after:border-white 
        after:content-[''] after:absolute after:top-[2px] after:left-[2px] 
        after:bg-white after:border-gray-300 after:border after:rounded-full 
        after:h-5 after:w-5 after:transition-all 
        ${danger ? 'peer-checked:bg-red-600' : 'peer-checked:bg-[#1E2A5E]'}`}>
      </div>
    </div>
  </label>
);

export default Settings;