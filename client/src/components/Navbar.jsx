import React, { useEffect, useState, useRef, useMemo } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { assets } from "../assets/assets";
import { useAppContext } from "../context/AppContext";
import CartDrawer from "../components/CartDrawer";
import toast from "react-hot-toast";
import {
  Search,
  User,
  ShoppingBag,
  Menu,
  X,
  ChevronDown,
  Heart,
  FileText,
  LogOut,
  ChevronRight,
  ChevronLeft
} from "lucide-react";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [openCart, setOpenCart] = useState(false);
  const [mobileSearchInput, setMobileSearchInput] = useState("");
  
  // State for Mobile Submenu Navigation ('main' | 'categories')
  const [mobileMenuView, setMobileMenuView] = useState("main");

  const location = useLocation();

  const {
    user,
    setUser,
    setShowUserLogin,
    navigate,
    setSearchQuery,
    getCartCount,
    axios,
    setCartItems,
    cartItems,
    authChecked,
    wishlist,
    setWishlist,
    suppressCartAutoOpen,
    setSuppressCartAutoOpen,
    categories,
    fetchCategoriesOnce,
  } = useAppContext();

  useEffect(() => {
    fetchCategoriesOnce();
  }, []);

  // --- HELPER: Slugify Category Name ---
  const toSlug = (text) =>
    text
      .toLowerCase()
      .trim()
      .replace(/&/g, "and")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

  // --- HANDLER: Category Click ---
  const handleCategoryClick = (categoryName) => {
    const slug = toSlug(categoryName);
    navigate(`/products/${slug}`);
    setSearchQuery("");
    setOpen(false);
    window.scrollTo(0, 0);
  };

  // --- GROUPING LOGIC ---
  const groupedCategories = useMemo(() => {
    if (!Array.isArray(categories)) return [];
    const groups = {};
    const groupedOnly = categories.filter(
      (cat) => cat.groupId && cat.groupId.name
    );

    groupedOnly.forEach((cat) => {
      const groupName = cat.groupId.name;
      const groupOrder = cat.groupId.order !== undefined ? cat.groupId.order : 999;

      if (!groups[groupName]) {
        groups[groupName] = {
          name: groupName,
          order: groupOrder,
          cats: [],
        };
      }
      groups[groupName].cats.push(cat);
    });

    const sortedGroups = Object.values(groups).sort((a, b) => a.order - b.order);
    sortedGroups.forEach((group) => {
      group.cats.sort((a, b) => a.name.localeCompare(b.name));
    });

    return sortedGroups;
  }, [categories]);

  const handleGroupClick = (groupName) => {
    navigate(`/collections/${encodeURIComponent(groupName)}`);
    setOpen(false);
  };

  const logout = async () => {
    try {
      const { data } = await axios.get("/api/user/logout");
      if (data.success) {
        const preLoginCart = JSON.parse(localStorage.getItem("pre_login_guest_cart")) || {};
        localStorage.setItem("guest_cart", JSON.stringify(preLoginCart));
        localStorage.removeItem("pre_login_guest_cart");
        setCartItems(preLoginCart);
        setUser(null);
        setWishlist([]);
        
       
        toast.success("Logged out");
         navigate("/", { replace: true });
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  // --- CART AUTO OPEN LOGIC ---
  const prevCount = useRef(0);
  const didInit = useRef(false);

  useEffect(() => {
    if (!authChecked) return;
    const current = getCartCount();
    if (!didInit.current) {
      prevCount.current = current;
      didInit.current = true;
      return;
    }
    if (suppressCartAutoOpen) {
      prevCount.current = current;
      setSuppressCartAutoOpen(false);
      return;
    }
    if (current > prevCount.current) {
      setOpenCart(true);
    }
    prevCount.current = current;
  }, [cartItems, authChecked, suppressCartAutoOpen]);

  const handleMobileSearch = () => {
    if (mobileSearchInput.trim()) {
      setSearchQuery(mobileSearchInput);
      navigate("/products");
      closeMobileMenu();
      setMobileSearchInput("");
    }
  };

  const handleMobileKeyDown = (e) => {
    if (e.key === "Enter") {
      handleMobileSearch();
    }
  };

  const closeMobileMenu = () => {
    setOpen(false);
    setTimeout(() => setMobileMenuView("main"), 300);
  };

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [open]);

  // --- REUSABLE HANDLERS FOR GUEST LINKS ---
  const handleGuestAction = (actionName) => {
    toast.error(`Please login to view ${actionName}`);
    setShowUserLogin(true);
  };

  return (
    <>
      <nav className="sticky top-0 w-full bg-white/80 backdrop-blur-md z-50 transition-all border-b border-gray-100 shadow-sm">
        {/* Adjusted padding (lg:px-8) to prevent wrapping on laptop screens */}
        <div className="relative px-6 md:px-12 lg:px-12 xl:px-24 h-20 flex items-center justify-between">
          
          {/* 1. Left: Logo & Main Nav */}
          <div className="flex items-center gap-8 xl:gap-12">
            <NavLink to={"/"} onClick={closeMobileMenu}>
              <img
                className="h-8 sm:h-10 w-auto object-contain"
                src={assets.logo}
                alt="logo"
              />
            </NavLink>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-6 xl:gap-8">
              <NavLink 
                to="/" 
                className={({ isActive }) => 
                  `text-[17px] font-bold tracking-wide transition-colors ${isActive ? "text-[#008779]" : "text-[#1E2A5E] hover:text-[#008779]"}`
                }
              >
                Home
              </NavLink>

              {/* MEGA MENU: Shop by Category */}
              <div className="group static flex items-center gap-1 cursor-pointer py-6">
                <span className="text-[17px] font-bold text-[#1E2A5E] tracking-wide transition-colors flex items-center gap-1 group-hover:text-[#008779]">
                  Shop by Category{" "}
                  <ChevronDown className="w-4 h-4 text-[#1E2A5E]/70 group-hover:text-[#008779] group-hover:rotate-180 transition-transform duration-200" />
                </span>
                
                {/* Full Width Dropdown Wrapper */}
                <div className="absolute top-full left-0 w-full pt-0 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 ease-in-out z-50">
                  <div className="bg-white border-t border-gray-100 shadow-xl w-full max-h-[80vh] overflow-y-auto">
                    <div className="px-6 md:px-16 lg:px-24 xl:px-32 py-10">
                      
                      {/* --- GRID LAYOUT --- */}
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-12">
                        {groupedCategories.length > 0 ? (
                            groupedCategories.map((group) => (
                                <div key={group.name} className="break-inside-avoid">
                                    <h4
                                        onClick={() => handleGroupClick(group.name)}
                                        className="font-medium text-[#1E2A5E] mb-4 text-sm uppercase tracking-wider cursor-pointer hover:text-[#008779] transition-colors flex items-center gap-2 group/title"
                                    >
                                        {group.name}
                                    </h4>
                                    <ul className="space-y-3">
                                        {group.cats.map((cat) => (
                                            <li key={cat._id}>
                                                <div
                                                    onClick={() => handleCategoryClick(cat.name)}
                                                    className="text-[17px] text-[#1E2A5E] hover:text-[#008779] hover:translate-x-1 cursor-pointer transition-all inline-block"
                                                >
                                                    {cat.name}
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full text-center text-gray-400 py-10">Loading categories...</div>
                        )}
                      </div>

                    </div>
                  </div>
                </div>
              </div>

              <NavLink 
                to="/products" 
                onClick={() => setSearchQuery("")} 
                className={({ isActive }) => 
                  `text-[17px] font-bold tracking-wide transition-colors ${isActive ? "text-[#008779]" : "text-[#1E2A5E] hover:text-[#008779]"}`
                }
              >
                All Products
              </NavLink>

              <NavLink 
                to="/contact" 
                className={({ isActive }) => 
                  `text-[17px] font-bold tracking-wide transition-colors ${isActive ? "text-[#008779]" : "text-[#1E2A5E] hover:text-[#008779]"}`
                }
              >
                Contact
              </NavLink>
            </div>
          </div>

          {/* 2. Right: Search & Actions */}
          <div className="flex items-center gap-3 sm:gap-5">
            <div className="hidden md:flex items-center bg-[#ECF2FE] rounded px-4 py-2 w-56 lg:w-64 transition-all focus-within:ring-1 focus-within:ring-[#1E2A5E]/30">
  <input
    onChange={(e) => {
      setSearchQuery(e.target.value);
      if (e.target.value && location.pathname !== "/products") {
        navigate("/products");
      }
    }}
    className="bg-transparent border-none outline-none text-sm w-full text-[#1E2A5E] placeholder-gray-400"
    type="text"
    placeholder="Search products..."
  />
  <Search className="w-4 h-4 text-[#1E2A5E]" />
</div>

            <div className="flex items-center gap-4 lg:gap-5">
              
              {/* --- UNIFIED USER MENU (LOGGED IN & GUEST) --- */}
              <div className="relative group hidden sm:block py-6"> 
                  <button 
                    onClick={() => !user && setShowUserLogin(true)}
                    className="flex items-center gap-2 transform transition-transform duration-300 hover:-translate-y-1.5"
                  >
                    <User className="w-6 h-6 stroke-[1.5] text-[#1E2A5E] group-hover:text-[#008779] transition-colors" />
                  </button>

                  <div className="absolute right-0 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 z-50 w-72">
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-5 overflow-hidden">
                      
                      {user ? (
                        /* --- LOGGED IN STATE --- */
                        <>
                          <div className="mb-4">
                            <h3 className="text-lg font-medium text-[#1E2A5E] mb-1">Account</h3>
                            <p className="text-sm text-gray-500 break-words">{user.email}</p>
                          </div>
                          
                          <button 
                              onClick={logout} 
                              className="w-full py-2.5 mb-4 bg-red-50 text-red-600 rounded-lg font-medium text-sm hover:bg-red-100 transition-colors shadow-sm flex items-center justify-center gap-2"
                          >
                             <LogOut className="w-4 h-4" /> Sign Out
                          </button>

                          <div className="flex gap-3 border-t border-gray-100 pt-4">
                            <button onClick={() => navigate("/my-orders")} className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg border border-gray-200 text-sm font-medium text-[#1E2A5E] hover:bg-gray-50 hover:border-gray-300 hover:text-[#008779] transition-all">
                              <FileText className="w-4 h-4" /> Orders
                            </button>
                            <button onClick={() => navigate("/profile")} className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg border border-gray-200 text-sm font-medium text-[#1E2A5E] hover:bg-gray-50 hover:border-gray-300 hover:text-[#008779] transition-all">
                              <User className="w-4 h-4" /> Profile
                            </button>
                          </div>
                        </>
                      ) : (
                        /* --- GUEST STATE --- */
                        <>
                          <div className="mb-4">
                            <h3 className="text-lg font-medium text-[#1E2A5E] mb-1">Welcome</h3>
                            <p className="text-sm text-gray-500">To access account and manage orders</p>
                          </div>
                          
                          <button 
                             onClick={() => setShowUserLogin(true)}
                             className="w-full py-2.5 mb-4 bg-[#1E2A5E] text-white rounded-lg font-medium text-sm hover:bg-[#008779] transition-colors shadow-sm"
                          >
                             Login / Register
                          </button>

                          <div className="flex gap-3 border-t border-gray-100 pt-4">
                             <button onClick={() => handleGuestAction("Orders")} className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-[#008779] transition-all">
                                <FileText className="w-4 h-4" /> Orders
                             </button>
                             <button onClick={() => handleGuestAction("Profile")} className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-[#008779] transition-all">
                                <User className="w-4 h-4" /> Profile
                             </button>
                          </div>
                        </>
                      )}

                    </div>
                  </div>
              </div>

              {/* Wishlist Icon */}
              <div className="group relative hidden sm:block">
                <button 
                  onClick={() => navigate("/wishlist")} 
                  className="text-[#1E2A5E] hover:text-[#008779] transition transform duration-300 hover:-translate-y-1.5"
                >
                  <Heart className="w-6 h-6 stroke-[1.5]" />
                  {wishlist && wishlist.length > 0 && (
                    <span className="absolute -top-1 -right-1 flex items-center justify-center bg-[#008779] text-white text-[10px] font-bold w-4 h-4 rounded-full">{wishlist.length}</span>
                  )}
                </button>
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 bg-[#1E2A5E] text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-1 group-hover:translate-y-0 whitespace-nowrap pointer-events-none z-10">
                  Wishlist
                </div>
              </div>

              {/* Cart Icon */}
              <div 
                className="group relative cursor-pointer"
                onClick={() => setOpenCart(true)} 
              >
                <div className="text-[#1E2A5E] hover:text-[#008779] transition transform duration-300 hover:-translate-y-1.5">
                  <ShoppingBag className="w-6 h-6 stroke-[1.5]" />
                  <span className="absolute -top-1 -right-1.5 flex items-center justify-center bg-[#008779] text-white text-[10px] font-bold w-4 h-4 rounded-full">{getCartCount()}</span>
                </div>
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 bg-[#1E2A5E] text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-1 group-hover:translate-y-0 whitespace-nowrap pointer-events-none z-10">
                  Cart
                </div>
              </div>

              <button onClick={() => setOpen(!open)} className="lg:hidden text-[#1E2A5E] z-50">
                {open ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* --- Full Screen Mobile Menu --- */}
      <div className={`lg:hidden fixed inset-0 bg-white z-[60] transform transition-transform duration-300 ease-in-out ${open ? "translate-x-0" : "translate-x-full"}`}>
        <div className="flex flex-col h-full">
            
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <img src={assets.logo} alt="Logo" className="h-8 object-contain" />
                <button onClick={closeMobileMenu} className="p-2 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors">
                    <X className="w-6 h-6 text-gray-600" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
                
                {/* --- VIEW 1: MAIN MENU --- */}
                {mobileMenuView === "main" && (
                  <div className="space-y-6 animate-fade-in">
                      {/* Search */}
                      <div className="relative">
                          <input
                              value={mobileSearchInput}
                              onChange={(e) => setMobileSearchInput(e.target.value)}
                              onKeyDown={handleMobileKeyDown}
                              className="w-full bg-gray-50 border border-transparent focus:bg-white focus:border-gray-300 rounded-xl px-4 py-4 text-lg text-[#1E2A5E] outline-none transition-all placeholder-gray-400"
                              type="text"
                              placeholder="Search..."
                          />
                          <button onClick={handleMobileSearch} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-white rounded-lg shadow-sm text-[#1E2A5E] border border-gray-100 active:scale-95 transition-all">
                              <Search className="w-5 h-5" />
                          </button>
                      </div>

                      {/* Main Links */}
                      <div className="space-y-2">
                          <NavLink to="/" onClick={closeMobileMenu} className={({isActive}) => `flex items-center justify-between p-4 rounded-xl transition-colors ${isActive ? 'bg-[#008779]/10 text-[#008779] font-medium' : 'text-[#1E2A5E] font-medium hover:bg-gray-50'}`}>
                              <span className="text-lg">Home</span>
                          </NavLink>

                          <NavLink to="/products" onClick={() => { setSearchQuery(""); closeMobileMenu(); }} className={({isActive}) => `flex items-center justify-between p-4 rounded-xl transition-colors ${isActive ? 'bg-[#008779]/10 text-[#008779] font-medium' : 'text-[#1E2A5E] font-medium hover:bg-gray-50'}`}>
                              <span className="text-lg">All Products</span>
                          </NavLink>

                          <NavLink to="/wishlist" onClick={closeMobileMenu} className={({isActive}) => `flex items-center justify-between p-4 rounded-xl transition-colors ${isActive ? 'bg-[#008779]/10 text-[#008779] font-medium' : 'text-[#1E2A5E] font-medium hover:bg-gray-50'}`}>
                              <span className="text-lg">Wishlist</span>
                              {wishlist.length > 0 && <span className="text-sm bg-[#008779] text-white px-2.5 py-0.5 rounded-full font-bold">{wishlist.length}</span>}
                          </NavLink>

                          {/* Shop by Category Trigger */}
                          <button 
                            onClick={() => setMobileMenuView("categories")}
                            className="w-full flex items-center justify-between p-4 rounded-xl text-[#1E2A5E] font-medium hover:bg-gray-50 transition-colors"
                          >
                              <span className="text-lg">Shop by Category</span>
                              <ChevronRight className="w-5 h-5 text-gray-400" />
                          </button>
                      </div>

                      {/* Mobile Footer */}
                      <div className="pt-6 border-t border-gray-100">
                          {user ? (
                              <div className="space-y-5">
                                  <div className="flex items-center gap-4">
                                      <div className="w-12 h-12 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-[#1E2A5E]">
                                          <User className="w-6 h-6" />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                          <p className="text-base font-medium text-[#1E2A5E] truncate">Account</p>
                                          <p className="text-sm text-gray-500 truncate">{user.email}</p>
                                      </div>
                                  </div>
                                  <div className="grid grid-cols-2 gap-4">
                                      <button onClick={() => { navigate("/my-orders"); closeMobileMenu(); }} className="py-3 text-sm font-medium text-[#1E2A5E] bg-white border border-gray-200 rounded-xl shadow-sm hover:text-[#008779] hover:border-[#008779]">My Orders</button>
                                      <button onClick={() => { navigate("/profile"); closeMobileMenu(); }} className="py-3 text-sm font-medium text-[#1E2A5E] bg-white border border-gray-200 rounded-xl shadow-sm hover:text-[#008779] hover:border-[#008779]">Profile</button>
                                  </div>
                                  <button onClick={logout} className="w-full py-3.5 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors">
                                      Sign Out
                                  </button>
                              </div>
                          ) : (
                              <button
                                  onClick={() => { setShowUserLogin(true); closeMobileMenu(); }}
                                  className="w-full bg-[#1E2A5E] text-white py-4 rounded-xl font-medium text-lg shadow-lg shadow-[#1E2A5E]/20 active:scale-[0.98] transition-transform hover:bg-[#008779]"
                              >
                                  Login / Register
                              </button>
                          )}
                      </div>
                  </div>
                )}

                {/* --- VIEW 2: CATEGORIES SUBMENU (GROUPED) --- */}
                {mobileMenuView === "categories" && (
                  <div className="animate-fade-in-right pb-20">
                      <button 
                        onClick={() => setMobileMenuView("main")}
                        className="flex items-center gap-2 text-gray-500 font-medium mb-6 hover:text-[#1E2A5E] transition-colors"
                      >
                          <ChevronLeft className="w-5 h-5" />
                          Back to Menu
                      </button>

                      <h2 className="text-2xl font-medium text-[#1E2A5E] mb-6 px-1">Shop by Category</h2>

                      <div className="space-y-6">
                          {groupedCategories.length > 0 ? (
                              groupedCategories.map((group) => (
                                  <div key={group.name} className="mb-4">
                                      {/* Group Header */}
                                      <div 
                                        onClick={() => handleGroupClick(group.name)}
                                        className="font-medium text-[#1E2A5E] text-sm uppercase tracking-wider bg-gray-50 p-3 rounded-lg mb-2 flex justify-between items-center cursor-pointer active:bg-gray-100"
                                      >
                                          {group.name}
                                      </div>
                                      
                                      {/* Category List */}
                                      <div className="space-y-1 pl-2">
                                          {group.cats.map((cat) => (
                                              <div
                                                  key={cat._id}
                                                  onClick={() => handleCategoryClick(cat.name)}
                                                  className="flex items-center justify-between p-2.5 text-gray-600 hover:text-[#008779] hover:bg-gray-50/50 rounded-lg cursor-pointer transition-colors"
                                              >
                                                  {cat.name}
                                                  <ChevronRight className="w-4 h-4 opacity-20" />
                                              </div>
                                          ))}
                                      </div>
                                  </div>
                              ))
                          ) : (
                              <div className="p-4 text-gray-400 text-center">Loading...</div>
                          )}
                      </div>
                  </div>
                )}

            </div>
        </div>
      </div>

      <CartDrawer open={openCart} onClose={() => setOpenCart(false)} />
    </>
  );
};

export default Navbar;