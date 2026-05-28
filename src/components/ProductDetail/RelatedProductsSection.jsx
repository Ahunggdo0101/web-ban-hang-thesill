import { useState, useCallback } from 'react';
import { useCart } from '../../context/CartContext';
import ProductCard from '../ProductCard';

const RELATED_POT_COLORS = [
  { name: "Terracotta", value: "#D77A61" },
  { name: "Cream", value: "#F5F2EB" },
  { name: "Mint", value: "#C1D5C0" },
  { name: "Charcoal", value: "#3E3E3E" }
];

export default function RelatedProductsSection({ relatedProducts }) {
  const { addToCart } = useCart();
  const [relatedCardColors, setRelatedCardColors] = useState({});

  const handleRelatedColorChange = useCallback((productId, colorName) => {
    setRelatedCardColors(prev => ({ ...prev, [productId]: colorName }));
  }, []);

  if (!relatedProducts || relatedProducts.length === 0) return null;

  return (
    <div className="border-t border-brand-sand pt-12 text-left">
      <span className="text-[10px] uppercase tracking-widest text-brand-clay font-bold block mb-2">
        Có thể bạn cũng thích
      </span>
      <h3 className="font-serif text-2xl text-brand-forest font-light mb-8">
        Sản phẩm tương tự
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {relatedProducts.map((plant) => (
          <ProductCard
            key={plant.id}
            plant={plant}
            activeColor={relatedCardColors[plant.id] || 'Terracotta'}
            onColorChange={handleRelatedColorChange}
            addToCart={addToCart}
            potColorsInfo={RELATED_POT_COLORS}
          />
        ))}
      </div>
    </div>
  );
}
