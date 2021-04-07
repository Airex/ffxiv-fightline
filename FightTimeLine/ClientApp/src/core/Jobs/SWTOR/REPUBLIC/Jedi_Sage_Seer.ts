import { IJob, Role } from "../../../Models"
import * as Fractions from "../fractions";

export const Jedi_Sage_Seer: IJob = {
  name: "Seer",
  role: Role.Melee,
  fraction: Fractions.SWTORFractions.Republic,
  baseClass: "Jedi Sage",
  icon: ("REPUBLIC/Jedi Sage/Seer/!!!SpecIcon.jpg"),
  abilities: []
};
