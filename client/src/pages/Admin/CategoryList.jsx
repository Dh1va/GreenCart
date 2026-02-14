import React, { useEffect, useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, X, Plus, Layers, Search, ChevronLeft, ChevronRight, ChevronDown, Filter } from 'lucide-react'; 

const CategoryList = () => {
    const { categories, fetchCategoriesOnce, axios } = useAppContext();
    const navigate = useNavigate();

    // --- State for Filters & Pagination ---
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedGroup, setSelectedGroup] = useState("");
    const [groups, setGroups] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // --- Modal State ---
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Fetch Data
    useEffect(() => {
        fetchCategoriesOnce();
        
        // Fetch groups for filter dropdown
        const fetchGroups = async () => {
            try {
                const { data } = await axios.get('/api/category-group/list');
                if (data.success) setGroups(data.groups);
            } catch (error) {
                console.error("Failed to load groups for filter");
            }
        };
        fetchGroups();
    }, []);

    // --- Filtering Logic ---
    const filteredCategories = categories.filter(cat => {
        // 1. Search Filter
        const matchesSearch = cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              (cat.description && cat.description.toLowerCase().includes(searchTerm.toLowerCase()));
        
        // 2. Group Filter
        const matchesGroup = selectedGroup === "" || 
                             (cat.groupId && cat.groupId._id === selectedGroup);

        return matchesSearch && matchesGroup;
    });

    // --- Pagination Logic ---
    const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentCategories = filteredCategories.slice(startIndex, startIndex + itemsPerPage);

    // Reset page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, selectedGroup]);

    // 1. Open Modal
    const confirmDelete = (category) => {
        setCategoryToDelete(category);
        setIsDeleteModalOpen(true);
    };

    // 2. Close Modal
    const closeDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setCategoryToDelete(null);
    };

    // 3. Actual Delete Action
    const handleDelete = async () => {
        if (!categoryToDelete) return;
        
        setIsDeleting(true);
        try {
            const { data } = await axios.post('/api/category/remove', { id: categoryToDelete._id });
            if (data.success) {
                toast.success("Category deleted successfully");
                fetchCategoriesOnce(true); 
                closeDeleteModal();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="flex-1 h-screen overflow-hidden flex flex-col relative  font-sans">
            <div className="flex-1 overflow-y-auto no-scrollbar p-6 md:p-8">
                
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Categories</h2>
                        <p className="text-sm text-gray-500 mt-1">Manage your product categories.</p>
                    </div>

                    <div className="flex gap-3">
                        <button 
                            onClick={() => navigate('/admin/category-groups')} 
                            className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl transition-all"
                        >
                            <Layers size={18} strokeWidth={2.5} />
                            Manage Groups
                        </button>

                        <button 
                            onClick={() => navigate('/admin/categories/add')} 
                            className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-lg shadow-slate-900/20 active:scale-95 transition-all"
                        >
                            <Plus size={20} strokeWidth={2.5} />
                            Add Category
                        </button>
                    </div>
                </div>

                {/* --- Filters Toolbar --- */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    
                    {/* Search Input */}
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input 
                            type="text" 
                            placeholder="Search categories..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-medium"
                        />
                    </div>

                    {/* Group Filter Dropdown */}
                    <div className="relative w-full md:w-64">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <select
                            value={selectedGroup}
                            onChange={(e) => setSelectedGroup(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-medium appearance-none cursor-pointer"
                        >
                            <option value="">All Groups</option>
                            {groups.map(group => (
                                <option key={group._id} value={group._id}>{group.name}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                    </div>

                </div>

                {/* Table Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-50/50 text-gray-500 text-xs uppercase font-bold tracking-wider border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4">Category</th>
                                    <th className="px-6 py-4">Group</th>
                                    <th className="px-6 py-4">Description</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-100">
                                {currentCategories.length > 0 ? (
                                    currentCategories.map((cat) => (
                                        <tr key={cat._id} className="hover:bg-gray-50/80 transition-colors group">
                                            
                                            {/* Category Name & Image */}
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-12 w-12 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden flex-shrink-0">
                                                        {cat.image ? (
                                                            <img src={cat.image} alt="" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">No Img</div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-gray-900">{cat.name}</p>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Group Name Display */}
                                            <td className="px-6 py-4">
                                                {cat.groupId ? (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100">
                                                        {cat.groupId.name}
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-gray-400 italic">Unassigned</span>
                                                )}
                                            </td>

                                            {/* Description */}
                                            <td className="px-6 py-4 max-w-xs">
                                                <p className="text-sm text-gray-500 truncate">
                                                    {cat.description || "No description"}
                                                </p>
                                            </td>

                                            {/* Actions */}
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-3">
                                                    <button 
                                                        onClick={() => navigate(`/admin/category/manage/${cat._id}`)}
                                                        className="px-3 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors"
                                                    >
                                                        Edit
                                                    </button>
                                                    
                                                    <button 
                                                        onClick={() => confirmDelete(cat)}
                                                        className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                                                        title="Delete Category"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-12 text-center text-gray-400">
                                            {searchTerm || selectedGroup ? 'No matching categories found.' : 'No categories found.'}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* --- Pagination Controls --- */}
                    {totalPages > 1 && (
                        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
                            <span className="text-sm text-gray-500">
                                Page <span className="font-bold text-gray-900">{currentPage}</span> of {totalPages}
                            </span>
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="p-2 border border-gray-200 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    <ChevronLeft className="w-4 h-4 text-gray-600" />
                                </button>
                                <button 
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="p-2 border border-gray-200 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    <ChevronRight className="w-4 h-4 text-gray-600" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* DELETE MODAL  */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={closeDeleteModal}></div>
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 transform transition-all scale-100">
                        <button onClick={closeDeleteModal} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                        <div className="flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
                                <AlertTriangle className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Category?</h3>
                            <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                                Are you sure you want to delete <span className="font-bold text-gray-800">"{categoryToDelete?.name}"</span>?
                            </p>
                            <div className="flex gap-3 w-full">
                                <button onClick={closeDeleteModal} className="flex-1 py-2.5 px-4 bg-white border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
                                <button onClick={handleDelete} disabled={isDeleting} className="flex-1 py-2.5 px-4 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors shadow-lg shadow-red-600/20 disabled:opacity-70">
                                    {isDeleting ? 'Deleting...' : 'Yes, Delete'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CategoryList;