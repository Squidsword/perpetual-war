var player = {
    resources: 1,
    science: 0,
    population: 0,
    infantry: 0,
    archers: 0,
    cavalry: 0,
    research: {} 
}

const updateSpeed = 20
const baseGameSpeed = 4

const units = ["", "k", "M", "B", "T", "q", "Q", "Sx", "Sp", "Oc"];

const income = 1;

function update(): void {
    applyIncome()
    updateText()
}

function updateText(): void {
    formatResources(player.resources)
    setDisplay("science", format(player.science))
    setDisplay("population", format(player.population))
}

function setDisplay(elementID: string, text: string): void {
    var elementHTML = document.getElementById(elementID)
    if (elementHTML == null) {
        return
    }
    elementHTML.textContent = text
}

function format(value: number): string {
    var tier = Math.log10(value) / 3 | 0 // bitwise or turns it into an int
    if (tier == 0) {
        return value.toString()
    }
    var suffix = units[tier]
    return (value / Math.pow(10, tier*3)).toFixed(1) + suffix
}

function formatResources(resources: number): void {
    var resourceHTML = document.getElementById("resourceDisplay")
    if (resourceHTML == null) {
        return
    }
    var tiers = ["p", "g", "s", "c"]
    var colors: { [tier: string] : string } = {
        "p": "#79b9c7",
        "g": "#E5C100",
        "s": "#a8a8a8",
        "c": "#a15c2f"
    }
    var i = 0
    for (let tier of tiers) {
        var base = Math.pow(10, (tiers.length - i - 1) * 2)
        var coins = Math.floor(resources / base)
        resources = resources - coins * base
        var tierHTML = resourceHTML.children[i] as HTMLSpanElement
        tierHTML.textContent = coins > 0 ? format(coins) + tier : ""
        tierHTML.style.color = colors[tier]
        i++
    }
}

function applyMultipliers(value: number, multipliers: number[]): number {
    for (let m of multipliers) {
        value *= m
    }
    return value
}

function applySpeed(value: number): number {
    return value / updateSpeed
}

function applyIncome(): void {
    player.resources += applySpeed(income)
}

function applyScience(): void {
    player.science += applySpeed(income)
}

setInterval(update, 1000 / updateSpeed)

var canvas = document.querySelector('canvas') as HTMLCanvasElement
var c = canvas.getContext('2d')
canvas.width = 800
canvas.height = 500

