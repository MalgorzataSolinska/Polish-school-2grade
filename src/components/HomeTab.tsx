import React, { useState } from 'react';
import { DailyTask, Announcement, ClassEvent } from '../types';
import { Clock, Megaphone, Gamepad2, Mail, Phone } from 'lucide-react';
import { FormattedText } from './FormattedText';

interface HomeTabProps {
  announcements: Announcement[];
  dailyTask: DailyTask;
  allDailyTasks: DailyTask[];
  onSelectTask: (taskId: string) => void;
  classEvents: ClassEvent[];
  onSendMessage: (msgData: { studentName: string; parentEmail: string; rating: 'super' | 'ok' | 'slabo'; message: string }) => void;
  onGoToGames?: () => void;
  isCloudSyncDone?: boolean;
}

export const HomeTab: React.FC<HomeTabProps> = ({
  announcements,
  dailyTask,
  allDailyTasks,
  onSelectTask,
  classEvents,
  onSendMessage,
  onGoToGames,
  isCloudSyncDone = true,
}) => {
  // Find next class based on today's date or marked status
  const today = new Date();
  const todayIso = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;
  
  const sortedEvents = [...classEvents].sort((a, b) => a.isoDate.localeCompare(b.isoDate));
  const upcomingEvents = sortedEvents.filter((e) => e.isoDate >= todayIso && !e.isHoliday);
  const nextClass = upcomingEvents.length > 0
    ? upcomingEvents[0]
    : sortedEvents.find((e) => e.status === 'next') || sortedEvents[0];

  // Calculate days remaining
  let daysRemainingText = '';
  if (nextClass) {
    const nextDate = new Date(`${nextClass.isoDate}T00:00:00`);
    const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const diffTime = nextDate.getTime() - todayMidnight.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      daysRemainingText = 'To już dzisiaj! 🎉';
    } else if (diffDays === 1) {
      daysRemainingText = 'Już jutro! ⏳';
    } else if (diffDays > 1) {
      daysRemainingText = `Zjazd za ${diffDays} dni 🗓️`;
    }
  }

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in w-full">
      {/* 1. DATA NAJBLIŻSZEGO ZJAZDU - GŁÓWNA SEKCJA NA POCZĄTKU STRONY */}
      {nextClass && (
        <section className="bg-[#FFD700] p-5 sm:p-7 rounded-3xl border-4 border-black shadow-[8px_8px_0px_black]">
          <div className="flex flex-wrap items-center justify-between border-b-3 border-black pb-3 mb-4 gap-2">
            <div className="flex items-center gap-2">
              <span className="bg-[#FF4F81] text-white border-2 border-black px-3 py-1 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider shadow-[2px_2px_0px_black] flex items-center gap-1.5 rotate-[-1deg]">
                <Clock className="w-4 h-4 text-yellow-200 shrink-0" />
                <span>Data Najbliższego Zjazdu ⏰</span>
              </span>
            </div>

            {daysRemainingText && (
              <span className="bg-black text-yellow-300 border-2 border-black px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_black]">
                {daysRemainingText}
              </span>
            )}
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-2xl border-3 border-black shadow-[4px_4px_0px_black]">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="min-w-0 flex-1">
                <span className="text-xs font-black text-[#FF4F81] uppercase tracking-wider block">
                  Najbliższe Spotkanie w Szkole:
                </span>
                <h2 className="text-xl sm:text-3xl md:text-4xl font-black text-black uppercase tracking-tight leading-tight mt-1 break-words">
                  {nextClass.dateStr}
                </h2>
                <div className="text-xs sm:text-sm font-bold text-gray-800 mt-2.5 flex flex-wrap items-baseline gap-1.5">
                  <span className="shrink-0 font-bold">Temat zajęć:</span>
                  <span className="font-black text-black bg-yellow-100 px-2.5 py-1 rounded-lg border-2 border-black inline-block break-words max-w-full shadow-[1px_1px_0px_black]">
                    {nextClass.topic || 'Zajęcia w klasie 2'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-3 shrink-0 flex-wrap sm:flex-nowrap">
                <div className="flex-1 sm:flex-initial bg-yellow-100 p-3 rounded-2xl border-2 border-black text-center text-xs font-black shadow-[2px_2px_0px_black]">
                  <span className="text-[10px] uppercase text-gray-800 block">Godzina zajęć:</span>
                  <span className="text-sm sm:text-base font-black text-black whitespace-nowrap">{nextClass.time}</span>
                </div>

                <div className="flex-1 sm:flex-initial bg-pink-100 p-3 rounded-2xl border-2 border-black text-center text-xs font-black shadow-[2px_2px_0px_black]">
                  <span className="text-[10px] uppercase text-gray-800 block">Sala zajęć:</span>
                  <span className="text-sm sm:text-base font-black text-black whitespace-nowrap">{nextClass.room}</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 2. WAŻNE OGŁOSZENIA */}
      <section className="bg-[#4F81FF] text-white p-5 sm:p-7 rounded-3xl border-4 border-black shadow-[8px_8px_0px_black]">
        <div className="flex items-center justify-between gap-2 mb-4">
          <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight flex items-center gap-2 drop-shadow-[2px_2px_0px_black]">
            <Megaphone className="w-6 h-6 text-yellow-300 shrink-0" />
            <span>Ważne Ogłoszenia 📢</span>
          </h2>
        </div>

        {/* Announcements list / loading / empty */}
        {!isCloudSyncDone && announcements.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div
                key={`ann-skel-${i}`}
                className="bg-white/80 p-4 rounded-2xl border-3 border-black shadow-[4px_4px_0px_black] animate-pulse space-y-2"
              >
                <div className="h-4 w-24 bg-gray-300 rounded border border-black"></div>
                <div className="h-5 w-3/4 bg-gray-300 rounded"></div>
                <div className="h-10 w-full bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : announcements.length === 0 ? (
          <div className="bg-white text-black p-6 rounded-2xl border-3 border-black shadow-[4px_4px_0px_black] text-center">
            <p className="text-sm font-black text-gray-800">
              Brak nowych ogłoszeń w tym tygodniu. Życzymy udanej nauki i do zobaczenia w sobotę! 🎒✨
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {announcements.map((ann) => (
              <div
                key={ann.id}
                className="bg-white text-black p-5 rounded-2xl border-3 border-black shadow-[4px_4px_0px_black] flex flex-col justify-between"
              >
                <div>
                  <span className="text-[10px] font-black bg-yellow-300 text-black border border-black px-2 py-0.5 rounded-md uppercase inline-block mb-2 shadow-[1px_1px_0px_black]">
                    {ann.date}
                  </span>
                  <h3 className="text-sm sm:text-base font-black text-black leading-snug break-words">{ann.title}</h3>
                  <div className="text-xs text-gray-800 font-bold mt-2 leading-relaxed whitespace-pre-wrap break-words">
                    <FormattedText text={ann.content} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 3. GRY ZE ZJAZDÓW SOBOTNICH */}
      {onGoToGames && (
        <section className="bg-white p-5 sm:p-7 rounded-3xl border-4 border-black shadow-[8px_8px_0px_black]">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 bg-[#FFD700] px-2.5 py-0.5 rounded-lg border-2 border-black text-[10px] font-black uppercase shadow-[1px_1px_0px_black]">
                <Gamepad2 className="w-3.5 h-3.5 text-[#FF4F81]" />
                <span>Edukacyjne Gry Sobotnie</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-black">
                Gry z Zajęć i Zjazdów 🎮
              </h2>
              <p className="text-xs font-bold text-gray-700 max-w-xl">
                Wybierz zjazd, aby zagrać w interaktywne układanki, wykreślanki i zgadywanki ze słówkami z lekcji!
              </p>
            </div>

            <button
              onClick={onGoToGames}
              className="bg-[#FF4F81] hover:bg-pink-600 text-white border-3 border-black font-black py-3 px-5 rounded-2xl text-xs uppercase shadow-[4px_4px_0px_black] active:scale-95 transition cursor-pointer flex items-center gap-2 shrink-0"
            >
              <span>Wybierz Zjazd i Graj ➔</span>
            </button>
          </div>
        </section>
      )}

      {/* 4. KONTAKT Z NAUCZYCIELKA */}
      <section className="bg-[#FFD700] p-5 sm:p-8 rounded-3xl border-4 border-black shadow-[8px_8px_0px_black]">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-black text-black uppercase tracking-tight">
              Kontakt z nauczycielem
            </h2>
            <p className="text-xs font-bold text-gray-800 mt-1">
              Pani Małgosia • Skontaktuj się bezpośrednio przez telefon, SMS lub e-mail
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Direct Email Card */}
            <div className="bg-white p-5 rounded-2xl border-4 border-black shadow-[6px_6px_0px_black] flex flex-col justify-between space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#4F81FF] text-white rounded-xl border-3 border-black flex items-center justify-center shadow-[2px_2px_0px_black] shrink-0">
                  <Mail className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <span className="text-[10px] font-black uppercase text-[#4F81FF] tracking-wider block">Korespondencja E-mail</span>
                  <h3 className="text-base font-black text-black">Poczta Elektroniczna</h3>
                </div>
              </div>

              <div className="text-left bg-blue-50 p-3 rounded-xl border-2 border-black space-y-2">
                <p className="text-xs font-black text-black font-mono break-all select-all">msolinska@polishschool.org</p>
                
                <div className="flex flex-wrap gap-2 pt-1">
                  <a
                    href="mailto:msolinska@polishschool.org?subject=Szko%C5%82a%20Polska%20-%20Zapytanie%20od%20Rodzica"
                    target="_top"
                    rel="noopener noreferrer"
                    className="w-full bg-[#4F81FF] text-white border-2 border-black font-black py-2 px-3 rounded-xl text-xs uppercase text-center cursor-pointer shadow-[2px_2px_0px_black] hover:bg-blue-600 active:scale-95 transition"
                  >
                    ✉️ Wyślij E-mail
                  </a>
                </div>
              </div>
            </div>

            {/* Direct Phone Card */}
            <div className="bg-white p-5 rounded-2xl border-4 border-black shadow-[6px_6px_0px_black] flex flex-col justify-between space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#FF4F81] text-white rounded-xl border-3 border-black flex items-center justify-center shadow-[2px_2px_0px_black] shrink-0">
                  <Phone className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <span className="text-[10px] font-black uppercase text-[#FF4F81] tracking-wider block">Infolinia / SMS</span>
                  <h3 className="text-base font-black text-black">Kontakt Telefoniczny</h3>
                </div>
              </div>

              <div className="text-left bg-rose-50 p-3 rounded-xl border-2 border-black space-y-2">
                <p className="text-sm font-black text-black font-mono select-all">(650) 281-5697</p>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <a
                    href="tel:6502815697"
                    target="_top"
                    rel="noopener noreferrer"
                    className="bg-[#FF4F81] text-white border-2 border-black font-black py-2 px-3 rounded-xl text-xs uppercase text-center cursor-pointer shadow-[2px_2px_0px_black] hover:bg-rose-600 active:scale-95 transition"
                  >
                    📞 Zadzwoń
                  </a>
                  <a
                    href="sms:6502815697"
                    target="_top"
                    rel="noopener noreferrer"
                    className="bg-emerald-400 text-black border-2 border-black font-black py-2 px-3 rounded-xl text-xs uppercase text-center cursor-pointer shadow-[2px_2px_0px_black] hover:bg-emerald-500 active:scale-95 transition"
                  >
                    💬 SMS
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
