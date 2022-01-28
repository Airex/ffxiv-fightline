import Effects from "src/core/Effects";
import { IJob, Role, AbilityType, IAbility, DamageType, JobStatuses, MapMe } from "../../Models"
import { getAbilitiesFrom, casterSharedAbilities, medicine } from "./shared"


const statuses = MapMe({
  "manaward": {
    duration: 20,
    effects: [Effects.shield.solo(10)]
  },
  leyLines: {
    duration: 30
  },
  trippleCast: {
    duration: 15
  },
  sharpCast: {
    duration: 15
  }
})

const abilities = <IAbility[]>[
  {
    name: "Transpose",
    cooldown: 5,
    xivDbId: "149",
    abilityType: AbilityType.Utility,
    levelAcquired: 4
  },
  {
    name: "Manaward",
    cooldown: 120,
    xivDbId: "157",
    abilityType: AbilityType.SelfShield,
    levelAcquired: 30,
    statuses: [statuses.manaward]
  },

  {
    name: "Manafont",    
    cooldown: 120,
    xivDbId: "158",
    abilityType: AbilityType.Utility,
    levelAcquired: 30
  },
  {
    name: "Ley Lines",    
    cooldown: 120,
    xivDbId: "3573",
    statuses: [statuses.leyLines],
    abilityType: AbilityType.SelfDamageBuff,
    levelAcquired: 52
  },  
  {
    name: "Triplecast",    
    cooldown: 60,
    xivDbId: "7421",
    statuses: [statuses.trippleCast],
    abilityType: AbilityType.Utility,
    levelAcquired: 65,
    charges: {
      count: 2,
      cooldown: 60
    }
  },
  {
    name: "Sharpcast",    
    cooldown: 30,
    xivDbId: "3574",
    statuses: [statuses.sharpCast],
    abilityType: AbilityType.Utility,
    levelAcquired: 54,
    charges: {
      count: 2,
      cooldown: 30
    }
  },
  {
    name: "Amplifier",    
    cooldown: 120,
    xivDbId: "25796",
    abilityType: AbilityType.Utility,
    levelAcquired: 54,
  },
  ...getAbilitiesFrom(casterSharedAbilities),
  medicine["Intelligence"]
];
export const BLM: IJob = {
  name: "BLM",
  fullName: "Black Mage",
  role: Role.Caster,
  abilities
};
