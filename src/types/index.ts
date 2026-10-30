export type ActionType = 
  | 'Ship as-is' 
  | 'Ship after confirmation' 
  | 'Nudge to prepaid' 
  | 'Hold / cancel';

export type RiskCategory = 'Low' | 'Medium' | 'Elevated' | 'Critical';
export type AddressQuality = 'High' | 'Medium' | 'Low' | 'Suspicious' | 'high' | 'medium' | 'low' | 'suspicious';

export interface Order {
  order_id: string;
  order_date: string;
  customer_name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  order_value: number;
  items_count: number;
  customer_type: 'first_time' | 'repeat';
  prior_rto_count: number;
  prior_delivered_count: number;
  payment_method: 'COD' | 'Prepaid';
  delivery_status: 'Delivered' | 'RTO';
  rto_reason?: string;
  
  // Decision Engine outputs
  risk_score?: number;
  risk_category?: RiskCategory;
  recommended_action?: ActionType;
  decision_reason?: string;
  key_risk_factors?: string[];
  confidence_level?: number;
  address_quality?: AddressQuality;
  is_hinglish?: boolean;
  is_fake_name?: boolean;
  
  // Operational workflow
  is_reviewed_manually?: boolean;
  manual_override_action?: ActionType;
  operational_notes?: string;
}

export interface BusinessRulesConfig {
  lowRiskMax: number;          // e.g. 28 -> Ship as-is
  mediumRiskMax: number;       // e.g. 54 -> Ship after confirmation
  elevatedRiskMax: number;     // e.g. 78 -> Nudge to prepaid
  criticalRiskMin: number;     // e.g. 79+ -> Hold / cancel
  
  // Weights (0.1 to 2.0)
  pincodeWeight: number;
  customerHistoryWeight: number;
  addressQualityWeight: number;
  orderValueWeight: number;
  
  // Threshold values
  prepaidDiscountAmount: number; // ₹50
  prepaidDiscountPercentage: number; // 7.7%
  confirmationTimeoutHours: number; // 24
  protectFirstTimeCAC: boolean; // Prevent auto-cancellation of first-time buyers with good intent
  highBasketThreshold: number; // ₹999
}

export const DEFAULT_BUSINESS_RULES: BusinessRulesConfig = {
  lowRiskMax: 28,
  mediumRiskMax: 54,
  elevatedRiskMax: 78,
  criticalRiskMin: 79,
  pincodeWeight: 1.0,
  customerHistoryWeight: 1.2,
  addressQualityWeight: 1.1,
  orderValueWeight: 0.9,
  prepaidDiscountAmount: 50,
  prepaidDiscountPercentage: 7.7,
  confirmationTimeoutHours: 24,
  protectFirstTimeCAC: true,
  highBasketThreshold: 999,
};

export interface UnitEconomics {
  avgOrderValue: number;         // ₹649
  grossMarginRate: number;       // 62%
  forwardShipping: number;       // ₹65
  returnShipping: number;        // ₹65
  packagingHandling: number;     // ₹25
  damagedProductRate: number;    // 8%
  avgProductCost: number;        // ₹180
  totalRtoLoss: number;          // ₹169.40 (65 + 65 + 25 + 0.08*180)
  customerAcquisitionCost: number; // ₹300+
  baseCodRtoRate: number;        // 28%
  prepaidRtoRate: number;        // 4%
}

export const BASE_UNIT_ECONOMICS: UnitEconomics = {
  avgOrderValue: 649,
  grossMarginRate: 0.62,
  forwardShipping: 65,
  returnShipping: 65,
  packagingHandling: 25,
  damagedProductRate: 0.08,
  avgProductCost: 180,
  totalRtoLoss: 169.40,
  customerAcquisitionCost: 300,
  baseCodRtoRate: 0.28,
  prepaidRtoRate: 0.04,
};

export interface DecisionLogItem {
  id: string;
  title: string;
  problem: string;
  alternatives_considered: string[];
  selected_approach: string;
  reason: string;
  expected_impact: string;
  created_at: string;
  author: string;
}

export interface AiUsageLogItem {
  id: string;
  tool_used: string;
  purpose: string;
  prompt_summary: string;
  output_received: string;
  weak_or_incorrect_output: string;
  how_verified: string;
  how_corrected: string;
  is_live_example: boolean;
}

export interface PincodeStat {
  pincode: string;
  city: string;
  state: string;
  tier: 1 | 2 | 3;
  historicalRtoRate: number;
  totalOrders: number;
  rtoCount: number;
  deliveredCount: number;
  avgOrderValue: number;
  status: 'Normal' | 'Monitor' | 'High Risk' | 'Critical';
}
