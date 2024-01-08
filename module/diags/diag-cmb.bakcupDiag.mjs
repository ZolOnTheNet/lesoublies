// fichier de traitement du dialogue du combat
import { LESOUBLIES } from "../helpers/config.mjs"

function verifSyntheseData(formData) {
  // Verification possible : nombre de Dés au dela de 0
  // if (!formData?.score) {
  //   throw new Error('Score is required');
  // }

  // if (!formData?.des) {
  //   throw new Error('Dés is required');
  // }
  // if (formData?.dommage) {
  //   if(formData?.dommage.toUpperCase().indexOf("D") == -1)
  //     throw new Error('Dommage necessite un dé');
  // }
}

function handleGestionClick(event){
  const targetElement = event.currentTarget;
  const presetType = targetElement.dataset?.action;
  const formElement = $(targetElement).parents('form');
  console.log("Traitement des clicks : ", presetType, formElement)
  let clickTab = presetType.split(":")
  switch(clickTab[0]) {
    case 'bonus':
      
      break;
  }
}

/** A modifier visuActions (pour avoir des petits points à cliquer !)
 * 
 */
function visuAction(nbAction=1) {
  let ret = ''; let max = LESOUBLIES.options.action.nbMax; // fixé pour l'instant
  let i = 0; let e = nbAction;
  for(i = 1; i < e; i++){
    ret += '<span class="cmd txtUtiOui" data-action="action.set.direct.' + i + '" title="' + i + '" >'+i+' </span>'
  }
  //e += 1; // le nombre d'actions choisies
  for(; i <= e; i++ ){
    ret += '<span class="cmd txtUtiEnCours" data-action="action.set.direct.' + i + '" title="' + i + '" >'+i+' </span>'
  }
  for(; i <= max; i++){
    ret += '<span class="cmd txtUtiNon" data-action="action.set.direct.' + i + '" title="' + i + '" >'+i+' </span>'
  }
  return ret ; 
}
/**
 * 
 * @param {*} data { token, nomDelaCmp, Acteur (si pas token), case de l'action en cours, equipement utiliser }
 * @returns 
 */
export  async function diagCmb(data = { token:{}, cmpNom : "", acteur:{}, caseAction:"F", equipt:{} }){ //
  // Pour info : [...game.combat.collections.combatants][0].update({"initiative" : 5}) change l'init du premier combatant (0) à 5
    const etatCaseAction = ["R","G","F"]
    const labelCaseAction = { "R": "Retrait", "G" : "Garde", "F" : "Feu de l'action" }
    let actor = {}; let init = 0;
    const myDialogOptions = {
      width: 500
//      height: 400,
//      top: 500,
//      left: 500
    };
    if(data.token) {
      actor = data.token.actor
    } else  if(acteur){
      actor = data.acteur
    }
    if(actor) {
      init =actor.init
    } else {
      init = 0;
    }
    context = {
      lstPrimesGratuites : "",
      lstPenalitesObligatoires : "",
      description : "Utilisez cette interface pour modifier votre tour de jeu",
      caseAction : "G",
      caseActionLabel : labelCaseAction["G"],
      action : "tir",
      nbActions : 1,
      visuAction : visuAction(1),
      lstCaseAction : labelCaseAction,
      lstActionStd : LESOUBLIES.actions,
      lstDifficultes : LESOUBLIES.difficultes,
      difficulte : "Normale",
      lstPrimes : LESOUBLIES.primes,
      lstPenalites : LESOUBLIES.penalites,
      choixPrimes : "",
      choixPenalites : "",
      init : init
    };
    context.objValue = JSON.stringify(context).replaceAll('"','|'); // stockage des infos
    const htmlContent = await renderTemplate('/systems/lesoublies/templates/diags/diag-cmb.hbs', context);
    return new Promise((resolve, reject) => {
        const dialog = new Dialog({
          title: "Modificateur de lancer",
          content: htmlContent,
          buttons: {
            cancel: {
              label: "Cancel",
              callback: () => reject('User canceled.'),
            },
            submit: {
              label: "Jet!", // a traduire
              icon: '<i class="fas fa-check"></i>',
              callback: (html) => {
                const formData = new FormDataExtended(html[0].querySelector('form'))
                  .toObject();
                 verifSyntheseData(formData);
                resolve(formData);
              },
            },
          },
          default: "submit",
          render: (html) => {
            html.on('click','.cmd',handleGestionClick)
            //console.log("mettre le bon html.on")
          },
          close: () => {
            reject('User closed dialog without making a selection.');
          },
        }, myDialogOptions);

        dialog.render(true);
      });
}  