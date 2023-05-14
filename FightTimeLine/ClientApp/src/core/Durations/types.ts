import { AbilityType } from "../Models";

export type FramePart = {
  extraStyle?: string;
  start: number;
  length: number;
  type: AbilityType;
};

export type StatusPart = {
  start: number;
  length: number;
  type: AbilityType;
  shieldBroken?: boolean;
};
