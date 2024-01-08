export function listCmp() {
    // retourne l'enesmble des nom des compétences dur répertoire donnee comme tel
    // ici "Compétences", a coder au niveau interface
    let acmp = game.items.filter(x => {return x.type == 'cmp' && x.folder?.name=="Compétences"})
    // mise au format hbs
    let b = { "":""}
    //let acmp2 = acmp.toSorted((a,b) => a.name > b.name)
    let acmp2 = acmp.sort()
    acmp2.forEach(i => { b[i.id]=i.name })
    return b;
}

export function listCmpBase() {
    // retourne l'enesmble des compétences dur répertoire donnee comme tel
    // ici "CmpBases", a coder au niveau interface
    let acmp = game.items.filter(x => {return x.type == 'cmp' && x.folder?.name=="CmpBases"})
    // mise au format hbs
    //let acmp2 = tabSkill.toSorted((a,b) => a.name > b.name)
    let acmp2 = acmp.sort()
    //acmp2.forEach(i => { b[i.id]=i.name })
    return acmp2;
}

export function AffecterProfils(){
    let profils = game.items.filter(x => x.type == 'profil')
    profils.forEach(x => {
        if(Array.isArray(x.system.arrayCmp)) {
            x.system.arrayCmp.forEach(y => {
                let i = game.items.get(y);
                i.update({ "system.profil" : x.name })
            })
        } else console.log("Erreur arrayCmp de "+x.name + " n'est pas un tableau")
    })
}

export function listEquipt() { //
    let acmp = game.items.filter(x => {return x.type == 'equipement' || x.type == 'arme' || x.type == 'armure'})
    // mise au format hbs
    let b = { "":""}
    //let acmp2 = acmp.toSorted((a,b) => a.name > b.name)
    let acmp2 = acmp.sort()
    acmp2.forEach(i => { b[i.id]=i.name })
    return b;
}

export function listPJ() {
    // retourne l'enesmble des nom des compétences dur répertoire donnee comme tel
    // ici "Compétences", a coder au niveau interface
    let acmp = game.actors.filter(x => x.type == "character")
    // mise au format hbs
    let b = { "":""}
    //let acmp2 = acmp.toSorted((a,b) => a.name > b.name)
    let acmp2 = acmp.sort()
    acmp2.forEach(i => { b[i.id]=i.name })
    return b;
}

export function listCmpMagiques(){
    let cmpMagie = game.items.filter(x => x.type == 'cmp' && x.system.estMagique)
    let b = { "":"" }
    let cmpMagie2 = cmpMagie.sort()
    cmpMagie2.forEach(i => { b[i.name]=i.name })
    return b
}
/**
 *
 * @param {*} obj objet contenant des entrées ayant un saut dans son chrono
 */
export function objNoReduce(obj) {
    let objEntries = Object.entries(obj)
    let lng = objEntries.length
    //if(obj[lng-1] != undefined)
    let ret = {}
    for(let i = 0; i < lng; i++) {
        ret[i] = objEntries[i][1]
    }
    return ret
}
export function strNoAccent(a) {
    return a.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }