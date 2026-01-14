import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const CategoryList = () => {
    
    const navigate = useNavigate();
    const { categories, fetchCategoriesOnce, invalidateCategories, axios } = useAppContext();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
    fetchCategoriesOnce().finally(() => setLoading(false));
}, []);

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this category?")) return;
        try {
            const { data } = await axios.post('/api/category/remove', { id });
            if (data.success) {
                toast.success(data.message);
                invalidateCategories();
fetchCategoriesOnce();
                
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    

    return (
        <div className="flex-1 h-screen overflow-hidden flex flex-col relative bg-gray-100 font-sans">
            <div className="flex-1 overflow-y-auto no-scrollbar p-6 md:p-8">
                <div className=" mx-auto space-y-8 pb-12">
                    
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Categories</h1>
                            <p className="text-slate-500 mt-1">Organize your product collections</p>
                        </div>
                        <button 
                            onClick={() => navigate('/admin/categories/add')}
                            className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl font-semibold shadow-lg shadow-slate-900/20 transition-all active:scale-95"
                        >
                            + Create Category
                        </button>
                    </div>

                    {/* Table */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-50/50 text-slate-500 text-xs uppercase font-bold tracking-wider border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-4">Name</th>
                                    <th className="px-6 py-4">Description</th>
                                    <th className="px-6 py-4 text-center">Management</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {categories.map((cat) => (
                                    <tr key={cat._id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 font-semibold text-slate-900">{cat.name}</td>
                                        <td className="px-6 py-4 text-sm text-slate-500 max-w-xs truncate">{cat.description || "—"}</td>
                                        
                                        {/* Buttons: Always Visible */}
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex items-center justify-center gap-3">
                                                <button 
                                                    // Pass category name in URL query
                                                    onClick={() => navigate(`/admin/products?category=${encodeURIComponent(cat.name)}`)}
                                                    className="px-3 py-1.5 text-xs font-medium bg-white text-indigo-600 rounded-lg border border-indigo-200 hover:bg-indigo-50 hover:border-indigo-300 transition-all shadow-sm"
                                                >
                                                    View Products
                                                </button>
                                                <button 
                                                    // Navigate to Assignment Page
                                                    onClick={() => navigate(`/admin/categories/assign/${encodeURIComponent(cat.name)}`)}
                                                    className="px-3 py-1.5 text-xs font-medium bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300 transition-all shadow-sm"
                                                >
                                                    + Add Existing
                                                </button>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4 text-right">
                                            <button onClick={() => handleDelete(cat._id)} className="p-2 text-slate-400 hover:text-rose-600 transition-colors">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CategoryList;