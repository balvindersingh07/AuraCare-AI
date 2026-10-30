import { Order, RuleThresholds, DEFAULT_THRESHOLDS, PINCODE_PROFILES } from '../data/mockOrdersData';

export const UNIT_ECONOMICS = {
  forwardShipping: 65,
  returnShipping: 65,
  packagingHandling: 25,
  damagedResaleLossRate: 0.08,
  avgProductCost: 180,
  get totalRtoLoss(): number {
    return this.forwardShipping + this.returnShipping + this.packagingHandling + (this.damagedResaleLossRate * this.avgProductCost);
  }, // ₹169.40
  grossMarginRate: 0.62,
  customerAcquisitionCost: 300,
  prepaidRtoRate: 0.04,
  baseCodRtoRate: 0.28,
};

// Check if customer name looks like bot / placeholder / test
export function evaluateNameSuspicion(name: string): { isSuspicious: boolean; reason?: string } {
  const clean = name.toLowerCase().trim();
  const testPatterns = ['asdf', 'test', 'demo', 'user', 'qwerty', 'ghjkl', 'xyz', 'none', 'null', 'fake', 'abc', 'aaa'];

  for (const pattern of testPatterns) {
    if (clean === pattern || clean.includes(pattern)) {
      return { isSuspicious: true, reason: `Suspicious test/placeholder name detected: "${name}"` };
    }
  }

  if (clean.length < 3 || !clean.includes(' ')) {
    // Single word under 3 letters or single letter
    if (clean.length <= 2) {
      return { isSuspicious: true, reason: `Invalid single-letter or incomplete name: "${name}"` };
    }
  }

  // Repeated character spam like "aaaaaa" or "hhhhh"
  if (/([a-zA-Z])\1{3,}/.test(clean)) {
    return { isSuspicious: true, reason: `Keyboard mash or repetitive character string in name: "${name}"` };
  }

  return { isSuspicious: false };
}

// Evaluate Address completeness and nuance (Simulates what the LLM evaluates, or heuristics)
export function evaluateAddressQuality(address: string): {
  quality: 'high' | 'medium' | 'low' | 'suspicious';
  score: number; // 0 (great) to 100 (fake/garbage)
  reason: string;
  isHinglish: boolean;
} {
  const clean = address.toLowerCase();

  // 1. Detect fake / gibberish addresses
  if (clean.length < 12 || /(asdf|qwerty|test|xyz|123 fake|12345)/i.test(clean)) {
    return {
      quality: 'suspicious',
      score: 95,
      reason: 'Incomprehensible or test address with virtually zero courier deliverability.',
      isHinglish: false,
    };
  }

  // 2. Detect Hinglish landmarks (e.g. "mandir ke peeche", "pani ki tanki", "dukan ke samne")
  const hinglishMarkers = ['ke paas', 'ke pass', 'ke samne', 'ke piche', 'ke peeche', 'wali gali', 'makan no', 'dukan', 'mandir', 'basti', 'chhat'];
  const isHinglish = hinglishMarkers.some(m => clean.includes(m));

  // 3. Detect incomplete addresses (missing house / flat / floor / landmark)
  const hasHouseOrFlat = /(flat|house|makan|plot|h\.?no|door|room|apt|apartment|sector|phase|ward|lane|gali)/i.test(clean);
  const hasLandmark = /(near|opp|opposite|behind|beside|front|paas|pass|samne|peeche)/i.test(clean);

  if (!hasHouseOrFlat && !hasLandmark && clean.length < 30) {
    return {
      quality: 'low',
      score: 70,
      reason: 'Vague address missing door/house number and identifiable landmark. High doorstep refusal risk.',
      isHinglish,
    };
  }

  if (hasHouseOrFlat && !hasLandmark && clean.length < 35) {
    return {
      quality: 'medium',
      score: 45,
      reason: 'Contains house identifier but lacks specific landmark for last-mile delivery navigation.',
      isHinglish,
    };
  }

  if (isHinglish) {
    return {
      quality: 'high',
      score: 25,
      reason: 'Hinglish conversational directions present ("' + hinglishMarkers.filter(m => clean.includes(m)).join(', ') + '"). High courier deliverability on phone confirmation.',
      isHinglish: true,
    };
  }

  return {
    quality: 'high',
    score: 10,
    reason: 'Well-structured address with clear unit number, street, and landmark details.',
    isHinglish: false,
  };
}

// The Core Multi-Factor Scoring & Decision Algorithm
export function scoreAndDecideOrder(order: Order, thresholds: RuleThresholds = DEFAULT_THRESHOLDS): {
  risk_score: number;
  recommended_action: 'Ship as-is' | 'Ship after confirmation' | 'Nudge to prepaid' | 'Hold / cancel';
  decision_reason: string;
  address_quality: 'high' | 'medium' | 'low' | 'suspicious';
} {
  let score = 0;
  const reasons: string[] = [];

  // 1. Pincode Risk Factor (Math/Code)
  const pinData = PINCODE_PROFILES[order.pincode];
  const pinRtoRate = pinData ? pinData.historicalRtoRate : 0.28;

  if (pinRtoRate >= 0.45) {
    score += 35;
    reasons.push(`High-risk Tier 3 pincode ${order.pincode} (${(pinRtoRate * 100).toFixed(0)}% historic RTO)`);
  } else if (pinRtoRate >= 0.30) {
    score += 20;
    reasons.push(`Moderate-risk pincode ${order.pincode} (${(pinRtoRate * 100).toFixed(0)}% historic RTO)`);
  } else if (pinRtoRate <= 0.15) {
    score -= 10;
  }

  // 2. Customer Trust & Prior History (Math/Code)
  if (order.customer_type === 'repeat') {
    if (order.prior_rto_count === 0 && order.prior_delivered_count > 0) {
      score -= 30; // Verified repeat loyal customer
      reasons.push(`Trusted repeat buyer (${order.prior_delivered_count} delivered, 0 RTOs)`);
    } else if (order.prior_rto_count >= 2) {
      score += 55;
      reasons.push(`Serial RTO offender (${order.prior_rto_count} past returned orders)`);
    } else if (order.prior_rto_count === 1) {
      score += 25;
      reasons.push(`Customer has 1 prior RTO record`);
    }
  } else {
    // First-time customer
    score += 15;
    if (order.order_value >= thresholds.highValueThreshold) {
      score += 20;
      reasons.push(`First-time buyer with high COD cart value (₹${order.order_value})`);
    }
  }

  // 3. Name & Identity Quality (LLM / NLP)
  const nameEval = evaluateNameSuspicion(order.customer_name);
  if (nameEval.isSuspicious) {
    score += 50;
    reasons.push(nameEval.reason!);
  }

  // 4. Address Completeness & Clarity (LLM / NLP)
  const addrEval = evaluateAddressQuality(order.address);
  if (addrEval.quality === 'suspicious') {
    score += 55;
    reasons.push(addrEval.reason);
  } else if (addrEval.quality === 'low') {
    score += 30;
    reasons.push(addrEval.reason);
  } else if (addrEval.quality === 'medium') {
    score += 12;
  } else if (addrEval.isHinglish) {
    score -= 5;
    reasons.push('Contains vernacular landmark directions');
  }

  // Clamp score between 0 and 100
  const finalScore = Math.min(100, Math.max(0, Math.round(score)));

  // Decision logic balancing Operations (avoid ₹170 RTO) vs Marketing (protect ₹300 CAC & revenue)
  let action: 'Ship as-is' | 'Ship after confirmation' | 'Nudge to prepaid' | 'Hold / cancel';
  let primaryReason = '';

  if (finalScore >= thresholds.autoCancelThreshold) {
    // Only cancel if clearly unrecoverable or fake
    if (thresholds.protectFirstTimeCAC && order.customer_type === 'first_time' && !nameEval.isSuspicious && addrEval.quality !== 'suspicious') {
      // Don't kill first-time CAC if the address can be fixed or paid upfront!
      action = 'Nudge to prepaid';
      primaryReason = `High risk (${finalScore}/100) due to location/cart, but preserving ₹300 CAC: Nudge to prepaid with ₹${thresholds.prepaidDiscountAmount} discount instead of cancelling.`;
    } else {
      action = 'Hold / cancel';
      primaryReason = `Critical RTO risk (${finalScore}/100): ${reasons.slice(0, 2).join('; ')}. Immediate hold saves ₹169 courier cost.`;
    }
  } else if (finalScore >= thresholds.nudgePrepaidThreshold) {
    action = 'Nudge to prepaid';
    primaryReason = `Elevated risk profile (${finalScore}/100): ${reasons.slice(0, 2).join('; ')}. Converting to prepaid saves ₹169 RTO cost while securing ₹${Math.round(order.order_value * UNIT_ECONOMICS.grossMarginRate)} margin.`;
  } else if (finalScore >= thresholds.confirmThreshold) {
    action = 'Ship after confirmation';
    primaryReason = `Moderate risk (${finalScore}/100): ${reasons.slice(0, 2).join('; ')}. Fast 1-click WhatsApp confirmation required before warehouse dispatch.`;
  } else {
    action = 'Ship as-is';
    primaryReason = reasons.length > 0 
      ? `Low risk score (${finalScore}/100): ${reasons[0]}. Auto-cleared for immediate fulfillment.`
      : `Clean customer & address profile (${finalScore}/100). Auto-cleared for immediate fulfillment.`;
  }

  return {
    risk_score: finalScore,
    recommended_action: action,
    decision_reason: primaryReason,
    address_quality: addrEval.quality,
  };
}

// Batch simulation & financial metrics calculator
export function evaluateBatch(orders: Order[], thresholds: RuleThresholds = DEFAULT_THRESHOLDS) {
  let countShipAsIs = 0;
  let countConfirm = 0;
  let countNudge = 0;
  let countCancel = 0;

  let avoidedRtoCount = 0;
  let falseCancelCount = 0;

  let totalRtoLossAvoided = 0;
  let totalProfitLostFromFalseCancels = 0;
  let totalPrepaidDiscountsGiven = 0;
  let totalNudgeRecoveredGrossProfit = 0;

  const enrichedOrders = orders.map(o => {
    const res = scoreAndDecideOrder(o, thresholds);
    const enriched: Order = {
      ...o,
      risk_score: res.risk_score,
      recommended_action: res.recommended_action,
      decision_reason: res.decision_reason,
      address_quality: res.address_quality,
    };

    const actualWasRto = o.delivery_status === 'RTO';
    const profitIfDelivered = o.order_value * UNIT_ECONOMICS.grossMarginRate;

    switch (res.recommended_action) {
      case 'Ship as-is':
        countShipAsIs++;
        break;

      case 'Ship after confirmation':
        countConfirm++;
        // WhatsApp confirmation: 78% of genuine buyers confirm, while 82% of RTOs ghost or cancel
        if (actualWasRto) {
          avoidedRtoCount += 0.82;
          totalRtoLossAvoided += 0.82 * UNIT_ECONOMICS.totalRtoLoss;
        }
        break;

      case 'Nudge to prepaid':
        countNudge++;
        // 24% of nudged customers accept the ₹50 discount and pay upfront
        // When prepaid, RTO drops from 28% to 4%
        const conversionRate = 0.24;
        totalPrepaidDiscountsGiven += conversionRate * thresholds.prepaidDiscountAmount;
        if (actualWasRto) {
          // If customer would have RTO'd, 24% paid prepaid (only 4% RTO) and 76% ghosted (0 RTO!)
          // Net RTO avoided is ~96%
          avoidedRtoCount += 0.90;
          totalRtoLossAvoided += 0.90 * UNIT_ECONOMICS.totalRtoLoss;
        } else {
          // Genuine customer who paid prepaid: we secured margin minus discount
          totalNudgeRecoveredGrossProfit += conversionRate * (profitIfDelivered - thresholds.prepaidDiscountAmount);
        }
        break;

      case 'Hold / cancel':
        countCancel++;
        if (actualWasRto) {
          avoidedRtoCount += 1.0;
          totalRtoLossAvoided += UNIT_ECONOMICS.totalRtoLoss;
        } else {
          // False positive: we cancelled an order that would have been successfully delivered!
          falseCancelCount += 1.0;
          // Lost margin + wasted CAC
          totalProfitLostFromFalseCancels += (profitIfDelivered + (o.customer_type === 'first_time' ? UNIT_ECONOMICS.customerAcquisitionCost : 0));
        }
        break;
    }

    return enriched;
  });

  const netImpact = totalRtoLossAvoided + totalNudgeRecoveredGrossProfit - totalProfitLostFromFalseCancels - totalPrepaidDiscountsGiven;

  return {
    orders: enrichedOrders,
    summary: {
      totalOrders: orders.length,
      buckets: {
        shipAsIs: countShipAsIs,
        confirm: countConfirm,
        nudge: countNudge,
        cancel: countCancel,
      },
      avoidedRtoCount: Math.round(avoidedRtoCount),
      falseCancelCount: Math.round(falseCancelCount),
      totalRtoLossAvoided: Math.round(totalRtoLossAvoided),
      totalProfitLostFromFalseCancels: Math.round(totalProfitLostFromFalseCancels),
      totalPrepaidDiscountsGiven: Math.round(totalPrepaidDiscountsGiven),
      totalNudgeRecoveredGrossProfit: Math.round(totalNudgeRecoveredGrossProfit),
      netImpact: Math.round(netImpact),
    }
  };
}
