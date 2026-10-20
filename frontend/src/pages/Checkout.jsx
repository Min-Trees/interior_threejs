import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShieldCheck, Truck, CreditCard, Banknote, CheckCircle, ArrowRight, Tag, X } from 'lucide-react';
import api from '../api/client';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import VietQRCodeModal from '../components/VietQRCodeModal';

const formatPrice = (amount) => {
  if (!amount) return '0 đ';
  return new Intl.NumberFormat('vi-VN').format(amount) + ' đ';
};

const Checkout = () => {
  const { cart, fetchCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    recipientName: user?.fullName || '',
    recipientPhone: user?.phone || '',
    shippingAddress: user?.address || '',
    note: '',
    paymentMethod: 'COD',
    voucherCode: location.state?.voucherCode || '',
  });

  // Voucher states
  const [voucherInput, setVoucherInput] = useState(location.state?.voucherCode || '');
  const [appliedVoucher, setAppliedVoucher] = useState(null);
  const [voucherError, setVoucherError] = useState('');
  const [availableVouchers, setAvailableVouchers] = useState([]);

  const [loading, setLoading] = useState(false);
  const [successOrder, setSuccessOrder] = useState(null);
  const [showVietQrModal, setShowVietQrModal] = useState(false);

  useEffect(() => {
    // Tải danh sách voucher đang hiệu lực
    api.get('/vouchers')
      .then((res) => {
        if (res.data) {
          setAvailableVouchers(res.data);
        }
      })
      .catch(() => {});

    // Tự động áp dụng voucher từ Giỏ hàng nếu có
    if (location.state?.voucherCode && cart?.totalPrice > 0) {
      handleApplyVoucher(location.state.voucherCode);
    }
  }, [cart?.totalPrice]);

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
        setFormData((prev) => ({ ...prev, voucherCode: code }));
      }
    } catch (err) {
      setVoucherError(err.message || 'Mã giảm giá không hợp lệ hoặc đã hết hạn');
      setAppliedVoucher(null);
    }
  };

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null);
    setVoucherInput('');
    setFormData((prev) => ({ ...prev, voucherCode: '' }));
  };

  const finalAmount = appliedVoucher
    ? appliedVoucher.finalAmount
    : cart.totalPrice;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.recipientName || !formData.recipientPhone || !formData.shippingAddress) {
      alert('Vui lòng điền đầy đủ thông tin giao hàng');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/orders', formData);
      if (res.success && res.data) {
        const orderData = res.data;
        setSuccessOrder(orderData);
        await fetchCart();

        if (formData.paymentMethod === 'VNPAY' && orderData.paymentUrl) {
          window.location.href = orderData.paymentUrl;
          return;
        }

        if (formData.paymentMethod === 'BANKING') {
          setShowVietQrModal(true);
        }
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (successOrder && !showVietQrModal) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-extrabold text-stone-900 font-serif">Đặt Hàng Thành Công!</h1>
        <p className="text-sm text-stone-600 max-w-md mx-auto">
          Cảm ơn bạn đã lựa chọn Nội thất Phú Quý. Chuyên viên chăm sóc khách hàng sẽ liên hệ xác nhận đơn hàng trong vòng 15 phút.
        </p>

        <div className="p-6 rounded-3xl bg-white border border-stone-200/80 shadow-md text-left space-y-3 text-xs">
          <div className="flex justify-between border-b pb-2">
            <span className="text-stone-500">Mã đơn hàng:</span>
            <span className="font-mono font-bold text-brand-700">{successOrder.orderCode}</span>
          </div>
          <div className="flex justify-between border-b pb-2">
            <span className="text-stone-500">Người nhận:</span>
            <span className="font-bold text-stone-800">{successOrder.recipientName} ({successOrder.recipientPhone})</span>
          </div>
          <div className="flex justify-between border-b pb-2">
            <span className="text-stone-500">Địa chỉ giao:</span>
            <span className="font-medium text-stone-800 text-right max-w-xs">{successOrder.shippingAddress}</span>
          </div>
          {successOrder.voucherCode && (
            <div className="flex justify-between border-b pb-2 text-emerald-700">
              <span>Voucher đã áp dụng:</span>
              <span className="font-bold">{successOrder.voucherCode} (-{formatPrice(successOrder.discountAmount)})</span>
            </div>
          )}
          <div className="flex justify-between border-b pb-2">
            <span className="text-stone-500">Hình thức thanh toán:</span>
            <span className="font-bold text-stone-800">
              {successOrder.paymentMethod === 'COD' && 'Thanh toán tiền mặt khi nhận hàng (COD)'}
              {successOrder.paymentMethod === 'BANKING' && 'Chuyển khoản VietQR'}
              {successOrder.paymentMethod === 'MOMO' && 'Ví điện tử MoMo'}
              {successOrder.paymentMethod === 'VNPAY' && 'Cổng thanh toán VNPAY'}
            </span>
          </div>
          <div className="flex justify-between pt-1 text-sm">
            <span className="font-bold text-stone-900">Tổng thanh toán:</span>
            <span className="font-bold text-brand-700 font-mono text-base">{formatPrice(successOrder.totalAmount)}</span>
          </div>
        </div>

        {successOrder.paymentMethod === 'BANKING' && (
          <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 text-left flex items-center justify-between">
            <div>
              <h4 className="font-bold text-sm">Bạn đã chọn Chuyển khoản VietQR</h4>
              <p className="text-stone-600 mt-0.5">Bấm nút bên dưới để mở lại mã QR thanh toán nếu cần.</p>
            </div>
            <button
              onClick={() => setShowVietQrModal(true)}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs shadow"
            >
              Mở mã VietQR
            </button>
          </div>
        )}

        <div className="flex justify-center gap-4 pt-4">
          <button
            onClick={() => navigate('/orders')}
            className="bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs px-6 py-3 rounded-xl shadow transition"
          >
            Xem lịch sử đơn hàng
          </button>
          <button
            onClick={() => navigate('/products')}
            className="bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs px-6 py-3 rounded-xl transition"
          >
            Tiếp tục mua sắm
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-extrabold text-stone-900 font-serif mb-8 pb-4 border-b border-stone-200">
        Thông Tin Giao Hàng & Thanh Toán
      </h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Form fields */}
        <div className="lg:col-span-2 space-y-6">
          {/* Shipping Info Card */}
          <div className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-sm space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-stone-900 flex items-center gap-2 font-serif">
              <Truck className="w-4 h-4 text-brand-600" /> Thông Tin Người Nhận
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">Họ và tên *</label>
                <input
                  type="text"
                  required
                  value={formData.recipientName}
                  onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })}
                  placeholder="Ví dụ: Nguyễn Văn An"
                  className="w-full text-xs px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">Số điện thoại *</label>
                <input
                  type="tel"
                  required
                  value={formData.recipientPhone}
                  onChange={(e) => setFormData({ ...formData, recipientPhone: e.target.value })}
                  placeholder="Ví dụ: 0987654321"
                  className="w-full text-xs px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1">Địa chỉ giao hàng chi tiết *</label>
              <input
                type="text"
                required
                value={formData.shippingAddress}
                onChange={(e) => setFormData({ ...formData, shippingAddress: e.target.value })}
                placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố"
                className="w-full text-xs px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1">Ghi chú cho đơn vị vận chuyển</label>
              <textarea
                rows="2"
                value={formData.note}
                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                placeholder="Ví dụ: Giao giờ hành chính, gọi trước khi giao 30 phút, lên tầng có thang máy..."
                className="w-full text-xs px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
          </div>

          {/* Payment Method Card */}
          <div className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-sm space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-stone-900 flex items-center gap-2 font-serif">
              <CreditCard className="w-4 h-4 text-brand-600" /> Phương Thức Thanh Toán Đa Kênh
            </h2>

            <div className="space-y-3">
              {/* COD */}
              <label className={`flex items-center gap-3 p-4 rounded-2xl border cursor-pointer transition ${
                formData.paymentMethod === 'COD' ? 'border-brand-600 bg-brand-50/50' : 'border-stone-200 hover:bg-stone-50'
              }`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="COD"
                  checked={formData.paymentMethod === 'COD'}
                  onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                  className="w-4 h-4 text-brand-600"
                />
                <Banknote className="w-5 h-5 text-emerald-600" />
                <div className="flex-1">
                  <div className="text-xs font-bold text-stone-900">Thanh toán tiền mặt khi nhận hàng (COD)</div>
                  <div className="text-[11px] text-stone-500">Khách hàng kiểm tra và nghiệm thu sản phẩm tại nhà trước khi thanh toán.</div>
                </div>
              </label>

              {/* BANKING VietQR */}
              <label className={`flex items-center gap-3 p-4 rounded-2xl border cursor-pointer transition ${
                formData.paymentMethod === 'BANKING' ? 'border-amber-600 bg-amber-50/50' : 'border-stone-200 hover:bg-stone-50'
              }`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="BANKING"
                  checked={formData.paymentMethod === 'BANKING'}
                  onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                  className="w-4 h-4 text-brand-600"
                />
                <div className="w-5 h-5 rounded-lg bg-amber-500 text-white font-bold flex items-center justify-center text-[10px]">
                  QR
                </div>
                <div className="flex-1">
                  <div className="text-xs font-bold text-stone-900 flex items-center gap-2">
                    <span>Chuyển khoản VietQR Tự Động 24/7 (Khuyên dùng)</span>
                    <span className="bg-amber-500 text-white text-[9px] px-1.5 py-0.5 rounded font-bold">Nhanh nhất</span>
                  </div>
                  <div className="text-[11px] text-stone-500">Tự động tạo mã QR Napas247 điền sẵn số tiền và mã đơn hàng.</div>
                </div>
              </label>

              {/* VNPAY Sandbox */}
              <label className={`flex items-center gap-3 p-4 rounded-2xl border cursor-pointer transition ${
                formData.paymentMethod === 'VNPAY' ? 'border-blue-600 bg-blue-50/50' : 'border-stone-200 hover:bg-stone-50'
              }`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="VNPAY"
                  checked={formData.paymentMethod === 'VNPAY'}
                  onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                  className="w-4 h-4 text-blue-600"
                />
                <div className="w-5 h-5 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center text-[9px] shadow-sm">
                  VN
                </div>
                <div className="flex-1">
                  <div className="text-xs font-bold text-stone-900 flex items-center gap-2">
                    <span>Cổng Thanh Toán VNPAY Sandbox (ATM / QR / Visa)</span>
                    <span className="bg-blue-600 text-white text-[9px] px-1.5 py-0.5 rounded font-bold">Thử nghiệm</span>
                  </div>
                  <div className="text-[11px] text-stone-500">Chuyển hướng an toàn sang cổng VNPAY. Hỗ trợ quét mã VNPAY-QR hoặc nhập thẻ test.</div>
                </div>
              </label>

              {/* MoMo */}
              <label className={`flex items-center gap-3 p-4 rounded-2xl border cursor-pointer transition ${
                formData.paymentMethod === 'MOMO' ? 'border-pink-600 bg-pink-50/50' : 'border-stone-200 hover:bg-stone-50'
              }`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="MOMO"
                  checked={formData.paymentMethod === 'MOMO'}
                  onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                  className="w-4 h-4 text-pink-600"
                />
                <div className="w-5 h-5 rounded-full bg-pink-600 text-white font-bold flex items-center justify-center text-[9px]">
                  M
                </div>
                <div className="flex-1">
                  <div className="text-xs font-bold text-stone-900">Ví điện tử MoMo Sandbox</div>
                  <div className="text-[11px] text-stone-500">Mô phỏng quét mã thanh toán qua ví MoMo một chạm.</div>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Summary */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-md space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-stone-900 font-serif">
              Đơn Hàng ({cart.items.length} món)
            </h3>

            {/* Items list */}
            <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
              {cart.items.map((item) => (
                <div key={item.id} className="flex items-center gap-3 text-xs pb-2 border-b border-stone-100 last:border-0">
                  <img
                    src={item.productThumbnail}
                    alt=""
                    className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-stone-800 truncate">{item.productName}</p>
                    <p className="text-[11px] text-stone-400">Số lượng: {item.quantity}</p>
                  </div>
                  <div className="font-bold text-stone-900 font-mono">
                    {formatPrice(item.totalPrice)}
                  </div>
                </div>
              ))}
            </div>

            {/* Voucher Coupon Section */}
            <div className="pt-3 border-t border-stone-200 space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-stone-800">
                <Tag className="w-4 h-4 text-brand-600" />
                <span>Mã Giảm Giá / Voucher</span>
              </div>

              {appliedVoucher ? (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs">
                  <div>
                    <span className="font-mono font-bold text-emerald-800">{appliedVoucher.code}</span>
                    <p className="text-[11px] text-emerald-600">Đã giảm: -{formatPrice(appliedVoucher.discountAmount)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveVoucher}
                    className="p-1 text-emerald-700 hover:text-red-600 rounded"
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
                      placeholder="Nhập mã (VD: PHUQUY10)"
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

                  {/* Available vouchers chips */}
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

            {/* Price Calculations */}
            <div className="pt-3 border-t border-stone-200 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-stone-500">Tạm tính:</span>
                <span className="font-bold text-stone-800">{formatPrice(cart.totalPrice)}</span>
              </div>
              {appliedVoucher && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Giảm giá voucher ({appliedVoucher.code}):</span>
                  <span>-{formatPrice(appliedVoucher.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-stone-500">Vận chuyển & lắp đặt:</span>
                <span className="font-bold text-emerald-600">Miễn phí</span>
              </div>
              <div className="flex justify-between pt-2 border-t text-sm font-extrabold text-stone-900">
                <span>Tổng thanh toán:</span>
                <span className="text-brand-700 font-mono text-base">{formatPrice(finalAmount)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || cart.items.length === 0}
              className="w-full py-3.5 px-6 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-bold text-xs shadow-lg transition flex items-center justify-center gap-2"
            >
              {loading ? 'Đang xử lý đặt hàng...' : 'Xác Nhận Đặt Hàng Ngay'} <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </form>

      {/* VietQR Dynamic Modal */}
      {showVietQrModal && successOrder && (
        <VietQRCodeModal
          isOpen={showVietQrModal}
          order={successOrder}
          onClose={() => setShowVietQrModal(false)}
          onPaymentConfirmed={() => {
            setShowVietQrModal(false);
            navigate('/orders');
          }}
        />
      )}
    </div>
  );
};

export default Checkout;
