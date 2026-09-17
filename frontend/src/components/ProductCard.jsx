import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Eye, Check, Heart, Scale, Box, Sparkles } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { useCompare } from '../context/CompareContext';
import ProductQuickView3DModal from './ProductQuickView3DModal';

const formatPrice = (amount) => {
  if (!amount) return '0 đ';
  return new Intl.NumberFormat('vi-VN').format(amount) + ' đ';
};

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { isInCompare, toggleCompare } = useCompare();

  const [added, setAdded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [quickView3DOpen, setQuickView3DOpen] = useState(false);

  const isFav = isInWishlist(product.id);
  const isComp = isInCompare(product.id);

  const hasDiscount = product.discountPrice && product.discountPrice < product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  const handleToggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  const handleToggleCompare = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const result = toggleCompare(product);
    if (result.message) {
      alert(result.message);
    }
  };

  const handleOpen3D = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setQuickView3DOpen(true);
  };

  const handleQuickAdd = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      window.location.href = '/login';
      return;
    }
    try {
      setLoading(true);
      await addToCart(product.id, 1);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="group bg-white rounded-2xl border border-stone-200/80 overflow-hidden hover:shadow-xl hover:border-brand-300 transition-all duration-300 flex flex-col relative">
      {/* Image thumbnail container */}
      <div className="relative aspect-[4/3] bg-stone-100 overflow-hidden block">
        <Link to={`/products/${product.slug}`} className="block w-full h-full">
          <img
            src={product.thumbnail || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80'}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            loading="lazy"
          />
        </Link>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10 pointer-events-none">
          {hasDiscount && (
            <span className="bg-red-600 text-white text-[11px] font-bold px-2 py-0.5 rounded-md shadow-sm">
              -{discountPercent}%
            </span>
          )}
          {product.isFeatured && (
            <span className="bg-brand-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm uppercase tracking-wider">
              Nổi bật
            </span>
          )}
        </div>

        {/* Action icons at top-right (3D, Wishlist, Compare) */}
        <div className="absolute top-3 right-3 z-10 flex flex-col items-end gap-1.5">
          <button
            type="button"
            onClick={handleOpen3D}
            className="bg-stone-900/85 hover:bg-amber-500 text-amber-300 hover:text-stone-950 text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-md flex items-center gap-1.5 transition-all cursor-pointer backdrop-blur-md border border-amber-400/30 group/btn"
            title="Mở trải nghiệm 3D tương tác 360°"
          >
            <Box className="w-3.5 h-3.5 text-amber-400 group-hover/btn:rotate-12 transition-transform" />
            <span>3D 360°</span>
          </button>

          <div className="flex items-center gap-1 opacity-90 group-hover:opacity-100 transition">
            {/* Compare Button */}
            <button
              type="button"
              onClick={handleToggleCompare}
              className={`w-7 h-7 rounded-full backdrop-blur flex items-center justify-center transition shadow ${
                isComp
                  ? 'bg-amber-500 text-amber-950 font-bold'
                  : 'bg-white/85 text-stone-700 hover:bg-amber-500 hover:text-white'
              }`}
              title={isComp ? 'Bỏ chọn so sánh' : 'Thêm vào so sánh'}
            >
              <Scale className="w-3.5 h-3.5" />
            </button>

            {/* Wishlist Button */}
            <button
              type="button"
              onClick={handleToggleWishlist}
              className={`w-7 h-7 rounded-full backdrop-blur flex items-center justify-center transition shadow ${
                isFav
                  ? 'bg-red-500 text-white'
                  : 'bg-white/85 text-stone-700 hover:text-red-500 hover:bg-white'
              }`}
              title={isFav ? 'Bỏ yêu thích' : 'Yêu thích'}
            >
              <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>

        {/* Hover Center Button: Xem 3D Nhanh */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-300 z-10">
          <button
            type="button"
            onClick={handleOpen3D}
            className="pointer-events-auto bg-stone-900/90 hover:bg-amber-500 hover:text-stone-950 text-white text-xs font-bold px-4 py-2 rounded-xl backdrop-blur-md shadow-xl flex items-center gap-2 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 border border-white/20 hover:scale-105 active:scale-95"
          >
            <Box className="w-4 h-4 text-amber-400" />
            <span>Xem 3D Nhanh</span>
          </button>
        </div>

        {/* Material tag */}
        {product.material && (
          <div className="absolute bottom-3 left-3 right-3 z-10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <span className="inline-block bg-black/60 backdrop-blur text-white text-[11px] px-2.5 py-1 rounded-md max-w-full truncate">
              {product.material}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Category */}
          <span className="text-[11px] font-semibold uppercase tracking-wider text-brand-600 mb-1 block">
            {product.category?.name || 'Nội Thất'}
          </span>

          {/* Title */}
          <Link to={`/products/${product.slug}`}>
            <h3 className="text-sm sm:text-base font-bold text-stone-900 line-clamp-2 hover:text-brand-600 transition mb-2">
              {product.name}
            </h3>
          </Link>

          {/* Dimensions */}
          {product.dimensions && (
            <p className="text-[11px] text-stone-500 line-clamp-1 mb-3">
              KT: {product.dimensions}
            </p>
          )}
        </div>

        {/* Price & Action */}
        <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
          <div>
            <div className="text-base sm:text-lg font-extrabold text-brand-700">
              {formatPrice(product.discountPrice || product.price)}
            </div>
            {hasDiscount && (
              <div className="text-[11px] text-stone-400 line-through">
                {formatPrice(product.price)}
              </div>
            )}
          </div>

          <button
            onClick={handleQuickAdd}
            disabled={loading || product.stockQuantity <= 0}
            className={`p-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-center shadow-sm ${
              product.stockQuantity <= 0
                ? 'bg-stone-100 text-stone-400 cursor-not-allowed'
                : added
                ? 'bg-emerald-600 text-white'
                : 'bg-brand-50 text-brand-700 hover:bg-brand-600 hover:text-white'
            }`}
            title={product.stockQuantity <= 0 ? 'Hết hàng' : 'Thêm nhanh vào giỏ'}
          >
            {added ? <Check className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* 3D Quick View Interactive Modal */}
      {quickView3DOpen && (
        <ProductQuickView3DModal
          product={product}
          isOpen={quickView3DOpen}
          onClose={() => setQuickView3DOpen(false)}
        />
      )}
    </div>
  );
};

export default ProductCard;
