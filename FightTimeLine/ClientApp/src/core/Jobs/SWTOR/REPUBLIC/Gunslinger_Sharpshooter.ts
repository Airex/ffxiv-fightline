import { IJob, Role } from "../../../Models"
import * as Fractions from "../fractions";

export const Gunslinger_Sharpshooter: IJob = {
  name: "Sharpshooter",
  role: Role.Range,
  fraction: Fractions.SWTORFractions.Republic,
  baseClass: "Gunslinger",
  icon: ("REPUBLIC/Gunslinger/Sharpshooter/!!!SpecIcon.jpg"),
  abilities: []
};
