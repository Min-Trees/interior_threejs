import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Armchair, Mail, Lock, ArrowRight, Shield, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      if (user.role === 'ROLE_ADMIN') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-3xl border border-stone-200 shadow-xl p-8 space-y-6">
        {/* Brand */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-brand-600 text-white flex items-center justify-center mx-auto shadow-md">
            <Armchair className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-extrabold text-stone-900 font-serif">Đăng Nhập Phú Quý</h1>
          <p className="text-xs text-stone-500">Đăng nhập để theo dõi đơn hàng và lưu giỏ hàng của bạn</p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-stone-700 block mb-1">Email</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tenban@gmail.com"
                className="w-full text-xs pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
              <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-stone-700 block mb-1">Mật khẩu</label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-xs pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
              <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-6 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2"
          >
            {loading ? 'Đang xác thực...' : 'Đăng Nhập'} <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Demo Credentials */}
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/80 space-y-2">
          <p className="text-[11px] font-bold uppercase tracking-wider text-amber-900">
            ⚡ Tài khoản Demo mẫu (Bấm để điền nhanh):
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('admin@phuquy.com', 'admin123')}
              className="flex-1 py-1.5 px-2.5 rounded-lg bg-amber-200/70 hover:bg-amber-300 text-amber-950 text-[11px] font-semibold flex items-center justify-center gap-1.5 transition"
            >
              <Shield className="w-3.5 h-3.5" /> Quản Trị Viên (Admin)
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('khachhang@gmail.com', 'customer123')}
              className="flex-1 py-1.5 px-2.5 rounded-lg bg-white border border-amber-300 hover:bg-amber-100 text-amber-950 text-[11px] font-semibold flex items-center justify-center gap-1.5 transition"
            >
              <User className="w-3.5 h-3.5" /> Khách Hàng Mẫu
            </button>
          </div>
        </div>

        <div className="text-center text-xs text-stone-500">
          Chưa có tài khoản?{' '}
          <Link to="/register" className="font-bold text-brand-600 hover:underline">
            Đăng ký tài khoản mới
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
