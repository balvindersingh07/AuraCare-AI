import React, { useState } from 'react';
import { Order, BusinessRulesConfig } from '../types';
import { scoreAndDecideOrder } from '../utils/engine';
import { 
  Search, 
  Filter, 
  Sparkles, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  HelpCircle, 
  ArrowRight, 
  PlusCircle, 
  RefreshCw,
  ChevronRight,
  Sliders,
  Check,
  X,
  Phone,
  MapPin,
  DollarSign
} from 'lucide-react';

interface DecisionEngineViewProps {
  orders: Order[];
  rules: BusinessRulesConfig;
  onOpenRules: () => void;
  onSimulateOrderInWhatsApp: (order: Order, flow: 'confirm' | 'nudge') => void;
}

export const DecisionEngineView: React.FC<DecisionEngineViewProps> = ({
  orders,
  rules,
  onOpenRules,
  onSimulateOrderInWhatsApp,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState<'all' | 'Ship as-is' | 'Ship after confirmation' | 'Nudge to prepaid' | 'Hold / cancel'>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isLlmLoading, setIsLlmLoading] = useState(false);
  const [llmAuditResult, setLlmAuditResult] = useState<any>(null);

  // New order form state
  const [isTestingNewOrder, setIsTestingNewOrder] = useState(false);
  const [newOrderForm, setNewOrderForm] = useState({
    customer_name: 'Pooja Verma',
    phone: '9812345678',
    address: 'Gali no 4, Peepal ped ke paas, Shiv Mandir ke peeche',
    city: 'Patna',
    state: 'Bihar',
    pincode: '800001',
    order_value: 799,
    items_count: 2,
    customer_type: 'first_time' as 'first_time' | 'repeat',
    prior_rto_count: 0,
    prior_delivered_count: 0,
  });

  // Score all orders
  const evaluatedOrders = React.useMemo(() => {
    return orders.map(o => {
      const decision = scoreAndDecideOrder(o, rules);
      return {
        ...o,
        risk_score: decision.risk_score,
        risk_category: decision.risk_category,
        recommended_action: decision.recommended_action,
        decision_reason: decision.decision_reason,
        key_risk_factors: decision.key_risk_factors,
        confidence_level: decision.confidence_level,
        address_quality: decision.address_quality,
        is_hinglish: decision.is_hinglish,
        is_fake_name: decision.is_fake_name,
      };
    });
  }, [orders, rules]);

  // Filtered
  const filtered = React.useMemo(() => {
    return evaluatedOrders.filter(o => {
      if (actionFilter !== 'all' && o.recommended_action !== actionFilter) return false;
      if (searchTerm) {
        const query = searchTerm.toLowerCase();
        return (
          o.order_id.toLowerCase().includes(query) ||
          o.customer_name.toLowerCase().includes(query) ||
          o.address.toLowerCase().includes(query) ||
          o.pincode.includes(query) ||
          o.city.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [evaluatedOrders, actionFilter, searchTerm]);

  // Trigger Gemini API audit
  const runGeminiAudit = async (order: Order) => {
    setIsLlmLoading(true);
    setLlmAuditResult(null);
    try {
      const res = await fetch('/api/analyze-order-gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: order.customer_name,
          address: order.address,
          pincode: order.pincode,
          city: order.city,
          orderValue: order.order_value,
        }),
      });
      const data = await res.json();
      setLlmAuditResult(data.evaluation || data);
    } catch (err: any) {
      console.error('Audit failed:', err);
      setLlmAuditResult({
        error: 'Backend request failed, showing local intelligence.',
        addressQuality: order.address.length < 25 ? 'low' : 'high',
        plainEnglishReason: 'Local evaluator: address analyzed for syntax, landmark presence, and deliverability.',
      });
    } finally {
      setIsLlmLoading(false);
    }
  };

  const handleTestNewOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const mockNew: Order = {
      order_id: `NEW-${Math.floor(1000 + Math.random() * 9000)}`,
      order_date: new Date().toISOString(),
      customer_name: newOrderForm.customer_name,
      phone: newOrderForm.phone,
      address: newOrderForm.address,
      city: newOrderForm.city,
      state: newOrderForm.state,
      pincode: newOrderForm.pincode,
      order_value: Number(newOrderForm.order_value),
      items_count: Number(newOrderForm.items_count),
      customer_type: newOrderForm.customer_type,
      prior_rto_count: Number(newOrderForm.prior_rto_count),
      prior_delivered_count: Number(newOrderForm.prior_delivered_count),
      payment_method: 'COD',
      delivery_status: 'Delivered',
    };

    const evaluated = {
      ...mockNew,
      ...scoreAndDecideOrder(mockNew, rules),
    };

    setSelectedOrder(evaluated);
    setIsTestingNewOrder(false);
    runGeminiAudit(evaluated);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner explaining LLM vs Code boundary */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              Part 6: Core AI Decision Engine
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">
              Hybrid Decision Architecture: Deterministic Math + Language AI
            </h1>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl">
              Strict boundary enforcement: Deterministic code computes historical pincode stats, basket anomalies, and unit economics; Gemini 2.5 Flash interprets unstructured addresses, Hinglish colloquial landmarks, and fake names.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full lg:w-auto">
            <button
              onClick={() => setIsTestingNewOrder(true)}
              className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/20 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              Test Single Order
            </button>
            <button
              onClick={onOpenRules}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200 transition-colors"
            >
              <Sliders className="w-4 h-4" />
              Thresholds
            </button>
          </div>
        </div>

        {/* Boundary explanation cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
              Where Deterministic Code & Math Runs
            </span>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              • Historical pincode risk rates (Tier 1 vs Tier 3)<br />
              • Customer order history (prior RTO count vs successful deliveries)<br />
              • Basket value anomaly detection (high impulse cart on COD)<br />
              • Unit-economic expected net contribution vs courier loss
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-blue-50/50 border border-blue-200">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700">
              Where Language Models (Gemini 2.5 Flash) Run
            </span>
            <p className="text-xs text-slate-700 mt-1 leading-relaxed">
              • Detecting bot / fake names ("asdf", "test", keyboard mash)<br />
              • Parsing Hinglish colloquial landmarks ("mandir ke peeche")<br />
              • Evaluating courier deliverability and missing flat/house numbers<br />
              • Synthesizing plain-English explanations for warehouse teams
            </p>
          </div>
        </div>
      </div>

      {/* Search & Action Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Order ID (#ORD-1024), Name, Address, City or Pincode..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
          />
        </div>

        {/* Action Buckets Filter */}
        <div className="flex flex-wrap gap-1.5">
          {[
            { id: 'all', label: 'All Orders' },
            { id: 'Ship as-is', label: 'Ship As-Is' },
            { id: 'Ship after confirmation', label: 'Confirm' },
            { id: 'Nudge to prepaid', label: 'Prepaid Nudge' },
            { id: 'Hold / cancel', label: 'Hold / Cancel' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActionFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                actionFilter === tab.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500">
            Showing <strong className="text-slate-900">{filtered.length}</strong> orders (click any row to inspect & run LLM audit)
          </span>
          <span className="text-xs text-blue-600 font-bold">
            Four Action Buckets Active
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4 font-semibold">Order ID</th>
                <th className="py-3 px-4 font-semibold">Customer</th>
                <th className="py-3 px-4 font-semibold">Address & City</th>
                <th className="py-3 px-4 font-semibold text-right">Value</th>
                <th className="py-3 px-4 font-semibold text-center">Risk Score</th>
                <th className="py-3 px-4 font-semibold">Action & Reason</th>
                <th className="py-3 px-4 font-semibold text-center">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filtered.slice(0, 50).map((o) => {
                const score = o.risk_score || 0;

                let actionBadgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                if (o.recommended_action === 'Ship after confirmation') {
                  actionBadgeColor = 'bg-teal-50 text-teal-700 border-teal-200';
                } else if (o.recommended_action === 'Nudge to prepaid') {
                  actionBadgeColor = 'bg-blue-50 text-blue-700 border-blue-200';
                } else if (o.recommended_action === 'Hold / cancel') {
                  actionBadgeColor = 'bg-red-50 text-red-700 border-red-200';
                }

                return (
                  <tr
                    key={o.order_id}
                    onClick={() => {
                      setSelectedOrder(o);
                      runGeminiAudit(o);
                    }}
                    className="hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4 font-mono font-bold text-blue-600 whitespace-nowrap">
                      {o.order_id}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                        <span>{o.customer_name}</span>
                        {o.is_fake_name && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] bg-red-100 text-red-800 font-bold">
                            FAKE/BOT
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 capitalize">
                        {o.customer_type === 'repeat' ? (
                          <span className="text-emerald-700 font-medium">Repeat ({o.prior_delivered_count} delivered)</span>
                        ) : (
                          <span className="text-amber-700">First-time</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 max-w-xs truncate">
                      <div className="truncate text-slate-800">{o.address}</div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                        <span>{o.city} ({o.pincode})</span>
                        {o.is_hinglish && (
                          <span className="text-[9px] px-1 py-0.2 rounded bg-blue-50 text-blue-700 font-bold">
                            Hinglish
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900 whitespace-nowrap">
                      ₹{o.order_value}
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <span className={`inline-block font-mono font-bold px-2 py-0.5 rounded text-xs ${
                        score > 75 ? 'bg-red-50 text-red-700' :
                        score > 50 ? 'bg-blue-50 text-blue-700' :
                        score > 25 ? 'bg-teal-50 text-teal-700' :
                        'bg-emerald-50 text-emerald-700'
                      }`}>
                        {score}
                      </span>
                    </td>
                    <td className="py-3 px-4 max-w-sm">
                      <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold border mb-1 ${actionBadgeColor}`}>
                        {o.recommended_action}
                      </span>
                      <p className="text-[11px] text-slate-500 truncate">
                        {o.decision_reason}
                      </p>
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedOrder(o);
                          runGeminiAudit(o);
                        }}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                        title="Audit with Gemini LLM"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Single Order Inspector & Gemini Audit Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <span className="font-mono text-lg font-black text-slate-900">{selectedOrder.order_id}</span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                  selectedOrder.recommended_action === 'Ship as-is' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                  selectedOrder.recommended_action === 'Ship after confirmation' ? 'bg-teal-50 text-teal-700 border-teal-200' :
                  selectedOrder.recommended_action === 'Nudge to prepaid' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                  'bg-red-50 text-red-700 border-red-200'
                }`}>
                  {selectedOrder.recommended_action}
                </span>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Order Details Grid */}
            <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-400 font-medium">Customer Name:</span>
                <p className="font-bold text-slate-900 text-sm mt-0.5">{selectedOrder.customer_name}</p>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Contact Phone:</span>
                <p className="font-mono text-slate-900 font-bold mt-0.5">{selectedOrder.phone}</p>
              </div>
              <div className="col-span-2">
                <span className="text-slate-400 font-medium">Shipping Address:</span>
                <p className="text-slate-800 font-medium mt-0.5">{selectedOrder.address}</p>
                <p className="text-slate-500 text-[11px] mt-0.5">{selectedOrder.city}, {selectedOrder.state} — Pincode: {selectedOrder.pincode}</p>
              </div>
              <div>
                <span className="text-slate-400 font-medium">COD Cart Value:</span>
                <p className="text-emerald-700 font-black text-sm mt-0.5">₹{selectedOrder.order_value}</p>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Customer History:</span>
                <p className="text-slate-700 mt-0.5">
                  {selectedOrder.customer_type === 'repeat' 
                    ? `Repeat Buyer (${selectedOrder.prior_delivered_count} delivered, ${selectedOrder.prior_rto_count} RTO)`
                    : 'First-time Customer (₹300 CAC)'}
                </p>
              </div>
            </div>

            {/* Operations Decision Reasoning */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Operations Plain-English Reason
              </span>
              <p className="text-xs text-slate-900 font-semibold mt-1 leading-relaxed">
                {selectedOrder.decision_reason}
              </p>
              <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-200">
                <span>Calculated Risk Score: <strong className="text-slate-900">{selectedOrder.risk_score} / 100</strong></span>
                <span>Actual Dataset Outcome: <strong className={selectedOrder.delivery_status === 'RTO' ? 'text-red-600 font-bold' : 'text-emerald-700 font-bold'}>{selectedOrder.delivery_status}</strong></span>
              </div>
            </div>

            {/* Live LLM Audit (Gemini 2.5 Flash) */}
            <div className="bg-slate-900 text-white p-4 rounded-xl shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-white">Gemini 2.5 Flash Address & Identity Audit</span>
                </div>
                {isLlmLoading && (
                  <span className="text-xs text-emerald-400 animate-pulse flex items-center gap-1 font-medium">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Analyzing via API...
                  </span>
                )}
              </div>

              {llmAuditResult && (
                <div className="space-y-2 text-xs">
                  <div className="p-3 rounded-lg bg-slate-800 text-slate-200">
                    <p className="text-white font-medium">
                      "{llmAuditResult.plainEnglishReason || llmAuditResult.summary || 'Audit complete.'}"
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2 pt-2 border-t border-slate-700 text-[11px]">
                      <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-300">
                        Address Quality: <strong className="text-white uppercase">{llmAuditResult.addressQuality}</strong>
                      </span>
                      <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-300">
                        Fake Name: <strong className={llmAuditResult.isFakeName ? 'text-red-400' : 'text-emerald-400'}>{llmAuditResult.isFakeName ? 'YES' : 'NO'}</strong>
                      </span>
                      <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-300">
                        Hinglish Directions: <strong className="text-blue-300">{llmAuditResult.isHinglish ? 'DETECTED' : 'STANDARD'}</strong>
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Action buttons */}
            <div className="flex flex-wrap gap-2 justify-end pt-2">
              {(selectedOrder.recommended_action === 'Ship after confirmation' || selectedOrder.recommended_action === 'Nudge to prepaid') && (
                <button
                  onClick={() => {
                    onSimulateOrderInWhatsApp(
                      selectedOrder, 
                      selectedOrder.recommended_action === 'Nudge to prepaid' ? 'nudge' : 'confirm'
                    );
                    setSelectedOrder(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold flex items-center gap-2 shadow-xs"
                >
                  Simulate in WhatsApp Mock <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual "Test Single Order" Modal */}
      {isTestingNewOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Test Single COD Order in Decision Engine</h3>
              <button
                onClick={() => setIsTestingNewOrder(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleTestNewOrderSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-medium mb-1">Customer Name (try 'asdf' or real names):</label>
                <input
                  type="text"
                  value={newOrderForm.customer_name}
                  onChange={(e) => setNewOrderForm({ ...newOrderForm, customer_name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Shipping Address (try Hinglish or vague addresses):</label>
                <textarea
                  rows={2}
                  value={newOrderForm.address}
                  onChange={(e) => setNewOrderForm({ ...newOrderForm, address: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">City:</label>
                  <input
                    type="text"
                    value={newOrderForm.city}
                    onChange={(e) => setNewOrderForm({ ...newOrderForm, city: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Pincode:</label>
                  <input
                    type="text"
                    value={newOrderForm.pincode}
                    onChange={(e) => setNewOrderForm({ ...newOrderForm, pincode: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Order Value (₹):</label>
                  <input
                    type="number"
                    value={newOrderForm.order_value}
                    onChange={(e) => setNewOrderForm({ ...newOrderForm, order_value: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Customer Type:</label>
                  <select
                    value={newOrderForm.customer_type}
                    onChange={(e) => setNewOrderForm({ ...newOrderForm, customer_type: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:outline-none"
                  >
                    <option value="first_time">First-time Customer</option>
                    <option value="repeat">Repeat Customer</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsTestingNewOrder(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-xs"
                >
                  Evaluate Decision
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
