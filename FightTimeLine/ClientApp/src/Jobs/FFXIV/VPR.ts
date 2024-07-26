import { IJobTemplate, Role } from "src/core/Models";
import {
  getAbilitiesFrom,
  medicine,
  meleeSharedAbilities,
  meleeSharedTraits,
} from "./shared";

const abilities = [
  medicine.Dexterity,
  ...getAbilitiesFrom(meleeSharedAbilities),
];

const traits = [...meleeSharedTraits];

export const VPR: IJobTemplate = {
  translation: {
    de: "VPR",
    ja: "VPR",
    en: "VPR",
    fr: "VPR",
    cn: "VPR",
  },

  fullNameTranslation: {
    de: "Viper",
    ja: "\u30F4\u30A1\u30A4\u30D1\u30FC",
    en: "Viper",
    fr: "r\u00F4deur vip\u00E8re",
    cn: "Viper",
  },
  role: Role.Melee,
  abilities,
  traits,
};
