import React, { useEffect, useState } from "react";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";
import { Trash2, Truck, Plus, Clock, Edit, X, Package } from "lucide-react";

const Shipping = () => {
  const { couriers, fetchCouriersOnce, invalidateCouriers, axios, currency } = useAppContext();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [editingId, setEditingId] = useState(null);

  // ✅ Added chargePerItem to state
  const [form, setForm] = useState({ 
    name: "", 
    price: "", 
    minDays: "", 
    maxDays: "",
    chargePerItem: false 
  });

  useEffect(() => {
    fetchCouriersOnce().finally(() => setLoading(false));
  }, []);

  const resetForm = () => {
    setForm({ name: "", price: "", minDays: "", maxDays: "", chargePerItem: false });
    setEditingId(null);
  };

  const handleEditClick = (courier) => {
    setForm({
      name: courier.name,
      price: courier.price,
      minDays: courier.minDays,
      maxDays: courier.maxDays,
      chargePerItem: courier.chargePerItem || false // ✅ Load existing value
    });
    setEditingId(courier._id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if(!form.name || form.price === "") return toast.error("Name and Price required");
    
    setSubmitting(true);
    try {
      const endpoint = editingId ? "/api/courier/update" : "/api/courier/add";
      const payload = editingId ? { ...form, id: editingId } : form;
      
      // Convert inputs to numbers
      payload.price = Number(payload.price);
      payload.minDays = Number(payload.minDays);
      payload.maxDays = Number(payload.maxDays);

      const { data } = editingId 
        ? await axios.put(endpoint, payload) 
        : await axios.post(endpoint, payload);

      if (data.success) {
        toast.success(editingId ? "Updated successfully" : "Added successfully");
        resetForm();
        invalidateCouriers();
        fetchCouriersOnce();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Operation failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Remove this courier option?")) return;
    try {
        const { data } = await axios.post("/api/courier/delete", { id });
        if(data.success) {
            toast.success("Deleted");
            invalidateCouriers();
            fetchCouriersOnce();
            if (id === editingId) resetForm();
        }
    } catch (error) {
        toast.error("Delete failed");
    }
  };

  return (
    <div className="flex-1 h-screen overflow-hidden flex flex-col relative bg-gray-100 font-sans">
      <div className="flex-1 overflow-y-auto no-scrollbar p-6 md:p-8">
        
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Shipping Configuration</h2>
          <p className="text-sm text-gray-500 mt-1">Manage courier partners and delivery rates.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* ADD/EDIT FORM */}
            <div className="lg:col-span-1">
                <div className={`bg-white rounded-xl border shadow-sm overflow-hidden sticky top-6 transition-all duration-300 ${editingId ? 'border-indigo-500 ring-1 ring-indigo-500' : 'border-gray-200'}`}>
                    <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                        <h3 className={`font-semibold flex items-center gap-2 ${editingId ? 'text-indigo-600' : 'text-gray-800'}`}>
                            {editingId ? <Edit className="w-4 h-4" /> : <Plus className="w-4 h-4" />} 
                            {editingId ? "Edit Courier" : "Add Courier"}
                        </h3>
                        {editingId && (
                            <button onClick={resetForm} className="text-xs font-medium text-gray-500 hover:text-gray-700 flex items-center gap-1">
                                <X className="w-3 h-3" /> Cancel
                            </button>
                        )}
                    </div>
                    
                    <form onSubmit={handleSubmit} className="p-6 space-y-4">
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase">Provider Name</label>
                            <input 
                                type="text" 
                                placeholder="e.g. FedEx Express" 
                                className="w-full mt-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all text-sm"
                                value={form.name}
                                onChange={e => setForm({...form, name: e.target.value})}
                            />
                        </div>

                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase">Base Rate ({currency})</label>
                            <input 
                                type="number" 
                                placeholder="0" 
                                className="w-full mt-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all text-sm"
                                value={form.price}
                                onChange={e => setForm({...form, price: e.target.value})}
                            />
                        </div>

                        {/* ✅ CHECKBOX FOR PER ITEM */}
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                            <input 
                                type="checkbox" 
                                id="chargePerItem"
                                className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 border-gray-300"
                                checked={form.chargePerItem}
                                onChange={e => setForm({...form, chargePerItem: e.target.checked})}
                            />
                            <label htmlFor="chargePerItem" className="text-sm font-medium text-gray-700 cursor-pointer select-none">
                                Charge per item quantity?
                            </label>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase">Min Days</label>
                                <input 
                                    type="number" 
                                    placeholder="2" 
                                    className="w-full mt-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all text-sm"
                                    value={form.minDays}
                                    onChange={e => setForm({...form, minDays: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase">Max Days</label>
                                <input 
                                    type="number" 
                                    placeholder="5" 
                                    className="w-full mt-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all text-sm"
                                    value={form.maxDays}
                                    onChange={e => setForm({...form, maxDays: e.target.value})}
                                />
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            disabled={submitting}
                            className={`w-full text-white py-2.5 rounded-lg font-medium text-sm transition-all shadow-md active:scale-95 disabled:opacity-70 mt-2 ${editingId ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-black hover:bg-gray-800'}`}
                        >
                            {submitting ? "Saving..." : editingId ? "Update Courier" : "Add Courier"}
                        </button>
                    </form>
                </div>
            </div>

            {/* LIST */}
            <div className="lg:col-span-2">
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Name</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Calculation</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">ETA</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr><td colSpan="4" className="text-center py-8 text-gray-400">Loading...</td></tr>
                            ) : couriers.length === 0 ? (
                                <tr><td colSpan="4" className="text-center py-8 text-gray-400">No couriers added yet.</td></tr>
                            ) : (
                                couriers.map(c => (
                                    <tr key={c._id} className={`hover:bg-gray-50 transition-colors group ${editingId === c._id ? 'bg-indigo-50/50' : ''}`}>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${editingId === c._id ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-600'}`}>
                                                    <Truck className="w-4 h-4" />
                                                </div>
                                                <span className="font-medium text-gray-900">{c.name}</span>
                                            </div>
                                        </td>
                                        
                                        {/* ✅ COST DISPLAY */}
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-gray-700">
                                                    {c.price === 0 ? <span className="text-green-600">Free</span> : `${currency}${c.price}`}
                                                </span>
                                                {c.chargePerItem ? (
                                                    <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded w-fit border border-indigo-100 flex items-center gap-1 mt-1">
                                                        <Package className="w-3 h-3" /> Per Item
                                                    </span>
                                                ) : (
                                                    <span className="text-[10px] text-gray-400">Flat Rate</span>
                                                )}
                                            </div>
                                        </td>

                                        <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                                            <div className="flex items-center gap-1.5">
                                                <Clock className="w-3.5 h-3.5 text-gray-400" />
                                                {c.minDays} - {c.maxDays} Days
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => handleEditClick(c)} className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg">
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleDelete(c._id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
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
      </div>
    </div>
  );
};

export default Shipping;