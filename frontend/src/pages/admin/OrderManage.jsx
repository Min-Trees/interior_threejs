import React, { useEffect, useState } from 'react';
import { Eye, CheckCircle2, Clock, Truck, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import api from '../../api/client';

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

const ORDER_STATUSES = [
  { value: 'PENDING', label: 'Chờ xác nhận', color: 'bg-amber-100 text-amber-800' },
  { value: 'CONFIRMED', label: 'Đã xác nhận', color: 'bg-blue-100 text-blue-800' },
  { value: 'SHIPPING', label: 'Đang giao hàng', color: 'bg-purple-100 text-purple-800' },
  { value: 'COMPLETED', label: 'Đã hoàn thành', color: 'bg-emerald-100 text-emerald-800' },
  { value: 'CANCELLED', label: 'Đã hủy', color: 'bg-rose-100 text-rose-800' },
];

const OrderManage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get('/orders/admin/all?size=50');
      if (res.success && res.data) {
        setOrders(res.data.content || []);
      }
    } catch (err) {
      console.error('Error fetching admin orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await api.put(`/orders/admin/${orderId}/status`, { status: newStatus });
      alert('Đã cập nhật trạng thái đơn hàng!');
      fetchOrders();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-stone-900 font-serif">Quản Lý Đơn Hàng</h1>
          <p className="text-xs text-stone-500 mt-1">
            Xác nhận đơn, theo dõi giao hàng và cập nhật trạng thái
          </p>
        </div>
        <button
          onClick={fetchOrders}
          className="p-2 text-stone-500 hover:text-stone-900 rounded-xl hover:bg-white border border-stone-200 transition"
          title="Làm mới"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-stone-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : orders.length === 0 ? (
          <p className="text-xs text-stone-500 py-12 text-center">Chưa có đơn hàng nào.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="text-[11px] text-stone-400 uppercase bg-stone-50 border-b border-stone-100">
                <tr>
                  <th className="px-4 py-3">Mã đơn</th>
                  <th className="px-4 py-3">Người nhận</th>
                  <th className="px-4 py-3">Ngày đặt</th>
                  <th className="px-4 py-3">Tổng tiền</th>
                  <th className="px-4 py-3">Thanh toán</th>
                  <th className="px-4 py-3">Trạng thái xử lý</th>
                  <th className="px-4 py-3 text-right">Chi tiết</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-medium">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-stone-50/60 transition">
                    <td className="px-4 py-3 font-mono font-bold text-stone-900">{order.orderCode}</td>
                    <td className="px-4 py-3">
                      <div className="font-bold text-stone-900">{order.recipientName}</div>
                      <div className="text-[10px] text-stone-400">{order.recipientPhone}</div>
                    </td>
                    <td className="px-4 py-3 text-stone-500">{formatDate(order.createdAt)}</td>
                    <td className="px-4 py-3 font-mono font-bold text-brand-700">
                      {formatPrice(order.totalAmount)}
                    </td>
                    <td className="px-4 py-3 text-stone-600">
                      <span className="font-semibold">{order.paymentMethod}</span>
                      <div className="text-[10px] text-stone-400">{order.paymentStatus}</div>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className="text-xs font-bold px-2.5 py-1 rounded-lg border border-stone-200 bg-stone-50 focus:outline-none"
                      >
                        {ORDER_STATUSES.map((st) => (
                          <option key={st.value} value={st.value}>
                            {st.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="p-1.5 text-stone-500 hover:text-brand-600 rounded-lg hover:bg-stone-100"
                        title="Xem chi tiết đơn"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3">
              <h2 className="text-base font-bold text-stone-900 font-serif">
                Chi Tiết Đơn Hàng: <span className="font-mono text-brand-700">{selectedOrder.orderCode}</span>
              </h2>
              <button onClick={() => setSelectedOrder(null)} className="text-stone-400 hover:text-stone-700">
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-stone-50 rounded-xl space-y-1">
                <p><strong>Người nhận:</strong> {selectedOrder.recipientName} ({selectedOrder.recipientPhone})</p>
                <p><strong>Địa chỉ:</strong> {selectedOrder.shippingAddress}</p>
                {selectedOrder.note && <p><strong>Ghi chú:</strong> {selectedOrder.note}</p>}
              </div>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {selectedOrder.items?.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 p-2 bg-stone-50 rounded-xl">
                    <img src={item.productThumbnail} alt="" className="w-12 h-12 rounded-lg object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold truncate">{item.productName}</p>
                      <p className="text-[11px] text-stone-500">{formatPrice(item.unitPrice)} x {item.quantity}</p>
                    </div>
                    <div className="font-bold font-mono">{formatPrice(item.totalPrice)}</div>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t flex justify-between text-sm font-bold">
                <span>Tổng tiền thanh toán:</span>
                <span className="text-brand-700 font-mono">{formatPrice(selectedOrder.totalAmount)}</span>
              </div>
            </div>

            <div className="flex justify-end pt-3">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 font-bold text-xs"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManage;
