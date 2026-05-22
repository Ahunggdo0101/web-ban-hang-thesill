import Admin from './Admin/index';
import useDocumentTitle from '../hooks/useDocumentTitle';

export default function AdminPage() {
  useDocumentTitle('Bảng Quản Trị');
  return (
    <Admin />
  );
}
