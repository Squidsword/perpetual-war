"use strict";
class Requirement {
    constructor(type, threshold) {
        this.type = type;
        this.threshold = threshold;
    }
    isSatisfied() {
        return objects[this.type].getValue() >= this.threshold;
    }
}
class RequirementList {
    constructor(requirements = []) {
        this.requirements = requirements;
    }
    isUnlocked() {
        for (let r of this.requirements) {
            if (!r.isSatisfied()) {
                return false;
            }
        }
        return true;
    }
}
class Effect {
    constructor(source, receivers, baseData) {
        this.source = source;
        this.receivers = receivers;
        this.requirements = baseData.requirements ? baseData.requirements : new RequirementList();
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
        let src = objects[this.source];
        return this.additive(src.getValue(), src.getEffectiveValue());
    }
    scalar() {
        if (this.multiplicative == undefined) {
            return 1;
        }
        let src = objects[this.source];
        return this.multiplicative(src.getValue(), src.getEffectiveValue());
    }
    power() {
        if (this.exponential == undefined) {
            return 1;
        }
        let src = objects[this.source];
        return this.exponential(src.getValue(), src.getEffectiveValue());
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
    setEffect(key, effect) {
        this.effects[key] = effect;
    }
    getEffect(key) {
        return this.effects[key];
    }
    applyAdditive(value, type) {
        for (let e in this.effects) {
            let effectKey = e;
            let effect = this.effects[effectKey];
            if (effect.requirements.isUnlocked() && effect.effectType == type) {
                value += effect.constant();
            }
        }
        return value;
    }
    applyMultiplicative(value, type) {
        for (let e in this.effects) {
            let effectKey = e;
            let effect = this.effects[effectKey];
            if (effect.requirements.isUnlocked() && effect.effectType == type) {
                value *= effect.scalar();
            }
        }
        return value;
    }
    applyExponential(value, type) {
        for (let e in this.effects) {
            let effectKey = e;
            let effect = this.effects[effectKey];
            if (effect.requirements.isUnlocked() && effect.effectType == type) {
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
class GameEvent {
}
class GameObject {
    constructor(baseData) {
        this.type = baseData.type;
        this.requirements = baseData.requirements ? baseData.requirements : new RequirementList();
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
        objects[receiverKey].effectMap.setEffect(this.type, effect);
    }
    applyEffects(value = 0, type) {
        return this.effectMap.applyEffects(value, type);
    }
    isUnlocked() {
        return this.requirements.isUnlocked();
    }
}
class ResourceObject extends GameObject {
    constructor(baseData) {
        super(baseData);
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
        this.amount = copyObj.amount;
    }
    updateDisplay() {
        var HTML_display = document.getElementById(`${this.getID()}Display`);
        if (HTML_display) {
            if (this.isUnlocked()) {
                HTML_display.style.display = "";
            }
            else {
                HTML_display.style.display = "none";
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
}
class LevelObject extends GameObject {
    constructor(baseData) {
        super(baseData);
        this.selected = false;
        this.level = baseData.level ? baseData.level : 0;
        this.xp = baseData.xp ? baseData.xp : 0;
        this.baseMaxXp = baseData.maxXp;
        this.maxXp = baseData.maxXp;
        this.scaling = baseData.scaling;
    }
    update() {
        if (this.isUnlocked()) {
            this.updateXp();
            this.updateLevel();
        }
        this.updateRow();
    }
    getXpGain() {
        return this.applyEffects(10, EffectType.Speed);
    }
    getValue() {
        return this.level;
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
            this.xp += applySpeed(this.getXpGain());
        }
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
            row.style.display = "";
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
        this.level = copyObj.level;
        this.xp = copyObj.xp;
        this.maxXp = copyObj.maxXp;
        this.selected = copyObj.selected;
    }
}
