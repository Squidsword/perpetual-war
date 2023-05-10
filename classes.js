"use strict";
class Requirement {
    constructor(func = () => true) {
        this.func = func;
    }
    isSatisfied() {
        return this.func();
    }
}
class Effect {
    constructor(source, receivers, baseData) {
        if (baseData.requirements instanceof Requirement) {
            this.requirements = baseData.requirements;
        }
        else {
            this.requirements = baseData.requirements ? new Requirement(baseData.requirements) : new Requirement();
        }
        this.source = source;
        this.receivers = receivers;
        this.effectType = baseData.effectType;
        this.additive = baseData.additive;
        this.multiplicative = baseData.multiplicative;
        this.exponential = baseData.exponential;
    }
    setSource(key) {
        this.source = key;
    }
    setReceivers(keys) {
        this.receivers = keys;
    }
    constant() {
        if (this.additive == undefined) {
            return 0;
        }
        return this.additive();
    }
    scalar() {
        if (this.multiplicative == undefined) {
            return 1;
        }
        return this.multiplicative();
    }
    power() {
        if (this.exponential == undefined) {
            return 1;
        }
        let src = objects[this.source];
        return this.exponential();
    }
    description() {
        let description = ``;
        if (this.additive) {
            description += `+${format(this.constant(), 2)} ${objects[this.receivers[0]].getName()}`;
        }
        if (this.multiplicative) {
            description += `x${format(this.scalar(), 2)} ${objects[this.receivers[0]].getName()}`;
        }
        if (this.exponential) {
            description += `^${format(this.power(), 3)} ${objects[this.receivers[0]].getName()}`;
        }
        return description;
    }
}
class AffectMap {
    constructor(affects = {}) {
        this.affects = affects;
    }
    setAffect(key, effect) {
        this.affects[key] = effect;
    }
    getAffect(key) {
        return this.affects[key];
    }
}
class EffectMap {
    constructor(effects = {}) {
        this.effects = effects;
    }
    getEffect(key) {
        return this.effects[key];
    }
    applyAdditive(value, type) {
        for (let e in this.effects) {
            let effectKey = e;
            let effect = this.effects[effectKey];
            if (effect.requirements.isSatisfied() && effect.effectType == type) {
                value += effect.constant();
            }
        }
        return value;
    }
    applyMultiplicative(value, type) {
        for (let e in this.effects) {
            let effectKey = e;
            let effect = this.effects[effectKey];
            if (effect.requirements.isSatisfied() && effect.effectType == type) {
                value *= effect.scalar();
            }
        }
        return value;
    }
    applyExponential(value, type) {
        for (let e in this.effects) {
            let effectKey = e;
            let effect = this.effects[effectKey];
            if (effect.requirements.isSatisfied() && effect.effectType == type) {
                value = Math.pow(value, effect.power());
            }
        }
        return value;
    }
    applyEffects(value = 0, type) {
        value = this.applyAdditive(value, type);
        value = this.applyMultiplicative(value, type);
        value = this.applyExponential(value, type);
        return value;
    }
}
class ActionList {
    constructor(actions) {
        this.actions = actions;
    }
    executeActions() {
        for (let idx in this.actions) {
            let action = this.actions[idx];
            action.func(...action.args);
        }
    }
}
class GameEvent {
    constructor(actionList, requirements) {
        this.executed = false;
        this.actionList = actionList;
        this.requirements = requirements ? requirements : new Requirement();
    }
    execute() {
        if (!this.executed && this.requirements.isSatisfied()) {
            this.actionList.executeActions();
            this.executed = true;
        }
    }
}
class GameObject {
    constructor(type, baseData) {
        this.type = type;
        if (baseData.requirements instanceof Function) {
            this.requirements = new Requirement(baseData.requirements);
        }
        else {
            this.requirements = baseData.requirements ? baseData.requirements : new Requirement();
        }
        this.baseData = baseData;
        this.effectMap = new EffectMap();
        this.affectMap = new AffectMap();
    }
    getName() {
        return this.type.toLowerCase().split('_').filter(x => x.length > 0).map(x => (x.charAt(0).toUpperCase() + x.slice(1))).join(" ");
    }
    getID() {
        return this.type.toLowerCase();
    }
    sendAffect(receiverKey, effect) {
        this.affectMap.setAffect(receiverKey, effect);
        objects[receiverKey].effectMap.effects[this.type] = effect;
    }
    applyEffects(value = 0, type) {
        return this.effectMap.applyEffects(value, type);
    }
    isUnlocked() {
        return this.requirements.isSatisfied();
    }
}
class ResourceObject extends GameObject {
    constructor(type, baseData) {
        super(type, baseData);
        this.baseIncome = baseData.baseIncome ? baseData.baseIncome : 0;
        this.amount = baseData.amount ? baseData.amount : 0;
        this.display = baseData.display;
    }
    update() {
        this.increaseAmount();
        this.updateDisplay();
    }
    getValue() {
        return this.amount;
    }
    setValue(val) {
        this.amount = val;
    }
    deductValue(val) {
        this.amount -= val;
    }
    incrementValue(val) {
        this.amount += val;
    }
    canAfford(val) {
        return this.getValue() >= val;
    }
    getEffectiveValue() {
        return this.amount;
    }
    getIncome() {
        return this.applyEffects(this.baseIncome, EffectType.Speed);
    }
    increaseAmount() {
        this.amount += applySpeed(this.getIncome());
    }
    load(copyObj) {
        if (copyObj.amount == undefined) {
            return false;
        }
        this.amount = copyObj.amount;
        return true;
    }
    hardReset() {
        this.amount = this.baseData.amount ? this.baseData.amount : 0;
    }
    updateDisplay() {
        var HTML_display = document.getElementById(`${this.getID()}Display`);
        if (HTML_display) {
            if (this.isUnlocked()) {
                HTML_display.classList.remove("hidden");
            }
            else {
                HTML_display.classList.add("hidden");
            }
        }
        if (this.display) {
            this.display(this.amount);
            return;
        }
        var HTML = document.getElementById(this.getID());
        if (HTML == null) {
            return;
        }
        HTML.textContent = format(this.amount);
    }
    rebirth() {
        this.hardReset();
    }
}
class LevelObject extends GameObject {
    constructor(type, baseData) {
        super(type, baseData);
        this.selected = false;
        this.level = baseData.level ? baseData.level : 0;
        this.xp = baseData.xp ? baseData.xp : 0;
        this.baseMaxXp = baseData.maxXp;
        this.maxXp = baseData.maxXp;
        this.cost = baseData.cost;
        this.pastLevels = baseData.pastLevels ? baseData.pastLevels : 0;
        this.scaling = baseData.scaling ? baseData.scaling : () => 1;
    }
    update() {
        if (this.isUnlocked()) {
            this.updateXp();
        }
        this.updateRow();
    }
    getXpGain() {
        return this.applyEffects(10, EffectType.Speed);
    }
    getValue() {
        return this.level;
    }
    getPastLevels() {
        return this.pastLevels;
    }
    getEffectiveValue() {
        return this.applyEffects(this.level, EffectType.Power);
    }
    select() {
        this.selected = true;
    }
    isSelected() {
        return this.selected;
    }
    updateXp() {
        if (this.isSelected()) {
            let adjustedXp = applySpeed(this.getXpGain());
            if (this.cost) {
                let resource = objects[this.cost[0]];
                let xpCost = adjustedXp / this.maxXp * this.cost[1];
                if (resource.canAfford(xpCost)) {
                    this.xp += adjustedXp;
                    resource.deductValue(xpCost);
                }
                else {
                    this.xp += adjustedXp * resource.getValue() / xpCost;
                    resource.setValue(0);
                }
            }
            else {
                this.xp += adjustedXp;
            }
        }
        this.updateLevel();
    }
    updateLevel() {
        while (this.xp >= this.maxXp) {
            this.xp -= this.maxXp;
            this.level += 1;
            this.maxXp = this.baseMaxXp * this.scaling(this.level);
        }
    }
    updateRow() {
        var row = document.getElementById(this.getID());
        if (this.isUnlocked()) {
            row.classList.remove("hidden");
        }
        else {
            row.classList.add("hidden");
        }
        row.getElementsByClassName("level")[0].textContent = format(this.level);
        row.getElementsByClassName("xpGain")[0].textContent = format(this.getXpGain());
        for (let r in this.affectMap.affects) {
            let receiverKey = r;
            row.getElementsByClassName("effect")[0].textContent = `${this.affectMap.getAffect(receiverKey).description()}`;
        }
        row.getElementsByClassName("xpLeft")[0].textContent = format(this.maxXp - this.xp);
        var bar = row.getElementsByClassName("progressFill")[0];
        bar.style.width = `${100 * this.xp / this.maxXp}%`;
        if (this.isSelected()) {
            bar.classList.add('selected');
        }
        else {
            bar.classList.remove('selected');
        }
    }
    load(copyObj) {
        this.level = copyObj.level ? copyObj.level : 0;
        this.xp = copyObj.xp ? copyObj.xp : 0;
        this.maxXp = copyObj.maxXp ? copyObj.maxXp : this.baseMaxXp;
        this.selected = copyObj.selected ? copyObj.selected : false;
        this.pastLevels = copyObj.pastLevels ? copyObj.pastLevels : 0;
        return true;
    }
    hardReset() {
        this.level = this.baseData.level ? this.baseData.level : 0;
        this.xp = this.baseData.xp ? this.baseData.xp : 0;
        this.maxXp = this.baseData.maxXp;
        this.selected = false;
        this.pastLevels = 0;
    }
    rebirth() {
        this.pastLevels += this.level;
        this.level = 0;
        this.xp = 0;
        this.maxXp = this.baseMaxXp;
    }
}
class BinaryXpObject extends GameObject {
    constructor(type, baseData) {
        super(type, baseData);
        this.selected = false;
        this.pastCompletions = baseData.pastUnlocks ? baseData.pastUnlocks : 0;
        this.xp = baseData.xp ? baseData.xp : 0;
        this.requiredXp = baseData.requiredXp;
    }
    update() {
        if (this.isUnlocked()) {
            this.updateXp();
        }
        this.updateRow();
    }
    getXpGain() {
        return this.applyEffects(10, EffectType.Speed);
    }
    getValue() {
        return this.isCompleted() ? 1 : 0;
    }
    getPastCompletions() {
        return this.pastCompletions;
    }
    select() {
        this.selected = true;
    }
    isSelected() {
        return this.selected;
    }
    updateXp() {
        if (this.isSelected() && !this.isCompleted()) {
            this.xp += applySpeed(this.getXpGain());
            if (this.isCompleted()) {
                this.xp = this.requiredXp;
            }
        }
    }
    isCompleted() {
        return this.xp >= this.requiredXp;
    }
    load(copyObj) {
        if (copyObj.xp == undefined || copyObj.selected == undefined) {
            return false;
        }
        this.xp = copyObj.xp;
        this.selected = copyObj.selected;
        return true;
    }
    hardReset() {
        this.xp = this.baseData.xp ? this.baseData.xp : 0;
        this.selected = false;
    }
    rebirth() {
        this.pastCompletions += this.isCompleted() ? 1 : 0;
        this.xp = 0;
    }
    updateRow() {
        var row = document.getElementById(this.getID());
        if (this.isUnlocked()) {
            row.classList.remove("hidden");
        }
        else {
            row.classList.add("hidden");
        }
        if (this.isCompleted()) {
            row.getElementsByClassName("level")[0].textContent = "Completed";
        }
        else if (this.isSelected()) {
            row.getElementsByClassName("level")[0].textContent = "In Progress";
        }
        else {
            row.getElementsByClassName("level")[0].textContent = "Postphoned";
        }
        row.getElementsByClassName("xpGain")[0].textContent = format(this.getXpGain());
        for (let r in this.affectMap.affects) {
            let receiverKey = r;
            row.getElementsByClassName("effect")[0].textContent = `${this.affectMap.getAffect(receiverKey).description()}`;
        }
        row.getElementsByClassName("xpLeft")[0].textContent = format(this.requiredXp - this.xp);
        var bar = row.getElementsByClassName("progressFill")[0];
        bar.style.width = `${100 * this.xp / this.requiredXp}%`;
        if (this.isSelected()) {
            bar.classList.add('selected');
        }
        else {
            bar.classList.remove('selected');
        }
        if (this.isCompleted()) {
            bar.classList.add('completed');
        }
        else {
            bar.classList.remove('completed');
        }
    }
}
class BinaryObject extends GameObject {
    constructor(type, baseData) {
        super(type, baseData);
        this.unlocked = false;
        this.selected = false;
        this.pastCompletions = baseData.pastUnlocks ? baseData.pastUnlocks : 0;
        this.unlocked = baseData.unlocked ? baseData.unlocked : false;
    }
    update() {
        this.updateRow();
    }
    getXpGain() {
        return this.applyEffects(10, EffectType.Speed);
    }
    getValue() {
        return this.isUnlocked() ? 1 : 0;
    }
    getPastCompletions() {
        return this.pastCompletions;
    }
    select() {
        this.selected = true;
    }
    isSelected() {
        return this.selected;
    }
    isUnlocked() {
        return this.unlocked;
    }
    load(copyObj) {
        if (copyObj.selected == undefined) {
            return false;
        }
        this.selected = copyObj.selected;
        return true;
    }
    hardReset() {
        this.selected = false;
    }
    rebirth() {
    }
    updateRow() {
        var row = document.getElementById(this.getID());
        if (this.isUnlocked()) {
            row.classList.remove("hidden");
        }
        else {
            row.classList.add("hidden");
        }
        if (this.isUnlocked()) {
            row.getElementsByClassName("level")[0].textContent = "Unlocked";
        }
        else {
            row.getElementsByClassName("level")[0].textContent = "Offered";
        }
        row.getElementsByClassName("xpGain")[0].textContent = format(this.getXpGain());
        for (let r in this.affectMap.affects) {
            let receiverKey = r;
            row.getElementsByClassName("effect")[0].textContent = `${this.affectMap.getAffect(receiverKey).description()}`;
        }
        var bar = row.getElementsByClassName("progressFill")[0];
        bar.style.width = `${this.isUnlocked() ? 100 : 0}%`;
        if (this.isUnlocked()) {
            bar.classList.add('completed');
        }
        else {
            bar.classList.remove('completed');
        }
    }
}
