enum Info {
    Division = "DIVISION",
    Resource = "RESOURCE",
    Trait = "TRAIT",
    Category = "CATEGORY",
}

enum Division {
    Economy = "ECONOMY",
    Technology = "TECHNOLOGY",
    Military = "MILITARY",
}

enum Resource {
    Population = "POPULATION",
    Resources = "RESOURCES",
    Science = "SCIENCE",
}

enum Trait {
    Crops = "CROPS",
    Fields = "FIELDS",
}

enum Category {
    Sustainability = "SUSTAINABILITY",
}

const categories = {
    [Category.Sustainability]: {
        [Info.Division]: Division.Economy,
        [Info.Trait]: [Trait.Crops, Trait.Fields],
        "headerColor": "rgb(38, 136, 38)",
        "headerData": {
            "categoryName": "Sustainability",
            "levelName": "Expansions"
        },
    }
}

const traits = {
    [Trait.Crops]: {
        [Info.Division]: Division.Economy,
        [Info.Category]: Category.Sustainability
    }
}

var player = {
    resources: 1,
    science: 0,
    population: 1,
    focus: Trait.Crops,
    economy: {},
    technology: {},
    military: {}
}

var day = 1
const updateSpeed = 20
const baseGameSpeed = 1

const units = ["", "k", "M", "B", "T", "q", "Q", "Sx", "Sp", "Oc"];

const basePopulationGrowth = 0.03;
const income = 1;

const economyBaseData = {
    [Trait.Crops]: {name: "Crops", maxXP: 10, scaling: 1.01, affects: Resource.Population, effect: (level: number) => (level + 1)},
    [Trait.Fields]: {name: "Fields", maxXp: 100, scaling: 1.2, affects: Trait.Crops, effect: (level: number) => (level + 1)*0.1}
}


function update(): void {
    applyIncome()
    updatePopulation()
    progressTime()
    updateText()
}

function createHeaderRow(header: Category): HTMLTableRowElement | null {
    var template = document.getElementById("headerTemplate") as HTMLTemplateElement
    var headerRow = template.content.firstElementChild!.cloneNode(true) as HTMLTableRowElement
    var data = categories[header]["headerData"]
    for (let name in categories[header]["headerData"]) {
        let key = name as keyof typeof data
        headerRow.getElementsByClassName(name)[0].textContent = data[key]
    }
    headerRow.style.backgroundColor = categories[header]["headerColor"]
    headerRow.style.color = "#FFFFFF"
    return headerRow
}

document.getElementById("economyTable")?.append(createHeaderRow(Category.Sustainability) as Node)

function removeSpaces(str: string) {
    return str.replace(/ /g, "")
}

function updatePopulation(): void {
    player.population += applySpeed(basePopulationGrowth)
}

function updateText(): void {
    setResourceDisplay(player.resources)
    setTimeDisplay(player.resources)
    setDisplay("science", format(player.science))
    setDisplay("population", format(player.population))
}

function setDisplay(elementID: string, text: string): void {
    var elementHTML = document.getElementById(elementID)
    elementHTML!.textContent = text
}

function setTab(element: HTMLSpanElement, tabName: string) {
    var tabButtonsHTML = document.getElementById("tabButtons")
    var tabsHTML = document.getElementById("tabs")
    var selected = document.getElementById(tabName)

    for (let i of tabButtonsHTML!.children) {
        let tabButton = i as HTMLSpanElement
        tabButton.classList.remove("w3-blue-gray")
6    }

    for (let i of tabsHTML!.children) {
        let tab = i as HTMLSpanElement
        tab.style.display = "none"
    }
    
    element.classList.add("w3-blue-gray")
    selected!.style.display = "block"
    
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
    var resourceHTML = document.getElementById("resources")
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
        var tierHTML = resourceHTML!.children[i] as HTMLSpanElement
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
