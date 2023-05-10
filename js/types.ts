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

enum EconomyCategory {
    Growth = "GROWTH",
    Discovery = "DISCOVERY",
    Power = "POWER"
}

enum ResearchCategory {
    Agriculture = "AGRIGULTURE",
}

enum MilitaryCategory {
    Infantry = "INFANTRY",
    Ranged = "RANGED",
    Cavalry = "CAVALRY"
}

enum EffectType {
    Power = "POWER",
    Speed = "SPEED"
}

type Category = EconomyCategory | ResearchCategory | MilitaryCategory
type General = Info | Division | Resource | Building | Augments | Research | Category | EffectType | Unit
type Hierarchical = Division | Category | Research | Building | Unit
type Feature = Resource | Research | Building | Unit
type HierarchicalFeature = Hierarchical & Feature
 
function categoryValues() {
    return (Object.values(EconomyCategory) as Category[]).concat(Object.values(ResearchCategory)).concat(Object.values(MilitaryCategory)) 
}