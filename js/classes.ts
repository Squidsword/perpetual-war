interface XPObject {
    xpMultipliers: {[key in Progression]: (s: number, r: number) => number}
    receiveXpMultiplier(source: Progression, effect: (s: number, r:number) => number): void
}

function instanceOfXP(object: any): object is XPObject {
    return 'receiveXpMultiplier' in object
}

class Requirement {
    type: Progression
    threshold: number

    constructor(type: Progression, threshold: number) {
        this.type = type
        this.threshold = threshold
    }

    isSatisfied() {
        return objects[this.type].amount >= this.threshold
    }

}

class GameObject {
    baseData: {[str: string]: any}
    type: Progression
    bonuses = {} as {[key in Progression]: (s: number, r: number) => number}
    multipliers = {} as {[key in Progression]: (s: number, r: number) => number}
    affects = {} as {[key in Progression]: (s: number, r: number) => number}
    xpAffects = {} as {[key in Progression]: (s: number, r: number) => number}
    requirements = [] as Requirement[]
    amount = 0

    constructor(baseData: {[str: string]: any}) {
        this.baseData = baseData
        this.type = baseData.type
        if ('bonuses' in baseData) {
            this.bonuses = baseData.bonuses
        }
        if ('requirements' in baseData) {
            this.requirements = baseData.requirements
        }
        if ('affects' in baseData) {
            this.affects = baseData.affects
        }
        if ('xpAffects' in baseData) {
            this.xpAffects = baseData.xpAffects
        }
        if ('amount' in baseData) {
            this.amount = baseData.amount
        }
    }

    setFunctions(baseData: {[str: string]: any}) {
        if ('bonuses' in baseData) {
            this.bonuses = baseData.bonuses
        }
        if ('requirements' in baseData) {
            this.requirements = baseData.requirements
        }
        if ('affects' in baseData) {
            this.affects = baseData.affects
        }
        if ('xpAffects' in baseData) {
            this.xpAffects = baseData.xpAffects
        }

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
        objects[receiverKey].receiveMultiplier(this.type, effect)
    }

    sendXpMultiplier(receiverKey: Progression, effect: (sl: number, dl:number) => number) {
        let receiver = objects[receiverKey]
        if (instanceOfXP(receiver)) {
            receiver.receiveXpMultiplier(this.type, effect)
        }
    }

    sendAllMultipliers() {
        for (let r in this.affects) {
            let receiverKey = r as keyof typeof objects
            this.sendMultiplier(receiverKey, this.affects[receiverKey])
        }
        for (let r in this.xpAffects) {
            let receiverKey = r as keyof typeof objects
            this.sendXpMultiplier(receiverKey, this.xpAffects[receiverKey])
        }
    }

    sendBonus(destination: Progression, effect: (sl: number, dl:number) => number) {
        objects[destination].bonuses[this.type] = effect
    }

    calculateEffect(r: Progression): number {
        let reveiver_key = r as keyof typeof objects
        let receiver = objects[reveiver_key]
        return this.affects[r](this.getEffectiveAmount(), receiver.amount)
    }

    calculateMultipliers(multiplierMap = this.multipliers): number[] {
        var multipliers = [] as number[]
        for (let s in multiplierMap) {
            let source_key = s as keyof typeof objects
            let source = objects[source_key]
            let multiplier = multiplierMap[source_key](source.getEffectiveAmount(), this.amount)
            multipliers.push(multiplier)
        }
        return multipliers
    }

    isUnlocked() {
        for (let r of this.requirements) {
            if (!r.isSatisfied()) {
                return false
            }
        }
        return true
    }

    update() {
        this.sendAllMultipliers()
    }
}

class ResourceObject extends GameObject {
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
        var HTML_display = document.getElementById(`${this.getID()}Display`)
        if (HTML_display) {
            if (this.isUnlocked()) {
                HTML_display.style.display = ""
            } else {
                HTML_display.style.display = "none"
            }
        }
        if (this.display) {
            this.display(this.amount)
            return
        }
        var HTML = document.getElementById(this.getID())
        if (HTML == null) {
            return
        }
        HTML.textContent = format(this.amount)
    }
}

class TraitObject extends GameObject implements XPObject {
    baseMaxXp: number
    maxXp: number
    scaling: (l: number) => number

    xp = 0
    xpMultipliers = {} as {[key in Progression]: (s: number, r: number) => number}
    selected = false
    constructor(baseData: {[str: string] : any}) {
        super(baseData)
        this.baseMaxXp = baseData.maxXp
        this.maxXp = baseData.maxXp
        this.scaling = baseData.scaling
    }

    getXpGain() {
        return applyMultipliers(10, this.calculateMultipliers(this.xpMultipliers))
    }

    receiveXpMultiplier(source: Progression, effect: (s: number, r: number) => number): void {
        this.xpMultipliers[source] = effect
    }

    select() {
        this.selected = true
    }

    isSelected() {
        return this.selected
    }

    updateXp() {
        if (this.isSelected()) {
            this.xp += applySpeed(this.getXpGain())
        }
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

        if (this.isUnlocked()) {
            row!.style.display = ""
        }

        row!.getElementsByClassName("level")[0].textContent = format(this.amount)
        row!.getElementsByClassName("xpGain")[0].textContent = format(this.getXpGain())

        for (let r in this.affects) {
            let receiver_key = r as keyof typeof objects
            let receiver = objects[receiver_key]
            row!.getElementsByClassName("effect")[0].textContent = `${format(this.calculateEffect(receiver_key), 1)}x ${receiver.getName()}`
        }

        row!.getElementsByClassName("xpLeft")[0].textContent = format(this.maxXp - this.xp)
        var bar = (row!.getElementsByClassName("progressFill")[0] as HTMLDivElement)
        bar.style.width = `${100 * this.xp / this.maxXp}%`
        if (this.isSelected()) {
            bar.classList.add('selected')
        } else {
            bar.classList.remove('selected')
        }
    }

    update() {
        if (this.isUnlocked()) {
            super.update()
            this.updateXp()
            this.updateLevel()
        }
        this.updateRow()
    }
}