import { LESOUBLIES } from "./helpers/config.mjs";
import { toArrayLstTxt } from "./utils.mjs"

/**
 * Gestion de l'évenement suite au choix du penchant choisit (Songe ou Cauchemard)/
 * Il décompte les scores et les inits. Appel gererResultat
 * @param {*} event
 * @param {*} html
 * @param {*} data
 * @returns
 */
export function EnventDuChat(event, html, data){
    // const btn = $(event.currentTarget);
    // const btnType = btn.data("apply");
     //console.log("EventDuChat:",btn);
     let dataSet = event.currentTarget.dataset;
     let cmdArgs = dataSet.action.split(".");
     switch(cmdArgs[0]){
        case "msg":
            //aiguillageGeMsg(cmdArgs, obj);
            break;
        case "chat":
            //console.log("Commande a faire "+ dataSet.action, html, data, cmdArgs)
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
            // if(Object.getOwnPropertyNames(obj).length > 0) { // penser à la protection
            //     // faire la mise a jour
            // }
            gererResultat({tokenId:cmdArgs[3], actorId:cmdArgs[4], titre: cmdArgs[9], 
                description:descp, score:parseInt(cmdArgs[6]), rappel: "", lstPrimes:cmdArgs[7], lstPenalites: cmdArgs[8], pAction: cmdArgs[10], dommage : cmdArgs[13] })
            break;
        default :
            console.log("Event Du Chat : Devrait pas être ici", dataSet)
     }
     return;
   }

/**
 * Afficher le texte intermédiaire pour le choix entre Songe et Cauchemard
 * @param {String} token : l'id du token, prioritaire
 * @param {*} actor : l'id de l'acteur (non prioritaire au token)
 * @param {*} roll : résultat du jet de Nd12
 * @param {*} titre : jet de la comp
 * @param {*} descriptif
 * @param {*} dernier : dernière action du Round (Hors reaction)
 * @param {*} score
 * @param {*} pLstPrimes
 * @param {*} pLstPenalites
 * @param {*} pAction
 */
export function afficheResultat(token, actor, roll, titre='Jet !',descriptif='', dernier=false, score=0, pLstPrimes="",pLstPenalites="", pAction = "",pProtection =0, pDommage = 0 ) {
    if(token) actor= token.actor
    if(actor==undefined) {
        if(_token) {
            actor = _token.actor
        }
    }
    let tabPrimes = toArrayLstTxt(pLstPrimes); let tabPenalites = toArrayLstTxt(pLstPenalites)
    let bonusPrimes = 0; let malusPenalites = 0
    tabPrimes.forEach(ele => { bonusPrimes += LESOUBLIES.primes[ele].bonus })
    tabPenalites.forEach(ele => {malusPenalites += LESOUBLIES.penalites[ele].bonus })
    score = score + bonusPrimes + malusPenalites
    let labelAction = ""
    if(pAction == "rien") pAction =""
    if(pAction != "") labelAction = LESOUBLIES.actions[pAction].label
    const rollData = {
        idToken : token.id,
        idActor : actor.id, // relation avec l'acteur (ajouter la dette)
        titre: titre,
        action: pAction,
        labelAction  : labelAction,
        description : descriptif,
        resultatQual : "", // qualité du résultat si estimation est true
        detteS : 0,        // cout des dettes (Songe et Cauchemard)
        detteC : 0,
        scoreS : 0,
        scoreC : 0,
        desS : 0,
        desC : 0,
        lstPrimes : pLstPrimes, // transimission des penalités et des primes
        lstPenalites : pLstPenalites,
        //esti : estimation,
        cout : "",          // texte de sortie pour dire où est la dette
        dernier : dernier,
        protection : pProtection,
        dommage : pDommage
    }
    // modification en fonction du jet
    const retArray = roll.terms[0].rolls
    rollData.desS = retArray[0]._total
    rollData.desC = retArray[1]._total
    rollData.scoreS = retArray[0]._total +score // le songe
    rollData.scoreC = retArray[1]._total +score
    if(actor.system.Songe.value == actor.system.Cauchemard.value) {
        // coute rien
        rollData.cout = "aucun cout pour l'un ou l'autre de vos tendances"
    } else if(actor.system.Songe.value > actor.system.Cauchemard.value) {
        rollData.detteC = 1 // cela coute 1 point de Cauchemard car porté sur le Songe.
        rollData.cout = "Choisir le cauchemard vous coutera 1 point de dette de cauchemard"
    } else {
        rollData.detteS = 1 // penchant pour le cauchemard, le songe coute
        rollData.cout = "Choisir le songe vous coutera 1 point de dette de songe"
    }
    // evaluation de la qualité
    // rendu
    renderTemplate('systems/lesoublies/templates/chat/chat-cmp.hbs', rollData).then(html => {
        //console.log("Texte HTLM",html)
        const chatData = {
            user: game.user.id,
            speaker: { actor: actor?.id },
            rollMode: game.settings.get('core', 'rollMode'),
            content: html,
            type: CONST.CHAT_MESSAGE_TYPES.ROLL,
            roll
        };
        ChatMessage.create(chatData);
    })
   }

   /**
    * Calcul est affichage du message de chat après le choix.
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