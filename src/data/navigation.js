function deepFreeze(object) {
  const propNames = Reflect.ownKeys(object);
  for (const name of propNames) {
    const value = object[name];
    if ((value && typeof value === 'object') || typeof value === 'function') {
      deepFreeze(value);
    }
  }
  return Object.freeze(object);
}

export const NAVIGATION_DATA = deepFreeze([
  {
    title: 'KHUYẾN MÃI',
    color: 'text-red-600 hover:text-red-800',
    hasMenu: false,
    view: 'shop'
  },
  {
    title: 'Hàng Mới Về',
    color: 'text-[#666] hover:text-brand-forest',
    hasMenu: true,
    view: 'shop',
    menuData: {
      links: [
        { name: 'Hàng Mới Về', href: '/shop?sort=newest' },
        { name: 'Bán Chạy Nhất', href: '/shop?sort=rating' },
        { name: 'Cây Cảnh Trong Nhà', href: '/shop' },
        { name: 'Cây Để Bàn', href: '/shop?size=small' },
        { name: 'Cây Dễ Chăm Sóc', href: '/shop?difficulty=easy' },
        { name: 'Cây Thân Thiện Thú Cưng', href: '/shop?pet=true' },
        { name: 'Quà Tặng Cây Xanh', href: '/shop' }
      ],
      cards: [
        {
          title: 'Cây Nở Hoa Mùa Này',
          image: 'https://images.unsplash.com/photo-1566393028639-d108a42c46a7?auto=format&fit=crop&q=80&w=600',
          href: '/shop?light=bright'
        },
        {
          title: 'Bộ Sưu Tập Cây Cổ Thụ',
          image: 'https://images.unsplash.com/photo-1596547609652-9cf5d8d76921?auto=format&fit=crop&q=80&w=600',
          href: '/shop?size=large'
        },
        {
          title: 'Quà Tặng Ngày Của Cha',
          image: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&q=80&w=600',
          href: '/shop?difficulty=easy'
        }
      ]
    }
  },
  {
    title: 'Cây Cỡ Lớn',
    color: 'text-[#666] hover:text-brand-forest',
    hasMenu: true,
    view: 'shop',
    menuData: {
      links: [
        { name: 'Cây Cỡ Lớn Bán Chạy', href: '/shop?size=large&sort=rating' },
        { name: 'Cây Trồng Góc Nhà', href: '/shop?size=large&light=medium' },
        { name: 'Cây Cảnh Văn Phòng', href: '/shop?size=large&difficulty=easy' },
        { name: 'Cây Thanh Lọc Không Khí', href: '/shop?size=large' }
      ],
      cards: [
        {
          title: 'Bàng Singapore Đại',
          image: 'https://images.unsplash.com/photo-1597055181300-e3633a207518?auto=format&fit=crop&q=80&w=600',
          href: '/shop?size=large'
        },
        {
          title: 'Trầu Bà Cột Xanh Mướt',
          image: 'https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&q=80&w=600',
          href: '/shop?size=large&difficulty=easy'
        },
        {
          title: 'Cây Hạnh Phúc Cỡ Lớn',
          image: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&q=80&w=600',
          href: '/shop?size=large&light=medium'
        }
      ]
    }
  },
  {
    title: 'Cây Trong Nhà',
    color: 'text-[#666] hover:text-brand-forest',
    hasMenu: false,
    view: 'shop'
  },
  {
    title: 'Cây Ngoài Trời',
    color: 'text-[#666] hover:text-brand-forest',
    hasMenu: false,
    view: 'shop'
  },
  {
    title: 'Hoa Lan',
    color: 'text-[#666] hover:text-brand-forest',
    hasMenu: true,
    view: 'shop',
    menuData: {
      links: [
        { name: 'Hoa Lan Hồ Điệp', href: '/shop?light=bright' },
        { name: 'Hoa Lan Quà Tặng', href: '/shop?difficulty=moderate' },
        { name: 'Hoa Lan Mini Để Bàn', href: '/shop?size=small' },
        { name: 'Hướng Dẫn Chăm Sóc Lan', href: '/shop' }
      ],
      cards: [
        {
          title: 'Hồ Điệp Trắng Sang Trọng',
          image: 'https://images.unsplash.com/photo-1525310072745-f49212b5ac6d?auto=format&fit=crop&q=80&w=600',
          href: '/shop?light=bright'
        },
        {
          title: 'Hồ Điệp Tím Quý Phái',
          image: 'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?auto=format&fit=crop&q=80&w=600',
          href: '/shop?light=bright'
        },
        {
          title: 'Hồ Điệp Vàng Ấm Áp',
          image: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&q=80&w=600',
          href: '/shop?light=bright'
        }
      ]
    }
  },
  {
    title: 'Quà Tặng',
    color: 'text-[#666] hover:text-brand-forest',
    hasMenu: false,
    view: 'shop'
  },
  {
    title: 'Chậu & Chăm Sóc',
    color: 'text-[#666] hover:text-brand-forest',
    hasMenu: false,
    view: 'shop'
  },
  {
    title: 'Quà Doanh Nghiệp',
    color: 'text-[#666] hover:text-brand-forest',
    hasMenu: false,
    view: 'shop'
  },
  {
    title: 'Blog',
    color: 'text-[#666] hover:text-brand-forest',
    hasMenu: false,
    view: 'journal'
  }
]);
