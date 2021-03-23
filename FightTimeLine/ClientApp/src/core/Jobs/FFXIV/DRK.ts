import { IJob, DamageType, Role, AbilityType,IAbility } from "../../Models"
import { settings, abilitySortFn, getAbilitiesFrom, tankSharedAbilities, medicine } from "./shared"

export const DRK: IJob = {
  name: "DRK",
  fullName:"Dark Knight",
  role: Role.Tank,
  icon: ("JobIcons/Dark_Knight_Icon_10"),
  abilities: <IAbility[]>[
    {
      name: "Blood Weapon",      
      duration: 10,
      cooldown: 60,
      xivDbId: "3625",
      icon: ("13_DarkKnight/3625_Blood Weapon"),
      abilityType: AbilityType.SelfDamageBuff,
    },
    {
      name: "Flood of Shadow",
      duration: 0,
      cooldown: 1,
      xivDbId: "16469",
      requiresBossTarget: true,
      icon: ("13_DarkKnight/icon_22"),
      abilityType: AbilityType.Damage,
    },
    {
      name: "Edge of Shadow",
      duration: 0,
      cooldown: 1,
      xivDbId: "16470",
      requiresBossTarget: true,
      icon: ("13_DarkKnight/icon_23"),
      abilityType: AbilityType.Damage,
      
    },
    {
      name: "Salted Earth",
      duration: 15,
      cooldown: 90,
      xivDbId: "3639",
      requiresBossTarget: true,
      icon: ("13_DarkKnight/3639_Salted Earth"),
      abilityType: AbilityType.Damage,
    },
    {
      name: "Abyssal Drain",
      duration: 0,
      cooldown: 60,
      xivDbId: "3641",
      requiresBossTarget: true,
      icon: ("13_DarkKnight/3641_Abyssal Drain"),
      abilityType: AbilityType.Damage,
    },
    {
      name: "Plunge",
      duration: 0,
      cooldown: 30,
      xivDbId: "3640",
      requiresBossTarget: true,
      icon: ("13_DarkKnight/3640_Plunge"),
      abilityType: AbilityType.Damage,
      charges: {
        count: 2,
        cooldown: 30
      }
    },
    {
      name: "Carve and Spit",
      duration: 0,
      cooldown: 60,
      xivDbId: "3643",
      requiresBossTarget: true,
      icon: ("13_DarkKnight/3643_Carve And Spit"),
      abilityType: AbilityType.Damage,
    },
    {
      name: "Shadow Wall",
      duration: 15,
      cooldown: 120,
      xivDbId: "3636",
      icon: ("13_DarkKnight/3636_Shadow Wall"),
      damageAffected: DamageType.All,
      goodForTankBusters: true,
      abilityType: AbilityType.SelfDefense,
      defensiveStats: {
        mitigationPercent: 30
      }
    },
    {
      name: "Dark Mind",
      duration: 10,
      cooldown: 60,
      xivDbId: "3634",
      icon: ("13_DarkKnight/3634_Dark Mind"),
      damageAffected: DamageType.Magical,
      goodForTankBusters: true,
      abilityType: AbilityType.SelfDefense,
      defensiveStats: {
        mitigationPercent : 20
      }
    },
    {
      name: "Living Dead",
      duration: 10,
      cooldown: 300,
      xivDbId: "3638",
      icon: ("13_DarkKnight/3638_Living Dead"),
      damageAffected: DamageType.All,
      extendDurationOnNextAbility: 10,
      isUltimateSave: true,
      abilityType: AbilityType.SelfDefense,
      defensiveStats: {
        mitigationPercent: 100
      }
    },
    {
      name: "The Blackest Night",
      duration: 7,
      cooldown: 15,
      xivDbId: "7393",
      icon: ("13_DarkKnight/7393_The Blackest Night"),
      damageAffected: DamageType.All,
      goodForTankBusters: false,
      abilityType: AbilityType.SelfShield,
      settings: [settings.target],
      defensiveStats: {
        shieldPercent : 25
      }
    },
    {
      name: "Delirium",
      duration: 10,
      cooldown: 90,
      xivDbId: "7390",
      requiresBossTarget: true,
      icon: ("13_DarkKnight/7390_Delirium"),
      abilityType: AbilityType.SelfDamageBuff,
    },
    {
      name: "Dark Missionary",
      duration: 15,
      cooldown: 90,
      xivDbId: "16471",
      requiresBossTarget: false,
      icon: ("13_DarkKnight/icon_24"),
      abilityType: AbilityType.PartyDefense,
      defensiveStats: {
        mitigationPercent: 10
      }
    },
    {
      name: "Living Shadow",
      duration: 24,
      cooldown: 120,
      xivDbId: "16472",
      requiresBossTarget: false,
      icon: ("13_DarkKnight/icon_25"),
      abilityType: AbilityType.Damage,
    },
    ...getAbilitiesFrom(tankSharedAbilities),
    medicine["Strength"]
  ].sort(abilitySortFn),
  stances: []
};


