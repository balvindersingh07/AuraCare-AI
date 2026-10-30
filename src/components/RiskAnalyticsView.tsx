import React, { useMemo } from 'react';
import { Order } from '../types';
import { 
  BarChart3, 
  TrendingUp, 
  AlertTriangle, 
  ShieldCheck, 
  Users, 
  MapPin, 
  ShoppingBag,
  Sparkles,
  PieChart
} from 'lucide-react';
import { extractAnalyticalFindings } from '../utils/engine';

interface RiskAnalyticsViewProps {
  orders: Order[];
}

export const RiskAnalyticsView: React.FC<RiskAnalyticsViewProps> = ({ orders }) => {
  // Extract findings
  const findings = useMemo(() => extractAnalyticalFindings(orders), [orders]);

  // Cohort 1: First-time vs Repeat
  const cohortMetrics = useMemo(() => {
    const firstTime = orders.filter(o => o.customer_type === 'first_time');
    const repeat = orders.filter(o => o.customer_type === 'repeat');

    const ftDelivered = firstTime.filter(o => o.delivery_status === 'Delivered').length;
    const ftRto = firstTime.filter(o => o.delivery_status === 'RTO').length;
    const ftRtoRate = firstTime.length > 0 ? (ftRto / firstTime.length) * 100 : 0;

    const repDelivered = repeat.filter(o => o.delivery_status === 'Delivered').length;
    const repRto = repeat.filter(o => o.delivery_status === 'RTO').length;
    const repRtoRate = repeat.length > 0 ? (repRto / repeat.length) * 100 : 0;

    return {
      firstTime: { total: firstTime.length, delivered: ftDelivered, rto: ftRto, rtoRate: ftRtoRate },
      repeat: { total: repeat.length, delivered: repDelivered, rto: repRto, rtoRate: repRtoRate },
    };
  }, [orders]);

  // Cohort 2: Order Value Tiers
  const valueTierMetrics = useMemo(() => {
    const tiers = [
      { label: '< ₹500', min: 0, max: 499, total: 0, rto: 0 },
      { label: '₹500 – ₹749 (Standard)', min: 500, max: 749, total: 0, rto: 0 },
      { label: '₹750 – ₹999 (Elevated)', min: 750, max: 999, total: 0, rto: 0 },
      { label: '≥ ₹1,000 (High Impulse)', min: 1000, max: 999999, total: 0, rto: 0 },
    ];

    orders.forEach(o => {
      const match = tiers.find(t => o.order_value >= t.min && o.order_value <= t.max);
      if (match) {
        match.total++;
        if (o.delivery_status === 'RTO') match.rto++;
      }
    });

    return tiers.map(t => ({
      ...t,
      rtoRate: t.total > 0 ? (t.rto / t.total) * 100 : 0,
    }));
  }, [orders]);

  // Cohort 3: Risk Score Distribution (0-25, 26-50, 51-75, 76-100)
  const scoreBuckets = useMemo(() => {
    const b = [
      { label: '0–25 (Low Risk)', count: 0, rto: 0, color: 'bg-emerald-500' },
      { label: '26–50 (Medium Risk)', count: 0, rto: 0, color: 'bg-teal-500' },
      { label: '51–75 (Elevated Risk)', count: 0, rto: 0, color: 'bg-blue-600' },
      { label: '76–100 (Critical Risk)', count: 0, rto: 0, color: 'bg-red-500' },
    ];

    orders.forEach(o => {
      const s = o.risk_score || 0;
      let idx = 0;
      if (s > 75) idx = 3;
      else if (s > 50) idx = 2;
      else if (s > 25) idx = 1;

      b[idx].count++;
      if (o.delivery_status === 'RTO') b[idx].rto++;
    });

    return b.map(bucket => ({
      ...bucket,
      actualRtoRate: bucket.count > 0 ? (bucket.rto / bucket.count) * 100 : 0,
    }));
  }, [orders]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold mb-2">
          <BarChart3 className="w-3.5 h-3.5 text-blue-600" />
          Part 12: Empirical Risk Analytics
        </div>
        <h1 className="text-2xl font-black text-slate-900">COD Return Drivers & Cohort Intelligence</h1>
        <p className="text-xs text-slate-500 mt-0.5 max-w-2xl">
          Statistical correlation analysis across customer cohorts, cart values, address fidelity, and geographical risk.
        </p>
      </div>

      {/* 3 Real Findings from Data */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold text-blue-600">
            <span>Finding 1</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm mt-1">{findings.finding1.label}</h3>
          <div className="text-2xl font-black text-slate-900 mt-2">{findings.finding1.stat}</div>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">{findings.finding1.detail}</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold text-blue-600">
            <span>Finding 2</span>
            <MapPin className="w-4 h-4 text-red-500" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm mt-1">{findings.finding2.label}</h3>
          <div className="text-2xl font-black text-slate-900 mt-2">{findings.finding2.stat}</div>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">{findings.finding2.detail}</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold text-blue-600">
            <span>Finding 3</span>
            <Users className="w-4 h-4 text-emerald-500" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm mt-1">{findings.finding3.label}</h3>
          <div className="text-2xl font-black text-slate-900 mt-2">{findings.finding3.stat}</div>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">{findings.finding3.detail}</p>
        </div>
      </div>

      {/* Analytics Visual Breakdown Rows */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cohort 1: First-Time vs Repeat */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-sm flex items-center justify-between">
            <span>Customer Trust Cohort: Repeat vs. First-Time</span>
            <span className="text-xs font-normal text-slate-400">{orders.length} Total Orders</span>
          </h3>

          <div className="space-y-4 text-xs">
            {/* Repeat Customer Bar */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-800">Repeat Loyal Customers</span>
                <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {cohortMetrics.repeat.rtoRate.toFixed(1)}% RTO Rate
                </span>
              </div>
              <p className="text-slate-500 text-[11px]">
                {cohortMetrics.repeat.delivered} Delivered • {cohortMetrics.repeat.rto} RTOs ({cohortMetrics.repeat.total} orders)
              </p>
              <div className="h-2.5 w-full bg-slate-200 rounded-full overflow-hidden flex">
                <div 
                  style={{ width: `${100 - cohortMetrics.repeat.rtoRate}%` }} 
                  className="bg-emerald-500 h-full"
                  title="Delivered"
                />
                <div 
                  style={{ width: `${cohortMetrics.repeat.rtoRate}%` }} 
                  className="bg-red-400 h-full"
                  title="RTO"
                />
              </div>
            </div>

            {/* First-Time Customer Bar */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-800">First-Time Customers (Meta CAC: ₹300)</span>
                <span className="font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  {cohortMetrics.firstTime.rtoRate.toFixed(1)}% RTO Rate
                </span>
              </div>
              <p className="text-slate-500 text-[11px]">
                {cohortMetrics.firstTime.delivered} Delivered • {cohortMetrics.firstTime.rto} RTOs ({cohortMetrics.firstTime.total} orders)
              </p>
              <div className="h-2.5 w-full bg-slate-200 rounded-full overflow-hidden flex">
                <div 
                  style={{ width: `${100 - cohortMetrics.firstTime.rtoRate}%` }} 
                  className="bg-emerald-500 h-full"
                  title="Delivered"
                />
                <div 
                  style={{ width: `${cohortMetrics.firstTime.rtoRate}%` }} 
                  className="bg-red-500 h-full"
                  title="RTO"
                />
              </div>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 pt-2 border-t border-slate-100">
            <strong>Key Insight:</strong> Repeat buyers have a 5x lower return rate. Never penalize a repeat customer based on high cart value or Tier-3 location.
          </p>
        </div>

        {/* Cohort 2: Order Value Tiers */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-sm">Cart Value Tier vs. Doorstep Refusal Rate</h3>
          
          <div className="space-y-3 text-xs">
            {valueTierMetrics.map((tier) => (
              <div key={tier.label} className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-slate-800">{tier.label}</span>
                  <span className={`font-mono font-bold px-2 py-0.5 rounded ${
                    tier.rtoRate > 35 ? 'bg-red-50 text-red-700' :
                    tier.rtoRate > 25 ? 'bg-amber-50 text-amber-700' :
                    'bg-emerald-50 text-emerald-700'
                  }`}>
                    {tier.rtoRate.toFixed(1)}% RTO
                  </span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>{tier.total} orders in dataset</span>
                  <span>{tier.rto} returned at door</span>
                </div>
                <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div 
                    style={{ width: `${tier.rtoRate}%` }} 
                    className={`h-full ${tier.rtoRate > 35 ? 'bg-red-500' : 'bg-amber-500'}`}
                  />
                </div>
              </div>
            ))}
          </div>

          <p className="text-[11px] text-slate-500 pt-2 border-t border-slate-100">
            <strong>Observation:</strong> High COD baskets (&gt;₹1,000) show disproportionate impulse remorse. They are ideal candidates for the ₹50 prepaid nudge.
          </p>
        </div>
      </div>

      {/* Risk Score vs Actual Outcome Calibration */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <h3 className="font-bold text-slate-900 text-sm mb-1">
          Decision Engine Predictive Calibration (Risk Score vs. Actual Returns)
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Validating that orders scored higher by the algorithm actually experienced higher return rates in the historical data:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {scoreBuckets.map((b) => (
            <div key={b.label} className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <span className="font-bold text-slate-800">{b.label}</span>
              <div className="text-2xl font-black text-slate-900 mt-2">
                {b.count} <span className="text-xs font-normal text-slate-400">orders</span>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-200 flex justify-between items-center">
                <span className="text-slate-500">Actual Realized RTO:</span>
                <span className={`font-mono font-bold px-2 py-0.5 rounded ${
                  b.actualRtoRate > 40 ? 'bg-red-100 text-red-800' :
                  b.actualRtoRate > 20 ? 'bg-blue-100 text-blue-800' :
                  'bg-emerald-100 text-emerald-800'
                }`}>
                  {b.actualRtoRate.toFixed(1)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
