import Effects from "src/core/Effects";
import { IJob, Role, AbilityType, DamageType, IAbility, MapStatuses, settings } from "../../core/Models";
import { getAbilitiesFrom, tankSharedAbilities, medicine } from "./shared";

const statuses = MapStatuses({
  noMercy: {
    duration: 20
  },
  camouflage: {
    duration: 20,
    effects: [Effects.mitigation.solo(10)]
  },
  nebula: {
    duration: 15,
    effects: [Effects.mitigation.solo(30)]
  },
  aurora: {
    duration: 18,
  },
  superbolide: {
    duration: 10,
    effects: [Effects.mitigation.solo(100)]
  },
  bowShock: {
    duration: 15
  },
  heartOfLight: {
    duration: 15,
    effects: [Effects.mitigation.party(10, DamageType.Magical)]
  },
  heartOfStone: {
    duration: 7,
    effects: [Effects.mitigation.solo(15)]
  },
  heartOfCorundum: {
    duration: 8,
    effects: [Effects.mitigation.solo(15)]
  },
  heartOfCorundumClarity: {
    duration: 4,
    effects: [Effects.mitigation.solo(15)]
  }
});

const abilities = [
  {
    name: "No Mercy",
    translation: {
      de: "Ohne Gnade",
      jp: "\u30CE\u30FC\u30FB\u30DE\u30FC\u30B7\u30FC",
      en: "No Mercy",
      fr: "Sans piti\u00E9"
    },
    cooldown: 60,
    xivDbId: "16138",
    statuses: [statuses.noMercy],
    abilityType: AbilityType.SelfDamageBuff,
    levelAcquired: 2
  },
  {
    name: "Camouflage",
    translation: {
      de: "Camouflage",
      jp: "\u30AB\u30E2\u30D5\u30E9\u30FC\u30B8\u30E5",
      en: "Camouflage",
      fr: "Camouflage"
    },
    cooldown: 90,
    xivDbId: "16140",
    abilityType: AbilityType.SelfDefense,
    statuses: [statuses.camouflage],
    levelAcquired: 6
  },
  {
    name: "Nebula",
    translation: {
      de: "Nebula",
      jp: "\u30CD\u30D3\u30E5\u30E9",
      en: "Nebula",
      fr: "N\u00E9buleuse"
    },
    cooldown: 120,
    xivDbId: "16148",
    statuses: [statuses.nebula],
    abilityType: AbilityType.SelfDefense,
    levelAcquired: 38
  },
  {
    name: "Aurora",
    translation: {
      de: "Aurora",
      jp: "\u30AA\u30FC\u30ED\u30E9",
      en: "Aurora",
      fr: "Aurore"
    },
    cooldown: 60,
    xivDbId: "16151",
    statuses: [statuses.aurora],
    abilityType: AbilityType.Healing,
    settings: [settings.target],
    levelAcquired: 45,
    charges: {
      count: 2,
      cooldown: 60
    }
  },
  {
    name: "Superbolide",
    translation: {
      de: "Meteoritenfall",
      jp: "\u30DC\u30FC\u30E9\u30A4\u30C9",
      en: "Superbolide",
      fr: "Bolide"
    },
    cooldown: 360,
    xivDbId: "16152",
    statuses: [statuses.superbolide],
    abilityType: AbilityType.SelfDefense,
    levelAcquired: 50
  },
  {
    name: "Rough Divide",
    translation: {
      de: "Grobspalter",
      jp: "\u30E9\u30D5\u30C7\u30A3\u30D0\u30A4\u30C9",
      en: "Rough Divide",
      fr: "Lamineur"
    },
    cooldown: 30,
    xivDbId: "16154",
    abilityType: AbilityType.Damage,
    charges: {
      count: 2,
      cooldown: 30
    },
    levelAcquired: 56
  },
  {
    name: "Bow Shock",
    translation: {
      de: "Schockpatrone",
      jp: "\u30D0\u30A6\u30B7\u30E7\u30C3\u30AF",
      en: "Bow Shock",
      fr: "Arc de choc"
    },
    cooldown: 60,
    xivDbId: "16159",
    statuses: [statuses.bowShock],
    abilityType: AbilityType.Damage,
    levelAcquired: 62
  },
  {
    name: "Heart of Light",
    translation: {
      de: "Wackeres Herz",
      jp: "\u30CF\u30FC\u30C8\u30FB\u30AA\u30D6\u30FB\u30E9\u30A4\u30C8",
      en: "Heart of Light",
      fr: "C\u0153ur de Lumi\u00E8re"
    },
    cooldown: 90,
    xivDbId: "16160",
    statuses: [statuses.heartOfLight],
    abilityType: AbilityType.PartyDefense,
    levelAcquired: 64
  },
  {
    name: "Heart of Stone",
    translation: {
      de: "Steinernes Herz",
      en: "Heart of Stone",
      fr: "Cœur de pierre",
      jp: "ハート・オブ・ストーン"
    },
    cooldown: 25,
    xivDbId: "20778",
    statuses: [statuses.heartOfStone],
    abilityType: AbilityType.TargetDefense,
    settings: [settings.target],
    levelAcquired: 68,
    levelRemoved: 82
  },
  {
    name: "Heart of Corundum",
    translation: {
      de: "Herz des Korunds",
      jp: "\u30CF\u30FC\u30C8\u30FB\u30AA\u30D6\u30FB\u30B3\u30E9\u30F3\u30C0\u30E0",
      en: "Heart of Corundum",
      fr: "C\u0153ur de corindon"
    },
    cooldown: 25,
    xivDbId: "25758",
    statuses: [statuses.heartOfCorundum, statuses.heartOfCorundumClarity],
    abilityType: AbilityType.TargetDefense,
    settings: [settings.target],
    levelAcquired: 82
  },
  {
    name: "Bloodfest",
    translation: {
      de: "Blutpatronen",
      jp: "\u30D6\u30E9\u30C3\u30C9\u30BD\u30A4\u30EB",
      en: "Bloodfest",
      fr: "Cartouche de sang"
    },
    cooldown: 90,
    xivDbId: "16164",
    abilityType: AbilityType.Utility,
    levelAcquired: 76
  },
  {
    name: "Danger Zone",
    translation: {
      de: "Sprengzone",
      en: "Danger Zone",
      fr: "Zone de danger",
      jp: "デンジャーゾーン"
    },
    cooldown: 30,
    xivDbId: "16144",
    abilityType: AbilityType.Damage,
    levelRemoved: 80,
    levelAcquired: 18
  },
  {
    name: "Blasting Zone",
    translation: {
      de: "Erda-Detonation",
      jp: "\u30D6\u30E9\u30B9\u30C6\u30A3\u30F3\u30B0\u30BE\u30FC\u30F3",
      en: "Blasting Zone",
      fr: "Zone de destruction"
    },
    cooldown: 30,
    xivDbId: "16165",
    abilityType: AbilityType.Damage,
    levelAcquired: 80
  },
  ...getAbilitiesFrom(tankSharedAbilities),
  medicine.Strength
] as IAbility[];
export const GNB: IJob = {
  name: "GNB",
  translation: {
    de: "REV",
    jp: "GNB",
    en: "GNB",
    fr: "PSB"
  },
  fullName: "Gunbreaker",
  fullNameTranslation: {
    de: "Revolverklinge",
    jp: "\u30AC\u30F3\u30D6\u30EC\u30A4\u30AB\u30FC",
    en: "Gunbreaker",
    fr: "Pistosabreur"
  },
  role: Role.Tank,
  abilities
};


