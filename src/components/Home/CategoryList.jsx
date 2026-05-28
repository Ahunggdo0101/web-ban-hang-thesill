import { Link } from 'react-router-dom';
import { optimizeUnsplashImage } from '../../utils/image';

export default function CategoryList({ categories }) {
  if (!categories || categories.length === 0) return null;

  return (
    <section className="max-w-[1650px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-[146px] space-y-10 pt-10 md:pt-12">
      <div className="text-left">
        <h2 className="font-serif text-3xl sm:text-4xl text-[#2A2D24] font-normal tracking-tight">
          Cây xanh cho mọi người
        </h2>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
        {categories.map((item, idx) => (
          <Link 
            key={idx} 
            to={item.path}
            className="group flex flex-col space-y-3 cursor-pointer"
          >
            {/* Aspect 4:5 Image container */}
            <div className="relative aspect-[4/5] w-full overflow-hidden bg-brand-beige">
              <img
                src={optimizeUnsplashImage(item.image, 500)}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              />
            </div>
            {/* Title with Arrow */}
            <div className="text-left">
              <span className="font-serif text-sm sm:text-base font-normal text-[#2A2D24] group-hover:text-brand-forest hover-underline inline-flex items-center gap-1 transition-colors leading-snug">
                {item.title} <span className="font-sans font-light group-hover:translate-x-1 transition-transform">→</span>
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
