// fichier de traitement du dialogue du combat
// transformation en fenetre foundry
import { LESOUBLIES } from "../helpers/config.mjs"
import { ajouterLstTxt, estDansLstTxt, enleverLstTxt } from "../utils.mjs"
import { afficheResultat } from "../gestion-chat.mjs"

/** donne l'affichage des chiffres indiquant le nombre d'action
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

class DiagCMB extends FormApplication {
  constructor(context) {
    super();
    this.context = context;
    this.actor = null;
    this.token = null;
    if(context.tokenId) {
      this.token = game.scenes.current.tokens.get(context.tokenId)
      this.actor = this.token.actor
    } else  if(acteur){
      this.actor = game.actors.get(data.acteurId)
    }
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
    html.find(".dialog-button").click(this._onClickButton.bind(this));  // deroutage des bountons
  }

  async _updateObject(event, formData) { // traiement de fin, formdata contient les champs
    console.log("Fin :", formData, this.context);
    if(this.context.choixPrimes=="") event.stopPropagation();
  }

  _onClickButton(event) {
    event.preventDefault();
    const id = event.currentTarget.dataset.button;
    switch (id) {
        case "cancel" :
            return this.close();
        case "lancer" :
            console.log("lancer l'attaque !", this.context)
            this._roll()
            this.context.noActionEnCours++
            this.render(true)
            break
        case "submit" :
            console.log("lancer l'attaque !", this.context)
            this._roll()
            return this._onSubmit(event);
    }
  }

  async _onChangeInput(event){
    //console.log(event);
    const targetElement = event.currentTarget;
    //const presetType = targetElement.dataset?.preset;
    const formElement = $(targetElement).parents('form');
    if(event.currentTarget.name=='action') {
      this.context.action = formElement?.find('[name="action"]').val() 
    } else {
      const diffSupp = parseInt(formElement?.find('[name="diffSupp"]').val())
      console.log("difficulte :",diffSupp);
      this.context.diffSupp = diffSupp
      this.context.diffTotal = this._calculDiffTotal(this.context)
    }
    this.render(true)
  }

  // async _onSubmit(event, formData){
  //   console.log("event et formData",event, formData);
  // }

  _handleGestionClick(event, diagcmd){
    const targetElement = event.currentTarget;
    const presetType = targetElement.dataset?.action;
    //const formElement = $(targetElement).parents('form');
    console.log("Traitement des clicks : ", presetType) //, formElement)
    let aRendre = false // refaire le rendu
    let clickTab = presetType.split(".")
    switch(clickTab[0]) {
      case 'bonus':
        if(clickTab[1]=='troggle') {
          diagcmd.context.difficulte = clickTab[2]
          diagcmd.context.diffNombre = LESOUBLIES.difficultes[diagcmd.context.difficulte]
          aRendre = true
        }
        break;
      case 'prime':
          if(clickTab[1]=='choix')
            if(estDansLstTxt(clickTab[2], diagcmd.context.choixPrimes)){
              // s'il y est alors on l'enlève : tester si pas obligatoire ! ou gratuit
              if( ! estDansLstTxt(clickTab[2], diagcmd.context.lstPrimesGratuites)){
                diagcmd.context.choixPrimes = enleverLstTxt(clickTab[2],diagcmd.context.choixPrimes)
              }
            } else {
              diagcmd.context.choixPrimes = ajouterLstTxt(clickTab[2],diagcmd.context.choixPrimes)
            }
            aRendre = true
          break;
      case 'penalite':
        if(clickTab[1]=='choix')
          if(estDansLstTxt(clickTab[2], diagcmd.context.choixPenalites)){
            // s'il y est alors on l'enlève : tester si pas obligatoire ! ou gratuit
            if( ! estDansLstTxt(clickTab[2], diagcmd.context.lstPenalitesObligatoires)){
              diagcmd.context.choixPenalites = enleverLstTxt(clickTab[2],diagcmd.context.choixPenalites)
            }
          } else {
            diagcmd.context.choixPenalites = ajouterLstTxt(clickTab[2],diagcmd.context.choixPenalites)
          }
          aRendre = true
        break;
      case 'action':
        if(clickTab[1]=='set'){
          //action.set.moins.2
          switch (clickTab[2]){
            case 'direct':
              diagcmd.context.nbActions = parseInt(clickTab[3])
              break
            case 'plus':
              diagcmd.context.nbActions++
              break
            case 'moins':
              diagcmd.context.nbActions--
              break
          }
          diagcmd.context.diffAction = 3 - diagcmd.context.nbActions * 3  // ou -3 * (nbActioin-1)
          diagcmd.context.visuAction = visuAction(diagcmd.context.nbActions)
          aRendre = true
        }
        break
      case 'des':
        if(clickTab[1] == 'songe') {
          diagcmd.context.ptSongePris = ! diagcmd.context.ptSongePris
          if(diagcmd.context.ptSongePris) diagcmd.context.ptCauchemardPris = false
        } else {
          diagcmd.context.ptCauchemardPris = ! diagcmd.context.ptCauchemardPris
          if(diagcmd.context.ptCauchemardPris) diagcmd.context.ptSongePris = false
        }
        aRendre = true
        break
    }
    if(aRendre){ 
      diagcmd.context.diffTotal = this._calculDiffTotal(diagcmd.context)
      diagcmd.render(true)
    }
  }
  
  _calculDiffTotal(context){
    let Ret =  context.diffAction + context.diffNombre + context.diffSupp
    if(estDansLstTxt("efficacite",context.choixPrimes)) Ret += LESOUBLIES.primes["efficacite"].bonus
    if(estDansLstTxt("difficulte",context.choixPenalites)) Ret += LESOUBLIES.penalites["difficulte"].bonus
    return Ret;
  }

  _roll(){
    const context = this.context
    let rollFormula = "{ 1d12x, 1d12x[black]}"; let Depense=""
    if(context.ptSongePris) {
      rollFormula = "{ 2d12xkh, 1d12x[black]}"
      //dépense du point de songe !
      Depense = "system.Songe.Points.value"
    }
    if(context.ptCauchemardPris) {
      rollFormula = "{ 1d12x, 2d12xkh[black]}"
      //dépense du point de cauchemard !
      Depense = "system.Cauchemard.Points.value"
    }
    // let cmp = this.actor.items.getName(context.cmp)
    let score =  context.diffTotal + context.score
    if(Depense!="") {
      let obj={}; obj[Depense]= this.actor[Depense]-1
      this.actor.update(obj)
    }
    // calcul de la formule
    let r = new Roll(rollFormula)

    const speaker = ChatMessage.getSpeaker({ actor: this.actor });
    //const rollMode = game.settings.get('core', 'rollMode');
    r.evaluate({async :false })
    // lancer du resultat !
    afficheResultat(this.token, this.actor, r, "Jet "+context.cmp+ "-Action "+this.context.noActionEnCours,"votre score est: "+score,true, score, this.context.choixPrimes, this.context.choixPenalites)

  }
}

window.DiagCMB = DiagCMB; // Je ne sais si c'est nécessaire mais c'est indiquer sur le wiki : https://foundryvtt.wiki/en/development/guides/understanding-form-applications

export  async function diagCmb(data = { tokenId:"", cmpNom : "", score:0, acteurId:"", caseAction:"F", equipt:{} }){ //
  // Pour info : [...game.combat.collections.combatants][0].update({"initiative" : 5}) change l'init du premier combatant (0) à 5

  const etatCaseAction = ["R","G","F"]
  const labelCaseAction = { "R": "Retrait", "G" : "Garde", "F" : "Feu de l'action" }
  let actor; let token; let init = 0; let ptCauch =0; let ptSonge = 0; let txtInit = ""
  const myDialogOptions = {
    width: 400
  //      height: 400,
  //      top: 500,
  //      left: 500
  };
  // fusion pour tout avoir
  data = mergeObject({ tokenId:"", cmpNom : "", score: 0, acteurId:"", caseAction:"F", equipt:{} },data)
  if(data.tokenId) {
    token = game.scenes.current.tokens.get(data.tokenId)
    init = token?.combatant?.initiative
    if(init == undefined) init = 0
    if(init > 0) txtInit = "(Initiative: "+ init +")"
    else txtInit = ""
    actor = token.actor
  } else  if(acteur){
    actor = game.actors.get(data.acteurId)
  }
  if(actor) {
    init =actor.init
    ptCauch = actor.system.Cauchemard.Points.value
    ptSonge = actor.system.Songe.Points.value
  }
  let lstAct = {}; 
  Object.entries(LESOUBLIES.actions).forEach(element => {
    lstAct[element[0]] = element[1].label  
  });
  context = {
    tokenId :  data.tokenId, // pour la modification a la fin
    actorId : actor.id,
    score : data.score,
    lstPrimesGratuites : "",
    lstPenalitesObligatoires : "",
    description : "Utilisez cette interface pour modifier votre tour de jeu",
    caseAction : "G",
    //caseActionLabel : labelCaseAction["G"],
    nbPtSonge : ptSonge,
    nbPtCauch : ptCauch,
    ptSongePris : false,
    ptCauchemardPris : false,
    cmp : data.cmpNom,
    lstActionStd : lstAct,
    action : "rien",
    nbActions : 1,
    noActionEnCours : 1,
    visuAction : visuAction(1),
    lstCaseAction : labelCaseAction,
    lstDifficultes : LESOUBLIES.difficultes,
    difficulte : "Normale",
    diffNombre : 0,
    diffSupp : 0,
    diffAction : 0,
    diffTotal : 0,
    lstPrimes : LESOUBLIES.primes,
    lstPenalites : LESOUBLIES.penalites,
    choixPrimes : "",
    choixPenalites : "",
    init : init,
    txtInit : txtInit
  };
  //context.objValue = JSON.stringify(context).replaceAll('"','|'); // plus utile
  new DiagCMB(context).render(true);
}