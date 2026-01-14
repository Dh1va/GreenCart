import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const AddCategory = () => {
    const { axios } = useAppContext();
    const navigate = useNavigate();
    
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);

    const onSubmitHandler = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { data } = await axios.post('/api/category/add', { name, description });

            if (data.success) {
                toast.success(data.message);
                navigate('/admin/categories');
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={onSubmitHandler} className="min-h-screen bg-gray-100 pb-20 p-6 md:p-8 font-sans">
            <div className="l mx-auto">
                
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <button type="button" onClick={() => navigate('/admin/categories')} className="p-2 bg-white border border-slate-200 rounded-lg text-slate-500 hover:text-slate-800 transition-colors">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        </button>
                        <h1 className="text-2xl font-bold text-slate-900">Add Category</h1>
                    </div>
                    <div className="flex gap-3">
                        <button type="button" onClick={() => navigate('/admin/categories')} className="px-5 py-2.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50">Cancel</button>
                        <button type="submit" disabled={loading} className="px-6 py-2.5 text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-lg shadow-slate-900/20 active:scale-95 transition-all">
                            {loading ? 'Saving...' : 'Save Category'}
                        </button>
                    </div>
                </div>

                {/* Main Card */}
                <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Category Name</label>
                        <input 
                            type="text" 
                            value={name} 
                            onChange={(e) => setName(e.target.value)} 
                            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium" 
                            placeholder="e.g. Electronics" 
                            required 
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Description (Optional)</label>
                        <textarea 
                            value={description} 
                            onChange={(e) => setDescription(e.target.value)} 
                            rows={4} 
                            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all resize-none" 
                            placeholder="Briefly describe this collection..."
                        ></textarea>
                        <p className="text-xs text-slate-400 mt-2">This description may be shown on the category page for SEO purposes.</p>
                    </div>
                </div>

            </div>
        </form>
    );
};

export default AddCategory;