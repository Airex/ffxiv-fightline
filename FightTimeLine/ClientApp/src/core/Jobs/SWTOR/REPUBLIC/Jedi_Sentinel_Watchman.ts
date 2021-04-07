import { IJob, Role } from "../../../Models"
import * as Fractions from "../fractions";

export const Jedi_Sentinel_Watchman: IJob = {
  name: "Watchman",
  role: Role.Melee,
  fraction: Fractions.SWTORFractions.Republic,
  baseClass: "Jedi Sentinel",
  icon: ("REPUBLIC/Jedi Sentinel/Watchman/!!!SpecIcon.jpg"),
  abilities: []
};
