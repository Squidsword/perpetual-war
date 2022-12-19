enum Info {
    Division = "DIVISION",
    Resource = "RESOURCE",
    Trait = "TRAIT",
    Category = "CATEGORY",
    Object = "OBJECT",
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
    Rebirths = "REBIRTHS",
}

enum Trait {
    Crops = "CROPS",
    Fields = "FIELDS",
    Barns = "BARNS",

    Learner = "LEARNER",
}

enum Category {
    Growth = "GROWTH",

    Discovery = "DISCOVERY"
}

type Progression = Resource | Trait
type XP = Trait

var divisions = {
    [Division.Economy]: {
        [Info.Category]: [Category.Growth],
        "button": document.getElementById("economyButton"),
        "table": document.getElementById("economyTable")
    },
    [Division.Technology]: {
        [Info.Category]: [],
        "button": document.getElementById("technologyButton"),
        "table": document.getElementById("technologyTable")
    },
    [Division.Military]: {
        [Info.Category]: [],
        "button": document.getElementById("militaryButton"),
        "table": document.getElementById("militaryTable")
    },
}

var categories = {
    [Category.Growth]: {
        [Info.Division]: Division.Economy,
        [Info.Trait]: [Trait.Crops, Trait.Fields, Trait.Barns],
        "headerColor": "rgb(38, 136, 38)",
        "headerData": {
            "categoryName": "Growth",
            "levelName": "Expansions",
            "effect": "Effect"
        },
    },
    [Category.Discovery]: {
        [Info.Division]: Division.Economy,
        [Info.Trait]: [Trait.Learner],
        "headerColor": "rgb(240,248,255)",
        "headerData": {
            "categoryName": "Discovery",
            "levelName": "Movements",
            "effect": "Effect"
        },
    }
}

var traits = {
    [Trait.Crops]: {
        [Info.Division]: Division.Economy,
        [Info.Category]: Category.Growth,
        [Info.Object]: new TraitObject({
            type: Trait.Crops,
            maxXp: 100,
            affects: {[Resource.Population]: (level: number) => 1 + (level * 0.1)},
            scaling: (level: number) => Math.pow(1.01, level) + 0.1 * level,
        })
    },
    [Trait.Fields]: {
        [Info.Division]: Division.Economy,
        [Info.Category]: Category.Growth,
        [Info.Object]: new TraitObject({
            requirements: [new Requirement(Trait.Crops, 5)],
            type: Trait.Fields,
            maxXp: 500,
            affects: {[Trait.Crops]: (level: number) => 1 + (level * 0.2)},
            scaling: (level: number) => Math.pow(1.02, level) + 0.2 * level,
        })
    },
    [Trait.Barns]: {
        [Info.Division]: Division.Economy,
        [Info.Category]: Category.Growth,
        [Info.Object]: new TraitObject({
            requirements: [new Requirement(Trait.Fields, 10)],
            type: Trait.Barns,
            maxXp: 2500,
            affects: {[Trait.Fields]: (level: number) => 1 + (level * 0.5)},
            scaling: (level: number) => Math.pow(1.05, level) + 0.5 * level,
        })
    },
    [Trait.Learner]: {
        [Info.Division]: Division.Economy,
        [Info.Category]: Category.Discovery,
        [Info.Object]: new TraitObject({
            requirements: [new Requirement(Resource.Population, 100)],
            type: Trait.Learner,
            maxXp: 500,
            affects: {[Trait.Fields]: (level: number) => 1 + (level * 0.5)},
            scaling: (level: number) => Math.pow(1.05, level) + 0.5 * level,
        })
    }
}

var resources = {
    [Resource.Resources]: new ResourceObject({
        type: Resource.Time,
        baseIncome: 365/900,
        display: setTimeDisplay
    }),
    [Resource.Population]: new ResourceObject({
        type: Resource.Population,
        amount: 1,
        baseIncome: 0.1,
        xpAffects: universalAffect((s:number, r:number) => Math.pow(Math.floor(s), 0.75), true)
    }),
    [Resource.Science]: new ResourceObject({
        type: Resource.Science,
        baseIncome: 0.1,
        requirements: [new Requirement(Resource.Population, 100)]
    }),
    [Resource.Resources]: new ResourceObject({
        type: Resource.Resources,
        baseIncome: 1,
        requirements: [new Requirement(Resource.Population, 1000)],
        display: setResourceDisplay
    }),
    [Resource.Population]: new ResourceObject({
        type: Resource.Rebirths,
        amount: 0,
        baseIncome: 0
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

function update() {
    for (let key in GameObject.objects) {
        var obj = GameObject.objects[key as Progression]
        obj.update()
    }
    updateCategories()
    updateDivisions()
}

function selectTrait(trait: Trait) {
    for (let t in TraitObject.traitObjects) {
        let traitKey = t as keyof typeof TraitObject.traitObjects
        var obj = TraitObject.traitObjects[traitKey]
        obj.selected = false
    }
    TraitObject.traitObjects[trait].select()
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

function categoryUnlocked(c: Category) {
    for (let t of categories[c][Info.Trait]) {
        let traitKey = t as keyof typeof GameObject.objects
        if (GameObject.objects[traitKey].isUnlocked()) {
            return true
        }
    }
    return false
}

function divisionUnlocked(d: Division) {
    for (let c of divisions[d][Info.Category]) {
        if (categoryUnlocked(c as Category)) {
            return true
        }
    }
    return false
}

function updateDivisions() {
    for (let d of Object.values(Division)) {
        if (divisionUnlocked(d)) {
            divisions[d].button!.style.display = ""
        } else {
            divisions[d].button!.style.display = "none"
        }
    }
}

function updateCategories() {
    for (let c of Object.values(Category)) {
        if (categoryUnlocked(c)) {
            document.getElementById(c.toLowerCase())!.style.display = ""
        } else {
            document.getElementById(c.toLowerCase())!.style.display = "none"
        }
    }
}

function createHeaderRow(category: Category): HTMLTableRowElement {
    var template = document.getElementById("headerTemplate") as HTMLTemplateElement
    var headerRow = template.content.firstElementChild!.cloneNode(true) as HTMLTableRowElement
    var data = categories[category]["headerData"]
    for (let name in categories[category]["headerData"]) {
        let key = name as keyof typeof data
        headerRow.getElementsByClassName(name)[0].textContent = data[key]
    }
    var unlocked = false
    for (let t of categories[category][Info.Trait]) {
        let traitKey = t as keyof typeof GameObject.objects
        if (GameObject.objects[traitKey].isUnlocked()) {
            unlocked = true
        }
    }
    if (!unlocked) {
        headerRow.style.display = "none"
    }
    headerRow.style.backgroundColor = categories[category]["headerColor"]
    headerRow.style.color = "#FFFFFF"
    headerRow.id = category.toLowerCase()
    var HTMLTable = divisions[categories[category][Info.Division]]["table"]
    HTMLTable?.append(headerRow)
    return headerRow
}

function createRow(trait: Trait) {
    var template = document.getElementById("rowTemplate") as HTMLTemplateElement
    var row = template.content.firstElementChild!.cloneNode(true) as HTMLTableRowElement
    var obj = TraitObject.traitObjects[trait]
    row.id = obj.getID()
    row.getElementsByClassName("name")[0].textContent = obj.getName()
    var button = row.getElementsByClassName("progressBar")[0] as HTMLDivElement
    button.onclick = () => selectTrait(trait)
    if (!obj.isUnlocked()) {
        row.style.display = "none"
    }
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
    return floor(value / Math.pow(10, tier*3), 1) + suffix
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
selectTrait(Trait.Crops)
setTab(document.getElementById("economyButton"), "economy")
setInterval(update, 1000 / updateSpeed)

var canvas = document.querySelector('canvas') as HTMLCanvasElement
var c = canvas.getContext('2d')
canvas.width = 800
canvas.height = 500
