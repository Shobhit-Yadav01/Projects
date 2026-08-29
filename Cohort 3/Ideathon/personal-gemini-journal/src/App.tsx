import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import {
  auth,
  logoutUser,
  loginGuest,
  getLocalGuestSession,
  clearLocalGuestSession,
  saveJournalEntry,
  deleteJournalEntry,
  subscribeToUserJournals,
  saveActionItem,
  saveMultipleActionItems,
  updateActionItemStatus,
  deleteActionItem,
  subscribeToUserActions,
  subscribeToUserInsights,
  saveWeeklyInsight,
  logAuthDiagnostic
} from './lib/firebase';
import {
  JournalEntry,
  ExtractedActionItem,
  UserSecurityProfile,
  ExtractionResult,
  TaskStatus,
  WeeklyInsight
} from './types';
import { Navbar, AppTabType } from './components/Navbar';
import { LandingPageView } from './components/LandingPageView';
import { DashboardView } from './components/DashboardView';
import { WeeklyInsightsView } from './components/WeeklyInsightsView';
import { JournalEditor } from './components/JournalEditor';
import { ActionItemsView } from './components/ActionItemsView';
import { JournalHistoryView } from './components/JournalHistoryView';
import { AnalyticsView } from './components/AnalyticsView';
import { PrivacySecurityView } from './components/PrivacySecurityView';
import { SecurityArchitectureModal } from './components/SecurityArchitectureModal';
import { ExtractionResultModal } from './components/ExtractionResultModal';
import { SummaryDetailModal } from './components/SummaryDetailModal';
import { AuthModal } from './components/AuthModal';
import { ShieldCheck, Sparkles, User as UserIcon, LogIn, Lock, Loader2, ArrowRight } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<AppTabType>('dashboard');
  const [user, setUser] = useState<UserSecurityProfile | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  // Firestore state
  const [journals, setJournals] = useState<JournalEntry[]>([]);
  const [actionItems, setActionItems] = useState<ExtractedActionItem[]>([]);
  const [weeklyInsights, setWeeklyInsights] = useState<WeeklyInsight[]>([]);

  // Active Selected Journal for Workspace
  const [selectedJournal, setSelectedJournal] = useState<JournalEntry | null>(null);

  // Modals
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signin');
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);
  const [summaryModalEntry, setSummaryModalEntry] = useState<JournalEntry | null>(null);
  const [extractionResult, setExtractionResult] = useState<{
    result: ExtractionResult;
    title: string;
  } | null>(null);

  // Step 5: Monitor Firebase Auth State + Local Guest Fallback (Central source of truth)
  useEffect(() => {
    logAuthDiagnostic({ method: 'init', status: 'attempt' });

    const syncUserState = (fbUser: User | null) => {
      if (fbUser) {
        logAuthDiagnostic({
          method: 'authState',
          status: 'state_change',
          uid: fbUser.uid,
          isAnonymous: fbUser.isAnonymous
        });
        clearLocalGuestSession();
        setUser({
          uid: fbUser.uid,
          email: fbUser.email,
          displayName: fbUser.displayName,
          photoURL: fbUser.photoURL,
          isAnonymous: fbUser.isAnonymous,
          securityLevel: 'Cloud Firestore Isolated',
          encryptionVerified: true,
        });
      } else {
        const localGuest = getLocalGuestSession();
        if (localGuest) {
          logAuthDiagnostic({
            method: 'authState',
            status: 'state_change',
            uid: localGuest.uid,
            isAnonymous: true
          });
          setUser(localGuest);
        } else {
          logAuthDiagnostic({
            method: 'authState',
            status: 'state_change',
            errorMessage: 'No active authenticated user'
          });
          setUser(null);
        }
      }
      setIsLoadingAuth(false);
    };

    const unsubscribe = onAuthStateChanged(auth, (fbUser: User | null) => {
      syncUserState(fbUser);
    });

    const handleCustomAuthChange = () => {
      syncUserState(auth.currentUser);
    };

    window.addEventListener('gemini_auth_change', handleCustomAuthChange);

    return () => {
      unsubscribe();
      window.removeEventListener('gemini_auth_change', handleCustomAuthChange);
    };
  }, []);

  // Subscribe to Firestore for real-time isolation queries scoped strictly to user.uid
  useEffect(() => {
    if (!user) {
      setJournals([]);
      setActionItems([]);
      setWeeklyInsights([]);
      return;
    }

    const unsubJournals = subscribeToUserJournals(user.uid, (data) => {
      setJournals(data);
    });

    const unsubActions = subscribeToUserActions(user.uid, (data) => {
      setActionItems(data);
    });

    const unsubInsights = subscribeToUserInsights(user.uid, (data) => {
      setWeeklyInsights(data);
    });

    return () => {
      unsubJournals();
      unsubActions();
      unsubInsights();
    };
  }, [user]);

  // Seed sample initial entry if completely empty for an authentic initial showcase
  useEffect(() => {
    if (user && journals.length === 0 && actionItems.length === 0 && !isLoadingAuth) {
      const sampleJournalId = `sample-j-${Date.now()}`;
      const sampleEntry: JournalEntry = {
        id: sampleJournalId,
        userId: user.uid,
        title: 'Q3 Strategic Vision & Energy Calibration',
        content: `Reflecting on our high-impact quarterly roadmap and team momentum. I need to ensure we don't succumb to scope creep on the upcoming AI microservices release.\n\nKey realization: We must prioritize automated action extraction and strict cloud security over superficial features.`,
        mode: 'socratic',
        mood: 'Focused',
        tags: ['Strategy', 'Leadership', 'Execution'],
        messages: [
          {
            id: 'sample-m1',
            role: 'user',
            content: 'How do I maintain strict enterprise data isolation while enabling fast AI brainstorming?',
            timestamp: '09:30 AM'
          },
          {
            id: 'sample-m2',
            role: 'model',
            content: 'By implementing strict Cloud Firestore security rules with user UID ownership matching and leveraging Google Cloud Secret Manager for runtime credential isolation. What is the single biggest security risk you are guarding against this quarter?',
            timestamp: '09:31 AM'
          }
        ],
        summary: 'Focused strategic session on aligning microservice velocity with zero-trust Firestore tenant isolation.',
        keyThemes: ['Cloud Security', 'Roadmap Prioritization', 'Team Velocity'],
        moodAnalysis: 'Focused & Determined',
        actionItemsCount: 2,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const sampleActions: ExtractedActionItem[] = [
        {
          id: `sample-a1-${Date.now()}`,
          userId: user.uid,
          journalId: sampleJournalId,
          journalTitle: sampleEntry.title,
          title: 'Review Firestore security rules against IDOR threats',
          description: 'Verify that all subcollections strictly enforce request.auth.uid == userId.',
          priority: 'High',
          category: 'Work',
          status: 'In Progress',
          suggestedDeadline: 'Tomorrow',
          tags: ['Security', 'Audit'],
          createdAt: new Date().toISOString()
        },
        {
          id: `sample-a2-${Date.now()}`,
          userId: user.uid,
          journalId: sampleJournalId,
          journalTitle: sampleEntry.title,
          title: 'Schedule 20-minute daily mindfulness decompression block',
          description: 'Carve out uninterrupted time for reflective journaling and energy calibration.',
          priority: 'Medium',
          category: 'Health',
          status: 'Pending',
          suggestedDeadline: 'This Week',
          tags: ['Habits', 'Wellbeing'],
          createdAt: new Date().toISOString()
        }
      ];

      const sampleInsight: WeeklyInsight = {
        id: `sample-insight-${Date.now()}`,
        userId: user.uid,
        weekLabel: 'Current Week',
        dateRange: `${new Date(Date.now() - 7 * 86400000).toLocaleDateString()} – ${new Date().toLocaleDateString()}`,
        totalJournalsAnalyzed: 1,
        recurringTopics: [
          { topic: 'Cloud Security & Tenant Isolation', count: 3, description: 'Repeatedly prioritizing zero-trust architecture and Secret Manager integration.' },
          { topic: 'Team Velocity & Focus', count: 2, description: 'Managing roadmap discipline and preventing premature feature sprawl.' }
        ],
        frequentlyDiscussedGoals: [
          { goal: 'Complete Google Cloud Run production hardening', status: 'In Progress', context: 'Security rules audit and Docker containerization.' },
          { goal: 'Establish daily 20-min decompression routine', status: 'Emerging', context: 'Mental clarity and cognitive endurance.' }
        ],
        actionItemStats: {
          total: 2,
          completed: 0,
          pending: 2,
          completionRate: 50
        },
        unresolvedTopics: [
          {
            topic: 'Balancing fast feature prototyping with formal security compliance',
            context: 'Pressure to deploy quickly while maintaining zero-trust credential isolation.',
            suggestedResolution: 'Automate container vulnerability scans and rely on Secret Manager dynamic injection.'
          }
        ],
        commonThemes: ['Architecture', 'Execution', 'Wellness', 'Discipline'],
        reflectionPatterns: 'Your thoughts consistently return to architectural integrity and sustainable execution rhythm. You are actively aligning technical precision with personal health boundaries.',
        suggestedFocusAreas: ['Verify production Dockerfile and Cloud Run ingress', 'Schedule deep focus blocks for code review'],
        nextWeekPrompts: [
          'What is the single most critical dependency standing between you and deployment?',
          'Where can you delegate or simplify to protect your highest-leverage engineering hours?'
        ],
        createdAt: new Date().toISOString()
      };

      saveJournalEntry(sampleEntry);
      saveMultipleActionItems(user.uid, sampleActions);
      saveWeeklyInsight(sampleInsight);
    }
  }, [user, journals.length, actionItems.length, isLoadingAuth]);

  // Handlers
  const handleOpenAuthModal = (mode: 'signin' | 'signup' = 'signin') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const handleSaveEntry = async (entry: JournalEntry, extraction?: ExtractionResult) => {
    if (!user) {
      handleOpenAuthModal('signin');
      return;
    }
    await saveJournalEntry(entry);

    if (extraction && extraction.actionItems && extraction.actionItems.length > 0) {
      const newActionItems: ExtractedActionItem[] = extraction.actionItems.map((item, idx) => ({
        id: `action-${Date.now()}-${idx}`,
        userId: user.uid,
        journalId: entry.id,
        journalTitle: entry.title,
        title: item.title,
        description: item.description || '',
        priority: item.priority,
        category: item.category,
        status: 'Pending',
        suggestedDeadline: item.suggestedDeadline || 'Next Few Days',
        tags: item.tags || [],
        createdAt: new Date().toISOString()
      }));

      await saveMultipleActionItems(user.uid, newActionItems);
    }
  };

  const handleExtractionSuccess = (result: ExtractionResult, journalTitle: string) => {
    setExtractionResult({ result, title: journalTitle });
  };

  const handleUpdateActionStatus = async (itemId: string, status: TaskStatus) => {
    if (!user) {
      handleOpenAuthModal('signin');
      return;
    }
    await updateActionItemStatus(user.uid, itemId, status);
  };

  const handleDeleteAction = async (itemId: string) => {
    if (!user) return;
    await deleteActionItem(user.uid, itemId);
  };

  const handleAddManualAction = async (item: ExtractedActionItem) => {
    if (!user) {
      handleOpenAuthModal('signin');
      return;
    }
    await saveActionItem(item);
  };

  const handleDeleteJournal = async (journalId: string) => {
    if (!user) return;
    if (confirm('Are you sure you want to delete this journal entry?')) {
      await deleteJournalEntry(user.uid, journalId);
      if (selectedJournal?.id === journalId) {
        setSelectedJournal(null);
      }
    }
  };

  const handleLogout = async () => {
    await logoutUser();
    setActiveTab('dashboard');
  };

  const handleStartNewJournal = () => {
    if (!user) {
      handleOpenAuthModal('signin');
      return;
    }
    setSelectedJournal(null);
    setActiveTab('journal');
  };

  const handleOpenExistingJournal = (entry: JournalEntry) => {
    if (!user) {
      handleOpenAuthModal('signin');
      return;
    }
    setSelectedJournal(entry);
    setActiveTab('journal');
  };

  const handleTabChange = (tab: AppTabType) => {
    if (!user && tab !== 'dashboard' && tab !== 'security') {
      handleOpenAuthModal('signin');
      return;
    }
    setActiveTab(tab);
  };

  const pendingActionsCount = actionItems.filter(i => i.status === 'Pending').length;

  // Loading Screen
  if (isLoadingAuth) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl max-w-sm w-full text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mx-auto shadow-2xs">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
          </div>
          <div className="space-y-1">
            <h2 className="text-base font-bold text-slate-900">Personal Gemini Journal</h2>
            <p className="text-xs text-slate-500">Verifying secure Firebase authentication state...</p>
          </div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-medium border border-emerald-200">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Zero-Trust Client Isolation</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        user={user}
        actionItemsCount={actionItems.length}
        pendingActionsCount={pendingActionsCount}
        onOpenAuth={() => handleOpenAuthModal('signin')}
        onLogout={handleLogout}
        onOpenSecurityModal={() => setIsSecurityModalOpen(true)}
      />

      {/* Guest Session Notification Banner */}
      {user?.isAnonymous && (
        <div className="bg-amber-500 text-white px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-2 shadow-xs">
          <div className="flex items-center space-x-2">
            <UserIcon className="w-3.5 h-3.5 shrink-0" />
            <span>
              <strong>Temporary Guest Session:</strong> Your journal data is stored in your private guest partition ({user.uid.slice(0, 8)}...).
            </span>
          </div>
          <button
            onClick={() => handleOpenAuthModal('signup')}
            className="px-2.5 py-1 rounded-md bg-white text-amber-900 font-bold text-[11px] hover:bg-amber-50 transition shrink-0 flex items-center space-x-1"
          >
            <span>Create Free Account to Save Permanently</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Main Viewport Content */}
      <main className="flex-1">
        {/* Unauthenticated Landing / Showcase */}
        {!user && activeTab === 'dashboard' && (
          <LandingPageView
            user={user}
            onGetStarted={() => handleOpenAuthModal('signup')}
            onOpenAuth={(mode) => handleOpenAuthModal(mode || 'signin')}
          />
        )}

        {/* Authenticated Dashboard */}
        {user && activeTab === 'dashboard' && (
          <DashboardView
            user={user}
            journals={journals}
            actionItems={actionItems}
            weeklyInsights={weeklyInsights}
            onStartNewJournal={handleStartNewJournal}
            onSelectJournal={handleOpenExistingJournal}
            onOpenSummary={(j) => setSummaryModalEntry(j)}
            onNavigateToTab={(t) => setActiveTab(t)}
            onOpenAuth={() => handleOpenAuthModal('signin')}
            onLogout={handleLogout}
          />
        )}

        {activeTab === 'journal' && (
          <JournalEditor
            user={user}
            initialEntry={selectedJournal}
            allJournals={journals}
            onSaveEntry={handleSaveEntry}
            onExtractionSuccess={handleExtractionSuccess}
            onOpenAuth={() => handleOpenAuthModal('signin')}
            onSelectJournal={handleOpenExistingJournal}
            onNewSession={() => setSelectedJournal(null)}
            onDeleteJournal={handleDeleteJournal}
            onNavigateToDashboard={() => setActiveTab('dashboard')}
          />
        )}

        {activeTab === 'weekly' && (
          <WeeklyInsightsView
            user={user}
            entries={journals}
            actionItems={actionItems}
            savedInsights={weeklyInsights}
            onOpenAuth={() => handleOpenAuthModal('signin')}
            onNavigateToJournal={(jId) => {
              if (jId) {
                const found = journals.find(j => j.id === jId);
                if (found) {
                  setSelectedJournal(found);
                  setActiveTab('journal');
                  return;
                }
              }
              handleStartNewJournal();
            }}
          />
        )}

        {activeTab === 'actions' && (
          <ActionItemsView
            user={user}
            actionItems={actionItems}
            onUpdateStatus={handleUpdateActionStatus}
            onDeleteItem={handleDeleteAction}
            onAddManualItem={handleAddManualAction}
            onNavigateToJournal={(jId) => {
              const found = journals.find(j => j.id === jId);
              if (found) {
                setSelectedJournal(found);
                setActiveTab('journal');
              } else {
                setActiveTab('history');
              }
            }}
          />
        )}

        {activeTab === 'history' && (
          <JournalHistoryView
            entries={journals}
            onDeleteEntry={handleDeleteJournal}
            onSelectEntry={(j) => handleOpenExistingJournal(j)}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsView
            entries={journals}
            actionItems={actionItems}
          />
        )}

        {activeTab === 'security' && (
          <PrivacySecurityView
            user={user}
            onOpenAuth={() => handleOpenAuthModal('signin')}
          />
        )}
      </main>

      {/* Summary Detail Inspection Modal */}
      <SummaryDetailModal
        isOpen={Boolean(summaryModalEntry)}
        onClose={() => setSummaryModalEntry(null)}
        entry={summaryModalEntry}
        onReopenJournal={(j) => {
          handleOpenExistingJournal(j);
        }}
      />

      {/* Security Architecture & Python Microservice Modal */}
      <SecurityArchitectureModal
        isOpen={isSecurityModalOpen}
        onClose={() => setIsSecurityModalOpen(false)}
      />

      {/* Action Item Extraction Result Celebration Modal */}
      <ExtractionResultModal
        isOpen={Boolean(extractionResult)}
        onClose={() => setExtractionResult(null)}
        result={extractionResult?.result || null}
        journalTitle={extractionResult?.title || ''}
        onGoToActions={() => {
          setExtractionResult(null);
          setActiveTab('actions');
        }}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        initialMode={authModalMode}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => {}}
      />

    </div>
  );
}

