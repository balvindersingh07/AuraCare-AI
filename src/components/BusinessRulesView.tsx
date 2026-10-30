import React, { useState, useMemo } from 'react';
import { BusinessRulesConfig, DEFAULT_BUSINESS_RULES, Order } from '../types';
import { computeBatchMetrics } from '../utils/engine';
import { 
  Sliders, 
  RotateCcw, 
  Save, 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp, 
  Sparkles,
  Info
} from 'lucide-react';

interface BusinessRulesViewProps {
  rules: BusinessRulesConfig;
  onSaveRules: (newRules: BusinessRulesConfig) => void;
  orders: Order[];
}

export const BusinessRulesView: React.FC<BusinessRulesViewProps> = ({
  rules,
  onSaveRules,
  orders,
}) => {
  const [draftRules, setDraftRules] = useState<BusinessRulesConfig>({ ...rules });
  const [savedToast, setSavedToast] = useState(false);

  const handleUpdate = (key: keyof BusinessRulesConfig, val: any) => {
    setDraftRules(prev => {
      const next = { ...prev, [key]: val };
      if (key === 'lowRiskMax' && val >= next.mediumRiskMax) {
        next.mediumRiskMax = Math.min(80, val + 5);
      }
      if (key === 'mediumRiskMax') {
        if (val <= next.lowRiskMax) next.lowRiskMax = Math.max(5, val - 5);
        if (val >= next.elevatedRiskMax) next.elevatedRiskMax = Math.min(90, val + 5);
      }
      if (key === 'elevatedRiskMax') {
        if (val <= next.mediumRiskMax) next.mediumRiskMax = Math.max(15, val - 5);
        next.criticalRiskMin = val + 1;
      }
      return next;
    });
  };

  // Preview impact on orders in real-time
  const previewMetrics = useMemo(() => {
    return computeBatchMetrics(orders, draftRules);
  }, [orders, draftRules]);

  const handleSave = () => {
    onSaveRules(draftRules);
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2500);
  };

  const handleReset = () => {
    setDraftRules({ ...DEFAULT_BUSINESS_RULES });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold mb-2">
            <Sliders className="w-3.5 h-3.5 text-blue-600" />
            Part 10: Non-Technical Business Rules Manager
          </div>
          <h1 className="text-2xl font-black text-slate-900">Configurable Decision Thresholds & Weights</h1>
          <p className="text-xs text-slate-500 mt-0.5 max-w-2xl">
            Empower operations and marketing leaders to adjust risk scoring thresholds, timeout windows, and discount amounts in real time without touching code.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/20 transition-all"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{savedToast ? 'Rules Applied!' : 'Save & Apply Rules'}</span>
          </button>
        </div>
      </div>

      {/* Grid: Controls on Left, Real-Time Impact Simulation on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sliders Form (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
          <h2 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center justify-between">
            <span>Core Action Thresholds (0–100 Scale)</span>
            <span className="text-xs font-normal text-slate-400">Continuous Recalibration</span>
          </h2>

          <div className="space-y-5 text-xs">
            {/* Slider 1: Low Risk (Ship As-Is) */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex justify-between items-center">
                <div>
                  <span className="font-bold text-slate-900">1. Ship as-is Cutoff (Low Risk Max)</span>
                  <p className="text-[11px] text-slate-500">Orders with score ≤ this are auto-cleared for immediate packing.</p>
                </div>
                <span className="font-mono text-sm font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                  ≤ {draftRules.lowRiskMax}
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="40"
                step="1"
                value={draftRules.lowRiskMax}
                onChange={(e) => handleUpdate('lowRiskMax', Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>10 (Strict)</span>
                <span>28 (Default)</span>
                <span>40 (Relaxed)</span>
              </div>
            </div>

            {/* Slider 2: Medium Risk (WhatsApp Confirmation) */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex justify-between items-center">
                <div>
                  <span className="font-bold text-slate-900">2. WhatsApp 1-Click Confirmation Range</span>
                  <p className="text-[11px] text-slate-500">Orders between low-risk cutoff and this receive WhatsApp verification.</p>
                </div>
                <span className="font-mono text-sm font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200">
                  {draftRules.lowRiskMax + 1} – {draftRules.mediumRiskMax}
                </span>
              </div>
              <input
                type="range"
                min="40"
                max="65"
                step="1"
                value={draftRules.mediumRiskMax}
                onChange={(e) => handleUpdate('mediumRiskMax', Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>40</span>
                <span>54 (Default)</span>
                <span>65</span>
              </div>
            </div>

            {/* Slider 3: Elevated Risk (Nudge to Prepaid) */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex justify-between items-center">
                <div>
                  <span className="font-bold text-slate-900">3. Prepaid Conversion Nudge Range</span>
                  <p className="text-[11px] text-slate-500">Orders above medium-risk receive ₹{draftRules.prepaidDiscountAmount} off to pay online upfront.</p>
                </div>
                <span className="font-mono text-sm font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                  {draftRules.mediumRiskMax + 1} – {draftRules.elevatedRiskMax}
                </span>
              </div>
              <input
                type="range"
                min="65"
                max="85"
                step="1"
                value={draftRules.elevatedRiskMax}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  handleUpdate('elevatedRiskMax', val);
                  handleUpdate('criticalRiskMin', val + 1);
                }}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>65</span>
                <span>78 (Default)</span>
                <span>85</span>
              </div>
            </div>

            {/* Slider 4: Critical Risk (Hold / Cancel) */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex justify-between items-center">
                <div>
                  <span className="font-bold text-slate-900">4. Auto Hold / Cancellation Threshold</span>
                  <p className="text-[11px] text-slate-500">Orders with score ≥ this are held immediately to prevent shipping burn.</p>
                </div>
                <span className="font-mono text-sm font-bold text-red-700 bg-red-50 px-2.5 py-1 rounded-lg border border-red-200">
                  ≥ {draftRules.criticalRiskMin}
                </span>
              </div>
            </div>

            {/* Additional Parameters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <label className="block text-slate-700 font-bold mb-1">Prepaid Discount (₹):</label>
                <input
                  type="number"
                  min="20"
                  max="100"
                  value={draftRules.prepaidDiscountAmount}
                  onChange={(e) => handleUpdate('prepaidDiscountAmount', Number(e.target.value))}
                  className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-900 font-bold"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <label className="block text-slate-700 font-bold mb-1">Confirmation Timeout (Hours):</label>
                <input
                  type="number"
                  min="12"
                  max="48"
                  value={draftRules.confirmationTimeoutHours}
                  onChange={(e) => handleUpdate('confirmationTimeoutHours', Number(e.target.value))}
                  className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-900 font-bold"
                />
              </div>
            </div>

            {/* Toggle: Protect First-Time CAC */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-slate-900">Protect First-Time CAC (Head of Marketing Guardrail)</span>
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                    Active
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Never auto-cancel genuine first-time customers. Nudge them to prepaid instead to protect the ₹300 acquisition ad spend.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleUpdate('protectFirstTimeCAC', !draftRules.protectFirstTimeCAC)}
                className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                  draftRules.protectFirstTimeCAC ? 'bg-blue-600 justify-end' : 'bg-slate-300 justify-start'
                }`}
              >
                <div className="bg-white w-4 h-4 rounded-full shadow-md" />
              </button>
            </div>
          </div>
        </div>

        {/* Live Preview Panel (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white border-2 border-blue-400/50 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-sm">Real-Time Impact Simulation</h3>
              </div>
              <span className="text-[10px] uppercase font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                Live Preview
              </span>
            </div>

            <p className="text-xs text-slate-500">
              Projected impact on all <strong>{orders.length}</strong> loaded orders with current slider settings:
            </p>

            {/* 4 Bucket Counts Preview */}
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between items-center p-2.5 rounded-lg bg-emerald-50 border border-emerald-200">
                <span className="font-semibold text-emerald-900">1. Ship as-is</span>
                <span className="font-mono font-bold text-emerald-700 text-sm">
                  {previewMetrics.summary.buckets.shipAsIs} ({((previewMetrics.summary.buckets.shipAsIs / Math.max(1, orders.length)) * 100).toFixed(1)}%)
                </span>
              </div>
              <div className="flex justify-between items-center p-2.5 rounded-lg bg-teal-50 border border-teal-200">
                <span className="font-semibold text-teal-900">2. Ship after confirmation</span>
                <span className="font-mono font-bold text-teal-700 text-sm">
                  {previewMetrics.summary.buckets.confirm} ({((previewMetrics.summary.buckets.confirm / Math.max(1, orders.length)) * 100).toFixed(1)}%)
                </span>
              </div>
              <div className="flex justify-between items-center p-2.5 rounded-lg bg-blue-50 border border-blue-200">
                <span className="font-semibold text-blue-900">3. Nudge to prepaid</span>
                <span className="font-mono font-bold text-blue-700 text-sm">
                  {previewMetrics.summary.buckets.nudge} ({((previewMetrics.summary.buckets.nudge / Math.max(1, orders.length)) * 100).toFixed(1)}%)
                </span>
              </div>
              <div className="flex justify-between items-center p-2.5 rounded-lg bg-red-50 border border-red-200">
                <span className="font-semibold text-red-900">4. Hold / cancel</span>
                <span className="font-mono font-bold text-red-700 text-sm">
                  {previewMetrics.summary.buckets.cancel} ({((previewMetrics.summary.buckets.cancel / Math.max(1, orders.length)) * 100).toFixed(1)}%)
                </span>
              </div>
            </div>

            {/* Net Financial Impact Card */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex justify-between text-xs text-slate-500 font-medium">
                <span>Simulated Net Financial Lift:</span>
                <span className="text-emerald-700 font-bold">Positive</span>
              </div>
              <div className="text-2xl font-black text-emerald-700">
                +{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(previewMetrics.summary.netFinancialImpact)}
              </div>
              <div className="text-[11px] text-slate-500 flex justify-between pt-2 border-t border-slate-200">
                <span>Avoided RTO Savings:</span>
                <span className="font-bold text-slate-800">+{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(previewMetrics.summary.avoidedRtoSavings)}</span>
              </div>
              <div className="text-[11px] text-slate-500 flex justify-between">
                <span>False Cancellation Loss:</span>
                <span className="font-bold text-red-600">-{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(previewMetrics.summary.falseCancelLoss)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
