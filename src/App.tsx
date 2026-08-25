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

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [targetSummaryDate, setTargetSummaryDate] = useState<string | undefined>(undefined);
  const [classEvents, setClassEvents] = useState<ClassEvent[]>(INITIAL_CLASS_EVENTS);

  const handleNavigateToSummary = (dateStr: string) => {
    setTargetSummaryDate(dateStr);
    setActiveTab('summaries');
  };

  const [announcements, setAnnouncements] = useState<Announcement[]>(INITIAL_ANNOUNCEMENTS);
  const [dailyTask, setDailyTask] = useState<DailyTask | null>(INITIAL_DAILY_TASKS[0] || null);
  const [allDailyTasks, setAllDailyTasks] = useState<DailyTask[]>(INITIAL_DAILY_TASKS);
  const [classSummaries, setClassSummaries] = useState<ClassSummary[]>(INITIAL_CLASS_SUMMARIES);
  const [worksheets, setWorksheets] = useState<Worksheet[]>(INITIAL_WORKSHEETS);
  const [messages, setMessages] = useState<FeedbackMessage[]>(INITIAL_FEEDBACK_MESSAGES);

  const [isAdminOpen, setIsAdminOpen] = useState(false);

  // Teacher Authentication state
  const [isTeacherLoggedIn, setIsTeacherLoggedIn] = useState<boolean>(() => {
    try {
      return localStorage.getItem('szkolka_teacher_logged_in') === 'true';
    } catch (e) {
      return false;
    }
  });

  // Initial Data Fetching from Server Database & Page Title
  useEffect(() => {
    document.title = '2 klasa | Polska Szkoła';
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [annRes, taskRes, sumRes, wsRes, msgRes, evRes] = await Promise.all([
        fetch('/api/announcements').catch(() => null),
        fetch('/api/daily-task').catch(() => null),
        fetch('/api/class-summaries').catch(() => null),
        fetch('/api/worksheets').catch(() => null),
        fetch('/api/messages').catch(() => null),
        fetch('/api/class-events').catch(() => null),
      ]);

      if (annRes && annRes.ok) {
        const annData = await annRes.json().catch(() => ({}));
        if (Array.isArray(annData.announcements) && annData.announcements.length > 0) {
          setAnnouncements(annData.announcements);
        }
      }

      if (taskRes && taskRes.ok) {
        const taskData = await taskRes.json().catch(() => ({}));
        if (taskData.currentTask) setDailyTask(taskData.currentTask);
        if (Array.isArray(taskData.allTasks) && taskData.allTasks.length > 0) {
          setAllDailyTasks(taskData.allTasks);
        }
      }

      if (sumRes && sumRes.ok) {
        const sumData = await sumRes.json().catch(() => ({}));
        if (Array.isArray(sumData.classSummaries) && sumData.classSummaries.length > 0) {
          setClassSummaries(sumData.classSummaries);
        }
      }

      if (wsRes && wsRes.ok) {
        const wsData = await wsRes.json().catch(() => ({}));
        if (Array.isArray(wsData.worksheets) && wsData.worksheets.length > 0) {
          setWorksheets(wsData.worksheets);
        }
      }

      if (msgRes && msgRes.ok) {
        const msgData = await msgRes.json().catch(() => ({}));
        if (Array.isArray(msgData.messages)) {
          setMessages(msgData.messages);
        }
      }

      if (evRes && evRes.ok) {
        const evData = await evRes.json().catch(() => ({}));
        if (Array.isArray(evData.classEvents) && evData.classEvents.length > 0) {
          setClassEvents(evData.classEvents);
        }
      }
    } catch (err) {
      console.error('Error fetching data from server:', err);
    }
  };

  // Teacher Auth Handlers
  const handleTeacherLogin = async (password: string): Promise<boolean> => {
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
    } catch (err) {
      console.error('Teacher login error:', err);
    }
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
    try {
      const res = await fetch('/api/teacher/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      return { success: !!data.success, message: data.message || 'Wystąpił błąd' };
    } catch (err) {
      return { success: false, message: 'Błąd połączenia z serwerem' };
    }
  };

  const handleSelectTask = async (taskId: string) => {
    const selected = allDailyTasks.find((t) => t.id === taskId);
    if (selected) {
      setDailyTask(selected);
      try {
        await fetch('/api/daily-task/set-active', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: taskId }),
        });
      } catch (e) {}
    }
  };

  // Add / Delete Handlers
  const handleAddAnnouncement = async (ann: { title: string; content: string; type: 'info' | 'important' | 'event' }) => {
    try {
      const res = await fetch('/api/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ann),
      });
      const data = await res.json();
      if (data.announcement) {
        setAnnouncements((prev) => [data.announcement, ...prev]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    try {
      await fetch(`/api/announcements/${id}`, { method: 'DELETE' });
      setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditAnnouncement = async (id: string, ann: { title: string; content: string; type: 'info' | 'important' | 'event' }) => {
    try {
      const res = await fetch(`/api/announcements/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ann),
      });
      const data = await res.json();
      if (data.announcement) {
        setAnnouncements((prev) => prev.map((a) => (a.id === id ? data.announcement : a)));
      } else {
        setAnnouncements((prev) => prev.map((a) => (a.id === id ? { ...a, ...ann } : a)));
      }
    } catch (err) {
      setAnnouncements((prev) => prev.map((a) => (a.id === id ? { ...a, ...ann } : a)));
    }
  };

  const handleAddDailyTask = async (newTask: DailyTask) => {
    try {
      const res = await fetch('/api/daily-task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTask),
      });
      const data = await res.json();
      if (data.task) {
        setAllDailyTasks((prev) => [data.task, ...prev]);
        setDailyTask(data.task);
      }
    } catch (err) {
      setAllDailyTasks((prev) => [newTask, ...prev]);
      setDailyTask(newTask);
    }
  };

  const handleEditDailyTask = async (updatedTask: DailyTask) => {
    try {
      const res = await fetch(`/api/daily-task/${updatedTask.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedTask),
      });
      const data = await res.json();
      const finalTask = data.task || updatedTask;
      setAllDailyTasks((prev) => prev.map((t) => (t.id === updatedTask.id ? finalTask : t)));
      if (dailyTask?.id === updatedTask.id) {
        setDailyTask(finalTask);
      }
    } catch (err) {
      setAllDailyTasks((prev) => prev.map((t) => (t.id === updatedTask.id ? updatedTask : t)));
      if (dailyTask?.id === updatedTask.id) {
        setDailyTask(updatedTask);
      }
    }
  };

  const handleDeleteDailyTask = async (id: string) => {
    try {
      await fetch(`/api/daily-task/${id}`, { method: 'DELETE' });
      setAllDailyTasks((prev) => prev.filter((t) => t.id !== id));
      if (dailyTask?.id === id) {
        setDailyTask(allDailyTasks.find((t) => t.id !== id) || null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddClassEvent = async (ev: ClassEvent) => {
    try {
      const res = await fetch('/api/class-events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ev),
      });
      const data = await res.json();
      if (data.classEvent) {
        setClassEvents((prev) => [data.classEvent, ...prev]);
      }
    } catch (err) {
      setClassEvents((prev) => [ev, ...prev]);
    }
  };

  const handleEditClassEvent = async (updatedEv: ClassEvent) => {
    try {
      const res = await fetch(`/api/class-events/${updatedEv.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedEv),
      });
      const data = await res.json();
      const finalEv = data.classEvent || updatedEv;
      setClassEvents((prev) => prev.map((e) => (e.id === updatedEv.id ? finalEv : e)));
    } catch (err) {
      setClassEvents((prev) => prev.map((e) => (e.id === updatedEv.id ? updatedEv : e)));
    }
  };

  const handleDeleteClassEvent = async (id: string) => {
    try {
      await fetch(`/api/class-events/${id}`, { method: 'DELETE' });
      setClassEvents((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddWorksheet = async (ws: Worksheet) => {
    try {
      const res = await fetch('/api/worksheets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ws),
      });
      const data = await res.json();
      if (data.worksheet) {
        setWorksheets((prev) => [data.worksheet, ...prev]);
      } else {
        setWorksheets((prev) => [ws, ...prev]);
      }
    } catch (err) {
      setWorksheets((prev) => [ws, ...prev]);
    }
  };

  const handleEditWorksheet = async (updatedWs: Worksheet) => {
    try {
      const res = await fetch(`/api/worksheets/${updatedWs.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedWs),
      });
      const data = await res.json();
      const finalWs = data.worksheet || updatedWs;
      setWorksheets((prev) => prev.map((w) => (w.id === updatedWs.id ? finalWs : w)));
    } catch (err) {
      setWorksheets((prev) => prev.map((w) => (w.id === updatedWs.id ? updatedWs : w)));
    }
  };

  const handleDeleteWorksheet = async (id: string) => {
    try {
      await fetch(`/api/worksheets/${id}`, { method: 'DELETE' });
      setWorksheets((prev) => prev.filter((w) => w.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddClassSummary = async (summary: ClassSummary) => {
    try {
      const res = await fetch('/api/class-summaries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(summary),
      });
      const data = await res.json();
      if (data.summary) {
        setClassSummaries((prev) => [data.summary, ...prev]);
      } else {
        setClassSummaries((prev) => [summary, ...prev]);
      }
    } catch (err) {
      setClassSummaries((prev) => [summary, ...prev]);
    }
  };

  const handleEditClassSummary = async (updatedSummary: ClassSummary) => {
    try {
      const res = await fetch(`/api/class-summaries/${updatedSummary.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedSummary),
      });
      const data = await res.json();
      const finalSummary = data.summary || updatedSummary;
      setClassSummaries((prev) => prev.map((s) => (s.id === updatedSummary.id ? finalSummary : s)));
    } catch (err) {
      setClassSummaries((prev) => prev.map((s) => (s.id === updatedSummary.id ? updatedSummary : s)));
    }
  };

  const handleDeleteClassSummary = async (id: string) => {
    try {
      await fetch(`/api/class-summaries/${id}`, { method: 'DELETE' });
      setClassSummaries((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendMessage = async (msgData: {
    studentName: string;
    parentEmail: string;
    rating: 'super' | 'ok' | 'slabo';
    message: string;
  }) => {
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(msgData),
      });
      const data = await res.json();
      if (data.message) {
        setMessages((prev) => [data.message, ...prev]);
      }
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  const handleDeleteMessage = async (id: string) => {
    try {
      await fetch(`/api/messages/${id}`, { method: 'DELETE' });
      setMessages((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleReplyMessage = async (msgId: string, replyText: string) => {
    try {
      const res = await fetch(`/api/messages/${msgId}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ replyText }),
      });
      const data = await res.json();
      if (data.message) {
        setMessages((prev) => prev.map((m) => (m.id === msgId ? data.message : m)));
      }
    } catch (err) {
      console.error('Error replying message:', err);
    }
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
