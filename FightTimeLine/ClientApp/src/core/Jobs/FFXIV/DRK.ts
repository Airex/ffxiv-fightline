import Effects from "src/core/Effects";
import { ChargesBasedOverlapStrategy, SharedOverlapStrategy } from "src/core/Overlap";
import { IJob, DamageType, Role, AbilityType, IAbility, MapMe } from "../../Models"
import { settings, abilitySortFn, getAbilitiesFrom, tankSharedAbilities, medicine } from "./shared"

const statuses = MapMe({
  bloodWeapon: {
    duration: 10
  },
  saltedEarth: {
    duration: 15
  },
  shadowWall: {
    duration: 15,
    effects: [Effects.mitigation.solo(30)]
  },
  darkMind: {
    duration: 10,
    effects: [Effects.mitigation.solo(20, DamageType.Magical)]
  },
  livingDead: {
    duration: 10,
    effects: [Effects.mitigation.solo(100)]
  },
  tbn: {
    duration: 7,
    effects: [Effects.shield.solo(25)]
  },
  delirium: {
    duration: 15
  },
  darkMissionary: {
    duration: 15,
    effects: [Effects.mitigation.party(10, DamageType.Magical)]
  },
  livingShadow: {
    duration: 24
  },
  oblation: {
    duration: 10,
    effects: [Effects.mitigation.solo(10)]
  }
});

const abilities = <IAbility[]>[
  {
    name: "Blood Weapon",
    cooldown: 60,
    xivDbId: "3625",
    abilityType: AbilityType.SelfDamageBuff,
    levelAcquired: 35,
    statuses: [statuses.bloodWeapon]
  },
  {
    name: "Flood of Shadow",
    cooldown: 1,
    xivDbId: "16469",
    requiresBossTarget: true,
    abilityType: AbilityType.Damage,
    levelAcquired: 74
  },
  {
    name: "Edge of Shadow",
    cooldown: 1,
    xivDbId: "16470",
    requiresBossTarget: true,
    abilityType: AbilityType.Damage,
    levelAcquired: 74
  },
  {
    name: "Salted Earth",
    duration: 15,
    cooldown: 90,
    xivDbId: "3639",
    abilityType: AbilityType.Damage,
    levelAcquired: 52,
    statuses: [statuses.saltedEarth]
  },
  {
    name: "Abyssal Drain",
    cooldown: 60,
    xivDbId: "3641",
    requiresBossTarget: true,
    overlapStrategy: new SharedOverlapStrategy(["Carve and Spit"]),
    abilityType: AbilityType.Damage,
    levelAcquired: 56
  },
  {
    name: "Plunge",
    cooldown: 30,
    xivDbId: "3640",
    requiresBossTarget: true,
    abilityType: AbilityType.Damage,
    charges: {
      count: 2,
      cooldown: 30
    },
    levelAcquired: 54
  },
  {
    name: "Carve and Spit",
    cooldown: 60,
    xivDbId: "3643",
    requiresBossTarget: true,
    overlapStrategy: new SharedOverlapStrategy(["Abyssal Drain"]),
    abilityType: AbilityType.Damage,
    levelAcquired: 60
  },
  {
    name: "Shadow Wall",
    statuses: [statuses.shadowWall],
    cooldown: 120,
    xivDbId: "3636",
    abilityType: AbilityType.SelfDefense,
    levelAcquired: 38
  },
  {
    name: "Dark Mind",
    cooldown: 60,
    xivDbId: "3634",
    abilityType: AbilityType.SelfDefense,
    statuses: [statuses.darkMind],
    levelAcquired: 45
  },
  {
    name: "Living Dead",
    duration: 10,
    cooldown: 300,
    xivDbId: "3638",
    extendDurationOnNextAbility: 10,
    statuses:[statuses.livingDead],
    abilityType: AbilityType.SelfDefense,
    levelAcquired: 50
  },
  {
    name: "The Blackest Night",
    cooldown: 15,
    xivDbId: "7393",
    abilityType: AbilityType.SelfShield,
    settings: [settings.target],
    statuses: [statuses.tbn],
    levelAcquired: 70
  },
  {
    name: "Delirium",
    cooldown: 60,
    xivDbId: "7390",
    requiresBossTarget: true,
    statuses: [statuses.delirium],
    abilityType: AbilityType.SelfDamageBuff,
    levelAcquired: 68
  },
  {
    name: "Dark Missionary",
    cooldown: 90,
    xivDbId: "16471",
    abilityType: AbilityType.PartyDefense,
    statuses: [statuses.darkMissionary],
    levelAcquired: 76
  },
  {
    name: "Living Shadow",
    cooldown: 120,
    xivDbId: "16472",
    requiresBossTarget: true,
    statuses: [statuses.livingShadow],
    abilityType: AbilityType.Damage,
    levelAcquired: 80
  },
  {
    name: "Oblation",
    cooldown: 60,
    xivDbId: "25754",
    overlapStrategy: new ChargesBasedOverlapStrategy(),
    abilityType: AbilityType.SelfDefense | AbilityType.TargetDefense,
    levelAcquired: 82,
    statuses:[statuses.oblation],
    charges: {
      count: 2,
      cooldown: 60
    },
    settings: [settings.target]
  },
  {
    name: "Salt and Darkness",    
    cooldown: 20,
    xivDbId: "25755",
    requiresBossTarget: true,
    abilityType: AbilityType.Damage,
    levelAcquired: 86,
  },
  ...getAbilitiesFrom(tankSharedAbilities),
  medicine["Strength"]
].sort(abilitySortFn);

export const DRK: IJob = {
  name: "DRK",
  fullName: "Dark Knight",
  role: Role.Tank,
  abilities,
  
};


