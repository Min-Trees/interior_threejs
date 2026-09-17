import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, Search, SlidersHorizontal, ArrowUpDown, X } from 'lucide-react';
import api from '../api/client';
import ProductCard from '../components/ProductCard';

const PRICE_RANGES = [
  { label: 'Tất cả mức giá', min: null, max: null },
  { label: 'Dưới 10 triệu', min: null, max: 10000000 },
  { label: 'Từ 10 - 20 triệu', min: 10000000, max: 20000000 },
  { label: 'Từ 20 - 30 triệu', min: 20000000, max: 30000000 },
  { label: 'Trên 30 triệu', min: 30000000, max: null },
];

const MATERIALS = ['Tất cả', 'Gỗ sồi', 'Gỗ óc chó', 'Da bò Ý', 'Vải nỉ', 'Mặt đá ceramic', 'Inox'];

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pageInfo, setPageInfo] = useState({ pageNo: 0, totalPages: 1, totalElements: 0 });
  const [loading, setLoading] = useState(true);

  // Filter states
  const categoryId = searchParams.get('categoryId') || '';
  const keyword = searchParams.get('keyword') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const material = searchParams.get('material') || '';
  const sortBy = searchParams.get('sortBy') || 'createdAt';
  const sortDir = searchParams.get('sortDir') || 'desc';
  const page = parseInt(searchParams.get('page') || '0', 10);

  // Load categories once
  useEffect(() => {
    api.get('/categories')
      .then((res) => {
        if (res.success) setCategories(res.data || []);
      })
      .catch(console.error);
  }, []);

  // Fetch products whenever params change
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (categoryId) params.append('categoryId', categoryId);
        if (keyword) params.append('keyword', keyword);
        if (minPrice) params.append('minPrice', minPrice);
        if (maxPrice) params.append('maxPrice', maxPrice);
        if (material && material !== 'Tất cả') params.append('material', material);
        params.append('sortBy', sortBy);
        params.append('sortDir', sortDir);
        params.append('page', page);
        params.append('size', 12);

        const res = await api.get(`/products?${params.toString()}`);
        if (res.success && res.data) {
          setProducts(res.data.content || []);
          setPageInfo({
            pageNo: res.data.pageNo,
            totalPages: res.data.totalPages,
            totalElements: res.data.totalElements,
          });
        }
      } catch (err) {
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [categoryId, keyword, minPrice, maxPrice, material, sortBy, sortDir, page]);

  const updateFilters = (newParams) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(newParams).forEach(([k, v]) => {
      if (v === null || v === '' || v === 'Tất cả') {
        next.delete(k);
      } else {
        next.set(k, v);
      }
    });
    next.set('page', 0); // reset to first page
    setSearchParams(next);
  };

  const handlePriceRange = (range) => {
    updateFilters({
      minPrice: range.min !== null ? range.min : '',
      maxPrice: range.max !== null ? range.max : '',
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-8 border-b border-stone-200">
        <div>
          <h1 className="text-3xl font-extrabold text-stone-900 font-serif">Bộ Sưu Tập Nội Thất</h1>
          <p className="text-xs text-stone-500 mt-1">
            Hiển thị {pageInfo.totalElements} sản phẩm nội thất cao cấp
          </p>
        </div>

        {/* Sort & Search Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Keyword Search */}
          <div className="relative w-full sm:w-60">
            <input
              type="text"
              placeholder="Tìm theo tên sản phẩm..."
              defaultValue={keyword}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  updateFilters({ keyword: e.target.value.trim() });
                }
              }}
              className="w-full pl-9 pr-8 py-2 text-xs bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
            {keyword && (
              <button
                onClick={() => updateFilters({ keyword: '' })}
                className="absolute right-2.5 top-2.5 text-stone-400 hover:text-stone-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Sort Selector */}
          <select
            value={`${sortBy}-${sortDir}`}
            onChange={(e) => {
              const [sb, sd] = e.target.value.split('-');
              updateFilters({ sortBy: sb, sortDir: sd });
            }}
            className="text-xs bg-white border border-stone-200 rounded-xl px-3 py-2 font-medium text-stone-700 focus:outline-none"
          >
            <option value="createdAt-desc">Mới nhất</option>
            <option value="price-asc">Giá: Thấp đến Cao</option>
            <option value="price-desc">Giá: Cao đến Thấp</option>
            <option value="name-asc">Tên: A - Z</option>
          </select>
        </div>
      </div>

      {/* Main Grid: Sidebar + Products */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 pt-8">
        {/* Sidebar Filters */}
        <aside className="space-y-6">
          {/* Categories Filter */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-900 mb-3 flex items-center gap-2">
              <SlidersHorizontal className="w-3.5 h-3.5 text-brand-600" /> Danh Mục
            </h3>
            <div className="space-y-1">
              <button
                onClick={() => updateFilters({ categoryId: '' })}
                className={`w-full text-left text-xs px-3 py-2 rounded-lg font-medium transition ${
                  !categoryId ? 'bg-brand-50 text-brand-700 font-bold' : 'text-stone-600 hover:bg-stone-50'
                }`}
              >
                Tất cả danh mục
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => updateFilters({ categoryId: c.id.toString() })}
                  className={`w-full text-left text-xs px-3 py-2 rounded-lg font-medium transition ${
                    categoryId === c.id.toString()
                      ? 'bg-brand-50 text-brand-700 font-bold'
                      : 'text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Filter */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-900 mb-3">
              Khoảng Giá
            </h3>
            <div className="space-y-1.5">
              {PRICE_RANGES.map((r, i) => {
                const isSelected =
                  (r.min === null ? !minPrice : minPrice === r.min.toString()) &&
                  (r.max === null ? !maxPrice : maxPrice === r.max.toString());
                return (
                  <button
                    key={i}
                    onClick={() => handlePriceRange(r)}
                    className={`w-full text-left text-xs px-3 py-2 rounded-lg font-medium transition ${
                      isSelected
                        ? 'bg-brand-50 text-brand-700 font-bold'
                        : 'text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    {r.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Material Filter */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-900 mb-3">
              Chất Liệu
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {MATERIALS.map((m) => {
                const isSelected = (!material && m === 'Tất cả') || material === m;
                return (
                  <button
                    key={m}
                    onClick={() => updateFilters({ material: m })}
                    className={`text-xs px-3 py-1.5 rounded-lg border transition ${
                      isSelected
                        ? 'bg-brand-600 text-white border-brand-600 font-semibold shadow-sm'
                        : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    {m}
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Product Cards Grid */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-80 bg-stone-200 animate-pulse rounded-2xl" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-stone-200 p-8">
              <p className="text-base font-bold text-stone-800 mb-2">Không tìm thấy sản phẩm nào</p>
              <p className="text-xs text-stone-500 mb-4">
                Vui lòng thử lại với từ khóa khác hoặc xóa bớt tiêu chí lọc
              </p>
              <button
                onClick={() => setSearchParams(new URLSearchParams())}
                className="bg-brand-600 text-white text-xs font-semibold px-5 py-2.5 rounded-xl hover:bg-brand-700 transition"
              >
                Xóa tất cả bộ lọc
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {pageInfo.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-12">
                  {Array.from({ length: pageInfo.totalPages }).map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => updateFilters({ page: idx })}
                      className={`w-9 h-9 rounded-xl text-xs font-bold transition ${
                        pageInfo.pageNo === idx
                          ? 'bg-brand-600 text-white shadow-md'
                          : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Products;
