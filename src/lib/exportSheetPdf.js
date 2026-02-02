/**
 * Export character sheet as PDF using jspdf.
 * Mirrors the structure of the print view in CharacterSheet.jsx.
 */

import { jsPDF } from 'jspdf';
import { getAbilityModifier, getSkillModifier, getClassDisplay } from './characterModel.js';
import { SKILLS, SKILL_NAMES_ES } from './constants.js';
import { equipment, feats, languages as srdLanguages } from '../data/srd.js';
import { spells } from '../data/srdSpells.js';

const ABILITY_LABELS = { str: 'STR', dex: 'DEX', con: 'CON', int: 'INT', wis: 'WIS', cha: 'CHA' };

/**
 * Build and download a PDF of the character sheet.
 * @param {object} character - Full character object
 * @param {object} options - { equipmentNames?: string[], spellNames?: string[], featNames?: string[], languageNames?: string[] } optional resolved names; if not provided, IDs are resolved from SRD.
 */
export function exportCharacterSheetPdf(character, options = {}) {
  const equipmentNames = options.equipmentNames ?? (character.equipment ?? []).map((id) => equipment.find((e) => e.id === id)?.name || id);
  const spellNames = options.spellNames ?? (character.spellsKnown ?? []).map((id) => spells.find((s) => s.id === id)?.name || id);
  const featNames = options.featNames ?? (character.feats ?? []).map((id) => feats.find((f) => f.id === id)?.name || id);
  const languageNames = options.languageNames ?? (character.languages ?? ['common']).map((id) => srdLanguages.find((l) => l.id === id)?.name || id);
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const margin = 14;
  const pageW = doc.internal.pageSize.getWidth();
  let y = margin;
  const lineH = 6;
  const sectionGap = 8;

  const maxHP = character.maxHP ?? 10;
  const currentHP = character.currentHP ?? maxHP;

  // Header: name, race, class, level
  doc.setFontSize(18);
  doc.setFont(undefined, 'bold');
  doc.text(character.name || 'Unnamed', margin, y);
  y += lineH;
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  const classDisplay = getClassDisplay(character);
  doc.text(`${character.race || ''} ${classDisplay} • Level ${character.level ?? 1}`, margin, y);
  y += lineH;
  if (character.background) {
    doc.setFontSize(9);
    doc.text(`Background: ${character.background}`, margin, y);
    y += lineH;
  }
  y += sectionGap;

  // Abilities (6 columns)
  const abilW = (pageW - 2 * margin) / 6;
  Object.entries(ABILITY_LABELS).forEach(([key, label], i) => {
    const score = character.abilityScores?.[key] ?? 10;
    const mod = getAbilityModifier(score);
    const x = margin + i * abilW;
    doc.setFontSize(8);
    doc.setFont(undefined, 'bold');
    doc.text(label, x + abilW / 2, y, { align: 'center' });
    doc.setFontSize(12);
    doc.text(String(mod >= 0 ? `+${mod}` : mod), x + abilW / 2, y + lineH, { align: 'center' });
    doc.setFontSize(8);
    doc.setFont(undefined, 'normal');
    doc.text(String(score), x + abilW / 2, y + 2 * lineH, { align: 'center' });
  });
  y += 3 * lineH + sectionGap;

  // Combat: AC, HP, Speed, Spell DC
  const combatW = (pageW - 2 * margin) / 4;
  ['AC', 'HP', 'Speed', 'Spell DC'].forEach((label, i) => {
    const x = margin + i * combatW;
    let val = '—';
    if (label === 'AC') val = String(character.AC ?? 10);
    if (label === 'HP') val = `${currentHP}/${maxHP}`;
    if (label === 'Speed') val = String(character.speed ?? 30);
    if (label === 'Spell DC') val = character.spellDC != null ? String(character.spellDC) : '—';
    doc.setFontSize(8);
    doc.setFont(undefined, 'bold');
    doc.text(label, x + combatW / 2, y, { align: 'center' });
    doc.setFontSize(11);
    doc.text(val, x + combatW / 2, y + lineH, { align: 'center' });
  });
  y += 2 * lineH + sectionGap;

  // Skills
  doc.setFontSize(10);
  doc.setFont(undefined, 'bold');
  doc.text('SKILLS', margin, y);
  y += lineH;
  doc.setFont(undefined, 'normal');
  doc.setFontSize(9);
  const skillNames = Object.keys(SKILLS);
  const half = Math.ceil(skillNames.length / 2);
  const colW = (pageW - 2 * margin) / 2;
  for (let row = 0; row < half; row++) {
    const skill1 = skillNames[row];
    const skill2 = skillNames[row + half];
    const mod1 = getSkillModifier(character, skill1);
    const name1 = SKILL_NAMES_ES[skill1] || skill1;
    const prof1 = character.proficiencies?.skills?.includes(skill1) ? '● ' : '';
    doc.text(`${prof1}${name1}: ${mod1 >= 0 ? '+' : ''}${mod1}`, margin, y, { maxWidth: colW - 4 });
    if (skill2) {
      const mod2 = getSkillModifier(character, skill2);
      const name2 = SKILL_NAMES_ES[skill2] || skill2;
      const prof2 = character.proficiencies?.skills?.includes(skill2) ? '● ' : '';
      doc.text(`${prof2}${name2}: ${mod2 >= 0 ? '+' : ''}${mod2}`, margin + colW, y, { maxWidth: colW - 4 });
    }
    y += lineH * 0.9;
  }
  y += sectionGap;

  // Equipment
  if (equipmentNames.length > 0) {
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.text('EQUIPMENT', margin, y);
    y += lineH;
    doc.setFont(undefined, 'normal');
    doc.setFontSize(9);
    const eqText = Array.isArray(equipmentNames) ? equipmentNames.join(', ') : String(equipmentNames);
    const eqLines = doc.splitTextToSize(eqText, pageW - 2 * margin);
    eqLines.forEach((line) => {
      doc.text(line, margin, y);
      y += lineH * 0.8;
    });
    y += sectionGap;
  }

  // Spells
  if (spellNames.length > 0) {
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.text('SPELLS', margin, y);
    y += lineH;
    doc.setFont(undefined, 'normal');
    doc.setFontSize(9);
    const spText = Array.isArray(spellNames) ? spellNames.join(', ') : String(spellNames);
    const spLines = doc.splitTextToSize(spText, pageW - 2 * margin);
    spLines.forEach((line) => {
      if (y > 270) {
        doc.addPage();
        y = margin;
      }
      doc.text(line, margin, y);
      y += lineH * 0.8;
    });
    y += sectionGap;
  }

  // Languages & Feats

  if (y > 250) {
    doc.addPage();
    y = margin;
  }
  doc.setFontSize(10);
  doc.setFont(undefined, 'bold');
  doc.text('LANGUAGES', margin, y);
  doc.text('FEATS', margin + (pageW - 2 * margin) / 2, y);
  y += lineH;
  doc.setFont(undefined, 'normal');
  doc.setFontSize(9);
  const langText = Array.isArray(langNames) ? langNames.join(', ') : String(langNames);
  doc.text(langText, margin, y, { maxWidth: (pageW - 2 * margin) / 2 - 4 });
  const featText = Array.isArray(featNames) && featNames.length > 0 ? featNames.join(', ') : '—';
  doc.text(featText, margin + (pageW - 2 * margin) / 2, y, { maxWidth: (pageW - 2 * margin) / 2 - 4 });

  doc.save('character-sheet.pdf');
}
