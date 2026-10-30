import React, { useState } from 'react';
import { BASE_UNIT_ECONOMICS } from '../types';
import { 
  Calculator, 
  DollarSign, 
  TrendingUp, 
  Percent, 
  HelpCircle, 
  CheckCircle2, 
  ArrowRight,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

export const PrepaidCalculatorView: React.FC = () => {
  const [aov, setAov] = useState(649);
  const [grossMarginPct, setGrossMarginPct] = useState(62);
  const [discountRupees, setDiscountRupees] = useState(50);
  const [expectedAcceptanceRate, setExpectedAcceptanceRate] = useState(24); // 24% of nudged customers convert
  const [highRiskRtoRate, setHighRiskRtoRate] = useState(50); // Baseline RTO of the target segment (50%)
  const monthlyCodOrders = 1650;

  // Constants
  const rtoDirectCost = BASE_UNIT_ECONOMICS.totalRtoLoss; // ₹169.40
  const prepaidRtoRate = BASE_UNIT_ECONOMICS.prepaidRtoRate; // 4%

  // Single order mathematics
  const baseGrossProfit = (aov * grossMarginPct) / 100; // ₹402.38

  // Outcome A: Kept as Risky COD
  // Expected Value = (DeliverRate * Margin) - (RtoRate * RtoCost)
  const codDeliverRate = (100 - highRiskRtoRate) / 100;
  const codRtoProb = highRiskRtoRate / 100;
  const expectedProfitAsCod = (codDeliverRate * baseGrossProfit) - (codRtoProb * rtoDirectCost);

  // Outcome B: Converted to Prepaid with Discount
  // Delivered margin = baseGrossProfit - discountRupees
  const deliveredPrepaidProfit = Math.max(0, baseGrossProfit - discountRupees);
  const prepaidDeliverRate = 1 - prepaidRtoRate; // 96%
  const expectedProfitAsPrepaid = (prepaidDeliverRate * deliveredPrepaidProfit) - (prepaidRtoRate * rtoDirectCost);

  // Net gain per order converted
  const netGainPerConvertedOrder = expectedProfitAsPrepaid - expectedProfitAsCod;

  // Comparison tiers: 0%, 2%, 3%, 5%, 7%, and Current (₹50 ~ 7.7%)
  const tiers = [
    { label: '0% (No Discount)', discount: 0, conversion: 6 },
    { label: '2% Discount', discount: Math.round(aov * 0.02), conversion: 12 },
    { label: '3% Discount', discount: Math.round(aov * 0.03), conversion: 16 },
    { label: '5% Discount', discount: Math.round(aov * 0.05), conversion: 20 },
    { label: '7% Discount', discount: Math.round(aov * 0.07), conversion: 24 },
    { label: '₹50 Flat (Optimal 7.7%)', discount: 50, conversion: 26 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold mb-2">
            <Calculator className="w-3.5 h-3.5 text-blue-600" />
            Part 9: Prepaid Discount Optimization
          </div>
          <h1 className="text-2xl font-black text-slate-900">Prepaid Incentive Unit Economic Engine</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Scientifically evaluate discount levels to maximize net rupee contribution while collapsing return risk from 28% to 4%.
          </p>
        </div>

        <div className="text-right">
          <span className="text-[11px] text-slate-400 font-semibold uppercase">Net Gain per Conversion</span>
          <div className="text-2xl font-black text-emerald-600">
            +{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(netGainPerConvertedOrder)}
          </div>
        </div>
      </div>

      {/* Interactive Controls & Live Outcome Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sliders Card (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
          <h2 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center justify-between">
            <span>Adjustment Parameters</span>
            <span className="text-xs font-normal text-slate-500">Live Calibration</span>
          </h2>

          {/* Slider 1: Prepaid Discount Amount */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-700">Offered Prepaid Discount:</span>
              <span className="font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                ₹{discountRupees} ({((discountRupees / aov) * 100).toFixed(1)}%)
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={discountRupees}
              onChange={(e) => setDiscountRupees(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>₹0</span>
              <span>₹25</span>
              <span>₹50 (Sweet Spot)</span>
              <span>₹100</span>
            </div>
          </div>

          {/* Slider 2: Assumed Customer Conversion Rate */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-700">Estimated WhatsApp Conversion:</span>
              <span className="font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                {expectedAcceptanceRate}% of customers
              </span>
            </div>
            <input
              type="range"
              min="5"
              max="45"
              step="1"
              value={expectedAcceptanceRate}
              onChange={(e) => setExpectedAcceptanceRate(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>5% (Conservative)</span>
              <span>24% (Observed)</span>
              <span>45% (Aggressive)</span>
            </div>
          </div>

          {/* Slider 3: Target Segment RTO Risk */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-700">Target Segment Baseline RTO:</span>
              <span className="font-mono font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                {highRiskRtoRate}% risk
              </span>
            </div>
            <input
              type="range"
              min="20"
              max="70"
              step="2"
              value={highRiskRtoRate}
              onChange={(e) => setHighRiskRtoRate(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>20% (Low)</span>
              <span>28% (Overall Avg)</span>
              <span>48% (Tier-3 Pockets)</span>
            </div>
          </div>

          {/* Order Value Reference */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
            <div className="flex justify-between text-slate-600">
              <span>Average Order Value (AOV):</span>
              <span className="font-bold text-slate-900">₹{aov}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Gross Margin Rate (Delivered):</span>
              <span className="font-bold text-slate-900">{grossMarginPct}% (₹{baseGrossProfit.toFixed(2)})</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Direct RTO Cost per Return:</span>
              <span className="font-bold text-red-600">₹{rtoDirectCost.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Financial Comparison Cards (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Kept as Risky COD */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
              <span className="text-xs font-bold uppercase text-slate-400">Scenario A</span>
              <h3 className="font-bold text-slate-900 text-base mt-1">Shipped as COD ({highRiskRtoRate}% RTO)</h3>
              <div className="text-2xl font-black text-amber-600 mt-2">
                ₹{expectedProfitAsCod.toFixed(2)}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Expected profit per order</p>

              <div className="mt-4 pt-3 border-t border-slate-100 text-xs space-y-1 text-slate-500">
                <div className="flex justify-between">
                  <span>Delivered Probability:</span>
                  <span className="font-semibold text-slate-800">{100 - highRiskRtoRate}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Expected Gross Profit:</span>
                  <span className="text-slate-800">₹{(codDeliverRate * baseGrossProfit).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-red-600">
                  <span>Expected Courier RTO Loss:</span>
                  <span>-₹{(codRtoProb * rtoDirectCost).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Converted to Prepaid */}
            <div className="bg-emerald-50/50 border-2 border-emerald-300 rounded-2xl p-5 shadow-xs">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold uppercase text-emerald-700">Scenario B (Target)</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  +₹{netGainPerConvertedOrder.toFixed(0)} Gain
                </span>
              </div>
              <h3 className="font-bold text-emerald-950 text-base mt-1">Converted to Prepaid (₹{discountRupees} Off)</h3>
              <div className="text-2xl font-black text-emerald-700 mt-2">
                ₹{expectedProfitAsPrepaid.toFixed(2)}
              </div>
              <p className="text-[11px] text-emerald-700/80 mt-1">Expected profit per order</p>

              <div className="mt-4 pt-3 border-t border-emerald-200/60 text-xs space-y-1 text-emerald-900/80">
                <div className="flex justify-between">
                  <span>Delivered Probability:</span>
                  <span className="font-semibold text-emerald-950">96.0% (Prepaid)</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivered Margin after Disc:</span>
                  <span className="text-emerald-950">₹{deliveredPrepaidProfit.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-red-600 font-medium">
                  <span>Courier RTO Loss (4%):</span>
                  <span>-₹{(prepaidRtoRate * rtoDirectCost).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Monthly Portfolio Impact Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
            <h3 className="font-bold text-slate-900 text-sm mb-2">
              Monthly Brand Impact (at 1,650 COD Orders/Month)
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Assuming ~350 orders fall into the high-risk / nudge bucket monthly and {expectedAcceptanceRate}% accept the ₹{discountRupees} discount:
            </p>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400">Orders Converted</span>
                <div className="text-lg font-black text-slate-900 mt-0.5">
                  {Math.round(350 * (expectedAcceptanceRate / 100))} orders
                </div>
              </div>
              <div className="p-3 bg-red-50 rounded-xl border border-red-100">
                <span className="text-[10px] uppercase font-bold text-red-600">Discounts Paid</span>
                <div className="text-lg font-black text-red-700 mt-0.5">
                  -₹{(Math.round(350 * (expectedAcceptanceRate / 100)) * discountRupees).toLocaleString()}
                </div>
              </div>
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                <span className="text-[10px] uppercase font-bold text-emerald-600">Net Profit Lift</span>
                <div className="text-lg font-black text-emerald-700 mt-0.5">
                  +₹{Math.round(Math.round(350 * (expectedAcceptanceRate / 100)) * netGainPerConvertedOrder).toLocaleString()}/mo
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Comparison Matrix Across All Requested Tiers */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <h3 className="font-bold text-slate-900 text-sm mb-1">
          Discount Incentive Matrix (Prompt Required Tiers)
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Comparing conversion pull, expected RTO losses, and net contribution across standard e-commerce discount benchmarks:
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 font-semibold">Discount Tier</th>
                <th className="py-3 px-4 font-semibold text-right">Discount (₹)</th>
                <th className="py-3 px-4 font-semibold text-center">Est. Conversion</th>
                <th className="py-3 px-4 font-semibold text-right">Delivered Margin</th>
                <th className="py-3 px-4 font-semibold text-right">Expected Profit / Order</th>
                <th className="py-3 px-4 font-semibold text-right">Net Rupee Lift</th>
                <th className="py-3 px-4 font-semibold">Strategic Recommendation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {tiers.map((t) => {
                const marginAfterDisc = baseGrossProfit - t.discount;
                const expVal = (0.96 * marginAfterDisc) - (0.04 * rtoDirectCost);
                const lift = expVal - expectedProfitAsCod;
                const isOptimal = t.discount === 50;

                return (
                  <tr key={t.label} className={isOptimal ? 'bg-blue-50/50 font-medium' : 'hover:bg-slate-50'}>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {t.label}
                      {isOptimal && (
                        <span className="ml-2 px-1.5 py-0.2 rounded text-[10px] bg-blue-600 text-white font-bold">
                          Recommended
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-semibold">₹{t.discount}</td>
                    <td className="py-3 px-4 text-center">{t.conversion}%</td>
                    <td className="py-3 px-4 text-right">₹{marginAfterDisc.toFixed(2)}</td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900">₹{expVal.toFixed(2)}</td>
                    <td className="py-3 px-4 text-right font-bold text-emerald-600">
                      +{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(lift)}
                    </td>
                    <td className="py-3 px-4 text-slate-500 text-[11px]">
                      {t.discount === 0 && 'Low conversion; customer has no incentive to open UPI app.'}
                      {t.discount === 13 && '₹13 is below psychological threshold for online payment in India.'}
                      {t.discount === 19 && 'Marginal uptake; unexciting offer for a ₹649 basket.'}
                      {t.discount === 32 && 'Good uptake, but ₹32 looks awkward. Round figures convert better.'}
                      {t.discount === 45 && 'Strong conversion, but ₹50 has superior marketing appeal.'}
                      {t.discount === 50 && 'Optimal balance: perceived high value, preserves 54% net margin.'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
