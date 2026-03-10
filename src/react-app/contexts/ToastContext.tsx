import { createContext, useContext, useState, ReactNode } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastContextType {
  showToast: (type: ToastType, message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (type: ToastType, message: string, duration = 3000) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: Toast = { id, type, message, duration };
    
    setToasts(prev => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
      }, duration);
    }
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map(toast => (
          <ToastNotification
            key={toast.id}
            toast={toast}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}

function ToastNotification({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const config = {
    success: {
      icon: CheckCircle,
      bgColor: 'bg-success',
      textColor: 'text-white',
    },
    error: {
      icon: XCircle,
      bgColor: 'bg-error',
      textColor: 'text-white',
    },
    warning: {
      icon: AlertCircle,
      bgColor: 'bg-warning',
      textColor: 'text-white',
    },
    info: {
      icon: Info,
      bgColor: 'bg-primary',
      textColor: 'text-white',
    },
  };

  const { icon: Icon, bgColor, textColor } = config[toast.type];

  return (
    <div className="animate-slideDown pointer-events-auto">
      <div className={`${bgColor} ${textColor} rounded-lg shadow-2xl px-6 py-4 flex items-center gap-3 min-w-[320px] max-w-md`}>
        <Icon size={24} className="flex-shrink-0" />
        <p className="flex-1 font-medium text-sm">{toast.message}</p>
        <button
          onClick={onClose}
          className="flex-shrink-0 hover:bg-white/20 rounded-lg p-1 transition-colors"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
}
