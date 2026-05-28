import React from 'react';
import { NavLink } from 'react-router-dom';
import MegaMenu from '../MegaMenu';
import { NAVIGATION_DATA } from '../../data/navigation';

const DesktopNav = React.memo(function DesktopNav() {
  const [navigationData, setNavigationData] = React.useState(NAVIGATION_DATA);

  React.useEffect(() => {
    let isMounted = true;
    fetch('/api/menu-config')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch menu config');
        return res.json();
      })
      .then((data) => {
        if (isMounted && Array.isArray(data) && data.length > 0) {
          setNavigationData(data);
        }
      })
      .catch((err) => {
        console.error('Error loading dynamic menu config:', err);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="flex justify-center items-center h-12">
      <nav className="flex items-center h-full space-x-4 lg:space-x-5 xl:space-x-8" aria-label="Desktop navigation">
        {navigationData.map((item, idx) => {
          if (item.hasMenu) {
            return (
              <div key={idx} className="group h-full flex items-center">
                <NavLink
                  to={item.view === 'home' ? '/' : `/${item.view || 'shop'}`}
                  className={({ isActive }) => `text-[12px] lg:text-[13px] font-semibold tracking-[0.12em] uppercase py-2 cursor-pointer transition-colors hover-underline whitespace-nowrap ${
                    isActive ? 'text-brand-forest' : (item.color || 'text-[#666] hover:text-brand-forest')
                  }`}
                  aria-haspopup="true"
                  aria-expanded="false"
                >
                  {item.title}
                </NavLink>
                <MegaMenu data={item.menuData} parentTitle={item.title} />
              </div>
            );
          }

          return (
            <NavLink
              key={idx}
              to={item.view === 'home' ? '/' : `/${item.view || 'shop'}`}
              className={({ isActive }) => `text-[12px] lg:text-[13px] font-semibold tracking-[0.12em] uppercase py-2 cursor-pointer transition-colors hover-underline whitespace-nowrap ${
                isActive ? 'text-brand-forest' : (item.color || 'text-[#666] hover:text-brand-forest')
              }`}
            >
              {item.title}
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
});

export default DesktopNav;



