import React, { useEffect, useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { Trash2, Plus, Edit, ArrowLeft } from 'lucide-react';  

const CategoryGroupList = () => {
    const { axios } = useAppContext();
    const navigate = useNavigate();
    const [groups, setGroups] = useState([]);

    const fetchGroups = async () => {
        try {
            const { data } = await axios.get('/api/category-group/list');
            if (data.success) setGroups(data.groups);
        } catch (error) {
            console.log("Group fetch error:", error);
            toast.error(error?.response?.data?.message || "Failed to load groups");
        }
    };

    useEffect(() => {
        fetchGroups();
    }, []);

    const handleDelete = async (id) => {
        if(!window.confirm("Are you sure?")) return;
        try {
            const { data } = await axios.post('/api/category-group/remove', { id });
            if (data.success) {
                toast.success("Group deleted");
                fetchGroups();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    return (
        <div className="flex-1 h-screen overflow-hidden flex flex-col bg-gray-100 font-sans">
            <div className="flex-1 overflow-y-auto p-6 md:p-8">
                
                {/*  Back Button  */}
                <button 
                    onClick={() => navigate('/admin/categories')} 
                    className="mb-6 flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
                >
                    <ArrowLeft size={18} />
                    Back to Categories
                </button>

                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900">Category Groups</h2>
                        <p className="text-sm text-gray-500 mt-1">Manage main menu headings (e.g., Men, Women).</p>
                    </div>
                    <button 
                        onClick={() => navigate('/admin/category-groups/add')} 
                        className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all"
                    >
                        <Plus size={20} /> Add Group
                    </button>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4">Name</th>
                                <th className="px-6 py-4">Slug</th>
                                <th className="px-6 py-4">Order</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {groups.map((group) => (
                                <tr key={group._id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-semibold text-gray-900">{group.name}</td>
                                    <td className="px-6 py-4 text-gray-500">{group.slug}</td>
                                    <td className="px-6 py-4">
                                        <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-bold">{group.order}</span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-3">
                                            {/* Edit Button */}
                                            <button 
                                                onClick={() => navigate(`/admin/category-groups/edit/${group._id}`)} 
                                                className="text-gray-400 hover:text-indigo-600 transition-colors"
                                            >
                                                <Edit className="w-5 h-5" />
                                            </button>
                                            
                                            {/* Delete Button */}
                                            <button 
                                                onClick={() => handleDelete(group._id)} 
                                                className="text-gray-400 hover:text-red-600 transition-colors"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {groups.length === 0 && (
                                <tr><td colSpan="4" className="px-6 py-8 text-center text-gray-400">No groups found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default CategoryGroupList;