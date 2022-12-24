class Requirement {
    type: Progression
    threshold: number

    constructor(type: Progression, threshold: number) {
        this.type = type
        this.threshold = threshold
    }

    isSatisfied() {
        return objects[this.type].getValue() >= this.threshold
    }

}

class RequirementList {
    requirements: Requirement[]

    constructor(requirements: Requirement[] = []) {
        this.requirements = requirements
    }

    isUnlocked() {
        for (let r of this.requirements) {
            if (!r.isSatisfied()) {
                return false
            }
        }
        return true
    }
}

class Effect {
    source: Progression
    receivers: Progression[]
    requirements: RequirementList
    effectType: EffectType
    additive?: (value: number, effectiveValue: number) => number
    multiplicative?: (value: number, effectiveValue: number) => number
    exponential?: (value: number, effectiveValue: number) => number

    constructor(source: Progression, receivers: Progression[], baseData: {
        requirements?: RequirementList,
        effectType: EffectType,
        additive?: (value: number, effectiveValue: number) => number,
        multiplicative?: (value: number, effectiveValue: number) => number,
        exponential?: (value: number, effectiveValue: number) => number
    }) {
        this.source = source
        this.receivers = receivers
        this.requirements = baseData.requirements ? baseData.requirements : new RequirementList()
        this.effectType = baseData.effectType
        this.additive = baseData.additive
        this.multiplicative = baseData.multiplicative
        this.exponential = baseData.exponential
    }

    setSource(key: Progression) {
        this.source = key
    }

    setReceivers(keys: Progression[]) {
        this.receivers = keys
    }

    constant() {
        if (this.additive == undefined) {
            return 0
        }
        let src = objects[this.source]
        return this.additive(src.getValue(), src.getEffectiveValue())
    }

    scalar() {
        if (this.multiplicative == undefined) {
            return 1
        }
        let src = objects[this.source]
        return this.multiplicative(src.getValue(), src.getEffectiveValue())
    }

    power() {
        if (this.exponential == undefined) {
            return 1
        }
        let src = objects[this.source]
        return this.exponential(src.getValue(), src.getEffectiveValue())
    }

    description() {
        let description = ``
        if (this.additive) {
            description += `+${format(this.constant(), 2)} ${objects[this.receivers[0]].getName()}`
        }
        if (this.multiplicative) {
            description += `x${format(this.scalar(), 2)} ${objects[this.receivers[0]].getName()}`
        }
        if (this.exponential) {
            description += `^${format(this.power(), 3)} ${objects[this.receivers[0]].getName()}`
        }
        return description
    }

}

class AffectMap {
    affects: {[key in Progression]: Effect}

    constructor(affects = {} as {[key in Progression]: Effect}) {
        this.affects = affects
    }

    setAffect(key: Progression, effect: Effect) {
        this.affects[key] = effect
    }

    getAffect(key: Progression) {
        return this.affects[key]
    }

}

class EffectMap {
    effects: {[key in Progression]: Effect}

    constructor(effects = {} as {[key in Progression]: Effect}) {
        this.effects = effects
    }

    setEffect(key: Progression, effect: Effect) {
        this.effects[key] = effect
    }

    getEffect(key: Progression) {
        return this.effects[key]
    }

    applyAdditive(value: number, type: EffectType) {
        for (let e in this.effects) {
            let effectKey = e as Progression
            let effect = this.effects[effectKey]
            if (effect.requirements.isUnlocked() && effect.effectType == type) {
                value += effect.constant()
            }
        }
        return value
    }

    applyMultiplicative(value: number, type: EffectType) {
        for (let e in this.effects) {
            let effectKey = e as Progression
            let effect = this.effects[effectKey]
            if (effect.requirements.isUnlocked() && effect.effectType == type) {
                value *= effect.scalar()
            }
        }
        return value
    }

    applyExponential(value: number, type: EffectType) {
        for (let e in this.effects) {
            let effectKey = e as Progression
            let effect = this.effects[effectKey]
            if (effect.requirements.isUnlocked() && effect.effectType == type) {
                value = Math.pow(value, effect.power())
            }
        }
        return value
    }

    applyEffects(value = 0, type: EffectType) {
        value = this.applyAdditive(value, type)
        value = this.applyMultiplicative(value, type)
        value = this.applyExponential(value, type)
        return value
    }
}

class GameEvent {

}

abstract class GameObject {
    type: Progression
    requirements: RequirementList
    effectMap: EffectMap
    affectMap: AffectMap

    constructor(baseData: {
        type: Progression,
        requirements?: RequirementList,
    }) {
        this.type = baseData.type
        this.requirements = baseData.requirements ? baseData.requirements : new RequirementList()
        this.effectMap = new EffectMap()
        this.affectMap = new AffectMap()
    }

    getName() {
        return this.type.toLowerCase().split('_').filter(x => x.length > 0).map(x => (x.charAt(0).toUpperCase() + x.slice(1))).join(" ")
    }

    getID() {
        return this.type.toLowerCase()
    }

    sendAffect(receiverKey: Progression, effect: Effect) {
        this.affectMap.setAffect(receiverKey, effect)
        objects[receiverKey].effectMap.setEffect(this.type, effect)
    }

    applyEffects(value = 0, type: EffectType) {
        return this.effectMap.applyEffects(value, type)
    }

    isUnlocked() {
        return this.requirements.isUnlocked()
    }

    abstract update(): void

    abstract load(copyObj: any): void

    abstract getValue(): number

    abstract getEffectiveValue(): number
}

class ResourceObject extends GameObject {
    baseIncome: number
    amount: number
    display?: (amount: number) => void

    constructor(baseData: {
        type: Progression,
        requirements?: RequirementList,
        affects?: EffectMap,
        baseIncome?: number,
        amount?: number, 
        display?: (amount: number) => void
    }) {
        super(baseData)
        this.baseIncome = baseData.baseIncome ? baseData.baseIncome : 0
        this.amount = baseData.amount ? baseData.amount : 0
        this.display = baseData.display
    }

    update() {
        this.increaseAmount()
        this.updateDisplay()
    }

    getValue(): number {
        return this.amount
    }

    getEffectiveValue(): number {
        return this.amount
    }

    getIncome(): number {
        return this.applyEffects(this.baseIncome, EffectType.Speed)
    }
 
    increaseAmount() {
        this.amount += applySpeed(this.getIncome())
    }

    load(copyObj: any): void {
        this.amount = copyObj.amount
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

class LevelObject extends GameObject {
    baseMaxXp: number
    scaling: (l: number) => number

    level: number
    xp: number
    maxXp: number
    selected = false
    constructor(baseData: {
        type: Progression,
        level?: number
        xp?: number
        requirements?: RequirementList,
        affects?: EffectMap,
        maxXp: number,
        scaling: (l: number) => number
    }) {
        super(baseData)
        this.level = baseData.level ? baseData.level : 0
        this.xp = baseData.xp ? baseData.xp : 0
        this.baseMaxXp = baseData.maxXp
        this.maxXp = baseData.maxXp
        this.scaling = baseData.scaling
    }

    update() {
        if (this.isUnlocked()) {
            this.updateXp()
            this.updateLevel()
        }
        this.updateRow()
    }

    getXpGain(): number {
        return this.applyEffects(10, EffectType.Speed)
    }

    getValue(): number {
        return this.level
    }

    getEffectiveValue(): number {
        return this.applyEffects(this.level, EffectType.Power)
    }

    select() {
        this.selected = true
    }

    isSelected(): boolean {
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
            this.level += 1
            this.maxXp = this.baseMaxXp * this.scaling(this.level)
        }
    }

    updateRow() {
        var row = document.getElementById(this.getID())

        if (this.isUnlocked()) {
            row!.style.display = ""
        }

        row!.getElementsByClassName("level")[0].textContent = format(this.level)
        row!.getElementsByClassName("xpGain")[0].textContent = format(this.getXpGain())

        for (let r in this.affectMap.affects) {
            let receiverKey = r as keyof typeof objects
            row!.getElementsByClassName("effect")[0].textContent = `${this.affectMap.getAffect(receiverKey).description()}`
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

    load(copyObj: any) {
        this.level = copyObj.level
        this.xp = copyObj.xp
        this.maxXp = copyObj.maxXp
        this.selected = copyObj.selected
    }

}
