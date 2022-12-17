"use strict";
class GameObject {
    constructor(baseData) {
        this.bonuses = [];
        this.multipliers = {};
        this.baseData = baseData;
        this.type = baseData.type;
        GameObject.objects[this.type] = this;
    }
    getName() {
        return this.type.charAt(0).toUpperCase() + this.type.slice(1).toLowerCase();
    }
    getID() {
        return this.type.toLowerCase();
    }
    updateMultiplier(source, value) {
        this.multipliers[source] = value;
    }
    getMultiplierList() {
        return Object.values(this.multipliers);
    }
    update() {
    }
}
GameObject.objects = {};
class ResourceObject extends GameObject {
    constructor(baseData) {
        super(baseData);
        this.amount = 0;
        this.baseIncome = baseData.baseIncome;
        ResourceObject.resourceObjects[this.type] = this;
    }
    getIncome() {
        return applyMultipliers(this.baseIncome, this.getMultiplierList());
    }
    increaseAmount() {
        this.amount += applySpeed(this.getIncome());
    }
    update() {
        this.increaseAmount();
    }
    updateDisplay() {
        if (this.display) {
            this.display(this.amount);
            return;
        }
        var HTML_display = document.getElementById(this.getID());
        if (HTML_display == null) {
            return;
        }
        HTML_display.textContent = format(this.amount);
    }
}
ResourceObject.resourceObjects = {};
class TraitObject extends GameObject {
    constructor(baseData) {
        super(baseData);
        this.level = 0;
        this.xp = 0;
        this.xpMultipliers = [];
        this.baseMaxXP = baseData.maxXP;
        this.maxXP = baseData.maxXP;
        this.affects = baseData.affects;
        this.effect = baseData.effect;
        this.scaling = baseData.scaling;
        TraitObject.traitObjects[this.type] = this;
    }
    getEffect() {
        return this.effect(this.level);
    }
    getXPGain() {
        return applyMultipliers(10, this.xpMultipliers);
    }
    updateXP() {
        this.xp += this.getXPGain();
    }
    updateLevel() {
        while (this.xp >= this.maxXP) {
            this.xp -= this.maxXP;
            this.level += 1;
            this.maxXP = this.baseMaxXP * this.scaling(this.level);
        }
    }
    update() {
        this.updateXP();
        this.updateLevel();
    }
}
TraitObject.traitObjects = {};
