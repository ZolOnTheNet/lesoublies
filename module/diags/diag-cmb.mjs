// fichier de traitement du dialogue du combat
// transformation en fenetre foundry
import { LESOUBLIES } from "../helpers/config.mjs"

/** donne l'affichage des chiffres indiquant le nombre d'actions
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
 * ajouteLstTxt ajouter l'element ele dans la liste listTxt et renvoie la nouvelle liste
 * si ele est déjà dedans, il ne l'ajoute pas 
 */
function ajouterLstTxt(ele, listTxt, sep=';'){
  const vrailst = sep+listTxt+sep
  if( ! vrailst.includes(sep+ele+sep)) listTxt= (listTxt=="")? ele : listTxt+sep+ele
  return listTxt
}

function estDansLstTxt(ele, listTxt, sep=';'){
  const vrailst = sep+listTxt+sep
  return  vrailst.includes(sep+ele+sep)
}

function enleverLstTxt(ele, listTxt, sep=';'){
  if(estDansLstTxt(ele,listTxt)){
    let arr = listTxt.split(sep)
    let ind = arr.indexOf(ele)
    arr.splice(ind,1)
    listTxt = arr.join(sep)
  }
  return listTxt
}

class DiagCMB extends FormApplication {
  constructor(context) {
    super();
    this.context = context;
  }

  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ['form'],
      popOut: true,
      template: `/systems/lesoublies/templates/diags/diag-cmb.hbs`,
      id: 'diag-cmb',
      title: 'Lancer de dés des combats',
      width: 600
    });
  }

  getData() {
    // Send data to the template
    console.log("this:",this)
    return this.context;
  }

  activateListeners(html) {
    super.activateListeners(html);
    html.on('click','.cmd',event => { this._handleGestionClick(event,this) }) // pour passer this car perdur !
  }

  async _updateObject(event, formData) {
    console.log(formData.exampleInput);
  }

  _handleGestionClick(event, diagcmd){
    const targetElement = event.currentTarget;
    const presetType = targetElement.dataset?.action;
    const formElement = $(targetElement).parents('form');
    console.log("Traitement des clicks : ", presetType, formElement)
    let clickTab = presetType.split(".")
    switch(clickTab[0]) {
      case 'bonus':
        if(clickTab[1]=='troggle') {
          diagcmd.context.difficulte = clickTab[2]
          diagcmd.render(true)
        }
        break;
      case 'prime':
          if(clickTab[1]=='choix')
            if(estDansLstTxt(clickTab[2], diagcmd.context.choixPrimes)){
              // s'il y est alors on l'enlève : tester si pas obligatoire ! ou gratuit
              diagcmd.context.choixPrimes = enleverLstTxt(clickTab[2],diagcmd.context.choixPrimes)
            } else {
              diagcmd.context.choixPrimes = ajouterLstTxt(clickTab[2],diagcmd.context.choixPrimes)
            }
            diagcmd.render(true)
          break;
      case 'penalite':
        if(clickTab[1]=='choix')
          if(estDansLstTxt(clickTab[2], diagcmd.context.choixPrimes)){
            // s'il y est alors on l'enlève : tester si pas obligatoire ! ou gratuit
            diagcmd.context.choixPenalites = enleverLstTxt(clickTab[2],diagcmd.context.choixPenalites)
          } else {
            diagcmd.context.choixPenalites = ajouterLstTxt(clickTab[2],diagcmd.context.choixPenalites)
          }
          diagcmd.render(true)
        break;
    }
  }
  
}

window.DiagCMB = DiagCMB; // Je ne sais si c'est nécessaire mais c'est indiquer sur le wiki : https://foundryvtt.wiki/en/development/guides/understanding-form-applications

export  async function diagCmb(data = { token:{}, cmpNom : "", acteur:{}, caseAction:"F", equipt:{} }){ //
  // Pour info : [...game.combat.collections.combatants][0].update({"initiative" : 5}) change l'init du premier combatant (0) à 5
  const etatCaseAction = ["R","G","F"]
  const labelCaseAction = { "R": "Retrait", "G" : "Garde", "F" : "Feu de l'action" }
  let actor = {}; let init = 0;
  const myDialogOptions = {
    width: 400
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
  context.objValue = JSON.stringify(context).replaceAll('"','|');
  new DiagCMB(context).render(true);
}