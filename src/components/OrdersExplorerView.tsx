import React, { useState, useMemo } from 'react';
import { Order, ActionType, RiskCategory } from '../types';
import { 
  Search, 
  Filter, 
  Download, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  RotateCcw,
  Check,
  Eye,
  X,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  UserCheck
} from 'lucide-react';
import { ordersToCsv } from '../utils/csvHelper';

interface OrdersExplorerViewProps {
  orders: Order[];
  onUpdateOrder: (updated: Order) => void;
  onSimulateInWhatsApp: (order: Order, flow: 'confirm' | 'nudge') => void;
}

export const OrdersExplorerView: React.FC<OrdersExplorerViewProps> = ({
  orders,
  onUpdateOrder,
  onSimulateInWhatsApp,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [customerTypeFilter, setCustomerTypeFilter] = useState<string>('all');
  const [outcomeFilter, setOutcomeFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'score' | 'value' | 'id'>('score');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [manualAction, setManualAction] = useState<ActionType>('Ship as-is');
  const [manualNote, setManualNote] = useState('');

  // Filter & Sort
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      if (actionFilter !== 'all' && o.recommended_action !== actionFilter) return false;
      if (customerTypeFilter !== 'all' && o.customer_type !== customerTypeFilter) return false;
      if (outcomeFilter !== 'all' && o.delivery_status !== outcomeFilter) return false;

      if (searchTerm) {
        const query = searchTerm.toLowerCase();
        return (
          o.order_id.toLowerCase().includes(query) ||
          o.customer_name.toLowerCase().includes(query) ||
          o.phone.includes(query) ||
          o.address.toLowerCase().includes(query) ||
          o.pincode.includes(query) ||
          o.city.toLowerCase().includes(query)
        );
      }
      return true;
    }).sort((a, b) => {
      let comp = 0;
      if (sortBy === 'score') comp = (a.risk_score || 0) - (b.risk_score || 0);
      else if (sortBy === 'value') comp = a.order_value - b.order_value;
      else if (sortBy === 'id') comp = a.order_id.localeCompare(b.order_id);
      else comp = new Date(a.order_date).getTime() - new Date(b.order_date).getTime();
      return sortDirection === 'desc' ? -comp : comp;
    });
  }, [orders, actionFilter, customerTypeFilter, outcomeFilter, searchTerm, sortBy, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(filteredOrders.length / pageSize) || 1;
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredOrders.slice(start, start + pageSize);
  }, [filteredOrders, currentPage, pageSize]);

  const handleExportCsv = () => {
    const csv = ordersToCsv(filteredOrders);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders_filtered_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleApplyManualReview = () => {
    if (!selectedOrder) return;
    const updated: Order = {
      ...selectedOrder,
      is_reviewed_manually: true,
      manual_override_action: manualAction,
      operational_notes: manualNote || 'Manually audited by warehouse ops manager',
    };
    onUpdateOrder(updated);
    setSelectedOrder(updated);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Orders Explorer & Audit Table</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Search, filter, inspect risk factor attributions, and execute manual overrides on incoming orders.
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 shadow-xs transition-colors self-start md:self-auto"
        >
          <Download className="w-3.5 h-3.5 text-slate-500" />
          <span>Export Filtered ({filteredOrders.length})</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Order ID, customer, phone, address, or pincode..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
            />
          </div>

          {/* Action Filter */}
          <select
            value={actionFilter}
            onChange={(e) => {
              setActionFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 focus:outline-none"
          >
            <option value="all">All Actions</option>
            <option value="Ship as-is">Ship as-is</option>
            <option value="Ship after confirmation">Ship after confirmation</option>
            <option value="Nudge to prepaid">Nudge to prepaid</option>
            <option value="Hold / cancel">Hold / cancel</option>
          </select>

          {/* Customer Type Filter */}
          <select
            value={customerTypeFilter}
            onChange={(e) => {
              setCustomerTypeFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 focus:outline-none"
          >
            <option value="all">All Customer Types</option>
            <option value="first_time">First-Time Customer</option>
            <option value="repeat">Repeat Customer</option>
          </select>

          {/* Final Outcome Filter */}
          <select
            value={outcomeFilter}
            onChange={(e) => {
              setOutcomeFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 focus:outline-none"
          >
            <option value="all">All Outcomes</option>
            <option value="Delivered">Delivered</option>
            <option value="RTO">RTO (Returned)</option>
          </select>
        </div>

        {/* Sort and Count Summary */}
        <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <div>
            Showing <strong className="text-slate-900">{filteredOrders.length}</strong> matching records
          </div>

          <div className="flex items-center gap-3">
            <span className="text-slate-400">Sort by:</span>
            {(['score', 'value', 'date', 'id'] as const).map((s) => (
              <button
                key={s}
                onClick={() => {
                  if (sortBy === s) setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
                  else {
                    setSortBy(s);
                    setSortDirection('desc');
                  }
                }}
                className={`font-semibold capitalize px-2 py-0.5 rounded transition-colors ${
                  sortBy === s ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {s} {sortBy === s ? (sortDirection === 'desc' ? '↓' : '↑') : ''}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 font-semibold">Order ID</th>
                <th className="py-3 px-4 font-semibold">Customer</th>
                <th className="py-3 px-4 font-semibold">Phone & Pincode</th>
                <th className="py-3 px-4 font-semibold">Address</th>
                <th className="py-3 px-4 font-semibold text-right">Value</th>
                <th className="py-3 px-4 font-semibold text-center">Risk Score</th>
                <th className="py-3 px-4 font-semibold">Action & Reason</th>
                <th className="py-3 px-4 font-semibold text-center">Outcome</th>
                <th className="py-3 px-4 font-semibold text-center">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {paginatedOrders.map((o) => {
                const score = o.risk_score || 0;
                let badgeStyle = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                if (o.recommended_action === 'Ship after confirmation') badgeStyle = 'bg-teal-50 text-teal-700 border-teal-200';
                else if (o.recommended_action === 'Nudge to prepaid') badgeStyle = 'bg-blue-50 text-blue-700 border-blue-200';
                else if (o.recommended_action === 'Hold / cancel') badgeStyle = 'bg-red-50 text-red-700 border-red-200';

                return (
                  <tr
                    key={o.order_id}
                    onClick={() => {
                      setSelectedOrder(o);
                      setManualAction(o.recommended_action || 'Ship as-is');
                      setManualNote(o.operational_notes || '');
                    }}
                    className="hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4 font-mono font-bold text-blue-600 whitespace-nowrap">
                      {o.order_id}
                      {o.is_reviewed_manually && (
                        <span className="ml-1.5 px-1 py-0.2 rounded text-[9px] bg-purple-50 text-purple-700 border border-purple-200">
                          Reviewed
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-semibold text-slate-900">{o.customer_name}</div>
                      <div className="text-[11px] text-slate-400">
                        {o.customer_type === 'repeat' ? (
                          <span className="text-emerald-700 font-medium">Repeat ({o.prior_delivered_count} delivered)</span>
                        ) : (
                          <span className="text-amber-700">First-time</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-mono text-slate-700">{o.phone}</div>
                      <div className="text-[11px] text-slate-400">{o.city} ({o.pincode})</div>
                    </td>
                    <td className="py-3 px-4 max-w-xs truncate">
                      <div className="truncate text-slate-800">{o.address}</div>
                      {o.is_hinglish && (
                        <span className="inline-block px-1.5 py-0.2 rounded text-[9px] bg-blue-50 text-blue-700 font-semibold mt-0.5">
                          Hinglish Directions
                        </span>
                      )}
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
                      <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold border mb-1 ${badgeStyle}`}>
                        {o.recommended_action}
                      </span>
                      <p className="text-[11px] text-slate-500 truncate">{o.decision_reason}</p>
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        o.delivery_status === 'Delivered'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-red-50 text-red-700 border border-red-200'
                      }`}>
                        {o.delivery_status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedOrder(o);
                        }}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <span>Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-2 py-1 rounded bg-white border border-slate-200 text-slate-700 font-semibold"
            >
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
            <span>
              Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Order Detail & Manual Review Drawer / Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Header */}
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

            {/* Customer & Shipping Summary */}
            <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-400 font-medium">Customer:</span>
                <p className="font-bold text-slate-900 text-sm mt-0.5">{selectedOrder.customer_name}</p>
                <p className="text-slate-500">{selectedOrder.customer_type === 'repeat' ? 'Repeat Loyal Buyer' : 'First-time Customer (₹300 CAC)'}</p>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Contact:</span>
                <p className="font-mono text-slate-900 font-semibold mt-0.5">{selectedOrder.phone}</p>
                <p className="text-slate-500">Pincode: {selectedOrder.pincode} • {selectedOrder.city}, {selectedOrder.state}</p>
              </div>
              <div className="col-span-2">
                <span className="text-slate-400 font-medium">Full Shipping Address:</span>
                <p className="text-slate-800 font-medium mt-0.5">{selectedOrder.address}</p>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Cart Value:</span>
                <p className="text-emerald-700 font-black text-sm mt-0.5">₹{selectedOrder.order_value}</p>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Historical Outcome:</span>
                <p className={`font-bold mt-0.5 ${selectedOrder.delivery_status === 'Delivered' ? 'text-emerald-700' : 'text-red-600'}`}>
                  {selectedOrder.delivery_status} {selectedOrder.rto_reason ? `(${selectedOrder.rto_reason})` : ''}
                </p>
              </div>
            </div>

            {/* Key Risk Factors */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Key Decision Attributions (Score: {selectedOrder.risk_score}/100 • Confidence: {selectedOrder.confidence_level}%)
              </span>
              <p className="text-xs text-slate-800 font-medium">
                {selectedOrder.decision_reason}
              </p>
              {selectedOrder.key_risk_factors && selectedOrder.key_risk_factors.length > 0 && (
                <div className="mt-2 space-y-1">
                  {selectedOrder.key_risk_factors.map((f, i) => (
                    <div key={i} className="text-[11px] text-slate-600 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Manual Review Override Section */}
            <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-blue-600" />
                  Manual Operations Review / Override
                </span>
                {selectedOrder.is_reviewed_manually && (
                  <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
                    Manually Overridden
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-500 mb-1">Override Action:</label>
                  <select
                    value={manualAction}
                    onChange={(e) => setManualAction(e.target.value as ActionType)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 font-semibold"
                  >
                    <option value="Ship as-is">Ship as-is</option>
                    <option value="Ship after confirmation">Ship after confirmation</option>
                    <option value="Nudge to prepaid">Nudge to prepaid</option>
                    <option value="Hold / cancel">Hold / cancel</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-500 mb-1">Audit Note:</label>
                  <input
                    type="text"
                    placeholder="e.g. Verified customer on phone call"
                    value={manualNote}
                    onChange={(e) => setManualNote(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-800"
                  />
                </div>
              </div>

              <button
                onClick={handleApplyManualReview}
                className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-xs transition-colors"
              >
                Save Operational Override
              </button>
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => {
                  onSimulateInWhatsApp(
                    selectedOrder,
                    selectedOrder.recommended_action === 'Nudge to prepaid' ? 'nudge' : 'confirm'
                  );
                  setSelectedOrder(null);
                }}
                className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold shadow-xs"
              >
                Test in WhatsApp Simulator
              </button>
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
    </div>
  );
};
