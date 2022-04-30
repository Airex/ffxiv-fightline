namespace ActionsParser;

// Root myDeserializedClass = JsonConvert.DeserializeObject<Root>(myJsonResponse);
    public class ClassJobParent
    {
        public string Abbreviation { get; set; }
        public string Abbreviation_de { get; set; }
        public string Abbreviation_en { get; set; }
        public string Abbreviation_fr { get; set; }
        public string Abbreviation_ja { get; set; }
        public int BattleClassIndex { get; set; }
        public int CanQueueForDuty { get; set; }
        public int ClassJobCategory { get; set; }
        public int DohDolJobIndex { get; set; }
        public int ExpArrayIndex { get; set; }
        public int ID { get; set; }
        public string Icon { get; set; }
        public int IsLimitedJob { get; set; }
        public int ItemSoulCrystal { get; set; }
        public int ItemStartingWeapon { get; set; }
        public int JobIndex { get; set; }
        public int LimitBreak1 { get; set; }
        public int LimitBreak2 { get; set; }
        public int LimitBreak3 { get; set; }
        public int ModifierDexterity { get; set; }
        public int ModifierHitPoints { get; set; }
        public int ModifierIntelligence { get; set; }
        public int ModifierManaPoints { get; set; }
        public int ModifierMind { get; set; }
        public int ModifierPiety { get; set; }
        public int ModifierStrength { get; set; }
        public int ModifierVitality { get; set; }
        public int MonsterNote { get; set; }
        public string Name { get; set; }
        public string NameEnglish { get; set; }
        public string NameEnglish_de { get; set; }
        public string NameEnglish_en { get; set; }
        public string NameEnglish_fr { get; set; }
        public string NameEnglish_ja { get; set; }
        public string Name_de { get; set; }
        public string Name_en { get; set; }
        public string Name_fr { get; set; }
        public string Name_ja { get; set; }
        public int PartyBonus { get; set; }
        public int Prerequisite { get; set; }
        public int PrimaryStat { get; set; }
        public int PvPActionSortRow { get; set; }
        public int RelicQuest { get; set; }
        public int Role { get; set; }
        public int StartingLevel { get; set; }
        public int StartingTown { get; set; }
        public int UIPriority { get; set; }
        public int UnlockQuest { get; set; }
    }

    public class Action
    {
        public List<int> ClassJob { get; set; }
    }

    public class GameContentLinks
    {
        public Action Action { get; set; }
    }

    public class ClassJob
    {
        public string Abbreviation { get; set; }
        public string Abbreviation_de { get; set; }
        public string Abbreviation_en { get; set; }
        public string Abbreviation_fr { get; set; }
        public string Abbreviation_ja { get; set; }
        public int BattleClassIndex { get; set; }
        public int CanQueueForDuty { get; set; }
        public string ClassJobCategoryTarget { get; set; }
        public int ClassJobCategoryTargetID { get; set; }
        public ClassJobParent? ClassJobParent { get; set; }
        public string ClassJobParentTarget { get; set; }
        public int ClassJobParentTargetID { get; set; }
        public int DohDolJobIndex { get; set; }
        public int ExpArrayIndex { get; set; }
        public GameContentLinks GameContentLinks { get; set; }
        public int ID { get; set; }
        public string Icon { get; set; }
        public int IsLimitedJob { get; set; }
        public string ItemSoulCrystalTarget { get; set; }
        public int ItemSoulCrystalTargetID { get; set; }
        public object ItemStartingWeapon { get; set; }
        public string ItemStartingWeaponTarget { get; set; }
        public int ItemStartingWeaponTargetID { get; set; }
        public int JobIndex { get; set; }
        public string LimitBreak1Target { get; set; }
        public int LimitBreak1TargetID { get; set; }
        public string LimitBreak2Target { get; set; }
        public int LimitBreak2TargetID { get; set; }
        public string LimitBreak3Target { get; set; }
        public int LimitBreak3TargetID { get; set; }
        public int ModifierDexterity { get; set; }
        public int ModifierHitPoints { get; set; }
        public int ModifierIntelligence { get; set; }
        public int ModifierManaPoints { get; set; }
        public int ModifierMind { get; set; }
        public int ModifierPiety { get; set; }
        public int ModifierStrength { get; set; }
        public int ModifierVitality { get; set; }
        public object MonsterNote { get; set; }
        public string MonsterNoteTarget { get; set; }
        public int MonsterNoteTargetID { get; set; }
        public string Name { get; set; }
        public string NameEnglish { get; set; }
        public string NameEnglish_de { get; set; }
        public string NameEnglish_en { get; set; }
        public string NameEnglish_fr { get; set; }
        public string NameEnglish_ja { get; set; }
        public string Name_de { get; set; }
        public string Name_en { get; set; }
        public string Name_fr { get; set; }
        public string Name_ja { get; set; }
        public int PartyBonus { get; set; }
        public object Patch { get; set; }
        public string PrerequisiteTarget { get; set; }
        public int PrerequisiteTargetID { get; set; }
        public int PrimaryStat { get; set; }
        public int PvPActionSortRow { get; set; }
        public string RelicQuestTarget { get; set; }
        public int RelicQuestTargetID { get; set; }
        public int Role { get; set; }
        public int StartingLevel { get; set; }
        public object StartingTown { get; set; }
        public string StartingTownTarget { get; set; }
        public int StartingTownTargetID { get; set; }
        public int UIPriority { get; set; }
        public string UnlockQuestTarget { get; set; }
        public int UnlockQuestTargetID { get; set; }
        public string Url { get; set; }
    }

