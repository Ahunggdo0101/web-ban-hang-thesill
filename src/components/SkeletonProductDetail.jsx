import React from 'react';

export default function SkeletonProductDetail() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-10 animate-pulse">
      {/* Breadcrumb Placeholder */}
      <nav className="text-[10px] mb-6 flex items-center space-x-2 font-bold">
        <div className="h-3 w-12 bg-brand-sand/30 rounded" />
        <span className="text-brand-sand/40">/</span>
        <div className="h-3 w-12 bg-brand-sand/30 rounded" />
        <span className="text-brand-sand/40">/</span>
        <div className="h-3 w-20 bg-brand-sand/30 rounded" />
      </nav>

      {/* Main product container */}
      <div className="bg-brand-cream w-full rounded-none overflow-hidden border border-brand-sand relative flex flex-col md:flex-row">
        
        {/* ── LEFT: Image Panel ── */}
        <div className="w-full md:w-1/2 bg-brand-white p-6 sm:p-8 flex flex-col justify-between border-b md:border-b-0 md:border-r border-brand-sand">
          {/* Main Image Box */}
          <div className="flex-grow flex items-center justify-center min-h-[300px] max-h-[380px] md:max-h-[460px] aspect-square overflow-hidden relative border border-brand-sand bg-brand-beige">
            <div className="w-full h-full bg-brand-sand/30" />
          </div>

          {/* Thumbnails list */}
          <div className="flex space-x-2 pt-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="w-14 h-14 border border-brand-sand/50 bg-brand-sand/20 flex-shrink-0 rounded"
              />
            ))}
          </div>
        </div>

        {/* ── RIGHT: Customization Panel ── */}
        <div className="w-full md:w-1/2 p-6 sm:p-8 md:p-10 flex flex-col justify-between text-left">
          <div className="space-y-6">

            {/* Header Info */}
            <div className="space-y-3">
              <div className="h-3 bg-brand-sand/30 rounded w-24" />
              <div className="flex justify-between items-start gap-4">
                <div className="h-8 bg-brand-sand/30 rounded w-2/3" />
                <div className="h-8 bg-brand-sand/30 rounded w-16" />
              </div>
              <div className="h-3 bg-brand-sand/30 rounded w-1/3" />
              <div className="flex items-center space-x-2 pt-2">
                <div className="flex space-x-0.5">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="w-3.5 h-3.5 bg-brand-sand/30 rounded-full" />
                  ))}
                </div>
                <div className="h-3 bg-brand-sand/30 rounded w-24" />
              </div>
            </div>

            <hr className="border-brand-sand/50" />

            {/* Pot Style Selector */}
            <div className="space-y-3">
              <div className="h-3 bg-brand-sand/30 rounded w-48" />
              <div className="grid grid-cols-3 gap-2">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="border border-brand-sand bg-brand-white p-3 flex flex-col justify-between h-20 rounded"
                  >
                    <div className="h-3 bg-brand-sand/30 rounded w-3/4" />
                    <div className="h-2.5 bg-brand-sand/20 rounded w-5/6" />
                  </div>
                ))}
              </div>
            </div>

            {/* Pot Color Swatches */}
            <div className="space-y-3">
              <div className="h-3 bg-brand-sand/30 rounded w-48" />
              <div className="flex space-x-3">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="w-9 h-9 rounded-full border border-brand-sand bg-brand-sand/20"
                  />
                ))}
              </div>
            </div>

            {/* Quantity + Wishlist */}
            <div className="flex items-center space-x-4 pt-2">
              <div className="w-28 h-10 border border-brand-sand bg-brand-white rounded flex items-center justify-between px-3">
                <div className="w-4 h-4 bg-brand-sand/30 rounded" />
                <div className="w-6 h-4 bg-brand-sand/30 rounded" />
                <div className="w-4 h-4 bg-brand-sand/30 rounded" />
              </div>
              <div className="w-10 h-10 border border-brand-sand bg-brand-white rounded" />
            </div>

            <hr className="border-brand-sand/50" />

            {/* Info Tabs */}
            <div className="space-y-4">
              <div className="flex border-b border-brand-sand pb-2.5 space-x-8">
                <div className="h-4 bg-brand-sand/30 rounded w-24" />
                <div className="h-4 bg-brand-sand/30 rounded w-28" />
              </div>

              <div className="space-y-2 pt-2">
                <div className="h-3 bg-brand-sand/30 rounded w-full" />
                <div className="h-3 bg-brand-sand/30 rounded w-5/6" />
                <div className="h-3 bg-brand-sand/30 rounded w-2/3" />
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <div className="pt-6 border-t border-brand-sand mt-6">
            <div className="w-full h-12 bg-brand-sand/30 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}
