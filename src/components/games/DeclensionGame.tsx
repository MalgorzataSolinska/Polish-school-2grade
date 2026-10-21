import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { SpellingItem } from '../../types';
import { playSuccessSound, playErrorSound, playClickSound } from '../../utils/audio';
import {
  generateDeclensionLetterChallenges,
  DeclensionLetterChallenge,
} from '../../utils/declensionHelper';
import { CheckCircle2, RotateCcw, ArrowRight, Delete, Award, Sparkles, BookOpen } from 'lucide-react';

interface DeclensionGameProps {
  items: SpellingItem[];
  onComplete?: () => void;
  onNextGame?: () => void;
}

interface SlotPlacement {
  letter: string;
  tileIndex: number;
}

export const DeclensionGame: React.FC<DeclensionGameProps> = ({ items, onComplete, onNextGame }) => {
  // Ensure default items include the user's specific examples (TELEFON, PRALKA) and lesson vocabulary
  const safeItems: SpellingItem[] = useMemo(() => {
    if (items && items.length > 0) return items;
    return [
      { id: 'cas-def-1', word: 'TELEFON', hint: 'Gdzie jest mój telefon?' },
      { id: 'cas-def-2', word: 'PRALKA', hint: 'Urządzenie domowe do prania ubrań' },
      { id: 'cas-def-3', word: 'TELEWIZOR', hint: 'Telewizor w salonie' },
      { id: 'cas-def-4', word: 'KOMPUTER', hint: 'Komputer do nauki i pisania' },
      { id: 'cas-def-5', word: 'CZAJNIK', hint: 'Czajnik do gotowania wody na herbatę' },
      { id: 'cas-def-6', word: 'KURTKA', hint: 'Ciepłe ubranie na jesień i zimę' },
      { id: 'cas-def-7', word: 'PARASOL', hint: 'Chroni przed deszczem' },
      { id: 'cas-def-8', word: 'OKNO', hint: 'Przez nie wpada światło do klasy' },
      { id: 'cas-def-9', word: 'OŁÓWEK', hint: 'Do pisania i rysowania' },
      { id: 'cas-def-10', word: 'ZESZYT', hint: 'Zeszyt w kratkę lub linie' },
      { id: 'cas-def-11', word: 'FLAGA', hint: 'Biało-czerwona flaga Polski' },
      { id: 'cas-def-12', word: 'PIES', hint: 'Wierny czworonożny przyjaciel' },
      { id: 'cas-def-13', word: 'KSIĄŻKA', hint: 'Książka do czytania' },
    ];
  }, [items]);

  // Generate diverse, shuffled sentence challenges across Mianownik, Dopełniacz and Biernik
  const [challenges, setChallenges] = useState<DeclensionLetterChallenge[]>(() => {
    return generateDeclensionLetterChallenges(safeItems);
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const currentChallenge: DeclensionLetterChallenge | undefined = challenges[currentIndex];

  const slotCount = currentChallenge ? currentChallenge.missingLetters.length : 0;

  // Track each slot with letter and the tileIndex from letterChoices
  const [slots, setSlots] = useState<(SlotPlacement | null)[]>([]);
  const [validationState, setValidationState] = useState<'correct' | 'wrong' | null>(null);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [completedChallenges, setCompletedChallenges] = useState<DeclensionLetterChallenge[]>([]);

  // Initialize or reset slots whenever currentChallenge changes
  useEffect(() => {
    if (currentChallenge) {
      setSlots(new Array(currentChallenge.missingLetters.length).fill(null));
      setValidationState(null);
    }
  }, [currentIndex, currentChallenge]);

  // Set of used tile indices
  const usedTileIndices = useMemo(() => {
    const indices: number[] = [];
    slots.forEach((s) => {
      if (s !== null) {
        indices.push(s.tileIndex);
      }
    });
    return indices;
  }, [slots]);

  // Handle placing a letter tile into the first available slot
  const handleSelectLetterTile = useCallback(
    (letter: string, tileIndex: number) => {
      if (!currentChallenge || validationState === 'correct') return;
      if (usedTileIndices.includes(tileIndex)) return;

      const firstEmptyIndex = slots.findIndex((s) => s === null);
      if (firstEmptyIndex === -1) return; // All slots filled

      playClickSound();
      setValidationState(null);

      const nextSlots = [...slots];
      nextSlots[firstEmptyIndex] = { letter, tileIndex };
      setSlots(nextSlots);
    },
    [currentChallenge, validationState, usedTileIndices, slots]
  );

  // Remove letter from specific slot
  const handleRemoveSlot = useCallback(
    (slotIdx: number) => {
      if (validationState === 'correct') return;
      if (slots[slotIdx] === null) return;

      playClickSound();
      setValidationState(null);

      const nextSlots = [...slots];
      nextSlots[slotIdx] = null;
      setSlots(nextSlots);
    },
    [validationState, slots]
  );

  // Backspace - remove last non-empty slot
  const handleBackspace = useCallback(() => {
    if (validationState === 'correct') return;
    for (let i = slots.length - 1; i >= 0; i--) {
      if (slots[i] !== null) {
        playClickSound();
        setValidationState(null);
        const nextSlots = [...slots];
        nextSlots[i] = null;
        setSlots(nextSlots);
        return;
      }
    }
  }, [validationState, slots]);

  // Clear all slots for this sentence
  const handleClearSlots = useCallback(() => {
    if (validationState === 'correct') return;
    playClickSound();
    setValidationState(null);
    setSlots(new Array(slotCount).fill(null));
  }, [validationState, slotCount]);

  // Verify answer
  const handleCheckAnswer = useCallback(() => {
    if (!currentChallenge || validationState === 'correct') return;

    const entered = slots.map((s) => s?.letter || '').join('').toUpperCase();
    const target = currentChallenge.missingLetters.toUpperCase();

    if (entered === target) {
      playSuccessSound();
      setValidationState('correct');
      setScore((prev) => prev + 1);

      if (!completedChallenges.some((c) => c.id === currentChallenge.id)) {
        setCompletedChallenges((prev) => [...prev, currentChallenge]);
      }
    } else {
      playErrorSound();
      setValidationState('wrong');
    }
  }, [currentChallenge, validationState, slots, completedChallenges]);

  // Advance to next challenge
  const handleNextChallenge = useCallback(() => {
    playClickSound();
    if (currentIndex + 1 < challenges.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsFinished(true);
      if (onComplete) onComplete();
    }
  }, [currentIndex, challenges.length, onComplete]);

  // Physical keyboard support for typing letters, backspace, and enter
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isFinished || !currentChallenge) return;

      if (e.key === 'Backspace') {
        e.preventDefault();
        handleBackspace();
        return;
      }

      if (e.key === 'Enter') {
        e.preventDefault();
        if (validationState === 'correct') {
          handleNextChallenge();
        } else {
          const allFilled = slots.every((s) => s !== null);
          if (allFilled) {
            handleCheckAnswer();
          }
        }
        return;
      }

      // Check if typed key matches an available letter tile
      const keyChar = e.key.toUpperCase();
      const availableTileIndex = currentChallenge.letterChoices.findIndex(
        (letter, idx) => letter === keyChar && !usedTileIndices.includes(idx)
      );

      if (availableTileIndex !== -1) {
        e.preventDefault();
        handleSelectLetterTile(keyChar, availableTileIndex);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    isFinished,
    currentChallenge,
    validationState,
    slots,
    usedTileIndices,
    handleBackspace,
    handleCheckAnswer,
    handleNextChallenge,
    handleSelectLetterTile,
  ]);

  const handleRestartGame = () => {
    playClickSound();
    const freshChallenges = generateDeclensionLetterChallenges(safeItems);
    setChallenges(freshChallenges);
    setCurrentIndex(0);
    setScore(0);
    setIsFinished(false);
    setCompletedChallenges([]);
  };

  const isAllSlotsFilled = slots.length > 0 && slots.every((s) => s !== null);

  // Render Finished Summary Screen
  if (isFinished) {
    return (
      <div className="bg-emerald-100 border-4 border-black p-5 sm:p-8 rounded-3xl text-center space-y-6 shadow-[6px_6px_0px_black] animate-fade-in max-w-3xl mx-auto">
        <div className="w-16 h-16 bg-emerald-400 rounded-full border-3 border-black flex items-center justify-center mx-auto shadow-[3px_3px_0px_black]">
          <Award className="w-10 h-10 text-black" />
        </div>

        <div>
          <h3 className="text-2xl sm:text-3xl font-black text-black uppercase tracking-tight">
            Wspaniale! Wszystkie luki uzupełnione! 🎉
          </h3>
          <p className="text-sm font-bold text-gray-800 mt-2">
            Zdobyłeś <span className="text-black font-black text-base">{score}</span> z{' '}
            <span className="text-black font-black text-base">{challenges.length}</span> punktów i opanowałeś
            odmianę przez przypadki!
          </p>
        </div>

        {/* Detailed summary of words and sentences */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl border-3 border-black shadow-[4px_4px_0px_black] text-left space-y-4">
          <span className="text-xs font-black uppercase tracking-wider text-gray-800 block flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-blue-600" />
            <span>Prawidłowo uzupełnione zdania z lekcji:</span>
          </span>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[340px] overflow-y-auto pr-1">
            {completedChallenges.map((item, idx) => (
              <div
                key={idx}
                className="p-3 bg-yellow-50 rounded-xl border-2 border-black flex flex-col justify-between gap-1 shadow-[2px_2px_0px_black]"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-black text-xs uppercase text-blue-700 bg-blue-100 px-2 py-0.5 rounded border border-blue-400">
                    {item.caseName}
                  </span>
                  <span className="text-[11px] font-bold text-gray-600">
                    {item.caseQuestion}
                  </span>
                </div>
                <p className="text-xs sm:text-sm font-bold text-gray-900 mt-1">
                  {item.fullSentence}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={handleRestartGame}
            className="bg-white hover:bg-yellow-100 text-black font-black px-6 py-3 rounded-2xl border-3 border-black shadow-[3px_3px_0px_black] active:scale-95 transition cursor-pointer flex items-center gap-2 uppercase text-sm"
          >
            <RotateCcw className="w-5 h-5 text-black" />
            <span>Zagraj jeszcze raz</span>
          </button>

          {onNextGame && (
            <button
              onClick={onNextGame}
              className="bg-[#4F81FF] hover:bg-blue-600 text-white font-black px-6 py-3 rounded-2xl border-3 border-black shadow-[3px_3px_0px_black] active:scale-95 transition cursor-pointer flex items-center gap-2 uppercase text-sm"
            >
              <span>Następna gra</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    );
  }

  if (!currentChallenge) {
    return (
      <div className="p-8 text-center bg-white border-3 border-black rounded-2xl shadow-[4px_4px_0px_black]">
        <p className="text-base font-bold text-gray-700">Ładowanie zadania z przypadkami...</p>
      </div>
    );
  }

  // Case theme badge colors
  const caseBadgeColors: Record<string, { bg: string; text: string; border: string }> = {
    mianownik: { bg: 'bg-[#FFD700]', text: 'text-black', border: 'border-black' },
    dopelniacz: { bg: 'bg-[#4F81FF]', text: 'text-white', border: 'border-black' },
    biernik: { bg: 'bg-[#FF4F81]', text: 'text-white', border: 'border-black' },
  };
  const badgeStyle = caseBadgeColors[currentChallenge.caseType] || {
    bg: 'bg-yellow-200',
    text: 'text-black',
    border: 'border-black',
  };

  return (
    <div className="space-y-5 max-w-3xl mx-auto animate-fade-in">
      {/* Top Bar: Progress & Case Tag */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-2xl border-3 border-black shadow-[3px_3px_0px_black]">
        <div className="flex items-center gap-2">
          <span className="text-xs font-black uppercase text-gray-700 bg-gray-100 border border-black px-2.5 py-1 rounded-lg">
            Zadanie {currentIndex + 1} z {challenges.length}
          </span>
          <span className="text-xs font-black text-amber-800 bg-amber-100 border border-amber-300 px-2.5 py-1 rounded-lg flex items-center gap-1">
            ⭐ {score} pkt
          </span>
        </div>

        {/* Case Indicator Badge */}
        <div
          className={`${badgeStyle.bg} ${badgeStyle.text} border-2 ${badgeStyle.border} px-3 py-1 rounded-xl text-xs font-black uppercase shadow-[2px_2px_0px_black] flex items-center gap-1.5`}
        >
          <span>{currentChallenge.caseName}</span>
          <span className="opacity-90 font-bold normal-case">({currentChallenge.caseQuestion})</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 h-3 rounded-full border-2 border-black overflow-hidden shadow-[2px_2px_0px_black]">
        <div
          className="bg-[#4F81FF] h-full transition-all duration-300 ease-out"
          style={{ width: `${((currentIndex + 1) / challenges.length) * 100}%` }}
        />
      </div>

      {/* Main Sentence Card */}
      <div
        className={`bg-white p-5 sm:p-8 rounded-3xl border-4 border-black transition-all shadow-[6px_6px_0px_black] space-y-6 ${
          validationState === 'correct'
            ? 'ring-4 ring-emerald-400 bg-emerald-50/50'
            : validationState === 'wrong'
            ? 'ring-4 ring-rose-400 bg-rose-50/50'
            : ''
        }`}
      >
        <div className="text-center">
          <span className="text-[11px] font-black uppercase tracking-wider text-gray-500 block mb-2">
            Wypełnij brakujące litery w zdaniu:
          </span>

          {/* Sentence Display with Stem and Letter Slots */}
          <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-3 text-lg sm:text-2xl md:text-3xl font-extrabold text-gray-900 leading-relaxed py-2">
            {/* Sentence Prefix */}
            <span>{currentChallenge.sentencePrefix}</span>

            {/* Word Stem + Missing Letter Slots */}
            <div className="inline-flex items-center gap-1 bg-yellow-100/80 px-2.5 py-1.5 rounded-2xl border-2 border-black shadow-[2px_2px_0px_black]">
              <span className="font-black text-blue-900 tracking-wide">
                {currentChallenge.wordStem}
              </span>

              {/* Slot Boxes */}
              <div className="inline-flex items-center gap-1.5 ml-1">
                {slots.map((placement, slotIdx) => {
                  const isFilled = placement !== null;
                  return (
                    <button
                      key={slotIdx}
                      type="button"
                      onClick={() => handleRemoveSlot(slotIdx)}
                      disabled={validationState === 'correct'}
                      title={isFilled ? 'Kliknij, aby usunąć tę literkę' : 'Puste pole na literkę'}
                      className={`h-11 w-9 sm:h-13 sm:w-11 rounded-xl border-3 font-black text-lg sm:text-2xl flex items-center justify-center transition-all cursor-pointer ${
                        validationState === 'correct'
                          ? 'bg-emerald-400 border-black text-black shadow-[2px_2px_0px_black]'
                          : validationState === 'wrong'
                          ? 'bg-rose-200 border-rose-600 text-rose-950 animate-bounce'
                          : isFilled
                          ? 'bg-white border-black text-black shadow-[2px_2px_0px_black] hover:bg-rose-100 hover:border-rose-500'
                          : 'bg-yellow-50 border-dashed border-gray-400 text-gray-400 hover:border-black'
                      }`}
                    >
                      {placement ? placement.letter : '_'}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sentence Suffix */}
            <span>{currentChallenge.sentenceSuffix}</span>
          </div>
        </div>

        {/* Feedback Messages */}
        {validationState === 'correct' && (
          <div className="bg-emerald-100 border-3 border-black p-4 rounded-2xl text-center shadow-[3px_3px_0px_black] animate-fade-in space-y-2">
            <div className="flex items-center justify-center gap-2 text-emerald-800 font-black text-base sm:text-lg">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
              <span>Świetnie! Brawo!</span>
            </div>
            <p className="text-sm font-extrabold text-black">
              Całe zdanie:{' '}
              <span className="underline decoration-emerald-500 decoration-3">
                {currentChallenge.fullSentence}
              </span>
            </p>
          </div>
        )}

        {validationState === 'wrong' && (
          <div className="bg-rose-100 border-3 border-black p-3.5 rounded-2xl text-center shadow-[3px_3px_0px_black] animate-fade-in flex items-center justify-center gap-2">
            <span className="text-sm font-black text-rose-800">
              Ups, to jeszcze nie te litery! Spróbuj ponownie lub cofnij.
            </span>
          </div>
        )}

        {/* Letter Choices Pool */}
        {validationState !== 'correct' && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-gray-700 block">
                Wybierz brakujące literki:
              </span>
              <span className="text-[11px] font-bold text-gray-500 hidden sm:inline">
                (możesz też pisać na klawiaturze)
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5">
              {currentChallenge.letterChoices.map((letter, tIdx) => {
                const isUsed = usedTileIndices.includes(tIdx);
                return (
                  <button
                    key={tIdx}
                    type="button"
                    onClick={() => handleSelectLetterTile(letter, tIdx)}
                    disabled={isUsed || validationState === 'correct'}
                    className={`h-12 w-11 sm:h-14 sm:w-13 rounded-2xl border-3 border-black font-black text-xl sm:text-2xl transition-all cursor-pointer flex items-center justify-center ${
                      isUsed
                        ? 'opacity-25 bg-gray-200 border-gray-400 cursor-not-allowed scale-95'
                        : 'bg-white hover:bg-yellow-200 text-black shadow-[3px_3px_0px_black] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none hover:scale-105'
                    }`}
                  >
                    {letter}
                  </button>
                );
              })}
            </div>

            {/* Helper Action Buttons: Backspace & Clear */}
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleBackspace}
                disabled={slots.every((s) => s === null)}
                className="bg-gray-100 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed text-black font-bold text-xs px-3.5 py-2 rounded-xl border-2 border-black shadow-[2px_2px_0px_black] active:scale-95 transition cursor-pointer flex items-center gap-1.5"
              >
                <Delete className="w-4 h-4 text-gray-700" />
                <span>Cofnij literę</span>
              </button>

              <button
                type="button"
                onClick={handleClearSlots}
                disabled={slots.every((s) => s === null)}
                className="bg-gray-100 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed text-black font-bold text-xs px-3.5 py-2 rounded-xl border-2 border-black shadow-[2px_2px_0px_black] active:scale-95 transition cursor-pointer flex items-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4 text-gray-700" />
                <span>Wyczyść</span>
              </button>
            </div>
          </div>
        )}

        {/* Check or Next Action Button */}
        <div className="pt-2 border-t-2 border-black/10 flex justify-center">
          {validationState === 'correct' ? (
            <button
              type="button"
              onClick={handleNextChallenge}
              className="bg-[#FFD700] hover:bg-yellow-400 text-black font-black text-sm sm:text-base px-8 py-3.5 rounded-2xl border-3 border-black shadow-[4px_4px_0px_black] active:scale-95 transition cursor-pointer flex items-center gap-2 uppercase tracking-wide animate-pulse"
            >
              <span>
                {currentIndex + 1 < challenges.length ? 'Następne zdanie' : 'Zobacz podsumowanie'}
              </span>
              <ArrowRight className="w-5 h-5 text-black" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleCheckAnswer}
              disabled={!isAllSlotsFilled}
              className={`font-black text-sm sm:text-base px-8 py-3.5 rounded-2xl border-3 border-black transition cursor-pointer flex items-center gap-2 uppercase tracking-wide ${
                isAllSlotsFilled
                  ? 'bg-[#FFD700] hover:bg-yellow-400 text-black shadow-[4px_4px_0px_black] active:scale-95'
                  : 'bg-gray-200 text-gray-500 border-gray-400 cursor-not-allowed opacity-60'
              }`}
            >
              <span>Sprawdź odpowiedź</span>
              <Sparkles className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
