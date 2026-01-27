'use client';

import { useState, useEffect } from 'react';

interface SetReminderModalProps {
  isOpen: boolean;
  currentReminderDate?: string;
  dueDate?: string;
  onSetReminder: (reminderDate: string | null) => void;
  onClose: () => void;
}

export const SetReminderModal = ({
  isOpen,
  currentReminderDate,
  dueDate,
  onSetReminder,
  onClose,
}: SetReminderModalProps) => {
  const [reminderType, setReminderType] = useState<'custom' | '1hour' | '1day' | '3days' | '1week' | null>(
    currentReminderDate ? 'custom' : null
  );
  const [customDate, setCustomDate] = useState('');
  const [customTime, setCustomTime] = useState('09:00');

  useEffect(() => {
    if (isOpen) {
      if (currentReminderDate) {
        const date = new Date(currentReminderDate);
        setCustomDate(date.toISOString().split('T')[0]);
        setCustomTime(date.toTimeString().slice(0, 5));
        setReminderType('custom');
      } else {
        setReminderType(null);
        setCustomDate('');
        setCustomTime('09:00');
      }
    }
  }, [isOpen, currentReminderDate]);

  if (!isOpen) return null;

  const calculateReminderDate = (type: string): string => {
    const now = new Date();
    const due = dueDate ? new Date(dueDate) : null;
    let reminder = new Date();

    switch (type) {
      case '1hour':
        reminder.setHours(now.getHours() + 1);
        break;
      case '1day':
        reminder.setDate(now.getDate() + 1);
        reminder.setHours(9, 0, 0, 0);
        break;
      case '3days':
        reminder.setDate(now.getDate() + 3);
        reminder.setHours(9, 0, 0, 0);
        break;
      case '1week':
        reminder.setDate(now.getDate() + 7);
        reminder.setHours(9, 0, 0, 0);
        break;
      case 'custom':
        if (customDate && customTime) {
          const [hours, minutes] = customTime.split(':');
          reminder = new Date(customDate);
          reminder.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        }
        break;
    }

    // Don't set reminder after due date
    if (due && reminder > due) {
      reminder = new Date(due);
      reminder.setHours(9, 0, 0, 0);
    }

    return reminder.toISOString();
  };

  const handleSetReminder = () => {
    if (!reminderType) {
      onSetReminder(null);
      onClose();
      return;
    }

    if (reminderType === 'custom' && (!customDate || !customTime)) {
      return;
    }

    const reminderDate = calculateReminderDate(reminderType);
    onSetReminder(reminderDate);
    onClose();
  };

  const handleRemoveReminder = () => {
    onSetReminder(null);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-md mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Set Reminder</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            aria-label="Close"
          >
            <span className="material-symbols-outlined text-[24px]">close</span>
          </button>
        </div>

        <div className="p-6 space-y-4">
          {dueDate && (
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                <span className="font-medium">Due Date:</span> {new Date(dueDate).toLocaleDateString()}
              </p>
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Reminder Options
            </label>
            <div className="space-y-2">
              {[
                { value: '1hour', label: '1 hour before due date' },
                { value: '1day', label: '1 day before due date' },
                { value: '3days', label: '3 days before due date' },
                { value: '1week', label: '1 week before due date' },
                { value: 'custom', label: 'Custom date & time' },
              ].map((option) => (
                <label
                  key={option.value}
                  className="flex items-center gap-3 p-3 border border-slate-200 dark:border-slate-700 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  <input
                    type="radio"
                    name="reminderType"
                    value={option.value}
                    checked={reminderType === option.value}
                    onChange={(e) => setReminderType(e.target.value as any)}
                    className="text-primary focus:ring-primary"
                  />
                  <span className="text-sm text-slate-700 dark:text-slate-300">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {reminderType === 'custom' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={customDate}
                  onChange={(e) => setCustomDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  max={dueDate ? new Date(dueDate).toISOString().split('T')[0] : undefined}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Time
                </label>
                <input
                  type="time"
                  value={customTime}
                  onChange={(e) => setCustomTime(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          )}

          {currentReminderDate && (
            <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
              <button
                onClick={handleRemoveReminder}
                className="w-full px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors text-sm font-medium"
              >
                Remove Reminder
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200 dark:border-slate-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors text-sm font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSetReminder}
            disabled={reminderType === 'custom' && (!customDate || !customTime)}
            className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {reminderType ? 'Set Reminder' : 'Clear Reminder'}
          </button>
        </div>
      </div>
    </div>
  );
};
