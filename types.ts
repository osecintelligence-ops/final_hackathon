
export enum RiskZone {
  GREEN = 'GREEN',   // Score 80+
  YELLOW = 'YELLOW', // Score 50-79
  RED = 'RED'        // Score < 50
}

export interface HealthMetrics {
  age: number;
  weight: number; // kg
  height: number; // cm
  systolicBP: number; // mmHg
  fastingSugar: number; // mg/dL
  dailySteps: number;
  smoker: boolean;
  alcohol: boolean;
  preExistingConditions: boolean;
  
  // Advanced Clinicals (Quarterly)
  hba1c?: number;
  cholesterol?: number; // Total Lipids
  hemoglobin?: number; // CBC proxy
  thyroidTSH?: number;
  vitaminD?: number;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  joinedDate: string;
  metrics: HealthMetrics;
  
  // Actuarial Data
  basePremium: number; // The static base (BP)
  currentPremium: number; // The Effective Premium (EP)
  healthScore: number;
  cumulativeAdjustment: number; // Net discount/loading percentage
  premiumHistory: { month: string; amount: number; score: number; trend: string }[];
}

export enum ReportStatus {
  ANALYZING = 'ANALYZING',
  USER_REVIEW = 'USER_REVIEW',
  ADMIN_PENDING = 'ADMIN_PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export interface ClinicalReport {
  id: string;
  userId: string;
  userName: string;
  uploadDate: string;
  imageUrl: string; 
  status: ReportStatus;
  
  // Extracted Data matching types
  extractedData: Partial<HealthMetrics>;
}

export interface Nudge {
  title: string;
  description: string;
  icon: string;
}
