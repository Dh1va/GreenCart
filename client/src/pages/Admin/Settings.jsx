import React, { useEffect, useMemo, useState } from "react";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";

const Settings = () => {
  const { axios } = useAppContext();

  const tabs = useMemo(
    () => [
      { key: "store", label: "Store" },
      { key: "order", label: "Orders" },
      { key: "shipping", label: "Shipping" },
      { key: "invoice", label: "Invoice" },
      { key: "coupon", label: "Coupons" },
      { key: "security", label: "Security" },
    ],
    []
  );

  const [activeTab, setActiveTab] = useState("store");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    // 1) Store
    storeName: "",
    storeEmail: "",
    supportPhone: "",
    storeAddress: {
      line1: "",
      line2: "",
      city: "",
      state: "",
      pincode: "",
      country: "India",
    },
    currencySymbol: "₹",
    storeLogo: { url: "", publicId: "" },
    taxPercent: 2,
    minimumOrderAmount: 0,

    // 2) Orders
    defaultOrderStatus: "order_placed",
    enableCOD: true,
    enableRazorpay: true,
    autoInvoice: true,
    autoOrderNotification: { email: false, sms: false },

    // 3) Shipping
    defaultCourierId: "",
    freeShippingThreshold: 999,
    shippingTaxPercent: 0,

    // 4) Invoice
    invoicePrefix: "INV",
    invoiceStartNumber: 1001,
    gstNumber: "",
    invoiceTerms: "",
    returnPolicy: "",

    // 5) Coupons
    enableCoupons: true,
    allowCouponStacking: false,
    maxDiscountPerOrder: 0,

    // 6) Security
    enableOtpLogin: true,
    enablePasswordLogin: false,
    sessionDays: 7,
    maintenanceMode: false,
  });

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get("/api/admin/settings");
      if (!data.success) {
        toast.error(data.message || "Failed to load settings");
        return;
      }
      setForm((prev) => ({ ...prev, ...data.settings }));
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const saveSettings = async () => {
    try {
      setSaving(true);
      const { data } = await axios.put("/api/admin/settings", form);

      if (!data.success) {
        toast.error(data.message || "Update failed");
        return;
      }

      toast.success("Settings updated");
      setForm((prev) => ({ ...prev, ...data.settings }));
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-gray-600 font-medium">Loading...</p>;

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500">Configure your store rules</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold border transition
              ${
                activeTab === t.key
                  ? "bg-black text-white border-black"
                  : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
              }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="bg-white border rounded-2xl p-6 space-y-5">
        {/* 1) STORE */}
        {activeTab === "store" && (
          <>
            <h2 className="text-lg font-bold text-gray-900">Store Settings</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Store Name"
                value={form.storeName}
                onChange={(v) => setForm({ ...form, storeName: v })}
              />
              <Input
                label="Store Email"
                value={form.storeEmail}
                onChange={(v) => setForm({ ...form, storeEmail: v })}
              />
              <Input
                label="Support Phone"
                value={form.supportPhone}
                onChange={(v) => setForm({ ...form, supportPhone: v })}
              />
              <Input
                label="Currency Symbol"
                value={form.currencySymbol}
                onChange={(v) => setForm({ ...form, currencySymbol: v })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <NumberInput
                label="Tax %"
                value={form.taxPercent}
                onChange={(v) => setForm({ ...form, taxPercent: v })}
              />
              <NumberInput
                label="Minimum Order Amount"
                value={form.minimumOrderAmount}
                onChange={(v) => setForm({ ...form, minimumOrderAmount: v })}
              />
            </div>

            <div className="border rounded-xl p-4 space-y-3">
              <p className="font-semibold text-gray-800">Store Address</p>

              <Input
                label="Line 1"
                value={form.storeAddress?.line1 || ""}
                onChange={(v) =>
                  setForm({
                    ...form,
                    storeAddress: { ...form.storeAddress, line1: v },
                  })
                }
              />
              <Input
                label="Line 2"
                value={form.storeAddress?.line2 || ""}
                onChange={(v) =>
                  setForm({
                    ...form,
                    storeAddress: { ...form.storeAddress, line2: v },
                  })
                }
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="City"
                  value={form.storeAddress?.city || ""}
                  onChange={(v) =>
                    setForm({
                      ...form,
                      storeAddress: { ...form.storeAddress, city: v },
                    })
                  }
                />
                <Input
                  label="State"
                  value={form.storeAddress?.state || ""}
                  onChange={(v) =>
                    setForm({
                      ...form,
                      storeAddress: { ...form.storeAddress, state: v },
                    })
                  }
                />
                <Input
                  label="Pincode"
                  value={form.storeAddress?.pincode || ""}
                  onChange={(v) =>
                    setForm({
                      ...form,
                      storeAddress: { ...form.storeAddress, pincode: v },
                    })
                  }
                />
              </div>
            </div>

            <Input
              label="Store Logo URL (optional)"
              value={form.storeLogo?.url || ""}
              onChange={(v) =>
                setForm({ ...form, storeLogo: { ...form.storeLogo, url: v } })
              }
            />
          </>
        )}

        {/* 2) ORDERS */}
        {activeTab === "order" && (
          <>
            <h2 className="text-lg font-bold text-gray-900">Order Settings</h2>

            <Select
              label="Default Order Status"
              value={form.defaultOrderStatus}
              onChange={(v) => setForm({ ...form, defaultOrderStatus: v })}
              options={[
                { value: "order_placed", label: "Order Placed" },
                { value: "processing", label: "Processing" },
                { value: "shipped", label: "Shipped" },
                { value: "out_for_delivery", label: "Out for Delivery" },
                { value: "delivered", label: "Delivered" },
                { value: "cancelled", label: "Cancelled" },
              ]}
            />

            <Toggle
              label="Enable COD"
              checked={form.enableCOD}
              onChange={(v) => setForm({ ...form, enableCOD: v })}
            />

            <Toggle
              label="Enable Razorpay"
              checked={form.enableRazorpay}
              onChange={(v) => setForm({ ...form, enableRazorpay: v })}
            />

            <Toggle
              label="Auto Invoice Generation"
              checked={form.autoInvoice}
              onChange={(v) => setForm({ ...form, autoInvoice: v })}
            />

            <div className="border rounded-xl p-4 space-y-3">
              <p className="font-semibold text-gray-800">
                Auto Notifications (optional)
              </p>

              <Toggle
                label="Send Email on Order Placed"
                checked={form.autoOrderNotification?.email || false}
                onChange={(v) =>
                  setForm({
                    ...form,
                    autoOrderNotification: {
                      ...form.autoOrderNotification,
                      email: v,
                    },
                  })
                }
              />

              <Toggle
                label="Send SMS on Order Placed"
                checked={form.autoOrderNotification?.sms || false}
                onChange={(v) =>
                  setForm({
                    ...form,
                    autoOrderNotification: {
                      ...form.autoOrderNotification,
                      sms: v,
                    },
                  })
                }
              />
            </div>
          </>
        )}

        {/* 3) SHIPPING */}
        {activeTab === "shipping" && (
          <>
            <h2 className="text-lg font-bold text-gray-900">Shipping Settings</h2>

            <Input
              label="Default Courier ID (optional)"
              value={form.defaultCourierId || ""}
              onChange={(v) => setForm({ ...form, defaultCourierId: v })}
            />

            <NumberInput
              label="Free Shipping Threshold"
              value={form.freeShippingThreshold}
              onChange={(v) => setForm({ ...form, freeShippingThreshold: v })}
            />

            <NumberInput
              label="Shipping Tax % (optional)"
              value={form.shippingTaxPercent}
              onChange={(v) => setForm({ ...form, shippingTaxPercent: v })}
            />
          </>
        )}

        {/* 4) INVOICE */}
        {activeTab === "invoice" && (
          <>
            <h2 className="text-lg font-bold text-gray-900">Invoice Settings</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Invoice Prefix"
                value={form.invoicePrefix}
                onChange={(v) => setForm({ ...form, invoicePrefix: v })}
              />

              <NumberInput
                label="Invoice Start Number"
                value={form.invoiceStartNumber}
                onChange={(v) => setForm({ ...form, invoiceStartNumber: v })}
              />
            </div>

            <Input
              label="GST Number (optional)"
              value={form.gstNumber}
              onChange={(v) => setForm({ ...form, gstNumber: v })}
            />

            <Textarea
              label="Invoice Terms & Conditions"
              value={form.invoiceTerms}
              onChange={(v) => setForm({ ...form, invoiceTerms: v })}
            />

            <Textarea
              label="Return Policy"
              value={form.returnPolicy}
              onChange={(v) => setForm({ ...form, returnPolicy: v })}
            />
          </>
        )}

        {/* 5) COUPONS */}
        {activeTab === "coupon" && (
          <>
            <h2 className="text-lg font-bold text-gray-900">
              Coupon & Discount Settings
            </h2>

            <Toggle
              label="Enable Coupons"
              checked={form.enableCoupons}
              onChange={(v) => setForm({ ...form, enableCoupons: v })}
            />

            <Toggle
              label="Allow Coupon Stacking"
              checked={form.allowCouponStacking}
              onChange={(v) => setForm({ ...form, allowCouponStacking: v })}
            />

            <NumberInput
              label="Max Discount Per Order (0 = unlimited)"
              value={form.maxDiscountPerOrder}
              onChange={(v) => setForm({ ...form, maxDiscountPerOrder: v })}
            />
          </>
        )}

        {/* 6) SECURITY */}
        {activeTab === "security" && (
          <>
            <h2 className="text-lg font-bold text-gray-900">Security Settings</h2>

            <Toggle
              label="Enable OTP Login"
              checked={form.enableOtpLogin}
              onChange={(v) => setForm({ ...form, enableOtpLogin: v })}
            />

            <Toggle
              label="Enable Password Login (future)"
              checked={form.enablePasswordLogin}
              onChange={(v) => setForm({ ...form, enablePasswordLogin: v })}
            />

            <Select
              label="Session Duration"
              value={String(form.sessionDays)}
              onChange={(v) => setForm({ ...form, sessionDays: Number(v) })}
              options={[
                { value: "7", label: "7 Days" },
                { value: "15", label: "15 Days" },
                { value: "30", label: "30 Days" },
              ]}
            />

            <Toggle
              label="Maintenance Mode (Block Checkout)"
              checked={form.maintenanceMode}
              onChange={(v) => setForm({ ...form, maintenanceMode: v })}
            />
          </>
        )}
      </div>

      <button
        onClick={saveSettings}
        disabled={saving}
        className="bg-black text-white px-6 py-3 rounded-xl font-bold hover:bg-gray-800 disabled:opacity-60"
      >
        {saving ? "Saving..." : "Save Settings"}
      </button>
    </div>
  );
};

/* ---------------- Reusable Inputs ---------------- */

const Input = ({ label, value, onChange }) => (
  <div className="space-y-1">
    <p className="text-sm font-semibold text-gray-700">{label}</p>
    <input
      className="w-full border border-gray-300 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-black"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);

const NumberInput = ({ label, value, onChange }) => (
  <div className="space-y-1">
    <p className="text-sm font-semibold text-gray-700">{label}</p>
    <input
      type="number"
      className="w-full border border-gray-300 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-black"
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
    />
  </div>
);

const Textarea = ({ label, value, onChange }) => (
  <div className="space-y-1">
    <p className="text-sm font-semibold text-gray-700">{label}</p>
    <textarea
      rows={4}
      className="w-full border border-gray-300 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-black"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);

const Toggle = ({ label, checked, onChange }) => (
  <label className="flex items-center justify-between border rounded-xl px-4 py-3">
    <span className="text-sm font-semibold text-gray-700">{label}</span>
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      className="w-5 h-5"
    />
  </label>
);

const Select = ({ label, value, onChange, options }) => (
  <div className="space-y-1">
    <p className="text-sm font-semibold text-gray-700">{label}</p>
    <select
      className="w-full border border-gray-300 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-black"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  </div>
);

export default Settings;
