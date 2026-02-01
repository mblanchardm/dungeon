import React from 'react';

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
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" aria-modal="true" role="dialog">
      <div className="bg-slate-800 rounded-xl shadow-2xl max-w-sm w-full p-6 text-white border border-slate-700">
        <h3 className="text-lg font-bold text-purple-400 mb-2">{title}</h3>
        <p className="text-sm text-gray-300 mb-6">{message}</p>
        <div className={`flex gap-3 ${secondaryLabel && onSecondary ? 'flex-wrap' : ''}`}>
          <button
            onClick={onCancel}
            className="flex-1 min-w-[80px] bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 rounded-lg transition-all"
          >
            {cancelLabel}
          </button>
          {secondaryLabel && onSecondary && (
            <button
              onClick={onSecondary}
              className="flex-1 min-w-[80px] bg-slate-600 hover:bg-slate-500 text-white font-semibold py-2 rounded-lg transition-all"
            >
              {secondaryLabel}
            </button>
          )}
          <button
            onClick={onConfirm}
            className={`flex-1 min-w-[80px] font-semibold py-2 rounded-lg transition-all ${
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
