import { LESOUBLIES } from "./helpers/config.mjs";
import { toArrayLstTxt } from "./utils.mjs"

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
            // donner le resultat final !
            gererResultat({tokenId:cmdArgs[3], actorId:cmdArgs[4], titre:"Résultat du " + cmdArgs[9], description:descp, score:parseInt(cmdArgs[6]), rappel: "", lstPrimes:cmdArgs[7], lstPenalites: cmdArgs[8] })
            break;
        default :
            console.log("Event Du Chat : Devrait pas être ici", dataSet)
     }
     return;
   }

export function afficheResultat(token, actor, roll, titre='Jet !',descriptif='', estimation=false, score=0, pLstPrimes="",pLstPenalites="" ) {
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

    const rollData = {
        idToken : token.id,
        idActor : actor.id, // relation avec l'acteur (ajouter la dette)
        titre: titre,
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
        esti : estimation,
        cout : ""          // texte de sortie pour dire où et la dette
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
    renderTemplate('systems/lesoublies/templates/chat/cmp.hbs', rollData).then(html => {
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

   function gererResultat(objResultat={tokenId: "", actorId : "", titre:"Résultat du Dés", description:"", score:0, rappel: "", lstPrimes:"", lstPenalites :""}) {
    let obj = mergeObject({tokenId: "", actorId : "", titre:"Résultat du Dés", description:"", score:0, rappel: "" }, objResultat)
    let qual = obj.score-12; let resultQ = "Echec"
    let dom = -1; let formD = ""; let arme=""
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
    let context = {
        titre: obj.titre,
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
    renderTemplate('systems/lesoublies/templates/chat/resultat.hbs', context).then(html => {
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