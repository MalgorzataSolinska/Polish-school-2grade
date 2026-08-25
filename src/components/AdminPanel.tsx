import React, { useState } from 'react';
import { Announcement, DailyTask, ClassSummary, Worksheet, FeedbackMessage, ClassEvent, GameType, SpellingItem, MatchingItem, StoryQuestion, GeographyQuizQuestion } from '../types';
import { playSuccessSound } from '../utils/audio';
import { Lock, Megaphone, Calendar, FileText, Mail, Plus, ShieldCheck, X, Upload, KeyRound, Trash2, BookOpen, Gamepad2, Sparkles, CheckCircle2, Pencil, Edit } from 'lucide-react';
import { getEmojiForWord } from '../utils/wordHelpers';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  // Announcements
  announcements: Announcement[];
  onAddAnnouncement: (ann: { title: string; content: string; type: 'info' | 'important' | 'event' }) => void;
  onEditAnnouncement?: (id: string, ann: { title: string; content: string; type: 'info' | 'important' | 'event' }) => void;
  onDeleteAnnouncement: (id: string) => void;
  // Daily Tasks
  allDailyTasks: DailyTask[];
  onAddDailyTask: (newTask: DailyTask) => void;
  onEditDailyTask?: (updatedTask: DailyTask) => void;
  onDeleteDailyTask: (id: string) => void;
  // Class Events (Calendar)
  classEvents: ClassEvent[];
  onAddClassEvent: (ev: ClassEvent) => void;
  onEditClassEvent?: (updatedEv: ClassEvent) => void;
  onDeleteClassEvent: (id: string) => void;
  // Worksheets
  worksheets: Worksheet[];
  onAddWorksheet: (ws: Worksheet) => void;
  onEditWorksheet?: (updatedWs: Worksheet) => void;
  onDeleteWorksheet: (id: string) => void;
  // Summaries
  summaries: ClassSummary[];
  onAddClassSummary: (summary: ClassSummary) => void;
  onEditClassSummary?: (updatedSummary: ClassSummary) => void;
  onDeleteClassSummary: (id: string) => void;
  // Messages
  messages: FeedbackMessage[];
  onReplyMessage: (msgId: string, replyText: string) => void;
  onDeleteMessage: (id: string) => void;
  // Auth
  isTeacherLoggedIn: boolean;
  onTeacherLogin: (password: string) => Promise<boolean>;
  onTeacherLogout: () => void;
  onChangeTeacherPassword: (currPass: string, newPass: string) => Promise<{ success: boolean; message: string }>;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  isOpen,
  onClose,
  announcements,
  onAddAnnouncement,
  onEditAnnouncement,
  onDeleteAnnouncement,
  allDailyTasks,
  onAddDailyTask,
  onEditDailyTask,
  onDeleteDailyTask,
  classEvents,
  onAddClassEvent,
  onEditClassEvent,
  onDeleteClassEvent,
  worksheets,
  onAddWorksheet,
  onEditWorksheet,
  onDeleteWorksheet,
  summaries,
  onAddClassSummary,
  onEditClassSummary,
  onDeleteClassSummary,
  messages,
  onReplyMessage,
  onDeleteMessage,
  isTeacherLoggedIn,
  onTeacherLogin,
  onTeacherLogout,
  onChangeTeacherPassword,
}) => {
  const [pinInput, setPinInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [activeAdminTab, setActiveAdminTab] = useState<'announcements' | 'games' | 'calendar' | 'worksheets' | 'summaries' | 'messages' | 'password'>('announcements');

  // Announcement Form State
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [annType, setAnnType] = useState<'info' | 'important' | 'event'>('info');

  // Game/Task Form State
  const [taskTitle, setTaskTitle] = useState('');
  const [taskType, setTaskType] = useState<GameType>('spelling');
  const [taskDescription, setTaskDescription] = useState('Dotknij liter, aby ułożyć słowa z lekcji!');
  const [taskWordsInput, setTaskWordsInput] = useState('SYRENKA, WARSZAWA, WISŁA, KRAKÓW, FLAGA');

  // Calendar Event Form State
  const [evDateStr, setEvDateStr] = useState('Sobota, 22 Sierpnia 2026');
  const [evIsoDate, setEvIsoDate] = useState('2026-08-22');
  const [evTopic, setEvTopic] = useState('');
  const [evTime, setEvTime] = useState('09:30 - 14:30');
  const [evRoom, setEvRoom] = useState('Sala nr 14');
  const [evIsHoliday, setEvIsHoliday] = useState(false);
  const [evNotes, setEvNotes] = useState('');

  // Worksheet Form State
  const [wsTitle, setWsTitle] = useState('');
  const [wsCategory, setWsCategory] = useState<'polski' | 'czytanie' | 'geografia' | 'lamiglowki'>('polski');
  const [wsDesc, setWsDesc] = useState('');
  const [wsPdfData, setWsPdfData] = useState<string | undefined>(undefined);
  const [wsFileName, setWsFileName] = useState<string>('');
  const [wsFileSize, setWsFileSize] = useState<string>('');

  // Class Summary Form State (Dynamic lists)
  const [sumDate, setSumDate] = useState('Sobota, 22 Sierpnia 2026');
  const [sumTopic, setSumTopic] = useState('');
  const [sumDesc, setSumDesc] = useState('');
  const [sumSkillsList, setSumSkillsList] = useState<string[]>(['Czytanie ze zrozumieniem legend', 'Rozróżnianie RZ i Ż']);
  const [sumActivitiesList, setSumActivitiesList] = useState<string[]>(['Głośne czytanie legendy o Syrence', 'Praca plastyczna z wycinanek']);
  const [sumVocabInput, setSumVocabInput] = useState('Syrenka, Warszawa, Tarcza, Miecz, Rzeka, Orzeł');
  const [sumHomeworkList, setSumHomeworkList] = useState<string[]>(['Nauczyć się pisowni 5 słówek z lekcji', 'Dokończyć stronę 14 w zeszycie ćwiczeń']);

  // Editing IDs state
  const [editingAnnId, setEditingAnnId] = useState<string | null>(null);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [editingWsId, setEditingWsId] = useState<string | null>(null);
  const [editingSummaryId, setEditingSummaryId] = useState<string | null>(null);
  const [eventNotification, setEventNotification] = useState<string | null>(null);

  // Password Form State
  const [currPassInput, setCurrPassInput] = useState('');
  const [newPassInput, setNewPassInput] = useState('');
  const [passStatus, setPassStatus] = useState<{ msg: string; error: boolean } | null>(null);

  if (!isOpen) return null;

  // Edit helper triggers
  const startEditingAnn = (ann: Announcement) => {
    setEditingAnnId(ann.id);
    setAnnTitle(ann.title);
    setAnnContent(ann.content);
    setAnnType(ann.type || 'info');
  };

  const cancelEditAnn = () => {
    setEditingAnnId(null);
    setAnnTitle('');
    setAnnContent('');
    setAnnType('info');
  };

  const startEditingGame = (task: DailyTask) => {
    setEditingTaskId(task.id);
    setTaskTitle(task.title);
    setTaskType(task.type);
    setTaskDescription(task.description);

    let words = '';
    if (task.spelling && task.spelling.length > 0) {
      words = task.spelling.map((s) => s.word).join(', ');
    } else if (task.wordSearch?.words) {
      words = task.wordSearch.words.map((w) => w.pl).join(', ');
    } else if (task.matching && task.matching.length > 0) {
      words = task.matching.map((m) => m.wordPl).join(', ');
    }
    setTaskWordsInput(words);
  };

  const cancelEditGame = () => {
    setEditingTaskId(null);
    setTaskTitle('');
    setTaskDescription('Dotknij liter, aby ułożyć słowa z lekcji!');
    setTaskWordsInput('SYRENKA, WARSZAWA, WISŁA, KRAKÓW, FLAGA');
  };

  const startEditingEvent = (ev: ClassEvent) => {
    setEditingEventId(ev.id);
    setEvDateStr(ev.dateStr);
    setEvIsoDate(ev.isoDate);
    setEvTopic(ev.topic);
    setEvTime(ev.time);
    setEvRoom(ev.room);
    setEvIsHoliday(!!ev.isHoliday);
    setEvNotes(ev.notes || '');
  };

  const cancelEditEvent = () => {
    setEditingEventId(null);
    setEvDateStr('Sobota, 22 Sierpnia 2026');
    setEvIsoDate('2026-08-22');
    setEvTopic('');
    setEvTime('09:30 - 14:30');
    setEvRoom('Sala nr 14');
    setEvIsHoliday(false);
    setEvNotes('');
  };

  const startEditingWs = (ws: Worksheet) => {
    setEditingWsId(ws.id);
    setWsTitle(ws.title);
    setWsCategory(ws.category);
    setWsDesc(ws.description || '');
    setWsPdfData(ws.pdfUrl);
    setWsFileName(ws.fileName || '');
    setWsFileSize(ws.fileSize || '');
  };

  const cancelEditWs = () => {
    setEditingWsId(null);
    setWsTitle('');
    setWsDesc('');
    setWsPdfData(undefined);
    setWsFileName('');
    setWsFileSize('');
  };

  const startEditingSummary = (sum: ClassSummary) => {
    setEditingSummaryId(sum.id);
    setSumDate(sum.date);
    setSumTopic(sum.topic);
    setSumDesc(sum.description);
    setSumSkillsList(sum.skills && sum.skills.length > 0 ? [...sum.skills] : ['']);
    setSumActivitiesList(sum.activities && sum.activities.length > 0 ? [...sum.activities] : ['']);
    setSumVocabInput(sum.vocabulary ? sum.vocabulary.map((v) => v.pl).join(', ') : '');
    setSumHomeworkList(
      sum.homework && sum.homework.length > 0
        ? sum.homework.map((h) => (typeof h === 'string' ? h : h.text))
        : ['']
    );
  };

  const cancelEditSummary = () => {
    setEditingSummaryId(null);
    setSumDate('Sobota, 22 Sierpnia 2026');
    setSumTopic('');
    setSumDesc('');
    setSumSkillsList(['Czytanie ze zrozumieniem legend', 'Rozróżnianie RZ i Ż']);
    setSumActivitiesList(['Głośne czytanie legendy o Syrence', 'Praca plastyczna z wycinanek']);
    setSumVocabInput('Syrenka, Warszawa, Tarcza, Miecz, Rzeka, Orzeł');
    setSumHomeworkList(['Nauczyć się pisowni 5 słówek z lekcji', 'Dokończyć stronę 14 w zeszycie ćwiczeń']);
  };

  // Helpers for Summary Dynamic Lists
  const handleAddSkill = () => setSumSkillsList((prev) => [...prev, '']);
  const handleUpdateSkill = (index: number, val: string) => {
    setSumSkillsList((prev) => {
      const next = [...prev];
      next[index] = val;
      return next;
    });
  };
  const handleRemoveSkill = (index: number) => setSumSkillsList((prev) => prev.filter((_, i) => i !== index));

  const handleAddActivity = () => setSumActivitiesList((prev) => [...prev, '']);
  const handleUpdateActivity = (index: number, val: string) => {
    setSumActivitiesList((prev) => {
      const next = [...prev];
      next[index] = val;
      return next;
    });
  };
  const handleRemoveActivity = (index: number) => setSumActivitiesList((prev) => prev.filter((_, i) => i !== index));

  const handleAddHomework = () => setSumHomeworkList((prev) => [...prev, '']);
  const handleUpdateHomework = (index: number, val: string) => {
    setSumHomeworkList((prev) => {
      const next = [...prev];
      next[index] = val;
      return next;
    });
  };
  const handleRemoveHomework = (index: number) => setSumHomeworkList((prev) => prev.filter((_, i) => i !== index));

  const handleAuthenticate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    const success = await onTeacherLogin(pinInput);
    if (success) {
      playSuccessSound();
      setPinInput('');
    } else {
      setLoginError('Niepoprawne hasło nauczyciela.');
    }
  };

  const handleAddAnnSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle || !annContent) return;
    if (editingAnnId && onEditAnnouncement) {
      onEditAnnouncement(editingAnnId, { title: annTitle, content: annContent, type: annType });
      setEditingAnnId(null);
    } else {
      onAddAnnouncement({ title: annTitle, content: annContent, type: annType });
    }
    setAnnTitle('');
    setAnnContent('');
    playSuccessSound();
  };

  const handleAddGameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle) return;

    const rawWords = taskWordsInput
      .split(',')
      .map((w) => w.trim())
      .filter((w) => w.length > 0);

    const taskId = editingTaskId || `task-${Date.now()}`;
    const newTask: DailyTask = {
      id: taskId,
      date: 'Zadanie Pani Małgosi',
      title: taskTitle,
      titleEn: taskTitle,
      description: taskDescription,
      descriptionEn: taskDescription,
      type: taskType,
      starsReward: 15,
    };

    if (taskType === 'spelling' || taskType === 'secret_word' || taskType === 'syllables') {
      const spellingItems: SpellingItem[] = rawWords.map((w, idx) => ({
        id: `sp-${idx}-${Date.now()}`,
        word: w.toUpperCase(),
        hint: `Ułóż polskie słowo z kafelków!`,
        emoji: getEmojiForWord(w),
      }));
      newTask.spelling = spellingItems;
    } else if (taskType === 'wordsearch') {
      newTask.wordSearch = {
        words: rawWords.map((w) => ({ pl: w.toUpperCase(), en: w })),
        gridSize: 8,
      };
    }

    if (editingTaskId && onEditDailyTask) {
      onEditDailyTask(newTask);
      setEditingTaskId(null);
    } else {
      onAddDailyTask(newTask);
    }
    setTaskTitle('');
    playSuccessSound();
  };

  const handleDateChange = (iso: string) => {
    setEvIsoDate(iso);
    if (!iso) return;
    try {
      const [y, m, d] = iso.split('-').map(Number);
      const dt = new Date(y, m - 1, d);
      const days = ['Niedziela', 'Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota'];
      const months = [
        'Stycznia', 'Lutego', 'Marca', 'Kwietnia', 'Maja', 'Czerwca',
        'Lipca', 'Sierpnia', 'Września', 'Października', 'Listopada', 'Grudnia'
      ];
      const dayName = days[dt.getDay()];
      const monthName = months[m - 1];
      setEvDateStr(`${dayName}, ${d} ${monthName} ${y}`);

      // Auto-load existing event for this date so editing is seamless
      const existing = classEvents.find((e) => e.isoDate === iso);
      if (existing) {
        setEditingEventId(existing.id);
        setEvTopic(existing.topic);
        setEvTime(existing.time || '09:30 - 14:30');
        setEvRoom(existing.room || 'Sala nr 14');
        setEvIsHoliday(!!existing.isHoliday);
        setEvNotes(existing.notes || '');
      } else if (editingEventId) {
        setEditingEventId(null);
      }
    } catch (e) {}
  };

  const handleAddEventSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!evTopic) return;

    // Check if an event for this ISO date already exists in the calendar
    const existingSameDate = classEvents.find((e) => e.isoDate === evIsoDate.trim());
    const eventId = editingEventId || (existingSameDate ? existingSameDate.id : `ev-${Date.now()}`);

    const newEv: ClassEvent = {
      id: eventId,
      dateStr: evDateStr.trim(),
      dayOfWeek: 'Sobota',
      isoDate: evIsoDate.trim(),
      time: (evTime || '09:30 - 14:30').trim(),
      topic: evTopic.trim(),
      room: evIsHoliday ? '—' : (evRoom || 'Sala nr 14').trim(),
      isHoliday: !!evIsHoliday,
      notes: (evNotes || '').trim(),
    };

    if ((editingEventId || existingSameDate) && onEditClassEvent) {
      onEditClassEvent(newEv);
      setEditingEventId(null);
    } else {
      onAddClassEvent(newEv);
    }

    setEventNotification('✅ Zapisano pomyślnie w chmurze! Temat lekcji i data są już zsynchronizowane.');
    setTimeout(() => {
      setEventNotification(null);
    }, 4000);

    setEvTopic('');
    setEvNotes('');
    playSuccessSound();
  };

  const handlePdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setWsPdfData(reader.result as string);
        setWsFileName(file.name);
        setWsFileSize(`${(file.size / 1024).toFixed(0)} KB`);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddWorksheetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!wsTitle) return;

    const wsId = editingWsId || `ws-${Date.now()}`;
    const newWs: Worksheet = {
      id: wsId,
      title: wsTitle,
      category: wsCategory,
      description: wsDesc || 'Materiały dydaktyczne przygotowane przez Panią Małgosię.',
      estimatedTime: '15 min',
      previewLines: ['1. Przeczytaj uważnie polecenie', '2. Uzupełnij brakujące litery'],
      downloadName: wsFileName || `${wsTitle.replace(/\s+/g, '_')}.pdf`,
      pdfUrl: wsPdfData,
      fileName: wsFileName || 'Kserowka_Klasa2.pdf',
      fileSize: wsFileSize || '200 KB',
      addedByTeacher: true,
    };

    if (editingWsId && onEditWorksheet) {
      onEditWorksheet(newWs);
      setEditingWsId(null);
    } else {
      onAddWorksheet(newWs);
    }

    setWsTitle('');
    setWsDesc('');
    setWsPdfData(undefined);
    setWsFileName('');
    playSuccessSound();
  };

  const handleAddSummarySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sumTopic || !sumDesc) return;

    const filteredSkills = sumSkillsList.map((s) => s.trim()).filter((s) => s.length > 0);
    const filteredActivities = sumActivitiesList.map((a) => a.trim()).filter((a) => a.length > 0);
    const filteredHomework = sumHomeworkList.map((h) => h.trim()).filter((h) => h.length > 0);

    const vocabArray = sumVocabInput
      .split(',')
      .map((v) => ({ pl: v.trim(), en: 'Słówko z lekcji' }))
      .filter((v) => v.pl.length > 0);

    const summaryId = editingSummaryId || `sum-${Date.now()}`;
    const newSummary: ClassSummary = {
      id: summaryId,
      date: sumDate,
      topic: sumTopic,
      description: sumDesc,
      skills: filteredSkills.length > 0 ? filteredSkills : ['Czytanie ze zrozumieniem'],
      activities: filteredActivities.length > 0 ? filteredActivities : ['Ćwiczenia z podręcznikiem'],
      vocabulary: vocabArray,
      homework: filteredHomework.map((hwText, idx) => ({
        id: `hw-${Date.now()}-${idx}`,
        text: hwText,
        completed: false,
      })),
    };

    if (editingSummaryId && onEditClassSummary) {
      onEditClassSummary(newSummary);
      setEditingSummaryId(null);
    } else {
      onAddClassSummary(newSummary);
    }

    cancelEditSummary();
    playSuccessSound();
  };

  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await onChangeTeacherPassword(currPassInput, newPassInput);
    if (res.success) {
      setPassStatus({ msg: res.message, error: false });
      setCurrPassInput('');
      setNewPassInput('');
      playSuccessSound();
    } else {
      setPassStatus({ msg: res.message, error: true });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white w-full max-w-5xl rounded-3xl shadow-[10px_10px_0px_black] border-4 border-black overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Bar */}
        <div className="bg-[#FF4F81] text-white p-4 border-b-4 border-black flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-black text-white rounded-xl border-2 border-white shadow-[2px_2px_0px_black]">
              <ShieldCheck className="w-6 h-6 text-yellow-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight drop-shadow-[2px_2px_0px_black]">
                  Panel Nauczyciela 🔐
                </h2>
                <span className="bg-emerald-400 text-black text-[10px] font-black px-2 py-0.5 rounded-full border border-black shadow-[1px_1px_0px_black] flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-700 animate-pulse"></span>
                  Baza w Chmurze (Na Żywo)
                </span>
              </div>
              <p className="text-xs text-yellow-200 font-bold">
                Szkoła Języka Polskiego w Walnut Creek • Zmiany zapisują się w chmurze i od razu pojawiają na stronie
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isTeacherLoggedIn && (
              <button
                onClick={onTeacherLogout}
                className="px-3 py-1 bg-black text-yellow-300 border-2 border-white rounded-xl text-xs font-black cursor-pointer hover:bg-gray-900 transition"
              >
                Wyloguj 🚪
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 bg-black text-white border-2 border-white rounded-xl hover:bg-gray-800 cursor-pointer transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {!isTeacherLoggedIn ? (
          /* Login View */
          <div className="p-8 text-center max-w-md mx-auto my-auto space-y-4">
            <Lock className="w-12 h-12 text-[#FF4F81] mx-auto" />
            <h3 className="text-2xl font-black text-black uppercase">
              Logowanie do Panelu
            </h3>
            <p className="text-xs text-gray-800 font-bold">
              Wpisz hasło nauczyciela, aby dodawać lub edytować materiały na stronie:
            </p>

            <form onSubmit={handleAuthenticate} className="space-y-3">
              <input
                type="password"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="Hasło..."
                className="w-full px-4 py-2.5 rounded-xl border-3 border-black text-center text-sm font-black focus:outline-none"
              />

              {loginError && (
                <p className="text-xs font-black text-rose-700 bg-rose-100 p-2 rounded-xl border border-rose-400">
                  {loginError}
                </p>
              )}

              <button
                type="submit"
                className="w-full bg-[#FFD700] text-black border-3 border-black font-black py-2.5 rounded-xl text-xs cursor-pointer shadow-[4px_4px_0px_black] hover:translate-y-0.5 hover:shadow-none transition-all uppercase"
              >
                Zaloguj jako Pani Małgosia 🔓
              </button>
            </form>
          </div>
        ) : (
          /* Authenticated Admin Dashboard */
          <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
            {/* Sidebar Navigation */}
            <div className="w-full md:w-64 bg-[#FFD700] border-r-4 border-black p-3 flex md:flex-col gap-2 overflow-x-auto shrink-0">
              <button
                onClick={() => setActiveAdminTab('announcements')}
                className={`p-2.5 rounded-xl text-xs font-black text-left flex items-center gap-2 cursor-pointer transition border-2 border-black ${
                  activeAdminTab === 'announcements' ? 'bg-[#FF4F81] text-white shadow-[2px_2px_0px_black]' : 'bg-white text-black hover:bg-yellow-200'
                }`}
              >
                <Megaphone className="w-4 h-4 shrink-0" />
                <span>1. Ogłoszenia ({announcements.length})</span>
              </button>

              <button
                onClick={() => setActiveAdminTab('games')}
                className={`p-2.5 rounded-xl text-xs font-black text-left flex items-center gap-2 cursor-pointer transition border-2 border-black ${
                  activeAdminTab === 'games' ? 'bg-[#FF4F81] text-white shadow-[2px_2px_0px_black]' : 'bg-white text-black hover:bg-yellow-200'
                }`}
              >
                <Gamepad2 className="w-4 h-4 shrink-0" />
                <span>2. Dodawanie Gier ({allDailyTasks.length})</span>
              </button>

              <button
                onClick={() => setActiveAdminTab('calendar')}
                className={`p-2.5 rounded-xl text-xs font-black text-left flex items-center gap-2 cursor-pointer transition border-2 border-black ${
                  activeAdminTab === 'calendar' ? 'bg-[#FF4F81] text-white shadow-[2px_2px_0px_black]' : 'bg-white text-black hover:bg-yellow-200'
                }`}
              >
                <Calendar className="w-4 h-4 shrink-0" />
                <span>3. Kalendarz Zajęć ({classEvents.length})</span>
              </button>

              <button
                onClick={() => setActiveAdminTab('worksheets')}
                className={`p-2.5 rounded-xl text-xs font-black text-left flex items-center gap-2 cursor-pointer transition border-2 border-black ${
                  activeAdminTab === 'worksheets' ? 'bg-[#FF4F81] text-white shadow-[2px_2px_0px_black]' : 'bg-white text-black hover:bg-yellow-200'
                }`}
              >
                <Upload className="w-4 h-4 shrink-0" />
                <span>4. Kserówki / PDF ({worksheets.length})</span>
              </button>

              <button
                onClick={() => setActiveAdminTab('summaries')}
                className={`p-2.5 rounded-xl text-xs font-black text-left flex items-center gap-2 cursor-pointer transition border-2 border-black ${
                  activeAdminTab === 'summaries' ? 'bg-[#FF4F81] text-white shadow-[2px_2px_0px_black]' : 'bg-white text-black hover:bg-yellow-200'
                }`}
              >
                <BookOpen className="w-4 h-4 shrink-0" />
                <span>5. Podsumowanie Lekcji ({summaries.length})</span>
              </button>

              <button
                onClick={() => setActiveAdminTab('messages')}
                className={`p-2.5 rounded-xl text-xs font-black text-left flex items-center justify-between gap-2 cursor-pointer transition border-2 border-black ${
                  activeAdminTab === 'messages' ? 'bg-[#FF4F81] text-white shadow-[2px_2px_0px_black]' : 'bg-white text-black hover:bg-yellow-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 shrink-0" />
                  <span>6. Wiadomości</span>
                </div>
                <span className="bg-black text-white px-1.5 py-0.5 rounded text-[10px] font-black">{messages.length}</span>
              </button>

              <button
                onClick={() => setActiveAdminTab('password')}
                className={`p-2.5 rounded-xl text-xs font-black text-left flex items-center gap-2 cursor-pointer transition border-2 border-black ${
                  activeAdminTab === 'password' ? 'bg-[#FF4F81] text-white shadow-[2px_2px_0px_black]' : 'bg-white text-black hover:bg-yellow-200'
                }`}
              >
                <KeyRound className="w-4 h-4 shrink-0" />
                <span>7. Hasło Nauczyciela</span>
              </button>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 p-5 overflow-y-auto space-y-6">
              {/* TAB 1: OGŁOSZENIA */}
              {activeAdminTab === 'announcements' && (
                <div className="space-y-6">
                  <div className="bg-white p-5 rounded-2xl border-3 border-black shadow-[4px_4px_0px_black]">
                    <h3 className="text-sm font-black text-black uppercase mb-3 flex items-center gap-2">
                      {editingAnnId ? <Pencil className="w-4 h-4 text-amber-500" /> : <Plus className="w-4 h-4 text-[#FF4F81]" />}
                      <span>{editingAnnId ? 'Edytujesz Ogłoszenie:' : 'Dodaj Ogłoszenie dla Rodziców i Uczniów:'}</span>
                    </h3>

                    <form onSubmit={handleAddAnnSubmit} className="space-y-3">
                      <div>
                        <label className="block text-[11px] font-black uppercase text-black mb-1">Tytuł ogłoszenia:</label>
                        <input
                          type="text"
                          value={annTitle}
                          onChange={(e) => setAnnTitle(e.target.value)}
                          required
                          placeholder="np. Przypomnienie o podręcznikach"
                          className="w-full px-3 py-2 rounded-xl border-2 border-black text-xs font-bold bg-yellow-50"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-black uppercase text-black mb-1">Treść ogłoszenia:</label>
                        <textarea
                          value={annContent}
                          onChange={(e) => setAnnContent(e.target.value)}
                          required
                          rows={3}
                          placeholder="Wpisz treść ogłoszenia..."
                          className="w-full px-3 py-2 rounded-xl border-2 border-black text-xs font-bold bg-yellow-50"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="submit"
                          className={`text-white border-2 border-black font-black px-4 py-2 rounded-xl text-xs uppercase cursor-pointer shadow-[2px_2px_0px_black] ${
                            editingAnnId ? 'bg-amber-500 hover:bg-amber-600' : 'bg-emerald-500 hover:bg-emerald-600'
                          }`}
                        >
                          {editingAnnId ? '💾 Zapisz Zmiany Ogłoszenia ✏️' : '+ Opublikuj Ogłoszenie ✨'}
                        </button>
                        {editingAnnId && (
                          <button
                            type="button"
                            onClick={cancelEditAnn}
                            className="bg-gray-200 hover:bg-gray-300 text-black border-2 border-black font-bold px-3 py-2 rounded-xl text-xs uppercase cursor-pointer"
                          >
                            Anuluj Edycję
                          </button>
                        )}
                      </div>
                    </form>
                  </div>

                  {/* List of existing announcements with delete & edit */}
                  <div className="bg-white p-5 rounded-2xl border-3 border-black shadow-[4px_4px_0px_black]">
                    <h3 className="text-xs font-black uppercase tracking-wider text-black mb-3">
                      Obecne Ogłoszenia ({announcements.length}):
                    </h3>
                    <div className="space-y-2">
                      {announcements.map((ann) => (
                        <div key={ann.id} className="p-3 bg-yellow-50 rounded-xl border-2 border-black flex items-center justify-between gap-2 text-xs">
                          <div>
                            <span className="font-black text-black block">{ann.title}</span>
                            <p className="text-[11px] text-gray-700 font-bold">{ann.content}</p>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              onClick={() => startEditingAnn(ann)}
                              className="p-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg border border-black cursor-pointer transition"
                              title="Edytuj ogłoszenie"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onDeleteAnnouncement(ann.id)}
                              className="p-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-lg border border-black cursor-pointer transition"
                              title="Usuń ogłoszenie"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: GRY & ZADANIA */}
              {activeAdminTab === 'games' && (
                <div className="space-y-6">
                  <div className="bg-white p-5 rounded-2xl border-3 border-black shadow-[4px_4px_0px_black]">
                    <h3 className="text-sm font-black text-black uppercase mb-1 flex items-center gap-2">
                      {editingTaskId ? <Pencil className="w-4 h-4 text-amber-500" /> : <Plus className="w-4 h-4 text-[#FF4F81]" />}
                      <span>{editingTaskId ? 'Edytujesz Grę:' : 'Dodaj Nową Grę dla Uczniów:'}</span>
                    </h3>
                    <p className="text-xs font-bold text-gray-800 mb-3">
                      Możesz stworzyć literowanie słów, wykreślankę, dopasowywanie do obrazków, quiz lub czytankę.
                    </p>

                    <form onSubmit={handleAddGameSubmit} className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-black uppercase text-black mb-1">Tytuł gry / zadania:</label>
                          <input
                            type="text"
                            value={taskTitle}
                            onChange={(e) => setTaskTitle(e.target.value)}
                            required
                            placeholder="np. Literowanie Słów z Lekcji 2"
                            className="w-full px-3 py-2 rounded-xl border-2 border-black text-xs font-bold bg-yellow-50"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-black uppercase text-black mb-1">Rodzaj gry do wyboru:</label>
                          <select
                            value={taskType}
                            onChange={(e) => setTaskType(e.target.value as GameType)}
                            className="w-full px-3 py-2 rounded-xl border-2 border-black text-xs font-black bg-white"
                          >
                            <option value="spelling">🔤 Układanie Słów z Liter</option>
                            <option value="secret_word">🎯 Tajne Słowo (Zgadywanka / Koło Fortuny)</option>
                            <option value="syllables">🧩 Układanka Sylabowa (Łączenie sylab)</option>
                            <option value="wordsearch">🔍 Wykreślanka Słów</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-black uppercase text-black mb-1">Krótki opis lub instrukcja dla ucznia:</label>
                        <input
                          type="text"
                          value={taskDescription}
                          onChange={(e) => setTaskDescription(e.target.value)}
                          required
                          placeholder="np. Dotknij liter i ułóż słowo Syrenka!"
                          className="w-full px-3 py-2 rounded-xl border-2 border-black text-xs font-bold bg-yellow-50"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-black uppercase text-black mb-1">
                          Słowa do przećwiczenia w grze (oddzielone przecinkami):
                        </label>
                        <input
                          type="text"
                          value={taskWordsInput}
                          onChange={(e) => setTaskWordsInput(e.target.value)}
                          required
                          placeholder="SYRENKA, WARSZAWA, WISŁA, KRAKÓW, FLAGA"
                          className="w-full px-3 py-2 rounded-xl border-2 border-black text-xs font-mono font-bold bg-yellow-50"
                        />
                        <p className="text-[10px] text-gray-800 font-bold mt-1">
                          Słowa zostaną automatycznie zamienione w duży, czytelny zestaw zadań z przyciskami na telefon.
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="submit"
                          className={`text-white border-2 border-black font-black px-4 py-2 rounded-xl text-xs uppercase cursor-pointer shadow-[2px_2px_0px_black] ${
                            editingTaskId ? 'bg-amber-500 hover:bg-amber-600' : 'bg-emerald-500 hover:bg-emerald-600'
                          }`}
                        >
                          {editingTaskId ? '💾 Zapisz Zmiany Gry ✏️' : '+ Stwórz i Opublikuj Grę ✨'}
                        </button>
                        {editingTaskId && (
                          <button
                            type="button"
                            onClick={cancelEditGame}
                            className="bg-gray-200 hover:bg-gray-300 text-black border-2 border-black font-bold px-3 py-2 rounded-xl text-xs uppercase cursor-pointer"
                          >
                            Anuluj Edycję
                          </button>
                        )}
                      </div>
                    </form>
                  </div>

                  {/* List of existing games with delete & edit */}
                  <div className="bg-white p-5 rounded-2xl border-3 border-black shadow-[4px_4px_0px_black]">
                    <h3 className="text-xs font-black uppercase tracking-wider text-black mb-3">
                      Lista Dostępnych Gier na Stronie ({allDailyTasks.length}):
                    </h3>
                    <div className="space-y-2">
                      {allDailyTasks.map((task) => (
                        <div key={task.id} className="p-3 bg-yellow-50 rounded-xl border-2 border-black flex items-center justify-between gap-2 text-xs">
                          <div>
                            <span className="font-black text-black block">{task.title}</span>
                            <span className="text-[10px] text-gray-800 font-bold uppercase">Typ: {task.type}</span>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              onClick={() => startEditingGame(task)}
                              className="p-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg border border-black cursor-pointer transition"
                              title="Edytuj grę"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onDeleteDailyTask(task.id)}
                              className="p-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-lg border border-black cursor-pointer transition"
                              title="Usuń grę"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: KALENDARZ ZAJĘĆ */}
              {activeAdminTab === 'calendar' && (
                <div className="space-y-6">
                  {/* Event Notification Banner */}
                  {eventNotification && (
                    <div className="p-4 bg-emerald-500 text-white rounded-2xl border-3 border-black shadow-[4px_4px_0px_black] font-black text-xs flex items-center justify-between animate-bounce">
                      <span>{eventNotification}</span>
                      <button
                        onClick={() => setEventNotification(null)}
                        className="text-white hover:text-black ml-2 text-sm font-bold"
                      >
                        ✕
                      </button>
                    </div>
                  )}

                  {/* Szybka edycja najbliższego zjazdu */}
                  {(() => {
                    const today = new Date();
                    const todayIso = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;
                    const sortedEv = [...classEvents].sort((a, b) => a.isoDate.localeCompare(b.isoDate));
                    const nextEv = sortedEv.find((e) => e.isoDate >= todayIso && !e.isHoliday) || sortedEv.find((e) => e.status === 'next') || sortedEv[0];
                    if (!nextEv) return null;

                    return (
                      <div className="bg-[#4F81FF] text-white p-5 rounded-2xl border-3 border-black shadow-[4px_4px_0px_black]">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div>
                            <span className="text-[10px] font-black bg-yellow-300 text-black px-2 py-0.5 rounded border border-black uppercase tracking-wider">
                              ⭐ Najbliższy Zjazd (Karta na Stronie Głównej)
                            </span>
                            <h4 className="text-base font-black mt-1 text-white drop-shadow-[1px_1px_0px_black]">
                              {nextEv.dateStr}
                            </h4>
                            <p className="text-xs font-bold text-yellow-100 mt-0.5">
                              Temat: <span className="text-white underline">{nextEv.topic || '(Brak wpisanego tematu)'}</span> ({nextEv.time}, {nextEv.room})
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => startEditingEvent(nextEv)}
                            className="bg-yellow-300 hover:bg-yellow-400 text-black border-2 border-black font-black px-4 py-2 rounded-xl text-xs uppercase cursor-pointer shadow-[2px_2px_0px_black] shrink-0 flex items-center gap-1.5 transition"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                            <span>Edytuj ten temat</span>
                          </button>
                        </div>
                      </div>
                    );
                  })()}

                  <div className="bg-white p-5 rounded-2xl border-3 border-black shadow-[4px_4px_0px_black]">
                    <h3 className="text-sm font-black text-black uppercase mb-1 flex items-center gap-2">
                      {editingEventId ? <Pencil className="w-4 h-4 text-amber-500" /> : <Plus className="w-4 h-4 text-[#FF4F81]" />}
                      <span>{editingEventId ? 'Edytujesz Sobotę w Kalendarzu:' : 'Dodaj lub Zmień Temat Soboty w Kalendarzu:'}</span>
                    </h3>
                    <p className="text-xs font-bold text-gray-800 mb-3">
                      Wybierz datę lub kliknij "Edytuj" na liście poniżej, wpisz temat zajęć i kliknij "Zapisz".
                    </p>

                    <form onSubmit={handleAddEventSubmit} className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-black uppercase text-black mb-1">
                            Wybierz Datę z Kalendarza (YYYY-MM-DD):
                          </label>
                          <input
                            type="date"
                            value={evIsoDate}
                            onChange={(e) => handleDateChange(e.target.value)}
                            required
                            className="w-full px-3 py-2 rounded-xl border-2 border-black text-xs font-bold bg-yellow-50 cursor-pointer"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-black uppercase text-black mb-1">
                            Tytuł / Wyświetlany Dzień (np. Sobota, 12 Września):
                          </label>
                          <input
                            type="text"
                            value={evDateStr}
                            onChange={(e) => setEvDateStr(e.target.value)}
                            required
                            placeholder="np. Sobota, 22 Sierpnia 2026"
                            className="w-full px-3 py-2 rounded-xl border-2 border-black text-xs font-bold bg-yellow-50"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-black uppercase text-black mb-1">
                          Temat lekcji / opis dnia:
                        </label>
                        <input
                          type="text"
                          value={evTopic}
                          onChange={(e) => setEvTopic(e.target.value)}
                          required
                          placeholder="np. Rozpoczęcie roku i zapoznanie z podręcznikami"
                          className="w-full px-3 py-2 rounded-xl border-2 border-black text-xs font-bold bg-yellow-50 focus:ring-2 focus:ring-amber-400"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-black uppercase text-black mb-1">Godziny zajęć:</label>
                          <input
                            type="text"
                            value={evTime}
                            onChange={(e) => setEvTime(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border-2 border-black text-xs font-bold bg-yellow-50"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-black uppercase text-black mb-1">Numer Sali:</label>
                          <input
                            type="text"
                            value={evRoom}
                            onChange={(e) => setEvRoom(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border-2 border-black text-xs font-bold bg-yellow-50"
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-2 p-3 bg-rose-50 border-2 border-rose-300 rounded-xl">
                        <input
                          type="checkbox"
                          id="isHolidayCheck"
                          checked={evIsHoliday}
                          onChange={(e) => setEvIsHoliday(e.target.checked)}
                          className="w-4 h-4 cursor-pointer"
                        />
                        <label htmlFor="isHolidayCheck" className="text-xs font-black text-rose-900 cursor-pointer">
                          Zaznacz, jeśli w ten dzień NIE MA ZAJĘĆ (Dzień wolny / Święto) 🛑
                        </label>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="submit"
                          className={`text-white border-2 border-black font-black px-4 py-2 rounded-xl text-xs uppercase cursor-pointer shadow-[2px_2px_0px_black] ${
                            editingEventId ? 'bg-amber-500 hover:bg-amber-600' : 'bg-emerald-500 hover:bg-emerald-600'
                          }`}
                        >
                          {editingEventId ? '💾 Zapisz Temat i Zmiany w Chmurze ✏️' : '💾 Zapisz Sobotę do Kalendarza 📅'}
                        </button>
                        {editingEventId && (
                          <button
                            type="button"
                            onClick={cancelEditEvent}
                            className="bg-gray-200 hover:bg-gray-300 text-black border-2 border-black font-bold px-3 py-2 rounded-xl text-xs uppercase cursor-pointer"
                          >
                            Anuluj Edycję
                          </button>
                        )}
                      </div>
                    </form>
                  </div>

                  {/* List of events with delete & edit */}
                  <div className="bg-white p-5 rounded-2xl border-3 border-black shadow-[4px_4px_0px_black]">
                    <h3 className="text-xs font-black uppercase tracking-wider text-black mb-3">
                      Lista Wszystkich Sobót w Kalendarzu ({classEvents.length}):
                    </h3>
                    <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                      {classEvents.map((ev) => {
                        const isCurrentEditing = editingEventId === ev.id;
                        return (
                          <div
                            key={ev.id}
                            className={`p-3 rounded-xl border-2 border-black flex items-center justify-between gap-2 text-xs transition ${
                              isCurrentEditing ? 'bg-amber-100 ring-2 ring-amber-500' : 'bg-yellow-50'
                            }`}
                          >
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-black text-black block">{ev.dateStr}</span>
                                {isCurrentEditing && (
                                  <span className="text-[10px] font-black bg-amber-500 text-white px-1.5 py-0.2 rounded border border-black">
                                    Edytujesz teraz
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-gray-800 font-bold mt-0.5">
                                {ev.isHoliday ? '🛑 Dzień wolny od zajęć' : `${ev.topic || '(Brak wpisanego tematu)'} (${ev.time}, ${ev.room})`}
                              </p>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                onClick={() => startEditingEvent(ev)}
                                className="px-2.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg border border-black font-black text-[11px] cursor-pointer transition flex items-center gap-1"
                                title="Edytuj temat i dane"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                                <span>Edytuj</span>
                              </button>
                              <button
                                onClick={() => onDeleteClassEvent(ev.id)}
                                className="p-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-lg border border-black cursor-pointer transition"
                                title="Usuń z kalendarza"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: KSERÓWKI / PDF */}
              {activeAdminTab === 'worksheets' && (
                <div className="space-y-6">
                  <div className="bg-white p-5 rounded-2xl border-3 border-black shadow-[4px_4px_0px_black]">
                    <h3 className="text-sm font-black text-black uppercase mb-3 flex items-center gap-2">
                      {editingWsId ? <Pencil className="w-4 h-4 text-amber-500" /> : <Plus className="w-4 h-4 text-[#FF4F81]" />}
                      <span>{editingWsId ? 'Edytujesz Kserówkę:' : 'Dodaj Kserówkę / Plik PDF do Druku:'}</span>
                    </h3>

                    <form onSubmit={handleAddWorksheetSubmit} className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-black uppercase text-black mb-1">Tytuł kserówki:</label>
                          <input
                            type="text"
                            value={wsTitle}
                            onChange={(e) => setWsTitle(e.target.value)}
                            required
                            placeholder="np. Kserówka: Ortografia Ż i RZ"
                            className="w-full px-3 py-2 rounded-xl border-2 border-black text-xs font-bold bg-yellow-50"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-black uppercase text-black mb-1">Kategoria:</label>
                          <select
                            value={wsCategory}
                            onChange={(e) => setWsCategory(e.target.value as any)}
                            className="w-full px-3 py-2 rounded-xl border-2 border-black text-xs font-black bg-white"
                          >
                            <option value="polski">Język Polski & Ortografia</option>
                            <option value="czytanie">Czytanie ze zrozumieniem</option>
                            <option value="geografia">Geografia Polski</option>
                            <option value="lamiglowki">Łamigłówki & Sylaby</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-black uppercase text-black mb-1">Wgraj plik PDF z komputera:</label>
                        <input
                          type="file"
                          accept="application/pdf"
                          onChange={handlePdfUpload}
                          className="w-full text-xs font-bold cursor-pointer"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="submit"
                          className={`text-white border-2 border-black font-black px-4 py-2 rounded-xl text-xs uppercase cursor-pointer shadow-[2px_2px_0px_black] ${
                            editingWsId ? 'bg-amber-500 hover:bg-amber-600' : 'bg-emerald-500 hover:bg-emerald-600'
                          }`}
                        >
                          {editingWsId ? '💾 Zapisz Zmiany Kserówki ✏️' : '+ Dodaj do Materiałów do Druku 📄'}
                        </button>
                        {editingWsId && (
                          <button
                            type="button"
                            onClick={cancelEditWs}
                            className="bg-gray-200 hover:bg-gray-300 text-black border-2 border-black font-bold px-3 py-2 rounded-xl text-xs uppercase cursor-pointer"
                          >
                            Anuluj Edycję
                          </button>
                        )}
                      </div>
                    </form>
                  </div>

                  {/* List of worksheets with delete & edit */}
                  <div className="bg-white p-5 rounded-2xl border-3 border-black shadow-[4px_4px_0px_black]">
                    <h3 className="text-xs font-black uppercase tracking-wider text-black mb-3">
                      Lista Kserówek ({worksheets.length}):
                    </h3>
                    <div className="space-y-2">
                      {worksheets.map((ws) => (
                        <div key={ws.id} className="p-3 bg-yellow-50 rounded-xl border-2 border-black flex items-center justify-between gap-2 text-xs">
                          <div>
                            <span className="font-black text-black block">{ws.title}</span>
                            <span className="text-[10px] text-gray-700 font-bold uppercase">Kategoria: {ws.category}</span>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              onClick={() => startEditingWs(ws)}
                              className="p-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg border border-black cursor-pointer transition"
                              title="Edytuj kserówkę"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onDeleteWorksheet(ws.id)}
                              className="p-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-lg border border-black cursor-pointer transition"
                              title="Usuń kserówkę"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: PODSUMOWANIA ZAJĘĆ */}
              {activeAdminTab === 'summaries' && (
                <div className="space-y-6">
                  <div className="bg-white p-5 rounded-2xl border-3 border-black shadow-[4px_4px_0px_black]">
                    <h3 className="text-sm font-black text-black uppercase mb-1 flex items-center gap-2">
                      {editingSummaryId ? <Pencil className="w-4 h-4 text-amber-500" /> : <Plus className="w-4 h-4 text-[#FF4F81]" />}
                      <span>{editingSummaryId ? 'Edytujesz Podsumowanie Lekcji:' : 'Dodaj Nowe Podsumowanie Lekcji:'}</span>
                    </h3>
                    <p className="text-xs font-bold text-gray-800 mb-3">
                      Możesz dodawać dowolną liczbę punktów ćwiczonych umiejętności, zrobionych ćwiczeń oraz zadań domowych!
                    </p>

                    <form onSubmit={handleAddSummarySubmit} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-black uppercase text-black mb-1">Data lekcji:</label>
                          <input
                            type="text"
                            value={sumDate}
                            onChange={(e) => setSumDate(e.target.value)}
                            required
                            placeholder="Sobota, 22 Sierpnia 2026"
                            className="w-full px-3 py-2 rounded-xl border-2 border-black text-xs font-bold bg-yellow-50"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-black uppercase text-black mb-1">Temat lekcji:</label>
                          <input
                            type="text"
                            value={sumTopic}
                            onChange={(e) => setSumTopic(e.target.value)}
                            required
                            placeholder="Legenda o Syrence Warszawskiej & Pisownia RZ"
                            className="w-full px-3 py-2 rounded-xl border-2 border-black text-xs font-bold bg-yellow-50"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-black uppercase text-black mb-1">
                          Główny opis lekcji (co robiliśmy):
                        </label>
                        <textarea
                          value={sumDesc}
                          onChange={(e) => setSumDesc(e.target.value)}
                          required
                          rows={2}
                          placeholder="Omówiliśmy legendę o Syrence Warszawskiej, głośno czytaliśmy tekst i wykonywaliśmy wycinankę."
                          className="w-full px-3 py-2 rounded-xl border-2 border-black text-xs font-bold bg-yellow-50"
                        />
                      </div>

                      {/* Ćwiczone umiejętności (dynamiczna lista) */}
                      <div className="bg-emerald-50 p-3.5 rounded-xl border-2 border-emerald-300 space-y-2">
                        <label className="block text-[11px] font-black uppercase text-emerald-950">
                          Ćwiczone umiejętności:
                        </label>
                        {sumSkillsList.map((skill, sIdx) => (
                          <div key={`sk-${sIdx}`} className="flex items-center gap-2">
                            <input
                              type="text"
                              value={skill}
                              onChange={(e) => handleUpdateSkill(sIdx, e.target.value)}
                              placeholder={`Umiejętność nr ${sIdx + 1} (np. Czytanie ze zrozumieniem)`}
                              className="w-full px-3 py-1.5 rounded-lg border-2 border-black text-xs font-bold bg-white"
                            />
                            {sumSkillsList.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveSkill(sIdx)}
                                className="p-1.5 bg-rose-500 text-white rounded-lg border border-black cursor-pointer shrink-0"
                                title="Usuń ten punkt"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={handleAddSkill}
                          className="px-3 py-1.5 bg-emerald-600 text-white border-2 border-black rounded-lg text-[11px] font-black uppercase cursor-pointer hover:bg-emerald-700 transition flex items-center gap-1 mt-1 shadow-[2px_2px_0px_black]"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>+ Dodaj kolejną ćwiczoną umiejętność</span>
                        </button>
                      </div>

                      {/* Przeprowadzone ćwiczenia (dynamiczna lista) */}
                      <div className="bg-yellow-100 p-3.5 rounded-xl border-2 border-yellow-400 space-y-2">
                        <label className="block text-[11px] font-black uppercase text-black">
                          Przeprowadzone ćwiczenia / przebieg lekcji:
                        </label>
                        {sumActivitiesList.map((act, aIdx) => (
                          <div key={`act-${aIdx}`} className="flex items-center gap-2">
                            <input
                              type="text"
                              value={act}
                              onChange={(e) => handleUpdateActivity(aIdx, e.target.value)}
                              placeholder={`Ćwiczenie nr ${aIdx + 1} (np. Głośne czytanie opowiadania)`}
                              className="w-full px-3 py-1.5 rounded-lg border-2 border-black text-xs font-bold bg-white"
                            />
                            {sumActivitiesList.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveActivity(aIdx)}
                                className="p-1.5 bg-rose-500 text-white rounded-lg border border-black cursor-pointer shrink-0"
                                title="Usuń ten punkt"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={handleAddActivity}
                          className="px-3 py-1.5 bg-[#4F81FF] text-white border-2 border-black rounded-lg text-[11px] font-black uppercase cursor-pointer hover:bg-blue-600 transition flex items-center gap-1 mt-1 shadow-[2px_2px_0px_black]"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>+ Dodaj kolejne przeprowadzone ćwiczenie</span>
                        </button>
                      </div>

                      {/* Słówka do ćwiczenia w domu */}
                      <div>
                        <label className="block text-[11px] font-black uppercase text-black mb-1">
                          Słówka do ćwiczenia w domu (oddzielone przecinkami):
                        </label>
                        <input
                          type="text"
                          value={sumVocabInput}
                          onChange={(e) => setSumVocabInput(e.target.value)}
                          placeholder="Syrenka, Warszawa, Tarcza, Miecz, Rzeka, Orzeł"
                          className="w-full px-3 py-2 rounded-xl border-2 border-black text-xs font-bold bg-yellow-50"
                        />
                      </div>

                      {/* Zadania domowe (dynamiczna lista) */}
                      <div className="bg-amber-100 p-3.5 rounded-xl border-2 border-amber-400 space-y-2">
                        <label className="block text-[11px] font-black uppercase text-amber-950">
                          Zadania domowe dla uczniów:
                        </label>
                        {sumHomeworkList.map((hw, hIdx) => (
                          <div key={`hw-${hIdx}`} className="flex items-center gap-2">
                            <input
                              type="text"
                              value={hw}
                              onChange={(e) => handleUpdateHomework(hIdx, e.target.value)}
                              placeholder={`Zadanie domowe nr ${hIdx + 1} (np. Zeszyt ćwiczeń str. 14)`}
                              className="w-full px-3 py-1.5 rounded-lg border-2 border-black text-xs font-bold bg-white"
                            />
                            {sumHomeworkList.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveHomework(hIdx)}
                                className="p-1.5 bg-rose-500 text-white rounded-lg border border-black cursor-pointer shrink-0"
                                title="Usuń ten punkt"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={handleAddHomework}
                          className="px-3 py-1.5 bg-[#FF4F81] text-white border-2 border-black rounded-lg text-[11px] font-black uppercase cursor-pointer hover:bg-rose-600 transition flex items-center gap-1 mt-1 shadow-[2px_2px_0px_black]"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>+ Dodaj kolejne zadanie domowe</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="submit"
                          className={`text-white border-2 border-black font-black px-5 py-2.5 rounded-xl text-xs uppercase cursor-pointer shadow-[2px_2px_0px_black] w-full transition ${
                            editingSummaryId ? 'bg-amber-500 hover:bg-amber-600' : 'bg-emerald-500 hover:bg-emerald-600'
                          }`}
                        >
                          {editingSummaryId ? '💾 Zapisz Zmiany Podsumowania ✏️' : '+ Opublikuj Podsumowanie Lekcji 📜'}
                        </button>
                        {editingSummaryId && (
                          <button
                            type="button"
                            onClick={cancelEditSummary}
                            className="bg-gray-200 hover:bg-gray-300 text-black border-2 border-black font-bold px-4 py-2.5 rounded-xl text-xs uppercase cursor-pointer shrink-0"
                          >
                            Anuluj
                          </button>
                        )}
                      </div>
                    </form>
                  </div>

                  {/* List of summaries with delete & edit */}
                  <div className="bg-white p-5 rounded-2xl border-3 border-black shadow-[4px_4px_0px_black]">
                    <h3 className="text-xs font-black uppercase tracking-wider text-black mb-3">
                      Opublikowane Podsumowania Lekcji ({summaries.length}):
                    </h3>
                    <div className="space-y-2">
                      {summaries.map((sum) => (
                        <div key={sum.id} className="p-3 bg-yellow-50 rounded-xl border-2 border-black flex items-center justify-between gap-2 text-xs">
                          <div>
                            <span className="font-black text-black block">{sum.date} - {sum.topic}</span>
                            <p className="text-[11px] text-gray-700 font-bold">{sum.description}</p>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              onClick={() => startEditingSummary(sum)}
                              className="p-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg border border-black cursor-pointer transition"
                              title="Edytuj podsumowanie"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onDeleteClassSummary(sum.id)}
                              className="p-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-lg border border-black cursor-pointer transition"
                              title="Usuń podsumowanie"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 6: WIADOMOŚCI OD RODZICÓW */}
              {activeAdminTab === 'messages' && (
                <div className="space-y-4">
                  <div className="bg-white p-5 rounded-2xl border-3 border-black shadow-[4px_4px_0px_black]">
                    <h3 className="text-sm font-black text-black uppercase mb-3">
                      Otrzymane Wiadomości od Rodziców ({messages.length}):
                    </h3>

                    {messages.length === 0 ? (
                      <p className="text-xs font-bold text-gray-600">Brak nowych wiadomości od rodziców.</p>
                    ) : (
                      <div className="space-y-3">
                        {messages.map((msg) => (
                          <div key={msg.id} className="p-4 bg-yellow-50 rounded-xl border-2 border-black space-y-2">
                            <div className="flex items-center justify-between text-xs font-black border-b border-black pb-2">
                              <span>Uczeń: {msg.studentName} | E-mail: {msg.parentEmail}</span>
                              <button
                                onClick={() => onDeleteMessage(msg.id)}
                                className="text-rose-600 hover:text-rose-800 p-1 cursor-pointer"
                                title="Usuń wiadomość"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                            <p className="text-xs text-black font-bold">{msg.message}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 7: HASŁO NAUCZYCIELA */}
              {activeAdminTab === 'password' && (
                <div className="bg-white p-5 rounded-2xl border-3 border-black shadow-[4px_4px_0px_black] max-w-md mx-auto space-y-4">
                  <h3 className="text-base font-black text-black uppercase flex items-center gap-2">
                    <KeyRound className="w-5 h-5 text-[#FF4F81]" />
                    <span>Zmiana Hasła Pani Małgosi:</span>
                  </h3>

                  <form onSubmit={handleChangePasswordSubmit} className="space-y-3">
                    <div>
                      <label className="block text-xs font-black uppercase text-black mb-1">Obecne hasło:</label>
                      <input
                        type="password"
                        value={currPassInput}
                        onChange={(e) => setCurrPassInput(e.target.value)}
                        required
                        className="w-full px-3 py-2 rounded-xl border-2 border-black text-xs font-bold bg-yellow-50"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-black uppercase text-black mb-1">Nowe hasło:</label>
                      <input
                        type="password"
                        value={newPassInput}
                        onChange={(e) => setNewPassInput(e.target.value)}
                        required
                        className="w-full px-3 py-2 rounded-xl border-2 border-black text-xs font-bold bg-yellow-50"
                      />
                    </div>

                    {passStatus && (
                      <p className={`text-xs font-black p-2 rounded-xl border ${passStatus.error ? 'bg-rose-100 border-rose-400 text-rose-800' : 'bg-emerald-100 border-emerald-400 text-emerald-800'}`}>
                        {passStatus.msg}
                      </p>
                    )}

                    <button
                      type="submit"
                      className="w-full bg-[#FFD700] text-black border-2 border-black font-black py-2.5 rounded-xl text-xs uppercase cursor-pointer shadow-[2px_2px_0px_black]"
                    >
                      Zmień Hasło 🔑
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
