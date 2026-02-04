import React, { useState } from 'react';
import { useTheme } from '../lib/ThemeContext.jsx';
import { useI18n } from '../i18n/I18nContext.jsx';

const JOINED_CAMPAIGN_CODE_KEY = 'dnd-joined-campaign';

export default function JoinCampaign({ characters, onBack, onJoined }) {
  const { theme } = useTheme();
  const { t } = useI18n();
  const isLight = theme === 'light';

  const [code, setCode] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [selectedCharacterId, setSelectedCharacterId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const codeNorm = (code || '').toUpperCase().trim();
    if (!codeNorm) {
      setError(t('dm.enterCode'));
      return;
    }
    const character = characters.find((c) => c.id === selectedCharacterId);
    if (!character) {
      setError(t('dm.selectCharacter'));
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const byCodeRes = await fetch(`/api/campaigns/by-code/${encodeURIComponent(codeNorm)}`);
      if (!byCodeRes.ok) {
        const data = await byCodeRes.json().catch(() => ({}));
        throw new Error(data.error || t('dm.invalidCode'));
      }
      const { campaignId } = await byCodeRes.json();
      const joinRes = await fetch(`/api/campaigns/${campaignId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: codeNorm,
          playerName: (playerName || '').trim() || undefined,
          character,
        }),
      });
      if (!joinRes.ok) {
        const data = await joinRes.json().catch(() => ({}));
        throw new Error(data.error || t('dm.joinFailed'));
      }
      localStorage.setItem(JOINED_CAMPAIGN_CODE_KEY, codeNorm);
      setSuccess(true);
      setTimeout(() => {
        onJoined?.();
      }, 1500);
    } catch (err) {
      setError(err.message || t('dm.joinFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div
        className={`min-h-screen flex flex-col items-center justify-center p-6 ${
          isLight ? 'bg-gradient-to-br from-gray-100 via-purple-100 to-gray-100 text-gray-900' : 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white'
        }`}
      >
        <p className="text-lg font-medium text-green-600 dark:text-green-400 mb-4" role="status">
          {t('dm.joinSuccess')}
        </p>
        <button
          type="button"
          onClick={onJoined}
          className="py-2 px-4 rounded-lg font-medium bg-purple-600 hover:bg-purple-700 text-white"
        >
          {t('general.back')}
        </button>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen p-6 transition-colors ${
        isLight ? 'bg-gradient-to-br from-gray-100 via-purple-100 to-gray-100 text-gray-900' : 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white'
      }`}
    >
      <div className="max-w-md mx-auto">
        <button
          type="button"
          onClick={onBack}
          className={`text-sm font-medium mb-6 ${isLight ? 'text-purple-600 hover:text-purple-800' : 'text-purple-300 hover:text-white'}`}
        >
          {t('general.back')}
        </button>
        <h1 className="text-2xl font-bold mb-2">{t('dm.joinCampaign')}</h1>
        <p className="text-sm opacity-80 mb-6">{t('dm.joinCampaignHint')}</p>

        {error && (
          <p className="mb-4 text-red-400 text-sm" role="alert">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="join-code" className="block text-sm font-medium mb-1 opacity-90">
              {t('dm.enterCode')}
            </label>
            <input
              id="join-code"
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="ABC123"
              className={`w-full rounded-lg px-3 py-2 border font-mono uppercase ${
                isLight ? 'bg-white border-gray-300 text-gray-900' : 'bg-slate-700 border-slate-600 text-white'
              }`}
              maxLength={10}
              aria-required="true"
            />
          </div>
          <div>
            <label htmlFor="join-player-name" className="block text-sm font-medium mb-1 opacity-90">
              {t('dm.playerName')}
            </label>
            <input
              id="join-player-name"
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder={t('dm.playerNamePlaceholder')}
              className={`w-full rounded-lg px-3 py-2 border ${
                isLight ? 'bg-white border-gray-300 text-gray-900' : 'bg-slate-700 border-slate-600 text-white'
              }`}
            />
          </div>
          <div>
            <label htmlFor="join-character" className="block text-sm font-medium mb-1 opacity-90">
              {t('dm.selectCharacter')}
            </label>
            <select
              id="join-character"
              value={selectedCharacterId}
              onChange={(e) => setSelectedCharacterId(e.target.value)}
              required
              className={`w-full rounded-lg px-3 py-2 border ${
                isLight ? 'bg-white border-gray-300 text-gray-900' : 'bg-slate-700 border-slate-600 text-white'
              }`}
            >
              <option value="">— {t('dm.chooseCharacter')} —</option>
              {(characters || []).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name || t('list.noName')} ({c.class || ''} {c.level ?? 1})
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-lg font-semibold bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white"
          >
            {submitting ? t('app.loading') : t('dm.join')}
          </button>
        </form>
      </div>
    </div>
  );
}
