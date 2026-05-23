import { useEffect } from 'react';

const SITE_NAME = 'Cây Cảnh Đỗ Xuân Hùng';

export default function useDocumentTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
    return () => {
      document.title = SITE_NAME;
    };
  }, [title]);
}
