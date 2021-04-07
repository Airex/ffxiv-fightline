import { IJob, Role } from "../../../Models"
import * as Fractions from "../fractions";

export const Jedi_Sentinel_Combat: IJob = {
  name: "Combat",
  role: Role.Melee,
  fraction: Fractions.SWTORFractions.Republic,
  baseClass: "Jedi Sentinel",
  icon: ("REPUBLIC/Jedi Sentinel/Combat/!!!SpecIcon.jpg"),
  abilities: []
};
