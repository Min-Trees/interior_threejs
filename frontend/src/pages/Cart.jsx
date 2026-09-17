import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowRight, ArrowLeft, Tag, X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';

const formatPrice = (amount) => {
  if (!amount) return '0 đ';
  return new Intl.NumberFormat('vi-VN').format(amount) + ' đ';
};

const Cart = () => {
  const { cart, updateQuantity, removeItem, clearCart, loading } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Voucher states
  const [voucherInput, setVoucherInput] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState(null);
  const [voucherError, setVoucherError] = useState('');
  const [availableVouchers, setAvailableVouchers] = useState([]);

  useEffect(() => {
    api.get('/vouchers')
      .then((res) => {
        if (res.data) setAvailableVouchers(res.data);
      })
      .catch(() => {});
  }, []);

  const handleApplyVoucher = async (codeToApply) => {
    const code = (codeToApply || voucherInput).trim().toUpperCase();
    if (!code) return;
    setVoucherError('');
    try {
      const res = await api.post('/vouchers/apply', {
        code,
        orderAmount: cart.totalPrice,
      });
      if (res.data && res.data.valid) {
        setAppliedVoucher(res.data);
      }
    } catch (err) {
      setVoucherError(err.message || 'Mã giảm giá không hợp lệ hoặc đã hết hạn');
      setAppliedVoucher(null);
    }
  };

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null);
    setVoucherInput('');
    setVoucherError('');
  };

  const finalAmount = appliedVoucher ? appliedVoucher.finalAmount : cart.totalPrice;

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center mx-auto mb-4">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-stone-900 mb-2">Bạn chưa đăng nhập</h2>
        <p className="text-xs text-stone-500 mb-6">Vui lòng đăng nhập để xem và quản lý giỏ hàng của bạn.</p>
        <Link
          to="/login"
          className="bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold px-6 py-3 rounded-xl transition shadow"
        >
          Đăng nhập ngay
        </Link>
      </div>
    );
  }

  if (cart.items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mx-auto mb-4">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-stone-900 mb-2 font-serif">Giỏ Hàng Đang Trống</h2>
        <p className="text-xs text-stone-500 mb-6">
          Chưa có sản phẩm nào trong giỏ hàng của bạn. Hãy khám phá các bộ sưu tập nội thất của chúng tôi!
        </p>
        <Link
          to="/products"
          className="bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold px-6 py-3 rounded-xl transition shadow"
        >
          Khám phá sản phẩm
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between pb-6 border-b border-stone-200 mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-serif">
          Giỏ Hàng ({cart.totalItems} sản phẩm)
        </h1>
        <button
          onClick={clearCart}
          className="text-xs text-red-600 hover:underline flex items-center gap-1 font-semibold"
        >
          <Trash2 className="w-3.5 h-3.5" /> Xóa tất cả
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Cart items list */}
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map((item) => (
            <div
              key={item.id}
              className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200/80 shadow-sm flex flex-col sm:flex-row items-center gap-4"
            >
              {/* Image */}
              <Link to={`/products/${item.productSlug}`} className="w-24 h-24 rounded-xl overflow-hidden bg-stone-100 flex-shrink-0">
                <img
                  src={item.productThumbnail || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=200&q=80'}
                  alt={item.productName}
                  className="w-full h-full object-cover"
                />
              </Link>

              {/* Info */}
              <div className="flex-1 min-w-0 text-center sm:text-left">
                <Link to={`/products/${item.productSlug}`}>
                  <h3 className="text-sm font-bold text-stone-900 hover:text-brand-600 transition truncate">
                    {item.productName}
                  </h3>
                </Link>
                {item.material && (
                  <p className="text-[11px] text-stone-500 truncate mt-0.5">{item.material}</p>
                )}
                {item.dimensions && (
                  <p className="text-[11px] text-stone-400 truncate">KT: {item.dimensions}</p>
                )}
                <div className="text-xs font-bold text-brand-700 mt-2">
                  {formatPrice(item.unitPrice)}
                </div>
              </div>

              {/* Quantity Controls */}
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-stone-300 rounded-xl overflow-hidden bg-stone-50">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="px-3 py-1.5 text-stone-600 hover:bg-stone-200 text-xs font-bold"
                  >
                    -
                  </button>
                  <span className="px-3 py-1.5 text-xs font-bold text-stone-900">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="px-3 py-1.5 text-stone-600 hover:bg-stone-200 text-xs font-bold"
                  >
                    +
                  </button>
                </div>

                <div className="text-sm font-extrabold text-stone-900 min-w-[90px] text-right font-mono">
                  {formatPrice(item.totalPrice)}
                </div>

                <button
                  onClick={() => removeItem(item.id)}
                  className="p-2 text-stone-400 hover:text-red-600 transition"
                  title="Xóa sản phẩm"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          <div className="pt-4">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 text-xs font-semibold text-brand-700 hover:text-brand-800"
            >
              <ArrowLeft className="w-4 h-4" /> Tiếp tục mua sắm
            </Link>
          </div>
        </div>

        {/* Order Summary Card */}
        <div className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-md h-fit space-y-6">
          <h2 className="text-base font-bold text-stone-900 uppercase tracking-wider font-serif">
            Tóm Tắt Đơn Hàng
          </h2>

          <div className="space-y-3 text-xs text-stone-600 pb-4 border-b border-stone-100">
            <div className="flex justify-between">
              <span>Tổng số lượng sản phẩm:</span>
              <span className="font-bold text-stone-900">{cart.totalItems} chiếc</span>
            </div>
            <div className="flex justify-between">
              <span>Tạm tính tiền hàng:</span>
              <span className="font-bold text-stone-900">{formatPrice(cart.totalPrice)}</span>
            </div>
            <div className="flex justify-between">
              <span>Phí vận chuyển & lắp đặt:</span>
              <span className="font-bold text-emerald-600">Miễn phí (Toàn quốc)</span>
            </div>
          </div>

          {/* Voucher Section */}
          <div className="pt-2 border-t border-stone-100 space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-stone-800">
              <Tag className="w-4 h-4 text-brand-600" />
              <span>Mã giảm giá / Voucher</span>
            </div>

            {appliedVoucher ? (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-emerald-800 font-mono flex items-center gap-1.5">
                    <span>🎉 {appliedVoucher.code}</span>
                    <span className="text-[10px] bg-emerald-200 text-emerald-900 px-1.5 py-0.5 rounded font-sans">
                      {appliedVoucher.discountType === 'PERCENTAGE' ? `-${appliedVoucher.discountValue}%` : `-${formatPrice(appliedVoucher.discountValue)}`}
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-700 mt-0.5">{appliedVoucher.message}</p>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveVoucher}
                  className="p-1 text-emerald-700 hover:text-red-600 rounded transition"
                  title="Gỡ mã"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Mã voucher (VD: PHUQUY10)"
                    value={voucherInput}
                    onChange={(e) => setVoucherInput(e.target.value.toUpperCase())}
                    className="flex-1 text-xs px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl uppercase font-mono focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                  <button
                    type="button"
                    onClick={() => handleApplyVoucher()}
                    className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl transition"
                  >
                    Áp dụng
                  </button>
                </div>
                {voucherError && (
                  <p className="text-[11px] text-red-600 font-medium">{voucherError}</p>
                )}

                {/* Available voucher chips */}
                {availableVouchers.length > 0 && (
                  <div className="pt-1">
                    <p className="text-[10px] text-stone-500 mb-1.5 font-medium">Mã gợi ý cho bạn:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {availableVouchers.map((v) => (
                        <button
                          key={v.id}
                          type="button"
                          onClick={() => handleApplyVoucher(v.code)}
                          className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-lg text-[10px] font-mono font-bold transition flex items-center gap-1"
                        >
                          <span>🏷️ {v.code}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Totals */}
          <div className="pt-3 border-t border-stone-100 space-y-2 text-xs">
            {appliedVoucher && (
              <div className="flex justify-between text-emerald-600 font-medium">
                <span>Giảm giá voucher ({appliedVoucher.code}):</span>
                <span>-{formatPrice(appliedVoucher.discountAmount)}</span>
              </div>
            )}
            <div className="flex items-baseline justify-between pt-1">
              <span className="text-sm font-bold text-stone-900">Tổng thanh toán:</span>
              <span className="text-xl font-extrabold text-brand-700 font-mono">
                {formatPrice(finalAmount)}
              </span>
            </div>
          </div>

          <button
            onClick={() => navigate('/checkout', { state: { voucherCode: appliedVoucher?.code } })}
            className="w-full py-3.5 px-6 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-lg hover:shadow-brand-600/30 transition flex items-center justify-center gap-2"
          >
            Tiến Hành Đặt Hàng <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
