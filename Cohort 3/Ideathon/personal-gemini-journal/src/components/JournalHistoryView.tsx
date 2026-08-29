import React, { useState } from 'react';
import {
  History,
  Search,
  Calendar,
  Smile,
  Tag,
  Trash2,
  BookOpen,
  Sparkles,
  MessageSquare,
  CheckSquare,
  ArrowUpRight,
  Filter
} from 'lucide-react';
import { JournalEntry, MoodType } from '../types';

interface JournalHistoryViewProps {
  entries: JournalEntry[];
  onDeleteEntry: (entryId: string) => Promise<void>;
  onSelectEntry: (entry: JournalEntry) => void;
}

export const JournalHistoryView: React.FC<JournalHistoryViewProps> = ({
  entries,
  onDeleteEntry,
  onSelectEntry
}) => {
  const [search, setSearch] = useState('');
  const [selectedMood, setSelectedMood] = useState<string>('All');
  const [activeModalEntry, setActiveModalEntry] = useState<JournalEntry | null>(null);

  const filteredEntries = entries.filter(e => {
    const matchSearch =
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.content.toLowerCase().includes(search.toLowerCase()) ||
      (e.summary && e.summary.toLowerCase().includes(search.toLowerCase())) ||
      (e.tags && e.tags.some(t => t.toLowerCase().includes(search.toLowerCase())));

    const matchMood = selectedMood === 'All' || e.mood === selectedMood;

    return matchSearch && matchMood;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <History className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">
              Journal Archive & Conversation Logs
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Browse and review past reflections, AI brainstorming dialogues, and summaries.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search past entries or themes..."
            className="w-full pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Grid of Journal Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredEntries.map(entry => (
          <div
            key={entry.id}
            className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs hover:shadow-md transition flex flex-col justify-between group space-y-4"
          >
            <div className="space-y-3">
              {/* Top meta */}
              <div className="flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center space-x-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{new Date(entry.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-medium">
                  {entry.mood}
                </span>
              </div>

              {/* Title */}
              <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition line-clamp-1">
                {entry.title}
              </h3>

              {/* AI Summary Highlight */}
              {entry.summary ? (
                <div className="bg-indigo-50/50 border border-indigo-100 rounded-lg p-2.5 text-xs text-indigo-900 line-clamp-3">
                  <div className="flex items-center space-x-1 text-indigo-600 font-semibold mb-1 text-[11px]">
                    <Sparkles className="w-3 h-3" />
                    <span>Gemini Synthesis</span>
                  </div>
                  {entry.summary}
                </div>
              ) : (
                <p className="text-xs text-slate-500 line-clamp-3">
                  {entry.content || 'Multi-turn conversation session.'}
                </p>
              )}

              {/* Key themes */}
              {entry.keyThemes && entry.keyThemes.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {entry.keyThemes.map(th => (
                    <span
                      key={th}
                      className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium"
                    >
                      #{th}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-3 text-slate-400 text-[11px]">
                <span className="flex items-center gap-1">
                  <MessageSquare className="w-3 h-3" />
                  {entry.messages ? entry.messages.length : 0} msgs
                </span>
                {entry.actionItemsCount !== undefined && entry.actionItemsCount > 0 && (
                  <span className="flex items-center gap-1 text-indigo-600 font-semibold">
                    <CheckSquare className="w-3 h-3" />
                    {entry.actionItemsCount} actions
                  </span>
                )}
              </div>

              <div className="flex items-center space-x-1">
                <button
                  onClick={() => setActiveModalEntry(entry)}
                  className="px-2.5 py-1 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold flex items-center gap-1 transition"
                >
                  <span>Review</span>
                  <ArrowUpRight className="w-3 h-3" />
                </button>

                <button
                  onClick={() => onDeleteEntry(entry.id)}
                  title="Delete Entry"
                  className="p-1 text-slate-300 hover:text-rose-600 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </div>
        ))}
      </div>

      {filteredEntries.length === 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400 space-y-2">
          <BookOpen className="w-8 h-8 mx-auto text-slate-300" />
          <p className="text-sm font-semibold text-slate-700">No Journal Entries Found</p>
          <p className="text-xs">Your completed reflective sessions will be securely isolated in Cloud Firestore.</p>
        </div>
      )}

      {/* DETAIL MODAL */}
      {activeModalEntry && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[85vh] flex flex-col space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[11px] text-slate-400">
                  {new Date(activeModalEntry.createdAt).toLocaleString()} • Mood: {activeModalEntry.mood}
                </span>
                <h3 className="text-lg font-bold text-slate-900">
                  {activeModalEntry.title}
                </h3>
              </div>
              <button
                onClick={() => setActiveModalEntry(null)}
                className="text-slate-400 hover:text-slate-600 text-sm p-1"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs sm:text-sm text-slate-800">
              
              {/* Summary */}
              {activeModalEntry.summary && (
                <div className="bg-indigo-50/70 border border-indigo-100 rounded-xl p-3.5">
                  <h4 className="text-xs font-bold text-indigo-900 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    AI Executive Summary
                  </h4>
                  <p className="text-xs text-indigo-950 leading-relaxed">
                    {activeModalEntry.summary}
                  </p>
                </div>
              )}

              {/* Scratchpad content */}
              {activeModalEntry.content && (
                <div>
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    Journal Scratchpad Notes:
                  </h4>
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 whitespace-pre-wrap font-sans text-xs leading-relaxed">
                    {activeModalEntry.content}
                  </div>
                </div>
              )}

              {/* Transcript */}
              {activeModalEntry.messages && activeModalEntry.messages.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    AI Conversation Log:
                  </h4>
                  <div className="space-y-2.5">
                    {activeModalEntry.messages.map(m => (
                      <div
                        key={m.id}
                        className={`p-3 rounded-lg border text-xs leading-relaxed ${
                          m.role === 'user'
                            ? 'bg-slate-50 border-slate-200'
                            : 'bg-indigo-50/40 border-indigo-100 text-slate-800'
                        }`}
                      >
                        <span className="font-bold block mb-0.5 text-indigo-900">
                          {m.role === 'user' ? 'You' : 'Gemini Companion'}
                        </span>
                        <div className="whitespace-pre-wrap">{m.content}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setActiveModalEntry(null)}
                className="px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
