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
        this.range = baseData[BattleInfo.Range]
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

    /**
     * Loops through the battleObjects and returns the closest enemy that is in range
     */
    closestEnemyInRange() {
        let closestEnemy = null
        let closestDistance = 1000
        for (let battleObject of battleObjects) {
            if (battleObject.ally != this.ally) {
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
        return this.health -= damage - this.defense
    }

    inflictDamage(enemy: BattleObject, damage: number) {
        enemy.receiveDamage(damage)
    }

    abstract retaliate(enemy: BattleObject): void

    abstract attackEnemy(enemy: BattleObject): void

    abstract getAttackedByEnemy(enemy: BattleObject): void

}


class InfantryObject extends BattleObject {

    attackEnemy(enemy: BattleObject): void {
        enemy.getAttackedByEnemy(this)
        enemy.retaliate(this)
    }

    getAttackedByEnemy(enemy: BattleObject): void {
        this.health -= Math.max(0, enemy.attack - this.defense)
    }

    retaliate(enemy: BattleObject): void {
        enemy.getAttackedByEnemy(this)
    }
}

class RangedObject extends BattleObject {

    attackEnemy(enemy: BattleObject): void {
        enemy.getAttackedByEnemy(this)
        enemy.retaliate(this)
    }

    getAttackedByEnemy(enemy: BattleObject): void {
        this.health -= Math.max(0, enemy.attack - this.defense)
    }

    retaliate(enemy: BattleObject): void {
        enemy.getAttackedByEnemy(this)
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
        if (this.firstStrikeWindup >= 1) {
            enemy.getAttackedByEnemy(this)
        }
    }

    getAttackedByEnemy(enemy: BattleObject): void {
        this.health -= Math.max(0, enemy.attack - this.defense)
    }

    retaliate(enemy: BattleObject): void {
        enemy.getAttackedByEnemy(this)
    }
}