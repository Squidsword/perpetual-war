enum BattleInfo {
    Category = "CATEGORY",
    MaxHealth = "MAX_HEALTH",
    Attack = "ATTACK",
    AttackSpeed = "ATTACK_SPEED",
    Defense = "DEFENSE",
    Range = "RANGE",
    Speed =  "SPEED"
}

enum CommanderName {
    Player = "PLAYER",
    Enemy = "ENEMY",
}

enum Command {
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
    Scout = "HORSEMAN",
}

type BattleCategory = BattleInfantry | BattleRanged | BattleCavalry