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
    Growth = "GROWTH",
}

type Progression = Resource | Trait
type XP = Trait

const divisions = {
    [Division.Economy]: {
        [Info.Category]: [Category.Growth],
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
    [Category.Growth]: {
        [Info.Division]: Division.Economy,
        [Info.Trait]: [Trait.Crops, Trait.Fields],
        "headerColor": "rgb(38, 136, 38)",
        "headerData": {
            "categoryName": "Growth",
            "levelName": "Expansions",
            "effect": "Effect"
        },
    }
}

const traits = {
    [Trait.Crops]: {
        [Info.Division]: Division.Economy,
        [Info.Category]: Category.Growth,
        [Info.Object]: new TraitObject({
            type: Trait.Crops,
            maxXp: 100,
            affects: {[Resource.Population]: (level: number) => 1 + (level * 0.1)},
            scaling: (level: number) => Math.pow(1.005, level) + 0.05 * level,
        })
    },
    [Trait.Fields]: {
        [Info.Division]: Division.Economy,
        [Info.Category]: Category.Growth,
        [Info.Object]: new TraitObject({
            type: Trait.Fields,
            maxXp: 1000,
            affects: {[Trait.Crops]: (level: number) => 1 + (level * 0.1)},
            scaling: (level: number) => Math.pow(1.02, level) + 0.2 * level,
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
        baseIncome: 0.03,
        xpAffects: universalAffect((s:number, r:number) => Math.pow(Math.floor(s), 0.75), true)
    }),
}

const updateSpeed = 20
const baseGameSpeed = 1

const units = ["", "k", "M", "B", "T", "Qa", "Qi", "Sx", "Sp", "Oc", "Nn"];

var gameData = {
    gameObjects: [] as GameObject[],
    focus: Trait.Crops,
    economy: {},
    technology: {},
    military: {}
}

function update(): void {
    for (let key in GameObject.objects) {
        var obj = GameObject.objects[key as Progression]
        obj.update()
    }
}

function universalAffect(f: (s: number, r:number) => number, xpOnly: boolean = false) {
    let affects = {} as {[key in Progression]: (s: number, r:number) => number}
    for (let t of Object.values(Trait)) {
        let trait_key = t as Progression
        affects[trait_key] = f
    }
    if (xpOnly) {
        return affects
    }
    for (let r of Object.values(Resource)) {
        let resource_key = r as Resource
        affects[resource_key] = f
    }
    return affects
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

function createAllRows() {
    for (let c in categories) {
        let category = c as keyof typeof categories
        createHeaderRow(category)
        createRowsFromCategory(category)
    }
}

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

function round(value: number, decimals: number = 0) {
    return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals)
}

function floor(value: number, decimals: number = 0) {
    return Math.floor(value * Math.pow(10, decimals)) / Math.pow(10, decimals)
}

function format(value: number, decimals: number = 0): string {
    if (value <= 0) {
        return floor(value, decimals).toString()
    }
    var tier = Math.log10(value) / 3 | 0 // bitwise or turns it into an int
    if (tier == 0) {
        return floor(value, decimals).toString()
    }
    var suffix = units[tier]
    return floor(value / Math.pow(10, tier*3), decimals) + suffix
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

createAllRows()

setInterval(update, 1000 / updateSpeed)

var canvas = document.querySelector('canvas') as HTMLCanvasElement
var c = canvas.getContext('2d')
canvas.width = 800
canvas.height = 500
