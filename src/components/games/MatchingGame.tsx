import React, { useState } from 'react';
import { MatchingItem, LanguageMode } from '../../types';
import { playSuccessSound, playClickSound } from '../../utils/audio';
import confetti from 'canvas-confetti';
import { CheckCircle, Sparkles } from 'lucide-react';
import { getEmojiForWord } from '../../utils/wordHelpers';

interface MatchingGameProps {
  items: MatchingItem[];
  languageMode?: LanguageMode;
  onComplete: (stars: number) => void;
}

export const MatchingGame: React.FC<MatchingGameProps> = ({
  items,
  onComplete,
}) => {
  const [selectedWordId, setSelectedWordId] = useState<string | null>(null);
  const [matchedIds, setMatchedIds] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Shuffle pictures for random layout
  const [shuffledPictures] = useState(() => [...items].sort(() => Math.random() - 0.5));

  const handleWordClick = (id: string, _wordPl: string) => {
    if (matchedIds.includes(id)) return;
    playClickSound();
    setSelectedWordId(id);
  };

  const handlePictureClick = (picItem: MatchingItem) => {
    if (matchedIds.includes(picItem.id)) return;
    if (!selectedWordId) {
      setFeedback('Najpierw wybierz słowo po lewej stronie! 👈');
      return;
    }

    playClickSound();

    if (selectedWordId === picItem.id) {
      // Match correct!
      const newMatched = [...matchedIds, picItem.id];
      setMatchedIds(newMatched);
      setSelectedWordId(null);
      setFeedback('Świetnie! Pasuje! ✨');
      playSuccessSound();

      if (newMatched.length === items.length) {
        confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
        onComplete(10);
      }
    } else {
      // Wrong match
      setFeedback('Spróbuj jeszcze raz! 🤔');
      setSelectedWordId(null);
    }
  };

  return (
    <div className="bg-rose-50/70 p-4 sm:p-6 rounded-3xl border-3 border-rose-300">
      <div className="flex items-center justify-between gap-2 mb-4">
        <div>
          <h3 className="text-base sm:text-lg font-black text-black uppercase leading-snug break-words">
            🧩 Dopasuj Słowa do Obrazków!
          </h3>
          <p className="text-xs text-rose-800 font-bold">
            Kliknij słowo po lewej, a potem kliknij pasujący obrazek po prawej.
          </p>
        </div>
      </div>

      {feedback && (
        <div className="mb-4 text-center py-1.5 px-3 bg-white border-2 border-black shadow-[2px_2px_0px_black] rounded-full text-xs font-black text-rose-900 animate-fade-in">
          {feedback}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left Column: Words */}
        <div className="space-y-2">
          <h4 className="text-xs font-black uppercase tracking-wider text-rose-900 mb-2">
            Polskie Słowa:
          </h4>
          {items.map((item) => {
            const isMatched = matchedIds.includes(item.id);
            const isSelected = selectedWordId === item.id;

            return (
              <button
                key={`word-${item.id}`}
                onClick={() => handleWordClick(item.id, item.wordPl)}
                disabled={isMatched}
                className={`w-full p-3.5 rounded-2xl font-black text-sm sm:text-base transition-all flex items-center justify-between cursor-pointer border-3 shadow-[3px_3px_0px_black] ${
                  isMatched
                    ? 'bg-emerald-200 border-black text-black opacity-80'
                    : isSelected
                    ? 'bg-rose-500 border-black text-white scale-102 ring-2 ring-black'
                    : 'bg-white hover:bg-rose-100 border-black text-black'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-rose-200 border border-black text-rose-900 text-xs flex items-center justify-center font-black">
                    {item.wordPl[0]}
                  </span>
                  <span>{item.wordPl}</span>
                </div>

                <div className="flex items-center gap-2">
                  {isMatched && <CheckCircle className="w-5 h-5 text-black" />}
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Column: Pictures/Emojis */}
        <div className="space-y-2">
          <h4 className="text-xs font-black uppercase tracking-wider text-rose-900 mb-2">
            Obrazki i Symbole:
          </h4>
          {shuffledPictures.map((item) => {
            const isMatched = matchedIds.includes(item.id);

            return (
              <button
                key={`pic-${item.id}`}
                onClick={() => handlePictureClick(item)}
                disabled={isMatched}
                className={`w-full p-3 rounded-2xl transition-all flex items-center justify-between cursor-pointer border-3 shadow-[3px_3px_0px_black] ${
                  isMatched
                    ? 'bg-emerald-200 border-black text-black opacity-80'
                    : 'bg-white hover:bg-rose-100 border-black text-black'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl p-1 bg-amber-100 rounded-xl border border-black shadow-[2px_2px_0px_black]">
                    {getEmojiForWord(item.wordPl) || item.emoji || '⭐'}
                  </span>
                  <div className="text-left">
                    <span className="text-xs font-black text-black block">
                      {isMatched ? item.wordPl : 'Obrazek'}
                    </span>
                    <span className="text-[10px] text-gray-800 font-bold">
                      Kategoria: {item.category}
                    </span>
                  </div>
                </div>

                {isMatched && (
                  <div className="flex items-center gap-1 text-xs font-black text-black bg-emerald-300 border border-black px-2 py-1 rounded-lg">
                    <CheckCircle className="w-4 h-4 text-black" />
                    <span>Trafiono!</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {matchedIds.length === items.length && (
        <div className="mt-6 p-4 bg-emerald-50 border-3 border-emerald-300 rounded-2xl text-center">
          <span className="text-3xl">🎉</span>
          <h4 className="text-base font-black text-emerald-950 mt-1">
            Wspaniała robota! Znasz wszystkie polskie słówka!
          </h4>
          <p className="text-xs text-emerald-700 font-bold mt-0.5">
            Otrzymujesz +10 Gwiazdek ⭐!
          </p>
        </div>
      )}
    </div>
  );
};
