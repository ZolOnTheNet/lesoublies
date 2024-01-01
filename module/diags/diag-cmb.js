// fichier de traitement du dialogue du combat


export  async function DicePromptGenesys(parChamp1="brawn", parChamp2 = "-", parDices ={Actor:"-", skill:"-", attrib:"-", attrib2:"-", A:0, P:0, B:0, I:0, C:0, S:0, a:0, s:0, t: 0, h:0, f:0, d:0}, valChamp1={}, valChamp2={}){ // A: Abylitye
    // let dommageFormule = "3d6"
    // let lstAttrib = valChamp1
    // let lstValCmp = valChamp2
    // let parValChamp = parChamp2
    // if(parChamp2 == '-') {  // jet de caract, donc deux fois les attributs, avec par défaut l'attribut identique
    //     lstValCmp = valChamp1
    //     parValChamp = parChamp1
    // }
    // Object.keys(parDices).forEach(key => { reserveDes[key]=parDices[key]}) // recopie dans la globale
    // let DesPos =  ['P','A','B','a','s','t']
    // let DesNeg =  ['C','I','S','h','f','d']
    context = {
        // attribV : lstAttrib,
        // lstCmp : lstValCmp,
        // dommage: dommageFormule,
        // description : "Utilisez la boîte à dés sur la droite pour ajouter, améliorer et rétrograder. Cliquez sur les dés dans la réserve pour les retirer !", // a traduire
        // objValue : JSON.stringify(reserveDes).replaceAll('"','|'),
        // lstDesPos : DestoHTML(DesPos),
        // lstDesNeg : DestoHTML(DesNeg),
        // SelectAttrib : parChamp1,
        // SelectCmp : parValChamp
      };
    const htmlContent = await renderTemplate('/system/lesoublies/templates/diags/diag-cmb.hbs', context);
    return new Promise((resolve, reject) => {
        const dialog = new Dialog({
          title: "Modificateur de lancer",
          content: htmlContent,
          buttons: {
            cancel: {
              label: "Cancel",
              callback: () => reject('User canceled.'),
            },
            submit: {
              label: "Jet!", // a traduire
              icon: '<i class="fas fa-check"></i>',
              callback: (html) => {
                const formData = new FormDataExtended(html[0].querySelector('form'))
                  .toObject();
                  //verifSyntheseData(formData);
                resolve(formData);
              },
            },
          },
          render: (html) => {
            //html.on('click', 'button[data-preset]', handleCranPreset);
            // html.on('click', 'a[zoldice]', handleDeChangement);
            // html.on('click', '.die[zoldice]', handleDeSuppr)
            // html.on('change', 'select[zoldice]',handleChangeSelect)
            // let formElement = $(html).parents('form')
            // changeReserve(formEle,true)
            // changeReserve(formEle,false)
            console.log("mettre le bon html.on")
          },
          close: () => {
            reject('User closed dialog without making a selection.');
          },
        });

        dialog.render(true);
      });
}  