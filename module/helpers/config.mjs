export const LESOUBLIES = {};

/**
 * The set of Ability Scores used within the sytem.
 * @type {Object}
 */
 LESOUBLIES.abilities = {
  "str": "LESOUBLIES.AbilityStr",
  "dex": "LESOUBLIES.AbilityDex",
  "con": "LESOUBLIES.AbilityCon",
  "int": "LESOUBLIES.AbilityInt",
  "wis": "LESOUBLIES.AbilityWis",
  "cha": "LESOUBLIES.AbilityCha"
};

LESOUBLIES.abilityAbbreviations = {
  "str": "LESOUBLIES.AbilityStrAbbr",
  "dex": "LESOUBLIES.AbilityDexAbbr",
  "con": "LESOUBLIES.AbilityConAbbr",
  "int": "LESOUBLIES.AbilityIntAbbr",
  "wis": "LESOUBLIES.AbilityWisAbbr",
  "cha": "LESOUBLIES.AbilityChaAbbr"
};

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

LESOUBLIES.reussite = {
  "Normale" : 0,
  "Avantageuse" : 3,
  "Spéciale" : 6,
  "Exceptionnelle":9,
  "Critique" : 12,
  "Héroique" : 15
}