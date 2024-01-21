import { LESOUBLIES } from "../helpers/config.mjs";
import { toArrayLstTxt } from "../utils.mjs"
import {traitementChoixSonge} from "../gestion-jets.mjs"

function choixDirect(event, dialog){
    const targetElement = event.currentTarget;
    const cmd = targetElement.dataset?.action;
    const formElement = $(targetElement).parents('form');
    //console.log("Evenement : faire : "+cmd, targetElement)
    traitementChoixSonge(cmd)
    dialog.close()
}
/**
 * Permet d'afficher le dialogue de choix en fenêtre pop-up sous forme de dialgoue
 * @param {*} obj
 * @returns
 */
export async function ChoixEtResultat(token, actor, roll, obj={}) {
    let context  = mergeObject({ idToken : token.id, idActor : actor.id}, obj)

    let tabPrimes = toArrayLstTxt(context.LstPrimes); let tabPenalites = toArrayLstTxt(context.LstPenalites)
    let bonusPrimes = 0; let malusPenalites = 0
    tabPrimes.forEach(ele => { bonusPrimes += LESOUBLIES.primes[ele].bonus })
    tabPenalites.forEach(ele => {malusPenalites += LESOUBLIES.penalites[ele].bonus })
    context.score = context.score + bonusPrimes + malusPenalites
    let labelAction = ""
    if(context.action == "rien") context.action =""
    if(context.action != "") labelAction = LESOUBLIES.actions[context.action].label
    const rollData = {
        labelAction  : labelAction,
//        description : descriptif,
        resultatQual : "", // qualité du résultat si estimation est true
        detteS : 0,        // cout des dettes (Songe et Cauchemard)
        detteC : 0,
        scoreS : 0,
        scoreC : 0,
        desS : 0,
        desC : 0,
        lstPrimes : context.primes, // transimission des penalités et des primes
        lstPenalites : context.penalites, // transfert vers le bon champs 
        //esti : estimation,
        cout : "",          // texte de sortie pour dire où est la dette
        // dernier : dernier,
        // protection : pProtection,
        // dommage : pDommage
        protection: context.armure
    }
    const retArray = roll.terms[0].rolls
    rollData.desS = retArray[0]._total
    rollData.desC = retArray[1]._total
    rollData.scoreS = retArray[0]._total + context.score // le songe
    rollData.scoreC = retArray[1]._total + context.score
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
    const myDialogOptions = {
        width: 500,
        height: 220
  //      top: 500,
  //      left: 500
      };
    context  = mergeObject(context, rollData) // fusion
    const htmlContent = await renderTemplate('systems/lesoublies/templates/chat/chat-cmp.hbs', context);
    return new Promise((resolve, reject) => {
        const dialog = new Dialog({
          title: "Choix entre Songe et Cauchemard",
          content: htmlContent,
          buttons: {
            Songe: { // XXXX
              label: "Songe",
              callback: (html) => {
                    const a = html[0].querySelector(".songe")
                    const cmd = a.dataset?.action
                    //verifSyntheseData(formData);
                    traitementChoixSonge(cmd)
                    resolve(cmd);
                }, // faire une sortie chat ?
            },
            Cauchemard: {
                label: "Cauchemard", // a traduire
              //icon: '<i class="fas fa-check"></i>',
                callback: (html) => {
                    const a = html[0].querySelector(".cauchemard")
                    const cmd = a.dataset?.action
                  //verifSyntheseData(formData);
                  traitementChoixSonge(cmd)
                    resolve(cmd);
                },
            },
          },
          render: (html) => {
            //html.on('click', 'button[data-preset]', handleCranPreset);
            html.on('click', '.cmd', event => { choixDirect(event,dialog) });
          },
          close: () => {
            reject('User closed dialog without making a selection.'); // ici aussi sortir un texte chat ?
          },
        }, myDialogOptions);
        dialog.render(true);
      });


}  