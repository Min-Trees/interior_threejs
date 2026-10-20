import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle2, XCircle, ArrowRight, ShoppingBag, ShieldCheck, RefreshCw, CreditCard } from 'lucide-react';
import api from '../api/client';
import { useCart } from '../context/CartContext';

const formatPrice = (amount) => {
  if (!amount) return '0 đ';
  return new Intl.NumberFormat('vi-VN').format(amount) + ' đ';
};

const VNPayCallback = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { fetchCart } = useCart();

  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        setLoading(true);
        // Gửi toàn bộ query params nhận từ VNPAY lên backend để xác thực chữ ký số HMAC-SHA512
        const res = await api.get(`/payments/vnpay/callback${location.search}`);
        if (res.data) {
          setResult(res.data);
          // Làm mới lại giỏ hàng nếu thanh toán thành công
          if (res.data.success) {
            await fetchCart();
          }
        }
      } catch (err) {
        console.error('Lỗi đối soát VNPAY:', err);
        setError(err.message || 'Không thể xác thực giao dịch VNPAY');
      } finally {
        setLoading(false);
      }
    };

    if (location.search) {
      verifyPayment();
    } else {
      setError('Không tìm thấy thông tin tham số trả về từ cổng VNPAY');
      setLoading(false);
    }
  }, [location.search]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 space-y-4">
        <div className="w-16 h-16 rounded-full border-4 border-brand-200 border-t-brand-600 animate-spin"></div>
        <h2 className="text-xl font-bold text-stone-800 font-serif">Đang xác thực kết quả thanh toán VNPAY...</h2>
        <p className="text-xs text-stone-500">Vui lòng không tắt hoặc tải lại trang trong giây lát.</p>
      </div>
    );
  }

  const isSuccess = result?.success;

  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <div className="bg-white rounded-3xl border border-stone-200/90 shadow-xl overflow-hidden p-8 sm:p-10 text-center space-y-6">
        
        {/* Status Icon */}
        <div className="flex justify-center">
          {isSuccess ? (
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center shadow-inner">
                <CheckCircle2 className="w-14 h-14" />
              </div>
              <span className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-brand-600 text-white flex items-center justify-center text-xs font-bold border-2 border-white shadow">
                VN
              </span>
            </div>
          ) : (
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center shadow-inner">
                <XCircle className="w-14 h-14" />
              </div>
              <span className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-stone-700 text-white flex items-center justify-center text-xs font-bold border-2 border-white shadow">
                !
              </span>
            </div>
          )}
        </div>

        {/* Title */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-serif">
            {isSuccess ? 'Thanh Toán VNPAY Thành Công!' : 'Giao Dịch Chưa Hoàn Tất'}
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-2 max-w-md mx-auto">
            {result?.message || error || 'Cảm ơn bạn đã lựa chọn Nội thất cao cấp Phú Quý.'}
          </p>
        </div>

        {/* Transaction Details Box */}
        {result && (
          <div className="p-5 sm:p-6 rounded-2xl bg-stone-50 border border-stone-200/80 text-left space-y-3 text-xs">
            <div className="flex justify-between items-center border-b border-stone-200/60 pb-2">
              <span className="text-stone-500">Mã đơn hàng:</span>
              <span className="font-mono font-bold text-brand-700 text-sm">{result.orderCode || 'N/A'}</span>
            </div>

            {result.transactionNo && (
              <div className="flex justify-between items-center border-b border-stone-200/60 pb-2">
                <span className="text-stone-500">Mã giao dịch VNPAY:</span>
                <span className="font-mono font-semibold text-stone-800">{result.transactionNo}</span>
              </div>
            )}

            {result.bankCode && (
              <div className="flex justify-between items-center border-b border-stone-200/60 pb-2">
                <span className="text-stone-500">Ngân hàng / Cổng:</span>
                <span className="font-bold text-stone-800 uppercase px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                  {result.bankCode}
                </span>
              </div>
            )}

            <div className="flex justify-between items-center border-b border-stone-200/60 pb-2">
              <span className="text-stone-500">Hình thức thanh toán:</span>
              <span className="font-semibold text-stone-800 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-brand-600" /> Cổng thanh toán VNPAY Sandbox
              </span>
            </div>

            <div className="flex justify-between items-center pt-1 text-sm">
              <span className="font-bold text-stone-900">Số tiền thanh toán:</span>
              <span className="font-bold text-brand-700 font-mono text-base sm:text-lg">
                {formatPrice(result.amount)}
              </span>
            </div>

            <div className="flex justify-between items-center pt-1 text-[11px] text-stone-500">
              <span>Trạng thái:</span>
              <span className={`font-bold px-2 py-0.5 rounded-full ${
                isSuccess ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
              }`}>
                {isSuccess ? 'Đã Thanh Toán & Đang Xử Lý' : 'Chưa Thanh Toán'}
              </span>
            </div>
          </div>
        )}

        {/* Security badge */}
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-stone-400">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Giao dịch được bảo mật và mã hóa 256-bit theo chuẩn VNPAY 2.1.0</span>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
          {isSuccess ? (
            <>
              <button
                onClick={() => navigate('/orders')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-md transition"
              >
                <span>Xem lịch sử đơn hàng</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => navigate('/products')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs px-6 py-3 rounded-xl transition"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Tiếp tục mua sắm</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => navigate('/checkout')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-md transition"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Thử đặt hàng lại</span>
              </button>
              <button
                onClick={() => navigate('/cart')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs px-6 py-3 rounded-xl transition"
              >
                <span>Kiểm tra giỏ hàng</span>
              </button>
            </>
          )}
        </div>

      </div>
    </div>
  );
};

export default VNPayCallback;
