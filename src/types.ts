export type TabType = 'home' | 'games' | 'calendar' | 'summaries' | 'worksheets' | 'admin';

export interface ClassEvent {
  id: string;
  dateStr: string; // e.g. "Sobota, 6 Września 2026"
  dayOfWeek: string; // "Sobota"
  isoDate: string; // "2026-09-06"
  time: string; // "09:30 - 14:30"
  topic: string;
  room: string; // e.g. "Sala nr 14"
  status?: 'next' | 'upcoming' | 'past' | 'holiday';
  isHoliday?: boolean; // Czy to dzień wolny / święto
  notes?: string;
}

export type LanguageMode = 'pl' | 'pl_en';

export interface Announcement {
  id: string;
  date: string;
  title: string;
  titleEn?: string;
  content: string;
  contentEn?: string;
  type: 'info' | 'important' | 'event';
  icon?: string;
}

export type GameType = 'spelling' | 'secret_word' | 'syllables' | 'wordsearch';

export interface WordSearchData {
  words: { pl: string; en: string }[];
  gridSize: number;
}

export interface MatchingItem {
  id: string;
  wordPl: string;
  wordEn?: string;
  emoji: string;
  category: string;
}

export interface StoryQuestion {
  id: string;
  question: string;
  questionEn?: string;
  options: string[];
  correctAnswer: number;
}

export interface StoryTaskData {
  title: string;
  storyPl: string;
  storyEn?: string;
  questions: StoryQuestion[];
}

export interface GeographyQuizQuestion {
  id: string;
  question: string;
  questionEn?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  imageOrEmoji?: string;
}

export interface SpellingItem {
  id: string;
  word: string; // np. "SYRENKA"
  hint: string; // np. "Symbol Warszawy"
  emoji?: string; // np. "🧜‍♀️"
}

export interface DailyTask {
  id: string;
  date: string; // e.g. "Sobota, 22 Sierpnia 2026" or "2026-08-22"
  eventDateStr?: string; // e.g. "Sobota, 22 Sierpnia 2026"
  eventIsoDate?: string; // e.g. "2026-08-22"
  topic?: string; // e.g. "Alfabet i Wspomnienia z Wakacji"
  title: string;
  titleEn?: string;
  description: string;
  descriptionEn?: string;
  type: GameType;
  starsReward: number;
  wordSearch?: WordSearchData;
  matching?: MatchingItem[];
  story?: StoryTaskData;
  geography?: GeographyQuizQuestion[];
  spelling?: SpellingItem[];
}

export interface HomeworkItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface VocabularyItem {
  pl: string;
  en?: string;
  category?: string;
}

export interface ClassSummary {
  id: string;
  date: string; // e.g. "Sobota, 12 Września 2026"
  topic: string;
  topicEn?: string;
  description: string; // Co przerabialiśmy na lekcji
  skills?: string[]; // Ćwiczone umiejętności
  activities: string[]; // Przebieg zajęć / ćwiczenia
  vocabulary: VocabularyItem[]; // Słówka do ćwiczenia w domu
  homework: HomeworkItem[]; // Praca domowa
  attachedFiles?: { name: string; url: string; size: string }[];
}

export interface Worksheet {
  id: string;
  title: string;
  titleEn?: string;
  category: 'polski' | 'czytanie' | 'geografia' | 'lamiglowki';
  description: string;
  descriptionEn?: string;
  estimatedTime: string;
  previewLines: string[];
  downloadName: string;
  pdfUrl?: string; // Direct PDF file URL or base64 Data URL
  fileName?: string;
  fileSize?: string;
  addedByTeacher?: boolean;
}

export interface StudentProfile {
  id: string;
  name: string;
  pin: string;
  parentEmail: string;
  avatar: string;
  stars: number;
  streakDays: number;
  lastActiveDate: string;
  completedTaskIds: string[];
  levelName: string;
}

export interface FeedbackMessage {
  id: string;
  date: string;
  studentName: string;
  parentEmail: string;
  rating: 'super' | 'ok' | 'slabo';
  message: string;
  replied?: boolean;
  replyText?: string;
  replyDate?: string;
  emailSentSimulated?: boolean;
}
