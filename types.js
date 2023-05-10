"use strict";
var Info;
(function (Info) {
    Info["Division"] = "DIVISION";
    Info["Category"] = "CATEGORY";
})(Info || (Info = {}));
var Division;
(function (Division) {
    Division["Economy"] = "ECONOMY";
    Division["Technology"] = "TECHNOLOGY";
    Division["Military"] = "MILITARY";
})(Division || (Division = {}));
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
    Building["Silos"] = "SILOS";
    Building["Learner"] = "LEARNER";
    Building["Digger"] = "DIGGER";
})(Building || (Building = {}));
var Research;
(function (Research) {
    Research["SeedDiversity"] = "SEED_DIVERSITY";
    Research["Fences"] = "FENCES";
    Research["Sheds"] = "SHEDS";
})(Research || (Research = {}));
var Unit;
(function (Unit) {
    Unit["Clubsman"] = "CLUBSMAN";
})(Unit || (Unit = {}));
var Augments;
(function (Augments) {
    Augments["Intuition"] = "Intuition";
})(Augments || (Augments = {}));
var EconomyCategory;
(function (EconomyCategory) {
    EconomyCategory["Growth"] = "GROWTH";
    EconomyCategory["Discovery"] = "DISCOVERY";
    EconomyCategory["Power"] = "POWER";
})(EconomyCategory || (EconomyCategory = {}));
var TechnologyCategory;
(function (TechnologyCategory) {
    TechnologyCategory["Agriculture"] = "AGRIGULTURE";
})(TechnologyCategory || (TechnologyCategory = {}));
var MilitaryCategory;
(function (MilitaryCategory) {
    MilitaryCategory["Infantry"] = "INFANTRY";
    MilitaryCategory["Ranged"] = "RANGED";
    MilitaryCategory["Cavalry"] = "CAVALRY";
})(MilitaryCategory || (MilitaryCategory = {}));
var EffectType;
(function (EffectType) {
    EffectType["Power"] = "POWER";
    EffectType["Speed"] = "SPEED";
})(EffectType || (EffectType = {}));
function categoryValues() {
    return Object.values(EconomyCategory).concat(Object.values(TechnologyCategory)).concat(Object.values(MilitaryCategory));
}
