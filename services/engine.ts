
import { HealthMetrics } from '../types';

/**
 * HealthIQure Actuarial Engine
 * Based on "Complete Hybrid Health Score-Based Insurance System" (Doc 8)
 */

// --- 1. NORMALIZATION HELPERS (0-100 Scale) ---
const normalizeBP = (bp: number): number => {
  // Ideal: 110-120. >140 is bad. <90 is bad.
  if (bp >= 110 && bp <= 125) return 100;
  if (bp > 125) return Math.max(0, 100 - (bp - 125) * 2); 
  if (bp < 110) return Math.max(0, 100 - (110 - bp) * 2);
  return 80;
};

const normalizeSugar = (sugar: number, isFasting = true): number => {
  // Ideal Fasting: 70-100. 
  if (sugar >= 70 && sugar <= 100) return 100;
  if (sugar > 100) return Math.max(0, 100 - (sugar - 100) * 1.5);
  return 90;
};

const normalizeBMI = (weight: number, heightCm: number): number => {
  const hM = heightCm / 100;
  const bmi = weight / (hM * hM);
  // Ideal: 18.5 - 24.9
  if (bmi >= 18.5 && bmi <= 24.9) return 100;
  if (bmi > 25) return Math.max(0, 100 - (bmi - 25) * 5);
  if (bmi < 18.5) return Math.max(0, 100 - (18.5 - bmi) * 5);
  return 80;
};

const normalizeHbA1c = (val: number): number => {
  // < 5.7 is Normal (100). > 6.5 is Diabetes (0-50).
  if (val < 5.7) return 100;
  if (val > 9) return 0;
  return Math.max(0, 100 - (val - 5.7) * 25);
};

const normalizeLipids = (val: number): number => {
  // Total Cholesterol < 200 is good.
  if (val < 200) return 100;
  return Math.max(0, 100 - (val - 200));
};

// --- 2. WEIGHTING LOGIC (Pages 2-5 of PDF) ---

export const calculateHealthScore = (metrics: HealthMetrics): number => {
  const scores = {
    bp: normalizeBP(metrics.systolicBP),
    sugar: normalizeSugar(metrics.fastingSugar),
    bmi: normalizeBMI(metrics.weight, metrics.height),
    // Defaults for quarterly if missing, assumed average for calculation safety
    hba1c: metrics.hba1c ? normalizeHbA1c(metrics.hba1c) : 85, 
    lipids: metrics.cholesterol ? normalizeLipids(metrics.cholesterol) : 85,
    cbc: 90, // Proxy/Assumption if missing
    thyroid: 90,
    vitD: 85
  };

  // Check if we are doing a Full Quarterly Score (Clinical) or Monthly Score (Basic)
  // For this engine, if hba1c is present, we assume Quarterly context.
  const isQuarterly = !!metrics.hba1c;

  let weightedScore = 0;

  if (metrics.age < 30) {
    // PREVENTATIVE PHASE
    if (isQuarterly) {
      // Page 4: HbA1c/Sugar 25, Lipids 15, CBC 20, Thyroid 10, LFT+KFT 10, VitD 20
      weightedScore = 
        (scores.hba1c * 0.25) + 
        (scores.lipids * 0.15) + 
        (scores.cbc * 0.20) + 
        (scores.thyroid * 0.10) + 
        (90 * 0.10) + // LFT/KFT assumed
        (scores.vitD * 0.20);
    } else {
      // Page 2: BP 25%, Sugar 25%, BMI 50%
      weightedScore = (scores.bp * 0.25) + (scores.sugar * 0.25) + (scores.bmi * 0.50);
    }
  } else if (metrics.age >= 30 && metrics.age < 45) {
    // RISK EMERGENCE
    if (isQuarterly) {
      // HbA1c 30, Lipids 20, CBC 10, Thyroid 10, LFT 15, VitD 15
      weightedScore = 
        (scores.hba1c * 0.30) + 
        (scores.lipids * 0.20) + 
        (scores.cbc * 0.10) + 
        (scores.thyroid * 0.10) + 
        (90 * 0.15) + 
        (scores.vitD * 0.15);
    } else {
      // BP 40%, Sugar 35%, BMI 25%
      weightedScore = (scores.bp * 0.40) + (scores.sugar * 0.35) + (scores.bmi * 0.25);
    }
  } else {
    // DISEASE CONTROL (45+)
    if (isQuarterly) {
      // HbA1c 35, Lipids 25, LFT 20, CBC 5, Thyroid 5, VitD 10
      weightedScore = 
        (scores.hba1c * 0.35) + 
        (scores.lipids * 0.25) + 
        (90 * 0.20) + 
        (scores.cbc * 0.05) + 
        (scores.thyroid * 0.05) + 
        (scores.vitD * 0.10);
    } else {
      // BP 50%, Sugar 40%, BMI 10%
      weightedScore = (scores.bp * 0.50) + (scores.sugar * 0.40) + (scores.bmi * 0.10);
    }
  }

  // Monthly Engagement Bonus (Steps) - implied by "Monthly Engagement" in Page 1 title
  // If steps > 8000, add up to 5 points bonus, cap at 100
  if (metrics.dailySteps > 8000) {
    weightedScore += Math.min(5, (metrics.dailySteps - 8000) / 1000);
  }
  
  if (metrics.smoker) {
    weightedScore -= 10;
  }
  
  if (metrics.alcohol) {
    weightedScore -= 5;
  }

  if (metrics.preExistingConditions) {
    weightedScore -= 5;
  }

  return Math.round(Math.min(100, Math.max(0, weightedScore)));
};

// --- 3. PREMIUM COMPOUNDING LOGIC (Page 6 of PDF) ---

export const calculateNewPremium = (
  currentPremium: number, 
  currentScore: number, 
  previousScore: number,
  isQuarterlyUpdate: boolean
) => {
  // Determine Trend
  const diff = currentScore - previousScore;
  let percentChange = 0;
  let trendDesc = "Stable";

  if (isQuarterlyUpdate) {
    // Quarterly (Major Adjustments)
    // Strong Improvement (+5%), Mild (+2%), Mild Decline (-2%), Strong (-5%)
    // Assuming thresholds for "Strong" vs "Mild"
    if (diff >= 10) { percentChange = -5; trendDesc = "Strong Improvement"; }
    else if (diff >= 2) { percentChange = -2; trendDesc = "Mild Improvement"; }
    else if (diff <= -10) { percentChange = 5; trendDesc = "Strong Decline"; }
    else if (diff <= -2) { percentChange = 2; trendDesc = "Mild Decline"; }
  } else {
    // Monthly (Small Adjustments)
    // Improvement +1% discount, Deterioration -1% discount (price increase)
    if (diff > 0) { percentChange = -1; trendDesc = "Small Improvement"; }
    else if (diff < 0) { percentChange = 1; trendDesc = "Small Decline"; }
  }

  // Calculate new premium
  const amountChange = currentPremium * (percentChange / 100);
  const newPremium = Math.round(currentPremium + amountChange);

  return {
    newPremium,
    percentChange,
    trendDesc
  };
};

export const calculateBaselinePremium = (age: number, smoker: boolean): number => {
  // Indian Context Pricing (INR)
  let base = 800; // Base monthly in Rupees
  if (age < 30) base = 1200;
  else if (age < 45) base = 2500;
  else base = 4500;

  if (smoker) base *= 1.4;
  return Math.round(base);
};
