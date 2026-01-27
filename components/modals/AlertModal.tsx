'use client';

import { useEffect } from 'react';

interface AlertModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  onClose: () => void;
}

export const AlertModal = ({
  isOpen,
  title,
  message,
  type = 'info',
  onClose,
}: AlertModalProps) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const typeConfig = {
    success: {
      icon: 'check_circle',
      iconBg: 'bg-green-100 dark:bg-green-900/30',
      iconColor: 'text-green-600 dark:text-green-400',
    },
    error: {
      icon: 'error',
      iconBg: 'bg-red-100 dark:bg-red-900/30',
      iconColor: 'text-red-600 dark:text-red-400',
    },
    info: {
      icon: 'info',
      iconBg: 'bg-blue-100 dark:bg-blue-900/30',
      iconColor: 'text-blue-600 dark:text-blue-400',
    },
    warning: {
      icon: 'warning',
      iconBg: 'bg-yellow-100 dark:bg-yellow-900/30',
      iconColor: 'text-yellow-600 dark:text-yellow-400',
    },
  };

  const config = typeConfig[type];

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="alert-modal-title"
      aria-describedby="alert-modal-description"
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" />
      <div
        className="relative bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 pb-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-4">
            <div className={`flex-shrink-0 w-12 h-12 rounded-full ${config.iconBg} flex items-center justify-center`}>
              <span className={`material-symbols-outlined ${config.iconColor} text-[24px]`}>
                {config.icon}
              </span>
            </div>
            <div className="flex-1">
              <h3
                id="alert-modal-title"
                className="text-lg font-bold text-slate-900 dark:text-white"
              >
                {title}
              </h3>
            </div>
          </div>
        </div>
        <div className="p-6">
          <p
            id="alert-modal-description"
            className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-line"
          >
            {message}
          </p>
        </div>
        <div className="flex items-center justify-end gap-3 p-6 pt-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 rounded-lg transition-colors"
            aria-label="Close"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};
