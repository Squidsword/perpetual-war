abstract class BattleObject {
    type: BattleUnit
    ally: boolean
    category: MilitaryCategory

    health: number
    attack: number
    defense: number
    range: number
    speed: number

    x: number
    y: number

    attackSpeed: number
    attackWindup: number

    constructor(type: BattleUnit, ally: boolean, baseData: {
        [BattleInfo.Category]: MilitaryCategory
        [BattleInfo.Health]: number
        [BattleInfo.Attack]: number
        [BattleInfo.Defense]: number
        [BattleInfo.Range]: number
        [BattleInfo.Speed]: number
    }) {
        this.type = type
        this.ally = ally
        this.category = baseData[BattleInfo.Category]
        this.health = baseData[BattleInfo.Health]
        this.attack = baseData[BattleInfo.Attack]
        this.defense = baseData[BattleInfo.Defense]
        this.range = baseData[BattleInfo.Range] + (Math.random() - 0.5) * (baseData[BattleInfo.Category] == MilitaryCategory.Ranged ? 2 : 1)
        this.speed = baseData[BattleInfo.Speed]
        this.x = ally ? 0 : 100
        this.y = Math.random() * 5
        this.attackSpeed = 1
        this.attackWindup = 0
    }

    update() {
        if (this.health <= 0) {
            battleObjects.splice(battleObjects.indexOf(this), 1)
            return
        }
        this.act()
        this.draw()
    }

    act() {
        var closestEnemy = this.closestEnemyInRange()
        this.attackWindup += this.attackSpeed * applySpeed(this.speed)
        if (closestEnemy != null) {
            if (this.attackWindup >= 1) {
                this.attackWindup = 0
                this.attackEnemy(closestEnemy)
                drawAttack(this, closestEnemy)
            }
        } else {
            this.advance()
        }
    }

    advance() {
        this.x += 10 * (this.ally ? 1 : -1) * applySpeed(this.speed)
    }

    draw() {
        drawCircle(this.x, this.y, battleObjectSize, this.getColor())
    }

    getColor() {
        return battleColors[this.category][this.ally ? 0 : 1]
    }

    isAlive() {
        return this.health > 0
    }

    /**
     * Loops through the battleObjects and returns the closest enemy that is in range
     */
    closestEnemyInRange() {
        let closestEnemy = null
        let closestDistance = 1000
        for (let battleObject of battleObjects) {
            if (battleObject.ally != this.ally && battleObject.isAlive()) {
                let distance = Math.abs(battleObject.x - this.x)
                if (distance <= this.range && distance < closestDistance) {
                    closestDistance = distance
                    closestEnemy = battleObject
                }
            }
        }
        return closestEnemy
    }

    receiveDamage(damage: number) {
        return this.health -= Math.max(0, damage)
    }

    receivePostmitigationDamage(damage: number) {
        return this.receiveDamage(damage - this.defense)
    }

    inflictDamage(enemy: BattleObject, damage: number) {
        enemy.receivePostmitigationDamage(damage)
    }

    inflictTrueDamage(enemy: BattleObject, damage: number) {
        enemy.receiveDamage(damage)
    }

    abstract retaliate(enemy: BattleObject, reflected: number): void

    abstract attackEnemy(enemy: BattleObject): void

}


class InfantryObject extends BattleObject {

    attackEnemy(enemy: BattleObject): void {
        this.inflictDamage(enemy, this.attack)
        enemy.retaliate(this, 0.5)
    }

    retaliate(enemy: BattleObject, reflected: number): void {
        this.inflictTrueDamage(enemy, (this.attack - enemy.defense) * reflected)
    }

}

class RangedObject extends BattleObject {

    attackEnemy(enemy: BattleObject): void {
        this.inflictDamage(enemy, this.attack)
    }

    retaliate(enemy: BattleObject): void {
        return
    }
}

class CavalryObject extends BattleObject {
    firstStrikeWindup = 0
    act() {
        var closestEnemy = this.closestEnemyInRange()
        if (closestEnemy != null) {
            this.attackWindup += this.attackSpeed * applySpeed(this.speed)
            if (this.attackWindup >= 1) {
                this.attackWindup = 0
                this.firstStrikeWindup = 0
                this.attackEnemy(closestEnemy)
            }
        } else {
            this.firstStrikeWindup += this.attackSpeed * applySpeed(this.speed)
            this.attackWindup = 1
            this.advance()
        }
    }

    attackEnemy(enemy: BattleObject): void {
        this.inflictDamage(enemy, this.attack)
        enemy.retaliate(this, 0.5)
    }

    retaliate(enemy: BattleObject, reflected: number): void {
        this.inflictTrueDamage(enemy, (this.attack - enemy.defense) * reflected)
    }
}