import React from 'react';
import { DailyTask } from '../types';
import { SpellingGame } from './games/SpellingGame';
import { SecretWordGame } from './games/SecretWordGame';
import { SyllableGame } from './games/SyllableGame';
import { WordSearchGame } from './games/WordSearchGame';
import {
  Gamepad2,
  Sparkles,
  Trophy,
} from 'lucide-react';

interface GamesTabProps {
  dailyTask: DailyTask;
  allDailyTasks: DailyTask[];
  onSelectTask: (taskId: string) => void;
}

export const GamesTab: React.FC<GamesTabProps> = ({
  dailyTask,
  allDailyTasks,
  onSelectTask,
}) => {
  const currentTaskIndex = allDailyTasks.findIndex((t) => t.id === dailyTask.id);
  const nextTaskIndex = (currentTaskIndex + 1) % allDailyTasks.length;
  const nextTask = allDailyTasks[nextTaskIndex];

  const handleNextGame = () => {
    if (nextTask) {
      onSelectTask(nextTask.id);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 w-full max-w-4xl mx-auto px-1 sm:px-0">
      {/* Header Banner */}
      <section className="bg-gradient-to-r from-[#FF4F81] via-[#FFD700] to-[#4F81FF] p-4 sm:p-6 rounded-2xl sm:rounded-3xl border-3 sm:border-4 border-black shadow-[4px_4px_0px_black] sm:shadow-[8px_8px_0px_black] text-black">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-xl border-2 border-black shadow-[2px_2px_0px_black] mb-1.5">
              <Gamepad2 className="w-4 h-4 text-[#FF4F81]" />
              <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-black">
                Strefa Gier i Zadań • Klasa 2
              </span>
            </div>
            <h1 className="text-xl sm:text-3xl font-black uppercase tracking-tight text-black drop-shadow-[1px_1px_0px_white]">
              Interaktywne Gry dla Dzieci 🎮
            </h1>
            <p className="text-xs font-bold text-black mt-1">
              Ćwicz język polski na telefonie i komputerze! Układaj słówka, rozwiąż sylaby i wykreślanki.
            </p>
          </div>
        </div>
      </section>

      {/* Task Selector Tabs (Gry do wyboru - Touch Scroll Carousel for Mobile) */}
      <section className="bg-white p-3 sm:p-5 rounded-2xl sm:rounded-3xl border-3 sm:border-4 border-black shadow-[4px_4px_0px_black] sm:shadow-[8px_8px_0px_black]">
        <div className="flex items-center justify-between gap-2 mb-3">
          <h2 className="text-xs sm:text-sm font-black uppercase text-black flex items-center gap-1.5">
            <Trophy className="w-4 h-4 text-amber-500" />
            <span>Wybierz Grę ({allDailyTasks.length} zadania):</span>
          </h2>
        </div>

        {/* Task Grid & Horizontal Scroll Carousel */}
        <div className="flex sm:grid sm:grid-cols-4 gap-2.5 overflow-x-auto pb-1 touch-pan-x">
          {allDailyTasks.map((task, idx) => {
            const isSelected = dailyTask.id === task.id;
            return (
              <button
                key={task.id}
                onClick={() => onSelectTask(task.id)}
                className={`p-3 rounded-xl sm:rounded-2xl border-2 sm:border-3 border-black text-left flex flex-col justify-between gap-1.5 transition-all cursor-pointer shrink-0 min-w-[140px] sm:min-w-0 ${
                  isSelected
                    ? 'bg-[#FFD700] text-black shadow-[4px_4px_0px_black] scale-[1.02] ring-2 ring-black'
                    : 'bg-white text-black hover:bg-yellow-50 shadow-[2px_2px_0px_black]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded border border-black bg-white">
                      Gra #{idx + 1}
                    </span>
                  </div>
                  <h3 className="text-xs font-black line-clamp-1">
                    {task.title}
                  </h3>
                </div>

                <div className="flex items-center justify-between text-[10px] font-bold text-gray-800">
                  <span className="truncate">
                    {task.type === 'spelling' && '🔤 Litery'}
                    {task.type === 'secret_word' && '🎯 Tajne Słowo'}
                    {task.type === 'syllables' && '🧩 Sylaby'}
                    {task.type === 'wordsearch' && '🔍 Wykreślanka'}
                  </span>
                  {isSelected && <Sparkles className="w-3.5 h-3.5 text-black shrink-0" />}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Main Game Screen Container - Fully Scaled for Phone Viewports */}
      <section className="bg-white p-3 sm:p-6 rounded-2xl sm:rounded-3xl border-3 sm:border-4 border-black shadow-[4px_4px_0px_black] sm:shadow-[8px_8px_0px_black] w-full">
        {/* Active Game Title Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 mb-3 border-b-2 sm:border-b-3 border-black">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-[#FF4F81] text-white border border-black text-[9px] font-black px-2 py-0.5 rounded-full uppercase">
                Aktywna Gra
              </span>
            </div>
            <h2 className="text-lg sm:text-2xl font-black text-black uppercase tracking-tight mt-1">
              {dailyTask.title}
            </h2>
            <p className="text-xs font-bold text-gray-700">
              {dailyTask.description}
            </p>
          </div>
        </div>

        {/* Active Game View */}
        <div className="w-full min-h-[300px] flex flex-col justify-center">
          {dailyTask.type === 'spelling' && dailyTask.spelling && (
            <SpellingGame
              items={dailyTask.spelling}
              onComplete={() => {}}
              onNextGame={handleNextGame}
            />
          )}

          {dailyTask.type === 'secret_word' && dailyTask.spelling && (
            <SecretWordGame
              items={dailyTask.spelling}
              onComplete={() => {}}
              onNextGame={handleNextGame}
            />
          )}

          {dailyTask.type === 'syllables' && dailyTask.spelling && (
            <SyllableGame
              items={dailyTask.spelling}
              onComplete={() => {}}
              onNextGame={handleNextGame}
            />
          )}

          {dailyTask.type === 'wordsearch' && dailyTask.wordSearch && (
            <WordSearchGame
              data={dailyTask.wordSearch}
              onComplete={() => {}}
              onNextGame={handleNextGame}
            />
          )}
        </div>
      </section>
    </div>
  );
};

