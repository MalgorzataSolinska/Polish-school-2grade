import React, { useState } from 'react';
import { ClassEvent, ClassSummary, DailyTask } from '../types';
import { Calendar as CalendarIcon, Clock, MapPin, ChevronLeft, ChevronRight, AlertCircle, BookOpen, Gamepad2 } from 'lucide-react';

interface CalendarTabProps {
  classEvents: ClassEvent[];
  summaries?: ClassSummary[];
  allDailyTasks?: DailyTask[];
  onNavigateToSummary?: (dateStr: string) => void;
  onNavigateToGames?: (dateStr: string) => void;
}

const POLISH_MONTHS = [
  'Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec',
  'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'
];

const SCHOOL_YEAR_MONTHS = [
  { year: 2026, month: 7, short: 'Sierp', full: 'Sierpień 2026' },
  { year: 2026, month: 8, short: 'Wrz', full: 'Wrzesień 2026' },
  { year: 2026, month: 9, short: 'Paź', full: 'Październik 2026' },
  { year: 2026, month: 10, short: 'Lis', full: 'Listopad 2026' },
  { year: 2026, month: 11, short: 'Gru', full: 'Grudzień 2026' },
  { year: 2027, month: 0, short: 'Sty', full: 'Styczeń 2027' },
  { year: 2027, month: 1, short: 'Lut', full: 'Luty 2027' },
  { year: 2027, month: 2, short: 'Mar', full: 'Marzec 2027' },
  { year: 2027, month: 3, short: 'Kwi', full: 'Kwiecień 2027' },
  { year: 2027, month: 4, short: 'Maj', full: 'Maj 2027' },
  { year: 2027, month: 5, short: 'Cze', full: 'Czerwiec 2027' },
];

export const CalendarTab: React.FC<CalendarTabProps> = ({
  classEvents,
  summaries = [],
  allDailyTasks = [],
  onNavigateToSummary,
  onNavigateToGames,
}) => {
  // Today calculation
  const today = new Date();
  const todayYear = today.getFullYear();
  const todayMonth = today.getMonth();
  const todayDate = today.getDate();

  // Sort class events chronologically by isoDate
  const sortedEvents = [...classEvents].sort((a, b) => a.isoDate.localeCompare(b.isoDate));

  // Find next/current event index or fallback to first
  const currentEvent = sortedEvents.find((e) => e.status === 'next') || sortedEvents[0];
  const [selectedEventId, setSelectedEventId] = useState<string>(currentEvent?.id || sortedEvents[0]?.id || '');

  // Dynamic View Year & Month state (Default within 2026/2027 school year)
  const [viewYear, setViewYear] = useState<number>(() => {
    return todayYear;
  });

  const [viewMonth, setViewMonth] = useState<number>(() => {
    return todayMonth;
  });

  // Calculate days in current view month and start day of week (Monday=0 ... Sunday=6)
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const rawFirstDay = new Date(viewYear, viewMonth, 1).getDay(); // Sunday=0, Monday=1, ...
  const startDayOfWeek = (rawFirstDay + 6) % 7; // Monday=0, Tuesday=1 ... Sunday=6

  const handlePrevMonth = () => {
    // Limit to August (index 7) 2026
    if (viewYear < 2026 || (viewYear === 2026 && viewMonth <= 7)) {
      return;
    }
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    // Limit to June (index 5) 2027
    if (viewYear > 2027 || (viewYear === 2027 && viewMonth >= 5)) {
      return;
    }
    
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const handleSelectEvent = (ev: ClassEvent) => {
    setSelectedEventId(ev.id);
    if (ev.isoDate) {
      const [y, m] = ev.isoDate.split('-').map(Number);
      if (!isNaN(y) && !isNaN(m)) {
        setViewYear(y);
        setViewMonth(m - 1);
      }
    }
  };

  // Helper: Find class event on a specific day of the current month
  const getEventForDay = (dayNumber: number) => {
    const monthFormatted = (viewMonth + 1).toString().padStart(2, '0');
    const dayFormatted = dayNumber.toString().padStart(2, '0');
    const targetIso = `${viewYear}-${monthFormatted}-${dayFormatted}`;

    return sortedEvents.find((e) => e.isoDate === targetIso);
  };

  // Check if selectedEvent belongs to viewed month, or pick first event of viewed month if present
  const viewedMonthIsoPrefix = `${viewYear}-${(viewMonth + 1).toString().padStart(2, '0')}`;
  const eventsInViewMonth = sortedEvents.filter((e) => e.isoDate?.startsWith(viewedMonthIsoPrefix));
  const activeSelectedEvent =
    (selectedEventId && sortedEvents.find((e) => e.id === selectedEventId && e.isoDate?.startsWith(viewedMonthIsoPrefix))) ||
    eventsInViewMonth[0] ||
    null;

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in w-full">
      {/* Top Banner */}
      <div className="bg-[#FFD700] p-5 sm:p-8 rounded-3xl border-4 border-black shadow-[8px_8px_0px_black] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-[#FF4F81] text-white border-2 border-black px-3 py-1 rounded-xl text-xs font-black mb-2 uppercase tracking-wider rotate-[-1deg] shadow-[2px_2px_0px_black]">
            <CalendarIcon className="w-4 h-4 text-yellow-200" />
            <span>Szkoła Języka Polskiego w Walnut Creek</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-black uppercase tracking-tight break-words">
            Kalendarz Zajęć Szkolnych 📅
          </h1>
          <p className="text-xs sm:text-sm font-bold text-gray-800 mt-1">
            Wszystkie zjazdy sobotnie, tematy zajęć, sale oraz szybkie przejścia do gier i podsumowań.
          </p>
        </div>

        <div className="bg-white border-3 border-black p-3.5 sm:p-4 rounded-2xl shadow-[4px_4px_0px_black] text-left sm:text-center shrink-0 w-full sm:w-auto">
          <span className="text-lg sm:text-2xl font-black text-black block">Soboty 9:30 - 14:30</span>
          <span className="text-xs font-black text-gray-800 uppercase">Sala nr 14 • Walnut Creek</span>
        </div>
      </div>

      {/* MONTHLY CALENDAR GRID & EVENT DETAIL */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Left 2 Cols: Monthly Grid */}
        <div className="lg:col-span-2 bg-white p-4 sm:p-8 rounded-3xl border-4 border-black shadow-[8px_8px_0px_black]">
          {/* Quick Month Selector Bar (Rok Szkolny 2026/2027: Sierpień 2026 – Czerwiec 2027) */}
          <div className="mb-4 pb-3 border-b-2 border-black/10">
            <div className="flex items-center justify-between gap-1 mb-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-gray-700">
                Wybór miesiąca w roku szkolnym 2026/2027:
              </span>
              <span className="text-[9px] font-black text-blue-900 bg-blue-100 px-2 py-0.5 rounded border border-blue-300 uppercase">
                Sierpień 2026 – Czerwiec 2027
              </span>
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {SCHOOL_YEAR_MONTHS.map((mItem) => {
                const isCurrent = viewYear === mItem.year && viewMonth === mItem.month;
                const hasEvents = sortedEvents.some((e) =>
                  e.isoDate?.startsWith(`${mItem.year}-${(mItem.month + 1).toString().padStart(2, '0')}`)
                );
                return (
                  <button
                    key={`${mItem.year}-${mItem.month}`}
                    onClick={() => {
                      setViewYear(mItem.year);
                      setViewMonth(mItem.month);
                    }}
                    className={`px-2.5 py-1 rounded-xl text-[11px] font-black border-2 border-black transition cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1 ${
                      isCurrent
                        ? 'bg-[#FFD700] text-black shadow-[3px_3px_0px_black] scale-102 ring-2 ring-black'
                        : 'bg-yellow-50 text-gray-800 hover:bg-yellow-100 hover:border-black shadow-[1px_1px_0px_black]'
                    }`}
                  >
                    <span>{mItem.short} '{mItem.year.toString().slice(2)}</span>
                    {hasEvents && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#FF4F81] shrink-0" title="Zjazdy zaplanowane" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Month Header Navigation */}
          <div className="flex items-center justify-between gap-2 mb-4 sm:mb-6 pb-3 sm:pb-4 border-b-3 border-black">
            <button
              onClick={handlePrevMonth}
              disabled={viewYear < 2026 || (viewYear === 2026 && viewMonth <= 7)}
              className={`p-2 sm:p-2.5 rounded-xl border-2 border-black flex items-center gap-1 font-black text-xs uppercase transition shadow-[2px_2px_0px_black] ${
                viewYear < 2026 || (viewYear === 2026 && viewMonth <= 7)
                  ? 'bg-gray-200 text-gray-400 border-gray-400 shadow-none cursor-not-allowed'
                  : 'bg-yellow-200 hover:bg-yellow-300 cursor-pointer text-black'
              }`}
              title="Poprzedni miesiąc"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Poprzedni</span>
            </button>

            <div className="text-center">
              <h2 className="text-lg sm:text-2xl font-black text-black uppercase tracking-tight">
                {POLISH_MONTHS[viewMonth]} {viewYear}
              </h2>
            </div>

            <button
              onClick={handleNextMonth}
              disabled={viewYear > 2027 || (viewYear === 2027 && viewMonth >= 5)}
              className={`p-2 sm:p-2.5 rounded-xl border-2 border-black flex items-center gap-1 font-black text-xs uppercase transition shadow-[2px_2px_0px_black] ${
                viewYear > 2027 || (viewYear === 2027 && viewMonth >= 5) 
                  ? 'bg-gray-200 text-gray-400 border-gray-400 shadow-none cursor-not-allowed'
                  : 'bg-yellow-200 hover:bg-yellow-300 cursor-pointer text-black'
              }`}
              title="Następny miesiąc"
            >
              <span className="hidden sm:inline">Następny</span>
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

          {/* Days of week header */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center mb-2">
            {['Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'SOB', 'Nd'].map((dayName, index) => (
              <div
                key={dayName}
                className={`py-1.5 sm:py-2 text-[11px] sm:text-xs font-black uppercase rounded-lg border border-black ${
                  index === 5
                    ? 'bg-[#FF4F81] text-white shadow-[1px_1px_0px_black]'
                    : 'bg-yellow-100 text-black'
                }`}
              >
                {dayName}
              </div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {/* Empty offset padding for days before month starts */}
            {Array.from({ length: startDayOfWeek }).map((_, idx) => (
              <div key={`empty-${idx}`} className="h-14 sm:h-20 bg-gray-50 rounded-xl border border-gray-200 opacity-30"></div>
            ))}

            {/* Days of current month */}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const dayNum = idx + 1;
              const event = getEventForDay(dayNum);
              const isSelected = event && event.id === selectedEventId;
              const isSaturday = (startDayOfWeek + idx) % 7 === 5;
              const isToday = viewYear === todayYear && viewMonth === todayMonth && dayNum === todayDate;

              return (
                <div
                  key={`day-${dayNum}`}
                  onClick={() => {
                    if (event) setSelectedEventId(event.id);
                  }}
                  className={`h-14 sm:h-20 p-1 sm:p-1.5 rounded-xl border-2 border-black flex flex-col justify-between transition relative ${
                    isToday
                      ? 'ring-3 ring-[#4F81FF] z-20 ' + (
                          event
                            ? isSelected
                              ? 'bg-[#FFD700] shadow-[4px_4px_0px_black] scale-105 cursor-pointer'
                              : event.isHoliday
                              ? 'bg-rose-200 hover:bg-rose-300 cursor-pointer shadow-[3px_3px_0px_black]'
                              : 'bg-emerald-200 hover:bg-emerald-300 cursor-pointer shadow-[3px_3px_0px_black]'
                            : isSaturday
                            ? 'bg-pink-100 shadow-[3px_3px_0px_black]'
                            : 'bg-sky-100 shadow-[3px_3px_0px_black]'
                        )
                      : event
                      ? isSelected
                        ? 'bg-[#FFD700] shadow-[3px_3px_0px_black] scale-105 z-10 cursor-pointer'
                        : event.isHoliday
                        ? 'bg-rose-200 hover:bg-rose-300 cursor-pointer shadow-[2px_2px_0px_black]'
                        : 'bg-emerald-200 hover:bg-emerald-300 cursor-pointer shadow-[2px_2px_0px_black]'
                      : isSaturday
                      ? 'bg-pink-50'
                      : 'bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-[11px] sm:text-xs font-black flex items-center gap-1 ${
                      isToday 
                        ? 'bg-[#4F81FF] text-white px-1.5 py-0.2 rounded-md shadow-[1px_1px_0px_black]' 
                        : isSaturday 
                        ? 'text-[#FF4F81]' 
                        : 'text-black'
                    }`}>
                      {dayNum}
                    </span>
                    {isToday && !event && (
                      <span className="text-[8px] font-black bg-[#4F81FF] text-white px-1 py-0.2 rounded uppercase">
                        Dziś
                      </span>
                    )}
                    {event && (
                      <span className="text-[10px] sm:text-xs">
                        {event.isHoliday ? '🛑' : '🏫'}
                      </span>
                    )}
                  </div>

                  {isToday && event && (
                    <div className="text-[8px] font-black bg-[#4F81FF] text-white px-1 rounded text-center truncate uppercase tracking-tighter">
                      📍 Dzisiaj
                    </div>
                  )}

                  {event && !isToday && (
                    <div className="truncate text-[8px] sm:text-[9px] font-black uppercase tracking-tighter bg-white px-1 rounded border border-black text-black">
                      {event.isHoliday ? 'Wolne' : 'Zajęcia'}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Calendar Legend */}
          <div className="mt-5 pt-4 border-t-2 border-black flex items-center justify-center gap-3 sm:gap-4 flex-wrap text-xs font-black">
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 bg-sky-100 border-2 border-black ring-2 ring-[#4F81FF] rounded-md inline-block"></span>
              <span className="text-[#4F81FF]">Obecny dzień (Dzisiaj) 📍</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 bg-emerald-200 border border-black rounded-md inline-block"></span>
              <span>Dzień Zajęć (Sobota)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 bg-rose-200 border border-black rounded-md inline-block"></span>
              <span>Dzień Wolny od zajęć</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 bg-[#FFD700] border border-black rounded-md inline-block"></span>
              <span>Wybrana sobota</span>
            </div>
          </div>
        </div>

        {/* Right Col: Selected Event Details & Full Semester List */}
        <div className="space-y-6">
          {activeSelectedEvent ? (
            <div className="bg-[#FFD700] p-5 sm:p-6 rounded-3xl border-4 border-black shadow-[6px_6px_0px_black] space-y-4">
              <div className="flex items-center justify-between border-b-2 border-black pb-2.5">
                <span className="bg-[#FF4F81] text-white border border-black px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase">
                  Szczegóły Wybranego Zjazdu
                </span>
                <span className="text-xs font-black text-black uppercase">{activeSelectedEvent.dayOfWeek}</span>
              </div>

              <div>
                <h3 className="text-xl sm:text-2xl font-black text-black uppercase tracking-tight break-words">
                  {activeSelectedEvent.dateStr}
                </h3>
                <div className="mt-2 bg-white p-3 rounded-2xl border-2 border-black">
                  <span className="text-[10px] uppercase font-black text-gray-800 block">Temat Zajęć:</span>
                  <p className="text-xs sm:text-sm font-black text-black leading-snug break-words mt-0.5">
                    {activeSelectedEvent.isHoliday ? '🛑 Dzień wolny od zajęć szkolnych' : activeSelectedEvent.topic || 'Zajęcia szkolne'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-black">
                <div className="bg-white p-2.5 rounded-xl border-2 border-black">
                  <div className="flex items-center gap-1 text-gray-800 text-[10px] uppercase mb-0.5">
                    <Clock className="w-3.5 h-3.5 text-blue-600" />
                    <span>Godziny:</span>
                  </div>
                  <span>{activeSelectedEvent.time || '9:30 - 14:30'}</span>
                </div>

                <div className="bg-white p-2.5 rounded-xl border-2 border-black">
                  <div className="flex items-center gap-1 text-gray-800 text-[10px] uppercase mb-0.5">
                    <MapPin className="w-3.5 h-3.5 text-rose-600" />
                    <span>Sala:</span>
                  </div>
                  <span>{activeSelectedEvent.room || 'Sala nr 14'}</span>
                </div>
              </div>

              {/* Action Buttons: Jump to Games or Lesson Summary for this Saturday side-by-side */}
              {!activeSelectedEvent.isHoliday && (
                <div className="space-y-2 pt-1">
                  <div className="grid grid-cols-1 gap-2">
                    {onNavigateToSummary && (
                      <button
                        onClick={() => onNavigateToSummary(activeSelectedEvent.dateStr)}
                        className="w-full bg-[#4F81FF] hover:bg-blue-600 text-white border-3 border-black font-black py-2.5 px-3 rounded-2xl text-xs uppercase flex items-center justify-center gap-2 shadow-[3px_3px_0px_black] active:scale-95 transition cursor-pointer"
                      >
                        <BookOpen className="w-4 h-4 text-yellow-300 shrink-0" />
                        <span>Przejdź do podsumowania zajęć ➔</span>
                      </button>
                    )}

                    {onNavigateToGames && (
                      <button
                        onClick={() => onNavigateToGames(activeSelectedEvent.dateStr)}
                        className="w-full bg-[#FF4F81] hover:bg-pink-600 text-white border-3 border-black font-black py-2.5 px-3 rounded-2xl text-xs uppercase flex items-center justify-center gap-2 shadow-[3px_3px_0px_black] active:scale-95 transition cursor-pointer"
                      >
                        <Gamepad2 className="w-4 h-4 text-yellow-300 shrink-0" />
                        <span>Przejdź do gier z tego zjazdu 🎮 ➔</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white p-6 rounded-3xl border-4 border-black shadow-[6px_6px_0px_black] text-center space-y-3">
              <div className="w-12 h-12 bg-yellow-200 rounded-2xl border-2 border-black flex items-center justify-center mx-auto shadow-[2px_2px_0px_black]">
                <CalendarIcon className="w-6 h-6 text-black" />
              </div>
              <h4 className="text-base font-black uppercase text-black">
                {POLISH_MONTHS[viewMonth]} {viewYear}
              </h4>
              <p className="text-xs font-bold text-gray-700 max-w-xs mx-auto">
                Rok szkolny 2026/2027. Dokładny harmonogram zjazdów na ten miesiąc zostanie wkrótce ogłoszony przez szkołę.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
