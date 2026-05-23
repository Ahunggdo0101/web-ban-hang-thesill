import { useEffect } from 'react';

const SITE_NAME = 'Cây Cảnh Nam Định';

export default function useDocumentTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
    return () => {
      document.title = SITE_NAME;
    };
  }, [title]);
}
