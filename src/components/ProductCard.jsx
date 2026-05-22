import React from 'react';
import { Link } from 'react-router-dom';
import { Star, ShoppingBag, Eye } from 'lucide-react';

// Render static potColorsInfo outside to avoid array recreation on every render
const DEFAULT_POT_COLORS = [
  { name: "Terracotta", value: "#D77A61" },
  { name: "Cream", value: "#F5F2EB" },
  { name: "Mint", value: "#C1D5C0" },
  { name: "Charcoal", value: "#3E3E3E" }
];

// Memoized Product Card to prevent unnecessary re-renders of the list items
const ProductCard = React.memo(({ plant, activeColor, onColorChange, addToCart, potColorsInfo }) => {
  const displayImage = plant.colorImages && plant.colorImages[activeColor]
    ? plant.colorImages[activeColor]
    : plant.image;

  // Use static default pot colors if not provided, avoiding array recreation inside render loop
  const colors = potColorsInfo || DEFAULT_POT_COLORS;

  return (
    <Link
      to={'/product/' + plant.id}
      className="group cursor-pointer flex flex-col space-y-4 relative w-full text-left"
    >
      {/* Image Container */}
      <div className="relative aspect-square w-full overflow-hidden bg-brand-white border border-brand-sand shadow-xs">
        <img
          src={displayImage}
          alt={plant.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 ease-out animate-fade-in"
          loading="lazy"
        />

        {plant.petFriendly && (
          <span className="absolute top-2.5 left-2.5 bg-[#FAF8F5]/90 backdrop-blur-xs border border-brand-sand text-[#1F3E35] text-[7px] uppercase font-extrabold tracking-widest px-2 py-0.5 shadow-xs">
            Pet Friendly
          </span>
        )}

        {/* Desktop Hover Controls */}
        <div className="absolute inset-0 bg-[#0d231a]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center p-3">
          <div className="flex w-full space-x-2 animate-slide-up">
            {addToCart && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  addToCart(plant, 1, "Classic Ceramic", activeColor);
                }}
                className="flex-1 bg-brand-forest text-brand-white font-bold text-[9px] tracking-widest uppercase py-3 hover:bg-brand-green transition-colors flex items-center justify-center cursor-pointer shadow-xs"
              >
                <ShoppingBag size={11} className="mr-1" /> Thêm vào giỏ
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Metadata */}
      <div className="space-y-1 text-center">
        <h3 className="font-serif text-sm font-medium text-brand-forest group-hover:text-brand-clay transition-colors leading-tight truncate">
          {plant.name}
        </h3>
        <p className="text-[11px] text-brand-slate italic font-serif truncate">
          {plant.botanicalName}
        </p>

        {/* Ratings stars */}
        <div className="flex items-center justify-center space-x-1 pt-1">
          <Star size={9} className="text-amber-500 fill-amber-500" />
          <span className="text-[9px] font-semibold text-brand-slate uppercase tracking-wider">
            {plant.rating} ({plant.reviewsCount})
          </span>
        </div>

        {/* Interactive swatches */}
        <div
          className="flex justify-center items-center space-x-1.5 pt-2 pb-0.5"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
        >
          {colors.map((col) => (
            <button
              key={col.name}
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onColorChange(plant.id, col.name, e);
              }}
              className={`w-3 h-3 rounded-full border transition-all ${activeColor === col.name
                  ? 'border-brand-forest ring-1 ring-brand-forest ring-offset-1 scale-110'
                  : 'border-brand-sand hover:scale-110'
                }`}
              style={{ backgroundColor: col.value }}
              title={`Màu chậu ${col.name}`}
            />
          ))}
        </div>

        <p className="text-xs font-bold text-brand-charcoal pt-1">
          ${plant.price}
        </p>
      </div>
    </Link>
  );
});

ProductCard.displayName = 'ProductCard';

export default ProductCard;
