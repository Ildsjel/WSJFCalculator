export enum WSJFCategory {
  AVOID_COST = 'Avoid Cost',
  REDUCE_COST = 'Reduce Cost',
  PROTECT_REVENUE = 'Protect Revenue',
  INCREASE_REVENUE = 'Increase Revenue',
}

export interface WSJFItem {
  id: string;
  name: string;
  description: string;
  categories: WSJFCategory[]; // Changed from single category to array
  effort: number; // Shared effort for the item
  createdAt: number; // Timestamp
  wsjfScore: number;
  
  // Dynamic fields based on category
  data: Record<string, number | string>;
}

export interface WSJFFormData {
  name: string;
  description: string;
  categories: WSJFCategory[];
  effort: number;
  
  // Specific fields
  costAvoidedTotal?: number;
  // estimationAvoidValue removed (merged into effort)
  timeCostOccur?: string;
  risk?: number;
  
  peopleNow?: number;
  hoursNow?: number;
  peopleFuture?: number;
  hoursFuture?: number;
  // estimationValue removed (merged into effort)

  totalRevenueProtected?: number;
  marketShare?: number;
  // estimationProtectValue removed (merged into effort)
  timeToLossOccur?: string;

  revenueNow?: number;
  salesNow?: number;
  revenueFuture?: number;
  salesFuture?: number;
  // estimationIncreaseValue removed (merged into effort)
}