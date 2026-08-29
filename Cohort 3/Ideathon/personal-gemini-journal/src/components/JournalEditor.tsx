import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Wand2,
  ListTodo,
  Smile,
  Tag,
  Lightbulb,
  Compass,
  Zap,
  HeartHandshake,
  Cpu,
  RefreshCw,
  Copy,
  Check,
  Flame,
  Mic,
  MicOff,
  SlidersHorizontal,
  BookmarkPlus
} from 'lucide-react';
import {
  ChatMessage,
  JournalEntry,
  JournalMode,
  MoodType,
  UserSecurityProfile,
  ExtractionResult
} from '../types';
import { sendGeminiChatMessage, extractActionItemsWithGemini, fetchDynamicPrompts } from '../lib/gemini-client';

interface JournalEditorProps {
  user: UserSecurityProfile | null;
  initialEntry?: JournalEntry | null;
  allJournals?: JournalEntry[];
  onSaveEntry: (entry: JournalEntry, extraction?: ExtractionResult) => Promise<void>;
  onExtractionSuccess: (result: ExtractionResult, journalTitle: string) => void;
  onOpenAuth: () => void;
  onSelectJournal?: (entry: JournalEntry) => void;
  onNewSession?: () => void;
  onDeleteJournal?: (journalId: string) => void;
  onNavigateToDashboard?: () => void;
}

const JOURNAL_MODES: { id: JournalMode; label: string; icon: any; description: string; color: string }[] = [
  {
    id: 'socratic',
    label: 'Socratic Coach',
    icon: Compass,
    description: 'Probes deeper assumptions & asks clarifying questions',
    color: 'border-indigo-200 bg-indigo-50/70 text-indigo-800'
  },
  {
    id: 'brainstorm',
    label: 'Brainstormer',
    icon: Lightbulb,
    description: 'Generates creative angles, analogies & frameworks',
    color: 'border-amber-200 bg-amber-50/70 text-amber-800'
  },
  {
    id: 'mindful',
    label: 'Mindful Space',
    icon: HeartHandshake,
    description: 'Empathetic, calm reflection and emotional grounding',
    color: 'border-emerald-200 bg-emerald-50/70 text-emerald-800'
  },
  {
    id: 'action',
    label: 'Action Catalyst',
    icon: Zap,
    description: 'Turns fuzzy thoughts into high-leverage execution steps',
    color: 'border-blue-200 bg-blue-50/70 text-blue-800'
  },
  {
    id: 'problem_solver',
    label: 'Decision Matrix',
    icon: Cpu,
    description: 'Breaks complex dilemmas into trade-offs and mitigations',
    color: 'border-purple-200 bg-purple-50/70 text-purple-800'
  },
];

const MOODS: { type: MoodType; emoji: string; color: string }[] = [
  { type: 'Calm', emoji: '🌿', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
  { type: 'Focused', emoji: '🎯', color: 'bg-indigo-100 text-indigo-800 border-indigo-300' },
  { type: 'Joyful', emoji: '✨', color: 'bg-amber-100 text-amber-800 border-amber-300' },
  { type: 'Grateful', emoji: '🙏', color: 'bg-teal-100 text-teal-800 border-teal-300' },
  { type: 'Inspired', emoji: '💡', color: 'bg-sky-100 text-sky-800 border-sky-300' },
  { type: 'Anxious', emoji: '🌊', color: 'bg-rose-100 text-rose-800 border-rose-300' },
  { type: 'Fatigued', emoji: '🌙', color: 'bg-slate-100 text-slate-800 border-slate-300' },
  { type: 'Overwhelmed', emoji: '⚡', color: 'bg-orange-100 text-orange-800 border-orange-300' },
];

const TEMPLATES = [
  {
    name: 'Evening Reflection & Wins',
    content: `## Today's Highlights & Wins
- 

## What challenged me today?
- 

## One thing I am grateful for:
- 

## Core priority for tomorrow:
- `
  },
  {
    name: 'Productivity & Strategy Brainstorm',
    content: `## Core Problem or Opportunity:
- 

## Hidden assumptions or blockers:
- 

## 3 Radical ideas to test:
1. 
2. 
3. 

## Next immediate micro-step:
- `
  },
  {
    name: 'Emotional Decompression & Clarity',
    content: `## What is occupying my mind right now?
- 

## What is within my control vs outside my control?
- Within control: 
- Outside control: 

## How I want to feel by the end of this week:
- `
  }
];

export const JournalEditor: React.FC<JournalEditorProps> = ({
  user,
  initialEntry,
  allJournals = [],
  onSaveEntry,
  onExtractionSuccess,
  onOpenAuth,
  onSelectJournal,
  onNewSession,
  onDeleteJournal,
  onNavigateToDashboard
}) => {
  // Journal Canvas State
  const [currentEntryId, setCurrentEntryId] = useState<string | null>(initialEntry?.id || null);
  const [title, setTitle] = useState(initialEntry?.title || '');
  const [content, setContent] = useState(initialEntry?.content || '');
  const [mode, setMode] = useState<JournalMode>(initialEntry?.mode || 'socratic');
  const [mood, setMood] = useState<MoodType>(initialEntry?.mood || 'Focused');
  const [tags, setTags] = useState<string[]>(initialEntry?.tags || ['Reflection']);
  const [tagInput, setTagInput] = useState('');
  const [userGoal, setUserGoal] = useState('');

  // AI Chat State
  const [messages, setMessages] = useState<ChatMessage[]>(
    initialEntry?.messages && initialEntry.messages.length > 0
      ? initialEntry.messages
      : [
          {
            id: 'welcome-1',
            role: 'model',
            content: "Welcome to your secure reflection space. I'm your Gemini reflection partner. What's on your mind today, or what would you like to explore together?",
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]
  );
  const [chatInput, setChatInput] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [includeDraftContext, setIncludeDraftContext] = useState(true);

  // Sync when initialEntry changes externally
  useEffect(() => {
    if (initialEntry) {
      setCurrentEntryId(initialEntry.id);
      setTitle(initialEntry.title || '');
      setContent(initialEntry.content || '');
      setMode(initialEntry.mode || 'socratic');
      setMood(initialEntry.mood || 'Focused');
      setTags(initialEntry.tags || ['Reflection']);
      if (initialEntry.messages && initialEntry.messages.length > 0) {
        setMessages(initialEntry.messages);
      }
    }
  }, [initialEntry]);

  // Extraction State
  const [isExtracting, setIsExtracting] = useState(false);
  const [promptsList, setPromptsList] = useState<string[]>([]);
  const [isLoadingPrompts, setIsLoadingPrompts] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isAiTyping]);

  // Load starter prompts
  useEffect(() => {
    handleLoadPrompts();
  }, [mood]);

  const handleLoadPrompts = async () => {
    setIsLoadingPrompts(true);
    try {
      const p = await fetchDynamicPrompts('Introspection and Clarity', mood);
      setPromptsList(p);
    } catch {
      // fallback
    } finally {
      setIsLoadingPrompts(false);
    }
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const cleanTag = tagInput.trim().replace(/^#/, '');
      if (!tags.includes(cleanTag)) {
        setTags([...tags, cleanTag]);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  // Voice dictation toggle using Web Speech API if supported
  const toggleSpeechRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser window.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setContent(prev => prev ? `${prev} ${transcript}` : transcript);
      };

      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  // Handle Send Chat Message
  const handleSendMessage = async (textToSend?: string) => {
    const messageContent = (textToSend || chatInput).trim();
    if (!messageContent || isAiTyping) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: messageContent,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedHistory = [...messages, userMessage];
    setMessages(updatedHistory);
    if (!textToSend) setChatInput('');
    setIsAiTyping(true);

    try {
      const replyText = await sendGeminiChatMessage({
        messages: updatedHistory.map(m => ({ role: m.role, content: m.content })),
        currentDraft: includeDraftContext ? content : undefined,
        mode,
        mood,
        userGoal: userGoal || undefined
      });

      const modelMessage: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'model',
        content: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, modelMessage]);
    } catch (error: any) {
      const fallbackMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'model',
        content: "I'm reflecting on your notes. What feels like the highest priority question for you right now?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setIsAiTyping(false);
    }
  };

  // Handle Automated Action Item Extraction & Final Save
  const handleExtractAndSave = async () => {
    if (!user) {
      onOpenAuth();
      return;
    }

    if (!title.trim() && !content.trim() && messages.length <= 1) {
      alert('Please write something in your scratchpad or converse with the AI companion first!');
      return;
    }

    setIsExtracting(true);

    try {
      const transcript = messages
        .filter(m => m.id !== 'welcome-1')
        .map(m => `${m.role === 'user' ? 'User' : 'Gemini Companion'}: ${m.content}`)
        .join('\n\n');

      const finalTitle = title.trim() || `Journal Session - ${new Date().toLocaleDateString()}`;

      // Call Gemini automated extraction
      const extraction = await extractActionItemsWithGemini({
        title: finalTitle,
        journalContent: content,
        transcript
      });

      const entryId = currentEntryId || `journal-${Date.now()}`;
      setCurrentEntryId(entryId);

      const entryToSave: JournalEntry = {
        id: entryId,
        userId: user.uid,
        title: finalTitle,
        content,
        mode,
        mood,
        tags,
        messages,
        summary: extraction.summary,
        keyThemes: extraction.keyThemes,
        moodAnalysis: extraction.moodAnalysis,
        actionItemsCount: extraction.actionItems.length,
        createdAt: initialEntry?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await onSaveEntry(entryToSave, extraction);
      onExtractionSuccess(extraction, finalTitle);
    } catch (err: any) {
      console.error('Extraction & Save failed:', err);
      alert(`Could not complete extraction: ${err.message || 'Unknown error'}`);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleQuickSaveDraft = async () => {
    if (!user) {
      onOpenAuth();
      return;
    }
    const finalTitle = title.trim() || `Draft - ${new Date().toLocaleDateString()}`;
    const entryId = currentEntryId || `journal-${Date.now()}`;
    setCurrentEntryId(entryId);

    const entryToSave: JournalEntry = {
      id: entryId,
      userId: user.uid,
      title: finalTitle,
      content,
      mode,
      mood,
      tags,
      messages,
      summary: initialEntry?.summary || 'Draft in progress',
      keyThemes: tags,
      createdAt: initialEntry?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await onSaveEntry(entryToSave);
    alert('Journal draft securely synchronized with Firestore!');
  };

  const handleResetSession = () => {
    if (confirm('Start a fresh journal & brainstorm session? Your unsaved scratchpad will clear.')) {
      setCurrentEntryId(null);
      setTitle('');
      setContent('');
      setTags(['Reflection']);
      setMessages([
        {
          id: 'welcome-1',
          role: 'model',
          content: "Fresh session initialized. What thoughts or goals would you like to reflect on right now?",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      if (onNewSession) onNewSession();
    }
  };

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
      
      {/* Top Workspace Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex items-center space-x-2">
          {onNavigateToDashboard && (
            <button
              onClick={onNavigateToDashboard}
              className="text-xs text-slate-600 hover:text-indigo-600 font-semibold px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 transition"
            >
              ← Dashboard
            </button>
          )}
          <span className="text-xs font-bold text-slate-800">
            {currentEntryId ? 'Active Session' : 'New Journal Session'}
          </span>
          {currentEntryId && (
            <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-semibold">
              Synced with Cloud
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleResetSession}
            className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-medium transition"
          >
            + Fresh Session
          </button>

          {currentEntryId && onDeleteJournal && (
            <button
              onClick={() => {
                if (confirm('Delete this session from Firestore?')) {
                  onDeleteJournal(currentEntryId);
                  handleResetSession();
                }
              }}
              className="px-2.5 py-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-medium transition"
            >
              Delete
            </button>
          )}

          <button
            onClick={handleQuickSaveDraft}
            className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-2xs transition"
          >
            Save Session
          </button>
        </div>
      </div>
      
      {/* Top Banner: Mode & Intention Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          
          {/* Reflection Mode Selector */}
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
              <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Select Reflection Coaching Persona
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {JOURNAL_MODES.map(m => {
                const IconComponent = m.icon;
                const isSelected = mode === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => setMode(m.id)}
                    className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      isSelected
                        ? `${m.color} ring-2 ring-indigo-500/20 font-semibold shadow-xs`
                        : 'border-slate-200 bg-slate-50/60 text-slate-600 hover:bg-slate-100 hover:border-slate-300'
                    }`}
                  >
                    <IconComponent className="w-3.5 h-3.5" />
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Current Mood Bar */}
          <div className="lg:border-l lg:border-slate-200 lg:pl-6">
            <div className="flex items-center space-x-2 mb-2">
              <Smile className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Current Energy / Mood
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {MOODS.map(m => (
                <button
                  key={m.type}
                  onClick={() => setMood(m.type)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-all ${
                    mood === m.type
                      ? `${m.color} ring-2 ring-indigo-400/30 font-semibold scale-105`
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="mr-1">{m.emoji}</span>
                  {m.type}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Scratchpad & Right AI Brainstormer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT CANVAS (7 COLS): Rich Journal Scratchpad */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
            
            {/* Title & Speech Assistant */}
            <div className="flex items-center space-x-3">
              <input
                id="journal-title-input"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Session Title (e.g., Deep Focus on Strategy & Core Goals)..."
                className="w-full text-lg font-semibold text-slate-900 placeholder:text-slate-400 border-b border-transparent hover:border-slate-200 focus:border-indigo-500 focus:outline-none py-1 transition"
              />
              <button
                onClick={toggleSpeechRecognition}
                title={isListening ? 'Stop Voice Dictation' : 'Start Voice Dictation'}
                className={`p-2 rounded-lg border transition ${
                  isListening
                    ? 'bg-rose-50 border-rose-300 text-rose-600 animate-pulse'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
            </div>

            {/* Quick Templates & Prompts helper pill drawer */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-[11px] font-medium text-slate-400">Quick Templates:</span>
              {TEMPLATES.map((tmpl, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setContent(prev => (prev ? `${prev}\n\n${tmpl.content}` : tmpl.content));
                    if (!title) setTitle(tmpl.name);
                  }}
                  className="text-[11px] px-2 py-0.5 rounded bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 transition"
                >
                  {tmpl.name}
                </button>
              ))}
            </div>

            {/* Main Text Scratchpad */}
            <div className="relative">
              <textarea
                id="journal-content-textarea"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your thoughts, plans, challenges, or stream of consciousness here... You can converse with Gemini on the right side simultaneously to explore ideas deeper."
                rows={14}
                className="w-full text-sm text-slate-800 placeholder:text-slate-400 border border-slate-200 rounded-lg p-3.5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none resize-y font-normal leading-relaxed"
              />
            </div>

            {/* Scratchpad Footer: Tag Manager & Word Count */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
              
              {/* Tags */}
              <div className="flex items-center flex-wrap gap-1.5">
                <Tag className="w-3.5 h-3.5 text-slate-400 mr-1" />
                {tags.map(t => (
                  <span
                    key={t}
                    className="inline-flex items-center px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 text-xs font-medium"
                  >
                    #{t}
                    <button
                      onClick={() => handleRemoveTag(t)}
                      className="ml-1 text-indigo-400 hover:text-indigo-700"
                    >
                      ×
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  placeholder="+ Add tag (Enter)"
                  className="px-2 py-0.5 text-xs text-slate-700 placeholder:text-slate-400 border border-slate-200 rounded focus:outline-none focus:border-indigo-400 w-28"
                />
              </div>

              {/* Stats & Session Controls */}
              <div className="flex items-center space-x-3 text-slate-400">
                <span>
                  {content.trim() ? content.trim().split(/\s+/).length : 0} words
                </span>
                <span>•</span>
                <span>{content.length} chars</span>
                <button
                  onClick={handleResetSession}
                  className="text-slate-400 hover:text-slate-600 transition"
                  title="Reset / Start New Session"
                >
                  Clear
                </button>
              </div>
            </div>

            {/* Dynamic AI Prompts Carousel */}
            <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  Gemini Reflective Sparks for {mood} Mood
                </span>
                <button
                  onClick={handleLoadPrompts}
                  disabled={isLoadingPrompts}
                  className="text-[11px] text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-medium"
                >
                  <RefreshCw className={`w-3 h-3 ${isLoadingPrompts ? 'animate-spin' : ''}`} />
                  New Sparks
                </button>
              </div>
              <div className="space-y-1.5">
                {promptsList.slice(0, 3).map((prompt, pIdx) => (
                  <button
                    key={pIdx}
                    onClick={() => {
                      setContent(prev => (prev ? `${prev}\n\n### Reflection: ${prompt}\n` : `### Reflection: ${prompt}\n`));
                      handleSendMessage(`I'm exploring this prompt: "${prompt}". What are some good angles to consider?`);
                    }}
                    className="w-full text-left p-2 rounded bg-white hover:bg-indigo-50/50 border border-slate-200 hover:border-indigo-200 text-xs text-slate-700 transition flex items-start justify-between group"
                  >
                    <span className="line-clamp-2">"{prompt}"</span>
                    <span className="text-[10px] text-indigo-500 opacity-0 group-hover:opacity-100 transition shrink-0 ml-2">
                      Insert & Ask →
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL (5 COLS): Interactive Gemini AI Reflection Partner */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-[650px]">
            
            {/* AI Companion Header */}
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/70 rounded-t-xl">
              <div className="flex items-center space-x-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-semibold text-slate-800">
                  Gemini Reflection Partner
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700 font-medium capitalize">
                  {mode}
                </span>
              </div>
              <label className="flex items-center space-x-1.5 text-[11px] text-slate-500 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeDraftContext}
                  onChange={(e) => setIncludeDraftContext(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5"
                />
                <span>Sync Scratchpad</span>
              </label>
            </div>

            {/* Conversation Stream */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/30">
              {messages.map((msg) => {
                const isUser = msg.role === 'user';
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[90%] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm leading-relaxed shadow-2xs ${
                        isUser
                          ? 'bg-indigo-600 text-white rounded-br-none'
                          : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none'
                      }`}
                    >
                      <div className="whitespace-pre-wrap">{msg.content}</div>
                    </div>
                    <div className="flex items-center space-x-1.5 mt-1 px-1 text-[10px] text-slate-400">
                      <span>{msg.timestamp}</span>
                      {!isUser && (
                        <button
                          onClick={() => handleCopyText(msg.content, msg.id)}
                          className="hover:text-slate-600 transition"
                          title="Copy AI Insight"
                        >
                          {copiedId === msg.id ? (
                            <Check className="w-2.5 h-2.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-2.5 h-2.5" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              {isAiTyping && (
                <div className="flex items-center space-x-2 bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-500 w-fit">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600 animate-spin" />
                  <span>Gemini is synthesizing insights...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Socratic Suggestions */}
            <div className="px-3 py-1.5 bg-white border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto text-[11px]">
              <button
                onClick={() => handleSendMessage("What is the underlying assumption in what I just wrote?")}
                className="shrink-0 px-2 py-0.5 rounded-full bg-slate-100 hover:bg-indigo-50 text-slate-600 hover:text-indigo-700 transition"
              >
                🧠 Question Assumptions
              </button>
              <button
                onClick={() => handleSendMessage("Give me 3 practical next steps to test this idea.")}
                className="shrink-0 px-2 py-0.5 rounded-full bg-slate-100 hover:bg-indigo-50 text-slate-600 hover:text-indigo-700 transition"
              >
                🎯 3 Actionable Steps
              </button>
              <button
                onClick={() => handleSendMessage("What would an executive coach advise me to watch out for?")}
                className="shrink-0 px-2 py-0.5 rounded-full bg-slate-100 hover:bg-indigo-50 text-slate-600 hover:text-indigo-700 transition"
              >
                🔍 Blindspot Check
              </button>
            </div>

            {/* Chat Input Bar */}
            <div className="p-3 border-t border-slate-200 bg-white rounded-b-xl">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center space-x-2"
              >
                <input
                  id="chat-message-input"
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask Gemini, brainstorm ideas, or share thoughts..."
                  disabled={isAiTyping}
                  className="flex-1 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
                <button
                  id="btn-send-chat"
                  type="submit"
                  disabled={!chatInput.trim() || isAiTyping}
                  className="p-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 transition shadow-sm"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM ACTION BAR (Primary CTA for Automated Action Item Extraction) */}
      <div className="mt-6 bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sticky bottom-4 z-30">
        
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-900">
              Automated Action Item Extraction
            </h4>
            <p className="text-xs text-slate-500">
              Gemini will parse your journal transcript, extract concrete tasks, and save to Firestore.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            id="btn-save-draft"
            onClick={handleQuickSaveDraft}
            className="px-4 py-2 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition flex items-center space-x-1.5"
          >
            <BookmarkPlus className="w-3.5 h-3.5" />
            <span>Save Draft</span>
          </button>

          <button
            id="btn-extract-action-items"
            onClick={handleExtractAndSave}
            disabled={isExtracting}
            className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-600 text-white text-xs font-semibold hover:opacity-95 transition shadow-sm flex items-center space-x-2 disabled:opacity-50"
          >
            {isExtracting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Parsing & Extracting Tasks...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Finish & Extract Action Items</span>
              </>
            )}
          </button>
        </div>
      </div>

    </div>
  );
};
