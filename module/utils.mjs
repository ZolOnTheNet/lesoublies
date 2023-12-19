export function listCmp() {
    // retourne l'enesmble des nom des compétences dur répertoire donnee comme tel
    // ici "Compétences", a coder au niveau interface
    let acmp = game.items.filter(x => {return x.type == 'cmp' && x.folder?.name=="Compétences"})
    // mise au format hbs
    let b = { "":""}
    let acmp2 = acmp.toSorted((a,b) => a.name > b.name)
    acmp2.forEach(i => { b[i.id]=i.name })
    return b;
}

export function listCmpBase() {
    // retourne l'enesmble des compétences dur répertoire donnee comme tel
    // ici "CmpBases", a coder au niveau interface
    let acmp = game.items.filter(x => {return x.type == 'cmp' && x.folder?.name=="CmpBases"})
    // mise au format hbs
    let acmp2 = tabSkill.toSorted((a,b) => a.name > b.name)
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