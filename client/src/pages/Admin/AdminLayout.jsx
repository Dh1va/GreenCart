import { NavLink, Outlet } from "react-router-dom";
import { assets } from "../../assets/assets";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";

const AdminLayout = () => {
  const { user, axios, navigate, setUser, setCartItems } = useAppContext();

  if (!user || user.role !== "admin") {
    navigate("/");
    return null;
  }

  const logout = async () => {
    const { data } = await axios.get("/api/user/logout");
    if (data.success) {
      setUser(null);
      setCartItems({});
      toast.success("Logged out");
      navigate("/");
    }
  };

  const sidebarLinks = [
    { name: "Add Product", path: "/admin", icon: assets.add_icon },
    { name: "Products", path: "/admin/products", icon: assets.product_list_icon },
    { name: "Orders", path: "/admin/orders", icon: assets.order_icon },
    { name: "Users", path: "/admin/users", icon: assets.user_icon },
  ];

  return (
    <>
      {/* HEADER — EXACT STYLE */}
      <div className="flex items-center justify-between px-6 md:px-16 border-b border-gray-300 py-3 bg-white">
        <img src={assets.logo} className="h-9" />
        <div className="flex items-center gap-5 text-gray-500">
          <p>Hi! Admin</p>
          <button
            onClick={logout}
            className="border rounded-full text-sm px-4 py-1"
          >
            Logout
          </button>
        </div>
      </div>

      {/* BODY */}
      <div className="flex px-6 md:px-16">
        {/* SIDEBAR — EXACT MATCH */}
        <div className="md:w-64 w-16 border-r border-gray-300 pt-4 flex flex-col transition-all duration-300">
          {sidebarLinks.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.path === "/admin"}
              className={({ isActive }) =>
                `flex items-center py-3 px-4 gap-3
                 ${
                   isActive
                     ? "border-r-4 md:border-r-[6px] bg-[#4FBF8B]/10 border-[#4FBF8B] text-[#4FBF8B]"
                     : "hover:bg-gray-100/90 border-white text-gray-700"
                 }`
              }
            >
              <img src={item.icon} className="w-6 h-6" />
              <p className="md:block hidden">{item.name}</p>
            </NavLink>
          ))}
        </div>

        {/* CONTENT */}
        <main className="flex-1 p-6 min-h-[90vh]">
          <Outlet />
        </main>
      </div>
    </>
  );
};

export default AdminLayout;
