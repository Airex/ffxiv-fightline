import { IJob, Role } from "../../../Models"
import * as Fractions from "../fractions";

export const Scoundrel_Ruffian: IJob = {
  name: "Ruffian",
  role: Role.Tank,
  fraction: Fractions.SWTORFractions.Republic,
  baseClass: "Scoundrel",
  icon: ("REPUBLIC/Scoundrel/Ruffian/!!!SpecIcon.jpg"),
  abilities: []
};
