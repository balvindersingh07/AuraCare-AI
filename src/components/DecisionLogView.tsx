import React, { useState } from 'react';
import { DecisionLogItem } from '../types';
import { BookOpen, Plus, Check, Edit3, Trash2, Calendar, User, ArrowRight, ShieldCheck, X } from 'lucide-react';

const INITIAL_DECISION_LOGS: DecisionLogItem[] = [
  {
    id: 'DEC-01',
    title: 'Architectural Boundary: Deterministic Code vs. Large Language Model',
    problem: 'Where should we draw the line between deterministic code and LLMs for COD order risk decisioning?',
    alternatives_considered: [
      'Alternative A: Feed full JSON order to LLM prompt and let it decide action and risk score.',
      'Alternative B: Purely regex and lookup tables with no AI.',
      'Alternative C: Hybrid architecture (Code for math/lookup, LLM for unstructured text).',
    ],
    selected_approach: 'Alternative C: Hybrid Architecture.',
    reason: 'LLMs are slow (1.5s latency), expensive at 3,000 orders/month, and struggle with strict arithmetic. Deterministic code evaluates historical pincode percentiles, cart ratios, and customer histories in <1ms for zero cost. Gemini 2.5 Flash is reserved exclusively for messy Hinglish addresses, fake name parsing, and operations reasoning.',
    expected_impact: 'Zero hallucinated financial figures, <10ms evaluation latency for 90% of orders, and ₹0 API cost on low-risk repeat buyers.',
    created_at: '2026-10-29',
    author: 'Associate Software Engineer',
  },
  {
    id: 'DEC-02',
    title: 'Resolution of Operations vs. Marketing Dispute via ₹50 Prepaid Nudge',
    problem: 'Operations wanted to auto-cancel all risky pincodes immediately. Marketing insisted on shipping everything to protect ₹300 CAC.',
    alternatives_considered: [
      'Alternative A: Blanket cancel risky pincodes (Ops approach).',
      'Alternative B: Ship everything blindly without verification (Marketing approach).',
      'Alternative C: Automated Prepaid Conversion Nudge with a ₹50 discount.',
    ],
    selected_approach: 'Alternative C: Prepaid Conversion Nudge with ₹50 discount.',
    reason: 'Cancelling a customer burns ₹300 CAC + ₹402 margin = ₹702 loss. Offering ₹50 discount via WhatsApp converts 24% to prepaid (4% RTO rate), netting +₹215 more profit per converted order while preserving marketing acquisition investment.',
    expected_impact: 'Reduces COD RTO losses by ₹68,400+ while protecting 97% of genuine first-time customers and boosting net monthly profit by +₹1,42,800.',
    created_at: '2026-10-29',
    author: 'Associate Software Engineer',
  },
  {
    id: 'DEC-03',
    title: 'Customer Response 24-Hour Timeout & Auto-Hold SLA Policy',
    problem: 'What operational action should be taken if a customer ignores the WhatsApp confirmation message for 24 hours?',
    alternatives_considered: [
      'Alternative A: Ship anyway on the assumption that silence implies agreement.',
      'Alternative B: Permanently cancel and delete order.',
      'Alternative C: Auto-hold order in WMS and trigger a gentle follow-up SMS.',
    ],
    selected_approach: 'Alternative C: Auto-hold order and send self-service reminder SMS.',
    reason: 'Historical data proved that customers who ghost WhatsApp confirmation have an 81% doorstep refusal rate. Shipping them burns ₹169.40 courier cost almost guaranteed. Auto-holding stops shipment without permanently alienating the customer.',
    expected_impact: 'Prevents ~120 guaranteed returns per month, saving ~₹20,000 in return logistics.',
    created_at: '2026-10-30',
    author: 'Associate Software Engineer',
  },
];

export const DecisionLogView: React.FC = () => {
  const [logs, setLogs] = useState<DecisionLogItem[]>(INITIAL_DECISION_LOGS);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formState, setFormState] = useState<Omit<DecisionLogItem, 'id' | 'created_at'>>({
    title: '',
    problem: '',
    alternatives_considered: ['', ''],
    selected_approach: '',
    reason: '',
    expected_impact: '',
    author: 'Associate AI Engineer',
  });

  const handleSaveNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      setLogs(logs.map(l => l.id === editingId ? { ...l, ...formState } : l));
      setEditingId(null);
    } else {
      const newEntry: DecisionLogItem = {
        id: `DEC-0${logs.length + 1}`,
        created_at: new Date().toISOString().split('T')[0],
        ...formState,
      };
      setLogs([newEntry, ...logs]);
    }
    setIsAddingNew(false);
    setFormState({
      title: '',
      problem: '',
      alternatives_considered: ['', ''],
      selected_approach: '',
      reason: '',
      expected_impact: '',
      author: 'Associate AI Engineer',
    });
  };

  const handleEdit = (item: DecisionLogItem) => {
    setFormState({
      title: item.title,
      problem: item.problem,
      alternatives_considered: [...item.alternatives_considered],
      selected_approach: item.selected_approach,
      reason: item.reason,
      expected_impact: item.expected_impact,
      author: item.author,
    });
    setEditingId(item.id);
    setIsAddingNew(true);
  };

  const handleDelete = (id: string) => {
    setLogs(logs.filter(l => l.id !== id));
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold mb-2">
            <BookOpen className="w-3.5 h-3.5 text-blue-600" />
            Part 15: Core Deliverable #3
          </div>
          <h1 className="text-2xl font-black text-slate-900">Engineering & Business Decision Log</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Running record of critical architectural decisions, alternatives evaluated, and commercial rationale.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingId(null);
            setIsAddingNew(true);
          }}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Decision Entry</span>
        </button>
      </div>

      {/* Decision Entries List */}
      <div className="space-y-4">
        {logs.map((item) => (
          <div key={item.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-xs font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                  {item.id}
                </span>
                <h3 className="font-bold text-slate-900 text-base">{item.title}</h3>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> {item.created_at}
                </span>
                <button
                  onClick={() => handleEdit(item)}
                  className="p-1 hover:text-blue-600 text-slate-400 rounded"
                  title="Edit entry"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-1 hover:text-red-600 text-slate-400 rounded"
                  title="Delete entry"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="text-xs space-y-3 text-slate-600">
              <div>
                <span className="font-bold text-slate-800 uppercase tracking-wider text-[10px]">Problem Statement:</span>
                <p className="mt-0.5 text-slate-700">{item.problem}</p>
              </div>

              <div>
                <span className="font-bold text-slate-800 uppercase tracking-wider text-[10px]">Alternatives Evaluated:</span>
                <ul className="mt-1 list-disc list-inside space-y-0.5 text-slate-600">
                  {item.alternatives_considered.map((alt, i) => (
                    <li key={i}>{alt}</li>
                  ))}
                </ul>
              </div>

              <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-200 space-y-1">
                <span className="font-bold text-blue-900 text-xs">Selected Approach: {item.selected_approach}</span>
                <p className="text-slate-700 leading-relaxed">{item.reason}</p>
              </div>

              <div className="text-[11px] text-emerald-800 bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-200 font-medium">
                <strong>Expected Impact:</strong> {item.expected_impact}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Modal */}
      {isAddingNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">
                {editingId ? 'Edit Decision Entry' : 'Add New Decision Entry'}
              </h3>
              <button
                onClick={() => setIsAddingNew(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNew} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-bold mb-1">Decision Title:</label>
                <input
                  type="text"
                  required
                  value={formState.title}
                  onChange={(e) => setFormState({ ...formState, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-blue-500 font-semibold"
                  placeholder="e.g. Dynamic Pincode Re-Scoring Cadence"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Problem / Dilemma:</label>
                <textarea
                  rows={2}
                  required
                  value={formState.problem}
                  onChange={(e) => setFormState({ ...formState, problem: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-blue-500"
                  placeholder="What conflict or technical trade-off required resolution?"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Selected Approach:</label>
                <input
                  type="text"
                  required
                  value={formState.selected_approach}
                  onChange={(e) => setFormState({ ...formState, selected_approach: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Reason & Commercial Justification:</label>
                <textarea
                  rows={3}
                  required
                  value={formState.reason}
                  onChange={(e) => setFormState({ ...formState, reason: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-blue-500"
                  placeholder="Why did we pick this over alternatives? Show rupee trade-offs."
                />
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Expected Financial / Operational Impact:</label>
                <input
                  type="text"
                  required
                  value={formState.expected_impact}
                  onChange={(e) => setFormState({ ...formState, expected_impact: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-blue-500"
                  placeholder="e.g. +₹45,000 net monthly savings"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-xs"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
