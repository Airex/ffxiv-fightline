import Effects from "src/core/Defensives/effects";
import { BaseOverlapStrategy, ChargesBasedOverlapStrategy, SharedOverlapStrategy } from "src/core/Overlap";
import { Utils } from "src/core/Utils";
import { DamageType, Role, AbilityType, IAbility, MapStatuses, settings, IJobTemplate, ITrait, IOverlapStrategy, IOverlapCheckContext } from "../../core/Models";
import { getAbilitiesFrom, tankSharedAbilities, medicine } from "./shared";
import { abilityTrait, combineTraits, levelRemoved } from "./traits";

class SaltAndDarknessOverlapStrategy extends BaseOverlapStrategy implements IOverlapStrategy {

  override check(context: IOverlapCheckContext): boolean {

    const abilityMap = context.holders.abilities.get(context.jobAbilityId);
    const saltedEarth = context.holders.abilities.getByParentAndAbility(abilityMap.job.id, "Salted Earth");
    const usages = context.holders.itemUsages.getByAbility(saltedEarth.id);

    const durations = usages.map(u => [u.start, new Date(u.startAsNumber + 15 * 1000)]);

    return !durations.some(d => Utils.inRangeDates(d[0], d[1], context.start)) || super.check(context);
  }
  override getDependencies(): string[] {
    return ["Salted Earth"];
  }

}

const statuses = MapStatuses({
  bloodWeapon: {
    duration: 15
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
    duration: 14,
    effects: [Effects.delay(6)]
  },
  oblation: {
    duration: 10,
    effects: [Effects.mitigation.solo(10)]
  }
});

const abilities = [
  {
    name: "Blood Weapon",
    translation: {
      de: "Blutwaffe",
      ja: "\u30D6\u30E9\u30C3\u30C9\u30A6\u30A7\u30DD\u30F3",
      en: "Blood Weapon",
      fr: "Arme de sang",
      cn: "嗜血"
    },
    cooldown: 60,
    xivDbId: "3625",
    abilityType: AbilityType.SelfDamageBuff,
    levelAcquired: 35,
    statuses: [statuses.bloodWeapon]
  },
  {
    name: "Flood of Darkness",
    translation: {
      de: "Finstere Flut",
      en: "Flood of Darkness",
      fr: "Déluge de ténèbres",
      cn: "暗黑波动",
      ja: "暗黒の波動"
    },
    cooldown: 1,
    xivDbId: "16466",
    requiresBossTarget: true,
    abilityType: AbilityType.Damage,
    levelAcquired: 30
  },
  {
    name: "Edge of Darkness",
    translation: {
      de: "Finstere Klinge",
      en: "Edge of Darkness",
      fr: "Tranchant de ténèbres",
      cn: "暗黑锋",
      ja: "暗黒の剣"
    },
    cooldown: 1,
    xivDbId: "16467",
    requiresBossTarget: true,
    abilityType: AbilityType.Damage,
    levelAcquired: 40
  },
  {
    name: "Flood of Shadow",
    translation: {
      de: "Schattenflut",
      ja: "\u6F06\u9ED2\u306E\u6CE2\u52D5",
      en: "Flood of Shadow",
      fr: "D\u00E9luge d\u0027ombre",
      cn: "暗影波动"
    },
    cooldown: 1,
    xivDbId: "16469",
    requiresBossTarget: true,
    abilityType: AbilityType.Damage,
    levelAcquired: 74
  },
  {
    name: "Edge of Shadow",
    translation: {
      de: "Schattenklinge",
      ja: "\u6F06\u9ED2\u306E\u5263",
      en: "Edge of Shadow",
      fr: "Tranchant d\u0027ombre",
      cn: "暗影锋"
    },
    cooldown: 1,
    xivDbId: "16470",
    requiresBossTarget: true,
    abilityType: AbilityType.Damage,
    levelAcquired: 74
  },
  {
    name: "Salted Earth",
    translation: {
      de: "Salzige Erde",
      ja: "\u30BD\u30EB\u30C8\u30A2\u30FC\u30B9",
      en: "Salted Earth",
      fr: "Terre sal\u00E9e",
      cn: "腐秽大地"
    },
    duration: 15,
    cooldown: 90,
    xivDbId: "3639",
    abilityType: AbilityType.Damage,
    levelAcquired: 52,
    statuses: [statuses.saltedEarth]
  },
  {
    name: "Abyssal Drain",
    translation: {
      de: "Abyssale Blutung",
      ja: "\u30A2\u30D3\u30B5\u30EB\u30C9\u30EC\u30A4\u30F3",
      en: "Abyssal Drain",
      fr: "Drainage abyssal",
      cn: "吸血深渊"
    },
    cooldown: 60,
    xivDbId: "3641",
    requiresBossTarget: true,
    overlapStrategy: new SharedOverlapStrategy(["Carve and Spit"]),
    abilityType: AbilityType.Damage,
    levelAcquired: 56
  },
  {
    name: "Plunge",
    translation: {
      de: "Hiebsprung",
      ja: "\u30D7\u30E9\u30F3\u30B8\u30AB\u30C3\u30C8",
      en: "Plunge",
      fr: "Coupe plongeante",
      cn: "跳斩"
    },
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
    translation: {
      de: "Zweischnitt",
      ja: "\u30AB\u30FC\u30F4\u30FB\u30A2\u30F3\u30C9\u30FB\u30B9\u30D4\u30C3\u30C8",
      en: "Carve and Spit",
      fr: "Tranchage-habillage",
      cn: "精雕怒斩"
    },
    cooldown: 60,
    xivDbId: "3643",
    requiresBossTarget: true,
    overlapStrategy: new SharedOverlapStrategy(["Abyssal Drain"]),
    abilityType: AbilityType.Damage,
    levelAcquired: 60
  },
  {
    name: "Shadow Wall",
    translation: {
      de: "Schattenwand",
      ja: "\u30B7\u30E3\u30C9\u30A6\u30A6\u30A9\u30FC\u30EB",
      en: "Shadow Wall",
      fr: "Mur d\u0027ombre",
      cn: "暗影墙"
    },
    statuses: [statuses.shadowWall],
    cooldown: 120,
    xivDbId: "3636",
    abilityType: AbilityType.SelfDefense,
    levelAcquired: 38
  },
  {
    name: "Dark Mind",
    translation: {
      de: "Dunkler Geist",
      ja: "\u30C0\u30FC\u30AF\u30DE\u30A4\u30F3\u30C9",
      en: "Dark Mind",
      fr: "Esprit t\u00E9n\u00E9breux",
      cn: "弃明投暗"
    },
    cooldown: 60,
    xivDbId: "3634",
    abilityType: AbilityType.SelfDefense,
    statuses: [statuses.darkMind],
    levelAcquired: 45
  },
  {
    name: "Living Dead",
    translation: {
      de: "Totenerweckung",
      ja: "\u30EA\u30D3\u30F3\u30B0\u30C7\u30C3\u30C9",
      en: "Living Dead",
      fr: "Mort-vivant",
      cn: "行尸走肉"
    },
    duration: 10,
    cooldown: 300,
    xivDbId: "3638",
    extendDurationOnNextAbility: 10,
    statuses: [statuses.livingDead],
    abilityType: AbilityType.SelfDefense,
    levelAcquired: 50
  },
  {
    name: "The Blackest Night",
    translation: {
      de: "Schw\u00E4rzeste Nacht",
      ja: "\u30D6\u30E9\u30C3\u30AF\u30CA\u30A4\u30C8",
      en: "The Blackest Night",
      fr: "Nuit noirissime",
      cn: "至黑之夜"
    },
    cooldown: 15,
    xivDbId: "7393",
    abilityType: AbilityType.SelfShield,
    settings: [settings.target],
    statuses: [statuses.tbn],
    levelAcquired: 70
  },
  {
    name: "Delirium",
    translation: {
      de: "Blutdelirium",
      ja: "\u30D6\u30E9\u30C3\u30C9\u30C7\u30EA\u30EA\u30A2\u30E0",
      en: "Delirium",
      fr: "Delirium de sang",
      cn: "血乱"
    },
    cooldown: 60,
    xivDbId: "7390",
    statuses: [statuses.delirium],
    abilityType: AbilityType.SelfDamageBuff,
    levelAcquired: 68
  },
  {
    name: "Dark Missionary",
    translation: {
      de: "Dunkler Bote",
      ja: "\u30C0\u30FC\u30AF\u30DF\u30C3\u30B7\u30E7\u30CA\u30EA\u30FC",
      en: "Dark Missionary",
      fr: "Missionnaire des T\u00E9n\u00E8bres",
      cn: "暗黑布道"
    },
    cooldown: 90,
    xivDbId: "16471",
    abilityType: AbilityType.PartyDefense,
    statuses: [statuses.darkMissionary],
    levelAcquired: 76
  },
  {
    name: "Living Shadow",
    translation: {
      de: "Schattenschemen",
      ja: "\u5F71\u8EAB\u5177\u73FE",
      en: "Living Shadow",
      fr: "Ombre vivante",
      cn: "掠影示现"
    },
    cooldown: 120,
    xivDbId: "16472",
    requiresBossTarget: true,
    statuses: [statuses.livingShadow],
    abilityType: AbilityType.Damage,
    levelAcquired: 80
  },
  {
    name: "Oblation",
    translation: {
      de: "Opfergabe",
      ja: "\u30AA\u30D6\u30EC\u30FC\u30B7\u30E7\u30F3",
      en: "Oblation",
      fr: "Oblation",
      cn: "献奉"
    },
    cooldown: 60,
    xivDbId: "25754",
    overlapStrategy: new ChargesBasedOverlapStrategy(),
    abilityType: AbilityType.SelfDefense | AbilityType.TargetDefense,
    levelAcquired: 82,
    statuses: [statuses.oblation],
    charges: {
      count: 2,
      cooldown: 60
    },
    settings: [settings.target]
  },
  {
    name: "Salt and Darkness",
    translation: {
      de: "Salz und Schw\u00e4rze",
      en: "Salt and Darkness",
      fr: "Sel et T\u00e9n\u00e8bres",
      cn: "腐秽黑暗",
      ja: "\u30bd\u30eb\u30c8\u30fb\u30a2\u30f3\u30c9\u30fb\u30c0\u30fc\u30af",
    },
    cooldown: 20,
    xivDbId: "25755",
    requiresBossTarget: true,
    overlapStrategy: new SaltAndDarknessOverlapStrategy(),
    abilityType: AbilityType.Damage,
    levelAcquired: 86,
  },
  {
    name: "Shadowbringer",
    translation: {
      de: "Schattenbringer",
      en: "Shadowbringer",
      fr: "Porteur d'ombre",
      cn: "暗影使者",
      ja: "シャドウブリンガー"
    },
    cooldown: 60,
    xivDbId: "25757",
    requiresBossTarget: true,
    abilityType: AbilityType.Damage,
    levelAcquired: 90,
    charges: {
      count: 2,
      initialCount: 2,
      cooldown: 60
    }
  },
  ...getAbilitiesFrom(tankSharedAbilities),
  medicine.Strength
] as IAbility[];

const traits: ITrait[] = [
  {
    level: 74,
    name: "Darkside Mastery",
    apply: combineTraits([
      abilityTrait("Flood of Darkness", levelRemoved(74)),
      abilityTrait("Edge of Darkness", levelRemoved(74))
    ])
  }
];
export const DRK: IJobTemplate = {

  translation: {
    de: "DKR",
    ja: "DRK",
    en: "DRK",
    fr: "CHN",
    cn: "DRK"
  },

  fullNameTranslation: {
    de: "Dunkelritter",
    ja: "\u6697\u9ED2\u9A0E\u58EB",
    en: "Dark Knight",
    fr: "Chevalier Noir",
    cn: "暗黑骑士"
  },
  role: Role.Tank,
  abilities,
  traits
};


