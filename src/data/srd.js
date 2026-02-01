/**
 * Curated SRD-style data for display and selection.
 * Each item has id, name, description (subtitle).
 * Mechanics (racial bonuses, hit die, starting gold, spell DC) live in characterModel.js;
 * race/class id and name must match the keys used there (e.g. RACIAL_BONUSES, CLASS_HIT_DIE).
 */

export const races = [
  {
    id: 'Human',
    name: 'Human',
    description: 'Versátil. +1 a todas las características. Extra idioma y habilidad.',
    traits: ['+1 a todas las características', 'Extra idioma', 'Competencia en una habilidad adicional'],
    bestClasses: ['Barbarian', 'Bard', 'Cleric', 'Fighter', 'Rogue', 'Wizard'],
    decentClasses: [],
    weakClasses: [],
    traitTactics: {
      '+1 a todas las características': 'Versátil: funciona con cualquier build. No sobresale en nada pero sin debilidades. Ideal para multiclase.',
      'Extra idioma': 'Útil para roleplay. Habla con más PNJs. Menos útil en combate pero crítico en diplomacia.',
      'Competencia en una habilidad adicional': 'Elige según clase: Percepción (todos), Sigilo (Rogue), Persuasión (Bard), Atletismo (Fighter/Barbarian).'
    },
    socialNotes: 'Humanos son versátiles socialmente. Extra idioma y habilidad ayudan en negociaciones. No hay prejuicio racial: aceptados en mayoría de lugares.'
  },
  {
    id: 'Elf',
    name: 'Elf',
    description: 'Ágil y longevo. +2 DES. Visión en la oscuridad, trance, ascendencia feérica.',
    traits: ['Visión en la oscuridad 60 pies', 'Trance', 'Ascendencia feérica'],
    bestClasses: ['Rogue', 'Fighter', 'Ranger'],
    decentClasses: ['Bard', 'Wizard'],
    weakClasses: ['Barbarian', 'Cleric'],
    traitTactics: {
      'Visión en la oscuridad 60 pies': 'Ve perfectamente en oscuridad. No necesitas antorchas (sigilo). Ventaja nocturna en exploración/combate.',
      'Trance': 'Descanso largo en 4h (vs 8h). Más vigilias por grupo. Puedes estudiar/preparar mientras otros duermen.',
      'Ascendencia feérica': 'Ventaja vs encantamiento, inmune a dormir mágico. Protege vs Hechizar Persona, Sugerencia, Dormir.'
    },
    socialNotes: 'Elfos son vistos como nobles y misteriosos. Larga vida (700+ años) da perspectiva. Usa sabiduría antigua en roleplay. Respetados pero a veces distantes.'
  },
  {
    id: 'Dwarf',
    name: 'Dwarf',
    description: 'Resistente. +2 CON. Visión en la oscuridad, resistencia al veneno, entrenamiento con armas.',
    traits: ['Visión en la oscuridad 60 pies', 'Resistencia al veneno', 'Entrenamiento con armas de enano'],
    bestClasses: ['Barbarian', 'Fighter', 'Cleric'],
    decentClasses: ['Paladin', 'Rogue'],
    weakClasses: ['Wizard', 'Bard'],
    traitTactics: {
      'Visión en la oscuridad 60 pies': 'Ve en oscuridad. Útil en mazmorras y minas. Combina con armadura pesada: tanque nocturno.',
      'Resistencia al veneno': 'Ventaja en salvaciones vs veneno, resistencia a daño veneno. Crítico vs enemigos que usan veneno (arañas, serpientes, asesinos).',
      'Entrenamiento con armas de enano': 'Competencia con hachas y martillos de guerra. Útil si tu clase no tiene competencia marcial.'
    },
    socialNotes: 'Enanos son resistentes y leales. Honorables en tratos comerciales. Usa reputación de artesanos/mineros. Amantes de cerveza: útil en tabernas.'
  },
  {
    id: 'Halfling',
    name: 'Halfling',
    description: 'Pequeño y ágil. +2 DES. Suerte, valiente, sigiloso.',
    traits: ['Suerte', 'Valiente', 'Sigiloso'],
    bestClasses: ['Rogue', 'Fighter', 'Ranger'],
    decentClasses: ['Bard', 'Monk'],
    weakClasses: ['Barbarian', 'Cleric', 'Wizard'],
    traitTactics: {
      'Suerte': 'Reroll 1s naturales en ataques, chequeos, salvaciones. CRÍTICO: convierte fallos críticos en segundas oportunidades. Usa agresivamente (Reckless Attack, Sneak Attack).',
      'Valiente': 'Ventaja vs miedo. Resiste Intimidación enemiga y conjuros de miedo. Útil vs dragones, demonios.',
      'Sigiloso': 'Puedes esconderte detrás de criaturas medianas/grandes. Sigilo en combate más fácil. Ideal para Rogue.'
    },
    socialNotes: 'Halflings son amigables y optimistas. Pequeño tamaño hace parecer inofensivo: usa para infiltración. Suerte da reputación de afortunados. Hospitalarios: fácil ganar confianza.'
  },
  {
    id: 'Tiefling',
    name: 'Tiefling',
    description: 'Descendiente de linaje infernal. +2 CAR, +1 INT. Resistencia al fuego, visión en la oscuridad.',
    traits: ['Visión oscuridad 60 pies', 'Resistencia fuego', 'Prestidigitación (truco)'],
    bestClasses: ['Bard', 'Sorcerer', 'Warlock'],
    decentClasses: ['Wizard', 'Rogue', 'Paladin'],
    weakClasses: ['Barbarian', 'Fighter', 'Cleric'],
    traitTactics: {
      'Visión oscuridad 60 pies': 'Ve en oscuridad. Combina con linaje infernal para atmósfera intimidante.',
      'Resistencia fuego': 'Mitad daño fuego. Camina por lava, ignora Bola de Fuego enemiga. Posiciónate en zonas de fuego sin riesgo.',
      'Prestidigitación (truco)': 'Cantrip gratis desde nivel 1. Usa para efectos sociales (luces, sonidos) o distracciones. No gasta espacios.'
    },
    socialNotes: 'Tieflings sufren prejuicio por linaje infernal. Usa CAR alta para superar desconfianza. Resistencia fuego explica pasado misterioso. Algunos ven como peligrosos, otros como exóticos. Juega con expectativas.'
  },
];

export const classes = [
  {
    id: 'Barbarian',
    name: 'Barbarian',
    description: 'Guerrero feroz. D12. Rage, defensa sin armadura. Fuerza y Constitución.',
    hitDie: 12,
    startingGold: 70,
    primaryAbility: 'str',
    secondaryAbility: 'con',
    playstyle: 'Tanque de daño cuerpo a cuerpo. Rage te da resistencia y bonus de daño. Alta CON y d12 = máximos PV. Absorbe daño por el grupo mientras devastas con ataques de FUE.',
    combatTactics: [
      '1. Rage al inicio del combate (acción bonus, 2 usos nivel bajo)',
      '2. Ataque cuerpo a cuerpo contra enemigo más peligroso (FUE + Rage)',
      '3. Reckless Attack para ventaja (desventaja defensiva: acepta daño)',
      '4. Protege aliados débiles: interponte entre enemigos y casters',
      '5. Sin armadura: AC = 10 + DES + CON (invierte en CON/DES)'
    ],
    spellPriorities: [],
    equipmentGuide: {
      weapons: 'Armas grandes (Hacha grande, Espada grande) para máximo daño con FUE. Arrojadiza (Hacha de mano) para distancia.',
      armor: 'Sin armadura (Unarmored Defense). AC = 10 + DES + CON. Si DES+CON bajo, usa armadura media.',
      essentials: ['Pociones de curar', 'Cuerda', 'Raciones']
    },
    socialGuidance: 'Intimidación con FUE: coacciona enemigos. Baja CAR: evita persuasión, deja charla a aliados. Útil en combates sociales como músculo.',
    raceSynergies: {
      Human: '+1 a todo: equilibrado. Competencia extra útil (Atletismo, Percepción).',
      Dwarf: '+2 CON: máxima tanque. Resistencia veneno ayuda supervivencia.',
      Halfling: '+2 DES ayuda AC. Suerte + Reckless Attack = críticos más seguros.',
      Elf: '+2 DES (AC). Trance = vigilias más. No óptimo (baja FUE nativa).',
      Tiefling: '+2 CAR +1 INT: mal fit (necesitas FUE/CON). Solo si build social.'
    }
  },
  {
    id: 'Bard',
    name: 'Bard',
    description: 'Artista y soporte. D8. Lanza conjuros con CAR. Inspiración barda, habilidades versátiles.',
    hitDie: 8,
    startingGold: 125,
    spellAbility: 'cha',
    primaryAbility: 'cha',
    secondaryAbility: 'dex',
    playstyle: 'Apoyo versátil: control social, curación emergente, buffs de grupo. Tu Carisma alto hace tus conjuros difíciles de resistir. Prioriza Inspiración Barda en momentos críticos.',
    combatTactics: [
      '1. Palabra Curativa si aliado cae a 0 PV (acción bonus)',
      '2. Inspiración Barda antes de ataques/chequeos críticos de aliados (bonus)',
      '3. Burla Viciosa en enemigo más peligroso (cantrip, desventaja)',
      '4. Conjuros de control (Hechizar, Sugerencia) fuera de combate',
      '5. Mantente a distancia media (30-60 pies), armadura ligera'
    ],
    spellPriorities: [
      'Curación: Palabra Curativa (revive), Rayo Curativo (distancia)',
      'Control: Hechizar Persona, Sugerencia (CD alta con CAR)',
      'Utilidad: Disfrazarse, Detectar Magia, Invisibilidad',
      'Daño: Burla Viciosa (cantrip), Onda Atronadora (AoE nivel 1)'
    ],
    equipmentGuide: {
      weapons: 'Armas Finesse (estoque, espada corta) para DES. Evita armas pesadas (baja FUE).',
      armor: 'Armadura ligera (cuero, 11+DES). Escudo si no usas instrumento.',
      essentials: ['Instrumento musical', 'Kit médico', 'Poción de curar']
    },
    socialGuidance: 'CAR excelente: líder social. Persuasión/Interpretación para evitar combates, conseguir información, ganar aliados. Hechizar Persona + CAR = control social potente en pueblos/negociaciones.',
    raceSynergies: {
      Human: '+1 a todo: versátil. Competencia extra (Persuasión, Interpretación).',
      Tiefling: '+2 CAR +1 INT: óptimo. CAR máxima para CD conjuros. Prestidigitación gratis (truco social).',
      Halfling: '+2 DES (AC). Suerte: reroll 1s en ataques/conjuros = consistencia.',
      Elf: '+2 DES (AC). Trance ayuda vigilias. Ascendencia feérica vs encantamiento es bonus.',
      Dwarf: '+2 CON (más PV). No ideal (baja CAR), pero viable como Bardo tanque.'
    }
  },
  {
    id: 'Cleric',
    name: 'Cleric',
    description: 'Sirviente divino. D8. Lanza conjuros con SAB. Dominio divino, canalizar divinidad.',
    hitDie: 8,
    startingGold: 125,
    spellAbility: 'wis',
    primaryAbility: 'wis',
    secondaryAbility: 'con',
    playstyle: 'Soporte divino: curación potente, control con dominio, tanque medio. SAB alta = CD conjuros efectiva. Prepara conjuros diariamente (flexible). Usa Canalizar Divinidad en momentos clave.',
    combatTactics: [
      '1. Bendición al inicio (3 aliados, +1d4 ataques/salvaciones)',
      '2. Rayo Curativo/Palabra Curativa para curación (distancia o bonus)',
      '3. Conjuros de dominio (Vida: curación extra; Luz: Bola de Fuego)',
      '4. Canalizar Divinidad (2 usos): Destruir no-muertos o dominio específico',
      '5. Armadura media + escudo: AC alta, frontline viable'
    ],
    spellPriorities: [
      'Curación: Palabra Curativa (bonus), Rayo Curativo (distancia), conjuros dominio Vida',
      'Buff: Bendición (+1d4 grupo), Escudo de Fe (+2 AC)',
      'Control: Hechizar Persona (encantamiento)',
      'Utilidad: Detectar Magia (ritual), conjuros dominio'
    ],
    equipmentGuide: {
      weapons: 'Maza o martillo (simple, competente). Dominio Luz: armas marciales.',
      armor: 'Armadura media (cota de mallas, AC 16) + escudo (+2). AC total ~18.',
      essentials: ['Símbolo sagrado', 'Kit médico', 'Poción de curar']
    },
    socialGuidance: 'SAB moderada: insight, medicina. No tan social como Bardo (baja CAR), pero confiable como figura moral/religiosa. Usa posición de clérigo para respeto en comunidades.',
    raceSynergies: {
      Human: '+1 a todo: equilibrado. SAB/CON sólidas.',
      Dwarf: '+2 CON: tanque divino. Resistencia veneno + armadura pesada (dominio).',
      Elf: '+2 DES: no óptimo (Cleric usa armadura media). Trance útil para vigilias.',
      Halfling: '+2 DES (AC si armadura ligera). Suerte + conjuros = consistencia.',
      Tiefling: '+2 CAR +1 INT: mal fit (necesitas SAB). Viable si Cleric social (dominio Conocimiento).'
    }
  },
  {
    id: 'Fighter',
    name: 'Fighter',
    description: 'Experto en combate. D10. Estilo de combate, acción adicional. Fuerza o Destreza.',
    hitDie: 10,
    startingGold: 125,
    primaryAbility: 'str',
    secondaryAbility: 'con',
    playstyle: 'DPS/tanque versátil. Estilo de combate define build (FUE cuerpo a cuerpo, DES arquero). Acción adicional (nivel 5): 2 ataques/turno. Alta CON + d10 = durabilidad. Simple pero efectivo.',
    combatTactics: [
      '1. Enfoca enemigo más peligroso con ataques múltiples',
      '2. Acción adicional (nivel 5+): 2 ataques/turno = máximo DPS',
      '3. Second Wind (bonus, 1/descanso): cura 1d10+nivel cuando bajo de PV',
      '4. Protege casters: interponte entre enemigos y aliados débiles',
      '5. Action Surge (1/descanso): turno extra = burst crítico'
    ],
    spellPriorities: [],
    equipmentGuide: {
      weapons: 'FUE build: Espada grande, Hacha grande. DES build: Arco largo, Estoque. Versatilidad: arma +escudo.',
      armor: 'Armadura pesada (Cota de placas, AC 18) si FUE. Media/ligera si DES (AC 15-17).',
      essentials: ['Pociones de curar', 'Arma de respaldo', 'Cuerda']
    },
    socialGuidance: 'No social (baja CAR típica). Útil como guardia, soldado. Intimidación con FUE si build cuerpo a cuerpo. Deja negociación a aliados.',
    raceSynergies: {
      Human: '+1 a todo: versátil. Funciona con cualquier build (FUE o DES).',
      Dwarf: '+2 CON: tanque perfecto. Armadura pesada sin penalización velocidad.',
      Elf: '+2 DES: arquero óptimo. Visión oscuridad + sigilo.',
      Halfling: '+2 DES: DES Fighter. Suerte + ataques múltiples = críticos consistentes.',
      Tiefling: '+2 CAR +1 INT: mal fit (necesitas FUE/DES/CON). Solo si roleplay.'
    }
  },
  {
    id: 'Rogue',
    name: 'Rogue',
    description: 'Sigiloso y hábil. D8. Sneak attack, expertise, evasión. Destreza.',
    hitDie: 8,
    startingGold: 125,
    primaryAbility: 'dex',
    secondaryAbility: 'int',
    playstyle: 'Asesino furtivo: DPS spike con Sneak Attack (ventaja o aliado adyacente). Evita combate frontal. Sigilo, expertise en habilidades (lockpick, sigilo, percepción). Útil fuera de combate.',
    combatTactics: [
      '1. Posiciónate para Sneak Attack: ventaja (escondido) o aliado adyacente a enemigo',
      '2. Ataca enemigo aislado o débil (Sneak +XdY daño)',
      '3. Cunning Action (bonus): Dash/Disengage/Hide después de atacar = movilidad',
      '4. Evita ser enfocado: mantén distancia, usa cobertura',
      '5. Armas Finesse (estoque, arco corto): DES en ataque'
    ],
    spellPriorities: [],
    equipmentGuide: {
      weapons: 'Finesse: Estoque (cuerpo a cuerpo), Arco corto (distancia). Daga de respaldo.',
      armor: 'Armadura ligera (cuero, 11+DES). AC ~15-17 con DES alta. No escudo (necesitas manos para herramientas).',
      essentials: ['Herramientas de ladrón (lockpick)', 'Kit de disfraz', 'Cuerda', 'Pociones']
    },
    socialGuidance: 'Engaño, Sigilo, Persuasión con expertise. Infiltración social (disfraz, mentiras). Baja CAR típica: usa INT o invierte en CAR. Útil para espionaje, información.',
    raceSynergies: {
      Human: '+1 a todo: versátil. Competencia extra (Sigilo, Percepción).',
      Halfling: '+2 DES: óptimo. Suerte + Sneak Attack = críticos devastadores. Sigiloso (pequeño).',
      Elf: '+2 DES: perfecto. Visión oscuridad + Percepción = infiltración nocturna.',
      Tiefling: '+2 CAR +1 INT: viable (CAR para social, INT para Investigation). Resistencia fuego + sigilo.',
      Dwarf: '+2 CON (más PV). No óptimo (baja DES), pero Rogue tanque viable.'
    }
  },
  {
    id: 'Wizard',
    name: 'Wizard',
    description: 'Lanzador arcano. D6. Libro de conjuros, recuperación arcana. Inteligencia.',
    hitDie: 6,
    startingGold: 80,
    spellAbility: 'int',
    primaryAbility: 'int',
    secondaryAbility: 'con',
    playstyle: 'Artillería mágica: máximo daño AoE, control, utilidad. INT alta = CD conjuros letal. Libro de conjuros = más versatilidad que otros casters. Frágil (d6): mantén distancia absoluta.',
    combatTactics: [
      '1. Mantente a máxima distancia (60+ pies), detrás de aliados',
      '2. Bola de Fuego/AoE cuando enemigos agrupados (8d6+)',
      '3. Dardo Mágico (cantrip garantizado, no falla) si enemigo aislado',
      '4. Escudo (reacción): +5 AC si atacado, previene hits',
      '5. Concentración: protege conjuros (Invisibilidad, Volar). CON alta ayuda'
    ],
    spellPriorities: [
      'Daño AoE: Bola de Fuego (3er nivel), Onda Atronadora (1er nivel)',
      'Daño single: Dardo Mágico (garantizado), Rayo de Escarcha',
      'Defensa: Escudo (reacción +5 AC), Armadura de Mago (AC 13+DES)',
      'Control: Hechizar Persona, Sugerencia, Dormir',
      'Utilidad: Detectar Magia, Identificar, Volar, Invisibilidad'
    ],
    equipmentGuide: {
      weapons: 'Bastón, daga (emergencia). No combate cuerpo a cuerpo.',
      armor: 'Sin armadura (prohibido). Armadura de Mago (conjuro, AC 13+DES). Máxima DES.',
      essentials: ['Libro de conjuros (crítico)', 'Focus arcano', 'Componentes materiales', 'Pociones de curar']
    },
    socialGuidance: 'INT alta: Investigation, Arcana, Historia. No social (baja CAR). Útil como erudito, investigador. Conjuros de utilidad (Detectar Pensamientos) compensan.',
    raceSynergies: {
      Human: '+1 a todo: equilibrado. INT/CON sólidas.',
      Tiefling: '+2 CAR +1 INT: INT secundaria ayuda. Resistencia fuego + Prestidigitación gratis.',
      Elf: '+2 DES: AC mejorada (Armadura de Mago 13+DES). Trance para estudio.',
      Halfling: '+2 DES (AC). Suerte + conjuros = saves críticos consistentes.',
      Dwarf: '+2 CON: máxima supervivencia (d6 bajo). Concentración fuerte. Resistencia veneno.'
    }
  },
];

export const subclasses = [
  {
    id: 'Colegio del Conocimiento',
    name: 'Colegio del Conocimiento',
    classId: 'Bard',
    description: 'Habilidades adicionales y Palabras Cortantes (reacción -1d6).',
    feature: {
      name: 'Palabras Cortantes',
      trigger: 'Cuando enemigo ataca/chequea/hace daño',
      cost: '1 Inspiración Barda',
      effect: 'Restas 1d6 de su resultado',
      hint: 'Puede hacer fallar ataques críticos',
    },
    subclassTactics: [
      'Usa Palabras Cortantes en ataques enemigos críticos o salvaciones importantes',
      'Gasta Inspiración ofensivamente (aliados) y defensivamente (Palabras Cortantes)',
      'Prioriza mantener Inspiración disponible para reacciones'
    ],
    combos: [
      'Inspiración Barda (bonus) → ataque de aliado (turno aliado) → Palabras Cortantes (reacción) contra contraataque = swing doble en un round',
      'Hechizar Persona → Sugerencia: control total 8h sobre NPC encantado',
      'Disfrazarse → Persuasión/Engaño: infiltración perfecta con CAR alta'
    ],
    featureUsage: 'Palabras Cortantes: Guarda 1-2 Inspiración para reacciones. Usa cuando enemigo ataca aliado débil o hace salvación crítica. Puede hacer fallar críticos (resta 1d6).'
  },
  {
    id: 'Colegio del Valor',
    name: 'Colegio del Valor',
    classId: 'Bard',
    description: 'Competencia con armas y armadura. Inspiración para daño o defensa.',
    subclassTactics: [
      'Usa armadura media + escudo para frontline (AC alta)',
      'Inspiración puede añadir daño o AC: decide según situación',
      'Combate cuerpo a cuerpo viable con competencia marcial'
    ],
    combos: [
      'Inspiración para daño en aliado clave antes de ataque',
      'Inspiración para AC cuando enemigo ataca',
      'Palabra Curativa + posición frontline = soporte agresivo'
    ],
    featureUsage: 'Inspiración Barda de Valor: Úsala para daño en ataques clave de aliados, o para AC cuando enemigo ataca. Más agresiva que Conocimiento.'
  },
  {
    id: 'Vida',
    name: 'Vida',
    classId: 'Cleric',
    description: 'Curación mejorada. Dominio de vida: bonus al curar, canalizar para revivir.',
    subclassTactics: [
      'Curación mejorada: +2+nivel al curar con conjuros',
      'Canalizar Divinidad: cura grupo masiva (5×nivel)',
      'Armadura pesada: tanque curador en frontline'
    ],
    combos: [
      'Bendición + Rayo Curativo: buff grupo + curación en un turno',
      'Canalizar Divinidad cuando varios aliados bajos: cura AoE',
      'Palabra Curativa + posición frontline: cura y absorbe daño'
    ],
    featureUsage: 'Canalizar Divinidad (Vida): Cura 5×nivel PV a cada criatura elegida. Úsala cuando 2+ aliados estén bajo 50% PV. Maximiza valor en combates largos.'
  },
  {
    id: 'Luz',
    name: 'Luz',
    classId: 'Cleric',
    description: 'Conjuros de luz y fuego. Dominio de luz: destruir no muertos, luz bendita.',
    subclassTactics: [
      'Conjuros de fuego (Bola de Fuego) gratis: máximo daño AoE',
      'Canalizar Divinidad: destruir no-muertos en 30 pies',
      'Luz radiante: efectiva vs no-muertos y sombras'
    ],
    combos: [
      'Bendición + Bola de Fuego: buff aliados, luego AoE enemigos',
      'Canalizar contra no-muertos antes de combate principal',
      'Luz perpetua + sigilo: revela enemigos invisibles'
    ],
    featureUsage: 'Canalizar Divinidad (Luz): Destruye no-muertos automáticamente (CD SAB). Úsala al inicio de combate vs zombis/esqueletos. Radiante ignora resistencias comunes.'
  },
  {
    id: 'Guerrero',
    name: 'Guerrero',
    classId: 'Fighter',
    description: 'Crítico mejorado, acción adicional. Enfocado en daño cuerpo a cuerpo.',
    subclassTactics: [
      'Crítico en 19-20: más frecuente que otros',
      'Action Surge para burst: 4 ataques en un turno (nivel 5+)',
      'Enfoca enemigo principal con ataques múltiples'
    ],
    combos: [
      'Action Surge + Acción Adicional = 4 ataques en un turno',
      'Crítico 19-20 + ataques múltiples = alto DPS consistente',
      'Second Wind después de burst para sostenibilidad'
    ],
    featureUsage: 'Crítico mejorado: Ocurre en 19-20 (10% → 10% más frecuente). Maximiza con ataques múltiples. Action Surge en enemigos elite para burst.'
  },
  {
    id: 'Arquero',
    name: 'Arquero',
    classId: 'Fighter',
    description: 'Estilo de combate a distancia. Precisión y movilidad.',
    subclassTactics: [
      'Mantén distancia máxima (80-320 pies con arco largo)',
      'Usa cobertura: árboles, rocas, aliados',
      'Acción Adicional: 2 flechas/turno (nivel 5+)'
    ],
    combos: [
      'Action Surge + Acción Adicional = 4 flechas en un turno',
      'Disengage (si necesario) + Dash = escape rápido',
      'Enfoca casters enemigos: interrumpe concentración'
    ],
    featureUsage: 'Estilo Arquería: +2 a ataques con arco. Altamente preciso. Usa ataques múltiples para enfocado. Action Surge en enemigos voladores o distancia.'
  },
  {
    id: 'Ladrón',
    name: 'Ladrón',
    classId: 'Rogue',
    description: 'Acción adicional para usar objeto, escalar o desarmar. Sigilo y utilidad.',
    subclassTactics: [
      'Fast Hands: usa objeto como bonus (poción, trampa, cuerda)',
      'Sneak Attack + retirada (Cunning Action Hide)',
      'Sigilo superior: bonus para escalar, lockpick'
    ],
    combos: [
      'Sneak Attack + Cunning Action Hide = ataque y reposicionamiento',
      'Fast Hands usar poción (bonus) + Sneak Attack (acción) = curación y daño',
      'Usar objeto ambiente (aceite, trampa) como bonus'
    ],
    featureUsage: 'Fast Hands: Usa objeto como bonus action. Toma poción sin sacrificar ataque. Activa trampas o lanza aceite antes de Sneak Attack.'
  },
  {
    id: 'Asesino',
    name: 'Asesino',
    classId: 'Rogue',
    description: 'Daño extra contra sorpresa. Impostor y venenos.',
    subclassTactics: [
      'Prioriza iniciativa: ventaja en primer turno',
      'Sorpresa = crítico automático en turno 1',
      'Sneak Attack + crítico sorpresa = daño masivo inicial'
    ],
    combos: [
      'Sorpresa + crítico automático + Sneak Attack = burst inicial devastador',
      'Veneno en arma antes de combate (bonus daño)',
      'Impostor + infiltración: elimina objetivo antes de combate'
    ],
    featureUsage: 'Assassinate: Crítico automático vs enemigos sorprendidos. Ventaja vs los que no han actuado. Prioriza iniciativa (DES alta). Ideal para emboscadas.'
  },
  {
    id: 'Evocación',
    name: 'Evocación',
    classId: 'Wizard',
    description: 'Daño de conjuros mejorado. Esculpir hechizos para proteger aliados.',
    subclassTactics: [
      'Esculpir Hechizos: aliados pasan salvación automática en tus AoE',
      'Bola de Fuego sin dañar aliados = posicionamiento libre',
      'Potenciar Cantrip (nivel 10+): +INT a daño cantrip'
    ],
    combos: [
      'Bola de Fuego con aliados en área: Esculpir protege aliados',
      'Onda Atronadora + aliados cerca: empuje enemigos, aliados seguros',
      'Dardo Mágico + Potenciar = daño garantizado aumentado'
    ],
    featureUsage: 'Esculpir Hechizos: Aliados elegidos (INT) pasan salvación AoE automáticamente. Ignora posicionamiento: lanza Bola de Fuego en melee sin dañar tanque.'
  },
  {
    id: 'Adivinación',
    name: 'Adivinación',
    classId: 'Wizard',
    description: 'Presagios: sustituir tiradas. Ver el futuro y tomar mejores decisiones.',
    subclassTactics: [
      'Presagios (2/día): sustituye cualquier tirada con d20 pre-tirado',
      'Usa presagios bajos en salvaciones enemigas',
      'Usa presagios altos en tus ataques/salvaciones críticas'
    ],
    combos: [
      'Presagio bajo en salvación enemiga + Bola de Fuego = daño garantizado',
      'Presagio alto en tirada de iniciativa = actúa primero',
      'Presagio bajo en ataque enemigo crítico = falla garantizada'
    ],
    featureUsage: 'Presagios: Tira 2d20 al descanso. Sustituye cualquier tirada (tuya, aliado, enemigo) con resultado guardado. Guarda altos para salvaciones, bajos para enemigos.'
  },
  {
    id: 'Berserker',
    name: 'Berserker',
    classId: 'Barbarian',
    description: 'Frenesí: ataque extra durante Rage. Intimidación feroz.',
    subclassTactics: [
      'Frenesí: ataque bonus cada turno durante Rage (costo: agotamiento)',
      'Usa Frenesí en combates cortos/críticos',
      'Intimidación con ventaja: útil antes de combate'
    ],
    combos: [
      'Rage + Frenesí = 3 ataques/turno (nivel 5+)',
      'Reckless Attack + Frenesí = ventaja en 3 ataques',
      'Intimidación antes de combate: desmoraliza enemigos'
    ],
    featureUsage: 'Frenesí: Ataque bonus cada turno durante Rage. Costo: 1 nivel agotamiento al terminar. Úsalo en combates finales o cortos. Evita en dungeons largos.'
  },
  {
    id: 'Guerrero Totémico',
    name: 'Guerrero Totémico',
    classId: 'Barbarian',
    description: 'Espíritu animal: resistencia a daño (oso) o otras bendiciones.',
    subclassTactics: [
      'Espíritu de Oso: resistencia a TODO daño (excepto psíquico) durante Rage',
      'Tanque supremo: mitad daño + d12 + CON alta',
      'Protege grupo: interponte, absorbe'
    ],
    combos: [
      'Rage + Oso = resistencia a todo daño (1/2)',
      'Reckless Attack + resistencia = acepta desventaja defensiva sin riesgo',
      'Alta CON + Oso + d12 = PV casi ilimitados'
    ],
    featureUsage: 'Espíritu de Oso: Resistencia a todo daño físico durante Rage. Mitad daño de espadas, flechas, fuego (no psíquico). Tanque definitivo. Úsalo en combates largos.'
  },
];

export const spells = [
  {
    id: 'prestidigitacion',
    name: 'Prestidigitación',
    level: 0,
    school: 'Ilusión',
    description: 'Truco. Efectos menores, trucos de mano, distracciones.',
    tacticalUse: 'Usa para distracciones en combate o infiltración. Crea sonidos, luces, o efectos menores. Ideal para roleo social y engaños.',
    timing: 'Fuera de combate principalmente. En combate: distrae guardias o crea señales.'
  },
  {
    id: 'burla-viciosa',
    name: 'Burla Viciosa',
    level: 0,
    school: 'Encantamiento',
    description: 'Truco. 1d4 psíquico + desventaja en próximo ataque del objetivo.',
    tacticalUse: 'Usa en el enemigo más peligroso cada turno. Desventaja reduce daño a aliados. 1d4 psíquico es bonus. Cantrip ilimitado.',
    timing: 'Cada turno en combate. Prioriza enemigos que atacarán aliados débiles este round.',
    synergies: ['Inspiración Barda (reduce enemigo, potencia aliado)']
  },
  {
    id: 'palabra-curativa',
    name: 'Palabra Curativa',
    level: 1,
    school: 'Evocación',
    description: 'Acción bonus. 1d4+mod curación. 60 pies. Revive aliados caídos.',
    hint: 'Perfecto para revivir aliados caídos',
    tacticalUse: 'Usa cuando aliado cae a 0 PV. Acción bonus te permite atacar en el mismo turno. Prioriza revivir sobre curación preventiva (más eficiente).',
    timing: 'Cuando: Aliado a 0 PV. No antes: espera a caída para máxima eficiencia.',
    synergies: ['Inspiración Barda (ambos bonus: elige prioridad)', 'Bendición (buff preventivo antes)']
  },
  {
    id: 'onda-atronadora',
    name: 'Onda Atronadora',
    level: 1,
    school: 'Evocación',
    description: 'Cono 15 pies. 2d8 trueno + empuje. CD CON.',
    tacticalUse: 'Usa cuando enemigos agrupados cerca (cono 15 pies). Empuje aleja enemigos de aliados. 2d8 daño decente nivel 1.',
    timing: 'Cuando 2+ enemigos en cono. Empuje los saca de melee con aliados débiles.',
    synergies: ['Esculpir Hechizos Wizard (aliados seguros)', 'Después de Bendición (buff antes de AoE)']
  },
  {
    id: 'hechizar-persona',
    name: 'Hechizar Persona',
    level: 1,
    school: 'Encantamiento',
    description: 'Hostil → Amistoso. CD SAB. 1 hora. No combate.',
    tacticalUse: 'Usa fuera de combate para manipulación social. Convierte hostil en amistoso 1h. CD alta con CAR/SAB. No funciona en combate.',
    timing: 'Antes de combate o en negociaciones. Ideal para interrogatorios o evitar peleas.',
    synergies: ['Sugerencia (después: control total 8h)', 'Persuasión alta (combina con roleplay)']
  },
  {
    id: 'disfrazarse',
    name: 'Disfrazarse',
    level: 1,
    school: 'Ilusión',
    description: 'Cambia apariencia física. 1 hora. Infiltración.',
    tacticalUse: 'Infiltración perfecta. Cambia apariencia por 1h. Combina con Engaño/Persuasión para pasar como otra persona.',
    timing: 'Antes de infiltración. Dura 1h: planifica bien.',
    synergies: ['Invisibilidad (escape después)', 'Persuasión/Engaño (roleplay)', 'Hechizar Persona (control + disfraz)']
  },
  {
    id: 'detectar-magia',
    name: 'Detectar Magia',
    level: 1,
    school: 'Adivinación',
    description: 'Ritual. Detecta auras mágicas en 30 pies. Concentración.',
    tacticalUse: 'Lánzalo como ritual (no gasta espacio). Detecta trampas mágicas, objetos encantados, criaturas invisibles. 10 min cast como ritual.',
    timing: 'Antes de entrar en habitaciones sospechosas. Como ritual en exploración.',
    synergies: ['Identificar (después: detalles de objeto)', 'Disipar Magia (si detectas algo hostil)']
  },
  {
    id: 'sugerencia',
    name: 'Sugerencia',
    level: 2,
    school: 'Encantamiento',
    description: 'Una acción razonable que el objetivo cumple. CD SAB. 8 h concentración.',
    tacticalUse: 'Control potente fuera de combate. Objetivo cumple acción razonable 8h. Combina con Hechizar Persona para control total.',
    timing: 'Después de Hechizar Persona. O en negociaciones para manipular acciones específicas.',
    synergies: ['Hechizar Persona (primero: amistoso, luego sugerencia)', 'Alta CD conjuros (difícil resistir)']
  },
  {
    id: 'invisibilidad',
    name: 'Invisibilidad',
    level: 2,
    school: 'Ilusión',
    description: 'Tú o aliado invisible 1 h. Concentración. Termina si atacas o lanzas.',
    tacticalUse: 'Infiltración o escape. 1h duración pero termina si atacas. Usa para reposicionamiento, espionaje, o salvar aliado.',
    timing: 'Antes de infiltración o cuando necesitas escape. En aliado: scout invisible.',
    synergies: ['Disfrazarse (primero disfraz, luego invisible)', 'No atacar/lanzar (mantiene concentración)']
  },
  {
    id: 'bola-de-fuego',
    name: 'Bola de Fuego',
    level: 3,
    school: 'Evocación',
    description: 'Esfera 20 pies. 8d6 fuego. CD DES. Alcance largo.',
    tacticalUse: 'AoE masivo cuando enemigos agrupados. 8d6 daño letal. Cuidado aliados (20 pies radio). Wizard Evocación puede proteger aliados.',
    timing: 'Cuando 3+ enemigos agrupados. Espera a que se agrupen antes de lanzar.',
    synergies: ['Esculpir Hechizos (protege aliados)', 'Bendición antes (buff aliados)', 'Posicionamiento (coloca lejos de aliados)']
  },
  {
    id: 'rayo-curativo',
    name: 'Rayo Curativo',
    level: 1,
    school: 'Evocación',
    description: '1d8+mod a distancia. Curación a 60 pies.',
    tacticalUse: 'Curación a distancia. Menos eficiente que Palabra Curativa (acción vs bonus) pero más curación (1d8 vs 1d4). Usa cuando no hay urgencia.',
    timing: 'Cuando aliado bajo pero no a 0. Palabra Curativa para 0 PV, Rayo para preventivo.',
    synergies: ['Dominio Vida (curación mejorada)', 'Después de Bendición (buff antes)']
  },
  {
    id: 'bendicion',
    name: 'Bendición',
    level: 1,
    school: 'Encantamiento',
    description: 'Hasta 3 criaturas +1d4 a ataques y salvaciones. Concentración 1 min.',
    tacticalUse: 'Buff de grupo al inicio de combate. 3 aliados +1d4 a ataques y salvaciones. Concentración: protégela. 1 min = ~10 turnos.',
    timing: 'Primer turno de combate. Antes de AoE o ataques principales.',
    synergies: ['Alta CON (protege concentración)', 'Antes de Bola de Fuego (buff, luego daño)', 'Inspiración Barda (stack buffs)']
  },
  {
    id: 'armadura-de-mago',
    name: 'Armadura de Mago',
    level: 1,
    school: 'Abjuración',
    description: 'AC 13 + DES. Sin armadura. 8 horas.',
    tacticalUse: 'Lanza al despertar. AC 13+DES (mejor que sin armadura). 8h duración. Wizard/Sorcerer esencial. Usa espacios nivel 1 sobrantes.',
    timing: 'Al despertar o antes de aventura. Dura todo el día (8h).',
    synergies: ['Alta DES (AC 16-18)', 'Escudo reacción (AC temporal +5)', 'Sin armadura (necesario para Wizard)']
  },
  {
    id: 'dardo-magico',
    name: 'Dardo Mágico',
    level: 1,
    school: 'Evocación',
    description: '3 rayos, 1d4+1 fuerza cada uno. 120 pies. Ataque de conjuro.',
    tacticalUse: 'Daño garantizado: no requiere tirada de ataque, siempre impacta. 3 rayos × (1d4+1) = ~10 daño. Usa en enemigos con AC alta o cuando necesitas daño seguro.',
    timing: 'Cuando otros conjuros pueden fallar (AC alta, ventaja). O para terminar enemigo bajo.',
    synergies: ['Wizard Evocación Potenciar (nivel 10+: +INT daño)', 'Divide rayos en enemigos múltiples']
  },
];

export const equipment = [
  { id: 'daga', name: 'Daga', category: 'Arma', cost: '2 po', description: '1d4 perforante. Finesse, arrojadiza 20/60. Ligera.' },
  { id: 'espada-corta', name: 'Espada corta', category: 'Arma', cost: '10 po', description: '1d6 perforante. Finesse, ligera.' },
  { id: 'estoque', name: 'Estoque', category: 'Arma', cost: '25 po', description: '1d8 perforante. Finesse.' },
  { id: 'hacha-de-mano', name: 'Hacha de mano', category: 'Arma', cost: '5 po', description: '1d6 cortante. Ligera, arrojadiza 20/60.' },
  { id: 'arco-corto', name: 'Arco corto', category: 'Arma', cost: '25 po', description: '1d6 perforante. Alcance 80/320. Munición.' },
  { id: 'armadura-de-cuero', name: 'Armadura de cuero', category: 'Armadura', cost: '10 po', description: 'AC 11 + DES. Armadura ligera.' },
  { id: 'cota-de-mallas', name: 'Cota de mallas', category: 'Armadura', cost: '75 po', description: 'AC 16. Fuerza 13. Armadura media. Desventaja sigilo.' },
  { id: 'escudo', name: 'Escudo', category: 'Armadura', cost: '10 po', description: '+2 AC.' },
  { id: 'kit-medico', name: 'Kit médico', category: 'Herramienta', cost: '5 po', description: 'Estabiliza criaturas a 0 PG sin tirada. 10 usos.' },
  { id: 'cuerda-50', name: 'Cuerda de cáñamo (50 pies)', category: 'Equipo', cost: '1 po', description: 'Resistencia. Escalar, atar, rappel.' },
  { id: 'antorcha', name: 'Antorcha', category: 'Equipo', cost: '1 cp', description: 'Luz 20 pies, 1 hora. 1d8 fuego como arma improvisada.' },
  { id: 'mochila', name: 'Mochila', category: 'Equipo', cost: '2 po', description: 'Contenedor 1 pie cúbico. 30 lb capacidad.' },
  { id: 'raciones-dia', name: 'Raciones (1 día)', category: 'Consumible', cost: '5 po', description: 'Comida y agua para un día.' },
  { id: 'pocion-curar', name: 'Poción de curar', category: 'Consumible', cost: '50 po', description: '2d4+2 PG al beber. Acción.' },
];

/** Quick purchase options for Equipo tab: id, label, numeric cost (gold). */
export const quickPurchases = [
  { id: 'pocion-curar', label: 'Poción', cost: 50 },
  { id: 'cuerda-50', label: 'Cuerda', cost: 1 },
  { id: 'raciones-dia', label: 'Raciones', cost: 5 },
];
