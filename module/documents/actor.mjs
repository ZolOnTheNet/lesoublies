import { LESOUBLIES } from "../helpers/config.mjs";
import { strNoAccent } from "../utils.mjs"
/**
 * Extend the base Actor document by defining a custom roll data structure which is ideal for the Simple system.
 * @extends {Actor}
 */
export class LesOubliesActor extends Actor {

  /** @override */
  prepareData() {
    // Prepare data for the actor. Calling the super version of this executes
    // the following, in order: data reset (to clear active effects),
    // prepareBaseData(), prepareEmbeddedDocuments() (including active effects),
    // prepareDerivedData().
    super.prepareData();
  }

  /** @override */
  prepareBaseData() {
    // Data modifications in this step occur before processing embedded
    // documents or derived data.
  }

  /**
   * @override
   * Augment the basic actor data with additional dynamic data. Typically,
   * you'll want to handle most of your calculated/derived data in this step.
   * Data calculated in this step should generally not exist in template.json
   * (such as ability modifiers rather than ability scores) and should be
   * available both inside and outside of character sheets (such as if an actor
   * is queried and has a roll executed directly from it).
   */
  prepareDerivedData() {
    const actorData = this;
    const systemData = actorData.system;
    const flags = actorData.flags.lesoublies || {};

    // Make separate methods for each Actor type (character, npc, etc.) to keep
    // things organized.
    this._prepareCharacterData(actorData);
    this._prepareNpcData(actorData);
    /* Partie commune au deux */
    this._prepareData(actorData)
  }

  /**
   * Prepare Character type specific data
   */
  _prepareCharacterData(actorData) {
    if (actorData.type !== 'character') return;

    // Make modifications to data here. For example:
    const systemData = actorData.system;

    // METTRE ICI LES PROFILS CALCULER et LES CMP ?
    console.log("recacul des données acteurs")

    //const lesCmps = this.items.filter(x => x.type=='cmp')
    

    // Loop through ability scores, and add their modifiers to our sheet output.
    // for (let [key, ability] of Object.entries(systemData.abilities)) {
    //   // Calculate the modifier using d20 rules.
    //   ability.mod = Math.floor((ability.value - 10) / 2);
    // }
  }

  /**
   * Prepare NPC type specific data.
   */
  _prepareNpcData(actorData) {
    if (actorData.type !== 'npc') return;

    // Make modifications to data here. For example:
    const systemData = actorData.system;
    systemData.xp = (systemData.cr * systemData.cr) * 100;
  }

  _prepareData(actorData){
    const systemData = actorData.system;
    let initItem = this.items.getName("Rapidité")
    let race = undefined
    if(actorData.system.idRace == '') { 
      race = this.items.filter(x => x.type == 'race')
      race = race[0]
      actorData.system.idRace = race.id
    } else {
      race = this.items.get(actorData.idRace)
    }
    let bonusRapidite = 0
    if(race) {
      bonusRapidite = parseInt(race.system.profils.athlete) // la race peut influencer Rapidité
    }
    if(initItem == undefined) initItem = this.items.getName("Rapidite") // si la compétence Rapidité ou Rapidite existe alors on l'utilise
    if(initItem) {
      systemData.init = initItem.system.score + bonusRapidite
    } else {
      systemData.init = 0
    }
    if(systemData.autoDialog == undefined) systemData.autoDialog = false
  }

  /**
   * Override getRollData() that's supplied to rolls.
   */
  getRollData() {
    const data = super.getRollData();

    // Prepare character roll data.
    this._getCharacterRollData(data);
    this._getNpcRollData(data);

    return data;
  }

  /**
   * Prepare character roll data.
   */
  _getCharacterRollData(data) {
    if (this.type !== 'character') return;
    // recopie au niveau system tout l'ensemble des compétences 
    const raceProfil = this.items.filter(x => x.type == 'race')
    let probase = { "artiste":0, "athlete":0, "chasseur": 0, "faiseur": 0, "forceNature" :0, "guerrier" : 0, "mystique" : 0,  "ombre" : 0,  "savant" : 0 }
    if(raceProfil) {
      probase = raceProfil[0].system.profils
      for (let [k, v] of Object.entries(probase)) { probase[k] = parseInt(v) } 
    }
    const cmp = this.items.filter(x => x.type == 'cmp')
    // recopie sans accents (sinon @ ne fonctionne pas !)
    cmp.forEach(x => { data[strNoAccent(x.name)]=x.system.score + probase[LESOUBLIES.profilsInv[x.system.profil]] })
    // Add level for easier access, or fall back to 0.
  //   if (data.attributes.level) {
  //     data.lvl = data.attributes.level.value ?? 0;
  //   }
    console.log("RollData", data)
  }

  /**
   * Prepare NPC roll data.
   */
  _getNpcRollData(data) {
    if (this.type !== 'npc') return;
    const cmp = this.items.filter(x => x.type == 'cmp') // pas de cumul avec autre chose que l'item
    cmp.forEach(x => { data[strNoAccent(x.name)]=x.system.score })
    // Process additional NPC data here.
  }

}