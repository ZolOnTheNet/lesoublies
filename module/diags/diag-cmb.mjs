// fichier de traitement du dialogue du combat
// transformation en fenetre foundry
import { LESOUBLIES } from "../helpers/config.mjs"
import { toStdProfil, ajouterLstTxt, estDansLstTxt, enleverLstTxt, toLstObjTxt, listCmp } from "../utils.mjs"
import { afficheResultat } from "../gestion-chat.mjs"
import { ChoixEtResultat } from  "./diag-choix-sc.mjs"

const labelCaseAction = { "R": "Retrait", "G" : "Garde", "F" : "Feu de l'action" }

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
    this.options.title = this.context.estCombat?'Lancer de dés des combats':(context.cmp =="")?'Lancer avec paramaètres':'Lancer de '+context.cmp+" paramêtré"
  }

  static get defaultOptions() {
    //let titre  = this.context.estCombat?'Lancer de dés des combats':'Lancer avec paramaètres'
    return mergeObject(super.defaultOptions, {
      classes: ['form'],
      popOut: true,
      template: `/systems/lesoublies/templates/diags/diag-cmb.hbs`,
      id: 'diag-cmb',
      title: 'Lancer à paramètres variables',
      width: 600
    });
  }

  getData() {
    // Send data to the template
    //console.log("this:",this)
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
    const id = event.currentTarget.dataset.button.split(".");
    switch (id[0]) {
        case "cancel" :
            return this.close();
        case "lancer" :
            console.log("lancer l'attaque !", this.context)
            this.context.dernier = false
            this._roll()
            this.context.noActionEnCours++
            this.render(true)
            break
        case "submit" :
            //console.log("lancer l'attaque !", this.context)
            this.context.dernier = true
            this._roll()
            return this._onSubmit(event);
        case "position": // traitement des position
        // pour info : game.combat.current.combatantId  donne le combatant en cours
          ui.notifications.warn("Vous passez de " + labelCaseAction[this.context.caseAction] +" a " + labelCaseAction[id[2]])
          this.context.caseAction = id[2]
          this.actor.update({"system.coombat.position" : id[2] })
          this.render(true)
          break
    }
  }

  async _onChangeInput(event){
    //console.log(event);
    const targetElement = event.currentTarget;
    //const presetType = targetElement.dataset?.preset;
    const formElement = $(targetElement).parents('form');
    if(event.currentTarget.name=='action') {
      let actuAction = formElement?.find('[name="action"]').val()
      if(LESOUBLIES.actions[this.context.action].typeAction=="LA") this.context.equilibreChoix-- //LA donne une pénalité
      if(LESOUBLIES.actions[actuAction].typeAction=="LA") this.context.equilibreChoix++
      if(LESOUBLIES.actions[actuAction].cmp =="-") this.context.cmpAction.autreAction = false
      else if(LESOUBLIES.actions[actuAction].cmp !=""){
        this.context.cmpAction.autreAction = true
        this.context.cmpAction.lstCmp = toLstObjTxt(LESOUBLIES.actions[actuAction].cmp,listCmp(),'name',true,true)
      }
      this.context.action = actuAction
    } else {
      const diffSupp = parseInt(formElement?.find('[name="diffSupp"]').val())
      console.log("difficulte :",diffSupp);
      this.context.diffSupp = diffSupp
      this.context.diffTotal = this._calculDiffTotal(this.context)
    }
    this.context.diffTotal = this._calculDiffTotal(this.context)
    this.context.textEquilibre = this._texteEquilibrePP(this.context)
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
      case 'armure':
        if(clickTab[1]=='toggle'){ 
          this.context.aArmure = ! this.context.aArmure
          aRendre = true
        }
        break
      case 'bonus':
          if(clickTab[1]=='troggle') {
            diagcmd.context.difficulte = clickTab[2]
            diagcmd.context.diffNombre = LESOUBLIES.difficultes[diagcmd.context.difficulte]
            aRendre = true
          }
          break;
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
      case 'prime':
          if(clickTab[1]=='choix')
            if(estDansLstTxt(clickTab[2], diagcmd.context.choixPrimes)){
              // s'il y est alors on l'enlève : tester si pas obligatoire ! ou gratuit
              if( ! estDansLstTxt(clickTab[2], diagcmd.context.lstPrimesGratuites)){
                diagcmd.context.choixPrimes = enleverLstTxt(clickTab[2],diagcmd.context.choixPrimes)
                diagcmd.context.equilibreChoix--
              }
            } else {
              diagcmd.context.choixPrimes = ajouterLstTxt(clickTab[2],diagcmd.context.choixPrimes)
              diagcmd.context.equilibreChoix++
            }
            aRendre = true
          break;
      case 'penalite':
        if(clickTab[1]=='choix')
          if(estDansLstTxt(clickTab[2], diagcmd.context.choixPenalites)){
            // s'il y est alors on l'enlève : tester si pas obligatoire ! ou gratuit
            if( ! estDansLstTxt(clickTab[2], diagcmd.context.lstPenalitesObligatoires)){
              diagcmd.context.choixPenalites = enleverLstTxt(clickTab[2],diagcmd.context.choixPenalites)
              diagcmd.context.equilibreChoix++
            }
          } else {
            diagcmd.context.choixPenalites = ajouterLstTxt(clickTab[2],diagcmd.context.choixPenalites)
            diagcmd.context.equilibreChoix--
          }
          aRendre = true
        break;
    }
    if(aRendre){ 
      diagcmd.context.diffTotal = this._calculDiffTotal(diagcmd.context)
      diagcmd.context.textEquilibre = this._texteEquilibrePP(diagcmd.context)
      diagcmd.render(true)
    }
  }
  
  _calculDiffTotal(context){ // calcule de la difficulté totale
    let Ret =  context.diffAction + context.diffNombre + context.diffSupp 
    if(context.aArmure) Ret -= context.armure // prise en compte du basculement armure ou pas
    if(estDansLstTxt("efficacite",context.choixPrimes)) Ret += LESOUBLIES.primes["efficacite"].bonus
    if(estDansLstTxt("difficulte",context.choixPenalites)) Ret += LESOUBLIES.penalites["difficulte"].bonus
    return Ret;
  }

  _texteEquilibrePP(context){ // texte a retourner 
    if(context.equilibreChoix){
      if(context.equilibreChoix > 0){
        return "Trop de Primes"
      }else {
        return "Trop de Penalités"
      }
    }else return ""
  }

  _roll(){ // XXX a regrouper avec gerer les resultat ?
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
    let titre = "Jet "+ this.context.cmp // amélioration des titres 
    if(this.context.nbActions> 1){
      if(this.context.noActionEnCours){
        titre = "Action " + this.context.noActionEnCours+": " + titre
      }else {
        titre = "Dernier Action: " + titre
      }
    }
    // afficheResultat est pour le chat
    if(LESOUBLIES.options.popupDice)
    ChoixEtResultat(this.token, this.actor, r, {  titre: titre, score : score, dernier: this.context.dernier, primes : this.context.choixPrimes, 
                                                  penalites : this.context.choixPenalites, action : this.context.action, 
                                                  armure : this.context.armure, dommage : this.context.dommage})
    else afficheResultat(this.token, this.actor, r, titre,"votre score est: "+score, 
                    this.context.dernier, score, this.context.choixPrimes, this.context.choixPenalites, 
                    this.context.action, this.context.armure, this.context.dommage)

  }
}

window.DiagCMB = DiagCMB; // Je ne sais si c'est nécessaire mais c'est indiquer sur le wiki : https://foundryvtt.wiki/en/development/guides/understanding-form-applications

export  async function diagCmb(data = { tokenId:"", cmpNom : "", score:0, acteurId:"", caseAction:"F", equipt:{}, estCombat: true }){ //
  // Pour info : [...game.combat.collections.combatants][0].update({"initiative" : 5}) change l'init du premier combatant (0) à 5

  const etatCaseAction = ["R","G","F"]
  let actor; let token; let init = 0; let ptCauch =0; let ptSonge = 0; let txtInit = ""
  const myDialogOptions = {
    width: 500
  //      height: 400,
  //      top: 500,
  //      left: 500
  };
  // fusion pour tout avoir
  data = mergeObject({ tokenId:"", cmpNom : "", score: 0, acteurId:"", caseAction:"F", equipt:{}, primes:"", penalites:"", estCombat: true },data)
  if(data.tokenId) {
    token = game.scenes.current.tokens.get(data.tokenId)
    init = token?.combatant?.initiative
    if(init == undefined) init = 0
    if(init > 0) txtInit = "(Initiative: "+ init +")"
    else txtInit = ""
    actor = token.actor
  } else  if(acteur){
    actor = game.actors.get(data.acteurId)
    if(actor)init =actor.system.init
  }
  if(actor) {
    ptCauch = actor.system.Cauchemard.Points.value
    ptSonge = actor.system.Songe.Points.value
    data.armureDef = actor.system.combat.protection.value
    let itemArme = data.equipt?.itemId
    if(itemArme){
      data.score = -1; //on recalcul a partir de zero avec l'équipement
      let itemA = actor.items.get(itemArme); let itemCmp
      if(itemA.system?.cmp){
        itemCmp = actor.items.getName(itemA.system.cmp)
        data.cmpNom = itemA.name +'(' +itemA.system.cmp+ ')'
      }else if(itemA.system?.cmpId){
        itemCmp = actor.items.get(itemA.system.cmpId)
        data.cmpNom = itemA.name +'(' +itemCmp.name+ ')'
      }
      if(data.score == -1){ // on n'a pas le score
        if(itemCmp) {
          let itemRace = actor.items.get(actor.system.idRace)
          data.score = itemCmp.system.score + parseInt(itemRace.system.profils[toStdProfil(itemCmp.system.profil)]+"")+itemA.system.bonus.score
        }
      }
      data.caseAction = actor.system.combat.position
      if(data.caseAction == "") data.caseAction = "G" // par défaut
      data.primes = itemA.system?.lstPrimes
      data.penalites = itemA.system?.lstPenalites
      data.dommage = itemA.system.taille + +itemA.system.bonus.score
    }
  }
  // gestion si l'appel se fait par l'equipement
  
  let lstAct = {}; 
  Object.entries(LESOUBLIES.actions).forEach(element => {
    lstAct[element[0]] = element[1].label +((element[1].label == "")? "": "(" +element[1].typeAction+")") 
  });
  context = {
    estCombat : data.estCombat,
    tokenId :  data.tokenId, // pour la modification a la fin
    actorId : actor.id,
    score : data.score,
    armure : data.armureDef, // rajout à gerer
    aArmure : data.armureDef >0,
    dommage : data.dommage,
    lstPrimesGratuites : data.primes,
    lstPenalitesObligatoires : data.penalites,
    description : ("Utilisez cette interface pour "+((data.estCombat)?"modifier votre tour de jeu":"modifier votre lancer")),
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
    cmpAction : { autreAction : false }, // gestion des actions
    noActionEnCours : 1,
    visuAction : visuAction(1),
    lstCaseAction : labelCaseAction,
    lstDifficultes : LESOUBLIES.difficultes,
    difficulte : "Normale",
    diffNombre : 0,
    diffSupp : 0,
    diffAction : 0,
    diffTotal : -data.armureDef,
    lstPrimes : LESOUBLIES.primes,
    lstPenalites : LESOUBLIES.penalites,
    choixPrimes : data.primes,
    choixPenalites : data.penalites,
    textEquilibre : "",
    dernier : true,
    equilibreChoix : 0,
    init : init,
    txtInit : txtInit
  };
  //context.objValue = JSON.stringify(context).replaceAll('"','|'); // plus utile
  new DiagCMB(context).render(true);
}