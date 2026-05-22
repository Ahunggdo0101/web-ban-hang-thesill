import React from 'react';
import SkeletonProductCard from './SkeletonProductCard';

export default function SkeletonProductGrid() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
      {[...Array(6)].map((_, index) => (
        <SkeletonProductCard key={index} />
      ))}
    </div>
  );
}
