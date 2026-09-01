import React, { useState } from 'react';
import { playSuccessSound, playErrorSound } from '../../utils/audio';
import { SpellingItem } from '../../types';
import { CheckCircle2, RotateCcw } from 'lucide-react';
import { splitPolishSyllables } from '../../utils/wordHelpers';

interface SyllableGameProps {
  items: SpellingItem[];
  onComplete: () => void;
  onNextGame?: () => void;
}

export const SyllableGame: React.FC<SyllableGameProps> = ({ items, onComplete, onNextGame }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedSyllables, setSelectedSyllables] = useState<string[]>([]);
  const [completed, setCompleted] = useState(false);

  const currentItem = items[currentIndex] || {
    word: 'WARSZAWA',
    hint: 'Stolica Polski nad rzeką Wisłą',
  };

  const targetSyllables = splitPolishSyllables(currentItem.word);
  const [shuffledSyllables, setShuffledSyllables] = useState<string[]>([]);

  React.useEffect(() => {
    if (currentItem) {
      const syls = splitPolishSyllables(currentItem.word);
      setShuffledSyllables([...syls].sort(() => Math.random() - 0.5));
      setSelectedSyllables([]);
    }
  }, [currentIndex, items]);

  const handleSyllableClick = (syllable: string, idx: number) => {
    const nextSelected = [...selectedSyllables, syllable];
    setSelectedSyllables(nextSelected);

    // Check progress
    const expected = targetSyllables.slice(0, nextSelected.length);
    const isCorrectSoFar = nextSelected.every((s, i) => s === expected[i]);

    if (!isCorrectSoFar) {
      playErrorSound();
      setTimeout(() => {
        setSelectedSyllables([]);
      }, 500);
      return;
    }

    playSuccessSound();

    // Check if whole word complete
    if (nextSelected.length === targetSyllables.length) {
      setTimeout(() => {
        if (currentIndex < items.length - 1) {
          const nextIdx = currentIndex + 1;
          setCurrentIndex(nextIdx);
        } else {
          setCompleted(true);
          onComplete();
        }
      }, 800);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedSyllables([]);
    setCompleted(false);
  };

  if (completed) {
    return (
      <div className="bg-emerald-100 p-8 rounded-3xl border-4 border-black text-center space-y-4 shadow-[8px_8px_0px_black] animate-fade-in">
        <div className="w-16 h-16 bg-emerald-400 rounded-full border-3 border-black flex items-center justify-center mx-auto shadow-[3px_3px_0px_black]">
          <CheckCircle2 className="w-10 h-10 text-black" />
        </div>
        <h3 className="text-2xl font-black text-black uppercase">
          Brawo! Połączyłeś wszystkie sylaby! 🧩
        </h3>
        <p className="text-sm font-bold text-gray-800">
          Świetnie dzielisz polskie słowa na sylaby!
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={handleRestart}
            className="bg-[#FF4F81] text-white border-3 border-black font-black px-6 py-3 rounded-2xl text-xs uppercase cursor-pointer shadow-[4px_4px_0px_black] hover:translate-y-0.5 hover:shadow-none transition-all flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Zagraj Ponownie 🔄</span>
          </button>
          {onNextGame && (
            <button
              onClick={onNextGame}
              className="bg-[#FFD700] text-black border-3 border-black font-black px-6 py-3 rounded-2xl text-xs uppercase cursor-pointer shadow-[4px_4px_0px_black] hover:translate-y-0.5 hover:shadow-none transition-all flex items-center gap-2"
            >
              <span>Przejdź do kolejnej gry ➔</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  const rawHint = currentItem.hint || '';
  const wordLower = currentItem.word ? currentItem.word.toLowerCase() : '';
  const isRevealingWord =
    wordLower.length > 0 &&
    (rawHint.toLowerCase().includes(wordLower) ||
      rawHint.toLowerCase().includes('słowo nr') ||
      rawHint.toLowerCase().includes('do poćwiczenia'));

  const displayHint = isRevealingWord || !rawHint.trim()
    ? 'Połącz sylaby we właściwej kolejności:'
    : rawHint;

  return (
    <div className="bg-yellow-50 p-4 sm:p-6 rounded-3xl border-4 border-black shadow-[6px_6px_0px_black] space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b-3 border-black pb-3">
        <div>
          <span className="text-[10px] font-black uppercase text-[#FF4F81] block">
            Słowo {currentIndex + 1} z {items.length}
          </span>
          <h3 className="text-base sm:text-lg font-black text-black uppercase">
            Układanka Sylabowa: {displayHint}
          </h3>
        </div>
      </div>

      {/* Syllable Assembly Display */}
      <div className="text-center space-y-3">
        <span className="text-xs font-black uppercase text-black block">
          Klikaj sylaby we właściwej kolejności, aby ułożyć słowo:
        </span>

        <div className="flex flex-wrap justify-center items-center gap-2 min-h-[60px] bg-white p-3 rounded-2xl border-3 border-black shadow-[3px_3px_0px_black] max-w-md mx-auto">
          {targetSyllables.map((_, idx) => (
            <div
              key={idx}
              className={`px-3 sm:px-4 py-2 rounded-xl border-2 border-black text-base sm:text-xl font-black transition-all shrink-0 whitespace-nowrap select-none ${
                selectedSyllables[idx]
                  ? 'bg-[#FFD700] text-black shadow-[2px_2px_0px_black] scale-105'
                  : 'bg-gray-100 text-gray-400 border-dashed'
              }`}
            >
              {selectedSyllables[idx] || '???'}
            </div>
          ))}
        </div>
      </div>

      {/* Available Syllable Buttons */}
      <div className="flex flex-wrap justify-center gap-2 sm:gap-3 my-4">
        {shuffledSyllables.map((syllable, idx) => {
          const usedCount = selectedSyllables.filter((s) => s === syllable).length;
          const totalInTarget = targetSyllables.filter((s) => s === syllable).length;
          const isDisabled = usedCount >= totalInTarget;

          return (
            <button
              key={`${syllable}-${idx}`}
              onClick={() => handleSyllableClick(syllable, idx)}
              disabled={isDisabled}
              className={`px-4 sm:px-6 py-2.5 sm:py-3.5 rounded-xl sm:rounded-2xl border-2 sm:border-3 border-black text-sm sm:text-lg font-black cursor-pointer transition transform active:scale-95 shadow-[3px_3px_0px_black] sm:shadow-[4px_4px_0px_black] uppercase shrink-0 whitespace-nowrap select-none ${
                isDisabled
                  ? 'bg-gray-200 text-gray-400 border-gray-400 opacity-50 shadow-none'
                  : 'bg-[#FF4F81] text-white hover:bg-rose-600'
              }`}
            >
              {syllable}
            </button>
          );
        })}
      </div>
    </div>
  );
};
