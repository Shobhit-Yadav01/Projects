import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Smile,
  CheckCircle2,
  Calendar,
  Sparkles,
  Zap,
  Activity,
  Layers
} from 'lucide-react';
import { JournalEntry, ExtractedActionItem, MoodType } from '../types';

interface AnalyticsViewProps {
  entries: JournalEntry[];
  actionItems: ExtractedActionItem[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  entries,
  actionItems
}) => {
  const totalEntries = entries.length;
  const totalTasks = actionItems.length;
  const completedTasks = actionItems.filter(i => i.status === 'Completed').length;
  const pendingTasks = actionItems.filter(i => i.status === 'Pending').length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Mood counting
  const moodCounts: Record<string, number> = {};
  entries.forEach(e => {
    moodCounts[e.mood] = (moodCounts[e.mood] || 0) + 1;
  });

  // Category counting
  const categoryCounts: Record<string, number> = {};
  actionItems.forEach(a => {
    categoryCounts[a.category] = (categoryCounts[a.category] || 0) + 1;
  });

  // Top themes
  const themeCounts: Record<string, number> = {};
  entries.forEach(e => {
    if (e.keyThemes) {
      e.keyThemes.forEach(th => {
        themeCounts[th] = (themeCounts[th] || 0) + 1;
      });
    }
  });
  const sortedThemes = Object.entries(themeCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <BarChart3 className="w-4 h-4" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">
            Reflection & Action Intelligence Insights
          </h2>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Longitudinal patterns, mood trajectory, and execution velocity across your journaling history.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Total Reflections
          </span>
          <div className="flex items-baseline space-x-2 mt-2">
            <span className="text-2xl font-black text-slate-900">{totalEntries}</span>
            <span className="text-xs text-slate-400">Sessions</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Extracted Goals & Tasks
          </span>
          <div className="flex items-baseline space-x-2 mt-2">
            <span className="text-2xl font-black text-indigo-600">{totalTasks}</span>
            <span className="text-xs text-slate-400">Action items</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Completed Velocity
          </span>
          <div className="flex items-baseline space-x-2 mt-2">
            <span className="text-2xl font-black text-emerald-600">{completedTasks}</span>
            <span className="text-xs text-emerald-600 font-semibold">({completionRate}%)</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Active Backlog
          </span>
          <div className="flex items-baseline space-x-2 mt-2">
            <span className="text-2xl font-black text-amber-600">{pendingTasks}</span>
            <span className="text-xs text-slate-400">Pending</span>
          </div>
        </div>

      </div>

      {/* Charts / Distribution Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Mood Distribution */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Smile className="w-4 h-4 text-amber-500" />
              Emotional & Energy Distribution
            </h3>
            <span className="text-xs text-slate-400">{totalEntries} entries</span>
          </div>

          <div className="space-y-2.5">
            {Object.keys(moodCounts).length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No mood data recorded yet.</p>
            ) : (
              Object.entries(moodCounts).map(([mood, count]) => {
                const pct = Math.round((count / totalEntries) * 100);
                return (
                  <div key={mood} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-700">{mood}</span>
                      <span className="text-slate-400">{count} ({pct}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Task Categories Breakdown */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-600" />
              Action Item Category Focus
            </h3>
            <span className="text-xs text-slate-400">{totalTasks} tasks</span>
          </div>

          <div className="space-y-2.5">
            {Object.keys(categoryCounts).length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No action items categorized yet.</p>
            ) : (
              Object.entries(categoryCounts).map(([cat, count]) => {
                const pct = totalTasks > 0 ? Math.round((count / totalTasks) * 100) : 0;
                return (
                  <div key={cat} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-700">{cat}</span>
                      <span className="text-slate-400">{count} ({pct}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-emerald-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

      {/* Top Synthesized Themes Cloud */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-600" />
          Recurring Reflection Themes
        </h3>
        <p className="text-xs text-slate-500">
          Core recurring topics extracted automatically by Gemini across all brainstorming sessions.
        </p>

        <div className="flex flex-wrap gap-2 pt-2">
          {sortedThemes.length === 0 ? (
            <p className="text-xs text-slate-400">Themes will appear as you complete journal entries.</p>
          ) : (
            sortedThemes.map(([theme, count]) => (
              <div
                key={theme}
                className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-indigo-50 text-slate-800 hover:text-indigo-800 text-xs font-semibold border border-slate-200 transition flex items-center gap-1.5"
              >
                <span>#{theme}</span>
                <span className="px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-600 text-[10px]">
                  {count}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
};
