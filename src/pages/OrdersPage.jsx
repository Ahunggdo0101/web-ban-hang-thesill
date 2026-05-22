import MyOrders from './MyOrders';
import useDocumentTitle from '../hooks/useDocumentTitle';

export default function OrdersPage() {
  useDocumentTitle('Đơn Hàng Của Tôi');
  return (
    <MyOrders />
  );
}
