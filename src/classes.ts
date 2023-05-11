class Requirement {
    func: () => boolean

    constructor(func = () => true) {
        this.func = func
    }

    isSatisfied() {
        return this.func()
    }

}

class Effect {
    source: Feature
    receivers: Feature[]
    requirements: Requirement
    effectType: EffectType
    additive?: () => number
    multiplicative?: () => number
    exponential?: () => number

    constructor(source: Feature, receivers: Feature[], baseData: {
        requirements?: Requirement | (() => boolean),
        effectType: EffectType,
        additive?: () => number,
        multiplicative?: () => number,
        exponential?: () => number
    }) {
        if (baseData.requirements instanceof Requirement) {
            this.requirements = baseData.requirements
        } else {
            this.requirements = baseData.requirements ? new Requirement(baseData.requirements) : new Requirement()
        }
        this.source = source
        this.receivers = receivers
        this.effectType = baseData.effectType
        this.additive = baseData.additive
        this.multiplicative = baseData.multiplicative
        this.exponential = baseData.exponential
    }

    setSource(key: Feature) {
        this.source = key
    }

    setReceivers(keys: Feature[]) {
        this.receivers = keys
    }

    constant() {
        if (this.additive == undefined) {
            return 0
        }
        return this.additive()
    }

    scalar() {
        if (this.multiplicative == undefined) {
            return 1
        }
        return this.multiplicative()
    }

    power() {
        if (this.exponential == undefined) {
            return 1
        }
        let src = objects[this.source]
        return this.exponential()
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
    affects: {[key in Feature]: Effect}

    constructor(affects = {} as {[key in Feature]: Effect}) {
        this.affects = affects
    }

    setAffect(key: Feature, effect: Effect) {
        this.affects[key] = effect
    }

    getAffect(key: Feature) {
        return this.affects[key]
    }

}

class EffectMap {
    effects: {[key in Feature]: Effect}

    constructor(effects = {} as {[key in Feature]: Effect}) {
        this.effects = effects
    }

    getEffect(key: Feature) {
        return this.effects[key]
    }

    applyAdditive(value: number, type: EffectType) {
        for (let e in this.effects) {
            let effectKey = e as Feature
            let effect = this.effects[effectKey]
            if (effect.requirements.isSatisfied() && effect.effectType == type) {
                value += effect.constant()
            }
        }
        return value
    }

    applyMultiplicative(value: number, type: EffectType) {
        for (let e in this.effects) {
            let effectKey = e as Feature
            let effect = this.effects[effectKey]
            if (effect.requirements.isSatisfied() && effect.effectType == type) {
                value *= effect.scalar()
            }
        }
        return value
    }

    applyExponential(value: number, type: EffectType) {
        for (let e in this.effects) {
            let effectKey = e as Feature
            let effect = this.effects[effectKey]
            if (effect.requirements.isSatisfied() && effect.effectType == type) {
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

class ActionList {
    actions: [{func: Function, args: []}]

    constructor(actions: [{func: Function, args: [] | any}] | {func: Function, args: [] | any}) {
        if (!Array.isArray(actions)) {
            this.actions = [actions]
        } else {
            this.actions = actions
        }

    }

    executeActions() {
        for (let idx in this.actions) {
            let action = this.actions[idx]
            if (!Array.isArray(action.args)) {
                action.func(action.args)
            } else {
                action.func(...action.args)
            }

        }
    }
}

class GameEvent {
    actionList: ActionList
    requirements: Requirement

    constructor(actionList: ActionList | {func: Function, args: [] | any}, requirements: Requirement | (() => boolean)) {
        if (!(actionList instanceof ActionList)) {
            actionList = new ActionList(actionList)
        }
        this.actionList = actionList
        if (requirements instanceof Requirement) {
            this.requirements = requirements
        } else {
            this.requirements = new Requirement(requirements)
        }
    }

    update() {
        if (this.requirements.isSatisfied()) {
            this.actionList.executeActions()
        }
    }

}

class OneTimeEvent extends GameEvent {
    executed = false
    update() {
        if (!this.executed) {
            super.update()
        }
    }
}

abstract class GameObject {
    baseData: {[key: string] : any}
    type: Feature
    requirements: Requirement
    effectMap: EffectMap
    affectMap: AffectMap

    constructor(type: Feature, baseData: {
        requirements?: Requirement | (() => boolean),
    }) {
        this.type = type
        if (baseData.requirements instanceof Function) {
            this.requirements = new Requirement(baseData.requirements)
        } else {
            this.requirements = baseData.requirements ? baseData.requirements : new Requirement()
        }
        this.baseData = baseData
        this.effectMap = new EffectMap()
        this.affectMap = new AffectMap()
    }

    getName() {
        return this.type.toLowerCase().split('_').filter(x => x.length > 0).map(x => (x.charAt(0).toUpperCase() + x.slice(1))).join(" ")
    }

    getID() {
        return this.type.toLowerCase()
    }

    sendAffect(receiverKey: Feature, effect: Effect) {
        this.affectMap.setAffect(receiverKey, effect)
        objects[receiverKey].effectMap.effects[this.type] = effect
    }

    applyEffects(value = 0, type: EffectType) {
        return this.effectMap.applyEffects(value, type)
    }

    isUnlocked() {
        return this.requirements.isSatisfied()
    }

    abstract update(): void

    abstract getValue(): number

    abstract load(copyObj: any): boolean

    abstract hardReset(): void

    abstract rebirth() : void

}

class ResourceObject extends GameObject {
    baseIncome: number
    amount: number
    display?: (amount: number) => void

    constructor(type: Feature, baseData: {
        requirements?: Requirement | (() => boolean),
        affects?: EffectMap,
        baseIncome?: number,
        amount?: number, 
        display?: (amount: number) => void
    }) {
        super(type, baseData)
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

    setValue(val: number): void {
        this.amount = val
    }

    deductValue(val: number): void {
        this.amount -= val
    }

    incrementValue(val: number): void {
        this.amount += val
    }

    canAfford(val: number): boolean {
        return this.getValue() >= val
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

    load(copyObj: any): boolean {
        if (copyObj.amount == undefined) {
            return false
        }
        this.amount = copyObj.amount
        return true
    }

    hardReset() {
        this.amount = this.baseData.amount ? this.baseData.amount : 0
    }

    updateDisplay() {
        var HTML_display = document.getElementById(`${this.getID()}Display`)
        if (HTML_display) {
            if (this.isUnlocked()) {
                HTML_display.classList.remove("hidden")
            } else {
                HTML_display.classList.add("hidden")
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

    rebirth(): void {
        this.hardReset()
    }
}


class LevelObject extends GameObject {
    baseMaxXp: number
    scaling: (l: number) => number
    cost?: [Resource, number]

    level: number
    xp: number
    maxXp: number
    pastLevels: number

    levelUpEvent: (level?: number) => void

    selected = false
    constructor(type: Feature, baseData: {
        level?: number,
        pastLevels?: number,
        xp?: number,
        requirements?: Requirement | (() => boolean),
        affects?: EffectMap,
        maxXp: number,
        cost?: [Resource, number]
        scaling?: (l: number) => number
        levelUpEvent?: (level?: number) => void
    }) {
        super(type, baseData)
        this.level = baseData.level ? baseData.level : 0
        this.xp = baseData.xp ? baseData.xp : 0
        this.baseMaxXp = baseData.maxXp
        this.maxXp = baseData.maxXp
        this.cost = baseData.cost
        this.pastLevels = baseData.pastLevels ? baseData.pastLevels : 0
        this.scaling = baseData.scaling ? baseData.scaling : () => 1
        this.levelUpEvent = baseData.levelUpEvent ? baseData.levelUpEvent : () => {}
    }

    update() {
        if (this.isUnlocked()) {
            this.updateXp()
        }
        this.updateRow()
    }

    getXpGain(): number {
        return this.applyEffects(10, EffectType.Speed)
    }

    getValue(): number {
        return this.level
    }

    getPastLevels(): number {
        return this.pastLevels
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
            let adjustedXp = applySpeed(this.getXpGain())
            if (this.cost) {
                let resource = objects[this.cost[0]]
                let xpCost = adjustedXp / this.maxXp * this.cost[1]
                if (resource.canAfford(xpCost)) {
                    this.xp += adjustedXp
                    resource.deductValue(xpCost)
                } else {
                    this.xp += adjustedXp * resource.getValue() / xpCost
                    resource.setValue(0)
                }
            } else {
                this.xp += adjustedXp
            }
        }
        this.updateLevel()
    }

    updateLevel() {
        while (this.xp >= this.maxXp) {
            this.xp -= this.maxXp
            this.level += 1
            this.maxXp = this.baseMaxXp * this.scaling(this.level)
            this.levelUpEvent()
        }
    }

    updateRow() {
        var row = document.getElementById(this.getID())

        if (this.isUnlocked()) {
            row!.classList.remove("hidden")
        } else {
            row!.classList.add("hidden")
        }

        row!.getElementsByClassName("level")[0].textContent = format(this.level)
        row!.getElementsByClassName("xpGain")[0].textContent = format(this.getXpGain())

        for (let r in this.affectMap.affects) {
            let receiverKey = r as Feature
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

    load(copyObj: any): boolean {
        this.level = copyObj.level ? copyObj.level : 0
        this.xp = copyObj.xp ? copyObj.xp : 0
        this.maxXp = copyObj.maxXp ? copyObj.maxXp : this.baseMaxXp
        this.selected = copyObj.selected ? copyObj.selected : false
        this.pastLevels = copyObj.pastLevels ? copyObj.pastLevels : 0
        return true
    }
    
    hardReset() {
        this.level = this.baseData.level ? this.baseData.level : 0
        this.xp = this.baseData.xp ? this.baseData.xp : 0
        this.maxXp = this.baseData.maxXp
        this.selected = false
        this.pastLevels = 0
    }

    rebirth() {
        this.pastLevels += this.level
        this.level = 0
        this.xp = 0
        this.maxXp = this.baseMaxXp
    }

}

class ConsumableObject extends LevelObject {
    totalLevels: number
    constructor(type: Feature, baseData: {
        level?: number,
        pastLevels?: number,
        totalLevels?: number,
        xp?: number,
        requirements?: Requirement | (() => boolean),
        affects?: EffectMap,
        maxXp: number,
        cost?: [Resource, number]
        scaling?: (l: number) => number
        levelUpEvent?: () => void
    }) {
        super(type, baseData)
        this.level = baseData.level ? baseData.level : 0
        this.totalLevels = baseData.totalLevels ? baseData.totalLevels : this.level
        this.xp = baseData.xp ? baseData.xp : 0
        this.baseMaxXp = baseData.maxXp
        this.maxXp = baseData.maxXp
        this.cost = baseData.cost
        this.pastLevels = baseData.pastLevels ? baseData.pastLevels : 0
        this.scaling = baseData.scaling ? baseData.scaling : () => 1
    }

    getTotalLevels(): number {
        return this.totalLevels
    }

    consumeLevel() {
        if (this.level > 0) {
            this.level -= 1
            this.maxXp = this.baseMaxXp * this.scaling(this.level)
        }
    }

    load(copyObj: any): boolean {
        super.load(copyObj)
        this.totalLevels = copyObj.totalLevels ? copyObj.totalLevels : this.level
        return true
    }
    
    hardReset() {
        super.hardReset()
        this.totalLevels = 0
    }

    rebirth() {
        this.pastLevels += this.totalLevels
        this.level = 0
        this.xp = 0
        this.maxXp = this.baseMaxXp
    }
}

class BinaryXpObject extends GameObject {
    xp: number
    requiredXp: number
    selected = false
    pastCompletions: number
    constructor(type: Feature, baseData: {
        unlocked?: boolean
        pastUnlocks?: number
        xp?: number
        requirements?: Requirement | (() => boolean),
        affects?: EffectMap,
        requiredXp: number,
    }) {
        super(type, baseData)
        this.pastCompletions = baseData.pastUnlocks ? baseData.pastUnlocks : 0
        this.xp = baseData.xp ? baseData.xp : 0
        this.requiredXp = baseData.requiredXp
    }

    update() {
        if (this.isUnlocked()) {
            this.updateXp()
        }
        this.updateRow()
    }

    getXpGain(): number {
        return this.applyEffects(10, EffectType.Speed)
    }

    getValue(): number {
        return this.isCompleted() ? 1 : 0
    }

    getPastCompletions(): number {
        return this.pastCompletions
    }

    select() {
        this.selected = true
    }

    isSelected(): boolean {
        return this.selected
    }

    updateXp() {
        if (this.isSelected() && !this.isCompleted()) {
            this.xp += applySpeed(this.getXpGain())
            if (this.isCompleted()) {
                this.xp = this.requiredXp
            }
        }
    }

    isCompleted() {
        return this.xp >= this.requiredXp
    }

    load(copyObj: any): boolean {
        if (copyObj.xp == undefined || copyObj.selected == undefined) {
            return false
        }
        this.xp = copyObj.xp
        this.selected = copyObj.selected
        return true
    }
    
    hardReset() {
        this.xp = this.baseData.xp ? this.baseData.xp : 0
        this.selected = false
    }

    rebirth() {
        this.pastCompletions += this.isCompleted() ? 1 : 0
        this.xp = 0
    }

    updateRow() {
        var row = document.getElementById(this.getID())

        if (this.isUnlocked()) {
            row!.classList.remove("hidden")
        } else {
            row!.classList.add("hidden")
        }

        if (this.isCompleted()) {
            row!.getElementsByClassName("level")[0].textContent = "Completed"
        } else if (this.isSelected()) {
            row!.getElementsByClassName("level")[0].textContent = "In Progress"
        } else {
            row!.getElementsByClassName("level")[0].textContent = "Postphoned"
        }

        row!.getElementsByClassName("xpGain")[0].textContent = format(this.getXpGain())

        for (let r in this.affectMap.affects) {
            let receiverKey = r as Feature
            row!.getElementsByClassName("effect")[0].textContent = `${this.affectMap.getAffect(receiverKey).description()}`
        }

        row!.getElementsByClassName("xpLeft")[0].textContent = format(this.requiredXp - this.xp)
        var bar = (row!.getElementsByClassName("progressFill")[0] as HTMLDivElement)
        bar.style.width = `${100 * this.xp / this.requiredXp}%`
        if (this.isSelected()) {
            bar.classList.add('selected')
        } else {
            bar.classList.remove('selected')
        }
        if (this.isCompleted()) {
            bar.classList.add('completed')
        } else {
            bar.classList.remove('completed')
        }
    }

}

class BinaryObject extends GameObject {
    unlocked = false
    selected = false
    pastCompletions: number
    constructor(type: Feature, baseData: {
        unlocked?: boolean
        pastUnlocks?: number
        requirements?: Requirement | (() => boolean),
        affects?: EffectMap,
    }) {
        super(type, baseData)
        this.pastCompletions = baseData.pastUnlocks ? baseData.pastUnlocks : 0
        this.unlocked = baseData.unlocked ? baseData.unlocked : false
    }

    update() {
        this.updateRow()
    }

    getValue(): number {
        return this.isUnlocked() ? 1 : 0
    }

    getPastCompletions(): number {
        return this.pastCompletions
    }

    select() {
        this.selected = true
    }

    isSelected(): boolean {
        return this.selected
    }

    isUnlocked(): boolean {
        return this.unlocked
    }

    load(copyObj: any): boolean {
        if (copyObj.selected == undefined) {
            return false
        }
        this.selected = copyObj.selected
        return true
    }
    
    hardReset() {
        this.selected = false
    }

    rebirth() {

    }

    updateRow() {
        var row = document.getElementById(this.getID())

        if (this.isUnlocked()) {
            row!.classList.remove("hidden")
        } else {
            row!.classList.add("hidden")
        }

        if (this.isUnlocked()) {
            row!.getElementsByClassName("level")[0].textContent = "Unlocked"
        } else {
            row!.getElementsByClassName("level")[0].textContent = "Offered"
        }

        for (let r in this.affectMap.affects) {
            let receiverKey = r as Feature
            row!.getElementsByClassName("effect")[0].textContent = `${this.affectMap.getAffect(receiverKey).description()}`
        }

        var bar = (row!.getElementsByClassName("progressFill")[0] as HTMLDivElement)
        bar.style.width = `${this.isUnlocked() ? 100 : 0}%`
        if (this.isUnlocked()) {
            bar.classList.add('completed')
        } else {
            bar.classList.remove('completed')
        }
    }

}