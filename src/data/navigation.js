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
    title: 'GIẢM GIÁ',
    color: 'text-red-600 hover:text-red-800',
    hasMenu: false,
    view: 'collections/sale'
  },
  {
    title: 'Hàng Mới',
    color: 'text-[#666] hover:text-brand-forest',
    hasMenu: true,
    view: 'shop',
    menuData: {
      links: [
        { name: 'Lựa chọn hàng đầu', href: '/shop?sort=rating' },
        { name: 'Cây trong nhà mới', href: '/shop' },
        { name: 'Cây ngoài trời mới', href: '/shop' },
        { name: 'Cây cổ thụ mới', href: '/collections/large-plants' },
        { name: 'Hội thảo sắp tới', href: '/quiz' }
      ],
      cards: [
        {
          title: 'Cây Đang Nở Hoa',
          image: 'https://images.unsplash.com/photo-1566393028639-d108a42c46a7?auto=format&fit=crop&q=80&w=600',
          href: '/shop?light=bright'
        },
        {
          title: 'Bộ Sưu Tập Cây Cổ Thụ',
          image: 'https://images.unsplash.com/photo-1596547609652-9cf5d8d76921?auto=format&fit=crop&q=80&w=600',
          href: '/collections/large-plants'
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
    view: 'collections/large-plants',
    menuData: {
      links: [
        { name: 'Cây Lớn Bán Chạy', href: '/collections/large-plants?sort=rating' },
        { name: 'Cây Trồng Góc Nhà', href: '/collections/large-plants?light=medium' },
        { name: 'Cây Cảnh Văn Phòng', href: '/collections/large-plants?difficulty=easy' },
        { name: 'Cây Thanh Lọc Không Khí', href: '/collections/large-plants' }
      ],
      cards: [
        {
          title: 'Bàng Singapore Đại',
          image: 'https://images.unsplash.com/photo-1597055181300-e3633a207518?auto=format&fit=crop&q=80&w=600',
          href: '/collections/large-plants'
        },
        {
          title: 'Trầu Bà Cột Xanh Mướt',
          image: 'https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&q=80&w=600',
          href: '/collections/large-plants?difficulty=easy'
        },
        {
          title: 'Cây Hạnh Phúc Cỡ Lớn',
          image: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&q=80&w=600',
          href: '/collections/large-plants?light=medium'
        }
      ]
    }
  },
  {
    title: 'Trong Nhà',
    color: 'text-[#666] hover:text-brand-forest',
    hasMenu: true,
    view: 'collections/indoor-plants',
    menuData: {
      links: [
        { name: 'Cây Trong Nhà Bán Chạy', href: '/collections/indoor-plants?sort=rating' },
        { name: 'Cây Để Bàn Tiện Lợi', href: '/collections/indoor-plants?light=medium' },
        { name: 'Cây Dễ Chăm Sóc', href: '/collections/indoor-plants?difficulty=easy' },
        { name: 'Cây Thanh Lọc Không Khí', href: '/collections/indoor-plants' }
      ],
      cards: [
        {
          title: 'Cây Lưỡi Hổ Bền Bỉ',
          image: 'https://images.unsplash.com/photo-1596547609652-9cf5d8d76921?auto=format&fit=crop&q=80&w=600',
          href: '/collections/indoor-plants?difficulty=easy'
        },
        {
          title: 'Cây Kim Tiền May Mắn',
          image: 'https://images.unsplash.com/photo-1632203171982-cc0df6e9ceb4?auto=format&fit=crop&q=80&w=600',
          href: '/collections/indoor-plants'
        },
        {
          title: 'Trầu Bà Lá Xẻ Nam Mỹ',
          image: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&q=80&w=600',
          href: '/collections/indoor-plants?light=medium'
        }
      ]
    }
  },
  {
    title: 'Ngoài Trời',
    color: 'text-[#666] hover:text-brand-forest',
    hasMenu: true,
    view: 'collections/outdoor-plants',
    menuData: {
      links: [
        { name: 'Cây Ngoài Trời Bán Chạy', href: '/collections/outdoor-plants?sort=rating' },
        { name: 'Cây Chịu Nắng Ban Công', href: '/collections/outdoor-plants?light=bright' },
        { name: 'Cây Ăn Quả Mini', href: '/collections/outdoor-plants' },
        { name: 'Hoa Leo Giàn Rực Rỡ', href: '/collections/outdoor-plants' }
      ],
      cards: [
        {
          title: 'Cây Ô Liu Địa Trung Hải',
          image: 'https://images.unsplash.com/photo-1545167622-3a6ac756afa4?auto=format&fit=crop&q=80&w=600',
          href: '/collections/outdoor-plants'
        },
        {
          title: 'Cây Chanh Meyer Độc Đáo',
          image: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&q=80&w=600',
          href: '/collections/outdoor-plants'
        },
        {
          title: 'Hoa Giấy Leo Giàn Rực Rỡ',
          image: 'https://images.unsplash.com/photo-1525310072745-f49212b5ac6d?auto=format&fit=crop&q=80&w=600',
          href: '/collections/outdoor-plants'
        }
      ]
    }
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
