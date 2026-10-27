import React, { useState, useEffect, useMemo } from 'react';
import { Announcement, DailyTask, ClassSummary, Worksheet, FeedbackMessage, ClassEvent, GameType, SpellingItem, MatchingItem, StoryQuestion, GeographyQuizQuestion } from '../types';
import { playSuccessSound } from '../utils/audio';
import { Lock, Megaphone, Calendar, FileText, Mail, Plus, ShieldCheck, X, Upload, KeyRound, Trash2, BookOpen, Gamepad2, Sparkles, CheckCircle2, Pencil, Edit, Layers, Check, RefreshCw, Image as ImageIcon, AlertTriangle, Link as LinkIcon } from 'lucide-react';
import { getEmojiForWord, cleanWord, parseWordList } from '../utils/wordHelpers';
import { isImageUrl, normalizeImageUrl, compressAndReadImage } from '../utils/imageHelpers';
import { RichTextEditor } from './RichTextEditor';
import { FormattedText } from './FormattedText';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  initialAdminTab?: 'announcements' | 'games' | 'calendar' | 'worksheets' | 'summaries' | 'messages' | 'password';
  initialGameSaturday?: string;
  initialGameTaskId?: string;
  // Announcements
  announcements: Announcement[];
  onAddAnnouncement: (ann: { title: string; content: string; type: 'info' | 'important' | 'event' }) => void;
  onEditAnnouncement?: (id: string, ann: { title: string; content: string; type: 'info' | 'important' | 'event' }) => void;
  onDeleteAnnouncement: (id: string) => void;
  // Daily Tasks
  allDailyTasks: DailyTask[];
  onAddDailyTask: (newTask: DailyTask) => void;
  onEditDailyTask?: (updatedTask: DailyTask) => void;
  onBatchEditDailyTasks?: (updatedTasks: DailyTask[]) => void;
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
  initialAdminTab = 'announcements',
  initialGameSaturday,
  initialGameTaskId,
  announcements,
  onAddAnnouncement,
  onEditAnnouncement,
  onDeleteAnnouncement,
  allDailyTasks,
  onAddDailyTask,
  onEditDailyTask,
  onBatchEditDailyTasks,
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
  const [activeAdminTab, setActiveAdminTab] = useState<'announcements' | 'games' | 'calendar' | 'worksheets' | 'summaries' | 'messages' | 'password'>(initialAdminTab);

  // Filter & Batch State for Games
  const [gamesFilterSaturday, setGamesFilterSaturday] = useState<string>('all');
  const [batchEditSaturday, setBatchEditSaturday] = useState<string | null>(null);
  const [batchWordsInput, setBatchWordsInput] = useState<string>('');
  const [gameNotification, setGameNotification] = useState<string | null>(null);

  // Announcement Form State
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [annType, setAnnType] = useState<'info' | 'important' | 'event'>('info');

  // Game/Task Form State
  const [taskTitle, setTaskTitle] = useState('');
  const [taskType, setTaskType] = useState<GameType>('spelling');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskWordsInput, setTaskWordsInput] = useState('');
  const [taskSaturdayDate, setTaskSaturdayDate] = useState('Sobota, 29 Sierpnia 2026');
  const [taskTopic, setTaskTopic] = useState('');

  // Dedicated state for Matching Game (taskType === 'matching')
  const [matchingPairs, setMatchingPairs] = useState<MatchingItem[]>([
    {
      id: 'm-1',
      wordPl: 'Orzeł Biały',
      description: 'Godło Polski – dumny biały ptak w złotej koronie na czerwonym tle.',
      emoji: '🦅',
      category: 'Symbole Narodowe',
    },
    {
      id: 'm-2',
      wordPl: 'Flaga Polski',
      description: 'Biało-czerwone barwy narodowe, powiewające podczas świąt i uroczystości.',
      emoji: '🇵🇱',
      category: 'Symbole Narodowe',
    },
    {
      id: 'm-3',
      wordPl: 'Syrenka Warszawska',
      description: 'Legendarna postać z mieczem i tarczą, która czuwa i broni stolicy Polski nad Wisłą.',
      emoji: '🧜‍♀️',
      category: 'Legendy',
    },
    {
      id: 'm-4',
      wordPl: 'Smok Wawelski',
      description: 'Potwór z krakowskiej legendy mieszkający w pieczarze pod Zamkiem na Wawelu.',
      emoji: '🐉',
      category: 'Legendy',
    },
    {
      id: 'm-5',
      wordPl: 'Rzeka Wisła',
      description: 'Królowa polskich rzek, najdłuższa rzeka w Polsce płynąca od Tatr aż do Bałtyku.',
      emoji: '🌊',
      category: 'Geografia',
    },
  ]);
  const [quickPairText, setQuickPairText] = useState('');
  const [showQuickPairText, setShowQuickPairText] = useState(false);
  const [imageUploadStatus, setImageUploadStatus] = useState<string | null>(null);

  const handleAddMatchingPair = () => {
    setMatchingPairs((prev) => [
      ...prev,
      {
        id: `m-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        wordPl: '',
        description: '',
        emoji: '⭐',
        imageUrl: undefined,
        category: 'Lekcja',
      },
    ]);
  };

  const handleImageUploadForPair = async (pIdx: number, file: File) => {
    try {
      setImageUploadStatus(`Wgrywanie i optymalizacja zdjęcia dla pary #${pIdx + 1}...`);
      const dataUrl = await compressAndReadImage(file, 600, 0.85);
      setMatchingPairs((prev) => {
        const next = [...prev];
        next[pIdx] = {
          ...next[pIdx],
          imageUrl: dataUrl,
        };
        return next;
      });
      setImageUploadStatus(`✅ Zdjęcie dla pary #${pIdx + 1} zostało pomyślnie wgrane!`);
      playSuccessSound();
      setTimeout(() => setImageUploadStatus(null), 3000);
    } catch (err) {
      console.error('Image upload failed:', err);
      setImageUploadStatus('❌ Nie udało się przetworzyć pliku graficznego. Spróbuj innego pliku PNG/JPG.');
      setTimeout(() => setImageUploadStatus(null), 4000);
    }
  };

  const handleUpdateMatchingPair = (index: number, field: keyof MatchingItem, val: string) => {
    setMatchingPairs((prev) => {
      const next = [...prev];
      let updatedVal = val;
      if (field === 'imageUrl') {
        updatedVal = normalizeImageUrl(val);
      }
      if (field === 'emoji' && isImageUrl(val)) {
        // User pasted URL into emoji field - auto transfer to imageUrl!
        next[index] = {
          ...next[index],
          imageUrl: normalizeImageUrl(val),
          emoji: next[index].emoji && !isImageUrl(next[index].emoji) ? next[index].emoji : getEmojiForWord(next[index].wordPl) || '⭐',
        };
        return next;
      }
      next[index] = { ...next[index], [field]: updatedVal };
      if (field === 'wordPl' && (!next[index].emoji || next[index].emoji === '⭐')) {
        const autoEmoji = getEmojiForWord(val);
        if (autoEmoji) next[index].emoji = autoEmoji;
      }
      return next;
    });
  };

  const handleRemoveMatchingPair = (index: number) => {
    setMatchingPairs((prev) => prev.filter((_, i) => i !== index));
  };

  const handleLoadMatchingPreset = (presetName: 'symbols' | 'legends' | 'school' | 'autumn') => {
    if (presetName === 'symbols') {
      setTaskTitle('🧩 Przeciągnij i Dopasuj: Symbole Polski');
      setTaskDescription('Przeciągnij opis i dopasuj go do godła, flagi, hymnu lub rzeki!');
      setMatchingPairs([
        { id: 'p-1', wordPl: 'Orzeł Biały', description: 'Godło Polski – dumny biały ptak w złotej koronie na czerwonym tle.', emoji: '🦅', category: 'Symbole' },
        { id: 'p-2', wordPl: 'Flaga Polski', description: 'Biało-czerwone barwy narodowe powiewające na świętach.', emoji: '🇵🇱', category: 'Symbole' },
        { id: 'p-3', wordPl: 'Mazurek Dąbrowskiego', description: 'Oficjalny hymn narodowy Polski śpiewany z szacunkiem na baczność.', emoji: '🎵', category: 'Symbole' },
        { id: 'p-4', wordPl: 'Rzeka Wisła', description: 'Królowa polskich rzek, najdłuższa rzeka w Polsce płynąca do Bałtyku.', emoji: '🌊', category: 'Geografia' },
        { id: 'p-5', wordPl: 'Warszawa', description: 'Stolica i największe miasto Polski leżące w centrum kraju.', emoji: '🏰', category: 'Geografia' },
      ]);
    } else if (presetName === 'legends') {
      setTaskTitle('🧩 Przeciągnij i Dopasuj: Polskie Legendy');
      setTaskDescription('Dopasuj opisy do postaci z polskich legend i baśni!');
      setMatchingPairs([
        { id: 'l-1', wordPl: 'Smok Wawelski', description: 'Groźny potwór ze Smoczej Jamy w Krakowie, pokonany przez Szewczyka Dratewkę.', emoji: '🐉', category: 'Legendy' },
        { id: 'l-2', wordPl: 'Syrenka Warszawska', description: 'Pół-kobieta, pół-ryba z mieczem i tarczą, obrończyni stolicy Polski.', emoji: '🧜‍♀️', category: 'Legendy' },
        { id: 'l-3', wordPl: 'Złota Kaczka', description: 'Mieszkała w lochach zamku Ostrogskich w Warszawie i obiecywała bogactwa.', emoji: '🦆', category: 'Legendy' },
        { id: 'l-4', wordPl: 'Pan Twardowski', description: 'Szlachcic-czarnoksiężnik z legendy, który wylądował na Księżycu na kogucie.', emoji: '🌙', category: 'Legendy' },
      ]);
    } else if (presetName === 'school') {
      setTaskTitle('🧩 Przeciągnij i Dopasuj: Szkoła i Klasa');
      setTaskDescription('Dopasuj opisy do przyborów szkolnych i przedmiotów w klasie!');
      setMatchingPairs([
        { id: 's-1', wordPl: 'Piórnik', description: 'Schowek na ołówki, kredki, linijkę i gumkę do ścierania.', emoji: '✏️', category: 'Przybory' },
        { id: 's-2', wordPl: 'Podręcznik', description: 'Książka, z której czytamy i uczymy się języka polskiego.', emoji: '📚', category: 'Przybory' },
        { id: 's-3', wordPl: 'Zeszyt', description: 'Zapisujemy w nim starannie nowe litery, słówka i zdania.', emoji: '📓', category: 'Przybory' },
        { id: 's-4', wordPl: 'Plecak', description: 'Pakujemy do niego książki, zeszyty i drugie śniadanie.', emoji: '🎒', category: 'Przybory' },
        { id: 's-5', wordPl: 'Tablica', description: 'Duża powierzchnia w klasie, na której nauczycielka pisze kredą.', emoji: '👩‍🏫', category: 'Klasa' },
      ]);
    } else if (presetName === 'autumn') {
      setTaskTitle('🧩 Przeciągnij i Dopasuj: Jesień i Przyroda');
      setTaskDescription('Dopasuj opisy do jesiennych darów lasu i przyrody!');
      setMatchingPairs([
        { id: 'a-1', wordPl: 'Kasztan', description: 'Błyszczący brązowy owoc drzewa ukryty w kolczastej zielonej łupinie.', emoji: '🌰', category: 'Przyroda' },
        { id: 'a-2', wordPl: 'Jarzębina', description: 'Czerwone korale na gałązkach, przysmak leśnych ptaków jesienią.', emoji: '🍒', category: 'Przyroda' },
        { id: 'a-3', wordPl: 'Jeż', description: 'Małe pożyteczne zwierzątko z kolcami, które szykuje się do snu zimowego.', emoji: '🦔', category: 'Zwierzęta' },
        { id: 'a-4', wordPl: 'Borowik', description: 'Król polskich grzybów z brązowym kapeluszem rosnący w lesie.', emoji: '🍄', category: 'Grzyby' },
        { id: 'a-5', wordPl: 'Kolorowe Liście', description: 'Złote, żółte i czerwone liście, które jesienią spadają z drzew.', emoji: '🍁', category: 'Przyroda' },
      ]);
    }
  };

  const handleApplyQuickPairText = () => {
    if (!quickPairText.trim()) return;
    const lines = quickPairText.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);
    const parsed: MatchingItem[] = lines.map((line, idx) => {
      const parts = line.split('|').map((p) => p.trim());
      const wordPl = parts[0] || `Hasło ${idx + 1}`;
      const description = parts[1] || `Opis dla ${wordPl}`;
      const rawThird = parts[2] || '';
      let emoji = rawThird;
      let imageUrl: string | undefined = undefined;
      if (isImageUrl(rawThird)) {
        imageUrl = normalizeImageUrl(rawThird);
        emoji = getEmojiForWord(wordPl) || '⭐';
      }
      return {
        id: `p-${idx}-${Date.now()}`,
        wordPl,
        description,
        emoji: emoji || getEmojiForWord(wordPl) || '⭐',
        imageUrl,
        category: 'Dopasowywanie',
      };
    });
    if (parsed.length > 0) {
      setMatchingPairs(parsed);
      setShowQuickPairText(false);
      setQuickPairText('');
    }
  };

  // Calendar Event Form State
  const [evDateStr, setEvDateStr] = useState('Sobota,  2026');
  const [evIsoDate, setEvIsoDate] = useState('2026-08-22');
  const [evTopic, setEvTopic] = useState('');
  const [evTime, setEvTime] = useState('09:30 - 14:30');
  const [evRoom, setEvRoom] = useState('Sala nr 14');
  const [evIsHoliday, setEvIsHoliday] = useState(false);
  const [evNotes, setEvNotes] = useState('');

  // Worksheet Form State
  const [wsTitle, setWsTitle] = useState('');
  const [wsCategory, setWsCategory] = useState('');
  const [wsDesc, setWsDesc] = useState('');
  const [wsPdfData, setWsPdfData] = useState<string | undefined>(undefined);
  const [wsFileName, setWsFileName] = useState<string>('');
  const [wsFileSize, setWsFileSize] = useState<string>('');

  // Class Summary Form State (Dynamic lists)
  const [sumDate, setSumDate] = useState('');
  const [sumTopic, setSumTopic] = useState('');
  const [sumDesc, setSumDesc] = useState('');
  const [sumSkillsList, setSumSkillsList] = useState<string[]>(['']);
  const [sumActivitiesList, setSumActivitiesList] = useState<string[]>(['']);
  const [sumVocabInput, setSumVocabInput] = useState('');
  const [sumHomeworkList, setSumHomeworkList] = useState<string[]>(['']);

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
    setTaskSaturdayDate(task.eventDateStr || task.date || 'Sobota, 29 Sierpnia 2026');
    setTaskTopic(task.topic || '');

    let words = '';
    if (task.spelling && task.spelling.length > 0) {
      words = task.spelling.map((s) => s.word).join(', ');
    } else if (task.wordSearch?.words) {
      words = task.wordSearch.words.map((w) => w.pl).join(', ');
    } else if (task.matching && task.matching.length > 0) {
      words = task.matching.map((m) => m.wordPl).join(', ');
    }
    setTaskWordsInput(words);

    if (task.matching && task.matching.length > 0) {
      setMatchingPairs(
        task.matching.map((m, idx) => {
          let img = m.imageUrl ? normalizeImageUrl(m.imageUrl) : undefined;
          let em = m.emoji;
          if (!img && em && isImageUrl(em)) {
            img = normalizeImageUrl(em);
            em = undefined;
          }
          return {
            id: m.id || `m-${idx}`,
            wordPl: m.wordPl,
            wordEn: m.wordEn,
            description: m.description || '',
            emoji: em || getEmojiForWord(m.wordPl) || '⭐',
            imageUrl: img,
            category: m.category || 'Wiedza',
          };
        })
      );
    } else if (task.spelling && task.spelling.length > 0) {
      setMatchingPairs(
        task.spelling.map((s, idx) => ({
          id: s.id || `m-${idx}`,
          wordPl: s.word,
          description: s.hint || `Opis dla hasła ${s.word}`,
          emoji: s.emoji || getEmojiForWord(s.word) || '⭐',
          category: 'Słówka Lekcyjne',
        }))
      );
    }

    // Scroll form into view
    setTimeout(() => {
      document.getElementById('admin-game-form')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  const cancelEditGame = () => {
    setEditingTaskId(null);
    setTaskTitle('');
    setTaskDescription('');
    setTaskWordsInput('WAKACJE, SŁOŃCE, MORZE, GÓRY, ALFABET, SZKOŁA');
    setTaskSaturdayDate('Sobota, 29 Sierpnia 2026');
    setTaskTopic('');
    setMatchingPairs([
      {
        id: 'm-1',
        wordPl: 'Orzeł Biały',
        description: 'Godło Polski – dumny biały ptak w złotej koronie na czerwonym tle.',
        emoji: '🦅',
        category: 'Symbole Narodowe',
      },
      {
        id: 'm-2',
        wordPl: 'Flaga Polski',
        description: 'Biało-czerwone barwy narodowe, powiewające podczas świąt i uroczystości.',
        emoji: '🇵🇱',
        category: 'Symbole Narodowe',
      },
      {
        id: 'm-3',
        wordPl: 'Syrenka Warszawska',
        description: 'Legendarna postać z mieczem i tarczą, która czuwa i broni stolicy Polski nad Wisłą.',
        emoji: '🧜‍♀️',
        category: 'Legendy',
      },
      {
        id: 'm-4',
        wordPl: 'Smok Wawelski',
        description: 'Potwór z krakowskiej legendy mieszkający w pieczarze pod Zamkiem na Wawelu.',
        emoji: '🐉',
        category: 'Legendy',
      },
      {
        id: 'm-5',
        wordPl: 'Rzeka Wisła',
        description: 'Królowa polskich rzek, najdłuższa rzeka w Polsce płynąca od Tatr aż do Bałtyku.',
        emoji: '🌊',
        category: 'Geografia',
      },
    ]);
  };

  // Sync initial tab, Saturday filter, and task to edit when modal opens or props change
  useEffect(() => {
    if (!isOpen) return;
    if (initialAdminTab) {
      setActiveAdminTab(initialAdminTab);
    }
    if (initialGameSaturday) {
      setGamesFilterSaturday(initialGameSaturday);
      setTaskSaturdayDate(initialGameSaturday);
      const ev = classEvents.find((e) => e.dateStr === initialGameSaturday || e.isoDate === initialGameSaturday);
      if (ev?.topic) setTaskTopic(ev.topic);
    }
    if (initialGameTaskId) {
      const task = allDailyTasks.find((t) => t.id === initialGameTaskId);
      if (task) {
        startEditingGame(task);
      }
    }
  }, [initialAdminTab, initialGameSaturday, initialGameTaskId, isOpen]);

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

    const rawWords = parseWordList(taskWordsInput);

    const matchedEv = classEvents.find(
      (ev) =>
        ev.dateStr.toLowerCase().trim() === taskSaturdayDate.toLowerCase().trim() ||
        ev.isoDate === taskSaturdayDate
    );
    const dateStr = matchedEv ? matchedEv.dateStr : taskSaturdayDate;
    const isoDate = matchedEv ? matchedEv.isoDate : undefined;

    const taskId = editingTaskId || `task-${Date.now()}`;
    const newTask: DailyTask = {
      id: taskId,
      date: dateStr,
      eventDateStr: dateStr,
      eventIsoDate: isoDate,
      topic: taskTopic || matchedEv?.topic || undefined,
      title: taskTitle,
      titleEn: taskTitle,
      description: taskDescription,
      descriptionEn: taskDescription,
      type: taskType,
      starsReward: 15,
    };

    if (taskType === 'matching') {
      const validPairs = matchingPairs
        .filter((p) => (p.wordPl && p.wordPl.trim().length > 0) || (p.description && p.description.trim().length > 0))
        .map((p, idx) => {
          let img = p.imageUrl?.trim() || undefined;
          let em = p.emoji?.trim() || undefined;
          if (!img && em && isImageUrl(em)) {
            img = normalizeImageUrl(em);
            em = undefined;
          }
          return {
            id: p.id || `match-${idx}-${Date.now()}`,
            wordPl: p.wordPl.trim() || `Hasło ${idx + 1}`,
            description: p.description?.trim() || `Opis dla hasła ${p.wordPl}`,
            emoji: em || getEmojiForWord(p.wordPl) || '⭐',
            imageUrl: img ? normalizeImageUrl(img) : undefined,
            category: p.category?.trim() || 'Dopasowywanie',
          };
        });

      const finalPairs = validPairs.length > 0 ? validPairs : [
        { id: `m-1-${Date.now()}`, wordPl: 'Orzeł Biały', description: 'Godło Polski – dumny biały ptak w złotej koronie na czerwonym tle.', emoji: '🦅', category: 'Symbole' },
        { id: `m-2-${Date.now()}`, wordPl: 'Flaga Polski', description: 'Biało-czerwone barwy narodowe, powiewające podczas świąt.', emoji: '🇵🇱', category: 'Symbole' },
        { id: `m-3-${Date.now()}`, wordPl: 'Syrenka Warszawska', description: 'Legendarna postać z mieczem i tarczą, obrończyni stolicy Polski.', emoji: '🧜‍♀️', category: 'Legendy' },
      ];

      newTask.matching = finalPairs;
      newTask.spelling = finalPairs.map((p) => ({
        id: p.id,
        word: p.wordPl.toUpperCase(),
        hint: p.description || '',
        emoji: p.emoji,
      }));
    } else if (taskType === 'spelling' || taskType === 'secret_word' || taskType === 'syllables' || taskType === 'pronoun' || taskType === 'cases') {
      const spellingItems: SpellingItem[] = rawWords.map((w, idx) => ({
        id: `sp-${idx}-${Date.now()}`,
        word: w,
        hint: taskType === 'pronoun'
          ? 'Wybierz zaimek: TEN, TA czy TO?'
          : taskType === 'cases'
          ? 'Uzupełnij brakujące litery w zdaniu (Mianownik, Dopełniacz, Biernik)'
          : 'Ułóż polskie słowo z kafelków',
        emoji: getEmojiForWord(w),
      }));
      newTask.spelling = spellingItems;
    } else if (taskType === 'wordsearch') {
      newTask.wordSearch = {
        words: rawWords.map((w) => ({ pl: w, en: w })),
        gridSize: 8,
      };
    }

    if (editingTaskId && onEditDailyTask) {
      onEditDailyTask(newTask);
      setGameNotification(`✅ Zapisano zmiany w grze "${newTask.title}" (${newTask.eventDateStr || newTask.date})!`);
      setEditingTaskId(null);
    } else {
      onAddDailyTask(newTask);
      setGameNotification(`🎉 Utworzono i opublikowano grę "${newTask.title}" dla zjazdu: ${newTask.eventDateStr || newTask.date}!`);
    }
    setTaskTitle('');
    setTaskDescription('');
    setTaskWordsInput('');
    playSuccessSound();
  };

  const handleBatchUpdateWordsForSaturday = (saturdayDate: string, newWordsString: string) => {
    const rawWords = parseWordList(newWordsString);

    if (rawWords.length === 0) return;

    const tasksForSat = allDailyTasks.filter((t) => {
      const d1 = (t.eventDateStr || t.date || '').toLowerCase().trim();
      const d2 = saturdayDate.toLowerCase().trim();
      return d1 === d2 || d1.includes(d2) || d2.includes(d1);
    });

    if (tasksForSat.length === 0) return;

    const updatedTasks: DailyTask[] = tasksForSat.map((task) => {
      const updatedTask: DailyTask = { ...task };
      if (task.type === 'spelling' || task.type === 'secret_word' || task.type === 'syllables' || task.type === 'pronoun' || task.type === 'cases') {
        updatedTask.spelling = rawWords.map((w, idx) => ({
          id: `sp-${idx}-${Date.now()}`,
          word: w,
          hint: task.type === 'pronoun'
            ? 'Wybierz zaimek: TEN, TA czy TO?'
            : task.type === 'cases'
            ? 'Uzupełnij brakujące litery w zdaniu (Mianownik, Dopełniacz, Biernik)'
            : 'Ułóż polskie słowo z kafelków',
          emoji: getEmojiForWord(w),
        }));
      } else if (task.type === 'wordsearch') {
        updatedTask.wordSearch = {
          words: rawWords.map((w) => ({ pl: w, en: w })),
          gridSize: 8,
        };
      }
      return updatedTask;
    });

    if (onBatchEditDailyTasks) {
      onBatchEditDailyTasks(updatedTasks);
    } else {
      updatedTasks.forEach((task) => {
        if (onEditDailyTask) {
          onEditDailyTask(task);
        }
      });
    }

    setBatchEditSaturday(null);
    setBatchWordsInput('');
    setGameNotification(`✅ Pomyślnie zaktualizowano listę słówek dla wszystkich (${tasksForSat.length}) gier ze zjazdu: ${saturdayDate}!`);
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

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      id="admin-panel-modal"
      className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
    >
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

                      <RichTextEditor
                        label="Treść ogłoszenia (akpity, wyróżnienia, kolory):"
                        value={annContent}
                        onChange={setAnnContent}
                        required
                        rows={4}
                        placeholder="Wpisz treść ogłoszenia... (Enter dodaje nowy akapit, możesz używać pogrubienia, kolorów i wyrównania)"
                        helpText="Naciśnij Enter, aby przejść do kolejnej linii. Użyj panelu bocznego, aby wyróżnić tekst."
                      />

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
                        <div key={ann.id} className="p-3 bg-yellow-50 rounded-xl border-2 border-black flex items-start justify-between gap-2 text-xs">
                          <div className="min-w-0 flex-1">
                            <span className="font-black text-black block mb-1">{ann.title}</span>
                            <div className="text-[11px] text-gray-800 font-bold leading-relaxed whitespace-pre-wrap">
                              <FormattedText text={ann.content} />
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0 ml-2">
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
                  {/* Game Notification Banner */}
                  {gameNotification && (
                    <div className="p-4 bg-emerald-500 text-white rounded-2xl border-3 border-black shadow-[4px_4px_0px_black] font-black text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 shrink-0" />
                        <span>{gameNotification}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            setGameNotification(null);
                            onClose();
                          }}
                          className="bg-white text-black hover:bg-yellow-200 px-3 py-1.5 rounded-xl border-2 border-black font-black text-xs shadow-[2px_2px_0px_black] active:scale-95 transition cursor-pointer flex items-center gap-1.5"
                        >
                          <span>🎮 Zobacz tę grę na żywo</span>
                        </button>
                        <button
                          onClick={() => setGameNotification(null)}
                          className="text-white hover:text-black ml-1 text-sm font-black cursor-pointer p-1"
                          title="Zamknij powiadomienie"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Saturday Filter Tabs */}
                  <div className="bg-[#FFF9E6] p-4 rounded-2xl border-3 border-black shadow-[4px_4px_0px_black]">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                      <div>
                        <span className="text-[11px] font-black uppercase text-black flex items-center gap-1.5">
                          <Layers className="w-4 h-4 text-[#FF4F81]" />
                          <span>Filtruj gry według zjazdu sobotniego:</span>
                        </span>
                        <p className="text-[10px] text-gray-700 font-bold">
                          Wybierz konkretną sobotę, aby szybko edytować lub uzupełnić jej gry i słówka.
                        </p>
                      </div>
                      {editingTaskId && (
                        <div className="inline-flex items-center gap-1 bg-amber-200 border-2 border-black px-2.5 py-1 rounded-xl text-[10px] font-black animate-pulse">
                          <Pencil className="w-3.5 h-3.5 text-amber-700" />
                          <span>Tryb edycji gry aktywny</span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      <button
                        type="button"
                        onClick={() => setGamesFilterSaturday('all')}
                        className={`px-3 py-1.5 rounded-xl border-2 border-black text-xs font-black transition cursor-pointer ${
                          gamesFilterSaturday === 'all'
                            ? 'bg-black text-white shadow-[2px_2px_0px_rgba(0,0,0,0.3)]'
                            : 'bg-white text-black hover:bg-yellow-200'
                        }`}
                      >
                        Wszystkie zjazdy ({allDailyTasks.length})
                      </button>
                      {classEvents.map((ev) => {
                        const count = allDailyTasks.filter((t) => {
                          const td = (t.eventDateStr || t.date || '').toLowerCase().trim();
                          const ed = ev.dateStr.toLowerCase().trim();
                          return td === ed || (t.eventIsoDate && t.eventIsoDate === ev.isoDate);
                        }).length;

                        return (
                          <button
                            key={ev.id}
                            type="button"
                            onClick={() => {
                              setGamesFilterSaturday(ev.dateStr);
                              setTaskSaturdayDate(ev.dateStr);
                              if (ev.topic) setTaskTopic(ev.topic);
                            }}
                            className={`px-3 py-1.5 rounded-xl border-2 border-black text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
                              gamesFilterSaturday === ev.dateStr
                                ? 'bg-[#FF4F81] text-white shadow-[2px_2px_0px_black]'
                                : 'bg-white text-black hover:bg-yellow-200'
                            }`}
                          >
                            <span>{ev.dateStr.split(',')[1]?.trim() || ev.dateStr}</span>
                            <span className={`text-[10px] px-1.5 py-0.2 rounded font-black ${
                              gamesFilterSaturday === ev.dateStr ? 'bg-white text-black' : count > 0 ? 'bg-amber-300 text-black' : 'bg-gray-200 text-gray-700'
                            }`}>
                              {count} {count === 1 ? 'gra' : count > 1 && count < 5 ? 'gry' : 'gier'}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Form for Creating / Editing a Game */}
                  <div id="admin-game-form" className={`p-5 rounded-2xl border-3 border-black shadow-[4px_4px_0px_black] transition-all ${
                    editingTaskId ? 'bg-amber-50 ring-4 ring-amber-400' : 'bg-white'
                  }`}>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div>
                        <h3 className="text-sm font-black text-black uppercase flex items-center gap-2">
                          {editingTaskId ? <Pencil className="w-4 h-4 text-amber-600" /> : <Plus className="w-4 h-4 text-[#FF4F81]" />}
                          <span>{editingTaskId ? 'Edytujesz Grę:' : 'Dodaj Nową Grę dla Uczniów:'}</span>
                        </h3>
                        <p className="text-xs font-bold text-gray-800">
                          {editingTaskId
                            ? 'Zmień tytuł, przypisany zjazd, typ zadania lub listę słówek poniżej i kliknij Zapisz Zmiany.'
                            : 'Wybierz zjazd, podaj słówka oddzielone przecinkami, a system sam wygeneruje interaktywne zadanie.'}
                        </p>
                      </div>

                      {editingTaskId && (
                        <button
                          type="button"
                          onClick={cancelEditGame}
                          className="bg-gray-200 hover:bg-gray-300 text-black border-2 border-black font-black px-3 py-1.5 rounded-xl text-xs uppercase cursor-pointer"
                        >
                          ✕ Anuluj edycję
                        </button>
                      )}
                    </div>

                    <form onSubmit={handleAddGameSubmit} className="space-y-3">
                      {/* Saturday / Class Event Selector */}
                      <div className="p-3 bg-yellow-100/80 rounded-xl border-2 border-black">
                        <label className="block text-[11px] font-black uppercase text-black mb-1 flex items-center justify-between">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-[#FF4F81]" />
                            <span>Przypisz grę do zjazdu sobotniego:</span>
                          </span>
                          <span className="text-[10px] text-gray-600 font-bold">Wybór zjazdu</span>
                        </label>
                        <select
                          value={taskSaturdayDate}
                          onChange={(e) => {
                            setTaskSaturdayDate(e.target.value);
                            const ev = classEvents.find((ev) => ev.dateStr === e.target.value || ev.isoDate === e.target.value);
                            if (ev && ev.topic) setTaskTopic(ev.topic);
                          }}
                          className="w-full px-3 py-2 rounded-xl border-2 border-black text-xs font-black bg-white"
                        >
                          {classEvents.map((ev) => (
                            <option key={ev.id} value={ev.dateStr}>
                              {ev.dateStr} — {ev.topic || (ev.isHoliday ? 'Wolne' : 'Zajęcia')}
                            </option>
                          ))}
                        </select>
                        <p className="text-[10px] text-gray-800 font-bold mt-1">
                          Gra pojawi się w sekcji wybranej soboty i będzie bezpośrednio powiązana z kalendarzem.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-black uppercase text-black mb-1">Tytuł gry / zadania:</label>
                          <input
                            type="text"
                            value={taskTitle}
                            onChange={(e) => setTaskTitle(e.target.value)}
                            required
                            placeholder="np. 🔤 Słówka Wakacyjne"
                            className="w-full px-3 py-2 rounded-xl border-2 border-black text-xs font-bold bg-yellow-50"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-black uppercase text-black mb-1">Rodzaj gry do wyboru:</label>
                          <select
                            value={taskType}
                            onChange={(e) => {
                              const newType = e.target.value as GameType;
                              setTaskType(newType);
                              if (newType === 'matching') {
                                if (!taskTitle || taskTitle.startsWith('🔤') || taskTitle.startsWith('🎯') || taskTitle.startsWith('📖')) {
                                  setTaskTitle('🧩 Przeciągnij i Dopasuj: Symbole i Wiedza');
                                }
                                if (!taskDescription) {
                                  setTaskDescription('Przeciągnij opis i dopasuj go do właściwego tytułu lub zdjęcia!');
                                }
                              }
                            }}
                            className="w-full px-3 py-2 rounded-xl border-2 border-black text-xs font-black bg-white"
                          >
                            <option value="spelling">🔤 Układanie Słów z Liter</option>
                            <option value="secret_word">🎯 Tajne Słowo (Zgadywanka / Koło Fortuny)</option>
                            <option value="syllables">🧩 Układanka Sylabowa (Łączenie sylab)</option>
                            <option value="wordsearch">🔍 Wykreślanka Słów</option>
                            <option value="pronoun">Ten, Ta czy To? (Zaimki Wskazujące)</option>
                            <option value="cases">📖 Odmiana przez Przypadki (Uzupełnij brakujące litery)</option>
                            <option value="matching">🧩 Przeciągnij i Dopasuj (Opis do Tytułu lub Zdjęcia)</option>
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
                          placeholder="np. Przeciągnij opis na odpowiednią kartę z symbolem lub hasłem"
                          className="w-full px-3 py-2 rounded-xl border-2 border-black text-xs font-bold bg-yellow-50"
                        />
                      </div>

                      {/* Matching Game Pairs Editor (when taskType === 'matching') */}
                      {taskType === 'matching' ? (
                        <div className="p-4 bg-orange-50/80 rounded-2xl border-2 border-black space-y-3">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b-2 border-black/20 pb-2">
                            <div>
                              <label className="block text-xs font-black uppercase text-black">
                                🧩 Pary do dopasowania (Tytuł + Opis + Zdjęcie/Emoji):
                              </label>
                              <p className="text-[10px] text-gray-800 font-bold">
                                Dziecko będzie przeciągać opis i upuszczać go na pasujący tytuł lub obrazek.
                              </p>
                            </div>

                            {/* Preset Buttons */}
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-[10px] font-black text-gray-600 uppercase">Gotowe szablony:</span>
                              <button
                                type="button"
                                onClick={() => handleLoadMatchingPreset('symbols')}
                                className="bg-yellow-200 hover:bg-yellow-300 text-black border border-black px-2 py-0.5 rounded-lg text-[10px] font-black cursor-pointer shadow-[1px_1px_0px_black]"
                              >
                                🇵🇱 Symbole
                              </button>
                              <button
                                type="button"
                                onClick={() => handleLoadMatchingPreset('legends')}
                                className="bg-yellow-200 hover:bg-yellow-300 text-black border border-black px-2 py-0.5 rounded-lg text-[10px] font-black cursor-pointer shadow-[1px_1px_0px_black]"
                              >
                                🐉 Legendy
                              </button>
                              <button
                                type="button"
                                onClick={() => handleLoadMatchingPreset('school')}
                                className="bg-yellow-200 hover:bg-yellow-300 text-black border border-black px-2 py-0.5 rounded-lg text-[10px] font-black cursor-pointer shadow-[1px_1px_0px_black]"
                              >
                                🏫 Szkoła
                              </button>
                              <button
                                type="button"
                                onClick={() => handleLoadMatchingPreset('autumn')}
                                className="bg-yellow-200 hover:bg-yellow-300 text-black border border-black px-2 py-0.5 rounded-lg text-[10px] font-black cursor-pointer shadow-[1px_1px_0px_black]"
                              >
                                🍂 Jesień
                              </button>
                            </div>
                          </div>

                          {/* Quick Text Bulk Input Toggle */}
                          <div>
                            <button
                              type="button"
                              onClick={() => setShowQuickPairText(!showQuickPairText)}
                              className="text-[11px] font-black text-blue-700 underline uppercase cursor-pointer hover:text-blue-900"
                            >
                              {showQuickPairText ? '✕ Zamknij szybkie wklejanie tekstem' : '📋 Wklej pary zbiorczo tekstem (Hasło | Opis | Emoji)'}
                            </button>

                            {showQuickPairText && (
                              <div className="mt-2 p-3 bg-white rounded-xl border-2 border-black space-y-2">
                                <p className="text-[10px] text-gray-700 font-bold">
                                  Wklej każdą parę w osobnej linii w formacie: <code>Tytuł | Opis do przeciągnięcia | Emoji/Zdjęcie</code>
                                </p>
                                <textarea
                                  value={quickPairText}
                                  onChange={(e) => setQuickPairText(e.target.value)}
                                  rows={4}
                                  placeholder={`Orzeł Biały | Godło Polski – dumny biały ptak w złotej koronie na czerwonym tle | 🦅\nFlaga Polski | Biało-czerwone barwy narodowe powiewające podczas świąt | 🇵🇱\nWisła | Najdłuższa rzeka w Polsce płynąca do Morza Bałtyckiego | 🌊`}
                                  className="w-full p-2 text-xs font-mono border border-black rounded-lg bg-yellow-50"
                                />
                                <button
                                  type="button"
                                  onClick={handleApplyQuickPairText}
                                  className="bg-emerald-500 hover:bg-emerald-600 text-white font-black px-3 py-1.5 rounded-lg text-xs uppercase border border-black shadow-[2px_2px_0px_black] cursor-pointer"
                                >
                                  Zastosuj Wklejone Pary ✨
                                </button>
                              </div>
                            )}
                          </div>

                          {/* Image upload status toast notification */}
                          {imageUploadStatus && (
                            <div className="py-2 px-3 rounded-xl border-2 border-black bg-emerald-100 text-emerald-950 font-black text-xs shadow-[2px_2px_0px_black] animate-bounce-short flex items-center gap-2">
                              <Sparkles className="w-4 h-4 text-emerald-700 shrink-0" />
                              <span>{imageUploadStatus}</span>
                            </div>
                          )}

                          {/* Info Helper on Photos */}
                          <div className="p-2.5 bg-blue-50 border-2 border-blue-400 rounded-xl text-[11px] text-blue-950 font-bold flex items-start gap-2">
                            <ImageIcon className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                            <div>
                              <span><b>Jak najlepiej dodawać zdjęcia?</b> Linki ze stron takich jak Google Grafika czy Pinterest często blokują bezpośrednie wyświetlanie na innych stronach. Najwygodniejsza i w 100% niezawodna metoda to kliknięcie <b>📁 Wgraj z dysku</b> — zdjęcie zapisze się bezpośrednio w grze!</span>
                            </div>
                          </div>

                          {/* Individual Pairs List */}
                          <div className="space-y-4 max-h-[560px] overflow-y-auto pr-1">
                            {matchingPairs.map((pair, pIdx) => (
                              <div
                                key={pair.id || `pair-${pIdx}`}
                                className="p-4 bg-white rounded-2xl border-3 border-black shadow-[3px_3px_0px_black] space-y-3 transition hover:border-[#FF4F81]"
                              >
                                <div className="flex items-center justify-between gap-2 border-b-2 border-black/10 pb-2">
                                  <div className="flex items-center gap-2">
                                    <span className="text-[11px] font-black uppercase text-black bg-[#FFD700] px-2.5 py-0.5 rounded-lg border-2 border-black shadow-[1px_1px_0px_black]">
                                      Para #{pIdx + 1}
                                    </span>
                                    {pair.imageUrl ? (
                                      <span className="text-[10px] font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-400 flex items-center gap-1">
                                        <Check className="w-3 h-3 text-emerald-600" />
                                        <span>Zdjęcie dodane</span>
                                      </span>
                                    ) : (
                                      <span className="text-[10px] font-bold text-gray-600">
                                        Symbol: {pair.emoji || getEmojiForWord(pair.wordPl) || '⭐'}
                                      </span>
                                    )}
                                  </div>

                                  {matchingPairs.length > 2 && (
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveMatchingPair(pIdx)}
                                      className="text-rose-600 hover:text-rose-800 text-[11px] font-black uppercase cursor-pointer flex items-center gap-1 hover:bg-rose-50 px-2 py-1 rounded-lg border border-transparent hover:border-rose-400 transition"
                                      title="Usuń tę parę"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                      <span>Usuń parę</span>
                                    </button>
                                  )}
                                </div>

                                {/* Row 1: Title / Target */}
                                <div>
                                  <label className="block text-[11px] font-black uppercase text-black mb-1 flex items-center justify-between">
                                    <span>Tytuł / Hasło (cel, na który uczeń upuści opis):</span>
                                    <span className="text-[10px] text-gray-500 font-bold">np. Orzeł Biały, Wawel, Podręcznik</span>
                                  </label>
                                  <input
                                    type="text"
                                    value={pair.wordPl}
                                    onChange={(e) => handleUpdateMatchingPair(pIdx, 'wordPl', e.target.value)}
                                    placeholder="np. Orzeł Biały"
                                    required
                                    className="w-full px-3 py-2 rounded-xl border-2 border-black text-sm font-black bg-yellow-50 focus:bg-white focus:ring-2 focus:ring-[#FF4F81] focus:outline-none"
                                  />
                                </div>

                                {/* Row 2: Description (Large Expandable Textarea) */}
                                <div>
                                  <label className="block text-[11px] font-black uppercase text-black mb-1 flex items-center justify-between">
                                    <span className="text-[#FF4F81]">Opis (tekst do przeciągania przez dziecko):</span>
                                    <span className="text-[10px] text-gray-500 font-bold">Rozszerzalne okienko ↘</span>
                                  </label>
                                  <textarea
                                    value={pair.description || ''}
                                    onChange={(e) => handleUpdateMatchingPair(pIdx, 'description', e.target.value)}
                                    placeholder="Wpisz treść opisu lub definicji, np. Godło Polski – dumny biały ptak w złotej koronie na czerwonym tle."
                                    required
                                    rows={3}
                                    className="w-full p-3 rounded-xl border-2 border-black text-xs sm:text-sm font-bold bg-yellow-50 focus:bg-white focus:ring-2 focus:ring-[#FF4F81] focus:outline-none leading-relaxed resize-y min-h-[72px]"
                                  />
                                </div>

                                {/* Row 3: Image / Emoji Controls */}
                                <div className="p-3 bg-amber-50/70 rounded-xl border-2 border-black/30 space-y-2">
                                  <span className="block text-[11px] font-black uppercase text-black flex items-center gap-1.5">
                                    <ImageIcon className="w-3.5 h-3.5 text-[#4F81FF]" />
                                    <span>Ilustracja lub Symbol dla tej pary:</span>
                                  </span>

                                  {pair.imageUrl ? (
                                    /* Active Image Preview with controls */
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-2.5 bg-white rounded-xl border-2 border-black">
                                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl border-2 border-black bg-gray-100 overflow-hidden shrink-0 flex items-center justify-center shadow-[2px_2px_0px_black] relative">
                                        <img
                                          src={pair.imageUrl}
                                          alt={pair.wordPl || 'Podgląd'}
                                          referrerPolicy="no-referrer"
                                          crossOrigin="anonymous"
                                          className="w-full h-full object-cover"
                                          onError={(e) => {
                                            (e.target as HTMLElement).style.display = 'none';
                                            const badge = (e.target as HTMLElement).parentElement?.querySelector('.img-error-badge');
                                            if (badge) (badge as HTMLElement).style.display = 'flex';
                                          }}
                                        />
                                        <div className="img-error-badge hidden absolute inset-0 bg-rose-100 text-rose-900 text-[9px] font-black flex-col items-center justify-center p-1 text-center">
                                          <AlertTriangle className="w-4 h-4 text-rose-600 mb-0.5" />
                                          <span>Błąd linku</span>
                                        </div>
                                      </div>

                                      <div className="flex-1 min-w-0 space-y-1">
                                        <div className="flex items-center gap-1 text-xs font-black text-emerald-800">
                                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                          <span>Zdjęcie przypisane i gotowe</span>
                                        </div>
                                        <p className="text-[10px] text-gray-600 font-mono truncate max-w-sm">
                                          {pair.imageUrl.startsWith('data:') ? 'Plik wgrany z dysku (zoptymalizowany)' : pair.imageUrl}
                                        </p>
                                        <div className="flex items-center gap-2 pt-1 flex-wrap">
                                          <label className="text-[10px] bg-yellow-200 hover:bg-yellow-300 text-black px-2.5 py-1 rounded-lg border border-black font-black cursor-pointer inline-flex items-center gap-1 active:scale-95 transition shadow-[1px_1px_0px_black]">
                                            <Upload className="w-3 h-3" />
                                            <span>Wgraj inne zdjęcie z dysku</span>
                                            <input
                                              type="file"
                                              accept="image/*"
                                              className="hidden"
                                              onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) handleImageUploadForPair(pIdx, file);
                                              }}
                                            />
                                          </label>
                                          <button
                                            type="button"
                                            onClick={() => handleUpdateMatchingPair(pIdx, 'imageUrl', '')}
                                            className="text-[10px] text-rose-700 hover:text-rose-900 font-black cursor-pointer underline"
                                          >
                                            Usuń zdjęcie ✕
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  ) : (
                                    /* Image selection: Direct Upload OR Link OR Emoji */
                                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5 items-center">
                                      {/* Option A: Direct File Upload Button */}
                                      <div className="lg:col-span-5">
                                        <label className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-emerald-500 hover:bg-emerald-600 text-white border-2 border-black rounded-xl text-xs font-black cursor-pointer shadow-[2px_2px_0px_black] active:scale-95 transition">
                                          <Upload className="w-4 h-4 text-white" />
                                          <span>📁 Wgraj zdjęcie z dysku / tel.</span>
                                          <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => {
                                              const file = e.target.files?.[0];
                                              if (file) handleImageUploadForPair(pIdx, file);
                                            }}
                                          />
                                        </label>
                                      </div>

                                      {/* Option B: Link URL input */}
                                      <div className="lg:col-span-5">
                                        <div className="relative">
                                          <input
                                            type="text"
                                            placeholder="Lub wklej link URL do zdjęcia..."
                                            value={pair.imageUrl || ''}
                                            onChange={(e) => handleUpdateMatchingPair(pIdx, 'imageUrl', e.target.value)}
                                            className="w-full px-2.5 py-2 rounded-xl border-2 border-black text-xs font-bold bg-white focus:ring-2 focus:ring-[#FF4F81] focus:outline-none"
                                          />
                                        </div>
                                      </div>

                                      {/* Option C: Emoji fallback */}
                                      <div className="lg:col-span-2 flex items-center gap-1">
                                        <span className="text-[10px] font-black text-gray-700 whitespace-nowrap">Emoji:</span>
                                        <input
                                          type="text"
                                          value={pair.emoji || ''}
                                          onChange={(e) => handleUpdateMatchingPair(pIdx, 'emoji', e.target.value)}
                                          placeholder="np. 🦅"
                                          className="w-full px-2 py-1.5 rounded-xl border-2 border-black text-xs font-bold bg-white text-center"
                                        />
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>

                          <button
                            type="button"
                            onClick={handleAddMatchingPair}
                            className="bg-yellow-300 hover:bg-yellow-400 text-black border-2 border-black font-black px-4 py-2 rounded-xl text-xs uppercase cursor-pointer shadow-[2px_2px_0px_black] active:scale-95 transition flex items-center gap-1.5"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>+ Dodaj kolejną parę do dopasowania</span>
                          </button>
                        </div>
                      ) : (
                        /* Standard Word List for other game types */
                        <div>
                          <label className="block text-[11px] font-black uppercase text-black mb-1">
                            Słowa do przećwiczenia w grze (oddzielone przecinkami):
                          </label>
                          <input
                            type="text"
                            value={taskWordsInput}
                            onChange={(e) => setTaskWordsInput(e.target.value)}
                            required={taskType !== 'matching'}
                            placeholder="WAKACJE, SŁOŃCE, MORZE, GÓRY, ALFABET, SZKOŁA"
                            className="w-full px-3 py-2 rounded-xl border-2 border-black text-xs font-mono font-bold bg-yellow-50"
                          />
                          <p className="text-[10px] text-gray-800 font-bold mt-1">
                            Wpisz słowa oddzielone przecinkami (np. <i>WAKACJE, SŁOŃCE, MORZE, GÓRY</i>).
                          </p>
                        </div>
                      )}

                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="submit"
                          className={`text-white border-2 border-black font-black px-5 py-2.5 rounded-xl text-xs uppercase cursor-pointer shadow-[3px_3px_0px_black] active:scale-95 transition ${
                            editingTaskId ? 'bg-amber-500 hover:bg-amber-600' : 'bg-emerald-500 hover:bg-emerald-600'
                          }`}
                        >
                          {editingTaskId ? '💾 Zapisz Zmiany w Grze ✏️' : '+ Stwórz i Opublikuj Grę ✨'}
                        </button>
                        {editingTaskId && (
                          <button
                            type="button"
                            onClick={cancelEditGame}
                            className="bg-gray-200 hover:bg-gray-300 text-black border-2 border-black font-bold px-4 py-2.5 rounded-xl text-xs uppercase cursor-pointer"
                          >
                            Anuluj
                          </button>
                        )}
                      </div>
                    </form>
                  </div>

                  {/* Grouped Saturday Games List */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-black uppercase tracking-wider text-black flex items-center gap-2">
                        <Gamepad2 className="w-4 h-4 text-[#FF4F81]" />
                        <span>
                          Gry Przypisane do Zjazdów {gamesFilterSaturday !== 'all' ? `(${gamesFilterSaturday})` : ''}
                        </span>
                      </h3>
                      <span className="text-[11px] font-bold text-gray-700">
                        Łącznie: {allDailyTasks.length} {allDailyTasks.length === 1 ? 'gra' : 'gier'}
                      </span>
                    </div>

                    {classEvents
                      .filter((ev) => gamesFilterSaturday === 'all' || ev.dateStr === gamesFilterSaturday)
                      .map((ev) => {
                        const satTasks = allDailyTasks.filter((t) => {
                          const td = (t.eventDateStr || t.date || '').toLowerCase().trim();
                          const ed = ev.dateStr.toLowerCase().trim();
                          return td === ed || (t.eventIsoDate && t.eventIsoDate === ev.isoDate);
                        });

                        // Extract active words from the first task with words
                        const sampleWords = satTasks.find((t) => t.spelling && t.spelling.length > 0)?.spelling?.map((s) => s.word).join(', ') ||
                          satTasks.find((t) => t.wordSearch?.words)?.wordSearch?.words.map((w) => w.pl).join(', ') || '';

                        const isBatchEditingThisSat = batchEditSaturday === ev.dateStr;

                        return (
                          <div key={ev.id} className="bg-white p-5 rounded-2xl border-3 border-black shadow-[4px_4px_0px_black] space-y-4">
                            {/* Saturday Block Header */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b-2 border-black">
                              <div>
                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                  <span className="bg-[#FF4F81] text-white text-[11px] px-2.5 py-0.5 rounded-lg border border-black font-black uppercase shadow-[1px_1px_0px_black]">
                                    📅 {ev.dateStr}
                                  </span>
                                  {ev.topic && (
                                    <span className="bg-[#FFD700] text-black text-[11px] px-2 py-0.5 rounded-lg border border-black font-black">
                                      {ev.topic}
                                    </span>
                                  )}
                                  <span className="bg-gray-100 text-gray-800 text-[10px] px-2 py-0.5 rounded border border-black font-bold">
                                    {satTasks.length} {satTasks.length === 1 ? 'gra' : satTasks.length > 1 && satTasks.length < 5 ? 'gry' : 'gier'}
                                  </span>
                                </div>
                                {sampleWords && (
                                  <p className="text-[11px] font-bold text-gray-700 mt-1">
                                    <span className="text-black font-black">Słówka zjazdu:</span> {sampleWords}
                                  </p>
                                )}
                              </div>

                              {/* Saturday Actions */}
                              <div className="flex items-center gap-2 flex-wrap shrink-0">
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (isBatchEditingThisSat) {
                                      setBatchEditSaturday(null);
                                    } else {
                                      setBatchEditSaturday(ev.dateStr);
                                      setBatchWordsInput(sampleWords || 'WAKACJE, SŁOŃCE, MORZE, GÓRY, ALFABET, SZKOŁA');
                                    }
                                  }}
                                  className="bg-purple-600 hover:bg-purple-700 text-white border-2 border-black font-black px-3 py-1.5 rounded-xl text-xs uppercase shadow-[2px_2px_0px_black] cursor-pointer flex items-center gap-1.5 active:scale-95 transition"
                                  title="Zmień słówka we wszystkich grach tego zjazdu na raz"
                                >
                                  <RefreshCw className="w-3.5 h-3.5" />
                                  <span>{isBatchEditingThisSat ? 'Zamknij szybką edycję' : '⚡ Zmień słówka w zjeździe'}</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingTaskId(null);
                                    setTaskSaturdayDate(ev.dateStr);
                                    if (ev.topic) setTaskTopic(ev.topic);
                                    setTaskTitle(`🔤 Gra: ${ev.topic || 'Zadanie'}`);
                                    if (sampleWords) setTaskWordsInput(sampleWords);
                                    document.getElementById('admin-game-form')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                  }}
                                  className="bg-emerald-500 hover:bg-emerald-600 text-white border-2 border-black font-black px-3 py-1.5 rounded-xl text-xs uppercase shadow-[2px_2px_0px_black] cursor-pointer flex items-center gap-1.5 active:scale-95 transition"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                  <span>Dodaj grę do tej soboty</span>
                                </button>
                              </div>
                            </div>

                            {/* Batch Words Editor Panel for this Saturday */}
                            {isBatchEditingThisSat && (
                              <div className="p-4 bg-purple-50 rounded-xl border-2 border-purple-800 space-y-3">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-black text-purple-950 uppercase flex items-center gap-1.5">
                                    <RefreshCw className="w-4 h-4 text-purple-700" />
                                    <span>Szybka Aktualizacja Słówek dla całego zjazdu ({ev.dateStr}):</span>
                                  </span>
                                  <span className="text-[10px] text-purple-900 font-bold">Dotyczy {satTasks.length} gier</span>
                                </div>
                                <p className="text-[11px] text-gray-800 font-bold">
                                  Wpisz nową listę słów poniżej. Zostanie ona automatycznie zaktualizowana we wszystkich grach przypisanych do tej soboty!
                                </p>
                                <textarea
                                  value={batchWordsInput}
                                  onChange={(e) => setBatchWordsInput(e.target.value)}
                                  rows={2}
                                  placeholder="np. WAKACJE, SŁOŃCE, MORZE, GÓRY, ALFABET, SZKOŁA"
                                  className="w-full px-3 py-2 rounded-xl border-2 border-black text-xs font-mono font-bold bg-white"
                                />
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => handleBatchUpdateWordsForSaturday(ev.dateStr, batchWordsInput)}
                                    className="bg-purple-700 hover:bg-purple-800 text-white border-2 border-black font-black px-4 py-2 rounded-xl text-xs uppercase shadow-[2px_2px_0px_black] cursor-pointer flex items-center gap-1.5"
                                  >
                                    <Check className="w-4 h-4" />
                                    <span>Zastosuj nowe słówka do wszystkich {satTasks.length} gier</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setBatchEditSaturday(null)}
                                    className="bg-gray-200 hover:bg-gray-300 text-black border-2 border-black font-bold px-3 py-2 rounded-xl text-xs uppercase cursor-pointer"
                                  >
                                    Anuluj
                                  </button>
                                </div>
                              </div>
                            )}

                            {/* Games List for this Saturday */}
                            {satTasks.length === 0 ? (
                              <div className="p-4 bg-yellow-50 rounded-xl border-2 border-dashed border-black text-center">
                                <p className="text-xs font-bold text-gray-700">
                                  Brak przypisanych gier do tej soboty.
                                </p>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setTaskSaturdayDate(ev.dateStr);
                                    if (ev.topic) setTaskTopic(ev.topic);
                                    document.getElementById('admin-game-form')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                  }}
                                  className="mt-2 text-xs font-black text-[#FF4F81] underline uppercase cursor-pointer hover:text-pink-700"
                                >
                                  + Kliknij tutaj, aby utworzyć pierwszą grę dla {ev.dateStr.split(',')[1] || ev.dateStr}
                                </button>
                              </div>
                            ) : (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {satTasks.map((task) => {
                                  const isCurrentEditing = editingTaskId === task.id;
                                  const wordsList = task.spelling?.map((s) => s.word).join(', ') ||
                                    task.wordSearch?.words?.map((w) => w.pl).join(', ') || '';

                                  return (
                                    <div
                                      key={task.id}
                                      className={`p-3.5 rounded-xl border-2 border-black flex flex-col justify-between gap-3 text-xs transition ${
                                        isCurrentEditing ? 'bg-amber-100 ring-2 ring-amber-500' : 'bg-yellow-50/80 hover:bg-yellow-100/90'
                                      }`}
                                    >
                                      <div>
                                        <div className="flex items-center justify-between gap-2 mb-1.5">
                                          <span className="bg-white text-black text-[10px] px-2 py-0.5 rounded border border-black font-black uppercase">
                                            {task.type === 'spelling' ? '🔤 Układanie Liter' :
                                             task.type === 'secret_word' ? '🎯 Tajne Słowo' :
                                             task.type === 'syllables' ? '🧩 Sylaby' :
                                             task.type === 'wordsearch' ? '🔍 Wykreślanka' :
                                             task.type === 'pronoun' ? 'Ten, Ta, To' :
                                             task.type === 'cases' ? '📖 Przypadki' :
                                             task.type === 'matching' ? '🧩 Przeciągnij i Dopasuj' : task.type}
                                          </span>
                                          {isCurrentEditing && (
                                            <span className="bg-amber-400 text-black text-[9px] px-1.5 py-0.2 rounded font-black uppercase">
                                              Edytowana teraz
                                            </span>
                                          )}
                                        </div>
                                        <span className="font-black text-black text-sm block mb-1">{task.title}</span>
                                        <p className="text-[11px] text-gray-800 font-bold mb-2">{task.description}</p>
                                        {task.type === 'matching' && task.matching && task.matching.length > 0 ? (
                                          <div className="text-[10px] text-gray-800 bg-white/80 p-2 rounded-lg border border-black/30 font-bold space-y-1">
                                            <div className="font-black text-black">
                                              Pary do dopasowania ({task.matching.length}):
                                            </div>
                                            <div className="flex flex-wrap gap-1">
                                              {task.matching.map((m) => (
                                                <span key={m.id} className="bg-amber-100 text-black px-1.5 py-0.5 rounded border border-black/20 text-[9px]">
                                                  {m.emoji || '⭐'} {m.wordPl}
                                                </span>
                                              ))}
                                            </div>
                                          </div>
                                        ) : wordsList ? (
                                          <p className="text-[10px] text-gray-700 font-mono font-bold bg-white/70 p-1.5 rounded border border-black/30">
                                            <span className="font-sans font-black text-black">Słowa ({task.spelling?.length || task.wordSearch?.words.length}):</span> {wordsList}
                                          </p>
                                        ) : null}
                                      </div>

                                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-black/20">
                                        <button
                                          type="button"
                                          onClick={() => startEditingGame(task)}
                                          className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-black py-2 px-3 rounded-xl border-2 border-black text-xs uppercase cursor-pointer shadow-[2px_2px_0px_black] active:scale-95 transition flex items-center justify-center gap-1.5"
                                          title="Edytuj tę grę"
                                        >
                                          <Pencil className="w-3.5 h-3.5" />
                                          <span>Edytuj grę</span>
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => onDeleteDailyTask(task.id)}
                                          className="p-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl border-2 border-black cursor-pointer shadow-[2px_2px_0px_black] active:scale-95 transition"
                                          title="Usuń grę"
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </button>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
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
                      <span>{editingSummaryId ? 'Edytujesz Podsumowanie Zajęć:' : 'Dodaj Nowe Podsumowanie Zajęć:'}</span>
                    </h3>
                    <p className="text-xs font-bold text-gray-800 mb-3">
                      Wpisz przebieg zajęć, skorzystaj z panelu formatowania tekstu (wyjustowanie, kolory, wyróżnienia) oraz dodaj ćwiczone umiejętności i zadania domowe!
                    </p>

                    <form onSubmit={handleAddSummarySubmit} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-black uppercase text-black mb-1">Data zjazdu sobotniego:</label>
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
                          <label className="block text-[11px] font-black uppercase text-black mb-1">Temat zajęć:</label>
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

                      <RichTextEditor
                        label="Główny opis i podsumowanie zajęć (z panelem formatowania):"
                        value={sumDesc}
                        onChange={setSumDesc}
                        required
                        rows={4}
                        placeholder="Omówiliśmy legendę o Syrence Warszawskiej, głośno czytaliśmy tekst i wykonywaliśmy wycinankę..."
                        helpText="Użyj bocznego panelu, aby wyjustować tekst, pogrubić, podkreślić, dodać kolor lub wyróżnić ważne fragmenty."
                      />

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
                          {editingSummaryId ? '💾 Zapisz Zmiany Podsumowania ✏️' : '+ Opublikuj Podsumowanie Zajęć 📜'}
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
                      Opublikowane Podsumowania Zajęć ({summaries.length}):
                    </h3>
                    <div className="space-y-2">
                      {summaries.map((sum) => (
                        <div key={sum.id} className="p-3 bg-yellow-50 rounded-xl border-2 border-black flex items-start justify-between gap-2 text-xs">
                          <div className="min-w-0 flex-1">
                            <span className="font-black text-black block mb-1">{sum.date} — {sum.topic}</span>
                            <div className="text-[11px] text-gray-800 font-bold leading-relaxed whitespace-pre-wrap">
                              <FormattedText text={sum.description} />
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0 ml-2">
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
