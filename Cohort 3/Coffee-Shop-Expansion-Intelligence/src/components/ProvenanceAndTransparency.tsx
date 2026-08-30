import React, { useState } from 'react';
import { 
  Database, 
  Code2, 
  Terminal, 
  AlertTriangle, 
  CheckCircle2, 
  Copy, 
  Check, 
  Clock, 
  ExternalLink,
  Layers,
  Sparkles,
  X
} from 'lucide-react';
import { DataProvenance } from '../types.js';

interface ProvenanceAndTransparencyProps {
  provenance: DataProvenance;
  methodology: string;
  isOpen: boolean;
  onClose: () => void;
}

export const ProvenanceAndTransparency: React.FC<ProvenanceAndTransparencyProps> = ({
  provenance,
  methodology,
  isOpen,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'provenance' | 'sql' | 'mcp_logs' | 'schemas'>('provenance');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopySql = (id: string, sql: string) => {
    navigator.clipboard.writeText(sql);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white border border-[#DADCE0] rounded-lg w-full max-w-4xl max-h-[85vh] flex flex-col shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="bg-[#F8F9FA] px-4 py-3 border-b border-[#DADCE0] flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-7 h-7 rounded-md bg-[#E8F0FE] border border-[#D2E3FC] flex items-center justify-center">
              <Database className="w-4 h-4 text-[#1967D2]" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-[#202124] uppercase tracking-wider">
                Data Provenance, BigQuery SQL & MCP Audit Logs
              </h2>
              <p className="text-[11px] text-[#70757A]">
                Full transparency into datasets, generated SQL queries, and tool execution traces
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

        {/* Tab Navigation */}
        <div className="bg-[#F8F9FA] px-4 border-b border-[#DADCE0] flex space-x-4">
          <button
            onClick={() => setActiveTab('provenance')}
            className={`py-2 text-xs font-medium border-b-2 transition-colors cursor-pointer ${
              activeTab === 'provenance'
                ? 'border-[#4285F4] text-[#1967D2] font-bold'
                : 'border-transparent text-[#5F6368] hover:text-[#202124]'
            }`}
          >
            Data Sources ({provenance.sources.length})
          </button>

          <button
            onClick={() => setActiveTab('sql')}
            className={`py-2 text-xs font-medium border-b-2 transition-colors cursor-pointer ${
              activeTab === 'sql'
                ? 'border-[#4285F4] text-[#1967D2] font-bold'
                : 'border-transparent text-[#5F6368] hover:text-[#202124]'
            }`}
          >
            Generated BigQuery SQL ({provenance.queriesExecuted.length})
          </button>

          <button
            onClick={() => setActiveTab('mcp_logs')}
            className={`py-2 text-xs font-medium border-b-2 transition-colors cursor-pointer ${
              activeTab === 'mcp_logs'
                ? 'border-[#4285F4] text-[#1967D2] font-bold'
                : 'border-transparent text-[#5F6368] hover:text-[#202124]'
            }`}
          >
            BigQuery MCP Tool Logs ({provenance.mcpCallLogs.length})
          </button>

          <button
            onClick={() => setActiveTab('schemas')}
            className={`py-2 text-xs font-medium border-b-2 transition-colors cursor-pointer ${
              activeTab === 'schemas'
                ? 'border-[#4285F4] text-[#1967D2] font-bold'
                : 'border-transparent text-[#5F6368] hover:text-[#202124]'
            }`}
          >
            Inspected Schemas ({provenance.schemaInspected.length})
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1 text-xs">
          
          {/* Tab 1: Data Provenance */}
          {activeTab === 'provenance' && (
            <div className="space-y-3">
              <div className="bg-[#E8F0FE] border border-[#D2E3FC] rounded-md p-3 text-xs text-[#1967D2]">
                <strong className="text-[#1967D2] block mb-0.5 uppercase text-[10px] tracking-wider">Methodology & Spatial Grounding:</strong>
                <p className="text-[#202124] text-[11px] leading-relaxed">{methodology}</p>
              </div>

              <div className="space-y-2.5">
                {provenance.sources.map((src, idx) => (
                  <div key={idx} className="bg-[#F8F9FA] border border-[#DADCE0] rounded-md p-3">
                    <div className="flex flex-wrap items-center justify-between gap-1.5 mb-1.5">
                      <div className="flex items-center space-x-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#34A853]" />
                        <h4 className="font-bold text-[#202124] text-xs">{src.name}</h4>
                      </div>
                      <span className="text-[10px] font-mono bg-white border border-[#DADCE0] text-[#3C4043] px-1.5 py-0.5 rounded">
                        {src.tableOrDataset}
                      </span>
                    </div>

                    <p className="text-[11px] text-[#5F6368] mb-2">{src.description}</p>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#70757A] pt-1.5 border-t border-[#DADCE0]">
                      <div>Rows Analyzed: <strong className="text-[#202124]">{src.rowsAnalyzed}</strong></div>
                      <div>Update Cadence: <strong className="text-[#202124]">{src.lastUpdated || 'Current'}</strong></div>
                      <div>Type: <strong className="text-[#1967D2]">{src.type.toUpperCase()}</strong></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 2: Generated SQL */}
          {activeTab === 'sql' && (
            <div className="space-y-3">
              {provenance.queriesExecuted.map((q) => (
                <div key={q.id} className="bg-white border border-[#DADCE0] rounded-md overflow-hidden">
                  <div className="bg-[#F8F9FA] px-3 py-2 border-b border-[#DADCE0] flex items-center justify-between">
                    <div>
                      <span className="font-bold text-xs text-[#202124]">{q.title}</span>
                      <span className="text-[10px] text-[#70757A] ml-2">({q.executionTimeMs}ms · {q.rowsReturned} rows)</span>
                    </div>
                    <button
                      onClick={() => handleCopySql(q.id, q.sql)}
                      className="inline-flex items-center space-x-1 text-xs text-[#1967D2] hover:text-[#1A73E8] font-medium cursor-pointer"
                    >
                      {copiedId === q.id ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedId === q.id ? 'Copied' : 'Copy SQL'}</span>
                    </button>
                  </div>

                  <div className="p-3 bg-[#202124] font-mono text-[11px] text-[#E8EAED] overflow-x-auto whitespace-pre leading-relaxed">
                    {q.sql}
                  </div>

                  <div className="px-3 py-1.5 bg-[#F8F9FA] border-t border-[#DADCE0] text-[10px] text-[#5F6368]">
                    <strong>Purpose:</strong> {q.purpose}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tab 3: MCP Call Logs */}
          {activeTab === 'mcp_logs' && (
            <div className="space-y-2.5">
              <div className="text-[11px] text-[#5F6368] mb-1">
                Audit trail of MCP tools executed between Gemini Reasoning Layer and the BigQuery MCP Server:
              </div>
              {provenance.mcpCallLogs.map((log, idx) => (
                <div key={idx} className="bg-[#F8F9FA] border border-[#DADCE0] rounded-md p-2.5 font-mono text-xs">
                  <div className="flex items-center justify-between mb-1 font-sans">
                    <div className="flex items-center space-x-1.5">
                      <Terminal className="w-3.5 h-3.5 text-[#34A853]" />
                      <span className="font-bold text-[#202124] text-xs">{log.tool}</span>
                    </div>
                    <span className="text-[10px] text-[#70757A] font-mono">
                      {new Date(log.timestamp).toLocaleTimeString()} ({log.durationMs}ms)
                    </span>
                  </div>

                  <p className="text-[11px] text-[#3C4043] font-sans mb-1.5">{log.summary}</p>

                  <div className="bg-[#202124] text-[#E8EAED] p-2 rounded text-[10px] overflow-x-auto">
                    <span className="text-[#9AA0A6]">arguments: </span>
                    {JSON.stringify(log.params, null, 2)}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tab 4: Schemas */}
          {activeTab === 'schemas' && (
            <div className="space-y-3">
              {provenance.schemaInspected.map((schema, idx) => (
                <div key={idx} className="bg-white border border-[#DADCE0] rounded-md p-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <h4 className="font-bold text-[#202124] text-xs">
                      {schema.dataset}.{schema.table}
                    </h4>
                    <span className="text-[11px] text-[#70757A]">{schema.columns.length} columns</span>
                  </div>
                  <p className="text-[11px] text-[#5F6368] mb-2">{schema.description}</p>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-[#3C4043]">
                      <thead className="bg-[#F8F9FA] text-[10px] uppercase font-bold text-[#5F6368] border-b border-[#DADCE0]">
                        <tr>
                          <th className="py-1.5 px-2">Column</th>
                          <th className="py-1.5 px-2">Type</th>
                          <th className="py-1.5 px-2">Description</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#DADCE0]">
                        {schema.columns.map((col, cIdx) => (
                          <tr key={cIdx}>
                            <td className="py-1.5 px-2 font-mono text-[#1967D2] font-semibold">{col.name}</td>
                            <td className="py-1.5 px-2 font-mono text-[#5F6368]">{col.type}</td>
                            <td className="py-1.5 px-2 text-[#3C4043]">{col.description}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="bg-[#F8F9FA] px-4 py-2.5 border-t border-[#DADCE0] flex justify-end">
          <button
            onClick={onClose}
            className="px-3 py-1 rounded text-xs font-medium bg-white hover:bg-[#F1F3F4] text-[#3C4043] border border-[#DADCE0] transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
