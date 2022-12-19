enum Info {
    Division = "DIVISION",
    Resource = "RESOURCE",
    Children = "CHILDREN",
    Category = "CATEGORY",
    Object = "OBJECT",
    BaseData = "BASEDATA"
}

enum Division {
    Economy = "ECONOMY",
    Technology = "TECHNOLOGY",
    Military = "MILITARY",
}

enum Resource {
    Time = "TIME",
    Population = "POPULATION",
    Capital = "CAPITAL",
    Science = "SCIENCE",
    Rebirths = "REBIRTHS",
}

enum Building {
    Crops = "CROPS",
    Fields = "FIELDS",
    Barns = "BARNS",

    Learner = "LEARNER",
}

enum Research {
    SeedDiversity = "SEED_DIVERSITY"
}

enum Category {
    Growth = "GROWTH",
    Discovery = "DISCOVERY",

    Agriculture = "AGRIGULTURE"
}

type Progression = Resource | Research | Building
type XP = Building

const baseData = {
    [Building.Crops]: {
        type: Building.Crops,
        maxXp: 100,
        affects: {[Resource.Population]: (level: number) => 1 + (level * 0.1)},
        scaling: (level: number) => Math.pow(1.01, level) + 0.1 * level,
    },
    [Building.Fields]: {
        requirements: [new Requirement(Building.Crops, 5)],
        type: Building.Fields,
        maxXp: 1000,
        affects: {[Building.Crops]: (level: number) => 1 + (level * 0.2)},
        scaling: (level: number) => Math.pow(1.02, level) + 0.2 * level,
    }, 
    [Building.Barns]: {
        requirements: [new Requirement(Building.Fields, 10)],
        type: Building.Barns,
        maxXp: 10000,
        affects: {[Building.Fields]: (level: number) => 1 + (level * 0.5)},
        scaling: (level: number) => Math.pow(1.05, level) + 0.5 * level,
    },
    [Building.Learner]: {
        requirements: [new Requirement(Resource.Population, 100)],
        type: Building.Learner,
        maxXp: 500,
        affects: {[Resource.Science]: (level: number) => 1 + (level * 0.1)},
        scaling: (level: number) => Math.pow(1.01, level) + 0.1 * level,
    },
    [Research.SeedDiversity]: {
        requirements: [new Requirement(Resource.Science, 1)],
        type: Research.SeedDiversity,
        maxXp: 1000,
        affects: {[Building.Crops]: (level: number) => 1 + (level * 0.1)},
        scaling: (level: number) => Math.pow(1.01, level) + 0.1 * level,
    },
    [Resource.Time]: {
        type: Resource.Time,
        baseIncome: 365/900,
        display: setTimeDisplay
    },
    [Resource.Population]: {
        type: Resource.Population,
        amount: 1,
        baseIncome: 0.03,
        xpAffects: affect(Object.values(Building), (s:number, r:number) => Math.pow(Math.floor(s), 0.75))
    },
    [Resource.Science]: {
        type: Resource.Science,
        baseIncome: 0.01,
        requirements: [new Requirement(Resource.Population, 100)],
        xpAffects: affect(Object.values(Research), (s:number, r:number) => Math.pow(Math.floor(s), 0.75))
    },
    [Resource.Capital]: {
        type: Resource.Capital,
        baseIncome: 0.001,
        requirements: [new Requirement(Resource.Population, 1000)],
        display: setCapitalDisplay
    },
    [Resource.Rebirths]: {
        type: Resource.Rebirths,
        amount: 0,
        baseIncome: 0
    },
}

const metadata = {
    [Division.Economy]: {
        [Info.Category]: [Category.Growth],
        "button": document.getElementById("economyButton"),
        "table": document.getElementById("economyTable")
    },

        [Category.Growth]: {
            [Info.Division]: Division.Economy,
            [Info.Children]: [Building.Crops, Building.Fields, Building.Barns],
            "headerColor": "rgb(38, 136, 38)",
            "headerData": {
                "categoryName": "Growth",
                "levelName": "Expansions",
                "effect": "Effect"
            },
        },

            [Building.Crops]: {
                [Info.Division]: Division.Economy,
                [Info.Category]: Category.Growth,
            },
            [Building.Fields]: {
                [Info.Division]: Division.Economy,
                [Info.Category]: Category.Growth,
            },
            [Building.Barns]: {
                [Info.Division]: Division.Economy,
                [Info.Category]: Category.Growth,
            },

        [Category.Discovery]: {
            [Info.Division]: Division.Economy,
            [Info.Children]: [Building.Learner],
            "headerColor": "#0892D0",
            "headerData": {
                "categoryName": "Discovery",
                "levelName": "Movements",
                "effect": "Effect"
            },
        },

            [Building.Learner]: {
                [Info.Division]: Division.Economy,
                [Info.Category]: Category.Discovery,
            },

    [Division.Technology]: {
        [Info.Category]: [Category.Agriculture],
        "button": document.getElementById("technologyButton"),
        "table": document.getElementById("technologyTable")
    },
        [Category.Agriculture]: {
            [Info.Division]: Division.Technology,
            [Info.Children]: [Research.SeedDiversity],
            "headerColor": "rgb(38, 136, 38)",
            "headerData": {
                "categoryName": "Agriculture",
                "levelName": "Advancements",
                "effect": "Effect"
            },
        },
            [Research.SeedDiversity]: {
                [Info.Division]: Division.Technology,
                [Info.Category]: Category.Agriculture,
            },
    [Division.Military]: {
        [Info.Category]: [],
        "button": document.getElementById("militaryButton"),
        "table": document.getElementById("militaryTable")
    },

    [Resource.Time]: {
        [Info.Division]: null,
        [Info.Category]: null,
        [Info.Children]: null,
    },
    [Resource.Population]: {
        [Info.Division]: null,
        [Info.Category]: null,
        [Info.Children]: null,
    },
    [Resource.Science]: {
        [Info.Division]: null,
        [Info.Category]: null,
        [Info.Children]: null,
    },
    [Resource.Capital]: {
        [Info.Division]: null,
        [Info.Category]: null,
        [Info.Children]: null,
    },
    [Resource.Rebirths]: {
        [Info.Division]: null,
        [Info.Category]: null,
        [Info.Children]: null,
    },
}

var objects = {
    [Building.Crops]: new LevelObject(baseData[Building.Crops]),
    [Building.Fields]: new LevelObject(baseData[Building.Fields]),
    [Building.Barns]: new LevelObject(baseData[Building.Barns]),
    [Building.Learner]: new LevelObject(baseData[Building.Learner]),

    [Resource.Time]: new ResourceObject(baseData[Resource.Time]),
    [Resource.Population]: new ResourceObject(baseData[Resource.Population]),
    [Resource.Science]: new ResourceObject(baseData[Resource.Science]),
    [Resource.Capital]: new ResourceObject(baseData[Resource.Capital]),
    [Resource.Rebirths]: new ResourceObject(baseData[Resource.Rebirths]),

    [Research.SeedDiversity]: new LevelObject(baseData[Research.SeedDiversity]),
}

const updateSpeed = 20
const baseGameSpeed = 1

const units = ["", "k", "M", "B", "T", "Qa", "Qi", "Sx", "Sp", "Oc", "Nn"];

function update() {
    for (let keyString in objects) {
        let key = keyString as keyof typeof objects
        objects[key].update()
    }
    updateCategories()
    updateDivisions()
}

function select(progression: Progression) {
    if (metadata[progression][Info.Division] == Division.Economy) {
        selectBuilding(progression as Building)
    } else if (metadata[progression][Info.Division] == Division.Technology) {
        selectResearch(progression as Research)
    }
}

function selectBuilding(building: Building) {
    for (let trait of Object.values(Building)) {
        objects[trait].selected = false
    }
    objects[building].select()
}

function selectResearch(research: Research) {
    for (let trait of Object.values(Research)) {
        objects[trait].selected = false
    }
    objects[research].select()
}

function affect(keys: Progression[], f: (s: number, r:number) => number, exclude = [] as Progression[]) {
    let affects = {} as {[key in Progression]: (s: number, r:number) => number}
    for (let k of keys) {
        let key = k as Progression
        if (key in exclude) {
            continue
        }
        affects[key] = f
    }
    return affects
}

function categoryUnlocked(c: Category) {
    for (let t of metadata[c][Info.Children]) {
        let traitKey = t as keyof typeof objects
        if (objects[traitKey].isUnlocked()) {
            return true
        }
    }
    return false
}

function divisionUnlocked(d: Division) {
    for (let c of metadata[d][Info.Category]) {
        if (categoryUnlocked(c as Category)) {
            return true
        }
    }
    return false
}

function updateDivisions() {
    for (let d of Object.values(Division)) {
        if (divisionUnlocked(d)) {
            metadata[d].button!.style.display = ""
        } else {
            metadata[d].button!.style.display = "none"
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
    var data = metadata[category]["headerData"]
    for (let name in metadata[category]["headerData"]) {
        let key = name as keyof typeof data
        headerRow.getElementsByClassName(name)[0].textContent = data[key]
    }
    var unlocked = false
    for (let t of metadata[category][Info.Children]) {
        let traitKey = t as keyof typeof objects
        if (objects[traitKey].isUnlocked()) {
            unlocked = true
        }
    }
    if (!unlocked) {
        headerRow.style.display = "none"
    }
    headerRow.style.backgroundColor = metadata[category]["headerColor"]
    headerRow.style.color = "#FFFFFF"
    headerRow.id = category.toLowerCase()
    let division = metadata[category][Info.Division]
    var HTMLTable = metadata[division]["table"]
    HTMLTable?.append(headerRow)
    return headerRow
}

function createRow(attribute: Progression) {
    var template = document.getElementById("rowTemplate") as HTMLTemplateElement
    var row = template.content.firstElementChild!.cloneNode(true) as HTMLTableRowElement
    var obj = objects[attribute]
    row.id = obj.getID()
    row.getElementsByClassName("name")[0].textContent = obj.getName()
    var button = row.getElementsByClassName("progressBar")[0] as HTMLDivElement
    button.onclick = () => select(attribute)
    if (!obj.isUnlocked()) {
        row.style.display = "none"
    }
    let division = metadata[attribute][Info.Division]
    if (division != null) {
        var HTMLTable = metadata[division]["table"]
        HTMLTable?.append(row)
    }
    return row
}

function createRowsFromCategory(category: Category) {
    for (let trait of metadata[category][Info.Children]) {
        createRow(trait)
    }
}

function createAllRows() {
    for (let category of Object.values(Category)) {
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

function setCapitalDisplay(capital: number): void {
    var capitalHTML = document.getElementById("capital")
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
        var coins = Math.floor(capital / base)
        capital = capital - coins * base
        var tierHTML = capitalHTML!.children[i] as HTMLSpanElement
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

function save() {
    localStorage.setItem('gameObjects', JSON.stringify(objects))
}
  
function load() {
    let loadedData = localStorage.getItem('gameObjects') as string
    if (!loadedData) {
        return
    }
    let loadedObjects = JSON.parse(loadedData)
    for (let keyString in loadedObjects) {
        let key = keyString as keyof typeof objects
        objects[key].load(loadedObjects[keyString])
    }
}


createAllRows()
selectBuilding(Building.Crops)
setTab(document.getElementById("economyButton") as HTMLSpanElement, "economy")
load()
setInterval(update, 1000 / updateSpeed)
setInterval(save, 3000)

var canvas = document.querySelector('canvas') as HTMLCanvasElement
var c = canvas.getContext('2d')
canvas.width = 800
canvas.height = 500
