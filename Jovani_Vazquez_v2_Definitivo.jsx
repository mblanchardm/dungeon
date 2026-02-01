import React, { useState } from 'react';

export default function JovaniGuide() {
  const [activeTab, setActiveTab] = useState('resumen');
  const [currentHP, setCurrentHP] = useState(23);
  const [maxHP] = useState(23);
  const [inspiration, setInspiration] = useState(4);
  const [spell1Slots, setSpell1Slots] = useState(4);
  const [spell2Slots, setSpell2Slots] = useState(3);
  const [gold, setGold] = useState(43);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-md mx-auto">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-purple-600 rounded-2xl p-6 mb-6 shadow-2xl">
          <h1 className="text-3xl font-bold text-white mb-1">🎭 Jovani Vázquez</h1>
          <p className="text-sm text-purple-100">Bardo Tiefling • Nivel 4</p>
          <p className="text-xs text-purple-200">Colegio del Conocimiento</p>
        </div>

        {/* Quick Stats - Editable */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-gradient-to-br from-red-500 to-red-700 rounded-xl p-4 text-white">
            <div className="text-xs uppercase tracking-wide opacity-90 mb-1">HP</div>
            <div className="flex items-center gap-2">
              <input 
                type="number" 
                value={currentHP}
                onChange={(e) => setCurrentHP(Math.min(maxHP, Math.max(0, parseInt(e.target.value) || 0)))}
                className="w-12 text-3xl font-bold bg-transparent border-b-2 border-white"
              />
              <span className="text-2xl font-bold">/{maxHP}</span>
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl p-4 text-white text-center">
            <div className="text-xs uppercase tracking-wide opacity-90 mb-1">AC</div>
            <div className="text-4xl font-bold">13</div>
          </div>
          <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl p-4 text-white text-center">
            <div className="text-xs uppercase tracking-wide opacity-90 mb-1">CD</div>
            <div className="text-4xl font-bold">16</div>
          </div>
          <div className="bg-gradient-to-br from-pink-500 to-pink-700 rounded-xl p-4 text-white">
            <div className="text-xs uppercase tracking-wide opacity-90 mb-1">Inspiración</div>
            <div className="flex items-center justify-center gap-2">
              <button onClick={() => setInspiration(Math.max(0, inspiration - 1))} className="text-2xl font-bold">−</button>
              <span className="text-3xl font-bold">{inspiration}</span>
              <button onClick={() => setInspiration(Math.min(4, inspiration + 1))} className="text-2xl font-bold">+</button>
            </div>
          </div>
        </div>

        {/* Spell Slots */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-slate-800 rounded-xl p-4 text-white">
            <div className="text-xs uppercase tracking-wide text-gray-400 mb-2">Hechizos Nv.1</div>
            <div className="flex items-center justify-center gap-2">
              <button onClick={() => setSpell1Slots(Math.max(0, spell1Slots - 1))} className="text-xl font-bold text-blue-400">−</button>
              <span className="text-2xl font-bold">{spell1Slots}/4</span>
              <button onClick={() => setSpell1Slots(Math.min(4, spell1Slots + 1))} className="text-xl font-bold text-blue-400">+</button>
            </div>
          </div>
          <div className="bg-slate-800 rounded-xl p-4 text-white">
            <div className="text-xs uppercase tracking-wide text-gray-400 mb-2">Hechizos Nv.2</div>
            <div className="flex items-center justify-center gap-2">
              <button onClick={() => setSpell2Slots(Math.max(0, spell2Slots - 1))} className="text-xl font-bold text-indigo-400">−</button>
              <span className="text-2xl font-bold">{spell2Slots}/3</span>
              <button onClick={() => setSpell2Slots(Math.min(3, spell2Slots + 1))} className="text-xl font-bold text-indigo-400">+</button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {['resumen', 'combate', 'hechizos', 'social', 'equipo', 'tacticas'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg font-semibold text-sm whitespace-nowrap transition-all ${
                activeTab === tab
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'bg-slate-800 text-gray-300'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="bg-slate-800 rounded-xl p-4 shadow-2xl text-white mb-6">
          
          {activeTab === 'resumen' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-purple-400 mb-4">📊 Atributos</h2>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-slate-700 rounded-lg p-3 text-center">
                    <div className="text-3xl font-bold text-red-400">+5</div>
                    <div className="text-xs mt-1 text-gray-300">CHA 20</div>
                  </div>
                  <div className="bg-slate-700 rounded-lg p-3 text-center">
                    <div className="text-3xl font-bold text-green-400">+2</div>
                    <div className="text-xs mt-1 text-gray-300">DEX 14</div>
                  </div>
                  <div className="bg-slate-700 rounded-lg p-3 text-center">
                    <div className="text-3xl font-bold text-blue-400">+2</div>
                    <div className="text-xs mt-1 text-gray-300">INT 14</div>
                  </div>
                  <div className="bg-slate-700 rounded-lg p-3 text-center">
                    <div className="text-3xl font-bold text-orange-400">+1</div>
                    <div className="text-xs mt-1 text-gray-300">CON 12</div>
                  </div>
                  <div className="bg-slate-700 rounded-lg p-3 text-center">
                    <div className="text-3xl font-bold text-gray-400">+0</div>
                    <div className="text-xs mt-1 text-gray-300">WIS 10</div>
                  </div>
                  <div className="bg-slate-700 rounded-lg p-3 text-center">
                    <div className="text-3xl font-bold text-red-500">-2</div>
                    <div className="text-xs mt-1 text-gray-300">STR 8</div>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-bold text-purple-400 mb-3">🎯 Skills</h2>
                <div className="space-y-2">
                  <div className="bg-slate-700 rounded-lg p-3 flex justify-between items-center">
                    <span className="text-sm">⭐ <strong>Deception</strong></span>
                    <span className="text-xl font-bold text-yellow-400">+9</span>
                  </div>
                  <div className="bg-slate-700 rounded-lg p-3 flex justify-between items-center">
                    <span className="text-sm">⭐ <strong>Performance</strong></span>
                    <span className="text-xl font-bold text-yellow-400">+9</span>
                  </div>
                  <div className="bg-slate-700 rounded-lg p-3 flex justify-between items-center">
                    <span className="text-sm"><strong>Intimidation</strong></span>
                    <span className="text-xl font-bold text-red-400">+7</span>
                  </div>
                  <div className="bg-slate-700 rounded-lg p-3 flex justify-between items-center">
                    <span className="text-sm"><strong>Persuasion</strong> 🆕</span>
                    <span className="text-xl font-bold text-purple-400">+7</span>
                  </div>
                  <div className="bg-slate-700 rounded-lg p-3 flex justify-between items-center">
                    <span className="text-sm"><strong>Arcana</strong> 🆕</span>
                    <span className="text-xl font-bold text-blue-400">+4</span>
                  </div>
                  <div className="bg-slate-700 rounded-lg p-3 flex justify-between items-center">
                    <span className="text-sm"><strong>Stealth</strong> 🆕</span>
                    <span className="text-xl font-bold text-green-400">+4</span>
                  </div>
                  <div className="bg-slate-700 rounded-lg p-3 flex justify-between items-center">
                    <span className="text-sm"><strong>Insight</strong></span>
                    <span className="text-xl font-bold text-blue-400">+2</span>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-bold text-purple-400 mb-3">🔥 Rasgos Tiefling</h2>
                <div className="bg-slate-700 rounded-lg p-3 space-y-2 text-sm">
                  <p>• Visión oscuridad 60 pies</p>
                  <p>• Resistencia fuego</p>
                  <p>• Prestidigitación (truco)</p>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-bold text-yellow-400 mb-3">📚 Colegio del Conocimiento</h2>
                <div className="bg-slate-700 rounded-lg p-3 space-y-2 text-sm">
                  <p className="font-bold text-purple-400">✨ Palabras Cortantes</p>
                  <p><strong>Reacción:</strong> Cuando enemigo ataca/chequea/hace daño</p>
                  <p><strong>Costo:</strong> 1 Inspiración Barda</p>
                  <p><strong>Efecto:</strong> Restas 1d6 de su resultado</p>
                  <p className="text-yellow-400">💡 Puede hacer fallar ataques críticos</p>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-bold text-orange-400 mb-3">🎵 Equipamiento</h2>
                <div className="bg-slate-700 rounded-lg p-3 space-y-1 text-sm">
                  <p>⭐ Bandurín de Fochulan (+1 CD y ataque)</p>
                  <p>⭐ Daga del Torturador (+1, 1d4 extra vs heridos)</p>
                  <p>• Escudo Escarabaño</p>
                  <p>• Kit médico, Manta, Cuerno</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'combate' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-red-400 mb-3">⚔️ Armas</h2>
                <div className="space-y-3">
                  <div className="bg-gradient-to-r from-red-700 to-red-900 rounded-lg p-4 border-2 border-red-500">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-bold text-red-300">Daga del Torturador ⭐</h3>
                      <span className="text-xs bg-purple-600 px-2 py-1 rounded">Equipada</span>
                    </div>
                    <div className="space-y-1 text-sm text-gray-100">
                      <p><strong>Ataque:</strong> +5 (DEX +2, Prof +2, Mágica +1)</p>
                      <p><strong>Daño:</strong> 1d6+3 perforante</p>
                      <p className="text-yellow-300"><strong>⚡ Especial:</strong> +1d4 si objetivo tiene menos HP que tú</p>
                      <p className="text-xs text-gray-400">Finesse, Arrojadiza (20-60 pies), Ligera</p>
                    </div>
                  </div>
                  <div className="bg-slate-700 rounded-lg p-3">
                    <h3 className="text-lg font-bold text-purple-400">Estoque</h3>
                    <p className="text-sm text-gray-300">+4 ataque, 1d8+2 perforante</p>
                  </div>
                  <div className="bg-slate-700 rounded-lg p-3">
                    <h3 className="text-lg font-bold text-purple-400">Daga Normal</h3>
                    <p className="text-sm text-gray-300">+4 ataque, 1d4+2 perforante, arrojadiza</p>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-bold text-purple-400 mb-3">🎵 Inspiración Barda</h2>
                <div className="bg-slate-700 rounded-lg p-3 space-y-2 text-sm">
                  <p><strong>Acción Bonus:</strong> Das 1d6 a aliado</p>
                  <p><strong>Uso:</strong> Suma a ataque/habilidad/save</p>
                  <p><strong>Usos:</strong> 4 por descanso largo</p>
                  <p className="text-yellow-400">💡 Usa antes de momentos críticos</p>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-bold text-yellow-400 mb-3">✂️ Palabras Cortantes</h2>
                <div className="bg-slate-700 rounded-lg p-3 space-y-2 text-sm">
                  <p><strong>Reacción</strong> cuando enemigo:</p>
                  <p>• Hace tirada de ataque</p>
                  <p>• Hace chequeo de habilidad</p>
                  <p>• Hace tirada de daño</p>
                  <p className="text-red-400"><strong>Efecto:</strong> Restas 1d6 de su resultado</p>
                  <p className="text-yellow-400">💡 Puede evitar ataques críticos o fallar saves</p>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-bold text-orange-400 mb-3">💡 Estrategia de Combate</h2>
                <div className="bg-slate-700 rounded-lg p-3 space-y-2 text-sm">
                  <p>✓ Posición: Retaguardia (23 HP es frágil)</p>
                  <p>✓ Turno 1: Inspiración (bonus) + Burla Viciosa/Sugerencia</p>
                  <p>✓ Defensa: Palabras Cortantes vs ataques fuertes</p>
                  <p>✓ Emergencia: Palabra Curativa cuando aliado cae a 0</p>
                  <p>✓ Control: Sugerencia para neutralizar enemigos clave</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'hechizos' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg p-3 text-center">
                <p className="text-lg font-bold">CD: 16 • Ataque: +8</p>
                <p className="text-xs text-purple-100">+1 por Bandurín de Fochulan</p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-yellow-400 mb-3">🔮 Trucos (ilimitados)</h2>
                <div className="space-y-2">
                  <div className="bg-slate-700 rounded-lg p-3">
                    <h3 className="font-bold text-orange-400">Prestidigitación</h3>
                    <p className="text-xs text-gray-300 mt-1">Efectos menores, trucos de mano, distracciones</p>
                  </div>
                  <div className="bg-slate-700 rounded-lg p-3">
                    <h3 className="font-bold text-purple-400">Burla Viciosa</h3>
                    <p className="text-xs text-gray-300 mt-1">1d4 psíquico + desventaja en próximo ataque</p>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-bold text-blue-400 mb-3">✨ Nivel 1 (4 espacios)</h2>
                <div className="space-y-2">
                  <div className="bg-slate-700 rounded-lg p-3">
                    <h3 className="font-bold text-green-400">Palabra Curativa ⭐</h3>
                    <p className="text-xs text-gray-300 mt-1">Acción Bonus • 1d4+5 curación • 60 pies</p>
                    <p className="text-xs text-yellow-400 mt-1">Perfecto para revivir aliados caídos</p>
                  </div>
                  <div className="bg-slate-700 rounded-lg p-3">
                    <h3 className="font-bold text-blue-400">Onda Atronadora</h3>
                    <p className="text-xs text-gray-300 mt-1">Cono 15 pies • 2d8 trueno + empuje • CON 16</p>
                  </div>
                  <div className="bg-slate-700 rounded-lg p-3">
                    <h3 className="font-bold text-pink-400">Hechizar Persona</h3>
                    <p className="text-xs text-gray-300 mt-1">Hostil → Amistoso • WIS 16 • 1 hora</p>
                  </div>
                  <div className="bg-slate-700 rounded-lg p-3">
                    <h3 className="font-bold text-purple-400">Disfrazarse</h3>
                    <p className="text-xs text-gray-300 mt-1">Cambia apariencia • 1 hora • Infiltración</p>
                  </div>
                  <div className="bg-slate-700 rounded-lg p-3">
                    <h3 className="font-bold text-cyan-400">Detectar Magia</h3>
                    <p className="text-xs text-gray-300 mt-1">Ritual • Detecta auras mágicas 30 pies</p>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-bold text-indigo-400 mb-3">⚡ Nivel 2 (3 espacios)</h2>
                <div className="space-y-3">
                  <div className="bg-gradient-to-r from-red-700 to-red-900 rounded-lg p-4 border-2 border-red-500">
                    <h3 className="font-bold text-red-300 text-lg">Sugerencia ⭐⭐⭐</h3>
                    <p className="text-sm text-gray-100 mt-2"><strong>WIS CD 16</strong> • Control mental • 8 horas (concentración)</p>
                    <p className="text-sm text-yellow-300 mt-2"><strong>Efecto:</strong> Ordenas una acción "razonable" que el objetivo cumple</p>
                    <div className="mt-3 bg-black bg-opacity-30 rounded p-2 text-xs text-gray-200">
                      <p className="font-bold text-yellow-400 mb-1">💡 Ejemplos:</p>
                      <p>✅ "Danos las llaves y vete a dormir"</p>
                      <p>✅ "Olvida que nos viste aquí"</p>
                      <p>✅ "Convence al capitán de dejarnos ir"</p>
                      <p>✅ "Llévanos ante tu líder como aliados"</p>
                      <p className="text-red-300 mt-1">❌ "Mátate" (no es razonable)</p>
                    </div>
                  </div>
                  
                  <div className="bg-slate-700 rounded-lg p-3">
                    <h3 className="font-bold text-cyan-400">Invisibilidad ⭐⭐</h3>
                    <p className="text-xs text-gray-300 mt-1">Tú o aliado invisible • 1 hora (concentración)</p>
                    <p className="text-xs text-yellow-400 mt-1">⚠️ Termina si atacas o lanzas hechizo</p>
                    <p className="text-xs text-purple-400 mt-1">Perfecto para: infiltración, exploración, escape</p>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-bold text-orange-400 mb-3">🎵 Bandurín de Fochulan (1/día)</h2>
                <div className="bg-gradient-to-r from-orange-600 to-red-600 rounded-lg p-4">
                  <h3 className="font-bold text-white text-lg">Flautista de Fochulan</h3>
                  <p className="text-sm text-gray-100 mt-2">Compulsión (nivel 4) • WIS 16 • 1 minuto</p>
                  <p className="text-sm text-yellow-200 mt-2"><strong>Efecto:</strong> Enemigos bailan y no pueden hacer reacciones</p>
                  <p className="text-xs text-purple-200 mt-2">💡 Perfecto para escapar o controlar grupos</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'social' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-yellow-600 to-orange-600 rounded-lg p-4">
                <h2 className="text-lg font-bold mb-2">👑 Maestro Social</h2>
                <p className="text-sm font-bold">Deception +9 • Performance +9</p>
                <p className="text-sm font-bold">Persuasion +7 • Intimidation +7</p>
                <p className="text-xs mt-2">Eres prácticamente imparable en situaciones sociales</p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-purple-400 mb-3">🎯 Habilidades Sociales</h2>
                <div className="space-y-2">
                  <div className="bg-slate-700 rounded-lg p-3 flex justify-between items-center">
                    <span className="text-sm">⭐ <strong>Deception</strong></span>
                    <span className="text-2xl font-bold text-yellow-400">+9</span>
                  </div>
                  <div className="bg-slate-700 rounded-lg p-3 flex justify-between items-center">
                    <span className="text-sm">⭐ <strong>Performance</strong></span>
                    <span className="text-2xl font-bold text-yellow-400">+9</span>
                  </div>
                  <div className="bg-slate-700 rounded-lg p-3 flex justify-between items-center">
                    <span className="text-sm"><strong>Persuasion</strong></span>
                    <span className="text-2xl font-bold text-purple-400">+7</span>
                  </div>
                  <div className="bg-slate-700 rounded-lg p-3 flex justify-between items-center">
                    <span className="text-sm"><strong>Intimidation</strong></span>
                    <span className="text-2xl font-bold text-red-400">+7</span>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-bold text-purple-400 mb-3">🎭 Arsenal Social</h2>
                <div className="space-y-2">
                  <div className="bg-gradient-to-r from-red-700 to-red-900 rounded-lg p-3 border-2 border-red-500">
                    <h3 className="font-bold text-red-300">Sugerencia ⭐⭐⭐</h3>
                    <p className="text-xs text-gray-100 mt-1">Control mental CD 16 • 8 horas • Tu arma MÁS poderosa</p>
                    <p className="text-xs text-yellow-300 mt-1">Resuelve casi cualquier situación social</p>
                  </div>
                  <div className="bg-slate-700 rounded-lg p-3">
                    <h3 className="font-bold text-cyan-400">Invisibilidad ⭐⭐</h3>
                    <p className="text-xs text-gray-300 mt-1">Infiltración perfecta • Escape garantizado</p>
                  </div>
                  <div className="bg-slate-700 rounded-lg p-3">
                    <h3 className="font-bold text-pink-400">Hechizar Persona</h3>
                    <p className="text-xs text-gray-300 mt-1">Hostil → Amistoso • CD 16 • Backup de Sugerencia</p>
                  </div>
                  <div className="bg-slate-700 rounded-lg p-3">
                    <h3 className="font-bold text-purple-400">Disfrazarse</h3>
                    <p className="text-xs text-gray-300 mt-1">Infiltración total • Combo con Deception +9</p>
                  </div>
                  <div className="bg-slate-700 rounded-lg p-3">
                    <h3 className="font-bold text-orange-400">Prestidigitación</h3>
                    <p className="text-xs text-gray-300 mt-1">Distracciones • Trucos • Efectos menores</p>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-bold text-green-400 mb-3">💡 Combos Legendarios</h2>
                <div className="space-y-2">
                  <div className="bg-gradient-to-r from-purple-800 to-purple-900 rounded-lg p-3 border-2 border-purple-500">
                    <h3 className="text-sm font-bold text-yellow-300">🎯 Control Total (MÁS PODEROSO)</h3>
                    <p className="text-xs text-gray-200">Sugerencia CD 16 → "Déjanos pasar y olvida que nos viste"</p>
                    <p className="text-xs text-purple-300 mt-1">O cualquier orden razonable que resuelva la situación</p>
                  </div>
                  <div className="bg-slate-700 rounded-lg p-3">
                    <h3 className="text-sm font-bold text-cyan-400">Infiltración Invisible</h3>
                    <p className="text-xs text-gray-300">Invisibilidad → Stealth +4 → Nadie te detecta</p>
                  </div>
                  <div className="bg-slate-700 rounded-lg p-3">
                    <h3 className="text-sm font-bold text-purple-400">Doble Identidad</h3>
                    <p className="text-xs text-gray-300">Disfrazarse → Deception +9 → Performance +9</p>
                  </div>
                  <div className="bg-slate-700 rounded-lg p-3">
                    <h3 className="text-sm font-bold text-red-400">Escalada Social</h3>
                    <p className="text-xs text-gray-300">Persuasion +7 → Hechizar Persona → Sugerencia</p>
                    <p className="text-xs text-yellow-400 mt-1">Tres niveles de control progresivo</p>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-900 bg-opacity-30 rounded-lg p-4 border-2 border-yellow-600">
                <h3 className="text-sm font-bold text-yellow-300 mb-2">⚡ ESTRATEGIA PRO</h3>
                <p className="text-xs text-gray-200">Con <strong>Sugerencia</strong> puedes resolver casi cualquier encuentro social sin violencia. Es tu herramienta más versátil y poderosa. Úsala creativamente:</p>
                <ul className="text-xs text-gray-300 mt-2 space-y-1">
                  <li>• Guardias que bloquean el paso</li>
                  <li>• Interrogatorios hostiles</li>
                  <li>• Negociaciones complicadas</li>
                  <li>• Obtener información crucial</li>
                  <li>• Evitar combates innecesarios</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'equipo' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-orange-400 mb-3">⚔️ Armas</h2>
                <div className="space-y-3">
                  <div className="bg-gradient-to-r from-red-700 to-red-900 rounded-lg p-4 border-2 border-red-500">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-red-300">🗡️ Daga del Torturador</h3>
                        <span className="text-xs bg-red-500 px-2 py-1 rounded font-bold">EQUIPADA</span>
                      </div>
                      <span className="text-xs bg-purple-600 px-2 py-1 rounded">Mágica</span>
                    </div>
                    <div className="space-y-1 text-sm text-gray-100">
                      <p><strong>Ataque:</strong> +5 (DEX +2 + Prof +2 + Mágica +1)</p>
                      <p><strong>Daño base:</strong> 1d6+3 perforante</p>
                      <p className="text-yellow-300"><strong>⚡ Habilidad:</strong> +1d4 si objetivo tiene menos HP que tú</p>
                      <p><strong>Propiedades:</strong> Finesse, Arrojadiza, Ligera, Mágica</p>
                      <p><strong>Alcance:</strong> 5 pies / 20-60 pies (arrojada)</p>
                    </div>
                    <div className="mt-3 bg-black bg-opacity-30 rounded p-2 text-xs text-gray-200">
                      <p><strong>💡 Táctica:</strong> Con 23 HP, casi siempre tendrás menos HP que los enemigos = casi siempre haces 1d6+3+1d4 daño (promedio 9-10 daño)</p>
                    </div>
                  </div>

                  <div className="bg-slate-700 rounded-lg p-4 opacity-75">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-bold text-gray-400">Estoque</h3>
                      <span className="text-xs bg-gray-600 px-2 py-1 rounded">Backup</span>
                    </div>
                    <div className="space-y-1 text-sm text-gray-400">
                      <p><strong>Ataque:</strong> +4</p>
                      <p><strong>Daño:</strong> 1d8+2 perforante (promedio 6-7)</p>
                      <p><strong>Alcance:</strong> 5 pies</p>
                    </div>
                  </div>

                  <div className="bg-slate-700 rounded-lg p-4 opacity-75">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-bold text-gray-400">Daga Normal</h3>
                      <span className="text-xs bg-gray-600 px-2 py-1 rounded">Backup</span>
                    </div>
                    <div className="space-y-1 text-sm text-gray-400">
                      <p><strong>Ataque:</strong> +4</p>
                      <p><strong>Daño:</strong> 1d4+2 perforante (promedio 4-5)</p>
                      <p><strong>Alcance:</strong> 5 pies / 20-60 pies</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 bg-blue-900 bg-opacity-30 rounded-lg p-3 border-2 border-blue-600">
                  <h3 className="text-sm font-bold text-blue-300 mb-2">📊 Comparación de Daño</h3>
                  <div className="space-y-1 text-xs text-gray-300">
                    <p><strong>🏆 Daga del Torturador:</strong> 1d6+3+1d4 = ~9-10 daño (vs heridos)</p>
                    <p><strong>Estoque:</strong> 1d8+2 = ~6-7 daño</p>
                    <p><strong>Daga Normal:</strong> 1d4+2 = ~4-5 daño</p>
                    <p className="text-yellow-400 mt-2 font-bold">⭐ Daga del Torturador es SIEMPRE tu mejor opción</p>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-bold text-purple-400 mb-3">🛡️ Armadura y Protección</h2>
                <div className="space-y-3">
                  <div className="bg-slate-700 rounded-lg p-4">
                    <h3 className="text-lg font-bold text-blue-400 mb-2">Armadura de Cuero</h3>
                    <div className="space-y-1 text-sm text-gray-300">
                      <p><strong>AC:</strong> 11 + DEX (+2) = <strong className="text-white text-lg">13</strong></p>
                      <p><strong>Tipo:</strong> Armadura ligera</p>
                      <p><strong>Peso:</strong> 10 lb</p>
                    </div>
                  </div>

                  <div className="bg-slate-700 rounded-lg p-4">
                    <h3 className="text-lg font-bold text-green-400 mb-2">🪲 Escudo Escarabaño</h3>
                    <p className="text-sm text-gray-300">Objeto especial (propiedades por determinar)</p>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-bold text-yellow-400 mb-3">✨ Objetos Mágicos</h2>
                <div className="bg-gradient-to-r from-orange-600 to-red-600 rounded-lg p-4 border-2 border-yellow-500">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl">🎸</span>
                    <h3 className="text-xl font-bold text-white">Bandurín de Fochulan</h3>
                  </div>
                  <div className="space-y-2 text-sm text-white">
                    <p><strong>Rareza:</strong> Raro (requiere sintonía)</p>
                    <p><strong>Beneficios:</strong></p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>+1 CD de salvación (15 → 16)</li>
                      <li>+1 ataque de hechizo (+7 → +8)</li>
                      <li>Funciona como foco arcano</li>
                      <li>1 carga/día: Compulsión (nivel 4)</li>
                    </ul>
                    <div className="mt-3 bg-white bg-opacity-20 rounded p-2">
                      <p className="font-bold">🎵 Flautista de Fochulan (1/día):</p>
                      <p className="text-xs">Acción para lanzar Compulsión nivel 4. WIS CD 16, enemigos bailan 1 min sin poder hacer reacciones. Perfecto para escapar.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-bold text-green-400 mb-3">🎒 Equipamiento General</h2>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-700 rounded-lg p-3">
                    <h4 className="font-bold text-purple-400 mb-2">Herramientas</h4>
                    <ul className="text-sm text-gray-300 space-y-1">
                      <li>• Cuerno</li>
                      <li>• Kit médico</li>
                      <li>• Laúd</li>
                      <li>• Bandurín 🎸</li>
                    </ul>
                  </div>

                  <div className="bg-slate-700 rounded-lg p-3">
                    <h4 className="font-bold text-purple-400 mb-2">Objetos</h4>
                    <ul className="text-sm text-gray-300 space-y-1">
                      <li>• Manta</li>
                      <li>• Mochila</li>
                      <li>• Ropa común</li>
                      <li>• Cantimplora</li>
                    </ul>
                  </div>

                  <div className="bg-slate-700 rounded-lg p-3">
                    <h4 className="font-bold text-purple-400 mb-2">Consumibles</h4>
                    <ul className="text-sm text-gray-300 space-y-1">
                      <li>• Raciones x?</li>
                      <li>• Antorchas</li>
                    </ul>
                  </div>

                  <div className="bg-slate-700 rounded-lg p-3">
                    <h4 className="font-bold text-yellow-400 mb-2">💰 Oro</h4>
                    <div className="flex items-center justify-center gap-3">
                      <button 
                        onClick={() => setGold(Math.max(0, gold - 1))}
                        className="bg-red-600 hover:bg-red-700 text-white font-bold w-8 h-8 rounded"
                      >
                        −
                      </button>
                      <div>
                        <p className="text-2xl font-bold text-yellow-400 text-center">{gold}</p>
                        <p className="text-xs text-gray-400 text-center">po</p>
                      </div>
                      <button 
                        onClick={() => setGold(gold + 1)}
                        className="bg-green-600 hover:bg-green-700 text-white font-bold w-8 h-8 rounded"
                      >
                        +
                      </button>
                    </div>
                    <div className="flex gap-2 mt-2">
                      <button 
                        onClick={() => setGold(Math.max(0, gold - 10))}
                        className="flex-1 bg-red-700 hover:bg-red-800 text-white text-xs font-bold py-1 rounded"
                      >
                        -10
                      </button>
                      <button 
                        onClick={() => setGold(gold + 10)}
                        className="flex-1 bg-green-700 hover:bg-green-800 text-white text-xs font-bold py-1 rounded"
                      >
                        +10
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-bold text-red-400 mb-3">🛒 Prioridades de Compra</h2>
                <div className="bg-red-900 bg-opacity-30 rounded-lg p-4 border-2 border-red-600">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between bg-black bg-opacity-20 p-2 rounded">
                      <div>
                        <p className="font-bold text-white">1. 🧪 Pociones de Curación x2</p>
                        <p className="text-xs text-gray-300">2d4+2 HP cada una (URGENTE)</p>
                      </div>
                      <span className="text-yellow-400 font-bold">100 po</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-white">2. 🔧 Herramientas de Ladrón</p>
                        <p className="text-xs text-gray-300">Abrir cerraduras + Stealth</p>
                      </div>
                      <span className="text-yellow-400 font-bold">25 po</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-white">3. 🪢 Cuerda de cáñamo (50 pies)</p>
                        <p className="text-xs text-gray-300">Utilidad general</p>
                      </div>
                      <span className="text-yellow-400 font-bold">1 po</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-white">4. ⚓ Ganchos de escalada</p>
                        <p className="text-xs text-gray-300">Exploración vertical</p>
                      </div>
                      <span className="text-yellow-400 font-bold">2 po</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-red-700">
                    <p className="text-sm text-yellow-200 font-bold">
                      ⚠️ PRIORIDAD CRÍTICA: Las pociones pueden salvarte la vida. Con 23 HP sigues siendo frágil.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-bold text-blue-400 mb-3">💡 Notas sobre Equipamiento</h2>
                <div className="bg-slate-700 rounded-lg p-4 space-y-2 text-sm text-gray-300">
                  <p>• <strong className="text-red-400">Daga del Torturador</strong> es tu mejor arma. Siempre úsala.</p>
                  <p>• <strong className="text-blue-400">AC 13</strong> es vulnerable. Mantente en retaguardia.</p>
                  <p>• <strong className="text-yellow-400">Bandurín</strong> es invaluable. No lo pierdas.</p>
                  <p>• <strong className="text-green-400">Kit médico</strong> estabiliza aliados caídos sin tirada.</p>
                  <p>• <strong className="text-purple-400">Sin pociones</strong> = alto riesgo. Cómpralas ASAP.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tacticas' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-red-400 mb-3">⚠️ Debilidades</h2>
                <div className="bg-red-900 bg-opacity-40 rounded-lg p-3 space-y-1 text-sm border-2 border-red-700">
                  <p>• <strong>23 HP</strong> - Frágil, evita primera línea</p>
                  <p>• <strong>STR -2</strong> - Evita atletismo y cargar peso</p>
                  <p>• <strong>CON +1</strong> - Baja resistencia</p>
                  <p>• <strong>Sin ataques múltiples</strong> - Daño limitado</p>
                  <p>• <strong>AC 13</strong> - Fácil de golpear</p>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-bold text-green-400 mb-3">✓ Fortalezas</h2>
                <div className="bg-green-900 bg-opacity-40 rounded-lg p-3 space-y-1 text-sm border-2 border-green-700">
                  <p>• <strong className="text-yellow-400">Sugerencia:</strong> Resuelve encuentros sin combate</p>
                  <p>• <strong>Deception +9, Performance +9</strong> - Dominio social</p>
                  <p>• <strong>CD 16</strong> - Enemigos fallan saves frecuentemente</p>
                  <p>• <strong>4 Inspiraciones/día</strong> - Buff constante al equipo</p>
                  <p>• <strong>Daga del Torturador</strong> - Mejor arma mágica</p>
                  <p>• <strong>Versatilidad</strong> - Combate, social, apoyo, control</p>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-bold text-blue-400 mb-3">⚔️ Táctica de Combate</h2>
                <div className="space-y-2">
                  <div className="bg-slate-700 rounded-lg p-3">
                    <h3 className="text-sm font-bold text-yellow-400">🎯 Turno 1</h3>
                    <p className="text-xs text-gray-300">Acción Bonus: Inspiración a DPS principal</p>
                    <p className="text-xs text-gray-300">Acción: Sugerencia (si hay líder enemigo) o Burla Viciosa</p>
                  </div>
                  <div className="bg-slate-700 rounded-lg p-3">
                    <h3 className="text-sm font-bold text-red-400">🛡️ Si te rodean</h3>
                    <p className="text-xs text-gray-300">Onda Atronadora (2d8 + empuje) → Retrocede → Daga del Torturador</p>
                  </div>
                  <div className="bg-slate-700 rounded-lg p-3">
                    <h3 className="text-sm font-bold text-purple-400">⚡ Defensa Reactiva</h3>
                    <p className="text-xs text-gray-300">Palabras Cortantes (reacción -1d6) vs ataques críticos o salvaciones importantes</p>
                  </div>
                  <div className="bg-slate-700 rounded-lg p-3">
                    <h3 className="text-sm font-bold text-green-400">🚑 Emergencia</h3>
                    <p className="text-xs text-gray-300">Palabra Curativa (bonus 1d4+5) cuando aliado cae a 0 HP</p>
                  </div>
                  <div className="bg-slate-700 rounded-lg p-3">
                    <h3 className="text-sm font-bold text-cyan-400">🎭 Control de Campo</h3>
                    <p className="text-xs text-gray-300">Sugerencia en líder enemigo: "Ordena retirada" o "Ataca a tu aliado"</p>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-bold text-purple-400 mb-3">⚡ Gestión de Recursos</h2>
                <div className="space-y-2">
                  <div className="bg-slate-700 rounded-lg p-3">
                    <h3 className="text-sm font-bold text-pink-400">Inspiración (4/día)</h3>
                    <p className="text-xs text-gray-300">Úsala libremente. Sirve para inspirar Y Palabras Cortantes</p>
                    <p className="text-xs text-yellow-400">Prioriza: DPS en ataques, tanks en saves, Palabras vs críticos</p>
                  </div>
                  <div className="bg-slate-700 rounded-lg p-3">
                    <h3 className="text-sm font-bold text-blue-400">Espacios Nv.1 (4/día)</h3>
                    <p className="text-xs text-gray-300">Reserva 1 para emergencias (Palabra Curativa)</p>
                    <p className="text-xs text-gray-300">Resto: Onda Atronadora, Hechizar, Disfrazarse</p>
                  </div>
                  <div className="bg-slate-700 rounded-lg p-3">
                    <h3 className="text-sm font-bold text-indigo-400">Espacios Nv.2 (3/día)</h3>
                    <p className="text-xs text-gray-300"><strong>Prioridad 1:</strong> Sugerencia (control/social)</p>
                    <p className="text-xs text-gray-300"><strong>Prioridad 2:</strong> Invisibilidad (infiltración/escape)</p>
                  </div>
                  <div className="bg-slate-700 rounded-lg p-3">
                    <h3 className="text-sm font-bold text-orange-400">Bandurín (1/día)</h3>
                    <p className="text-xs text-gray-300">Boss fights, múltiples enemigos, o escapadas desesperadas</p>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-bold text-orange-400 mb-3">🎯 Estrategia Óptima</h2>
                <div className="bg-gradient-to-r from-purple-900 to-indigo-900 rounded-lg p-4 border-2 border-purple-500">
                  <h3 className="font-bold text-yellow-300 mb-3">🌟 ROL EN EL GRUPO</h3>
                  <div className="space-y-2 text-sm text-gray-200">
                    <p><strong className="text-cyan-400">1. Control Social:</strong> Usa Sugerencia proactivamente. Es tu superpoder.</p>
                    <p><strong className="text-green-400">2. Buffer:</strong> Inspiración al inicio a quien más daño hace.</p>
                    <p><strong className="text-yellow-400">3. Control de Campo:</strong> Burla Viciosa en enemigos fuertes.</p>
                    <p><strong className="text-red-400">4. Salvavidas:</strong> Palabra Curativa cuando aliado cae.</p>
                    <p><strong className="text-purple-400">5. Defensor:</strong> Palabras Cortantes vs ataques críticos.</p>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-bold text-cyan-400 mb-3">🚀 Nivel 5 y Más Allá</h2>
                <div className="space-y-2">
                  <div className="bg-slate-700 rounded-lg p-3">
                    <h3 className="text-sm font-bold text-purple-400">Nivel 5</h3>
                    <p className="text-xs text-gray-300">• Inspiración sube a 1d8</p>
                    <p className="text-xs text-gray-300">• Acceso a hechizos nivel 3</p>
                    <p className="text-xs text-yellow-400">Sugerencias: Hypnotic Pattern, Counterspell</p>
                  </div>
                  <div className="bg-slate-700 rounded-lg p-3">
                    <h3 className="text-sm font-bold text-yellow-400">Nivel 6</h3>
                    <p className="text-xs text-gray-300"><strong>Secretos Mágicos Adicionales:</strong> 2 hechizos de cualquier clase</p>
                    <p className="text-xs text-purple-400">Considera: Fireball, Revivify, Counterspell, Misty Step</p>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-bold text-red-400 mb-3">🛒 Lista de Compras Actual</h2>
                <div className="bg-slate-700 rounded-lg p-3 space-y-2 text-sm">
                  <p><strong className="text-red-400">URGENTE:</strong> Pociones de Curación x2 (100 po)</p>
                  <p><strong>Importante:</strong> Herramientas de Ladrón (25 po)</p>
                  <p><strong>Útil:</strong> Cuerda (1 po), Ganchos (2 po)</p>
                  <p className="text-green-400 mt-2">✓ Tienes: {gold} po disponibles</p>
                  {gold >= 100 && <p className="text-yellow-400">✓ ¡Puedes comprar las pociones!</p>}
                  {gold < 100 && <p className="text-red-400">⚠️ Necesitas {100 - gold} po más para las pociones</p>}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Reset Button */}
        <button 
          onClick={() => {
            setCurrentHP(maxHP);
            setInspiration(4);
            setSpell1Slots(4);
            setSpell2Slots(3);
          }}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl mb-4 shadow-lg transition-all"
        >
          🔄 Descanso Largo
        </button>

        {/* Quick Gold Transactions */}
        <div className="bg-slate-800 rounded-xl p-4 mb-4 shadow-lg">
          <h3 className="text-lg font-bold text-yellow-400 mb-3">💰 Transacciones Rápidas</h3>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setGold(Math.max(0, gold - 50))}
              className="bg-red-900 hover:bg-red-800 text-white py-2 px-3 rounded-lg text-sm font-semibold transition-all"
            >
              🧪 Poción (-50 po)
            </button>
            <button
              onClick={() => setGold(Math.max(0, gold - 25))}
              className="bg-red-900 hover:bg-red-800 text-white py-2 px-3 rounded-lg text-sm font-semibold transition-all"
            >
              🔧 Herramientas (-25 po)
            </button>
            <button
              onClick={() => setGold(Math.max(0, gold - 1))}
              className="bg-red-900 hover:bg-red-800 text-white py-2 px-3 rounded-lg text-sm font-semibold transition-all"
            >
              🪢 Cuerda (-1 po)
            </button>
            <button
              onClick={() => setGold(Math.max(0, gold - 5))}
              className="bg-red-900 hover:bg-red-800 text-white py-2 px-3 rounded-lg text-sm font-semibold transition-all"
            >
              🍞 Raciones (-5 po)
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-gray-500 text-xs pb-4">
          <p>Jovani Vázquez • Bardo Nivel 4 • Colegio del Conocimiento</p>
          <p className="mt-1">🎭 Maestro del Control Social y Apoyo</p>
        </div>
      </div>
    </div>
  );
}
