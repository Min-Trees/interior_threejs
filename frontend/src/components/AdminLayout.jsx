import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, FolderTree, ShoppingCart, Calendar, ArrowLeft, LogOut, Armchair } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const navItems = [
    { label: 'Tổng Quan (Dashboard)', path: '/admin', icon: LayoutDashboard },
    { label: 'Quản Lý Sản Phẩm', path: '/admin/products', icon: Package },
    { label: 'Quản Lý Danh Mục', path: '/admin/categories', icon: FolderTree },
    { label: 'Quản Lý Đơn Hàng', path: '/admin/orders', icon: ShoppingCart },
    { label: 'Lịch Hẹn Showroom', path: '/admin/appointments', icon: Calendar },
  ];

  return (
    <div className="min-h-screen bg-stone-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-stone-900 text-stone-300 flex flex-col justify-between p-5 fixed h-full z-30">
        <div>
          {/* Brand */}
          <div className="flex items-center gap-3 mb-8 pb-4 border-b border-stone-800">
            <div className="w-10 h-10 rounded-xl bg-brand-500 text-white flex items-center justify-center">
              <Armchair className="w-6 h-6" />
            </div>
            <div>
              <span className="font-bold text-white tracking-wider block font-serif">PHÚ QUÝ</span>
              <span className="text-[10px] text-amber-400 uppercase font-semibold">Admin Portal</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                    isActive
                      ? 'bg-brand-600 text-white shadow-md'
                      : 'hover:bg-stone-800 hover:text-white text-stone-400'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom actions */}
        <div className="pt-4 border-t border-stone-800 space-y-2">
          <Link
            to="/"
            className="flex items-center gap-2.5 px-3 py-2 text-xs text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition"
          >
            <ArrowLeft className="w-4 h-4" /> Về trang cửa hàng
          </Link>
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-red-400 hover:text-red-300 rounded-lg hover:bg-stone-800 transition"
          >
            <LogOut className="w-4 h-4" /> Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 ml-64 p-8 min-h-screen overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
