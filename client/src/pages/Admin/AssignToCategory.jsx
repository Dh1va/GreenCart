import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../context/AppContext';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const AssignToCategory = () => {
    const { products, axios, fetchProducts } = useAppContext();
    const { categoryName } = useParams(); // Get category from URL
    const navigate = useNavigate();
    const [search, setSearch] = useState("");
    const [loadingId, setLoadingId] = useState(null);

    // Filter Logic: Only show products NOT already in this category
    const availableProducts = useMemo(() => {
        const term = search.toLowerCase();
        return products.filter(p => 
            p.category !== categoryName && // Exclude items already in this cat
            p.name.toLowerCase().includes(term)
        );
    }, [products, search, categoryName]);

    // Handle Move
    const assignProduct = async (productId) => {
        setLoadingId(productId);
        try {
            // We use a lightweight endpoint to just patch the category
            const { data } = await axios.patch('/api/product/assign-category', {
                productId,
                newCategory: categoryName
            });

            if (data.success) {
                toast.success("Product moved!");
                fetchProducts(); // Refresh list to remove moved item
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error("Failed to move product");
        } finally {
            setLoadingId(null);
        }
    };

    return (
        <div className="flex-1 h-screen overflow-hidden flex flex-col relative bg-gray-100 font-sans">
            <div className="flex-1 overflow-y-auto no-scrollbar p-6 md:p-8">
                <div className=" mx-auto space-y-8">
                    
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button onClick={() => navigate('/admin/categories')} className="p-2 bg-white border border-slate-200 rounded-lg text-slate-500 hover:text-slate-800">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                            </button>
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900">Add Products to "{categoryName}"</h1>
                                <p className="text-slate-500 text-sm mt-0.5">Select existing products to move into this category</p>
                            </div>
                        </div>
                        <input type="text" placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} className="px-4 py-2 w-64 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500" />
                    </div>

                    {/* List */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-4">Product</th>
                                    <th className="px-6 py-4">Current Category</th>
                                    <th className="px-6 py-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {availableProducts.length > 0 ? availableProducts.map((p) => (
                                    <tr key={p._id} className="hover:bg-slate-50/50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <img src={p.images[0]} alt="" className="w-10 h-10 rounded object-cover bg-gray-100" />
                                                <span className="font-medium text-slate-900">{p.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-500">
                                            <span className="px-2 py-1 rounded bg-gray-100 text-gray-600 text-xs font-semibold">{p.category}</span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button 
                                                onClick={() => assignProduct(p._id)}
                                                disabled={loadingId === p._id}
                                                className="px-4 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors disabled:opacity-50"
                                            >
                                                {loadingId === p._id ? 'Moving...' : 'Move Here'}
                                            </button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan="3" className="px-6 py-12 text-center text-slate-400">No available products found.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default AssignToCategory;