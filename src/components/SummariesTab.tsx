import React, { useState, useEffect } from 'react';
import { ClassSummary } from '../types';
import { Calendar, CheckSquare, Square, BookOpen, Award, CheckCircle2 } from 'lucide-react';
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

  const toggleHomework = (hwId: string) => {
    setCompletedHomework((prev) => ({ ...prev, [hwId]: !prev[hwId] }));
  };

  useEffect(() => {
    if (targetDate) {
      const matchedSummary = summaries.find(
        (s) =>
          s.date.toLowerCase().includes(targetDate.toLowerCase()) ||
          targetDate.toLowerCase().includes(s.date.toLowerCase())
      );
      if (matchedSummary) {
        const element = document.getElementById(`summary-${matchedSummary.id}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }
  }, [targetDate, summaries]);

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in w-full">
      {/* Header Banner */}
      <div className="bg-[#FF4F81] text-white p-5 sm:p-8 rounded-3xl border-4 border-black shadow-[8px_8px_0px_black] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-black text-yellow-300 border-2 border-white px-3 py-1 rounded-lg text-xs font-black mb-2 uppercase tracking-wider rotate-[-1deg]">
            <Calendar className="w-4 h-4 text-yellow-300" />
            <span>Szkoła Języka Polskiego w Walnut Creek </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black uppercase tracking-tight drop-shadow-[2px_2px_0px_black] break-words">
            Podsumowania Zajęć i Zadania Domowe 📅
          </h1>
          <p className="text-xs sm:text-sm font-bold text-white mt-1 max-w-xl">
            Sprawdź co działo się na zajęciach, jakie umiejętności i słówka ćwiczyliśmy oraz zaznacz wykonane zadania!
          </p>
        </div>

        <div className="bg-[#FFD700] text-black border-3 border-black p-3.5 sm:p-4 rounded-2xl text-center shadow-[4px_4px_0px_black] shrink-0 rotate-2">
          <span className="text-2xl sm:text-3xl font-black block leading-none">{summaries.length}</span>
          <span className="text-xs font-black block uppercase tracking-wider mt-1">
            {getZajeciaDeclension(summaries.length)}
          </span>
        </div>
      </div>

      {/* Summaries List */}
      <div className="space-y-6 sm:space-y-8">
        {summaries.map((summary) => {
          const isTargeted =
            targetDate &&
            (summary.date.toLowerCase().includes(targetDate.toLowerCase()) ||
              targetDate.toLowerCase().includes(summary.date.toLowerCase()));

          return (
            <div
              key={summary.id}
              id={`summary-${summary.id}`}
              className={`bg-white p-5 sm:p-8 rounded-3xl border-4 border-black shadow-[8px_8px_0px_black] transition-all ${
                isTargeted ? 'ring-4 ring-[#FF4F81] bg-amber-50/80 scale-[1.01]' : ''
              }`}
            >
              {/* Header / Date */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-3 border-black pb-4 mb-5">
                <div className="flex items-start sm:items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-[#FFD700] border-3 border-black text-black font-black text-xs flex flex-col items-center justify-center shrink-0 shadow-[3px_3px_0px_black] rotate-[-2deg]">
                    <span className="text-[10px] tracking-wider uppercase">SOBOTA</span>
                    <span className="text-sm text-[#FF4F81] font-black leading-none">Zajęcia</span>
                  </div>

                  <div>
                    <span className="text-xs font-black text-black bg-yellow-200 border-2 border-black px-2.5 py-0.5 rounded-md shadow-[2px_2px_0px_black] inline-block">
                      {summary.date}
                    </span>
                    <h2 className="text-lg sm:text-2xl font-black text-black mt-1 uppercase tracking-tight break-words">
                      {summary.topic}
                    </h2>
                  </div>
                </div>

                {isTargeted && (
                  <span className="bg-[#FF4F81] text-white font-black px-3 py-1 rounded-xl text-xs uppercase border-2 border-black shadow-[2px_2px_0px_black] animate-bounce self-start sm:self-auto shrink-0">
                    Wybrane Zajęcia 🎯
                  </span>
                )}
              </div>

              {/* Content Body */}
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
                      {summary.homework.map((hw) => {
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
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
