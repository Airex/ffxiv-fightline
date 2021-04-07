import { IJob, Role } from "../../../Models"
import * as Fractions from "../fractions";

export const Jedi_Shadow_Kinetic_Combat: IJob = {
  name: "Kinetic Combat",
  role: Role.Tank,
  fraction: Fractions.SWTORFractions.Republic,
  baseClass: "Jedi Shadow",
  icon: ("REPUBLIC/Jedi Shadow/Kinetic Combat/!!!SpecIcon.jpg"),
  abilities: []
};
