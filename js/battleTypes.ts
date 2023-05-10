enum BattleInfo {
    Category = "CATEGORY",
    Health = "HEALTH",
    Attack = "ATTACK",
    AttackSpeed = "ATTACK_SPEED",
    Defense = "DEFENSE",
    Range = "RANGE",
    Speed =  "SPEED"
}

enum BattleState {
    Charge = "CHARGE",
    Hold = "HOLD",
}

enum BattleInfantry {
    Clubsman = "CLUBSMAN",
}

enum BattleRanged {
    Slinger = "SLINGER",
}

enum BattleCavalry {
    Horseman = "HORSEMAN",
}

type BattleUnit = BattleInfantry | BattleRanged | BattleCavalry