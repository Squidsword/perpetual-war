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
        [BattleInfo.Health]: 12,
        [BattleInfo.Attack]: 2,
        [BattleInfo.Defense]: 0,
        [BattleInfo.Speed]: 1.6,
        [BattleInfo.Range]: 2,
    },
    [BattleRanged.Slinger]: {
        [BattleInfo.Category]: MilitaryCategory.Ranged,
        [BattleInfo.Health]: 6,
        [BattleInfo.Attack]: 2,
        [BattleInfo.Defense]: 0,
        [BattleInfo.Speed]: 1.6,
        [BattleInfo.Range]: 8,
    },
    [BattleCavalry.Scout]: {
        [BattleInfo.Category]: MilitaryCategory.Cavalry,
        [BattleInfo.Health]: 6,
        [BattleInfo.Attack]: 2,
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

function battleUpdate() {
    clearCanvas()
    updateCommanders()
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
 * Takes the position of two units and draws an arc connecting the positions together
 */
function drawAttack(source: BattleObject, destination: BattleObject) {
    let color = source.getColor()
    if (source.x > destination.x) {
        let temp = source
        source = destination
        destination = temp
    }
    let p1 = {x: xToPixel(source.x) + battleObjectSize * 0.707, y: yToPixel(source.y) - battleObjectSize*1.707}
    let p2 = {x: xToPixel(destination.x) - battleObjectSize * 0.707, y: yToPixel(destination.y) - battleObjectSize * 1.707}

    let ctr = {x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 + 10 + Math.abs(p2.x - p1.x)/2}
    let diffX = p1.x - ctr.x
    let diffY = p1.y - ctr.y
    let radius = Math.abs(Math.sqrt(diffX*diffX + diffY*diffY))
    let startAngle = Math.atan2(diffY, diffX)
    let endAngle = Math.atan2(p2.y - ctr.y, p2.x - ctr.x)
    
    c!.save();
    c!.translate(ctr.x, ctr.y);
    c!.scale(1, 1);
    c!.lineWidth = 3
    c!.strokeStyle = color
    c!.beginPath();
    c!.arc(0, 0, radius, startAngle, endAngle, false);
    c!.stroke();
    c!.closePath();
    c!.restore();
}

function xToPixel(x: number) {
    return (x - 3) / 94 * canvas.width 
}

function yToPixel(y: number) {
    return (1 - y / 100) * canvas.height
}

function clearCanvas() {
    c!.clearRect(0, 0, canvas.width, canvas.height)
}


function simulateRandomBattle() {
    for (let i = 0; i < 50; i++) {
        let ranged = Math.random() < 0.5 ? true : false
        if (ranged) {
            commanders[CommanderName.Player].enlist(BattleRanged.Slinger)
        } else {
            commanders[CommanderName.Player].enlist(BattleInfantry.Clubsman)
        }
    }
    for (let i = 0; i < 50; i++) {
        let ranged = Math.random() < 0.5 ? true : false
        if (ranged) {
            commanders[CommanderName.Enemy].enlist(BattleRanged.Slinger)
        } else {
            commanders[CommanderName.Enemy].enlist(BattleInfantry.Clubsman)
        }
    }
}

simulateRandomBattle()