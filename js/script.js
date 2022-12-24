"use strict";
var Info;
(function (Info) {
    Info["Division"] = "DIVISION";
    Info["Resource"] = "RESOURCE";
    Info["Children"] = "CHILDREN";
    Info["Category"] = "CATEGORY";
    Info["Object"] = "OBJECT";
    Info["BaseData"] = "BASEDATA";
})(Info || (Info = {}));
var Division;
(function (Division) {
    Division["Economy"] = "ECONOMY";
    Division["Technology"] = "TECHNOLOGY";
    Division["Military"] = "MILITARY";
})(Division || (Division = {}));
var EffectType;
(function (EffectType) {
    EffectType["Power"] = "POWER";
    EffectType["Speed"] = "SPEED";
})(EffectType || (EffectType = {}));
var Resource;
(function (Resource) {
    Resource["Time"] = "TIME";
    Resource["Population"] = "POPULATION";
    Resource["Capital"] = "CAPITAL";
    Resource["Science"] = "SCIENCE";
    Resource["Rebirths"] = "REBIRTHS";
})(Resource || (Resource = {}));
var Building;
(function (Building) {
    Building["Crops"] = "CROPS";
    Building["Fields"] = "FIELDS";
    Building["Barns"] = "BARNS";
    Building["Learner"] = "LEARNER";
})(Building || (Building = {}));
var Research;
(function (Research) {
    Research["SeedDiversity"] = "SEED_DIVERSITY";
})(Research || (Research = {}));
var Category;
(function (Category) {
    Category["Growth"] = "GROWTH";
    Category["Discovery"] = "DISCOVERY";
    Category["Agriculture"] = "AGRIGULTURE";
})(Category || (Category = {}));
const baseData = {
    [Building.Crops]: {
        type: Building.Crops,
        maxXp: 100,
        scaling: (level) => Math.pow(1.01, level) + 0.2 * level,
    },
    [Building.Fields]: {
        requirements: new RequirementList([new Requirement(Building.Crops, 5)]),
        type: Building.Fields,
        maxXp: 2000,
        scaling: (level) => Math.pow(1.02, level) + 0.35 * level,
    },
    [Building.Barns]: {
        requirements: new RequirementList([new Requirement(Building.Fields, 10)]),
        type: Building.Barns,
        maxXp: 50000,
        scaling: (level) => Math.pow(1.05, level) + 0.5 * level,
    },
    [Building.Learner]: {
        requirements: new RequirementList([new Requirement(Resource.Population, 100)]),
        type: Building.Learner,
        maxXp: 500,
        scaling: (level) => Math.pow(1.01, level) + 0.2 * level,
    },
    [Research.SeedDiversity]: {
        requirements: new RequirementList([new Requirement(Resource.Population, 100)]),
        type: Research.SeedDiversity,
        maxXp: 1000,
        scaling: (level) => Math.pow(1.01, level) + 0.35 * level,
    },
    [Resource.Time]: {
        type: Resource.Time,
        baseIncome: 365 / 900,
        display: setTimeDisplay
    },
    [Resource.Population]: {
        type: Resource.Population,
        amount: 1,
    },
    [Resource.Science]: {
        type: Resource.Science,
        requirements: new RequirementList([new Requirement(Resource.Population, 100)]),
    },
    [Resource.Capital]: {
        type: Resource.Capital,
        requirements: new RequirementList([new Requirement(Resource.Population, 1000)]),
        display: setCapitalDisplay
    },
    [Resource.Rebirths]: {
        type: Resource.Rebirths,
        amount: 0,
        baseIncome: 0
    },
};
const effectData = {
    [Building.Crops]: {
        affects: [Resource.Population],
        effectType: EffectType.Speed,
        additive: (level, effectiveLevel) => 0.05 * effectiveLevel
    },
    [Building.Fields]: {
        affects: [Building.Crops],
        effectType: EffectType.Power,
        multiplicative: (level, effectiveLevel) => 1 + (effectiveLevel * 0.2)
    },
    [Building.Barns]: {
        affects: [Building.Fields],
        effectType: EffectType.Power,
        multiplicative: (level, effectiveLevel) => 1 + (effectiveLevel * 0.5)
    },
    [Building.Learner]: {
        affects: [Resource.Science],
        effectType: EffectType.Speed,
        additive: (level, effectiveLevel) => 0.01 * effectiveLevel
    },
    [Research.SeedDiversity]: {
        affects: [Building.Crops],
        effectType: EffectType.Power,
        multiplicative: (level, effectiveLevel) => 1 + (level * 0.1)
    },
    [Resource.Population]: {
        affects: Object.values(Building),
        effectType: EffectType.Speed,
        multiplicative: (level, effectiveLevel) => Math.pow(Math.floor(level), 0.75)
    },
    [Resource.Science]: {
        affects: Object.values(Research),
        effectType: EffectType.Speed,
        multiplicative: (level, effectiveLevel) => Math.pow(Math.floor(level), 0.75)
    },
};
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
};
const objects = {
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
};
const updateSpeed = 20;
const baseGameSpeed = 1;
const units = ["", "k", "M", "B", "T", "Qa", "Qi", "Sx", "Sp", "Oc", "Nn"];
function update() {
    for (let keyString in objects) {
        let key = keyString;
        objects[key].update();
    }
    updateCategories();
    updateDivisions();
}
function select(progression) {
    if (metadata[progression][Info.Division] == Division.Economy) {
        selectBuilding(progression);
    }
    else if (metadata[progression][Info.Division] == Division.Technology) {
        selectResearch(progression);
    }
}
function selectBuilding(building) {
    for (let trait of Object.values(Building)) {
        objects[trait].selected = false;
    }
    objects[building].select();
}
function selectResearch(research) {
    for (let trait of Object.values(Research)) {
        objects[trait].selected = false;
    }
    objects[research].select();
}
function createEffect(sourceKey, receiverKeys, effectData, exclude = []) {
    let effect = new Effect(sourceKey, receiverKeys, effectData);
    let source = objects[sourceKey];
    for (let k of receiverKeys) {
        let key = k;
        if (key in exclude) {
            continue;
        }
        source.sendAffect(key, effect);
    }
}
function createAllEffects() {
    for (let k in effectData) {
        let key = k;
        let data = effectData[key];
        createEffect(key, data.affects, data);
    }
}
function categoryUnlocked(c) {
    for (let t of metadata[c][Info.Children]) {
        let traitKey = t;
        if (objects[traitKey].isUnlocked()) {
            return true;
        }
    }
    return false;
}
function divisionUnlocked(d) {
    for (let c of metadata[d][Info.Category]) {
        if (categoryUnlocked(c)) {
            return true;
        }
    }
    return false;
}
function updateDivisions() {
    for (let d of Object.values(Division)) {
        if (divisionUnlocked(d)) {
            metadata[d].button.style.display = "";
        }
        else {
            metadata[d].button.style.display = "none";
        }
    }
}
function updateCategories() {
    for (let c of Object.values(Category)) {
        if (categoryUnlocked(c)) {
            document.getElementById(c.toLowerCase()).style.display = "";
        }
        else {
            document.getElementById(c.toLowerCase()).style.display = "none";
        }
    }
}
function createHeaderRow(category) {
    var template = document.getElementById("headerTemplate");
    var headerRow = template.content.firstElementChild.cloneNode(true);
    var data = metadata[category]["headerData"];
    for (let name in metadata[category]["headerData"]) {
        let key = name;
        headerRow.getElementsByClassName(name)[0].textContent = data[key];
    }
    var unlocked = false;
    for (let t of metadata[category][Info.Children]) {
        let traitKey = t;
        if (objects[traitKey].isUnlocked()) {
            unlocked = true;
        }
    }
    if (!unlocked) {
        headerRow.style.display = "none";
    }
    headerRow.style.backgroundColor = metadata[category]["headerColor"];
    headerRow.style.color = "#FFFFFF";
    headerRow.id = category.toLowerCase();
    let division = metadata[category][Info.Division];
    var HTMLTable = metadata[division]["table"];
    HTMLTable === null || HTMLTable === void 0 ? void 0 : HTMLTable.append(headerRow);
    return headerRow;
}
function createRow(attribute) {
    var template = document.getElementById("rowTemplate");
    var row = template.content.firstElementChild.cloneNode(true);
    var obj = objects[attribute];
    row.id = obj.getID();
    row.getElementsByClassName("name")[0].textContent = obj.getName();
    var button = row.getElementsByClassName("progressBar")[0];
    button.onclick = () => select(attribute);
    if (!obj.isUnlocked()) {
        row.style.display = "none";
    }
    let division = metadata[attribute][Info.Division];
    if (division != null) {
        var HTMLTable = metadata[division]["table"];
        HTMLTable === null || HTMLTable === void 0 ? void 0 : HTMLTable.append(row);
    }
    return row;
}
function createRowsFromCategory(category) {
    for (let trait of metadata[category][Info.Children]) {
        createRow(trait);
    }
}
function createAllRows() {
    for (let category of Object.values(Category)) {
        createHeaderRow(category);
        createRowsFromCategory(category);
    }
}
function removeSpaces(str) {
    return str.replace(/ /g, "");
}
function setDisplay(elementID, text) {
    var elementHTML = document.getElementById(elementID);
    elementHTML.textContent = text;
}
function setTab(element, tabName) {
    var tabButtonsHTML = document.getElementById("tabButtons");
    var tabsHTML = document.getElementById("tabs");
    var selected = document.getElementById(tabName);
    for (let i of tabButtonsHTML.children) {
        let tabButton = i;
        tabButton.classList.remove("w3-blue-gray");
        6;
    }
    for (let i of tabsHTML.children) {
        let tab = i;
        tab.style.display = "none";
    }
    element.classList.add("w3-blue-gray");
    selected.style.display = "block";
}
function round(value, decimals = 0) {
    return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
}
function floor(value, decimals = 0) {
    return Math.floor(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
}
function format(value, decimals = 0) {
    if (value <= 0) {
        return floor(value, decimals).toString();
    }
    var tier = Math.log10(value) / 3 | 0; // bitwise or turns it into an int
    if (tier == 0) {
        return floor(value, decimals).toString();
    }
    var suffix = units[tier];
    return floor(value / Math.pow(10, tier * 3), 1) + suffix;
}
function setCapitalDisplay(capital) {
    var capitalHTML = document.getElementById("capital");
    var tiers = ["p", "g", "s", "c"];
    var colors = {
        "p": "#79b9c7",
        "g": "#E5C100",
        "s": "#a8a8a8",
        "c": "#a15c2f"
    };
    var i = 0;
    for (let tier of tiers) {
        var base = Math.pow(10, (tiers.length - i - 1) * 2);
        var coins = Math.floor(capital / base);
        capital = capital - coins * base;
        var tierHTML = capitalHTML.children[i];
        if (tier == "c") {
            tierHTML.textContent = format(coins) + tier;
        }
        else {
            tierHTML.textContent = coins > 0 && tiers ? format(coins) + tier : "";
        }
        tierHTML.style.color = colors[tier];
        i++;
    }
}
function setTimeDisplay(time) {
    var yearHTML = document.getElementById("year");
    var dayHTML = document.getElementById("day");
    if (yearHTML == null) {
        return;
    }
    if (dayHTML == null) {
        return;
    }
    yearHTML.textContent = `Year ${format(time / 365 + 1)}`;
    dayHTML.textContent = `Day ${format(time % 365 + 1)}`;
}
function applyMultipliers(value, multipliers) {
    for (let m of multipliers) {
        value *= m;
    }
    return value;
}
function getSpeed() {
    return baseGameSpeed;
}
function applySpeed(value) {
    return value / updateSpeed * getSpeed();
}
function save() {
    localStorage.setItem('gameObjects', JSON.stringify(objects));
}
function load() {
    let loadedData = localStorage.getItem('gameObjects');
    if (!loadedData) {
        return;
    }
    let loadedObjects = JSON.parse(loadedData);
    for (let keyString in loadedObjects) {
        let key = keyString;
        objects[key].load(loadedObjects[keyString]);
    }
}
function resetGame() {
}
createAllRows();
createAllEffects();
selectBuilding(Building.Crops);
setTab(document.getElementById("economyButton"), "economy");
load();
setInterval(update, 1000 / updateSpeed);
setInterval(save, 3000);
var canvas = document.querySelector('canvas');
var c = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 500;