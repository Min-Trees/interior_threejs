import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Search, User as UserIcon, LogOut, Shield, Menu, X, Armchair, Heart, Scale } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useCompare } from '../context/CompareContext';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const { cart } = useCart();
  const { wishlistCount } = useWishlist();
  const { compareCount } = useCompare();
  const [keyword, setKeyword] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdown, setUserDropdown] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (keyword.trim()) {
      navigate(`/products?keyword=${encodeURIComponent(keyword.trim())}`);
      setKeyword('');
      setMobileMenuOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-stone-200 transition-all shadow-sm">
      {/* Top Banner - single line with truncate on mobile */}
      <div className="bg-brand-900 text-brand-100 text-[11px] sm:text-xs py-1.5 px-3 text-center font-medium tracking-wide overflow-hidden">
        <p className="truncate max-w-full">
          🌟 Miễn phí giao hàng & lắp đặt tận nơi cho đơn hàng từ 10.000.000đ | Bảo hành chính hãng 3 năm
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 flex-nowrap gap-2 sm:gap-4">
          {/* Logo - flex-shrink-0 to prevent compression */}
          <Link to="/" className="flex items-center gap-2 sm:gap-3 group flex-shrink-0">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-brand-500 text-white flex items-center justify-center shadow-md group-hover:bg-brand-600 transition flex-shrink-0">
              <Armchair className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl sm:text-2xl font-bold tracking-wider text-brand-950 block font-serif whitespace-nowrap leading-none sm:leading-tight">
                PHÚ QUÝ
              </span>
              <span className="text-[9px] sm:text-[10px] tracking-widest text-brand-600 uppercase font-semibold block whitespace-nowrap mt-0.5">
                Luxury Furniture
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links - visible at lg and xl with whitespace-nowrap and sensible gaps */}
          <nav className="hidden lg:flex items-center gap-4 xl:gap-6 text-xs xl:text-sm font-semibold text-stone-700 flex-shrink-0">
            <Link to="/" className="hover:text-brand-600 transition whitespace-nowrap py-1">Trang Chủ</Link>
            <Link to="/products" className="hover:text-brand-600 transition whitespace-nowrap py-1">Sản Phẩm</Link>
            <Link to="/phong-3d" className="hover:text-amber-700 text-amber-900 bg-amber-50 px-2.5 py-1 rounded-full font-bold transition whitespace-nowrap flex items-center gap-1 border border-amber-200 shadow-xs">
              <span>🏛️ Phòng 3D AI</span>
              <span className="bg-amber-500 text-amber-950 text-[9px] px-1 py-0.2 rounded font-black">HOT</span>
            </Link>
            <Link to="/products?categoryId=1" className="hover:text-brand-600 transition whitespace-nowrap py-1">Sofa & Ghế</Link>
            <Link to="/products?categoryId=2" className="hover:text-brand-600 transition whitespace-nowrap py-1">Bàn Ăn</Link>
            <Link to="/products?categoryId=3" className="hover:text-brand-600 transition whitespace-nowrap py-1">Giường Ngủ</Link>
          </nav>

          {/* Search bar - shown at xl to preserve space on lg and mobile */}
          <form onSubmit={handleSearch} className="hidden xl:flex items-center relative w-44 2xl:w-60 flex-shrink-0">
            <input
              type="text"
              placeholder="Tìm sofa, bàn ăn..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-stone-100 border border-stone-200 rounded-full focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition"
            />
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 pointer-events-none" />
          </form>

          {/* Actions - strictly flex-shrink-0 and flex-nowrap */}
          <div className="flex items-center gap-1 sm:gap-2.5 md:gap-3 flex-shrink-0 flex-nowrap">
            {/* Compare Button */}
            <Link
              to="/so-sanh"
              className="relative p-1.5 sm:p-2 text-stone-700 hover:text-amber-600 hover:bg-amber-50 rounded-full transition flex-shrink-0"
              title="So sánh sản phẩm"
            >
              <Scale className="w-5 h-5" />
              {compareCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-amber-500 text-amber-950 text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow">
                  {compareCount}
                </span>
              )}
            </Link>

            {/* Wishlist Button */}
            <Link
              to="/yeu-thich"
              className="relative p-1.5 sm:p-2 text-stone-700 hover:text-red-500 hover:bg-red-50 rounded-full transition flex-shrink-0"
              title="Danh sách yêu thích"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart Button */}
            <Link
              to="/cart"
              className="relative p-1.5 sm:p-2 text-stone-700 hover:text-brand-600 hover:bg-brand-50 rounded-full transition flex-shrink-0"
              title="Giỏ hàng"
            >
              <ShoppingBag className="w-5 h-5" />
              {cart.totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-brand-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow">
                  {cart.totalItems}
                </span>
              )}
            </Link>

            {/* User Menu / Auth buttons */}
            {user ? (
              <div className="relative flex-shrink-0">
                <button
                  onClick={() => setUserDropdown(!userDropdown)}
                  className="flex items-center gap-1.5 text-sm font-medium text-stone-800 p-1 rounded-full hover:bg-stone-100 transition"
                >
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.fullName} className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border border-brand-300 flex-shrink-0" />
                  ) : (
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-brand-200 text-brand-800 font-bold flex items-center justify-center text-xs flex-shrink-0">
                      {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                    </div>
                  )}
                  <span className="hidden md:inline font-semibold text-xs max-w-[90px] xl:max-w-[120px] truncate whitespace-nowrap">
                    {user.fullName}
                  </span>
                </button>

                {userDropdown && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-stone-100 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="px-4 py-2 border-b border-stone-100">
                      <p className="text-xs font-semibold text-stone-900 truncate">{user.fullName}</p>
                      <p className="text-[11px] text-stone-500 truncate">{user.email}</p>
                    </div>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setUserDropdown(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-brand-700 hover:bg-brand-50 transition"
                      >
                        <Shield className="w-4 h-4" /> Quản Trị Hệ Thống (Admin)
                      </Link>
                    )}

                    <Link
                      to="/orders"
                      onClick={() => setUserDropdown(false)}
                      className="flex items-center gap-2 px-4 py-2 text-xs text-stone-700 hover:bg-stone-50 transition"
                    >
                      <ShoppingBag className="w-4 h-4 text-stone-400" /> Đơn hàng của tôi
                    </Link>

                    <button
                      onClick={() => {
                        setUserDropdown(false);
                        logout();
                      }}
                      className="w-full text-left flex items-center gap-2 px-4 py-2 text-xs text-red-600 hover:bg-red-50 transition border-t border-stone-100 mt-1"
                    >
                      <LogOut className="w-4 h-4" /> Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                <Link
                  to="/login"
                  className="text-xs font-semibold text-stone-700 hover:text-brand-600 px-2 sm:px-3 py-1.5 rounded-lg transition whitespace-nowrap"
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  className="hidden sm:inline-flex text-xs font-semibold bg-brand-600 hover:bg-brand-700 text-white px-3 sm:px-3.5 py-1.5 rounded-lg transition shadow-sm whitespace-nowrap"
                >
                  Đăng ký
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 sm:p-2 text-stone-600 hover:text-stone-900 rounded-lg hover:bg-stone-100 transition flex-shrink-0"
              aria-label="Mở Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-stone-200 bg-white px-4 pt-3 pb-6 space-y-3 shadow-lg animate-in slide-in-from-top duration-200">
          <form onSubmit={handleSearch} className="relative mb-3">
            <input
              type="text"
              placeholder="Tìm kiếm nội thất (sofa, bàn ăn...)..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-stone-100 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
          </form>

          <div className="space-y-1 text-sm font-medium text-stone-800 border-b border-stone-100 pb-3">
            <Link to="/" onClick={() => setMobileMenuOpen(false)} className="block py-2 px-3 rounded-lg hover:bg-stone-50 hover:text-brand-600 transition">Trang Chủ</Link>
            <Link to="/phong-3d" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-between py-2 px-3 rounded-lg bg-amber-50 text-amber-900 font-bold hover:bg-amber-100 transition">
              <span>🏛️ Không Gian Phòng 3D AI</span>
              <span className="bg-amber-500 text-amber-950 text-[10px] px-1.5 py-0.5 rounded-full font-black">MỚI</span>
            </Link>
            <Link to="/products" onClick={() => setMobileMenuOpen(false)} className="block py-2 px-3 rounded-lg hover:bg-stone-50 hover:text-brand-600 transition">Tất Cả Sản Phẩm</Link>
            <Link to="/products?categoryId=1" onClick={() => setMobileMenuOpen(false)} className="block py-2 px-3 rounded-lg hover:bg-stone-50 hover:text-brand-600 transition">Sofa & Ghế</Link>
            <Link to="/products?categoryId=2" onClick={() => setMobileMenuOpen(false)} className="block py-2 px-3 rounded-lg hover:bg-stone-50 hover:text-brand-600 transition">Bàn Ăn & Bàn Trà</Link>
            <Link to="/products?categoryId=3" onClick={() => setMobileMenuOpen(false)} className="block py-2 px-3 rounded-lg hover:bg-stone-50 hover:text-brand-600 transition">Giường Ngủ Cao Cấp</Link>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
            <Link
              to="/so-sanh"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-50 text-amber-900 font-semibold border border-amber-200/60 hover:bg-amber-100 transition"
            >
              <Scale className="w-4 h-4 text-amber-600" />
              <span>So sánh ({compareCount})</span>
            </Link>
            <Link
              to="/yeu-thich"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 p-2.5 rounded-xl bg-red-50 text-red-900 font-semibold border border-red-200/60 hover:bg-red-100 transition"
            >
              <Heart className="w-4 h-4 text-red-600" />
              <span>Yêu thích ({wishlistCount})</span>
            </Link>
          </div>

          {!user ? (
            <div className="flex gap-2 pt-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 py-2 text-center text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-xl transition"
              >
                Đăng nhập
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 py-2 text-center text-xs font-semibold bg-brand-600 hover:bg-brand-700 text-white rounded-xl transition shadow-sm"
              >
                Đăng ký
              </Link>
            </div>
          ) : (
            <div className="pt-2 border-t border-stone-100 space-y-1">
              <Link
                to="/orders"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 py-2 px-3 text-xs text-stone-700 hover:bg-stone-50 rounded-lg"
              >
                <ShoppingBag className="w-4 h-4 text-stone-500" /> Đơn hàng của tôi
              </Link>
              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 py-2 px-3 text-xs font-semibold text-brand-700 hover:bg-brand-50 rounded-lg"
                >
                  <Shield className="w-4 h-4" /> Quản Trị Hệ Thống (Admin)
                </Link>
              )}
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
