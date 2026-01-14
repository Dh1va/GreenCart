import React, { useEffect, useState, useMemo, useRef } from "react";
import { useAppContext } from "../../context/AppContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

// --- ICONS ---
const SearchIcon = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;
const FilterIcon = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>;
const MoreIcon = () => <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>;
const PhoneIcon = () => <svg className="w-3.5 h-3.5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>;
const CloseIcon = () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>;
const CheckIcon = () => <svg className="w-4 h-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>;
const WarningIcon = () => <svg className="w-12 h-12 text-red-100 bg-red-50 p-2 rounded-full mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>;

const Users = () => {
  
  const navigate = useNavigate();
  const { users, setUsers, fetchUsersOnce, invalidateUsers, axios } = useAppContext();
  
  // Data State
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newUser, setNewUser] = useState({ name: "", mobile: "" });
  
  // Block Modal State
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [userToBlock, setUserToBlock] = useState(null);

  // Filter State
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all"); 
  const [sortOrder, setSortOrder] = useState("newest");    
  const filterRef = useRef(null);

  // Drawer & Selection
  const [selectedUser, setSelectedUser] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  
useEffect(() => {
  fetchUsersOnce().finally(() => setLoading(false));
}, []);
 

  // --- CREATE USER ---
  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
        console.log("Creating user:", newUser);
        const { data } = await axios.post("/api/admin-users/create", newUser);
        
        if (data.success) {
            toast.success(data.message);
            setIsCreateOpen(false);
            setNewUser({ name: "", mobile: "" });
            invalidateUsers();
fetchUsersOnce();
            
        } else {
            toast.error(data.message);
        }
    } catch (error) {
        console.error("Create User Error:", error);
        toast.error(error.response?.data?.message || "Failed to create user");
    }
  };

  // --- BLOCK USER ACTIONS ---
  const openBlockModal = (user) => {
      setUserToBlock(user);
      setIsBlockModalOpen(true);
  };

  const confirmBlockUser = async () => {
    if(!userToBlock) return;
    
    try {
        console.log("Blocking user:", userToBlock._id);
        const { data } = await axios.post("/api/admin-users/block", { id: userToBlock._id });
        
        if(data.success) {
            toast.success(data.message);
            // Optimistic update
            setUsers(prev => prev.map(u => u._id === userToBlock._id ? { ...u, isBlocked: !u.isBlocked } : u));
            if(selectedUser && selectedUser._id === userToBlock._id) {
                setSelectedUser(prev => ({...prev, isBlocked: !prev.isBlocked}));
            }
            setIsBlockModalOpen(false);
            setUserToBlock(null);
            invalidateUsers();
fetchUsersOnce();
        } else {
            toast.error(data.message);
        }
    } catch (error) {
        console.error("Block User Error:", error);
        toast.error("Failed to update status");
    }
  };

  // --- FILTER & SORT LOGIC ---
  const filteredUsers = useMemo(() => {
    let result = users;
    const term = search.toLowerCase();
    
    if (term) {
      result = result.filter(u => 
        (u.name && u.name.toLowerCase().includes(term)) ||
        (u.mobile && u.mobile.includes(term))
      );
    }
    
    if (statusFilter !== "all") {
      result = result.filter(u => statusFilter === "active" ? !u.isBlocked : u.isBlocked);
    }
    
    result = [...result].sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });
    
    return result;
  }, [users, search, statusFilter, sortOrder]);

  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredUsers.slice(start, start + itemsPerPage);
  }, [filteredUsers, currentPage]);

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  const getInitials = (name) => {
    if (!name) return "U";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().substring(0, 2);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) setIsFilterOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => { setCurrentPage(1); }, [search, statusFilter, sortOrder]);

  const handleViewDetails = async (user) => {
  try {
    const { data } = await axios.get(`/api/admin-users/${user._id}/details`);

    if (data.success) {
      setSelectedUser({
        ...data.user,
        addresses: data.addresses,
      });
      setIsDrawerOpen(true);
    } else {
      toast.error(data.message);
    }
  } catch {
    toast.error("Failed to load user details");
  }
};

  const handleViewHistory = () => {
      if(!selectedUser) return;
      navigate(`/admin/users/${selectedUser._id}/orders`);
  };

  return (
    // FIX 1: Removed 'h-screen', 'overflow-hidden', 'flex-1'. 
    // We let the AdminLayout handle the height and scrolling.
    <div className="relative bg-gray-100 font-sans min-h-full">
      
      {/* FIX 2: Removed 'overflow-y-auto' and 'no-scrollbar'. This div now just pads content. */}
      <div className="p-6 md:p-8">
        <div className="mx-auto space-y-6">
          
          {/* HEADER */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Customers</h1>
              <p className="text-sm text-slate-500 mt-1">View and manage your user base.</p>
            </div>
            
            <div className="flex items-center gap-3 w-full md:w-auto">
              {/* Search Bar */}
              <div className="relative group flex-1 md:flex-none">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-slate-400 group-focus-within:text-indigo-500 transition-colors"><SearchIcon /></span>
                </div>
                <input
                  type="text"
                  placeholder="Search name or mobile..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 pr-4 py-2.5 w-full md:w-64 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all shadow-sm"
                />
              </div>

              {/* Filter Button */}
              <div className="relative" ref={filterRef}>
                <button 
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className={`flex items-center gap-2 px-4 py-2.5 bg-white border rounded-xl text-sm font-medium transition-all shadow-sm active:scale-95 ${isFilterOpen ? 'border-indigo-500 ring-2 ring-indigo-500/10 text-indigo-600' : 'border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'}`}
                >
                  <FilterIcon />
                  <span className="hidden sm:inline">Filter</span>
                  {(statusFilter !== "all" || sortOrder !== "newest") && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-indigo-500 rounded-full border-2 border-white"></span>
                  )}
                </button>

                {isFilterOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 p-2 animate-slideInDown origin-top-right">
                    <div className="space-y-1">
                      <div className="px-3 py-2">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Sort By</p>
                        <button onClick={() => setSortOrder("newest")} className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${sortOrder === "newest" ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-slate-600 hover:bg-slate-50'}`}>Newest First {sortOrder === "newest" && <CheckIcon />}</button>
                        <button onClick={() => setSortOrder("oldest")} className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${sortOrder === "oldest" ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-slate-600 hover:bg-slate-50'}`}>Oldest First {sortOrder === "oldest" && <CheckIcon />}</button>
                      </div>
                      <div className="h-px bg-slate-100 my-1"></div>
                      <div className="px-3 py-2">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Status</p>
                        {['all', 'active', 'blocked'].map((status) => (
                          <button key={status} onClick={() => setStatusFilter(status)} className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm capitalize transition-colors ${statusFilter === status ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-slate-600 hover:bg-slate-50'}`}>
                            {status} {statusFilter === status && <CheckIcon />}
                          </button>
                        ))}
                      </div>
                      <div className="p-2 border-t border-slate-100">
                        <button onClick={() => { setStatusFilter("all"); setSortOrder("newest"); setIsFilterOpen(false); }} className="w-full py-2 text-xs font-semibold text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-lg">Reset Filters</button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <button onClick={() => setIsCreateOpen(true)} className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-slate-900/20 transition-all active:scale-95 flex-shrink-0">
                + Add New
              </button>
            </div>
          </div>

          {/* TABLE CONTAINER */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm min-h-[400px] flex flex-col">
            {loading ? (
              <div className="p-12 text-center text-slate-400">Loading customers...</div>
            ) : filteredUsers.length === 0 ? (
              <div className="p-12 text-center flex flex-col items-center">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4"><SearchIcon /></div>
                <h3 className="text-slate-900 font-medium">No customers found</h3>
                <button onClick={() => { setSearch(""); setStatusFilter("all"); }} className="mt-4 text-indigo-600 text-sm font-medium hover:underline">Clear all filters</button>
              </div>
            ) : (
              // FIX 3: Removed 'overflow-y-visible'. Keeping 'overflow-x-auto' for table responsiveness.
              <div className="overflow-x-auto"> 
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead className="bg-slate-50/50 text-slate-500 text-xs uppercase font-bold tracking-wider border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-4">Customer</th>
                      <th className="px-6 py-4">Mobile</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Joined Date</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paginatedUsers.map((user, index) => {
                      // Determine if row is near bottom to flip menu
                      const isLastRow = index > 5 && index >= paginatedUsers.length - 2;
                      
                      return (
                        <tr key={user._id} className="hover:bg-slate-50/50 transition-colors group relative">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-4">
                              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shadow-sm ring-2 ring-white">
                                {getInitials(user.name)}
                              </div>
                              <div>
                                <p className="font-semibold text-slate-900 text-sm">{user.name || "Unknown"}</p>
                                <p className="text-xs text-slate-500">ID: {user._id.slice(-6).toUpperCase()}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center text-sm text-slate-600 font-medium gap-2">
                              <PhoneIcon />
                              {user.mobile}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {user.isBlocked ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-100"><span className="w-1.5 h-1.5 rounded-full bg-red-500 mr-1.5"></span>Blocked</span>
                            ) : (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></span>Active</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600">
                            {new Date(user.createdAt).toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' })}
                          </td>
                          <td className="px-6 py-4 text-right">
                            {/* Action Menu Container */}
                            <div className="relative inline-block text-left group/menu">
                              <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors relative z-10">
                                <MoreIcon />
                              </button>
                              
                              {/* Invisible Hover Bridge */}
                              <div className={`absolute right-0 w-32 h-6 ${isLastRow ? 'bottom-full' : 'top-full'} z-20`}></div>

                              {/* Dropdown Menu */}
                              <div className={`absolute right-0 w-36 z-50 hidden group-hover/menu:block hover:block ${isLastRow ? 'bottom-full mb-1' : 'top-full mt-1'}`}>
                                <div className="bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden py-1">
                                  <button onClick={() => handleViewDetails(user)} className="block w-full text-left px-4 py-2.5 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">
                                    View Details
                                  </button>
                                  <button onClick={() => openBlockModal(user)} className={`block w-full text-left px-4 py-2.5 text-xs font-medium hover:bg-slate-50 transition-colors border-t border-slate-50 ${user.isBlocked ? "text-emerald-600" : "text-rose-600"}`}>
                                    {user.isBlocked ? "Unblock User" : "Block User"}
                                  </button>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* PAGINATION */}
          <div className="flex items-center justify-between border-t border-slate-200 pt-4 px-1 pb-10">
            <p className="text-sm text-slate-500">Showing <span className="font-medium">{paginatedUsers.length}</span> of <span className="font-medium">{filteredUsers.length}</span> customers</p>
            <div className="flex gap-2">
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50">Previous</button>
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-3 py-1 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50">Next</button>
            </div>
          </div>
        </div>
      </div>

      {/* --- CREATE USER MODAL --- */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center isolate">
            <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-[2px]" onClick={() => setIsCreateOpen(false)}></div>
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 m-4 animate-scaleIn">
                <h2 className="text-xl font-bold text-slate-900 mb-1">Add New Customer</h2>
                <p className="text-sm text-slate-500 mb-6">Create a new account manually.</p>
                <form onSubmit={handleCreateUser} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Full Name</label>
                        <input required type="text" value={newUser.name} onChange={(e)=>setNewUser({...newUser, name: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500" placeholder="John Doe" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Mobile Number</label>
                        <input required type="text" value={newUser.mobile} onChange={(e)=>setNewUser({...newUser, mobile: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500" placeholder="+91 9876543210" />
                    </div>
                    <div className="flex gap-3 mt-6 pt-2">
                        <button type="button" onClick={() => setIsCreateOpen(false)} className="flex-1 px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg font-medium">Cancel</button>
                        <button type="submit" className="flex-1 px-4 py-2 text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg font-bold shadow-lg shadow-indigo-200">Create Account</button>
                    </div>
                </form>
            </div>
        </div>
      )}

      {/* --- BLOCK CONFIRMATION MODAL --- */}
      {isBlockModalOpen && userToBlock && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center isolate">
            <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-[2px]" onClick={() => setIsBlockModalOpen(false)}></div>
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 m-4 animate-scaleIn text-center">
                <div className="flex justify-center"><WarningIcon /></div>
                <h2 className="text-lg font-bold text-slate-900 mb-2">
                    {userToBlock.isBlocked ? "Unblock this user?" : "Block this user?"}
                </h2>
                <p className="text-sm text-slate-500 mb-6">
                    {userToBlock.isBlocked 
                        ? "This will restore their access to the platform." 
                        : "They will instantly lose access to their account."}
                </p>
                <div className="flex gap-3">
                    <button onClick={() => setIsBlockModalOpen(false)} className="flex-1 px-4 py-2.5 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl font-medium transition-colors">Cancel</button>
                    <button onClick={confirmBlockUser} className={`flex-1 px-4 py-2.5 text-white rounded-xl font-bold shadow-lg transition-colors ${userToBlock.isBlocked ? "bg-emerald-600 hover:bg-emerald-700" : "bg-red-600 hover:bg-red-700"}`}>
                        {userToBlock.isBlocked ? "Unblock" : "Block"}
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* --- USER DETAILS DRAWER --- */}
      {isDrawerOpen && selectedUser && (
        <div className="fixed inset-0 z-[100] isolate flex justify-end">
          <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-[2px]" transition-opacity onClick={() => setIsDrawerOpen(false)}></div>
          <div className="relative w-full max-w-md h-full bg-white shadow-2xl flex flex-col animate-slideInRight">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white">
              <h2 className="text-lg font-bold text-slate-800">Customer Details</h2>
              <button onClick={() => setIsDrawerOpen(false)} className="p-2 -mr-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-50"><CloseIcon /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <div className="flex items-center gap-4 mb-8">
                <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center text-xl font-bold text-slate-500 border border-slate-200">{getInitials(selectedUser.name)}</div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{selectedUser.name || "Unknown"}</h3>
                  {selectedUser.isBlocked ? <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-50 text-red-700 border border-red-100 mt-1">Blocked</span> : <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100 mt-1">Active Customer</span>}
                </div>
              </div>
              <div className="space-y-6">
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Contact Information</h4>
                  <div className="bg-slate-50 rounded-xl p-4 space-y-3 border border-slate-100">
                    <div><p className="text-xs text-slate-500">Mobile Number</p><p className="text-sm font-medium text-slate-900">{selectedUser.mobile}</p></div>
                    <div><p className="text-xs text-slate-500">User ID</p><p className="text-sm font-mono text-slate-600 select-all">{selectedUser._id}</p></div>
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Saved Addresses</h4>
                  {selectedUser.addresses && selectedUser.addresses.length > 0 ? (
                    <div className="space-y-3">
                      {selectedUser.addresses.map((addr, i) => (
                        <div key={i} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                          <div className="flex justify-between items-start mb-1">
                            <span className="font-semibold text-sm text-slate-900">{addr.type || "Home"}</span>
                            {addr.isDefault && <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">Default</span>}
                          </div>
                          <p className="text-sm text-slate-600 leading-relaxed">{addr.street}, {addr.city}<br />{addr.state}, {addr.zipCode}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-slate-400 italic bg-slate-50 p-4 rounded-xl border border-slate-100 border-dashed text-center">No addresses saved.</div>
                  )}
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-slate-100 bg-slate-50">
              <button onClick={handleViewHistory} className="w-full bg-white border border-slate-300 text-slate-700 font-semibold py-2.5 rounded-lg hover:bg-slate-50 transition-colors shadow-sm">View Order History</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;