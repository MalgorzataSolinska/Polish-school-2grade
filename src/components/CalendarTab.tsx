import React, { useState, useEffect, useRef } from 'react';
import { ClassEvent, ClassSummary } from '../types';
import { Calendar as CalendarIcon, Clock, MapPin, ChevronLeft, ChevronRight, AlertCircle, BookOpen, ArrowUp, ArrowDown } from 'lucide-react';

interface CalendarTabProps {
  classEvents: ClassEvent[];
  summaries?: ClassSummary[];
  onNavigateToSummary?: (dateStr: string) => void;
}

export const CalendarTab: React.FC<CalendarTabProps> = ({ classEvents, summaries = [], onNavigateToSummary }) => {
  // Today calculation
  const today = new Date();
  const todayYear = today.getFullYear();
  const todayMonth = today.getMonth(); // 0 = Jan, 7 = Aug
  const todayDate = today.getDate();

  const months = [
    { name: 'Sierpień 2026', year: 2026, month: 7, daysInMonth: 31, startDayOfWeek: 5 }, // Aug 1 2026 is Saturday (index 5: Mon=0, Tue=1, Wed=2, Thu=3, Fri=4, Sat=5, Sun=6)
    { name: 'Wrzesień 2026', year: 2026, month: 8, daysInMonth: 30, startDayOfWeek: 1 }, // Sept 1 2026 is Tuesday (index 1)
    { name: 'Październik 2026', year: 2026, month: 9, daysInMonth: 31, startDayOfWeek: 3 }, // Oct 1 2026 is Thursday (index 3)
    { name: 'Listopad 2026', year: 2026, month: 10, daysInMonth: 30, startDayOfWeek: 6 }, // Nov 1 2026 is Sunday (index 6)
    { name: 'Grudzień 2026', year: 2026, month: 11, daysInMonth: 31, startDayOfWeek: 1 }, // Dec 1 2026 is Tuesday (index 1)
  ];

  // Auto detect current month index based on today
  const foundCurrentMonthIdx = months.findIndex((m) => m.year === todayYear && m.month === todayMonth);
  const [currentMonthIndex, setCurrentMonthIndex] = useState<number>(
    foundCurrentMonthIdx !== -1 ? foundCurrentMonthIdx : 0
  );

  // Sort class events chronologically by isoDate
  const sortedEvents = [...classEvents].sort((a, b) => a.isoDate.localeCompare(b.isoDate));

  // Find next/current event index or fallback to first
  const currentEvent = sortedEvents.find((e) => e.status === 'next') || sortedEvents[0];
  const [selectedEventId, setSelectedEventId] = useState<string>(currentEvent?.id || sortedEvents[0]?.id || '');

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const currentEventRef = useRef<HTMLDivElement>(null);

  // Helper: Find summary for a specific event
  const getSummaryForEvent = (event: ClassEvent) => {
    if (!summaries || summaries.length === 0) return undefined;
    return summaries.find((s) => {
      const sDate = s.date.trim().toLowerCase();
      const evDate = event.dateStr.trim().toLowerCase();
      return sDate === evDate || sDate.includes(evDate) || evDate.includes(sDate);
    });
  };

  // Auto scroll to current Saturday at top of list container
  useEffect(() => {
    if (currentEventRef.current && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const element = currentEventRef.current;
      container.scrollTop = element.offsetTop - container.offsetTop - 8;
    }
  }, [sortedEvents]);

  const currentMonth = months[currentMonthIndex];

  // Helper: Find class event on a specific day of the current month
  const getEventForDay = (dayNumber: number) => {
    const monthFormatted = (currentMonth.month + 1).toString().padStart(2, '0');
    const dayFormatted = dayNumber.toString().padStart(2, '0');
    const targetIso = `${currentMonth.year}-${monthFormatted}-${dayFormatted}`;

    return sortedEvents.find((e) => e.isoDate === targetIso);
  };

  const selectedEvent = sortedEvents.find((e) => e.id === selectedEventId) || sortedEvents[0];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Banner */}
      <div className="bg-[#FFD700] p-6 sm:p-8 rounded-3xl border-4 border-black shadow-[8px_8px_0px_black] flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-[#FF4F81] text-white border-2 border-black px-3 py-1 rounded-xl text-xs font-black mb-2 uppercase tracking-wider rotate-[-1deg] shadow-[2px_2px_0px_black]">
            <CalendarIcon className="w-4 h-4 text-yellow-200" />
            <span>Szkoła Języka Polskiego w Walnut Creek</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-black uppercase tracking-tight">
            Kalendarz Zajęć Szkolnych 📅
          </h2>
        </div>

        <div className="bg-white border-3 border-black p-4 rounded-2xl shadow-[4px_4px_0px_black] text-center shrink-0">
          <span className="text-xl sm:text-2xl font-black text-black block">Soboty 9:30 - 14:30</span>
          <span className="text-xs font-black text-gray-800 uppercase">Sala nr 14 • Walnut Creek</span>
        </div>
      </div>

      {/* MONTHLY CALENDAR GRID & EVENT DETAIL */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Monthly Grid */}
        <div className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-3xl border-4 border-black shadow-[8px_8px_0px_black]">
          {/* Month Header Navigation */}
          <div className="flex items-center justify-between gap-2 mb-6 pb-4 border-b-3 border-black">
            <button
              onClick={() => setCurrentMonthIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentMonthIndex === 0}
              className="p-2.5 rounded-xl border-2 border-black bg-yellow-200 hover:bg-yellow-300 disabled:opacity-40 disabled:hover:bg-yellow-200 cursor-pointer transition shadow-[2px_2px_0px_black]"
            >
              <ChevronLeft className="w-5 h-5 text-black" />
            </button>

            <h3 className="text-xl sm:text-2xl font-black text-black uppercase tracking-tight">
              {currentMonth.name}
            </h3>

            <button
              onClick={() => setCurrentMonthIndex((prev) => Math.min(months.length - 1, prev + 1))}
              disabled={currentMonthIndex === months.length - 1}
              className="p-2.5 rounded-xl border-2 border-black bg-yellow-200 hover:bg-yellow-300 disabled:opacity-40 disabled:hover:bg-yellow-200 cursor-pointer transition shadow-[2px_2px_0px_black]"
            >
              <ChevronRight className="w-5 h-5 text-black" />
            </button>
          </div>

          {/* Days of week header */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center mb-2">
            {['Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'SOB', 'Nd'].map((dayName, index) => (
              <div
                key={dayName}
                className={`py-2 text-xs font-black uppercase rounded-lg border border-black ${
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
            {Array.from({ length: currentMonth.startDayOfWeek }).map((_, idx) => (
              <div key={`empty-${idx}`} className="h-16 sm:h-20 bg-gray-50 rounded-xl border border-gray-200 opacity-30"></div>
            ))}

            {/* Days of current month */}
            {Array.from({ length: currentMonth.daysInMonth }).map((_, idx) => {
              const dayNum = idx + 1;
              const event = getEventForDay(dayNum);
              const isSelected = event && event.id === selectedEventId;
              const isSaturday = (currentMonth.startDayOfWeek + idx) % 7 === 5; // Saturday column index
              const isToday = currentMonth.year === todayYear && currentMonth.month === todayMonth && dayNum === todayDate;

              return (
                <div
                  key={`day-${dayNum}`}
                  onClick={() => {
                    if (event) setSelectedEventId(event.id);
                  }}
                  className={`h-16 sm:h-20 p-1.5 rounded-xl border-2 border-black flex flex-col justify-between transition relative ${
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
                    <span className={`text-xs font-black flex items-center gap-1 ${
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
                    <div className="truncate text-[9px] font-black uppercase tracking-tighter bg-white px-1 rounded border border-black text-black">
                      {event.isHoliday ? 'Wolne' : 'Lekcja'}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Calendar Legend */}
          <div className="mt-6 pt-4 border-t-2 border-black flex items-center justify-center gap-4 flex-wrap text-xs font-black">
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
          {selectedEvent ? (
            <div className="bg-[#FFD700] p-6 rounded-3xl border-4 border-black shadow-[6px_6px_0px_black] space-y-4">
              <div className="flex items-center justify-between border-b-2 border-black pb-3">
                <span className="bg-[#FF4F81] text-white border border-black px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase">
                  Szczegóły Wybranej Soboty
                </span>
                <span className="text-xs font-black text-black uppercase">{selectedEvent.dayOfWeek}</span>
              </div>

              <div>
                <h4 className="text-2xl font-black text-black uppercase tracking-tight">
                  {selectedEvent.dateStr}
                </h4>
                <div className="mt-2 bg-white p-3 rounded-2xl border-2 border-black">
                  <span className="text-[10px] uppercase font-black text-gray-800 block">Temat Lekcji:</span>
                  <p className="text-xs font-black text-black leading-snug">{selectedEvent.topic}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-black">
                <div className="bg-white p-2.5 rounded-xl border-2 border-black">
                  <div className="flex items-center gap-1 text-gray-800 text-[10px] uppercase mb-0.5">
                    <Clock className="w-3.5 h-3.5 text-blue-600" />
                    <span>Godziny:</span>
                  </div>
                  <span>{selectedEvent.time || '9:30 - 14:30'}</span>
                </div>

                <div className="bg-white p-2.5 rounded-xl border-2 border-black">
                  <div className="flex items-center gap-1 text-gray-800 text-[10px] uppercase mb-0.5">
                    <MapPin className="w-3.5 h-3.5 text-rose-600" />
                    <span>Sala:</span>
                  </div>
                  <span>{selectedEvent.room || 'Sala nr 14'}</span>
                </div>
              </div>



              {/* Action Button: Jump to Lesson Summary for this Saturday (only if summary was created) */}
              {onNavigateToSummary && !selectedEvent.isHoliday && (
                (() => {
                  const summary = getSummaryForEvent(selectedEvent);
                  if (summary) {
                    return (
                      <button
                        onClick={() => onNavigateToSummary(selectedEvent.dateStr)}
                        className="w-full bg-[#4F81FF] hover:bg-blue-600 text-white border-3 border-black font-black py-2.5 px-3 rounded-2xl text-xs uppercase flex items-center justify-center gap-2 shadow-[3px_3px_0px_black] active:scale-95 transition cursor-pointer"
                      >
                        <BookOpen className="w-4 h-4 text-yellow-300" />
                        <span>Zobacz podsumowanie tej lekcji ➔</span>
                      </button>
                    );
                  }
                  return (
                    <div className="bg-amber-50 border-2 border-dashed border-amber-300 p-2.5 rounded-2xl text-center">
                      <span className="text-[11px] font-bold text-amber-950 block">
                        📝 Podsumowanie i zadania domowe pojawią się tutaj po dodaniu wpisu z zajęć.
                      </span>
                    </div>
                  );
                })()
              )}
            </div>
          ) : (
            <div className="bg-white p-6 rounded-3xl border-4 border-black shadow-[6px_6px_0px_black] text-center">
              <p className="text-xs font-black text-gray-800">Kliknij wybraną sobotę w kalendarzu, aby zobaczyć temat zajęć!</p>
            </div>
          )}

          {/* Full List of Saturdays (Scrollable, current at top) */}
          <div className="bg-white p-5 rounded-3xl border-4 border-black shadow-[6px_6px_0px_black]">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-black text-black uppercase flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#FF4F81]" />
                <span>Soboty Semestru</span>
              </h4>
              <span className="text-[10px] font-bold text-gray-700 bg-yellow-100 border border-black px-2 py-0.5 rounded-full flex items-center gap-1">
                <ArrowUp className="w-3 h-3 text-gray-600" /> Przewiń w górę / dół <ArrowDown className="w-3 h-3 text-gray-600" />
              </span>
            </div>

            <div
              ref={scrollContainerRef}
              className="space-y-2 max-h-72 overflow-y-auto pr-1 scroll-smooth"
            >
              {sortedEvents.map((ev) => {
                const isCurrentNext = ev.status === 'next';
                const isSelected = ev.id === selectedEventId;
                const evSummary = getSummaryForEvent(ev);

                return (
                  <div
                    key={ev.id}
                    ref={isCurrentNext ? currentEventRef : null}
                    onClick={() => setSelectedEventId(ev.id)}
                    className={`p-2.5 rounded-2xl border-2 border-black text-left text-xs font-black transition cursor-pointer flex items-center justify-between gap-2 ${
                      isSelected
                        ? 'bg-[#FFD700] shadow-[3px_3px_0px_black] ring-2 ring-black'
                        : isCurrentNext
                        ? 'bg-yellow-200 border-4 border-black shadow-[3px_3px_0px_black]'
                        : ev.isHoliday
                        ? 'bg-rose-50 hover:bg-rose-100'
                        : 'bg-yellow-50 hover:bg-yellow-100'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        {isCurrentNext && (
                          <span className="bg-[#FF4F81] text-white text-[9px] px-1.5 py-0.2 rounded font-black uppercase">
                            Obecna
                          </span>
                        )}
                        <span className="truncate">{ev.dateStr}</span>
                      </div>
                      <span className="text-[10px] font-semibold text-gray-700 block truncate">
                        {ev.topic}
                      </span>
                    </div>

                    {evSummary && onNavigateToSummary && !ev.isHoliday ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onNavigateToSummary(ev.dateStr);
                        }}
                        className="text-[10px] bg-[#4F81FF] hover:bg-blue-600 text-white border-2 border-black px-2 py-1 rounded-xl font-black uppercase shadow-[2px_2px_0px_black] shrink-0 active:scale-95 transition cursor-pointer flex items-center gap-1"
                        title="Przejdź do podsumowania tej lekcji"
                      >
                        <span>Podsumowanie</span>
                        <BookOpen className="w-3 h-3" />
                      </button>
                    ) : (
                      <span className="text-[10px] bg-white border border-black px-1.5 py-0.5 rounded uppercase shrink-0 font-bold text-gray-600">
                        {ev.isHoliday ? 'Wolne' : 'Lekcja'}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
