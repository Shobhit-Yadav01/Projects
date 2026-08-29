import React, { useState } from 'react';
import {
  BrainCircuit,
  Sparkles,
  RefreshCw,
  Calendar,
  CheckCircle2,
  Clock,
  TrendingUp,
  HelpCircle,
  ArrowRight,
  Target,
  Lightbulb,
  AlertTriangle,
  History,
  Layers,
  Award
} from 'lucide-react';
import {
  JournalEntry,
  ExtractedActionItem,
  WeeklyInsight,
  UserSecurityProfile
} from '../types';
import { generateWeeklyInsightsWithGemini } from '../lib/gemini-client';
import { saveWeeklyInsight } from '../lib/firebase';

interface WeeklyInsightsViewProps {
  user: UserSecurityProfile | null;
  entries: JournalEntry[];
  actionItems: ExtractedActionItem[];
  savedInsights: WeeklyInsight[];
  onOpenAuth: () => void;
  onNavigateToJournal: (journalId?: string) => void;
}

export const WeeklyInsightsView: React.FC<WeeklyInsightsViewProps> = ({
  user,
  entries,
  actionItems,
  savedInsights,
  onOpenAuth,
  onNavigateToJournal
}) => {
  const [selectedInsightIndex, setSelectedInsightIndex] = useState<number>(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Fallback demo/active insight if none generated yet
  const currentInsight: WeeklyInsight | null =
    savedInsights.length > 0 ? savedInsights[selectedInsightIndex] || savedInsights[0] : null;

  const completedCount = actionItems.filter(a => a.status === 'Completed').length;
  const totalActionCount = actionItems.length;
  const completionRate = totalActionCount > 0 ? Math.round((completedCount / totalActionCount) * 100) : 0;

  const handleGenerate = async () => {
    if (!user) {
      onOpenAuth();
      return;
    }
    if (entries.length === 0) {
      setErrorMsg('Please write at least one journal entry before generating weekly reflections.');
      return;
    }

    setIsGenerating(true);
    setErrorMsg('');
    try {
      const generated = await generateWeeklyInsightsWithGemini(entries, actionItems, 'Week of ' + new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' }));
      generated.userId = user.uid;
      await saveWeeklyInsight(generated);
      setSelectedInsightIndex(0);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to generate weekly insights. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Top Banner Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center text-white shadow-xs">
              <BrainCircuit className="w-4 h-4 text-amber-200" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">
              Weekly Reflection & Insight Dashboard
            </h2>
          </div>
          <p className="text-xs text-slate-500 max-w-2xl">
            Synthesizes your private Firestore journal summaries into actionable longitudinal patterns, goal momentum, and strategic reflection prompts for the week ahead.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2 shrink-0">
          <button
            id="btn-generate-weekly-insight"
            onClick={handleGenerate}
            disabled={isGenerating}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition flex items-center space-x-2 disabled:opacity-50"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : 'text-amber-300'}`} />
            <span>{isGenerating ? 'Synthesizing Journal Archive...' : 'Generate New Insight'}</span>
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center justify-between">
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg('')} className="font-bold underline text-[11px]">Dismiss</button>
        </div>
      )}

      {/* Historical Selector if multiple insights exist */}
      {savedInsights.length > 1 && (
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs">
          <span className="text-slate-400 font-semibold flex items-center gap-1 shrink-0 text-[11px]">
            <History className="w-3.5 h-3.5" /> Archive Reports:
          </span>
          {savedInsights.map((ins, idx) => (
            <button
              key={ins.id}
              onClick={() => setSelectedInsightIndex(idx)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition shrink-0 ${
                selectedInsightIndex === idx
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {ins.weekLabel} ({new Date(ins.createdAt).toLocaleDateString()})
            </button>
          ))}
        </div>
      )}

      {/* Main Content View */}
      {currentInsight ? (
        <div className="space-y-6">
          
          {/* Executive Overview Box */}
          <div className="bg-gradient-to-br from-indigo-50/80 via-white to-slate-50 border border-indigo-100 rounded-2xl p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-indigo-100/60 pb-3">
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 rounded-md bg-indigo-100 text-indigo-800 text-[11px] font-bold">
                  {currentInsight.weekLabel}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  {currentInsight.dateRange} • {currentInsight.totalJournalsAnalyzed} Sessions Analyzed
                </span>
              </div>
              <span className="text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Isolated User Scope Verified
              </span>
            </div>

            {/* Narrative: What patterns appeared in my thoughts this week? */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-indigo-900 uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-indigo-600" />
                What patterns appeared in my thoughts this week?
              </h3>
              <p className="text-sm text-slate-800 leading-relaxed font-normal whitespace-pre-line bg-white/70 p-4 rounded-xl border border-indigo-50">
                {currentInsight.reflectionPatterns}
              </p>
            </div>

            {/* Overarching Themes Pills */}
            <div className="flex items-center space-x-1.5 flex-wrap pt-1">
              <span className="text-xs font-bold text-slate-500 mr-1">Common Themes:</span>
              {currentInsight.commonThemes.map((th, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-800 text-xs font-semibold shadow-2xs"
                >
                  #{th}
                </span>
              ))}
            </div>
          </div>

          {/* 3-Column Bento Grid: Recurring Topics, Goals, Progress */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Section 1: Recurring Topics */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-indigo-600" />
                  Recurring Topics
                </h3>
                <span className="text-[11px] text-slate-400 font-semibold">Frequency</span>
              </div>
              <p className="text-xs text-slate-500">
                Concepts and subjects highlighted most often throughout your sessions.
              </p>

              <div className="space-y-2.5 pt-1">
                {currentInsight.recurringTopics.map((rt, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-900">{rt.topic}</span>
                      <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 font-bold text-[10px]">
                        {rt.count}x noted
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600">{rt.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 2: Goals & Aspirations */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <Target className="w-4 h-4 text-amber-600" />
                  Frequently Discussed Goals
                </h3>
                <span className="text-[11px] text-slate-400 font-semibold">Status</span>
              </div>
              <p className="text-xs text-slate-500">
                Key personal and professional milestones tracked across reflections.
              </p>

              <div className="space-y-2.5 pt-1">
                {currentInsight.frequentlyDiscussedGoals.map((g, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-900 line-clamp-1">{g.goal}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        g.status === 'Achieved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : g.status === 'In Progress'
                          ? 'bg-indigo-100 text-indigo-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {g.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600">{g.context}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 3: Progress & Execution Velocity */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-emerald-600" />
                    Action Items Progress
                  </h3>
                  <span className="text-[11px] font-bold text-emerald-600">
                    {completionRate}% rate
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Completed vs pending action items extracted by Gemini.
                </p>

                {/* Progress bar */}
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${completionRate}%` }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 text-center text-xs">
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                    <span className="text-slate-500 text-[10px] font-semibold block">Completed</span>
                    <span className="text-lg font-black text-emerald-700">{completedCount}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-500 text-[10px] font-semibold block">Pending</span>
                    <span className="text-lg font-black text-slate-800">{totalActionCount - completedCount}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 text-center">
                <button
                  onClick={() => onNavigateToJournal()}
                  className="text-xs text-indigo-600 font-semibold hover:underline inline-flex items-center space-x-1"
                >
                  <span>Start New Reflective Session</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </div>

          {/* Bottom Grid: Unresolved Topics & Next Week Focus */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Unresolved Topics */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Unresolved Topics & Dilemmas
              </h3>
              <p className="text-xs text-slate-500">
                Friction points or recurring dilemmas that surfaced without resolution.
              </p>

              <div className="space-y-2.5 pt-1">
                {currentInsight.unresolvedTopics.map((un, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-100 space-y-1.5">
                    <span className="font-bold text-slate-900 text-xs block">{un.topic}</span>
                    <p className="text-[11px] text-slate-600">{un.context}</p>
                    <div className="pt-1 text-[11px] text-amber-900 font-medium">
                      💡 Suggested resolution: {un.suggestedResolution}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Next Week: Focus Areas & Reflection Prompts */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Lightbulb className="w-4 h-4 text-indigo-600" />
                Next Week: Focus Areas & Prompts
              </h3>
              <p className="text-xs text-slate-500">
                Tailored prompts to guide your upcoming sessions based on this week's progress.
              </p>

              {/* Suggested Focus Areas */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Suggested Focus Areas
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {currentInsight.suggestedFocusAreas.map((f, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-800 text-xs font-medium"
                    >
                      {f}
                    </span>
                  ))}
                </div>
              </div>

              {/* Next Week Prompts */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Recommended Reflection Questions
                </span>
                <div className="space-y-2">
                  {currentInsight.nextWeekPrompts.map((p, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 italic flex items-start space-x-2"
                    >
                      <HelpCircle className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                      <span>"{p}"</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>

        </div>
      ) : (
        /* Empty State */
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-2xs space-y-4 max-w-lg mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mx-auto">
            <BrainCircuit className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">
            No Weekly Reflection Generated Yet
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Click <strong>Generate New Insight</strong> above to analyze your Firestore journal entries, extract recurring thought patterns, and map out your execution velocity.
          </p>
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-xs transition"
          >
            {isGenerating ? 'Synthesizing...' : 'Generate My Weekly Reflection'}
          </button>
        </div>
      )}

    </div>
  );
};
