import { WSJFCategory, WSJFFormData } from '../types';

// Helper to round down to 2 decimal places
export const roundDownTwoDecimals = (num: number): number => {
  return Math.floor(num * 100) / 100;
};

export const calculateWSJF = (data: WSJFFormData): number => {
  const effort = Number(data.effort) || 0;
  if (effort <= 0) return 0;

  let totalValue = 0;

  try {
    // Avoid Cost Value Calculation
    if (data.categories.includes(WSJFCategory.AVOID_COST)) {
        const costAvoided = Number(data.costAvoidedTotal) || 0;
        let riskFactor = 1;
        if (data.risk !== undefined && data.risk !== null && data.risk.toString() !== '') {
            riskFactor = Number(data.risk) / 100;
        }
        totalValue += (costAvoided * riskFactor);
    }

    // Reduce Cost Value Calculation
    if (data.categories.includes(WSJFCategory.REDUCE_COST)) {
        const rate = 25;
        const current = (Number(data.peopleNow) || 0) * rate * (Number(data.hoursNow) || 0);
        const future = (Number(data.peopleFuture) || 0) * rate * (Number(data.hoursFuture) || 0);
        const reduction = current - future;
        // Only add positive reduction (value), ignore negative
        totalValue += reduction; 
    }

    // Protect Revenue Value Calculation
    if (data.categories.includes(WSJFCategory.PROTECT_REVENUE)) {
        const totalRevenue = Number(data.totalRevenueProtected) || 0;
        let shareFactor = 1;
        if (data.marketShare !== undefined && data.marketShare !== null && data.marketShare.toString() !== '') {
            shareFactor = Number(data.marketShare) / 100;
        }
        totalValue += (totalRevenue * shareFactor);
    }

    // Increase Revenue Value Calculation
    if (data.categories.includes(WSJFCategory.INCREASE_REVENUE)) {
        const current = (Number(data.revenueNow) || 0) * (Number(data.salesNow) || 0);
        const future = (Number(data.revenueFuture) || 0) * (Number(data.salesFuture) || 0);
        const increase = future - current;
        totalValue += increase;
    }

  } catch (e) {
    console.error("Calculation error", e);
    return 0;
  }

  // WSJF = Cost of Delay (Total Value) / Job Size (Effort)
  const score = totalValue / effort;
  
  return roundDownTwoDecimals(score);
};