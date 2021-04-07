import { IJob, Role } from "../../../Models"
import * as Fractions from "../fractions";

export const Jedi_Shadow_Infiltration: IJob = {
  name: "Infiltration",
  role: Role.Melee,
  fraction: Fractions.SWTORFractions.Republic,
  baseClass: "Jedi Shadow",
  icon: ("REPUBLIC/Jedi Shadow/Infiltration/!!!SpecIcon.jpg"),
  abilities: []
};
