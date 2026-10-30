import React, { useState, useMemo } from 'react';
import { PINCODE_PROFILES } from '../data/mockOrdersData';
import { Order } from '../types';
import { 
  MapPin, 
  Search, 
  Filter, 
  ShieldAlert, 
  ShieldCheck, 
  AlertCircle, 
  Info,
  CheckCircle2,
  TrendingDown
} from 'lucide-react';

interface PincodeIntelligenceViewProps {
  orders: Order[];
}

export const PincodeIntelligenceView: React.FC<PincodeIntelligenceViewProps> = ({ orders }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [tierFilter, setTierFilter] = useState<'all' | '1' | '2' | '3'>('all');
  const [riskFilter, setRiskFilter] = useState<'all' | 'high' | 'moderate' | 'low'>('all');

  // Calculate actual observed stats per pincode from loaded orders
  const pincodeTableData = useMemo(() => {
    const statsMap = new Map<string, { total: number; delivered: number; rto: number }>();
    orders.forEach((o) => {
      const s = statsMap.get(o.pincode) || { total: 0, delivered: 0, rto: 0 };
      s.total++;
      if (o.delivery_status === 'RTO') s.rto++;
      else s.delivered++;
      statsMap.set(o.pincode, s);
    });

    return Object.entries(PINCODE_PROFILES).map(([pin, meta]) => {
      const observed = statsMap.get(pin) || { total: 0, delivered: 0, rto: 0 };
      const observedRtoRate = observed.total > 0 ? (observed.rto / observed.total) * 100 : meta.historicalRtoRate * 100;

      let riskCategory: 'Critical' | 'High Risk' | 'Monitor' | 'Low Risk' = 'Low Risk';
      let recommendedRule = 'Ship as-is';

      if (meta.historicalRtoRate >= 0.45) {
        riskCategory = 'Critical';
        recommendedRule = 'Nudge to prepaid (₹50 Off) / Confirm';
      } else if (meta.historicalRtoRate >= 0.30) {
        riskCategory = 'High Risk';
        recommendedRule = 'WhatsApp 1-Click Confirmation';
      } else if (meta.historicalRtoRate >= 0.20) {
        riskCategory = 'Monitor';
        recommendedRule = 'Ship as-is (Confirm if high basket)';
      }

      return {
        pincode: pin,
        city: meta.city,
        state: meta.state,
        tier: meta.tier,
        historicalRtoRate: meta.historicalRtoRate * 100,
        observedTotal: observed.total,
        observedRtoRate,
        riskCategory,
        recommendedRule,
      };
    });
  }, [orders]);

  // Filter
  const filtered = useMemo(() => {
    return pincodeTableData.filter((p) => {
      if (tierFilter !== 'all' && String(p.tier) !== tierFilter) return false;
      if (riskFilter === 'high' && (p.riskCategory !== 'Critical' && p.riskCategory !== 'High Risk')) return false;
      if (riskFilter === 'moderate' && p.riskCategory !== 'Monitor') return false;
      if (riskFilter === 'low' && p.riskCategory !== 'Low Risk') return false;

      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        return (
          p.pincode.includes(q) ||
          p.city.toLowerCase().includes(q) ||
          p.state.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [pincodeTableData, tierFilter, riskFilter, searchTerm]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold mb-2">
          <MapPin className="w-3.5 h-3.5 text-blue-600" />
          Part 6: Geographical Intelligence
        </div>
        <h1 className="text-2xl font-black text-slate-900">Pincode Risk Profiles & Tiers</h1>
        <p className="text-xs text-slate-500 mt-0.5 max-w-2xl">
          Historical return rates across Tier 1 (Metros), Tier 2, and Tier 3 zones. Designed to prevent premature blacklisting while mitigating courier losses.
        </p>
      </div>

      {/* Safeguard Banner: Do Not Automatically Blacklist */}
      <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="text-xs text-blue-900 leading-relaxed">
          <strong>Non-Technical Policy: Anti-Blacklist Safeguard</strong><br />
          The Head of Operations initially proposed: <em>"If a pincode has bad history, just stop COD there."</em><br />
          Our engine strictly prevents blanket bans because <strong>14% of orders in Tier-3 high-risk zones are verified repeat customers</strong> who deliver reliably. Instead of alienating genuine buyers and wasting ₹300 Meta CAC, we apply <strong>targeted WhatsApp Prepaid Nudges</strong> to confirm purchase commitment.
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full md:w-auto">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by pincode (e.g. 842001), city, or state..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <select
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value as any)}
            className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 font-medium"
          >
            <option value="all">All Tiers</option>
            <option value="1">Tier 1 (Metros)</option>
            <option value="2">Tier 2</option>
            <option value="3">Tier 3</option>
          </select>

          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value as any)}
            className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 font-medium"
          >
            <option value="all">All Risk Levels</option>
            <option value="high">High & Critical Risk</option>
            <option value="moderate">Moderate Monitor</option>
            <option value="low">Low Risk</option>
          </select>
        </div>
      </div>

      {/* Pincode Intelligence Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 font-semibold">Pincode</th>
                <th className="py-3 px-4 font-semibold">City & State</th>
                <th className="py-3 px-4 font-semibold text-center">Tier</th>
                <th className="py-3 px-4 font-semibold text-right">Historical Baseline RTO</th>
                <th className="py-3 px-4 font-semibold text-center">Sample Size (Orders)</th>
                <th className="py-3 px-4 font-semibold text-center">Risk Classification</th>
                <th className="py-3 px-4 font-semibold">Automated Rule Assignment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filtered.map((pin) => (
                <tr key={pin.pincode} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-blue-600">{pin.pincode}</td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-900">{pin.city}</div>
                    <div className="text-[11px] text-slate-400">{pin.state}</div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                      Tier {pin.tier}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold">
                    <span className={
                      pin.historicalRtoRate >= 45 ? 'text-red-600' :
                      pin.historicalRtoRate >= 25 ? 'text-amber-600' :
                      'text-emerald-600'
                    }>
                      {pin.historicalRtoRate.toFixed(1)}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center font-semibold text-slate-800">
                    {pin.observedTotal}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      pin.riskCategory === 'Critical' ? 'bg-red-50 text-red-700 border border-red-200' :
                      pin.riskCategory === 'High Risk' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                      pin.riskCategory === 'Monitor' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                      'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}>
                      {pin.riskCategory}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-medium text-slate-800">{pin.recommendedRule}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
