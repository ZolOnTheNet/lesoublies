import { LESOUBLIES } from "./helpers/config.mjs";
import { toArrayLstTxt } from "./utils.mjs"

export function traitementChoixSonge(cmd){
    let cmdArgs = cmd.split('.')
    let descp=""
    if(cmdArgs[5]!="0") { // on doit retrirer la valeur à un des deux point
        descp = "Vous avez choisit de dépenser un point de "+cmdArgs[2]
        let pertePt = 1//parseInt(cmdArgs[5])
        let token = game.scenes.current.tokens.get(cmdArgs[3])
        let actor = token?.actor
        if(actor == undefined) actor = game.actors.get(cmdArgs[4])
        let reste = actor.system[cmdArgs[2]].dette.value + pertePt
        let updObj = { }
        updObj[ "system."+cmdArgs[2]+".dette.value" ] = reste
        if(token) token.actor.update(updObj)
        else actor.update(updObj)
    }
    // traitement des bonus
    // donner le resultat final !
    let bonus = { bonus : 0, init: 0, dom : 1}
    if(cmdArgs[7] != "") { // primes
        let lstPrimes = toArrayLstTxt(cmdArgs[7])
        lstPrimes.forEach(prime => {
            let p = LESOUBLIES.primes[prime]
            bonus.bonus += p.bonus
            bonus.init += p.init
            bonus.dom = bonus.dom * p.dom
        })
    }
    if(cmdArgs[7] != "") { // primes
        let lstPenalites = toArrayLstTxt(cmdArgs[8])
        lstPenalites.forEach(penalite => {
            let p = LESOUBLIES.penalites[penalite]
            bonus.bonus += p.bonus
            bonus.init += p.init
            bonus.dom = bonus.dom * p.dom
        })
    }
    //let obj = {}
    if(cmdArgs[11]=='true'){
        bonus.init -= parseInt(cmdArgs[12]) // supprime la protection
    }
    if(bonus.init != 0) {
        // metrte le combatant à jour
        // a =game.combat.combatants.filter(x => x.tokenId == "CQizP9jg1Dv4uML9")[0] le combatant ayant le même id que le token
        // a.update({"initiative" : 9})
        let a = game.combat.getCombatantByToken(cmdArgs[3])
        if(a){
            let tok = game.scenes.current.tokens.get(cmdArgs[3])
            let ac = tok.actor.system
            let i = a.initiative + bonus.init
            if(i < 1) {
                i = i % 12 + 12 // i est soit 0 ou negatif
                let obj ={}
                if(ac.combat.position =="F"){
                    obj["system.combat.position"] = "G"
                }
            } else if (i > 12){
                i = i % 12
            }
            a.update({"initiative" : i })
        }
     }
     let dom = parseInt(cmdArgs[13])
     if(bonus.dom != 1){
        dom = Math.ceil(dom * bonus.dom) // arrondi à l'entier suppérieur
     }
    // if(Object.getOwnPropertyNames(obj).length > 0) { // penser à la protection
    //     // faire la mise a jour
    // }
    gererResultat({tokenId:cmdArgs[3], actorId:cmdArgs[4], titre: cmdArgs[9],
        description:descp, score:parseInt(cmdArgs[6]), rappel: "", lstPrimes:cmdArgs[7], lstPenalites: cmdArgs[8], pAction: cmdArgs[10], dommage : dom })

}

   /**
    * Calcul et affichage du message de chat après le choix.
    * Aucun décompte, juste de l'affichage pour l'instant
    * @param {*} objResultat
    */
function gererResultat(objResultat={tokenId: "", actorId : "", titre:"Résultat du Dés", description:"", score:0, rappel: "", lstPrimes:"", lstPenalites :"", action: "", dommage : -1}) {
    let obj = mergeObject({tokenId: "", actorId : "", titre:"Résultat du Dés", description:"", score:0, rappel: "", lstPrimes:"", lstPenalites :"", action :"", dommage : -1 }, objResultat)
    let qual = obj.score-12; let resultQ = "Echec"
    let dom = obj.dommage; let formD = ""; let arme=""
    let actorId = obj.actorId;
    if(obj.tokenId != "") { // priorité au token.
        let token = game.scenes.current.tokens.get(obj.tokenId)
        actorId = token.actor.id
    }
    if(qual > 0){
        resultQ = LESOUBLIES.toReussites[Math.ceil(qual/3)]
    }
    let tabPrimes = toArrayLstTxt(obj.lstPrimes); let tabPenalites = toArrayLstTxt(obj.lstPenalites)
    let tabElePrimes = []; let tabElePenalites = [];
    tabPrimes.forEach(ele => { tabElePrimes.push({ label : LESOUBLIES.primes[ele].label, description: LESOUBLIES.primes[ele].description}) })
    tabPenalites.forEach(ele => { tabElePenalites.push({ label : LESOUBLIES.penalites[ele].label, description: LESOUBLIES.penalites[ele].description}) })
    let pAction = ""
    if(obj.action != "") pAction = LESOUBLIES.actions[obj.action].label
    let context = {
        titre: obj.titre,
        idToken: obj.tokenId,
        idActor : actorId,
        action : pAction,
        description : obj.description,
        score: obj.score,
        estUnSucces : (obj.score>11),
        resultatQual : resultQ,
        aDommage : (dom != -1),
        dommage : dom,
        formule : formD,
        textArme : arme,
        textRappel : obj.rappel,
        lstPrimes : tabElePrimes,
        lstPenalites : tabElePenalites
    }
    renderTemplate('systems/lesoublies/templates/chat/chat-resultat.hbs', context).then(html => {
        //console.log("Texte HTLM",html)
        const chatData = {
            user: game.user.id,
            speaker: { actor: actorId },
            rollMode: game.settings.get('core', 'rollMode'),
            content: html,
            type: CONST.CHAT_MESSAGE_TYPES.ROLL
        };
        ChatMessage.create(chatData);
    })
   }