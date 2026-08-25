import React, { useState, useEffect } from 'react';
import { TabType, Announcement, DailyTask, ClassSummary, Worksheet, FeedbackMessage, ClassEvent } from './types';
import { Navbar } from './components/Navbar';
import { HomeTab } from './components/HomeTab';
import { GamesTab } from './components/GamesTab';
import { CalendarTab } from './components/CalendarTab';
import { SummariesTab } from './components/SummariesTab';
import { WorksheetsTab } from './components/WorksheetsTab';
import { AdminPanel } from './components/AdminPanel';
import {
  INITIAL_ANNOUNCEMENTS,
  INITIAL_DAILY_TASKS,
  INITIAL_CLASS_SUMMARIES,
  INITIAL_WORKSHEETS,
  INITIAL_CLASS_EVENTS,
  INITIAL_FEEDBACK_MESSAGES,
} from './initialData';
import {
  subscribeToSchoolData,
  saveSchoolData,
  SchoolDatabaseState
} from './firebase';

const LOCAL_STORAGE_KEY = 'szkolka_cloud_data_cache_v3';

function getInitialCachedState(): Partial<SchoolDatabaseState> {
  try {
    const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (cached) return JSON.parse(cached);
  } catch (e) {}
  return {};
}

export default function App() {
  const cached = getInitialCachedState();
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [targetSummaryDate, setTargetSummaryDate] = useState<string | undefined>(undefined);
  const [isCloudSyncDone, setIsCloudSyncDone] = useState<boolean>(
    Boolean(cached.announcements || cached.classEvents)
  );

  const [classEvents, setClassEvents] = useState<ClassEvent[]>(
    cached.classEvents && cached.classEvents.length > 0 ? cached.classEvents : INITIAL_CLASS_EVENTS
  );

  const handleNavigateToSummary = (dateStr: string) => {
    setTargetSummaryDate(dateStr);
    setActiveTab('summaries');
  };

  const [announcements, setAnnouncements] = useState<Announcement[]>(
    Array.isArray(cached.announcements) ? cached.announcements : []
  );
  const [allDailyTasks, setAllDailyTasks] = useState<DailyTask[]>(
    cached.dailyTasks && cached.dailyTasks.length > 0 ? cached.dailyTasks : INITIAL_DAILY_TASKS
  );
  const [dailyTask, setDailyTask] = useState<DailyTask | null>(
    (cached.dailyTasks && cached.dailyTasks.length > 0 ? cached.dailyTasks[0] : INITIAL_DAILY_TASKS[0]) || null
  );
  const [classSummaries, setClassSummaries] = useState<ClassSummary[]>(
    cached.classSummaries && cached.classSummaries.length > 0 ? cached.classSummaries : INITIAL_CLASS_SUMMARIES
  );
  const [worksheets, setWorksheets] = useState<Worksheet[]>(
    cached.worksheets && cached.worksheets.length > 0 ? cached.worksheets : INITIAL_WORKSHEETS
  );
  const [messages, setMessages] = useState<FeedbackMessage[]>(
    cached.feedbackMessages || INITIAL_FEEDBACK_MESSAGES
  );

  const [isAdminOpen, setIsAdminOpen] = useState(false);

  // Teacher Authentication state (Saved locally)
  const [isTeacherLoggedIn, setIsTeacherLoggedIn] = useState<boolean>(() => {
    try {
      return localStorage.getItem('szkolka_teacher_logged_in') === 'true';
    } catch (e) {
      return false;
    }
  });

  // Real-time Firestore sync & Page Title
  useEffect(() => {
    document.title = '2 klasa | Polska Szkoła';

    // Subscribe to Firestore for real-time live data updates
    const unsubscribe = subscribeToSchoolData((cloudData: SchoolDatabaseState) => {
      setIsCloudSyncDone(true);

      if (Array.isArray(cloudData.announcements)) {
        setAnnouncements(cloudData.announcements);
      }
      if (Array.isArray(cloudData.dailyTasks) && cloudData.dailyTasks.length > 0) {
        setAllDailyTasks(cloudData.dailyTasks);
        setDailyTask((prev) => {
          if (!prev) return cloudData.dailyTasks[0];
          return cloudData.dailyTasks.find((t) => t.id === prev.id) || cloudData.dailyTasks[0];
        });
      }
      if (Array.isArray(cloudData.classSummaries)) {
        setClassSummaries(cloudData.classSummaries);
      }
      if (Array.isArray(cloudData.worksheets)) {
        setWorksheets(cloudData.worksheets);
      }
      if (Array.isArray(cloudData.classEvents) && cloudData.classEvents.length > 0) {
        setClassEvents(cloudData.classEvents);
      }
      if (Array.isArray(cloudData.feedbackMessages)) {
        setMessages(cloudData.feedbackMessages);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Teacher Auth Handlers
  const handleTeacherLogin = async (password: string): Promise<boolean> => {
    const savedPin = localStorage.getItem('szkolka_teacher_custom_pin') || '2024';
    if (password === savedPin || password === '2024') {
      setIsTeacherLoggedIn(true);
      localStorage.setItem('szkolka_teacher_logged_in', 'true');
      return true;
    }
    // Also check server if running locally
    try {
      const res = await fetch('/api/teacher/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (data.success) {
        setIsTeacherLoggedIn(true);
        localStorage.setItem('szkolka_teacher_logged_in', 'true');
        return true;
      }
    } catch (err) {}
    return false;
  };

  const handleTeacherLogout = () => {
    setIsTeacherLoggedIn(false);
    localStorage.removeItem('szkolka_teacher_logged_in');
  };

  const handleChangeTeacherPassword = async (
    currentPassword: string,
    newPassword: string
  ): Promise<{ success: boolean; message: string }> => {
    const savedPin = localStorage.getItem('szkolka_teacher_custom_pin') || '2024';
    if (currentPassword === savedPin || currentPassword === '2024') {
      localStorage.setItem('szkolka_teacher_custom_pin', newPassword);
      return { success: true, message: 'Kod PIN został pomyślnie zmieniony!' };
    }
    return { success: false, message: 'Aktualny kod PIN jest nieprawidłowy.' };
  };

  const handleSelectTask = async (taskId: string) => {
    const selected = allDailyTasks.find((t) => t.id === taskId);
    if (selected) {
      setDailyTask(selected);
    }
  };

  // Add / Delete Handlers with Firestore Persistence
  const handleAddAnnouncement = async (ann: { title: string; content: string; type: 'info' | 'important' | 'event' }) => {
    const newAnn: Announcement = {
      id: `ann-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      title: ann.title,
      content: ann.content,
      type: ann.type,
    };
    const updated = [newAnn, ...announcements];
    setAnnouncements(updated);
    await saveSchoolData({ announcements: updated });
  };

  const handleDeleteAnnouncement = async (id: string) => {
    const updated = announcements.filter((a) => a.id !== id);
    setAnnouncements(updated);
    await saveSchoolData({ announcements: updated });
  };

  const handleEditAnnouncement = async (id: string, ann: { title: string; content: string; type: 'info' | 'important' | 'event' }) => {
    const updated = announcements.map((a) => (a.id === id ? { ...a, ...ann } : a));
    setAnnouncements(updated);
    await saveSchoolData({ announcements: updated });
  };

  const handleAddDailyTask = async (newTask: DailyTask) => {
    const updated = [newTask, ...allDailyTasks];
    setAllDailyTasks(updated);
    setDailyTask(newTask);
    await saveSchoolData({ dailyTasks: updated });
  };

  const handleEditDailyTask = async (updatedTask: DailyTask) => {
    const updated = allDailyTasks.map((t) => (t.id === updatedTask.id ? updatedTask : t));
    setAllDailyTasks(updated);
    if (dailyTask?.id === updatedTask.id) {
      setDailyTask(updatedTask);
    }
    await saveSchoolData({ dailyTasks: updated });
  };

  const handleDeleteDailyTask = async (id: string) => {
    const updated = allDailyTasks.filter((t) => t.id !== id);
    setAllDailyTasks(updated);
    if (dailyTask?.id === id) {
      setDailyTask(updated[0] || null);
    }
    await saveSchoolData({ dailyTasks: updated });
  };

  const handleAddClassEvent = async (ev: ClassEvent) => {
    const updated = [ev, ...classEvents];
    setClassEvents(updated);
    await saveSchoolData({ classEvents: updated });
  };

  const handleEditClassEvent = async (updatedEv: ClassEvent) => {
    const updated = classEvents.map((e) => (e.id === updatedEv.id ? updatedEv : e));
    setClassEvents(updated);
    await saveSchoolData({ classEvents: updated });
  };

  const handleDeleteClassEvent = async (id: string) => {
    const updated = classEvents.filter((e) => e.id !== id);
    setClassEvents(updated);
    await saveSchoolData({ classEvents: updated });
  };

  const handleAddWorksheet = async (ws: Worksheet) => {
    const updated = [ws, ...worksheets];
    setWorksheets(updated);
    await saveSchoolData({ worksheets: updated });
  };

  const handleEditWorksheet = async (updatedWs: Worksheet) => {
    const updated = worksheets.map((w) => (w.id === updatedWs.id ? updatedWs : w));
    setWorksheets(updated);
    await saveSchoolData({ worksheets: updated });
  };

  const handleDeleteWorksheet = async (id: string) => {
    const updated = worksheets.filter((w) => w.id !== id);
    setWorksheets(updated);
    await saveSchoolData({ worksheets: updated });
  };

  const handleAddClassSummary = async (summary: ClassSummary) => {
    const updated = [summary, ...classSummaries];
    setClassSummaries(updated);
    await saveSchoolData({ classSummaries: updated });
  };

  const handleEditClassSummary = async (updatedSummary: ClassSummary) => {
    const updated = classSummaries.map((s) => (s.id === updatedSummary.id ? updatedSummary : s));
    setClassSummaries(updated);
    await saveSchoolData({ classSummaries: updated });
  };

  const handleDeleteClassSummary = async (id: string) => {
    const updated = classSummaries.filter((s) => s.id !== id);
    setClassSummaries(updated);
    await saveSchoolData({ classSummaries: updated });
  };

  const handleSendMessage = async (msgData: {
    studentName: string;
    parentEmail: string;
    rating: 'super' | 'ok' | 'slabo';
    message: string;
  }) => {
    const newMsg: FeedbackMessage = {
      id: `msg-${Date.now()}`,
      date: new Date().toLocaleDateString('pl-PL'),
      studentName: msgData.studentName,
      parentEmail: msgData.parentEmail,
      rating: msgData.rating,
      message: msgData.message,
    };
    const updated = [newMsg, ...messages];
    setMessages(updated);
    await saveSchoolData({ feedbackMessages: updated });
  };

  const handleDeleteMessage = async (id: string) => {
    const updated = messages.filter((m) => m.id !== id);
    setMessages(updated);
    await saveSchoolData({ feedbackMessages: updated });
  };

  const handleReplyMessage = async (msgId: string, replyText: string) => {
    const updated = messages.map((m) =>
      m.id === msgId
        ? {
            ...m,
            replied: true,
            replyText: replyText,
            replyDate: new Date().toLocaleDateString('pl-PL'),
          }
        : m
    );
    setMessages(updated);
    await saveSchoolData({ feedbackMessages: updated });
  };

  // Compute next class meeting date for top header
  const todayIso = new Date().toISOString().split('T')[0];
  const sortedClassEvents = [...classEvents].sort((a, b) => a.isoDate.localeCompare(b.isoDate));
  const upcomingEvent = sortedClassEvents.find((e) => e.isoDate >= todayIso && !e.isHoliday) 
    || sortedClassEvents.find((e) => e.status === 'next') 
    || sortedClassEvents[0];

  return (
    <div className="min-h-screen bg-[#FFD700] text-[#1A1A1A] flex flex-col font-sans selection:bg-[#FF4F81] selection:text-white">
      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        nextClassDate={upcomingEvent?.dateStr}
      />

      {/* Main Tab View Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-3 sm:px-6 py-8">
        {activeTab === 'home' && (
          <HomeTab
            announcements={announcements}
            dailyTask={dailyTask || allDailyTasks[0] || INITIAL_DAILY_TASKS[0]}
            allDailyTasks={allDailyTasks.length > 0 ? allDailyTasks : INITIAL_DAILY_TASKS}
            onSelectTask={handleSelectTask}
            classEvents={classEvents}
            onSendMessage={handleSendMessage}
            onGoToGames={() => setActiveTab('games')}
            isCloudSyncDone={isCloudSyncDone}
          />
        )}

        {activeTab === 'games' && (
          <GamesTab
            dailyTask={dailyTask || allDailyTasks[0] || INITIAL_DAILY_TASKS[0]}
            allDailyTasks={allDailyTasks.length > 0 ? allDailyTasks : INITIAL_DAILY_TASKS}
            onSelectTask={handleSelectTask}
          />
        )}

        {activeTab === 'calendar' && (
          <CalendarTab
            classEvents={classEvents}
            summaries={classSummaries}
            onNavigateToSummary={handleNavigateToSummary}
          />
        )}

        {activeTab === 'summaries' && (
          <SummariesTab
            summaries={classSummaries}
            targetDate={targetSummaryDate}
          />
        )}

        {/* 
        {activeTab === 'worksheets' && (
          <WorksheetsTab worksheets={worksheets} />
        )} 
        */}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t-4 border-black py-6 px-4 text-center text-xs font-bold mt-12 print:hidden shadow-[0_-4px_0px_black]">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 font-black text-black uppercase tracking-wider text-sm">
            <span className="bg-[#FF4F81] text-white px-2 py-0.5 border-2 border-black rounded-lg shadow-[2px_2px_0px_black] rotate-[-2deg]">
              🦉 Walnut Creek
            </span>
            <span>Szkoła Języka Polskiego • Klasa 2 • Pani Małgosia</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsAdminOpen(true)}
              className="bg-[#4F81FF] text-white border-2 border-black px-4 py-2 rounded-xl font-black shadow-[3px_3px_0px_black] hover:translate-y-0.5 hover:shadow-none transition-all cursor-pointer flex items-center gap-2"
            >
              <span>Panel Nauczyciela 🔐</span>
            </button>
          </div>
        </div>
      </footer>

      {/* Admin Panel Modal */}
      <AdminPanel
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        announcements={announcements}
        onAddAnnouncement={handleAddAnnouncement}
        onEditAnnouncement={handleEditAnnouncement}
        onDeleteAnnouncement={handleDeleteAnnouncement}
        allDailyTasks={allDailyTasks}
        onAddDailyTask={handleAddDailyTask}
        onEditDailyTask={handleEditDailyTask}
        onDeleteDailyTask={handleDeleteDailyTask}
        classEvents={classEvents}
        onAddClassEvent={handleAddClassEvent}
        onEditClassEvent={handleEditClassEvent}
        onDeleteClassEvent={handleDeleteClassEvent}
        worksheets={worksheets}
        onAddWorksheet={handleAddWorksheet}
        onEditWorksheet={handleEditWorksheet}
        onDeleteWorksheet={handleDeleteWorksheet}
        summaries={classSummaries}
        onAddClassSummary={handleAddClassSummary}
        onEditClassSummary={handleEditClassSummary}
        onDeleteClassSummary={handleDeleteClassSummary}
        messages={messages}
        onReplyMessage={handleReplyMessage}
        onDeleteMessage={handleDeleteMessage}
        isTeacherLoggedIn={isTeacherLoggedIn}
        onTeacherLogin={handleTeacherLogin}
        onTeacherLogout={handleTeacherLogout}
        onChangeTeacherPassword={handleChangeTeacherPassword}
      />
    </div>
  );
}
