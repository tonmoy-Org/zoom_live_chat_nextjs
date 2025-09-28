'use client';

import { TriangleAlert as AlertTriangle, CircleCheck as CheckCircle, Info, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

export interface ValidationAlertProps {
  type: 'error' | 'warning' | 'success' | 'info';
  title?: string;
  message: string;
  onClose?: () => void;
  className?: string;
  actions?: Array<{
    label: string;
    onClick: () => void;
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  }>;
}

export default function ValidationAlert({
  type,
  title,
  message,
  onClose,
  className,
  actions,
}: ValidationAlertProps) {
  const getIcon = () => {
    switch (type) {
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'info':
        return <Info className="h-4 w-4 text-blue-600" />;
    }
  };

  const getStyles = () => {
    switch (type) {
      case 'error':
        return 'border-red-200 bg-red-50 text-red-800';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50 text-yellow-800';
      case 'success':
        return 'border-green-200 bg-green-50 text-green-800';
      case 'info':
        return 'border-blue-200 bg-blue-50 text-blue-800';
    }
  };

  return (
    <Alert className={cn('relative', getStyles(), className)}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {getIcon()}
        </div>
        <div className="flex-1 min-w-0">
          {title && (
            <h4 className="font-semibold text-sm mb-1">
              {title}
            </h4>
          )}
          <AlertDescription className="text-sm leading-relaxed">
            {message}
          </AlertDescription>
          {actions && actions.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {actions.map((action, index) => (
                <Button
                  key={index}
                  size="sm"
                  variant={action.variant || 'outline'}
                  onClick={action.onClick}
                  className="h-7 text-xs"
                >
                  {action.label}
                </Button>
              ))}
            </div>
          )}
        </div>
        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-6 w-6 text-gray-400 hover:text-gray-600 flex-shrink-0 absolute top-2 right-2"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </Alert>
  );
}