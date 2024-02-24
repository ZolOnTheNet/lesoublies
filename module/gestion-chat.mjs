import { LESOUBLIES } from "./helpers/config.mjs";
import {traitementChoixSonge} from "./gestion-jets.mjs"
import { toArrayLstTxt, calculPointsMagie } from "./utils.mjs"

/**
 * Gestion de l'évenement suite au choix du penchant choisit (Songe ou Cauchemard)/
 * Il décompte les scores et les inits. Appel gererResultat
 * @param {*} event
 * @param {*} html
 * @param {*} data
 * @returns
 */
export function EnventDuChat(event, html, data){ //dans la fonction principale
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
            switch(cmdArgs[1]){
                case 'choix':
                    //console.log("Commande a faire "+ dataSet.action, html, data, cmdArgs)
                    traitementChoixSonge(dataSet.action)
                    break;
                case 'dommage':
                    if(_token){
                        let dom = parseInt(cmdArgs[3])
                        if(dom>0){
                            let pvd = _token.actor.system.PdV.value
                            if(cmdArgs[2] == 'plus') pvd += dom 
                                else pvd -= dom
                            _token.actor.update({ "system.PdV.value" : pvd})
                            prendDesDommage(cmdArgs[4], cmdArgs[5], _token, dom, cmdArgs[2])
                        }
                    }
                    break;
            }
            break;
        case 'magie':
            if(cmdArgs[1]=="choix" && cmdArgs[2]=="direct"){
                ui.notifications.warn("Vous ave décider de prendre "+cmdArgs[3]+" Points de "+cmdArgs[4]);
            }
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
        idToken : token?.id || "",
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
            roll : roll
        };
        ChatMessage.create(chatData);
    })
   }

/**
 * affichage rapide pour avoir le lancer de dés !
 *
 * @export
 * @param {*} token
 * @param {*} actor
 * @param {*} roll
 * @param {string} [titre='Jet !']
 * @param {string} [descriptif='']
 * @param {boolean} [dernier=false]
 * @param {number} [score=0]
 * @param {string} [pAction=""]
 * @param {number} [pProtection=0]
 */
export function afficheResultatCourt(token, actor, roll, titre='Jet !',descriptif='', dernier=false, scoreS=0, scoreC =0, pAction = "",pProtection =0 ) {
    if(token) actor= token.actor
    if(actor==undefined) {
        if(_token) {
            actor = _token.actor
        }
    }
    const rollData = {
        titre: titre,
        description : descriptif,
        scoreS : scoreS,
        scoreC : scoreC,
        dernier : dernier,
        protection : pProtection
    }
    renderTemplate('systems/lesoublies/templates/chat/chat-cmp-short.hbs', rollData).then(html => {
        //console.log("Texte HTLM",html)
        const chatData = {
            user: game.user.id,
            speaker: { actor: actor?.id },
            rollMode: game.settings.get('core', 'rollMode'),
            content: html,
            type: CONST.CHAT_MESSAGE_TYPES.ROLL,
            roll: roll
        };
        ChatMessage.create(chatData);
    })
}

export function affichageSort(token, actor, itemSort, cout, titre="", msgImportant ="", CoutSphere=0, coef=1){
    if(token) actor= token.actor
    if(actor==undefined) {
        if(_token) {
            actor = _token.actor
        }
    }
    let typeM = (itemSort.system.codeSouC == 0)?"Cauchemard":"Songe"
    if(titre =="") titre = itemSort.name
    // tout les point de magie on déjà été enlevée
    let HtmlchoixPtMagie = ""
    // if( ! itemSort.system.coutFixe) {
    //     cout = 0
    //     let ptMagieT  = calculPointsMagie(actor, itemSort.system.codeSouC)
    //     let ptMagie = ptMagieT.max
    //     let itemMetier = actor.items.filter(x => x.type=='metier')
    //     let coef = 2
    //     if(ptMagie / coef ==1) cout = coef 
    // }
    const context = {
        titre : titre,
        important : msgImportant,
        description : itemSort.system.description,
        cout : cout,
        CoutSphere : CoutSphere,
        coutMagie : (cout - CoutSphere),
        coutFixe : itemSort.system.coutFixe,
        niveau : (cout/coef),
        portee: itemSort.system.portee,
        duree : itemSort.system.duree,
        preparation : itemSort.system.preparation,
        typeMagie: typeM,
        listPdM : HtmlchoixPtMagie
    }
    renderTemplate('systems/lesoublies/templates/chat/chat-sort.hbs', context).then(html => {
        //console.log("Texte HTLM",html)
        const chatData = {
            user: game.user.id,
            speaker: { actor: actor?.id },
            rollMode: game.settings.get('core', 'rollMode'),
            content: html
        };
        ChatMessage.create(chatData);
    })

}

export function SimpleMessageChat(token, actor, html) {
    if(token) actor= token.actor
    if(actor==undefined) {
        if(_token) {
            actor = _token.actor
        }
    }
    const chatData = {
        user: game.user.id,
        speaker: { actor: actor?.id },
        rollMode: game.settings.get('core', 'rollMode'),
        content: html
    };
    ChatMessage.create(chatData);
}

function prendDesDommage(idTokenS, idActorS, tokenC, dom, cmd){
    let tokenS; let actorS
    if(idTokenS) {
        tokenS = game.scenes.active.tokens.get(idTokenS)
        if(tokenS) actorS= tokenS.actor
    } else {
        if(idActorS) actorS= game.actors.get(idActorS)
    }
    let gain = cmd=='plus'? " gagne ": " perd "
    let html = "le personnage " + tokenC.name + gain + dom + " points de vie. Il lui en reste " + tokenC.actor.system.PdV.value+"/"+ tokenC.actor.system.PdV.max
    SimpleMessageChat(tokenS, actorS, html)
}