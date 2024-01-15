import { LESOUBLIES } from "../helpers/config.mjs";
import { ajouterLstTxt, enleverLstTxt, listCmp, listCmpMagiques, listEquipt, listPJ, objNoReduce, toArrayLstTxt, toLstObjPrime } from "../utils.mjs";
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
    context.type = itemData.type
    // gestion des cas particulier des type d'items : une fonction pour chaque type
    switch(itemData.type) {
      case 'arme':
        context.lstCmp = listCmp()
        context.lstAction = LESOUBLIES.actions
        context.lstPrimes = toLstObjPrime(LESOUBLIES.primes)
        context.lstPenalites = toLstObjPrime(LESOUBLIES.penalites)
        let lstP = toArrayLstTxt(itemData.system.lstPenalites)
        let ob = {}; lstP.forEach(x => { ob[x] = LESOUBLIES.penalites[x].label })
        context.Penalites = ob
        lstP = toArrayLstTxt(itemData.system.lstPrimes)
        ob = {}; lstP.forEach(x => { ob[x] = LESOUBLIES.primes[x].label })
        context.Primes = ob
        context.selectPrime = "acceleration"
        context.selectPenalite = "abandon"
        break
      case 'compagnie':
        context.LstPJ = listPJ()
        break
      case 'metier':
        this.#gestionCmp(context)
        context.LstEquipmt = listEquipt()
        context.LstCmpMagie = listCmpMagiques()
        break;
      case 'profil':
        this.#gestionCmp(context)
        break;
      case 'tribut':
        this.#gestionCmp(context)
        break;
      case 'sort':
        context.LstSongeCauch={ 0:"Cauchemard", 1:"Songe"}
        context.LstCmpMagie = listCmpMagiques()
        break
    }
    if( context.system.description == "") context.system.description =' '
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
    switch(this.item.type) { // Gestion champs tableau (car si une seule valeur considérer comme 1 champ)
      case 'profil':
        if(! Array.isArray(this.item.system.arrayCmp)) context.system.arrayCmp = [ context.system.arrayCmp ]
        break;
      case 'compagnie':
        if(! Array.isArray(this.item.system.personnages)) context.system.personnages = [ context.system.personnages ]
        break;
      case 'tribut':
        //if(! Array.isArray(this.item.system.arrayCmp)) context.system.arrayCmp = [ context.system.arrayCmp ]
        break;
    }
  }

  /**
   * Add support for drop data on Item sheets.
   * note : sous FireFox, le point d'arrêt obtient un data vide !
   */
  /** @inheritdoc */
  async _onDrop(event) {
    event.preventDefault();
    const data = TextEditor.getDragEventData(event); //ex :{ type: "Item", uuid: "Item.0JR5rtFV3dHZgVZ4" }
    console.log("Drop : ",event, data)
    let id; let itemD;
    switch(this.item.type) {
      case 'profil':
        if(this.item.system.arrayCmp == undefined) this.item.system.arrayCmp = []
        if(! Array.isArray(this.item.system.arrayCmp)) context.system.arrayCmp = [ context.system.arrayCmp ]
        id = data.uuid.split(".")
        itemD = game.items.get(id[1])
        if (itemD.type == 'cmp') {
          this.item.system.arrayCmp.push(id[1])
          this.render(true)
        }
        break
      case 'tribut':
        id = data.uuid.split(".")
        itemD = game.items.get(id[1])
        if (itemD.type == 'cmp') {
          this.item.system.objCmp[""+Object.entries(this.item.system.objCmp).length] ={"id": id[1], "value":0, "domaine":"" }
          this.render(true)
        }
        break
      case 'metier':
        id = data.uuid.split(".")
        itemD = game.items.get(id[1])
        if (itemD.type == 'cmp') {
          this.item.system.objCmp[""+Object.entries(this.item.system.objCmp).length] ={"id": id[1], "value":0, "domaine":"" }
          this.render(true)
        }else if(itemD.type == 'equipement') {
          this.item.system.equipements[""+Object.entries(this.item.system.equipements).length] ={"id": id[1], "value":1 }
          this.render(true)
        }
        break
      case 'compagnie':
      if(this.item.system.personnages == undefined) this.item.system.personnages = []
      if(! Array.isArray(this.item.system.personnages)) context.system.personnages = [ context.system.personnages ]
      id = data.uuid.split(".")
      itemD = game.actors.get(id[1])
      if (itemD.type == 'character') { // a tester si character ou actor
        this.item.system.personnages.push(id[1])
        this.render(true)
      }
      break
    }
  }

  /* -------------------------------------------- */

  #gestionCmp(context){
    context.LstTotCmps = listCmp() // récupère la liste des compétences de "Compétences"
    // attention arrayCmp doit être un tableau
    if(context.type == 'profil' && (! Array.isArray( context.system.arrayCmp))) context.system.arrayCmp = [ context.system.arrayCmp ]
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
      case 'arme':
        let champ = "lst"+cmd[2]+"s"; let ret = ""
        if(cmd[1]=="add"){
          const f = $(a).parents('form');
          let val = f?.find('[name="select'+ cmd[2]+'"]').val()
          ret = ajouterLstTxt(val, this.item.system[champ]);
        } else if(cmd[1]=='del') { //arme.dell.Penalite.{{key}}
          ret = enleverLstTxt(cmd[3],this.item.system[champ])
        }
        champ = "system."+champ
        let objUdp = {}; objUdp[champ] = ret
        this.item.update(objUdp)

        //console.log(cmd)
        break
      case 'profil':
        switch(cmd[1]) {
          case 'add': // normalement il ya cmp en cmd[2]
            item.system.arrayCmp.push("")
            this.render(true)
            break
          case 'del':
            let ind = parseInt(cmd[3])
            const x = item.system.arrayCmp.splice(ind, ind+1);
            console.log("Le tableau vaut : ", item.system.arrayCmp)
            this.render(true)
        }
        break;
      case 'tribut':
        switch(cmd[1]) {
          case 'add': // normalement il ya cmp en cmd[2] Rem : Object.entries(context.system.objCmp).length
            let lng = Object.entries(item.system.objCmp).length
            item.system.objCmp[""+lng] = {"id":"", "value":0, "domaine":"" }
            this.render(true)
            break
          case 'del':
            let ind = parseInt(cmd[3])
            const x = delete item.system.objCmp[""+ind];
            item.system.objCmp = objNoReduce(item.system.objCmp)
            item.update({ "system.objCmp": item.system.objCmp})
            this.render(true)
        }
        break
      case 'metier':
        switch(cmd[2]) {
          case "equip":
            switch(cmd[1]) {
              case 'add': // normalement il ya cmp en cmd[2] Rem : Object.entries(context.system.objCmp).length
                let lng = Object.entries(item.system.equipements).length
                item.system.equipements[""+lng] = {"id":"", "value":1 }
                this.render(true)
                break
              case 'del':
                let ind = parseInt(cmd[3])
                const x = delete item.system.equipements[""+ind];
                item.update({ "system.equipements": item.system.equipements})
                console.log("Le tableau vaut : ", item.system.equipements)
                this.render(true)
            }
            break;
          case "cmp":
            switch(cmd[1]) {
              case 'add': // normalement il ya cmp en cmd[2] Rem : Object.entries(context.system.objCmp).length
                let lng = Object.entries(item.system.objCmp).length
                item.system.objCmp[""+lng] = {"id":"", "value":0, "domaine":"" }
                this.render(true)
                break
              case 'del':
                let ind = parseInt(cmd[3])
                const x = delete item.system.objCmp[""+ind];
                //recontruire l'objet (pour éliminer le saut)
                item.update({ "system.objCmp": item.system.objCmp})
                this.render(true)
            }
            break;
        }
        break
      case 'compagnie':
        switch(cmd[2]) {
          case "membre": //personnages
            switch(cmd[1]) {
              case 'add': // normalement il ya cmp en cmd[2] Rem : Object.entries(context.system.objCmp).length
              if(! Array.isArray(this.item.system.personnages)) this.item.system.personnages = [ this.item.system.personnages ]
              item.system.personnages.push("")
              this.render(true)
              break
            case 'del':
              let ind = parseInt(cmd[3])
              const x = item.system.personnages.splice(ind, ind+1);
              this.render(true)
               }
            break;
        }
        break
    }
  }
}
