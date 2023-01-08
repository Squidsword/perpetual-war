enum Info {
    Division = "DIVISION",
    Category = "CATEGORY",
}

enum BattleInfo {
    Category = "CATEGORY",
    Health = "HEALTH",
    Attack = "ATTACK",
    Defense = "DEFENSE",
    Range = "RANGE",
    Speed =  "SPEED"
}

enum EnemyUnit {
    Clubsman = "CLUBSMAN"
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
    Silos = "SILOS",

    Learner = "LEARNER",

    Digger = "DIGGER",
}

enum Research {
    SeedDiversity = "SEED_DIVERSITY",
    Fences = "FENCES",
    Sheds = "SHEDS",
}

enum Unit {
    Clubsman = "CLUBSMAN"
}

enum Augments {
    Intuition = "Intuition"
}

enum Category {
    Growth = "GROWTH",
    Discovery = "DISCOVERY",
    Power = "POWER",

    Agriculture = "AGRIGULTURE",

    Infantry = "INFANTRY",
    Ranged = "RANGED",
    Cavalry = "CAVALRY"
}

enum EffectType {
    Power = "POWER",
    Speed = "SPEED"
}

type General = Info | Division | Resource | Building | Augments | Research | Category | EffectType | Unit
type Hierarchical = Division | Category | Research | Building | Unit
type Feature = Resource | Research | Building | Unit
type HierarchicalFeature = Hierarchical & Feature
 