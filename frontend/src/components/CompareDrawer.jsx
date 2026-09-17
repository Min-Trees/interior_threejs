import React from 'react';
import { Link } from 'react-router-dom';
import { useCompare } from '../context/CompareContext';

const CompareDrawer = () => {
  const { compareList, compareCount, removeFromCompare, clearCompare } = useCompare();

  if (compareCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[95%] max-w-3xl bg-amber-950/95 backdrop-blur-md text-amber-50 rounded-2xl shadow-2xl border border-amber-500/30 p-4 transition-all duration-300">
      <div className="flex items-center justify-between gap-4">
        {/* Thumbnails */}
        <div className="flex items-center gap-3 overflow-x-auto py-1">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-300 whitespace-nowrap pl-1">
            <span>⚖️ So sánh</span>
            <span className="bg-amber-500 text-amber-950 px-1.5 py-0.5 rounded-full text-[10px] font-bold">
              {compareCount}/4
            </span>
          </div>

          <div className="flex items-center gap-2">
            {compareList.map((item) => (
              <div key={item.id} className="relative group flex-shrink-0">
                <img
                  src={item.thumbnail}
                  alt={item.name}
                  className="w-12 h-12 rounded-lg object-cover border border-amber-600/40 bg-stone-800"
                />
                <button
                  onClick={() => removeFromCompare(item.id)}
                  className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center text-[10px] shadow"
                  title="Xóa khỏi so sánh"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={clearCompare}
            className="text-xs text-amber-300/80 hover:text-amber-200 px-2 py-1.5 rounded transition"
          >
            Xóa hết
          </button>
          <Link
            to="/so-sanh"
            className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-amber-950 font-bold text-xs sm:text-sm rounded-xl shadow-lg transition flex items-center gap-1.5"
          >
            <span>So sánh ngay</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CompareDrawer;
