var canvas = document.querySelector('canvas') as HTMLCanvasElement
var c = canvas.getContext('2d')
canvas.width = 868
canvas.height = 200

const battleColors = {
    [Category.Infantry]: ["rgb(0, 100, 200)", "rgb(0, 50, 100)"],
    [Category.Ranged]: ["rgb(100, 200, 0)", "rgb(50, 100, 0)"],
    [Category.Cavalry]: ["rgb(200, 200, 0)", "rgb(100, 100, 0)"],
}

const baseStats = {
    [Unit.Clubsman]: {
        [BattleInfo.Category]: Category.Infantry,
        [BattleInfo.Health]: 10,
        [BattleInfo.Attack]: 2,
        [BattleInfo.Defense]: 0,
        [BattleInfo.Speed]: 1,
        [BattleInfo.Range]: 1,
    },
}

let test = new BattleObject(Unit.Clubsman, true, baseStats[Unit.Clubsman])

function battleUpdate() {
    clearCanvas()
    test.update()
}

function drawCircle(distance: number, radius: number, fill?: string, stroke?: string, strokeWidth?: number) {
    c!.beginPath()
    c!.arc(distance, canvas.height - radius, radius, 0, 2 * Math.PI, false)
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

function xToPixel(x: number) {
    return (x - 3) * canvas.width / 94
}

function yToPixel(y: number) {
    return (y - 3) * canvas.height / 94
}

function clearCanvas() {
    c!.clearRect(0, 0, canvas.width, canvas.height)
}