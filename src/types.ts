export type CharacterStats = Record<string, number>;

export interface Character {
  name: string;
  class: string;
  stats: CharacterStats;
  inventory: string;
  bio: string;
  // D&D 3.5 specific optional fields
  level?: number;
  race?: string;
  alignment?: string;
  deity?: string;
  hpCurrent?: number;
  hpMax?: number;
  acArmor?: number;
  acShield?: number;
  acNatural?: number;
  acDeflection?: number;
  acMisc?: number;
  bab?: number;
  savesBase?: { fort: number; reflex: number; will: number };
  savesMisc?: { fort: number; reflex: number; will: number };
  skills?: Record<string, { ranks: number; misc: number; classSkill: boolean }>;
  money?: { cp: number; sp: number; gp: number; pp: number };

  // Cyberpunk RED specific optional fields
  handle?: string;
  humanityCurrent?: number;
  humanityMax?: number;
  armorHead?: number;
  armorBody?: number;
  cyberware?: string;
  eurodollars?: number;
  lifepath?: string;
}

export interface Message {
  role: "system" | "user" | "model";
  content: string;
}

export interface ScenarioDocument {
  title: string;
  content: string;
  filename: string;
}

export interface Scenario {
  title: string;
  description: string;
  custom?: boolean;
  rpgSystem?: 'dd35' | 'cyberpunk' | 'custom';
  documents?: ScenarioDocument[];
}

export interface GmSettings {
  tone: "cyberpunk" | "noir" | "brutal" | "slapstick" | "action";
  length: "short" | "medium" | "long";
  customDirectives: string;
  difficultyLevel: number;
}

export interface DiceRoll {
  dice: number;
  result: number;
  modifier: number;
  statName: string;
  total: number;
  text: string;
}

export interface StatConfig {
  key: string;
  label: string;
}

export interface DiceConfig {
  dice: number;
  desc: string;
  statKey: string;
}

export type ResourceType = 'rulebook' | 'map' | 'dlc' | 'other';

export interface CampaignResource {
  id: string;
  title: string;
  description: string;
  url: string;
  type: ResourceType;
  icon?: string;
}

export interface Campaign {
  id: string;
  title: string;
  description: string;
  systemInstruction: string;
  defaultCharacter: Character;
  scenarios: Scenario[];
  statsConfig: StatConfig[];
  dicesConfig: DiceConfig[];
  status: string;
  resources?: CampaignResource[];
  rpgSystem?: 'dd35' | 'cyberpunk' | 'custom';
}

