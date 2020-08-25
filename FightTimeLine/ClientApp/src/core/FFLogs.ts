// -----
// Fight
// -----

export interface Fight {
  id: number;

  boss: number;
  name: string;
  zoneID: number;
  zoneName: string;
  lastPhaseForPercentageDisplay?: number;

  difficulty?: number;
  bossPercentage?: number;
  fightPercentage?: number;
  kill?: boolean;
  partial?: number;
  size?: number;
  standardComposition?: boolean;

  start_time: number;
  end_time: number;
}

export interface Phase {
  boss: Fight['boss'];
  phases: string[];
}

// -----
// Actors
// -----

export enum ActorType {
  // Enemy
  BOSS = 'Boss',
  NPC = 'NPC',

  // Friendly
  PALADIN = 'Paladin',
  WARRIOR = 'Warrior',
  DARK_KNIGHT = 'DarkKnight',
  WHITE_MAGE = 'WhiteMage',
  SCHOLAR = 'Scholar',
  ASTROLOGIAN = 'Astrologian',
  MONK = 'Monk',
  DRAGOON = 'Dragoon',
  NINJA = 'Ninja',
  SAMURAI = 'Samurai',
  BARD = 'Bard',
  MACHINIST = 'Machinist',
  BLACK_MAGE = 'BlackMage',
  SUMMONER = 'Summoner',
  RED_MAGE = 'RedMage',
  LIMIT_BREAK = 'LimitBreak',

  // Pet
  PET = 'Pet',
}

export interface ActorFightInstance {
  id: Fight['id'];
  groups?: number;
  instances?: number;
}

interface BaseActor {
  guid: number;
  id: number;
  name: string;
  type: ActorType;
}

export interface Actor extends BaseActor {
  fights: ActorFightInstance[];
}

export interface Pet extends Actor {
  petOwner: Actor['id'];
}

export interface ActorResources {
  hitPoints: number;
  maxHitPoints: number;
  mp: number;
  maxMP: number;
  tp: number;
  maxTp: number;
  x: number;
  y: number;
}

// -----
// Events
// -----

export enum AbilityType {
  PHYSICAL_DOT = 1,
  HEAL = 8,
  SPECIAL = 32,
  MAGICAL_DOT = 64,
  PHYSICAL_DIRECT = 128,
  LIMIT_BREAK = 256,
  MAGICAL_DIRECT = 1024,
}

export interface Ability {
  abilityIcon: string;
  guid: number;
  name: string;
  type: AbilityType;
}

// Hell if I know. Seems to be used for 'Environment', and that's about it.
interface EventActor extends BaseActor {
  icon: string;
}

export interface Event {
  timestamp: number;
  type: string | symbol;

  source?: EventActor;
  sourceID?: number;
  sourceInstance?: number;
  sourceIsFriendly: boolean;
  target?: EventActor;
  targetID?: number;
  targetInstance?: number;
  targetIsFriendly: boolean;
}

export interface Events {
  events: Event[];
  jobs: IJobInfo[];
  start_time: number;
  name: string;
}

export interface AbilityEvent extends Event {
  ability: Ability;
  bossHp?: number;
}

interface EffectEvent extends AbilityEvent {
  hitType: number;
  tick?: boolean;

  guessAmount?: number;
  expectedAmount?: number;
  finalizedAmount?: number;
  amount: number;

  sourceResources?: ActorResources;
  targetResources: ActorResources;

  simulated?: boolean;
  actorPotencyRatio?: number;
  expectedCritRate?: number;
  directHitPercentage?: number;
  debugMultiplier?: number;
  multiplier?: number;
}

export interface DeathEvent extends Event { type: 'death' }
export interface CastEvent extends AbilityEvent { type: 'begincast' | 'cast' }

export const isDamageEvent = (ev: AbilityEvent): ev is DamageEvent => ev.type === 'damage';

export interface DamageEvent extends EffectEvent {
  type: 'damage';
  absorbed: number;
  multistrike?: boolean;
  blocked?: number;
}
export interface HealEvent extends EffectEvent {
  type: 'heal';
  overheal: number;
}
export interface BuffEvent extends AbilityEvent {
  type: (
    'applybuff' |
    'applydebuff' |
    'refreshbuff' |
    'refreshdebuff' |
    'removebuff' |
    'removedebuff'
  )
}
export interface BuffStackEvent extends AbilityEvent {
  type: (
    'applybuffstack' |
    'applydebuffstack' |
    'removebuffstack' |
    'removedebuffstack'
  )
  stack: number;
}


export interface ReportFightsResponse {
  end: number;
  enemies: Actor[];
  enemyPets: Pet[];
  fights: Fight[];
  friendlies: Actor[];
  friendlyPets: Pet[];
  lang: string;
  owner: string;
  phases: Phase[];
  start: number;
  title: string;
  zone: number;
}

export interface IJobInfo {
  id: number;
  petids: number[];
  guid: number;
  petguids: number[];
  job: string;
  actorName: string;
  role?: number;
  rid?: string;
}

export interface ReportEventsResponse {
  events: Event[];
  nextPageTimestamp?: number;
}

export interface Zone {
  id: number;
  name: string;
  frozen: boolean;
  encounters: Encounter[];
  brackets: Brackets;
  partitions: Partition[];
}
export interface Partition {
  name: string;
  compact: string;
  area?: number;
  default?: boolean;
}

export interface Encounter {
  id: number;
  name: string;
}

export interface Brackets {
  min: number;
  max: number;
  bucket: number;
  type: string;
}
