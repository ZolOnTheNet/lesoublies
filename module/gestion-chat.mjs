
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
            //aiguillageYaze(cmdArgs, obj);
            console.log("Commande a faire "+ dataset.action, htlm, data, cmdArgs)
            break;
        default :
            console.log("Event Du Chat : Devrait pas être ici", dataSet)
     }
     return;
   }

export function afficheResultat(actor, roll, titre='Jet !',descriptif='', estimation=false, score=0 ) {
    if(actor==undefined) {
        if(_token) {
            actor = _token.actor
        }
    }
    const rollData = {
        idActor : actor.id, // relation avec l'acteur (ajouter la dette)
        titre: titre,
        description : descriptif,
        resultatQual : "", // qualité du résultat si estimation est true
        detteS : 0,        // cout des dettes (Songe et Cauchemard)
        detteC : 0,
        scoreS : 0,
        scoreC : 0,
        esti : estimation,
        cout : ""          // texte de sortie pour dire où et la dette
    }
    // modification en fonction du jet
    const retArray = roll.terms[0].rolls
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