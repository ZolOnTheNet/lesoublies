export const LESOUBLIES = {};

/**
 * The set of Ability Scores used within the sytem.
 * @type {Object}
 */
//  LESOUBLIES.abilities = {
//   "str": "LESOUBLIES.AbilityStr",
//   "dex": "LESOUBLIES.AbilityDex",
//   "con": "LESOUBLIES.AbilityCon",
//   "int": "LESOUBLIES.AbilityInt",
//   "wis": "LESOUBLIES.AbilityWis",
//   "cha": "LESOUBLIES.AbilityCha"
// };

// LESOUBLIES.abilityAbbreviations = {
//   "str": "LESOUBLIES.AbilityStrAbbr",
//   "dex": "LESOUBLIES.AbilityDexAbbr",
//   "con": "LESOUBLIES.AbilityConAbbr",
//   "int": "LESOUBLIES.AbilityIntAbbr",
//   "wis": "LESOUBLIES.AbilityWisAbbr",
//   "cha": "LESOUBLIES.AbilityChaAbbr"
// };

LESOUBLIES.options = {
  "cmp": {
    "RepertoireCompetences": "Compétences",
    "RepertoireCmpBase": "Compétences", //cmpBase
    "InclureFermees" : false
  }
}

LESOUBLIES.difficultes = {
  "Elémentaire" : 6,
  "Aisée" : 3,
  "Normale" : 0,
  "Ardue" : -3,
  "Audacieuse" : -6,
  "Prodigieuse" : -9
}

LESOUBLIES.reussites = {
  "Normale" : 0,
  "Avantageuse" : 3,
  "Spéciale" : 6,
  "Exceptionnelle":9,
  "Critique" : 12,
  "Héroique" : 15
}

LESOUBLIES.tailles = {
  "1": { "label": "Minuscule", "cm" : "moins de 4 cm" ,"races":"fées"},
  "2": { "label": "Petite", "cm" : "4 à 6 cm", "races":"gnomes(4/5cm), korrigans (5/6cm)"},
  "3": { "label": "Moyenne", "cm" : "6 à 8 cm", "races":"farfadets (6/8cm), lutins, kobolds (7/8cm)"},
  "4": { "label": "Grande", "cm" : "plus de 10 cm", "races":"Velu nutons (10/13+cm)"}
}