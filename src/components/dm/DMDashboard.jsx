import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../lib/ThemeContext.jsx';
import { useI18n } from '../../i18n/I18nContext.jsx';
import { getClassDisplay, getTotalLevel } from '../../lib/characterModel.js';
import { classes as srdClasses } from '../../data/srd.js';
import { generateEncounter } from '../../lib/encounterGenerator.js';

const DM_CAMPAIGN_ID_KEY = 'dnd-dm-campaign';
const DM_CAMPAIGN_CODE_KEY = 'dnd-dm-code';

export default function DMDashboard() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { t } = useI18n();
  const isLight = theme === 'light';

  const [campaignId, setCampaignId] = useState(() => localStorage.getItem(DM_CAMPAIGN_ID_KEY) || '');
  const [campaignCode, setCampaignCode] = useState(() => localStorage.getItem(DM_CAMPAIGN_CODE_KEY) || '');
  const [campaignName, setCampaignName] = useState('');
  const [creating, setCreating] = useState(false);
  const [createName, setCreateName] = useState('');
  const [party, setParty] = useState([]);
  const [partyLoading, setPartyLoading] = useState(false);
  const [partyError, setPartyError] = useState(null);
  const [encounterRows, setEncounterRows] = useState([{ className: 'Fighter', quantity: 1 }]);
  const [encounterLevel, setEncounterLevel] = useState(1);
  const [generatedNpcs, setGeneratedNpcs] = useState([]);
  const [copySuccess, setCopySuccess] = useState(false);

  const fetchParty = useCallback(async () => {
    if (!campaignId) return;
    setPartyLoading(true);
    setPartyError(null);
    try {
      const res = await fetch(`/api/campaigns/${campaignId}/party`);
      if (!res.ok) throw new Error('Failed to load party');
      const data = await res.json();
      setParty(data.party || []);
    } catch (e) {
      setPartyError(e.message || t('dm.partyError'));
      setParty([]);
    } finally {
      setPartyLoading(false);
    }
  }, [campaignId, t]);

  useEffect(() => {
    if (campaignId) fetchParty();
  }, [campaignId, fetchParty]);

  const handleCreateCampaign = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: (createName || '').trim() || 'My Campaign' }),
      });
      if (!res.ok) throw new Error('Failed to create campaign');
      const data = await res.json();
      setCampaignId(data.campaignId);
      setCampaignCode(data.code);
      setCampaignName((createName || '').trim() || 'My Campaign');
      localStorage.setItem(DM_CAMPAIGN_ID_KEY, data.campaignId);
      localStorage.setItem(DM_CAMPAIGN_CODE_KEY, data.code);
    } catch (err) {
      setPartyError(err.message || t('dm.createError'));
    } finally {
      setCreating(false);
    }
  };

  const handleCopyCode = () => {
    if (!campaignCode) return;
    navigator.clipboard.writeText(campaignCode).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  const handleAddEncounterRow = () => {
    setEncounterRows((prev) => [...prev, { className: 'Fighter', quantity: 1 }]);
  };

  const handleEncounterRowChange = (index, field, value) => {
    setEncounterRows((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleRemoveEncounterRow = (index) => {
    setEncounterRows((prev) => prev.filter((_, i) => i !== index));
  };

  const handleGenerateEncounter = () => {
    const spec = encounterRows
      .filter((r) => r.className && r.quantity > 0)
      .map((r) => ({ className: r.className, quantity: Number(r.quantity) || 1 }));
    const npcs = generateEncounter(spec, encounterLevel);
    setGeneratedNpcs(npcs);
  };

  const handleBackToMode = () => {
    setCampaignId('');
    setCampaignCode('');
    localStorage.removeItem(DM_CAMPAIGN_ID_KEY);
    localStorage.removeItem(DM_CAMPAIGN_CODE_KEY);
    navigate('/');
  };

  const baseClasses = (srdClasses || []).map((c) => ({ id: c.id, name: c.name }));

  if (!campaignId) {
    return (
      <div
        className={`min-h-screen p-6 transition-colors ${
          isLight ? 'bg-gradient-to-br from-gray-100 via-purple-100 to-gray-100 text-gray-900' : 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white'
        }`}
      >
        <div className="max-w-md mx-auto">
          <button
            type="button"
            onClick={() => navigate('/')}
            className={`text-sm font-medium mb-6 ${isLight ? 'text-purple-600 hover:text-purple-800' : 'text-purple-300 hover:text-white'}`}
          >
            {t('general.back')}
          </button>
          <h1 className="text-2xl font-bold mb-2">{t('dm.createCampaign')}</h1>
          <p className="text-sm opacity-80 mb-6">{t('dm.createCampaignHint')}</p>
          {partyError && (
            <p className="mb-4 text-red-400 text-sm" role="alert">
              {partyError}
            </p>
          )}
          <form onSubmit={handleCreateCampaign} className="space-y-4">
            <div>
              <label htmlFor="dm-campaign-name" className="block text-sm font-medium mb-1 opacity-90">
                {t('dm.campaignName')}
              </label>
              <input
                id="dm-campaign-name"
                type="text"
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
                placeholder={t('dm.campaignNamePlaceholder')}
                className={`w-full rounded-lg px-3 py-2 border ${
                  isLight ? 'bg-white border-gray-300 text-gray-900' : 'bg-slate-700 border-slate-600 text-white'
                }`}
                aria-describedby="dm-campaign-name-hint"
              />
            </div>
            <button
              type="submit"
              disabled={creating}
              className="w-full py-3 rounded-lg font-semibold bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white"
            >
              {creating ? t('app.loading') : t('dm.create')}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen p-6 transition-colors ${
        isLight ? 'bg-gradient-to-br from-gray-100 via-purple-100 to-gray-100 text-gray-900' : 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white'
      }`}
    >
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button
            type="button"
            onClick={handleBackToMode}
            className={`text-sm font-medium ${isLight ? 'text-purple-600 hover:text-purple-800' : 'text-purple-300 hover:text-white'}`}
          >
            {t('dm.backToMode')}
          </button>
        </div>

        <section className="mb-8">
          <h2 className="text-lg font-bold mb-2">{t('dm.yourCode')}</h2>
          <div className="flex items-center gap-3 flex-wrap">
            <code
              className={`px-4 py-2 rounded-lg font-mono text-xl tracking-widest ${
                isLight ? 'bg-amber-100 text-amber-900' : 'bg-amber-900/50 text-amber-200'
              }`}
              aria-label={t('dm.campaignCode')}
            >
              {campaignCode}
            </code>
            <button
              type="button"
              onClick={handleCopyCode}
              className="px-4 py-2 rounded-lg font-medium bg-slate-700 hover:bg-slate-600 text-white"
            >
              {copySuccess ? t('dm.copied') : t('dm.copyCode')}
            </button>
          </div>
          <p id="dm-join-hint" className="text-sm opacity-80 mt-2">
            {t('dm.playersJoinHint')}
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-bold mb-2">{t('dm.party')}</h2>
          {partyLoading && <p className="text-sm opacity-80">{t('app.loading')}</p>}
          {partyError && (
            <p className="text-sm text-red-400 mb-2" role="alert">
              {partyError}
            </p>
          )}
          {!partyLoading && (
            <button
              type="button"
              onClick={fetchParty}
              className="text-sm font-medium text-purple-400 hover:text-purple-300 mb-2"
            >
              {t('dm.refresh')}
            </button>
          )}
          {!partyLoading && party.length === 0 && (
            <p className="text-sm opacity-80">{t('dm.noParty')}</p>
          )}
          {!partyLoading && party.length > 0 && (
            <ul className="space-y-2" aria-label={t('dm.party')}>
              {party.map((member, i) => {
                const c = member.character || {};
                const displayClass = getClassDisplay(c);
                const level = getTotalLevel(c);
                return (
                  <li
                    key={i}
                    className={`rounded-lg p-3 ${isLight ? 'bg-white/80 border border-gray-200' : 'bg-slate-800 border border-slate-700'}`}
                  >
                    {member.playerName && (
                      <span className="text-xs opacity-80 block">{member.playerName}</span>
                    )}
                    <span className="font-medium">{c.name || t('list.noName')}</span>
                    <span className="opacity-80"> — {displayClass} · Nivel {level}</span>
                    <span className="opacity-80"> · CA {c.AC ?? '—'} · PV {c.currentHP ?? c.maxHP ?? '—'}/{c.maxHP ?? '—'}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-bold mb-2">{t('dm.encounterGenerator')}</h2>
          <p className="text-sm opacity-80 mb-4">{t('dm.encounterGeneratorHint')}</p>
          <div className="space-y-2 mb-4">
            <label htmlFor="dm-encounter-level" className="block text-sm opacity-90">
              {t('dm.level')}
            </label>
            <input
              id="dm-encounter-level"
              type="number"
              min={1}
              max={20}
              value={encounterLevel}
              onChange={(e) => setEncounterLevel(Number(e.target.value) || 1)}
              className={`w-20 rounded px-2 py-1 border ${isLight ? 'bg-white border-gray-300' : 'bg-slate-700 border-slate-600'}`}
            />
          </div>
          {encounterRows.map((row, index) => (
            <div key={index} className="flex gap-2 items-center mb-2 flex-wrap">
              <select
                value={row.className}
                onChange={(e) => handleEncounterRowChange(index, 'className', e.target.value)}
                className={`flex-1 min-w-[120px] rounded px-2 py-2 border ${
                  isLight ? 'bg-white border-gray-300' : 'bg-slate-700 border-slate-600'
                }`}
                aria-label={t('dm.classLabel')}
              >
                {baseClasses.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
              <input
                type="number"
                min={1}
                max={20}
                value={row.quantity}
                onChange={(e) => handleEncounterRowChange(index, 'quantity', Number(e.target.value) || 1)}
                className="w-16 rounded px-2 py-2 border text-center"
                aria-label={t('dm.quantity')}
              />
              <button
                type="button"
                onClick={() => handleRemoveEncounterRow(index)}
                className="px-2 py-2 rounded text-red-400 hover:bg-red-900/30"
                aria-label={t('dm.removeRow')}
              >
                ×
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={handleAddEncounterRow}
            className="text-sm font-medium text-purple-400 hover:text-purple-300 mb-2"
          >
            + {t('dm.addEnemy')}
          </button>
          <br />
          <button
            type="button"
            onClick={handleGenerateEncounter}
            className="py-2 px-4 rounded-lg font-semibold bg-amber-600 hover:bg-amber-700 text-white"
          >
            {t('dm.generate')}
          </button>

          {generatedNpcs.length > 0 && (
            <div className="mt-6">
              <h3 className="font-bold mb-2">{t('dm.generatedNpcs')}</h3>
              <ul className="space-y-2" aria-live="polite">
                {generatedNpcs.map((npc, i) => (
                  <li
                    key={npc.id || i}
                    className={`rounded-lg p-3 text-sm ${isLight ? 'bg-white/80 border border-gray-200' : 'bg-slate-800 border border-slate-700'}`}
                  >
                    <strong>{npc.name}</strong> — {npc.class} nivel {npc.level} · CA {npc.AC} · PV {npc.maxHP}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
