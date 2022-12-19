"use strict";
function instanceOfXP(object) {
    return 'receiveXpMultiplier' in object;
}
class Requirement {
    constructor(type, threshold) {
        this.type = type;
        this.threshold = threshold;
    }
    isSatisfied() {
        return objects[this.type].amount >= this.threshold;
    }
}
class GameEvent {
}
class GameObject {
    constructor(baseData) {
        this.bonuses = {};
        this.multipliers = {};
        this.affects = {};
        this.xpAffects = {};
        this.requirements = [];
        this.amount = 0;
        this.baseData = baseData;
        this.type = baseData.type;
        if ('bonuses' in baseData) {
            this.bonuses = baseData.bonuses;
        }
        if ('requirements' in baseData) {
            this.requirements = baseData.requirements;
        }
        if ('affects' in baseData) {
            this.affects = baseData.affects;
        }
        if ('xpAffects' in baseData) {
            this.xpAffects = baseData.xpAffects;
        }
        if ('amount' in baseData) {
            this.amount = baseData.amount;
        }
    }
    update() {
        this.sendAllMultipliers();
    }
    getName() {
        return this.type.toLowerCase().split('_').filter(x => x.length > 0).map(x => (x.charAt(0).toUpperCase() + x.slice(1))).join(" ");
    }
    getID() {
        return this.type.toLowerCase();
    }
    getEffectiveAmount() {
        return applyMultipliers(this.amount, this.calculateMultipliers());
    }
    receiveMultiplier(sourceKey, effect) {
        this.multipliers[sourceKey] = effect;
    }
    receiveBonus(sourceKey, effect) {
        this.bonuses[sourceKey] = effect;
    }
    sendMultiplier(receiverKey, effect) {
        objects[receiverKey].receiveMultiplier(this.type, effect);
    }
    sendXpMultiplier(receiverKey, effect) {
        let receiver = objects[receiverKey];
        if (instanceOfXP(receiver)) {
            receiver.receiveXpMultiplier(this.type, effect);
        }
    }
    sendAllMultipliers() {
        for (let r in this.affects) {
            let receiverKey = r;
            this.sendMultiplier(receiverKey, this.affects[receiverKey]);
        }
        for (let r in this.xpAffects) {
            let receiverKey = r;
            this.sendXpMultiplier(receiverKey, this.xpAffects[receiverKey]);
        }
    }
    sendBonus(destination, effect) {
        objects[destination].bonuses[this.type] = effect;
    }
    calculateEffect(r) {
        let reveiver_key = r;
        let receiver = objects[reveiver_key];
        return this.affects[r](this.getEffectiveAmount(), receiver.amount);
    }
    calculateMultipliers(multiplierMap = this.multipliers) {
        var multipliers = [];
        for (let s in multiplierMap) {
            let source_key = s;
            let source = objects[source_key];
            let multiplier = multiplierMap[source_key](source.getEffectiveAmount(), this.amount);
            multipliers.push(multiplier);
        }
        return multipliers;
    }
    isUnlocked() {
        for (let r of this.requirements) {
            if (!r.isSatisfied()) {
                return false;
            }
        }
        return true;
    }
    load(copyObj) {
        this.amount = copyObj.amount;
    }
}
class ResourceObject extends GameObject {
    constructor(baseData) {
        super(baseData);
        this.baseIncome = 0;
        if ('baseIncome' in baseData) {
            this.baseIncome = baseData.baseIncome;
        }
        if ('display' in baseData) {
            this.display = baseData.display;
        }
    }
    update() {
        super.update();
        this.increaseAmount();
        this.sendAllMultipliers();
        this.updateDisplay();
    }
    getBonus() {
    }
    getEffectiveAmount() {
        return this.amount;
    }
    getFinalIncome() {
        return applyMultipliers(this.baseIncome, this.calculateMultipliers());
    }
    increaseAmount() {
        this.amount += applySpeed(this.getFinalIncome());
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
        this.xpMultipliers = {};
        this.xp = 0;
        this.selected = false;
        this.baseMaxXp = baseData.maxXp;
        this.maxXp = baseData.maxXp;
        this.scaling = baseData.scaling;
    }
    update() {
        if (this.isUnlocked()) {
            super.update();
            this.updateXp();
            this.updateLevel();
        }
        this.updateRow();
    }
    getXpGain() {
        return applyMultipliers(10, this.calculateMultipliers(this.xpMultipliers));
    }
    receiveXpMultiplier(source, effect) {
        this.xpMultipliers[source] = effect;
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
            this.amount += 1;
            this.maxXp = this.baseMaxXp * this.scaling(this.amount);
        }
    }
    updateRow() {
        var row = document.getElementById(this.getID());
        if (this.isUnlocked()) {
            row.style.display = "";
        }
        row.getElementsByClassName("level")[0].textContent = format(this.amount);
        row.getElementsByClassName("xpGain")[0].textContent = format(this.getXpGain());
        for (let r in this.affects) {
            let receiver_key = r;
            let receiver = objects[receiver_key];
            row.getElementsByClassName("effect")[0].textContent = `${format(this.calculateEffect(receiver_key), 1)}x ${receiver.getName()}`;
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
        super.load(copyObj);
        this.xp = copyObj.xp;
        this.maxXp = copyObj.maxXp;
        this.selected = copyObj.selected;
    }
}
