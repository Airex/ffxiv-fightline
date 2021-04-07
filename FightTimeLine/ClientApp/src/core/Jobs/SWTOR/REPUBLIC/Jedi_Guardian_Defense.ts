import { IJob, Role } from "../../../Models"
import * as Fractions from "../fractions";

export const Jedi_Guardian_Defense: IJob = {
  name: "Defense",
  role: Role.Tank,
  fraction: Fractions.SWTORFractions.Republic,
  baseClass: "Jedi Guardian",
  icon: ("REPUBLIC/Jedi Guardian/Defense/!!!SpecIcon.jpg"),
  abilities: []
};
