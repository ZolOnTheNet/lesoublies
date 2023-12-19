import { listCmp } from "../utils.mjs";
/**
 * Extend the basic ItemSheet with some very simple modifications
 * @extends {ItemSheet}
 */
export class LesOubliesItemSheet extends ItemSheet {

  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["lesoublies", "sheet", "item"],
      width: 520,
      height: 480,
      dragDrop: [{dragSelector: null, dropSelector: ".droppable"}],
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "description" }]
    });
  }

  /** @override */
  get template() {
    const path = "systems/lesoublies/templates/item";
    // Return a single sheet for all item types.
    // return `${path}/item-sheet.html`;

    // Alternatively, you could use the following return statement to do a
    // unique item sheet by type, like `weapon-sheet.html`.
    return `${path}/item-${this.item.type}-sheet.html`;
  }

  /* -------------------------------------------- */

  /** @override */
  getData() {
    // Retrieve base data structure.
    const context = super.getData();

    // Use a safe clone of the item data for further operations.
    const itemData = context.item;

    // Retrieve the roll data for TinyMCE editors.
    context.rollData = {};
    let actor = this.object?.parent ?? null;
    if (actor) {
      context.rollData = actor.getRollData();
    }

    // Add the actor's data to context.data for easier access, as well as flags.
    context.system = itemData.system;
    context.flags = itemData.flags;
    // gestion des cas particulier des type d'items : une fonction pour chaque type
    switch(itemData.type) {
      case 'profil':
        this.#gestionCmp(context)
        break;
      case 'tribut':
        this.#gestionCmp(context)
        break;
    }
    return context;
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Everything below here is only needed if the sheet is editable
    if (!this.isEditable) return;
    html.find(".cmd").click(ev => this.cmd_item(ev, this.item));
    // Roll handlers, click handlers, etc. would go here.
  }
  /* -------------------------------------------- */

  /** @inheritDoc */
  async _onChangeInput(event) {
    await super._onChangeInput(event);
    switch(this.item.type) {
      case 'profil':
        if(! Array.isArray(this.item.system.arrayCmp)) context.system.arrayCmp = [ context.system.arrayCmp ]
        break;
      case 'tribut':
        if(! Array.isArray(this.item.system.arrayCmp)) context.system.arrayCmp = [ context.system.arrayCmp ]
        break;
    }
  }

  /**
   * Add support for drop data on Item sheets.
   */
  /** @inheritdoc */
  async _onDrop(event) {
    event.preventDefault();
    const data = TextEditor.getDragEventData(event); //ex :{ type: "Item", uuid: "Item.0JR5rtFV3dHZgVZ4" }
    console.log("Drop : ",event, data)
    if(this.item.type == 'profil') {
      if(this.item.system.arrayCmp == undefined) this.item.system.arrayCmp = []
      if(! Array.isArray(this.item.system.arrayCmp)) context.system.arrayCmp = [ context.system.arrayCmp ]
      let id = data.uuid.split(".")
      let itemD = game.items.get(id[1])
      if (itemD.type == 'cmp') {
        this.item.system.arrayCmp.push(id[1])
        this.render(true)
      }
    } else if(this.item.type == 'tribut') {
      if(this.item.system.arrayCmp == undefined) this.item.system.arrayCmp = []
      if(! Array.isArray(this.item.system.arrayCmp)) context.system.arrayCmp = [ context.system.arrayCmp ]
      let id = data.uuid.split(".")
      let itemD = game.items.get(id[1])
      if (itemD.type == 'cmp') {
        this.item.system.arrayCmp.push(id[1])
        this.render(true)
      }

    }
  }

  // _onDragStart(event){
  //   event.preventDefault();
  //   console.log("Start:",event);
  // }
  // _onDragOver(event){
  //   event.preventDefault();
  //   console.log("Over:",event);
  // }
  /* -------------------------------------------- */

    #gestionCmp(context){
    // cree une liste d'objets lié au paramètre de idcmp
    // context.lstCmps = []
    // context.array.forEach(element => {
    //   if(element != '') { // compoetence trouvé ?
    //     let cmpObj = game.items.get(element)
    //     if(cmpObj) {
    //       context.lstCmps.push(cmpObj.name)
    //     }
    //   }
    // });
    context.LstTotCmps = listCmp() // récupère la liste des compétences de "Compétences"
    // attention arrayCmp doit être un tableau
    if(! Array.isArray( context.system.arrayCmp)) context.system.arrayCmp = [ context.system.arrayCmp ]
    if( context.system.description == "") context.system.description =' '
  }

  cmd_item(ev, item) {
    //console.log("cmd-item",ev, actor)
    ev.preventDefault();
    const a = ev.currentTarget;
    const action = a.dataset.action;
    console.log("cmd-item",ev, action, this)
    // début des traitements
    let cmd = action.split('.')
    switch (cmd[0]){
      case 'profil':
      case 'tribut':
        switch(cmd[1]) {
          case 'add': // normalement il ya cmp en cmd[2]
            item.system.arrayCmp.push("")
            this.render(true)
            break
          case 'del':
            let ind = parseInt(cmd[3])
            const x = item.system.arrayCmp.splice(ind, ind);
            console.log("Le tableau vaut : ", item.system.arrayCmp)
            this.render(true)
        }
        break
      case 'ex':
        break
    }

  }
}
