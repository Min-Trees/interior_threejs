import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingBag, Check, Shield, Truck, Sparkles, ArrowLeft, ArrowRight, Ruler, Layers, Palette, Scale, Box, Image as ImageIcon } from 'lucide-react';
import api from '../api/client';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import Furniture3DViewer from '../components/Furniture3DViewer';

const formatPrice = (amount) => {
  if (!amount) return '0 đ';
  return new Intl.NumberFormat('vi-VN').format(amount) + ' đ';
};

const ProductDetail = () => {
  const { slug } = useParams();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(false);
  const [viewMode, setViewMode] = useState('2D'); // '2D' hoặc '3D'

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/products/slug/${slug}`);
        if (res.success && res.data) {
          setProduct(res.data);
          setSelectedImage(res.data.thumbnail || '');
        }
      } catch (err) {
        console.error('Error fetching product details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 flex justify-center">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-stone-900 mb-2">Không tìm thấy sản phẩm</h2>
        <Link to="/products" className="text-brand-600 font-semibold text-sm hover:underline">
          ← Quay lại danh sách sản phẩm
        </Link>
      </div>
    );
  }

  const imagesList = product.images ? product.images.split(',') : [product.thumbnail];
  const hasDiscount = product.discountPrice && product.discountPrice < product.price;

  const handleAdd = async () => {
    if (!user) {
      window.location.href = '/login';
      return;
    }
    try {
      setAdding(true);
      await addToCart(product.id, quantity);
      setAddedSuccess(true);
      setTimeout(() => setAddedSuccess(false), 2500);
    } catch (err) {
      alert(err.message);
    } finally {
      setAdding(false);
    }
  };

  const handleAskAI = () => {
    const chatBtn = document.querySelector('.ai-glow-btn');
    if (chatBtn) chatBtn.click();
  };

  const getSuggestedRoomType = () => {
    const text = `${product.name} ${product.category?.name || ''}`.toLowerCase();
    if (text.includes('giường') || text.includes('bed') || text.includes('ngủ') || text.includes('tủ áo')) return 'BEDROOM';
    if (text.includes('ăn') || text.includes('dining') || text.includes('bếp') || text.includes('bàn ăn')) return 'DINING_ROOM';
    if (text.includes('làm việc') || text.includes('office') || text.includes('desk') || text.includes('sách')) return 'HOME_OFFICE';
    return 'LIVING_ROOM';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-stone-500 mb-6">
        <Link to="/" className="hover:text-stone-800">Trang chủ</Link>
        <span>/</span>
        <Link to="/products" className="hover:text-stone-800">Sản phẩm</Link>
        <span>/</span>
        <span className="text-stone-900 font-medium truncate">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left: Gallery & 3D Viewer */}
        <div className="space-y-4">
          {/* Tab Switcher: 2D vs 3D */}
          <div className="flex items-center justify-between">
            <div className="bg-stone-200/80 p-1 rounded-2xl flex items-center gap-1 text-xs font-bold">
              <button
                onClick={() => setViewMode('2D')}
                className={`px-3.5 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
                  viewMode === '2D' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5 text-stone-500" />
                Ảnh Thực Tế (2D)
              </button>
              <button
                onClick={() => setViewMode('3D')}
                className={`px-3.5 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
                  viewMode === '3D' ? 'bg-brand-600 text-white shadow-sm' : 'text-stone-600 hover:text-brand-700'
                }`}
              >
                <Box className="w-3.5 h-3.5 text-amber-300" />
                Xem 3D 360° (Three.js)
              </button>
            </div>

            {viewMode === '3D' && (
              <span className="text-[11px] font-semibold text-brand-700 flex items-center gap-1 animate-pulse">
                <Sparkles className="w-3 h-3 text-amber-500" /> Xoay 360° & Đổi chất liệu
              </span>
            )}
          </div>

          {/* Viewer Area */}
          {viewMode === '3D' ? (
            <Furniture3DViewer product={product} />
          ) : (
            <>
              <div className="aspect-[4/3] rounded-3xl overflow-hidden bg-stone-100 border border-stone-200 shadow-sm">
                <img
                  src={selectedImage || product.thumbnail}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {imagesList.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {imagesList.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(img.trim())}
                      className={`w-20 h-20 rounded-xl overflow-hidden border-2 flex-shrink-0 transition ${
                        selectedImage === img.trim() ? 'border-brand-600 scale-95' : 'border-stone-200 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img.trim()} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Right: Info */}
        <div className="space-y-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600 mb-2 block">
              {product.category?.name || 'Nội Thất Phú Quý'}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-serif leading-snug">
              {product.name}
            </h1>
          </div>

          {/* Price Box */}
          <div className="p-4 rounded-2xl bg-stone-100/80 border border-stone-200/80 flex items-baseline gap-4">
            <div className="text-2xl sm:text-3xl font-extrabold text-brand-700 font-mono">
              {formatPrice(product.discountPrice || product.price)}
            </div>
            {hasDiscount && (
              <div className="text-sm text-stone-400 line-through">
                {formatPrice(product.price)}
              </div>
            )}
            <div className="ml-auto">
              <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                product.stockQuantity > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
              }`}>
                {product.stockQuantity > 0 ? `Còn hàng (${product.stockQuantity})` : 'Tạm hết hàng'}
              </span>
            </div>
          </div>

          {/* Specifications Grid */}
          <div className="grid grid-cols-2 gap-3 py-2">
            <div className="p-3 bg-white rounded-xl border border-stone-200/80 flex items-center gap-3">
              <Layers className="w-4 h-4 text-brand-600 flex-shrink-0" />
              <div>
                <span className="text-[11px] text-stone-400 block">Chất liệu</span>
                <span className="text-xs font-bold text-stone-800">{product.material || 'Gỗ tự nhiên cao cấp'}</span>
              </div>
            </div>

            <div className="p-3 bg-white rounded-xl border border-stone-200/80 flex items-center gap-3">
              <Ruler className="w-4 h-4 text-brand-600 flex-shrink-0" />
              <div>
                <span className="text-[11px] text-stone-400 block">Kích thước</span>
                <span className="text-xs font-bold text-stone-800">{product.dimensions || 'Tiêu chuẩn'}</span>
              </div>
            </div>

            <div className="p-3 bg-white rounded-xl border border-stone-200/80 flex items-center gap-3">
              <Palette className="w-4 h-4 text-brand-600 flex-shrink-0" />
              <div>
                <span className="text-[11px] text-stone-400 block">Màu sắc</span>
                <span className="text-xs font-bold text-stone-800">{product.color || 'Tự nhiên'}</span>
              </div>
            </div>

            <div className="p-3 bg-white rounded-xl border border-stone-200/80 flex items-center gap-3">
              <Scale className="w-4 h-4 text-brand-600 flex-shrink-0" />
              <div>
                <span className="text-[11px] text-stone-400 block">Trọng lượng</span>
                <span className="text-xs font-bold text-stone-800">{product.weight ? `${product.weight} kg` : 'Theo bộ'}</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-900">Mô Tả Sản Phẩm</h3>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed whitespace-pre-line">
              {product.description}
            </p>
          </div>

          {/* Quantity & Add to cart */}
          <div className="pt-4 border-t border-stone-200 space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-stone-300 rounded-xl overflow-hidden bg-white">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3.5 py-2 text-stone-600 hover:bg-stone-100 font-bold text-sm"
                >
                  -
                </button>
                <span className="px-4 py-2 text-xs font-bold text-stone-900">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stockQuantity, quantity + 1))}
                  className="px-3.5 py-2 text-stone-600 hover:bg-stone-100 font-bold text-sm"
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAdd}
                disabled={adding || product.stockQuantity <= 0}
                className={`flex-1 py-3 px-6 rounded-xl font-bold text-sm shadow-md transition flex items-center justify-center gap-2 ${
                  product.stockQuantity <= 0
                    ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                    : addedSuccess
                    ? 'bg-emerald-600 text-white'
                    : 'bg-brand-600 hover:bg-brand-700 text-white'
                }`}
              >
                {addedSuccess ? (
                  <>
                    <Check className="w-4 h-4" /> Đã thêm vào giỏ hàng
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" /> Thêm Vào Giỏ Hàng
                  </>
                )}
              </button>
            </div>

            {/* AI Advisor Trigger */}
            <button
              onClick={handleAskAI}
              className="w-full py-2.5 px-4 rounded-xl border border-brand-300 bg-brand-50 hover:bg-brand-100 text-brand-800 text-xs font-semibold flex items-center justify-center gap-2 transition"
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              Hỏi Phú Quý AI tư vấn cách phối màu & bài trí cho mẫu này
            </button>

            {/* 3D Villa Concept Navigation Banner */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-stone-900 via-stone-850 to-amber-950 border border-amber-500/30 text-white shadow-lg space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-400/40 flex items-center justify-center">
                    <Box className="w-4 h-4 text-amber-400" />
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-300 block">
                      Biệt Thự & Studio 3D Phú Quý
                    </span>
                    <span className="text-[11px] text-stone-400">First-Person Walkthrough & Thay đổi ánh sáng</span>
                  </div>
                </div>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  VR 360°
                </span>
              </div>

              <p className="text-xs text-stone-300 leading-relaxed">
                Xem trực tiếp không gian thực tế ảo: Tự do đi bộ tham quan căn phòng thật, đổi màu tường, chuyển ánh sáng Ngày/Đêm và phối hợp món này với toàn bộ nội thất.
              </p>

              <Link
                to={`/room-concept?room=${getSuggestedRoomType()}`}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 font-bold text-xs shadow-md transition flex items-center justify-center gap-2 group"
              >
                <Box className="w-4 h-4" />
                <span>Trải Nghiệm Món Này Trong Căn Hộ / Biệt Thự 3D</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
