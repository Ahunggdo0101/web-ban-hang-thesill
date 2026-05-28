import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { API_BASE_URL } from '../config';
import useDocumentTitle from '../hooks/useDocumentTitle';
import useRecentlyViewed from '../hooks/useRecentlyViewed';
import SkeletonProductDetail from '../components/SkeletonProductDetail';
import ProductInfoSection from '../components/ProductDetail/ProductInfoSection';
import ProductDetailedTabs from '../components/ProductDetail/ProductDetailedTabs';
import RelatedProductsSection from '../components/ProductDetail/RelatedProductsSection';

export default function ProductDetailPage() {
  const { id } = useParams();
  const { addItem } = useRecentlyViewed();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError404, setIsError404] = useState(false);

  useDocumentTitle(product?.name);

  // Fetch dữ liệu sản phẩm chi tiết và sản phẩm tương tự
  useEffect(() => {
    let isSubscribed = true;
    const fetchProductDetail = async () => {
      setIsLoading(true);
      setIsError404(false);
      try {
        const res = await fetch(`${API_BASE_URL}/products/${id}`);
        if (res.status === 404) {
          if (isSubscribed) {
            setIsError404(true);
            setProduct(null);
          }
          return;
        }
        if (!res.ok) {
          throw new Error('Failed to fetch product');
        }
        const productData = await res.json();
        if (isSubscribed) {
          setProduct(productData);
          addItem(productData.id); // ghi nhận vào lịch sử xem
        }

        // Fetch sản phẩm tương tự cùng danh mục
        const relatedRes = await fetch(`${API_BASE_URL}/products?category=${productData.category}&limit=5`);
        if (relatedRes.ok) {
          const relatedData = await relatedRes.json();
          if (isSubscribed) {
            // Lọc bỏ sản phẩm hiện tại
            const filtered = (relatedData.items || []).filter(p => p.id !== productData.id).slice(0, 4);
            setRelatedProducts(filtered);
          }
        }
      } catch (err) {
        console.error('Error fetching product details:', err);
        if (isSubscribed) {
          setIsError404(true);
        }
      } finally {
        if (isSubscribed) {
          setIsLoading(false);
        }
      }
    };

    fetchProductDetail();
    return () => {
      isSubscribed = false;
    };
  }, [id, addItem]);

  // Nếu đang tải dữ liệu
  if (isLoading) {
    return <SkeletonProductDetail />;
  }

  // Nếu sản phẩm không tồn tại hoặc lỗi 404
  if (isError404 || !product) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-20 text-center space-y-6">
        <h2 className="font-serif text-3xl text-brand-forest font-light">Sản phẩm không tồn tại</h2>
        <p className="text-sm text-brand-slate max-w-md mx-auto">
          Sản phẩm bạn đang tìm kiếm không tồn tại hoặc đã bị gỡ bỏ khỏi cửa hàng của chúng tôi.
        </p>
        <Link
          to="/shop"
          className="inline-block bg-brand-forest hover:bg-brand-green text-brand-white text-xs font-bold uppercase tracking-widest px-8 py-4 transition-all animate-fade-in"
        >
          Quay lại cửa hàng
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen text-brand-forest">
      {/* Top section wrapper */}
      <div className="max-w-[1650px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-[146px] py-12 bg-white">
        <ProductInfoSection product={product} />
      </div>

      {/* Detailed Tabs với nền #f7f8f9 full-width */}
      <ProductDetailedTabs product={product} />

      {/* Bottom section wrapper */}
      <div className="max-w-[1650px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-[146px] py-16 bg-white">
        <RelatedProductsSection relatedProducts={relatedProducts} />
      </div>
    </div>
  );
}
