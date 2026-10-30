import React from 'react';
import { RuleThresholds, DEFAULT_THRESHOLDS } from '../data/mockOrdersData';
import { Sliders, RotateCcw, ShieldCheck, DollarSign, AlertCircle, Info, Sparkles } from 'lucide-react';

interface ThresholdSettingsModalProps {
  thresholds: RuleThresholds;
  onChangeThresholds: (newThresholds: RuleThresholds) => void;
  onClose?: () => void;
  isModal?: boolean;
}

export const ThresholdSettingsModal: React.FC<ThresholdSettingsModalProps> = ({
  thresholds,
  onChangeThresholds,
  onClose,
  isModal = false,
}) => {
  const handleChange = (key: keyof RuleThresholds, value: any) => {
    onChangeThresholds({
      ...thresholds,
      [key]: value,
    });
  };

  const content = (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-bold text-white">Non-Technical Threshold Control Panel</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Adjust operational sensitivity without writing any code. Changes simulate immediately across all orders.
          </p>
        </div>
        <button
          onClick={() => onChangeThresholds(DEFAULT_THRESHOLDS)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Defaults</span>
        </button>
      </div>

      {/* Sliders Grid */}
      <div className="space-y-6 text-xs text-slate-300">
        {/* Slider 1: Auto Cancel Threshold */}
        <div className="p-4 rounded-xl bg-slate-850 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-bold text-white text-sm">Critical Risk: Auto-Cancel / Hold Threshold</span>
              <p className="text-[11px] text-slate-400">
                Orders with risk score ≥ this value are held or cancelled immediately (Head of Ops focus).
              </p>
            </div>
            <span className="font-mono text-base font-black text-rose-400 px-3 py-1 rounded-lg bg-rose-500/10 border border-rose-500/30">
              {thresholds.autoCancelThreshold} / 100
            </span>
          </div>
          <input
            type="range"
            min="60"
            max="95"
            step="1"
            value={thresholds.autoCancelThreshold}
            onChange={(e) => handleChange('autoCancelThreshold', Number(e.target.value))}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-rose-500"
          />
          <div className="flex justify-between text-[10px] text-slate-500">
            <span>Aggressive (60: Cancels more orders)</span>
            <span>Conservative (95: Only obvious bots)</span>
          </div>
        </div>

        {/* Slider 2: Nudge to Prepaid Threshold */}
        <div className="p-4 rounded-xl bg-slate-850 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-bold text-white text-sm">Elevated Risk: Nudge to Prepaid Threshold</span>
              <p className="text-[11px] text-slate-400">
                Orders with risk score between this and auto-cancel receive ₹50 discount WhatsApp nudge.
              </p>
            </div>
            <span className="font-mono text-base font-black text-indigo-400 px-3 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/30">
              {thresholds.nudgePrepaidThreshold} / 100
            </span>
          </div>
          <input
            type="range"
            min="40"
            max="75"
            step="1"
            value={thresholds.nudgePrepaidThreshold}
            onChange={(e) => handleChange('nudgePrepaidThreshold', Number(e.target.value))}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
          />
          <div className="flex justify-between text-[10px] text-slate-500">
            <span>Broader Nudge (40)</span>
            <span>Narrow Nudge (75)</span>
          </div>
        </div>

        {/* Slider 3: WhatsApp Confirm Threshold */}
        <div className="p-4 rounded-xl bg-slate-850 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-bold text-white text-sm">Moderate Risk: 1-Click WhatsApp Confirm Threshold</span>
              <p className="text-[11px] text-slate-400">
                Orders with score between this and nudge threshold get a quick address confirmation message.
              </p>
            </div>
            <span className="font-mono text-base font-black text-teal-400 px-3 py-1 rounded-lg bg-teal-500/10 border border-teal-500/30">
              {thresholds.confirmThreshold} / 100
            </span>
          </div>
          <input
            type="range"
            min="15"
            max="45"
            step="1"
            value={thresholds.confirmThreshold}
            onChange={(e) => handleChange('confirmThreshold', Number(e.target.value))}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-teal-500"
          />
          <div className="flex justify-between text-[10px] text-slate-500">
            <span>Verify Most Orders (15)</span>
            <span>Only Moderate-High (45)</span>
          </div>
        </div>

        {/* Slider 4: Prepaid Discount Amount */}
        <div className="p-4 rounded-xl bg-slate-850 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-bold text-white text-sm">Prepaid Conversion Discount Incentive</span>
              <p className="text-[11px] text-slate-400">
                Discount offered to customer to pay online upfront via UPI/Card.
              </p>
            </div>
            <span className="font-mono text-base font-black text-emerald-400 px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
              ₹{thresholds.prepaidDiscountAmount}
            </span>
          </div>
          <input
            type="range"
            min="30"
            max="100"
            step="5"
            value={thresholds.prepaidDiscountAmount}
            onChange={(e) => handleChange('prepaidDiscountAmount', Number(e.target.value))}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />
          <div className="flex justify-between text-[10px] text-slate-500">
            <span>₹30 (Lower conversion)</span>
            <span>₹50 (Optimal balance)</span>
            <span>₹100 (Eats profit)</span>
          </div>
        </div>

        {/* Toggle: Protect First-Time CAC */}
        <div className="p-4 rounded-xl bg-slate-850 border border-slate-800 flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-sm">Protect First-Time CAC (Head of Marketing Guardrail)</span>
              <span className="px-1.5 py-0.2 rounded text-[10px] bg-amber-500/20 text-amber-300 font-semibold">
                Recommended
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Never auto-cancel genuine first-time customers. Nudge them to prepaid or confirm instead to protect our ₹300 acquisition spend.
            </p>
          </div>
          <button
            onClick={() => handleChange('protectFirstTimeCAC', !thresholds.protectFirstTimeCAC)}
            className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
              thresholds.protectFirstTimeCAC ? 'bg-emerald-600 justify-end' : 'bg-slate-700 justify-start'
            }`}
          >
            <div className="bg-white w-4 h-4 rounded-full shadow-md transform transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
        <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
          {content}
          <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow"
            >
              Apply & Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-4 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md">
      {content}
    </div>
  );
};
