import { useToast } from '../context/ToastContext';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export default function ToastContainer() {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-3 max-w-sm w-full px-4 sm:px-0">
      {toasts.map((toast) => {
        let Icon = Info;
        let iconColor = 'text-brand-clay';
        let borderColor = 'border-l-brand-clay';
        
        if (toast.type === 'success') {
          Icon = CheckCircle2;
          iconColor = 'text-brand-forest';
          borderColor = 'border-l-brand-forest';
        } else if (toast.type === 'error') {
          Icon = AlertTriangle;
          iconColor = 'text-red-600';
          borderColor = 'border-l-red-600';
        }

        return (
          <div
            key={toast.id}
            className={`flex items-start gap-3 bg-brand-white border border-brand-sand ${borderColor} border-l-4 p-4 shadow-lg animate-slide-left rounded-none text-left`}
          >
            <div className={`shrink-0 mt-0.5 ${iconColor}`}>
              <Icon size={18} className="stroke-1.5" />
            </div>
            
            <div className="flex-grow">
              <p className="text-xs font-bold text-brand-charcoal leading-relaxed font-sans">
                {toast.message}
              </p>
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="shrink-0 text-brand-slate hover:text-brand-charcoal transition-colors cursor-pointer"
              aria-label="Đóng thông báo"
            >
              <X size={14} className="stroke-2" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
