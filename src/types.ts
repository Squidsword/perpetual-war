enum Info {
    Division = "DIVISION",
    Category = "CATEGORY",
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
    Clubsman = "CLUBSMAN",
    Slinger = "SLINGER",
}

enum Augments {
    Intuition = "Intuition"
}

enum EconomyCategory {
    Growth = "GROWTH",
    Discovery = "DISCOVERY",
    Power = "POWER"
}

enum TechnologyCategory {
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

enum EventName {
    SmallWave = "SMALL_WAVE",
    BigWave = "BIG_WAVE",
}

type Category = EconomyCategory | TechnologyCategory | MilitaryCategory
type General = Info | Division | Resource | Building | Augments | Research | Category | EffectType | Unit
type Hierarchical = Division | Category | Research | Building | Unit
type Feature = Resource | Research | Building | Unit
type HierarchicalFeature = Hierarchical & Feature
 
function categoryValues() {
    return (Object.values(EconomyCategory) as Category[]).concat(Object.values(TechnologyCategory)).concat(Object.values(MilitaryCategory)) 
}
