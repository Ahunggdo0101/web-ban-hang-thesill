/**
 * PageLoader là một spinner siêu nhẹ sử dụng Tailwind CSS thuần túy.
 * Hiển thị tức thời khi ứng dụng tải các chunks JS động (lazy-loaded pages).
 */
export default function PageLoader() {
  return (
    <div className="flex justify-center items-center min-h-[50vh] w-full" aria-live="polite" aria-busy="true">
      <div className="animate-spin rounded-full border-t-2 border-b-2 border-brand-forest h-10 w-10"></div>
    </div>
  );
}
