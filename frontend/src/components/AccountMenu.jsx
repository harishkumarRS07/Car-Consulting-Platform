import { User, LayoutDashboard, LogOut } from "lucide-react";

export default function AccountMenu({ user, onLogout, onNavigate }) {
  // Get initials from user email
  const getInitials = () => {
    if (user?.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    return "HA";
  };

  const displayName = user?.name || user?.email?.split("@")[0] || "User";

  const handleLogout = () => {
    onLogout?.();
  };

  const handleNavigate = (path) => {
    onNavigate?.(path);
  };

  return (
    <div className="relative group">
      {/* Avatar Button - Trigger */}
      <div className="flex items-center gap-2 cursor-pointer rounded-full p-1.5 hover:bg-purple-500/30 transition-colors duration-200">
        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white flex items-center justify-center font-semibold text-sm shadow-md border border-white/30">
          {getInitials()}
        </div>
        <span className="text-white hidden md:block text-sm font-medium">
          Account
        </span>
      </div>

      {/* Dropdown - Hidden by default, shown on hover */}
      <div className="absolute right-0 mt-2 pt-2 w-64 bg-purple-600 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.15)] border border-purple-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 overflow-hidden">

        {/* Arrow */}
        <div className="absolute -top-2 right-5 w-4 h-4 bg-purple-600 rotate-45" />

        {/* Profile Section */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-purple-500">
          <div className="w-12 h-12 rounded-full bg-white text-purple-600 flex items-center justify-center font-bold text-sm shadow-lg flex-shrink-0">
            {getInitials()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-white truncate">
              {displayName}
            </p>
            <p className="text-xs text-purple-200 truncate">
              {user?.email}
            </p>
          </div>
        </div>

        {/* Menu Items */}
        <div className="py-2">
          <button
            onClick={() => handleNavigate("/profile")}
            className="flex items-center w-full px-4 py-3 hover:bg-purple-500 transition-all duration-150 text-left group/item"
          >
            <User size={18} className="text-purple-200 flex-shrink-0 group-hover/item:text-white transition-colors" />
            <span className="text-sm text-purple-100 group-hover/item:text-white font-medium transition-colors">My Profile</span>
          </button>

          {user?.role === 'admin' && (
            <>
              <button
                onClick={() => handleNavigate("/admin")}
                className="flex items-center w-full px-4 py-3 hover:bg-purple-500 transition-all duration-150 text-left group/item"
              >
                <LayoutDashboard size={18} className="text-purple-200 flex-shrink-0 group-hover/item:text-white transition-colors" />
                <span className="text-sm text-purple-100 group-hover/item:text-white font-medium transition-colors">Dashboard</span>
              </button>
            </>
          )}

          <div className="border-t border-purple-500 my-2" />

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 hover:bg-red-600 transition-all duration-150 text-left group/item"
          >
            <LogOut size={18} className="text-red-200 flex-shrink-0 group-hover/item:text-red-100 transition-colors" />
            <span className="text-sm text-red-200 font-medium group-hover/item:text-red-100 transition-colors">Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
}
