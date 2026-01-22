import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react'; // 👈 Import Back Icon

const AddCategoryGroup = () => {
    const { axios } = useAppContext();
    const navigate = useNavigate();
    const { id } = useParams(); // 👈 Get ID from URL to check if we are editing
    
    const [name, setName] = useState('');
    const [order, setOrder] = useState(0);
    const [loading, setLoading] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);

    // 👇 Fetch data if in Edit Mode
    useEffect(() => {
        if (id) {
            setIsEditMode(true);
            const fetchGroup = async () => {
                try {
                    const { data } = await axios.get('/api/category-group/list');
                    if (data.success) {
                        const group = data.groups.find(g => g._id === id);
                        if (group) {
                            setName(group.name);
                            setOrder(group.order);
                        } else {
                            toast.error("Group not found");
                            navigate('/admin/category-groups');
                        }
                    }
                } catch (error) {
                    toast.error("Failed to load group details");
                }
            };
            fetchGroup();
        }
    }, [id, axios, navigate]);

    const onSubmitHandler = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            let data;
            
            if (isEditMode) {
                // 👉 Edit Mode: Call Update API
                const res = await axios.post('/api/category-group/update', { id, name, order });
                data = res.data;
            } else {
                // 👉 Add Mode: Call Add API
                const res = await axios.post('/api/category-group/add', { name, order });
                data = res.data;
            }

            if (data.success) {
                toast.success(data.message);
                navigate('/admin/category-groups'); // Redirect back to list
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
            <div className="max-w-4xl mx-auto">
                
                {/* 👇 Back Button */}
                <button 
                    type="button" 
                    onClick={() => navigate('/admin/category-groups')} 
                    className="mb-6 flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
                >
                    <ArrowLeft size={18} />
                    Back to Groups
                </button>

                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-2xl font-bold text-slate-900">
                        {isEditMode ? 'Edit Category Group' : 'Add Category Group'}
                    </h1>
                    <button type="submit" disabled={loading} className="px-6 py-2.5 text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-lg transition-all">
                        {loading ? 'Saving...' : (isEditMode ? 'Update Group' : 'Save Group')}
                    </button>
                </div>

                {/* Main Card */}
                <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Group Name</label>
                        <input 
                            type="text" 
                            value={name} 
                            onChange={(e) => setName(e.target.value)} 
                            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-medium" 
                            placeholder="e.g. Men, Women, Kids" 
                            required 
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Sort Order</label>
                        <input 
                            type="number" 
                            value={order} 
                            onChange={(e) => setOrder(e.target.value)} 
                            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
                            placeholder="0" 
                        />
                        <p className="text-xs text-slate-400 mt-2">Lower numbers appear first in the menu (e.g. 1 shows before 2).</p>
                    </div>
                </div>

            </div>
        </form>
    );
};

export default AddCategoryGroup;