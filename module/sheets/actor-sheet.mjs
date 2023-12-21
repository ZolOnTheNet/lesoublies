import { LESOUBLIES } from "../helpers/config.mjs";
import {onManageActiveEffect, prepareActiveEffectCategories} from "../helpers/effects.mjs";

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class LesOubliesActorSheet extends ActorSheet {

  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["lesoublies", "sheet", "actor"],
      template: "systems/lesoublies/templates/actor/actor-sheet.html",
      width: 650,
      height: 600,
      dragDrop: [{dragSelector: null, dropSelector: ".droppable"}],
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "features" }]
    });
  }

  /** @override */
  get template() {
    return `systems/lesoublies/templates/actor/actor-${this.actor.type}-sheet.html`;
  }

  /* -------------------------------------------- */

  /** @override */
  getData() {
    // Retrieve the data structure from the base sheet. You can inspect or log
    // the context variable to see the structure, but some key properties for
    // sheets are the actor object, the data object, whether or not it's
    // editable, the items array, and the effects array.
    const context = super.getData();

    // Use a safe clone of the actor data for further operations.
    const actorData = this.actor.toObject(false);

    // Add the actor's data to context.data for easier access, as well as flags.
    context.system = actorData.system;
    context.flags = actorData.flags;
    context.NomRace = "Hybride?" // Race par défaut
    // Prepare character data and items.
    if (actorData.type == 'character') {
      this._prepareItems(context);
      this._prepareCharacterData(context);
    }

    // Prepare NPC data and items.
    if (actorData.type == 'npc') {
      this._prepareItems(context);
    }

    // Add roll data for TinyMCE editors.
    context.rollData = context.actor.getRollData();

    // Prepare active effects
    context.effects = prepareActiveEffectCategories(this.actor.effects);

    return context;
  }

  /**
   * Organize and classify Items for Character sheets.
   *
   * @param {Object} actorData The actor to prepare.
   *
   * @return {undefined}
   */
  _prepareCharacterData(context) {
    // Handle ability scores.
    // for (let [k, v] of Object.entries(context.system.abilities)) {
    //   v.label = game.i18n.localize(CONFIG.LESOUBLIES.abilities[k]) ?? k;
    // }
  }

  /**
   * Organize and classify Items for Character sheets.
   *
   * @param {Object} actorData The actor to prepare.
   *
   * @return {undefined}
   */
  _prepareItems(context) {
    // Initialize containers.
    const gear = [];
    const features = [];
    let   profils = []
    const lstCmps = []
    const cmpProf = []
    const armes = []
    const armures = []
    const liens = []
    //const aAfficher = [] // pour la liste complète sans colonnes
    const spells = {
      0: [],
      1: [],
      2: [],
      3: [],
      4: [],
      5: [],
      6: [],
      7: [],
      8: [],
      9: []
    };
    context.aRace = false;
    // Iterate through items, allocating to containers
    for (let i of context.items) {
      i.img = i.img || DEFAULT_TOKEN;

      if (i.type === 'race') {
        //affiche de la race
        context.NomRace = i.name;
        context.race = i;
        context.aRace = true;
        context.taille = i.system.taille
      }
      else if (i.type === 'tribut') {
        context.NomTribut = i.name;
      }
      // Append to equipement
      else if (i.type === 'equipement') {
        gear.push(i);
      }
      else if (i.type === 'cmp') {
        // alogot d'enrichissement de l'objet cmpProf
        if(profils.includes(i.system.profil)) {
          cmpProf[i.system.profil].items.push(i)
        } else {
          cmpProf[i.system.profil] = { 'value' : 0, 'items' : [i]  }
          profils.push(i.system.profil); // ajout du texte du nom de profil
        }
        lstCmps.push(i)
      }
      // Append to features.
      else if (i.type === 'arme') {
        armes.push(i);
      }
      else if (i.type === 'armure') {
        armures.push(i);
      }
      else if (i.type === 'lien') {
        liens.push(i);
      }
      // Append to spells.
      else if (i.type === 'sort') {
        if (i.system.cout != undefined) {
          spells[i.system.cout].push(i);
        }
      }
    }

    // test sur la race (les autres ne font qu'augmenter les cmp)
    profils = profils.toSorted((a,b) => a > b)
    let aAffiche3Col=[ [],[],[] ]; let ind = 0; let nbProfils = profils.length / 3; let indice =0
    if(context.aRace) {
      profils.forEach(x => {
        let prof = x
        if(prof.toUpperCase() == 'FORCE DE LA NATURE') prof = "forceNature"
          else if(prof == 'Athlète') prof = "athlete"
            else prof = prof.toLowerCase()
        let lstItem = cmpProf[x].items.toSorted((a,b) => a.name > b.name)
        //let vProf = this.actor.
        const stdProfil =  parseInt(context.race.system.profils[prof])
        //aAfficher.push( { "name": x, "profil": "", "value": stdProfil, "isProfil": true, "totValue": stdProfil, "isModifiable": false, "isRoll": true})
        aAffiche3Col[ind].push( { "name": x, "profil": "", "value": stdProfil, "isProfil": true, "totValue":stdProfil, "isModifiable": false, "isRoll": true})
        lstItem.forEach(y => {
          const valCmp = parseInt(y.system.score)
          //aAfficher.push( { "name": y.name, "profil": x, "value":valCmp, "isProfil": false, "totValue":valCmp + stdProfil, "isModifiable": true, "isRoll": !(y.system.estFermee && y.score == 0) })
          aAffiche3Col[ind].push( { "name": y.name, "profil": x, "value": valCmp, "isProfil": false, "totValue":valCmp+ stdProfil, "isModifiable": true, "isRoll": !(y.system.estFermee && y.score == 0) })
        })
        indice++;
        ind = Math.floor(indice/nbProfils);
      })
    }
        // Assign and return
    if(context.taille != context.system.taille.value) context.system.taille.value = context.taille
    context.gear = gear;
    context.features = features;
    context.spells = spells;
    context.cmps = cmpProf;
    context.profils = profils;
    context.lstCmps = lstCmps;
    //context.aAfficher = aAfficher;
    context.aAfficher1 = aAffiche3Col[0];
    context.aAfficher2 = aAffiche3Col[1];
    context.aAfficher3 = aAffiche3Col[2];
    // contient toutes lignes correctement agencées
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Render the item sheet for viewing/editing prior to the editable check.
    html.find('.item-edit').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(li.data("itemId"));
      item.sheet.render(true);
    });

    // -------------------------------------------------------------
    // Everything below here is only needed if the sheet is editable
    if (!this.isEditable) return;

    // Add Inventory Item
    html.find('.item-create').click(this._onItemCreate.bind(this));

    // Delete Inventory Item
    html.find('.item-delete').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(li.data("itemId"));
      item.delete();
      li.slideUp(200, () => this.render(false));
    });

    // Active Effect management
    html.find(".effect-control").click(ev => onManageActiveEffect(ev, this.actor));

    // Rollable abilities.
    html.find('.rollable').click(this._onRoll.bind(this));

    // Drag events for macros.
    if (this.actor.isOwner) {
      let handler = ev => this._onDragStart(ev);
      html.find('li.item').each((i, li) => {
        if (li.classList.contains("inventory-header")) return;
        li.setAttribute("draggable", true);
        li.addEventListener("dragstart", handler, false);
      });
    }
  }

  /**
   * Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
   * @param {Event} event   The originating click event
   * @private
   */
  async _onItemCreate(event) {
    event.preventDefault();
    const header = event.currentTarget;
    // Get the type of item to create.
    const type = header.dataset.type;
    // Grab any data associated with this control.
    const data = duplicate(header.dataset);
    // Initialize a default name.
    const name = `New ${type.capitalize()}`;
    // Prepare the item object.
    const itemData = {
      name: name,
      type: type,
      system: data
    };
    // Remove the type from the dataset since it's in the itemData.type prop.
    delete itemData.system["type"];

    // Finally, create the item!
    return await Item.create(itemData, {parent: this.actor});
  }

  /**
   * Handle clickable rolls.
   * @param {Event} event   The originating click event
   * @private
   */
  _onRoll(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const dataset = element.dataset;

    console.log("jet : ", element,dataset)
    let r = new Roll("{ 1d12x, 1d12x[black]}")

    const speaker = ChatMessage.getSpeaker({ actor: this.actor });
    const rollMode = game.settings.get('core', 'rollMode');
    r.evaluate({async :false })
    let label = "Jet !"
    const retArray = r.terms[0].rolls
    const retS = retArray[0]._total // le songe
    const retC = retArray[1]._total // le Cauchemard
    label += "<br>Que vous choississez vous ? <br \> Le <strong>Songe ("+retS+")</strong> ou le <strong>Cauchemard("+retC+")</strong>"
    r.toMessage({
      speaker: speaker,
      rollMode: rollMode,
      flavor: label,
    });
    
    console.log("Resultat", r)
    //return roll;

    // let monTexte =
    // let chatData = {
    //   user: game.user._id,
    //   speaker: qui,
    //   content : monTexte
    // };
    // ChatMessage.create(chatData);
    // Handle item rolls.
    // if (dataset.rollType) {
    //   if (dataset.rollType == 'item') {
    //     const itemId = element.closest('.item').dataset.itemId;
    //     const item = this.actor.items.get(itemId);
    //     if (item) return item.roll();
    //   }
    // }

    // // Handle rolls that supply the formula directly.
    // if (dataset.roll) {
    //   let label = dataset.label ? `[ability] ${dataset.label}` : '';
    //   let roll = new Roll(dataset.roll, this.actor.getRollData());
    //   roll.toMessage({
    //     speaker: ChatMessage.getSpeaker({ actor: this.actor }),
    //     flavor: label,
    //     rollMode: game.settings.get('core', 'rollMode'),
    //   });
    //   return roll;
    // }
  }
  _OnDrop(event) {
    event.preventDefault();
    const data = TextEditor.getDragEventData(event);
    console.log("Drop", event, data)
  }

  async _onDropItem(event, data) {
    if (!this.actor.isOwner) return false;

    // Get the item from the drop
    const item = await Item.implementation.fromDropData(data);
    //if (!COF.actorsAllowedItems[this.actor.type]?.includes(item.type)) return;

    const itemData = item.toObject();

    // Handle item sorting within the same Actor
    //if (this.actor.uuid === item.parent?.uuid) return this._onSortItem(event, itemData);

    // Create the owned item
    return this._onDropItemCreate(itemData, data.uuid, event.shiftKey);
  }

  async _onDropItemCreate(itemData, source, shiftKey) {
    switch (itemData.type) {
      case "race":
        // gestion de la race : suppression des anciennes
        let listRace = this.actor.items.filter(x => x.type == 'race')
        if(listRace.length> 0){
          //let listRaceId =[]; listRace.forEach(x => { listRaceId.push(x.id)} )
          let listRaceId = listRace.map(x => x.id)
          await this.actor.deleteEmbeddedDocuments('Item',listRaceId)
        }
        itemData = itemData instanceof Array ? itemData : [itemData];
        const refProfils = itemData[0].system.profils; // recupération des profils
        const cmpsLst = this.LstCmpBase()
        // ajouter les items des cmps
        itemData = itemData.concat(cmpsLst)
        await this.actor.update({"system.idRace": itemData[0].id, "system.taille.value" : itemData[0].system.taille})
        return await this.actor.createEmbeddedDocuments("Item", itemData ).then((items) => {
          return items
        })
      case 'tribut':
        let listTribut = this.actor.items.filter(x => x.type == 'tribut')
        if(listRace.length> 0){
          //let listTributId =[]; listTribut.forEach(x => { listTributId.push(x.id)} )
          let listTributId = listTribut.map(x => x.id)
          await this.actor.deleteEmbeddedDocuments('Item',listTributId).then((items) => {
            this.actor.items.forEach(x => {
              if(x.type =='cmp'){
                let prof = x.system.profil
                if(prof == 'Force de la nature') prof = "forceNature"
                  else if(prof == 'Athlète') prof = "athlete"
                    else prof = prof.toLowerCase()
                  //x.system.score = refProfils[prof];
                  x.update({"system.score": refProfils[prof]})
              }
            })
            return items
          })
        }
        itemData = itemData instanceof Array ? itemData : [itemData];
        // ajout des competences manquantes et surtout augmentation de certaines
        return await this.actor.createEmbeddedDocuments("Item", itemData ).then((item) => { return item })
      case "path":
        return await Path.addToActor(this.actor, itemData);
      case "profile":
        return await Profile.addToActor(this.actor, itemData);
      case "species":
        return await Species.addToActor(this.actor, itemData);
      case "capacity":
        return await Capacity.addToActor(this.actor, itemData);
      default: {
        const itemId = itemData._id;

        // Faut-il déplacer ou copier l'item ?
        //let moveItem = game.settings.get("cof", "moveItem");
        let moveItem  = false
        // Récupération de l'actor d'origine
        let originalActorID = null;
        let originalActor = null;
        if (source.includes("Actor")) {
          originalActorID = source.split(".")[1];
          //originalActor = ActorDirectory.collection.get(originalActorID);
        }

        // Si l'item doit être déplacé ET qu'il n'est plus dans l'inventaire d'origine, affichage d'un message d'avertissement et on arrête le traitement
        if (moveItem && originalActor && !originalActor.items.get(itemData._id)) {
          //ui.notifications.warn(game.i18n.format("COF.notification.ItemNotInInventory", { itemName: itemData.name, actorName: originalActor.name }));
          return null;
        }

        // On force le nouvel Item a ne pas être équipé (notamment lors du transfert d'un inventaire à un autre)
        if (itemData.system.worn) itemData.system.worn = false;

        itemData = itemData instanceof Array ? itemData : [itemData];
        // Create the owned item
        return this.actor.createEmbeddedDocuments("Item", itemData).then((item) => {
          // Si il n'y as pas d'originalActor l'objet ne vient pas d'un autre acteur
          if (!originalActor) return item;

          // Si l'item doit être "move", on le supprime de l'actor précédent
          if (moveItem ^ shiftKey) {
            // if (!originalActor.token) {
            //   originalActor.deleteEmbeddedDocuments("Item", [itemId]);
            // } else {
            //   let token = TokenLayer.instance.placeables.find((token) => token.id === data.tokenId);
            //   let oldItem = token?.document.getEmbeddedCollection("Item").get(itemId);
            //   oldItem?.delete();
            // }
          }
        });
      }
    }
  }
  LstCmpBase() {
    // retourne la liste des id des compétences de base
    let lstCmpBase = game.items.filter(x => (x.type=='cmp' && x.folder.name == LESOUBLIES.options.cmp.RepertoireCmpBase))
    if(LESOUBLIES.options.cmp.InclureFermees) {
        lstCmpBase = lstCmpBase.filter(x => (! x.system.estFermmee) )
    }
    let lesCmpPresent = this.actor.items.filter(x => x.type == 'cmp')
    let NomCmpPresent = lesCmpPresent.map(x => x.name)
    lstCmpBase = lstCmpBase.filter(x => (! NomCmpPresent.includes(x.name)))
    return lstCmpBase
  }
}
