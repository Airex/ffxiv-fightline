import { byBuffRemove } from "src/core/AbilityDetectors";
import Effects from "src/core/Defensives/effects";
import {
  IAbility,
  AbilityType,
  DamageType,
  settings,
  ITrait,
  IJobTemplate,
  Role,
} from "../../core/Models";
import { abilityTrait } from "./traits";

export type IAbilities = {
  [name: string]: IAbility;
};

export const abilitySortFn = (a1: IAbility, a2: IAbility): number => {
  const st: AbilityType[] = [
    AbilityType.PartyDefense,
    AbilityType.PartyShield,
    AbilityType.TargetDefense,
    AbilityType.SelfShield,
    AbilityType.SelfDefense,
    AbilityType.PartyDamageBuff,
    AbilityType.SelfDamageBuff,
    AbilityType.Utility,
    AbilityType.Enmity,
    AbilityType.Damage,
    AbilityType.PartyHealing,
    AbilityType.Healing,
    AbilityType.PartyHealingBuff,
    AbilityType.HealingBuff,
    AbilityType.Pet,
  ];

  const ar1 = st
    .map((it, i) => (it & a1.abilityType ? i + 1 : 0))
    .find((it) => it > 0);
  const ar2 = st
    .map((it, i) => (it & a2.abilityType ? i + 1 : 0))
    .find((it) => it > 0);

  return ar1 - ar2;
};

export const getAbilitiesFrom = (arr: IAbilities): IAbility[] => {
  return Object.values(arr);
};

export function toAbilities(abs: IAbility[]) {
  return abs.reduce((acc, c) => ({ ...acc, [c.name]: c }), {});
}

const tankSharedAbilities: IAbilities = {
  Rampart: {
    name: "Rampart",
    cooldown: 90,
    xivDbId: "7531",
    iconPrefix: "tank",
    abilityType: AbilityType.SelfDefense,
    translation: {
      de: "Schutzwall",
      en: "Rampart",
      fr: "Rempart",
      ja: "\u30e9\u30f3\u30d1\u30fc\u30c8",
      cn: "铁壁",
    },
    levelAcquired: 8,
    statuses: [
      {
        duration: 20,
        effects: [Effects.mitigation.solo(20)],
      },
    ],
  },
  Reprisal: {
    name: "Reprisal",
    cooldown: 60,
    xivDbId: "7535",
    iconPrefix: "tank",
    abilityType: AbilityType.PartyDefense,
    requiresBossTarget: false,
    translation: {
      de: "Reflexion",
      en: "Reprisal",
      fr: "R\u00e9torsion",
      ja: "\u30ea\u30d7\u30e9\u30a4\u30b6\u30eb",
      cn: "雪仇",
    },
    levelAcquired: 22,
    statuses: [
      {
        duration: 10,
        effects: [Effects.mitigation.party(10)],
      },
    ],
  },
  Provoke: {
    name: "Provoke",
    translation: {
      de: "Herausforderung",
      en: "Provoke",
      fr: "Provocation",
      ja: "\u6311\u767a",
      cn: "挑衅",
    },
    levelAcquired: 15,
    cooldown: 30,
    xivDbId: "7533",
    iconPrefix: "tank",
    abilityType: AbilityType.Enmity,
    settings: [settings.changesTarget],
    requiresBossTarget: true,
  },
  Shirk: {
    name: "Shirk",
    translation: {
      de: "Geteiltes Leid",
      en: "Shirk",
      fr: "D\u00e9robade",
      ja: "\u30b7\u30e3\u30fc\u30af",
      cn: "退避",
    },
    levelAcquired: 48,
    cooldown: 120,
    xivDbId: "7537",
    iconPrefix: "tank",
    settings: [settings.target],
    abilityType: AbilityType.Enmity,
  },
};

const tankSharedTraits: ITrait[] = [
  {
    level: 94,
    name: "Enhanced Rampart",
    apply: abilityTrait("Rampart", (ability) => {
      ability.statuses = [
        {
          duration: 20,
          effects: [
            Effects.mitigation.solo(20),
            Effects.incomingHealingIncrease.solo(15),
          ],
        },
      ];
    }),
  },
  {
    level: 98,
    name: "Enhanced Reprisal",
    apply: abilityTrait("Reprisal", (ability) => {
      ability.statuses = [
        { duration: 15, effects: [Effects.mitigation.party(10)] },
      ];
    }),
  },
];

const magicSharedAbilities: IAbilities = {
  Swiftcast: {
    name: "Swiftcast",
    translation: {
      de: "Spontaneit\u00e4t",
      en: "Swiftcast",
      fr: "Magie prompte",
      ja: "\u8fc5\u901f\u9b54",
      cn: "即刻咏唱",
    },
    levelAcquired: 18,
    cooldown: 60,
    iconPrefix: "mrange",
    xivDbId: "7561",
    abilityType: AbilityType.Utility,
  },
  Surecast: {
    name: "Surecast",
    translation: {
      de: "Unbeirrbarkeit",
      en: "Surecast",
      fr: "Sto\u00efcisme",
      ja: "\u5805\u5b9f\u9b54",
      cn: "沉稳咏唱",
    },
    levelAcquired: 44,
    cooldown: 120,
    xivDbId: "7559",
    iconPrefix: "mrange",
    abilityType: AbilityType.Utility,
    statuses: [
      {
        duration: 6,
      },
    ],
  },
  LucidDreaming: {
    name: "Lucid Dreaming",
    translation: {
      de: "Klartraum",
      en: "Lucid Dreaming",
      fr: "R\u00eave lucide",
      ja: "\u30eb\u30fc\u30b7\u30c3\u30c9\u30c9\u30ea\u30fc\u30e0",
      cn: "醒梦",
    },
    levelAcquired: 24,
    cooldown: 60,
    xivDbId: "7562",
    iconPrefix: "mrange",
    abilityType: AbilityType.Utility,
    statuses: [{ duration: 21 }],
  },
};

const magicSharedTraits: ITrait[] = [
  {
    level: 94,
    name: "Enhanced Swiftcast",
    apply: abilityTrait("Swiftcast", { cooldown: 40 }),
  },
];

const meleeSharedAbilities: IAbilities = {
  Feint: {
    name: "Feint",
    translation: {
      de: "Zerm\u00fcrben",
      en: "Feint",
      fr: "Restreinte",
      ja: "\u727d\u5236",
      cn: "牵制",
    },
    cooldown: 90,
    xivDbId: "7549",
    iconPrefix: "melee",
    abilityType: AbilityType.PartyDefense,
    requiresBossTarget: true,
    levelAcquired: 2,
    statuses: [
      {
        duration: 10,
        effects: [
          Effects.mitigation.party(10, DamageType.Physical),
          Effects.mitigation.party(5, DamageType.Magical),
        ],
      },
    ],
  },
};

const meleeSharedTraits: ITrait[] = [
  {
    level: 98,
    name: "Enhanced Feint",
    apply: abilityTrait("Feint", (ability) => {
      ability.statuses = [
        {
          ...ability.statuses[0],
          duration: 15,
        },
      ];
    }),
  },
];

const rangeSharedAbilities: IAbilities = {};

const casterSharedAbilities: IAbilities = {
  Addle: {
    name: "Addle",
    translation: {
      de: "Stumpfsinn",
      en: "Addle",
      fr: "Embrouillement",
      ja: "\u30a2\u30c9\u30eb",
      cn: "昏乱",
    },
    cooldown: 90,
    xivDbId: "7560",
    iconPrefix: "mrange",
    abilityType: AbilityType.PartyDefense,
    requiresBossTarget: true,
    levelAcquired: 8,
    statuses: [
      {
        duration: 10,
        effects: [
          Effects.mitigation.party(10, DamageType.Magical),
          Effects.mitigation.party(5, DamageType.Physical),
        ],
      },
    ],
  },
  ...magicSharedAbilities,
};

const casterSharedTraits: ITrait[] = [
  {
    level: 98,
    name: "Enhanced Addle",
    apply: abilityTrait("Addle", (ability) => {
      ability.statuses = [
        {
          ...ability.statuses[0],
          duration: 15,
        },
      ];
    }),
  },
  ...magicSharedTraits,
];

const healerSharedAbilities: IAbilities = {
  ...magicSharedAbilities,
};

const healerSharedTraits: ITrait[] = [...magicSharedTraits];

type MedicineEnum = "Mind" | "Intelligence" | "Dexterity" | "Strength";

const medicatedStatus = {
  duration: 30,
};

const medicineTemplate = {
  name: "Medicine",
  translation: {
    de: "Arznei",
    en: "Medicine",
    fr: "M\u00e9dicament",
    ja: "\u85ac\u54c1",
    cn: "药品",
  },
  statuses: [medicatedStatus],
  levelAcquired: 1,
  cooldown: 270,
  abilityType: AbilityType.SelfDamageBuff,
  xivDbType: "item",
  detectStrategy: byBuffRemove(1000049, "Medicine", 30),
};

const medicineAbilities: { [TName in MedicineEnum]: IAbility } = {
  Mind: {
    ...medicineTemplate,
    xivDbId: "27999",
    icon: "Medicine/22451_Mind",
  },
  Intelligence: {
    ...medicineTemplate,
    xivDbId: "27998",
    icon: "Medicine/22450_Intelligence",
  },
  Dexterity: {
    ...medicineTemplate,
    xivDbId: "27996",
    icon: "Medicine/22448_Dexterity",
  },
  Strength: {
    ...medicineTemplate,
    xivDbId: "27995",
    icon: "Medicine/22447_Strength",
  },
};

function withSharedAbilities<T extends IJobTemplate>(
  job: T,
  sharedAbilities: IAbilities,
  sharedTraits: ITrait[]
): T {
  return {
    ...job,
    abilities: [...(job.abilities || []), ...getAbilitiesFrom(sharedAbilities)],
    traits: [...job.traits, ...sharedTraits],
  };
}

function withMedicine<T extends IJobTemplate>(
  job: T,
  medicine: MedicineEnum
): T {
  return {
    ...job,
    abilities: [...(job.abilities || []), medicineAbilities[medicine]],
  };
}

type RoledJob<T extends Role> = { role: T };

export function withTankSharedAbilities<
  T extends IJobTemplate & RoledJob<Role.Tank>
>(job: T): T {
  return withMedicine(
    withSharedAbilities(job, tankSharedAbilities, tankSharedTraits),
    "Strength"
  );
}

function withMeleeSharedAbilities<
  T extends IJobTemplate & RoledJob<Role.Melee>
>(job: T, medicine: "Strength" | "Dexterity"): T {
  return withMedicine(
    withSharedAbilities(job, meleeSharedAbilities, meleeSharedTraits),
    medicine
  );
}

export function withStrengthMeleeSharedAbilities<
  T extends IJobTemplate & RoledJob<Role.Melee>
>(job: T): T {
  return withMeleeSharedAbilities(job, "Strength");
}

export function withDexterityMeleeSharedAbilities<
  T extends IJobTemplate & RoledJob<Role.Melee>
>(job: T): T {
  return withMeleeSharedAbilities(job, "Dexterity");
}

export function withCasterSharedAbilities<
  T extends IJobTemplate & RoledJob<Role.Caster>
>(job: T): T {
  return withMedicine(
    withSharedAbilities(job, casterSharedAbilities, casterSharedTraits),
    "Intelligence"
  );
}

export function withHealerSharedAbilities<
  T extends IJobTemplate & RoledJob<Role.Healer>
>(job: T): T {
  return withMedicine(
    withSharedAbilities(job, healerSharedAbilities, healerSharedTraits),
    "Mind"
  );
}

export function withRangeSharedAbilities<
  T extends IJobTemplate & RoledJob<Role.Range>
>(job: T): T {
  return withMedicine(
    withSharedAbilities(job, rangeSharedAbilities, []),
    "Dexterity"
  );
}
