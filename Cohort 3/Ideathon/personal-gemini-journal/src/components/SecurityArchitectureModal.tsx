import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  FileCode2,
  Terminal,
  CheckCircle2,
  Server,
  Cloud,
  KeyRound,
  Cpu,
  Layers,
  ArrowRight,
  Database,
  EyeOff,
  Activity
} from 'lucide-react';

interface SecurityArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SecurityArchitectureModal: React.FC<SecurityArchitectureModalProps> = ({
  isOpen,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'architecture' | 'secret_manager' | 'isolation' | 'infrastructure'>('architecture');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 my-8 space-y-6">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shadow-2xs">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                  Enterprise Security Architecture & Secret Manager
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Zero-Trust Enforced
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Threat Model, GCP Secret Manager Runtime Resolution, Multi-Tenant Partitioning, and Cloud Run Isolation.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition"
          >
            ✕
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center space-x-1.5 border-b border-slate-200 overflow-x-auto pb-1 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('architecture')}
            className={`px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 ${
              activeTab === 'architecture' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Threat Model & Defenses</span>
          </button>

          <button
            onClick={() => setActiveTab('secret_manager')}
            className={`px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 ${
              activeTab === 'secret_manager' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            <span>Secret Manager Pipeline</span>
          </button>

          <button
            onClick={() => setActiveTab('isolation')}
            className={`px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 ${
              activeTab === 'isolation' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Database className="w-3.5 h-3.5 text-blue-600" />
            <span>Firestore Tenant Isolation</span>
          </button>

          <button
            onClick={() => setActiveTab('infrastructure')}
            className={`px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 ${
              activeTab === 'infrastructure' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Cloud className="w-3.5 h-3.5 text-purple-600" />
            <span>Cloud Run Infrastructure</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="text-xs space-y-4">
          
          {/* TAB 1: ARCHITECTURE & THREAT MODEL */}
          {activeTab === 'architecture' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <div className="flex items-center space-x-2 text-indigo-700 font-bold">
                    <Lock className="w-4 h-4" />
                    <span>Secret Zero Defense</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed text-[11px]">
                    No Gemini API keys or credentials exist in client bundles. Secrets are dynamically resolved server-side from Google Cloud Secret Manager.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <div className="flex items-center space-x-2 text-emerald-700 font-bold">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Firestore Isolation</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed text-[11px]">
                    Security rules enforce <code className="bg-emerald-100 text-emerald-900 px-1 py-0.5 rounded font-mono text-[10px]">request.auth.uid == userId</code> on all subcollections, preventing cross-tenant data leakage.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <div className="flex items-center space-x-2 text-amber-700 font-bold">
                    <Cpu className="w-4 h-4" />
                    <span>Structured AI Execution</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed text-[11px]">
                    All multi-turn journaling prompts, summaries, and action item extractions execute exclusively on backend proxies with schema enforcement.
                  </p>
                </div>
              </div>

              {/* Threat Matrix Table */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
                <div className="bg-slate-100 px-4 py-2.5 font-bold text-slate-800 text-xs flex items-center justify-between">
                  <span>Enterprise Threat Modeling & Mitigation Matrix</span>
                  <span className="text-[10px] text-slate-500 font-normal">OWASP & Zero-Trust Aligned</span>
                </div>
                <table className="w-full text-left divide-y divide-slate-200 text-xs">
                  <thead className="bg-slate-50 text-slate-600 text-[11px]">
                    <tr>
                      <th className="p-3 font-semibold">Threat Vector</th>
                      <th className="p-3 font-semibold">Risk Level</th>
                      <th className="p-3 font-semibold">Mitigation Strategy</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    <tr>
                      <td className="p-3 font-medium">BOLA / IDOR (Cross-User Journal Reading)</td>
                      <td className="p-3"><span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold text-[10px]">CRITICAL</span></td>
                      <td className="p-3 text-[11px] text-slate-600">Cloud Firestore rules reject any queries where document path or auth token does not match authenticated user UID.</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-medium">Hardcoded Secrets / Source Exposure</td>
                      <td className="p-3"><span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold text-[10px]">HIGH</span></td>
                      <td className="p-3 text-[11px] text-slate-600">Dynamic runtime resolution via Google Cloud Secret Manager with IAM Least Privilege service account.</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-medium">Browser API Key Snooping & Tampering</td>
                      <td className="p-3"><span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold text-[10px]">HIGH</span></td>
                      <td className="p-3 text-[11px] text-slate-600">Strict reverse proxy pattern: all Gemini API calls occur behind backend endpoints (/api/chat, /api/summarize).</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-medium">Prompt Injection & Malicious Control Tokens</td>
                      <td className="p-3"><span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px]">MEDIUM</span></td>
                      <td className="p-3 text-[11px] text-slate-600">Server-side input sanitization stripping control bytes and enforcing structured JSON extraction schemas.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: SECRET MANAGER PIPELINE */}
          {activeTab === 'secret_manager' && (
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-indigo-50/70 border border-indigo-100 space-y-3">
                <div className="flex items-center space-x-2 text-indigo-900 font-bold text-sm">
                  <Lock className="w-4 h-4 text-indigo-600" />
                  <span>Google Cloud Secret Manager Architecture</span>
                </div>
                <p className="text-slate-700 leading-relaxed text-xs">
                  The application adheres strictly to the <strong>Secret Zero Defense</strong> architecture. No private API keys or environment credentials are bundled into the web client or stored in public git repositories.
                </p>
              </div>

              {/* Visual Workflow Diagram */}
              <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-4">
                <p className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Runtime Secret Resolution Flow
                </p>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-center">
                  
                  {/* Step 1 */}
                  <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-1.5">
                    <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto text-xs font-bold">1</div>
                    <p className="font-bold text-slate-100 text-xs">GCP Secret Manager</p>
                    <p className="text-[10px] text-slate-400">Stores encrypted GEMINI_API_KEY with version control & audit logs</p>
                  </div>

                  {/* Step 2 */}
                  <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-1.5">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto text-xs font-bold">2</div>
                    <p className="font-bold text-slate-100 text-xs">IAM Service Account</p>
                    <p className="text-[10px] text-slate-400">Provides Least-Privilege secretAccessor role to Cloud Run</p>
                  </div>

                  {/* Step 3 */}
                  <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-1.5">
                    <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center mx-auto text-xs font-bold">3</div>
                    <p className="font-bold text-slate-100 text-xs">Backend Proxy Server</p>
                    <p className="text-[10px] text-slate-400">Resolves secret in memory during startup; proxies API requests</p>
                  </div>

                  {/* Step 4 */}
                  <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-1.5">
                    <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center mx-auto text-xs font-bold">4</div>
                    <p className="font-bold text-slate-100 text-xs">Browser Client</p>
                    <p className="text-[10px] text-slate-400">Receives only sanitized inference responses (Zero Secret Exposure)</p>
                  </div>

                </div>
              </div>

              {/* Key Guarantees */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="flex items-center space-x-2 text-emerald-700 font-semibold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Dynamic In-Memory Caching</span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Secrets are cached safely in process memory to minimize GCP API latencies while preventing disk persistence.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="flex items-center space-x-2 text-emerald-700 font-semibold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Zero Client Exposure</span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Vite client-side bundles are completely devoid of API keys or administrative GCP credentials.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: FIRESTORE ISOLATION */}
          {activeTab === 'isolation' && (
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-blue-50/70 border border-blue-100 space-y-3">
                <div className="flex items-center space-x-2 text-blue-900 font-bold text-sm">
                  <Database className="w-4 h-4 text-blue-600" />
                  <span>Strict Multi-Tenant Subcollection Partitioning</span>
                </div>
                <p className="text-slate-700 leading-relaxed text-xs">
                  All user data is partitioned under individual subcollections scoped to the user's authenticated UID: <code className="bg-blue-100/80 text-blue-900 px-1.5 py-0.5 rounded font-mono text-[11px]">/users/{'{userId}'}/journals</code>, <code className="bg-blue-100/80 text-blue-900 px-1.5 py-0.5 rounded font-mono text-[11px]">/users/{'{userId}'}/action_items</code>, and <code className="bg-blue-100/80 text-blue-900 px-1.5 py-0.5 rounded font-mono text-[11px]">/users/{'{userId}'}/insights</code>.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <p className="font-bold text-slate-900 text-xs">Authentication Verification</p>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    Every incoming document request is evaluated against Cloud Firestore Security Rules. Unauthenticated requests are rejected immediately at the Google Cloud edge network.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <p className="font-bold text-slate-900 text-xs">Ownership Enforcement</p>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    Reads, writes, updates, and deletes are permitted if and only if <code className="text-indigo-700 font-mono text-[11px]">request.auth.uid == userId</code>, preventing IDOR and unauthorized cross-account reads.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: INFRASTRUCTURE */}
          {activeTab === 'infrastructure' && (
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-purple-50/70 border border-purple-100 space-y-3">
                <div className="flex items-center space-x-2 text-purple-900 font-bold text-sm">
                  <Cloud className="w-4 h-4 text-purple-600" />
                  <span>Google Cloud Run Serverless Architecture</span>
                </div>
                <p className="text-slate-700 leading-relaxed text-xs">
                  The application is deployed as a stateless container on Google Cloud Run with automatic scaling, TLS encryption, and secure container sandboxing.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <p className="font-bold text-slate-900 text-xs">Container Sandboxing</p>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Runs on gVisor-isolated micro-VM containers with no shared instance state.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <p className="font-bold text-slate-900 text-xs">Automatic TLS & HTTPS</p>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    All transport layers are encrypted with TLS 1.3 certificates provisioned by Google.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <p className="font-bold text-slate-900 text-xs">Ingress Control</p>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Single reverse-proxied port 3000 mapping for clean routing and rate limiting.
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Deployed to Cloud Firestore with zero-trust data isolation</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition shadow-2xs"
          >
            Close Spec
          </button>
        </div>

      </div>
    </div>
  );
};

