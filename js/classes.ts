interface XPObject {
    xpMultipliers: {[key in Progression]: (s: number, r: number) => number}
    receiveXpMultiplier(source: Progression, effect: (s: number, r:number) => number): void
}

function instanceOfXP(object: any): object is XPObject {
    return 'receiveXpMultiplier' in object
}

class GameObject {
    static objects = {} as {[key in Progression]: GameObject}

    baseData: {[str: string]: any}
    type: Progression
    bonuses = {} as {[key in Progression]: (s: number, r: number) => number}
    multipliers = {} as {[key in Progression]: (s: number, r: number) => number}
    affects = {} as {[key in Progression]: (s: number, r: number) => number}
    xpAffects = {} as {[key in Progression]: (s: number, r: number) => number}
    amount = 0

    constructor(baseData: {[str: string]: any}) {
        this.baseData = baseData
        this.type = baseData.type
        if ('affects' in baseData) {
            this.affects = baseData.affects
        }
        if ('xpAffects' in baseData) {
            this.xpAffects = baseData.xpAffects
        }
        if ('amount' in baseData) {
            this.amount = baseData.amount
        }
        GameObject.objects[this.type] = this
    }

    getName() {
        return this.type.charAt(0).toUpperCase() + this.type.slice(1).toLowerCase()
    }

    getID() {
        return this.type.toLowerCase()
    }

    getEffectiveAmount() {
        return applyMultipliers(this.amount, this.calculateMultipliers())
    }

    receiveMultiplier(sourceKey: Progression, effect: (sl: number, dl:number) => number) {
        this.multipliers[sourceKey] = effect
    }

    receiveBonus(sourceKey: Progression, effect: (sl: number, dl:number) => number) {
        this.bonuses[sourceKey] = effect
    }

    sendMultiplier(receiverKey: Progression, effect: (sl: number, dl:number) => number) {
        GameObject.objects[receiverKey].receiveMultiplier(this.type, effect)
    }

    sendXpMultiplier(receiverKey: Progression, effect: (sl: number, dl:number) => number) {
        let receiver = GameObject.objects[receiverKey]
        if (instanceOfXP(receiver)) {
            receiver.receiveXpMultiplier(this.type, effect)
        }
    }

    sendAllMultipliers() {
        for (let r in this.affects) {
            let receiverKey = r as keyof typeof GameObject.objects
            this.sendMultiplier(receiverKey, this.affects[receiverKey])
        }
        for (let r in this.xpAffects) {
            let receiverKey = r as keyof typeof GameObject.objects
            this.sendXpMultiplier(receiverKey, this.xpAffects[receiverKey])
        }
    }

    sendBonus(destination: Progression, effect: (sl: number, dl:number) => number) {
        GameObject.objects[destination].bonuses[this.type] = effect
    }

    calculateEffect(r: Progression): number {
        let reveiver_key = r as keyof typeof GameObject.objects
        let receiver = GameObject.objects[reveiver_key]
        return this.affects[r](this.getEffectiveAmount(), receiver.amount)
    }

    calculateMultipliers(multiplierMap = this.multipliers): number[] {
        var multipliers = [] as number[]
        for (let s in multiplierMap) {
            let source_key = s as keyof typeof GameObject.objects
            let source = GameObject.objects[source_key]
            let multiplier = multiplierMap[source_key](source.getEffectiveAmount(), this.amount)
            multipliers.push(multiplier)
        }
        return multipliers
    }

    update() {
        this.sendAllMultipliers()
    }
}

class ResourceObject extends GameObject {
    static resourceObjects = {} as {[key in Resource]: ResourceObject}

    baseIncome: number
    display?: (amount: number) => void

    constructor(baseData: {[str: string]: any}) {
        super(baseData)
        this.baseIncome = baseData.baseIncome
        
        if ('display' in baseData) {
            this.display = baseData.display
        }
        if ('amount' in baseData) {
            this.amount = baseData.amount
        }
        ResourceObject.resourceObjects[this.type as Resource] = this
    }

    getBonus() {

    }

    getEffectiveAmount() {
        return this.amount
    }

    getFinalIncome() {
        return applyMultipliers(this.baseIncome, this.calculateMultipliers())
    }
 
    increaseAmount() {
        this.amount += applySpeed(this.getFinalIncome())
    }

    update() {
        super.update()
        this.increaseAmount()
        this.sendAllMultipliers()
        this.updateDisplay()
    }

    updateDisplay() {
        if (this.display) {
            this.display(this.amount)
            return
        }
        var HTML_display = document.getElementById(this.getID())
        if (HTML_display == null) {
            return
        }
        HTML_display.textContent = format(this.amount)
    }
}

class TraitObject extends GameObject implements XPObject {
    static traitObjects = {} as {[key in Trait]: TraitObject}

    baseMaxXp: number
    maxXp: number
    scaling: (l: number) => number

    xp = 0
    xpMultipliers = {} as {[key in Progression]: (s: number, r: number) => number}

    constructor(baseData: {[str: string] : any}) {
        super(baseData)
        this.baseMaxXp = baseData.maxXp
        this.maxXp = baseData.maxXp
        this.scaling = baseData.scaling
        TraitObject.traitObjects[this.type as Trait] = this
    }

    getXpGain() {
        return applyMultipliers(10, this.calculateMultipliers(this.xpMultipliers))
    }

    receiveXpMultiplier(source: Progression, effect: (s: number, r: number) => number): void {
        this.xpMultipliers[source] = effect
    }

    updateXp() {
        this.xp += applySpeed(this.getXpGain())
    }

    updateLevel() {
        while (this.xp >= this.maxXp) {
            this.xp -= this.maxXp
            this.amount += 1
            this.maxXp = this.baseMaxXp * this.scaling(this.amount)
        }
    }

    updateRow() {
        var row = document.getElementById(this.getID())

        row!.getElementsByClassName("level")[0].textContent = format(this.amount)
        row!.getElementsByClassName("xpGain")[0].textContent = format(this.getXpGain(), 1)

        for (let r in this.affects) {
            let receiver_key = r as keyof typeof GameObject.objects
            let receiver = GameObject.objects[receiver_key]
            row!.getElementsByClassName("effect")[0].textContent = `${format(this.calculateEffect(receiver_key), 1)}x ${receiver.getName()}`
        }

        row!.getElementsByClassName("xpLeft")[0].textContent = format(this.maxXp - this.xp)
        var bar = (row!.getElementsByClassName("progressFill")[0] as HTMLDivElement)
        bar.style.width = `${100 * this.xp / this.maxXp}%`
    }

    update() {
        super.update()
        this.updateXp()
        this.updateLevel()
        this.updateRow()
    }
}