// Import document classes.
import { LesOubliesActor } from "./documents/actor.mjs";
import { LesOubliesItem } from "./documents/item.mjs";
// Import sheet classes.
import { LesOubliesActorSheet } from "./sheets/actor-sheet.mjs";
import { LesOubliesItemSheet } from "./sheets/item-sheet.mjs";
// Import helper/utility classes and constants.
import {RegisterHelperHandlebar} from "./helpers/handlebar.mjs"
import { preloadHandlebarsTemplates } from "./helpers/templates.mjs";
import { LESOUBLIES } from "./helpers/config.mjs";
import { EnventDuChat } from "./gestion-chat.mjs"
import { AffecterProfils } from "./utils.mjs";
import { DataCom } from "./datacom.mjs"

/* -------------------------------------------- */
/*  Init Hook                                   */
/* -------------------------------------------- */

Hooks.once('init', async function() {

  // Add utility classes to the global game object so that they're more easily
  // accessible in global contexts.
  game.lesoublies = {
    LesOubliesActor,
    LesOubliesItem,
    rollItemMacro
  };

  // Add custom constants for configuration.
  CONFIG.LESOUBLIES = LESOUBLIES;

  /**
   * Set an initiative formula for the system
   * aller dans l'actor.mjs => preparedData, on pourrait aussi mettre @Rapidite (les accents sautes)
   *  mais init est défini pour tous !
   * @type {String}
   */
  CONFIG.Combat.initiative = {
    formula: "min(ceil(1d12+@init),12)", 
    decimals: 2
  };

  // Define custom Document classes
  CONFIG.Actor.documentClass = LesOubliesActor;
  CONFIG.Item.documentClass = LesOubliesItem;

  // Register sheet application classes
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("lesoublies", LesOubliesActorSheet, { makeDefault: true });
  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("lesoublies", LesOubliesItemSheet, { makeDefault: true });

  // game.api
  game.api = {
    "affecertProfils" : AffecterProfils
  }

  game.lstData = new DataCom

  Hooks.on("renderChatMessage", (message, html, data) => {
    html.find(".cmd").click((ev) =>EnventDuChat(ev, html, data));
  });
  // Preload Handlebars templates.

  RegisterHelperHandlebar()

  game.settings.register("lesoublies", "optionDialogue", {
    name: game.i18n.localize("LESOUBLIES.basculeDiagTxt"),
    hint: game.i18n.localize("LESOUBLIES.basculeDiaghint"),
    scope: "world",
    config: true,
    type: Boolean,
    default: true,
});

  return preloadHandlebarsTemplates();
});

/* -------------------------------------------- */
/*  Handlebars Helpers                          */
/* -------------------------------------------- */

// If you need to add Handlebars helpers, here are a few useful examples:
Handlebars.registerHelper('concat', function() {
  var outStr = '';
  for (var arg in arguments) {
    if (typeof arguments[arg] != 'object') {
      outStr += arguments[arg];
    }
  }
  return outStr;
});

Handlebars.registerHelper('toLowerCase', function(str) {
  return str.toLowerCase();
});

/* -------------------------------------------- */
/*  Ready Hook                                  */
/* -------------------------------------------- */

Hooks.once("ready", async function() {
  // Wait to register hotbar drop hook on ready so that modules could register earlier if they want to
  Hooks.on("hotbarDrop", (bar, data, slot) => createItemMacro(data, slot));
});

/* -------------------------------------------- */
/*  Hotbar Macros                               */
/* -------------------------------------------- */

/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {Object} data     The dropped data
 * @param {number} slot     The hotbar slot to use
 * @returns {Promise}
 */
async function createItemMacro(data, slot) {
  // First, determine if this is a valid owned item.
  if (data.type !== "Item") return;
  if (!data.uuid.includes('Actor.') && !data.uuid.includes('Token.')) {
    return ui.notifications.warn("You can only create macro buttons for owned Items");
  }
  // If it is, retrieve it based on the uuid.
  const item = await Item.fromDropData(data);

  // Create the macro command using the uuid.
  const command = `game.lesoublies.rollItemMacro("${data.uuid}");`;
  let macro = game.macros.find(m => (m.name === item.name) && (m.command === command));
  if (!macro) {
    macro = await Macro.create({
      name: item.name,
      type: "script",
      img: item.img,
      command: command,
      flags: { "lesoublies.itemMacro": true }
    });
  }
  game.user.assignHotbarMacro(macro, slot);
  return false;
}

/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {string} itemUuid
 */
function rollItemMacro(itemUuid) {
  // Reconstruct the drop data so that we can load the item.
  const dropData = {
    type: 'Item',
    uuid: itemUuid
  };
  // Load the item from the uuid.
  Item.fromDropData(dropData).then(item => {
    // Determine if the item loaded and if it's an owned item.
    if (!item || !item.parent) {
      const itemName = item?.name ?? itemUuid;
      return ui.notifications.warn(`Could not find item ${itemName}. You may need to delete and recreate this macro.`);
    }

    // Trigger the item roll
    item.roll();
  });
}