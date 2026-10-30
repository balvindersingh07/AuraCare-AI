import React from 'react';
import { 
  LayoutDashboard, 
  Sparkles, 
  Package, 
  MessageSquare, 
  Calculator, 
  BarChart3, 
  MapPin, 
  Sliders, 
  FileText, 
  BookOpen, 
  Cpu, 
  Settings, 
  ShieldCheck, 
  Upload,
  ChevronRight,
  TrendingUp
} from 'lucide-react';

export type TabKey = 
  | 'overview'
  | 'engine'
  | 'orders'
  | 'whatsapp'
  | 'prepaid'
  | 'risk'
  | 'pincodes'
  | 'rules'
  | 'memo'
  | 'decision_log'
  | 'ai_log'
  | 'settings';

interface SidebarProps {
  activeTab: TabKey;
  setActiveTab: (tab: TabKey) => void;
  totalOrders: number;
  netImpact: number;
  onOpenUpload: () => void;
  isCustomDataset: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  totalOrders,
  netImpact,
  onOpenUpload,
  isCustomDataset,
}) => {
  const navItems: { key: TabKey; label: string; icon: any; badge?: string }[] = [
    { key: 'overview', label: 'Overview Dashboard', icon: LayoutDashboard },
    { key: 'engine', label: 'Decision Engine', icon: Sparkles, badge: 'Core' },
    { key: 'orders', label: 'Orders Explorer', icon: Package, badge: String(totalOrders) },
    { key: 'whatsapp', label: 'WhatsApp Flow', icon: MessageSquare },
    { key: 'prepaid', label: 'Prepaid Calculator', icon: Calculator, badge: 'Math' },
    { key: 'risk', label: 'Risk Analytics', icon: BarChart3 },
    { key: 'pincodes', label: 'Pincode Intelligence', icon: MapPin },
    { key: 'rules', label: 'Business Rules', icon: Sliders },
    { key: 'memo', label: 'Founder Memo', icon: FileText, badge: '1-2p' },
    { key: 'decision_log', label: 'Decision Log', icon: BookOpen },
    { key: 'ai_log', label: 'AI Usage Log', icon: Cpu },
    { key: 'settings', label: 'Settings & Tests', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0 min-h-screen">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-900 text-base tracking-tight">AuraCare</span>
              <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                AI
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">COD & RTO Intelligence</p>
          </div>
        </div>

        {/* Live Net Impact Card */}
        <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span>Net Financial Impact</span>
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-base font-black text-emerald-700 mt-0.5">
            +{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(netImpact)}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
            <span>{totalOrders} orders analyzed</span>
            {isCustomDataset && (
              <span className="px-1 py-0.2 rounded bg-amber-100 text-amber-800 font-semibold">Custom</span>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1.5">
          Main Modules
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.key;
          return (
            <button
              key={item.key}
              onClick={() => setActiveTab(item.key)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all group ${
                isActive
                  ? 'bg-blue-50 text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 transition-colors ${
                  isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'
                }`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Dataset & User Footer */}
      <div className="p-3 border-t border-slate-100 space-y-2">
        <button
          onClick={onOpenUpload}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors border border-slate-200"
        >
          <Upload className="w-3.5 h-3.5 text-blue-600" />
          <span>Upload / Manage CSV</span>
        </button>

        <div className="px-3 py-2 rounded-xl bg-slate-50 flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
            BS
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-bold text-slate-800 truncate">Balvinder Singh</p>
            <p className="text-[10px] text-slate-400 truncate">Associate AI Engineer</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
