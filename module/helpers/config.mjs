export const LESOUBLIES = {};

/**
 * les options : devront géré pour les mettre à la modifications
 */
LESOUBLIES.options = {
  "cmp": {
    "RepertoireCompetences": "Compétences",
    "RepertoireCmpBase": "Compétences", //cmpBase
    "InclureFermees" : false
  },
  "action" :{
    "nbMax" : 7
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
// pro
LESOUBLIES.profilsInv = {
  "Artiste": "artiste",
  "Athlète":"athlete",
  "Chasseur": "chasseur",
  "Faiseur": "faiseur",
  "Force de la Nature" :"forceNature",
  "Force de la nature" :"forceNature",
  "force de la nature" :"forceNature",
  "Guerrier" : "guerrier",
  "Mystique" : "mystique", 
  "Ombre" : "ombre", 
  "Savant" : "savant"
}

LESOUBLIES.typeAction = { "G": "Gratuite", "L": "Libre", "LA": "Libre, Avancée"}
LESOUBLIES.typeCondition = {"desengage": "Désengagé", "engage": "engagé"}
LESOUBLIES.typeDiffcultes = { "N":"rien", "T" : "objet étant un tableau de bonus/malus", "O": "objet d'une seule valeur"}
// modele : "" : { label : "", cmp : "", typeAction : "G", difficultes : { type:"O", code : { "":"" } }, conditions : "", reaction : "-"}
LESOUBLIES.actions = {
  "anticiper" : { label : "Anticiper un évènement", cmp : "-", typeAction : "G", difficultes : { type:"N", code : { "":"" } }, conditions : "", reaction : "-"},
  "debusquer" : { label : "Débusquer un adversaire", cmp : "Sens", typeAction : "L", difficultes : { type:"T", code : { "En pleine lumière":3, "Silence":3, "Pénombre" : -3, "Ambiance bruyante" : -3 } }, conditions : "desengage", reaction : "-"},
  "degainer"  : { label : "Dégainer ou rengainer une arme", cmp : "Rapidité", typeAction : "L", difficultes : { type:"T", code : { "Si désengagé":12, "Dans un foureau": 3, "Arme dissimulée" : -3, "Arme à terre":-3 } }, conditions : "", reaction : "Corps à Corps;Mélée"},
  "deloger"   : { label : "Déloger un adversaire", cmp : "", typeAction : "G", difficultes : { type:"O", code : { "":"" } }, conditions : "", reaction : "-"},
  "desarmer"  : { label : "Désarmer un adversaire", cmp : "", typeAction : "G", difficultes : { type:"O", code : { "":"" } }, conditions : "", reaction : "-"},
  "detruire"  : { label : "Détruire", cmp : "", typeAction : "G", difficultes : { type:"O", code : { "":"" } }, conditions : "", reaction : "-"},
  "encourager": { label : "Encourager un allié", cmp : "", typeAction : "G", difficultes : { type:"O", code : { "":"" } }, conditions : "", reaction : "-"},
  "evaluer"   : { label : "Evaluer un adversaire", cmp : "", typeAction : "G", difficultes : { type:"O", code : { "":"" } }, conditions : "", reaction : "-"},
  "feinter"   : { label : "Feinter", cmp : "", typeAction : "G", difficultes : { type:"O", code : { "":"" } }, conditions : "", reaction : "-"},
  "frapper"   : { label : "Frapper", cmp : "Corps à corps;Mêlée", typeAction : "G", difficultes : { type:"O", code : { "":"" } }, conditions : "", reaction : "-"},
  "intimider" : { label : "Intimider un adversaire", cmp : "Commandement", typeAction : "G", difficultes : { type:"O", code : { "":"" } }, conditions : "", reaction : "-"},
  "maitriser" : { label : "Maîtriser un adversaire", cmp : "Corps à corps", typeAction : "G", difficultes : { type:"O", code : { "":"" } }, conditions : "", reaction : "-"},
  "sedissimuler" : { label : "Se Dissimuler", cmp : "Discrétion", typeAction : "G", difficultes : { type:"O", code : { "":"" } }, conditions : "", reaction : "-"},
  "sedeplacer": { label : "Se Déplacer", cmp : "Athlétisme", typeAction : "G", difficultes : { type:"O", code : { "":"" } }, conditions : "", reaction : "-"},
  "tirer"     : { label : "Tirer", cmp : "Tir", typeAction : "G", difficultes : { type:"O", code : { "":"" } }, conditions : "", reaction : "-"}
}

/**
 * Pour l'instant en mode fixe...
 */
LESOUBLIES.primes = {
  "acceleration"      : { label : "Accélération", "dom" : 1, description: "Initiative +3", "init" : 3, bonus : 0 },
  "attaquesMultiples" : { label : "Attaques Multiples", "dom" : 0.5, description: "Maximum < #Adversaires engagés, Dom /2", "init" : 0, bonus : 0 },
  "blessureGrave"     : { label : "Blessure Grave", "dom" : 1.5, description: "Dommage +50%", "init" : 0, bonus : 0 },
  "blessureNonLetale" : { label : "Blessure Non Letale", "dom" : 1, description: "Mort impossible", "init" : 0, bonus : 0 },
  "blessurePrecise"   : { label : "blessure Précise", "dom" : 1, description: "Protection/2", "init" : 0, bonus : 0 },
  "efficacite"        : { label : "Efficacité", "dom" : 1, description: "Resultat final +3", "init" : 0, bonus : 3 },
  "debordement"       : { label : "Débordement", "dom" : 1, description: "Resultat final de la réaction de l'adversaire à -3", "init" : 0, bonus : 0 },
  "prudence"          : { label : "Prudence", "dom" : 1, description: "Resultat final de la prochaine réaction à +3", "init" : 0, bonus : 0 }
}

LESOUBLIES.penalites = {
  "abandon"           : { label : "abandon de position avantageuse", dom : 1, description: "", init : 0, bonus : 0 },
  "blessureLegere"    : { label : "Blessure Légère", dom : 0.5, description: "Dégats / 2", init : 0, bonus : 0 },
  "danger"            : { label : "Danger", dom : 1, description: "Resultat final de sa prochaine réaction -3", init : 0, bonus : 0 },
  "difficulte"        : { label : "Difficulte", dom : 1, description: "Résultat final -3", init : 0, bonus : -3 },
  "facilite"          : { label : "Facilité", dom : 1, description: "Résultat final de la réaction de l'adversaire", init : 0, bonus : 0 },
  "ralentissement"    : { label : "Ralentissement", dom : 1, description: "Initiative à -3", init : -3, bonus : 0 },
  "risque"            : { label : "Risques", dom : 1, description: "Incident en cas d'échec", init : 0, bonus : 0 }
}