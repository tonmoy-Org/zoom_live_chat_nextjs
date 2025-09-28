'use client';

import { useEffect, useState } from 'react';
import { X, CircleCheck as CheckCircle, CircleAlert as AlertCircle, Info, TriangleAlert as AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface ToastNotificationProps {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  onClose: (id: string) => void;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export default function ToastNotification({
  id,
  title,
  message,
  type,
  duration = 5000,
  onClose,
  action,
}: ToastNotificationProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => onClose(id), 300);
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'info':
        return <Info className="h-5 w-5 text-blue-600" />;
    }
  };

  const getStyles = () => {
    switch (type) {
      case 'success':
        return 'border-green-200 bg-green-50';
      case 'error':
        return 'border-red-200 bg-red-50';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50';
      case 'info':
        return 'border-blue-200 bg-blue-50';
    }
  };

  return (
    <Card
      className={cn(
        'w-full max-w-sm p-4 shadow-lg border transition-all duration-300 transform',
        getStyles(),
        isVisible && !isLeaving
          ? 'translate-x-0 opacity-100 scale-100'
          : 'translate-x-full opacity-0 scale-95',
        isLeaving && 'translate-x-full opacity-0 scale-95'
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {getIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm text-gray-900 mb-1">
            {title}
          </h4>
          <p className="text-sm text-gray-700 leading-relaxed">
            {message}
          </p>
          {action && (
            <div className="mt-3">
              <Button
                size="sm"
                variant="outline"
                onClick={action.onClick}
                className="text-xs h-7"
              >
                {action.label}
              </Button>
            </div>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleClose}
          className="h-6 w-6 text-gray-400 hover:text-gray-600 flex-shrink-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
}