import React from 'react';
import { t } from '../i18n/index.js';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center text-white p-4">
          <div className="text-center max-w-md">
            <h1 className="text-2xl font-bold text-red-400 mb-4">{t('error.title')}</h1>
            <p className="text-gray-300 mb-6">{t('error.message')}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-all focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-slate-900"
              >
                {t('error.reload')}
              </button>
              <a
                href="/"
                className="bg-slate-600 hover:bg-slate-500 text-white font-semibold py-3 px-6 rounded-xl transition-all focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-slate-900 inline-block"
              >
                {t('error.goHome')}
              </a>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
