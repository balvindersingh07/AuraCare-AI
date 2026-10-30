import React, { useState, useMemo } from 'react';
import { PREGENERATED_ORDERS } from './data/mockOrdersData';
import { Order, BusinessRulesConfig, DEFAULT_BUSINESS_RULES } from './types';
import { computeBatchMetrics } from './utils/engine';
import { Sidebar, TabKey } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { DecisionEngineView } from './components/DecisionEngineView';
import { OrdersExplorerView } from './components/OrdersExplorerView';
import { WhatsAppSimulatorView } from './components/WhatsAppSimulatorView';
import { PrepaidCalculatorView } from './components/PrepaidCalculatorView';
import { RiskAnalyticsView } from './components/RiskAnalyticsView';
import { PincodeIntelligenceView } from './components/PincodeIntelligenceView';
import { BusinessRulesView } from './components/BusinessRulesView';
import { FounderMemoView } from './components/FounderMemoView';
import { DecisionLogView } from './components/DecisionLogView';
import { AiUsageLogView } from './components/AiUsageLogView';
import { SettingsAndTestsView } from './components/SettingsAndTestsView';
import { CsvUploadModal } from './components/CsvUploadModal';
import { Menu, X, Sparkles, Upload } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabKey>('overview');

  // Load from localStorage if present
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem('auracare_orders');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Could not load orders from localStorage:', e);
    }
    return PREGENERATED_ORDERS;
  });

  const [rules, setRules] = useState<BusinessRulesConfig>(() => {
    try {
      const saved = localStorage.getItem('auracare_rules');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Could not load rules from localStorage:', e);
    }
    return DEFAULT_BUSINESS_RULES;
  });

  const [isCustomDataset, setIsCustomDataset] = useState<boolean>(() => {
    return localStorage.getItem('auracare_custom_dataset') === 'true';
  });
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [whatsappOrder, setWhatsappOrder] = useState<Order | null>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Sync to localStorage
  React.useEffect(() => {
    try {
      localStorage.setItem('auracare_orders', JSON.stringify(orders));
      localStorage.setItem('auracare_custom_dataset', String(isCustomDataset));
    } catch (e) {}
  }, [orders, isCustomDataset]);

  React.useEffect(() => {
    try {
      localStorage.setItem('auracare_rules', JSON.stringify(rules));
    } catch (e) {}
  }, [rules]);

  // Compute live portfolio metrics
  const { summary } = useMemo(() => {
    return computeBatchMetrics(orders, rules);
  }, [orders, rules]);

  const handleSimulateInWhatsApp = (order: Order, flow: 'confirm' | 'nudge') => {
    setWhatsappOrder(order);
    setActiveTab('whatsapp');
  };

  const handleApplyDataset = (newOrders: Order[], isCustom: boolean) => {
    setOrders(newOrders);
    setIsCustomDataset(isCustom);
  };

  const handleResetToDefault = () => {
    try {
      localStorage.removeItem('auracare_orders');
      localStorage.removeItem('auracare_rules');
      localStorage.removeItem('auracare_custom_dataset');
    } catch (e) {}
    setOrders(PREGENERATED_ORDERS);
    setRules(DEFAULT_BUSINESS_RULES);
    setIsCustomDataset(false);
  };

  const handleUpdateSingleOrder = (updated: Order) => {
    setOrders(prev => prev.map(o => o.order_id === updated.order_id ? updated : o));
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex font-sans antialiased selection:bg-blue-100 selection:text-blue-900">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block shrink-0">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          totalOrders={orders.length}
          netImpact={summary.netFinancialImpact}
          onOpenUpload={() => setIsUploadModalOpen(true)}
          isCustomDataset={isCustomDataset}
        />
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden bg-slate-900/60 backdrop-blur-xs">
          <div className="w-64 bg-white h-full shadow-2xl flex flex-col">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <span className="font-bold text-slate-900">AuraCare AI</span>
              <button
                onClick={() => setMobileSidebarOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <Sidebar
                activeTab={activeTab}
                setActiveTab={(tab) => {
                  setActiveTab(tab);
                  setMobileSidebarOpen(false);
                }}
                totalOrders={orders.length}
                netImpact={summary.netFinancialImpact}
                onOpenUpload={() => {
                  setIsUploadModalOpen(true);
                  setMobileSidebarOpen(false);
                }}
                isCustomDataset={isCustomDataset}
              />
            </div>
          </div>
        </div>
      )}

      {/* Main Content Workspace */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header Bar */}
        <header className="lg:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-30 shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="p-1.5 rounded-lg bg-slate-100 text-slate-700"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="font-bold text-slate-900 text-sm">AuraCare AI</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              +{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(summary.netFinancialImpact)}
            </span>
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="p-1.5 rounded-lg bg-slate-100 text-slate-600"
              title="Upload CSV"
            >
              <Upload className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Content Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'overview' && (
            <DashboardView
              orders={orders}
              rules={rules}
              onOpenRules={() => setActiveTab('rules')}
              onSelectOrder={(order) => {
                setWhatsappOrder(order);
                setActiveTab('orders');
              }}
              onNavigateTab={(tab) => setActiveTab(tab)}
            />
          )}

          {activeTab === 'engine' && (
            <DecisionEngineView
              orders={orders}
              rules={rules}
              onOpenRules={() => setActiveTab('rules')}
              onSimulateOrderInWhatsApp={handleSimulateInWhatsApp}
            />
          )}

          {activeTab === 'orders' && (
            <OrdersExplorerView
              orders={orders}
              onUpdateOrder={handleUpdateSingleOrder}
              onSimulateInWhatsApp={handleSimulateInWhatsApp}
            />
          )}

          {activeTab === 'whatsapp' && (
            <WhatsAppSimulatorView initialOrder={whatsappOrder} />
          )}

          {activeTab === 'prepaid' && (
            <PrepaidCalculatorView />
          )}

          {activeTab === 'risk' && (
            <RiskAnalyticsView orders={orders} />
          )}

          {activeTab === 'pincodes' && (
            <PincodeIntelligenceView orders={orders} />
          )}

          {activeTab === 'rules' && (
            <BusinessRulesView
              rules={rules}
              onSaveRules={setRules}
              orders={orders}
            />
          )}

          {activeTab === 'memo' && (
            <FounderMemoView orders={orders} />
          )}

          {activeTab === 'decision_log' && (
            <DecisionLogView />
          )}

          {activeTab === 'ai_log' && (
            <AiUsageLogView />
          )}

          {activeTab === 'settings' && (
            <SettingsAndTestsView
              onResetAllData={handleResetToDefault}
              totalOrdersLoaded={orders.length}
            />
          )}
        </main>
      </div>

      {/* CSV Ingestion & Mapping Modal */}
      {isUploadModalOpen && (
        <CsvUploadModal
          currentOrders={orders}
          onApplyDataset={handleApplyDataset}
          onResetToDefault={handleResetToDefault}
          onClose={() => setIsUploadModalOpen(false)}
        />
      )}
    </div>
  );
}
