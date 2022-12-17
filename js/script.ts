enum Info {
    Division = "DIVISION",
    Resource = "RESOURCE",
    Trait = "TRAIT",
    Category = "CATEGORY",
    Object = "OBJECT"
}

enum Division {
    Economy = "ECONOMY",
    Technology = "TECHNOLOGY",
    Military = "MILITARY",
}

enum Resource {
    Time = "TIME",
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

const divisions = {
    [Division.Economy]: {
        "table": document.getElementById("economyTable")
    },
    [Division.Technology]: {
        "table": document.getElementById("technologyTable")
    },
    [Division.Military]: {
        "table": document.getElementById("militaryTable")
    }
}

const categories = {
    [Category.Sustainability]: {
        [Info.Division]: Division.Economy,
        [Info.Trait]: [Trait.Crops, Trait.Fields],
        "headerColor": "rgb(38, 136, 38)",
        "headerData": {
            "categoryName": "Sustainability",
            "levelName": "Expansions",
            "effect": "Effect"
        },
    }
}

const traits = {
    [Trait.Crops]: {
        [Info.Division]: Division.Economy,
        [Info.Category]: Category.Sustainability,
        [Info.Object]: new TraitObject({
            type: Trait.Crops,
            maxXP: 100,
            affects: Resource.Population,
            effect: (level: number) => (level + 1),
            scaling: (level: number) => Math.pow(1.01, level),
        })
    },
    [Trait.Fields]: {
        [Info.Division]: Division.Economy,
        [Info.Category]: Category.Sustainability,
        [Info.Object]: new TraitObject({
            type: Trait.Fields,
            maxXP: 1000,
            affects: Trait.Crops,
            effect: (level: number) => (level + 1) * 1.1,
            scaling: (level: number) => Math.pow(1.2, level),
        })
    }
}

const resources = {
    [Resource.Resources]: new ResourceObject({
        type: Resource.Time,
        baseIncome: 365/900,
        display: setTimeDisplay
    }),
    [Resource.Resources]: new ResourceObject({
        type: Resource.Resources,
        baseIncome: 1,
        display: setResourceDisplay
    }),
    [Resource.Science]: new ResourceObject({
        type: Resource.Science,
        baseIncome: 0,
    }),
    [Resource.Population]: new ResourceObject({
        type: Resource.Population,
        amount: 1,
        baseIncome: 0.03
    }),
}

var gameData = {
    gameObjects: [] as GameObject[],
    focus: Trait.Crops,
    economy: {},
    technology: {},
    military: {}
}

function addMultipliers(): void {
    for (let key in TraitObject.traitObjects) {
        let obj = TraitObject.traitObjects[key as keyof typeof TraitObject.traitObjects]
        let affected_obj = GameObject.objects[obj.affects as keyof typeof GameObject.objects]
        affected_obj.updateMultiplier(obj.type, obj.getEffect())
    }
}

const updateSpeed = 20
const baseGameSpeed = 1

const units = ["", "k", "M", "B", "T", "Qa", "Qi", "Sx", "Sp", "Oc", "Nn"];

const basePopulationGrowth = 0.03;
const income = 1;

function update(): void {
    for (let key in GameObject.objects) {
        var obj = GameObject.objects[key as Trait | Resource]
        obj.update()
    }
    addMultipliers()
}

function createHeaderRow(header: Category): HTMLTableRowElement {
    var template = document.getElementById("headerTemplate") as HTMLTemplateElement
    var headerRow = template.content.firstElementChild!.cloneNode(true) as HTMLTableRowElement
    var data = categories[header]["headerData"]
    for (let name in categories[header]["headerData"]) {
        let key = name as keyof typeof data
        headerRow.getElementsByClassName(name)[0].textContent = data[key]
    }
    headerRow.style.backgroundColor = categories[header]["headerColor"]
    headerRow.style.color = "#FFFFFF"
    var HTMLTable = divisions[categories[header][Info.Division]]["table"]
    HTMLTable?.append(headerRow)
    return headerRow
}

function createRow(trait: Trait) {
    var template = document.getElementById("rowTemplate") as HTMLTemplateElement
    var row = template.content.firstElementChild!.cloneNode(true) as HTMLTableRowElement
    var obj = TraitObject.traitObjects[trait]
    row.id = obj.getID()
    row.getElementsByClassName("name")[0].textContent = obj.getName()
    var HTMLTable = divisions[traits[trait][Info.Division]]["table"]
    HTMLTable?.append(row)
    return row
}

function createRowsFromCategory(category: Category) {
    for (let t of categories[category][Info.Trait]) {
        createRow(t as Trait)
    }
}

createHeaderRow(Category.Sustainability)
createRowsFromCategory(Category.Sustainability)

function removeSpaces(str: string) {
    return str.replace(/ /g, "")
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
        return Math.round(value).toString()
    }
    var tier = Math.log10(value) / 3 | 0 // bitwise or turns it into an int
    if (tier == 0) {
        return Math.round(value).toString()
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
        if (tier == "c") {
            tierHTML.textContent = format(coins) + tier
        } else {
            tierHTML.textContent = coins > 0 && tiers ? format(coins) + tier : ""
        }
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
    yearHTML.textContent = `Year ${format(time / 365 + 1)}`
    dayHTML.textContent = `Day ${format(time % 365 + 1)}`
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

setInterval(update, 1000 / updateSpeed)

var canvas = document.querySelector('canvas') as HTMLCanvasElement
var c = canvas.getContext('2d')
canvas.width = 800
canvas.height = 500
