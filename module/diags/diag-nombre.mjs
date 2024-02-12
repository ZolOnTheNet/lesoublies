import { LESOUBLIES } from "../helpers/config.mjs"

function verifSyntheseData(formData) {
  // Verification possible : nombre de Dés au dela de 0
  // if (!formData?.score) {
  //   throw new Error('Score is required');
  // }

  // if (!formData?.des) {
  //   throw new Error('Dés is required');
  // }
  // if (formData?.dommage) {
  //   if(formData?.dommage.toUpperCase().indexOf("D") == -1)
  //     throw new Error('Dommage necessite un dé');
  // }
}

function handleGestionClick(event, context){
  const targetElement = event.currentTarget;
  const presetType = targetElement.dataset?.action;
  const formElement = $(targetElement).parents('form');
  // recuperer les infos vers contexte
  const nameInput = formElement?.find('[name="name"]')
  // traitement du click
  let clickTab = presetType.split(".")
  switch(clickTab[0]) {
    case 'bonus':
      
      break;
  }
}

/** A modifier visuActions (pour avoir des petits points à cliquer !)
 * 
 */
function VisuNombre(nbNombre=1, max=0, ref="songe", lst="lst1") {
  let ret = ''; let max = LESOUBLIES.options.action.nbMax; // fixé pour l'instant
  let i = 0; let e = nbAction;
  for(i = 1; i < e; i++){
    ret += '<span class="cmd txtUtiOui" data-action="' +lst+ '.set.' + i + '.'+ ref +'" title="' + i + '" >'+i+' </span>'
  }
  //e += 1; // le nombre d'actions choisies
  for(; i <= e; i++ ){
    ret += '<span class="cmd txtUtiEnCours" data-action="' +lst+ '.set.' + i + '.'+ ref + '" title="' + i + '" >'+i+' </span>'
  }
  for(; i <= max; i++){
    ret += '<span class="cmd txtUtiNon" data-action="' +lst+ '.set.' + i + '.'+ ref + '" title="' + i + '" >'+i+' </span>'
  }
  return ret ; 
}
/**
 * 
 * @param {*} data { token, nomDelaCmp, Acteur (si pas token), case de l'action en cours, equipement utiliser }
 * @returns 
 */
export  async function diagNombre(token, actor, data = { type:"magie", itemId:"", typeM : "Songe", maxPt: 0, maxSph:0, coef : 1, description : "" }){ //
  // Pour info : [...game.combat.collections.combatants][0].update({"initiative" : 5}) change l'init du premier combatant (0) à 5
    let templateHtml = '/systems/lesoublies/templates/diags/diag-cmb.hbs'
    const myDialogOptions = {
      width: 500
//      height: 400,
//      top: 500,
//      left: 500
    };
    if(token) {
      actor = data.token.actor
    }
    context = {
      description : description,
      lstPoints : ""
    };
    switch(data.type){
        case "magie":
            //templateHtml = '/systems/lesoublies/templates/diags/diag-cmb.hbs' // valeur pas defaut
            context["valeur"]= data.cout
            let lstNombres = VisuNombre(data.coef, data.maxPt, "magie", "lstPoint1");
            context["lstPoint1"] = lstNombres
            context.valCodeLst1 = data.cout
            context.titreCodeLst1 = "Nombre de point de " + data.typeM
            context.codeLst1 = data.typeM
            context.maxPt = data.maxPt
            // --- pour la partie sphere
            context.titreLstPoint2 = "Nombre de point de Sphères"
            context.codeLst2 ="Sphères"
            context.valCodeLst2 = 0
            lstNombres = VisuNombre(0, data.maxSph, "sphere", "lstPoint2")
            context["lstPoint2"] = lstNombre
            context['maxSphere'] = data.maxSph
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
              label: "Cancel",
              callback: () => reject("Annulation de l'utilisateur"),
            },
            submit: {
              label: "Jet!", // a traduire
              icon: '<i class="fas fa-check"></i>',
              callback: (html) => { // faut enlever les points de magie selectionnée 
                const formData = new FormDataExtended(html[0].querySelector('form'))
                  .toObject();
                 verifSyntheseData(formData);
                resolve(formData);
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
            reject("L'utilisateur n'a pas fait de choix.");
          },
        }, myDialogOptions);

        dialog.render(true);
      });
}  