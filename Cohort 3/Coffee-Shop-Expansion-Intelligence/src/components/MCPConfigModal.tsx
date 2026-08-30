import React, { useState } from 'react';
import { 
  Settings, 
  Database, 
  Server, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  X, 
  ExternalLink,
  ShieldCheck,
  Terminal
} from 'lucide-react';
import { MCPConnectionStatus } from '../types.js';

interface MCPConfigModalProps {
  mcpStatus: MCPConnectionStatus | null;
  isOpen: boolean;
  onClose: () => void;
  onRefreshStatus: () => void;
}

export const MCPConfigModal: React.FC<MCPConfigModalProps> = ({
  mcpStatus,
  isOpen,
  onClose,
  onRefreshStatus
}) => {
  const [mcpUrl, setMcpUrl] = useState(mcpStatus?.mcpServerUrl || '');
  const [projectId, setProjectId] = useState(mcpStatus?.projectId || 'coffee-expansion-gcp');
  const [datasetId, setDatasetId] = useState(mcpStatus?.dataset || 'coffee_expansion_lab');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  if (!isOpen) return null;

  const handleSaveAndClose = async () => {
    try {
      await fetch('/api/expansion/update-mcp-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mcpServerUrl: mcpUrl.trim() || undefined,
          projectId: projectId.trim() || undefined,
          dataset: datasetId.trim() || undefined
        })
      });
      onRefreshStatus();
    } catch (err) {
      console.warn('Failed to update MCP config:', err);
    }
    onClose();
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/expansion/test-mcp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mcpServerUrl: mcpUrl.trim() || undefined,
          projectId: projectId.trim() || undefined,
          dataset: datasetId.trim() || undefined
        })
      });
      const text = await res.text();
      let data: any;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(`Server returned non-JSON response (${res.status})`);
      }
      setTestResult(data);
      onRefreshStatus();
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || 'Failed to ping BigQuery MCP Server.'
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white border border-[#DADCE0] rounded-lg w-full max-w-xl flex flex-col shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="bg-[#F8F9FA] px-4 py-3 border-b border-[#DADCE0] flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-7 h-7 rounded-md bg-[#E8F0FE] border border-[#D2E3FC] flex items-center justify-center">
              <Settings className="w-4 h-4 text-[#1967D2]" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-[#202124] uppercase tracking-wider">
                Google Cloud BigQuery & MCP Server Configuration
              </h2>
              <p className="text-[11px] text-[#70757A]">
                Manage live BigQuery connection and MCP tool access layer
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded text-[#5F6368] hover:text-[#202124] hover:bg-[#E8EAED] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4 text-xs text-[#3C4043] overflow-y-auto max-h-[70vh]">
          
          {/* Current Status Badge */}
          <div className="bg-[#F8F9FA] border border-[#DADCE0] rounded-md p-3 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className={`w-2.5 h-2.5 rounded-full ${mcpStatus?.mode === 'sandbox_demo' ? 'bg-[#F9AB00]' : 'bg-[#34A853]'}`} />
              <div>
                <span className="font-bold text-[#202124] block text-xs">
                  {mcpStatus?.mode === 'sandbox_demo' ? 'Sandbox Demo Mode Active' : 'Live BigQuery MCP Connected'}
                </span>
                <span className="text-[#5F6368] text-[11px]">
                  {mcpStatus?.mode === 'sandbox_demo' 
                    ? 'Using high-fidelity realistic London Cycling & Coffee Retail benchmark datasets.'
                    : `Connected to Cloud Project: ${mcpStatus?.projectId || 'Google Cloud'}`}
                </span>
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-[#202124] mb-1">
                BigQuery MCP Server Endpoint URL:
              </label>
              <input
                type="text"
                value={mcpUrl}
                onChange={(e) => setMcpUrl(e.target.value)}
                placeholder="e.g. https://bigquery-mcp-server-xyz.a.run.app or http://localhost:8000"
                className="w-full bg-white border border-[#DADCE0] rounded-md px-3 py-1.5 text-xs text-[#202124] placeholder-[#9AA0A6] focus:ring-1 focus:ring-[#4285F4] focus:border-[#4285F4]"
              />
              <p className="text-[11px] text-[#70757A] mt-1">
                Leave empty to run in Sandbox Demo Mode with complete TfL cycleway & store networks.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#202124] mb-1">
                  Google Cloud Project ID:
                </label>
                <input
                  type="text"
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  placeholder="e.g. coffee-expansion-gcp"
                  className="w-full bg-white border border-[#DADCE0] rounded-md px-3 py-1.5 text-xs text-[#202124] placeholder-[#9AA0A6] focus:ring-1 focus:ring-[#4285F4] focus:border-[#4285F4]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#202124] mb-1">
                  Primary Dataset ID:
                </label>
                <input
                  type="text"
                  value={datasetId}
                  onChange={(e) => setDatasetId(e.target.value)}
                  placeholder="e.g. coffee_expansion_lab"
                  className="w-full bg-white border border-[#DADCE0] rounded-md px-3 py-1.5 text-xs text-[#202124] placeholder-[#9AA0A6] focus:ring-1 focus:ring-[#4285F4] focus:border-[#4285F4]"
                />
              </div>
            </div>
          </div>

          {/* Test Connection Button */}
          <div className="pt-1">
            <button
              onClick={handleTestConnection}
              disabled={isTesting}
              className="inline-flex items-center space-x-1.5 bg-white hover:bg-[#F8F9FA] text-[#3C4043] font-medium text-xs px-3 py-1.5 rounded border border-[#DADCE0] transition-colors disabled:opacity-50 cursor-pointer"
            >
              {isTesting ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin text-[#4285F4]" />
                  <span>Verifying MCP Handshake...</span>
                </>
              ) : (
                <>
                  <Server className="w-3 h-3 text-[#4285F4]" />
                  <span>Test MCP Endpoint Handshake</span>
                </>
              )}
            </button>

            {testResult && (
              <div className={`mt-2 p-2.5 rounded-md border flex items-start space-x-2 text-xs ${
                testResult.success ? 'bg-[#E6F4EA] border-[#CEEAD6] text-[#137333]' : 'bg-[#FCE8E6] border-[#FAD2CF] text-[#C5221F]'
              }`}>
                {testResult.success ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#137333] flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5 text-[#C5221F] flex-shrink-0 mt-0.5" />
                )}
                <span>{testResult.message}</span>
              </div>
            )}
          </div>

          {/* Setup Guide Info */}
          <div className="bg-[#E8F0FE] border border-[#D2E3FC] rounded-md p-3 space-y-1 text-xs">
            <div className="flex items-center space-x-1.5 text-[#1967D2] font-bold">
              <Terminal className="w-3.5 h-3.5" />
              <span>How BigQuery MCP Works in this Lab</span>
            </div>
            <p className="text-[11px] text-[#202124] leading-relaxed">
              The <strong>BigQuery Model Context Protocol (MCP) Server</strong> enables Gemini to securely inspect datasets, discover table schemas, and execute spatial SQL queries via standardized tool declarations (<code className="text-[#1967D2] font-semibold">list_datasets</code>, <code className="text-[#1967D2] font-semibold">get_table_schema</code>, <code className="text-[#1967D2] font-semibold">execute_expansion_analytics_query</code>).
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-[#F8F9FA] px-4 py-2.5 border-t border-[#DADCE0] flex justify-end">
          <button
            onClick={handleSaveAndClose}
            className="px-3 py-1.5 rounded text-xs font-bold bg-[#4285F4] hover:bg-[#1A73E8] text-white transition-colors cursor-pointer"
          >
            Save & Close
          </button>
        </div>

      </div>
    </div>
  );
};
