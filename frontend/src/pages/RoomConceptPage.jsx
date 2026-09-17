import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Layers,
  Box,
  RefreshCw,
  ShoppingBag,
  Sparkles,
  Check,
  Eye,
  ArrowRight,
  Info,
  ChevronRight,
  SlidersHorizontal,
  Home,
  Sun,
  Moon,
  Maximize2,
  Minimize2,
  Search,
  QrCode,
  Smartphone,
  Palette,
  Bed,
  Utensils,
  Briefcase,
  Armchair,
  Download,
  X
} from 'lucide-react';
import api from '../api/client';
import RoomScene3D from '../components/RoomScene3D';
import { useCart } from '../context/CartContext';

const formatPrice = (amount) => {
  if (!amount) return '0 đ';
  return new Intl.NumberFormat('vi-VN').format(amount) + ' đ';
};

const ROOM_TYPES = [
  {
    id: 'LUXURY_VILLA',
    label: 'Biệt Thự Đỉnh Cao (126m²)',
    icon: Sparkles,
    defaultDims: { widthM: 14.0, lengthM: 9.0 },
    renderImage: '/images/concepts/living_room.jpg',
    badge: 'Toàn Bộ Dinh Thự'
  },
  { id: 'LIVING_ROOM', label: 'Phòng Khách', icon: Armchair, defaultDims: { widthM: 6.0, lengthM: 5.2 }, renderImage: '/images/concepts/living_room.jpg' },
  { id: 'BEDROOM', label: 'Phòng Ngủ Master', icon: Bed, defaultDims: { widthM: 5.6, lengthM: 4.8 }, renderImage: '/images/concepts/bedroom.jpg' },
  { id: 'DINING_ROOM', label: 'Phòng Ăn & Bếp', icon: Utensils, defaultDims: { widthM: 6.0, lengthM: 5.0 }, renderImage: '/images/concepts/dining_room.jpg' },
  { id: 'HOME_OFFICE', label: 'Phòng Làm Việc', icon: Briefcase, defaultDims: { widthM: 5.2, lengthM: 4.4 }, renderImage: '/images/concepts/home_office.jpg' },
];

const ROOM_SIZE_PRESETS = [
  { id: 'compact', label: 'Căn hộ tiêu chuẩn (22m²)', widthM: 4.8, lengthM: 4.6 },
  { id: 'standard', label: 'Căn hộ cao cấp (32m²)', widthM: 6.0, lengthM: 5.4 },
  { id: 'spacious', label: 'Penthouse (48m²)', widthM: 7.2, lengthM: 6.6 },
  { id: 'villa_full', label: 'Biệt Thự Đỉnh Cao (126m²)', widthM: 14.0, lengthM: 9.0 },
];

const VILLA_ZONES = [
  { id: 'ALL', label: 'Tất Cả Món', icon: '✨' },
  { id: 'LIVING', label: 'Khách Lounge', icon: '🛋️' },
  { id: 'DINING', label: 'Ẩm Thực & Bar', icon: '🍽️' },
  { id: 'BEDROOM', label: 'Master Suite', icon: '🛏️' },
  { id: 'OFFICE', label: 'Làm Việc', icon: '💼' },
];

const getZoneForItem = (item) => {
  const role = item?.roomPlacementRole;
  const x = item?.position?.x ?? 0;
  const z = item?.position?.z ?? 0;

  if (['SOFA', 'COFFEE_TABLE', 'TV_STAND', 'FLOOR_LAMP'].includes(role) && x <= 0 && z < 0.5) {
    return { id: 'LIVING', name: 'Phòng Khách Lounge', icon: '🛋️', badgeColor: 'text-amber-400 border-amber-500/30 bg-amber-500/10' };
  }
  if (role === 'DINING_TABLE' || (x <= 0 && z >= 0.5)) {
    return { id: 'DINING', name: 'Khu Ẩm Thực & Bar', icon: '🍽️', badgeColor: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' };
  }
  if (['BED', 'WARDROBE'].includes(role) || (x > 0 && z < 0.5)) {
    return { id: 'BEDROOM', name: 'Phòng Ngủ Master', icon: '🛏️', badgeColor: 'text-rose-400 border-rose-500/30 bg-rose-500/10' };
  }
  if (['DESK', 'OFFICE_CHAIR', 'BOOKSHELF'].includes(role) || (x > 0 && z >= 0.5)) {
    return { id: 'OFFICE', name: 'Phòng Làm Việc', icon: '💼', badgeColor: 'text-sky-400 border-sky-500/30 bg-sky-500/10' };
  }
  return { id: 'OTHER', name: 'Nội Thất Khác', icon: '✨', badgeColor: 'text-stone-400 border-stone-700 bg-stone-800' };
};

const WALL_PALETTES = [
  { id: 'slate', name: 'Xám Hiện Đại', hex: '#25262a', border: 'border-stone-600' },
  { id: 'ivory', name: 'Trắng Sứ Kem', hex: '#ede8df', border: 'border-stone-300' },
  { id: 'sage', name: 'Xanh Sage Scandi', hex: '#4a554d', border: 'border-emerald-700' },
  { id: 'mocha', name: 'Nâu Mocha Luxury', hex: '#3d2f28', border: 'border-amber-900' },
];

export default function RoomConceptPage() {
  const { addToCart } = useCart();
  const [searchParams, setSearchParams] = useSearchParams();
  const roomParam = searchParams.get('room');

  const initialTypeDef = (roomParam && ROOM_TYPES.find((t) => t.id === roomParam)) 
    ? ROOM_TYPES.find((t) => t.id === roomParam) 
    : ROOM_TYPES[0];

  // Selected configurations
  const [currentRoomType, setCurrentRoomType] = useState(initialTypeDef.id);
  const [roomDims, setRoomDims] = useState({ ...initialTypeDef.defaultDims, heightM: 3.0 });
  const [lightingMode, setLightingMode] = useState('day'); // 'day' | 'night'
  const [wallColor, setWallColor] = useState('#25262a');
  const [viewMode, setViewMode] = useState('3D'); // '3D' | '2D'
  const [activeFloor, setActiveFloor] = useState(1); // 1: Tầng 1 (Trệt) | 2: Tầng 2 (Lầu)

  // Data states
  const [layoutData, setLayoutData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);

  // Refine Modal states
  const [refineModalOpen, setRefineModalOpen] = useState(false);
  const [itemToRefine, setItemToRefine] = useState(null);
  const [alternativeProducts, setAlternativeProducts] = useState([]);
  const [searchFilter, setSearchFilter] = useState('');
  const [loadingAlternatives, setLoadingAlternatives] = useState(false);
  const [swapping, setSwapping] = useState(false);

  // AR and Lightbox Modal states
  const [arModalOpen, setArModalOpen] = useState(false);
  const [renderLightboxOpen, setRenderLightboxOpen] = useState(false);
  const [addAllSuccess, setAddAllSuccess] = useState(false);
  const [activeZoneFilter, setActiveZoneFilter] = useState('ALL');

  const currentTypeDef = ROOM_TYPES.find((t) => t.id === currentRoomType) || ROOM_TYPES[0];

  // Sync with URL query parameter on load or change
  useEffect(() => {
    const targetType = (roomParam && ROOM_TYPES.find((t) => t.id === roomParam)) 
      ? roomParam 
      : currentRoomType;
    const targetDef = ROOM_TYPES.find((t) => t.id === targetType) || ROOM_TYPES[0];
    setCurrentRoomType(targetDef.id);
    setActiveFloor(1);
    setRoomDims({ ...targetDef.defaultDims, heightM: 3.0 });
    fetchConcept(targetDef.id, targetDef.defaultDims.widthM, targetDef.defaultDims.lengthM);
  }, [roomParam]);

  const fetchConcept = async (type, width, length) => {
    try {
      setLoading(true);
      const res = await api.get(`/ai/room-concept?roomType=${type}&widthM=${width}&lengthM=${length}`);
      const layout = res?.data?.items ? res.data : (res?.items ? res : res?.data);
      if (layout) {
        setLayoutData(layout);
      }
    } catch (err) {
      console.error('Failed to load room concept:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectRoomType = (typeId) => {
    const typeDef = ROOM_TYPES.find((t) => t.id === typeId);
    setCurrentRoomType(typeId);
    setActiveFloor(1);
    setSearchParams({ room: typeId }, { replace: true });
    const newWidth = typeDef ? typeDef.defaultDims.widthM : roomDims.widthM;
    const newLength = typeDef ? typeDef.defaultDims.lengthM : roomDims.lengthM;
    setRoomDims((prev) => ({
      ...prev,
      widthM: newWidth,
      lengthM: newLength,
    }));
    setSelectedItem(null);
    fetchConcept(typeId, newWidth, newLength);
  };

  const handleSelectSizePreset = (preset) => {
    setRoomDims((prev) => ({
      ...prev,
      widthM: preset.widthM,
      lengthM: preset.lengthM,
    }));
    fetchConcept(currentRoomType, preset.widthM, preset.lengthM);
  };

  // Open Refine modal for an item
  const handleOpenRefine = async (item) => {
    setItemToRefine(item);
    setSearchFilter('');
    setRefineModalOpen(true);
    try {
      setLoadingAlternatives(true);
      const res = await api.get('/products?size=30');
      const productList = res?.data?.content || res?.content || [];
      if (productList.length > 0) {
        const filtered = productList.filter((p) => p.id !== item.productId);
        setAlternativeProducts(filtered);
      }
    } catch (err) {
      console.error('Failed to load alternatives:', err);
    } finally {
      setLoadingAlternatives(false);
    }
  };

  // Execute item swap with persistent multi-item customization across the entire house
  const handleSwapItem = async (newProduct) => {
    if (!itemToRefine || !newProduct || !layoutData) return;
    try {
      setSwapping(true);
      const currentItems = layoutData.items || [];
      const updatedProductIds = currentItems.map((it) => 
        it.productId === itemToRefine.productId ? newProduct.id : it.productId
      );
      if (!updatedProductIds.includes(newProduct.id)) {
        updatedProductIds.push(newProduct.id);
      }
      const res = await api.post('/ai/room-concept/layout', {
        productIds: updatedProductIds,
        roomDimensions: layoutData.roomDimensions,
        roomType: currentRoomType,
      });
      const layout = res?.data?.items ? res.data : (res?.items ? res : res?.data);
      if (layout) {
        setLayoutData(layout);
        setRefineModalOpen(false);
        setItemToRefine(null);
        setSelectedItem(null);
      }
    } catch (err) {
      alert('Không thể đổi món: ' + err.message);
    } finally {
      setSwapping(false);
    }
  };

  const handleAddAllToCart = async () => {
    if (!layoutData?.items?.length) return;
    try {
      for (const item of layoutData.items) {
        await addToCart(item.productId, 1);
      }
      setAddAllSuccess(true);
      setTimeout(() => setAddAllSuccess(false), 3000);
    } catch (err) {
      alert('Lỗi thêm giỏ hàng: ' + err.message);
    }
  };

  const filteredAlternatives = alternativeProducts.filter((p) => {
    if (!searchFilter.trim()) return true;
    const q = searchFilter.toLowerCase();
    return p.name?.toLowerCase().includes(q) || p.category?.name?.toLowerCase().includes(q);
  });

  const dockItems = (layoutData?.items || []).filter((item) => {
    if (activeZoneFilter === 'ALL') return true;
    return getZoneForItem(item).id === activeZoneFilter;
  });

  return (
    <div className="min-h-screen bg-[#0f0f12] text-stone-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Header & Breadcrumb */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-stone-800/80 pb-5">
          <div>
            <div className="flex items-center gap-2 text-xs text-amber-400/80 mb-1.5 font-semibold">
              <Link to="/" className="hover:text-amber-300 flex items-center gap-1">
                <Home className="w-3.5 h-3.5" />
                <span>Trang Chủ</span>
              </Link>
              <span>/</span>
              <span className="text-amber-200">Studio Kiến Trúc & Thiết Kế Không Gian 3D AI</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-3xl">🏛️</span>
              <div>
                <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-amber-100 tracking-tight">
                  Studio Không Gian Nội Thất 3D AI Đa Chiều
                </h1>
                <p className="text-xs sm:text-sm text-stone-400 mt-0.5">
                  Tự động tính toán vật lý, chống va chạm, phân bổ ánh sáng và công thái học cho từng loại phòng
                </p>
              </div>
            </div>
          </div>

          {/* Action Header Buttons: AR & 2D/3D Mode Switcher */}
          <div className="flex items-center gap-2.5 self-start lg:self-auto">
            <button
              onClick={() => setArModalOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-stone-900 hover:bg-stone-800 text-amber-400 border border-stone-700/80 text-xs font-bold transition shadow-lg"
              title="Xem AR trong phòng thật"
            >
              <Smartphone className="w-4 h-4" />
              <span>Xem AR (Camera)</span>
            </button>

            <div className="flex items-center gap-1.5 bg-stone-900 border border-stone-800 p-1.5 rounded-2xl shadow-inner">
              <button
                onClick={() => setViewMode('3D')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                  viewMode === '3D'
                    ? 'bg-amber-500 text-stone-950 shadow-md'
                    : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
                }`}
              >
                <Box className="w-4 h-4" />
                <span>Không Gian 3D</span>
              </button>
              <button
                onClick={() => setViewMode('2D')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                  viewMode === '2D'
                    ? 'bg-amber-500 text-stone-950 shadow-md'
                    : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>Moodboard 2D</span>
              </button>
            </div>
          </div>
        </div>

        {/* Studio Control Center (Chọn loại phòng, diện tích, ánh sáng, màu tường) */}
        <div className="bg-stone-900/80 border border-stone-800 rounded-3xl p-4 sm:p-5 shadow-xl space-y-4">
          {/* Row 1: Room Types Tab */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-stone-400 uppercase tracking-wider mr-1">
                Khu vực:
              </span>
              {ROOM_TYPES.map((type) => {
                const IconComp = type.icon;
                const active = currentRoomType === type.id;
                return (
                  <button
                    key={type.id}
                    onClick={() => handleSelectRoomType(type.id)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition border ${
                      active
                        ? 'bg-amber-500/15 text-amber-300 border-amber-500/50 shadow-sm'
                        : 'bg-stone-800/60 text-stone-400 border-stone-700/50 hover:bg-stone-800 hover:text-stone-200'
                    }`}
                  >
                    <IconComp className={`w-4 h-4 ${active ? 'text-amber-400' : 'text-stone-400'}`} />
                    <span>{type.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Lighting Toggle (Day/Night) */}
            <div className="flex items-center gap-1 bg-stone-950/80 p-1 rounded-2xl border border-stone-800">
              <button
                onClick={() => setLightingMode('day')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  lightingMode === 'day'
                    ? 'bg-amber-500 text-stone-950 shadow'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                <Sun className="w-3.5 h-3.5" />
                <span>Ban Ngày</span>
              </button>
              <button
                onClick={() => setLightingMode('night')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  lightingMode === 'night'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                <Moon className="w-3.5 h-3.5" />
                <span>Ban Đêm</span>
              </button>
            </div>
          </div>

          {/* Row 2: Room Size Presets & Wall Palette Picker */}
          <div className="flex items-center justify-between flex-wrap gap-4 pt-3 border-t border-stone-800/70">
            {/* Presets */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-stone-400 uppercase tracking-wider mr-1">
                Diện tích:
              </span>
              {ROOM_SIZE_PRESETS.map((preset) => {
                const active = roomDims.widthM === preset.widthM && roomDims.lengthM === preset.lengthM;
                return (
                  <button
                    key={preset.id}
                    onClick={() => handleSelectSizePreset(preset)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition border ${
                      active
                        ? 'bg-stone-700 text-amber-300 border-amber-500/40'
                        : 'bg-stone-800/40 text-stone-400 border-stone-800 hover:text-stone-300'
                    }`}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>

            {/* Wall Colors */}
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-bold text-stone-400 uppercase tracking-wider flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-stone-400" />
                <span>Sơn tường:</span>
              </span>
              <div className="flex items-center gap-1.5">
                {WALL_PALETTES.map((pal) => (
                  <button
                    key={pal.id}
                    onClick={() => setWallColor(pal.hex)}
                    className={`w-6 h-6 rounded-full border-2 transition transform ${
                      wallColor === pal.hex ? 'scale-125 border-amber-400 ring-2 ring-amber-500/30' : 'border-stone-700 hover:scale-110'
                    }`}
                    style={{ backgroundColor: pal.hex }}
                    title={pal.name}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Row 3 (Villa Only): 2-Story Floor Selector */}
          {currentRoomType === 'LUXURY_VILLA' && (
            <div className="flex items-center justify-between flex-wrap gap-3 pt-3 border-t border-amber-500/20 bg-amber-500/5 p-3 rounded-2xl">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5 mr-1">
                  <Layers className="w-4 h-4 text-amber-400" />
                  <span>Chọn Tầng Biệt Thự:</span>
                </span>
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => setActiveFloor(1)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border ${
                      activeFloor === 1
                        ? 'bg-amber-500 text-stone-950 border-amber-400 shadow-md'
                        : 'bg-stone-800 text-stone-300 border-stone-700 hover:text-white hover:bg-stone-700'
                    }`}
                  >
                    <span>🏛️ Tầng 1: Đại Sảnh, Khách Lounge & Bếp Ăn Đảo Bar</span>
                  </button>
                  <button
                    onClick={() => setActiveFloor(2)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border ${
                      activeFloor === 2
                        ? 'bg-amber-500 text-stone-950 border-amber-400 shadow-md'
                        : 'bg-stone-800 text-stone-300 border-stone-700 hover:text-white hover:bg-stone-700'
                    }`}
                  >
                    <span>🛏️ Tầng 2: Phòng Ngủ Master Suite & Phòng Làm Việc Executive</span>
                  </button>
                </div>
              </div>
              <div className="text-[11px] text-stone-400 flex items-center gap-1">
                <span>💡 Có thể đi bộ leo cầu thang thật từ Tầng 1 lên Tầng 2 hoặc bấm nút chuyển tầng</span>
              </div>
            </div>
          )}
        </div>

        {/* Architectural Advice Alert */}
        {layoutData?.architecturalAdvice && (
          <div className="bg-stone-900/80 border border-amber-500/30 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5 shadow-lg">
            <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-2xl flex-shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                Tư Vấn Kiến Trúc & Bố Trí Công Thái Học (AI Architectural Advice)
              </h3>
              <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                {layoutData.architecturalAdvice}
              </p>
            </div>
          </div>
        )}

        {/* MAIN DISPLAY: 3D Scene or 2D Moodboard */}
        {viewMode === '3D' ? (
          <div className="space-y-4">
            <RoomScene3D
              layoutData={layoutData}
              selectedItem={selectedItem}
              onSelectItem={(item) => setSelectedItem(item)}
              onRefineItem={(item) => handleOpenRefine(item)}
              lightingMode={lightingMode}
              wallColor={wallColor}
              activeFloor={activeFloor}
              onSelectFloor={setActiveFloor}
            />

            <div className="flex items-center justify-between text-xs text-stone-400 px-2 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Tham quan 3D tương tác: Đi bộ khám phá góc nhìn thứ nhất (WASD / Joystick / Click Minimap) & Xoay toàn cảnh 360° (Phím V)</span>
              </div>
              <button
                onClick={() => setRenderLightboxOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-amber-300 hover:text-amber-200 border border-stone-800 font-bold transition shadow"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Xem Ảnh Phối Cảnh Kiến Trúc 8K</span>
              </button>
            </div>

            {/* Villa Decorator Dock (Thanh công cụ trang trí nội thất tương tác) */}
            <div className="bg-stone-900/90 border border-stone-800 rounded-3xl p-4 sm:p-5 shadow-2xl space-y-3.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-800/80">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <span>Bảng Điều Khiển Trang Trí {currentTypeDef.label}</span>
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {layoutData?.items?.length || 0} Món Nội Thất
                      </span>
                    </h3>
                    <p className="text-xs text-stone-400">
                      Bấm vào từng món để định vị trong phòng 3D hoặc đổi sản phẩm để thỏa mãn sở thích trang trí tại nhà
                    </p>
                  </div>
                </div>

                {/* Zone Filter Tabs */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                  {VILLA_ZONES.map((zone) => {
                    const active = activeZoneFilter === zone.id;
                    const count = zone.id === 'ALL'
                      ? (layoutData?.items?.length || 0)
                      : (layoutData?.items || []).filter((it) => getZoneForItem(it).id === zone.id).length;
                    return (
                      <button
                        key={zone.id}
                        onClick={() => {
                          setActiveZoneFilter(zone.id);
                          if (zone.id === 'BEDROOM' || zone.id === 'OFFICE') {
                            setActiveFloor(2);
                          } else if (zone.id === 'LIVING' || zone.id === 'DINING') {
                            setActiveFloor(1);
                          }
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap border ${
                          active
                            ? 'bg-amber-500 text-stone-950 border-amber-400 shadow-md shadow-amber-500/20'
                            : 'bg-stone-800/80 text-stone-300 border-stone-700/60 hover:bg-stone-700 hover:text-white'
                        }`}
                      >
                        <span>{zone.icon}</span>
                        <span>{zone.label}</span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${active ? 'bg-stone-950/30 text-stone-950 font-black' : 'bg-stone-900 text-stone-400'}`}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Horizontal Scrollable Carousel of Furniture Items */}
              <div className="flex items-center gap-3.5 overflow-x-auto pb-2 pt-1 scrollbar-thin scrollbar-thumb-stone-700">
                {dockItems.map((item) => {
                  const zone = getZoneForItem(item);
                  const isSelected = selectedItem?.productId === item.productId;
                  return (
                    <div
                      key={item.productId}
                      className={`flex-shrink-0 w-64 p-3.5 rounded-2xl border transition-all duration-200 bg-stone-950/70 hover:border-amber-500/50 ${
                        isSelected
                          ? 'border-amber-500 ring-2 ring-amber-500/40 shadow-xl shadow-amber-500/10'
                          : 'border-stone-800/90'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          onClick={() => setSelectedItem(item)}
                          className="relative w-16 h-16 rounded-xl overflow-hidden bg-stone-800 flex-shrink-0 cursor-pointer group border border-stone-700/60"
                        >
                          <img
                            src={item.thumbnail}
                            alt={item.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                          />
                          <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border inline-block ${zone.badgeColor}`}>
                            {zone.name}
                          </span>
                          <h4
                            onClick={() => setSelectedItem(item)}
                            className="text-xs font-bold text-stone-100 truncate cursor-pointer hover:text-amber-300 mt-1"
                            title={item.name}
                          >
                            {item.name}
                          </h4>
                          <div className="text-xs font-mono font-bold text-amber-300 mt-0.5">
                            {formatPrice(item.discountPrice || item.price)}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mt-3 pt-2.5 border-t border-stone-800/80">
                        <button
                          onClick={() => handleOpenRefine(item)}
                          className="flex-1 py-1.5 bg-stone-800 hover:bg-stone-700 text-amber-300 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1 border border-stone-700/80 shadow-sm"
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>Đổi Món</span>
                        </button>
                        <button
                          onClick={() => setSelectedItem(isSelected ? null : item)}
                          className={`px-2.5 py-1.5 text-xs font-bold rounded-xl transition flex items-center gap-1 border ${
                            isSelected
                              ? 'bg-amber-500 text-stone-950 border-amber-400 shadow-sm'
                              : 'bg-stone-800 text-stone-300 hover:bg-stone-700 border-stone-700/60'
                          }`}
                          title="Định vị trong 3D"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>{isSelected ? 'Đang chọn' : 'Định vị'}</span>
                        </button>
                        <button
                          onClick={() => addToCart(item.productId, 1)}
                          className="p-1.5 bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-stone-950 rounded-xl transition border border-amber-500/30 shadow-sm"
                          title="Thêm vào giỏ hàng"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          /* 2D Moodboard with Photorealistic Render Showcase */
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Hero Render Banner */}
            <div className="relative rounded-3xl overflow-hidden border border-stone-800 shadow-2xl group bg-stone-900">
              <img
                src={currentTypeDef?.renderImage || '/images/concepts/living_room.jpg'}
                alt={layoutData?.conceptTitle}
                className="w-full h-80 sm:h-[480px] object-cover transition duration-700 group-hover:scale-102"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/95 via-stone-950/30 to-transparent flex flex-col justify-end p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                  <div className="space-y-2 max-w-2xl">
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full bg-amber-500/20 backdrop-blur-md text-amber-300 text-xs font-bold border border-amber-500/30 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5" /> Phối Cảnh Kiến Trúc Siêu Thực 8K
                      </span>
                      <span className="px-3 py-1 rounded-full bg-stone-900/80 backdrop-blur-md text-stone-300 text-xs font-semibold border border-stone-700">
                        {roomDims.widthM}m × {roomDims.lengthM}m ({((roomDims.widthM || 4) * (roomDims.lengthM || 3.5)).toFixed(1)}m²)
                      </span>
                    </div>
                    <h2 className="text-xl sm:text-3xl font-bold font-serif text-white">
                      {layoutData?.conceptTitle}
                    </h2>
                    <p className="text-xs sm:text-sm text-stone-300 line-clamp-2">
                      {layoutData?.architecturalAdvice}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => setRenderLightboxOpen(true)}
                      className="px-4 py-2.5 bg-stone-900/85 hover:bg-stone-800 text-white rounded-xl text-xs font-bold border border-stone-700 backdrop-blur-md transition flex items-center gap-1.5 shadow"
                    >
                      <Maximize2 className="w-4 h-4" />
                      <span>Xem Toàn Màn Hình</span>
                    </button>
                    <button
                      onClick={() => setViewMode('3D')}
                      className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 rounded-xl text-xs font-bold shadow-lg transition flex items-center gap-1.5"
                    >
                      <Box className="w-4 h-4" />
                      <span>Chuyển Sang 3D 360°</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* 2D Moodboard Grid with Zone Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {layoutData?.items?.map((item) => {
              const zone = getZoneForItem(item);
              return (
              <div
                key={item.productId}
                className="bg-stone-900/90 rounded-3xl border border-stone-800 p-4 space-y-3 hover:border-amber-500/40 transition group shadow-md"
              >
                <div className="relative aspect-video rounded-2xl overflow-hidden bg-stone-800">
                  <img
                    src={item.thumbnail}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between">
                    <span className="bg-stone-950/80 text-amber-300 text-[10px] font-bold px-2.5 py-1 rounded-lg border border-amber-500/30 backdrop-blur-sm">
                      {item.category}
                    </span>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-lg border backdrop-blur-sm ${zone.badgeColor}`}>
                      {zone.name}
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-stone-100 group-hover:text-amber-400 transition truncate">
                    {item.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm font-mono font-bold text-amber-300">
                      {formatPrice(item.discountPrice || item.price)}
                    </span>
                    {item.discountPrice && item.discountPrice < item.price && (
                      <span className="text-xs text-stone-500 line-through">
                        {formatPrice(item.price)}
                      </span>
                    )}
                  </div>
                  {item.material && (
                    <p className="text-[11px] text-stone-400 truncate mt-1">
                      {item.material}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-stone-800/80">
                  <button
                    onClick={() => handleOpenRefine(item)}
                    className="flex-1 py-2.5 bg-stone-800 hover:bg-stone-700 text-amber-300 text-xs font-semibold rounded-2xl transition flex items-center justify-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Đổi Món Này</span>
                  </button>
                  <button
                    onClick={() => addToCart(item.productId, 1)}
                    className="p-2.5 bg-amber-500 hover:bg-amber-600 text-amber-950 rounded-2xl transition shadow"
                    title="Thêm vào giỏ"
                  >
                    <ShoppingBag className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
            </div>
          </div>
        )}

        {/* Concept Bottom Summary Bar */}
        <div className="bg-stone-900/90 border border-stone-800 rounded-3xl p-6 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-1">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
              Trọn Bộ Concept {layoutData?.conceptTitle} ({layoutData?.items?.length || 0} Sản Phẩm)
            </span>
            <div className="flex items-baseline gap-3">
              <span className="text-2xl sm:text-3xl font-extrabold font-mono text-amber-200">
                {formatPrice(layoutData?.totalDiscountPrice || layoutData?.totalPrice)}
              </span>
              {layoutData?.totalDiscountPrice && layoutData?.totalDiscountPrice < layoutData?.totalPrice && (
                <span className="text-sm text-stone-500 line-through">
                  {formatPrice(layoutData?.totalPrice)}
                </span>
              )}
              <span className="text-xs text-emerald-400 font-semibold ml-2">
                Tiết kiệm {formatPrice((layoutData?.totalPrice || 0) - (layoutData?.totalDiscountPrice || 0))}
              </span>
            </div>
            <p className="text-xs text-stone-400">
              Đã bao gồm chi phí thiết kế, phối cảnh 3D, vận chuyển & lắp đặt hoàn thiện tận nhà
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleAddAllToCart}
              disabled={addAllSuccess}
              className="px-6 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-amber-950 font-extrabold text-sm rounded-2xl shadow-xl hover:shadow-amber-500/20 transition flex items-center gap-2"
            >
              {addAllSuccess ? (
                <>
                  <Check className="w-5 h-5 text-emerald-950" />
                  <span>Đã Thêm Toàn Bộ Vào Giỏ!</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-5 h-5" />
                  <span>🛒 Thêm Toàn Bộ Concept</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Refine Modal (Chọn món thay thế với thanh tìm kiếm) */}
      {refineModalOpen && itemToRefine && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <div className="flex items-center gap-2.5">
                <RefreshCw className={`w-5 h-5 text-amber-400 ${swapping ? 'animate-spin' : ''}`} />
                <div>
                  <h3 className="text-base font-bold text-white">
                    Đổi Sản Phẩm: <span className="text-amber-300">{itemToRefine.name}</span>
                  </h3>
                  <p className="text-xs text-stone-400">
                    Chọn sản phẩm khác để AI tính toán lại tọa độ và xếp lại vào phòng 3D
                  </p>
                </div>
              </div>
              <button
                onClick={() => setRefineModalOpen(false)}
                className="text-stone-400 hover:text-white p-1 rounded-xl hover:bg-stone-800"
              >
                ✕
              </button>
            </div>

            {/* Search filter input */}
            <div className="relative">
              <input
                type="text"
                placeholder="Tìm sản phẩm thay thế theo tên hoặc danh mục..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-stone-800 border border-stone-700 rounded-2xl text-xs text-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
              />
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
            </div>

            {loadingAlternatives ? (
              <div className="py-12 text-center text-stone-400 text-xs">
                Đang tìm sản phẩm gợi ý thay thế phù hợp...
              </div>
            ) : (
              <div className="max-h-80 overflow-y-auto space-y-2.5 pr-2">
                {filteredAlternatives.map((p) => (
                  <div
                    key={p.id}
                    className="p-3 bg-stone-800/60 hover:bg-stone-800 rounded-2xl border border-stone-700/60 flex items-center justify-between gap-4 transition group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={p.thumbnail}
                        alt={p.name}
                        className="w-14 h-14 rounded-xl object-cover border border-stone-700 bg-stone-900 flex-shrink-0"
                      />
                      <div className="min-w-0">
                        <span className="text-[10px] text-amber-400 font-bold uppercase block">
                          {p.category?.name}
                        </span>
                        <h4 className="text-xs font-bold text-stone-100 group-hover:text-amber-300 truncate">
                          {p.name}
                        </h4>
                        <div className="text-xs font-mono font-bold text-amber-400 mt-0.5">
                          {formatPrice(p.discountPrice || p.price)}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleSwapItem(p)}
                      disabled={swapping}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-amber-950 font-bold text-xs rounded-xl transition flex-shrink-0 flex items-center gap-1.5 shadow"
                    >
                      <span>{swapping ? 'Đang xếp...' : 'Chọn món này'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* AR Mobile Viewer Modal */}
      {arModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl max-w-md w-full p-6 text-center space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto">
              <Smartphone className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-white">Xem Thử Thực Tế Tăng Cường (AR)</h3>
              <p className="text-xs text-stone-400 mt-1">
                Quét mã QR bằng camera điện thoại để đặt thử đồ nội thất trực tiếp vào căn phòng của bạn
              </p>
            </div>

            {/* QR Code Graphic Representation */}
            <div className="p-5 bg-white rounded-2xl w-52 h-52 mx-auto flex flex-col items-center justify-center shadow-lg border border-stone-200">
              <img
                src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=https://phuquy.furniture/ar-demo"
                alt="AR QR Code"
                className="w-44 h-44 rounded-lg"
              />
            </div>

            <div className="text-[11px] text-stone-400 space-y-1 bg-stone-950/60 p-3 rounded-xl text-left border border-stone-800">
              <div className="flex items-center gap-1.5 text-stone-300 font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Hướng dẫn trải nghiệm AR:</span>
              </div>
              <p>1. Dùng iPhone (iOS 12+) hoặc Android (hỗ trợ Google Play Services for AR).</p>
              <p>2. Hướng camera xuống mặt sàn và di chuyển chậm để thiết bị nhận diện mặt phẳng.</p>
              <p>3. Chạm vào màn hình để đặt đồ nội thất vào phòng theo tỷ lệ 1:1.</p>
            </div>

            <button
              onClick={() => setArModalOpen(false)}
              className="w-full py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-xs rounded-2xl transition"
            >
              Đóng Cửa Sổ
            </button>
          </div>
        </div>
      )}

      {/* 8K Architectural Render Lightbox Modal */}
      {renderLightboxOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setRenderLightboxOpen(false)}
        >
          {/* Top header bar */}
          <div 
            className="w-full max-w-6xl flex items-center justify-between py-3 px-4 text-white z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-amber-500 text-amber-950 font-bold text-xs rounded-full flex items-center gap-1.5 shadow">
                <Sparkles className="w-3.5 h-3.5" /> 8K Photorealistic Render
              </span>
              <h3 className="text-base font-bold text-stone-100 hidden sm:block">
                {layoutData?.conceptTitle || currentTypeDef.label}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <a
                href={currentTypeDef?.renderImage || '/images/concepts/living_room.jpg'}
                download={`${currentRoomType.toLowerCase()}_8k_render.jpg`}
                className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-amber-300 hover:text-amber-200 rounded-xl text-xs font-semibold border border-stone-700 flex items-center gap-1.5 transition"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Tải Ảnh Gốc</span>
              </a>
              <button
                onClick={() => setRenderLightboxOpen(false)}
                className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white transition"
                title="Đóng (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Main Image Viewport */}
          <div 
            className="relative max-w-6xl w-full max-h-[82vh] flex items-center justify-center overflow-hidden rounded-2xl border border-stone-800 bg-stone-950 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={currentTypeDef?.renderImage || '/images/concepts/living_room.jpg'}
              alt={layoutData?.conceptTitle || currentTypeDef.label}
              className="max-w-full max-h-[82vh] object-contain rounded-2xl select-none"
            />
          </div>

          {/* Caption / Advice Footer */}
          <div 
            className="w-full max-w-6xl pt-3 px-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-stone-400 text-xs"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="line-clamp-1 max-w-2xl text-stone-300">
              💡 {layoutData?.architecturalAdvice}
            </p>
            <div className="flex items-center gap-3">
              <span>Kích thước: {roomDims.widthM}m × {roomDims.lengthM}m</span>
              <button
                onClick={() => {
                  setRenderLightboxOpen(false);
                  setViewMode('3D');
                }}
                className="text-amber-400 hover:text-amber-300 font-bold underline transition"
              >
                Trải nghiệm 3D 360° &rarr;
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}