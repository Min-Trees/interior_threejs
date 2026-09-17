import React, { createContext, useContext, useState, useEffect } from 'react';

const CompareContext = createContext(null);

export const CompareProvider = ({ children }) => {
  const [compareList, setCompareList] = useState(() => {
    try {
      const local = localStorage.getItem('phuquy_compare');
      return local ? JSON.parse(local) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('phuquy_compare', JSON.stringify(compareList));
  }, [compareList]);

  const isInCompare = (productId) => {
    return compareList.some((item) => item.id === productId);
  };

  const toggleCompare = (product) => {
    if (isInCompare(product.id)) {
      setCompareList((prev) => prev.filter((item) => item.id !== product.id));
      return { added: false, count: compareList.length - 1 };
    } else {
      if (compareList.length >= 4) {
        return { added: false, full: true, message: 'Chỉ có thể so sánh tối đa 4 sản phẩm cùng lúc' };
      }
      setCompareList((prev) => [...prev, product]);
      return { added: true, count: compareList.length + 1 };
    }
  };

  const removeFromCompare = (productId) => {
    setCompareList((prev) => prev.filter((item) => item.id !== productId));
  };

  const clearCompare = () => {
    setCompareList([]);
  };

  return (
    <CompareContext.Provider
      value={{
        compareList,
        compareCount: compareList.length,
        isInCompare,
        toggleCompare,
        removeFromCompare,
        clearCompare,
      }}
    >
      {children}
    </CompareContext.Provider>
  );
};

export const useCompare = () => useContext(CompareContext);
