import React, { useState } from 'react';
import { TabType } from '../types';
import { Home, Gamepad2, Calendar as CalendarIcon, BookOpen, FileText, Menu, X } from 'lucide-react';

interface NavbarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  openTeacherModal?: () => void;
  nextClassDate?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  nextClassDate,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSelectTab = (tab: TabType) => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
  };

  const navItems: { id: TabType; label: string; icon: React.ReactNode; activeBg: string }[] = [
    {
      id: 'home',
      label: 'Strona Główna',
      icon: <Home className="w-4 h-4" />,
      activeBg: 'bg-[#FF4F81] text-white',
    },
    {
      id: 'games',
      label: 'Gry i Zadania 🎮',
      icon: <Gamepad2 className="w-4 h-4 text-yellow-300" />,
      activeBg: 'bg-[#FF4F81] text-white',
    },
    {
      id: 'calendar',
      label: 'Kalendarz',
      icon: <CalendarIcon className="w-4 h-4" />,
      activeBg: 'bg-[#FFD700] text-black',
    },
    {
      id: 'summaries',
      label: 'Podsumowania Zajęć',
      icon: <BookOpen className="w-4 h-4" />,
      activeBg: 'bg-[#4F81FF] text-white',
    },
    /*
    {
      id: 'worksheets',
      label: 'Materiały do Druku',
      icon: <FileText className="w-4 h-4" />,
      activeBg: 'bg-emerald-400 text-black',
    },
    */
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b-4 border-black shadow-[0_4px_0px_black]">
      {/* Top Announcement Bar */}
      <div className="bg-black text-white px-3 sm:px-6 py-1.5 text-xs font-bold flex items-center justify-between border-b-2 border-black">
        <div className="flex items-center gap-2 overflow-hidden w-full justify-between sm:justify-start">
          <span className="bg-[#FF4F81] text-white border border-white px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wider rotate-[-2deg] shrink-0">
            Walnut Creek
          </span>
          <span className="truncate font-semibold text-yellow-300 text-[11px] sm:text-xs">
            Szkoła Języka Polskiego • Klasa 2
          </span>
          {nextClassDate && (
            <span className="hidden sm:inline-flex items-center gap-1.5 ml-auto text-white bg-emerald-600 border border-emerald-400 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider">
              <span>📅 Najbliższy zjazd:</span>
              <strong className="text-yellow-200">{nextClassDate}</strong>
            </span>
          )}
        </div>
      </div>

      {/* Main Navbar Title Header */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex items-center justify-between gap-2 bg-white">
        {/* Logo & Title */}
        <div
          onClick={() => handleSelectTab('home')}
          className="flex items-center gap-2.5 cursor-pointer group min-w-0"
        >
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-[#FFD700] border-3 border-black flex items-center justify-center p-1 rotate-[-4deg] shadow-[3px_3px_0px_black] group-hover:rotate-0 transition-all shrink-0">
            <img src="/favicon.svg?v=2" alt="Logo Klasa 2" className="w-full h-full object-contain" />
          </div>
          <div className="min-w-0">
            <h1 className="text-base sm:text-2xl font-black text-black uppercase tracking-tighter italic truncate leading-tight drop-shadow-[1px_1px_0px_#FF4F81]">
              Polska Szkoła Walnut Creek
            </h1>
            <p className="text-[11px] text-gray-700 font-bold hidden sm:block italic">
              Strona Klasy 2 • Ważne Ogłoszenia, Kalendarz, Zadania i Materiały
            </p>
          </div>
        </div>

        {/* Mobile Hamburger Menu Toggle Button */}
        <div className="flex sm:hidden items-center gap-2">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 bg-[#FFD700] text-black border-2 border-black rounded-xl font-black shadow-[2px_2px_0px_black] active:scale-95 transition cursor-pointer flex items-center gap-1.5"
            aria-label="Menu nawigacyjne"
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5 text-black" />
            ) : (
              <Menu className="w-5 h-5 text-black" />
            )}
            <span className="text-xs font-black uppercase">Menu</span>
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-2">
          <span className="bg-yellow-100 border-2 border-black px-3 py-1 rounded-xl text-xs font-black text-black shadow-[2px_2px_0px_black]">
            Klasa 2 • Rok 2026/2027 🏫
          </span>
        </div>
      </div>

      {/* Desktop Navigation Tabs Bar (hidden on small mobile screens) */}
      <nav className="hidden sm:block bg-[#FFD700] border-t-4 border-black px-2 sm:px-6 py-2">
        <div className="max-w-5xl mx-auto flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
          {navItems.map((item) => {
            const isSelected = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelectTab(item.id)}
                className={`flex items-center gap-1.5 px-3.5 sm:px-5 py-2 rounded-xl font-black text-xs sm:text-sm transition-all cursor-pointer border-2 border-black ${
                  isSelected
                    ? `${item.activeBg} shadow-[4px_4px_0px_black] translate-y-[-2px]`
                    : 'bg-white text-black shadow-[2px_2px_0px_black] hover:bg-yellow-100 hover:translate-y-[-1px]'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Mobile Hamburger Dropdown Menu (shown when toggled on phone) */}
      {isMobileMenuOpen && (
        <nav className="sm:hidden bg-[#FFD700] border-t-4 border-black p-3 space-y-2 shadow-[0_6px_0px_black] animate-fade-in">
          <p className="text-[10px] font-black uppercase tracking-wider text-black px-1 mb-1">
            Wybierz Zakładkę:
          </p>
          <div className="grid grid-cols-1 gap-2">
            {navItems.map((item) => {
              const isSelected = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectTab(item.id)}
                  className={`flex items-center justify-between w-full px-4 py-3 rounded-2xl font-black text-sm border-3 border-black cursor-pointer transition active:scale-98 ${
                    isSelected
                      ? `${item.activeBg} shadow-[4px_4px_0px_black]`
                      : 'bg-white text-black shadow-[3px_3px_0px_black]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {item.icon}
                    <span>{item.label}</span>
                  </div>
                  {isSelected && (
                    <span className="text-xs bg-black text-white px-2 py-0.5 rounded-full uppercase">
                      Aktywna
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </nav>
      )}
    </header>
  );
};
