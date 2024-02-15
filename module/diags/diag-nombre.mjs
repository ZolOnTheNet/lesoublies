import { LESOUBLIES } from "../helpers/config.mjs"

function verifSyntheseData(formData, context) {
  // Verification possible : nombre de Dés au dela de 0
  if (context.total % context.coef) return false
  // if (!formData?.valCodeLst1) {
  //   throw new Error('Dés is required');
  // }
  // if (formData?.valCodeLst2) {
  //   if(formData?.dommage.toUpperCase().indexOf("D") == -1)
  //     throw new Error('Dommage necessite un dé');
  // }
  return true;
}

function handleGestionClick(event, context){
  const targetElement = event.currentTarget;
  const presetType = targetElement.dataset?.action;
  const formElement = $(targetElement).parents('form');
  // recuperer les infos vers contexte
  const tot = formElement?.find('[name="total"]')
  // traitement du click
  let clickTab = presetType.split(".")
  const vallst1 = formElement?.find('[name="'+clickTab[0]+'"]')
  switch(clickTab[1]) {
    case 'set':
      vallst1.val(clickTab[2])
      context[clickTab[0]] = parseInt(clickTab[2])
      break;
    case 'mod':
      if(clickTab[2]=='plus'){
        context[clickTab[0]]++;
        if(context[clickTab[0]]>context["max_"+clickTab[0]])context[clickTab[0]] = context["max_"+clickTab[0]]
      }else {
        context[clickTab[0]]--
        if(context[clickTab[0]]< 0) context[clickTab[0]] = 0
      }
      vallst1.val(context[clickTab[0]])
      break;
  }
  // valide pour set et mod
  context.total = context.valCodeLst1 + context.valCodeLst2
  tot.val(context.total)

  let c = formElement?.find('[id="lst_'+clickTab[0] + '"]')
  c.html(VisuNombre(context[clickTab[0]], context["max_"+clickTab[0]], context.titreCodeLst1, clickTab[0]))
  c=formElement?.find('[id="msg_total"]')
  let msg = ""
  if(context.total % context.coef != 0)msg = "Doit être divisible par "+context.coef
  c.html(msg)

}

/** A modifier visuActions (pour avoir des petits points à cliquer !)
 *
 */
function VisuNombre(nbNombre=1, max=0, ref="songe", lst="lst1") {
  let ret = ''; //let max = LESOUBLIES.options.action.nbMax; // fixé pour l'instant
  let i = 0; let e = nbNombre;
  for(i = 0; i < e; i++){
    ret += '<span class="cmd txtUtiOui" data-action="' +lst+ '.set.' + i + '.'+ ref +'" title="' + i + '" >'+i+' </span>'
  }
  e += 1; // le nombre d'actions choisies
  for(; i < e; i++ ){
    ret += '<span class="cmd txtUtiEnCours" data-action="' +lst+ '.set.' + i + '.'+ ref + '" title="' + i + '" >'+i+' </span>'
  }
  max ++
  for(; i < max; i++){
    ret += '<span class="cmd txtUtiNon" data-action="' +lst+ '.set.' + i + '.'+ ref + '" title="' + i + '" >'+i+' </span>'
  }
  return ret ;
}
/**
 *
 * @param {*} data { token, nomDelaCmp, Acteur (si pas token), case de l'action en cours, equipement utiliser }
 * @returns
 */
export async function diagNombre(token, actor, data = { type:"magie", itemId:"", typeM : "Songe", maxPt: 0, maxSph:0, coef : 1, description : "" }){
  // Pour info : [...game.combat.collections.combatants][0].update({"initiative" : 5}) change l'init du premier combatant (0) à 5
    let templateHtml = '/systems/lesoublies/templates/diags/diag-nombre.hbs'
    const myDialogOptions = {
      width: 500
//      height: 400,
//      top: 500,
//      left: 500
    };
    if(token) {
      actor = token.actor
    }
    context = {
      description : data.description,
      lstPoints : ""
    };
    if(data.cout==undefined) data.cout = 0
    switch(data.type){
        case "magie":
            //templateHtml = '/systems/lesoublies/templates/diags/diag-cmb.hbs' // valeur pas defaut
            context["valeur"]= data.cout
            let lstNombres = VisuNombre(data.cout, data.maxPt, "magie", "valCodeLst1");
            context["lstPoint1"] = lstNombres
            context.valCodeLst1 = data.cout
            context.titreCodeLst1 = "Nombre de point de " + data.typeM
            context.type_valCodeLst1 = "magie" //data.typeM
            context.max_valCodeLst1 = data.maxPt
            context.typeM = data.typeM
            // --- pour la partie sphere
            context.titreLstPoint2 = "Nombre de point de Sphères"
            context.codeLst2 ="Sphères"
            context.type_valCodeLst2 = "sphere"
            context.valCodeLst2 = 0
            lstNombres = VisuNombre(0, data.maxSph, "sphere", "valCodeLst2")
            context["lstPoint2"] = lstNombres
            context['max_valCodeLst2'] = data.maxSph
            context.total = data.cout
            context.coef = data.coef
        break;
    }
    context.objValue = JSON.stringify(context).replaceAll('"','|'); // stockage des infos
    const htmlContent = await renderTemplate(templateHtml, context);
    return new Promise((resolve, reject) => {
        const dialog = new Dialog({
          title: "Choississez un des nombres",
          content: htmlContent,
          buttons: {
            cancel: {
              label: "Annuler",
              //callback: () => reject("Annulation de l'utilisateur"),
              callback: () => resolve({type: 0, info:"Annulation de l'utilisateur"}),
            },
            submit: {
              label: "Utiliser!", // a traduire
              icon: '<i class="fas fa-check"></i>',
              callback: (html) => { // faut enlever les points de magie selectionnée
                const formData = new FormDataExtended(html[0].querySelector('form'))
                  .toObject();
                if(verifSyntheseData(formData,context)) resolve({type: 1, obj : formData, info:"choix effectué"})
                else throw new Error('Veuillez chosir un nombre divisible par le coef : '+context.coef);
              },
            },
          },
          default: "submit",
          render: (html) => {
            html.on('click','.cmd',(event)=>{
              handleGestionClick(event, context )
            })
            //console.log("mettre le bon html.on")
          },
          close: () => {
            //reject("L'utilisateur n'a pas fait de choix.");
            resolve({type: 0, info:"Annulation de l'utilisateur par fermeture de la fenêtre"})
          },
        }, myDialogOptions);

        dialog.render(true);
      });
}  