import React, { useEffect, useState } from 'react';
import { Calendar, Phone, Clock, User, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';
import api from '../../api/client';

const STATUS_MAP = {
  PENDING: { label: 'Chờ xác nhận', color: 'bg-amber-100 text-amber-800' },
  CONFIRMED: { label: 'Đã xác nhận hẹn', color: 'bg-blue-100 text-blue-800' },
  COMPLETED: { label: 'Đã tiếp đón', color: 'bg-emerald-100 text-emerald-800' },
  CANCELLED: { label: 'Khách hủy hẹn', color: 'bg-rose-100 text-rose-800' },
};

const AppointmentManage = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const res = await api.get('/appointments/admin/all');
      if (res.success && res.data) {
        setAppointments(res.data.content || []);
      }
    } catch (err) {
      console.error('Error fetching appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.put(`/appointments/admin/${id}/status?status=${newStatus}`);
      alert('Đã cập nhật trạng thái lịch hẹn!');
      fetchAppointments();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-stone-900 font-serif">Lịch Hẹn Xem Showroom</h1>
          <p className="text-xs text-stone-500 mt-1">
            Khách hàng đặt hẹn trải nghiệm thực tế sofa & nội thất tại Showroom Phú Quý
          </p>
        </div>
        <button
          onClick={fetchAppointments}
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
        ) : appointments.length === 0 ? (
          <p className="text-xs text-stone-500 py-12 text-center">Chưa có lịch hẹn nào từ khách hàng.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="text-[11px] text-stone-400 uppercase bg-stone-50 border-b border-stone-100">
                <tr>
                  <th className="px-4 py-3">Khách hàng</th>
                  <th className="px-4 py-3">Số điện thoại</th>
                  <th className="px-4 py-3">Ngày & Khung giờ hẹn</th>
                  <th className="px-4 py-3">Sản phẩm quan tâm</th>
                  <th className="px-4 py-3">Ghi chú</th>
                  <th className="px-4 py-3">Trạng thái xử lý</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-medium">
                {appointments.map((a) => (
                  <tr key={a.id} className="hover:bg-stone-50/60 transition">
                    <td className="px-4 py-3 font-bold text-stone-900">{a.customerName}</td>
                    <td className="px-4 py-3 font-mono text-brand-700 font-semibold">{a.phone}</td>
                    <td className="px-4 py-3 text-stone-800">
                      <div>{a.appointmentDate}</div>
                      <div className="text-[10px] text-stone-500">{a.appointmentTime}</div>
                    </td>
                    <td className="px-4 py-3 text-stone-700">
                      {a.productName ? (
                        <div className="flex items-center gap-2">
                          <img src={a.productThumbnail} alt="" className="w-8 h-8 rounded object-cover" />
                          <span className="truncate max-w-[140px]">{a.productName}</span>
                        </div>
                      ) : (
                        <span className="text-stone-400 italic">Tham quan chung</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-stone-500 max-w-xs truncate">{a.note || '-'}</td>
                    <td className="px-4 py-3">
                      <select
                        value={a.status}
                        onChange={(e) => handleStatusChange(a.id, e.target.value)}
                        className="text-xs font-bold px-2.5 py-1 rounded-lg border border-stone-200 bg-stone-50 focus:outline-none"
                      >
                        {Object.entries(STATUS_MAP).map(([val, item]) => (
                          <option key={val} value={val}>
                            {item.label}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentManage;
