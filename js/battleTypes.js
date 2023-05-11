"use strict";
var BattleInfo;
(function (BattleInfo) {
    BattleInfo["Category"] = "CATEGORY";
    BattleInfo["MaxHealth"] = "MAX_HEALTH";
    BattleInfo["Attack"] = "ATTACK";
    BattleInfo["AttackSpeed"] = "ATTACK_SPEED";
    BattleInfo["Defense"] = "DEFENSE";
    BattleInfo["Range"] = "RANGE";
    BattleInfo["Speed"] = "SPEED";
})(BattleInfo || (BattleInfo = {}));
var CommanderName;
(function (CommanderName) {
    CommanderName["Player"] = "PLAYER";
    CommanderName["Enemy"] = "ENEMY";
})(CommanderName || (CommanderName = {}));
var Command;
(function (Command) {
    Command["Charge"] = "CHARGE";
    Command["Hold"] = "HOLD";
})(Command || (Command = {}));
var BattleInfantry;
(function (BattleInfantry) {
    BattleInfantry["Clubsman"] = "CLUBSMAN";
})(BattleInfantry || (BattleInfantry = {}));
var BattleRanged;
(function (BattleRanged) {
    BattleRanged["Slinger"] = "SLINGER";
})(BattleRanged || (BattleRanged = {}));
var BattleCavalry;
(function (BattleCavalry) {
    BattleCavalry["Scout"] = "HORSEMAN";
})(BattleCavalry || (BattleCavalry = {}));
