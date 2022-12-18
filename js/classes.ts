class GameObject {
    static objects = {} as {[key in Progression]: GameObject}

    baseData: {[str: string]: any}
    type: Progression
    bonuses = {} as {[key in Progression]: (s: number, r: number) => number}
    multipliers = {} as {[key in Progression]: (s: number, r: number) => number}
    affects = {} as {[key in Progression]: (s: number, r: number) => number}
    amount = 0

    constructor(baseData: {[str: string]: any}) {
        this.baseData = baseData
        this.type = baseData.type
        if ('affects' in baseData) {
            this.affects = baseData.affects
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

    receiveMultiplier(source: Progression, effect: (sl: number, dl:number) => number) {
        this.multipliers[source] = effect
    }

    receiveBonus(source: Progression, effect: (sl: number, dl:number) => number) {
        this.bonuses[source] = effect
    }

    sendMultiplier(destination: Progression, effect: (sl: number, dl:number) => number) {
        GameObject.objects[destination].multipliers[this.type] = effect
    }

    sendXPMultiplier(destination: Progression, effect: (sl: number, dl:number) => number) {
        GameObject.objects[destination].multipliers[this.type] = effect
    }

    sendBonus(destination: Progression, effect: (sl: number, dl:number) => number) {
        GameObject.objects[destination].bonuses[this.type] = effect
    }

    calculateEffect(r: Progression): number {
        let reveiver_key = r as keyof typeof GameObject.objects
        let receiver = GameObject.objects[reveiver_key]
        return this.affects[r](this.amount, receiver.amount)
    }

    calculateMultipliers(multiplierMap = this.multipliers): number[] {
        var multipliers = [] as number[]
        for (let s in this.multipliers) {
            let source_key = s as keyof typeof GameObject.objects
            let source = GameObject.objects[source_key]
            let multiplier = multiplierMap[source_key](source.amount, this.amount)
            multipliers.push(multiplier)
        }
        return multipliers
    }

    update() {
        
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

    getFinalIncome() {
        return applyMultipliers(this.baseIncome, this.calculateMultipliers())
    }
 
    increaseAmount() {
        this.amount += applySpeed(this.getFinalIncome())
    }

    update() {
        this.increaseAmount()
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

class TraitObject extends GameObject {
    static traitObjects = {} as {[key in Trait]: TraitObject}

    baseMaxXP: number
    maxXP: number
    scaling: (l: number) => number

    xp = 0
    xpMultipliers = {} as {[key in Progression]: (s: number, r: number) => number}

    constructor(baseData: {[str: string] : any}) {
        super(baseData)
        this.baseMaxXP = baseData.maxXP
        this.maxXP = baseData.maxXP
        this.scaling = baseData.scaling
        TraitObject.traitObjects[this.type as Trait] = this
    }

    // Rework into map
    // getEffect(source: Progression) {
    //     return applyMultipliers(this.effects[source], this.calculateMultipliers())
    // }

    getXPGain() {
        return applySpeed(applyMultipliers(10, this.calculateMultipliers(this.xpMultipliers)))
    }

    updateXP() {
        this.xp += this.getXPGain()
    }

    updateLevel() {
        while (this.xp >= this.maxXP) {
            this.xp -= this.maxXP
            this.amount += 1
            this.maxXP = this.baseMaxXP * this.scaling(this.amount)
        }
    }

    updateRow() {
        var row = document.getElementById(this.getID())

        row!.getElementsByClassName("level")[0].textContent = format(this.amount)
        row!.getElementsByClassName("xpGain")[0].textContent = format(this.getXPGain())

        for (let r in this.affects) {
            let receiver_key = r as keyof typeof GameObject.objects
            let receiver = GameObject.objects[receiver_key]
            row!.getElementsByClassName("effect")[0].textContent = `${format(this.calculateEffect(receiver_key))}x ${receiver.getName()}`
        }

        row!.getElementsByClassName("xpLeft")[0].textContent = format(this.maxXP - this.xp)
        var bar = (row!.getElementsByClassName("progressFill")[0] as HTMLDivElement)
        bar.style.width = `${100 * this.xp / this.maxXP}%`
    }

    update() {
        this.updateXP()
        this.updateLevel()
        this.updateRow()
    }
}