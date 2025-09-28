'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import ToastNotification, { ToastNotificationProps } from './toast-notification';

interface Toast extends Omit<ToastNotificationProps, 'onClose'> {
  id: string;
}

interface ToastContextType {
  showToast: (toast: Omit<Toast, 'id'>) => void;
  hideToast: (id: string) => void;
  clearAllToasts: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToastNotification() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToastNotification must be used within a ToastProvider');
  }
  return context;
}

interface ToastProviderProps {
  children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Date.now().toString();
    const newToast = { ...toast, id };
    setToasts(prev => [...prev, newToast]);
  }, []);

  const hideToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, hideToast, clearAllToasts }}>
      {children}
      {typeof window !== 'undefined' &&
        createPortal(
          <div className="fixed top-4 right-4 z-[9999] space-y-2 pointer-events-none">
            <div className="space-y-2 pointer-events-auto">
              {toasts.map(toast => (
                <ToastNotification
                  key={toast.id}
                  {...toast}
                  onClose={hideToast}
                />
              ))}
            </div>
          </div>,
          document.body
        )}
    </ToastContext.Provider>
  );
}