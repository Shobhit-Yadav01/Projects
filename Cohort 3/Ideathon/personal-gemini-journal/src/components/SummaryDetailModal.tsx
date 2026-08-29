import React from 'react';
import {
  Sparkles,
  CheckCircle2,
  Calendar,
  Tag,
  Smile,
  Target,
  ArrowRight,
  ListTodo,
  X,
  HelpCircle
} from 'lucide-react';
import { JournalEntry } from '../types';

interface SummaryDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  entry: JournalEntry | null;
  onReopenJournal: (entry: JournalEntry) => void;
}

export const SummaryDetailModal: React.FC<SummaryDetailModalProps> = ({
  isOpen,
  onClose,
  entry,
  onReopenJournal
}) => {
  if (!isOpen || !entry) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 my-8 relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="space-y-1 pr-8">
          <div className="flex items-center space-x-2 text-xs text-slate-500">
            <span className="px-2 py-0.5 rounded bg-indigo-50 border border-indigo-100 text-indigo-700 font-semibold text-[10px]">
              Session Summary
            </span>
            <span>•</span>
            <div className="flex items-center space-x-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>{new Date(entry.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </div>
            <span>•</span>
            <div className="flex items-center space-x-1">
              <Smile className="w-3.5 h-3.5 text-amber-500" />
              <span>{entry.mood}</span>
            </div>
          </div>
          <h2 className="text-lg font-bold text-slate-900">{entry.title}</h2>
        </div>

        {/* Executive Synthesis Summary */}
        <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-100 space-y-1.5">
          <span className="text-[11px] font-bold text-indigo-900 uppercase tracking-wider block">
            Executive Summary
          </span>
          <p className="text-xs text-indigo-950 font-medium leading-relaxed">
            {entry.summary || entry.content.slice(0, 200)}
          </p>
        </div>

        {/* 2-Column Details: Themes & Mood */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
            <span className="font-bold text-slate-700 text-[11px] flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-indigo-600" /> Key Topics & Themes
            </span>
            <div className="flex flex-wrap gap-1">
              {(entry.keyThemes || entry.tags || []).map((t, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700 text-[10px] font-semibold"
                >
                  #{t}
                </span>
              ))}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
            <span className="font-bold text-slate-700 text-[11px] flex items-center gap-1">
              <Smile className="w-3.5 h-3.5 text-amber-500" /> Emotional Trajectory
            </span>
            <p className="text-[11px] text-slate-600">
              {entry.moodAnalysis || `User reflected with a ${entry.mood} state of mind.`}
            </p>
          </div>

        </div>

        {/* Conversation Dialogue Excerpt */}
        {entry.messages && entry.messages.length > 0 && (
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              Brainstorming Dialogue ({entry.messages.length} exchanges)
            </span>
            <div className="max-h-40 overflow-y-auto space-y-2 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs">
              {entry.messages.slice(-3).map((m, i) => (
                <div key={i} className="space-y-0.5">
                  <span className={`text-[10px] font-bold uppercase tracking-wider block ${
                    m.role === 'user' ? 'text-indigo-600' : 'text-slate-500'
                  }`}>
                    {m.role === 'user' ? 'You' : 'Gemini'}
                  </span>
                  <p className="text-slate-700 text-[11px] whitespace-pre-wrap">{m.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold"
          >
            Close
          </button>
          <button
            onClick={() => {
              onClose();
              onReopenJournal(entry);
            }}
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs flex items-center space-x-1.5"
          >
            <span>Reopen in Workspace</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
};
