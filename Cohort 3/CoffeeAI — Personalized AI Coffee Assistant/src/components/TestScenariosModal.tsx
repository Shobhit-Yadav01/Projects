import React, { useState } from 'react';
import { X, Play, CheckCircle2, AlertCircle, Sparkles, Cpu, Clock, ExternalLink } from 'lucide-react';
import { ChatApiResponse } from '../types';

interface TestScenario {
  id: number;
  title: string;
  category: string;
  prompt: string;
  expectedBehavior: string;
}

interface TestScenariosModalProps {
  onClose: () => void;
  onRunTestInChat: (prompt: string) => void;
  customerId: string;
}

export const TestScenariosModal: React.FC<TestScenariosModalProps> = ({
  onClose,
  onRunTestInChat,
  customerId,
}) => {
  const scenarios: TestScenario[] = [
    {
      id: 1,
      title: 'General Menu Question',
      category: 'Menu & Category RAG',
      prompt: 'What cold drinks do you have on the menu with low acidity?',
      expectedBehavior: 'Grounded retrieval of cold brews and iced espresso beverages highlighting low acidity flavor notes without inventing fake items.',
    },
    {
      id: 2,
      title: 'Personalized Recommendation',
      category: 'Personalization & Preferences',
      prompt: 'I want something cold and not too sweet.',
      expectedBehavior: "Recommends items matching Alex Chen's profile (Cold, Low sweetness, Oat Milk), explaining the match reason.",
    },
    {
      id: 3,
      title: 'Previous Order Retrieval',
      category: 'Customer History Memory',
      prompt: 'What did I order last time?',
      expectedBehavior: 'Invokes getPreviousOrders tool, accurately retrieves recent order (Signature Cold Brew & Butter Croissant) with store and points.',
    },
    {
      id: 4,
      title: 'Exact Price Lookup',
      category: 'Factual Grounding',
      prompt: 'How much does Signature Cold Brew cost and what sizes are available?',
      expectedBehavior: 'Accurately quotes base price $4.75, Small $4.25, Medium $4.75, Large $5.45 directly from menu data.',
    },
    {
      id: 5,
      title: 'Ingredient & Allergen Question',
      category: 'Product Transparency',
      prompt: 'What ingredients are in the Madagascar Oat Vanilla Latte?',
      expectedBehavior: 'Lists real Bourbon vanilla, double espresso, Oatly Barista oat milk, and organic agave nectar.',
    },
    {
      id: 6,
      title: 'Dietary Preference Search',
      category: 'Dietary Filtering Tool',
      prompt: 'What vegan and dairy-free options do you have for breakfast and coffee?',
      expectedBehavior: 'Invokes searchMenu with dietary filters; recommends vegan pastries (Cardamom Almond Morning Bun) and plant-milk drinks.',
    },
    {
      id: 7,
      title: 'Product Availability & Store Info',
      category: 'Store & Inventory Check',
      prompt: 'Is the Nitro Velvet Draft available at the Downtown Roastery?',
      expectedBehavior: 'Invokes checkProductAvailability or getStoreInformation; confirms Nitro tap availability and gives store wait time.',
    },
    {
      id: 8,
      title: 'Unknown Product / Anti-Hallucination',
      category: 'Anti-Hallucination & Refusal',
      prompt: 'Do you sell Dragonfruit Bubble Tea or Cheeseburgers?',
      expectedBehavior: 'Politely confirms Dragonfruit Bubble Tea is not on the menu and suggests genuine iced fruit teas (Hibiscus Rose Spritz) instead.',
    },
    {
      id: 9,
      title: 'Multi-Turn Context Follow-Up',
      category: 'Conversation Memory',
      prompt: 'Recommend something similar to my previous order but less sweet.',
      expectedBehavior: 'Uses memory of previous cold brew order and customer profile to recommend a zero-sugar / low-sugar alternative.',
    },
    {
      id: 10,
      title: 'Empty / Edge-Case Input',
      category: 'Validation & Graceful Fallback',
      prompt: '   ',
      expectedBehavior: 'Handles empty or punctuation-only messages with a welcoming assistant greeting without crashing.',
    },
  ];

  const [activeScenarioId, setActiveScenarioId] = useState<number>(1);
  const [runningId, setRunningId] = useState<number | null>(null);
  const [testResults, setTestResults] = useState<Record<number, { response: ChatApiResponse; latency: number }>>({});

  const handleRunSingleTest = async (scenario: TestScenario) => {
    setRunningId(scenario.id);
    const start = performance.now();
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId,
          message: scenario.prompt,
          conversationId: `test_eval_${scenario.id}_${Date.now()}`,
        }),
      });

      const data: ChatApiResponse = await res.json();
      const latency = Math.round(performance.now() - start);
      setTestResults((prev) => ({ ...prev, [scenario.id]: { response: data, latency } }));
    } catch (err) {
      console.error('Test execution failed:', err);
    } finally {
      setRunningId(null);
    }
  };

  const selectedScenario = scenarios.find((s) => s.id === activeScenarioId)!;
  const currentResult = testResults[activeScenarioId];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl border border-[#EADCC9] max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="bg-[#2C1810] text-white p-5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-[#C67D3B] text-white flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-base sm:text-lg">
                Agent Evaluation Suite
              </h2>
              <p className="text-xs text-[#D4C3B3]">
                10 Automated Evaluation Scenarios for Customer-Facing AI Agent
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body - 2 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-12 flex-1 overflow-hidden">
          {/* Left List of 10 Scenarios */}
          <div className="md:col-span-5 border-r border-[#EADCC9] overflow-y-auto p-4 space-y-2 bg-[#FAF8F5]">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#8C532B] px-1">
              Select Scenario to Evaluate:
            </p>
            {scenarios.map((sc) => {
              const hasRun = !!testResults[sc.id];
              return (
                <button
                  key={sc.id}
                  onClick={() => setActiveScenarioId(sc.id)}
                  className={`w-full p-3 rounded-2xl text-left border transition-all flex items-start space-x-2.5 ${
                    activeScenarioId === sc.id
                      ? 'bg-white border-[#C67D3B] shadow-xs'
                      : 'bg-white/60 border-[#EADCC9] hover:bg-white'
                  }`}
                >
                  <span className="w-5 h-5 rounded-lg bg-[#2C1810] text-[#D4A373] text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {sc.id}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-[#2C1810] truncate">{sc.title}</h4>
                      {hasRun && <CheckCircle2 className="w-3.5 h-3.5 text-[#588157] shrink-0" />}
                    </div>
                    <p className="text-[10px] text-[#7A6253] truncate">{sc.category}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right Details & Live Output Bench */}
          <div className="md:col-span-7 p-5 overflow-y-auto space-y-5 bg-white flex flex-col justify-between">
            <div className="space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-[#8C532B] bg-[#C67D3B]/10 px-2 py-0.5 rounded-md">
                  Scenario {selectedScenario.id}: {selectedScenario.category}
                </span>
                <h3 className="font-serif font-bold text-lg text-[#2C1810]">{selectedScenario.title}</h3>
              </div>

              {/* Prompt Box */}
              <div className="p-3.5 rounded-2xl bg-[#FAF6F0] border border-[#EADCC9] space-y-1">
                <p className="text-[10px] font-bold text-[#7A6253] uppercase">Test Input Prompt:</p>
                <p className="text-xs font-mono font-bold text-[#2C1810]">
                  "{selectedScenario.prompt || '[Empty Input]'}"
                </p>
              </div>

              {/* Expected Output */}
              <div className="p-3.5 rounded-2xl bg-[#F0F7F4] border border-[#CDE5D7] space-y-1">
                <p className="text-[10px] font-bold text-[#386641] uppercase">Expected Agent Behavior:</p>
                <p className="text-xs text-[#2D5A3C] leading-relaxed">{selectedScenario.expectedBehavior}</p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  onClick={() => handleRunSingleTest(selectedScenario)}
                  disabled={runningId === selectedScenario.id}
                  className="px-4 py-2.5 bg-[#2C1810] hover:bg-[#C67D3B] text-white text-xs font-semibold rounded-xl shadow-xs transition-all flex items-center space-x-1.5 disabled:opacity-50"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>{runningId === selectedScenario.id ? 'Running AI Agent...' : 'Run Test in Suite'}</span>
                </button>

                <button
                  onClick={() => {
                    onClose();
                    onRunTestInChat(selectedScenario.prompt);
                  }}
                  className="px-4 py-2.5 bg-[#FAF6F0] hover:bg-[#F3ECE0] text-[#8C532B] text-xs font-semibold rounded-xl border border-[#EADCC9] flex items-center space-x-1.5 transition-all"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-[#C67D3B]" />
                  <span>Open in Interactive Chat</span>
                </button>
              </div>

              {/* Live Test Results Output */}
              {currentResult && (
                <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EADCC9] space-y-3 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between text-xs pb-2 border-b border-[#EADCC9]">
                    <span className="font-bold text-[#2C1810] flex items-center space-x-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#588157]" />
                      <span>Live Response Output</span>
                    </span>
                    <span className="text-[11px] text-[#7A6253] flex items-center space-x-1 font-mono">
                      <Clock className="w-3 h-3" />
                      <span>{currentResult.latency} ms</span>
                    </span>
                  </div>

                  <p className="text-xs text-[#2C1810] leading-relaxed whitespace-pre-wrap">
                    {currentResult.response.response}
                  </p>

                  {/* Grounding tag & tools */}
                  <div className="pt-2 border-t border-[#EADCC9] flex flex-wrap gap-2 text-[10px]">
                    <span className="bg-[#588157]/15 text-[#386641] px-2 py-0.5 rounded font-semibold">
                      {currentResult.response.groundingTag}
                    </span>
                    {currentResult.response.toolCalls.map((t, i) => (
                      <span key={i} className="bg-[#2C1810] text-[#D4A373] px-2 py-0.5 rounded font-mono font-bold">
                        ⚡ {t.name}()
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
