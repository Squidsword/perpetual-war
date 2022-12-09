var player: {
    resources: number,
    science: number,
    infantry: number,
    archers: number,
    cavalry: number,
    research: {}
} = {
    resources: 0,
    science: 0,
    infantry: 0,
    archers: 0,
    cavalry: 0,
    research: {} 
}

var canvas = document.querySelector('canvas') as HTMLCanvasElement
var c = canvas.getContext('2d')
canvas.width = 800
canvas.height = 500

