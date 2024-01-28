export async function mettreEnPlaceLesOptions(){

    await game.settings.register("lesoublies", "optionDialogue", {
        name: game.i18n.localize("LESOUBLIES.basculeDiagTxt"),
        hint: game.i18n.localize("LESOUBLIES.basculeDiaghint"),
        scope: "world",
        config: true,
        type: Boolean,
        default: true,
    });

    await game.settings.register('lesoublies', 'repertoireCmpBase', {
        name: game.i18n.localize("LESOUBLIES.repertoireBaseCMP"),
        hint: game.i18n.localize("LESOUBLIES.repertoireBaseCMPhint"), // can also be an i18n key
        scope: 'world',     // "world" = sync to db, "client" = local storage
        config: true,       // false if you dont want it to show in module config
        type: String,       // Number, Boolean, String, or even a custom class or DataModel
        default: "world.cmpbase",
        onChange: value => { // value is the new value of the setting
          console.log(value)
        },
        filePicker: false,  // set true with a String `type` to use a file picker input,
        requiresReload: false, // when changing the setting, prompt the user to reload
      });
      // on lit la valeur : game.settings.get("lesoublies","repertoireCmpBase")

      await game.settings.register('lesoublies', 'repertoireCmpTotal', {
        name: game.i18n.localize("LESOUBLIES.repertoireBaseCmpTotal"),
        hint: game.i18n.localize("LESOUBLIES.repertoireBaseCmpTotalhint"), // can also be an i18n key
        scope: 'world',     // "world" = sync to db, "client" = local storage
        config: true,       // false if you dont want it to show in module config
        type: String,       // Number, Boolean, String, or even a custom class or DataModel
        default: "world.cmptotal",
        onChange: value => { // value is the new value of the setting
          console.log(value)
        },
        filePicker: false,  // set true with a String `type` to use a file picker input,
        requiresReload: false, // when changing the setting, prompt the user to reload
      });
      // on lit la valeur : game.settings.get("lesoublies","repertoireCmpTotal")

      await game.settings.register('lesoublies', 'repertoireProfils', {
        name: game.i18n.localize("LESOUBLIES.repertoireBaseProfil"),
        hint: game.i18n.localize("LESOUBLIES.repertoireBaseProfilhint"), // can also be an i18n key
        scope: 'world',     // "world" = sync to db, "client" = local storage
        config: true,       // false if you dont want it to show in module config
        type: String,       // Number, Boolean, String, or even a custom class or DataModel
        default: "world.profils",
        onChange: value => { // value is the new value of the setting
          console.log(value)
        },
        filePicker: false,  // set true with a String `type` to use a file picker input,
        requiresReload: false, // when changing the setting, prompt the user to reload
      });
      // on lit la valeur : game.settings.get("lesoublies","repertoireProfils")
}

// exemples :
// await game.settings.register('lesoublies', 'repertoireCmpBase', {
//     name: game.i18n.localize("LESOUBLIES.basculeDiagTxt"),
//     hint: game.i18n.localize("LESOUBLIES.basculeDiaghint"),
//     scope: "world",
//     config: true,//     config: true,       // false if you dont want it to show in module config
//     type: Number,       // Number, Boolean, String, or even a custom class or DataModel
//     default: 0,
//     range: {.           // range turns the UI input into a slider input
//       min: 0,           // but does not validate the value
//       max: 100,
//       step: 10
//     },
//     onChange: value => { // value is the new value of the setting
//       console.log(value)
//     },
//     filePicker: false,  // set true with a String `type` to use a file picker input,
//     requiresReload: false, // when changing the setting, prompt the user to reload
//   });