
export enum ViewState {
  DASHBOARD = 'DASHBOARD',
  SLEEP = 'SLEEP',
  GROWTH = 'GROWTH',
  NUTRITION = 'NUTRITION',
  MILESTONES = 'MILESTONES',
  COMMUNITY = 'COMMUNITY',
  AI_CHAT = 'AI_CHAT',
  MEMORY = 'MEMORY',
  GARDEN = 'GARDEN' // New View
}

export interface BabyProfile {
  name: string;
  birthDate: string;
  weight: number; // kg
  height: number; // cm
  gender: 'male' | 'female';
}

export interface GrowthRecord {
  month: number;
  weight: number;
  height: number; // stored in cm or inch depending on system, but typically normalized
  standardWeight: number; 
  standardHeight: number; 
}

export interface Milestone {
  id: string;
  title: string;
  category: 'motor' | 'language' | 'social' | 'cognitive';
  completed: boolean;
  ageMonth: number;
}

export interface Leap {
  id: number;
  week: number;
  title: string;
  description: string;
  status: 'sunny' | 'stormy'; // Stormy = fussy period, Sunny = skill mastery
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface Recipe {
  name: string;
  ageGroup: string;
  ingredients: string[];
  instructions: string;
}

export interface FoodSafetyInfo {
  name: string;
  minAgeMonths: number;
  allergenRisk: 'high' | 'medium' | 'low';
  chokingHazard: 'high' | 'medium' | 'low';
  howToServe: {
    ageGroup: string;
    description: string;
  }[];
  nutritionalBenefits: string;
}

export interface DailyLog {
  id: string;
  type: 'feed' | 'diaper' | 'sleep';
  subType?: 'breast_left' | 'breast_right' | 'bottle' | 'wet' | 'dirty' | 'mixed';
  value?: number; // minutes for breast, ml for bottle
  timestamp: Date;
  notes?: string;
}

export interface Memory {
  id: string;
  title: string;
  date: string;
  imageUrl?: string;
  description: string;
  isAiGenerated?: boolean; // New: To mark auto-generated diaries
}

export interface TimeCapsuleMessage {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  unlockDate: string; // YYYY-MM-DD
  isLocked: boolean;
}

// --- GAMIFICATION TYPES ---

export interface GamificationState {
  level: number;
  currentXP: number;
  nextLevelXP: number;
  streakDays: number;
  treeStage: 'seed' | 'sprout' | 'sapling' | 'tree' | 'blooming';
  achievements: Achievement[];
  dailyQuests: Quest[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: Date;
}

export interface Quest {
  id: string;
  title: string;
  targetCount: number;
  currentCount: number;
  xpReward: number;
  completed: boolean;
}
