import Wishlist from './Wishlist';
import useDocumentTitle from '../hooks/useDocumentTitle';

export default function WishlistPage() {
  useDocumentTitle('Danh Sách Yêu Thích');
  return (
    <Wishlist />
  );
}
