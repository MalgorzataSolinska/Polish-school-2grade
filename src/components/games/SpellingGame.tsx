import React, { useState, useEffect } from 'react';
import { SpellingItem } from '../../types';
import { playSuccessSound, playClickSound } from '../../utils/audio';
import { Sparkles, RefreshCw, CheckCircle2, RotateCcw } from 'lucide-react';
import { cleanWord } from '../../utils/wordHelpers';

interface SpellingGameProps {
  items: SpellingItem[];
  onComplete?: () => void;
  onNextGame?: () => void;
}

export const SpellingGame: React.FC<SpellingGameProps> = ({ items, onComplete, onNextGame }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [builtLetters, setBuiltLetters] = useState<{ id: string; letter: string }[]>([]);
  const [availableLetters, setAvailableLetters] = useState<{ id: string; letter: string }[]>([]);
  const [isFinished, setIsFinished] = useState(false);
  const [showError, setShowError] = useState(false);

  const currentItem = items[currentIndex] || items[0];

  useEffect(() => {
    if (currentItem) {
      setupWord(currentItem.word);
    }
  }, [currentIndex, items]);

  const setupWord = (word: string) => {
    const uppercaseWord = cleanWord(word);
    const letterObjs = uppercaseWord.split('').map((char, i) => ({
      id: `${char}-${i}-${Math.random()}`,
      letter: char,
    }));

    // Shuffle available letters
    const shuffled = [...letterObjs].sort(() => Math.random() - 0.5);
    setAvailableLetters(shuffled);
    setBuiltLetters([]);
    setShowError(false);
  };

  const handleLetterTap = (letterObj: { id: string; letter: string }) => {
    playClickSound();
    setShowError(false);
    // Add to built
    setBuiltLetters((prev) => [...prev, letterObj]);
    // Remove from available
    setAvailableLetters((prev) => prev.filter((l) => l.id !== letterObj.id));
  };

  const handleRemoveLetter = (letterObj: { id: string; letter: string }) => {
    playClickSound();
    setShowError(false);
    // Remove from built
    setBuiltLetters((prev) => prev.filter((l) => l.id !== letterObj.id));
    // Put back to available
    setAvailableLetters((prev) => [...prev, letterObj]);
  };

  const handleCheckWord = () => {
    const targetWord = cleanWord(currentItem.word);
    const userWord = builtLetters.map((l) => l.letter).join('');

    if (userWord === targetWord) {
      playSuccessSound();
      if (currentIndex + 1 < items.length) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        setIsFinished(true);
        if (onComplete) onComplete();
      }
    } else {
      setShowError(true);
    }
  };

  const handleResetWord = () => {
    if (currentItem) setupWord(currentItem.word);
  };

  const handleRestartGame = () => {
    setCurrentIndex(0);
    setIsFinished(false);
  };

  if (isFinished) {
    return (
      <div className="bg-emerald-100 border-4 border-black p-8 rounded-3xl text-center space-y-4 shadow-[6px_6px_0px_black]">
        <div className="w-16 h-16 bg-emerald-400 rounded-full border-3 border-black flex items-center justify-center mx-auto shadow-[3px_3px_0px_black]">
          <CheckCircle2 className="w-10 h-10 text-black" />
        </div>
        <h3 className="text-2xl sm:text-3xl font-black text-black uppercase">
          Brawo! Przećwiczyłeś wszystkie słówka! 🎉
        </h3>
        <p className="text-sm font-bold text-gray-800">
          Wszystkie litery zostały ułożone prawidłowo. Świetna robota!
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={handleRestartGame}
            className="px-6 py-3 bg-[#FF4F81] text-white border-3 border-black font-black text-xs uppercase tracking-wider rounded-2xl shadow-[4px_4px_0px_black] cursor-pointer hover:translate-y-0.5 hover:shadow-none transition-all flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Zagraj Ponownie 🔄</span>
          </button>
          {onNextGame && (
            <button
              onClick={onNextGame}
              className="px-6 py-3 bg-[#FFD700] text-black border-3 border-black font-black text-xs uppercase tracking-wider rounded-2xl shadow-[4px_4px_0px_black] cursor-pointer hover:translate-y-0.5 hover:shadow-none transition-all flex items-center gap-2"
            >
              <span>Przejdź do kolejnej gry ➔</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  const isWordLengthMatched = builtLetters.length === cleanWord(currentItem.word).length;

  const rawHint = currentItem.hint || '';
  const wordLower = currentItem.word ? currentItem.word.toLowerCase() : '';
  const isRevealingWord =
    wordLower.length > 0 &&
    (rawHint.toLowerCase().includes(wordLower) ||
      rawHint.toLowerCase().includes('słowo nr') ||
      rawHint.toLowerCase().includes('do poćwiczenia'));

  const displayHint = isRevealingWord || !rawHint.trim()
    ? 'Ułóż polskie słowo z poniższych kafelków z literami:'
    : rawHint;

  return (
    <div className="space-y-4 sm:space-y-6 w-full">
      {/* Header bar - clean, no images/emojis */}
      <div className="flex items-center justify-between bg-yellow-100 p-3 sm:p-4 rounded-2xl border-3 border-black shadow-[3px_3px_0px_black] gap-2">
        <div className="min-w-0">
          <span className="text-[10px] font-black uppercase text-[#FF4F81] block">
            Słowo {currentIndex + 1} z {items.length}
          </span>
          <h4 className="text-xs sm:text-base font-black text-black leading-snug break-words">
            {displayHint}
          </h4>
        </div>

        <button
          onClick={handleResetWord}
          className="p-2 bg-white text-black border-2 border-black rounded-xl text-xs font-black cursor-pointer hover:bg-yellow-200 shadow-[2px_2px_0px_black] shrink-0"
          title="Zacznij układanie od nowa"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Answer Slots / Built Letters */}
      <div className="bg-yellow-50 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border-3 sm:border-4 border-black min-h-[90px] sm:min-h-[110px] flex flex-wrap items-center justify-center gap-2 sm:gap-3 shadow-[4px_4px_0px_black] w-full">
        {builtLetters.length === 0 ? (
          <span className="text-xs sm:text-sm font-black text-gray-700 italic uppercase text-center px-2">
            Klikaj lub dotykaj litery poniżej, aby ułożyć słowo...
          </span>
        ) : (
          builtLetters.map((lObj) => (
            <button
              key={lObj.id}
              onClick={() => handleRemoveLetter(lObj)}
              className="w-10 h-11 sm:w-14 sm:h-14 bg-[#FF4F81] text-white border-2 sm:border-3 border-black rounded-xl sm:rounded-2xl font-black text-lg sm:text-2xl shadow-[2px_2px_0px_black] sm:shadow-[3px_3px_0px_black] hover:scale-105 active:scale-95 cursor-pointer transition flex items-center justify-center shrink-0 whitespace-nowrap select-none"
              title="Kliknij, aby usunąć literę"
            >
              {lObj.letter}
            </button>
          ))
        )}
      </div>

      {/* Error message */}
      {showError && (
        <div className="bg-rose-100 border-3 border-rose-500 text-rose-800 p-3 rounded-2xl font-black text-xs text-center">
          Spróbuj jeszcze raz! Kolejność liter jest niepoprawna. 🙈
        </div>
      )}

      {/* Available Letters to Tap */}
      <div className="space-y-2">
        <span className="text-xs font-black uppercase text-gray-800 block text-center tracking-wide">
          Dostępne litery (dotknij w odpowiedniej kolejności):
        </span>

        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          {availableLetters.map((lObj) => (
            <button
              key={lObj.id}
              onClick={() => handleLetterTap(lObj)}
              className="w-11 h-12 sm:w-14 sm:h-14 bg-white text-black border-2 sm:border-3 border-black rounded-xl sm:rounded-2xl font-black text-xl sm:text-2xl shadow-[3px_3px_0px_black] sm:shadow-[4px_4px_0px_black] hover:bg-yellow-200 active:scale-90 cursor-pointer transition flex items-center justify-center shrink-0 whitespace-nowrap select-none"
            >
              {lObj.letter}
            </button>
          ))}
        </div>
      </div>

      {/* Submit Button */}
      {isWordLengthMatched && (
        <button
          onClick={handleCheckWord}
          className="w-full py-4 bg-emerald-400 text-black border-4 border-black rounded-2xl font-black text-sm uppercase tracking-wider shadow-[6px_6px_0px_black] cursor-pointer hover:bg-emerald-300 active:translate-y-1 transition flex items-center justify-center gap-2"
        >
          <Sparkles className="w-5 h-5 text-yellow-300 fill-black" />
          <span>Sprawdź Poprawność Słowa! 🎯</span>
        </button>
      )}
    </div>
  );
};
