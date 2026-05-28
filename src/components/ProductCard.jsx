import React from 'react';
import { Link } from 'react-router-dom';
import { Star, ShoppingBag } from 'lucide-react';
import { optimizeUnsplashImage } from '../utils/image';
import { translatePotColor, formatVND } from '../utils/translation';

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
      className="group cursor-pointer flex flex-col relative w-full text-left bg-brand-white"
    >
      {/* Image Container */}
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-brand-white">
        <img
          src={optimizeUnsplashImage(displayImage, 400)}
          alt={plant.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 ease-out animate-fade-in"
          loading="lazy"
        />

        {plant.petFriendly && (
          <span className="absolute top-2.5 left-2.5 bg-brand-cream/95 border border-brand-sand text-[#1F3E35] text-[7px] uppercase font-extrabold tracking-widest px-2 py-0.5 shadow-xs">
            An toàn thú cưng
          </span>
        )}

        {plant.originalPrice && (
          <span className="absolute top-2.5 right-2.5 bg-red-600 text-white text-[7px] uppercase font-extrabold tracking-widest px-2 py-0.5 shadow-xs">
            ☆ Ưu đãi đặc biệt
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

      {/* Metadata - CSS Peeper matched: p-2.5, text-left */}
      <div className="p-2.5 space-y-1 text-left">
        <h3 className="font-serif text-[18px] font-normal text-[#2A2D24] group-hover:text-brand-forest transition-colors leading-[1.8] tracking-[0.02em] truncate">
          {plant.name}
        </h3>
        <p className="text-[12px] text-brand-slate italic font-sans truncate">
          {plant.botanicalName}
        </p>

        {/* Ratings stars */}
        <div className="flex items-center justify-start space-x-1 pt-1">
          <Star size={9} className="text-amber-500 fill-amber-500" />
          <span className="text-[9px] font-semibold text-brand-slate uppercase tracking-wider">
            {plant.rating} ({plant.reviewsCount})
          </span>
        </div>

        {/* Interactive swatches */}
        <div
          className="flex justify-start items-center space-x-1.5 pt-2 pb-0.5"
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
              title={`Màu chậu ${translatePotColor(col.name)}`}
            />
          ))}
        </div>

        <p className="text-xs font-bold pt-1 text-left">
          {plant.originalPrice ? (
            <span className="inline-flex items-center gap-1.5 justify-start">
              <span className="text-red-600 font-bold">{formatVND(plant.price)}</span>
              <span className="text-[#888] line-through text-[10px] font-normal">{formatVND(plant.originalPrice)}</span>
            </span>
          ) : (
            <span className="text-brand-charcoal">{formatVND(plant.price)}</span>
          )}
        </p>
      </div>
    </Link>
  );
});

ProductCard.displayName = 'ProductCard';

export default ProductCard;
