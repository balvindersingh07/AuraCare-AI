import React, { useState, useMemo } from 'react';
import { Order, BusinessRulesConfig, BASE_UNIT_ECONOMICS } from '../types';
import { computeBatchMetrics } from '../utils/engine';
import { 
  TrendingUp, 
  ShieldCheck, 
  AlertTriangle, 
  Package, 
  CheckCircle, 
  XCircle, 
  Calendar, 
  Download, 
  ArrowUpRight, 
  ArrowDownRight,
  Sparkles,
  DollarSign,
  HelpCircle,
  Clock,
  Filter
} from 'lucide-react';
import { ordersToCsv } from '../utils/csvHelper';

// Helper to compute inclusive calendar day start (00:00:00.000) and end (23:59:59.999)
function parseDayBounds(dateInput: string | Date): { start: number; end: number } {
  if (typeof dateInput === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
    const [y, m, d] = dateInput.split('-').map(Number);
    const start = new Date(y, m - 1, d, 0, 0, 0, 0).getTime();
    const end = new Date(y, m - 1, d, 23, 59, 59, 999).getTime();
    return { start, end };
  }
  const dt = new Date(dateInput);
  const start = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate(), 0, 0, 0, 0).getTime();
  const end = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate(), 23, 59, 59, 999).getTime();
  return { start, end };
}

function formatDateToInput(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

interface DashboardViewProps {
  orders: Order[];
  rules: BusinessRulesConfig;
  onOpenRules: () => void;
  onSelectOrder: (order: Order) => void;
  onNavigateTab: (tab: any) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  orders,
  rules,
  onOpenRules,
  onSelectOrder,
  onNavigateTab,
}) => {
  const [timeframe, setTimeframe] = useState<'yesterday' | '7days' | '30days' | 'custom'>('yesterday');

  // Custom date range state with inclusive start and end dates
  const initialDates = useMemo(() => {
    const now = new Date();
    const past14 = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    return {
      start: formatDateToInput(past14),
      end: formatDateToInput(now),
    };
  }, []);

  const [customStartDate, setCustomStartDate] = useState(initialDates.start);
  const [customEndDate, setCustomEndDate] = useState(initialDates.end);

  // Filter orders by actual order.order_date timestamps (no array slicing)
  const filteredOrders = useMemo(() => {
    if (!orders || orders.length === 0) return [];

    // Parse valid timestamps safely
    const validTimestamps = orders
      .map(o => (o && o.order_date ? new Date(o.order_date).getTime() : NaN))
      .filter(t => !isNaN(t));

    if (validTimestamps.length === 0) return [];

    // Determine calendar anchor (today)
    const now = new Date();
    const maxTime = Math.max(...validTimestamps);
    const diffDays = Math.abs(now.getTime() - maxTime) / (24 * 60 * 60 * 1000);
    const anchor = (diffDays <= 45 || maxTime > now.getTime()) ? now : new Date(maxTime);

    const startOfToday = new Date(anchor.getFullYear(), anchor.getMonth(), anchor.getDate(), 0, 0, 0, 0).getTime();
    const endOfToday = startOfToday + 24 * 60 * 60 * 1000 - 1;

    if (timeframe === 'yesterday') {
      const startOfYesterday = startOfToday - 24 * 60 * 60 * 1000;
      const endOfYesterday = startOfToday - 1;
      return orders.filter(o => {
        const t = o && o.order_date ? new Date(o.order_date).getTime() : NaN;
        return !isNaN(t) && t >= startOfYesterday && t <= endOfYesterday;
      });
    } else if (timeframe === '7days') {
      const startOf7Days = startOfToday - 7 * 24 * 60 * 60 * 1000;
      return orders.filter(o => {
        const t = o && o.order_date ? new Date(o.order_date).getTime() : NaN;
        return !isNaN(t) && t >= startOf7Days && t <= endOfToday;
      });
    } else if (timeframe === '30days') {
      const startOf30Days = startOfToday - 30 * 24 * 60 * 60 * 1000;
      return orders.filter(o => {
        const t = o && o.order_date ? new Date(o.order_date).getTime() : NaN;
        return !isNaN(t) && t >= startOf30Days && t <= endOfToday;
      });
    } else if (timeframe === 'custom') {
      if (!customStartDate && !customEndDate) return orders;
      const start = customStartDate ? parseDayBounds(customStartDate).start : 0;
      const end = customEndDate ? parseDayBounds(customEndDate).end : Number.MAX_SAFE_INTEGER;
      const minTime = Math.min(start, end);
      const maxTimeInclusive = Math.max(start, end);
      return orders.filter(o => {
        const t = o && o.order_date ? new Date(o.order_date).getTime() : NaN;
        return !isNaN(t) && t >= minTime && t <= maxTimeInclusive;
      });
    }
    return orders;
  }, [orders, timeframe, customStartDate, customEndDate]);

  // Compute dynamic metrics from actual orders
  const { orders: scoredOrders, summary } = useMemo(() => {
    return computeBatchMetrics(filteredOrders, rules);
  }, [filteredOrders, rules]);

  const currencyFormatter = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleExportCsv = () => {
    const csv = ordersToCsv(scoredOrders);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `auracare_orders_${timeframe}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Top risky pincodes in filtered set
  const topRiskyPincodes = useMemo(() => {
    const pinMap = new Map<string, { total: number; rto: number; city: string }>();
    scoredOrders.forEach(o => {
      const entry = pinMap.get(o.pincode) || { total: 0, rto: 0, city: o.city };
      entry.total++;
      if (o.delivery_status === 'RTO') entry.rto++;
      pinMap.set(o.pincode, entry);
    });
    return Array.from(pinMap.entries())
      .map(([pincode, d]) => ({
        pincode,
        city: d.city,
        total: d.total,
        rtoRate: d.total > 0 ? (d.rto / d.total) * 100 : 0,
        rtoCount: d.rto,
      }))
      .filter(p => p.total >= 3)
      .sort((a, b) => b.rtoRate - a.rtoRate)
      .slice(0, 5);
  }, [scoredOrders]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              AuraCare AI – Founder Overview
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1">Executive COD & RTO Dashboard</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time balance between courier loss prevention (₹169.40/order) and customer acquisition preservation (₹300 CAC).
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => setTimeframe('yesterday')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                timeframe === 'yesterday' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Yesterday
            </button>
            <button
              onClick={() => setTimeframe('7days')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                timeframe === '7days' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Last 7 Days
            </button>
            <button
              onClick={() => setTimeframe('30days')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                timeframe === '30days' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Last 30 Days
            </button>
            <button
              onClick={() => setTimeframe('custom')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                timeframe === 'custom' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Custom Range
            </button>
          </div>

          {timeframe === 'custom' && (
            <div className="flex items-center gap-2 text-xs text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-xs">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 font-medium">From:</span>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="px-2 py-0.5 border border-slate-300 rounded-lg text-slate-900 font-semibold text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 font-medium">To:</span>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="px-2 py-0.5 border border-slate-300 rounded-lg text-slate-900 font-semibold text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* 8 Primary KPI Cards (Assignment Mandate) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Net Financial Impact */}
        <div className="bg-gradient-to-br from-emerald-50 via-white to-white border-2 border-emerald-400/40 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold text-emerald-800">
            <span>8. Net Financial Impact</span>
            <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-700 mt-2">
            +{currencyFormatter(summary.netFinancialImpact)}
          </div>
          <p className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-1">
            <ArrowUpRight className="w-3 h-3" /> Net bottom-line profit contribution
          </p>
          <div className="mt-3 pt-2 border-t border-emerald-100 text-[10px] text-slate-500">
            (Saved RTOs + Prepaid Margins) − (False Cancels + Discounts)
          </div>
        </div>

        {/* KPI 2: Estimated RTO Savings */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>6. Estimated RTO Savings</span>
            <div className="p-1.5 rounded-lg bg-teal-50 text-teal-600">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            {currencyFormatter(summary.avoidedRtoSavings)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            From <strong className="text-teal-700 font-bold">{summary.avoidedRtoCount}</strong> intercepted RTOs
          </p>
          <div className="mt-3 pt-2 border-t border-slate-100 text-[10px] text-slate-400">
            Calculated at ₹169.40 direct logistics cost per RTO
          </div>
        </div>

        {/* KPI 3: False Cancellation Loss */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>7. False Cancellation Loss</span>
            <div className="p-1.5 rounded-lg bg-red-50 text-red-600">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-red-600 mt-2">
            -{currencyFormatter(summary.falseCancelLoss)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            From <strong className="text-red-700 font-bold">{summary.falseCancelCount}</strong> wrongly held orders
          </p>
          <div className="mt-3 pt-2 border-t border-slate-100 text-[10px] text-slate-400">
            Includes lost 62% margin (₹402) + ₹300 wasted CAC
          </div>
        </div>

        {/* KPI 4: Total COD Orders */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>1. Total COD Analysed</span>
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            {summary.totalOrders}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            RTO Rate: <strong className="text-amber-600">{(summary.baselineRtoRate * 100).toFixed(1)}%</strong> ➔ <strong className="text-emerald-600">{(summary.newEffectiveRtoRate * 100).toFixed(1)}%</strong>
          </p>
          <div className="mt-3 pt-2 border-t border-slate-100 text-[10px] text-slate-400">
            AOV: ₹649.00 • Gross Margin: 62%
          </div>
        </div>
      </div>

      {/* 4 Action Buckets Grid (KPIs 2, 3, 4, 5) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">Four-Bucket Decision Distribution</h2>
            <p className="text-xs text-slate-500">How incoming COD orders are triaged based on risk score and unit economics</p>
          </div>
          <button
            onClick={onOpenRules}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700"
          >
            Configure Thresholds →
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          {/* Bucket 1: Ship as-is */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-emerald-300 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-slate-500">2. Ship as-is</span>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                {summary.totalOrders > 0 ? ((summary.buckets.shipAsIs / summary.totalOrders) * 100).toFixed(1) : 0}%
              </span>
            </div>
            <div className="text-2xl font-black text-slate-900 mt-2">
              {summary.buckets.shipAsIs} <span className="text-xs font-normal text-slate-500">orders</span>
            </div>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Low-risk (score ≤ {rules.lowRiskMax}). Verified repeat buyers, metro pincodes, pristine addresses. Auto-cleared.
            </p>
          </div>

          {/* Bucket 2: Ship after confirmation */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-teal-300 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-slate-500">3. Confirmation Req.</span>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-teal-50 text-teal-700 border border-teal-200">
                {summary.totalOrders > 0 ? ((summary.buckets.confirm / summary.totalOrders) * 100).toFixed(1) : 0}%
              </span>
            </div>
            <div className="text-2xl font-black text-slate-900 mt-2">
              {summary.buckets.confirm} <span className="text-xs font-normal text-slate-500">orders</span>
            </div>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Medium-risk (score {rules.lowRiskMax + 1}–{rules.mediumRiskMax}). Minor missing landmark or Hinglish. Sent 1-click WhatsApp message.
            </p>
          </div>

          {/* Bucket 3: Nudge to prepaid */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-blue-300 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-slate-500">4. Prepaid Nudge</span>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                {summary.totalOrders > 0 ? ((summary.buckets.nudge / summary.totalOrders) * 100).toFixed(1) : 0}%
              </span>
            </div>
            <div className="text-2xl font-black text-slate-900 mt-2">
              {summary.buckets.nudge} <span className="text-xs font-normal text-slate-500">orders</span>
            </div>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Elevated-risk (score {rules.mediumRiskMax + 1}–{rules.elevatedRiskMax}). Tier-3 or high cart. Offered ₹{rules.prepaidDiscountAmount} discount to pay online upfront.
            </p>
          </div>

          {/* Bucket 4: Hold / cancel */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-red-300 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-slate-500">5. Hold / Cancel</span>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200">
                {summary.totalOrders > 0 ? ((summary.buckets.cancel / summary.totalOrders) * 100).toFixed(1) : 0}%
              </span>
            </div>
            <div className="text-2xl font-black text-slate-900 mt-2">
              {summary.buckets.cancel} <span className="text-xs font-normal text-slate-500">orders</span>
            </div>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Critical-risk (score ≥ {rules.criticalRiskMin}). Clear bots ('asdf'), fake addresses, serial offenders. Halted to stop bleeding.
            </p>
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div className="mt-6">
          <div className="flex justify-between text-xs text-slate-500 mb-1.5 font-medium">
            <span>Overall Order Volume Allocation</span>
            <span>100% of Orders</span>
          </div>
          <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
            <div
              style={{ width: `${(summary.buckets.shipAsIs / Math.max(1, summary.totalOrders)) * 100}%` }}
              className="bg-emerald-500 h-full transition-all"
              title="Ship As-Is"
            />
            <div
              style={{ width: `${(summary.buckets.confirm / Math.max(1, summary.totalOrders)) * 100}%` }}
              className="bg-teal-500 h-full transition-all"
              title="Ship After Confirmation"
            />
            <div
              style={{ width: `${(summary.buckets.nudge / Math.max(1, summary.totalOrders)) * 100}%` }}
              className="bg-blue-600 h-full transition-all"
              title="Nudge to Prepaid"
            />
            <div
              style={{ width: `${(summary.buckets.cancel / Math.max(1, summary.totalOrders)) * 100}%` }}
              className="bg-red-500 h-full transition-all"
              title="Hold / Cancel"
            />
          </div>
        </div>
      </div>

      {/* Analytics Rows: Risky Pincodes & Unit Economics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card: Top Risky Pincodes */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">Top High-Risk Pincode Clusters</h3>
              <button
                onClick={() => onNavigateTab('pincodes')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700"
              >
                View Intelligence →
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-2 mb-3">
              Locations with highest return frequency in the selected date range.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px]">
                    <th className="pb-2 font-semibold">Pincode</th>
                    <th className="pb-2 font-semibold">City</th>
                    <th className="pb-2 font-semibold text-center">Orders</th>
                    <th className="pb-2 font-semibold text-right">RTO Rate</th>
                    <th className="pb-2 font-semibold text-right">Rule</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {topRiskyPincodes.map((pin) => (
                    <tr key={pin.pincode} className="hover:bg-slate-50">
                      <td className="py-2.5 font-mono font-bold text-slate-800">{pin.pincode}</td>
                      <td className="py-2.5 text-slate-600">{pin.city}</td>
                      <td className="py-2.5 text-center font-semibold text-slate-800">{pin.total}</td>
                      <td className="py-2.5 text-right font-bold text-red-600">{pin.rtoRate.toFixed(1)}%</td>
                      <td className="py-2.5 text-right">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700">
                          Prepaid Nudge
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
            <strong>Policy:</strong> Pincodes are never blacklisted blindly; repeat customers in these zones are always approved.
          </div>
        </div>

        {/* Card: Financial Proof Breakdown */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">Unit Economic Verification</h3>
              <span className="text-xs font-bold text-emerald-600">Per-Order Math</span>
            </div>
            <div className="mt-3 space-y-2 text-xs text-slate-600">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span>Gross Margin (62% on ₹649 AOV)</span>
                <span className="font-bold text-slate-900">+₹402.38</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span>Forward Shipping + Return Shipping (₹65 + ₹65)</span>
                <span className="text-slate-800">₹130.00</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span>Packaging & Handling Fee</span>
                <span className="text-slate-800">₹25.00</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span>Damaged Goods Loss (8% × ₹180)</span>
                <span className="text-slate-800">₹14.40</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-200 bg-red-50/60 px-2 rounded font-bold text-red-700">
                <span>Direct Loss per Returned Package</span>
                <span>₹169.40</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span>Customer Acquisition Cost (Meta CAC)</span>
                <span className="font-semibold text-slate-800">₹300.00+</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl">
            <strong className="text-slate-900">Operations vs. Marketing Resolution:</strong> Auto-cancelling risky orders burns ₹300 CAC + ₹402 profit = ₹702 loss. Nudging with ₹50 discount converts 24% to prepaid (4% RTO), securing ₹352 net profit!
          </div>
        </div>
      </div>

      {/* Recent Decisions Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Recent Decisions on Incoming Orders</h3>
            <p className="text-xs text-slate-500">Live operational feed from the Decision Engine</p>
          </div>
          <button
            onClick={() => onNavigateTab('orders')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700"
          >
            Explore All Orders →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 font-semibold">Order ID</th>
                <th className="py-3 px-4 font-semibold">Customer</th>
                <th className="py-3 px-4 font-semibold">Address & City</th>
                <th className="py-3 px-4 font-semibold text-right">Value</th>
                <th className="py-3 px-4 font-semibold text-center">Score</th>
                <th className="py-3 px-4 font-semibold">Action & Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {scoredOrders.slice(0, 8).map((o) => {
                let badgeStyle = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                if (o.recommended_action === 'Ship after confirmation') badgeStyle = 'bg-teal-50 text-teal-700 border-teal-200';
                else if (o.recommended_action === 'Nudge to prepaid') badgeStyle = 'bg-blue-50 text-blue-700 border-blue-200';
                else if (o.recommended_action === 'Hold / cancel') badgeStyle = 'bg-red-50 text-red-700 border-red-200';

                return (
                  <tr
                    key={o.order_id}
                    onClick={() => onSelectOrder(o)}
                    className="hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4 font-mono font-bold text-blue-600">{o.order_id}</td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{o.customer_name}</div>
                      <div className="text-[11px] text-slate-400 capitalize">{o.customer_type} customer</div>
                    </td>
                    <td className="py-3 px-4 max-w-xs truncate">
                      <div className="truncate text-slate-800">{o.address}</div>
                      <div className="text-[11px] text-slate-400">{o.city} ({o.pincode})</div>
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900">₹{o.order_value}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-block font-mono font-bold px-2 py-0.5 rounded text-xs ${
                        (o.risk_score || 0) > 75 ? 'bg-red-50 text-red-700' :
                        (o.risk_score || 0) > 50 ? 'bg-blue-50 text-blue-700' :
                        (o.risk_score || 0) > 25 ? 'bg-teal-50 text-teal-700' :
                        'bg-emerald-50 text-emerald-700'
                      }`}>
                        {o.risk_score}
                      </span>
                    </td>
                    <td className="py-3 px-4 max-w-sm">
                      <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold border mb-1 ${badgeStyle}`}>
                        {o.recommended_action}
                      </span>
                      <p className="text-[11px] text-slate-500 truncate">{o.decision_reason}</p>
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
