import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { assets } from '../../assets/assets';
import { ArrowLeft } from 'lucide-react'; 

const AddCategory = () => {
    const { axios, invalidateCategories, fetchCategoriesOnce } = useAppContext();
    const navigate = useNavigate();
    
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [groupId, setGroupId] = useState(''); // Default empty for no group
    const [groups, setGroups] = useState([]);   
    const [image, setImage] = useState(false);
    const [loading, setLoading] = useState(false);

    // Fetch Groups on Mount
    useEffect(() => {
        const fetchGroups = async () => {
            try {
                const { data } = await axios.get('/api/category-group/list');
                if (data.success) {
                    setGroups(data.groups);
                   
                }
            } catch (error) {
                toast.error("Failed to load groups");
            }
        };
        fetchGroups();
    }, []);

    const onSubmitHandler = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const formData = new FormData();
            formData.append('name', name);
            formData.append('description', description);
            
            // Only append groupId if one is selected
            if (groupId) {
                formData.append('groupId', groupId);
            }

            if (image) {
                formData.append('image', image);
            }

            const { data } = await axios.post('/api/category/add', formData);

            if (data.success) {
                toast.success(data.message);
                invalidateCategories();        
                await fetchCategoriesOnce(true);   
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
            <div className="max-w-4xl mx-auto">
                
                {/* Back Button */}
                <button 
                    type="button" 
                    onClick={() => navigate('/admin/categories')} 
                    className="mb-6 flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
                >
                    <ArrowLeft size={18} />
                    Back to Categories
                </button>

                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-2xl font-bold text-slate-900">Add Category</h1>
                    <button type="submit" disabled={loading} className="px-6 py-2.5 text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-lg transition-all">
                       {loading ? 'Saving...' : 'Save Category'}
                    </button>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm space-y-6">
                    
                    {/* Image Upload */}
                    <div>
                         <label className="block text-sm font-medium text-slate-700 mb-2">Category Image</label>
                         <label htmlFor="image" className="flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors overflow-hidden relative">
                            <img 
                                className={`w-full h-full object-cover ${!image ? 'p-6 opacity-50' : ''}`} 
                                src={image ? URL.createObjectURL(image) : assets.upload_area} 
                                alt="upload" 
                            />
                            <input 
                                onChange={(e) => setImage(e.target.files[0])} 
                                type="file" 
                                id="image" 
                                hidden 
                            />
                         </label>
                         <p className="text-xs text-slate-400 mt-2">Recommended: Square JPG/PNG (e.g., 500x500px)</p>
                    </div>

                    {/* Group Selection Dropdown */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Parent Group (Optional)</label>
                        <select 
                            value={groupId} 
                            onChange={(e) => setGroupId(e.target.value)} 
                            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 text-gray-700"
                           
                        >
                            <option value="">None (Ungrouped)</option> {/*  None option */}
                            {groups.map(g => (
                                <option key={g._id} value={g._id}>{g.name}</option>
                            ))}
                        </select>
                        <p className="text-xs text-slate-400 mt-2">
                            Select a group to show this category in the Mega Menu. Leave as "None" for standalone categories.
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Category Name</label>
                        <input 
                            type="text" 
                            value={name} 
                            onChange={(e) => setName(e.target.value)} 
                            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg outline-none" 
                            placeholder="e.g. T-Shirts" 
                            required 
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                        <textarea 
                            value={description} 
                            onChange={(e) => setDescription(e.target.value)} 
                            rows={4} 
                            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg outline-none resize-none" 
                        ></textarea>
                    </div>
                </div>
            </div>
        </form>
    );
};

export default AddCategory;