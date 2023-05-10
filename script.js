"use strict";
const baseData = {
    [Building.Crops]: {
        maxXp: 50,
        scaling: (level) => Math.pow(1.02, level) + 1 * level,
    },
    [Building.Fields]: {
        requirements: () => objects[Building.Crops].getValue() >= 5,
        maxXp: 2000,
        scaling: (level) => Math.pow(1.04, level) + 0.5 * level,
    },
    [Building.Barns]: {
        requirements: () => objects[Building.Fields].getValue() >= 10,
        maxXp: 20000,
        scaling: (level) => Math.pow(1.06, level) + 0.5 * level,
    },
    [Building.Silos]: {
        requirements: () => objects[Building.Barns].getValue() >= 10,
        maxXp: 200000,
        scaling: (level) => Math.pow(1.08, level) + 0.5 * level,
    },
    [Building.Learner]: {
        requirements: () => objects[Resource.Population].getValue() >= 100,
        maxXp: 2000,
        scaling: (level) => Math.pow(1.02, level) + 0.5 * level,
    },
    [Building.Digger]: {
        requirements: () => objects[Resource.Population].getValue() >= 10000,
        maxXp: 100000,
        scaling: (level) => Math.pow(1.02, level) + 0.5 * level,
    },
    [Research.SeedDiversity]: {
        requirements: () => objects[Building.Fields].getValue() >= 5,
        requiredXp: 5000,
    },
    [Research.Fences]: {
        requirements: () => objects[Building.Fields].getValue() >= 10,
        requiredXp: 50000,
    },
    [Research.Sheds]: {
        requirements: () => objects[Building.Barns].getValue() >= 10,
        requiredXp: 2000000,
    },
    [Resource.Time]: {
        baseIncome: 365 / 600,
        display: setTimeDisplay
    },
    [Resource.Population]: {
        amount: 1,
    },
    [Resource.Science]: {
        requirements: () => objects[Resource.Population].getValue() >= 100,
    },
    [Resource.Capital]: {
        requirements: () => objects[Resource.Population].getValue() >= 10000,
        display: setCapitalDisplay
    },
    [Resource.Rebirths]: {},
    [Unit.Clubsman]: {
        requirements: () => objects[Resource.Population].getValue() >= 10000,
        maxXp: 300,
        cost: [Resource.Capital, 200]
    }
};
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
};
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
        multiplicative: () => 2 + objects[Building.Fields].getEffectiveValue() * 0.05
    },
    [Research.Fences]: {
        affects: [Building.Fields],
        effectType: EffectType.Power,
        requirements: () => objects[Research.Fences].isCompleted(),
        multiplicative: () => 2 + objects[Building.Barns].getEffectiveValue() * 0.05
    },
    [Research.Sheds]: {
        affects: [Building.Barns],
        effectType: EffectType.Power,
        requirements: () => objects[Research.Sheds].isCompleted(),
        multiplicative: () => 2 + objects[Building.Silos].getEffectiveValue() * 0.05
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
};
const metadata = {
    [Division.Economy]: {},
    [EconomyCategory.Growth]: {
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
        [Info.Category]: EconomyCategory.Growth,
    },
    [Building.Fields]: {
        [Info.Category]: EconomyCategory.Growth,
    },
    [Building.Barns]: {
        [Info.Category]: EconomyCategory.Growth,
    },
    [Building.Silos]: {
        [Info.Category]: EconomyCategory.Growth,
    },
    [EconomyCategory.Discovery]: {
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
        [Info.Category]: EconomyCategory.Discovery,
    },
    [EconomyCategory.Power]: {
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
        [Info.Category]: EconomyCategory.Power,
    },
    [Division.Technology]: {},
    [TechnologyCategory.Agriculture]: {
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
        [Info.Category]: TechnologyCategory.Agriculture,
    },
    [Research.Fences]: {
        [Info.Category]: TechnologyCategory.Agriculture,
    },
    [Research.Sheds]: {
        [Info.Category]: TechnologyCategory.Agriculture,
    },
    [Division.Military]: {},
    [MilitaryCategory.Infantry]: {
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
        [Info.Category]: MilitaryCategory.Infantry
    },
    [MilitaryCategory.Ranged]: {
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
    [MilitaryCategory.Cavalry]: {
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
    [Resource.Time]: {},
    [Resource.Population]: {},
    [Resource.Science]: {},
    [Resource.Capital]: {},
    [Resource.Rebirths]: {},
    [Augments.Intuition]: {},
};
function getCategories(division) {
    let children = [];
    for (let k in metadata) {
        let objectKey = k;
        let objectMeta = metadata[objectKey];
        if (Info.Division in objectMeta) {
            if (objectMeta[Info.Division] == division) {
                children.push(objectKey);
            }
        }
    }
    return children;
}
function getFeatures(parent) {
    let children = [];
    for (let k in metadata) {
        let objectKey = k;
        let objectMeta = metadata[objectKey];
        if (Info.Category in objectMeta) {
            if (categoryValues().includes(parent)) {
                if (objectMeta[Info.Category] == parent) {
                    children.push(objectKey);
                }
            }
            else {
                if (metadata[objectMeta[Info.Category]][Info.Division] == parent) {
                    children.push(objectKey);
                }
            }
        }
    }
    return children;
}
function getDivision(feature) {
    if (categoryValues().includes(feature)) {
        return metadata[feature][Info.Division];
    }
    let category = metadata[feature][Info.Category];
    return metadata[category][Info.Division];
}
function getCategory(feature) {
    return metadata[feature][Info.Category];
}
function getButton(division) {
    let id = `${division.toLowerCase()}Button`;
    return document.getElementById(id);
}
function getTable(division) {
    let id = `${division.toLowerCase()}Table`;
    return document.getElementById(id);
}
const updateSpeed = 20;
const baseGameSpeed = 1;
const units = ["", "k", "M", "B", "T", "Qa", "Qi", "Sx", "Sp", "Oc", "Nn"];
function update() {
    updateObjects();
    updateCategories();
    updateDivisions();
    battleUpdate();
}
function select(progression) {
    let div = getDivision(progression);
    if (div == Division.Economy) {
        selectBuilding(progression);
    }
    else if (div == Division.Technology) {
        selectResearch(progression);
    }
    else if (div == Division.Military) {
        selectUnit(progression);
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
function selectUnit(unit) {
    for (let trait of Object.values(Research)) {
        objects[trait].selected = false;
    }
    objects[unit].select();
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
    for (let t of getFeatures(c)) {
        let traitKey = t;
        if (objects[traitKey].isUnlocked()) {
            return true;
        }
    }
    return false;
}
function divisionUnlocked(d) {
    for (let t of getFeatures(d)) {
        let traitKey = t;
        if (objects[traitKey].isUnlocked()) {
            return true;
        }
    }
    return false;
}
function updateDivisions() {
    for (let d of Object.values(Division)) {
        if (divisionUnlocked(d)) {
            getButton(d).classList.remove("hidden");
        }
        else {
            getButton(d).classList.add("hidden");
        }
    }
}
function updateObjects() {
    for (let keyString in objects) {
        let key = keyString;
        objects[key].update();
    }
}
function updateCategories() {
    for (let c of categoryValues()) {
        if (categoryUnlocked(c)) {
            document.getElementById(c.toLowerCase()).classList.remove("hidden");
        }
        else {
            document.getElementById(c.toLowerCase()).classList.add("hidden");
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
    for (let t of getFeatures(category)) {
        let traitKey = t;
        if (objects[traitKey].isUnlocked()) {
            unlocked = true;
        }
    }
    if (!unlocked) {
        headerRow.classList.add("hidden");
    }
    headerRow.style.backgroundColor = metadata[category]["headerColor"];
    headerRow.style.color = "#FFFFFF";
    headerRow.id = category.toLowerCase();
    let division = getDivision(category);
    var HTMLTable = getTable(division);
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
        row.classList.add("hidden");
    }
    let division = getDivision(attribute);
    if (division != null) {
        var HTMLTable = getTable(division);
        HTMLTable === null || HTMLTable === void 0 ? void 0 : HTMLTable.append(row);
    }
    return row;
}
function createRowsFromCategory(category) {
    for (let trait of getFeatures(category)) {
        createRow(trait);
    }
}
function createAllRows() {
    for (let category of categoryValues()) {
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
        tab.classList.add("hidden");
    }
    element.classList.add("w3-blue-gray");
    selected.classList.remove("hidden");
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
    for (let k in objects) {
        let key = k;
        objects[key].hardReset();
    }
    selectBuilding(Building.Crops);
}
createAllRows();
createAllEffects();
selectBuilding(Building.Crops);
setTab(document.getElementById("economyButton"), "economy");
load();
setInterval(update, 1000 / updateSpeed);
setInterval(save, 3000);
