import React, { useState, useEffect, useMemo } from 'react';
import { DailyTask, ClassEvent } from '../types';
import { SpellingGame } from './games/SpellingGame';
import { SecretWordGame } from './games/SecretWordGame';
import { SyllableGame } from './games/SyllableGame';
import { WordSearchGame } from './games/WordSearchGame';
import {
  Gamepad2,
  Sparkles,
  Calendar,
  Layers,
  Play,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  ArrowRight,
} from 'lucide-react';

interface GamesTabProps {
  dailyTask: DailyTask;
  allDailyTasks: DailyTask[];
  classEvents?: ClassEvent[];
  targetDate?: string;
  onSelectTask: (taskId: string) => void;
  onOpenAdminForGameEdit?: (saturdayDate: string, taskId?: string) => void;
}

interface WeekGameGroup {
  dateKey: string;
  displayDate: string;
  isoDate?: string;
  topic?: string;
  tasks: DailyTask[];
}

const getGameWord = (count: number) => {
  if (count === 1) return 'gra';
  const lastDigit = count % 10;
  const lastTwo = count % 100;
  if (lastDigit >= 2 && lastDigit <= 4 && (lastTwo < 12 || lastTwo > 14)) return 'gry';
  return 'gier';
};

export const GamesTab: React.FC<GamesTabProps> = ({
  dailyTask,
  allDailyTasks,
  classEvents = [],
  targetDate,
  onSelectTask,
}) => {
  // Group all tasks by Saturday / Event date
  const groupedWeeks = useMemo<WeekGameGroup[]>(() => {
    const groups: { [key: string]: WeekGameGroup } = {};

    allDailyTasks.forEach((task) => {
      const dateKey = task.eventDateStr || task.date || 'Sobota, 22 Sierpnia 2026';
      if (!groups[dateKey]) {
        // Find matching classEvent for richer metadata (topic, isoDate)
        const matchedEvent = classEvents.find(
          (e) =>
            e.dateStr.toLowerCase().trim() === dateKey.toLowerCase().trim() ||
            (task.eventIsoDate && e.isoDate === task.eventIsoDate) ||
            dateKey.includes(e.isoDate)
        );

        groups[dateKey] = {
          dateKey,
          displayDate: matchedEvent ? matchedEvent.dateStr : dateKey,
          isoDate: matchedEvent?.isoDate || task.eventIsoDate,
          topic: task.topic || matchedEvent?.topic || (dateKey.includes('29') ? 'Alfabet i Wspomnienia z Wakacji' : 'Rozpoczęcie Roku Szkolnego i Pierwsze Słówka'),
          tasks: [],
        };
      }
      groups[dateKey].tasks.push(task);
    });

    // Sort weeks descending (newest Saturday first)
    return Object.values(groups).sort((a, b) => {
      const isoA = a.isoDate || (a.dateKey.includes('29') ? '2026-08-29' : '2026-08-22');
      const isoB = b.isoDate || (b.dateKey.includes('29') ? '2026-08-29' : '2026-08-22');
      return isoB.localeCompare(isoA);
    });
  }, [allDailyTasks, classEvents]);

  // Selected week key state (user picks a Saturday module first)
  const [selectedWeekKey, setSelectedWeekKey] = useState<string>(() => {
    if (targetDate) {
      const match = groupedWeeks.find(
        (g) =>
          g.dateKey.toLowerCase().includes(targetDate.toLowerCase()) ||
          targetDate.toLowerCase().includes(g.dateKey.toLowerCase()) ||
          (g.isoDate && targetDate.includes(g.isoDate))
      );
      if (match) return match.dateKey;
    }
    return groupedWeeks[0]?.dateKey || 'Sobota, 29 Sierpnia 2026';
  });

  // Selected active task inside the selected week module
  const [activeTaskId, setActiveTaskId] = useState<string>(() => {
    const currentGroup = groupedWeeks.find((g) => g.dateKey === selectedWeekKey) || groupedWeeks[0];
    return currentGroup?.tasks[0]?.id || dailyTask?.id || allDailyTasks[0]?.id || '';
  });

  // Handle targetDate jump from Calendar or External navigation
  useEffect(() => {
    if (targetDate) {
      const match = groupedWeeks.find(
        (g) =>
          g.dateKey.toLowerCase().includes(targetDate.toLowerCase()) ||
          targetDate.toLowerCase().includes(g.dateKey.toLowerCase()) ||
          (g.isoDate && targetDate.includes(g.isoDate))
      );
      if (match) {
        setSelectedWeekKey(match.dateKey);
        if (match.tasks[0]) {
          setActiveTaskId(match.tasks[0].id);
          onSelectTask(match.tasks[0].id);
        }
        const element = document.getElementById('selected-week-module');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    }
  }, [targetDate, groupedWeeks]);

  // Active module object
  const activeGroup = groupedWeeks.find((g) => g.dateKey === selectedWeekKey) || groupedWeeks[0];

  // If activeTaskId is not in activeGroup, default to first task
  useEffect(() => {
    if (activeGroup && !activeGroup.tasks.some((t) => t.id === activeTaskId)) {
      if (activeGroup.tasks[0]) {
        setActiveTaskId(activeGroup.tasks[0].id);
        onSelectTask(activeGroup.tasks[0].id);
      }
    }
  }, [activeGroup, activeTaskId]);

  const activeTask = activeGroup?.tasks.find((t) => t.id === activeTaskId) || activeGroup?.tasks[0];

  const handleSelectModule = (dateKey: string) => {
    setSelectedWeekKey(dateKey);
    const targetGrp = groupedWeeks.find((g) => g.dateKey === dateKey);
    if (targetGrp && targetGrp.tasks[0]) {
      setActiveTaskId(targetGrp.tasks[0].id);
      onSelectTask(targetGrp.tasks[0].id);
    }
    const element = document.getElementById('selected-week-module');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleNextGameInWeek = () => {
    if (!activeGroup || activeGroup.tasks.length === 0) return;
    const currentIndex = activeGroup.tasks.findIndex((t) => t.id === activeTaskId);
    const nextIndex = (currentIndex + 1) % activeGroup.tasks.length;
    const nextTask = activeGroup.tasks[nextIndex];
    if (nextTask) {
      setActiveTaskId(nextTask.id);
      onSelectTask(nextTask.id);
    }
  };

  // Extract unique preview words from this Saturday's games for visual chips
  // Exclude words separated by hyphens (e.g. syllable breakdowns like "WAR-SZA-WA")
  const activeWordsList: string[] = [];
  if (activeGroup) {
    activeGroup.tasks.forEach((t) => {
      if (t.spelling) {
        t.spelling.forEach((s) => {
          const raw = (s.word || '').trim();
          const hasHyphen = /[-–—/]/.test(raw);
          if (!hasHyphen && raw.length > 0) {
            const clean = raw.toUpperCase();
            if (!activeWordsList.includes(clean)) {
              activeWordsList.push(clean);
            }
          }
        });
      } else if (t.wordSearch?.words) {
        t.wordSearch.words.forEach((w) => {
          const raw = (w.pl || '').trim();
          const hasHyphen = /[-–—/]/.test(raw);
          if (!hasHyphen && raw.length > 0) {
            const clean = raw.toUpperCase();
            if (!activeWordsList.includes(clean)) {
              activeWordsList.push(clean);
            }
          }
        });
      }
    });
  }

  return (
    <div className="space-y-6 sm:space-y-8 w-full max-w-5xl mx-auto animate-fade-in">
      {/* Header Banner */}
      <section className="bg-gradient-to-r from-[#FF4F81] via-[#FFD700] to-[#4F81FF] p-5 sm:p-8 rounded-3xl border-4 border-black shadow-[8px_8px_0px_black] text-black">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-black drop-shadow-[1px_1px_0px_white] break-words">
              Gry i Zadania ze Zjazdów 🎮
            </h1>
            <p className="text-xs sm:text-sm font-bold text-black mt-1 max-w-2xl">
              Wybierz zjazd poniżej i zagraj w gry utrwalające słówka z lekcji. 
            </p>
          </div>

          <div className="bg-white text-black border-3 border-black p-3.5 rounded-2xl text-center shadow-[4px_4px_0px_black] shrink-0 rotate-1">
            <span className="text-2xl sm:text-3xl font-black block leading-none text-[#FF4F81]">
              {groupedWeeks.length}
            </span>
            <span className="text-[11px] font-black block uppercase tracking-wider mt-1">
              Zjazdy Sobotnie
            </span>
          </div>
        </div>
      </section>

      {/* KROK 1: WYBÓR ZJAZDU */}
      <section className="bg-white p-5 sm:p-7 rounded-3xl border-4 border-black shadow-[8px_8px_0px_black] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b-3 border-black pb-3">
          <div>
            <h2 className="text-sm sm:text-base font-black uppercase tracking-tight text-black flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#FF4F81]" />
              <span>Kliknij w kafelek i wybierz zjazd sobotni:</span>
            </h2>
         
          </div>

          <span className="bg-yellow-200 text-black border-2 border-black px-3 py-1 rounded-xl text-xs font-black self-start sm:self-auto">
            {groupedWeeks.length} dostępne zjazdy
          </span>
        </div>

        {/* Module Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {groupedWeeks.map((group, gIdx) => {
            const isSelected = selectedWeekKey === group.dateKey;
            const isLatest = gIdx === 0;

            return (
              <button
                key={group.dateKey}
                onClick={() => handleSelectModule(group.dateKey)}
                className={`p-4 rounded-2xl border-3 border-black text-left flex flex-col justify-between gap-4 transition-all cursor-pointer relative ${
                  isSelected
                    ? 'bg-[#FFD700] text-black shadow-[6px_6px_0px_black] ring-3 ring-black scale-[1.02]'
                    : 'bg-yellow-50/70 hover:bg-yellow-100 text-black shadow-[3px_3px_0px_black] hover:translate-y-[-2px]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-start gap-2 mb-2 min-h-[22px]">
                    {isLatest && (
                      <span className="bg-[#FF4F81] text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase border border-black">
                        Najnowszy
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm sm:text-base font-black text-black leading-tight break-words">
                    {group.displayDate}
                  </h3>
                  <p className="text-xs font-bold text-gray-800 mt-1 line-clamp-2">
                    {group.topic || 'Zadania i gry z zajęć'}
                  </p>
                </div>

                {/* Bottom Row with explicit spacing between game count and open button */}
                <div className="pt-3 border-t border-black/20 flex items-center justify-between gap-4 w-full text-xs font-black">
                  <div className="flex items-center gap-1.5 text-[#FF4F81] shrink-0">
                    <Gamepad2 className="w-4 h-4" />
                    <span>{group.tasks.length} {getGameWord(group.tasks.length)}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* KROK 2: GRY Z WYBRANEGO ZJAZDU */}
      {activeGroup && (
        <section
          id="selected-week-module"
          className="bg-white p-5 sm:p-8 rounded-3xl border-4 border-black shadow-[8px_8px_0px_black] space-y-6 relative"
        >
          {/* Header of the Selected Module (Without "Edytuj w panelu") */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-3 border-black pb-4">
            <div className="flex items-start sm:items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#FFD700] border-3 border-black text-black font-black text-xs flex flex-col items-center justify-center shrink-0 shadow-[3px_3px_0px_black] rotate-[-2deg]">
                <Gamepad2 className="w-6 h-6 text-[#FF4F81]" />
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-black text-black bg-yellow-200 border-2 border-black px-2.5 py-0.5 rounded-md shadow-[2px_2px_0px_black]">
                    {activeGroup.displayDate}
                  </span>
                  <span className="bg-[#4F81FF] text-white border-2 border-black text-[10px] font-black px-2 py-0.5 rounded-full uppercase shadow-[1px_1px_0px_black]">
                    Zestaw {activeGroup.tasks.length} Gier
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-black mt-1 uppercase tracking-tight break-words">
                  {activeGroup.topic || 'Zadania i Gry Edukacyjne'}
                </h2>
              </div>
            </div>
          </div>

          {/* Słówka z tego zjazdu (Preview Chips) */}
          {activeWordsList.length > 0 && (
            <div className="p-3.5 bg-yellow-50 rounded-2xl border-2 border-black">
              <span className="text-[10px] font-black uppercase text-gray-800 block mb-1.5 flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                <span>Słówka ćwiczone w grach tego zjazdu:</span>
              </span>
              <div className="flex flex-wrap gap-1.5">
                {activeWordsList.map((word, wIdx) => (
                  <span
                    key={wIdx}
                    className="bg-white text-black border border-black font-black text-[11px] px-2.5 py-0.5 rounded-lg shadow-[1px_1px_0px_black]"
                  >
                    {word}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Game Selector Buttons (No numbers, no stars, no points) */}
          <div>
            <h3 className="text-xs font-black uppercase text-black mb-2.5 flex items-center gap-1.5">
              <Gamepad2 className="w-4 h-4 text-[#FF4F81]" />
              <span>Wybierz grę:</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
              {activeGroup.tasks.map((task) => {
                const isTaskSelected = activeTask?.id === task.id;
                return (
                  <button
                    key={task.id}
                    onClick={() => {
                      setActiveTaskId(task.id);
                      onSelectTask(task.id);
                    }}
                    className={`p-3 rounded-2xl border-3 border-black text-left flex flex-col justify-between gap-2 transition-all cursor-pointer ${
                      isTaskSelected
                        ? 'bg-[#FFD700] text-black shadow-[4px_4px_0px_black] scale-[1.02] ring-2 ring-black font-black'
                        : 'bg-white text-black hover:bg-yellow-50 shadow-[2px_2px_0px_black]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-[10px] font-bold text-gray-800">
                          {task.type === 'spelling' && '🔤 Układanka'}
                          {task.type === 'secret_word' && '🎯 Zgadywanka'}
                          {task.type === 'syllables' && '🧩 Sylaby'}
                          {task.type === 'wordsearch' && '🔍 Wykreślanka'}
                        </span>
                        {isTaskSelected && <Sparkles className="w-3.5 h-3.5 text-[#FF4F81]" />}
                      </div>
                      <h4 className="text-xs sm:text-sm font-black line-clamp-2 break-words">{task.title}</h4>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Game Player Box */}
          {activeTask && (
            <div className="bg-yellow-50/70 p-4 sm:p-6 rounded-3xl border-3 border-black shadow-[4px_4px_0px_black] space-y-4">
              {/* Game Title Bar */}
              <div className="flex justify-end mb-2">
                <button
                  onClick={handleNextGameInWeek}
                  className="bg-[#4F81FF] hover:bg-blue-600 text-white font-black text-xs px-3.5 py-2 rounded-xl border-2 border-black shadow-[2px_2px_0px_black] active:scale-95 transition cursor-pointer flex items-center gap-1.5 uppercase"
                >
                  <span>Następna gra ➔</span>
                </button>
              </div>

              {/* Active Game Interactive Component */}
              <div className="w-full min-h-[280px] flex flex-col justify-center">
                {activeTask.type === 'spelling' && activeTask.spelling && (
                  <SpellingGame
                    items={activeTask.spelling}
                    onComplete={() => {}}
                    onNextGame={handleNextGameInWeek}
                  />
                )}

                {activeTask.type === 'secret_word' && activeTask.spelling && (
                  <SecretWordGame
                    items={activeTask.spelling}
                    onComplete={() => {}}
                    onNextGame={handleNextGameInWeek}
                  />
                )}

                {activeTask.type === 'syllables' && activeTask.spelling && (
                  <SyllableGame
                    items={activeTask.spelling}
                    onComplete={() => {}}
                    onNextGame={handleNextGameInWeek}
                  />
                )}

                {activeTask.type === 'wordsearch' && activeTask.wordSearch && (
                  <WordSearchGame
                    data={activeTask.wordSearch}
                    onComplete={() => {}}
                    onNextGame={handleNextGameInWeek}
                  />
                )}
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
};

