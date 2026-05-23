import { memo } from 'react';
import {
  Clock, Loader2, CheckCircle2, XCircle, AlertCircle,
  Check, AlertTriangle
} from 'lucide-react';

export const StatusBadge = memo(({ status }) => {
  const map = {
    pending:    { label: 'Chờ xử lý',   cls: 'bg-amber-50 text-amber-700 border-amber-200',   icon: Clock },
    processing: { label: 'Đang xử lý',  cls: 'bg-blue-50 text-blue-700 border-blue-200',       icon: Loader2 },
    completed:  { label: 'Hoàn thành',  cls: 'bg-green-50 text-green-700 border-green-200',    icon: CheckCircle2 },
    cancelled:  { label: 'Đã hủy',      cls: 'bg-red-50 text-red-700 border-red-200',          icon: XCircle },
  };
  const cfg = map[status] || { label: status, cls: 'bg-gray-50 text-gray-600 border-gray-200', icon: AlertCircle };
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 border px-2 py-0.5 rounded-sm text-[9px] font-bold uppercase tracking-wider ${cfg.cls}`}>
      <Icon size={9} />
      {cfg.label}
    </span>
  );
});

export const Toast = memo(({ toast }) => {
  if (!toast) return null;
  return (
    <div className={`fixed bottom-6 right-6 z-[200] flex items-center gap-3 px-5 py-3.5 shadow-2xl border animate-slide-up ${
      toast.type === 'error'
        ? 'bg-red-50 border-red-200 text-red-800'
        : 'bg-brand-forest border-[#1F3E35] text-brand-cream'
    }`}>
      {toast.type !== 'error' ? <Check size={14} className="text-brand-clay shrink-0" /> : <AlertTriangle size={14} className="shrink-0" />}
      <span className="text-xs font-semibold tracking-wide">{toast.message}</span>
    </div>
  );
});

export const ConfirmModal = memo(({ open, title, description, onConfirm, onCancel, loading, confirmLabel = 'Xác nhận', danger = true }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#0d231a]/60" onClick={() => !loading && onCancel()} />
      <div className="relative bg-white max-w-sm w-full border border-brand-sand shadow-2xl p-6 space-y-5 animate-fade-in modal-panel z-10">
        <div className="flex items-start gap-3">
          <AlertTriangle size={20} className={danger ? 'text-red-500 shrink-0 mt-0.5' : 'text-amber-500 shrink-0 mt-0.5'} />
          <div>
            <h4 className="font-serif text-base text-brand-forest">{title}</h4>
            <p className="text-xs text-[#666] leading-relaxed mt-1">{description}</p>
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2 border-t border-brand-sand/40">
          <button disabled={loading} onClick={onCancel} className="border border-[#bbb] hover:bg-gray-100 text-brand-charcoal text-[10px] font-bold uppercase tracking-wider px-4 py-2 cursor-pointer transition-colors disabled:opacity-40">
            Hủy bỏ
          </button>
          <button disabled={loading} onClick={onConfirm} className={`text-white text-[10px] font-bold uppercase tracking-wider px-4 py-2 flex items-center gap-1.5 cursor-pointer transition-colors disabled:opacity-50 ${danger ? 'bg-red-500 hover:bg-red-600' : 'bg-brand-forest hover:bg-brand-green'}`}>
            {loading && <Loader2 size={10} className="animate-spin" />}
            {loading ? 'Đang xử lý...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
});
