import React, { useEffect, useState } from "react";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";
import {
  Trash2,
  Plus,
  Tag,
  Percent,
  IndianRupee,
  Loader2,
  Wand2,
  CheckCircle2,
  XCircle,
  Copy,
  RefreshCw
} from "lucide-react";

const Coupons = () => {
  
  const { coupons, fetchCouponsOnce, invalidateCoupons, axios } = useAppContext();

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);


  // Form State
  const [form, setForm] = useState({
    code: "",
    type: "PERCENT",
    value: "",
    minOrderAmount: "",
    maxDiscount: "",
    usageLimit: "",
    isActive: true,
  });

  /* FETCH COUPONS ON MOUNT */
  useEffect(() => {
  setLoading(true);
  fetchCouponsOnce().finally(() => setLoading(false));
}, []);

  /* AUTO GENERATE CODE */
  const generateRandomCode = (e) => {
    e.preventDefault();
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const length = 8;
    let result = "";
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setForm((prev) => ({ ...prev, code: result }));
    toast.success("Random code generated!");
  };

  /* CREATE */
  const createCoupon = async (e) => {
    e.preventDefault();
    if (!form.code || !form.value) {
      toast.error("Code and Value are required");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...form,
        value: Number(form.value),
        maxDiscount: form.type === "PERCENT" && form.maxDiscount ? Number(form.maxDiscount) : null,
        usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
        minOrderAmount: form.minOrderAmount ? Number(form.minOrderAmount) : 0,
      };

      const { data } = await axios.post("/api/coupon/create", payload);

      if (!data?.success) {
        toast.error(data.message);
        return;
      }

      toast.success("Coupon created successfully");
      invalidateCoupons();
fetchCouponsOnce();

      // Reset Form
      setForm({
        ...form,
        code: "",
        value: "",
        maxDiscount: "",
        usageLimit: "",
        minOrderAmount: "",
        expiresAt: ""
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Error creating coupon");
    } finally {
      setSubmitting(false);
    }
  };

  /* TOGGLE STATUS */
  const toggleStatus = async (coupon) => {
  try {
    const newStatus = !coupon.isActive;

    const { data } = await axios.put(`/api/coupon/${coupon._id}`, {
      isActive: newStatus,
    });

    if (!data.success) throw new Error();

    toast.success(`Coupon ${newStatus ? "activated" : "deactivated"}`);
invalidateCoupons();
fetchCouponsOnce();
  } catch {
    toast.error("Failed to update status");
  }
};


  /* DELETE */
  const deleteCoupon = async (id) => {
    if (!window.confirm("Are you sure you want to delete this coupon?")) return;
    try {
      await axios.delete(`/api/coupon/${id}`);
      invalidateCoupons();
fetchCouponsOnce();
      toast.success("Coupon deleted");
    } catch (error) {
      toast.error("Failed to delete coupon");
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-10 bg-gray-50/50 min-h-screen font-sans">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Coupons</h1>
          <p className="text-gray-500 mt-2 text-sm">Create discounts and manage promotional codes.</p>
        </div>
        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-full border border-gray-200 shadow-sm">
           <div className="bg-gray-100 p-1.5 rounded-full">
              <Tag className="w-4 h-4 text-gray-600" />
           </div>
           <span className="text-sm font-medium text-gray-600">
             Active Coupons: <span className="text-gray-900 font-bold">{coupons.filter(c => c.isActive).length}</span>
           </span>
        </div>
      </div>

      {/* CREATE FORM CARD */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-8 py-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white">
          <h2 className="font-semibold text-gray-800 flex items-center gap-2">
            <Plus className="w-5 h-5 text-gray-400" /> Create New Coupon
          </h2>
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Configuration</span>
        </div>
        
        <form onSubmit={createCoupon} className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">
          
          {/* Code Input with Generator */}
          <div className="lg:col-span-4 space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Coupon Code</label>
            <div className="relative group">
              <input
                type="text"
                value={form.code}
                placeholder="Ex: SUMMER2025"
                className="w-full h-11 pl-4 pr-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all uppercase placeholder:normal-case font-mono text-sm group-hover:border-gray-300"
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
              />
              <button 
                type="button"
                onClick={generateRandomCode}
                className="absolute right-2 top-2 p-1.5 bg-gray-100 hover:bg-black hover:text-white rounded-lg text-gray-500 transition-colors"
                title="Auto Generate Code"
              >
                <Wand2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Type & Value */}
          <div className="lg:col-span-4 space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Discount Value</label>
            <div className="flex h-11 rounded-xl shadow-sm overflow-hidden border border-gray-200 focus-within:ring-2 focus-within:ring-black focus-within:border-transparent transition-all">
              <div className="relative bg-gray-50 border-r border-gray-200">
                 <select
                  className="h-full pl-3 pr-8 bg-transparent text-sm font-medium text-gray-700 outline-none appearance-none cursor-pointer"
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                >
                  <option value="PERCENT">%</option>
                  <option value="FIXED">₹</option>
                </select>
                <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                   <RefreshCw className="w-3 h-3 text-gray-400" />
                </div>
              </div>
              <input
                type="number"
                placeholder="0"
                value={form.value}
                className="flex-1 px-4 outline-none text-sm placeholder:text-gray-300"
                onChange={(e) => setForm({ ...form, value: e.target.value })}
              />
            </div>
          </div>

          {/* Usage Limit */}
          <div className="lg:col-span-2 space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Limit</label>
            <input
              type="number"
              placeholder="∞"
              value={form.usageLimit}
              className="w-full h-11 px-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all text-sm hover:border-gray-300"
              onChange={(e) => setForm({ ...form, usageLimit: e.target.value })}
            />
          </div>

          {/* Max Discount (Conditional) */}
          <div className="lg:col-span-2 space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Max Cap</label>
            <input
              type="number"
              placeholder="₹ Optional"
              disabled={form.type !== "PERCENT"}
              value={form.maxDiscount}
              className={`w-full h-11 px-4 border border-gray-200 rounded-xl outline-none transition-all text-sm ${form.type !== "PERCENT" ? 'bg-gray-50 text-gray-300' : 'focus:ring-2 focus:ring-black focus:border-transparent hover:border-gray-300'}`}
              onChange={(e) => setForm({ ...form, maxDiscount: e.target.value })}
            />
          </div>

           {/* Submit Button */}
           <div className="lg:col-span-12 flex justify-end pt-4 border-t border-gray-50 mt-2">
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 bg-black hover:bg-gray-800 text-white px-8 py-3 rounded-xl font-semibold text-sm transition-all shadow-lg shadow-gray-200 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Create Coupon
            </button>
          </div>
        </form>
      </div>

      {/* TABLE LIST */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-8 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Coupon Code</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Discount</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Min Purchase</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Usage</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider text-center">Status</th>
                <th className="px-8 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-20 text-center text-gray-500">
                    <div className="flex flex-col justify-center items-center gap-3">
                       <Loader2 className="w-8 h-8 animate-spin text-gray-300" /> 
                       <span className="text-sm">Loading coupons...</span>
                    </div>
                  </td>
                </tr>
              ) : coupons.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-20 text-center text-gray-400 italic">
                    No active coupons found. Start by creating one.
                  </td>
                </tr>
              ) : (
                coupons.map((c) => (
                  <tr key={c._id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 group-hover:bg-white group-hover:shadow-md transition-all">
                           <Tag className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col">
                           <span className="font-mono font-bold text-gray-900 tracking-wide text-sm">{c.code}</span>
                           <span className="text-xs text-gray-400">Created recently</span>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-1">
                        {c.type === "PERCENT" ? (
                          <span className="text-sm font-bold text-gray-900">
                            {c.value}% OFF
                          </span>
                        ) : (
                          <span className="text-sm font-bold text-gray-900">
                            ₹{c.value} FLAT
                          </span>
                        )}
                        {c.maxDiscount && (
                           <span className="text-[10px] text-gray-400 font-medium bg-gray-100 px-1.5 py-0.5 rounded w-fit">Max ₹{c.maxDiscount}</span>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-5">
                        <span className="text-sm text-gray-600">
                             {c.minOrderAmount ? `₹${c.minOrderAmount}` : '-'}
                        </span>
                    </td>

                    <td className="px-6 py-5 text-sm text-gray-600">
                       {c.usageLimit ? (
                           <span className="font-medium text-gray-900">{c.usageLimit} <span className="text-gray-400 font-normal">uses</span></span>
                       ) : (
                           <span className="text-gray-400">Unlimited</span>
                       )}
                    </td>

                    <td className="px-6 py-5 text-center">
                      <button 
                        onClick={() => toggleStatus(c)}
                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all shadow-sm ${
                          c.isActive 
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-100 hover:bg-emerald-100" 
                            : "bg-gray-100 text-gray-500 border border-gray-200 hover:bg-gray-200"
                        }`}
                      >
                         {c.isActive ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                         {c.isActive ? "Active" : "Inactive"}
                      </button>
                    </td>

                    <td className="px-8 py-5 text-right">
                       <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {navigator.clipboard.writeText(c.code); toast.success("Copied!");}}
                            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-white hover:shadow-sm rounded-lg transition-all"
                            title="Copy Code"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteCoupon(c._id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Coupons;