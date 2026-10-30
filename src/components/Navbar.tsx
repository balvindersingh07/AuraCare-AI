import React from 'react';
import { ShieldCheck, MessageSquare, LayoutDashboard, FileText, Sliders, Clock, Sparkles } from 'lucide-react';

interface NavbarProps {
  activeTab: 'timeline' | 'dashboard' | 'engine' | 'whatsapp' | 'memo' | 'thresholds';
  setActiveTab: (tab: 'timeline' | 'dashboard' | 'engine' | 'whatsapp' | 'memo' | 'thresholds') => void;
  ordersCount: number;
  netImpact: number;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, ordersCount, netImpact }) => {
  return (
    <header className="sticky top-0 z-30 bg-slate-900 border-b border-slate-800 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <ShieldCheck className="h-6 w-6 text-slate-950 font-bold" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight text-white">AuraCare</span>
                <span className="px-2 py-0.5 text-xs font-semibold rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  RTO Shield AI
                </span>
              </div>
              <p className="text-xs text-slate-400">D2C COD Decision & WhatsApp Recovery Engine</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1">
            <button
              onClick={() => setActiveTab('timeline')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'timeline'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>Timeline & Scope</span>
              <span className="px-1.5 py-0.2 rounded text-[10px] bg-emerald-400/30 text-emerald-200">Done</span>
            </button>

            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'dashboard'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Founder Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab('engine')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'engine'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Decision Engine</span>
              <span className="text-xs bg-slate-800 px-1.5 py-0.5 rounded text-slate-300 border border-slate-700">
                {ordersCount}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('whatsapp')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'whatsapp'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>WhatsApp Flow Mock</span>
            </button>

            <button
              onClick={() => setActiveTab('thresholds')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'thresholds'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Sliders className="w-4 h-4" />
              <span>Thresholds</span>
            </button>

            <button
              onClick={() => setActiveTab('memo')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'memo'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Founder Memo & Logs</span>
            </button>
          </nav>

          {/* Quick Net Financial Impact Pill */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-[11px] text-slate-400 font-medium">Estimated Net ₹ Impact</span>
              <span className="text-sm font-bold text-emerald-400">
                +{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(netImpact)}
              </span>
            </div>
            <button
              onClick={() => setActiveTab('thresholds')}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700"
              title="Configure Rule Thresholds"
            >
              <Sliders className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation Row */}
        <div className="flex md:hidden overflow-x-auto py-2 gap-2 border-t border-slate-800 no-scrollbar">
          <button
            onClick={() => setActiveTab('timeline')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium shrink-0 ${
              activeTab === 'timeline' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300'
            }`}
          >
            Timeline & Scope
          </button>
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium shrink-0 ${
              activeTab === 'dashboard' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('engine')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium shrink-0 ${
              activeTab === 'engine' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300'
            }`}
          >
            Engine ({ordersCount})
          </button>
          <button
            onClick={() => setActiveTab('whatsapp')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium shrink-0 ${
              activeTab === 'whatsapp' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300'
            }`}
          >
            WhatsApp Flow
          </button>
          <button
            onClick={() => setActiveTab('thresholds')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium shrink-0 ${
              activeTab === 'thresholds' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300'
            }`}
          >
            Thresholds
          </button>
          <button
            onClick={() => setActiveTab('memo')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium shrink-0 ${
              activeTab === 'memo' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300'
            }`}
          >
            Founder Memo
          </button>
        </div>
      </div>
    </header>
  );
};
