var canvas = document.querySelector('canvas') as HTMLCanvasElement
var c = canvas.getContext('2d')
canvas.width = 800
canvas.height = 500

const baseStats = {
    [Unit.Clubsman]: {
        [BattleInfo.Category]: Category.Infantry,
        [BattleInfo.Health]: 10,
        [BattleInfo.Attack]: 2,
        [BattleInfo.Defense]: 0,
        [BattleInfo.Speed]: 2,
        [BattleInfo.Range]: 1,
    },
}

function battleUpdate() {
    
}