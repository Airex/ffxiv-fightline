import { IJobTemplate, Role } from "src/core/Models";
import {
  getAbilitiesFrom,
  medicine,
  meleeSharedAbilities,
  meleeSharedTraits,
} from "./shared";

const abilities = [
  medicine.Dexterity,
  ...getAbilitiesFrom(meleeSharedAbilities)
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
    en: "Viper",
    de: "Viper",
    ja: "Viper",
    fr: "Viper",
    cn: "Viper",
  },
  role: Role.Melee,
  abilities,
  traits,
};
