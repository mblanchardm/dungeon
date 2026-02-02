/**
 * D&D 5e constants: skills, saving throws, racial bonuses.
 * Extracted from characterModel for separation of concerns.
 */

/** All 18 D&D 5e skills mapped to their governing ability. */
export const SKILLS = {
  Acrobatics: 'dex',
  'Animal Handling': 'wis',
  Arcana: 'int',
  Athletics: 'str',
  Deception: 'cha',
  History: 'int',
  Insight: 'wis',
  Intimidation: 'cha',
  Investigation: 'int',
  Medicine: 'wis',
  Nature: 'int',
  Perception: 'wis',
  Performance: 'cha',
  Persuasion: 'cha',
  Religion: 'int',
  'Sleight of Hand': 'dex',
  Stealth: 'dex',
  Survival: 'wis',
};

/** Spanish translations for skills */
export const SKILL_NAMES_ES = {
  Acrobatics: 'Acrobacias',
  'Animal Handling': 'Trato con Animales',
  Arcana: 'Conocimiento Arcano',
  Athletics: 'Atletismo',
  Deception: 'Engaño',
  History: 'Historia',
  Insight: 'Perspicacia',
  Intimidation: 'Intimidación',
  Investigation: 'Investigación',
  Medicine: 'Medicina',
  Nature: 'Naturaleza',
  Perception: 'Percepción',
  Performance: 'Interpretación',
  Persuasion: 'Persuasión',
  Religion: 'Religión',
  'Sleight of Hand': 'Juego de Manos',
  Stealth: 'Sigilo',
  Survival: 'Supervivencia',
};

/** Six saving throws */
export const SAVING_THROWS = ['str', 'dex', 'con', 'int', 'wis', 'cha'];

/** Racial ability score increases (race -> { ability: +N }). Half-Elf: +2 CHA base; +1 to two other abilities is applied in wizard via halfElfAbilityBonuses. */
export const RACIAL_BONUSES = {
  Human: { str: 1, dex: 1, con: 1, int: 1, wis: 1, cha: 1 },
  Elf: { dex: 2 },
  Dwarf: { con: 2 },
  Halfling: { dex: 2 },
  Tiefling: { cha: 2, int: 1 },
  Dragonborn: { str: 2, cha: 1 },
  Gnome: { int: 2 },
  HalfElf: { cha: 2 },
  'Half-Elf': { cha: 2 },
  HalfOrc: { str: 2, con: 1 },
  'Half-Orc': { str: 2, con: 1 },
  'Variant Human': {},
};
