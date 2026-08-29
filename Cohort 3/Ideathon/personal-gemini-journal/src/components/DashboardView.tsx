import React, { useState } from 'react';
import {
  Sparkles,
  BookOpen,
  BrainCircuit,
  CheckCircle2,
  Calendar,
  Search,
  Plus,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Target,
  Smile,
  ListTodo,
  Lock,
  Compass,
  FileText
} from 'lucide-react';
import {
  JournalEntry,
  ExtractedActionItem,
  WeeklyInsight,
  UserSecurityProfile
} from '../types';

interface DashboardViewProps {
  user: UserSecurityProfile | null;
  journals: JournalEntry[];
  actionItems: ExtractedActionItem[];
  weeklyInsights: WeeklyInsight[];
  onStartNewJournal: () => void;
  onSelectJournal: (entry: JournalEntry) => void;
  onOpenSummary: (entry: JournalEntry) => void;
  onNavigateToTab: (tab: 'journal' | 'actions' | 'history' | 'weekly' | 'security') => void;
  onOpenAuth: () => void;
  onLogout: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  user,
  journals,
  actionItems,
  weeklyInsights,
  onStartNewJournal,
  onSelectJournal,
  onOpenSummary,
  onNavigateToTab,
  onOpenAuth,
  onLogout
}) => {
  const [search, setSearch] = useState('');

  const completedActions = actionItems.filter(a => a.status === 'Completed').length;
  const totalActions = actionItems.length;
  const completionRate = totalActions > 0 ? Math.round((completedActions / totalActions) * 100) : 0;

  const latestInsight = weeklyInsights.length > 0 ? weeklyInsights[0] : null;

  const filteredJournals = journals.filter(j =>
    j.title.toLowerCase().includes(search.toLowerCase()) ||
    j.content.toLowerCase().includes(search.toLowerCase()) ||
    (j.summary && j.summary.toLowerCase().includes(search.toLowerCase())) ||
    (j.tags && j.tags.some(t => t.toLowerCase().includes(search.toLowerCase())))
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      
      {/* Welcome Banner */}
      <section className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-indigo-200 text-xs font-semibold backdrop-blur-md">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>{user?.email ? user.email : user?.isAnonymous ? 'Guest Exploration Session' : 'Protected Account'}</span>
              <span className="text-white/40">•</span>
              <span className="text-emerald-400 font-bold">Cloud Firestore Isolated</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Welcome back{user?.displayName ? `, ${user.displayName}` : ''}.
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              Your private sanctuary for deep reflection, executive planning, and multi-turn brainstorming with Gemini.
            </p>

            <div className="flex items-center space-x-2 text-xs text-slate-400 pt-1">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Your journal is private and protected by Firebase Authentication.</span>
            </div>
          </div>

          {/* Top Quick Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
            <button
              id="btn-dashboard-new-journal"
              onClick={onStartNewJournal}
              className="px-5 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold shadow-lg shadow-indigo-900/50 transition flex items-center justify-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>New Journal Session</span>
            </button>

            <button
              onClick={() => onNavigateToTab('weekly')}
              className="px-4 py-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white text-xs font-semibold backdrop-blur-md transition flex items-center justify-center space-x-2"
            >
              <BrainCircuit className="w-4 h-4 text-amber-300" />
              <span>Weekly Insights</span>
            </button>
          </div>
        </div>
      </section>

      {/* KPI Stats Strip */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Entries</span>
            <BookOpen className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="flex items-baseline space-x-2 mt-2">
            <span className="text-2xl font-black text-slate-900">{journals.length}</span>
            <span className="text-xs text-slate-400">Sessions</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Action Items</span>
            <ListTodo className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="flex items-baseline space-x-2 mt-2">
            <span className="text-2xl font-black text-indigo-600">{totalActions}</span>
            <span className="text-xs text-slate-400">{completedActions} done</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Execution Velocity</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline space-x-2 mt-2">
            <span className="text-2xl font-black text-emerald-600">{completionRate}%</span>
            <span className="text-xs text-slate-400">completion rate</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Security Boundary</span>
            <Lock className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="mt-2 text-xs font-bold text-slate-800 flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>UID Isolation Active</span>
          </div>
        </div>

      </section>

      {/* Original Feature Highlight: Weekly Reflection & Insight Dashboard Section */}
      <section className="bg-gradient-to-br from-indigo-50/90 via-white to-amber-50/50 rounded-2xl border border-indigo-100 p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-indigo-100/60 pb-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center text-white shadow-xs">
              <BrainCircuit className="w-4 h-4 text-amber-200" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Weekly Reflection & Insight Dashboard
              </h2>
              <p className="text-xs text-slate-500">
                Original Feature: Synthesizes your private journal summaries into actionable thought patterns.
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigateToTab('weekly')}
            className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition flex items-center justify-center space-x-1.5 shadow-2xs"
          >
            <span>Open Full Dashboard</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {latestInsight ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
            <div className="md:col-span-2 bg-white p-4 rounded-xl border border-indigo-50 space-y-2">
              <span className="text-[11px] font-bold text-indigo-900 uppercase tracking-wider block">
                Pattern Highlight • {latestInsight.weekLabel}
              </span>
              <p className="text-xs text-slate-700 leading-relaxed line-clamp-3">
                {latestInsight.reflectionPatterns}
              </p>
              <div className="flex items-center space-x-1.5 flex-wrap pt-1">
                {latestInsight.commonThemes.slice(0, 4).map((th, idx) => (
                  <span key={idx} className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 text-[10px] font-semibold">
                    #{th}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-indigo-50 space-y-2 flex flex-col justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Focus for Next Week
              </span>
              <div className="space-y-1.5">
                {latestInsight.suggestedFocusAreas.slice(0, 2).map((f, i) => (
                  <div key={i} className="text-xs text-slate-800 font-medium flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={() => onNavigateToTab('weekly')}
                className="text-[11px] text-indigo-600 font-bold hover:underline pt-2 text-left"
              >
                View full breakdown & reflection prompts →
              </button>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-white border border-indigo-50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center space-x-2 text-slate-600">
              <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
              <span>Ready to analyze your entries and generate your first weekly reflection synthesis.</span>
            </div>
            <button
              onClick={() => onNavigateToTab('weekly')}
              className="px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold transition text-xs shrink-0"
            >
              Generate Weekly Insights →
            </button>
          </div>
        )}
      </section>

      {/* Main 2-Column Split: Recent Journals & Recent Summaries */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Recent Journals List / Search */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-600" />
                Recent Journal Sessions
              </h2>
              <p className="text-xs text-slate-500">Your private encrypted dialogue sessions.</p>
            </div>

            {/* Search Input */}
            <div className="relative w-48 sm:w-60">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search entries..."
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 bg-white"
              />
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredJournals.slice(0, 4).map(journal => (
              <div
                key={journal.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs hover:shadow-md transition flex flex-col justify-between space-y-3 group"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="text-[11px]">
                      {new Date(journal.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-medium">
                      {journal.mood}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm group-hover:text-indigo-600 transition line-clamp-1">
                    {journal.title}
                  </h3>

                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {journal.summary || journal.content.slice(0, 140)}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <button
                    onClick={() => onOpenSummary(journal)}
                    className="text-slate-500 hover:text-indigo-600 font-medium text-[11px] flex items-center gap-1"
                  >
                    <FileText className="w-3 h-3" /> View Summary
                  </button>

                  <button
                    onClick={() => onSelectJournal(journal)}
                    className="px-2.5 py-1 rounded bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-semibold text-[11px] flex items-center gap-1 transition"
                  >
                    <span>Resume</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}

            {filteredJournals.length === 0 && (
              <div className="col-span-2 bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-2">
                <p className="text-xs text-slate-500">
                  {search ? 'No journals match your search filter.' : 'No journal entries yet. Start your first conversation with Gemini.'}
                </p>
                <button
                  onClick={onStartNewJournal}
                  className="px-3.5 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold inline-flex items-center gap-1 shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" /> Start First Session
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Recent Summaries Stream */}
        <div className="space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              Recent AI Summaries
            </h2>
            <p className="text-xs text-slate-500">Executive takeaways generated by Gemini.</p>
          </div>

          <div className="space-y-3">
            {journals.filter(j => j.summary).slice(0, 3).map(j => (
              <div
                key={j.id}
                onClick={() => onOpenSummary(j)}
                className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs hover:border-indigo-200 transition cursor-pointer space-y-2 group"
              >
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-slate-800 group-hover:text-indigo-600 transition line-clamp-1">
                    {j.title}
                  </span>
                  <span className="text-slate-400 text-[10px] shrink-0">
                    {new Date(j.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </span>
                </div>
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {j.summary}
                </p>
                <div className="flex items-center space-x-1.5 flex-wrap">
                  {(j.keyThemes || j.tags || []).slice(0, 2).map((t, idx) => (
                    <span key={idx} className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 text-[10px]">
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
            ))}

            {journals.filter(j => j.summary).length === 0 && (
              <div className="bg-white rounded-xl border border-slate-200 p-6 text-center text-xs text-slate-400">
                Complete a journal session to generate executive summaries.
              </div>
            )}
          </div>
        </div>

      </section>

    </div>
  );
};
