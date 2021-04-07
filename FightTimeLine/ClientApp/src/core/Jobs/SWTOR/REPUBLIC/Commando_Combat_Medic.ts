import { IJob, Role } from "../../../Models"
import * as Fractions from "../fractions";

export const Commando_Combat_Medic: IJob = {
  name: "Combat Medic",
  role: Role.Healer,
  fraction: Fractions.SWTORFractions.Republic,
  baseClass: "Commando",
  icon: ("REPUBLIC/Commando/Combat Medic/!!!SpecIcon.jpg"),
  abilities: []
};
