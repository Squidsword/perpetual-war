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
        if ('display' in baseData) {
            this.display = baseData.display;
        }
        if ('amount' in baseData) {
            this.amount = baseData.amount;
        }
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
        this.updateDisplay();
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
        return applyMultipliers(this.effect(this.level), this.getMultiplierList());
    }
    getXPGain() {
        return applySpeed(applyMultipliers(10, this.xpMultipliers));
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
    updateRow() {
        var row = document.getElementById(this.getID());
        var affected_obj = GameObject.objects[this.affects];
        row.getElementsByClassName("level")[0].textContent = format(this.level);
        row.getElementsByClassName("xpGain")[0].textContent = format(this.getXPGain());
        row.getElementsByClassName("effect")[0].textContent = `${format(this.getEffect())}x ${affected_obj.getName()}`;
        row.getElementsByClassName("xpLeft")[0].textContent = format(this.maxXP - this.xp);
        var bar = row.getElementsByClassName("progressFill")[0];
        bar.style.width = `${100 * this.xp / this.maxXP}%`;
    }
    update() {
        this.updateXP();
        this.updateLevel();
        this.updateRow();
    }
}
TraitObject.traitObjects = {};
