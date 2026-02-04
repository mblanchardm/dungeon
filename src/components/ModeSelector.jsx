import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../lib/ThemeContext.jsx';
import { useI18n } from '../i18n/I18nContext.jsx';

export default function ModeSelector() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { t } = useI18n();
  const isLight = theme === 'light';

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-center p-6 transition-colors ${
        isLight
          ? 'bg-gradient-to-br from-gray-100 via-purple-100 to-gray-100 text-gray-900'
          : 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white'
      }`}
    >
      <h1 className="text-2xl font-bold mb-2">{t('app.title')}</h1>
      <p className="text-sm opacity-80 mb-8">{t('dm.chooseMode')}</p>
      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
        <button
          type="button"
          onClick={() => navigate('/player')}
          className={`flex-1 py-4 px-6 rounded-xl font-semibold text-lg transition-all ${
            isLight
              ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg'
              : 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg'
          }`}
          aria-label={t('dm.modePlayer')}
        >
          {t('dm.modePlayer')}
        </button>
        <button
          type="button"
          onClick={() => navigate('/dm')}
          className={`flex-1 py-4 px-6 rounded-xl font-semibold text-lg transition-all ${
            isLight
              ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-lg'
              : 'bg-amber-600 hover:bg-amber-500 text-white shadow-lg'
          }`}
          aria-label={t('dm.modeDM')}
        >
          {t('dm.modeDM')}
        </button>
      </div>
    </div>
  );
}
