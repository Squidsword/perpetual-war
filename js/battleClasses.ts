class BattleObject {
    type: Unit
    ally: boolean
    category: Category

    health: number
    attack: number
    defense: number
    range: number
    speed: number

    x: number
    y: number
    constructor(type: Unit, ally: boolean, baseData: {
        [BattleInfo.Category]: Category
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
        this.x = ally ? 0 : 94
        this.y = ally ? 0 : 94
    }

    update() {
        this.draw()
        this.x += applySpeed(this.speed)
    }

    advance() {
        this.x += applySpeed(this.speed)
    }

    draw() {
        drawCircle(xToPixel(this.x), 10, "green")
    }

    die() {
        this.health = 0
    }

    getColor() {
        return battleColors[this.category][this.ally ? 0 : 1]
    }

}
