import React, { useEffect } from "react";
import { NavLink, Outlet, useLocation, Navigate } from "react-router-dom";
import { assets } from "../../assets/assets";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";
import { LogOut, LayoutDashboard, ShoppingCart, Box, Layers, Users, Ticket, Truck, FileText, BarChart3, Settings } from "lucide-react";

const AdminLayout = () => {
  const { user, axios, navigate, setUser, setCartItems, authChecked } = useAppContext();
  const location = useLocation();

  const sidebarLinks = [
    { name: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Orders", path: "/admin/orders", icon: ShoppingCart },
    { name: "Products", path: "/admin/products", icon: Box },
    { name: "Categories", path: "/admin/categories", icon: Layers },
    { name: "Customers", path: "/admin/users", icon: Users },
    { name: "Coupons", path: "/admin/coupons", icon: Ticket },
    { name: "Shipping", path: "/admin/shipping", icon: Truck },
    { name: "Invoices", path: "/admin/invoices", icon: FileText },
    { name: "Reports", path: "/admin/reports", icon: BarChart3 },
    { name: "Settings", path: "/admin/settings", icon: Settings },
  ];

  // ✅  Auth Guard for EC2
  useEffect(() => {
    if (authChecked) {
      if (!user || user.role !== "admin") {
        navigate("/", { replace: true });
        // Prevent toast spam during loading
        if (user) toast.error("Unauthorized Access Restricted");
      }
    }
  }, [user, navigate, authChecked]);

  // Show nothing while checking auth to prevent layout flickering or dashboard leaking
  if (!authChecked) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
      </div>
    );
  }

  if (!user || user.role !== "admin") return null;

  const logout = async () => {
    try {
      const { data } = await axios.get("/api/user/logout");
      if (data.success) {
        setUser(null);
        setCartItems({});
        toast.success("Logged out");
        navigate("/", { replace: true });
      }
    } catch (error) { toast.error("Logout failed"); }
  };

  if (location.pathname === "/admin") return <Navigate to="/admin/dashboard" replace />;

  return (
    <div className="flex h-screen bg-slate-50/50 overflow-hidden font-sans">
      {/* SIDEBAR */}
      <aside className="w-20 lg:w-72 bg-white border-r border-slate-200 flex flex-col transition-all z-40 shrink-0 shadow-sm">
        <div className="h-20 flex items-center justify-center lg:justify-start lg:px-8 border-b border-slate-100">
          <img src={assets.logo1} className="lg:hidden h-8 w-auto" alt="Logo" />
          <img src={assets.logo} className="hidden lg:block h-7 w-auto" alt="Logo" />
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1.5 custom-scrollbar">
          {sidebarLinks.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center justify-center lg:justify-start gap-3 px-3 py-3 rounded-2xl transition-all duration-200 
                 ${isActive ? "bg-slate-900 text-white shadow-xl shadow-slate-200" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"}`
              }
            >
              <item.icon size={20} className="shrink-0" />
              <span className="hidden lg:block font-bold text-sm tracking-tight">{item.name}</span>
            </NavLink>
          ))}
        </nav>

        {/* PROFILE/LOGOUT */}
        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0 font-black text-slate-900 shadow-sm text-xs">
               {user.name?.charAt(0).toUpperCase()}
            </div>
            <div className="hidden lg:block flex-1 min-w-0">
              <p className="text-xs font-black text-slate-900 truncate uppercase tracking-tighter">{user.name}</p>
              <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">Admin</p>
            </div>
            <button onClick={logout} className="p-2 text-slate-400 hover:text-red-500 hover:bg-white rounded-xl transition-all">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="p-6 md:p-10 mx-auto bg-gray-100">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;