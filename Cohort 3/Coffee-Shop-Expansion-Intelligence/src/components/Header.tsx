import React from 'react';
import { 
  Compass, 
  Database, 
  Sparkles, 
  Settings, 
  RefreshCw, 
  Info, 
  CheckCircle2, 
  AlertCircle,
  Layers,
  Bike
} from 'lucide-react';
import { MCPConnectionStatus } from '../types.js';

interface HeaderProps {
  mcpStatus: MCPConnectionStatus | null;
  onOpenSettings: () => void;
  onOpenProvenance: () => void;
  onReset: () => void;
  isLoading: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  mcpStatus,
  onOpenSettings,
  onOpenProvenance,
  onReset,
  isLoading
}) => {
  const isDemo = mcpStatus?.mode === 'sandbox_demo' || !mcpStatus?.connected;

  return (
    <header className="bg-white border-b border-[#DADCE0] text-[#3C4043] sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          
          {/* Brand & Title */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-md bg-[#4285F4] flex items-center justify-center shadow-xs text-white">
              <span className="font-bold text-sm">G</span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-sm sm:text-base font-bold tracking-tight text-[#202124] font-sans">
                  Coffee Shop Expansion Intelligence
                </h1>
                <span className="hidden md:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[#F1F3F4] text-[#5F6368] border border-[#DADCE0]">
                  Track 2
                </span>
              </div>
              <p className="text-[11px] text-[#70757A] font-medium hidden sm:block">
                AI location strategy powered by Gemini 3.7 Flash, BigQuery & BigQuery MCP Server
              </p>
            </div>
          </div>

          {/* Right Action Badges & Controls */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            
            {/* Mode Indicator Badge */}
            <button 
              onClick={onOpenSettings}
              className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded text-[11px] font-bold uppercase transition-colors cursor-pointer ${
                isDemo 
                  ? 'bg-[#FEF7E0] text-[#B06000] border border-[#FEEFC3] hover:bg-[#FEEFC3]' 
                  : 'bg-[#E6F4EA] text-[#137333] border border-[#CEEAD6] hover:bg-[#CEEAD6]'
              }`}
              title="Click to view MCP & Cloud connection status"
            >
              {isDemo ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-[#F9AB00] animate-pulse" />
                  <span>Demo Dataset Mode</span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-[#34A853]" />
                  <span>BigQuery MCP Connected</span>
                </>
              )}
            </button>

            {/* Model Badge */}
            <div className="hidden lg:inline-flex items-center space-x-1.5 px-2 py-1 rounded text-[10px] font-bold uppercase bg-[#F1F3F4] text-[#5F6368] border border-[#DADCE0]">
              <Sparkles className="w-3 h-3 text-[#4285F4]" />
              <span>Gemini 3.7 Flash</span>
            </div>

            {/* Provenance & SQL Inspector */}
            <button
              onClick={onOpenProvenance}
              className="inline-flex items-center space-x-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold bg-white hover:bg-[#F8F9FA] text-[#3C4043] border border-[#DADCE0] transition-colors cursor-pointer"
              title="Inspect BigQuery schemas, SQL queries, and MCP call logs"
            >
              <Database className="w-3.5 h-3.5 text-[#4285F4]" />
              <span className="hidden sm:inline">Data & SQL</span>
            </button>

            {/* Settings Button */}
            <button
              onClick={onOpenSettings}
              className="p-1.5 rounded-md text-[#5F6368] hover:text-[#202124] hover:bg-[#F8F9FA] border border-[#DADCE0] transition-colors cursor-pointer"
              title="Configure BigQuery & MCP Server connection"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* Refresh / Re-analyze */}
            <button
              onClick={onReset}
              disabled={isLoading}
              className="p-1.5 rounded-md text-[#5F6368] hover:text-[#202124] hover:bg-[#F8F9FA] border border-[#DADCE0] transition-colors disabled:opacity-50 cursor-pointer"
              title="Re-run expansion analysis"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-[#4285F4]' : ''}`} />
            </button>

          </div>
        </div>
      </div>
    </header>
  );
};
