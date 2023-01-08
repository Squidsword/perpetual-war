const baseData = {
    [Building.Crops]: {
        maxXp: 50,
        scaling: (level: number) => Math.pow(1.02, level) + 1 * level,
    },
    [Building.Fields]: {
        requirements: (): boolean => objects[Building.Crops].getValue() >= 5,
        maxXp: 2000,
        scaling: (level: number) => Math.pow(1.04, level) + 0.2 * level,
    }, 
    [Building.Barns]: {
        requirements: (): boolean => objects[Building.Fields].getValue() >= 10,
        maxXp: 20000,
        scaling: (level: number) => Math.pow(1.06, level) + 0.2 * level,
    },
    [Building.Silos]: {
        requirements: (): boolean => objects[Building.Barns].getValue() >= 10,
        maxXp: 200000,
        scaling: (level: number) => Math.pow(1.08, level) + 0.2 * level,
    },

    [Building.Learner]: {
        requirements: (): boolean => objects[Resource.Population].getValue() >= 100,
        maxXp: 2000,
        scaling: (level: number) => Math.pow(1.02, level) + 0.2 * level,
    },

    [Building.Digger]: {
        requirements: (): boolean => objects[Resource.Population].getValue() >= 10000,
        maxXp: 100000,
        scaling: (level: number) => Math.pow(1.02, level) + 0.2 * level,
    },

    [Research.SeedDiversity]: {
        requirements: (): boolean => objects[Building.Fields].getValue() >= 5,
        requiredXp: 5000,
    },
    [Research.Fences]: {
        requirements: (): boolean => objects[Building.Fields].getValue() >= 10,
        requiredXp: 50000,
    },
    [Research.Sheds]: {
        requirements: (): boolean => objects[Building.Barns].getValue() >= 10,
        requiredXp: 2000000,
    },
    [Resource.Time]: {
        baseIncome: 365/600,
        display: setTimeDisplay
    },
    [Resource.Population]: {
        amount: 1,
    },
    [Resource.Science]: {
        requirements: (): boolean => objects[Resource.Population].getValue() >= 100,
    },
    [Resource.Capital]: {
        requirements: (): boolean => objects[Resource.Population].getValue() >= 10000,
        display: setCapitalDisplay
    },
    [Resource.Rebirths]: {

    },
    [Unit.Clubsman]: {
        requirements: (): boolean => objects[Resource.Population].getValue() >= 10000,
        maxXp: 300,
        cost: [Resource.Capital, 200] as [Resource, number]
    }
}

const objects = {
    [Building.Crops]: new LevelObject(Building.Crops, baseData[Building.Crops]),
    [Building.Fields]: new LevelObject(Building.Fields, baseData[Building.Fields]),
    [Building.Barns]: new LevelObject(Building.Barns, baseData[Building.Barns]),
    [Building.Silos]: new LevelObject(Building.Silos, baseData[Building.Silos]),
    [Building.Learner]: new LevelObject(Building.Learner, baseData[Building.Learner]),
    [Building.Digger]: new LevelObject(Building.Digger, baseData[Building.Digger]),

    [Resource.Time]: new ResourceObject(Resource.Time, baseData[Resource.Time]),
    [Resource.Population]: new ResourceObject(Resource.Population, baseData[Resource.Population]),
    [Resource.Science]: new ResourceObject(Resource.Science, baseData[Resource.Science]),
    [Resource.Capital]: new ResourceObject(Resource.Capital, baseData[Resource.Capital]),
    [Resource.Rebirths]: new ResourceObject(Resource.Rebirths, baseData[Resource.Rebirths]),

    [Research.SeedDiversity]: new BinaryXpObject(Research.SeedDiversity, baseData[Research.SeedDiversity]),
    [Research.Fences]: new BinaryXpObject(Research.Fences, baseData[Research.Fences]),
    [Research.Sheds]: new BinaryXpObject(Research.Sheds, baseData[Research.Sheds]),

    [Unit.Clubsman]: new LevelObject(Unit.Clubsman, baseData[Unit.Clubsman])
}

const effectData = {
    [Building.Crops]: {
        affects: [Resource.Population],
        effectType: EffectType.Speed,
        additive: () => 0.03 * objects[Building.Crops].getEffectiveValue()
    },
    [Building.Fields]: {
        affects: [Resource.Population],
        effectType: EffectType.Speed,
        additive: () => 0.3 * objects[Building.Fields].getEffectiveValue()
    },
    [Building.Barns]: {
        affects: [Resource.Population],
        effectType: EffectType.Speed,
        additive: () => 3 * objects[Building.Barns].getEffectiveValue()
    },
    [Building.Silos]: {
        affects: [Resource.Population],
        effectType: EffectType.Speed,
        additive: () => 30 * objects[Building.Silos].getEffectiveValue()
    },
    [Building.Learner]: {
        affects: [Resource.Science],
        effectType: EffectType.Speed,
        additive: () => 0.03 * objects[Building.Learner].getEffectiveValue()
    },
    [Building.Digger]: {
        affects: [Resource.Capital],
        effectType: EffectType.Speed,
        additive: () => 1 * objects[Building.Digger].getEffectiveValue()
    },
    [Research.SeedDiversity]: {
        affects: [Building.Crops],
        effectType: EffectType.Power,
        requirements: () => objects[Research.SeedDiversity].isCompleted(),
        multiplicative: () => 2 + objects[Building.Fields].getEffectiveValue() * 0.1
    },
    [Research.Fences]: {
        affects: [Building.Fields],
        effectType: EffectType.Power,
        requirements: () => objects[Research.Fences].isCompleted(),
        multiplicative: () => 2 + objects[Building.Barns].getEffectiveValue() * 0.1
    },
    [Research.Sheds]: {
        affects: [Building.Fields],
        effectType: EffectType.Power,
        requirements: () => objects[Research.Fences].isCompleted(),
        multiplicative: () => 2 + objects[Building.Barns].getEffectiveValue() * 0.1
    },
    [Resource.Population]: {
        affects: Object.values(Building),
        effectType: EffectType.Speed,
        multiplicative: () => Math.pow(Math.floor(objects[Resource.Population].getEffectiveValue()), 0.75)
    },
    [Resource.Science]: {
        affects: Object.values(Research),
        effectType: EffectType.Speed,
        multiplicative: () => Math.pow(Math.floor(objects[Resource.Science].getEffectiveValue()), 0.75)
    },
}

const metadata = {
    [Division.Economy]: {

    },

        [Category.Growth]: {
            [Info.Division]: Division.Economy,
            "headerColor": "rgb(38, 136, 38)",
            "headerData": {
                "category": "Growth",
                "level": "Expansions",
                "effect": "Effect",
                "xpGain": "Pace",
                "xpLeft": "Remaining"
            },
        },

            [Building.Crops]: {
                [Info.Category]: Category.Growth,
            },
            [Building.Fields]: {
                [Info.Category]: Category.Growth,
            },
            [Building.Barns]: {
                [Info.Category]: Category.Growth,
            },
            [Building.Silos]: {
                [Info.Category]: Category.Growth,
            },

        [Category.Discovery]: {
            [Info.Division]: Division.Economy,
            "headerColor": "#0892D0",
            "headerData": {
                "category": "Discovery",
                "level": "Movements",
                "effect": "Effect",
                "xpGain": "Pace",
                "xpLeft": "Remaining",
            },
        },

            [Building.Learner]: {
                [Info.Category]: Category.Discovery,
            },
            
        [Category.Power]: {
            [Info.Division]: Division.Economy,
            "headerColor": "rgb(150,50,50)",
            "headerData": {
                "category": "Power",
                "level": "Depth",
                "effect": "Effect",
                "xpGain": "Pace",
                "xpLeft": "Remaining",
            },
        },

            [Building.Digger]: {
                [Info.Category]: Category.Power,
            },

    [Division.Technology]: {

    },
        [Category.Agriculture]: {
            [Info.Division]: Division.Technology,
            "headerColor": "rgb(38, 136, 38)",
            "headerData": {
                "category": "Agriculture",
                "level": "Status",
                "effect": "Effect",
                "xpGain": "Pace",
                "xpLeft": "Remaining",
            },
        },
            [Research.SeedDiversity]: {
                [Info.Category]: Category.Agriculture,
            },
            [Research.Fences]: {
                [Info.Category]: Category.Agriculture,
            },
            [Research.Sheds]: {
                [Info.Category]: Category.Agriculture,
            },

    [Division.Military]: {

    },

        [Category.Infantry]: {
            [Info.Division]: Division.Military,
            "headerColor": "rgb(138, 68, 68)",
            "headerData": {
                "category": "Infantry",
                "level": "Troops",
                "effect": "Effect",
                "xpGain": "Pace",
                "xpLeft": "Remaining",
            },
        },

            [Unit.Clubsman]: {
                [Info.Category]: Category.Infantry
            },

        [Category.Ranged]: {
            [Info.Division]: Division.Military,
            "headerColor": "rgb(38, 136, 38)",
            "headerData": {
                "category": "Agriculture",
                "level": "Status",
                "effect": "Effect",
                "xpGain": "Pace",
                "xpLeft": "Remaining",
            },
        },

        [Category.Cavalry]: {
            [Info.Division]: Division.Military,
            "headerColor": "rgb(38, 136, 38)",
            "headerData": {
                "category": "Agriculture",
                "level": "Status",
                "effect": "Effect",
                "xpGain": "Pace",
                "xpLeft": "Remaining",
            },
        },

    [Resource.Time]: {

    },
    [Resource.Population]: {

    },
    [Resource.Science]: {

    },
    [Resource.Capital]: {

    },
    [Resource.Rebirths]: {

    },
    [Augments.Intuition]: {

    },
}

function getCategories(division: Division) {
    let children = [] as Category[]
    for (let k in metadata) {
        let objectKey = k as keyof typeof metadata
        let objectMeta = metadata[objectKey]
        if (Info.Division in objectMeta) {
            if (objectMeta[Info.Division] == division) {
                children.push(objectKey as Category)
            }
        }
    }
    return children
}

function getFeatures(parent: Category | Division) {
    let children = [] as HierarchicalFeature[]
    for (let k in metadata) {
        let objectKey = k as keyof typeof metadata
        let objectMeta = metadata[objectKey]
        if (Info.Category in objectMeta) {
            if (Object.values(Category).includes(parent as Category)) {
                if (objectMeta[Info.Category] == parent) {
                    children.push(objectKey as HierarchicalFeature)
                }
            } else {
                if (metadata[objectMeta[Info.Category]][Info.Division] == parent) {
                    children.push(objectKey as HierarchicalFeature)
                }
            }
        }
    }
    return children
}

function getDivision(feature: (HierarchicalFeature) | Category): Division {
    if (Object.values(Category).includes(feature as Category)) {
        return metadata[feature as Category][Info.Division]
    }
    let category = metadata[feature as (HierarchicalFeature)][Info.Category]
    return metadata[category][Info.Division]
}

function getCategory(feature: HierarchicalFeature): Category {
    return metadata[feature][Info.Category]
}

function getButton(division: Division) {
    let id = `${division.toLowerCase()}Button`
    return document.getElementById(id) as HTMLDivElement
}

function getTable(division: Division) {
    let id = `${division.toLowerCase()}Table`
    return document.getElementById(id) as HTMLTableElement
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

function select(progression: HierarchicalFeature) {
    let div = getDivision(progression)
    if (div == Division.Economy) {
        selectBuilding(progression as Building)
    } else if (div == Division.Technology) {
        selectResearch(progression as Research)
    } else if (div == Division.Military) {
        selectUnit(progression as Unit)
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

function selectUnit(unit: Unit) {
    for (let trait of Object.values(Research)) {
        objects[trait].selected = false
    }
    objects[unit].select()
}

function createEffect(sourceKey: Feature, receiverKeys: Feature[], effectData: {
    affects: Feature[],
    effectType: EffectType,
    requirements?: Requirement | (() => boolean)
    additive?: () => number,
    multiplcative?: () => number,
    exponential?: () => number,
}, exclude = [] as Feature[]) {

    let effect = new Effect(sourceKey, receiverKeys, effectData)
    let source = objects[sourceKey]
    for (let k of receiverKeys) {
        let key = k as Feature
        if (key in exclude) {
            continue
        }
        source.sendAffect(key, effect)
    }
}

function createAllEffects() {
    for (let k in effectData) {
        let key = k as keyof typeof effectData
        let data = effectData[key]
        createEffect(key, data.affects, data)
    }
}

function categoryUnlocked(c: Category) {
    for (let t of getFeatures(c)) {
        let traitKey = t as keyof typeof objects
        if (objects[traitKey].isUnlocked()) {
            return true
        }
    }
    return false
}

function divisionUnlocked(d: Division) {
    for (let t of getFeatures(d)) {
        let traitKey = t as keyof typeof objects
        if (objects[traitKey].isUnlocked()) {
            return true
        }
    }
    return false
}

function updateDivisions() {
    for (let d of Object.values(Division)) {
        if (divisionUnlocked(d)) {
            getButton(d)!.classList.remove("hidden")
        } else {
            getButton(d)!.classList.add("hidden")
        }
    }
}

function updateCategories() {
    for (let c of Object.values(Category)) {
        if (categoryUnlocked(c)) {
            document.getElementById(c.toLowerCase())!.classList.remove("hidden")
        } else {
            document.getElementById(c.toLowerCase())!.classList.add("hidden")
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
    for (let t of getFeatures(category)) {
        let traitKey = t as keyof typeof objects
        if (objects[traitKey].isUnlocked()) {
            unlocked = true
        }
    }
    if (!unlocked) {
        headerRow.classList.add("hidden")
    }
    headerRow.style.backgroundColor = metadata[category]["headerColor"]
    headerRow.style.color = "#FFFFFF"
    headerRow.id = category.toLowerCase()
    let division = getDivision(category)
    var HTMLTable = getTable(division)
    HTMLTable?.append(headerRow)
    return headerRow
}

function createRow(attribute: HierarchicalFeature) {
    var template = document.getElementById("rowTemplate") as HTMLTemplateElement
    var row = template.content.firstElementChild!.cloneNode(true) as HTMLTableRowElement
    var obj = objects[attribute]
    row.id = obj.getID()
    row.getElementsByClassName("name")[0].textContent = obj.getName()
    var button = row.getElementsByClassName("progressBar")[0] as HTMLDivElement
    button.onclick = () => select(attribute)
    if (!obj.isUnlocked()) {
        row.classList.add("hidden")
    }
    let division = getDivision(attribute)
    if (division != null) {
        var HTMLTable = getTable(division)
        HTMLTable?.append(row)
    }
    return row
}

function createRowsFromCategory(category: Category) {
    for (let trait of getFeatures(category)) {
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
        tab.classList.add("hidden")
    }
    
    element.classList.add("w3-blue-gray")
    selected!.classList.remove("hidden")
    
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

function resetGame() {
    for (let k in objects) {
        let key = k as keyof typeof objects
        objects[key].hardReset()
    }
    selectBuilding(Building.Crops)
}

createAllRows()
createAllEffects()
selectBuilding(Building.Crops)
setTab(document.getElementById("economyButton") as HTMLSpanElement, "economy")
load()
setInterval(update, 1000 / updateSpeed)
setInterval(save, 3000)
