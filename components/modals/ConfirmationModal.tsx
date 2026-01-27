'use client';

import { useEffect } from 'react';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmationModal = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'warning',
  onConfirm,
  onCancel,
}: ConfirmationModalProps) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const typeConfig = {
    danger: {
      icon: 'delete',
      iconBg: 'bg-red-100 dark:bg-red-900/30',
      iconColor: 'text-red-600 dark:text-red-400',
      buttonBg: 'bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700',
    },
    warning: {
      icon: 'warning',
      iconBg: 'bg-yellow-100 dark:bg-yellow-900/30',
      iconColor: 'text-yellow-600 dark:text-yellow-400',
      buttonBg: 'bg-yellow-600 hover:bg-yellow-700 dark:bg-yellow-600 dark:hover:bg-yellow-700',
    },
    info: {
      icon: 'info',
      iconBg: 'bg-blue-100 dark:bg-blue-900/30',
      iconColor: 'text-blue-600 dark:text-blue-400',
      buttonBg: 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700',
    },
  };

  const config = typeConfig[type];

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirmation-modal-title"
      aria-describedby="confirmation-modal-description"
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
                id="confirmation-modal-title"
                className="text-lg font-bold text-slate-900 dark:text-white"
              >
                {title}
              </h3>
              <p
                id="confirmation-modal-description"
                className="text-sm text-slate-500 dark:text-slate-400 mt-1"
              >
                {message}
              </p>
            </div>
          </div>
        </div>
        <div className="p-6">
          <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-line">
            {message}
          </p>
        </div>
        <div className="flex items-center justify-end gap-3 p-6 pt-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
            aria-label="Cancel"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-sm font-medium text-white ${config.buttonBg} rounded-lg transition-colors flex items-center gap-2 shadow-sm`}
            aria-label="Confirm"
          >
            <span className="material-symbols-outlined text-[18px]">{config.icon}</span>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
