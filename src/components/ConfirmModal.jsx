import React, { useEffect, useRef } from 'react';

export default function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  secondaryLabel,
  onConfirm,
  onCancel,
  onSecondary,
  danger = false,
}) {
  const dialogRef = useRef(null);
  const previousActiveRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    previousActiveRef.current = document.activeElement;
    const firstFocusable = dialogRef.current?.querySelector('button, [href], input, select, textarea');
    if (firstFocusable) {
      setTimeout(() => firstFocusable.focus(), 0);
    }
    return () => {
      if (previousActiveRef.current?.focus) previousActiveRef.current.focus();
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
      aria-modal="true"
      role="dialog"
      aria-labelledby="confirm-modal-title"
      aria-describedby="confirm-modal-desc"
    >
      <div ref={dialogRef} className="bg-slate-800 rounded-xl shadow-2xl max-w-sm w-full p-6 text-white border border-slate-700">
        <h3 id="confirm-modal-title" className="text-lg font-bold text-purple-400 mb-2">{title}</h3>
        <p id="confirm-modal-desc" className="text-sm text-gray-300 mb-6">{message}</p>
        <div className={`flex gap-3 ${secondaryLabel && onSecondary ? 'flex-wrap' : ''}`}>
          <button
            onClick={onCancel}
            className="flex-1 min-w-[80px] bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 rounded-lg transition-all focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-slate-800"
          >
            {cancelLabel}
          </button>
          {secondaryLabel && onSecondary && (
            <button
              onClick={onSecondary}
              className="flex-1 min-w-[80px] bg-slate-600 hover:bg-slate-500 text-white font-semibold py-2 rounded-lg transition-all focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-slate-800"
            >
              {secondaryLabel}
            </button>
          )}
          <button
            onClick={onConfirm}
            className={`flex-1 min-w-[80px] font-semibold py-2 rounded-lg transition-all focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-slate-800 ${
              danger
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-purple-600 hover:bg-purple-700 text-white'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
