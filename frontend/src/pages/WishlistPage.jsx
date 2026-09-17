import React from 'react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/ProductCard';

const WishlistPage = () => {
  const { wishlist, wishlistCount, clearWishlist } = useWishlist();
  const { addToCart } = useCart();

  const handleAddAllToCart = () => {
    wishlist.forEach((item) => {
      addToCart(item, 1);
    });
  };

  return (
    <div className="min-h-screen bg-stone-900 text-stone-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-800 pb-6">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-3xl">❤️</span>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-amber-200">
                Danh Sách Yêu Thích
              </h1>
            </div>
            <p className="text-sm text-stone-400 mt-1">
              Bạn đang lưu trữ <span className="text-amber-400 font-bold">{wishlistCount}</span> sản phẩm nội thất mơ ước
            </p>
          </div>

          {wishlistCount > 0 && (
            <div className="flex items-center gap-3">
              <button
                onClick={clearWishlist}
                className="px-4 py-2 border border-stone-700 hover:border-red-500/50 hover:bg-red-500/10 text-stone-300 hover:text-red-400 rounded-xl text-xs font-semibold transition"
              >
                Xóa tất cả
              </button>
              <button
                onClick={handleAddAllToCart}
                className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-amber-950 font-bold text-xs sm:text-sm rounded-xl shadow-lg transition flex items-center gap-2"
              >
                <span>🛒 Thêm tất cả vào giỏ</span>
              </button>
            </div>
          )}
        </div>

        {/* Wishlist Grid or Empty State */}
        {wishlistCount === 0 ? (
          <div className="text-center py-20 bg-stone-800/40 rounded-3xl border border-stone-800 p-8 space-y-4">
            <div className="text-6xl">🤍</div>
            <h2 className="font-serif text-xl font-bold text-stone-300">
              Danh sách yêu thích của bạn đang trống
            </h2>
            <p className="text-sm text-stone-400 max-w-md mx-auto">
              Hãy bấm vào biểu tượng trái tim trên các sản phẩm bạn thích để lưu lại và xem lại bất cứ lúc nào!
            </p>
            <div className="pt-4">
              <Link
                to="/products"
                className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-amber-950 font-bold rounded-xl text-sm transition shadow-lg shadow-amber-500/20"
              >
                <span>Khám phá bộ sưu tập nội thất</span>
                <span>→</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {wishlist.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;
