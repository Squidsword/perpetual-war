class Commander {
    name: CommanderName
    units: BattleObject[]
    command: Command
    spawnPoint: number
    facingLeft: boolean
    positioning: {[key in MilitaryCategory]: number}
    colors: {[key in MilitaryCategory]: string}
    constructor(name: CommanderName, baseData: {
        spawnPoint: number,
        positioning: {[key in MilitaryCategory]: number},
        facingLeft: boolean,
        colors: {[key in MilitaryCategory]: string}, 
    }) {
        this.name = name
        this.colors = baseData.colors
        this.spawnPoint = baseData.spawnPoint
        this.positioning = baseData.positioning
        this.facingLeft = baseData.facingLeft
        this.command = Command.Hold
        this.units = []
    }

    enlist(unit: BattleObject | BattleCategory) {
        if (unit instanceof BattleObject) {
            this.units.push(unit)
        } else {
            let battleClass = getClass(unit)
            this.units.push(new battleClass(unit, this, baseStats[unit]))
        }
    }

    giveCommand(command: Command) {
        this.command = command
    }

    update() {
        this.units.forEach(unit => {
            unit.update()
        })
    }

}

abstract class BattleObject {
    type: BattleCategory
    commander: Commander
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

    aggressionRange: number

    constructor(type: BattleCategory, commander: Commander, baseData: {
        [BattleInfo.Category]: MilitaryCategory
        [BattleInfo.Health]: number
        [BattleInfo.Attack]: number
        [BattleInfo.Defense]: number
        [BattleInfo.Range]: number
        [BattleInfo.Speed]: number
    }) {
        this.type = type
        this.commander = commander
        this.category = baseData[BattleInfo.Category]
        this.health = baseData[BattleInfo.Health]
        this.attack = baseData[BattleInfo.Attack]
        this.defense = baseData[BattleInfo.Defense]
        this.range = baseData[BattleInfo.Range]
        this.speed = baseData[BattleInfo.Speed]
        this.x = commander.spawnPoint
        this.y = Math.random() * 25
        this.attackSpeed = 1
        this.attackWindup = 0
        this.aggressionRange = 20
        this.applyAdjustments()
    }

    update() {
        if (this.health <= 0) {
            this.commander.units.splice(this.commander.units.indexOf(this), 1)
            return
        }
        this.act()
        this.draw()
    }

    act() {
        if (this.commander.command = Command.Charge) {
            this.charge()
        } else if (this.commander.command = Command.Hold) {
            this.hold()
        }
    }

    charge() {
        var closestEnemy = this.closestEnemyInRange()
        this.attackWindup += applySpeed(this.attackSpeed)
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

    hold() {
        let diff = this.x - this.commander.positioning[this.category]
        if (Math.abs(diff) < 1) {
            return
        }
        if (diff < 0) {
            this.advance()
        } else {
            this.retreat()
        }
    }

    advance() {
        this.x += (this.commander.facingLeft ? -1 : 1) * applySpeed(this.speed)
    }

    retreat() {
        this.x -= (this.commander.facingLeft ? -1 : 1) * applySpeed(this.speed)
    }

    draw() {
        drawCircle(this.x, this.y, battleObjectSize, this.getColor())
    }

    getColor() {
        return this.commander.colors[this.category]
    }

    isAlive() {
        return this.health > 0
    }

    applyAdjustments() {
        
    }

    closestEnemyInRange() {
        return this.closestEnemy().enemy
    }
    
    /**
     * Loops through the battleObjects and returns the closest enemy that is in range
     * Returns [closestEnemy, closestDistance]
     */
    closestEnemy() {
        let closestEnemy = null
        let closestDistance = 1000
        for (let cString in commanders) {
            let c = cString as CommanderName
            if (c == this.commander.name) {
                continue
            }
            let commander = commanders[c]
            for (let u of commander.units) {
                let distance = Math.abs(u.x - this.x)
                if (distance <= this.range && distance < closestDistance) {
                    closestEnemy = u
                }
                closestDistance = Math.min(distance, closestDistance)
            }
        }
        return {enemy: closestEnemy, distance: closestDistance}
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

    applyAdjustments() {
        this.range += Math.random() - 0.5
    }
}

class RangedObject extends BattleObject {

    attackEnemy(enemy: BattleObject): void {
        this.inflictDamage(enemy, this.attack)
    }

    retaliate(enemy: BattleObject): void {
        return
    }

    applyAdjustments() {
        this.range += (Math.random() - 0.5) * 2.5
        this.attackSpeed = 0.7
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