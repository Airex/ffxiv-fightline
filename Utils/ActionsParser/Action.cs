// // <copyright file="Action.cs" company="ZoralLabs">
// //   Copyright (c) 2018-2022 Zoral Limited. All Rights Reserved.
// //   This software licensed under exclusive legal right of the copyright holder
// //   with the intent that the licensee is given the right to use the software
// //   only under certain conditions, and restricted from other uses, such as
// //   sharing, redistribution, or reverse engineering.
// // </copyright>

namespace ActionsParser;

// Root myDeserializedClass = JsonConvert.DeserializeObject<Root>(myJsonResponse);
    public class ActionCategory
    {
        public int ID { get; set; }
        public string Name { get; set; }
        public string Name_de { get; set; }
        public string Name_en { get; set; }
        public string Name_fr { get; set; }
        public string Name_ja { get; set; }
    }

    public class JobAction
    {
        public ActionCategory ActionCategory { get; set; }
        public string ActionCategoryTarget { get; set; }
        public int ActionCategoryTargetID { get; set; }
        public object ActionCombo { get; set; }
        public string ActionComboTarget { get; set; }
        public int ActionComboTargetID { get; set; }
        public string ActionProcStatusTarget { get; set; }
        public int ActionProcStatusTargetID { get; set; }
        public string ActionTimelineHitTarget { get; set; }
        public int ActionTimelineHitTargetID { get; set; }
        public int AdditionalCooldownGroup { get; set; }
        public int AffectsPosition { get; set; }
        public string AnimationEndTarget { get; set; }
        public int AnimationEndTargetID { get; set; }
        public object AnimationStart { get; set; }
        public string AnimationStartTarget { get; set; }
        public int AnimationStartTargetID { get; set; }
        public int Aspect { get; set; }
        public string AttackTypeTarget { get; set; }
        public int AttackTypeTargetID { get; set; }
        public int BehaviourType { get; set; }
        public int CanTargetDead { get; set; }
        public int CanTargetFriendly { get; set; }
        public int CanTargetHostile { get; set; }
        public int CanTargetParty { get; set; }
        public int CanTargetSelf { get; set; }
        public int Cast100ms { get; set; }
        public int CastType { get; set; }
        public string ClassJobCategoryTarget { get; set; }
        public int ClassJobCategoryTargetID { get; set; }
        public int ClassJobLevel { get; set; }
        public string ClassJobTarget { get; set; }
        public int ClassJobTargetID { get; set; }
        public int CooldownGroup { get; set; }
        public string Description { get; set; }
        public int EffectRange { get; set; }
        public int ID { get; set; }
        public string Icon { get; set; }
        public string IconHD { get; set; }
        public int IconID { get; set; }
        public int IsPlayerAction { get; set; }
        public int IsPvP { get; set; }
        public int IsRoleAction { get; set; }
        public int MaxCharges { get; set; }
        public string Name { get; set; }
        public string Name_de { get; set; }
        public string Name_en { get; set; }
        public string Name_fr { get; set; }
        public string Name_ja { get; set; }
        public object Omen { get; set; }
        public string OmenTarget { get; set; }
        public int OmenTargetID { get; set; }
        public int? Patch { get; set; }
        public int PreservesCombo { get; set; }
        public int PrimaryCostType { get; set; }
        public int PrimaryCostValue { get; set; }
        public int Range { get; set; }
        public int Recast100ms { get; set; }
        public int SecondaryCostType { get; set; }
        public int SecondaryCostValue { get; set; }
        public object StatusGainSelf { get; set; }
        public string StatusGainSelfTarget { get; set; }
        public int StatusGainSelfTargetID { get; set; }
        public int TargetArea { get; set; }
        public int UnlockLink { get; set; }
        public string Url { get; set; }
        public object VFX { get; set; }
        public string VFXTarget { get; set; }
        public int VFXTargetID { get; set; }
        public int XAxisModifier { get; set; }
    }
