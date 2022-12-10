var player = {
    resources: 1,
    science: 0,
    population: 0,
    infantry: 0,
    archers: 0,
    cavalry: 0,
    research: {} 
}

var day = 1
const updateSpeed = 20
const baseGameSpeed = 1

const units = ["", "k", "M", "B", "T", "q", "Q", "Sx", "Sp", "Oc"];

const income = 1;

function update(): void {
    applyIncome()
    progressTime()
    updateText()
}

function updateText(): void {
    setResourceDisplay(player.resources)
    setTimeDisplay(player.resources)
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

function setTab(element: HTMLSpanElement, tabName: string) {
    var tabButtonsHTML = document.getElementById("tabButtons")
    var tabsHTML = document.getElementById("tabs")
    var selected = document.getElementById(tabName)
    if (tabsHTML == null) {
        return
    }
    if (tabButtonsHTML == null) {
        return
    }
    if (selected == null) {
        return
    }

    for (let i of tabButtonsHTML.children) {
        let tabButton = i as HTMLSpanElement
        tabButton.classList.remove("w3-blue-gray")
6    }

    for (let i of tabsHTML.children) {
        let tab = i as HTMLSpanElement
        tab.style.display = "none"
    }
    
    element.classList.add("w3-blue-gray")
    selected.style.display = "block"
    
}

function format(value: number): string {
    if (value <= 0) {
        return Math.floor(value).toString()
    }
    var tier = Math.log10(value) / 3 | 0 // bitwise or turns it into an int
    if (tier == 0) {
        return Math.floor(value).toString()
    }
    var suffix = units[tier]
    return (value / Math.pow(10, tier*3)).toFixed(1) + suffix
}

function setResourceDisplay(resources: number): void {
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

function setTimeDisplay(time: number): void {
    var yearHTML = document.getElementById("year") as HTMLSpanElement
    var dayHTML = document.getElementById("day") as HTMLSpanElement
    if (yearHTML == null) {
        return
    }
    if (dayHTML == null) {
        return
    }
    yearHTML.textContent = `Year ${format(day / 365 + 1)}`
    dayHTML.textContent = `Day ${format(day % 365)}`
}

function applyMultipliers(value: number, multipliers: number[]): number {
    for (let m of multipliers) {
        value *= m
    }
    return value
}

function getSpeed(): number {
    return baseGameSpeed
}

function applySpeed(value: number): number {
    return value / updateSpeed * getSpeed()
}

function applyIncome(): void {
    player.resources += applySpeed(income)
}

function progressTime(): void {
    day += applySpeed(365/900)
}

function applyScience(): void {
    player.science += applySpeed(income)
}

setInterval(update, 1000 / updateSpeed)

var canvas = document.querySelector('canvas') as HTMLCanvasElement
var c = canvas.getContext('2d')
canvas.width = 800
canvas.height = 500
