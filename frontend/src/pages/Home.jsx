import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, ShieldCheck, Truck, Clock, Compass, Armchair, ChevronRight } from 'lucide-react';
import api from '../api/client';
import ProductCard from '../components/ProductCard';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          api.get('/products/featured'),
          api.get('/categories'),
        ]);
        if (prodRes.success) setFeaturedProducts(prodRes.data || []);
        if (catRes.success) setCategories(catRes.data || []);
      } catch (err) {
        console.error('Error fetching homepage data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-20 pb-20">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-stone-900 via-stone-900 to-stone-950 text-white py-24 sm:py-32">
        {/* Background Overlay */}
        <div className="absolute inset-0 opacity-40 mix-blend-overlay">
          <img
            src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1920&q=80"
            alt="Hero Background"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-500/20 border border-brand-400/30 text-amber-300 text-xs font-semibold uppercase tracking-wider backdrop-blur">
              <Sparkles className="w-3.5 h-3.5" />
              Đẳng cấp không gian sống thời thượng
            </div>

            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight font-serif">
              Nội Thất Tinh Tế, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-brand-400">
                Tư Vấn Thông Minh
              </span>
            </h1>

            <p className="text-base sm:text-lg text-stone-300 leading-relaxed font-light">
              Khám phá bộ sưu tập sofa da Ý, bàn ăn gỗ óc chó nguyên khối và giường ngủ phong cách Bắc Âu. Trải nghiệm trợ lý ảo <strong>Phú Quý AI</strong> tư vấn theo kích thước và phong cách phòng khách của bạn trong vài giây.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-4">
              <Link
                to="/products"
                className="bg-brand-600 hover:bg-brand-500 text-white font-semibold px-7 py-3.5 rounded-xl shadow-lg hover:shadow-brand-500/30 transition flex items-center gap-2 text-sm"
              >
                Khám phá bộ sưu tập <ArrowRight className="w-4 h-4" />
              </Link>
              <button
                onClick={() => {
                  const event = new CustomEvent('open-ai-chat');
                  window.dispatchEvent(event);
                }}
                className="bg-white/10 hover:bg-white/20 text-white font-semibold px-6 py-3.5 rounded-xl backdrop-blur border border-white/20 transition flex items-center gap-2 text-sm"
              >
                <Sparkles className="w-4 h-4 text-amber-300" /> Hỏi Phú Quý AI
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Categories Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-10">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-brand-600 block mb-1">
              Phân loại danh mục
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-serif">
              Không Gian Sống Đỉnh Cao
            </h2>
          </div>
          <Link
            to="/products"
            className="text-xs sm:text-sm font-semibold text-brand-700 hover:text-brand-800 flex items-center gap-1 group"
          >
            Xem tất cả <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/products?categoryId=${cat.id}`}
              className="group relative rounded-2xl overflow-hidden aspect-[4/5] bg-stone-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-end p-5"
            >
              <img
                src={cat.imageUrl || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80'}
                alt={cat.name}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-950/20 to-transparent" />
              <div className="relative z-10 text-white">
                <h3 className="font-bold text-sm sm:text-base leading-tight mb-1 group-hover:text-amber-300 transition">
                  {cat.name}
                </h3>
                <span className="text-[11px] text-stone-300 font-medium">Xem bộ sưu tập →</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. Interactive 3D Room Studio Showcase Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-b from-stone-900 via-stone-900 to-stone-950 rounded-3xl p-8 sm:p-12 border border-stone-800 shadow-2xl space-y-8 text-white">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold uppercase tracking-wider mb-2 border border-amber-500/30">
                <Sparkles className="w-3.5 h-3.5" /> Tính năng độc bản cho đồ án tốt nghiệp
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold font-serif text-amber-100">
                Studio Kiến Trúc & Không Gian 3D AI
              </h2>
              <p className="text-stone-300 text-xs sm:text-sm max-w-2xl mt-1.5 leading-relaxed">
                Tự động bố trí sofa, bàn trà, giường ngủ, bàn làm việc vào đúng tọa độ phòng theo chuẩn công thái học. Cho phép xoay 360°, đổi chế độ chiếu sáng ban ngày/ban đêm và thay đổi sơn tường theo ý muốn.
              </p>
            </div>
            <Link
              to="/phong-3d"
              className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 font-extrabold text-xs sm:text-sm rounded-2xl shadow-lg transition flex items-center gap-2 self-start md:self-auto flex-shrink-0"
            >
              <span>🏛️ Vào Phòng 3D Ngay</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                id: 'living',
                type: 'LIVING_ROOM',
                name: 'Phòng Khách Đẳng Cấp',
                desc: 'Sofa góc da Ý, bàn trà ceramic, kệ tivi',
                img: '/images/concepts/living_room.jpg',
                badge: '6 Món Nội Thất',
              },
              {
                id: 'bedroom',
                type: 'BEDROOM',
                name: 'Phòng Ngủ Master',
                desc: 'Giường nệm nỉ, tủ kính LED Lumina',
                img: '/images/concepts/bedroom.jpg',
                badge: '5 Món Nội Thất',
              },
              {
                id: 'dining',
                type: 'DINING_ROOM',
                name: 'Phòng Ăn & Bếp',
                desc: 'Bàn ăn 6 ghế gỗ óc chó Royal FAS',
                img: '/images/concepts/dining_room.jpg',
                badge: '4 Món Nội Thất',
              },
              {
                id: 'office',
                type: 'HOME_OFFICE',
                name: 'Phòng Làm Việc',
                desc: 'Bàn nâng hạ SmartDesk, ghế Ergonomic',
                img: '/images/concepts/home_office.jpg',
                badge: '5 Món Nội Thất',
              },
            ].map((room) => (
              <Link
                key={room.id}
                to={`/phong-3d?room=${room.type}`}
                className="group relative rounded-2xl overflow-hidden aspect-[4/3] bg-stone-800 border border-stone-700/60 shadow-md hover:border-amber-500/50 hover:shadow-2xl transition duration-500 flex flex-col justify-end p-4"
              >
                <img
                  src={room.img}
                  alt={room.name}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-950/30 to-transparent" />
                <span className="absolute top-3 left-3 bg-stone-950/80 backdrop-blur-md text-amber-300 text-[10px] font-bold px-2.5 py-0.5 rounded-lg border border-amber-500/30">
                  {room.badge}
                </span>
                <div className="relative z-10 space-y-0.5">
                  <h3 className="font-bold text-sm text-white group-hover:text-amber-300 transition">
                    {room.name}
                  </h3>
                  <p className="text-[11px] text-stone-300 line-clamp-1">
                    {room.desc}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Featured Products Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-10">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-brand-600 block mb-1">
              Tuyển chọn độc bản
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-serif">
              Sản Phẩm Bán Chạy & Nổi Bật
            </h2>
          </div>
          <Link
            to="/products"
            className="text-xs sm:text-sm font-semibold text-brand-700 hover:text-brand-800 flex items-center gap-1 group"
          >
            Tất cả sản phẩm <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-80 bg-stone-200 animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.slice(0, 8).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* 4. RAG AI Chatbot Highlight Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-br from-stone-900 via-brand-950 to-stone-950 text-white p-8 sm:p-14 relative overflow-hidden shadow-2xl border border-stone-800">
          <div className="relative z-10 max-w-xl space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 text-amber-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" /> Trợ Lý Ảo Đột Phá Với Groq LLM & RAG
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-serif leading-tight">
              Không Chắc Chọn Mẫu Nào? <br />
              Hãy Để AI Giúp Bạn Lựa Chọn.
            </h2>
            <p className="text-stone-300 text-sm leading-relaxed">
              Bạn chỉ cần mô tả: *"Tôi cần sofa góc da cho phòng khách rộng 25m2, tài chính 25 triệu"* - Phú Quý AI sẽ tra cứu kích thước, chất liệu và báo giá chính xác theo kho hàng thực tế của chúng tôi.
            </p>
            <div className="pt-2">
              <button
                onClick={() => {
                  const btn = document.querySelector('.ai-glow-btn');
                  if (btn) btn.click();
                }}
                className="bg-gradient-to-r from-amber-500 to-brand-500 hover:from-amber-400 hover:to-brand-400 text-stone-950 font-bold px-6 py-3 rounded-xl shadow-lg transition text-sm flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" /> Trò chuyện với Trợ lý AI ngay
              </button>
            </div>
          </div>

          <div className="hidden lg:block absolute -right-10 -bottom-10 w-96 h-96 opacity-20 pointer-events-none">
            <Armchair className="w-full h-full text-brand-400" />
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
