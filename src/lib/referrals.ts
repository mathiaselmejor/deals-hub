/** Reglas del programa de referidos (premio ≤ 50% comisión real). */

export const REFERRAL_MIN_SALES = 3;
export const REFERRAL_MAX_REWARD_RATIO = 0.5;
/** Comisión media estimada por venta (hasta tener datos reales de red). */
export const ESTIMATED_COMMISSION_RATE = 0.04;
export const ESTIMATED_AVG_ORDER_EUR = 85;

export function estimateCommission(orderEur: number, rate = ESTIMATED_COMMISSION_RATE): number {
  return Math.round(orderEur * rate * 100) / 100;
}

export function calculateReward(grossCommissionEur: number, confirmedSales: number): {
  eligible: boolean;
  rewardEur: number;
  maxRewardEur: number;
} {
  if (confirmedSales < REFERRAL_MIN_SALES) {
    return { eligible: false, rewardEur: 0, maxRewardEur: 0 };
  }
  const maxRewardEur = Math.round(grossCommissionEur * REFERRAL_MAX_REWARD_RATIO * 100) / 100;
  const rewardEur = maxRewardEur;
  return { eligible: true, rewardEur, maxRewardEur };
}

export function generateReferralCode(userId: string): string {
  const slice = userId.replace(/-/g, "").slice(0, 8).toUpperCase();
  return `DH${slice}`;
}
