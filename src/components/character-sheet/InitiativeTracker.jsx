import React, { useState, useEffect, useRef } from 'react';

export default function InitiativeTracker({
  character,
  update,
  onClose,
}) {
  const encounter = character?.currentEncounter ?? { order: [], currentIndex: 0 };
  const order = encounter.order ?? [];
  const currentIndex = encounter.currentIndex ?? 0;
  const [newName, setNewName] = useState('');
  const [newInitiative, setNewInitiative] = useState('');
  const modalRef = useRef(null);
  const previousActiveRef = useRef(null);

  useEffect(() => {
    previousActiveRef.current = document.activeElement;
    const first = modalRef.current?.querySelector('button, input');
    if (first) setTimeout(() => first.focus(), 0);
    return () => { previousActiveRef.current?.focus?.(); };
  }, []);

  const addCombatant = (name, initiative, isPlayer = false) => {
    const entry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      name,
      initiative: Number(initiative) || 0,
      isPlayer,
    };
    const next = [...order, entry].sort((a, b) => (b.initiative || 0) - (a.initiative || 0));
    update({
      currentEncounter: {
        order: next,
        currentIndex: Math.min(currentIndex, next.length - 1),
      },
    });
    setNewName('');
    setNewInitiative('');
  };

  const removeCombatant = (id) => {
    const idx = order.findIndex((e) => e.id === id);
    const next = order.filter((e) => e.id !== id);
    const newIndex = idx <= currentIndex && currentIndex > 0
      ? Math.max(0, currentIndex - 1)
      : Math.min(currentIndex, next.length - 1);
    update({
      currentEncounter: { order: next, currentIndex: Math.max(0, newIndex) },
    });
  };

  const nextTurn = () => {
    const next = (currentIndex + 1) % Math.max(1, order.length);
    update({
      currentEncounter: { ...encounter, currentIndex: next },
      actionUsed: { action: false, bonusAction: false, reaction: false },
    });
  };

  const newRound = () => {
    update({
      currentEncounter: { ...encounter, currentIndex: 0 },
      actionUsed: { action: false, bonusAction: false, reaction: false },
    });
  };

  const endEncounter = () => {
    update({ currentEncounter: null });
    onClose?.();
  };

  const rollPCInitiative = () => {
    const dexMod = Math.floor(((character?.abilityScores?.dex ?? 10) - 10) / 2);
    const initBonus = character?.initiativeBonus ?? 0;
    const roll = Math.floor(Math.random() * 20) + 1;
    const total = roll + dexMod + initBonus;
    addCombatant(character?.name || 'Personaje', total, true);
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" aria-modal="true" role="dialog" aria-labelledby="initiative-tracker-title">
      <div ref={modalRef} className="bg-slate-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 id="initiative-tracker-title" className="text-xl font-bold text-amber-400">Orden de iniciativa</h2>
          <button
            onClick={onClose}
            aria-label="Cerrar orden de iniciativa"
            className="text-gray-400 hover:text-white text-2xl leading-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-slate-800 rounded"
          >
            ×
          </button>
        </div>

        {/* Add PC */}
        <div className="mb-4">
          <button
            onClick={rollPCInitiative}
            aria-label="Tirar iniciativa del personaje"
            className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold py-2 rounded-lg text-sm focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-slate-800"
          >
            Tirar iniciativa (personaje)
          </button>
        </div>

        {/* Add NPC */}
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Nombre"
            aria-label="Nombre del combatiente"
            className="flex-1 bg-slate-700 text-white rounded px-3 py-2 text-sm"
          />
          <input
            type="number"
            value={newInitiative}
            onChange={(e) => setNewInitiative(e.target.value)}
            placeholder="Init"
            aria-label="Iniciativa"
            className="w-16 bg-slate-700 text-white rounded px-2 py-2 text-sm focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-slate-800"
          />
          <button
            onClick={() => addCombatant(newName || 'Enemigo', newInitiative, false)}
            aria-label="Añadir combatiente"
            className="bg-slate-600 hover:bg-slate-500 text-white px-3 py-2 rounded text-sm focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-slate-800"
          >
            +
          </button>
        </div>

        {/* Order */}
        <div className="space-y-2 mb-4">
          {order.map((entry, i) => (
            <div
              key={entry.id}
              className={`flex items-center justify-between rounded-lg p-2 ${
                i === currentIndex ? 'bg-amber-900/50 border border-amber-500' : 'bg-slate-700'
              }`}
            >
              <span className="font-medium text-white">
                {i + 1}. {entry.name} (Init {entry.initiative})
              </span>
              <button
                onClick={() => removeCombatant(entry.id)}
                aria-label={`Quitar ${entry.name}`}
                className="text-red-400 hover:text-red-300 text-lg leading-none focus:ring-2 focus:ring-amber-400 rounded"
              >
                ×
              </button>
            </div>
          ))}
        </div>

        {order.length > 0 && (
          <div className="flex gap-2">
            <button
              onClick={nextTurn}
              className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-semibold py-2 rounded-lg text-sm focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-slate-800"
            >
              Siguiente turno
            </button>
            <button
              onClick={newRound}
              className="flex-1 bg-slate-600 hover:bg-slate-500 text-white font-semibold py-2 rounded-lg text-sm focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-slate-800"
            >
              Nueva ronda
            </button>
          </div>
        )}

        <button
          onClick={endEncounter}
          className="w-full mt-2 bg-red-900 hover:bg-red-800 text-white font-semibold py-2 rounded-lg text-sm focus:ring-2 focus:ring-red-400 focus:ring-offset-2 focus:ring-offset-slate-800"
        >
          Fin de encuentro
        </button>
      </div>
    </div>
  );
}
