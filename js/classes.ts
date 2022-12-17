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
        
        if ('display' in baseData) {
            this.display = baseData.display
        }
        if ('amount' in baseData) {
            this.amount = baseData.amount
        }
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
        return applyMultipliers(this.effect(this.level), this.getMultiplierList())
    }

    getXPGain() {
        return applySpeed(applyMultipliers(10, this.xpMultipliers))
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

    updateRow() {
        var row = document.getElementById(this.getID())
        var affected_obj = GameObject.objects[this.affects]
        
        row!.getElementsByClassName("level")[0].textContent = format(this.level)
        row!.getElementsByClassName("xpGain")[0].textContent = format(this.getXPGain())
        row!.getElementsByClassName("effect")[0].textContent = `${format(this.getEffect())}x ${affected_obj.getName()}`
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