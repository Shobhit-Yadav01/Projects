import React, { useState } from 'react';
import {
  CheckSquare,
  Plus,
  Search,
  Filter,
  Calendar,
  Tag,
  Clock,
  CheckCircle2,
  Circle,
  AlertCircle,
  Trash2,
  Layers,
  LayoutGrid,
  List,
  Sparkles,
  ExternalLink,
  Download,
  Flame,
  ArrowRight
} from 'lucide-react';
import { ExtractedActionItem, PriorityLevel, TaskCategory, TaskStatus, UserSecurityProfile } from '../types';

interface ActionItemsViewProps {
  user: UserSecurityProfile | null;
  actionItems: ExtractedActionItem[];
  onUpdateStatus: (itemId: string, status: TaskStatus) => Promise<void>;
  onDeleteItem: (itemId: string) => Promise<void>;
  onAddManualItem: (item: ExtractedActionItem) => Promise<void>;
  onNavigateToJournal?: (journalId: string) => void;
}

const CATEGORIES: TaskCategory[] = ['Work', 'Personal', 'Health', 'Finance', 'Learning', 'Creative', 'Relationships'];
const PRIORITIES: PriorityLevel[] = ['High', 'Medium', 'Low'];

export const ActionItemsView: React.FC<ActionItemsViewProps> = ({
  user,
  actionItems,
  onUpdateStatus,
  onDeleteItem,
  onAddManualItem,
  onNavigateToJournal
}) => {
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedPriority, setSelectedPriority] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // Quick Add Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newPriority, setNewPriority] = useState<PriorityLevel>('Medium');
  const [newCategory, setNewCategory] = useState<TaskCategory>('Work');
  const [newDeadline, setNewDeadline] = useState('This Week');
  const [newTags, setNewTags] = useState('Goal');

  // Filter items
  const filteredItems = actionItems.filter(item => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.tags && item.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())));

    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesPriority = selectedPriority === 'All' || item.priority === selectedPriority;
    const matchesStatus = statusFilter === 'All' || item.status === statusFilter;

    return matchesSearch && matchesCategory && matchesPriority && matchesStatus;
  });

  const pendingItems = filteredItems.filter(i => i.status === 'Pending');
  const inProgressItems = filteredItems.filter(i => i.status === 'In Progress');
  const completedItems = filteredItems.filter(i => i.status === 'Completed');

  const totalCount = actionItems.length;
  const completedCount = actionItems.filter(i => i.status === 'Completed').length;
  const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !user) return;

    const newItem: ExtractedActionItem = {
      id: `action-${Date.now()}`,
      userId: user.uid,
      title: newTitle.trim(),
      description: newDescription.trim(),
      priority: newPriority,
      category: newCategory,
      status: 'Pending',
      suggestedDeadline: newDeadline.trim() || 'This Week',
      tags: newTags.split(',').map(t => t.trim()).filter(Boolean),
      createdAt: new Date().toISOString()
    };

    await onAddManualItem(newItem);
    setNewTitle('');
    setNewDescription('');
    setIsAddModalOpen(false);
  };

  const handleExportMarkdown = () => {
    const lines = [
      `# Personal Gemini Action Items Export`,
      `Exported: ${new Date().toLocaleString()}`,
      `Total Tasks: ${actionItems.length} | Completed: ${completedCount} (${completionRate}%)`,
      '',
      '## Pending Tasks',
      ...actionItems.filter(i => i.status === 'Pending').map(i => `- [ ] **[${i.priority}]** ${i.title} (${i.category}) - ${i.suggestedDeadline || 'No deadline'}`),
      '',
      '## In Progress',
      ...actionItems.filter(i => i.status === 'In Progress').map(i => `- [/] **[${i.priority}]** ${i.title} (${i.category})`),
      '',
      '## Completed',
      ...actionItems.filter(i => i.status === 'Completed').map(i => `- [x] ~~${i.title}~~ (Completed: ${i.completedAt ? new Date(i.completedAt).toLocaleDateString() : 'Yes'})`)
    ];

    const blob = new Blob([lines.join('\n')], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Gemini_Action_Items_${new Date().toISOString().slice(0,10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getPriorityBadge = (p: PriorityLevel) => {
    switch (p) {
      case 'High':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'Medium':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Low':
        return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Header & Stats Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <CheckSquare className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">
              Action Items & Strategic Deliverables
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Automated task extractions generated by Gemini AI from your reflective journal transcripts.
          </p>
        </div>

        {/* Action Buttons & Velocity Card */}
        <div className="flex items-center space-x-3">
          <div className="bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 text-xs">
            <span className="text-slate-500 font-medium mr-1.5">Execution Progress:</span>
            <span className="font-bold text-indigo-700">{completionRate}%</span>
            <span className="text-slate-400 text-[11px] ml-1">({completedCount}/{totalCount})</span>
          </div>

          <button
            onClick={handleExportMarkdown}
            title="Export as Markdown"
            className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs flex items-center gap-1 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center space-x-1.5 transition shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Action Item</span>
          </button>
        </div>
      </div>

      {/* Filter & View Controls */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks, descriptions, or tags..."
              className="w-full pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center space-x-2">
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
              <button
                onClick={() => setViewMode('kanban')}
                className={`p-1.5 rounded-md text-xs font-medium flex items-center space-x-1 transition ${
                  viewMode === 'kanban' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-600'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Kanban</span>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-md text-xs font-medium flex items-center space-x-1 transition ${
                  viewMode === 'list' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-600'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">List</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100 text-xs">
          <span className="text-[11px] font-medium text-slate-400 mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Category:
          </span>
          {['All', ...CATEGORIES].map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-0.5 rounded-full transition ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white font-medium'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}

          <span className="text-[11px] font-medium text-slate-400 ml-3 mr-1">Priority:</span>
          {['All', ...PRIORITIES].map(pri => (
            <button
              key={pri}
              onClick={() => setSelectedPriority(pri)}
              className={`px-2.5 py-0.5 rounded-full transition ${
                selectedPriority === pri
                  ? 'bg-slate-900 text-white font-medium'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {pri}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content: Kanban or List */}
      {viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* COLUMN 1: Pending */}
          <div className="bg-slate-50/80 rounded-xl border border-slate-200 p-4 flex flex-col min-h-[500px]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-3">
              <div className="flex items-center space-x-2">
                <Circle className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-semibold text-slate-800 text-xs uppercase tracking-wider">
                  Pending / To Do
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 text-xs font-bold">
                {pendingItems.length}
              </span>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto">
              {pendingItems.map(item => (
                <ActionCard
                  key={item.id}
                  item={item}
                  onUpdateStatus={onUpdateStatus}
                  onDeleteItem={onDeleteItem}
                  getPriorityBadge={getPriorityBadge}
                  onNavigateToJournal={onNavigateToJournal}
                />
              ))}
              {pendingItems.length === 0 && (
                <div className="text-center py-12 text-slate-400 text-xs">
                  No pending action items
                </div>
              )}
            </div>
          </div>

          {/* COLUMN 2: In Progress */}
          <div className="bg-indigo-50/40 rounded-xl border border-indigo-100 p-4 flex flex-col min-h-[500px]">
            <div className="flex items-center justify-between pb-3 border-b border-indigo-200/60 mb-3">
              <div className="flex items-center space-x-2">
                <Clock className="w-3.5 h-3.5 text-indigo-600" />
                <span className="font-semibold text-indigo-900 text-xs uppercase tracking-wider">
                  In Progress
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-indigo-200 text-indigo-800 text-xs font-bold">
                {inProgressItems.length}
              </span>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto">
              {inProgressItems.map(item => (
                <ActionCard
                  key={item.id}
                  item={item}
                  onUpdateStatus={onUpdateStatus}
                  onDeleteItem={onDeleteItem}
                  getPriorityBadge={getPriorityBadge}
                  onNavigateToJournal={onNavigateToJournal}
                />
              ))}
              {inProgressItems.length === 0 && (
                <div className="text-center py-12 text-slate-400 text-xs">
                  No tasks currently in flight
                </div>
              )}
            </div>
          </div>

          {/* COLUMN 3: Completed */}
          <div className="bg-emerald-50/40 rounded-xl border border-emerald-100 p-4 flex flex-col min-h-[500px]">
            <div className="flex items-center justify-between pb-3 border-b border-emerald-200/60 mb-3">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span className="font-semibold text-emerald-900 text-xs uppercase tracking-wider">
                  Completed
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-800 text-xs font-bold">
                {completedItems.length}
              </span>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto">
              {completedItems.map(item => (
                <ActionCard
                  key={item.id}
                  item={item}
                  onUpdateStatus={onUpdateStatus}
                  onDeleteItem={onDeleteItem}
                  getPriorityBadge={getPriorityBadge}
                  onNavigateToJournal={onNavigateToJournal}
                />
              ))}
              {completedItems.length === 0 && (
                <div className="text-center py-12 text-slate-400 text-xs">
                  Completed tasks will show here
                </div>
              )}
            </div>
          </div>

        </div>
      ) : (
        /* List View */
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm divide-y divide-slate-100">
          {filteredItems.map(item => (
            <div
              key={item.id}
              className="p-4 hover:bg-slate-50/80 transition flex items-center justify-between gap-4"
            >
              <div className="flex items-start space-x-3 flex-1">
                <button
                  onClick={() =>
                    onUpdateStatus(
                      item.id,
                      item.status === 'Completed' ? 'Pending' : 'Completed'
                    )
                  }
                  className="mt-0.5 text-slate-400 hover:text-emerald-600 transition"
                >
                  {item.status === 'Completed' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Circle className="w-4 h-4" />
                  )}
                </button>
                <div className="space-y-1">
                  <p className={`text-sm font-semibold ${item.status === 'Completed' ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                    {item.title}
                  </p>
                  {item.description && (
                    <p className="text-xs text-slate-500">{item.description}</p>
                  )}
                  <div className="flex items-center space-x-2 text-[11px] text-slate-400 pt-1">
                    <span className={`px-2 py-0.5 rounded border text-[10px] font-semibold ${getPriorityBadge(item.priority)}`}>
                      {item.priority}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                      {item.category}
                    </span>
                    {item.suggestedDeadline && (
                      <span className="flex items-center gap-1 text-slate-500">
                        <Calendar className="w-3 h-3" /> {item.suggestedDeadline}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <select
                  value={item.status}
                  onChange={(e) => onUpdateStatus(item.id, e.target.value as TaskStatus)}
                  className="text-xs border border-slate-200 rounded px-2 py-1 bg-white text-slate-700 focus:outline-none"
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
                <button
                  onClick={() => onDeleteItem(item.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 transition"
                  title="Delete Action Item"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}

          {filteredItems.length === 0 && (
            <div className="text-center py-16 text-slate-400 text-xs">
              No matching action items found. Finish a journal session or click "Add Action Item".
            </div>
          )}
        </div>
      )}

      {/* QUICK ADD MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Plus className="w-4 h-4 text-indigo-600" />
                Add Action Item
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Task Title *
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Schedule 15m review with marketing team"
                  className="w-full border border-slate-300 rounded-lg p-2 focus:border-indigo-500 focus:outline-none text-xs"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Context / Notes
                </label>
                <textarea
                  rows={2}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Optional context extracted or remembered..."
                  className="w-full border border-slate-300 rounded-lg p-2 focus:border-indigo-500 focus:outline-none text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as PriorityLevel)}
                    className="w-full border border-slate-300 rounded-lg p-2 text-xs"
                  >
                    {PRIORITIES.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as TaskCategory)}
                    className="w-full border border-slate-300 rounded-lg p-2 text-xs"
                  >
                    {CATEGORIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Suggested Timeframe / Deadline
                </label>
                <input
                  type="text"
                  value={newDeadline}
                  onChange={(e) => setNewDeadline(e.target.value)}
                  placeholder="e.g. By Friday, Tomorrow, Next Week"
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  placeholder="e.g. Q3Goal, Sprint, Focus"
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

interface ActionCardProps {
  item: ExtractedActionItem;
  onUpdateStatus: (itemId: string, status: TaskStatus) => Promise<void>;
  onDeleteItem: (itemId: string) => Promise<void>;
  getPriorityBadge: (p: PriorityLevel) => string;
  onNavigateToJournal?: (journalId: string) => void;
}

const ActionCard: React.FC<ActionCardProps> = ({
  item,
  onUpdateStatus,
  onDeleteItem,
  getPriorityBadge,
  onNavigateToJournal
}) => {
  const isCompleted = item.status === 'Completed';

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-3.5 shadow-2xs hover:shadow-sm transition space-y-2 group">
      
      {/* Top row: Priority & Category */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-1.5">
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getPriorityBadge(item.priority)}`}>
            {item.priority}
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
            {item.category}
          </span>
        </div>
        
        <button
          onClick={() => onDeleteItem(item.id)}
          className="text-slate-300 hover:text-rose-600 p-1 transition opacity-0 group-hover:opacity-100"
          title="Delete"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>

      {/* Title */}
      <h4 className={`text-xs font-semibold text-slate-900 leading-snug ${isCompleted ? 'line-through text-slate-400' : ''}`}>
        {item.title}
      </h4>

      {/* Description */}
      {item.description && (
        <p className="text-[11px] text-slate-500 line-clamp-2">
          {item.description}
        </p>
      )}

      {/* Deadline & Tags */}
      <div className="flex items-center justify-between pt-1 border-t border-slate-50 text-[10px] text-slate-400">
        <div className="flex items-center space-x-1 text-slate-500">
          <Calendar className="w-3 h-3" />
          <span>{item.suggestedDeadline || 'This Week'}</span>
        </div>

        {item.journalId && onNavigateToJournal && (
          <button
            onClick={() => onNavigateToJournal(item.journalId!)}
            className="text-indigo-600 hover:underline flex items-center gap-0.5"
            title="View origin journal session"
          >
            <span>Origin Session</span>
            <ExternalLink className="w-2.5 h-2.5" />
          </button>
        )}
      </div>

      {/* Status Action Switcher */}
      <div className="flex items-center justify-between pt-2">
        {item.status === 'Pending' && (
          <button
            onClick={() => onUpdateStatus(item.id, 'In Progress')}
            className="text-[10px] text-indigo-600 hover:bg-indigo-50 px-2 py-0.5 rounded font-medium border border-indigo-200 transition"
          >
            Start Task →
          </button>
        )}

        {item.status === 'In Progress' && (
          <button
            onClick={() => onUpdateStatus(item.id, 'Completed')}
            className="text-[10px] text-emerald-700 hover:bg-emerald-50 px-2 py-0.5 rounded font-medium border border-emerald-200 transition flex items-center gap-1"
          >
            <CheckCircle2 className="w-2.5 h-2.5" /> Mark Done
          </button>
        )}

        {item.status === 'Completed' && (
          <button
            onClick={() => onUpdateStatus(item.id, 'Pending')}
            className="text-[10px] text-slate-500 hover:bg-slate-100 px-2 py-0.5 rounded font-medium border border-slate-200 transition"
          >
            Reopen
          </button>
        )}
      </div>

    </div>
  );
};
