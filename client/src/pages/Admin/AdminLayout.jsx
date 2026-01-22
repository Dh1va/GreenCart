import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import { assets } from "../../assets/assets";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";
import { LogOut } from "lucide-react";

// --- CUSTOM SVG ICONS (Unchanged) ---
const DashboardIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 001.061 1.06l8.69-8.69z" />
    <path d="M12 5.432l8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75V21a.75.75 0 01-.75.75H5.625a1.875 1.875 0 01-1.875-1.875v-6.198a2.29 2.29 0 00.091-.086L12 5.43z" />
  </svg>
);
const OrdersIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path fillRule="evenodd" d="M7.5 6v.75H5.513c-.96 0-1.764.724-1.865 1.679l-1.263 12A1.875 1.875 0 004.25 22.5h15.5a1.875 1.875 0 001.865-2.071l-1.263-12a1.875 1.875 0 00-1.865-1.679H16.5V6a4.5 4.5 0 10-9 0zM12 3a3 3 0 00-3 3v.75h6V6a3 3 0 00-3-3zm-3 8.25a3 3 0 106 0v-.75a.75.75 0 011.5 0v.75a4.5 4.5 0 11-9 0v-.75a.75.75 0 011.5 0v.75z" clipRule="evenodd" />
  </svg>
);
const ProductsIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path fillRule="evenodd" d="M3 6a3 3 0 013-3h2.25a3 3 0 013 3v2.25a3 3 0 01-3 3H6a3 3 0 01-3-3V6zm9.75 0a3 3 0 013-3H18a3 3 0 013 3v2.25a3 3 0 01-3 3h-2.25a3 3 0 01-3-3V6zM3 15.75a3 3 0 013-3h2.25a3 3 0 013 3V18a3 3 0 01-3 3H6a3 3 0 01-3-3v-2.25zm9.75 0a3 3 0 013-3H18a3 3 0 013 3V18a3 3 0 01-3 3h-2.25a3 3 0 01-3-3v-2.25z" clipRule="evenodd" />
  </svg>
);
const CategoriesIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path fillRule="evenodd" d="M3 6a3 3 0 013-3h12a3 3 0 013 3v12a3 3 0 01-3 3H6a3 3 0 01-3-3V6zm3 1.5v1.5h1.5V7.5H6zm3 0v1.5h1.5V7.5H9zm3 0v1.5h1.5V7.5H12zm3 0v1.5h1.5V7.5H15zm-9 3v1.5h1.5V10.5H6zm3 0v1.5h1.5V10.5H9zm3 0v1.5h1.5V10.5H12zm3 0v1.5h1.5V10.5H15zm-9 3v1.5h1.5V13.5H6zm3 0v1.5h1.5V13.5H9zm3 0v1.5h1.5V13.5H12zm3 0v1.5h1.5V13.5H15z" clipRule="evenodd" />
  </svg>
);
const UsersIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
  </svg>
);
const CouponsIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path fillRule="evenodd" d="M5.25 2.25a3 3 0 00-3 3v4.318a3 3 0 00.879 2.121l9.58 9.581c.92.92 2.39 1.186 3.037.425l6.202-6.202c.766-.646.49-2.112-.425-3.036l-9.58-9.581a3 3 0 00-2.122-.879H5.25zM6.375 7.5a1.125 1.125 0 100-2.25 1.125 1.125 0 000 2.25z" clipRule="evenodd" />
  </svg>
);
const ShippingIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M3.375 4.5C2.339 4.5 1.5 5.34 1.5 6.375V13.5h12V6.375c0-1.036-.84-1.875-1.875-1.875h-8.25zM13.5 15h-12v2.625c0 1.035.84 1.875 1.875 1.875h.375a3 3 0 116 0h3a.75.75 0 00.75-.75V15z" />
    <path d="M8.25 19.5a1.5 1.5 0 10-3 0 1.5 1.5 0 003 0zM15.75 6.75a.75.75 0 00-.75.75v11.25c0 .087.015.17.042.248a3 3 0 015.958.464c.853-.171 1.522-.93 1.522-1.838V9.75c0-.414-.168-.811-.465-1.104l-3.375-3.375A1.565 1.565 0 0017.625 4.5H16.5a.75.75 0 00-.75.75v1.5z" />
    <path d="M19.5 19.5a1.5 1.5 0 10-3 0 1.5 1.5 0 003 0z" />
    <path d="M15.75 9H18a.75.75 0 01.75.75v2.25a.75.75 0 01-.75.75h-2.25a.75.75 0 01-.75-.75V9.75a.75.75 0 01.75-.75z" />
  </svg>
);
const InvoiceIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path fillRule="evenodd" d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75H15.75a2.25 2.25 0 0 1-2.25-2.25V1.5H5.625ZM9.75 15a.75.75 0 0 1 .75-.75h6a.75.75 0 0 1 0 1.5h-6a.75.75 0 0 1-.75-.75ZM7.5 15a.75.75 0 0 1 .75-.75h.008a.75.75 0 0 1 .75.75v.008a.75.75 0 0 1-.75.75H8.25a.75.75 0 0 1-.75-.75V15Zm0 3a.75.75 0 0 1 .75-.75h.008a.75.75 0 0 1 .75.75v.008a.75.75 0 0 1-.75.75H8.25a.75.75 0 0 1-.75-.75V18Z" clipRule="evenodd" />
    <path d="M16.5 12h3.375c.496 0 .963.109 1.39.306l-4.765-4.765a3.73 3.73 0 0 1 .306 1.39V12Z" />
  </svg>
);
const ReportIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path fillRule="evenodd" d="M2.25 13.5a8.25 8.25 0 018.25-8.25.75.75 0 01.75.75v6.75H18a.75.75 0 01.75.75 8.25 8.25 0 01-16.5 0z" clipRule="evenodd" />
    <path fillRule="evenodd" d="M12.75 3a.75.75 0 01.75-.75 8.25 8.25 0 018.25 8.25.75.75 0 01-.75.75h-7.5a.75.75 0 01-.75-.75V3z" clipRule="evenodd" />
  </svg>
);
const SettingsIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path fillRule="evenodd" d="M11.078 2.25c-.917 0-1.699.663-1.85 1.567L9.05 4.889c-.02.12-.115.26-.297.348a7.493 7.493 0 00-.986.57c-.166.115-.334.126-.45.083L6.3 5.508a1.875 1.875 0 00-2.282.819l-.922 1.597a1.875 1.875 0 00.432 2.385l.84.692c.095.078.17.229.154.43a7.598 7.598 0 000 1.139c.015.2-.059.352-.153.43l-.841.692a1.875 1.875 0 00-.432 2.385l.922 1.597a1.875 1.875 0 002.282.819l1.019-.382c.115-.043.283-.031.45.082.312.214.641.405.985.57.182.088.277.228.297.35l.178 1.071c.151.904.933 1.567 1.85 1.567h1.844c.916 0 1.699-.663 1.85-1.567l.178-1.072c.02-.12.114-.26.297-.349.344-.165.673-.356.985-.57.167-.114.335-.125.45-.082l1.02.382a1.875 1.875 0 002.28-.819l.923-1.597a1.875 1.875 0 00-.432-2.385l-.84-.692c-.095-.078-.17-.229-.154-.43a7.614 7.614 0 000-1.139c-.016-.2.059-.352.153-.43l.84-.692c.708-.582.891-1.59.433-2.385l-.922-1.597a1.875 1.875 0 00-2.282-.818l-1.02.382c-.114.043-.282.031-.449-.083a7.49 7.49 0 00-.985-.57c-.183-.087-.277-.227-.297-.348l-.179-1.072a1.875 1.875 0 00-1.85-1.567h-1.843zM12 15.75a3.75 3.75 0 100-7.5 3.75 3.75 0 000 7.5z" clipRule="evenodd" />
  </svg>
);


const AdminLayout = () => {
  const { user, axios, navigate, setUser, setCartItems } = useAppContext();

  const sidebarLinks = [
    { name: "Dashboard", path: "/admin/dashboard", icon: DashboardIcon },
    { name: "Orders", path: "/admin/orders", icon: OrdersIcon },
    { name: "Products", path: "/admin/products", icon: ProductsIcon },
    { name: "Categories", path: "/admin/categories", icon: CategoriesIcon },
    { name: "Customers", path: "/admin/users", icon: UsersIcon },
    { name: "Coupons", path: "/admin/coupons", icon: CouponsIcon },
    { name: "Shipping", path: "/admin/shipping", icon: ShippingIcon },
    { name: "Invoices", path: "/admin/invoices", icon: InvoiceIcon },
    { name: "Reports", path: "/admin/reports", icon: ReportIcon },
    { name: "Settings", path: "/admin/settings", icon: SettingsIcon },
  ];

  if (!user || user.role !== "admin") {
    navigate("/");
    return null;
  }

  const logout = async () => {
    try {
      const { data } = await axios.get("/api/user/logout");
      if (data.success) {
        setUser(null);
        setCartItems({});
        toast.success("Logged out");
        window.location.href = "/";
      }
    } catch (error) {
      toast.error("Logout failed");
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      
      {/* PROFESSIONAL RESPONSIVE SIDEBAR */}
      {/* Mobile: w-20 (Icon Only). Desktop: w-72 (Full) */}
      <aside className="w-20 lg:w-72 bg-white border-r border-gray-200 flex flex-col transition-all duration-300 z-40 flex-shrink-0">
        
        {/* 1. Header (Logo) */}
        <div className="h-20 flex items-center justify-center lg:justify-start lg:px-6 border-b border-gray-100 flex-shrink-0">
          <img src={assets.logo} className="h-8 w-auto object-contain" alt="Logo" />
        </div>

        {/* 2. Navigation */}
        <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-3">
          {sidebarLinks.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.path === "/admin"}
              className={({ isActive }) =>
                `group flex items-center justify-center lg:justify-start gap-3 px-0 lg:px-3 py-2.5 rounded-lg transition-all duration-200 
                 ${isActive 
                    ? "bg-gray-900 text-white shadow-md shadow-gray-900/10" 
                    : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                 }`
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon 
                    className={`w-5 h-5 flex-shrink-0 transition-colors ${
                      isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'
                    }`} 
                  />
                  {/* Hide text on mobile, show on desktop */}
                  <span className="hidden lg:block font-medium text-md">
                    {item.name}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* 3. Footer (Profile) */}
        <div className="p-4 border-t border-gray-200 bg-white">
          <div className="flex flex-col lg:flex-row items-center gap-3 p-2 lg:p-3 rounded-xl bg-transparent lg:bg-gray-50 lg:border border-gray-200 lg:hover:border-gray-300 transition-colors">
            
            {/* Avatar (Always Visible) */}
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 overflow-hidden text-gray-600 font-bold text-sm">
               {user.name ? user.name.charAt(0).toUpperCase() : "A"}
            </div>

            {/* Text Details (Hidden on Mobile) */}
            <div className="hidden lg:flex flex-col flex-1 overflow-hidden">
              <span className="text-sm font-bold text-gray-900 truncate">
                {user.name || "Admin"}
              </span>
              <span className="text-xs text-gray-500 font-medium truncate">
                Super Admin
              </span>
            </div>

            {/* Logout Button (Visible on Desktop, stacked on mobile) */}
            <button 
              onClick={logout}
              className="lg:p-2 text-gray-400 hover:text-red-600 lg:hover:bg-red-50 rounded-lg transition-colors mt-2 lg:mt-0"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100/50">
        <div className="p-4 md:p-6 lg:p-10  mx-auto">
          <Outlet />
        </div>
      </main>

    </div>
  );
};

export default AdminLayout;