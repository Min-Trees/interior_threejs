import React, { useState, useEffect } from 'react';

const VietQRCodeModal = ({ isOpen, onClose, order, onPaymentConfirmed }) => {
  const [copiedField, setCopiedField] = useState(null);
  const [timeLeft, setTimeLeft] = useState(900); // 15 phút

  useEffect(() => {
    if (!isOpen) return;
    setTimeLeft(900);
    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen || !order) return null;

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const copyToClipboard = (text, fieldName) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const bankName = 'MBBank (Ngân hàng Quân Đội)';
  const accountNumber = '0909123456';
  const accountHolder = 'CONG TY CP NOI THAT PHU QUY';
  const orderAmount = order.totalAmount || 0;
  const orderCode = order.orderCode || 'PQ-ORDER';

  const qrUrl = `https://img.vietqr.io/image/MB-${accountNumber}-compact2.png?amount=${Math.round(orderAmount)}&addInfo=${orderCode}&accountName=${encodeURIComponent(accountHolder)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="bg-stone-900 border border-amber-600/40 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl text-stone-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-900/80 via-stone-900 to-amber-900/80 p-5 border-b border-amber-600/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-xl">
              🏦
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-amber-200">Thanh Toán VietQR Tự Động</h3>
              <p className="text-xs text-stone-400">Quét mã QR bằng bất kỳ ứng dụng ngân hàng nào</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-800 hover:bg-stone-700 flex items-center justify-center text-stone-400 hover:text-white transition"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Countdown badge */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs">
            <span className="text-stone-300 flex items-center gap-1.5">
              ⏳ Mã thanh toán hết hạn sau:
            </span>
            <span className="font-mono font-bold text-amber-400 text-sm">
              {formatTime(timeLeft)}
            </span>
          </div>

          {/* QR Code image */}
          <div className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl shadow-inner border border-stone-300">
            <img
              src={qrUrl}
              alt="VietQR Code"
              className="w-64 h-64 object-contain"
              onError={(e) => {
                e.target.src = 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=' + encodeURIComponent(`2|99|0909123456|${accountHolder}|${Math.round(orderAmount)}|${orderCode}`);
              }}
            />
            <p className="text-[11px] text-stone-600 font-medium mt-1">
              Chuẩn Napas247 • Tự động điền số tiền & nội dung
            </p>
          </div>

          {/* Banking Details */}
          <div className="space-y-2.5 bg-stone-800/60 p-4 rounded-2xl border border-stone-700/60 text-xs">
            <div className="flex items-center justify-between py-1 border-b border-stone-700/50">
              <span className="text-stone-400">Ngân hàng:</span>
              <span className="font-semibold text-stone-200">{bankName}</span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-stone-700/50">
              <span className="text-stone-400">Số tài khoản:</span>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-amber-400 text-sm">{accountNumber}</span>
                <button
                  onClick={() => copyToClipboard(accountNumber, 'account')}
                  className="px-2 py-0.5 bg-stone-700 hover:bg-stone-600 text-stone-200 rounded text-[10px] font-medium transition"
                >
                  {copiedField === 'account' ? '✓ Đã chép' : 'Sao chép'}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-stone-700/50">
              <span className="text-stone-400">Chủ tài khoản:</span>
              <span className="font-semibold text-stone-200 uppercase">{accountHolder}</span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-stone-700/50">
              <span className="text-stone-400">Số tiền:</span>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-amber-300 text-sm">
                  {orderAmount.toLocaleString('vi-VN')} đ
                </span>
                <button
                  onClick={() => copyToClipboard(orderAmount.toString(), 'amount')}
                  className="px-2 py-0.5 bg-stone-700 hover:bg-stone-600 text-stone-200 rounded text-[10px] font-medium transition"
                >
                  {copiedField === 'amount' ? '✓ Đã chép' : 'Sao chép'}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between py-1">
              <span className="text-stone-400">Nội dung chuyển khoản:</span>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-red-400 text-sm">{orderCode}</span>
                <button
                  onClick={() => copyToClipboard(orderCode, 'code')}
                  className="px-2 py-0.5 bg-stone-700 hover:bg-stone-600 text-stone-200 rounded text-[10px] font-medium transition"
                >
                  {copiedField === 'code' ? '✓ Đã chép' : 'Sao chép'}
                </button>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-stone-400 italic text-center">
            * Hệ thống sẽ tự động cập nhật trạng thái đơn hàng sau 1–3 phút kể từ khi nhận được tiền.
          </p>
        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-900 border-t border-stone-800 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl text-xs font-semibold transition"
          >
            Đóng
          </button>
          <button
            onClick={onPaymentConfirmed}
            className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-amber-950 font-bold rounded-xl text-xs shadow-lg transition flex items-center gap-1.5"
          >
            <span>✓ Tôi đã hoàn tất chuyển khoản</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default VietQRCodeModal;
