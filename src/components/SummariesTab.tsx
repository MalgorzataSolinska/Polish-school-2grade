import React, { useState, useEffect } from 'react';
import { ClassSummary } from '../types';
import { Calendar, CheckSquare, Square, BookOpen, Award, CheckCircle2, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { FormattedText } from './FormattedText';

interface SummariesTabProps {
  summaries: ClassSummary[];
  targetDate?: string;
}

function getZajeciaDeclension(count: number): string {
  if (count === 1) return 'Zjazd Sobotni';
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) {
    return 'Zjazdy Sobotnie';
  }
  return 'Zjazdów Sobotnich';
}

export const SummariesTab: React.FC<SummariesTabProps> = ({ summaries, targetDate }) => {
  const [completedHomework, setCompletedHomework] = useState<{ [hwId: string]: boolean }>({
    'hw-1': false,
    'hw-2': false,
    'hw-4': true,
    'hw-5': true,
  });

  // Expand state for earlier summaries (latest is always full, older are collapsible)
  const [expandedSummaryIds, setExpandedSummaryIds] = useState<{ [id: string]: boolean }>({});

  const toggleHomework = (hwId: string) => {
    setCompletedHomework((prev) => ({ ...prev, [hwId]: !prev[hwId] }));
  };

  const toggleSummaryExpand = (id: string) => {
    setExpandedSummaryIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const latestSummary = summaries[0];
  const previousSummaries = summaries.slice(1);

  useEffect(() => {
    if (targetDate) {
      const matchedSummary = summaries.find(
        (s) =>
          s.date.toLowerCase().includes(targetDate.toLowerCase()) ||
          targetDate.toLowerCase().includes(s.date.toLowerCase())
      );
      if (matchedSummary) {
        // If it's in the earlier summaries list, expand it so it's fully visible
        setExpandedSummaryIds((prev) => ({ ...prev, [matchedSummary.id]: true }));
        setTimeout(() => {
          const element = document.getElementById(`summary-${matchedSummary.id}`);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 100);
      }
    }
  }, [targetDate, summaries]);

  // Helper renderer for summary inner contents (left: description/skills/activities/words, right: homework)
  const renderSummaryBody = (summary: ClassSummary) => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Description, Skills & Activities */}
        <div className="md:col-span-2 space-y-5">
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-black mb-2 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-[#FF4F81]" />
              <span>Opis i przebieg zajęć:</span>
            </h3>
            <div className="text-xs sm:text-sm text-black leading-relaxed font-bold bg-yellow-100 p-4 sm:p-5 rounded-2xl border-3 border-black shadow-[3px_3px_0px_black]">
              <FormattedText text={summary.description} />
            </div>
          </div>

          {/* Skills Learned */}
          {summary.skills && summary.skills.length > 0 && (
            <div>
              <h4 className="text-xs font-black text-black uppercase tracking-wider mb-2 flex items-center gap-1">
                <Award className="w-4 h-4 text-emerald-600" />
                <span>Ćwiczone umiejętności:</span>
              </h4>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {summary.skills.map((skill, sIdx) => (
                  <li
                    key={sIdx}
                    className="bg-emerald-50 border-2 border-black p-2.5 rounded-xl text-xs font-black text-emerald-950 flex items-center gap-2 shadow-[2px_2px_0px_black]"
                  >
                    <span className="text-emerald-600 font-black">✓</span>
                    <span>{skill}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Activities List */}
          {summary.activities && summary.activities.length > 0 && (
            <div>
              <h4 className="text-xs font-black text-black uppercase tracking-wider mb-2">
                Przeprowadzone ćwiczenia:
              </h4>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {summary.activities.map((act, aIdx) => (
                  <li
                    key={aIdx}
                    className="bg-white border-2 border-black p-3 rounded-xl text-xs font-black text-black flex items-center gap-2 shadow-[2px_2px_0px_black]"
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-[#FF4F81] border border-black shrink-0" />
                    <span>{act}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Vocabulary Cards */}
          {summary.vocabulary && summary.vocabulary.length > 0 && (
            <div>
              <h4 className="text-xs font-black text-black uppercase tracking-wider mb-2">
                Poznane słówka i wyrazy ze zjazdu:
              </h4>
              <div className="flex flex-wrap gap-2">
                {summary.vocabulary.map((vocab, vIdx) => (
                  <span
                    key={vIdx}
                    className="bg-[#4F81FF] text-white border-2 border-black px-3.5 py-1.5 rounded-xl text-xs font-black shadow-[2px_2px_0px_black]"
                  >
                    {vocab.pl}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Homework Checklist */}
        <div className="bg-[#FFD700] p-5 rounded-2xl border-3 border-black shadow-[5px_5px_0px_black] flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-black mb-4 flex items-center justify-between border-b-2 border-black pb-2">
              <span className="flex items-center gap-1.5">
                <CheckSquare className="w-4 h-4 text-black" />
                <span>Zadanie Domowe:</span>
              </span>
            </h3>

            <div className="space-y-3">
              {summary.homework && summary.homework.length > 0 ? (
                summary.homework.map((hw) => {
                  const isDone = completedHomework[hw.id];

                  return (
                    <div
                      key={hw.id}
                      onClick={() => toggleHomework(hw.id)}
                      className={`p-3.5 rounded-xl border-2 border-black transition cursor-pointer flex items-start gap-2.5 shadow-[3px_3px_0px_black] ${
                        isDone
                          ? 'bg-green-400 text-black'
                          : 'bg-white hover:bg-yellow-200 text-black'
                      }`}
                    >
                      <div className="mt-0.5 shrink-0">
                        {isDone ? (
                          <CheckCircle2 className="w-5 h-5 text-black fill-black text-white" />
                        ) : (
                          <Square className="w-5 h-5 text-black" />
                        )}
                      </div>

                      <div className="text-xs">
                        <span className={`font-black block ${isDone ? 'line-through text-gray-800' : ''}`}>
                          {hw.text}
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="bg-white p-3 rounded-xl border-2 border-black text-xs font-black text-gray-700 text-center">
                  Brak zadanych prac domowych na ten zjazd 🎉
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in w-full">
      {/* Header Banner */}
      <div className="bg-[#FF4F81] text-white p-5 sm:p-8 rounded-3xl border-4 border-black shadow-[8px_8px_0px_black] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-black text-yellow-300 border-2 border-white px-3 py-1 rounded-lg text-xs font-black mb-2 uppercase tracking-wider rotate-[-1deg]">
            <Calendar className="w-4 h-4 text-yellow-300" />
            <span>Szkoła Języka Polskiego w Walnut Creek</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black uppercase tracking-tight drop-shadow-[2px_2px_0px_black] break-words">
            Podsumowania Zajęć i Zadania Domowe 📅
          </h1>
          <p className="text-xs sm:text-sm font-bold text-white mt-1 max-w-xl">
            Najnowsze podsumowanie wyświetla się poniżej w całości. Poprzednie zjazdy możesz wygodnie rozwinąć z listy!
          </p>
        </div>

        <div className="bg-[#FFD700] text-black border-3 border-black p-3.5 sm:p-4 rounded-2xl text-center shadow-[4px_4px_0px_black] shrink-0 rotate-2">
          <span className="text-2xl sm:text-3xl font-black block leading-none">{summaries.length}</span>
          <span className="text-xs font-black block uppercase tracking-wider mt-1">
            {getZajeciaDeclension(summaries.length)}
          </span>
        </div>
      </div>

      {/* 1. NAJNOWSZE PODSUMOWANIE (WYŚWIETLA SIĘ CAŁE) */}
      {latestSummary && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="bg-[#FFD700] text-black border-2 border-black font-black text-xs px-3 py-1 rounded-xl uppercase tracking-wider shadow-[2px_2px_0px_black] flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#FF4F81]" />
              <span>Ostatnie Zajęcia (Najnowsze Podsumowanie)</span>
            </span>
          </div>

          <div
            id={`summary-${latestSummary.id}`}
            className="bg-white p-5 sm:p-8 rounded-3xl border-4 border-black shadow-[8px_8px_0px_black] transition-all"
          >
            {/* Header / Date */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-3 border-black pb-4 mb-5">
              <div className="flex items-start sm:items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-[#FFD700] border-3 border-black text-black font-black text-xs flex flex-col items-center justify-center shrink-0 shadow-[3px_3px_0px_black] rotate-[-2deg]">
                  <span className="text-[10px] tracking-wider uppercase">SOBOTA</span>
                  <span className="text-sm text-[#FF4F81] font-black leading-none">Najnowsze</span>
                </div>

                <div>
                  <span className="text-xs font-black text-black bg-yellow-200 border-2 border-black px-2.5 py-0.5 rounded-md shadow-[2px_2px_0px_black] inline-block">
                    {latestSummary.date}
                  </span>
                  <h2 className="text-lg sm:text-2xl font-black text-black mt-1 uppercase tracking-tight break-words">
                    {latestSummary.topic}
                  </h2>
                </div>
              </div>
            </div>

            {/* Content Body */}
            {renderSummaryBody(latestSummary)}
          </div>
        </section>
      )}

      {/* 2. WCZEŚNIEJSZE ZJAZDY (LISTA DO ROZWINIĘCIA) */}
      {previousSummaries.length > 0 && (
        <section className="space-y-3 sm:space-y-4 pt-2 border-t-3 border-black/20">
          <div className="space-y-3 sm:space-y-4">
            {previousSummaries.map((summary) => {
              const isExpanded = !!expandedSummaryIds[summary.id];
              const isTargeted =
                targetDate &&
                (summary.date.toLowerCase().includes(targetDate.toLowerCase()) ||
                  targetDate.toLowerCase().includes(summary.date.toLowerCase()));

              return (
                <div
                  key={summary.id}
                  id={`summary-${summary.id}`}
                  className={`bg-white rounded-3xl border-3 border-black shadow-[5px_5px_0px_black] transition-all overflow-hidden ${
                    isTargeted ? 'ring-4 ring-[#FF4F81] bg-amber-50/80 scale-[1.01]' : ''
                  }`}
                >
                  {/* Collapsible Header Row (Clickable) */}
                  <div
                    onClick={() => toggleSummaryExpand(summary.id)}
                    className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer transition select-none ${
                      isExpanded ? 'bg-yellow-50 border-b-3 border-black' : 'hover:bg-yellow-50/80'
                    }`}
                  >
                    <div className="flex items-start sm:items-center gap-3 min-w-0">
                      <div className="w-11 h-11 rounded-xl bg-yellow-200 border-2 border-black text-black font-black text-[10px] flex flex-col items-center justify-center shrink-0 shadow-[2px_2px_0px_black]">
                        <span>ZJAZD</span>
                        <span className="text-[#FF4F81] font-black leading-none">📖</span>
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-black text-black bg-white border border-black px-2 py-0.5 rounded-md shadow-[1px_1px_0px_black]">
                            {summary.date}
                          </span>
                          {isTargeted && (
                            <span className="bg-[#FF4F81] text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase border border-black shadow-[1px_1px_0px_black]">
                              Wybrany zjazd 🎯
                            </span>
                          )}
                        </div>
                        <h4 className="text-sm sm:text-base font-black text-black mt-1 uppercase tracking-tight break-words">
                          {summary.topic}
                        </h4>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                      {summary.vocabulary && summary.vocabulary.length > 0 && (
                        <span className="hidden md:inline-block text-[10px] font-black bg-[#4F81FF] text-white border border-black px-2 py-0.5 rounded-full">
                          {summary.vocabulary.length} słówek
                        </span>
                      )}
                      {summary.homework && summary.homework.length > 0 && (
                        <span className="hidden sm:inline-block text-[10px] font-black bg-yellow-300 text-black border border-black px-2 py-0.5 rounded-full">
                          Zadanie domowe
                        </span>
                      )}

                      <div
                        className={`border-2 border-black font-black text-xs px-3 py-1.5 rounded-xl uppercase flex items-center gap-1.5 shadow-[2px_2px_0px_black] transition ${
                          isExpanded ? 'bg-black text-yellow-300' : 'bg-yellow-200 text-black hover:bg-yellow-300'
                        }`}
                      >
                        <span>{isExpanded ? 'Zwiń ▴' : 'Rozwiń ▾'}</span>
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Body */}
                  {isExpanded && (
                    <div className="p-5 sm:p-7 bg-white animate-fade-in space-y-4">
                      {renderSummaryBody(summary)}

                      <div className="flex justify-end pt-2 border-t border-black/10">
                        <button
                          onClick={() => toggleSummaryExpand(summary.id)}
                          className="bg-gray-100 hover:bg-gray-200 text-black border-2 border-black font-black px-3.5 py-1.5 rounded-xl text-xs uppercase flex items-center gap-1 shadow-[2px_2px_0px_black] cursor-pointer"
                        >
                          <ChevronUp className="w-3.5 h-3.5" />
                          <span>Zwiń to podsumowanie</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
};
