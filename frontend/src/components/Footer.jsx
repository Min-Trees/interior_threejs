import React from 'react';
import { Armchair, Phone, Mail, MapPin, Award, Truck, ShieldCheck, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-stone-900 text-stone-300 pt-16 pb-12 border-t border-stone-800">
      {/* Policy Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-6 rounded-2xl bg-stone-800/60 border border-stone-700/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-brand-500/10 text-brand-400 flex items-center justify-center flex-shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm">Giao Hàng Toàn Quốc</h4>
              <p className="text-xs text-stone-400">Miễn phí lắp đặt nội thành</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-brand-500/10 text-brand-400 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm">Bảo Hành 36 Tháng</h4>
              <p className="text-xs text-stone-400">Bảo trì trọn đời sản phẩm</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-brand-500/10 text-brand-400 flex items-center justify-center flex-shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm">100% Chất Liệu Thật</h4>
              <p className="text-xs text-stone-400">Gỗ tự nhiên & da Ý cao cấp</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-brand-500/10 text-brand-400 flex items-center justify-center flex-shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm">Tư Vấn AI 24/7</h4>
              <p className="text-xs text-stone-400">Giải đáp & gợi ý tức thì</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-10">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-lg bg-brand-500 text-white flex items-center justify-center">
              <Armchair className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold tracking-wider text-white font-serif">PHÚ QUÝ</span>
          </div>
          <p className="text-xs text-stone-400 leading-relaxed mb-4">
            Showroom nội thất cao cấp Phú Quý - Nâng tầm không gian sống gia đình bạn với các thiết kế độc bản, sang trọng và chuẩn công thái học.
          </p>
          <div className="space-y-2 text-xs text-stone-400">
            <p className="flex items-center gap-2"><MapPin className="w-4 h-4 text-brand-400 flex-shrink-0" /> 88 Xa Lộ Hà Nội, TP. Thủ Đức, TP. HCM</p>
            <p className="flex items-center gap-2"><Phone className="w-4 h-4 text-brand-400 flex-shrink-0" /> Hotline: 1900 6868 - 0909 123 456</p>
            <p className="flex items-center gap-2"><Mail className="w-4 h-4 text-brand-400 flex-shrink-0" /> contact@noithatphuquy.vn</p>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 font-serif">Danh Mục Sản Phẩm</h4>
          <ul className="space-y-2.5 text-xs text-stone-400">
            <li><Link to="/products?categoryId=1" className="hover:text-brand-400 transition">Sofa Da Bò & Sofa Vải Nỉ</Link></li>
            <li><Link to="/products?categoryId=2" className="hover:text-brand-400 transition">Bàn Ăn Gỗ Óc Chó & Mặt Đá</Link></li>
            <li><Link to="/products?categoryId=3" className="hover:text-brand-400 transition">Giường Ngủ Phong Cách Bắc Âu</Link></li>
            <li><Link to="/products?categoryId=4" className="hover:text-brand-400 transition">Tủ Áo Cánh Kính Cường Lực</Link></li>
            <li><Link to="/products?categoryId=5" className="hover:text-brand-400 transition">Bàn Ghế Làm Việc Ergonomic</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 font-serif">Chính Sách & Dịch Vụ</h4>
          <ul className="space-y-2.5 text-xs text-stone-400">
            <li><a href="#" className="hover:text-brand-400 transition">Chính sách bảo hành 3 năm</a></li>
            <li><a href="#" className="hover:text-brand-400 transition">Chính sách vận chuyển & lắp đặt</a></li>
            <li><a href="#" className="hover:text-brand-400 transition">Hướng dẫn bảo quản đồ gỗ & da</a></li>
            <li><a href="#" className="hover:text-brand-400 transition">Chính sách đổi trả trong 7 ngày</a></li>
            <li><a href="#" className="hover:text-brand-400 transition">Dự án thiết kế & thi công trọn gói</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 font-serif">Tư Vấn AI Thông Minh</h4>
          <p className="text-xs text-stone-400 leading-relaxed mb-4">
            Trợ lý AI Phú Quý tích hợp công nghệ RAG và mô hình ngôn ngữ lớn Groq LLM giúp bạn tìm kiếm nội thất theo kích thước phòng, ngân sách và sở thích chỉ trong tích tắc.
          </p>
          <div className="p-3.5 rounded-xl bg-brand-950/60 border border-brand-800/40 text-xs">
            <span className="text-brand-300 font-semibold block mb-1">🤖 Thử ngay hôm nay:</span>
            <span className="text-stone-300">Bấm vào biểu tượng Chatbot ở góc phải màn hình để bắt đầu trò chuyện!</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-6 border-t border-stone-800 text-center text-xs text-stone-500">
        © 2026 Nội Thất Phú Quý. Đồ Án Tốt Nghiệp: E-Commerce Nội Thất Tích Hợp Chatbot RAG & Groq LLM.
      </div>
    </footer>
  );
};

export default Footer;
