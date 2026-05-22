import { useCallback } from 'react';

const STORAGE_KEY = 'thesill_recently_viewed';
const MAX_ITEMS = 8;

export default function useRecentlyViewed() {
  const getItems = useCallback(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch (e) {
      return [];
    }
  }, []);

  const addItem = useCallback((productId) => {
    if (!productId) return;
    const items = getItems().filter(id => id !== productId);
    items.unshift(productId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, MAX_ITEMS)));
  }, [getItems]);

  return { getItems, addItem };
}
