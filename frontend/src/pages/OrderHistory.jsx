import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, Clock, Truck, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

const formatPrice = (amount) => {
  if (!amount) return '0 đ';
  return new Intl.NumberFormat('vi-VN').format(amount) + ' đ';
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const STATUS_MAP = {
  PENDING: { label: 'Chờ xác nhận', color: 'bg-amber-100 text-amber-800 border-amber-200', icon: Clock },
  CONFIRMED: { label: 'Đã xác nhận', color: 'bg-blue-100 text-blue-800 border-blue-200', icon: CheckCircle2 },
  SHIPPING: { label: 'Đang giao hàng', color: 'bg-purple-100 text-purple-800 border-purple-200', icon: Truck },
  COMPLETED: { label: 'Đã hoàn thành', color: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: CheckCircle2 },
  CANCELLED: { label: 'Đã hủy', color: 'bg-rose-100 text-rose-800 border-rose-200', icon: XCircle },
};

const OrderHistory = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get('/orders/my-orders');
        if (res.success && res.data) {
          setOrders(res.data);
        }
      } catch (err) {
        console.error('Error fetching orders:', err);
      } finally {
        setLoading(false);
      }
    };
    if (user) {
      fetchOrders();
    }
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-stone-900 mb-2">Vui lòng đăng nhập</h2>
        <Link to="/login" className="text-brand-600 font-semibold text-sm hover:underline">
          Đăng nhập để xem lịch sử đơn hàng →
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between pb-6 border-b border-stone-200 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-serif">
            Lịch Sử Đơn Hàng
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Theo dõi tiến độ vận chuyển và bảo hành các sản phẩm bạn đã đặt
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-stone-200 p-8">
          <div className="w-16 h-16 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-stone-900 mb-1">Chưa có đơn hàng nào</h3>
          <p className="text-xs text-stone-500 mb-6">
            Bạn chưa đặt mua sản phẩm nào từ Nội thất Phú Quý.
          </p>
          <Link
            to="/products"
            className="bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold px-6 py-3 rounded-xl transition shadow"
          >
            Mua sắm ngay
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const statusConfig = STATUS_MAP[order.status] || STATUS_MAP.PENDING;
            const StatusIcon = statusConfig.icon;

            return (
              <div
                key={order.id}
                className="bg-white rounded-3xl border border-stone-200/80 shadow-sm overflow-hidden"
              >
                {/* Order Header */}
                <div className="p-5 bg-stone-50/70 border-b border-stone-100 flex flex-wrap items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-sm text-stone-900">
                        {order.orderCode}
                      </span>
                      <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${statusConfig.color}`}>
                        <StatusIcon className="w-3 h-3" />
                        {statusConfig.label}
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-400">
                      Ngày đặt: {formatDate(order.createdAt)}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-[11px] text-stone-500 block">Tổng tiền:</span>
                    <span className="text-base font-extrabold text-brand-700 font-mono">
                      {formatPrice(order.totalAmount)}
                    </span>
                  </div>
                </div>

                {/* Items */}
                <div className="p-5 divide-y divide-stone-100">
                  {order.items.map((item) => (
                    <div key={item.id} className="py-3 first:pt-0 last:pb-0 flex items-center gap-4">
                      <img
                        src={item.productThumbnail || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=200&q=80'}
                        alt={item.productName}
                        className="w-14 h-14 rounded-xl object-cover bg-stone-100 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-xs sm:text-sm text-stone-900 truncate">
                          {item.productName}
                        </h4>
                        <p className="text-[11px] text-stone-500">
                          {formatPrice(item.unitPrice)} x {item.quantity}
                        </p>
                      </div>
                      <div className="font-bold text-xs sm:text-sm text-stone-900 font-mono text-right">
                        {formatPrice(item.totalPrice)}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer details */}
                <div className="p-4 bg-stone-50/50 border-t border-stone-100 text-xs text-stone-600 flex flex-wrap justify-between gap-2">
                  <div>
                    <span>Giao đến: </span>
                    <span className="font-medium text-stone-800">{order.recipientName} - {order.recipientPhone} ({order.shippingAddress})</span>
                  </div>
                  <div>
                    <span>Thanh toán: </span>
                    <span className="font-semibold text-stone-800">
                      {order.paymentMethod === 'COD' ? 'Tiền mặt khi nhận hàng (COD)' : 'Chuyển khoản'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
