import React, { useState, useEffect } from 'react';
import { Worksheet } from '../types';
import { FileText, Printer, Download, X, Search, Filter } from 'lucide-react';

interface WorksheetsTabProps {
  worksheets: Worksheet[];
}

export const WorksheetsTab: React.FC<WorksheetsTabProps> = ({ worksheets }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [printableModalItem, setPrintableModalItem] = useState<Worksheet | null>(null);

  // Close modal on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && printableModalItem) {
        setPrintableModalItem(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [printableModalItem]);

  const filteredWorksheets = worksheets.filter((ws) => {
    const matchesCat = selectedCategory === 'all' || ws.category === selectedCategory;
    const matchesSearch =
      !searchQuery ||
      ws.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ws.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const triggerPrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Banner */}
      <div className="bg-green-400 text-black border-4 border-black p-6 sm:p-8 rounded-3xl shadow-[8px_8px_0px_black] flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-black text-white border-2 border-white px-3 py-1 rounded-lg text-xs font-black mb-2 uppercase tracking-wider rotate-[-1deg]">
            <Printer className="w-4 h-4 text-green-300" />
            <span>Polska Szkoła Sobotnia • Klasa 2</span>
          </div>
          
          <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight drop-shadow-[2px_2px_0px_white]">
            Materiały do druku & kserówki 🖨️
          </h2>
          <p className="text-xs sm:text-sm font-bold text-black mt-2 max-w-2xl">
            Pobieraj i drukuj bezpłatne karty pracy przygotowane przez Panią Małgosię. Zapisz plik PDF lub wydrukuj bezpośrednio z przeglądarki!
          </p>
        </div>

        <div className="bg-[#FFD700] text-black border-3 border-black p-4 rounded-2xl text-center shadow-[4px_4px_0px_black] shrink-0 rotate-2">
          <FileText className="w-8 h-8 text-[#FF4F81] mx-auto mb-1" />
          <span className="text-xs font-black block uppercase tracking-wider">
            {worksheets.length} Kart do druku
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <section className="bg-white p-6 sm:p-8 rounded-3xl border-4 border-black shadow-[8px_8px_0px_black]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b-3 border-black">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Szukaj karty pracy (np. ortografia, mapa)..."
              className="w-full pl-11 pr-4 py-2.5 rounded-2xl border-3 border-black font-bold text-xs bg-yellow-50 focus:outline-none focus:ring-2 focus:ring-black shadow-[2px_2px_0px_black]"
            />
          </div>

          {/* Category Filter Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <Filter className="w-4 h-4 text-gray-700 shrink-0 hidden sm:block" />
            {[
              { id: 'all', label: 'Wszystkie' },
              { id: 'polski', label: 'Język Polski' },
              { id: 'czytanie', label: 'Czytanie' },
              { id: 'geografia', label: 'Geografia' },
              { id: 'lamiglowki', label: 'Łamigłówki' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition border-2 border-black shadow-[2px_2px_0px_black] cursor-pointer whitespace-nowrap ${
                  selectedCategory === cat.id
                    ? 'bg-[#FF4F81] text-white'
                    : 'bg-white text-black hover:bg-yellow-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Worksheets Grid */}
        {filteredWorksheets.length === 0 ? (
          <div className="text-center py-12 bg-yellow-50 rounded-2xl border-2 border-black border-dashed">
            <p className="text-sm font-black text-gray-700 uppercase">Nie znaleziono kart pracy w tej kategorii.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredWorksheets.map((ws) => (
              <div
                key={ws.id}
                className="p-6 rounded-2xl border-3 border-black bg-yellow-100 hover:bg-yellow-200 transition flex flex-col justify-between shadow-[5px_5px_0px_black]"
              >
                <div>
                  <div className="flex items-center justify-between text-xs font-bold mb-3">
                    <span className="bg-[#FF4F81] text-white border border-black px-3 py-1 rounded-lg text-[10px] uppercase font-black shadow-[2px_2px_0px_black]">
                      {ws.category}
                    </span>
                    <span className="text-black font-black text-[11px] bg-white px-2 py-0.5 rounded-md border border-black">
                      Czas: {ws.estimatedTime}
                    </span>
                  </div>

                  <h4 className="text-lg font-black text-black mb-1">{ws.title}</h4>
                  <p className="text-xs text-gray-900 font-bold leading-relaxed mb-4">
                    {ws.description}
                  </p>

                  {/* Preview Lines */}
                  <div className="bg-white p-4 rounded-xl border-2 border-black text-[11px] font-mono text-black space-y-1 mb-5 shadow-[2px_2px_0px_black]">
                    <span className="text-[10px] uppercase font-black text-black block mb-1">
                      Podgląd zawartości:
                    </span>
                    {ws.previewLines.map((line, lIdx) => (
                      <div key={lIdx} className="truncate font-bold">
                        • {line}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t-2 border-black">
                  {ws.pdfUrl ? (
                    <a
                      href={ws.pdfUrl}
                      download={ws.downloadName || 'Karta_Pracy.pdf'}
                      target="_blank"
                      rel="noreferrer"
                      className="bg-emerald-500 text-white border-2 border-black px-4 py-2.5 rounded-xl text-xs font-black shadow-[3px_3px_0px_black] hover:bg-emerald-600 cursor-pointer flex items-center gap-1.5 uppercase"
                    >
                      <Download className="w-4 h-4" />
                      <span>Pobierz PDF ({ws.fileSize || 'Plik'}) 📥</span>
                    </a>
                  ) : null}

                  <button
                    onClick={() => setPrintableModalItem(ws)}
                    className="bg-[#FF4F81] text-white border-2 border-black px-4 py-2.5 rounded-xl text-xs font-black shadow-[3px_3px_0px_black] hover:translate-y-0.5 hover:shadow-none transition-all cursor-pointer flex items-center gap-1.5 uppercase tracking-wider"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Podgląd & Drukuj 🖨️</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* PRINTABLE MODAL FOR WORKSHEET */}
      {printableModalItem && (
        <div
          className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4 overflow-y-auto animate-fade-in"
          onClick={() => setPrintableModalItem(null)}
        >
          <div
            className="bg-white max-w-2xl w-full p-6 sm:p-8 rounded-3xl shadow-[10px_10px_0px_black] relative border-4 border-black print:border-none print:shadow-none print:p-0 my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <div className="flex items-center justify-between border-b-2 border-black pb-3 mb-4 print:hidden">
              <span className="text-xs font-black uppercase text-gray-800">
                Podgląd karty do druku
              </span>

              <button
                onClick={() => setPrintableModalItem(null)}
                className="px-3 py-1.5 bg-[#FF4F81] hover:bg-pink-600 text-white border-2 border-black rounded-xl font-black text-xs cursor-pointer shadow-[2px_2px_0px_black] flex items-center gap-1 uppercase"
                title="Zamknij podgląd"
              >
                <X className="w-4 h-4" />
                <span>Zamknij (Esc) ❌</span>
              </button>
            </div>

            {/* Print Header Format */}
            <div className="border-b-4 border-black pb-4 mb-6 text-center">
              <span className="text-xs font-black uppercase tracking-widest text-black block">
                Polska Szkoła Sobotnia • Klasa 2
              </span>
              <h2 className="text-3xl font-black text-black mt-1 uppercase">{printableModalItem.title}</h2>

              <div className="mt-4 flex justify-between text-xs font-black text-black pt-2 border-t-2 border-dashed border-black">
                <span>Imię i Nazwisko Ucznia: _______________________</span>
                <span>Data: ____________</span>
              </div>
            </div>

            {/* Worksheet Content */}
            <div className="space-y-4 text-sm text-black font-bold leading-relaxed">
              <p className="italic bg-yellow-100 p-4 rounded-xl border-2 border-black">
                Instrukcja: {printableModalItem.description}
              </p>

              <div className="space-y-3 pt-2">
                <h4 className="font-black text-black text-base uppercase">Zadania do wykonania:</h4>
                {printableModalItem.previewLines.map((line, idx) => (
                  <div key={idx} className="p-4 border-2 border-black rounded-xl bg-white space-y-2 shadow-[2px_2px_0px_black]">
                    <p className="font-black">{line}</p>
                    <div className="h-10 border-b-2 border-dashed border-black mt-2"></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer & Actions */}
            <div className="mt-8 pt-4 border-t-3 border-black flex flex-col sm:flex-row items-center justify-between gap-3 print:hidden">
              <button
                onClick={() => setPrintableModalItem(null)}
                className="w-full sm:w-auto px-5 py-3 bg-gray-200 text-black border-2 border-black rounded-xl text-xs font-black shadow-[3px_3px_0px_black] hover:bg-gray-300 cursor-pointer uppercase flex items-center justify-center gap-1.5"
              >
                <X className="w-4 h-4" />
                <span>Zamknij podgląd ❌</span>
              </button>

              <button
                onClick={triggerPrint}
                className="w-full sm:w-auto bg-green-400 text-black border-3 border-black px-6 py-3 rounded-xl text-xs font-black shadow-[4px_4px_0px_black] hover:translate-y-0.5 hover:shadow-none transition-all cursor-pointer flex items-center justify-center gap-2 uppercase tracking-wider"
              >
                <Printer className="w-4 h-4" />
                <span>Drukuj teraz (Print) 🖨️</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
