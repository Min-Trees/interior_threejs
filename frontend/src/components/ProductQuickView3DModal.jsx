import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  X,
  ShoppingBag,
  Check,
  Sparkles,
  ArrowRight,
  Layers,
  Ruler,
  Palette,
  ExternalLink,
  ShieldCheck,
  Truck
} from 'lucide-react';
import Furniture3DViewer from './Furniture3DViewer';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const formatPrice = (amount) => {
  if (!amount) return '0 đ';
  return new Intl.NumberFormat('vi-VN').format(amount) + ' đ';
};

export default function ProductQuickView3DModal({ product, isOpen, onClose }) {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [addedSuccess, setAddedSuccess] = useState(false);
  const [adding, setAdding] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose?.();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !product) return null;

  const hasDiscount = product.discountPrice && product.discountPrice < product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  const handleAddToCart = async () => {
    if (!user) {
      window.location.href = '/login';
      return;
    }
    try {
      setAdding(true);
      await addToCart(product.id, quantity);
      setAddedSuccess(true);
      setTimeout(() => setAddedSuccess(false), 2000);
    } catch (err) {
      alert(err.message || 'Lỗi thêm vào giỏ hàng');
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 lg:p-8 animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-5xl bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden flex flex-col lg:flex-row max-h-[92vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-stone-900/80 hover:bg-stone-900 text-stone-300 hover:text-white backdrop-blur-md border border-stone-700 transition shadow-lg"
          title="Đóng cửa sổ 3D (Esc)"
        >
          <X className="w-5 h-5" />
        </button>

        {/* LEFT COLUMN: Interactive 3D Viewer */}
        <div className="w-full lg:w-3/5 relative bg-stone-950 min-h-[360px] lg:min-h-[560px] flex items-center justify-center">
          <Furniture3DViewer product={product} />
        </div>

        {/* RIGHT COLUMN: Product Specifications & Quick Checkout */}
        <div className="w-full lg:w-2/5 p-6 sm:p-8 flex flex-col justify-between overflow-y-auto space-y-6 bg-stone-50 dark:bg-stone-900/90 text-stone-900 dark:text-stone-100">
          <div className="space-y-4">
            {/* Category & Badge */}
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                {product.category?.name || 'Nội Thất Phú Quý'}
              </span>
              <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                <span>3D Tương Tác</span>
              </span>
            </div>

            {/* Product Title */}
            <h2 className="text-xl sm:text-2xl font-extrabold font-serif leading-tight">
              {product.name}
            </h2>

            {/* Price Box */}
            <div className="p-4 rounded-2xl bg-white dark:bg-stone-800/80 border border-stone-200/80 dark:border-stone-700/80 flex items-baseline gap-3 shadow-xs">
              <div className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono">
                {formatPrice(product.discountPrice || product.price)}
              </div>
              {hasDiscount && (
                <>
                  <div className="text-xs text-stone-400 line-through">
                    {formatPrice(product.price)}
                  </div>
                  <span className="text-[11px] font-bold px-1.5 py-0.5 rounded bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400">
                    -{discountPercent}%
                  </span>
                </>
              )}
            </div>

            {/* Specs Highlights */}
            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <div className="p-3 bg-white dark:bg-stone-800/60 rounded-xl border border-stone-200/60 dark:border-stone-700/60 space-y-0.5">
                <div className="flex items-center gap-1.5 text-stone-400 text-[10px] uppercase font-bold">
                  <Ruler className="w-3 h-3 text-amber-500" />
                  <span>Kích thước</span>
                </div>
                <div className="font-bold text-stone-800 dark:text-stone-200 truncate">
                  {product.dimensions || 'Tiêu chuẩn'}
                </div>
              </div>

              <div className="p-3 bg-white dark:bg-stone-800/60 rounded-xl border border-stone-200/60 dark:border-stone-700/60 space-y-0.5">
                <div className="flex items-center gap-1.5 text-stone-400 text-[10px] uppercase font-bold">
                  <Layers className="w-3 h-3 text-amber-500" />
                  <span>Chất liệu</span>
                </div>
                <div className="font-bold text-stone-800 dark:text-stone-200 truncate">
                  {product.material || 'Gỗ / Da cao cấp'}
                </div>
              </div>

              <div className="p-3 bg-white dark:bg-stone-800/60 rounded-xl border border-stone-200/60 dark:border-stone-700/60 space-y-0.5">
                <div className="flex items-center gap-1.5 text-stone-400 text-[10px] uppercase font-bold">
                  <Palette className="w-3 h-3 text-amber-500" />
                  <span>Màu sắc</span>
                </div>
                <div className="font-bold text-stone-800 dark:text-stone-200 truncate">
                  {product.color || 'Tự nhiên'}
                </div>
              </div>

              <div className="p-3 bg-white dark:bg-stone-800/60 rounded-xl border border-stone-200/60 dark:border-stone-700/60 space-y-0.5">
                <div className="flex items-center gap-1.5 text-stone-400 text-[10px] uppercase font-bold">
                  <ShieldCheck className="w-3 h-3 text-emerald-500" />
                  <span>Bảo hành</span>
                </div>
                <div className="font-bold text-stone-800 dark:text-stone-200">
                  {product.warrantyMonths ? `${product.warrantyMonths} tháng` : '36 tháng chính hãng'}
                </div>
              </div>
            </div>

            {/* Guarantees */}
            <div className="text-[11px] text-stone-500 dark:text-stone-400 space-y-1 pt-1">
              <div className="flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-amber-500" />
                <span>Giao hàng và lắp đặt tận nhà toàn quốc</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Cam kết 100% gỗ tự nhiên & da nhập khẩu chính ngạch</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-4 border-t border-stone-200 dark:border-stone-800">
            {/* Quantity Selector + Add to cart */}
            <div className="flex items-center gap-3">
              <div className="flex items-center border border-stone-300 dark:border-stone-700 rounded-xl overflow-hidden bg-white dark:bg-stone-800">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-2 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700 font-bold"
                >
                  -
                </button>
                <span className="px-3 py-2 text-xs font-bold">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3 py-2 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700 font-bold"
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={adding}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 font-bold text-xs shadow-lg transition flex items-center justify-center gap-2"
              >
                {addedSuccess ? (
                  <>
                    <Check className="w-4 h-4 text-stone-950" />
                    <span>Đã Thêm Vào Giỏ Hàng!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>{adding ? 'Đang thêm...' : 'Thêm Vào Giỏ Hàng'}</span>
                  </>
                )}
              </button>
            </div>

            {/* Links: Full Detail Page & Room Concept Studio */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <Link
                to={`/products/${product.slug}`}
                onClick={onClose}
                className="py-2.5 px-3 rounded-xl border border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-xs font-bold text-center transition flex items-center justify-center gap-1.5"
              >
                <span>Xem Chi Tiết Đầy Đủ</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>

              <Link
                to="/room-concept"
                onClick={onClose}
                className="py-2.5 px-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-amber-300 border border-amber-500/30 text-xs font-bold text-center transition flex items-center justify-center gap-1.5 shadow"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Thử Vào Phòng 3D</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
