import { useOutletContext } from 'react-router-dom';
import Shop from './Shop';

export default function ShopPage() {
  const { searchQuery } = useOutletContext();

  return <Shop searchQuery={searchQuery} />;
}
