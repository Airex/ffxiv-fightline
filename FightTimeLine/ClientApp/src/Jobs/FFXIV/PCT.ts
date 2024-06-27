import {
  AbilityType,
  IAbility,
  IJobTemplate,
  MapStatuses,
  Role,
} from "src/core/Models";
import {
  casterSharedAbilities,
  casterSharedTraits,
  getAbilitiesFrom,
  IAbilities,
  medicine,
} from "./shared";
import Effects from "src/core/Defensives/effects";

const statuses = MapStatuses({
  starryMuse: {
    duration: 20,
  },
});

const abilities = [
  {
    name: "Starry Muse",
    translation: {
      en: "Starry Muse",
      de: "Sternenmuse",
      ja: "星の女神",
      fr: "Muse stellaire",
      cn: "星之女神",
    },
    cooldown: 120,
    xivDbId: 34675,
    requiresBossTarget: false,
    abilityType: AbilityType.PartyDamageBuff,
    levelAcquired: 70,
    statuses: [statuses.starryMuse],
  },
  ...getAbilitiesFrom(casterSharedAbilities),
  medicine.Intelligence
] as IAbility[];

const traits = [...casterSharedTraits];

export const PCT: IJobTemplate = {
  translation: {
    en: "PCT",
    de: "PCT",
    ja: "PCT",
    fr: "PCT",
    cn: "PCT",
  },

  fullNameTranslation: {
    en: "Pictomancer",
    de: "Maler",
    ja: "Pictomancer",
    fr: "Pictomancer",
    cn: "Pictomancer",
  },
  role: Role.Caster,
  abilities,
  traits,
};
