var canvas = document.querySelector('canvas') as HTMLCanvasElement
var c = canvas.getContext('2d')
canvas.width = 868
canvas.height = 200

const battleObjectSize = 10

const playerBattleColors = {
    [MilitaryCategory.Infantry]: "rgb(0, 100, 200)",
    [MilitaryCategory.Ranged]: "rgb(100, 200, 0)",
    [MilitaryCategory.Cavalry]: "rgb(200, 200, 0)",
}

const enemyBattleColors = {
    [MilitaryCategory.Infantry]: "rgb(0, 50, 100)",
    [MilitaryCategory.Ranged]: "rgb(50, 100, 0)",
    [MilitaryCategory.Cavalry]: "rgb(100, 100, 0)",
}

const defaultPositioning = {
    [MilitaryCategory.Infantry]: 20,
    [MilitaryCategory.Ranged]: 15,
    [MilitaryCategory.Cavalry]: 5,
}


const CommanderInfo = {
    [CommanderName.Player]: {
        colors: playerBattleColors,
        positioning: defaultPositioning,
        spawnPoint: 0,
        facingLeft: false,
    },
    [CommanderName.Enemy]: {
        colors: enemyBattleColors,
        positioning: defaultPositioning,
        spawnPoint: 100,
        facingLeft: true,
    }
}

const commanders = {
    [CommanderName.Player]: new Commander(CommanderName.Player, CommanderInfo[CommanderName.Player]),
    [CommanderName.Enemy]: new Commander(CommanderName.Enemy, CommanderInfo[CommanderName.Enemy]),
}

const battleBaseData = {
    [BattleInfantry.Clubsman]: {
        [BattleInfo.Category]: MilitaryCategory.Infantry,
        [BattleInfo.MaxHealth]: 12,
        [BattleInfo.Attack]: 2,
        [BattleInfo.AttackSpeed]: 1.2,
        [BattleInfo.Defense]: 0,
        [BattleInfo.Speed]: 1.6,
        [BattleInfo.Range]: 2,
    },
    [BattleRanged.Slinger]: {
        [BattleInfo.Category]: MilitaryCategory.Ranged,
        [BattleInfo.MaxHealth]: 6,
        [BattleInfo.Attack]: 2,
        [BattleInfo.AttackSpeed]: 0.6,
        [BattleInfo.Defense]: 0,
        [BattleInfo.Speed]: 1.6,
        [BattleInfo.Range]: 8,
    },
    [BattleCavalry.Scout]: {
        [BattleInfo.Category]: MilitaryCategory.Cavalry,
        [BattleInfo.MaxHealth]: 6,
        [BattleInfo.Attack]: 2,
        [BattleInfo.AttackSpeed]: 1.0,
        [BattleInfo.Defense]: 0,
        [BattleInfo.Speed]: 1.6,
        [BattleInfo.Range]: 2,
    }
}

function getClass(battleCategory: BattleCategory) {
    if (battleBaseData[battleCategory][BattleInfo.Category] === MilitaryCategory.Infantry) {
        return InfantryObject
    } else if (battleBaseData[battleCategory][BattleInfo.Category] == MilitaryCategory.Ranged) {
        return RangedObject 
    } else if (battleBaseData[battleCategory][BattleInfo.Category] == MilitaryCategory.Cavalry) {
        return CavalryObject
    }
}

let varianceTimer = 0

function battleUpdate() {
    clearCanvas()
    updateCommanders()
    varianceTimer += applySpeed(1)
    if (varianceTimer >= 8) {
        updateVariances()
        varianceTimer = 0
    }
}

function updateVariances() {
    for (let k in commanders) {
        let objectKey = k as keyof typeof commanders
        commanders[objectKey].units.forEach(unit => {
            unit.drawNewVariances()
        })
    }
}

function updateCommanders() {
    for (let k in commanders) {
        let objectKey = k as keyof typeof commanders
        commanders[objectKey].update()
    }
}

function drawCircle(x: number, y:number, radius: number, fill?: string, stroke?: string, strokeWidth?: number) {
    c!.beginPath()
    c!.arc(xToPixel(x), yToPixel(y) - radius, radius, 0, 2 * Math.PI, false)
    if (fill) {
      c!.fillStyle = fill
      c!.fill()
    }
    if (stroke) {
      c!.lineWidth = strokeWidth ? strokeWidth : 2
      c!.strokeStyle = stroke
      c!.stroke()
    }
}

/**
 * Debug purposes
 */
function simulateRandomBattle() {
    for (let i = 0; i < 500; i++) {
        let ranged = Math.random() < 0.5 ? true : false
        if (ranged) {
            commanders[CommanderName.Player].enlist(BattleRanged.Slinger)
        } else {
            commanders[CommanderName.Player].enlist(BattleInfantry.Clubsman)
        }
    }
    for (let i = 0; i < 500; i++) {
        let ranged = Math.random() < 0.5 ? true : false
        if (ranged) {
            commanders[CommanderName.Enemy].enlist(BattleRanged.Slinger)
        } else {
            commanders[CommanderName.Enemy].enlist(BattleInfantry.Clubsman)
        }
    }
}

function sendWave(size: number) {
    for (let i = 0; i < size; i++) {
        let ranged = Math.random() < 0.5 ? true : false
        if (ranged) {
            commanders[CommanderName.Enemy].enlist(BattleRanged.Slinger)
        } else {
            commanders[CommanderName.Enemy].enlist(BattleInfantry.Clubsman)
        }
    }
}
