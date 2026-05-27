import React from 'react';

export default function SkeletonProductCard() {
  return (
    <div className="flex flex-col space-y-4 w-full max-w-[360px] mx-auto text-left">
      {/* Image Container Placeholder */}
      <div className="relative aspect-[3/4] w-full bg-brand-sand/30 animate-pulse rounded border border-brand-sand/20 shadow-xs" />

      {/* Metadata Placeholders */}
      <div className="space-y-2 text-center flex flex-col items-center">
        {/* Title (Product Name) */}
        <div className="h-4 bg-brand-sand/30 animate-pulse rounded w-3/4" />
        
        {/* Botanical Name */}
        <div className="h-3 bg-brand-sand/30 animate-pulse rounded w-1/2" />
        
        {/* Ratings */}
        <div className="flex justify-center items-center space-x-1 pt-1 w-full">
          <div className="h-3 bg-brand-sand/30 animate-pulse rounded w-1/3" />
        </div>

        {/* Pot Swatches */}
        <div className="flex justify-center items-center space-x-1.5 pt-2 pb-0.5">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="w-3 h-3 rounded-full bg-brand-sand/30 animate-pulse" />
          ))}
        </div>

        {/* Price */}
        <div className="h-4 bg-brand-sand/30 animate-pulse rounded w-1/4 pt-1" />
      </div>
    </div>
  );
}
