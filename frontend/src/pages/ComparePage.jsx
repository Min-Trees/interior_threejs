import React from 'react';
import { Link } from 'react-router-dom';
import { useCompare } from '../context/CompareContext';
import { useCart } from '../context/CartContext';

const ComparePage = () => {
  const { compareList, compareCount, removeFromCompare, clearCompare } = useCompare();
  const { addToCart } = useCart();

  if (compareCount === 0) {
    return (
      <div className="min-h-screen bg-stone-900 text-stone-100 py-16 px-4">
        <div className="max-w-2xl mx-auto text-center py-20 bg-stone-800/40 rounded-3xl border border-stone-800 p-8 space-y-4">
          <div className="text-6xl">⚖️</div>
          <h2 className="font-serif text-2xl font-bold text-stone-200">
            Chưa có sản phẩm nào trong danh sách so sánh
          </h2>
          <p className="text-sm text-stone-400">
            Bạn có thể chọn tối đa 4 sản phẩm bất kỳ trên trang sản phẩm để đối chiếu thông số và mức giá cạnh nhau.
          </p>
          <div className="pt-4">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-amber-950 font-bold rounded-xl text-sm transition shadow-lg"
            >
              <span>Xem danh sách sản phẩm</span>
              <span>→</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-900 text-stone-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-800 pb-6">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-3xl">⚖️</span>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-amber-200">
                Bảng So Sánh Chi Tiết Sản Phẩm
              </h1>
            </div>
            <p className="text-sm text-stone-400 mt-1">
              Đang đối chiếu thông số và bảng giá của <span className="text-amber-400 font-bold">{compareCount}</span> mẫu nội thất
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={clearCompare}
              className="px-4 py-2 border border-stone-700 hover:border-red-500/50 hover:bg-red-500/10 text-stone-300 hover:text-red-400 rounded-xl text-xs font-semibold transition"
            >
              Xóa tất cả
            </button>
            <Link
              to="/products"
              className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-xl text-xs font-semibold transition"
            >
              + Thêm sản phẩm khác
            </Link>
          </div>
        </div>

        {/* Comparison Matrix Table */}
        <div className="overflow-x-auto bg-stone-800/40 rounded-3xl border border-stone-800 p-6 shadow-xl">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-stone-700/60">
                <th className="py-4 px-4 w-44 text-xs uppercase tracking-wider text-amber-400 font-bold">
                  Sản phẩm
                </th>
                {compareList.map((product) => (
                  <th key={product.id} className="py-4 px-4 align-top w-64">
                    <div className="relative group flex flex-col items-center text-center space-y-3">
                      <button
                        onClick={() => removeFromCompare(product.id)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-stone-700 hover:bg-red-600 text-stone-300 hover:text-white rounded-full flex items-center justify-center text-xs shadow transition"
                        title="Xóa sản phẩm"
                      >
                        ✕
                      </button>
                      <img
                        src={product.thumbnail}
                        alt={product.name}
                        className="w-40 h-32 object-cover rounded-2xl border border-stone-700 shadow-md bg-stone-800"
                      />
                      <Link
                        to={`/products/${product.slug || product.id}`}
                        className="font-serif font-bold text-sm text-stone-200 hover:text-amber-300 line-clamp-2 transition"
                      >
                        {product.name}
                      </Link>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800/80 text-xs sm:text-sm">
              {/* Mức giá */}
              <tr>
                <td className="py-4 px-4 font-semibold text-stone-400 bg-stone-900/30">
                  Giá bán ưu đãi
                </td>
                {compareList.map((p) => {
                  const finalPrice = p.discountPrice || p.price;
                  return (
                    <td key={p.id} className="py-4 px-4 font-mono font-bold text-amber-400 text-base">
                      {finalPrice ? finalPrice.toLocaleString('vi-VN') + ' đ' : 'Liên hệ'}
                      {p.discountPrice && p.price && (
                        <div className="text-xs text-stone-500 line-through font-normal">
                          {p.price.toLocaleString('vi-VN')} đ
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>

              {/* Danh mục */}
              <tr>
                <td className="py-4 px-4 font-semibold text-stone-400 bg-stone-900/30">
                  Danh mục
                </td>
                {compareList.map((p) => (
                  <td key={p.id} className="py-4 px-4 text-stone-300">
                    <span className="px-2.5 py-1 rounded-full bg-stone-700/60 text-xs text-amber-200 font-medium">
                      {p.category?.name || 'Nội thất cao cấp'}
                    </span>
                  </td>
                ))}
              </tr>

              {/* Kích thước */}
              <tr>
                <td className="py-4 px-4 font-semibold text-stone-400 bg-stone-900/30">
                  Kích thước (DxRxC)
                </td>
                {compareList.map((p) => (
                  <td key={p.id} className="py-4 px-4 text-stone-200 font-medium">
                    {p.dimensions || 'Theo tiêu chuẩn châu Âu'}
                  </td>
                ))}
              </tr>

              {/* Chất liệu */}
              <tr>
                <td className="py-4 px-4 font-semibold text-stone-400 bg-stone-900/30">
                  Chất liệu
                </td>
                {compareList.map((p) => (
                  <td key={p.id} className="py-4 px-4 text-stone-300">
                    {p.material || 'Gỗ tự nhiên / Da thật cao cấp'}
                  </td>
                ))}
              </tr>

              {/* Màu sắc */}
              <tr>
                <td className="py-4 px-4 font-semibold text-stone-400 bg-stone-900/30">
                  Màu sắc
                </td>
                {compareList.map((p) => (
                  <td key={p.id} className="py-4 px-4 text-stone-300">
                    {p.color || 'Đa dạng tùy biến theo đơn'}
                  </td>
                ))}
              </tr>

              {/* Trọng lượng */}
              <tr>
                <td className="py-4 px-4 font-semibold text-stone-400 bg-stone-900/30">
                  Trọng lượng
                </td>
                {compareList.map((p) => (
                  <td key={p.id} className="py-4 px-4 text-stone-300">
                    {p.weight ? `${p.weight} kg` : '35 - 50 kg'}
                  </td>
                ))}
              </tr>

              {/* Tình trạng tồn kho */}
              <tr>
                <td className="py-4 px-4 font-semibold text-stone-400 bg-stone-900/30">
                  Kho hàng
                </td>
                {compareList.map((p) => (
                  <td key={p.id} className="py-4 px-4">
                    {p.stockQuantity > 0 ? (
                      <span className="text-emerald-400 font-medium flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                        Còn hàng ({p.stockQuantity} sản phẩm)
                      </span>
                    ) : (
                      <span className="text-red-400 font-medium">Hết hàng</span>
                    )}
                  </td>
                ))}
              </tr>

              {/* Nút đặt hàng */}
              <tr>
                <td className="py-6 px-4 font-semibold text-stone-400 bg-stone-900/30">
                  Thao tác
                </td>
                {compareList.map((p) => (
                  <td key={p.id} className="py-6 px-4 space-y-2">
                    <button
                      onClick={() => addToCart(p, 1)}
                      className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-amber-950 font-bold text-xs rounded-xl shadow transition"
                    >
                      🛒 Thêm vào giỏ
                    </button>
                    <Link
                      to={`/products/${p.slug || p.id}`}
                      className="block text-center w-full py-2 border border-stone-700 hover:bg-stone-700 text-stone-300 rounded-xl text-xs transition"
                    >
                      Xem chi tiết 3D
                    </Link>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ComparePage;
