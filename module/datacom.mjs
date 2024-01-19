/**
 * Classe de gestion des objets de dialogue
 */
export class DataCom extends Object {
    lstData = {} // le dictionnaire
    idCurr = 0 // denrier indice affecté
    nbData = 0 // nombre d'objet
    ttl = 7200 // time to live = 2h

    get getId() {
        return  Date.now()
    }

    get(id) { // lobjet lui même 
        return this.lstData[id]
    }

    add(obj) {
        let i = this.getId
        obj.id = i
        this.idCurr = i
        this.nbData++
        this.lstData[i] = obj
        return i
    }

    get getAll(){
        return deepClone(this.lstData)
    }

    purge(){
        let dnow = Date.nox()
        this.lstData.array.forEach(element => {
            if(dnow - element.id > this.ttl ){
                delete this.lstData[element.id]
                this.nbData--
            }
        });
    }

    isAId(id){
        let d = Date.now(); let s = d+""
        return Number.isnumeric(id) && s.substring(0,5) == d.substring(0,5) // les 5 premier chiffre devrait être identique car même année
    }

    isId(id){
        return this.lstData[id] != undefined
    }
}