"use strict";
class Commander {
    constructor(name, baseData) {
        this.name = name;
        this.colors = baseData.colors;
        this.spawnPoint = baseData.spawnPoint;
        this.positioning = baseData.positioning;
        this.facingLeft = baseData.facingLeft;
        this.command = Command.Hold;
        this.units = [];
        this.temper = 1;
    }
    enlist(unit) {
        if (unit instanceof BattleObject) {
            this.units.push(unit);
        }
        else {
            let battleClass = getClass(unit);
            if (!battleClass) {
                throw new Error("Invalid battle category");
            }
            let newUnit = new battleClass(unit, this.name, battleBaseData[unit]);
            this.units.push(newUnit);
            return newUnit;
        }
    }
    giveCommand(command) {
        this.command = command;
    }
    update() {
        this.command = this.temper >= 1 ? Command.Hold : Command.Charge;
        if (this.facingLeft) {
            this.command = Command.Charge;
        }
        this.temper = Math.min(this.temper + applySpeed(0.3), 1);
        this.units.forEach(unit => {
            unit.update();
        });
    }
    load(copyObj) {
        if (copyObj.units != undefined) {
            this.command = copyObj.command;
            this.temper = copyObj.temper;
            for (let u of copyObj.units) {
                let loadedUnit = this.enlist(u.type);
                loadedUnit === null || loadedUnit === void 0 ? void 0 : loadedUnit.load(u);
            }
        }
        return false;
    }
    hardReset() {
        this.units = [];
        this.temper = 0;
        this.command = Command.Hold;
    }
}
class BattleObject {
    constructor(type, commander, baseData) {
        this.type = type;
        this.commander = commander;
        this.category = baseData[BattleInfo.Category];
        this.maxHealth = baseData[BattleInfo.MaxHealth];
        this.health = this.maxHealth;
        this.attack = baseData[BattleInfo.Attack];
        this.attackSpeed = baseData[BattleInfo.AttackSpeed];
        this.defense = baseData[BattleInfo.Defense];
        this.range = baseData[BattleInfo.Range];
        this.speed = baseData[BattleInfo.Speed];
        this.x = commanders[commander].spawnPoint + drawNormal();
        this.y = Math.random() * 20 + 10;
        this.attackWindup = 0;
        this.aggressionRange = 20;
        this.reactionWindup = 0;
        this.givenCommand = commanders[commander].command;
        this.staticUniformVariance = Math.random();
        this.staticNormalVariance = drawNormal();
        this.applyAdjustments();
    }
    load(copyObj) {
        if (copyObj.health != undefined) {
            this.health = copyObj.health;
            this.x = copyObj.x;
            this.y = copyObj.y;
            this.attackWindup = copyObj.attackWindup;
            this.givenCommand = copyObj.givenCommand;
            this.reactionWindup = copyObj.reactionWindup;
            return true;
        }
        return false;
    }
    update() {
        if (this.maxHealth <= 0) {
            commanders[this.commander].units.splice(commanders[this.commander].units.indexOf(this), 1);
            return;
        }
        this.updateCommand();
        this.act();
        this.draw();
    }
    die() {
        commanders[this.commander].units.splice(commanders[this.commander].units.indexOf(this), 1);
    }
    act() {
        if (this.isEnemyInAggressionRange(this.closestEnemy().enemy)) {
            commanders[this.commander].temper = 0;
            commanders[this.commander].giveCommand(Command.Charge);
        }
        if (this.givenCommand == Command.Charge) {
            this.charge();
        }
        else if (this.givenCommand == Command.Hold) {
            this.hold();
        }
    }
    drawNewVariances() {
        this.staticNormalVariance = drawNormal();
        this.staticUniformVariance = Math.random();
    }
    charge() {
        var closestEnemy = this.closestEnemy();
        this.attackWindup += applySpeed(this.attackSpeed);
        if (closestEnemy.enemy == null) {
            if (commanders[this.commander].facingLeft) {
                if (this.reactionWindup >= this.staticUniformVariance) {
                    this.advance();
                }
                else {
                    this.reactionWindup += applySpeed(1);
                }
            }
            return;
        }
        if (this.isEnemyInRange(closestEnemy.enemy)) {
            if (this.attackWindup >= 1) {
                this.attackWindup = 0;
                this.attackEnemy(closestEnemy.enemy);
                drawAttack(this, closestEnemy.enemy);
            }
        }
        else {
            this.advance();
        }
    }
    hold() {
        let closestEnemy = this.closestEnemy();
        if (closestEnemy.enemy != null && this.isEnemyInAggressionRange(closestEnemy.enemy)) {
            commanders[this.commander].temper = 0;
            return;
        }
        this.recall();
    }
    updateCommand() {
        if (commanders[this.commander].command == this.givenCommand) {
            return;
        }
        this.reactionWindup += applySpeed(1);
        if (this.reactionWindup >= this.staticUniformVariance) {
            this.reactionWindup = 0;
            this.givenCommand = commanders[this.commander].command;
        }
    }
    recall() {
        let diff = this.relativePosition() - commanders[this.commander].positioning[this.category] + this.staticNormalVariance / 1.5;
        if (Math.abs(diff) < 0.3) {
            return;
        }
        if (diff < 0) {
            this.advance();
        }
        else {
            this.retreat();
        }
    }
    relativePosition() {
        return commanders[this.commander].facingLeft ? 100 - this.x : this.x;
    }
    advance() {
        this.x += (commanders[this.commander].facingLeft ? -1 : 1) * applySpeed(this.speed);
    }
    retreat() {
        this.x -= (commanders[this.commander].facingLeft ? -1 : 1) * applySpeed(this.speed) * 0.7;
    }
    draw() {
        drawCircle(this.x, this.y, battleObjectSize, this.getColor());
    }
    getColor() {
        return commanders[this.commander].colors[this.category];
    }
    isAlive() {
        return this.maxHealth > 0;
    }
    isEnemyInRange(enemy) {
        if (enemy == null) {
            return false;
        }
        return Math.abs(enemy.x - this.x) <= this.range;
    }
    isEnemyInAggressionRange(enemy) {
        if (enemy == null) {
            return false;
        }
        return Math.abs(enemy.x - this.x) <= this.aggressionRange;
    }
    closestEnemyInRange() {
        let vals = this.closestEnemy();
        if (vals.distance <= this.range) {
            return vals.enemy;
        }
        else {
            return null;
        }
    }
    /**
     * Loops through the battleObjects and returns the closest enemy that is in range
     * Returns [closestEnemy, closestDistance]
     */
    closestEnemy() {
        let closestEnemy = null;
        let closestDistance = 1000;
        for (let cString in commanders) {
            let c = cString;
            if (c == commanders[this.commander].name) {
                continue;
            }
            let commander = commanders[c];
            for (let u of commander.units) {
                let distance = Math.abs(u.x - this.x);
                if (distance < closestDistance) {
                    closestEnemy = u;
                }
                closestDistance = Math.min(distance, closestDistance);
            }
        }
        return { enemy: closestEnemy, distance: closestDistance };
    }
    receiveDamage(damage) {
        return this.maxHealth -= Math.max(0, damage);
    }
    receivePostmitigationDamage(damage) {
        return this.receiveDamage(damage - this.defense);
    }
    inflictDamage(enemy, damage) {
        enemy.receivePostmitigationDamage(damage);
    }
    inflictTrueDamage(enemy, damage) {
        enemy.receiveDamage(damage);
    }
    applyAdjustments() {
    }
}
class InfantryObject extends BattleObject {
    attackEnemy(enemy) {
        this.inflictDamage(enemy, this.attack);
        enemy.retaliate(this, 0.5);
    }
    retaliate(enemy, reflected) {
        this.inflictTrueDamage(enemy, (this.attack - enemy.defense) * reflected);
    }
    drawNewVariances() {
        this.range -= (this.staticUniformVariance - 0.5) / 2;
        super.drawNewVariances();
        this.range += (this.staticUniformVariance - 0.5) / 2;
    }
}
class RangedObject extends BattleObject {
    attackEnemy(enemy) {
        this.inflictDamage(enemy, this.attack);
    }
    retaliate(enemy) {
        return;
    }
    drawNewVariances() {
        this.range -= (this.staticUniformVariance - 0.5) * 2;
        super.drawNewVariances();
        this.range += (this.staticUniformVariance - 0.5) * 2;
    }
    applyAdjustments() {
        this.x += commanders[this.commander].facingLeft ? 8 : -8;
    }
}
class CavalryObject extends BattleObject {
    constructor() {
        super(...arguments);
        this.firstStrikeWindup = 0;
    }
    act() {
        var closestEnemy = this.closestEnemyInRange();
        if (closestEnemy != null) {
            this.attackWindup += this.attackSpeed * applySpeed(this.speed);
            if (this.attackWindup >= 1) {
                this.attackWindup = 0;
                this.firstStrikeWindup = 0;
                this.attackEnemy(closestEnemy);
            }
        }
        else {
            this.firstStrikeWindup += this.attackSpeed * applySpeed(this.speed);
            this.attackWindup = 1;
            this.advance();
        }
    }
    attackEnemy(enemy) {
        this.inflictDamage(enemy, this.attack);
        enemy.retaliate(this, 0.5);
    }
    retaliate(enemy, reflected) {
        this.inflictTrueDamage(enemy, (this.attack - enemy.defense) * reflected);
    }
}
