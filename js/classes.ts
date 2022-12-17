class GameObject {
    static objects = {} as {[key in Resource | Trait]: GameObject}

    baseData: {[str: string]: any}
    type: Resource | Trait
    bonuses = []
    multipliers = {} as {[key in Resource | Trait]: number}
    constructor(baseData: {[str: string]: any}) {
        this.baseData = baseData
        this.type = baseData.type
        GameObject.objects[this.type] = this
    }

    getName() {
        return this.type.charAt(0).toUpperCase() + this.type.slice(1).toLowerCase()
    }

    getID() {
        return this.type.toLowerCase()
    }

    updateMultiplier(source: Resource | Trait, value: number) {
        this.multipliers[source] = value
    }

    getMultiplierList(): number[] {
        return Object.values(this.multipliers)
    }

    update() {
        
    }
}

class ResourceObject extends GameObject {
    static resourceObjects = {} as {[key in Resource]: ResourceObject}

    baseIncome: number
    amount = 0

    display?: (amount: number) => void

    constructor(baseData: {[str: string]: any}) {
        super(baseData)
        this.baseIncome = baseData.baseIncome
        ResourceObject.resourceObjects[this.type as Resource] = this
    }

    getIncome() {
        return applyMultipliers(this.baseIncome, this.getMultiplierList())
    }
 
    increaseAmount() {
        this.amount += applySpeed(this.getIncome())
    }

    update() {
        this.increaseAmount()
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
    affects: Trait | Resource
    effect: (l: number) => number
    scaling: (l: number) => number

    level = 0
    xp = 0
    xpMultipliers = []

    constructor(baseData: {[str: string] : any}) {
        super(baseData)
        this.baseMaxXP = baseData.maxXP
        this.maxXP = baseData.maxXP
        this.affects = baseData.affects
        this.effect = baseData.effect
        this.scaling = baseData.scaling
        TraitObject.traitObjects[this.type as Trait] = this
    }

    getEffect() {
        return this.effect(this.level)
    }

    getXPGain() {
        return applyMultipliers(10, this.xpMultipliers)
    }

    updateXP() {
        this.xp += this.getXPGain()
    }

    updateLevel() {
        while (this.xp >= this.maxXP) {
            this.xp -= this.maxXP
            this.level += 1
            this.maxXP = this.baseMaxXP * this.scaling(this.level)
        }
    }

    update() {
        this.updateXP()
        this.updateLevel()
    }
}