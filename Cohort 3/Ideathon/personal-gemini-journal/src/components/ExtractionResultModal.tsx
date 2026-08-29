import React from 'react';
import {
  Sparkles,
  CheckCircle2,
  CheckSquare,
  ArrowRight,
  Tag,
  Calendar,
  Layers,
  Smile
} from 'lucide-react';
import { ExtractionResult } from '../types';

interface ExtractionResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: ExtractionResult | null;
  journalTitle: string;
  onGoToActions: () => void;
}

export const ExtractionResultModal: React.FC<ExtractionResultModalProps> = ({
  isOpen,
  onClose,
  result,
  journalTitle,
  onGoToActions
}) => {
  if (!isOpen || !result) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 my-8">
        
        {/* Header with celebratory badge */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md">
            <Sparkles className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Action Items & Insights Extracted!
            </h3>
            <p className="text-xs text-slate-500">
              Gemini analyzed your session and saved structured tasks to Cloud Firestore.
            </p>
          </div>
        </div>

        {/* Executive Summary Box */}
        <div className="bg-indigo-50/70 border border-indigo-100 rounded-xl p-3.5 space-y-1.5">
          <span className="text-[11px] font-bold text-indigo-900 uppercase tracking-wider block">
            Executive Synthesis
          </span>
          <p className="text-xs text-indigo-950 leading-relaxed font-medium">
            {result.summary}
          </p>
        </div>

        {/* Key Themes & Mood */}
        <div className="flex items-center justify-between text-xs py-1">
          <div className="flex items-center space-x-1.5 flex-wrap">
            <span className="text-slate-400 font-medium text-[11px]">Themes:</span>
            {result.keyThemes.map(th => (
              <span
                key={th}
                className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-semibold"
              >
                #{th}
              </span>
            ))}
          </div>
          <div className="flex items-center space-x-1 text-slate-600 text-[11px]">
            <Smile className="w-3.5 h-3.5 text-amber-500" />
            <span>{result.moodAnalysis}</span>
          </div>
        </div>

        {/* Extracted Tasks List */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
            <span className="flex items-center gap-1.5">
              <CheckSquare className="w-4 h-4 text-indigo-600" />
              Extracted Action Items ({result.actionItems.length})
            </span>
          </div>

          <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
            {result.actionItems.map((item, idx) => (
              <div
                key={idx}
                className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900">{item.title}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                    item.priority === 'High'
                      ? 'bg-rose-100 text-rose-800'
                      : item.priority === 'Medium'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {item.priority}
                  </span>
                </div>
                {item.description && (
                  <p className="text-[11px] text-slate-500">{item.description}</p>
                )}
                <div className="flex items-center space-x-2 text-[10px] text-slate-400 pt-0.5">
                  <span className="bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded font-medium">
                    {item.category}
                  </span>
                  {item.suggestedDeadline && (
                    <span>Due: {item.suggestedDeadline}</span>
                  )}
                </div>
              </div>
            ))}

            {result.actionItems.length === 0 && (
              <p className="text-xs text-slate-400 text-center py-4">
                No explicit action items detected in this journal entry.
              </p>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold"
          >
            Stay in Journal
          </button>
          <button
            onClick={() => {
              onClose();
              onGoToActions();
            }}
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm flex items-center space-x-1.5"
          >
            <span>Open Action Items Hub</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
};
