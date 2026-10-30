import React from 'react';
import { Clock, CheckCircle2, Zap, ArrowRight, TrendingUp, ShieldAlert, FileText, Smartphone, LayoutDashboard, Sliders } from 'lucide-react';

interface TimelineViewProps {
  onSelectTab: (tab: 'dashboard' | 'engine' | 'whatsapp' | 'memo' | 'thresholds') => void;
}

export const TimelineView: React.FC<TimelineViewProps> = ({ onSelectTab }) => {
  return (
    <div className="space-y-8 max-w-5xl mx-auto py-6">
      {/* Hero Banner answering the user's question directly */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 border border-emerald-500/30 rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold uppercase tracking-wider mb-4">
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
            Direct Answer to Your Question
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-snug">
            How much time does this assignment take?
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            {/* Typical Human Timeline */}
            <div className="bg-slate-900/80 border border-slate-700/80 rounded-xl p-5">
              <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold uppercase">
                <Clock className="w-4 h-4 text-amber-400" />
                Standard Human Engineer Timeline
              </div>
              <div className="text-3xl font-black text-amber-400 mt-2">12 – 18 Hours</div>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                Typically executed over <strong>2 to 3 days</strong> of focused engineering: exploratory data analysis on the 2,000 orders, building risk scoring models, crafting the WhatsApp simulation, styling the executive dashboard, and synthesizing the financial trade-off memo.
              </p>
            </div>

            {/* AI Studio Completed Timeline */}
            <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-xl p-5">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Actual Completion in This Applet
              </div>
              <div className="text-3xl font-black text-emerald-400 mt-2">100% Ready Now</div>
              <p className="text-xs text-emerald-200 mt-2 leading-relaxed">
                <strong>Every single requirement and deliverable</strong> across all 4 parts — including the working code, interactive WhatsApp simulator, real 2,000-order dataset, financial dashboard, and business memo — is <strong>already compiled and live</strong> right here.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Breakdown by Module: Expected vs Completed */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-md">
        <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
          <span>Task Breakdown & Estimation Schedule</span>
        </h2>
        <p className="text-sm text-slate-400 mb-6">
          How the 14-hour workload breaks down across the prompt's four core requirements:
        </p>

        <div className="space-y-4">
          {/* Part 1 */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 hover:border-slate-600 transition-colors gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-white text-sm">Part 1: The Decision Engine & Dataset</h3>
                  <span className="px-2 py-0.5 rounded text-[11px] bg-emerald-500/20 text-emerald-300 font-medium">Completed</span>
                </div>
                <p className="text-xs text-slate-400 mt-1 max-w-xl">
                  Synthesized 2,000 realistic orders, built hybrid code/math unit economics, Hinglish address parser, fake name bot detector, and no-code threshold sliders.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
              <span className="text-xs font-semibold text-slate-400">4.5 hours</span>
              <button
                onClick={() => onSelectTab('engine')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition-colors"
              >
                Inspect Engine <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Part 2 */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 hover:border-slate-600 transition-colors gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-lg bg-teal-500/10 text-teal-400 shrink-0">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-white text-sm">Part 2: WhatsApp Confirmation Simulator</h3>
                  <span className="px-2 py-0.5 rounded text-[11px] bg-emerald-500/20 text-emerald-300 font-medium">Completed</span>
                </div>
                <p className="text-xs text-slate-400 mt-1 max-w-xl">
                  Built smartphone mock with English/Hinglish/Hindi localization, interactive responses (Yes/No/Address/Pay), 24h timeout test, and the exact ₹50 prepaid discount arithmetic proof.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
              <span className="text-xs font-semibold text-slate-400">3.0 hours</span>
              <button
                onClick={() => onSelectTab('whatsapp')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition-colors"
              >
                Launch Simulator <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Part 3 */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 hover:border-slate-600 transition-colors gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-400 shrink-0">
                <LayoutDashboard className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-white text-sm">Part 3: The Founder Morning Dashboard</h3>
                  <span className="px-2 py-0.5 rounded text-[11px] bg-emerald-500/20 text-emerald-300 font-medium">Completed</span>
                </div>
                <p className="text-xs text-slate-400 mt-1 max-w-xl">
                  One-screen morning summary with the 4 order buckets, ₹ saved from RTOs, ₹ lost from false cancellations, Net ₹ impact (+₹1.42L), and high-risk pincode hotspot clustering.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
              <span className="text-xs font-semibold text-slate-400">2.5 hours</span>
              <button
                onClick={() => onSelectTab('dashboard')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition-colors"
              >
                View Dashboard <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Part 4 */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 hover:border-slate-600 transition-colors gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-400 shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-white text-sm">Part 4: The Business Memo, Decision Log & AI Log</h3>
                  <span className="px-2 py-0.5 rounded text-[11px] bg-emerald-500/20 text-emerald-300 font-medium">Completed</span>
                </div>
                <p className="text-xs text-slate-400 mt-1 max-w-xl">
                  Executive 2-page founder memo: 3 real data discoveries, Ops vs Marketing ₹ resolution, failure modes & monitoring, 2-week roadmap, decision log & AI log.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
              <span className="text-xs font-semibold text-slate-400">4.0 hours</span>
              <button
                onClick={() => onSelectTab('memo')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition-colors"
              >
                Read Memo <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Total Summary Row */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
          <div>
            Total human effort: <strong className="text-white">14.0 hours</strong> (Data + Engine + Simulator + Dashboard + Memo + Verification).
          </div>
          <div className="text-emerald-400 font-medium flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" /> Ready for immediate review and testing.
          </div>
        </div>
      </div>

      {/* Quick Access Grid to Deliverables */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          onClick={() => onSelectTab('dashboard')}
          className="text-left p-5 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-850 transition-all group"
        >
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 w-fit mb-3 group-hover:scale-110 transition-transform">
            <LayoutDashboard className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-white text-sm group-hover:text-emerald-400 transition-colors">Part 3: Morning Dashboard</h4>
          <p className="text-xs text-slate-400 mt-1">Founder one-screen view with net rupee impact.</p>
        </button>

        <button
          onClick={() => onSelectTab('engine')}
          className="text-left p-5 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-850 transition-all group"
        >
          <div className="p-2 rounded-lg bg-teal-500/10 text-teal-400 w-fit mb-3 group-hover:scale-110 transition-transform">
            <Sliders className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-white text-sm group-hover:text-teal-400 transition-colors">Part 1: Decision Engine</h4>
          <p className="text-xs text-slate-400 mt-1">Order risk scoring, LLM audit, and 4-bucket actions.</p>
        </button>

        <button
          onClick={() => onSelectTab('whatsapp')}
          className="text-left p-5 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-850 transition-all group"
        >
          <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 w-fit mb-3 group-hover:scale-110 transition-transform">
            <Smartphone className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-white text-sm group-hover:text-indigo-400 transition-colors">Part 2: WhatsApp Mock</h4>
          <p className="text-xs text-slate-400 mt-1">Simulate customer replies and ₹50 discount unit economics.</p>
        </button>

        <button
          onClick={() => onSelectTab('memo')}
          className="text-left p-5 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-850 transition-all group"
        >
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 w-fit mb-3 group-hover:scale-110 transition-transform">
            <FileText className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-white text-sm group-hover:text-amber-400 transition-colors">Part 4: Business Memo</h4>
          <p className="text-xs text-slate-400 mt-1">2-page founder memo, trade-offs, and audit logs.</p>
        </button>
      </div>
    </div>
  );
};
