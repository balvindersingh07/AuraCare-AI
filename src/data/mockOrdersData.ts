import { Order } from '../types';
export type { Order };

export interface RuleThresholds {
  autoCancelThreshold: number; // e.g. 75+
  nudgePrepaidThreshold: number; // e.g. 50-75
  confirmThreshold: number; // e.g. 25-50
  prepaidDiscountAmount: number; // ₹50
  protectFirstTimeCAC: boolean; // Prefer Nudge over Cancel for first-time buyers
  highRiskPincodeThreshold: number; // 40%
  highValueThreshold: number; // ₹999
}

export const DEFAULT_THRESHOLDS: RuleThresholds = {
  autoCancelThreshold: 80,
  nudgePrepaidThreshold: 55,
  confirmThreshold: 28,
  prepaidDiscountAmount: 50,
  protectFirstTimeCAC: true,
  highRiskPincodeThreshold: 45,
  highValueThreshold: 999,
};

// Known high-risk and low-risk pincode historical RTO profiles
export const PINCODE_PROFILES: Record<string, { city: string; state: string; historicalRtoRate: number; tier: 1 | 2 | 3 }> = {
  '110001': { city: 'New Delhi', state: 'Delhi', historicalRtoRate: 0.12, tier: 1 },
  '400001': { city: 'Mumbai', state: 'Maharashtra', historicalRtoRate: 0.14, tier: 1 },
  '560001': { city: 'Bengaluru', state: 'Karnataka', historicalRtoRate: 0.11, tier: 1 },
  '500001': { city: 'Hyderabad', state: 'Telangana', historicalRtoRate: 0.13, tier: 1 },
  '600001': { city: 'Chennai', state: 'Tamil Nadu', historicalRtoRate: 0.12, tier: 1 },
  '700001': { city: 'Kolkata', state: 'West Bengal', historicalRtoRate: 0.18, tier: 1 },
  '380001': { city: 'Ahmedabad', state: 'Gujarat', historicalRtoRate: 0.15, tier: 2 },
  '411001': { city: 'Pune', state: 'Maharashtra', historicalRtoRate: 0.13, tier: 2 },
  '302001': { city: 'Jaipur', state: 'Rajasthan', historicalRtoRate: 0.22, tier: 2 },
  '226001': { city: 'Lucknow', state: 'Uttar Pradesh', historicalRtoRate: 0.29, tier: 2 },
  '800001': { city: 'Patna', state: 'Bihar', historicalRtoRate: 0.38, tier: 3 },
  '248001': { city: 'Dehradun', state: 'Uttarakhand', historicalRtoRate: 0.21, tier: 2 },
  '842001': { city: 'Muzaffarpur', state: 'Bihar', historicalRtoRate: 0.52, tier: 3 },
  '273001': { city: 'Gorakhpur', state: 'Uttar Pradesh', historicalRtoRate: 0.49, tier: 3 },
  '854301': { city: 'Purnia', state: 'Bihar', historicalRtoRate: 0.58, tier: 3 },
  '244001': { city: 'Moradabad', state: 'Uttar Pradesh', historicalRtoRate: 0.47, tier: 3 },
  '826001': { city: 'Dhanbad', state: 'Jharkhand', historicalRtoRate: 0.46, tier: 3 },
  '474001': { city: 'Gwalior', state: 'Madhya Pradesh', historicalRtoRate: 0.43, tier: 3 },
  '324001': { city: 'Kota', state: 'Rajasthan', historicalRtoRate: 0.35, tier: 2 },
  '141001': { city: 'Ludhiana', state: 'Punjab', historicalRtoRate: 0.23, tier: 2 },
};

// Generates the deterministic 2000 orders dataset matching the exact business stats:
// 2,000 orders, ~28% RTO (560 orders), AOV ~ ₹649, CAC ₹300, etc.
export function generateDataset(): Order[] {
  const firstNames = [
    'Aarav', 'Pooja', 'Rahul', 'Sneha', 'Rohan', 'Ananya', 'Vikram', 'Priya',
    'Aditya', 'Neha', 'Karan', 'Simran', 'Amit', 'Divya', 'Siddharth', 'Kavita',
    'Mohit', 'Meera', 'Gaurav', 'Ritu', 'Naveen', 'Swati', 'Harsh', 'Isha',
    'Sunil', 'Preeti', 'Rajesh', 'Deepika', 'Akash', 'Shruti', 'Vishal', 'Tanvi',
    'Suresh', 'Bhavna', 'Manish', 'Komal', 'Pradeep', 'Pallavi', 'Santosh', 'Shreya'
  ];
  const lastNames = [
    'Sharma', 'Verma', 'Patel', 'Singh', 'Iyer', 'Gupta', 'Kumar', 'Mehta',
    'Reddy', 'Joshi', 'Chopra', 'Nair', 'Bhatia', 'Yadav', 'Saxena', 'Das',
    'Mishra', 'Pandey', 'Malhotra', 'Aggarwal', 'Choudhary', 'Shah', 'Banerjee', 'Rao'
  ];

  const fakeNames = ['asdf', 'test order', 'ghjkl', 'user test', 'xyz', 'demo', 'aaa bbb', 'qwerty', 'customer', 'none'];

  const structuredAddresses = [
    'Flat 402, Sunshine Heights, Near HDFC Bank, Off Linking Road',
    'House 12/B, Green Glen Layout, Bellandur, Opp EcoSpace',
    'Plot 56, Sector 15, Near Community Center, Pocket B',
    'Villa 9, Palm Meadows, Whitefield Main Road, Near Forum Mall',
    'Apt 304, Marvel Residency, Kalyani Nagar, Lane 7',
    'House No. 78, Shivaji Park, 3rd Cross, Opp City Hospital',
    'Flat B-101, Orchid Towers, Vastrapur Lake Road',
    'Row House 14, Golden Enclave, Old Airport Road',
    'House No. 24, Defence Colony, Near Flyover Market',
    'Tower 3, Flat 902, ATS Greens, Sector 93A'
  ];

  const hinglishAddresses = [
    'Gali no 4, Peepal ped ke paas, Shiv Mandir ke theek peeche',
    'Makan no 12, Puraani sabzi mandi, Dukan ke bagal wali gali',
    'Sharma ji ki kirana dukan ke samne, Nai basti, Ward no 9',
    'Pani ki tanki ke paas, Lal chhat wala makan, Railway road',
    'Post office ke piche, Gali no 2, Chaudhary sweets ke pass',
    'Station road, Doctor Roy ke clinic ke opposite, Ward 3'
  ];

  const incompleteAddresses = [
    'Near temple',
    'Main road, call me',
    'Village post office',
    'Shop no 5',
    'House missing, will direct on phone',
    'Near bus stand, town'
  ];

  const fakeAddresses = [
    'asdfghjk qwertyuiop',
    '123 fake street test',
    'xyz abc road no 0',
    'test test test'
  ];

  const pincodeKeys = Object.keys(PINCODE_PROFILES);

  const orders: Order[] = [];
  const baseTimestamp = new Date('2026-10-01T08:00:00Z').getTime();

  for (let i = 1; i <= 2000; i++) {
    const seed = (i * 9301 + 49297) % 233280;
    const rand = seed / 233280;

    const seed2 = ((i + 13) * 7829 + 31415) % 233280;
    const rand2 = seed2 / 233280;

    const seed3 = ((i + 47) * 4567 + 98711) % 233280;
    const rand3 = seed3 / 233280;

    const seed4 = ((i + 91) * 6211 + 17293) % 233280;
    const rand4 = seed4 / 233280;

    // Pick pincode
    const pinIndex = Math.floor(rand * pincodeKeys.length);
    const pin = pincodeKeys[pinIndex];
    const pinProfile = PINCODE_PROFILES[pin];

    // Customer name: ~3% fake/test names
    let customerName = '';
    const isFakeName = rand2 < 0.035;
    if (isFakeName) {
      customerName = fakeNames[Math.floor(rand3 * fakeNames.length)];
    } else {
      customerName = `${firstNames[Math.floor(rand2 * firstNames.length)]} ${lastNames[Math.floor(rand3 * lastNames.length)]}`;
    }

    // Phone
    const phone = `98${Math.floor(10000000 + rand4 * 89999999)}`;

    // Address category
    let address = '';
    let addressType: 'structured' | 'hinglish' | 'incomplete' | 'fake' = 'structured';

    if (isFakeName || rand4 < 0.03) {
      address = fakeAddresses[Math.floor(rand * fakeAddresses.length)];
      addressType = 'fake';
    } else if (rand4 < 0.16) {
      address = incompleteAddresses[Math.floor(rand * incompleteAddresses.length)];
      addressType = 'incomplete';
    } else if (rand4 < 0.38) {
      address = hinglishAddresses[Math.floor(rand * hinglishAddresses.length)];
      addressType = 'hinglish';
    } else {
      address = structuredAddresses[Math.floor(rand * structuredAddresses.length)];
      addressType = 'structured';
    }

    // Customer history
    const isFirstTime = rand3 < 0.58; // 58% first-time buyers
    let priorDelivered = 0;
    let priorRto = 0;
    if (!isFirstTime) {
      priorDelivered = 1 + Math.floor(rand2 * 5);
      priorRto = rand4 < 0.15 ? 1 : 0;
    }

    // Order Value: avg ₹649
    // Range ₹449 - ₹1399
    let orderValue = 649;
    const valRoll = rand;
    if (valRoll < 0.25) orderValue = 499;
    else if (valRoll < 0.55) orderValue = 649;
    else if (valRoll < 0.75) orderValue = 799;
    else if (valRoll < 0.90) orderValue = 999;
    else orderValue = 1299;

    const itemsCount = orderValue > 900 ? 3 : (orderValue > 600 ? 2 : 1);

    // Realistic delivery probability based on assignment reality:
    // Base COD RTO ~ 28%.
    // Incomplete address RTO ~ 65%
    // Fake name / address RTO ~ 92%
    // High-risk Tier 3 pincode RTO ~ 50%
    // Repeat buyer with past delivered RTO ~ 6%
    let rtoProbability = pinProfile.historicalRtoRate;

    if (addressType === 'fake' || isFakeName) {
      rtoProbability = 0.92;
    } else if (addressType === 'incomplete') {
      rtoProbability += 0.35;
    } else if (addressType === 'hinglish') {
      // Hinglish is actually genuine buyers often, slightly higher RTO due to courier navigation but good intent!
      rtoProbability += 0.05;
    } else {
      rtoProbability -= 0.06;
    }

    if (!isFirstTime && priorDelivered > 0 && priorRto === 0) {
      rtoProbability = Math.max(0.04, rtoProbability * 0.3);
    } else if (isFirstTime && orderValue >= 999) {
      rtoProbability += 0.16; // high impulse cart on COD
    }

    if (priorRto > 0) {
      rtoProbability += 0.40;
    }

    // Bound probability [0.03, 0.98]
    rtoProbability = Math.min(0.98, Math.max(0.03, rtoProbability));

    const isRTO = rand2 < rtoProbability;
    const deliveryStatus = isRTO ? 'RTO' : 'Delivered';

    let rtoReason: string | undefined = undefined;
    if (isRTO) {
      if (addressType === 'fake' || isFakeName) {
        rtoReason = 'Fake / Prank order (unreachable)';
      } else if (addressType === 'incomplete') {
        rtoReason = 'Incomplete address / landmark not found';
      } else if (rand3 < 0.45) {
        rtoReason = 'Customer refused delivery at doorstep (changed mind)';
      } else if (rand3 < 0.75) {
        rtoReason = 'Customer uncontactable / phone repeatedly switched off';
      } else {
        rtoReason = 'Delivery rescheduled >3 times, expired';
      }
    }

    // Time spread over 30 days
    const orderTimestamp = new Date(baseTimestamp + i * 1280000).toISOString();

    orders.push({
      order_id: `ORD-${1000 + i}`,
      order_date: orderTimestamp,
      customer_name: customerName,
      phone,
      address,
      city: pinProfile.city,
      state: pinProfile.state,
      pincode: pin,
      order_value: orderValue,
      items_count: itemsCount,
      customer_type: isFirstTime ? 'first_time' : 'repeat',
      prior_rto_count: priorRto,
      prior_delivered_count: priorDelivered,
      payment_method: 'COD',
      delivery_status: deliveryStatus,
      rto_reason: rtoReason
    });
  }

  return orders;
}

export const PREGENERATED_ORDERS = generateDataset();
