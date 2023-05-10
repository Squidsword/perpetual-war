var canvas = document.querySelector('canvas') as HTMLCanvasElement
var c = canvas.getContext('2d')
canvas.width = 868
canvas.height = 200

const battleColors = {
    [MilitaryCategory.Infantry]: ["rgb(0, 100, 200)", "rgb(0, 50, 100)"],
    [MilitaryCategory.Ranged]: ["rgb(100, 200, 0)", "rgb(50, 100, 0)"],
    [MilitaryCategory.Cavalry]: ["rgb(200, 200, 0)", "rgb(100, 100, 0)"],
}

const battleObjectSize = 10

const baseStats = {
    [BattleInfantry.Clubsman]: {
        [BattleInfo.Category]: MilitaryCategory.Infantry,
        [BattleInfo.Health]: 10,
        [BattleInfo.Attack]: 2,
        [BattleInfo.Defense]: 0,
        [BattleInfo.Speed]: 1,
        [BattleInfo.Range]: 2,
    },
    [BattleRanged.Slinger]: {
        [BattleInfo.Category]: MilitaryCategory.Ranged,
        [BattleInfo.Health]: 1,
        [BattleInfo.Attack]: 2,
        [BattleInfo.Defense]: 0,
        [BattleInfo.Speed]: 1,
        [BattleInfo.Range]: 8,
    }
}

let battleObjects = [new InfantryObject(BattleInfantry.Clubsman, true, baseStats[BattleInfantry.Clubsman]), 
                    new InfantryObject(BattleInfantry.Clubsman, false, baseStats[BattleInfantry.Clubsman]),
                    new RangedObject(BattleRanged.Slinger, false, baseStats[BattleRanged.Slinger])] as BattleObject[]

// for (let i = 0; i < 100; i++) {
//     let team = Math.random() < 0.5 ? true : false
//     let slinger = Math.random() < 0.5 ? new InfantryObject(BattleInfantry.Clubsman, team, baseStats[BattleInfantry.Clubsman]) : new RangedObject(BattleRanged.Slinger, team, baseStats[BattleRanged.Slinger])
//     battleObjects.push(slinger)
// }

for (let i = 0; i < 50; i++) {
    let slinger = new RangedObject(BattleRanged.Slinger, true, baseStats[BattleRanged.Slinger])
    battleObjects.push(slinger)
}

for (let i = 0; i < 50; i++) {
    let clubsman = new InfantryObject(BattleInfantry.Clubsman, false, baseStats[BattleInfantry.Clubsman])
    battleObjects.push(clubsman)
}


function battleUpdate() {
    clearCanvas()
    updateBattleObjects()
}

function updateBattleObjects() {
    for (let battleObject of battleObjects) {
        battleObject.update()
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

    let ctr = {x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 + 10}
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