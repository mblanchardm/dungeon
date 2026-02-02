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
    speed: 30,
    languages: ['common'],
    extraLanguages: 1,
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
    id: 'Variant Human',
    name: 'Variant Human',
    description: '+1 a dos características (elección), una habilidad adicional, un dote. Sin bonificación fija.',
    traits: ['+1 a dos características (elección)', 'Competencia en una habilidad adicional', 'Un dote a elección'],
    speed: 30,
    languages: ['common'],
    bestClasses: ['Barbarian', 'Bard', 'Cleric', 'Fighter', 'Rogue', 'Wizard'],
    decentClasses: [],
    weakClasses: [],
    traitTactics: {
      '+1 a dos características (elección)': 'Elige dos habilidades para +1 cada una. Optimiza para tu clase.',
      'Competencia en una habilidad adicional': 'Una habilidad extra a elección.',
      'Un dote a elección': 'Un dote de la lista SRD al nivel 1.'
    },
    socialNotes: 'Variante humana sacrifica versatilidad numérica por un dote temprano y habilidades a medida.'
  },
  {
    id: 'Elf',
    name: 'Elf',
    description: 'Ágil y longevo. +2 DES. Visión en la oscuridad, trance, ascendencia feérica.',
    traits: ['Visión en la oscuridad 60 pies', 'Trance', 'Ascendencia feérica'],
    speed: 30,
    languages: ['common', 'elvish'],
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
    speed: 25, // Slower but not reduced by heavy armor
    languages: ['common', 'dwarvish'],
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
    speed: 25,
    languages: ['common', 'halfling'],
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
    speed: 30,
    languages: ['common', 'infernal'],
    bestClasses: ['Bard', 'Sorcerer', 'Warlock'],
    decentClasses: ['Wizard', 'Rogue', 'Paladin'],
    weakClasses: ['Barbarian', 'Fighter', 'Cleric'],
    traitTactics: {
      'Visión oscuridad 60 pies': 'Ve en oscuridad. Combina con linaje infernal para atmósfera intimidante.',
      'Resistencia fuego': 'Mitad daño fuego. Camina por lava, ignora Bola de Fuego enemiga. Posiciónate en zonas de fuego sin riesgo.',
      'Prestidigitación (truco)': 'Cantrip gratis desde nivel 1. Usa para efectos sociales (luces, sonidos) o distracciones. No gasta espacios.'
    },
    socialNotes: 'Tieflings sufren prejuicio por linaje infernal. Usa CAR alta para superar desconfianza. Resistencia fuego explica pasado misterioso. Algunos ven como peligrosos, otros como exóticos. Juega con expectativas.',
    racialCantrips: ['thaumaturgy'],
    racialFeatures: [
      { id: 'hellishRebuke', name: 'Infernal Rebuke (Hellish Rebuke)', usesPerLongRest: 1, availableAtLevel: 3 },
      { id: 'darkness', name: 'Oscuridad (Darkness)', usesPerLongRest: 1, availableAtLevel: 5 },
    ],
  },
  {
    id: 'Dragonborn',
    name: 'Dragonborn',
    description: 'Descendiente de dragones. +2 FUE, +1 CAR. Arma de aliento, resistencia al daño.',
    traits: ['Arma de aliento', 'Resistencia al daño (según ancestro)', 'Daño de aliento'],
    speed: 30,
    languages: ['common', 'draconic'],
    bestClasses: ['Paladin', 'Fighter', 'Barbarian'],
    decentClasses: ['Sorcerer', 'Bard'],
    weakClasses: ['Rogue', 'Wizard'],
    traitTactics: {
      'Arma de aliento': '1/descanso corto o largo. Cono o línea según ancestro. Útil contra grupos.',
      'Resistencia al daño (según ancestro)': 'Mitad daño según tipo de dragón.',
    },
    socialNotes: 'Dragonborn son orgullosos. Respiran fuego o hielo según ancestro.',
  },
  {
    id: 'Gnome',
    name: 'Gnome',
    description: 'Pequeño e ingenioso. +2 INT. Astucia gnómica, visión en la oscuridad.',
    traits: ['Visión en la oscuridad 60 pies', 'Astucia gnómica'],
    speed: 25,
    languages: ['common', 'gnomish'],
    subraces: true,
    bestClasses: ['Wizard', 'Bard', 'Rogue'],
    decentClasses: ['Cleric', 'Druid'],
    weakClasses: ['Barbarian', 'Fighter'],
    traitTactics: {
      'Astucia gnómica': 'Ventaja en salvaciones INT, SAB, CAR vs magia.',
    },
    socialNotes: 'Gnomos son curiosos e inventivos. Buenos ilusionistas.',
  },
  {
    id: 'Half-Elf',
    name: 'Half-Elf',
    description: 'Entre dos mundos. +2 CAR, +1 a otras dos. Versátil socialmente.',
    traits: ['Visión en la oscuridad 60 pies', 'Ascendencia feérica', '+1 a dos características'],
    speed: 30,
    languages: ['common', 'elvish'],
    extraLanguages: 1,
    bestClasses: ['Bard', 'Warlock', 'Sorcerer'],
    decentClasses: ['Paladin', 'Ranger', 'Rogue'],
    weakClasses: [],
    traitTactics: {
      '+1 a dos características': 'Elige dos de STR, DEX, CON, INT, SAB.',
    },
    socialNotes: 'Medio elfos combinan versatilidad humana con herencia élfica.',
  },
  {
    id: 'Half-Orc',
    name: 'Half-Orc',
    description: 'Fuerza y resistencia. +2 FUE, +1 CON. Tenacidad imparable, ataques salvajes.',
    traits: ['Visión en la oscuridad 60 pies', 'Tenacidad imparable', 'Ataques salvajes'],
    speed: 30,
    languages: ['common', 'orc'],
    bestClasses: ['Barbarian', 'Fighter', 'Rogue'],
    decentClasses: ['Paladin', 'Ranger'],
    weakClasses: ['Wizard', 'Bard'],
    traitTactics: {
      'Tenacidad imparable': 'Una vez por descanso, permaneces con 1 PV en vez de 0.',
      'Ataques salvajes': 'Crítico con armas cuerpo a cuerpo: +1 dado extra de daño.',
    },
    socialNotes: 'Medio orcos son temidos pero pueden superar estereotipos con CAR.',
  },
];

/** Racial features with limited uses. Thaumaturgy for Tiefling is a cantrip (at-will), not listed here. */
export const RACIAL_FEATURES_BY_RACE = {
  Tiefling: [
    { id: 'hellishRebuke', name: 'Infernal Rebuke (Hellish Rebuke)', usesPerLongRest: 1, availableAtLevel: 3 },
    { id: 'darkness', name: 'Oscuridad (Darkness)', usesPerLongRest: 1, availableAtLevel: 5 },
  ],
  Dragonborn: [{ id: 'breathWeapon', name: 'Arma de aliento', usesPerLongRest: 1, perRest: 'short' }],
  'Half-Orc': [{ id: 'relentlessEndurance', name: 'Tenacidad imparable (Relentless Endurance)', usesPerLongRest: 1 }],
  HalfOrc: [{ id: 'relentlessEndurance', name: 'Tenacidad imparable (Relentless Endurance)', usesPerLongRest: 1 }],
};

export const classes = [
  {
    id: 'Barbarian',
    name: 'Barbarian',
    description: 'Guerrero feroz. D12. Rage, defensa sin armadura. Fuerza y Constitución.',
    hitDie: 12,
    startingGold: 70,
    primaryAbility: 'str',
    secondaryAbility: 'con',
    proficiencies: {
      saves: ['str', 'con'],
      skillChoices: ['Animal Handling', 'Athletics', 'Intimidation', 'Nature', 'Perception', 'Survival'],
      skillCount: 2,
      armor: ['light', 'medium', 'shields'],
      weapons: ['simple', 'martial'],
    },
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
    startingEquipment: [
      { choice: 'weapon', options: [['hacha-grande'], ['espada-grande']], label: 'Arma principal' },
      { choice: 'secondary', options: [['hacha-de-mano', 'hacha-de-mano'], ['daga', 'daga', 'daga', 'daga']], label: 'Armas secundarias' },
      { fixed: ['mochila', 'cuerda-50'] },
    ],
    socialGuidance: 'Intimidación con FUE: coacciona enemigos. Baja CAR: evita persuasión, deja charla a aliados. Útil en combates sociales como músculo.',
    socialRole: 'Músculo del grupo / Intimidador',
    socialSkills: ['Intimidación (FUE)', 'Atletismo', 'Supervivencia'],
    socialScenarios: [
      { situation: 'Negociación hostil', tactic: 'Usa FUE para intimidar. Rompe una mesa o muestra armas. Desventaja: no hables mucho.' },
      { situation: 'Taberna o posada', tactic: 'Concursos de fuerza, bebida o lucha. Gana respeto físico, no verbal.' },
      { situation: 'Interrogatorio', tactic: 'Amenaza física directa. "Habla o te rompo". Deja las preguntas sutiles a otros.' },
      { situation: 'Tribu o clan', tactic: 'Respeta jerarquías de fuerza. Ofrece combate o demostración de poder para ganar respeto.' }
    ],
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
    proficiencies: {
      saves: ['dex', 'cha'],
      skillChoices: ['Acrobatics', 'Animal Handling', 'Arcana', 'Athletics', 'Deception', 'History', 'Insight', 'Intimidation', 'Investigation', 'Medicine', 'Nature', 'Perception', 'Performance', 'Persuasion', 'Religion', 'Sleight of Hand', 'Stealth', 'Survival'],
      skillCount: 3,
      armor: ['light'],
      weapons: ['simple', 'hand crossbows', 'longswords', 'rapiers', 'shortswords'],
      tools: ['three musical instruments'],
    },
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
    startingEquipment: [
      { choice: 'weapon', options: [['estoque'], ['espada-corta']], label: 'Arma principal' },
      { fixed: ['armadura-de-cuero', 'daga', 'mochila'] },
    ],
    socialGuidance: 'CAR excelente: líder social. Persuasión/Interpretación para evitar combates, conseguir información, ganar aliados. Hechizar Persona + CAR = control social potente en pueblos/negociaciones.',
    socialRole: 'Cara del grupo / Diplomático',
    socialSkills: ['Persuasión', 'Engaño', 'Interpretación', 'Intimidación'],
    socialScenarios: [
      { situation: 'Negociación', tactic: 'Lidera con Persuasión + Inspiración. Usa Hechizar Persona si se resisten. Alta CAR = CD difícil de superar.' },
      { situation: 'Infiltración', tactic: 'Disfrazarse + Engaño para pasar desapercibido. Interpretación para distraer mientras aliados actúan.' },
      { situation: 'Interrogatorio', tactic: 'Hechizar Persona + Sugerencia para control total. Buena cop/bad cop con Bardo como bueno.' },
      { situation: 'Corte o nobleza', tactic: 'Interpretación para ganar favor. Persuasión para favores políticos. Eres el centro de atención.' },
      { situation: 'Taberna', tactic: 'Toca música para ganar audiencia. Usa Persuasión para rumores. Gratis bebidas con Interpretación.' }
    ],
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
    proficiencies: {
      saves: ['wis', 'cha'],
      skillChoices: ['History', 'Insight', 'Medicine', 'Persuasion', 'Religion'],
      skillCount: 2,
      armor: ['light', 'medium', 'shields'],
      weapons: ['simple'],
    },
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
    startingEquipment: [
      { choice: 'weapon', options: [['maza'], ['baston']], label: 'Arma' },
      { choice: 'armor', options: [['cota-de-escamas'], ['armadura-de-cuero']], label: 'Armadura' },
      { fixed: ['escudo', 'mochila'] },
    ],
    socialGuidance: 'SAB moderada: insight, medicina. No tan social como Bardo (baja CAR), pero confiable como figura moral/religiosa. Usa posición de clérigo para respeto en comunidades.',
    socialRole: 'Autoridad religiosa / Consejero moral',
    socialSkills: ['Perspicacia (Insight)', 'Medicina', 'Persuasión (fe)', 'Religión'],
    socialScenarios: [
      { situation: 'Comunidad religiosa', tactic: 'Eres autoridad aquí. Usa tu posición para información, refugio, o aliados. Oficia ceremonias.' },
      { situation: 'Enfermos o heridos', tactic: 'Medicina + conjuros de curación te ganan confianza. Ofrece ayuda primero, pide después.' },
      { situation: 'Conflicto moral', tactic: 'Perspicacia para detectar mentiras. Actúa como mediador neutral. SAB > CAR en juicios.' },
      { situation: 'No-muertos o demonios', tactic: 'Conocimiento religioso para identificar y debilidades. Autoridad divina para intimidar criaturas.' },
      { situation: 'Funeral o duelo', tactic: 'Ofrece consuelo espiritual. Gana aliados en momentos vulnerables. Rituales dan cierre.' }
    ],
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
    proficiencies: {
      saves: ['str', 'con'],
      skillChoices: ['Acrobatics', 'Animal Handling', 'Athletics', 'History', 'Insight', 'Intimidation', 'Perception', 'Survival'],
      skillCount: 2,
      armor: ['light', 'medium', 'heavy', 'shields'],
      weapons: ['simple', 'martial'],
    },
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
    startingEquipment: [
      { choice: 'armor', options: [['cota-de-mallas'], ['armadura-de-cuero', 'arco-largo']], label: 'Armadura' },
      { choice: 'weapon', options: [['espada-larga', 'escudo'], ['espada-grande']], label: 'Arma principal' },
      { choice: 'ranged', options: [['ballesta-ligera'], ['hacha-de-mano', 'hacha-de-mano']], label: 'Arma a distancia' },
      { fixed: ['mochila'] },
    ],
    socialGuidance: 'No social (baja CAR típica). Útil como guardia, soldado. Intimidación con FUE si build cuerpo a cuerpo. Deja negociación a aliados.',
    socialRole: 'Guardia / Militar',
    socialSkills: ['Intimidación (FUE)', 'Atletismo', 'Percepción'],
    socialScenarios: [
      { situation: 'Cuartel o milicia', tactic: 'Habla de soldado a soldado. Comparte experiencia militar. Pide información de veterano a veterano.' },
      { situation: 'Escolta o guardaespaldas', tactic: 'Ofrece protección como servicio. Tu presencia física es tu argumento. Menos palabras, más acción.' },
      { situation: 'Desafío físico', tactic: 'Acepta duelos o competencias. Usa Atletismo para demostrar valía. Gana respeto con hazañas.' },
      { situation: 'Interrogatorio', tactic: 'Presencia física intimidante. Deja que el Bardo pregunte mientras tú miras fijamente.' }
    ],
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
    proficiencies: {
      saves: ['dex', 'int'],
      skillChoices: ['Acrobatics', 'Athletics', 'Deception', 'Insight', 'Intimidation', 'Investigation', 'Perception', 'Performance', 'Persuasion', 'Sleight of Hand', 'Stealth'],
      skillCount: 4,
      armor: ['light'],
      weapons: ['simple', 'hand crossbows', 'longswords', 'rapiers', 'shortswords'],
      tools: ["thieves' tools"],
    },
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
    startingEquipment: [
      { choice: 'weapon', options: [['estoque'], ['espada-corta']], label: 'Arma principal' },
      { choice: 'ranged', options: [['arco-corto'], ['espada-corta']], label: 'Segunda arma' },
      { fixed: ['armadura-de-cuero', 'daga', 'daga', 'herramientas-ladron', 'mochila'] },
    ],
    socialGuidance: 'Engaño, Sigilo, Persuasión con expertise. Infiltración social (disfraz, mentiras). Baja CAR típica: usa INT o invierte en CAR. Útil para espionaje, información.',
    socialRole: 'Infiltrador / Espía',
    socialSkills: ['Engaño', 'Sigilo', 'Juego de manos', 'Investigación'],
    socialScenarios: [
      { situation: 'Infiltración', tactic: 'Disfraz + Sigilo para entrar. Expertise en Engaño para mentiras convincentes. Trabaja en las sombras.' },
      { situation: 'Recopilación de información', tactic: 'Escucha conversaciones (Sigilo). Roba documentos (Juego de manos). Investiga pistas (INT).' },
      { situation: 'Mercado negro', tactic: 'Conoces los bajos fondos. Usa jerga de ladrones. Contactos criminales son tu red.' },
      { situation: 'Distracción', tactic: 'Mientras el Bardo habla, tú actúas. Roba, planta evidencia, o escapa. Trabajo en equipo.' },
      { situation: 'Escape rápido', tactic: 'Siempre ten ruta de escape. Cunning Action funciona fuera de combate. Desaparece antes de que noten.' }
    ],
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
    proficiencies: {
      saves: ['int', 'wis'],
      skillChoices: ['Arcana', 'History', 'Insight', 'Investigation', 'Medicine', 'Religion'],
      skillCount: 2,
      armor: [],
      weapons: ['daggers', 'darts', 'slings', 'quarterstaffs', 'light crossbows'],
    },
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
    startingEquipment: [
      { choice: 'weapon', options: [['baston'], ['daga']], label: 'Arma' },
      { fixed: ['mochila'] },
    ],
    socialGuidance: 'INT alta: Investigation, Arcana, Historia. No social (baja CAR). Útil como erudito, investigador. Conjuros de utilidad (Detectar Pensamientos) compensan.',
    socialRole: 'Erudito / Consejero',
    socialSkills: ['Arcana', 'Historia', 'Investigación', 'Naturaleza'],
    socialScenarios: [
      { situation: 'Academia o biblioteca', tactic: 'Eres experto aquí. Usa Arcana/Historia para impresionar. Pide acceso a tomos raros.' },
      { situation: 'Misterio arcano', tactic: 'Detectar Magia + Identificar para analizar. Tu conocimiento es crítico. Explica hallazgos al grupo.' },
      { situation: 'Negociación con magos', tactic: 'Habla de igual a igual. Ofrece intercambio de conocimiento. Respeta tradiciones arcanas.' },
      { situation: 'Consejo estratégico', tactic: 'Alta INT = buenas ideas. Analiza situaciones. El grupo te consulta para planes complejos.' },
      { situation: 'Artefacto o ruina antigua', tactic: 'Historia para contexto. Arcana para funcionalidad. Tu conocimiento previene errores fatales.' }
    ],
    raceSynergies: {
      Human: '+1 a todo: equilibrado. INT/CON sólidas.',
      Tiefling: '+2 CAR +1 INT: INT secundaria ayuda. Resistencia fuego + Prestidigitación gratis.',
      Elf: '+2 DES: AC mejorada (Armadura de Mago 13+DES). Trance para estudio.',
      Halfling: '+2 DES (AC). Suerte + conjuros = saves críticos consistentes.',
      Dwarf: '+2 CON: máxima supervivencia (d6 bajo). Concentración fuerte. Resistencia veneno.'
    }
  },
  // ============================================
  // NEW CLASSES
  // ============================================
  {
    id: 'Sorcerer',
    name: 'Sorcerer',
    description: 'Magia innata. D6. Lanza conjuros con CAR. Origen de magia, puntos de hechicería.',
    hitDie: 6,
    startingGold: 75,
    spellAbility: 'cha',
    primaryAbility: 'cha',
    secondaryAbility: 'con',
    proficiencies: {
      saves: ['con', 'cha'],
      skillChoices: ['Arcana', 'Deception', 'Insight', 'Intimidation', 'Persuasion', 'Religion'],
      skillCount: 2,
      armor: [],
      weapons: ['daggers', 'darts', 'slings', 'quarterstaffs', 'light crossbows'],
    },
    playstyle: 'Caster flexible con metamagia. CAR alta = CD potente. Puntos de hechicería permiten Twin Spell, Quickened Spell. Menos conjuros conocidos que Wizard pero más flexibles.',
    combatTactics: [
      '1. Mantente a distancia (60+ pies), frágil (d6)',
      '2. Twin Spell en buffs/debuffs single-target (Hechizar, Prisa)',
      '3. Quickened Spell para 2 conjuros en un turno',
      '4. Subtle Spell para lanzar sin componentes (sigilo/social)',
      '5. Usa Font of Magic para recuperar slots o ganar sorcery points'
    ],
    spellPriorities: [
      'Control: Hechizar Persona (Twin Spell = 2 objetivos)',
      'Daño: Bola de Fuego, Bola de Cromo',
      'Buff: Prisa (Twin = 2 aliados)',
      'Defensa: Escudo (reacción)'
    ],
    equipmentGuide: {
      weapons: 'Daga o bastón (emergencia). Evita combate cuerpo a cuerpo.',
      armor: 'Sin armadura. Usa Armadura de Mago o DES alta.',
      essentials: ['Focus arcano', 'Pociones de curar', 'Componentes']
    },
    startingEquipment: [
      { choice: 'weapon', options: [['ballesta-ligera'], ['daga', 'daga']], label: 'Arma' },
      { fixed: ['mochila'] },
    ],
    socialGuidance: 'CAR alta: excelente en negociación. Subtle Spell permite Sugerencia sin detectar. Líder social natural.',
    socialRole: 'Diplomático / Manipulador',
    socialSkills: ['Persuasión', 'Intimidación', 'Engaño'],
    socialScenarios: [
      { situation: 'Negociación', tactic: 'CAR alta + Subtle Spell en Sugerencia = manipulación indetectable.' },
      { situation: 'Corte o nobleza', tactic: 'Tu poder innato impresiona. Muestra magia sutil para respeto.' }
    ],
    raceSynergies: {
      Human: '+1 a todo: equilibrado.',
      Tiefling: '+2 CAR: perfecta sinergia. Resistencia fuego.',
      Halfling: '+2 DES para AC. Suerte ayuda concentración.',
      Elf: '+2 DES para defensa.',
      Dwarf: '+2 CON: supervivencia.'
    }
  },
  {
    id: 'Warlock',
    name: 'Warlock',
    description: 'Pacto oscuro. D8. Lanza conjuros con CAR. Slots se recuperan en descanso corto.',
    hitDie: 8,
    startingGold: 100,
    spellAbility: 'cha',
    primaryAbility: 'cha',
    secondaryAbility: 'con',
    proficiencies: {
      saves: ['wis', 'cha'],
      skillChoices: ['Arcana', 'Deception', 'History', 'Intimidation', 'Investigation', 'Nature', 'Religion'],
      skillCount: 2,
      armor: ['light'],
      weapons: ['simple'],
    },
    playstyle: 'Caster de corto/largo descanso. Eldritch Blast + invocaciones = daño consistente. Pocos slots pero potentes (recuperan en descanso corto). Muy customizable.',
    combatTactics: [
      '1. Eldritch Blast cada turno (mejor cantrip de daño)',
      '2. Agonizing Blast invocación: +CAR a cada rayo',
      '3. Hex para +1d6 necrotic por hit (concentración)',
      '4. Usa slots en momentos críticos (recuperan en short rest)',
      '5. Mantén distancia media (120 pies Eldritch Blast)'
    ],
    spellPriorities: [
      'Daño: Hex (+1d6 por hit), Armor of Agathys',
      'Control: Hold Person, Banishment',
      'Utilidad: Misty Step, Counterspell'
    ],
    equipmentGuide: {
      weapons: 'Bastón arcano (focus + arma). Ballesta de respaldo.',
      armor: 'Armadura ligera. Armor of Shadows invocación = Mage Armor gratis.',
      essentials: ['Focus arcano', 'Componentes', 'Pociones']
    },
    startingEquipment: [
      { choice: 'weapon', options: [['ballesta-ligera'], ['daga']], label: 'Arma' },
      { fixed: ['armadura-de-cuero', 'mochila'] },
    ],
    socialGuidance: 'CAR alta para social. Mask of Many Faces = Disfraz a voluntad. Patrón puede dar roleplay interesante.',
    socialRole: 'Misterioso / Manipulador',
    socialSkills: ['Engaño', 'Intimidación', 'Persuasión'],
    socialScenarios: [
      { situation: 'Interrogatorio', tactic: 'Intimidación + poderes oscuros. Menciona tu patrón para asustar.' },
      { situation: 'Culto o secta', tactic: 'Tu conexión con poderes mayores es creíble. Infiltra o lidera.' }
    ],
    raceSynergies: {
      Tiefling: '+2 CAR: perfecta sinergia temática y mecánica.',
      Human: '+1 a todo: versátil.',
      Elf: '+2 DES para defensa.',
      Halfling: '+2 DES + Suerte.',
      Dwarf: '+2 CON: durabilidad.'
    }
  },
  {
    id: 'Ranger',
    name: 'Ranger',
    description: 'Explorador y cazador. D10. Half-caster con SAB. Terreno favorito, enemigo favorito.',
    hitDie: 10,
    startingGold: 125,
    spellAbility: 'wis',
    primaryAbility: 'dex',
    secondaryAbility: 'wis',
    proficiencies: {
      saves: ['str', 'dex'],
      skillChoices: ['Animal Handling', 'Athletics', 'Insight', 'Investigation', 'Nature', 'Perception', 'Stealth', 'Survival'],
      skillCount: 3,
      armor: ['light', 'medium', 'shields'],
      weapons: ['simple', 'martial'],
    },
    playstyle: 'Arquero o guerrero dual-wield con magia de apoyo. Terreno favorito da ventajas en exploración. Hunter\'s Mark para daño extra. Versátil entre combate y utilidad.',
    combatTactics: [
      '1. Hunter\'s Mark en objetivo principal (+1d6 por hit)',
      '2. Arco largo a distancia o dos armas cuerpo a cuerpo',
      '3. Colossus Slayer/Horde Breaker según subclase',
      '4. Curar aliados con conjuros si necesario',
      '5. Usa terreno para emboscadas y ventaja'
    ],
    spellPriorities: [
      'Daño: Hunter\'s Mark (concentración)',
      'Curación: Cura Heridas',
      'Utilidad: Pass without Trace (sigilo grupal)',
      'Control: Ensnaring Strike, Spike Growth'
    ],
    equipmentGuide: {
      weapons: 'Arco largo (distancia) o dos espadas cortas (dual wield). DES es clave.',
      armor: 'Armadura media (coraza o escamas) o ligera con DES alta.',
      essentials: ['Flechas', 'Cuerda', 'Kit de supervivencia']
    },
    startingEquipment: [
      { choice: 'armor', options: [['cota-de-escamas'], ['armadura-de-cuero']], label: 'Armadura' },
      { choice: 'weapon', options: [['espada-corta', 'espada-corta'], ['arco-largo']], label: 'Arma' },
      { fixed: ['mochila'] },
    ],
    socialGuidance: 'SAB para Insight/Percepción. Útil como guía o rastreador. No tan social (baja CAR típica).',
    socialRole: 'Guía / Rastreador',
    socialSkills: ['Supervivencia', 'Naturaleza', 'Percepción'],
    socialScenarios: [
      { situation: 'Exploración', tactic: 'Lidera en terreno salvaje. Tu expertise es invaluable.' },
      { situation: 'Rastreo', tactic: 'Encuentra rastros, identifica criaturas. El grupo depende de ti fuera de ciudades.' }
    ],
    raceSynergies: {
      Elf: '+2 DES: perfecta para arquero. Visión en la oscuridad.',
      Human: '+1 a todo: equilibrado.',
      Halfling: '+2 DES + Suerte para ataques.',
      Dwarf: '+2 CON: durabilidad.',
      Tiefling: '+2 CAR: no ideal pero resistencia fuego útil.'
    }
  },
  {
    id: 'Monk',
    name: 'Monk',
    description: 'Artista marcial. D8. Artes marciales, Ki. Sin armadura, combate desarmado.',
    hitDie: 8,
    startingGold: 15,
    primaryAbility: 'dex',
    secondaryAbility: 'wis',
    proficiencies: {
      saves: ['str', 'dex'],
      skillChoices: ['Acrobatics', 'Athletics', 'History', 'Insight', 'Religion', 'Stealth'],
      skillCount: 2,
      armor: [],
      weapons: ['simple', 'shortswords'],
      tools: ["one artisan's tool or musical instrument"],
    },
    playstyle: 'Guerrero ágil sin armadura. Ki para habilidades especiales. Flurry of Blows = ataques extra. AC = 10 + DES + SAB. Movilidad extrema.',
    combatTactics: [
      '1. Ataque desarmado + Flurry of Blows (2 ataques bonus por 1 Ki)',
      '2. Stunning Strike para aturdir enemigos (CD = 8 + prof + SAB)',
      '3. Step of the Wind para movilidad (Dash/Disengage bonus)',
      '4. Patient Defense para Dodge como bonus action',
      '5. Usa movilidad para atacar y retirarte'
    ],
    spellPriorities: [],
    equipmentGuide: {
      weapons: 'Manos desnudas o espada corta. Armas simples si necesario.',
      armor: 'Sin armadura (Unarmored Defense). AC = 10 + DES + SAB.',
      essentials: ['Ropa simple', 'Pociones de curar']
    },
    startingEquipment: [
      { choice: 'weapon', options: [['espada-corta'], ['daga', 'daga']], label: 'Arma' },
      { fixed: ['mochila'] },
    ],
    socialGuidance: 'SAB alta para Insight. Personaje sereno y sabio. Monasterio da trasfondo interesante.',
    socialRole: 'Sabio / Observador',
    socialSkills: ['Perspicacia', 'Religión', 'Historia'],
    socialScenarios: [
      { situation: 'Templo o monasterio', tactic: 'Eres de casa aquí. Conoces tradiciones.' },
      { situation: 'Meditación', tactic: 'Tu disciplina impresiona. Ofrece sabiduría al grupo.' }
    ],
    raceSynergies: {
      Human: '+1 a todo: DES/SAB/CON todas útiles.',
      Elf: '+2 DES: excelente para AC y ataques.',
      Halfling: '+2 DES + Suerte.',
      Dwarf: '+2 CON: durabilidad.',
      Tiefling: '+2 CAR: no ideal pero resistencias útiles.'
    }
  },
  {
    id: 'Paladin',
    name: 'Paladin',
    description: 'Guerrero sagrado. D10. Half-caster con CAR. Imposición de manos, castigo divino.',
    hitDie: 10,
    startingGold: 150,
    spellAbility: 'cha',
    primaryAbility: 'str',
    secondaryAbility: 'cha',
    proficiencies: {
      saves: ['wis', 'cha'],
      skillChoices: ['Athletics', 'Insight', 'Intimidation', 'Medicine', 'Persuasion', 'Religion'],
      skillCount: 2,
      armor: ['light', 'medium', 'heavy', 'shields'],
      weapons: ['simple', 'martial'],
    },
    playstyle: 'Tanque/DPS con curación. Divine Smite = daño burst masivo (críticos devastadores). Aura de Protección = saves para todo el grupo. CAR importante para CD y auras.',
    combatTactics: [
      '1. Divine Smite en críticos (2d8 radiante extra, +1d8 vs no-muertos)',
      '2. Imposición de Manos para curación flexible',
      '3. Aura de Protección: +CAR a saves para aliados cercanos',
      '4. Guarda slots para Smite en momentos críticos',
      '5. Frontline: armadura pesada + escudo'
    ],
    spellPriorities: [
      'Curación: Cura Heridas, Lesser Restoration',
      'Buff: Bendición, Shield of Faith',
      'Smite spells: Thunderous Smite, Wrathful Smite'
    ],
    equipmentGuide: {
      weapons: 'Espada grande para DPS o espada larga + escudo para tanque.',
      armor: 'Armadura pesada (cota de mallas, placas). Escudo si no usas arma a dos manos.',
      essentials: ['Símbolo sagrado', 'Pociones de curar']
    },
    startingEquipment: [
      { choice: 'weapon', options: [['espada-grande'], ['espada-larga', 'escudo']], label: 'Arma' },
      { choice: 'secondary', options: [['hacha-de-mano', 'hacha-de-mano'], ['daga']], label: 'Arma secundaria' },
      { fixed: ['cota-de-mallas', 'mochila'] },
    ],
    socialGuidance: 'CAR alta: líder natural. Juramento da marco moral. Intimidación o Persuasión según juramento.',
    socialRole: 'Líder / Protector',
    socialSkills: ['Persuasión', 'Intimidación', 'Perspicacia'],
    socialScenarios: [
      { situation: 'Proteger inocentes', tactic: 'Tu juramento te obliga. Lidera con el ejemplo.' },
      { situation: 'Negociación', tactic: 'CAR alta + presencia imponente. Habla con autoridad.' }
    ],
    raceSynergies: {
      Human: '+1 a todo: FUE/CAR/CON todas críticas.',
      Dwarf: '+2 CON: durabilidad. Resistencia veneno.',
      Tiefling: '+2 CAR: sinergia con CD y auras.',
      Halfling: '+2 DES: no ideal pero Suerte útil.',
      Elf: '+2 DES: no óptimo para Paladin.'
    }
  },
  {
    id: 'Druid',
    name: 'Druid',
    description: 'Guardián de la naturaleza. D8. Lanza conjuros con SAB. Forma salvaje.',
    hitDie: 8,
    startingGold: 50,
    spellAbility: 'wis',
    primaryAbility: 'wis',
    secondaryAbility: 'con',
    proficiencies: {
      saves: ['int', 'wis'],
      skillChoices: ['Arcana', 'Animal Handling', 'Insight', 'Medicine', 'Nature', 'Perception', 'Religion', 'Survival'],
      skillCount: 2,
      armor: ['light', 'medium', 'shields'],
      weapons: ['clubs', 'daggers', 'darts', 'javelins', 'maces', 'quarterstaffs', 'scimitars', 'sickles', 'slings', 'spears'],
      tools: ['herbalism kit'],
    },
    playstyle: 'Caster versátil con Forma Salvaje. Prepara conjuros diariamente. Forma Salvaje = tanque temporal o exploración. Control de campo y curación.',
    combatTactics: [
      '1. Forma Salvaje (oso) para tanquear si no hay guerrero',
      '2. Conjuros de control: Enredar, Spike Growth',
      '3. Curación: Healing Word, Cure Wounds',
      '4. Call Lightning para daño sostenido',
      '5. Mantén concentración en conjuros de área'
    ],
    spellPriorities: [
      'Control: Enredar, Spike Growth, Moonbeam',
      'Curación: Healing Word, Cure Wounds',
      'Daño: Call Lightning, Produce Flame',
      'Utilidad: Pass without Trace, Speak with Animals'
    ],
    equipmentGuide: {
      weapons: 'Cimitarra o bastón. Armas de madera/natural.',
      armor: 'Armadura media (cuero, escamas). Sin metal por tradición.',
      essentials: ['Focus druídico', 'Kit de herboristería']
    },
    startingEquipment: [
      { choice: 'weapon', options: [['baston'], ['daga']], label: 'Arma' },
      { fixed: ['armadura-de-cuero', 'escudo', 'mochila'] },
    ],
    socialGuidance: 'SAB alta para Insight/Percepción. Conexión con naturaleza da perspectiva única. Speak with Animals útil.',
    socialRole: 'Guía natural / Sanador',
    socialSkills: ['Naturaleza', 'Supervivencia', 'Perspicacia'],
    socialScenarios: [
      { situation: 'Bosque o entorno natural', tactic: 'Tu dominio. Speak with Animals para información.' },
      { situation: 'Aldea rural', tactic: 'Druidas son respetados. Ofrece curación o consejo.' }
    ],
    raceSynergies: {
      Human: '+1 a todo: SAB/CON importantes.',
      Elf: '+2 DES: AC con armadura ligera. Conexión con naturaleza temática.',
      Dwarf: '+2 CON: durabilidad y concentración.',
      Halfling: '+2 DES + Suerte.',
      Tiefling: '+2 CAR: no ideal pero resistencia fuego útil.'
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
  // Sorcerer subclasses
  {
    id: 'Origen Draconico',
    name: 'Origen Draconico',
    classId: 'Sorcerer',
    description: 'Ancestro dragón. Resistencia elemental, AC mejorada, alas a nivel alto.',
    subclassTactics: [
      'Elige ancestro según daño preferido (fuego = más conjuros)',
      'Afinidad Elemental: +CAR daño a conjuros de tu elemento',
      'Escamas Dracónicas: AC 13+DES sin armadura'
    ],
    combos: [
      'Bola de Fuego + Afinidad (fuego) = +CAR daño por objetivo',
      'Quickened Spell + daño elemental = burst masivo'
    ],
    featureUsage: 'Escamas Dracónicas desde nivel 1 = AC 13+DES. Afinidad Elemental desde nivel 6 = +CAR a daño elemental.'
  },
  {
    id: 'Magia Salvaje',
    name: 'Magia Salvaje',
    classId: 'Sorcerer',
    description: 'Magia caótica. Oleadas salvajes pueden tener efectos aleatorios.',
    subclassTactics: [
      'Oleada Salvaje: efectos aleatorios pueden ayudar o perjudicar',
      'Mareas del Caos: el DM tira en tabla de efectos',
      'Alto riesgo, alta recompensa'
    ],
    combos: [
      'Bend Luck: +/-1d4 a tiradas = control sobre azar',
      'Controlled Chaos: elige entre dos resultados salvajes'
    ],
    featureUsage: 'Acepta el caos. Bend Luck (2 sorcery points) para manipular tiradas aliadas o enemigas.'
  },
  // Warlock subclasses
  {
    id: 'El Archihechicero',
    name: 'El Archihechicero',
    classId: 'Warlock',
    description: 'Pacto con entidad arcana. Lista de conjuros expandida, recuperación arcana.',
    subclassTactics: [
      'Conjuros extra de Wizard disponibles',
      'Despertar Arcano: +1d10 a spell attack o skill check',
      'Versatilidad arcana mejorada'
    ],
    combos: [
      'Eldritch Blast + Agonizing + hex = daño consistente',
      'Misty Step + Hold Person = control y movilidad'
    ],
    featureUsage: 'Usa Despertar Arcano en tiradas críticas de conjuros.'
  },
  {
    id: 'El Diablo',
    name: 'El Diablo',
    classId: 'Warlock',
    description: 'Pacto infernal. Dark One\'s Blessing, resistencia fuego.',
    subclassTactics: [
      'Dark One\'s Blessing: PV temporales al matar',
      'Resistencia fuego desde nivel 1',
      'Temática infernal fuerte'
    ],
    combos: [
      'Mata enemigo débil → PV temporales',
      'Hellish Rebuke + resistencia fuego = contraataque'
    ],
    featureUsage: 'Dark One\'s Blessing: Ganas CAR + nivel en PV temp al matar. Enfoca enemigos débiles primero.'
  },
  // Ranger subclasses
  {
    id: 'Cazador',
    name: 'Cazador',
    classId: 'Ranger',
    description: 'Especialista en caza de presas. Colossus Slayer, Horde Breaker.',
    subclassTactics: [
      'Colossus Slayer: +1d8 a enemigo dañado',
      'Horde Breaker: ataque a segundo enemigo adyacente',
      'Elige según si enfrentas uno grande o varios'
    ],
    combos: [
      'Hunter\'s Mark + Colossus Slayer = +1d6 + 1d8 extra',
      'Horde Breaker + multiattack = 3+ ataques por turno'
    ],
    featureUsage: 'Colossus Slayer: +1d8 una vez por turno si enemigo ya dañado. Asegura que aliado golpee primero o usa Hunter\'s Mark.'
  },
  {
    id: 'Maestro de Bestias',
    name: 'Maestro de Bestias',
    classId: 'Ranger',
    description: 'Compañero animal. Lucha junto a tu bestia con acciones coordinadas.',
    subclassTactics: [
      'Compañero animal actúa en tu turno',
      'Coordina ataques: tú marcas, bestia ataca',
      'Comando de bestia: bonus action'
    ],
    combos: [
      'Hunter\'s Mark + ataque bestia = daño extra',
      'Bestia tanquea mientras tú atacas a distancia'
    ],
    featureUsage: 'Compañero: Elige bestia (lobo, oso, etc.). Actúa en tu turno. Puede atacar, espiar o ayudar.'
  },
  // Monk subclasses
  {
    id: 'Camino de la Mano Abierta',
    name: 'Camino de la Mano Abierta',
    classId: 'Monk',
    description: 'Maestro del combate desarmado. Efectos adicionales en Flurry of Blows.',
    subclassTactics: [
      'Flurry of Blows puede empujar, derribar o quitar reacciones',
      'Técnica de Mano Abierta: control en cada golpe',
      'Wholeness of Body: auto-curación'
    ],
    combos: [
      'Flurry + derribar = ventaja en siguiente ataque',
      'Empujar + Spike Growth aliado = daño extra',
      'Quitar reacción + aliado escapa sin oportunidad'
    ],
    featureUsage: 'Flurry of Blows: Elige empujar 15ft, derribar, o quitar reacción. Derribar da ventaja.'
  },
  {
    id: 'Camino de la Sombra',
    name: 'Camino de la Sombra',
    classId: 'Monk',
    description: 'Ninja místico. Conjuros de sombra, teleportación oscura.',
    subclassTactics: [
      'Shadow Arts: Oscuridad, Silencio, etc. por Ki',
      'Shadow Step: teleport 60ft entre sombras',
      'Asesino sigiloso'
    ],
    combos: [
      'Oscuridad + Shadow Step = combate invisible',
      'Silencio + Stunning Strike = control total'
    ],
    featureUsage: 'Shadow Step (nivel 6): Teleport 60ft entre sombras como bonus action. Ventaja en siguiente ataque.'
  },
  // Paladin subclasses
  {
    id: 'Juramento de Devocion',
    name: 'Juramento de Devoción',
    classId: 'Paladin',
    description: 'Paladín clásico. Sacred Weapon, Turn the Unholy.',
    subclassTactics: [
      'Sacred Weapon: +CAR a ataques por 1 minuto',
      'Turn the Unholy: asusta no-muertos y demonios',
      'Aura de Devoción: inmune a encantamiento'
    ],
    combos: [
      'Sacred Weapon + Smite = ataques devastadores',
      'Aura + grupo = todos inmunes a Charm'
    ],
    featureUsage: 'Sacred Weapon: +CAR a ataques por 1 minuto. Usa antes de combates importantes.'
  },
  {
    id: 'Juramento de Venganza',
    name: 'Juramento de Venganza',
    classId: 'Paladin',
    description: 'Cazador implacable. Vow of Enmity, Hunter\'s Mark.',
    subclassTactics: [
      'Vow of Enmity: ventaja contra un enemigo',
      'Relentless Avenger: movimiento extra al golpear',
      'Enfocado en destruir un objetivo'
    ],
    combos: [
      'Vow of Enmity + Smite = críticos frecuentes + daño máximo',
      'Hunter\'s Mark + múltiples ataques = daño sostenido'
    ],
    featureUsage: 'Vow of Enmity: Ventaja en ataques contra un enemigo por 1 minuto. Usa en jefe o amenaza principal.'
  },
  // Druid subclasses
  {
    id: 'Circulo de la Luna',
    name: 'Circulo de la Luna',
    classId: 'Druid',
    description: 'Maestro de Forma Salvaje. Formas más poderosas, combate animal.',
    subclassTactics: [
      'Combat Wild Shape: bonus action, más formas CR',
      'Oso a nivel 2 = tanque temprano',
      'Gastar slots para curar en forma animal'
    ],
    combos: [
      'Wild Shape (oso) + slots para curar = HP casi infinitos',
      'Elemental forms a nivel 10+ = poder extremo'
    ],
    featureUsage: 'Combat Wild Shape: Transforma como bonus action. CR 1 desde nivel 2 (oso = 34 HP temporal).'
  },
  {
    id: 'Circulo de la Tierra',
    name: 'Circulo de la Tierra',
    classId: 'Druid',
    description: 'Caster enfocado. Conjuros extra según terreno, recuperación natural.',
    subclassTactics: [
      'Natural Recovery: recupera slots en descanso corto',
      'Conjuros de círculo según terreno elegido',
      'Menos Wild Shape, más casting'
    ],
    combos: [
      'Natural Recovery + múltiples encuentros = más slots',
      'Spike Growth + Thorn Whip = daño masivo por turno'
    ],
    featureUsage: 'Natural Recovery: Recupera niveles de slot = nivel/2. Usa en dungeons largos.'
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
  // ============================================
  // WEAPONS
  // ============================================
  {
    id: 'daga',
    name: 'Daga',
    category: 'Arma',
    cost: '2 po',
    costGold: 2,
    description: '1d4 perforante. Finesse, arrojadiza 20/60. Ligera.',
    mechanics: {
      type: 'weapon',
      weaponType: 'simple',
      damage: '1d4',
      damageType: 'perforante',
      properties: ['finesse', 'light', 'thrown'],
      range: { normal: 20, long: 60 },
      twoHanded: false
    }
  },
  {
    id: 'espada-corta',
    name: 'Espada corta',
    category: 'Arma',
    cost: '10 po',
    costGold: 10,
    description: '1d6 perforante. Finesse, ligera.',
    mechanics: {
      type: 'weapon',
      weaponType: 'martial',
      damage: '1d6',
      damageType: 'perforante',
      properties: ['finesse', 'light'],
      range: null,
      twoHanded: false
    }
  },
  {
    id: 'estoque',
    name: 'Estoque',
    category: 'Arma',
    cost: '25 po',
    costGold: 25,
    description: '1d8 perforante. Finesse.',
    mechanics: {
      type: 'weapon',
      weaponType: 'martial',
      damage: '1d8',
      damageType: 'perforante',
      properties: ['finesse'],
      range: null,
      twoHanded: false
    }
  },
  {
    id: 'hacha-de-mano',
    name: 'Hacha de mano',
    category: 'Arma',
    cost: '5 po',
    costGold: 5,
    description: '1d6 cortante. Ligera, arrojadiza 20/60.',
    mechanics: {
      type: 'weapon',
      weaponType: 'simple',
      damage: '1d6',
      damageType: 'cortante',
      properties: ['light', 'thrown'],
      range: { normal: 20, long: 60 },
      twoHanded: false
    }
  },
  {
    id: 'arco-corto',
    name: 'Arco corto',
    category: 'Arma',
    cost: '25 po',
    costGold: 25,
    description: '1d6 perforante. Alcance 80/320. Munición.',
    mechanics: {
      type: 'weapon',
      weaponType: 'simple',
      damage: '1d6',
      damageType: 'perforante',
      properties: ['ammunition', 'two-handed'],
      range: { normal: 80, long: 320 },
      twoHanded: true
    }
  },
  {
    id: 'espada-larga',
    name: 'Espada larga',
    category: 'Arma',
    cost: '15 po',
    costGold: 15,
    description: '1d8 cortante (1d10 a dos manos). Versátil.',
    mechanics: {
      type: 'weapon',
      weaponType: 'martial',
      damage: '1d8',
      damageType: 'cortante',
      properties: ['versatile'],
      range: null,
      twoHanded: false,
      versatileDamage: '1d10'
    }
  },
  {
    id: 'hacha-grande',
    name: 'Hacha grande',
    category: 'Arma',
    cost: '30 po',
    costGold: 30,
    description: '1d12 cortante. Pesada, a dos manos.',
    mechanics: {
      type: 'weapon',
      weaponType: 'martial',
      damage: '1d12',
      damageType: 'cortante',
      properties: ['heavy', 'two-handed'],
      range: null,
      twoHanded: true
    }
  },
  {
    id: 'espada-grande',
    name: 'Espada grande',
    category: 'Arma',
    cost: '50 po',
    costGold: 50,
    description: '2d6 cortante. Pesada, a dos manos.',
    mechanics: {
      type: 'weapon',
      weaponType: 'martial',
      damage: '2d6',
      damageType: 'cortante',
      properties: ['heavy', 'two-handed'],
      range: null,
      twoHanded: true
    }
  },
  {
    id: 'arco-largo',
    name: 'Arco largo',
    category: 'Arma',
    cost: '50 po',
    costGold: 50,
    description: '1d8 perforante. Alcance 150/600. Pesado, munición.',
    mechanics: {
      type: 'weapon',
      weaponType: 'martial',
      damage: '1d8',
      damageType: 'perforante',
      properties: ['ammunition', 'heavy', 'two-handed'],
      range: { normal: 150, long: 600 },
      twoHanded: true
    }
  },
  {
    id: 'ballesta-ligera',
    name: 'Ballesta ligera',
    category: 'Arma',
    cost: '25 po',
    costGold: 25,
    description: '1d8 perforante. Alcance 80/320. Munición, carga.',
    mechanics: {
      type: 'weapon',
      weaponType: 'simple',
      damage: '1d8',
      damageType: 'perforante',
      properties: ['ammunition', 'loading', 'two-handed'],
      range: { normal: 80, long: 320 },
      twoHanded: true
    }
  },
  {
    id: 'maza',
    name: 'Maza',
    category: 'Arma',
    cost: '5 po',
    costGold: 5,
    description: '1d6 contundente. Simple.',
    mechanics: {
      type: 'weapon',
      weaponType: 'simple',
      damage: '1d6',
      damageType: 'contundente',
      properties: [],
      range: null,
      twoHanded: false
    }
  },
  {
    id: 'baston',
    name: 'Bastón',
    category: 'Arma',
    cost: '2 pp',
    costGold: 0.2,
    description: '1d6 contundente (1d8 a dos manos). Versátil.',
    mechanics: {
      type: 'weapon',
      weaponType: 'simple',
      damage: '1d6',
      damageType: 'contundente',
      properties: ['versatile'],
      range: null,
      twoHanded: false,
      versatileDamage: '1d8'
    }
  },

  // ============================================
  // ARMOR
  // ============================================
  {
    id: 'armadura-acolchada',
    name: 'Armadura acolchada',
    category: 'Armadura',
    cost: '5 po',
    costGold: 5,
    description: 'AC 11 + DES. Armadura ligera. Desventaja sigilo.',
    mechanics: {
      type: 'armor',
      armorType: 'light',
      baseAC: 11,
      addDex: true,
      maxDex: null,
      stealthDisadvantage: true,
      strRequirement: null
    }
  },
  {
    id: 'armadura-de-cuero',
    name: 'Armadura de cuero',
    category: 'Armadura',
    cost: '10 po',
    costGold: 10,
    description: 'AC 11 + DES. Armadura ligera.',
    mechanics: {
      type: 'armor',
      armorType: 'light',
      baseAC: 11,
      addDex: true,
      maxDex: null,
      stealthDisadvantage: false,
      strRequirement: null
    }
  },
  {
    id: 'cuero-tachonado',
    name: 'Cuero tachonado',
    category: 'Armadura',
    cost: '45 po',
    costGold: 45,
    description: 'AC 12 + DES. Armadura ligera.',
    mechanics: {
      type: 'armor',
      armorType: 'light',
      baseAC: 12,
      addDex: true,
      maxDex: null,
      stealthDisadvantage: false,
      strRequirement: null
    }
  },
  {
    id: 'camisote-de-mallas',
    name: 'Camisote de mallas',
    category: 'Armadura',
    cost: '50 po',
    costGold: 50,
    description: 'AC 13 + DES (máx 2). Armadura media.',
    mechanics: {
      type: 'armor',
      armorType: 'medium',
      baseAC: 13,
      addDex: true,
      maxDex: 2,
      stealthDisadvantage: false,
      strRequirement: null
    }
  },
  {
    id: 'cota-de-escamas',
    name: 'Cota de escamas',
    category: 'Armadura',
    cost: '50 po',
    costGold: 50,
    description: 'AC 14 + DES (máx 2). Armadura media. Desventaja sigilo.',
    mechanics: {
      type: 'armor',
      armorType: 'medium',
      baseAC: 14,
      addDex: true,
      maxDex: 2,
      stealthDisadvantage: true,
      strRequirement: null
    }
  },
  {
    id: 'coraza',
    name: 'Coraza',
    category: 'Armadura',
    cost: '400 po',
    costGold: 400,
    description: 'AC 14 + DES (máx 2). Armadura media.',
    mechanics: {
      type: 'armor',
      armorType: 'medium',
      baseAC: 14,
      addDex: true,
      maxDex: 2,
      stealthDisadvantage: false,
      strRequirement: null
    }
  },
  {
    id: 'media-armadura',
    name: 'Media armadura',
    category: 'Armadura',
    cost: '750 po',
    costGold: 750,
    description: 'AC 15 + DES (máx 2). Armadura media. Desventaja sigilo.',
    mechanics: {
      type: 'armor',
      armorType: 'medium',
      baseAC: 15,
      addDex: true,
      maxDex: 2,
      stealthDisadvantage: true,
      strRequirement: null
    }
  },
  {
    id: 'cota-de-anillas',
    name: 'Cota de anillas',
    category: 'Armadura',
    cost: '30 po',
    costGold: 30,
    description: 'AC 14. Armadura pesada. Desventaja sigilo.',
    mechanics: {
      type: 'armor',
      armorType: 'heavy',
      baseAC: 14,
      addDex: false,
      maxDex: null,
      stealthDisadvantage: true,
      strRequirement: null
    }
  },
  {
    id: 'cota-de-mallas',
    name: 'Cota de mallas',
    category: 'Armadura',
    cost: '75 po',
    costGold: 75,
    description: 'AC 16. FUE 13. Armadura pesada. Desventaja sigilo.',
    mechanics: {
      type: 'armor',
      armorType: 'heavy',
      baseAC: 16,
      addDex: false,
      maxDex: null,
      stealthDisadvantage: true,
      strRequirement: 13
    }
  },
  {
    id: 'armadura-de-bandas',
    name: 'Armadura de bandas',
    category: 'Armadura',
    cost: '200 po',
    costGold: 200,
    description: 'AC 17. FUE 15. Armadura pesada. Desventaja sigilo.',
    mechanics: {
      type: 'armor',
      armorType: 'heavy',
      baseAC: 17,
      addDex: false,
      maxDex: null,
      stealthDisadvantage: true,
      strRequirement: 15
    }
  },
  {
    id: 'armadura-de-placas',
    name: 'Armadura de placas',
    category: 'Armadura',
    cost: '1500 po',
    costGold: 1500,
    description: 'AC 18. FUE 15. Armadura pesada. Desventaja sigilo.',
    mechanics: {
      type: 'armor',
      armorType: 'heavy',
      baseAC: 18,
      addDex: false,
      maxDex: null,
      stealthDisadvantage: true,
      strRequirement: 15
    }
  },

  // ============================================
  // SHIELDS
  // ============================================
  {
    id: 'escudo',
    name: 'Escudo',
    category: 'Escudo',
    cost: '10 po',
    costGold: 10,
    description: '+2 AC. Requiere una mano.',
    mechanics: {
      type: 'shield',
      acBonus: 2
    }
  },

  // ============================================
  // ADVENTURING GEAR
  // ============================================
  {
    id: 'kit-medico',
    name: 'Kit médico',
    category: 'Herramienta',
    cost: '5 po',
    costGold: 5,
    description: 'Estabiliza criaturas a 0 PG sin tirada. 10 usos.',
    mechanics: { type: 'gear', uses: 10 }
  },
  {
    id: 'herramientas-ladron',
    name: 'Herramientas de ladrón',
    category: 'Herramienta',
    cost: '25 po',
    costGold: 25,
    description: 'Abrir cerraduras y desarmar trampas.',
    mechanics: { type: 'gear' }
  },
  {
    id: 'cuerda-50',
    name: 'Cuerda de cáñamo (50 pies)',
    category: 'Equipo',
    cost: '1 po',
    costGold: 1,
    description: 'Resistencia. Escalar, atar, rappel.',
    mechanics: { type: 'gear' }
  },
  {
    id: 'antorcha',
    name: 'Antorcha',
    category: 'Equipo',
    cost: '1 cp',
    costGold: 0.01,
    description: 'Luz 20 pies, 1 hora. 1d8 fuego como arma improvisada.',
    mechanics: { type: 'gear', light: 20, duration: '1 hora' }
  },
  {
    id: 'mochila',
    name: 'Mochila',
    category: 'Equipo',
    cost: '2 po',
    costGold: 2,
    description: 'Contenedor 1 pie cúbico. 30 lb capacidad.',
    mechanics: { type: 'gear', capacity: 30 }
  },
  {
    id: 'raciones-dia',
    name: 'Raciones (1 día)',
    category: 'Consumible',
    cost: '5 pp',
    costGold: 0.5,
    description: 'Comida y agua para un día.',
    mechanics: { type: 'consumable' }
  },
  {
    id: 'pocion-curar',
    name: 'Poción de curar',
    category: 'Consumible',
    cost: '50 po',
    costGold: 50,
    description: '2d4+2 PG al beber. Acción.',
    mechanics: { type: 'consumable', healing: '2d4+2' }
  },
  {
    id: 'petate',
    name: 'Petate',
    category: 'Equipo',
    cost: '1 po',
    costGold: 1,
    description: 'Saco de dormir. Descanso cómodo.',
    mechanics: { type: 'gear' }
  },
  {
    id: 'yesquero',
    name: 'Yesquero',
    category: 'Equipo',
    cost: '5 pp',
    costGold: 0.5,
    description: 'Encender fuegos. Eslabón, pedernal y yesca.',
    mechanics: { type: 'gear' }
  },
  {
    id: 'odre',
    name: 'Odre',
    category: 'Equipo',
    cost: '2 pp',
    costGold: 0.2,
    description: 'Contiene 4 pintas de líquido.',
    mechanics: { type: 'gear', capacity: 4 }
  },
  {
    id: 'linterna',
    name: 'Linterna con capucha',
    category: 'Equipo',
    cost: '5 po',
    costGold: 5,
    description: 'Luz brillante 30 pies, tenue 30 más. 6 horas.',
    mechanics: { type: 'gear', light: 30, duration: '6 horas' }
  },
];

/** SRD Feats - can be taken instead of ASI at levels 4, 8, 12, 16, 19. */
export const feats = [
  {
    id: 'alert',
    name: 'Alerta',
    nameEn: 'Alert',
    description: '+5 a iniciativa. No puedes ser sorprendido. No dan ventaja contra ti por estar ocultos.',
    benefit: '+5 iniciativa, inmune a sorpresa',
    requirements: null,
  },
  {
    id: 'athlete',
    name: 'Atleta',
    nameEn: 'Athlete',
    description: '+1 FUE o DES. Levantarte solo cuesta 5 pies. Escalar no reduce velocidad. Salto con carrera de 5 pies.',
    benefit: '+1 FUE/DES, mejor movilidad',
    requirements: null,
    abilityBonus: { str: 1, dex: 1 },
  },
  {
    id: 'charger',
    name: 'Cargador',
    nameEn: 'Charger',
    description: 'Tras Dash, ataque bonus con +5 daño o empujar 10 pies.',
    benefit: 'Ataque bonus tras Dash',
    requirements: null,
  },
  {
    id: 'defensive-duelist',
    name: 'Duelista Defensivo',
    nameEn: 'Defensive Duelist',
    description: 'Con arma Finesse, reacción para +proficiencia a AC contra un ataque.',
    benefit: '+prof AC como reacción',
    requirements: 'DES 13+',
  },
  {
    id: 'dual-wielder',
    name: 'Combatiente con Dos Armas',
    nameEn: 'Dual Wielder',
    description: '+1 AC con arma en cada mano. Usa armas no ligeras. Desenfundar 2 armas.',
    benefit: '+1 AC, armas mayores',
    requirements: null,
  },
  {
    id: 'grappler',
    name: 'Luchador',
    nameEn: 'Grappler',
    description: 'Ventaja a ataques contra agarrados. Puedes inmovilizar (restrained) a agarrados.',
    benefit: 'Mejor agarre',
    requirements: 'FUE 13+',
  },
  {
    id: 'great-weapon-master',
    name: 'Maestro de Armas Grandes',
    nameEn: 'Great Weapon Master',
    description: 'Crítico o matar = ataque bonus. -5 ataque para +10 daño.',
    benefit: 'Ataque bonus, +10 daño opción',
    requirements: null,
  },
  {
    id: 'healer',
    name: 'Sanador',
    nameEn: 'Healer',
    description: 'Kit médico: estabilizar + 1 HP. Usa kit para curar 1d6+4+nivel max HP (1/descanso).',
    benefit: 'Curación sin magia',
    requirements: null,
  },
  {
    id: 'inspiring-leader',
    name: 'Líder Inspirador',
    nameEn: 'Inspiring Leader',
    description: 'Discurso 10 min: hasta 6 criaturas ganan nivel+CAR PV temporales.',
    benefit: 'PV temp para grupo',
    requirements: 'CAR 13+',
  },
  {
    id: 'lucky',
    name: 'Afortunado',
    nameEn: 'Lucky',
    description: '3 puntos de suerte/día. Tira d20 adicional en ataque, salvación o check.',
    benefit: 'Re-roll 3/día',
    requirements: null,
  },
  {
    id: 'mage-slayer',
    name: 'Mata Magos',
    nameEn: 'Mage Slayer',
    description: 'Reacción: ataca caster adyacente. Ventaja en saves vs conjuros adyacentes. Impones desventaja concentración.',
    benefit: 'Anti-caster',
    requirements: null,
  },
  {
    id: 'mobile',
    name: 'Móvil',
    nameEn: 'Mobile',
    description: '+10 velocidad. Dash ignora terreno difícil. No provocas oportunidad de quien atacas.',
    benefit: '+10 velocidad, escape libre',
    requirements: null,
  },
  {
    id: 'observant',
    name: 'Observador',
    nameEn: 'Observant',
    description: '+1 INT o SAB. +5 Percepción pasiva e Investigación pasiva. Lees labios.',
    benefit: '+5 pasivos, +1 INT/SAB',
    requirements: null,
    abilityBonus: { int: 1, wis: 1 },
  },
  {
    id: 'resilient',
    name: 'Resiliente',
    nameEn: 'Resilient',
    description: '+1 a una característica. Ganas competencia en salvaciones de esa característica.',
    benefit: '+1 y save proficiency',
    requirements: null,
    abilityBonus: { str: 1, dex: 1, con: 1, int: 1, wis: 1, cha: 1 },
  },
  {
    id: 'savage-attacker',
    name: 'Atacante Salvaje',
    nameEn: 'Savage Attacker',
    description: 'Una vez por turno, re-roll daño de arma cuerpo a cuerpo.',
    benefit: 'Re-roll daño 1/turno',
    requirements: null,
  },
  {
    id: 'sentinel',
    name: 'Centinela',
    nameEn: 'Sentinel',
    description: 'Oportunidad reduce velocidad a 0. Ataca aunque Disengage. Reacción si atacan a aliado.',
    benefit: 'Control de posición',
    requirements: null,
  },
  {
    id: 'sharpshooter',
    name: 'Tirador Certero',
    nameEn: 'Sharpshooter',
    description: 'Ignora cobertura parcial. Sin desventaja a largo alcance. -5 ataque para +10 daño.',
    benefit: 'Ignora cobertura, +10 daño',
    requirements: null,
  },
  {
    id: 'shield-master',
    name: 'Maestro de Escudo',
    nameEn: 'Shield Master',
    description: 'Bonus: empujar con escudo. +2 a saves DES. Reacción: sin daño en save DES exitoso.',
    benefit: 'Escudo ofensivo y defensivo',
    requirements: null,
  },
  {
    id: 'skulker',
    name: 'Acechador',
    nameEn: 'Skulker',
    description: 'Esconderte en luz tenue. Fallo de ataque no revela posición. Sin desventaja Percepción en oscuridad.',
    benefit: 'Mejor sigilo',
    requirements: 'DES 13+',
  },
  {
    id: 'tough',
    name: 'Duro',
    nameEn: 'Tough',
    description: '+2 PV por nivel (retroactivo y futuro).',
    benefit: '+2 HP/nivel',
    requirements: null,
  },
  {
    id: 'war-caster',
    name: 'Conjurador de Guerra',
    nameEn: 'War Caster',
    description: 'Ventaja en concentración. Somáticos con manos ocupadas. Oportunidad = cantrip.',
    benefit: 'Mejor concentración, cantrip como oportunidad',
    requirements: 'Capacidad de lanzar conjuros',
  },
];

/** D&D 5e Subraces */
export const subraces = [
  // Elf subraces
  {
    id: 'high-elf',
    name: 'Alto Elfo',
    raceId: 'Elf',
    description: '+1 INT. Cantrip de Wizard. Extra idioma.',
    abilityBonus: { int: 1 },
    traits: ['Cantrip de Wizard a elección', 'Idioma extra'],
    extraLanguages: 1,
  },
  {
    id: 'wood-elf',
    name: 'Elfo del Bosque',
    raceId: 'Elf',
    description: '+1 SAB. Velocidad 35 pies. Ocultarse en la naturaleza.',
    abilityBonus: { wis: 1 },
    speedBonus: 5,
    traits: ['Velocidad 35 pies', 'Máscara de la Naturaleza (ocultarse en vegetación)'],
  },
  {
    id: 'drow',
    name: 'Elfo Oscuro (Drow)',
    raceId: 'Elf',
    description: '+1 CAR. Visión superior 120 pies. Magia innata. Sensibilidad solar.',
    abilityBonus: { cha: 1 },
    traits: ['Visión en la oscuridad superior (120 pies)', 'Sensibilidad solar', 'Magia drow (Luces Danzantes)'],
  },
  // Dwarf subraces
  {
    id: 'hill-dwarf',
    name: 'Enano de las Colinas',
    raceId: 'Dwarf',
    description: '+1 SAB. +1 PV por nivel.',
    abilityBonus: { wis: 1 },
    hpBonus: 1, // per level
    traits: ['+1 PV por nivel (Dureza Enana)'],
  },
  {
    id: 'mountain-dwarf',
    name: 'Enano de las Montañas',
    raceId: 'Dwarf',
    description: '+2 FUE. Competencia con armadura ligera y media.',
    abilityBonus: { str: 2 },
    armorProficiency: ['light', 'medium'],
    traits: ['Competencia con armadura ligera y media'],
  },
  // Halfling subraces
  {
    id: 'lightfoot-halfling',
    name: 'Mediano Piesligeros',
    raceId: 'Halfling',
    description: '+1 CAR. Puede esconderse detrás de criaturas medianas.',
    abilityBonus: { cha: 1 },
    traits: ['Naturalmente sigiloso (puede esconderse detrás de criaturas medianas)'],
  },
  {
    id: 'stout-halfling',
    name: 'Mediano Fornido',
    raceId: 'Halfling',
    description: '+1 CON. Resistencia al veneno.',
    abilityBonus: { con: 1 },
    traits: ['Resistencia al veneno'],
  },
  // Gnome subraces
  {
    id: 'forest-gnome',
    name: 'Gnomo del Bosque',
    raceId: 'Gnome',
    description: '+1 DES. Hablar con bestias pequeñas.',
    abilityBonus: { dex: 1 },
    traits: ['Hablar con bestias pequeñas (ilusionismo menor)'],
  },
  {
    id: 'rock-gnome',
    name: 'Gnomo de Roca',
    raceId: 'Gnome',
    description: '+1 CON. Artesano, juguetes mecánicos.',
    abilityBonus: { con: 1 },
    traits: ['Astucia de artesano', 'Juguetes mecánicos'],
  },
];

/** D&D 5e Backgrounds */
export const backgrounds = [
  {
    id: 'acolyte',
    name: 'Acólito',
    description: 'Serviste en un templo. Conoces rituales y tienes contactos religiosos.',
    skillProficiencies: ['Insight', 'Religion'],
    languages: 2, // Number of extra languages to choose
    feature: 'Refugio de los Fieles',
    featureDesc: 'Puedes pedir santuario y ayuda en templos de tu fe.',
  },
  {
    id: 'charlatan',
    name: 'Charlatán',
    description: 'Eres un estafador experto en engaños y disfraces.',
    skillProficiencies: ['Deception', 'Sleight of Hand'],
    toolProficiencies: ['kit de disfraz', 'kit de falsificación'],
    feature: 'Identidad Falsa',
    featureDesc: 'Tienes documentos y identidad falsa establecida.',
  },
  {
    id: 'criminal',
    name: 'Criminal',
    description: 'Tienes pasado delictivo y contactos en el mundo criminal.',
    skillProficiencies: ['Deception', 'Stealth'],
    toolProficiencies: ['set de juego', 'herramientas de ladrón'],
    feature: 'Contacto Criminal',
    featureDesc: 'Tienes un contacto fiable en el mundo criminal.',
  },
  {
    id: 'entertainer',
    name: 'Artista',
    description: 'Eres un actor, músico o artista que vive del espectáculo.',
    skillProficiencies: ['Acrobatics', 'Performance'],
    toolProficiencies: ['kit de disfraz', 'un instrumento musical'],
    feature: 'Por Demanda Popular',
    featureDesc: 'Puedes encontrar un lugar para actuar a cambio de alojamiento.',
  },
  {
    id: 'folk-hero',
    name: 'Héroe del Pueblo',
    description: 'Eres un héroe común admirado por la gente sencilla.',
    skillProficiencies: ['Animal Handling', 'Survival'],
    toolProficiencies: ['herramientas de artesano', 'vehículos terrestres'],
    feature: 'Hospitalidad Rústica',
    featureDesc: 'La gente común te oculta y ayuda.',
  },
  {
    id: 'noble',
    name: 'Noble',
    description: 'Perteneces a la nobleza con privilegios y responsabilidades.',
    skillProficiencies: ['History', 'Persuasion'],
    toolProficiencies: ['set de juego'],
    languages: 1,
    feature: 'Posición de Privilegio',
    featureDesc: 'La gente te trata con deferencia. Puedes obtener audiencias.',
  },
  {
    id: 'outlander',
    name: 'Forastero',
    description: 'Creciste lejos de la civilización, en tierras salvajes.',
    skillProficiencies: ['Athletics', 'Survival'],
    toolProficiencies: ['un instrumento musical'],
    languages: 1,
    feature: 'Errante',
    featureDesc: 'Recuerdas mapas y geografía. Puedes encontrar comida y agua.',
  },
  {
    id: 'sage',
    name: 'Sabio',
    description: 'Dedicaste tu vida al estudio y conocimiento académico.',
    skillProficiencies: ['Arcana', 'History'],
    languages: 2,
    feature: 'Investigador',
    featureDesc: 'Sabes dónde obtener información que no conoces.',
  },
  {
    id: 'soldier',
    name: 'Soldado',
    description: 'Serviste en un ejército y conoces la vida militar.',
    skillProficiencies: ['Athletics', 'Intimidation'],
    toolProficiencies: ['set de juego', 'vehículos terrestres'],
    feature: 'Rango Militar',
    featureDesc: 'Reconocen tu rango. Soldados te ayudan.',
  },
  {
    id: 'urchin',
    name: 'Huérfano',
    description: 'Creciste en las calles, sobreviviendo con ingenio.',
    skillProficiencies: ['Sleight of Hand', 'Stealth'],
    toolProficiencies: ['kit de disfraz', 'herramientas de ladrón'],
    feature: 'Secretos de la Ciudad',
    featureDesc: 'Conoces pasajes secretos en ciudades.',
  },
];

/** D&D 5e Languages */
export const languages = [
  { id: 'common', name: 'Común', script: 'Común', typical: 'Humanos' },
  { id: 'dwarvish', name: 'Enano', script: 'Enano', typical: 'Enanos' },
  { id: 'elvish', name: 'Élfico', script: 'Élfico', typical: 'Elfos' },
  { id: 'giant', name: 'Gigante', script: 'Enano', typical: 'Ogros, Gigantes' },
  { id: 'gnomish', name: 'Gnomo', script: 'Enano', typical: 'Gnomos' },
  { id: 'goblin', name: 'Goblin', script: 'Enano', typical: 'Goblins, Hobgoblins' },
  { id: 'halfling', name: 'Mediano', script: 'Común', typical: 'Medianos' },
  { id: 'orc', name: 'Orco', script: 'Enano', typical: 'Orcos' },
  { id: 'abyssal', name: 'Abisal', script: 'Infernal', typical: 'Demonios' },
  { id: 'celestial', name: 'Celestial', script: 'Celestial', typical: 'Celestiales' },
  { id: 'draconic', name: 'Dracónico', script: 'Dracónico', typical: 'Dragones' },
  { id: 'deep-speech', name: 'Habla Profunda', script: '—', typical: 'Aberraciones' },
  { id: 'infernal', name: 'Infernal', script: 'Infernal', typical: 'Diablos' },
  { id: 'primordial', name: 'Primordial', script: 'Enano', typical: 'Elementales' },
  { id: 'sylvan', name: 'Silvano', script: 'Élfico', typical: 'Criaturas feéricas' },
  { id: 'undercommon', name: 'Infracomún', script: 'Élfico', typical: 'Criaturas subterráneas' },
];

/** D&D 5e Conditions - status effects that affect characters. */
export const conditions = [
  {
    id: 'blinded',
    name: 'Cegado',
    nameEn: 'Blinded',
    effects: [
      'No puede ver, falla automáticamente chequeos que requieren visión',
      'Ataques tienen desventaja',
      'Ataques contra la criatura tienen ventaja'
    ],
  },
  {
    id: 'charmed',
    name: 'Encantado',
    nameEn: 'Charmed',
    effects: [
      'No puede atacar al encantador',
      'Encantador tiene ventaja en interacciones sociales'
    ],
  },
  {
    id: 'deafened',
    name: 'Ensordecido',
    nameEn: 'Deafened',
    effects: ['No puede oír, falla chequeos que requieren oído'],
  },
  {
    id: 'frightened',
    name: 'Asustado',
    nameEn: 'Frightened',
    effects: [
      'Desventaja en chequeos y ataques mientras ve la fuente del miedo',
      'No puede acercarse voluntariamente a la fuente'
    ],
  },
  {
    id: 'grappled',
    name: 'Agarrado',
    nameEn: 'Grappled',
    effects: ['Velocidad es 0', 'Termina si el agarrador es incapacitado o alejado'],
  },
  {
    id: 'incapacitated',
    name: 'Incapacitado',
    nameEn: 'Incapacitated',
    effects: ['No puede tomar acciones ni reacciones'],
  },
  {
    id: 'invisible',
    name: 'Invisible',
    nameEn: 'Invisible',
    effects: [
      'Imposible de ver sin magia o sentidos especiales',
      'Se considera muy oculto para sigilo',
      'Ataques tienen ventaja, ataques contra tienen desventaja'
    ],
  },
  {
    id: 'paralyzed',
    name: 'Paralizado',
    nameEn: 'Paralyzed',
    effects: [
      'Incapacitado, no puede moverse ni hablar',
      'Falla automáticamente salvaciones de FUE y DES',
      'Ataques tienen ventaja, impactos desde 5ft son críticos'
    ],
  },
  {
    id: 'petrified',
    name: 'Petrificado',
    nameEn: 'Petrified',
    effects: [
      'Transformado en piedra inanimada',
      'Peso × 10, deja de envejecer',
      'Incapacitado, no puede moverse ni hablar',
      'Resistencia a todo daño, inmune a veneno y enfermedad'
    ],
  },
  {
    id: 'poisoned',
    name: 'Envenenado',
    nameEn: 'Poisoned',
    effects: ['Desventaja en tiradas de ataque y chequeos de característica'],
  },
  {
    id: 'prone',
    name: 'Derribado',
    nameEn: 'Prone',
    effects: [
      'Solo puede arrastrarse o gastar mitad de velocidad para levantarse',
      'Desventaja en ataques',
      'Ataques desde 5ft tienen ventaja, desde lejos tienen desventaja'
    ],
  },
  {
    id: 'restrained',
    name: 'Apresado',
    nameEn: 'Restrained',
    effects: [
      'Velocidad es 0',
      'Desventaja en ataques y salvaciones de DES',
      'Ataques contra tienen ventaja'
    ],
  },
  {
    id: 'stunned',
    name: 'Aturdido',
    nameEn: 'Stunned',
    effects: [
      'Incapacitado, no puede moverse, habla entrecortada',
      'Falla automáticamente salvaciones de FUE y DES',
      'Ataques contra tienen ventaja'
    ],
  },
  {
    id: 'unconscious',
    name: 'Inconsciente',
    nameEn: 'Unconscious',
    effects: [
      'Incapacitado, no puede moverse ni hablar',
      'Deja caer lo que sostiene, cae derribado',
      'Falla automáticamente salvaciones de FUE y DES',
      'Ataques tienen ventaja, impactos desde 5ft son críticos'
    ],
  },
  {
    id: 'exhaustion-1',
    name: 'Agotamiento 1',
    nameEn: 'Exhaustion 1',
    effects: ['Desventaja en chequeos de característica'],
  },
  {
    id: 'exhaustion-2',
    name: 'Agotamiento 2',
    nameEn: 'Exhaustion 2',
    effects: ['Velocidad reducida a la mitad'],
  },
  {
    id: 'exhaustion-3',
    name: 'Agotamiento 3',
    nameEn: 'Exhaustion 3',
    effects: ['Desventaja en ataques y salvaciones'],
  },
  {
    id: 'exhaustion-4',
    name: 'Agotamiento 4',
    nameEn: 'Exhaustion 4',
    effects: ['PV máximo reducido a la mitad'],
  },
  {
    id: 'exhaustion-5',
    name: 'Agotamiento 5',
    nameEn: 'Exhaustion 5',
    effects: ['Velocidad reducida a 0'],
  },
  {
    id: 'exhaustion-6',
    name: 'Agotamiento 6',
    nameEn: 'Exhaustion 6',
    effects: ['Muerte'],
  },
];

/** Quick purchase options for Equipo tab: id, label, numeric cost (gold). */
export const quickPurchases = [
  { id: 'pocion-curar', label: 'Poción de curar', cost: 50 },
  { id: 'cuerda-50', label: 'Cuerda (50 pies)', cost: 1 },
  { id: 'antorcha', label: 'Antorcha', cost: 0.01 },
  { id: 'kit-medico', label: 'Kit médico', cost: 5 },
];
